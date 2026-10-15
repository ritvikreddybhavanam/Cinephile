import { test, expect } from "@playwright/test";

test("Cinephile homepage loads successfully", async ({ page }) => {
  const pageErrors = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  const response = await page.goto("/");

  expect(response).not.toBeNull();
  expect(response.status()).toBeLessThan(400);

  await expect(page.locator("body")).toBeVisible();

  await page.waitForLoadState("domcontentloaded");

  expect(pageErrors).toEqual([]);
});