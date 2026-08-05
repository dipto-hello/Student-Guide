import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { env, isProduction, isTest } from './env.js';

/**
 * Structured logging with pluggable error reporting.
 *
 * Emits JSON lines in production so a log aggregator (Render, Datadog, Loki)
 * can index fields, and human-readable lines in development. Errors are also
 * forwarded to Sentry when SENTRY_DSN is configured — `reportError` is wired up
 * lazily in `instrument.ts` so this module has no hard dependency on the SDK.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel | 'silent', number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

const threshold = LEVEL_PRIORITY[env.LOG_LEVEL];

/** Keys whose values are replaced before anything reaches a log sink. */
const REDACTED_KEYS = [
  'password',
  'passwordhash',
  'token',
  'auth_token',
  'authtoken',
  'authorization',
  'cookie',
  'credential',
  'secret',
  'jwt',
  'apikey',
  'api_key',
];

const REDACTED = '[redacted]';

/**
 * Recursively strips credentials from log context.
 *
 * Logging a request body that happens to contain an OAuth credential would
 * park a usable token in the log store, so redaction happens here rather than
 * relying on every call site to remember.
 */
function redact(value: unknown, depth = 0): unknown {
  if (depth > 6 || value == null) return value;

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => redact(item, depth + 1));
  }

  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = REDACTED_KEYS.includes(key.toLowerCase())
        ? REDACTED
        : redact(val, depth + 1);
    }
    return out;
  }

  return value;
}

export type LogContext = Record<string, unknown>;

/** Set by `instrument.ts` when Sentry is available. */
type ErrorReporter = (error: unknown, context?: LogContext) => void;
let errorReporter: ErrorReporter | null = null;

export function setErrorReporter(reporter: ErrorReporter | null): void {
  errorReporter = reporter;
}

function emit(level: LogLevel, message: string, context?: LogContext): void {
  if (LEVEL_PRIORITY[level] < threshold) return;
  if (isTest && level !== 'error') return;

  const payload = {
    level,
    time: new Date().toISOString(),
    message,
    ...(context ? (redact(context) as LogContext) : {}),
  };

  const line = isProduction
    ? JSON.stringify(payload)
    : `[${level.toUpperCase()}] ${message}` +
      (context ? ` ${JSON.stringify(redact(context))}` : '');

  // console.error for warn/error keeps them on stderr, where most hosts route
  // them to a separate stream.
  if (level === 'error' || level === 'warn') {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => emit('debug', message, context),
  info: (message: string, context?: LogContext) => emit('info', message, context),
  warn: (message: string, context?: LogContext) => emit('warn', message, context),

  /**
   * Logs an error and forwards it to the configured reporter.
   * `error` is typed as unknown because a `catch` binding is unknown in TS.
   */
  error: (message: string, error?: unknown, context?: LogContext) => {
    const errorFields =
      error instanceof Error
        ? { errorName: error.name, errorMessage: error.message, stack: error.stack }
        : error !== undefined
          ? { error: String(error) }
          : {};

    emit('error', message, { ...context, ...errorFields });
    errorReporter?.(error ?? new Error(message), context);
  },
};

/** Attaches a per-request id so logs from one request can be correlated. */
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Assigns a request id and logs completion with method, path, status, duration.
 *
 * Honors an inbound `x-request-id` so a trace started at the CDN/proxy carries
 * through, and echoes the id back on the response for client-side correlation.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const inbound = req.headers['x-request-id'];
  req.id =
    (typeof inbound === 'string' && inbound.length <= 200 ? inbound : undefined) ??
    randomUUID();
  res.setHeader('X-Request-Id', req.id);

  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const context: LogContext = {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      userId: req.user?.id,
    };

    if (res.statusCode >= 500) {
      emit('error', 'Request failed', context);
    } else if (res.statusCode >= 400) {
      emit('warn', 'Request rejected', context);
    } else {
      emit('info', 'Request completed', context);
    }
  });

  next();
}
