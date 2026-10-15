# Complete Feature Inventory

This inventory documents all 14 major feature modules across Cinephile, verified directly against the frontend React codebase and Spring Boot backend implementations.

---

## Summary Matrix

| Feature ID | Module Name | Implementation Status | User-Visible Route | Backend Controller / Service |
| :--- | :--- | :--- | :--- | :--- |
| **FEAT-AUTH** | Authentication & Account Lifecycle | **Fully Implemented** | `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password` | `AuthController`, `AuthService` |
| **FEAT-DISC** | Film Discovery, Filtering & Search | **Fully Implemented** | `/movies`, `/trending`, `/new-releases`, `/genres`, `/movies-language`, `/languages/:code` | `TmdbController`, `TmdbService` |
| **FEAT-MDETAIL** | Movie Details, Media & Cast | **Fully Implemented** | `/movies/:movieId` | `TmdbController`, `TmdbService` |
| **FEAT-PERSON** | Stars & Filmmakers (Cast/Crew) | **Fully Implemented** | `/people`, `/person/:id` | `TmdbController`, `TmdbService` |
| **FEAT-WATCHED** | Watched Movies Tracking | **Fully Implemented** | `/mywatchedfilms` | `WatchedMovieController`, `WatchedMovieService` |
| **FEAT-WLIST** | Watchlist Management | **Fully Implemented** | `/watchlist` | `WatchlistController`, `WatchlistService` |
| **FEAT-FAV** | Liked & Favourites Library | **Fully Implemented** | `/favorites` | `LikedMovieController`, `LikedMovieService` |
| **FEAT-DIARY** | Film Diary & Chronological Logs | **Fully Implemented** | `/diary` | `FilmDiaryController`, `FilmDiaryService` |
| **FEAT-REVIEW** | Reviews, Spoilers & Social Comments | **Fully Implemented** | `/myreviews`, `/write_review`, `/movies/:id/review` | `ReviewController`, `ReviewService` |
| **FEAT-LISTS** | Curated Custom Lists | **Fully Implemented** | `/lists`, `/lists/:id` | `MovieListController`, `MovieListService` |
| **FEAT-SOCIAL** | Community Activity Feed & Follows | **Fully Implemented** | `/social`, `/notifications` | `SocialController`, `NotificationController` |
| **FEAT-MATCH** | CineMatch (Social Movie Night Matcher) | **Fully Implemented** | `/cinematch` | `CineMatchController`, `CineMatchService` |
| **FEAT-PRED** | Box Office ML Revenue Predictor | **Fully Implemented** | `/box-prediction` | `PredictionController`, FastAPI ML Service |
| **FEAT-MIGR** | Letterboxd / IMDb CSV Migration | **Fully Implemented** | `/data-migration`, `/import-export` | `ImportExportController`, `ImportExportService` |

---

## Detailed Module Specifications

### 1. FEAT-AUTH: Authentication & Account Lifecycle
- **Status**: Fully Implemented.
- **Entry Points**: Global Navbar login/register buttons, `/login`, `/register`.
- **Frontend Components**: [`Login.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/public/Login.jsx), [`Register.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/public/Register.jsx), [`VerifyEmail.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/Auth/VerifyEmail.jsx), [`ForgotPassword.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/public/ForgotPassword.jsx), [`ResetPassword.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/public/ResetPassword.jsx).
- **Backend Components**: [`AuthController.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/controller/AuthController.java), [`AuthService.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/service/AuthService.java).
- **Entities**: [`User.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/entity/User.java).
- **Key Capabilities**: User signup with first/last name, email, password hashing; verification token dispatch; JWT token generation with 24h expiration; automatic redirection of authenticated users away from auth pages.

---

