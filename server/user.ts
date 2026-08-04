import { Router, Request, Response } from 'express';
import { db, userCourses, typingScores, studySessions, userStreaks, users, notifications } from './db.js';
import { eq, desc, and } from 'drizzle-orm';
import { z } from 'zod';
import { JWT_SECRET } from './config.js';
import { requireAuth } from './auth.js';

const router = Router();

// Middleware to protect routes (requireAuth handles putting user object on req)
router.use(requireAuth);

type AuthRequest = Request & { user?: { id: string, email: string }, userId?: string };

// Helper middleware to map req.user.id to req.userId for existing routes
router.use((req: AuthRequest, res: Response, next) => {
  if (req.user) {
    req.userId = req.user.id;
  }
  next();
});

// GET /api/user/courses
router.get('/courses', async (req: AuthRequest, res: Response) => {
  try {
    const courses = await db.select().from(userCourses).where(eq(userCourses.userId, req.userId!));
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Zod Schemas
const courseSchema = z.object({
  name: z.string().min(2),
  creditHours: z.number().positive(),
  grade: z.number().min(0).max(4.0)
});

const typingScoreSchema = z.object({
  wpm: z.number().min(0),
  accuracy: z.number().min(0).max(100),
  difficulty: z.enum(['easy', 'medium', 'hard'])
});

const studySessionSchema = z.object({
  type: z.string().min(2),
  durationMinutes: z.number().positive()
});

// POST /api/user/courses
router.post('/courses', async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = courseSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({ error: 'Invalid input', details: validatedData.error.issues });
    }
    const { name, creditHours, grade } = validatedData.data;
    
    const id = 'course_' + Date.now().toString(36);
    await db.insert(userCourses).values({
      id,
      userId: req.userId!,
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
router.patch('/courses/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateSchema = courseSchema.partial();
    const validatedData = updateSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ error: 'Invalid input', details: validatedData.error.issues });
    }
    
    const { name, creditHours, grade } = validatedData.data;
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (creditHours !== undefined) updateData.creditHours = creditHours;
    if (grade !== undefined) updateData.grade = grade;
    
    await db.update(userCourses).set(updateData).where(and(eq(userCourses.id, id), eq(userCourses.userId, req.userId!)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// DELETE /api/user/courses/:id
router.delete('/courses/:id', async (req: AuthRequest, res: Response) => {
  try {
    await db.delete(userCourses).where(and(eq(userCourses.id, req.params.id), eq(userCourses.userId, req.userId!)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// DELETE /api/user/courses (Clear all)
router.delete('/courses', async (req: AuthRequest, res: Response) => {
  try {
    await db.delete(userCourses).where(eq(userCourses.userId, req.userId!));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear courses' });
  }
});

// POST /api/user/typing-score
router.post('/typing-score', async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = typingScoreSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({ error: 'Invalid input', details: validatedData.error.issues });
    }
    const { wpm, accuracy, difficulty } = validatedData.data;

    const id = 'typing_' + Date.now().toString(36);
    await db.insert(typingScores).values({
      id,
      userId: req.userId!,
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
router.get('/typing-history', async (req: AuthRequest, res: Response) => {
  try {
    const history = await db.select().from(typingScores)
      .where(eq(typingScores.userId, req.userId!))
      .orderBy(desc(typingScores.createdAt))
      .limit(10);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch typing history' });
  }
});

// POST /api/user/study-session
router.post('/study-session', async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = studySessionSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({ error: 'Invalid input', details: validatedData.error.issues });
    }
    const { type, durationMinutes } = validatedData.data;

    const id = 'session_' + Date.now().toString(36);
    await db.insert(studySessions).values({
      id,
      userId: req.userId!,
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
router.get('/study-sessions', async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await db.select().from(studySessions)
      .where(eq(studySessions.userId, req.userId!))
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
router.get('/streak', async (req: AuthRequest, res: Response) => {
  try {
    const streak = await db.select().from(userStreaks).where(eq(userStreaks.userId, req.userId!));
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
router.post('/streak/activity', async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const streak = await db.select().from(userStreaks).where(eq(userStreaks.userId, req.userId!));
    
    if (streak.length === 0) {
      await db.insert(userStreaks).values({
        userId: req.userId!,
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
    }).where(eq(userStreaks.userId, req.userId!));
    
    res.json({ success: true, currentStreak: newCurrent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record activity' });
  }
});

// POST /api/user/streak/achievement
router.post('/streak/achievement', async (req: AuthRequest, res: Response) => {
  try {
    const { achievementId } = req.body;
    if (!achievementId) return res.status(400).json({ error: 'Invalid input' });

    const streak = await db.select().from(userStreaks).where(eq(userStreaks.userId, req.userId!));
    if (streak.length === 0) {
      await db.insert(userStreaks).values({
        userId: req.userId!,
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
      }).where(eq(userStreaks.userId, req.userId!));
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add achievement' });
  }
});

// PUT /api/user/profile
router.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2) return res.status(400).json({ error: 'Invalid name' });

    await db.update(users).set({ name }).where(eq(users.id, req.userId!));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// DELETE /api/user/account
router.delete('/account', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    // Drizzle will handle cascades if configured, but let's delete manually to be safe
    await db.delete(userCourses).where(eq(userCourses.userId, userId));
    await db.delete(typingScores).where(eq(typingScores.userId, userId));
    await db.delete(studySessions).where(eq(studySessions.userId, userId));
    await db.delete(userStreaks).where(eq(userStreaks.userId, userId));
    await db.delete(notifications).where(eq(notifications.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
    
    res.clearCookie('auth_token', { path: '/' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
