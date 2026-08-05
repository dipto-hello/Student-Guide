import { test, expect } from '@playwright/test';

/**
 * Landing page smoke tests.
 *
 * Deliberately auth-free: signing in requires a real Google ID token, which
 * cannot be minted in CI. These cover what an anonymous visitor sees.
 */

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders the hero and primary calls to action', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Master Your');
    await expect(page.getByRole('button', { name: /start exploring/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /about creator/i })).toBeVisible();
  });

  test('shows a sign-in affordance when signed out', async ({ page }) => {
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('scrolls to the tools section from the hero CTA', async ({ page }) => {
    await page.getByRole('button', { name: /start exploring/i }).click();
    await expect(page.locator('#tools')).toBeInViewport({ timeout: 5000 });
  });

  test('lists every tool card', async ({ page }) => {
    const tools = page.locator('#tools [role="button"]');
    await expect(tools).toHaveCount(9);
  });

  test('opens a tool page from its card', async ({ page }) => {
    await page.getByRole('button', { name: /open cgpa calculator/i }).click();
    await expect(page).toHaveURL(/\/tool\/cgpa/);
  });

  test('routes tools that are standalone pages to their own URL', async ({ page }) => {
    await page.getByRole('button', { name: /open pomodoro timer/i }).click();
    await expect(page).toHaveURL(/\/pomodoro$/);
  });
});

test.describe('Access control', () => {
  test('redirects an anonymous visitor away from the admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    // ProtectedRoute bounces to the landing page rather than rendering /admin.
    await expect(page).not.toHaveURL(/\/admin$/, { timeout: 10_000 });
  });

  test('serves a 404 page for an unknown route', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText(/404|not found/i).first()).toBeVisible();
  });
});

test.describe('API', () => {
  test('health endpoint reports ok', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    expect(await response.json()).toMatchObject({ status: 'ok' });
  });

  test('rejects an unauthenticated request to a protected route', async ({ request }) => {
    const response = await request.get('/api/user/courses');
    expect(response.status()).toBe(401);
  });

  test('rejects a state-changing request with no CSRF token', async ({ request }) => {
    const response = await request.post('/api/user/courses', {
      data: { name: 'Test', creditHours: 3, grade: 4.0 },
    });
    // 403 (CSRF) or 401 (no session) — either way the write is refused.
    expect([401, 403]).toContain(response.status());
  });

  test('search returns matching tools', async ({ request }) => {
    const response = await request.get('/api/search?q=cgpa');
    expect(response.ok()).toBeTruthy();

    const results = await response.json();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toMatchObject({ id: 'cgpa', type: 'tool' });
  });

  test('search rejects an over-long query', async ({ request }) => {
    const response = await request.get(`/api/search?q=${'a'.repeat(200)}`);
    expect(response.status()).toBe(400);
  });
});