### 2. FEAT-DISC: Film Discovery, Filtering & Search
- **Status**: Fully Implemented.
- **Entry Points**: Search bar in Navbar (`⌘K`), `/movies`, `/trending`, `/new-releases`, `/genres`, `/movies-language`.
- **Frontend Components**: [`Movies.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/movies/Movies.jsx), [`Trending.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/movies/Trending.jsx), [`NewReleases.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/movies/NewReleases.jsx), [`Genres.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/movies/Genres.jsx), [`MoviesLanguage.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/movies/MoviesLanguage.jsx), [`LanguageDetails.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/movies/LanguageDetails.jsx).
- **Backend Components**: [`TmdbController.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/controller/TmdbController.java), [`TmdbService.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/service/TmdbService.java).
- **Key Capabilities**: Multi-parameter movie discovery combining language codes (`en`, `te`, `hi`, etc.), genre IDs, rating threshold (`vote_average.gte`), release year, runtime limits (`<90m`, `90-120m`, `>120m`), streaming provider filtering, live debounced autocomplete in Navbar.

---

### 3. FEAT-MDETAIL: Movie Details, Media & Cast
- **Status**: Fully Implemented.
- **Entry Points**: Clicking any movie poster / card (`/movies/:movieId`).
- **Frontend Components**: [`MovieDetails.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/movies/MovieDetails.jsx), [`MovieHero.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/components/movie/MovieHero.jsx), [`MovieVideosSection.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/components/movie/MovieVideosSection.jsx), [`MoviePhotos.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/components/movie/MoviePhotos.jsx).
- **Backend Components**: [`TmdbController.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/controller/TmdbController.java), [`ContentAdvisoryController.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/controller/ContentAdvisoryController.java).
- **Key Capabilities**: Composite API fetching credits, trailers/videos, backdrops, cast filmographies, similar movies, recommendations, watch providers, community content advisories with severity levels.

---

### 4. FEAT-WATCHED: Watched Movies Tracking
- **Status**: Fully Implemented.
- **Entry Points**: `/mywatchedfilms`, "Mark Watched" toggle on movie cards and detail heroes.
- **Frontend Components**: [`WatchedFilms.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/movies/WatchedFilms.jsx), [`WatchedButton.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/components/movies/WatchedButton.jsx).
- **Backend Components**: [`WatchedMovieController.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/controller/WatchedMovieController.java), [`WatchedMovieService.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/service/WatchedMovieService.java).
- **Entities**: [`WatchedMovie.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/entity/WatchedMovie.java).
- **Key Capabilities**: Instant marking/unmarking, rating aggregation, filtering by decade/genre/rating, dense view toggle (`48` vs `72` items per page), unique constraint by `(user_id, movie_id)`.

---

### 5. FEAT-WLIST: Watchlist Management
- **Status**: Fully Implemented.
- **Entry Points**: `/watchlist`, "Bookmark" button on movie cards.
- **Frontend Components**: [`Watchlist.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/library/Watchlist.jsx), [`WatchlistButton.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/components/movies/WatchlistButton.jsx).
- **Backend Components**: [`WatchlistController.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/controller/WatchlistController.java), [`WatchlistService.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/service/WatchlistService.java).
- **Entities**: [`Watchlist.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/entity/Watchlist.java).
- **Key Capabilities**: Queuing movies to watch, quick removal, duplicate check, total count badge.

---

### 6. FEAT-FAV: Liked Movies Library
- **Status**: Fully Implemented.
- **Entry Points**: `/favorites`, Heart icon on movie cards.
- **Frontend Components**: [`LikedMovies.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/library/LikedMovies.jsx), [`LikedMovieCard.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/components/cards/LikedMovieCard.jsx).
- **Backend Components**: [`LikedMovieController.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/controller/LikedMovieController.java), [`LikedMovieService.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/service/LikedMovieService.java).
- **Entities**: [`LikedMovie.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/entity/LikedMovie.java).
- **Key Capabilities**: Toggle liked status, instant optimistic UI updates, library grid display.

---

### 7. FEAT-DIARY: Film Diary & Viewing Logs
- **Status**: Fully Implemented.
- **Entry Points**: `/diary`, "Log Film" modal on Movie Details.
- **Frontend Components**: [`Diary.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/diary/Diary.jsx), [`LogFilmModal.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/components/diary/LogFilmModal.jsx).
- **Backend Components**: [`FilmDiaryController.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/controller/FilmDiaryController.java), [`FilmDiaryService.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/service/FilmDiaryService.java).
- **Entities**: [`FilmLog.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/entity/FilmLog.java).
- **Key Capabilities**: Record custom viewing date, star rating (0.5 to 5.0), rewatch toggle boolean, viewing format / platform (e.g. Cinema, Netflix, Blu-ray), review notes; computes aggregated statistics (`totalFilmsLogged`, `totalRewatches`, `thisYearCount`, `thisMonthCount`, `averageRating`).

