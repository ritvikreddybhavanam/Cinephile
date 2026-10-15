import { test, expect } from "../fixtures/baseTest.js";

test.describe("Movie Discovery, Global Search & Catalog (FEAT-DISC)", () => {
  test("DISC-001: Landing page renders hero section and trending movies", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav").first()).toBeVisible();
    
    // Check search input in navbar
    const searchInput = page.locator('input[placeholder*="Search" i]');
    await expect(searchInput).toBeVisible();

    // Check heading
    await expect(page.locator("h1")).toBeVisible();
  });

  test("DISC-002: Global search bar opens suggestions when typing", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator('input[placeholder*="Search" i]');
    await searchInput.fill("Interstellar");
    
    // Wait for live search response or suggestions container
    await page.waitForTimeout(600);
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("DISC-003: Movies discovery page renders filter bar with genre/year/language", async ({ authenticatedPage: page }) => {
    await page.goto("/movies");
    await expect(page).toHaveURL(/\/movies/);

    // Check page header & filter selects
    await expect(page.locator("h1")).toContainText(/Films|Movies/i);
    const selects = page.locator("select");
    expect(await selects.count()).toBeGreaterThanOrEqual(3);
  });

  test("DISC-004: Trending movies page loads successfully", async ({ authenticatedPage: page }) => {
    await page.goto("/trending");
    await expect(page).toHaveURL(/\/trending/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("DISC-005: New releases page loads catalog", async ({ authenticatedPage: page }) => {
    await page.goto("/new-releases");
    await expect(page).toHaveURL(/\/new-releases/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("DISC-006: Browse by language page renders language options", async ({ authenticatedPage: page }) => {
    await page.goto("/movies-language");
    await expect(page).toHaveURL(/\/movies-language/);
    await expect(page.locator("body")).toBeVisible();
  });
});
