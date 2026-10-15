# Cinephile Full-Stack Testing & Quality Assurance Plan

This document outlines the systematic, end-to-end testing matrix to test every component of the Cinephile application (Frontend, Spring Boot Backend, MySQL Database, ML Service, and External TMDB Integrations).

---

## 1. System Health & Infrastructure Matrix

| Service | Port | Health Check / Validation Endpoint | Status |
| :--- | :--- | :--- | :--- |
| **Frontend (Vite + React)** | `5173` | `http://localhost:5173` | Active |
| **Backend (Spring Boot)** | `8080` | `http://localhost:8080/api/tmdb/test` | Active |
| **ML Engine (FastAPI + Python)** | `8000` | `http://localhost:8000/docs` | Active |
| **Database (MySQL)** | `3306` | `jdbc:mysql://localhost:3306/film_buff` | Connected |
| **TMDB Third-Party API** | External | Bearer Token Verification (`/api/tmdb/trending`) | Connected |

---

## 2. Core Functional Test Suites

### Suite A: Authentication & User Lifecycle
- [ ] **Registration**: Sign up with email, password, username, firstName, lastName. Check password hashing (`BCrypt`).
- [ ] **Email Verification**: Test email verification token flow (`/api/auth/verify-email`).
- [ ] **Login & JWT**: Test valid vs invalid credentials; verify JWT storage in `localStorage` and request headers (`Authorization: Bearer <token>`).
- [ ] **Token Expiration / 401 Interceptor**: Ensure frontend logs out cleanly when a token is expired.
- [ ] **Password Reset**: Forgot password and password reset token flow.

### Suite B: TMDB & Movie Exploration
- [ ] **Landing Page**: Verify hero backdrop slideshow, trending movies, popular this week, mood selector pills, new releases, and film spotlight.
- [ ] **Discover / Search (`/movies`)**:
  - Filter by Genre, Decade, Language, Rating, Streaming Provider, and Runtime.
  - Test real-time debounced text search (actors, directors, titles).
  - Verify pagination and decade filtering.
- [ ] **Movie Details Page (`/movies/:id`)**:
  - Backdrop, posters, cast/crew credits, runtime, genres, trailers/videos modal, similar movies, recommendations, and streaming provider availability.

### Suite C: User Library, Diary & Log Systems
- [ ] **Watched Films (`/watched`)**:
  - Mark a film as watched / unmark watched.
  - Filter watched films by rating, decade, genre, and sort order.
  - Test dense grid view vs standard grid view toggle.
- [ ] **Watchlist (`/watchlist`)**: Add/remove films from watchlist; verify duplicate prevention.
- [ ] **Film Diary (`/diary`)**: Log viewings with custom date, rewatch toggle, rating (0.5 to 5.0 / 10-scale), platform/cinema venue tag, and review notes.
- [ ] **Liked Movies (`/liked-movies`)**: Heart/unheart movies across detail cards and grids.

### Suite D: Reviews & Social Features
- [ ] **Write Review**: Create reviews with rating, title, spoiler warnings, and intent.
- [ ] **Social Interactions**: Like reviews, reply with comments, and delete comments.
- [ ] **User Profiles & Follows**: Follow/unfollow members, view activity feeds, inspect follower/following lists.
- [ ] **Notifications**: Real-time / polling unread count badge and notification list.

### Suite E: Data Migration (Letterboxd / IMDb Import & Export)
- [ ] **Letterboxd Watchlist Import**: Import `watchlist.csv` (contains `Date,Name,Year,Letterboxd URI`) -> routed strictly to Watchlist.
- [ ] **Letterboxd Watched Import**: Import `watched.csv` -> routed to Watched history without polluting Watchlist.
- [ ] **Letterboxd Diary Import**: Import `diary.csv` -> creates `FilmLog` entries and syncs reviews.
- [ ] **Full Zip Archive**: Drop full Letterboxd `.zip` export and verify batch processing.
- [ ] **Export**: Test exporting `cinephile_diary.csv`, `cinephile_watchlist.csv`, and `cinephile_watched.csv`.

### Suite F: AI & Machine Learning Services
- [ ] **CineMatch Recommender**: Run hybrid AI recommendations based on user viewing history.
- [ ] **Box Office Predictor**: Test box office revenue prediction model with genre, budget, runtime, and star power inputs.

---

## 3. Automated & Manual Execution Strategy

1. **Backend Automated Unit & Integration Tests**:
   ```bash
   cd backend
   ./mvnw test
   ```
2. **Frontend Build & Lint Checks**:
   ```bash
   cd frontend
   npm run build
   ```
3. **API Endpoint Health Scan**: Automated PowerShell / curl script validating all 40+ endpoints with status checks.
