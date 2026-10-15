# Route & Component Inventory

## 1. Frontend Route Matrix

The application defines 32 distinct frontend routes registered in [`frontend/src/routes/AppRoutes.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/routes/AppRoutes.jsx).

| Route Pattern | Page Component | Auth Required | Query Parameters Supported | Unauthenticated Behavior | Source File |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `/` | `Landing` | No | None | Renders landing hero & showcases | [`Landing.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/public/Landing.jsx) |
| `/login` | `Login` | No | None | Renders login form (redirects to `/dashboard` if logged in) | [`Login.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/public/Login.jsx) |
| `/register` | `Register` | No | None | Renders registration form | [`Register.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/public/Register.jsx) |
| `/forgot-password` | `ForgotPassword` | No | None | Renders password reset request form | [`ForgotPassword.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/public/ForgotPassword.jsx) |
| `/reset-password` | `ResetPassword` | No | `?token=<str>` | Renders new password entry form | [`ResetPassword.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/public/ResetPassword.jsx) |
| `/verify-email` | `VerifyEmail` | No | `?token=<str>` | Verifies email token on load | [`VerifyEmail.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/Auth/VerifyEmail.jsx) |
| `/about`, `/about-us` | `AboutUs` | No | None | Renders static info page | [`AboutUs.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/navbar_pages/AboutUs.jsx) |
| `/community`, `/community-guidelines` | `CommunityGuidelines` | No | None | Renders guidelines page | [`CommunityGuidelines.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/navbar_pages/CommunityGuidelines.jsx) |
| `/privacy`, `/privacy-policy` | `Privacy` | No | None | Renders privacy policy | [`Privacy.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/navbar_pages/Privacy.jsx) |
| `/terms`, `/terms-of-service` | `TermsOfService` | No | None | Renders terms of service | [`TermsOfService.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/navbar_pages/TermsOfService.jsx) |
| `/dashboard` | `UserDashboard` | **Yes** | None | Redirects to `/login` | [`UserDashboard.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/dashboard/UserDashboard.jsx) |
| `/movies` | `Movies` | **Yes** | `?search`, `?language`, `?genre`, `?year` | Redirects to `/login` | [`Movies.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/movies/Movies.jsx) |
| `/movies/:movieId` | `MovieDetails` | **Yes** | None | Redirects to `/login` | [`MovieDetails.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/movies/MovieDetails.jsx) |
| `/movies/:id/review` | `WriteReview` | **Yes** | None | Redirects to `/login` | [`WriteReview.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/reviews/WriteReview.jsx) |
| `/trending` | `Trending` | **Yes** | None | Redirects to `/login` | [`Trending.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/movies/Trending.jsx) |
| `/new-releases` | `NewReleases` | **Yes** | None | Redirects to `/login` | [`NewReleases.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/movies/NewReleases.jsx) |
| `/genres` | `Genres` | **Yes** | None | Redirects to `/login` | [`Genres.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/movies/Genres.jsx) |
| `/mywatchedfilms` | `WatchedFilms` | **Yes** | None | Redirects to `/login` | [`WatchedFilms.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/movies/WatchedFilms.jsx) |
| `/what-to-watch` | `WhatToWatch` | **Yes** | None | Redirects to `/login` | [`WhatToWatch.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/movies/WhatToWatch.jsx) |
| `/box-prediction` | `BoxOfficePrediction` | **Yes** | None | Redirects to `/login` | [`BoxOfficePrediction.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/boxoffice/BoxOfficePrediction.jsx) |
| `/favorites` | `LikedMovies` | **Yes** | None | Redirects to `/login` | [`LikedMovies.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/library/LikedMovies.jsx) |
| `/watchlist` | `Watchlist` | **Yes** | None | Redirects to `/login` | [`Watchlist.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/library/Watchlist.jsx) |
| `/write_review` | `WriteReview` | **Yes** | None | Redirects to `/login` | [`WriteReview.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/reviews/WriteReview.jsx) |
| `/myreviews` | `MyReviews` | **Yes** | None | Redirects to `/login` | [`MyReviews.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/reviews/MyReviews.jsx) |
| `/person/:id` | `PersonDetails` | **Yes** | None | Redirects to `/login` | [`PersonDetails.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/people/PersonDetails.jsx) |
| `/people` | `People` | **Yes** | None | Redirects to `/login` | [`People.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/people/People.jsx) |
| `/diary` | `Diary` | **Yes** | None | Redirects to `/login` | [`Diary.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/diary/Diary.jsx) |
| `/analytics`, `/wrapped`, `/stats` | `AnalyticsWrapped` | **Yes** | None | Redirects to `/login` | [`AnalyticsWrapped.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/analytics/AnalyticsWrapped.jsx) |
| `/cinematch`, `/match` | `CineMatch` | **Yes** | None | Redirects to `/login` | [`CineMatch.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/cinematch/CineMatch.jsx) |
| `/lists` | `CuratedLists` | **Yes** | None | Redirects to `/login` | [`CuratedLists.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/lists/CuratedLists.jsx) |
| `/lists/:id` | `ListDetails` | **Yes** | None | Redirects to `/login` | [`ListDetails.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/lists/ListDetails.jsx) |
| `/social` | `ActivityFeed` | **Yes** | None | Redirects to `/login` | [`ActivityFeed.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/social/ActivityFeed.jsx) |
| `/notifications` | `NotificationsPage` | **Yes** | None | Redirects to `/login` | [`NotificationsPage.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/notifications/NotificationsPage.jsx) |
| `/profile`, `/profile/:username`, `/settings/profile` | `Profile` | **Yes** | None | Redirects to `/login` | [`Profile.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/profile/Profile.jsx) |
| `/data-migration`, `/import-export` | `DataMigration` | **Yes** | None | Redirects to `/login` | [`DataMigration.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/settings/DataMigration.jsx) |
| `/more` | `More` | **Yes** | None | Redirects to `/login` | [`More.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/More.jsx) |
| `/movies-language`, `/movies-by-languages` | `MoviesLanguage` | **Yes** | None | Redirects to `/login` | [`MoviesLanguage.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/movies/MoviesLanguage.jsx) |
| `/languages/:languageCode`, `/language/:languageCode` | `LanguageDetails` | **Yes** | None | Redirects to `/login` | [`LanguageDetails.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/pages/user/movies/LanguageDetails.jsx) |
| `*` (Catch-all) | `Navigate` | **Yes** | None | Redirects to `/dashboard` | Handled in `AppRoutes.jsx` |

---

## 2. Reusable Component & Selector Inventory

| Component | Source Path | Key Functional Selectors / Testable Roles |
| :--- | :--- | :--- |
| **`Navbar`** | [`frontend/src/components/layout/Navbar.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/components/layout/Navbar.jsx) | `nav`, `input[aria-label="Search Cinephile"]`, `button[aria-label="Notifications"]`, `button:has-text("More")`, `span:has-text("⌘K")` |
| **`Footer`** | [`frontend/src/components/layout/Footer.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/components/layout/Footer.jsx) | `footer`, `a[href="/privacy"]`, `a[href="/terms"]`, `a[href="/about-us"]` |
| **`MovieCard`** | [`frontend/src/components/cards/MovieCard.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/components/cards/MovieCard.jsx) | `article.poster-card`, `img`, `.badge-accent`, `h3` |
| **`LogFilmModal`** | [`frontend/src/components/diary/LogFilmModal.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/components/diary/LogFilmModal.jsx) | `input[type="date"]`, `textarea`, `button:has-text("Save Log Entry")`, `button:has-text("Cancel")` |
| **`ImportExportModal`** | [`frontend/src/components/common/ImportExportModal.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/components/common/ImportExportModal.jsx) | `input[type="file"]`, `button:has-text("Import Files")`, `button:has-text("Export Diary")` |
| **`ReviewCard`** | [`frontend/src/components/review/ReviewCard.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/components/review/ReviewCard.jsx) | `.mc-card`, `button:has-text("Like")`, `button:has-text("Comment")` |
| **`ThemeToggle`** | [`frontend/src/components/common/ThemeToggle.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/components/common/ThemeToggle.jsx) | `button[aria-label="Toggle theme"]` |
