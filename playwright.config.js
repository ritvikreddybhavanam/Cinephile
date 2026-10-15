import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",

  fullyParallel: false,
  workers: process.env.CI ? 2 : 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,

  reporter: [
    ["list"],
    ["html", { outputFolder: "docs/qa/reports/html", open: "never" }],
    ["./tests/reporters/PlainTextReporter.js", {
      outputFile: "docs/qa/reports/latest-test-report.txt",
      screenshotDir: "docs/qa/reports/screenshots"
    }]
  ],

  timeout: 30_000,
  expect: {
    timeout: 7_000,
  },

  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-mobile",
      use: { ...devices["iPhone 13"] },
    },
    {
      name: "chromium-tablet",
      use: {
        ...devices["iPad (gen 7)"],
      },
    },
  ],

  webServer: [
    {
      command: "npm run dev -- --host 127.0.0.1",
      cwd: "./frontend",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