---

### 8. FEAT-REVIEW: Reviews, Spoilers & Social Critique
- **Status**: Fully Implemented.
- **Entry Points**: `/myreviews`, `/write_review`, `/movies/:id/review`.
- **Frontend Components**: [`MyReviews.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/reviews/MyReviews.jsx), [`WriteReview.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/reviews/WriteReview.jsx), [`ReviewCard.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/components/review/ReviewCard.jsx), [`ReviewCommentsSection.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/components/review/ReviewCommentsSection.jsx).
- **Backend Components**: [`ReviewController.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/controller/ReviewController.java), [`ReviewService.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/service/ReviewService.java).
- **Entities**: [`Review.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/entity/Review.java), [`ReviewLike.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/entity/ReviewLike.java), [`ReviewComment.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/entity/ReviewComment.java).
- **Key Capabilities**: Multi-paragraph review editor, rating scale, spoiler tags (`ending`, `major_twist`, `character_death`), visibility settings (`public`, `friends_only`, `private`), review liking, comments with author avatars.

---

### 9. FEAT-LISTS: Curated Custom Film Lists
- **Status**: Fully Implemented.
- **Entry Points**: `/lists`, `/lists/:id`.
- **Frontend Components**: [`CuratedLists.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/lists/CuratedLists.jsx), [`ListDetails.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/lists/ListDetails.jsx).
- **Backend Components**: [`MovieListController.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/controller/MovieListController.java), [`MovieListService.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/service/MovieListService.java).
- **Entities**: [`MovieList.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/entity/MovieList.java), [`MovieListItem.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/entity/MovieListItem.java).
- **Key Capabilities**: Create custom themed lists (title, description, tags, isPublic, isRanked), add movies with custom item notes and rank order, list deletion, public sharing.

---

### 10. FEAT-MATCH: CineMatch (Social Movie Night Matcher)
- **Status**: Fully Implemented.
- **Entry Points**: `/cinematch`, `/match`.
- **Frontend Components**: [`CineMatch.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/cinematch/CineMatch.jsx).
- **Backend Components**: [`CineMatchController.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/controller/CineMatchController.java), [`CineMatchService.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/service/CineMatchService.java).
- **Key Capabilities**: Create movie night rooms with 6-character room codes, share room code with friends, swipe/vote on movie cards, calculate mutual matches when participants agree.

---

### 11. FEAT-PRED: Box Office ML Revenue Predictor
- **Status**: Fully Implemented.
- **Entry Points**: `/box-prediction`.
- **Frontend Components**: [`BoxOfficePrediction.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/boxoffice/BoxOfficePrediction.jsx), [`RevenueGraph.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/components/boxoffice/RevenueGraph.jsx).
- **Backend Components**: [`PredictionController.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/controller/PredictionController.java), [`PredictionService.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/service/PredictionService.java), FastAPI ML Engine (`machine_learning/api/app.py`).
- **Key Capabilities**: Input production budget, runtime, release date, country, language, and multiple genres; returns estimated worldwide box office gross with interactive revenue tier visualizations.

---

### 12. FEAT-MIGR: Letterboxd / IMDb CSV Migration
- **Status**: Fully Implemented.
- **Entry Points**: `/data-migration`, `/import-export`, modal popup on `/mywatchedfilms`.
- **Frontend Components**: [`DataMigration.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/settings/DataMigration.jsx), [`ImportExportModal.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/components/common/ImportExportModal.jsx).
- **Backend Components**: [`ImportExportController.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/controller/ImportExportController.java), [`ImportExportService.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/service/ImportExportService.java).
- **Key Capabilities**: Drop full Letterboxd `.zip` archive or individual `.csv` files (`diary.csv`, `watched.csv`, `watchlist.csv`, `ratings.csv`); matches titles with TMDB metadata; supports clean CSV export of diary, watched, and watchlist records.
