import { test, expect } from '@playwright/test';

/**
 * Mobile-viewport smoke test.
 *
 * Guards against the landing hero introducing horizontal overflow on small
 * screens — a common regression when a wide element escapes the layout. The
 * viewport is set explicitly (375x812) so the assertion holds regardless of the
 * project the test runs under.
 */

test.describe('Mobile viewport', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('renders the hero without horizontal overflow', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Master Your');

    // The document should never be wider than the viewport (allow a 1px
    // sub-pixel rounding tolerance).
    const overflow = await page.evaluate(() => {
      const el = document.documentElement;
      return el.scrollWidth - el.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
