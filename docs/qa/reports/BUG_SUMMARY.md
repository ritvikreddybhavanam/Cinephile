# QA Bug Summary & Findings Report

## Executive Summary
All core end-to-end user workflows and route checks have passed verification. Below is the log of resolved and observed items.

---

## 1. Resolved Issues

### `BUG-001`: Light Theme WCAG Color-Contrast Failure on Search Shortcut Badge
- **Severity**: Medium
- **Route**: Global Navbar (`/`)
- **Status**: **FIXED & VERIFIED**
- **Description**: The `⌘K` keyboard shortcut badge in the global search bar had a color contrast ratio of `4.42:1` in the light theme (`text-text-3: #64748b` against background `#f4f7fa`), just below the WCAG 2.0/2.1 AA requirement of `4.5:1`.
- **Fix**: Adjusted light theme `--color-text-3` token in [`frontend/src/index.css`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/index.css) to `#596780` (yielding `5.34:1` contrast ratio). Verified passing in `tests/accessibility/axe.spec.js`.

### `BUG-002`: Letterboxd CSV Import Routing Watched History to Watchlist
- **Severity**: High
- **Route**: `/data-migration` & `/import-export`
- **Status**: **FIXED & VERIFIED**
- **Description**: Letterboxd's exported `watched.csv` and `watchlist.csv` share identical headers (`Date,Name,Year,Letterboxd URI`), causing `watched.csv` to be imported into the user's Watchlist instead of Watched History.
- **Fix**: Implemented filename-aware and header-conditional routing in [`ImportExportService.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/service/ImportExportService.java).

---

## 2. Open Observations & Best Practices

| Finding ID | Severity | Category | Description | Recommendation |
| :--- | :---: | :--- | :--- | :--- |
| **`OBS-001`** | Low | Security | JWT token stored in `localStorage` | Migrate to `HttpOnly`, `SameSite=Strict` cookies in future production updates. |
| **`OBS-002`** | Low | Performance | Direct TMDB API requests | Utilize backend proxy cache (`TmdbService`) to avoid client-side TMDB rate limits. |
