import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("homepage accessibility audit", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const results = await new AxeBuilder({ page })
    .withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
    ])
    .analyze();

  for (const violation of results.violations) {
    console.log(`\nViolation: ${violation.id}`);
    console.log(`Impact: ${violation.impact}`);
    console.log(`Description: ${violation.description}`);

    for (const node of violation.nodes) {
      console.log("Element:", node.target);
      console.log("Fix guidance:", node.failureSummary);
    }
  }

  expect(
    results.violations,
    "Fix the accessibility violations reported by axe."
  ).toEqual([]);
});
