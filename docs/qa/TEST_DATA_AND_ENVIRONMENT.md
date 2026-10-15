# Test Data, Environments & Mocking Strategy

## 1. Test Environment Matrix

| Environment | Purpose | Database | TMDB API | ML Service |
| :--- | :--- | :--- | :--- | :--- |
| **Local Dev** | Developer interactive testing | Local MySQL (`film_buff`) | Real TMDB with server caching | Local FastAPI (Port 8000) |
| **Hermetic E2E (CI)** | Automated pull request test suite | Test MySQL (`film_buff_test`) or TestContainers | Mocked via Playwright `page.route()` | Mocked API routes |
| **Staging / QA** | Full integration validation | Dedicated staging DB | Real TMDB | Staging ML Cluster |

---

## 2. Test User Accounts & Isolation Strategy

To prevent test collision during parallel Playwright runs:
1. **Dynamic User Seeding**: Generate unique test users for each test runner using UUIDs:
   - Email pattern: `qa-user-{timestamp}-{random}@cinephile-test.local`
   - Password: `TestPassword123!`
2. **Dedicated Test Accounts**:
   - Primary Verified User: `qa.verified@cinephile.test`
   - Secondary Follower User: `qa.social@cinephile.test`
3. **Storage State Reuse**: Authenticate once in a `global-setup.js` step to save `playwright/.auth/user.json` with JWT token in `localStorage`, bypassing repetitive login screens for non-auth tests.

---

## 3. Mocking Strategy with Playwright

Playwright provides native request interception (`page.route()`) without modifying application code.

### 3.1 TMDB External API Mocking
Intercept requests to prevent third-party rate limiting during automated testing:

```javascript
// Intercept TMDB trending movies endpoint
await page.route("**/api/tmdb/trending*", async (route) => {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      page: 1,
      results: [
        {
          id: 157336,
          title: "Interstellar",
          poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
          vote_average: 8.6,
          release_date: "2014-11-05",
          genre_ids: [12, 18, 878]
        }
      ],
      total_pages: 10,
      total_results: 200
    })
  });
});
```

### 3.2 Machine Learning Prediction Mocking
When testing frontend box office graphs independently of Python runtime:

```javascript
await page.route("**/api/prediction/predict", async (route) => {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      title: "Avatar 3",
      predicted_revenue: 1850000000.0,
      predicted_revenue_millions: 1850.0
    })
  });
});
```

---

## 4. Test Data Cleanup & Reset Guidelines

- **Never truncate production or live development databases without authorization.**
- In CI pipelines, use ephemeral database containers (`testcontainers-java` or fresh MySQL Docker service) that are torn down upon test completion.
- When creating transient test entities (such as reviews or custom lists), use the respective `DELETE /api/lists/{id}` or `DELETE /api/diary/{id}` endpoints in `test.afterEach()` hooks.
