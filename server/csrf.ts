import { randomBytes, timingSafeEqual } from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { isProduction } from './config.js';

/**
 * Double-submit-cookie CSRF protection.
 *
 * Auth rides on a cookie, so a cross-site form post would otherwise carry the
 * user's credentials. SameSite=None is required for the Vercel→Render split
 * origin, which removes the browser's own protection — hence an explicit token.
 *
 * The token is stored in a readable (non-httpOnly) cookie and must be echoed in
 * the `X-CSRF-Token` header. An attacker on another origin can cause the cookie
 * to be sent but cannot read it to set the header, so the two never match.
 */

export const CSRF_COOKIE = 'csrf_token';
export const CSRF_HEADER = 'x-csrf-token';

const TOKEN_BYTES = 32;

/** Methods that cannot change state and therefore need no token. */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Routes exempt from the token check.
 *
 * `/api/auth/google` is the login entry point: the caller has no session and no
 * token yet, and its own CSRF resistance comes from the Google-issued ID token,
 * which an attacker cannot forge.
 */
const EXEMPT_PATHS = new Set(['/api/auth/google']);

const cookieOptions = {
  httpOnly: false, // the frontend must read this to set the header
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString('hex');
}

/** Constant-time comparison so token verification leaks no timing signal. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Issues a CSRF token cookie when the client doesn't have one.
 * Mount before the verifier so a first-time GET seeds the token.
 */
export function csrfTokenIssuer(req: Request, res: Response, next: NextFunction): void {
  if (!req.cookies?.[CSRF_COOKIE]) {
    res.cookie(CSRF_COOKIE, generateToken(), cookieOptions);
  }
  next();
}

/** Rejects state-changing requests whose header token doesn't match the cookie. */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  if (EXEMPT_PATHS.has(req.path) || EXEMPT_PATHS.has(req.originalUrl.split('?')[0])) {
    next();
    return;
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER];

  if (
    !cookieToken ||
    typeof headerToken !== 'string' ||
    !safeEqual(cookieToken, headerToken)
  ) {
    res.status(403).json({ error: 'Invalid or missing CSRF token' });
    return;
  }

  next();
}
