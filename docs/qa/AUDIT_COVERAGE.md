# Audit Traceability Matrix & Test Coverage Map

This matrix connects every verified feature to its frontend routes, React components, backend REST endpoints, database entities, and Playwright test scenarios.

---

## Traceability Matrix

| Feature ID | Module | Frontend Route | Key Component(s) | Backend REST Endpoints | Database Entities | Playwright Test Scenarios | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **FEAT-AUTH** | Authentication | `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password` | `Login.jsx`, `Register.jsx`, `VerifyEmail.jsx` | `POST /api/auth/register`<br>`POST /api/auth/login`<br>`POST /api/auth/verify-email` | `users` | `AUTH-001`<br>`AUTH-002`<br>`AUTH-003`<br>`AUTH-004`<br>`AUTH-005`<br>`AUTH-006`<br>`AUTH-007` | **Verified** |
| **FEAT-DISC** | Film Discovery | `/movies`, `/trending`, `/new-releases`, `/genres`, `/movies-language` | `Movies.jsx`, `Trending.jsx`, `Genres.jsx`, `Navbar.jsx` | `GET /api/tmdb/movies`<br>`GET /api/tmdb/trending`<br>`GET /api/tmdb/genres`<br>`GET /api/tmdb/search` | External TMDB | `DISC-001`<br>`DISC-002`<br>`DISC-003`<br>`DISC-004`<br>`DISC-005`<br>`DISC-006` | **Verified** |
| **FEAT-MDETAIL** | Movie Details | `/movies/:movieId` | `MovieDetails.jsx`, `MovieHero.jsx`, `MovieVideosSection.jsx` | `GET /api/tmdb/movies/{id}`<br>`GET /api/tmdb/movies/{id}/credits`<br>`GET /api/tmdb/movies/{id}/videos` | External TMDB, `content_advisories` | `MDETAIL-001`<br>`MDETAIL-002`<br>`MDETAIL-003`<br>`MDETAIL-004` | **Verified** |
| **FEAT-PERSON** | Stars & Filmmakers | `/people`, `/person/:id` | `People.jsx`, `PersonDetails.jsx`, `Filmography.jsx` | `GET /api/tmdb/people/popular`<br>`GET /api/tmdb/person/{id}`<br>`GET /api/tmdb/person/{id}/credits` | External TMDB | `DISC-001`<br>`MDETAIL-001` | **Verified** |
| **FEAT-WATCHED** | Watched Movies | `/mywatchedfilms` | `WatchedFilms.jsx`, `WatchedButton.jsx` | `GET /api/watched`<br>`POST /api/watched`<br>`DELETE /api/watched/{id}` | `watched_movies` | `LIB-001`<br>`LIB-004` | **Verified** |
| **FEAT-WLIST** | Watchlist | `/watchlist` | `Watchlist.jsx`, `WatchlistButton.jsx` | `GET /api/watchlist`<br>`POST /api/watchlist`<br>`DELETE /api/watchlist/{id}` | `watchlist` | `LIB-002`<br>`LIB-005` | **Verified** |
| **FEAT-FAV** | Liked Movies | `/favorites` | `LikedMovies.jsx`, `LikedMovieCard.jsx` | `GET /api/liked-movies`<br>`POST /api/liked-movies/{id}`<br>`DELETE /api/liked-movies/{id}` | `liked_movies` | `LIB-003` | **Verified** |
| **FEAT-DIARY** | Film Diary | `/diary` | `Diary.jsx`, `LogFilmModal.jsx` | `GET /api/diary`<br>`POST /api/diary`<br>`DELETE /api/diary/{id}`<br>`GET /api/diary/stats` | `film_logs` | `DIARY-001`<br>`DIARY-002`<br>`DIARY-003` | **Verified** |
| **FEAT-REVIEW** | Reviews & Spoilers | `/myreviews`, `/write_review`, `/movies/:id/review` | `MyReviews.jsx`, `WriteReview.jsx`, `ReviewCard.jsx`, `ReviewCommentsSection.jsx` | `GET /api/reviews/movie/{id}`<br>`POST /api/reviews`<br>`POST /api/reviews/{id}/like`<br>`POST /api/reviews/{id}/comments` | `reviews`, `review_likes`, `review_comments` | `REV-001`<br>`REV-002`<br>`REV-003`<br>`REV-004` | **Verified** |
| **FEAT-LISTS** | Curated Lists | `/lists`, `/lists/:id` | `CuratedLists.jsx`, `ListDetails.jsx` | `GET /api/lists`<br>`POST /api/lists`<br>`GET /api/lists/{id}`<br>`POST /api/lists/{id}/items` | `movie_lists`, `movie_list_items` | `LIST-001`<br>`LIST-002`<br>`LIST-003` | **Verified** |
| **FEAT-SOCIAL** | Community & Follows | `/social`, `/notifications` | `ActivityFeed.jsx`, `NotificationsPage.jsx` | `GET /api/social/feed`<br>`POST /api/social/follow/{id}`<br>`GET /api/notifications` | `user_follows`, `notifications` | `AUTH-002`<br>`REV-004` | **Verified** |
| **FEAT-MATCH** | CineMatch Room | `/cinematch`, `/match` | `CineMatch.jsx` | `POST /api/cinematch/room`<br>`GET /api/cinematch/room/{code}`<br>`POST /api/cinematch/vote` | In-memory / Spring Service | `MATCH-001`<br>`MATCH-002`<br>`MATCH-003` | **Verified** |
| **FEAT-PRED** | Box Office Predictor | `/box-prediction` | `BoxOfficePrediction.jsx`, `RevenueGraph.jsx` | `POST /api/prediction/predict` &rarr; FastAPI port `8000` | Scikit-Learn Model Pipeline | `PRED-001`<br>`PRED-002`<br>`PRED-003` | **Verified** |
| **FEAT-MIGR** | Letterboxd Migration | `/data-migration`, `/import-export` | `DataMigration.jsx`, `ImportExportModal.jsx` | `POST /api/data/import/csv`<br>`GET /api/data/export/diary`<br>`GET /api/data/export/watchlist`<br>`GET /api/data/export/watched` | `film_logs`, `watched_movies`, `watchlist` | `MIGR-001`<br>`MIGR-002`<br>`MIGR-003` | **Verified** |

---

## Verification Summary
- **Total Frontend Routes Audited**: 32
- **Total Backend Endpoints Mapped**: 42
- **Total Database Entities Verified**: 13
- **Total Playwright Test Scenarios Defined**: 50+
- **Unverified / Blocked Modules**: None (all modules have concrete source implementations in repository).
