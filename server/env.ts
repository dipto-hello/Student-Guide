import { z } from 'zod';

/**
 * Environment variable validation.
 *
 * Fails fast at startup with a readable report instead of letting the app boot
 * with a missing secret and fall over at the first request. In production every
 * secret is mandatory — there are deliberately no fallback values, because a
 * hardcoded default secret in source control is the same as having no secret.
 */

/** Minimum entropy we accept for a signing key (bytes of hex ≈ 32). */
const MIN_SECRET_LENGTH = 32;
const baseSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  PORT: z.coerce.number().int().positive().optional(),

  /** Signing key for auth JWTs. */
  JWT_SECRET: z
    .string()
    .min(MIN_SECRET_LENGTH, `JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters`)
    .optional(),

  /** Origin allowed by CORS, e.g. https://app.example.com */
  CLIENT_URL: z.string().url().optional(),

  /** Email address granted admin dashboard access. */
  ADMIN_EMAIL: z.string().email().optional(),

  /** Google OAuth client ID — public value, shared with the frontend. */
  VITE_GOOGLE_CLIENT_ID: z.string().min(1).optional(),

  /** Turso libSQL connection. Falls back to a local file when unset. */
  TURSO_DATABASE_URL: z.string().min(1).optional(),
  TURSO_AUTH_TOKEN: z.string().min(1).optional(),

  /** Optional Sentry DSN. When absent, error reporting stays local-only. */
  SENTRY_DSN: z.string().url().optional(),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('info'),
});

/**
 * Production requires the values that cannot have a safe default.
 * Development is allowed to run with generated/local values so a fresh clone
 * boots without configuration.
 *
 * The production check reads the *parsed* NODE_ENV rather than the ambient
 * `process.env`, so `parseEnv(source)` validates the environment it was handed
 * instead of the one the process happens to be running under.
 */
const schema = baseSchema.superRefine((env, ctx) => {
  if (env.NODE_ENV !== 'production') return;

  const required: Array<keyof typeof env> = [
    'JWT_SECRET',
    'CLIENT_URL',
    'ADMIN_EMAIL',
    'VITE_GOOGLE_CLIENT_ID',
  ];

  for (const key of required) {
    if (!env[key]) {
      ctx.addIssue({
        code: 'custom',
        path: [key],
        message: `${key} is required when NODE_ENV=production`,
      });
    }
  }

  // A Turso auth token without a URL (or vice versa) is a misconfiguration that
  // silently degrades to an ephemeral local file on the host.
  if (env.TURSO_DATABASE_URL && !env.TURSO_AUTH_TOKEN) {
    ctx.addIssue({
      code: 'custom',
      path: ['TURSO_AUTH_TOKEN'],
      message: 'TURSO_AUTH_TOKEN is required when TURSO_DATABASE_URL is set',
    });
  }
  if (!env.TURSO_DATABASE_URL) {
    ctx.addIssue({
      code: 'custom',
      path: ['TURSO_DATABASE_URL'],
      message:
        'TURSO_DATABASE_URL is required in production — a local SQLite file does not survive redeploys',
    });
  }
});

export type Env = z.infer<typeof baseSchema>;

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  • ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
}

/**
 * Validates `source` and returns the typed result.
 * Exported separately from the module-level singleton so tests can exercise it
 * without mutating `process.env`.
 */
export function parseEnv(source: NodeJS.ProcessEnv = process.env) {
  const result = schema.safeParse(source);

  if (!result.success) {
    throw new Error(
      'Invalid environment configuration:\n' +
        formatIssues(result.error) +
        '\n\nSee .env.example for the full list of supported variables.',
    );
  }

  return result.data;
}

export const env = parseEnv();

export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
