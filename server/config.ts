import crypto from 'crypto';

// Centralized configuration - single source of truth
const isProduction = process.env.NODE_ENV === 'production';

// Generate a strong fallback JWT secret and warn if using it
const FALLBACK_SECRET = crypto.randomBytes(64).toString('hex');
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET not set. Using auto-generated secret. Sessions will not persist across restarts.');
}

export const JWT_SECRET = process.env.JWT_SECRET || FALLBACK_SECRET;
export const TOKEN_EXPIRY = '30d';

export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dipto.hello.me@gmail.com';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/',
};

export const CORS_OPTIONS = {
  origin: isProduction ? CLIENT_URL : 'http://localhost:3000',
  credentials: true,
};

export { isProduction };
