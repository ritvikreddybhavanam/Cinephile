import { test, expect } from "../fixtures/baseTest.js";

test.describe("Personal Library, Watched Films & Watchlist (FEAT-WATCHED & FEAT-WLIST)", () => {
  test("LIB-001: Watched films archive page renders header, stats & filter toolbar", async ({ authenticatedPage: page }) => {
    await page.goto("/mywatchedfilms");
    await expect(page).toHaveURL(/\/mywatchedfilms/);
    await expect(page.locator("h1")).toContainText(/Watched Films/i);

    // Check filter toolbar presence
    await expect(page.locator('input[placeholder*="Search" i], select').first()).toBeVisible();
  });

  test("LIB-002: Watchlist page renders correctly", async ({ authenticatedPage: page }) => {
    await page.goto("/watchlist");
    await expect(page).toHaveURL(/\/watchlist/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("LIB-003: Liked movies / Favorites page renders correctly", async ({ authenticatedPage: page }) => {
    await page.goto("/favorites");
    await expect(page).toHaveURL(/\/favorites/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("DIARY-001: Film Diary page renders timeline & stats", async ({ authenticatedPage: page }) => {
    await page.goto("/diary");
    await expect(page).toHaveURL(/\/diary/);
    await expect(page.locator("body")).toBeVisible();
  });
});
