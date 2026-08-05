import express from 'express';
import { z } from 'zod';

const searchRouter = express.Router();

/** Static tool catalogue. Kept in one place so search and the command menu agree. */
const staticTools = [
  { id: 'cgpa', title: 'CGPA Calculator', path: '/', icon: 'Calculator' },
  { id: 'typing', title: 'Typing Test', path: '/', icon: 'Keyboard' },
  { id: 'pomodoro', title: 'Pomodoro Timer', path: '/pomodoro', icon: 'Timer' },
  { id: 'study', title: 'Study Manager', path: '/', icon: 'BookOpen' },
  { id: 'study-room', title: 'Live Study Room', path: '/study-room', icon: 'Users' },
  { id: 'analytics', title: 'Student Analytics', path: '/analytics', icon: 'BarChart3' },
] as const;

const querySchema = z.object({
  // Bounded length: the value is only ever matched against a fixed in-memory
  // list, but an unbounded query string still costs bandwidth and log volume.
  q: z.string().trim().max(100).optional().default(''),
});

/**
 * Results are memoised per normalised query. The catalogue is static, so the
 * same handful of queries recur constantly across users and recomputing the
 * filter each time is pure waste.
 */
const cache = new Map<string, unknown[]>();
const CACHE_LIMIT = 200;

searchRouter.get('/', (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query', details: parsed.error.issues });
  }

  const query = parsed.data.q.toLowerCase();
  if (!query) {
    return res.json([]);
  }

  const cached = cache.get(query);
  if (cached) {
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.json(cached);
  }

  const results = staticTools
    .filter((t) => t.title.toLowerCase().includes(query) || t.id.includes(query))
    .map((t) => ({ ...t, type: 'tool' as const }));

  // Simple FIFO eviction — the cache exists to skip repeated work, not to be
  // an LRU, and unbounded growth on adversarial queries is the real risk.
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(query, results);

  res.setHeader('Cache-Control', 'public, max-age=300');
  res.json(results);
});

export default searchRouter;
