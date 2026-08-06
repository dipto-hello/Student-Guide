import { describe, it, expect, beforeAll, vi } from 'vitest';
import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';

/**
 * Integration tests for the server-side Google OAuth flow.
 *
 * These exercise the security-critical gate — the `state`/PKCE cookie must be
 * present and match before any code is exchanged — without hitting Google's
 * network endpoints, which are only reached *after* that gate passes.
 *
 * The router reads its Google config from module-load-time constants, so each
 * scenario sets `process.env` and imports the router dynamically (ESM `import`
 * is hoisted and would run before the env is in place).
 */

const CLIENT_ID = 'test-client-id.apps.googleusercontent.com';

async function buildApp(configured: boolean): Promise<Express> {
  vi.resetModules();
  process.env.NODE_ENV = 'test';
  process.env.CLIENT_URL = 'http://localhost:3000';
  process.env.VITE_GOOGLE_CLIENT_ID = CLIENT_ID;
  if (configured) {
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
  } else {
    delete process.env.GOOGLE_CLIENT_SECRET;
  }

  const { default: authRouter } = await import('./auth.js');
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use('/api/auth', authRouter);
  return app;
}

describe('GET /api/auth/google (configured)', () => {
  let app: Express;
  beforeAll(async () => {
    app = await buildApp(true);
  });

  it('redirects to the Google consent screen', async () => {
    const res = await request(app).get('/api/auth/google');
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/^https:\/\/accounts\.google\.com\//);
  });

  it('requests offline-safe scopes and PKCE', async () => {
    const res = await request(app).get('/api/auth/google');
    const location = res.headers.location as string;
    expect(location).toContain('code_challenge=');
    expect(location).toContain('code_challenge_method=S256');
    expect(location).toContain(encodeURIComponent(CLIENT_ID));
  });

  it('sets an httpOnly oauth_state cookie carrying the state', async () => {
    const res = await request(app).get('/api/auth/google');
    const cookies = res.headers['set-cookie'] as unknown as string[];
    const stateCookie = cookies.find((c) => c.startsWith('oauth_state='));
    expect(stateCookie).toBeDefined();
    expect(stateCookie).toMatch(/HttpOnly/i);

    // The state sent to Google must be the same value stored in the cookie.
    const stateInUrl = new URL(res.headers.location as string).searchParams.get('state');
    const stateInCookie = decodeURIComponent(
      stateCookie!.split(';')[0].split('=')[1],
    ).split('.')[0];
    expect(stateInUrl).toBe(stateInCookie);
  });
});

describe('GET /api/auth/google/callback (configured)', () => {
  let app: Express;
  beforeAll(async () => {
    app = await buildApp(true);
  });

  it('rejects a callback with no state cookie', async () => {
    const res = await request(app).get('/api/auth/google/callback?code=abc&state=xyz');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('http://localhost:3000/?auth_error=invalid_request');
  });

  it('rejects a state that does not match the cookie', async () => {
    const res = await request(app)
      .get('/api/auth/google/callback?code=abc&state=attacker')
      .set('Cookie', 'oauth_state=victim.verifier123');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('http://localhost:3000/?auth_error=state_mismatch');
  });

  it('surfaces a denied consent as access_denied', async () => {
    const res = await request(app).get('/api/auth/google/callback?error=access_denied');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('http://localhost:3000/?auth_error=access_denied');
  });

  it('clears the state cookie after use', async () => {
    const res = await request(app)
      .get('/api/auth/google/callback?code=abc&state=attacker')
      .set('Cookie', 'oauth_state=victim.verifier123');
    const cookies = (res.headers['set-cookie'] as unknown as string[]) ?? [];
    expect(cookies.some((c) => c.startsWith('oauth_state=') && /Expires=|Max-Age=0/i.test(c))).toBe(
      true,
    );
  });
});

describe('GET /api/auth/google (secret missing)', () => {
  it('redirects with oauth_not_configured instead of starting the flow', async () => {
    const app = await buildApp(false);
    const res = await request(app).get('/api/auth/google');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('http://localhost:3000/?auth_error=oauth_not_configured');
  });
});
