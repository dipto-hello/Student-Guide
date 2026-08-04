import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { db, initDb } from "./db.js";
import { desc } from "drizzle-orm";
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import authRouter from './auth.js';
import userRouter from './user.js';
import adminRouter from './admin.js';
import searchRouter from './search.js';
import notificationsRouter from './notifications.js';
import { setupWebSocket } from './socket.js';
import { CORS_OPTIONS } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(helmet());
  app.use(cors(CORS_OPTIONS));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  
  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });
  
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20, // Limit each IP to 20 auth requests per window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });

  const server = createServer(app);
  
  // Setup WebSocket Server
  const io = setupWebSocket(server);
  
  // Expose io to req for routers to use if needed
  app.use((req, res, next) => {
    (req as any).io = io;
    next();
  });

  // Initialize DB
  await initDb();

  app.use('/api/', apiLimiter);
  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api/user', userRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/notifications', notificationsRouter);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
  
  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
  });

  const port = process.env.PORT || (process.env.NODE_ENV === 'production' ? 3000 : 3001);

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
