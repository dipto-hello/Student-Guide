import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';
import { db, users } from './db.js';
import { eq } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';
import {
  JWT_SECRET,
  TOKEN_EXPIRY,
  COOKIE_OPTIONS,
  COOKIE_CLEAR_OPTIONS,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  isGoogleOAuthConfigured,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_COOKIE_OPTIONS,
  CLIENT_URL,
  isAdminEmail,
} from './config.js';
import { OAuth2Client, CodeChallengeMethod } from 'google-auth-library';
import { logger } from './logger.js';

if (!GOOGLE_CLIENT_ID) {
  throw new Error('VITE_GOOGLE_CLIENT_ID is required for Google OAuth');
}

/**
 * Client used only to verify Google-issued ID tokens (both the legacy popup
 * flow and the token returned by the code exchange). Verification needs the
 * public client id, not the secret.
 */
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Confidential client for the server-side authorization-code flow. Constructed
 * only when the secret is present so a missing secret degrades to a clean
 * "sign-in unavailable" redirect instead of a boot crash — deploys land before
 * the secret is configured (see config.ts).
 */
const oauthClient = isGoogleOAuthConfigured
  ? new OAuth2Client({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      redirectUri: GOOGLE_REDIRECT_URI,
    })
  : null;

/** Scopes required to identify the user. `openid` yields the ID token. */
const GOOGLE_SCOPES = ['openid', 'email', 'profile'];

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

const router = Router();

function generateToken(user: { id: string; email: string }) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, email: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

/** URL-safe base64 without padding, as PKCE requires. */
function base64url(input: Buffer): string {
  return input.toString('base64url');
}

/**
 * Finds a user by email and links their Google identity, or creates one.
 *
 * Matching on email (not googleId) means an existing email/password account is
 * upgraded to also allow Google sign-in rather than silently forking into a
 * second account for the same person.
 */
async function upsertGoogleUser(profile: {
  googleId: string;
  email: string;
  name?: string | null;
  picture?: string | null;
}) {
  const { googleId, email } = profile;
  const safeName = profile.name || 'Google User';
  const safePicture = profile.picture || '';

  const existingUsers = await db.select().from(users).where(eq(users.email, email));
  let user = existingUsers[0];

  if (user) {
    if (!user.googleId) {
      await db
        .update(users)
        .set({ googleId, avatarUrl: user.avatarUrl || safePicture })
        .where(eq(users.id, user.id));
      user.googleId = googleId;
    }
    return user;
  }

  // Date.now alone can collide when two users register in the same millisecond;
  // the random suffix makes the id unique without a round trip to check.
  const id = 'usr_' + Date.now().toString(36) + randomBytes(4).toString('hex');
  user = {
    id,
    name: safeName,
    email,
    passwordHash: null,
    avatarUrl: safePicture,
    provider: 'google',
    googleId,
    createdAt: new Date(),
  };
  await db.insert(users).values(user);
  return user;
}

/** Serialises the safe subset of a user row for the client. */
function toPublicUser(user: typeof users.$inferSelect) {
  const { passwordHash: _pw, googleId: _gid, ...safeUser } = user;
  return { ...safeUser, isAdmin: isAdminEmail(user.email) };
}

/** Sends the browser back to the SPA with an error code the UI can surface. */
function redirectWithError(res: Response, reason: string) {
  res.redirect(`${CLIENT_URL}/?auth_error=${encodeURIComponent(reason)}`);
}

// ── Server-side OAuth 2.0 authorization-code flow (with PKCE) ────────────────
// Replaces the client-side Google Identity widget. The button on the client is
// a plain navigation to this route, so there is no third-party script to load
// and nothing to flicker while it initialises.

// GET /api/auth/google — start the flow: set a state cookie and redirect to
// Google's consent screen.
router.get('/google', (req, res) => {
  if (!oauthClient) {
    return redirectWithError(res, 'oauth_not_configured');
  }

  // `state` defeats CSRF on the callback; the PKCE verifier binds the eventual
  // code exchange to this same browser. Both are stored in one httpOnly cookie
  // (never readable by JS) and checked when Google redirects back.
  const state = base64url(randomBytes(16));
  const codeVerifier = base64url(randomBytes(32));
  const codeChallenge = base64url(createHash('sha256').update(codeVerifier).digest());

  res.cookie(OAUTH_STATE_COOKIE, `${state}.${codeVerifier}`, OAUTH_STATE_COOKIE_OPTIONS);

  const url = oauthClient.generateAuthUrl({
    access_type: 'online',
    scope: GOOGLE_SCOPES,
    state,
    code_challenge_method: CodeChallengeMethod.S256,
    code_challenge: codeChallenge,
    // Always show the account chooser so switching accounts is possible.
    prompt: 'select_account',
  });

  res.redirect(url);
});

// GET /api/auth/google/callback — Google returns the user here with ?code&state.
router.get('/google/callback', async (req, res) => {
  if (!oauthClient) {
    return redirectWithError(res, 'oauth_not_configured');
  }

  // Consume the state cookie exactly once, regardless of outcome.
  const stateCookie = req.cookies?.[OAUTH_STATE_COOKIE] as string | undefined;
  res.clearCookie(OAUTH_STATE_COOKIE, { path: OAUTH_STATE_COOKIE_OPTIONS.path });

  const { code, state, error: googleError } = req.query;

  // The user declined consent, or Google reported an error.
  if (googleError) {
    return redirectWithError(res, 'access_denied');
  }

  if (typeof code !== 'string' || typeof state !== 'string' || !stateCookie) {
    return redirectWithError(res, 'invalid_request');
  }

  const [expectedState, codeVerifier] = stateCookie.split('.');
  if (!expectedState || !codeVerifier || state !== expectedState) {
    return redirectWithError(res, 'state_mismatch');
  }

  try {
    const { tokens } = await oauthClient.getToken({ code, codeVerifier });

    if (!tokens.id_token) {
      return redirectWithError(res, 'no_id_token');
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return redirectWithError(res, 'email_unverified');
    }

    const user = await upsertGoogleUser({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    });

    res.cookie('auth_token', generateToken(user), COOKIE_OPTIONS);
    // Land on the SPA; AuthContext reads /api/auth/me on mount and the home
    // page shows a welcome toast for ?auth=success.
    res.redirect(`${CLIENT_URL}/?auth=success`);
  } catch (error) {
    logger.error('Google OAuth callback failed', error);
    redirectWithError(res, 'exchange_failed');
  }
});

// POST /api/auth/google — legacy client-side ID-token login.
//
// Kept for backward compatibility during rollout (an older cached bundle may
// still POST a credential). New sign-ins use the redirect flow above.
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Missing credential' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google token payload' });
    }

    const user = await upsertGoogleUser({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    });

    res.cookie('auth_token', generateToken(user), COOKIE_OPTIONS);
    res.json({ user: toPublicUser(user) });
  } catch (error) {
    logger.error('Legacy Google login failed', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me - Get current user from JWT
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.auth_token;
    if (!token) {
      return res.json({ user: null });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, email: string };
    const existingUsers = await db.select().from(users).where(eq(users.id, decoded.id));
    const user = existingUsers[0];

    if (!user) {
      return res.json({ user: null });
    }

    res.json({ user: toPublicUser(user) });
  } catch (error) {
    res.json({ user: null });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token', COOKIE_CLEAR_OPTIONS);
  res.json({ success: true });
});

export default router;
