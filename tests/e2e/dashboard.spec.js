import { test, expect } from "../fixtures/baseTest.js";

test.describe("User Dashboard & Cinema Journal Workflows (FEAT-DASHBOARD)", () => {
  test("DASH-001: Authenticated user dashboard renders hero banner and cinema statistics", async ({ authenticatedPage: page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify Welcome greeting
    await expect(page.locator("h1, h2").first()).toBeVisible();

    // Verify Cinema Stats section
    await expect(page.locator("text=Cinema Stats")).toBeVisible();
    await expect(page.locator("text=Movies Watched")).toBeVisible();
    await expect(page.locator("text=Movies Rated")).toBeVisible();
    await expect(page.locator("text=Reviews Written")).toBeVisible();
    await expect(page.locator('main a[href="/watchlist"]').getByText('Watchlist', { exact: true })).toBeVisible();

    // Verify Featured Today Hero section
    await expect(page.locator("text=Featured Today")).toBeVisible();
    await expect(page.locator('button:has-text("Watch Trailer")')).toBeVisible();
  });

  test("DASH-002: In-dashboard Quick Log modal opens and allows movie search", async ({ authenticatedPage: page }) => {
    await page.goto("/dashboard");

    // Click "Log Film" or "Log a Film" button
    const logFilmBtn = page.locator('button:has-text("Log Film"), button:has-text("Log a Film")').first();
    await expect(logFilmBtn).toBeVisible();
    await logFilmBtn.click();

    // Verify modal appears with dialog role and search input
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('input[placeholder*="Search by title" i], input[type="text"]').first()).toBeVisible();

    // Close modal via close button
    const closeBtn = dialog.locator('button[aria-label="Close modal"], button:has-text("Cancel")').first();
    await closeBtn.click();
    await expect(dialog).not.toBeVisible();
  });

  test("DASH-003: Discovery shortcuts and recommendation catalog are accessible", async ({ authenticatedPage: page }) => {
    await page.goto("/dashboard");

    // Recommended section or catalog links
    await expect(page.locator("text=Recommended For You")).toBeVisible();

    // Sidebar shortcuts
    await expect(page.locator("text=Trending Now")).toBeVisible();
    await expect(page.locator('main').getByText("What to Watch", { exact: false }).first()).toBeVisible();
  });

  test("DASH-004: Mobile navigation hamburger drawer toggles correctly", async ({ page }) => {
    const viewport = page.viewportSize();
    test.skip(!viewport || viewport.width >= 640, "Applies to viewports narrower than 640px where hamburger is rendered");

    await page.goto("/");
    const menuBtn = page.locator('button[aria-label*="menu" i]').first();
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // Drawer should show navigation links
    const drawer = page.locator("div.max-h-\\[calc\\(100vh-3\\.5rem\\)\\]");
    await expect(drawer).toBeVisible();

    // Clicking again closes drawer
    await menuBtn.click();
    await expect(drawer).not.toBeVisible();
  });
});
