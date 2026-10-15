# Playwright End-to-End Test Catalog

This catalog outlines executable test scenarios across all core modules. Each scenario is tagged with a unique test ID, priority (`P0` to `P3`), category, and verifiable assertions.

---

## 1. Authentication & Session Scenarios (`AUTH`)

| Test ID | Priority | Category | Scenario Title | Expected UI Result | Expected Backend / DB Behavior |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **`AUTH-001`** | **P0** | Happy Path | Successful user registration | Toast notification `Registration successful`, redirected to `/login` | Record inserted in `users` table with BCrypt hashed password |
| **`AUTH-002`** | **P0** | Happy Path | Successful login with valid credentials | Redirected to `/dashboard`, user state stored in `localStorage`, navbar shows avatar | `200 OK` returning valid JWT token signed by `JwtService` |
| **`AUTH-003`** | **P1** | Validation | Registration with invalid email format | Inline error message `Please enter a valid email address` | Client-side blocked; no network request |
| **`AUTH-004`** | **P1** | Negative | Registration with duplicate email address | Error banner `An account with this email address already exists` | `400 Bad Request` from `AuthController` |
| **`AUTH-005`** | **P1** | Negative | Login with incorrect password | Error banner `Invalid email or password` | `401 Unauthorized` |
| **`AUTH-006`** | **P0** | Auth | Unauthenticated route access to `/dashboard` | Immediately redirected to `/login` | `PrivateRoute` enforces guard |
| **`AUTH-007`** | **P1** | Session | User logout via profile menu | Token cleared from `localStorage`, redirected to `/` | Client-side session cleared |
| **`AUTH-008`** | **P2** | Expiration | Expired JWT token handling | On next API call, user is logged out with toast `Session expired` | Interceptor catches `401 Unauthorized` |

---

## 2. Film Discovery & Search Scenarios (`DISC`)

| Test ID | Priority | Category | Scenario Title | Expected UI Result |
| :--- | :---: | :--- | :--- | :--- |
| **`DISC-001`** | **P0** | Happy Path | Global navbar search text input (`⌘K`) | Live suggestions dropdown opens displaying top movies and cast members |
| **`DISC-002`** | **P0** | Happy Path | Filter movies by genre (e.g. `Sci-Fi`) | Movie grid updates to show only science fiction films |
| **`DISC-003`** | **P1** | Happy Path | Filter movies by language (`Telugu` / `te`) | Grid displays Telugu cinema; language banner pill appears with clear option |
| **`DISC-004`** | **P1** | Boundary | Decade filtering (e.g. `1990s`) | All returned movies have release years between `1990` and `1999` |
| **`DISC-005`** | **P2** | Negative | Search with non-existent query | Empty state `No films found matching your search` |
| **`DISC-006`** | **P1** | Pagination | Navigate from Page 1 to Page 2 | URL and grid update with next page results, window scrolls to top |

---

## 3. Movie Details & Media Scenarios (`MDETAIL`)

| Test ID | Priority | Category | Scenario Title | Expected UI Result |
| :--- | :---: | :--- | :--- | :--- |
| **`MDETAIL-001`** | **P0** | Happy Path | Load valid movie detail page (`/movies/157336`) | Backdrop, title, release year, runtime, star rating, cast credits, and trailers render |
| **`MDETAIL-002`** | **P1** | Interaction | Play movie trailer | Video modal opens and YouTube player renders |
| **`MDETAIL-003`** | **P1** | Social | View community content advisories | Content advisory badges (Violence, Gore, Language) display with severity pills |
| **`MDETAIL-004`** | **P2** | Boundary | Non-existent movie ID (`/movies/999999999`) | Graceful fallback or error card without unhandled React crash |

---

## 4. Watched & Library Scenarios (`LIB`)

| Test ID | Priority | Category | Scenario Title | Expected UI Result |
| :--- | :---: | :--- | :--- | :--- |
| **`LIB-001`** | **P0** | Happy Path | Mark movie as Watched | Button state changes to "Watched", movie appears in `/mywatchedfilms` |
| **`LIB-002`** | **P0** | Happy Path | Add movie to Watchlist | Button state changes to "In Watchlist", item appears in `/watchlist` |
| **`LIB-003`** | **P1** | Happy Path | Heart movie as Liked | Heart icon fills with gold accent, item appears in `/favorites` |
| **`LIB-004`** | **P1** | Interaction | Toggle dense grid on Watched page | Grid layout shifts between standard 48-item view and dense 72-item view |
| **`LIB-005`** | **P1** | Persistence | Remove movie from Watchlist | Item vanishes from `/watchlist`, total count decrements by 1 |

