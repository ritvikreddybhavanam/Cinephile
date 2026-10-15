import { test, expect } from "@playwright/test";

test("inventory of the Cinephile homepage", async ({ page }) => {
  const pageErrors = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  const response = await page.goto("/", {
    waitUntil: "domcontentloaded",
  });

  expect(response).not.toBeNull();
  expect(response.status()).toBeLessThan(400);

  await expect(page.locator("body")).toBeVisible();

  const inventory = await page.evaluate(() => ({
    title: document.title,
    url: location.href,

    headings: [...document.querySelectorAll("h1, h2, h3")]
      .map((element) => element.innerText.trim())
      .filter(Boolean),

    links: [...document.querySelectorAll("a")]
      .map((element) => ({
        text: element.innerText.trim(),
        href: element.getAttribute("href"),
      }))
      .filter((element) => element.text || element.href),

    buttons: [...document.querySelectorAll("button")]
      .map((element) => ({
        text: element.innerText.trim(),
        ariaLabel: element.getAttribute("aria-label"),
        disabled: element.disabled,
      })),

    inputs: [...document.querySelectorAll("input, textarea, select")]
      .map((element) => ({
        tag: element.tagName,
        type: element.getAttribute("type"),
        name: element.getAttribute("name"),
        placeholder: element.getAttribute("placeholder"),
        ariaLabel: element.getAttribute("aria-label"),
      })),

    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

  console.log(
    "\nCINEPHILE INVENTORY:\n",
    JSON.stringify(inventory, null, 2)
  );

  console.log("\nJAVASCRIPT ERRORS:\n", pageErrors);
});
