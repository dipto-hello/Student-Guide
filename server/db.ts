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
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  creditHours: integer('credit_hours').notNull(),
  grade: real('grade').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const typingScores = sqliteTable('typing_scores', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  wpm: integer('wpm').notNull(),
  accuracy: integer('accuracy').notNull(),
  difficulty: text('difficulty').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const studySessions = sqliteTable('study_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const userStreaks = sqliteTable('user_streaks', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  lastActiveDate: text('last_active_date'),
  achievements: text('achievements'),
});

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
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

// Helper to initialize db with proper schema including ON DELETE CASCADE
export async function initDb() {
  // Enable foreign key enforcement (critical for CASCADE to work)
  await client.execute('PRAGMA foreign_keys = ON;');

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

  // ─── Migration: Recreate tables with ON DELETE CASCADE ───
  // SQLite does not support ALTER TABLE to add/modify foreign key constraints.
  // We use a safe recreate strategy: create new table → copy data → drop old → rename.

  // user_courses
  await client.execute(`
    CREATE TABLE IF NOT EXISTS user_courses_new (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      credit_hours INTEGER NOT NULL,
      grade REAL NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  await migrateTable(client, 'user_courses', 'user_courses_new',
    'id, user_id, name, credit_hours, grade, created_at');

  // typing_scores
  await client.execute(`
    CREATE TABLE IF NOT EXISTS typing_scores_new (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      wpm INTEGER NOT NULL,
      accuracy INTEGER NOT NULL,
      difficulty TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  await migrateTable(client, 'typing_scores', 'typing_scores_new',
    'id, user_id, wpm, accuracy, difficulty, created_at');

  // study_sessions
  await client.execute(`
    CREATE TABLE IF NOT EXISTS study_sessions_new (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  await migrateTable(client, 'study_sessions', 'study_sessions_new',
    'id, user_id, type, duration_minutes, created_at');

  // user_streaks
  await client.execute(`
    CREATE TABLE IF NOT EXISTS user_streaks_new (
      user_id TEXT PRIMARY KEY,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_active_date TEXT,
      achievements TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  await migrateTable(client, 'user_streaks', 'user_streaks_new',
    'user_id, current_streak, longest_streak, last_active_date, achievements');

  // notifications
  await client.execute(`
    CREATE TABLE IF NOT EXISTS notifications_new (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  await migrateTable(client, 'notifications', 'notifications_new',
    'id, user_id, type, message, is_read, created_at');
}

/**
 * Safe table migration helper for SQLite.
 * If the old table exists, copies its data to the new table, drops the old one,
 * and renames the new one. If the old table doesn't exist, just renames.
 */
async function migrateTable(
  dbClient: ReturnType<typeof createClient>,
  oldName: string,
  newName: string,
  columns: string
) {
  // Check if old table exists
  const result = await dbClient.execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='${oldName}';`
  );

  if (result.rows.length > 0) {
    // Old table exists — copy data to new table
    await dbClient.execute(
      `INSERT OR IGNORE INTO ${newName} (${columns}) SELECT ${columns} FROM ${oldName};`
    );
    // Drop old table
    await dbClient.execute(`DROP TABLE ${oldName};`);
  }

  // Rename new table to the original name
  await dbClient.execute(`ALTER TABLE ${newName} RENAME TO ${oldName};`);
}
