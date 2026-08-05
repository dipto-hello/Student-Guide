import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * E2E configuration.
 *
 * Runs against the dev server (client + API together via `pnpm run dev`) so a
 * single command covers both halves of the stack.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,

  // A committed `test.only` should fail CI rather than silently shrink the suite.
  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html'], ['github']] : [['html']],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'pnpm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // Cold start compiles the whole client bundle; the default 60s is tight.
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
