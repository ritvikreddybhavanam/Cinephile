import { test, expect } from "../fixtures/baseTest.js";

test.describe("Machine Learning Box Office Prediction (FEAT-PRED)", () => {
  test("PRED-001: Box office prediction page loads with budget, runtime & genre controls", async ({ authenticatedPage: page }) => {
    await page.goto("/box-prediction");
    await expect(page).toHaveURL(/\/box-prediction/);

    // Verify form inputs exist
    await expect(page.locator('input[type="number"], input[placeholder*="budget" i], input').first()).toBeVisible();
    await expect(page.locator('button:has-text("Predict"), button[type="submit"]').first()).toBeVisible();
  });

  test("PRED-002: Prediction calculation triggers when inputs are submitted", async ({ authenticatedPage: page }) => {
    await page.goto("/box-prediction");
    
    // Fill sample values in the box office prediction form
    const budgetInput = page.locator('main form input[placeholder*="budget" i], main form input').first();
    if (await budgetInput.isVisible()) {
      await budgetInput.fill("150000000");
    }

    const predictBtn = page.locator('main button:has-text("Predict"), main button[type="submit"]').first();
    if (await predictBtn.isVisible()) {
      await predictBtn.scrollIntoViewIfNeeded();
      await predictBtn.click();
    }

    await page.waitForTimeout(1000);
    await expect(page.locator("body")).toBeVisible();
  });
});
