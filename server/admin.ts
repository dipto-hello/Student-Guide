import { Router, Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { db, users, studySessions, userCourses, typingScores, notifications } from './db.js';
import { desc, sql, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireAuth } from './auth.js';
import { isAdminEmail } from './config.js';
import { logger } from './logger.js';

const router = Router();

/**
 * Authorization gate for every admin route.
 *
 * Authorization is decided here and nowhere else — the client's `isAdmin` flag
 * is a UI hint, never a permission. The email is re-derived from the verified
 * JWT on each request rather than trusted from the request body.
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    if (isAdminEmail(req.user?.email)) {
      next();
      return;
    }
    logger.warn('Admin access denied', {
      userId: req.user?.id,
      path: req.originalUrl,
    });
    res.status(403).json({ error: 'Forbidden: Admin access required' });
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

const broadcastSchema = z.object({
  message: z.string().trim().min(1, 'Message is required').max(500),
  type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
});

// POST /api/admin/broadcast - Send notification to all users
router.post('/broadcast', requireAdmin, async (req, res) => {
  try {
    const parsed = broadcastSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
    }
    const { message, type } = parsed.data;

    // Get all user IDs
    const allUsers = await db.select({ id: users.id }).from(users);

    // Create notifications in bulk. IDs use randomUUID rather than
    // Math.random(): a broadcast inserts thousands of rows in the same
    // millisecond, where a weak PRNG risks primary-key collisions.
    const newNotifications = allUsers.map(user => ({
      id: 'notif_' + randomUUID(),
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

    const targetUser = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, userId));

    if (!targetUser[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    // The admin account is undeletable. The original check only ran when the
    // caller was deleting themselves, so an admin could delete a second admin
    // account; the guard now applies to the target unconditionally.
    if (isAdminEmail(targetUser[0].email)) {
      return res.status(400).json({ error: 'Cannot delete the admin account' });
    }

    // Child rows go via ON DELETE CASCADE (foreign keys are enabled in initDb).
    await db.delete(users).where(eq(users.id, userId));

    logger.info('Admin deleted user', { actorId: req.user?.id, targetId: userId });
    res.json({ success: true });
  } catch (error) {
    logger.error('Error deleting user', error, { targetId: req.params.userId });
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
