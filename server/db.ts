import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),  // null for Google-only users
  avatarUrl: text('avatar_url'),
  provider: text('provider').notNull(),  // 'email' | 'google'
  googleId: text('google_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const userCourses = sqliteTable('user_courses', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  creditHours: integer('credit_hours').notNull(),
  grade: real('grade').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const typingScores = sqliteTable('typing_scores', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  wpm: integer('wpm').notNull(),
  accuracy: integer('accuracy').notNull(),
  difficulty: text('difficulty').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const studySessions = sqliteTable('study_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const userStreaks = sqliteTable('user_streaks', {
  userId: text('user_id').primaryKey().references(() => users.id),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  lastActiveDate: text('last_active_date'),
  achievements: text('achievements'),
});

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  message: text('message').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Use Turso cloud DB if configured, otherwise fallback to local sqlite
const client = createClient({ 
  url: process.env.TURSO_DATABASE_URL || 'file:./local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});
export const db = drizzle(client);

// Helper to initialize db (optional depending on usecase)
export async function initDb() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      avatar_url TEXT,
      provider TEXT NOT NULL,
      google_id TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS user_courses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      credit_hours INTEGER NOT NULL,
      grade REAL NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS typing_scores (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      wpm INTEGER NOT NULL,
      accuracy INTEGER NOT NULL,
      difficulty TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS study_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS user_streaks (
      user_id TEXT PRIMARY KEY,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_active_date TEXT,
      achievements TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}
