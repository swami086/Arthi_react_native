import { test, expect } from '@playwright/test';

test.describe('Followup Agent Flow', () => {
    test('should complete a wellness check-in', async ({ page }) => {
        await page.goto('/wellness-check');

        // Verify Followup Form
        await expect(page.locator('[data-surface-id="wellness-check-form"]')).toBeVisible();

        // Interact with form components
        // Slider
        const slider = page.locator('[role="slider"]');
        if (await slider.isVisible()) {
            await slider.focus();
            await page.keyboard.press('ArrowRight');
        }

        // Submit
        await page.getByRole('button', { name: /Submit/i }).click();

        // Verify success
        await expect(page.getByText(/Thank you for checking in/i)).toBeVisible();
    });
});
