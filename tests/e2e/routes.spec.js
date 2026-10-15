
import { test, expect } from "@playwright/test";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/about",
  "/about-us",
  "/community",
  "/community-guidelines",
  "/privacy",
  "/privacy-policy",
  "/terms",
  "/terms-of-service",
];

const protectedRoutes = [
  "/dashboard",
  "/movies",
  "/movies/969681",
  "/movies/969681/review",
  "/trending",
  "/new-releases",
  "/genres",
  "/mywatchedfilms",
  "/what-to-watch",
  "/box-prediction",
  "/favorites",
  "/watchlist",
  "/write_review",
  "/myreviews",
  "/person/287",
  "/diary",
  "/analytics",
  "/wrapped",
  "/stats",
  "/cinematch",
  "/match",
  "/lists",
  "/lists/1",
  "/social",
  "/notifications",
  "/profile",
  "/profile/test-user",
  "/settings/profile",
  "/data-migration",
  "/import-export",
  "/more",
  "/people",
  "/movies-by-languages",
  "/movies-language",
  "/languages/en",
  "/language/en",
];

test.describe("Public route smoke tests", () => {
  for (const route of publicRoutes) {
    test(`${route} loads without an uncaught JavaScript error`, async ({
      page,
    }) => {
      const pageErrors = [];

      page.on("pageerror", (error) => {
        pageErrors.push(error.message);
      });

      const response = await page.goto(route, {
        waitUntil: "domcontentloaded",
      });

      expect(response, `No document response for ${route}`).not.toBeNull();
      expect(
        response.status(),
        `Unexpected HTTP status for ${route}`,
      ).toBeLessThan(400);

      await expect(page.locator("body")).toBeVisible();

      expect(
        await page.locator("body").innerText(),
        `Page appears empty: ${route}`,
      ).toMatch(/\S/);

      expect(pageErrors, `JavaScript errors on ${route}`).toEqual([]);
    });
  }
});

test.describe("Protected route authentication checks", () => {
  for (const route of protectedRoutes) {
    test(`${route} redirects logged-out visitors to login`, async ({
      page,
    }) => {
      await page.goto(route, {
        waitUntil: "domcontentloaded",
      });

      await expect
        .poll(() => new URL(page.url()).pathname)
        .toBe("/login");

      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test("unknown routes follow the configured fallback", async ({ page }) => {
  await page.goto("/this-route-should-not-exist", {
    waitUntil: "domcontentloaded",
  });

  // The catch-all redirects to /dashboard, which is protected.
  await expect
    .poll(() => new URL(page.url()).pathname)
    .toBe("/login");
});
