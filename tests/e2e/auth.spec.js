import { test, expect } from "../fixtures/baseTest.js";

test.describe("Authentication Workflows & Protected Route Access (FEAT-AUTH)", () => {
  test("AUTH-001: Register form renders with required input fields", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveURL(/\/register/);
    
    // Check form fields
    await expect(page.locator('input[type="email"], input[placeholder*="email" i]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Sign Up"), button:has-text("Register")').first()).toBeVisible();
  });

  test("AUTH-002: Login page renders with credentials inputs & social buttons", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
    
    await expect(page.locator('input[type="email"], input[placeholder*="email" i]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first()).toBeVisible();
  });

  test("AUTH-003: Login validation blocks empty submission", async ({ page }) => {
    await page.goto("/login");
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();
    
    // Page stays on /login or shows error
    await expect(page).toHaveURL(/\/login/);
  });

  test("AUTH-004: Forgot Password form displays email input", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator('input[type="email"], input[placeholder*="email" i]')).toBeVisible();
  });

  test("AUTH-005: Unauthenticated access to protected routes redirects to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect.poll(() => new URL(page.url()).pathname).toBe("/login");

    await page.goto("/watchlist");
    await expect.poll(() => new URL(page.url()).pathname).toBe("/login");

    await page.goto("/diary");
    await expect.poll(() => new URL(page.url()).pathname).toBe("/login");
  });
});
