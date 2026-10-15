import { test as base, expect } from "@playwright/test";

/**
 * Extended Playwright Test Fixture with error monitoring & auth mocking
 */
export const test = base.extend({
  // Auto fixture that monitors browser errors, uncaught exceptions & API failures
  page: async ({ page }, use, testInfo) => {
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push({
          text: msg.text(),
          location: msg.location(),
          time: new Date().toISOString()
        });
      }
    });

    page.on("pageerror", (err) => {
      pageErrors.push({
        message: err.message,
        stack: err.stack,
        time: new Date().toISOString()
      });
    });

    page.on("requestfailed", (request) => {
      const url = request.url();
      // Filter out harmless aborted requests or optional analytics
      if (!url.includes("favicon.ico") && !url.includes("analytics")) {
        failedRequests.push({
          url: request.url(),
          method: request.method(),
          failure: request.failure()?.errorText || "Unknown failure",
          time: new Date().toISOString()
        });
      }
    });

    await use(page);

    // If test failed, attach captured errors to test artifacts
    if (testInfo.status !== testInfo.expectedStatus) {
      if (consoleErrors.length > 0) {
        testInfo.attach("browser-console-errors", {
          body: JSON.stringify(consoleErrors, null, 2),
          contentType: "application/json"
        });
      }
      if (pageErrors.length > 0) {
        testInfo.attach("uncaught-page-errors", {
          body: JSON.stringify(pageErrors, null, 2),
          contentType: "application/json"
        });
      }
      if (failedRequests.length > 0) {
        testInfo.attach("failed-network-requests", {
          body: JSON.stringify(failedRequests, null, 2),
          contentType: "application/json"
        });
      }
    }
  },

  // Authenticated page fixture: injects user token in localStorage
  authenticatedPage: async ({ page }, use) => {
    // Navigate to root to set origin, then inject token into localStorage
    await page.goto("/");
    await page.evaluate(() => {
      const dbUser = {
        id: 1,
        username: "4sample3",
        emailaddress: "4sample3@gmail.com",
        firstname: "Ritvik",
        lastname: "Reddy"
      };
      // Real HMAC-SHA256 signed token for Spring Boot JwtService
      const validToken = "eyJhbGciOiAiSFMyNTYifQ.eyJzdWIiOiAiNHNhbXBsZTNAZ21haWwuY29tIiwgImlhdCI6IDE3MDk5MDAwMDAsICJleHAiOiAyMDUwMDAwMDAwfQ.ES3phviNVi2yeKtm3jf42yLQA4E9352xuo_blr9JUiE";
      localStorage.setItem("token", validToken);
      localStorage.setItem("user", JSON.stringify(dbUser));
    });
    // Reload so AuthProvider state initializes with stored credentials
    await page.reload();
    await use(page);
  }
});

export { expect };
