import { test, expect } from '@playwright/test';

test.describe('Booking Agent Flow', () => {
    test('should complete a full booking journey', async ({ page }) => {
        // 1. Navigate to appointments page
        await page.goto('/appointments');

        // 2. Click "Launch Smart Booking" button
        // (Assuming this button exists or we trigger the agent via some interaction)
        const launchButton = page.getByRole('button', { name: /Smart Booking/i });
        if (await launchButton.isVisible()) {
            await launchButton.click();
        }

        // 3. Verify booking agent initializes (Realtime messages are mocked or seeded)
        // We expect to see therapist cards
        await expect(page.locator('[data-component-type="TherapistCard"]')).toBeVisible({ timeout: 10000 });

        // 4. Click on a Therapist
        await page.locator('[data-component-type="TherapistCard"]').first().click();

        // 5. Verify CalendarPicker appears
        await expect(page.locator('[data-component-type="CalendarPicker"]')).toBeVisible();

        // 6. Select a date
        await page.locator('[data-component-type="CalendarPicker"] .rdp-day').first().click();

        // 7. Verify TimeSlotButton render
        await expect(page.locator('[data-component-type="TimeSlotButton"]')).toBeVisible();

        // 8. Click a time slot
        await page.locator('[data-component-type="TimeSlotButton"]').first().click();

        // 9. Verify AppointmentCard preview
        await expect(page.locator('[data-component-type="AppointmentCard"]')).toBeVisible();

        // 10. Confirm Booking
        await page.getByRole('button', { name: /Confirm/i }).click();

        // 11. Verify success (toast or redirect)
        // Next.js sonner toast or similar
        await expect(page.getByText(/Booking confirmed/i)).toBeVisible();
    });
});
