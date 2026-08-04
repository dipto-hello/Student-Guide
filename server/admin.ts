import { Router, Request, Response, NextFunction } from 'express';
import { db, users, studySessions, userCourses, typingScores, notifications } from './db.js';
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

// POST /api/admin/broadcast - Send notification to all users
router.post('/broadcast', requireAdmin, async (req, res) => {
  try {
    const { message, type = 'info' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get all user IDs
    const allUsers = await db.select({ id: users.id }).from(users);
    
    // Create notifications in bulk
    const newNotifications = allUsers.map(user => ({
      id: 'notif_' + Math.random().toString(36).substring(2) + Date.now(),
      userId: user.id,
      type,
      message,
      isRead: false,
      createdAt: new Date(),
    }));

    // Chunk insertion if there are many users (SQLite limit is usually 999 vars)
    const chunkSize = 100;
    for (let i = 0; i < newNotifications.length; i += chunkSize) {
      const chunk = newNotifications.slice(i, i + chunkSize);
      await db.insert(notifications).values(chunk);
    }

    res.json({ success: true, count: newNotifications.length });
  } catch (error) {
    console.error('Error broadcasting message:', error);
    res.status(500).json({ error: 'Failed to broadcast message' });
  }
});

// DELETE /api/admin/users/:userId - Delete a user and all their data
router.delete('/users/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Cannot delete yourself
    if (req.user?.id === userId || req.user?.email === ADMIN_EMAIL) {
      const targetUser = await db.select().from(users).where(eq(users.id, userId));
      if (targetUser[0]?.email === ADMIN_EMAIL) {
         return res.status(400).json({ error: 'Cannot delete the admin account' });
      }
    }

    await db.delete(users).where(eq(users.id, userId));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
