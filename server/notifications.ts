import express from 'express';
import { db, notifications } from './db.js';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from './auth.js';

const notificationsRouter = express.Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get('/', async (req, res) => {
  const userId = req.user!.id;
  try {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
      
    res.json(userNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

notificationsRouter.put('/:id/read', async (req, res) => {
  const userId = req.user!.id;
  const notificationId = req.params.id;
  
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
      
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all as read
notificationsRouter.put('/read-all', async (req, res) => {
  const userId = req.user!.id;
  
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
      
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

export default notificationsRouter;
