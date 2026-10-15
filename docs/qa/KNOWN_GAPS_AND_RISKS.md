# Known Gaps, Risks & Security Observations

## 1. Security & Authorization Observations

1. **Client-Side Storage of JWT**:
   - **Finding**: JWT token is stored in `localStorage.token`.
   - **Risk**: Susceptible to XSS attacks if third-party scripts or untrusted HTML strings are injected.
   - **Recommendation**: For enhanced security, migrate to `HttpOnly`, `SameSite=Strict`, `Secure` cookies.

2. **CORS Wildcard Configuration**:
   - **Finding**: In [`SecurityConfig.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/config/SecurityConfig.java#L170-L180), `allowedOriginPatterns` allows `*` alongside `allowCredentials(true)`.
   - **Risk**: Broad cross-origin access in local development environments.
   - **Recommendation**: Restrict allowed origins strictly to known production domains in staging/production profiles.

3. **Backend Authorization Verification**:
   - **Finding**: Some endpoints rely on resolving user email from `Authentication.getName()` or fallback Authorization header parsing.
   - **Observation**: Ensure all mutating endpoints (`DELETE`, `PUT`) explicitly verify entity ownership before deleting records (e.g. users should only delete their own reviews or lists).

---

## 2. Validation & Contract Discrepancies

1. **Rating Scale Harmonization**:
   - **Observation**: TMDB uses a `0.0 – 10.0` rating scale, whereas Cinephile's review and star rating UI displays a `0.0 – 5.0` star system.
   - **Handling**: Ensure frontend transforms TMDB ratings (`vote_average / 2`) and backend scales appropriately during import/export without floating point rounding errors.

2. **Letterboxd Import CSV Column Detection**:
   - **Observation**: Letterboxd's exported `watched.csv` and `watchlist.csv` share identical headers (`Date,Name,Year,Letterboxd URI`).
   - **Handling**: Handled via filename-aware matching in [`ImportExportService.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/service/ImportExportService.java).

---

## 3. Reliability & Flakiness Mitigations in E2E Tests

1. **Third-Party Rate Limits (TMDB)**:
   - Automated test suites running 50+ tests concurrently could trigger TMDB rate limits.
   - **Fix**: Utilize server-side caching or Playwright network routing (`page.route()`) in CI.

2. **Async Image Loading**:
   - Poster images load from `https://image.tmdb.org`.
   - **Fix**: Use `locator.toBeVisible()` on text titles or container elements rather than waiting on external CDN image byte completion.
