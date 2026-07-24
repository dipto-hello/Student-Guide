import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db, userCourses, typingScores, studySessions, userStreaks, users } from './db.js';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'student_hub_jwt_secret_key_2024';

// Middleware to protect routes
function requireAuth(req: any, res: any, next: any) {
  const token = req.cookies?.auth_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, email: string };
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.use(requireAuth);

// GET /api/user/courses
router.get('/courses', async (req: any, res) => {
  try {
    const courses = await db.select().from(userCourses).where(eq(userCourses.userId, req.userId));
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// POST /api/user/courses
router.post('/courses', async (req: any, res) => {
  try {
    const { name, creditHours, grade } = req.body;
    if (!name || creditHours == null || grade == null) return res.status(400).json({ error: 'Invalid input' });
    
    const id = 'course_' + Date.now().toString(36);
    await db.insert(userCourses).values({
      id,
      userId: req.userId,
      name,
      creditHours,
      grade,
      createdAt: new Date(),
    });
    res.status(201).json({ id, name, creditHours, grade });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save course' });
  }
});

// PATCH /api/user/courses/:id
router.patch('/courses/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, creditHours, grade } = req.body;
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (creditHours !== undefined) updateData.creditHours = creditHours;
    if (grade !== undefined) updateData.grade = grade;
    
    await db.update(userCourses).set(updateData).where(eq(userCourses.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// DELETE /api/user/courses/:id
router.delete('/courses/:id', async (req: any, res) => {
  try {
    await db.delete(userCourses).where(eq(userCourses.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// DELETE /api/user/courses (Clear all)
router.delete('/courses', async (req: any, res) => {
  try {
    await db.delete(userCourses).where(eq(userCourses.userId, req.userId));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear courses' });
  }
});

// POST /api/user/typing-score
router.post('/typing-score', async (req: any, res) => {
  try {
    const { wpm, accuracy, difficulty } = req.body;
    if (wpm == null || accuracy == null || !difficulty) return res.status(400).json({ error: 'Invalid input' });

    const id = 'typing_' + Date.now().toString(36);
    await db.insert(typingScores).values({
      id,
      userId: req.userId,
      wpm,
      accuracy,
      difficulty,
      createdAt: new Date(),
    });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save score' });
  }
});

// GET /api/user/typing-history
router.get('/typing-history', async (req: any, res) => {
  try {
    const history = await db.select().from(typingScores)
      .where(eq(typingScores.userId, req.userId))
      .orderBy(desc(typingScores.createdAt))
      .limit(10);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch typing history' });
  }
});

// POST /api/user/study-session
router.post('/study-session', async (req: any, res) => {
  try {
    const { type, durationMinutes } = req.body;
    if (!type || durationMinutes == null) return res.status(400).json({ error: 'Invalid input' });

    const id = 'session_' + Date.now().toString(36);
    await db.insert(studySessions).values({
      id,
      userId: req.userId,
      type,
      durationMinutes,
      createdAt: new Date(),
    });
    res.status(201).json({ success: true, id, type, durationMinutes, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save session' });
  }
});

// GET /api/user/study-sessions
router.get('/study-sessions', async (req: any, res) => {
  try {
    const sessions = await db.select().from(studySessions)
      .where(eq(studySessions.userId, req.userId))
      .orderBy(desc(studySessions.createdAt))
      .limit(20);
    
    // Map to the format frontend expects
    const formatted = sessions.map(s => {
       const date = new Date(s.createdAt);
       return {
         id: s.id,
         type: s.type,
         durationMinutes: s.durationMinutes,
         timestamp: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
         rawDate: date
       };
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch study sessions' });
  }
});

// GET /api/user/streak
router.get('/streak', async (req: any, res) => {
  try {
    const streak = await db.select().from(userStreaks).where(eq(userStreaks.userId, req.userId));
    if (streak.length === 0) {
      return res.json({
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: '',
        achievements: []
      });
    }
    const data = streak[0];
    res.json({
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
      lastActiveDate: data.lastActiveDate || '',
      achievements: data.achievements ? JSON.parse(data.achievements) : []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch streak' });
  }
});

// POST /api/user/streak/activity
router.post('/streak/activity', async (req: any, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const streak = await db.select().from(userStreaks).where(eq(userStreaks.userId, req.userId));
    
    if (streak.length === 0) {
      await db.insert(userStreaks).values({
        userId: req.userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        achievements: '[]'
      });
      return res.json({ success: true, currentStreak: 1 });
    }
    
    const data = streak[0];
    if (data.lastActiveDate === today) return res.json({ success: true, currentStreak: data.currentStreak }); // Already recorded today

    let newCurrent = data.currentStreak;
    if (data.lastActiveDate) {
      const lastDate = new Date(data.lastActiveDate);
      const todayDate = new Date(today);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) newCurrent += 1;
      else if (diffDays > 1) newCurrent = 1;
    } else {
      newCurrent = 1;
    }

    const newLongest = Math.max(data.longestStreak, newCurrent);

    await db.update(userStreaks).set({
      currentStreak: newCurrent,
      longestStreak: newLongest,
      lastActiveDate: today
    }).where(eq(userStreaks.userId, req.userId));
    
    res.json({ success: true, currentStreak: newCurrent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record activity' });
  }
});

// POST /api/user/streak/achievement
router.post('/streak/achievement', async (req: any, res) => {
  try {
    const { achievementId } = req.body;
    if (!achievementId) return res.status(400).json({ error: 'Invalid input' });

    const streak = await db.select().from(userStreaks).where(eq(userStreaks.userId, req.userId));
    if (streak.length === 0) {
      await db.insert(userStreaks).values({
        userId: req.userId,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        achievements: JSON.stringify([achievementId])
      });
      return res.json({ success: true });
    }

    const data = streak[0];
    const achievements = data.achievements ? JSON.parse(data.achievements) : [];
    
    if (!achievements.includes(achievementId)) {
      achievements.push(achievementId);
      await db.update(userStreaks).set({
        achievements: JSON.stringify(achievements)
      }).where(eq(userStreaks.userId, req.userId));
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add achievement' });
  }
});

// PUT /api/user/profile
router.put('/profile', async (req: any, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2) return res.status(400).json({ error: 'Invalid name' });

    await db.update(users).set({ name }).where(eq(users.id, req.userId));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// DELETE /api/user/account
router.delete('/account', async (req: any, res) => {
  try {
    const userId = req.userId;
    // Drizzle will handle cascades if configured, but let's delete manually to be safe
    await db.delete(userCourses).where(eq(userCourses.userId, userId));
    await db.delete(typingScores).where(eq(typingScores.userId, userId));
    await db.delete(studySessions).where(eq(studySessions.userId, userId));
    await db.delete(userStreaks).where(eq(userStreaks.userId, userId));
    // notifications might need deletion too if it has userId, but notifications table didn't have a userId in schema I saw earlier. Wait, I should just delete the user.
    await db.delete(users).where(eq(users.id, userId));
    
    res.clearCookie('auth_token', { path: '/' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
