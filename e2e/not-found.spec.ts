import { test, expect } from '@playwright/test';

/**
 * Not-found routing tests.
 *
 * An unknown top-level route should render the NotFound page, and its "Go Home"
 * control should return the visitor to the landing page.
 */

test.describe('Not found', () => {
  test('renders the 404 page for an unknown route', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');

    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });

  test('returns to the landing page from the 404 page', async ({ page }) => {
    await page.goto('/another-missing-page');

    await page.getByRole('button', { name: /go home/i }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Master Your');
  });
});
