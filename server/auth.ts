import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db, users } from './db.js';
import { eq } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';
import { JWT_SECRET, TOKEN_EXPIRY, COOKIE_OPTIONS } from './config.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

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

// POST /api/auth/google - Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Missing credential' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.VITE_GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google token payload' });
    }

    const { sub: googleId, email, name, picture } = payload;
    const safeName = name || "Google User";
    const safePicture = picture || "";

    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    let user = existingUsers[0];

    if (user) {
      if (!user.googleId) {
        await db.update(users)
          .set({ googleId, avatarUrl: user.avatarUrl || safePicture })
          .where(eq(users.id, user.id));
        user.googleId = googleId;
      }
    } else {
      const id = 'usr_' + Date.now().toString(36);
      user = {
        id,
        name: safeName,
        email,
        passwordHash: null,
        avatarUrl: safePicture,
        provider: 'google',
        googleId,
        createdAt: new Date()
      };
      await db.insert(users).values(user);
    }

    const token = generateToken(user);
    res.cookie('auth_token', token, COOKIE_OPTIONS);
    
    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (error) {
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

    const { passwordHash, googleId, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (error) {
    res.json({ user: null });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token', COOKIE_OPTIONS);
  res.json({ success: true });
});

export default router;
