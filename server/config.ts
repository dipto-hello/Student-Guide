import crypto from 'crypto';
import { env, isProduction, isTest } from './env.js';

/**
 * Centralized configuration — single source of truth.
 *
 * No secret in this file has a hardcoded fallback. Production values come from
 * the environment and are validated in `env.ts` before this module is reached.
 * Development-only fallbacks are generated at boot, never committed.
 */

/**
 * Signing key for auth JWTs.
 *
 * In development/test a random key is generated per process. That invalidates
 * existing sessions on restart, which is the correct tradeoff: the alternative
 * (a fixed literal in source control) means anyone with repo access can mint
 * valid tokens for the production deployment.
 */
export const JWT_SECRET: string =
  env.JWT_SECRET ?? crypto.randomBytes(48).toString('hex');

if (!env.JWT_SECRET && !isTest) {
  console.warn(
    '[config] JWT_SECRET is not set — generated an ephemeral key for this process. ' +
      'Sessions will not survive a restart. Set JWT_SECRET in .env to persist them.',
  );
}

export const TOKEN_EXPIRY = '30d';

/** Origin allowed by CORS and Socket.io. */
export const CLIENT_URL: string = env.CLIENT_URL ?? 'http://localhost:3000';

/** Email address granted access to the admin dashboard. */
export const ADMIN_EMAIL: string | undefined = env.ADMIN_EMAIL;

/** Google OAuth client ID (public value). */
export const GOOGLE_CLIENT_ID: string | undefined = env.VITE_GOOGLE_CLIENT_ID;

/** Port the HTTP server binds to. */
export const PORT: number = env.PORT ?? (isProduction ? 3000 : 3001);

/**
 * Single authority for admin checks.
 *
 * Comparison is case-insensitive and length-safe. Returns false when
 * ADMIN_EMAIL is unconfigured so an empty env var can never match an
 * empty/undefined user email and hand out admin rights.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!ADMIN_EMAIL || !email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase();
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/',
} as const;

/**
 * Options used to clear the auth cookie.
 *
 * Must mirror the attributes the cookie was set with (minus maxAge) or browsers
 * silently keep the original cookie — this is why logout has to reuse the same
 * `secure`/`sameSite`/`path` triple.
 */
export const COOKIE_CLEAR_OPTIONS = {
  httpOnly: COOKIE_OPTIONS.httpOnly,
  secure: COOKIE_OPTIONS.secure,
  sameSite: COOKIE_OPTIONS.sameSite,
  path: COOKIE_OPTIONS.path,
} as const;

/**
 * Allowed origins for CORS and websockets.
 *
 * Production is pinned to CLIENT_URL. Development allows the Vite dev server on
 * either loopback host, since `vite --host` may be reached as localhost or
 * 127.0.0.1 and a mismatch breaks credentialed requests.
 */
const DEV_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
];

export const ALLOWED_ORIGINS: string[] = isProduction
  ? [CLIENT_URL]
  : Array.from(new Set([CLIENT_URL, ...DEV_ORIGINS]));

export const CORS_OPTIONS = {
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  maxAge: 86400, // cache preflight for 24h
};

export { isProduction, isTest };
