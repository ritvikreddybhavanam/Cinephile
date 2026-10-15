# REST API & Database Entity Mapping

## 1. REST API Specification (Spring Boot Backend)

All endpoints below are prefixed with `/api`.

### 1.1 Authentication (`/api/auth`)
| Method | Endpoint | Auth | Request Body / Params | Expected Response | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | `{ firstname, lastname, emailaddress, password, username }` | `200 OK`: `LoginResponse` with token | Create account & return JWT |
| `POST` | `/api/auth/login` | No | `{ emailaddress, password }` | `200 OK`: `LoginResponse` with token | Authenticate user & issue JWT |
| `POST` | `/api/auth/verify-email` | No | `?token=<str>` | `200 OK`: Status confirmation | Confirm email token |
| `POST` | `/api/auth/forgot-password` | No | `{ emailaddress }` | `200 OK`: Message confirmation | Dispatch reset email token |
| `POST` | `/api/auth/reset-password` | No | `{ token, newPassword }` | `200 OK`: Message confirmation | Apply new password |

---

### 1.2 TMDB Proxy & Movie Exploration (`/api/tmdb`)
| Method | Endpoint | Auth | Query Parameters | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/tmdb/trending` | No | `page=1` | Daily trending movies |
| `GET` | `/api/tmdb/popular` | No | None | Most popular movies |
| `GET` | `/api/tmdb/genres` | No | None | All movie genres |
| `GET` | `/api/tmdb/movies` | No | `page, sortBy, year, genre, rating, language, withWatchProviders, runtimeLte, runtimeGte` | Multi-filter movie discovery |
| `GET` | `/api/tmdb/search` | No | `query, page` | Text search across movies |
| `GET` | `/api/tmdb/movies/{id}` | No | None | Full movie metadata with appended credits, videos, and recommendations |
| `GET` | `/api/tmdb/movies/{id}/videos` | No | None | Trailers and official clips |
| `GET` | `/api/tmdb/movies/{id}/credits` | No | None | Full cast and crew credits |
| `GET` | `/api/tmdb/movies/{id}/reviews` | No | None | External TMDB member reviews |
| `GET` | `/api/tmdb/movies/{id}/similar` | No | None | Similar movies |
| `GET` | `/api/tmdb/movies/{id}/watch/providers` | No | None | Flatrate and rental streaming availability |
| `GET` | `/api/tmdb/people/popular` | No | `page` | Popular actors & filmmakers |
| `GET` | `/api/tmdb/person/{id}` | No | None | Biography & birth metadata |
| `GET` | `/api/tmdb/person/{id}/credits` | No | None | Person filmography |

---

### 1.3 Watched Movies (`/api/watched`)
| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/watched` | **Yes** | None | Fetch authenticated user's watched movies |
| `POST` | `/api/watched` | **Yes** | `{ movieId, title, poster, year, rating, genre }` | Mark movie as watched |
| `DELETE` | `/api/watched/{movieId}` | **Yes** | None | Unmark watched movie |
| `GET` | `/api/watched/check/{movieId}` | **Yes** | None | Check if movie is marked watched (`true`/`false`) |

---

### 1.4 Watchlist (`/api/watchlist`)
| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/watchlist` | **Yes** | None | Fetch authenticated user's watchlist |
| `POST` | `/api/watchlist` | **Yes** | `{ movieId, title, poster }` | Add movie to watchlist |
| `DELETE` | `/api/watchlist/{movieId}` | **Yes** | None | Remove movie from watchlist |
| `GET` | `/api/watchlist/check/{movieId}` | **Yes** | None | Check if movie is in watchlist (`true`/`false`) |

---

### 1.5 Liked Movies (`/api/liked-movies`)
| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/liked-movies` | **Yes** | None | Fetch all liked movies |
| `POST` | `/api/liked-movies/{movieId}` | **Yes** | None | Like / heart a movie |
| `DELETE` | `/api/liked-movies/{movieId}` | **Yes** | None | Unlike a movie |
| `GET` | `/api/liked-movies/{movieId}/status` | **Yes** | None | Check like status |

---

### 1.6 Film Diary (`/api/diary`)
| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/diary` | **Yes** | None | Fetch chronological film logs |
| `POST` | `/api/diary` | **Yes** | `FilmLogRequest` (`movieId, title, poster, year, watchedDate, rating, rewatch, venueOrPlatform, reviewNotes`) | Create log entry |
| `DELETE` | `/api/diary/{id}` | **Yes** | None | Delete diary log entry |
| `GET` | `/api/diary/stats` | **Yes** | None | Aggregate diary stats |

---

### 1.7 Reviews (`/api/reviews`)
| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/reviews/movie/{movieId}` | No / Optional | None | Reviews for specific movie |
| `GET` | `/api/reviews/my` | **Yes** | None | Authenticated user's reviews |
| `POST` | `/api/reviews` | **Yes** | `ReviewRequest` | Submit new movie review |
| `POST` | `/api/reviews/{id}/like` | **Yes** | None | Like / unlike review |
| `POST` | `/api/reviews/{id}/comments` | **Yes** | `{ text }` | Add comment to review |
| `DELETE` | `/api/reviews/comments/{id}` | **Yes** | None | Delete comment |

