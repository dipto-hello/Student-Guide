import { Router, Request, Response, NextFunction } from 'express';
import { db, users, studySessions, userCourses, typingScores } from './db.js';
import { desc, sql, eq } from 'drizzle-orm';
import { requireAuth } from './auth.js';
import { ADMIN_EMAIL } from './config.js';

const router = Router();

// Middleware to ensure user is admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // First ensure they are authenticated
  requireAuth(req, res, () => {
    // Then check if their email matches ADMIN_EMAIL
    if (req.user?.email === ADMIN_EMAIL) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
  });
};

// GET /api/admin/stats - Aggregate platform statistics
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalStudySessionsResult = await db.select({ count: sql<number>`count(*)` }).from(studySessions);
    const totalCoursesResult = await db.select({ count: sql<number>`count(*)` }).from(userCourses);
    const avgTypingSpeedResult = await db.select({ avgWpm: sql<number>`avg(${typingScores.wpm})` }).from(typingScores);

    const stats = {
      totalUsers: totalUsersResult[0].count || 0,
      totalStudySessions: totalStudySessionsResult[0].count || 0,
      totalCourses: totalCoursesResult[0].count || 0,
      avgTypingSpeed: avgTypingSpeedResult[0].avgWpm ? Math.round(avgTypingSpeedResult[0].avgWpm) : 0,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/admin/users - List all users (secure data only)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      provider: users.provider,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt));

    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users list:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
