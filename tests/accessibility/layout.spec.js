import { test, expect } from "@playwright/test";

test("homepage has no horizontal overflow", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect.poll(async () => {
    return page.evaluate(() => {
      return document.documentElement.scrollWidth
        <= document.documentElement.clientWidth;
    });
  }).toBe(true);
});

test("homepage controls have accessible names", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const unnamedControls = await page.evaluate(() => {
    const controls = [
      ...document.querySelectorAll("button, a, input, select, textarea"),
    ];

    return controls
      .filter((element) => {
        if (element.type === "hidden") return false;

        const label = [
          element.innerText,
          element.getAttribute("aria-label"),
          element.getAttribute("title"),
          element.labels
            ? [...element.labels].map((item) => item.innerText).join(" ")
            : "",
          element.getAttribute("alt"),
        ]
          .join(" ")
          .trim();

        return !label;
      })
      .map((element) => ({
        tag: element.tagName,
        type: element.getAttribute("type"),
        html: element.outerHTML.slice(0, 200),
      }));
  });

  console.log("Controls without accessible names:", unnamedControls);

  expect(unnamedControls).toEqual([]);
});
