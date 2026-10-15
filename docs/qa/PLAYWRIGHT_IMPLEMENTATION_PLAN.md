# Playwright Architecture & Implementation Plan

## 1. Directory Structure

Recommended structure for writing maintainable, scalable Playwright E2E tests:

```
tests/
├── accessibility/           # Axe-core WCAG audits
│   ├── axe.spec.js
│   └── layout.spec.js
├── fixtures/                # Custom Playwright fixtures & test users
│   ├── auth.fixture.js
│   └── mock-tmdb.fixture.js
├── page-objects/            # Page Object Model (POM) classes
│   ├── LoginPage.js
│   ├── RegisterPage.js
│   ├── NavbarComponent.js
│   ├── MovieDetailsPage.js
│   ├── WatchedFilmsPage.js
│   ├── WatchlistPage.js
│   ├── DiaryPage.js
│   └── BoxOfficePage.js
├── e2e/                     # Functional test specs by module
│   ├── auth.spec.js
│   ├── discovery.spec.js
│   ├── movie-details.spec.js
│   ├── library.spec.js
│   ├── diary.spec.js
│   ├── reviews.spec.js
│   ├── curated-lists.spec.js
│   ├── prediction.spec.js
│   └── data-migration.spec.js
└── global-setup.js          # Authentication state generation
```

---

## 2. Page Object Model (POM) Design Example

### `LoginPage.js`
```javascript
export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[name="emailaddress"], input[type="email"]');
    this.passwordInput = page.locator('input[name="password"], input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorBanner = page.locator('.bg-red-500, .border-red-500, .text-error');
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

---

## 3. Playwright Custom Fixtures

### `auth.fixture.js`
```javascript
import { test as base } from "@playwright/test";

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Inject mock JWT token to bypass login for protected test flows
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("token", "mock-valid-jwt-token-for-testing");
      localStorage.setItem("user", JSON.stringify({
        id: 1,
        username: "qa_tester",
        emailaddress: "qa@cinephile.test",
        firstname: "QA",
        lastname: "Tester"
      }));
    });
    await use(page);
  }
});

export { expect } from "@playwright/test";
```

---

## 4. Test Execution Commands & CI Pipeline

Add these script targets to `package.json`:

```bash
# Run all end-to-end tests
npx playwright test

# Run tests in headed browser mode with DevTools
npx playwright test --headed

# Run only P0 Critical Smoke Tests
npx playwright test --grep "@smoke|P0"

# Run tests across mobile devices (iPhone 13, iPad)
npx playwright test --project=chromium-mobile

# Generate and view interactive HTML report with video/traces
npx playwright show-report
```
