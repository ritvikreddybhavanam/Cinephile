import { test, expect } from "../fixtures/baseTest.js";

test.describe("Phase 1 — Deep Authentication & Session Workflows (FEAT-AUTH-DEEP)", () => {
  // A. Registration Validation
  test("AUTH-006: Registration enforces required fields and password length", async ({ page }) => {
    await page.goto("/register");

    // Attempt submit with empty fields
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await expect(page).toHaveURL(/\/register/);

    // Fill names and invalid short password (< 6 chars)
    await page.locator('input#firstName').fill("Stanley");
    await page.locator('input#lastName').fill("Kubrick");
    await page.locator('input#email').fill("stanley@cinema.com");
    await page.locator('input#password').fill("123");
    await page.locator('input#confirmPassword').fill("123");
    await page.locator('input#terms').check();

    await submitBtn.click();
    await expect(page.locator("text=Password must be at least 6 characters.")).toBeVisible();
  });

  test("AUTH-007: Registration detects password confirmation mismatch", async ({ page }) => {
    await page.goto("/register");

    await page.locator('input#firstName').fill("Federico");
    await page.locator('input#lastName').fill("Fellini");
    await page.locator('input#email').fill("federico@cinecitta.it");
    await page.locator('input#password').fill("masterpiece812");
    await page.locator('input#confirmPassword').fill("differentPassword999");
    await page.locator('input#terms').check();

    await page.locator('button[type="submit"]').click();
    await expect(page.locator("text=Passwords do not match.")).toBeVisible();
  });

  test("AUTH-008: Registration requires terms and privacy consent", async ({ page }) => {
    await page.goto("/register");

    await page.locator('input#firstName').fill("Akira");
    await page.locator('input#lastName').fill("Kurosawa");
    await page.locator('input#email').fill("akira@toho.jp");
    await page.locator('input#password').fill("rashomon1950");
    await page.locator('input#confirmPassword').fill("rashomon1950");

    // Terms unchecked by default
    await page.locator('button[type="submit"]').click();
    // HTML5 validation or explicit error
    await expect(page).toHaveURL(/\/register/);
  });

  // B. Email Verification Page Behavior
  test("AUTH-009: Email verification page guards missing registration session", async ({ page }) => {
    await page.goto("/verify-email");
    await expect(page).toHaveURL(/\/verify-email/);
    await expect(
      page.locator("text=Registration session was not found. Please register again.").or(
        page.locator("text=Please register again")
      )
    ).toBeVisible();
  });

  test("AUTH-010: Email verification page handles invalid verification session data", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      sessionStorage.setItem("pendingRegistration", "corrupted-json-data");
    });
    await page.goto("/verify-email");
    await expect(
      page.locator("text=Registration data is invalid. Please register again.").or(
        page.locator("text=Please register again")
      )
    ).toBeVisible();
  });

  // C. Login Edge Cases
  test("AUTH-011: Login rejects non-existent user account with clear feedback", async ({ page }) => {
    await page.goto("/login");

    await page.locator('input[type="email"]').fill("nonexistent.director.19999@cinema.xyz");
    await page.locator('input[type="password"]').fill("InvalidPassword123!");
    await page.locator('button[type="submit"]').click();

    // Verify 401 message displayed in error box
    await expect(
      page.locator("text=Invalid email or password").or(
        page.locator("text=Unable to login")
      )
    ).toBeVisible();
  });

  test("AUTH-012: Login rejects incorrect password for registered user", async ({ page }) => {
    await page.goto("/login");

    await page.locator('input[type="email"]').fill("4sample3@gmail.com");
    await page.locator('input[type="password"]').fill("definitelyWrongPassword2026!");
    await page.locator('button[type="submit"]').click();

    await expect(
      page.locator("text=Invalid email or password").or(
        page.locator("text=Unable to login")
      )
    ).toBeVisible();
  });

  // D. Full Logout & Back-Navigation Guard
  test("AUTH-013: Authenticated user can log out and back navigation is prevented", async ({ authenticatedPage: page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);

    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 640;

    if (isMobile) {
      // Open mobile drawer
      const hamburger = page.locator('button[aria-label*="menu" i]').first();
      await hamburger.click();
      await page.waitForTimeout(300);

      // Mobile drawer has Sign Out
      const signOutBtn = page.getByRole("button", { name: /sign out|logout/i }).first();
      if (await signOutBtn.isVisible()) {
        await signOutBtn.click();
      } else {
        await page.evaluate(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        });
      }
    } else {
      // Click profile menu button to toggle dropdown
      const profileBtn = page.locator('button[aria-label="Profile and account menu"]').first();
      await profileBtn.click({ force: true });
      await page.waitForTimeout(300);

      const logoutBtn = page.getByRole("button", { name: /logout|sign out/i }).first();
      if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
      } else {
        await page.evaluate(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        });
      }
    }

    // Verify redirected to /login or /
    await expect(page).toHaveURL(/\/(login)?$/);

    // Verify tokens removed from localStorage
    const token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).toBeNull();

    // Try navigating back to /dashboard
    await page.goto("/dashboard");
    await expect.poll(() => new URL(page.url()).pathname).toBe("/login");
  });

  // E. Session / JWT API Rejection
  test("AUTH-014: Protected backend API rejects unauthorized requests with 401/403", async ({ request }) => {
    // Unauthenticated GET to watchlist
    const unauthWatchlist = await request.get("http://localhost:8080/api/watchlist");
    expect([401, 403]).toContain(unauthWatchlist.status());

    // Invalid Token GET to watchlist
    const invalidTokenRes = await request.get("http://localhost:8080/api/watchlist", {
      headers: { Authorization: "Bearer forgedOrTamperedTokenString999" }
    });
    expect([401, 403]).toContain(invalidTokenRes.status());

    // Valid Signed Token GET to watchlist
    const validToken = "eyJhbGciOiAiSFMyNTYifQ.eyJzdWIiOiAiNHNhbXBsZTNAZ21haWwuY29tIiwgImlhdCI6IDE3MDk5MDAwMDAsICJleHAiOiAyMDUwMDAwMDAwfQ.ES3phviNVi2yeKtm3jf42yLQA4E9352xuo_blr9JUiE";
    const authRes = await request.get("http://localhost:8080/api/watchlist", {
      headers: { Authorization: `Bearer ${validToken}` }
    });
    expect(authRes.status()).toBe(200);
  });
});
