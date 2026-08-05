import { logger, setErrorReporter, type LogContext } from './logger.js';
import { env, isProduction } from './env.js';

/**
 * Error-reporting instrumentation.
 *
 * Sentry is an optional dependency: the app must run (and errors must still be
 * logged) on a deployment that has no DSN configured. So the SDK is imported
 * dynamically and a failure to load degrades to stdout-only logging rather than
 * crashing the process at boot.
 *
 * To enable: `pnpm add @sentry/node` and set SENTRY_DSN in the environment.
 */
export async function initErrorReporting(): Promise<void> {
  if (!env.SENTRY_DSN) {
    logger.info('Error reporting: local only (SENTRY_DSN not set)');
    return;
  }

  try {
    // Not a static import — the package may not be installed.
    const Sentry = await import(/* @vite-ignore */ '@sentry/node').catch(() => null);

    if (!Sentry) {
      logger.warn(
        'SENTRY_DSN is set but @sentry/node is not installed — run `pnpm add @sentry/node`',
      );
      return;
    }

    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      // Sample aggressively in production; full traces in dev are noise.
      tracesSampleRate: isProduction ? 0.1 : 0,
      // Never ship request bodies or headers — they carry auth cookies.
      sendDefaultPii: false,
      beforeSend(event: any) {
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;
          delete event.request.data;
        }
        return event;
      },
    });

    setErrorReporter((error: unknown, context?: LogContext) => {
      Sentry.captureException(error, context ? { extra: context } : undefined);
    });

    logger.info('Error reporting: Sentry initialised', { environment: env.NODE_ENV });
  } catch (error) {
    logger.warn('Failed to initialise Sentry — continuing with local logging only', {
      reason: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Last-resort handlers.
 *
 * An unhandled rejection leaves the process in an unknown state. We report it,
 * give the reporter a moment to flush, then exit so the platform restarts a
 * clean process instead of serving from a corrupted one.
 */
export function installProcessHandlers(): void {
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception — shutting down', error);
    setTimeout(() => process.exit(1), 1000).unref();
  });
}
