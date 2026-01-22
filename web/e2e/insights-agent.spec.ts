import { test, expect } from '@playwright/test';

test.describe('Insights Agent Flow', () => {
    test('should display analytics dashboard with trends', async ({ page }) => {
        await page.goto('/home');

        // Verify Insights Dashboard
        await expect(page.locator('[data-surface-id="insights-dashboard"]')).toBeVisible();

        // Check charts
        await expect(page.locator('[data-component-type="LineChart"]')).toBeVisible();
        await expect(page.locator('[data-component-type="BarChart"]')).toBeVisible();

        // Check patterns
        await expect(page.locator('[data-component-type="PatternCard"]')).toBeVisible();
        await expect(page.getByText(/Mood Trends/i)).toBeVisible();
    });
});