---

### 1.8 Curated Lists (`/api/lists`)
| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/lists` | **Yes** | None | Get user's custom lists |
| `POST` | `/api/lists` | **Yes** | `MovieListRequest` | Create custom list |
| `GET` | `/api/lists/{id}` | **Yes** | None | Get list details & items |
| `POST` | `/api/lists/{id}/items` | **Yes** | `MovieListItemRequest` | Add film to list |
| `DELETE` | `/api/lists/{id}` | **Yes** | None | Delete list |

---

### 1.9 Data Migration (`/api/data`)
| Method | Endpoint | Auth | Request Body / Multipart | Description |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/data/import/csv` | **Yes** | `MultipartFile` (`files` or `file`) | Batch process CSV / ZIP |
| `GET` | `/api/data/export/diary` | **Yes** | None | Download `cinephile_diary.csv` |
| `GET` | `/api/data/export/watchlist` | **Yes** | None | Download `cinephile_watchlist.csv` |
| `GET` | `/api/data/export/watched` | **Yes** | None | Download `cinephile_watched.csv` |

---

### 1.10 Social & Notifications (`/api/social`, `/api/notifications`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/social/feed` | **Yes** | Activity feed from followed users |
| `POST` | `/api/social/follow/{userId}` | **Yes** | Follow target user |
| `POST` | `/api/social/unfollow/{userId}` | **Yes** | Unfollow user |
| `GET` | `/api/notifications` | **Yes** | Fetch user notifications |
| `GET` | `/api/notifications/unread-count`| **Yes** | Get unread notification badge count |
| `POST` | `/api/notifications/mark-all-read`| **Yes** | Mark all notifications as read |

---

## 2. Database Entities & Relational Schema (MySQL)

```
┌────────────────────────────────────────────────────────┐
│                        users                           │
│ id (PK), emailaddress (UQ), username (UQ), password... │
└──────┬──────────┬──────────┬──────────┬─────────┬──────┘
       │          │          │          │         │
       ▼          ▼          ▼          ▼         ▼
┌──────────────┐ ┌─────────┐ ┌────────┐ ┌───────┐ ┌────────────────┐
│watched_movies│ │watchlist│ │film_logs│ │reviews│ │  movie_lists   │
│ user_id (FK) │ │user_id  │ │user_id │ │user_id│ │  user_id (FK)  │
└──────────────┘ └─────────┘ └────────┘ └───┬───┘ └───────┬────────┘
                                            │             │
                                            ▼             ▼
                                     ┌─────────────┐ ┌─────────────┐
                                     │review_likes │ │ movie_list_ │
                                     │review_comms │ │    items    │
                                     └─────────────┘ └─────────────┘
```

### Entity List & Constraints:
1. **`users`** (`User.java`): Unique `emailaddress`, unique `username`, encrypted `password` (BCrypt).
2. **`watched_movies`** (`WatchedMovie.java`): FK `user_id` &rarr; `users.id`, `movie_id`, `rating`, `year`, `genre`.
3. **`watchlist`** (`Watchlist.java`): FK `user_id` &rarr; `users.id`, `movie_id`, `title`, `poster`.
4. **`liked_movies`** (`LikedMovie.java`): FK `user_id` &rarr; `users.id`, `movie_id`.
5. **`film_logs`** (`FilmLog.java`): FK `user_id`, `movie_id`, `watched_date`, `rating`, `rewatch`, `review_notes`.
6. **`reviews`** (`Review.java`): FK `user_id`, `movie_id`, `rating`, `title`, `content`, `spoilers`, `visibility`.
7. **`review_likes`** (`ReviewLike.java`): FK `user_id`, FK `review_id`.
8. **`review_comments`** (`ReviewComment.java`): FK `user_id`, FK `review_id`, `comment_text`.
9. **`movie_lists`** (`MovieList.java`): FK `user_id`, `title`, `description`, `is_public`, `is_ranked`.
10. **`movie_list_items`** (`MovieListItem.java`): FK `movie_list_id` &rarr; `movie_lists.id`, `movie_id`, `rank_order`.
11. **`user_follows`** (`UserFollow.java`): FK `follower_id` &rarr; `users.id`, FK `following_id` &rarr; `users.id`.
12. **`notifications`** (`Notification.java`): FK `recipient_id`, FK `actor_id`, `type`, `message`, `is_read`.
13. **`content_advisories`** (`ContentAdvisory.java`): FK `user_id`, `movie_id`, `category`, `severity`, `details`.