---

## 5. Film Diary Scenarios (`DIARY`)

| Test ID | Priority | Category | Scenario Title | Expected UI Result |
| :--- | :---: | :--- | :--- | :--- |
| **`DIARY-001`** | **P0** | Happy Path | Log a film viewing with date, rating & notes | Log entry created in chronological timeline, stats counter increments |
| **`DIARY-002`** | **P1** | Happy Path | Toggle "Rewatch" flag on diary log | Log entry displays rewatch icon badge |
| **`DIARY-003`** | **P1** | Persistence | Delete a diary log entry | Confirmation modal appears; upon confirming, log is removed and stats update |

---

## 6. Review System Scenarios (`REV`)

| Test ID | Priority | Category | Scenario Title | Expected UI Result |
| :--- | :---: | :--- | :--- | :--- |
| **`REV-001`** | **P0** | Happy Path | Submit a long-form movie review | Review displays in `/myreviews` and under the movie's community review section |
| **`REV-002`** | **P1** | Content Safety | Submit review with spoiler tag enabled | Review content is blurred with a "Contains Spoilers — Click to Reveal" mask |
| **`REV-003`** | **P1** | Interaction | Like a community review | Like count increments and heart icon turns active |
| **`REV-004`** | **P1** | Interaction | Post a comment on a review | Comment appears beneath review with author name and timestamp |

---

## 7. Curated Lists Scenarios (`LIST`)

| Test ID | Priority | Category | Scenario Title | Expected UI Result |
| :--- | :---: | :--- | :--- | :--- |
| **`LIST-001`** | **P0** | Happy Path | Create a new custom list | List card renders in `/lists` with title, description, and empty poster slot |
| **`LIST-002`** | **P1** | Happy Path | Add a movie to custom list | Movie poster adds to list showcase and item appears in list detail page |
| **`LIST-003`** | **P2** | Interaction | Delete a custom list | List is removed from the user's list dashboard |

---

## 8. Box Office Prediction ML Scenarios (`PRED`)

| Test ID | Priority | Category | Scenario Title | Expected UI Result |
| :--- | :---: | :--- | :--- | :--- |
| **`PRED-001`** | **P0** | Happy Path | Predict box office with valid budget ($100M) & genres | Graph updates with predicted worldwide gross in millions USD |
| **`PRED-002`** | **P1** | Validation | Negative budget input ($ -50) | Input field enforces positive value or clamps to 0 |
| **`PRED-003`** | **P2** | Network Error | Prediction request when ML service port 8000 is down | Error banner indicates predictor is offline without crashing page |

---

## 9. Data Migration Scenarios (`MIGR`)

| Test ID | Priority | Category | Scenario Title | Expected UI Result |
| :--- | :---: | :--- | :--- | :--- |
| **`MIGR-001`** | **P0** | Happy Path | Import Letterboxd `watched.csv` | Summary dialog reports matched films; records add to Watched history (NOT watchlist) |
| **`MIGR-002`** | **P0** | Happy Path | Import Letterboxd `watchlist.csv` | Records add strictly to Watchlist |
| **`MIGR-003`** | **P1** | Happy Path | Export personal archive to CSV | Browser triggers download of `cinephile_diary.csv` |

---

## 10. CineMatch Movie Night Scenarios (`MATCH`)

| Test ID | Priority | Category | Scenario Title | Expected UI Result |
| :--- | :---: | :--- | :--- | :--- |
| **`MATCH-001`** | **P1** | Happy Path | Create CineMatch room | 6-character room code generated with share link |
| **`MATCH-002`** | **P1** | Interaction | Swipe right on candidate movies | Swiped cards transition with vote recorded |
| **`MATCH-003`** | **P2** | Happy Path | Mutual match detected | Match celebration modal pops up showing agreed movie |
