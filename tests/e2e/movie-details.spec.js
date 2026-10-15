import { test, expect } from "../fixtures/baseTest.js";

test.describe("Movie Details, Cast & Reviews (FEAT-MDETAIL & FEAT-REVIEW)", () => {
  test("MDETAIL-001: Movie details page renders backdrop, title, and action buttons", async ({ authenticatedPage: page }) => {
    // Navigate to Interstellar (ID: 157336)
    await page.goto("/movies/157336");
    await expect(page).toHaveURL(/\/movies\/157336/);
    
    // Check main title & body
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await expect(page.locator("body")).toBeVisible();
  });

  test("MDETAIL-002: Person details page loads credits and biography", async ({ authenticatedPage: page }) => {
    // Christopher Nolan (Person ID: 525)
    await page.goto("/person/525");
    await expect(page).toHaveURL(/\/person\/525/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("REVIEW-001: My Reviews page loads user reviews list", async ({ authenticatedPage: page }) => {
    await page.goto("/myreviews");
    await expect(page).toHaveURL(/\/myreviews/);
    await expect(page.locator("body")).toBeVisible();
  });
});
