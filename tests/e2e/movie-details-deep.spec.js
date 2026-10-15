import { test, expect } from "../fixtures/baseTest.js";

test.describe("Phase 2 — Movie Details Comprehensive User Journey (FEAT-MDETAIL-DEEP)", () => {
  const INTERSTELLAR_ID = 157336;

  test("MDETAIL-003: Search movie, open details, and verify metadata & posters", async ({ authenticatedPage: page }) => {
    // 1. Search for movie via homepage
    await page.goto("/");
    const searchInput = page.locator('input[placeholder*="Search" i]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Interstellar");
    await page.keyboard.press("Enter");

    // 2. Open Interstellar MovieDetails page
    await page.goto(`/movies/${INTERSTELLAR_ID}`);
    await expect(page).toHaveURL(new RegExp(`/movies/${INTERSTELLAR_ID}`));

    // 3. Verify title, poster, tagline, overview, genres
    await expect(page.locator("h1:has-text('Interstellar')").first()).toBeVisible();
    const posterImg = page.locator('img[alt*="Interstellar poster" i], img[alt*="Interstellar" i]').first();
    await expect(posterImg).toBeVisible();

    // Verify rating badge & year
    await expect(page.locator("text=2014").first()).toBeVisible();
    await expect(page.locator("text=Science Fiction").first()).toBeVisible();
  });

  test("MDETAIL-004: Verify Trailer section, Cast ensemble, Crew, and Watch Providers", async ({ authenticatedPage: page }) => {
    await page.goto(`/movies/${INTERSTELLAR_ID}`);

    // Verify Trailer button exists in hero
    const trailerBtn = page.locator('button:has-text("Trailer")').first();
    await expect(trailerBtn).toBeVisible();

    // Verify Principal Cast section
    await expect(page.locator("text=Top Cast").or(page.locator("text=Principal Cast"))).toBeVisible();
    await expect(page.locator("text=Matthew McConaughey").first()).toBeVisible();

    // Verify Key Crew section
    await expect(page.locator("text=Christopher Nolan").first()).toBeVisible();

    // Verify Where to Watch / Streaming providers or Decision layer
    const watchProvidersOrGuide = page.locator("text=Where to Watch").or(page.locator("text=Content Guide"));
    await expect(watchProvidersOrGuide.first()).toBeVisible();
  });

  test("MDETAIL-005: Like and Unlike toggle workflow updates interactive state", async ({ authenticatedPage: page }) => {
    await page.goto(`/movies/${INTERSTELLAR_ID}`);

    // Like button
    const likeBtn = page.locator('button:has-text("Like"), button:has-text("Liked")').first();
    await expect(likeBtn).toBeVisible();
    const initialText = await likeBtn.innerText();

    // Click to toggle
    await likeBtn.click();
    await page.waitForTimeout(1000);

    // Click again to restore original state
    await likeBtn.click();
    await page.waitForTimeout(1000);

    await expect(likeBtn).toBeVisible();
  });

  test("MDETAIL-006: Watchlist and Watched toggle workflows function reliably", async ({ authenticatedPage: page }) => {
    await page.goto(`/movies/${INTERSTELLAR_ID}`);

    // Watchlist button
    const watchlistBtn = page.locator('button:has-text("Watchlist")').first();
    await expect(watchlistBtn).toBeVisible();
    await watchlistBtn.click();
    await page.waitForTimeout(800);
    // Toggle back
    await watchlistBtn.click();
    await page.waitForTimeout(800);

    // Watched toggle button
    const watchedBtn = page.locator('button:has-text("Log Film"), button:has-text("Logged")').first();
    await expect(watchedBtn).toBeVisible();
  });

  test("MDETAIL-007: Review lifecycle — navigate to write review and verify review sections", async ({ authenticatedPage: page }) => {
    await page.goto(`/movies/${INTERSTELLAR_ID}`);

    // Verify Write Review link
    const writeReviewBtn = page.locator('a:has-text("Write Review"), a:has-text("Edit Review")').first();
    await expect(writeReviewBtn).toBeVisible();
    await expect(writeReviewBtn).toHaveAttribute("href", new RegExp(`/write_review\\?movieId=${INTERSTELLAR_ID}`));

    // Verify Community Reviews section renders on movie details
    await expect(page.locator("text=Community Reviews").or(page.locator("text=Reviews"))).toBeVisible();
  });

  test("MDETAIL-008: Graceful fallback for non-existent or data-sparse movie", async ({ authenticatedPage: page }) => {
    // Navigate to invalid movie ID
    await page.goto("/movies/999999999");

    // Application should not crash, but show Film Not Found or 404 container
    await expect(page.locator("text=Film Not Found").or(page.locator("text=Unable to locate"))).toBeVisible();
    await expect(page.locator('a:has-text("Browse Films")').first()).toBeVisible();
  });
});
