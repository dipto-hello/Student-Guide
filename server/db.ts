import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { env } from './env.js';
import { logger } from './logger.js';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),  // null for Google-only users
  avatarUrl: text('avatar_url'),
  provider: text('provider').notNull(),  // 'email' | 'google'
  googleId: text('google_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  // Admin dashboard lists users newest-first.
  createdAtIdx: index('idx_users_created_at').on(table.createdAt),
  // Google login looks users up by googleId.
  googleIdIdx: index('idx_users_google_id').on(table.googleId),
}));

/**
 * Index strategy: every child table is read as "all rows for this user, newest
 * first". A composite (user_id, created_at) index serves both the filter and
 * the sort, so those queries never fall back to a full scan plus in-memory sort
 * as the table grows.
 */
export const userCourses = sqliteTable('user_courses', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  creditHours: integer('credit_hours').notNull(),
  grade: real('grade').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  userIdx: index('idx_user_courses_user_id').on(table.userId),
  userCreatedIdx: index('idx_user_courses_user_created').on(table.userId, table.createdAt),
}));

export const typingScores = sqliteTable('typing_scores', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  wpm: integer('wpm').notNull(),
  accuracy: integer('accuracy').notNull(),
  difficulty: text('difficulty').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  userIdx: index('idx_typing_scores_user_id').on(table.userId),
  userCreatedIdx: index('idx_typing_scores_user_created').on(table.userId, table.createdAt),
}));

export const studySessions = sqliteTable('study_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  userIdx: index('idx_study_sessions_user_id').on(table.userId),
  userCreatedIdx: index('idx_study_sessions_user_created').on(table.userId, table.createdAt),
}));

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
}, (table) => ({
  userCreatedIdx: index('idx_notifications_user_created').on(table.userId, table.createdAt),
  // The unread badge counts by (user, is_read) on nearly every page load.
  userUnreadIdx: index('idx_notifications_user_unread').on(table.userId, table.isRead),
}));

// Use Turso cloud DB if configured, otherwise fall back to a local sqlite file.
// The fallback is a development convenience only — env.ts requires a real
// TURSO_DATABASE_URL in production, since a file on an ephemeral host is lost
// on every redeploy.
const client = createClient({
  url: env.TURSO_DATABASE_URL || 'file:./local.db',
  authToken: env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client);

/** Closes the underlying connection. Called during graceful shutdown. */
export async function closeDb(): Promise<void> {
  try {
    client.close();
  } catch (error) {
    logger.warn('Error closing database connection', {
      reason: error instanceof Error ? error.message : String(error),
    });
  }
}

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

  // ─── Table Creation (Without Dangerous Table Dropping Migration) ───
  // We use IF NOT EXISTS so it doesn't break on restart.
  // Foreign keys and CASCADE constraints are enforced when the table is first created.

  // user_courses
  await client.execute(`
    CREATE TABLE IF NOT EXISTS user_courses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      credit_hours INTEGER NOT NULL,
      grade REAL NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // typing_scores
  await client.execute(`
    CREATE TABLE IF NOT EXISTS typing_scores (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      wpm INTEGER NOT NULL,
      accuracy INTEGER NOT NULL,
      difficulty TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // study_sessions
  await client.execute(`
    CREATE TABLE IF NOT EXISTS study_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // user_streaks
  await client.execute(`
    CREATE TABLE IF NOT EXISTS user_streaks (
      user_id TEXT PRIMARY KEY,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_active_date TEXT,
      achievements TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // notifications
  await client.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Cleanup: Drop any leftover migration tables from previous bugs
  try {
    await client.execute(`DROP TABLE IF EXISTS user_courses_new;`);
    await client.execute(`DROP TABLE IF EXISTS typing_scores_new;`);
    await client.execute(`DROP TABLE IF EXISTS study_sessions_new;`);
    await client.execute(`DROP TABLE IF EXISTS user_streaks_new;`);
    await client.execute(`DROP TABLE IF EXISTS notifications_new;`);
  } catch (e) {
    // Ignore if they don't exist
  }

  await createIndexes();
}

/**
 * Creates the indexes declared on the Drizzle schema.
 *
 * `initDb` uses CREATE TABLE IF NOT EXISTS rather than a migration runner, so
 * indexes are applied the same way — idempotent, safe on every boot, and
 * applied to existing deployments without a manual migration step.
 */
async function createIndexes(): Promise<void> {
  const statements = [
    'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)',

    'CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON user_courses(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_courses_user_created ON user_courses(user_id, created_at)',

    'CREATE INDEX IF NOT EXISTS idx_typing_scores_user_id ON typing_scores(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_typing_scores_user_created ON typing_scores(user_id, created_at)',

    'CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_study_sessions_user_created ON study_sessions(user_id, created_at)',

    'CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read)',
  ];

  for (const statement of statements) {
    try {
      await client.execute(statement);
    } catch (error) {
      // A failed index is a performance regression, not a correctness bug —
      // log it and keep booting rather than taking the app down.
      logger.warn('Failed to create index', {
        statement,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  logger.info('Database indexes verified', { count: statements.length });
}
