import { test, expect } from '@playwright/test';

/**
 * Tool routing smoke tests.
 *
 * These exercise the `/tool/:id` router without any authentication: the CGPA
 * calculator renders for anonymous visitors, so it is a safe, backend-free
 * target. Deliberately avoids asserting on tool internals — reaching the tool
 * page shell (rather than the 404 fallback) is what proves routing works.
 */

test.describe('Tool navigation', () => {
  test('renders a tool page directly from its URL', async ({ page }) => {
    await page.goto('/tool/cgpa');

    await expect(page).toHaveURL(/\/tool\/cgpa$/);
    // The tool page shell renders the tool's title in its header.
    await expect(
      page.getByRole('heading', { name: /cgpa calculator/i }).first(),
    ).toBeVisible();
  });

  test('navigates from a tool card on the landing page to its route', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /open cgpa calculator/i }).click();

    await expect(page).toHaveURL(/\/tool\/cgpa$/);
    await expect(
      page.getByRole('heading', { name: /cgpa calculator/i }).first(),
    ).toBeVisible();
  });

  test('falls back to the not-found page for an unknown tool id', async ({ page }) => {
    await page.goto('/tool/definitely-not-a-real-tool');

    await expect(page.getByText(/404|page not found/i).first()).toBeVisible();
  });
});
