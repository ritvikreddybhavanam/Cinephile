# Playwright Automated Testing Execution Report

## 1. Overview
The Cinephile automated testing framework is powered by **Playwright Test** and extended with a custom **`PlainTextReporter`**, an interactive **HTML Reporter**, and automated **failure screenshot capture**.

- **Plain-Text Report**: [`docs/qa/reports/latest-test-report.txt`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/docs/qa/reports/latest-test-report.txt)
- **Interactive HTML Report**: [`docs/qa/reports/html/index.html`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/docs/qa/reports/html/index.html)
- **Failure Screenshots**: [`docs/qa/reports/screenshots/`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/docs/qa/reports/screenshots/)

---

## 2. Test Execution Commands

```bash
# Run all end-to-end and route tests
npm run test:e2e

# Run core smoke suite (auth & homepage)
npm run test:e2e:smoke

# Run tests in headed browser mode
npm run test:e2e:headed

# Open interactive Playwright UI
npm run test:e2e:ui

# Open generated HTML report in browser
npm run test:e2e:report

# Run accessibility audits (axe-core)
npm run test:accessibility
```

---

## 3. Test Suites & Coverage

| Test Spec File | Module / Area Covered | Status |
| :--- | :--- | :---: |
| [`tests/e2e/auth.spec.js`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/tests/e2e/auth.spec.js) | Register, login, forgot password, route guards | **Passed** |
| [`tests/e2e/homepage.spec.js`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/tests/e2e/homepage.spec.js) | Homepage load & console error monitoring | **Passed** |
| [`tests/e2e/discovery.spec.js`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/tests/e2e/discovery.spec.js) | Navbar search, movies catalog, filters, languages | **Passed** |
| [`tests/e2e/movie-details.spec.js`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/tests/e2e/movie-details.spec.js) | Movie details, credits, cast, reviews | **Passed** |
| [`tests/e2e/library.spec.js`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/tests/e2e/library.spec.js) | Watched films, watchlist, favorites, diary | **Passed** |
| [`tests/e2e/prediction.spec.js`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/tests/e2e/prediction.spec.js) | Box office revenue predictor (FastAPI ML) | **Passed** |
| [`tests/e2e/routes.spec.js`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/tests/e2e/routes.spec.js) | 14 public routes, 35 protected route redirects | **Passed** |
| [`tests/accessibility/axe.spec.js`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/tests/accessibility/axe.spec.js) | WCAG 2.0 / 2.1 AA automated accessibility audit | **Passed** |
