import crypto from 'crypto';

// Centralized configuration - single source of truth
const isProduction = process.env.NODE_ENV === 'production';

// Use a strong, static secret to ensure sessions persist across Render server restarts
// without requiring manual environment variable configuration on Render dashboard.
export const JWT_SECRET = process.env.JWT_SECRET || 'a8f2d91c4e7b3a6f0e5d8c2b9a1f4e7d3c6b0a5e8d2c9f1b4a7e0d3c6f9b2a5e8d1c4f7b0a3e6d9c2f5b8a1e4d7c0f3b6a9e2d5c8f1b4a7';
export const TOKEN_EXPIRY = '30d';

// Hardcoded for zero-config Vercel deployment
export const CLIENT_URL = process.env.CLIENT_URL || 'https://student-guide-green.vercel.app';
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
