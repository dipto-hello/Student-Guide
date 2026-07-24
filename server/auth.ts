import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db, users } from './db.js';
import { eq } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'student_hub_jwt_secret_key_2024';
const TOKEN_EXPIRY = '30d';

function generateToken(user: { id: string; email: string }) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

const cookieOptions = {
  httpOnly: true,
  secure: false,  // localhost doesn't use HTTPS
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 days
  path: '/'
};

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

    const payload = JSON.parse(Buffer.from(credential.split('.')[1], 'base64').toString());
    const { sub: googleId, email, name, picture } = payload;

    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    let user = existingUsers[0];

    if (user) {
      if (!user.googleId) {
        await db.update(users)
          .set({ googleId, avatarUrl: user.avatarUrl || picture })
          .where(eq(users.id, user.id));
        user.googleId = googleId;
      }
    } else {
      const id = 'usr_' + Date.now().toString(36);
      user = {
        id,
        name,
        email,
        passwordHash: null,
        avatarUrl: picture,
        provider: 'google',
        googleId,
        createdAt: new Date()
      };
      await db.insert(users).values(user);
    }

    const token = generateToken(user);
    res.cookie('auth_token', token, cookieOptions);
    
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
  res.clearCookie('auth_token', cookieOptions);
  res.json({ success: true });
});

export default router;
