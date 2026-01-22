import { test, expect } from '@playwright/test';

test.describe('Session Agent Flow', () => {
    test('should suggest and apply interventions', async ({ page }) => {
        // Navigate to a session (mocked ID)
        await page.goto('/video/session-123/call');

        // Verify Copilot Sidebar
        await expect(page.locator('[data-testid="a2ui-copilot-sidebar"]')).toBeVisible();

        // Verify InterventionCard (Assuming one is triggered by mock data)
        await expect(page.locator('[data-component-type="InterventionCard"]')).toBeVisible();

        // Click Apply
        await page.getByRole('button', { name: /Apply/i }).click();

        // Verify expanded details
        await expect(page.getByText(/Steps to implement/i)).toBeVisible();
    });

    test('should save SOAP notes', async ({ page }) => {
        await page.goto('/video/session-123/soap');

        // Verify template sections
        await expect(page.getByText(/Subjective/i)).toBeVisible();
        await expect(page.getByText(/Objective/i)).toBeVisible();

        // Save
        await page.getByRole('button', { name: /Save/i }).click();
        await expect(page.getByText(/Note saved/i)).toBeVisible();
    });

    test('should trigger and handle risk alerts', async ({ page }) => {
        // Navigate to session
        await page.goto('/video/session-123/call');

        // Check for RiskAlert component
        const riskAlert = page.locator('[data-component-type="RiskAlert"]');
        await expect(riskAlert).toBeVisible();
        await expect(riskAlert).toContainText(/Risk/i);

        // Verify intensity/severity
        await expect(riskAlert.locator('text=high')).toBeVisible();

        // Click on Open Assessment
        await page.getByRole('button', { name: /Open Assessment/i }).click();

        // Assert assessment modal/view is open
        await expect(page.getByText(/Clinical Assessment/i)).toBeVisible();

        // Click on Flag for Review
        await page.getByRole('button', { name: /Flag for Review/i }).click();

        // Verify success message
        await expect(page.getByText(/Flagged for clinical review/i)).toBeVisible();
    });
});
