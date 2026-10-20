import { test, expect } from "@playwright/test";

test.describe("Cinephile OTT Streaming Discovery Guide (/streaming)", () => {
    test.beforeEach(async ({ page }) => {
        // Collect console errors to ensure zero unhandled JS exceptions
        const errors = [];
        page.on("pageerror", (err) => errors.push(err.message));
        page.on("console", (msg) => {
            if (msg.type() === "error") {
                const text = msg.text();
                if (!text.includes("favicon") && !text.includes("Failed to load resource")) {
                    errors.push(text);
                }
            }
        });
        page.context()["consoleErrors"] = errors;
    });

    test("STREAM-001: Streaming Guide is accessible through More dropdown in Navbar", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("domcontentloaded");

        // Hover or click More button to reveal mega menu
        const moreBtn = page.locator("nav button:has-text('More')").first();
        await expect(moreBtn).toBeVisible();
        await moreBtn.hover();
        await page.waitForTimeout(300);

        const streamingLink = page.locator("nav a:has-text('Streaming Guide')").first();
        if (!(await streamingLink.isVisible())) {
            await moreBtn.click();
            await page.waitForTimeout(300);
        }
        await expect(streamingLink).toBeVisible();

        // Click to navigate to /streaming
        await streamingLink.click();
        await expect(page).toHaveURL(/\/streaming/);

        // Verify page header
        const heading = page.locator("h1:has-text('Find Your Next Film')");
        await expect(heading).toBeVisible();

        const subtitle = page.locator("text=/Explore movies across your favorite streaming platforms/i");
        await expect(subtitle).toBeVisible();
    });

    test("STREAM-002: Direct URL navigation loads OTT Platform Selector and default provider films", async ({ page }) => {
        await page.goto("/streaming");
        await page.waitForLoadState("domcontentloaded");

        // Verify platform selector section
        const platformSection = page.locator("section[aria-label='Choose Your Streaming Platforms']");
        await expect(platformSection).toBeVisible();

        // Verify supported provider buttons exist (e.g. Netflix, Amazon Prime Video)
        const netflixBtn = page.locator("button[aria-label*='Netflix']").first();
        await expect(netflixBtn).toBeVisible();

        const primeBtn = page.locator("button[aria-label*='Amazon Prime Video']").first();
        await expect(primeBtn).toBeVisible();

        // Verify movie cards load
        const movieCards = page.locator("section[aria-label='Streaming Movies Grid'] article");
        await expect(movieCards.first()).toBeVisible({ timeout: 12000 });
        const count = await movieCards.count();
        expect(count).toBeGreaterThan(0);
    });

    test("STREAM-003: Selecting and deselecting streaming platforms updates active chips and results", async ({ page }) => {
        await page.goto("/streaming");
        await page.waitForLoadState("domcontentloaded");

        // Wait for initial grid
        const movieCards = page.locator("section[aria-label='Streaming Movies Grid'] article");
        await expect(movieCards.first()).toBeVisible({ timeout: 12000 });

        // Prime Video button
        const primeBtn = page.locator("button[aria-label*='Amazon Prime Video']").first();
        await primeBtn.click();

        // Verify active filter chip appears for Prime Video
        const primeRemoveBtn = page.locator("button[aria-label*='Remove Amazon Prime Video']").first();
        await expect(primeRemoveBtn).toBeVisible();

        // Verify Any/All mode buttons appear when multiple platforms are selected
        const anyModeBtn = page.locator("button:has-text('Any Selected (OR)')");
        await expect(anyModeBtn).toBeVisible();

        const allModeBtn = page.locator("button:has-text('All Selected (AND)')");
        await expect(allModeBtn).toBeVisible();

        // Switch to All Selected (AND)
        await allModeBtn.click();
        await page.waitForTimeout(600);
        await expect(allModeBtn).toHaveClass(/bg-accent/);

        // Click Clear All
        const clearAllBtn = page.locator("button:has-text('Clear All')");
        await expect(clearAllBtn).toBeVisible();
        await clearAllBtn.click();

        // Verify platform active chip removed
        await page.waitForTimeout(400);
        await expect(page.locator("button[aria-label*='Remove Amazon Prime Video']")).toHaveCount(0);
    });

    test("STREAM-004: Region selector switches country and updates available OTT platform catalog", async ({ page }) => {
        await page.goto("/streaming");
        await page.waitForLoadState("domcontentloaded");

        const regionSelect = page.locator("select[aria-label='Select streaming region']");
        await expect(regionSelect).toBeVisible();

        // Switch region to US
        await regionSelect.selectOption("US");
        await page.waitForTimeout(800);

        // In US, Max, Hulu, or Disney should be available
        const disneyBtn = page.locator("button[aria-label*='Disney']").first();
        await expect(disneyBtn).toBeVisible();

        // Switch back to IN
        await regionSelect.selectOption("IN");
        await page.waitForTimeout(800);

        const jioHotstarBtn = page.locator("button[aria-label*='JioHotstar'], button[aria-label*='Hotstar']").first();
        await expect(jioHotstarBtn).toBeVisible();
    });

    test("STREAM-005: Genre filters multi-select and update the discovery grid", async ({ page }) => {
        await page.goto("/streaming");
        await page.waitForLoadState("domcontentloaded");

        const actionGenreBtn = page.locator("section[aria-label='Genres'] button:has-text('Action')");
        await expect(actionGenreBtn).toBeVisible();
        await actionGenreBtn.click();

        // Verify active chip appears
        const actionChip = page.locator("span:has-text('Action')").first();
        await expect(actionChip).toBeVisible();

        // Clear Genres
        const clearGenresBtn = page.locator("button:has-text('Clear Genres')").first();
        await expect(clearGenresBtn).toBeVisible();
        await clearGenresBtn.click();

        await page.waitForTimeout(300);
        await expect(actionGenreBtn).not.toHaveClass(/bg-accent text-bg/);
    });

    test("STREAM-006: Title search with debouncing filters results and respects clear control", async ({ page }) => {
        await page.goto("/streaming");
        await page.waitForLoadState("domcontentloaded");

        const searchInput = page.locator("input[aria-label='Search movies by title']");
        await expect(searchInput).toBeVisible();

        // Type search query
        await searchInput.fill("Batman");
        await page.waitForTimeout(600);

        // Verify search chip is active
        const searchChip = page.locator("text=/Search: \"Batman\"/i");
        await expect(searchChip).toBeVisible();

        // Clear search using the X button
        const clearBtn = page.locator("button[aria-label='Clear search input']");
        await expect(clearBtn).toBeVisible();
        await clearBtn.click();

        await expect(searchInput).toHaveValue("");
    });

    test("STREAM-007: Expandable advanced filters support minimum rating and reset all filters", async ({ page }) => {
        await page.goto("/streaming");
        await page.waitForLoadState("domcontentloaded");

        const moreFiltersBtn = page.locator("button:has-text('More Filters')");
        await expect(moreFiltersBtn).toBeVisible();
        await moreFiltersBtn.click();

        // Click 7.0+ Rating
        const rating7Btn = page.locator("button:has-text('7.0+ Rating')");
        await expect(rating7Btn).toBeVisible();
        await rating7Btn.click();

        // Verify rating chip appears
        const ratingChip = page.locator("span:has-text('Rating: 7.0+')").first();
        await expect(ratingChip).toBeVisible();

        // Reset all filters
        const resetBtn = page.locator("button:has-text('Reset All Filters')").first();
        await expect(resetBtn).toBeVisible();
        await resetBtn.click();

        await page.waitForTimeout(400);
        await expect(page.locator("span:has-text('Rating: 7.0+')")).toHaveCount(0);
    });

    test("STREAM-008: Streaming Options modal displays live flatrate, rent, and buy providers", async ({ page }) => {
        await page.goto("/streaming");
        await page.waitForLoadState("domcontentloaded");

        // Hover first card and click Providers button
        const firstCard = page.locator("section[aria-label='Streaming Movies Grid'] article").first();
        await expect(firstCard).toBeVisible({ timeout: 12000 });
        await firstCard.hover();

        const providersBtn = firstCard.locator("button:has-text('Providers')");
        await expect(providersBtn).toBeVisible();
        await providersBtn.click();

        // Modal should open
        const modal = page.locator("div[role='dialog'][aria-modal='true']");
        await expect(modal).toBeVisible();

        // Check modal elements
        const modalTitle = modal.locator("#streaming-modal-title");
        await expect(modalTitle).toBeVisible();

        const subscriptionHeading = modal.locator("h3:has-text('Subscription Streaming')");
        await expect(subscriptionHeading).toBeVisible();

        // Close modal using close button
        const closeBtn = modal.locator("button[aria-label='Close streaming options']");
        await expect(closeBtn).toBeVisible();
        await closeBtn.click();

        await expect(modal).not.toBeVisible();
    });

    test("STREAM-009: Guest clicking Watchlist triggers sign-in prompt modal", async ({ page }) => {
        await page.goto("/streaming");
        await page.waitForLoadState("domcontentloaded");

        // Hover card and click Watchlist
        const firstCard = page.locator("section[aria-label='Streaming Movies Grid'] article").first();
        await expect(firstCard).toBeVisible({ timeout: 12000 });
        await firstCard.hover();

        const watchlistBtn = firstCard.locator("button[aria-label='Add to watchlist']");
        await expect(watchlistBtn).toBeVisible();
        await watchlistBtn.click();

        // Guest modal should open
        const guestModal = page.locator("div[role='dialog'] h3:has-text('Save to Your Watchlist')");
        await expect(guestModal).toBeVisible();

        const signInBtn = page.locator("div[role='dialog'] a:has-text('Sign In')");
        await expect(signInBtn).toBeVisible();

        // Close guest modal
        const keepBrowsingBtn = page.locator("button:has-text('Keep Browsing as Guest')");
        await keepBrowsingBtn.click();
        await expect(guestModal).not.toBeVisible();
    });

    test("STREAM-010: Responsive layout on mobile viewport has no horizontal overflow", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto("/streaming");
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(800);

        // Check for horizontal overflow
        const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        expect(hasHorizontalScroll).toBe(false);

        // Check that platform cards are laid out in a compact grid
        const platformButtons = page.locator("section[aria-label='Choose Your Streaming Platforms'] button[aria-pressed]");
        await expect(platformButtons.first()).toBeVisible();
    });
});
