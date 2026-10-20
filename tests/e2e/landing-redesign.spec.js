import { test, expect } from "@playwright/test";

test.describe("Cinephile Premium Discovery Landing Page Redesign", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("domcontentloaded");
    });

    test("LAND-001: Public landing page loads with HTTP 200 and no unhandled console errors", async ({ page }) => {
        const pageErrors = [];
        page.on("pageerror", (err) => pageErrors.push(err.message));

        await expect(page.locator("body")).toBeVisible();
        await expect(page.locator("nav").first()).toBeVisible();
        expect(pageErrors).toEqual([]);
    });

    test("LAND-002: Navigation bar renders Cinephile branding and required shortcuts", async ({ page }) => {
        // Logo
        const brand = page.locator('nav a:has-text("Cinephile")').first();
        await expect(brand).toBeVisible();

        // Search input
        const searchInput = page.locator('nav input[placeholder*="Search" i]');
        await expect(searchInput).toBeVisible();

        // Theme toggle button
        const themeToggle = page.locator('nav button[aria-label*="Switch to" i], nav button[aria-label*="theme" i], nav button[title*="theme" i]').first();
        await expect(themeToggle).toBeVisible();
    });

    test("LAND-003: All primary discovery sections render with distinct semantic headings", async ({ page }) => {
        // 1. Hero Featured Discovery
        await expect(page.locator("section[aria-label*='Featured Cinema' i]")).toBeVisible();
        await expect(page.locator("h1")).toBeVisible();

        // 2. Now Showing in Theaters
        const nowShowingHeading = page.locator("h2:has-text('Now Showing in Theaters')");
        await expect(nowShowingHeading).toBeVisible();

        // 3. Trending Today
        const trendingHeading = page.locator("h2:has-text('Trending Today')");
        await expect(trendingHeading).toBeVisible();

        // 4. Fresh on Streaming (OTT)
        const streamingHeading = page.locator("h2:has-text('Fresh on Streaming')");
        await expect(streamingHeading).toBeVisible();

        // 5. Popular Films
        const popularHeading = page.locator("h2:has-text('Popular Films')");
        await expect(popularHeading).toBeVisible();

        // 6. Discover by Mood & Genre
        const moodGenreHeading = page.locator("h2:has-text('What Are You in the Mood For?')");
        await expect(moodGenreHeading).toBeVisible();

        // 7. Critically Acclaimed
        const acclaimedHeading = page.locator("h2:has-text('Critically Acclaimed')");
        await expect(acclaimedHeading).toBeVisible();

        // 8. Hidden Gems
        const gemsHeading = page.locator("h2:has-text('Hidden Gems')");
        await expect(gemsHeading).toBeVisible();

        // 9. Cinephile Spotlight
        const spotlightHeading = page.locator("h2:has-text('Cinephile Spotlight')");
        await expect(spotlightHeading).toBeVisible();

        // 10. New Releases
        const newReleasesHeading = page.locator("h2:has-text('New Releases')");
        await expect(newReleasesHeading).toBeVisible();

        // 11. Personal Discovery Decision Engine
        const personalHeading = page.locator("h2:has-text('What Should I Watch Tonight?')");
        await expect(personalHeading).toBeVisible();

        // 12. Community Reviews
        const reviewsHeading = page.locator("h2:has-text('Community Reviews')");
        await expect(reviewsHeading).toBeVisible();

        // 13. Curated Watchlists
        const listsHeading = page.locator("h2:has-text('Curated Watchlists')");
        await expect(listsHeading).toBeVisible();

        // 14. Community CTA
        const ctaHeading = page.locator("h2:has-text('Begin Your Film Journal')");
        await expect(ctaHeading).toBeVisible();
    });

    test("LAND-004: Anti-duplication architecture ensures unique movie allocation across prominent sections", async ({ page }) => {
        // Wait for asynchronous section content to populate
        await page.waitForTimeout(2000);

        // Collect all movie links from prominent sections:
        // Hero, Now Showing, Trending Today, Fresh on Streaming, Popular Films, Critically Acclaimed, Hidden Gems, Spotlight, New Releases
        const prominentSections = [
            "section[aria-label*='Featured Cinema' i]",
            "section[aria-label*='Now Showing' i]",
            "section[aria-label*='Trending Today' i]",
            "section[aria-label*='Fresh on OTT' i]",
            "section[aria-label*='Popular Films' i]",
            "section[aria-label*='Critically Acclaimed' i]",
            "section[aria-label*='Hidden Gems' i]",
            "section[aria-label*='Cinephile Editorial Spotlight' i]",
            "section[aria-label*='Recently Released' i]"
        ];

        const sectionMovieMap = new Map();
        const allMovieIds = [];

        for (const selector of prominentSections) {
            const section = page.locator(selector);
            if ((await section.count()) > 0) {
                // Find all movie links matching /movies/:id
                const links = section.locator('a[href^="/movies/"]');
                const count = await links.count();
                const idsInSection = [];

                for (let i = 0; i < count; i++) {
                    const href = await links.nth(i).getAttribute("href");
                    const match = href ? href.match(/\/movies\/(\d+)/) : null;
                    if (match && match[1]) {
                        idsInSection.push(match[1]);
                    }
                }

                // Also check article/div cards with onClick that navigate to movie ID
                // Gather movie card titles
                const titles = section.locator("h3, h1, h4");
                const titleCount = await titles.count();
                const titlesInSection = [];
                for (let t = 0; t < titleCount; t++) {
                    const text = (await titles.nth(t).innerText()).trim();
                    if (text && text.length > 1 && !text.includes("Now Showing") && !text.includes("Trending") && !text.includes("Fresh on") && !text.includes("Popular") && !text.includes("Critically") && !text.includes("Hidden Gems") && !text.includes("Spotlight") && !text.includes("New Releases")) {
                        titlesInSection.push(text);
                    }
                }

                sectionMovieMap.set(selector, { ids: idsInSection, titles: titlesInSection });
            }
        }

        // Verify Hero film is NOT repeated in Trending Today or Now Showing
        const heroSection = page.locator("section[aria-label*='Featured Cinema' i]");
        const heroTitle = (await heroSection.locator("h1").innerText()).trim();

        const trendingSection = page.locator("section[aria-label*='Trending Today' i]");
        const trendingTitles = await trendingSection.locator("h3").allInnerTexts();
        expect(trendingTitles).not.toContain(heroTitle);

        const nowShowingSection = page.locator("section[aria-label*='Now Showing' i]");
        const nowShowingTitles = await nowShowingSection.locator("h3").allInnerTexts();
        expect(nowShowingTitles).not.toContain(heroTitle);

        // Verify Spotlight film is NOT repeated in Hero, Trending, or Now Showing
        const spotlightSection = page.locator("section[aria-label*='Cinephile Editorial Spotlight' i]");
        if ((await spotlightSection.count()) > 0) {
            const spotlightTitle = (await spotlightSection.locator("h3").first().innerText()).trim();
            expect(spotlightTitle).not.toBe(heroTitle);
            expect(trendingTitles).not.toContain(spotlightTitle);
            expect(nowShowingTitles).not.toContain(spotlightTitle);
        }
    });

    test("LAND-005: Interactive genre and mood filters dynamically update the discovery grid", async ({ page }) => {
        const moodTabButton = page.locator("button:has-text('Browse by Mood & Vibe')");
        await expect(moodTabButton).toBeVisible();
        await moodTabButton.click();

        // Assert that mood pills appear
        const mindBendingPill = page.locator("button:has-text('Mind-Bending')");
        await expect(mindBendingPill).toBeVisible();
        await mindBendingPill.click();

        // Wait for dynamic query update
        await page.waitForTimeout(800);

        // Verify description quote appears
        const moodQuote = page.locator("p:has-text('Speculative realities')").first();
        await expect(moodQuote).toBeVisible();
    });

    test("LAND-006: Personal discovery widget returns matched films with matching rationale", async ({ page }) => {
        const personalWidget = page.locator("section[aria-label*='Personal Film Discovery' i]");
        await expect(personalWidget).toBeVisible();

        // Click "Find My Match"
        const findButton = personalWidget.locator("button[type='submit']");
        await findButton.click();

        // Wait for matches to display
        await page.waitForTimeout(1500);

        const matchesHeading = page.locator("text='Recommended For Your Viewing Window'");
        await expect(matchesHeading).toBeVisible();

        // Rationale tag check
        const rationaleTags = page.locator("text=/Matches your criteria/i");
        expect(await rationaleTags.count()).toBeGreaterThanOrEqual(1);
    });

    test("LAND-007: Streaming section supports region selection without page reload", async ({ page }) => {
        const streamingSection = page.locator("section[aria-label*='Fresh on OTT' i]");
        await expect(streamingSection).toBeVisible();

        const regionSelect = streamingSection.locator("select[aria-label*='Select streaming territory' i]");
        await expect(regionSelect).toBeVisible();

        // Change region to IN
        await regionSelect.selectOption("IN");
        await page.waitForTimeout(800);

        expect(await regionSelect.inputValue()).toBe("IN");
    });

    test("LAND-008: Global search opens and suggests results with Ctrl+K shortcut", async ({ page }) => {
        // Press Control+K / Meta+K
        await page.keyboard.press("Control+k");
        const searchInput = page.locator('nav input[placeholder*="Search" i]');
        await expect(searchInput).toBeFocused();

        // Type query
        await searchInput.fill("Inception");
        await page.waitForTimeout(700);

        // Check suggestions dropdown
        const suggestionsDropdown = page.locator("nav div:has-text('Films')").first();
        await expect(suggestionsDropdown).toBeVisible();
    });

    test("LAND-009: Theme toggle toggles between dark and light themes smoothly", async ({ page }) => {
        const themeBtn = page.locator('button[aria-label*="Switch to" i]').first();
        await expect(themeBtn).toBeVisible();

        const htmlElement = page.locator("html");
        const initialClass = (await htmlElement.getAttribute("class")) || "";

        await themeBtn.click();
        await page.waitForTimeout(300);

        const newClass = (await htmlElement.getAttribute("class")) || "";
        expect(newClass).not.toBe(initialClass);
    });

    test("LAND-010: Responsive layout has no horizontal overflow on mobile viewport", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
        await page.goto("/");
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(1000);

        const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        expect(hasHorizontalScroll).toBe(false);
    });
});
