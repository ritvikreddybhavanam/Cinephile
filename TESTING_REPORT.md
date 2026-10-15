# Cinephile Test Automation & Quality Assurance Report

**Date:** 2026-10-11  
**Project:** Cinephile (Film Buff) Full-Stack Web Application  
**Test Framework:** Playwright v1.50+ (`@axe-core/playwright` for automated WCAG accessibility)  
**Target Environments:**
- `chromium-desktop` (1280x720)
- `chromium-mobile` (iPhone 12, 390x844)
- `chromium-tablet` (iPad Gen 7, 810x1080)

---

## 1. Executive Summary

A comprehensive automated end-to-end testing, accessibility audit, and bug remediation cycle was performed across the Cinephile platform. The test suite evaluates all user journeys, route access controls, interactive components, predictive analytics, film catalog interactions, responsive layouts, and accessibility standards.

### Test Execution Overview

| Project | Total Discovered | Passed | Skipped | Failed | Pass Rate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **chromium-desktop** | 80 | 79 | 1 (`DASH-004` viewport check) | 0 | **100%** |
| **chromium-mobile** | 80 | 80 | 0 | 0 | **100%** |
| **chromium-tablet** | 80 | 79 | 1 (`DASH-004` viewport check) | 0 | **100%** |
| **Overall Suite** | **240** | **238** | **2** | **0** | **100%** |

---

## 2. Infrastructure & Service Verification

Prior to test execution, all core microservices and backing databases were verified active and communicating:

1. **Frontend Web Client:** React 19 + Vite (`http://localhost:5173`) - Operational
2. **Backend Application Server:** Spring Boot 3.4.1 (`http://localhost:8080`) - Operational
3. **Database Layer:** MySQL `film_buff` (`localhost:3306`) - Operational
4. **Machine Learning Service:** FastAPI Box Office Regression Engine (`http://localhost:8000`) - Operational

---

## 3. Discovered Defects, Root Causes & Fixes Applied

### Defect 1: PRED-002 Mobile Search Input Obstruction
- **Test Case:** `tests/e2e/prediction.spec.js` › `PRED-002: Prediction calculation triggers when inputs are submitted`
- **Symptom:** In mobile viewport (`chromium-mobile`), the budget input selector `'input[type="number"], input'` matched the global Navbar search bar instead of the Box Office form input. Typing the budget triggered the autocomplete dropdown at `z-[100]`, which physically obscured the "Predict Box Office Revenue" submission button and failed pointer action clicks.
- **Root Cause:** Insufficiently scoped locator in `prediction.spec.js` selecting the first generic input rather than scoping inside the form (`main form input[placeholder*="budget" i]`).
- **Fix:** Refined locator to target `main form input[placeholder*="budget" i], main form input` and added `.scrollIntoViewIfNeeded()` prior to clicking the predict button.
- **Verification:** 100% passed across all 3 viewports (`chromium-desktop`, `chromium-mobile`, `chromium-tablet`).

### Defect 2: Strict-Mode Locator Ambiguities in Dashboard Testing
- **Test Case:** `tests/e2e/dashboard.spec.js` › `DASH-001` & `DASH-003`
- **Symptom:** `locator('text=Watchlist')` and `locator('text=What to Watch')` resolved to multiple elements simultaneously (e.g. Navbar links vs. Dashboard Cinema Stats widgets).
- **Fix:** Scoped selectors to specific DOM sections: `main a[href="/watchlist"]` and `page.locator('main').getByText('What to Watch').first()`.
- **Verification:** 100% pass across all execution runs.

---

## 4. Test Catalog & Coverage Inventory

### 4.1 Accessibility (`tests/accessibility/`)
- **`axe.spec.js` (A11Y-001 - A11Y-003)**:
  - Homepage WCAG 2.1 AA automated compliance scan (0 violations).
  - Search keyboard shortcut badge (`⌘K`) contrast ratio exceeds 4.5:1 requirement.
  - Light and Dark mode color contrast standards verified.
- **`layout.spec.js` (LAYOUT-001 - LAYOUT-004)**:
  - Responsive layout integrity: no horizontal scrollbar overflow across desktop, mobile, and tablet viewports.
  - Responsive navbar collapses into accessible mobile drawer on viewports `< 640px`.

### 4.2 Authentication & Protection (`tests/e2e/auth.spec.js` & `tests/e2e/routes.spec.js`)
- **Login, Registration, Form Validation**: Tested email/password input, error messages, and successful credential submissions.
- **Route Guards (32 test cases)**: Verified that unauthenticated access to protected routes (`/dashboard`, `/profile`, `/diary`, `/lists`, `/watchlist`, `/favorites`, `/settings`, `/data-migration`, `/import-export`) redirects cleanly to `/login` with proper return URL preservation.
- **Fallback Route Handling**: Confirmed 404 / NotFound routing handles unexpected URLs gracefully.

### 4.3 Discovery, Search & Catalog (`tests/e2e/discovery.spec.js` & `tests/e2e/homepage.spec.js`)
- **Homepage**: Hero banners, Trending, Popular Films, Mood Selector, Film Spotlight, and Community Reviews sections render with active TMDB metadata.
- **Live Search**: Debounced keystroke querying, suggestion dropdown display, keyboard navigation (`Enter` and shortcut focus), and search-results routing.
- **Filters & Sorting**: Category toggles, genre chips, and pagination controls.

### 4.4 User Library & Diary (`tests/e2e/library.spec.js`)
- **Watchlist & Favorites**: Adding/removing movies from user lists, tab filtering, and persistence across user sessions.
- **Film Diary**: Timestamped entry logging and review presentation.

### 4.5 User Dashboard (`tests/e2e/dashboard.spec.js`)
- **DASH-001**: Hero featured movie banner and Cinema Stats cards (Movies Watched, Movies Rated, Reviews Written, Watchlist count).
- **DASH-002**: Interactive "Quick Log" modal with live movie search and rating selection.
- **DASH-003**: Personal recommendations and discovery shortcut tiles.
- **DASH-004**: Mobile hamburger drawer interactions.

### 4.6 Machine Learning Prediction (`tests/e2e/prediction.spec.js`)
- **PRED-001**: Model parameters input form (Budget, Runtime, Genre checkboxes, Seasonality).
- **PRED-002**: Live ML inference query against FastAPI engine (`http://localhost:8000/predict`), returning predicted box office earnings and visual confidence metrics.

---

## 5. Artifacts and Reports

Detailed test traces, screenshots, video captures, and report files are saved at:
- **Plain-text Report:** `docs/qa/reports/latest-test-report.txt`
- **Playwright HTML Report:** `playwright-report/index.html` (Run `npx playwright show-report` to view)
- **Failure Artifacts:** None (all test runs clean and green)
