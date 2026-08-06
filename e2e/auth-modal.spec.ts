import { test, expect } from '@playwright/test';

/**
 * Auth modal tests.
 *
 * These verify only that the modal opens and surfaces a Google sign-in
 * affordance. They intentionally do NOT click through to Google: the sign-in
 * control navigates to `/api/auth/google` (a server-side OAuth redirect), which
 * would leave the app and depend on real Google infrastructure — flaky and
 * impossible to satisfy in CI. Selectors are role/text based so they survive
 * styling and markup churn.
 */

test.describe('Auth modal', () => {
  test('opens from the navbar sign-in button and shows a Google affordance', async ({ page }) => {
    await page.goto('/');

    // The modal is not mounted until requested.
    await expect(
      page.getByRole('heading', { name: /welcome to student hub/i }),
    ).toBeHidden();

    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(
      page.getByRole('heading', { name: /welcome to student hub/i }),
    ).toBeVisible();

    // Resilient to the control being a link, a button, the rendered Google
    // widget, or a "not configured" notice when no client id is present: assert
    // some Google affordance surfaces in the modal without clicking it (a click
    // would trigger the server-side OAuth redirect and leave the app).
    await expect(page.getByText(/google/i).first()).toBeVisible();
  });

  test('opens via the ?login=true deep link', async ({ page }) => {
    await page.goto('/?login=true');

    await expect(
      page.getByRole('heading', { name: /welcome to student hub/i }),
    ).toBeVisible();
  });
});
