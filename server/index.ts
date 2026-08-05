import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';

import { db, initDb, closeDb } from "./db.js";
import authRouter from './auth.js';
import userRouter from './user.js';
import adminRouter from './admin.js';
import searchRouter from './search.js';
import notificationsRouter from './notifications.js';
import { setupWebSocket } from './socket.js';
import { CORS_OPTIONS, ALLOWED_ORIGINS, PORT, isProduction } from './config.js';
import { logger, requestLogger } from './logger.js';
import { initErrorReporting, installProcessHandlers } from './instrument.js';
import { csrfTokenIssuer, csrfProtection } from './csrf.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Content Security Policy.
 *
 * Google Identity Services needs its script/frame origins allowlisted, and the
 * websocket transport needs the API origin in connect-src. 'unsafe-inline' for
 * styles is required by the CSS-in-JS that Radix/Framer inject at runtime;
 * scripts stay strict.
 */
function contentSecurityPolicy() {
  const connectSrc = ["'self'", ...ALLOWED_ORIGINS, 'https://accounts.google.com'];
  if (!isProduction) {
    connectSrc.push('ws://localhost:*', 'ws://127.0.0.1:*', 'http://localhost:*');
  } else {
    connectSrc.push('wss:');
  }

  return {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://accounts.google.com', 'https://apis.google.com'],
      // Radix/Framer inject inline styles; scripts remain restricted.
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://lh3.googleusercontent.com', 'https:'],
      connectSrc,
      frameSrc: ["'self'", 'https://accounts.google.com'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      ...(isProduction ? { upgradeInsecureRequests: [] } : {}),
    },
  };
}

async function startServer() {
  installProcessHandlers();
  await initErrorReporting();

  const app = express();

  // Render/Vercel terminate TLS upstream. Without this, `secure` cookies are
  // never set and rate limiting buckets every user under the proxy's IP.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet({
    contentSecurityPolicy: contentSecurityPolicy(),
    crossOriginEmbedderPolicy: false, // breaks Google Identity iframe otherwise
    hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));

  app.use(compression());
  app.use(cors(CORS_OPTIONS));
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use(cookieParser());
  app.use(requestLogger);

  const server = createServer(app);
  const io = setupWebSocket(server);

  app.use((req, _res, next) => {
    (req as any).io = io;
    next();
  });

  await initDb();

  // ── Rate limiting ──────────────────────────────────────────────────────────
  // Keyed by user id when authenticated so users behind a shared NAT (a campus
  // network — the actual audience here) don't exhaust each other's budget.
  const keyGenerator = (req: Request) => req.user?.id ?? req.ip ?? 'unknown';

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator,
    message: { error: 'Too many requests, please try again later.' },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts, please try again later.' },
  });

  const writeLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator,
    skip: (req) => req.method === 'GET' || req.method === 'HEAD',
    message: { error: 'Too many writes, please slow down.' },
  });

  // ── Health checks ──────────────────────────────────────────────────────────
  // Mounted before the limiters so uptime probes are never rate limited.
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.get('/api/health/ready', async (_req, res) => {
    try {
      await db.run('SELECT 1');
      res.json({ status: 'ready' });
    } catch (error) {
      logger.error('Readiness check failed', error);
      res.status(503).json({ status: 'unavailable' });
    }
  });

  app.use('/api', apiLimiter);
  app.use('/api', csrfTokenIssuer, csrfProtection);
  app.use('/api', writeLimiter);

  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api/user', userRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/notifications', notificationsRouter);

  // Unknown API routes must 404 as JSON rather than falling through to the SPA
  // handler, which would answer an XHR with an HTML document.
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // ── Static assets ──────────────────────────────────────────────────────────
  const staticPath = isProduction
    ? path.resolve(__dirname, "public")
    : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath, {
    // Hashed build assets are immutable; index.html must always revalidate or
    // clients pin to a stale bundle after a deploy.
    maxAge: isProduction ? '1y' : 0,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html') || filePath.endsWith('sw.js')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    },
  }));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  // ── Error handling ─────────────────────────────────────────────────────────
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;

    if (status >= 500) {
      logger.error('Unhandled request error', err, { requestId: req.id, path: req.originalUrl });
    } else {
      logger.warn('Request error', { requestId: req.id, status, message: err.message });
    }

    if (res.headersSent) return;

    res.status(status).json({
      error: status >= 500 && isProduction ? 'Internal Server Error' : err.message,
      requestId: req.id,
    });
  });

  server.listen(PORT, () => {
    logger.info('Server started', { port: PORT, env: process.env.NODE_ENV ?? 'development' });
  });

  // ── Graceful shutdown ──────────────────────────────────────────────────────
  // Render sends SIGTERM on redeploy. Draining in-flight requests first avoids
  // truncated responses; the timer is the backstop for a hung connection.
  const shutdown = (signal: string) => {
    logger.info('Shutting down', { signal });

    const forceExit = setTimeout(() => {
      logger.warn('Shutdown timed out — forcing exit');
      process.exit(1);
    }, 10_000);
    forceExit.unref();

    io.close(() => {
      server.close(async () => {
        await closeDb();
        clearTimeout(forceExit);
        logger.info('Shutdown complete');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
}

startServer().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});
