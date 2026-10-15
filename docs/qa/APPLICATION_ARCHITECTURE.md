# Application Architecture & Runtime Specifications

## 1. High-Level Architecture Overview

Cinephile is a distributed full-stack film tracking, social cataloging, and predictive analytics application comprising three primary runtime layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Frontend SPA (React 19 + Vite)                  │
│                     Port 5173 | http://localhost:5173                  │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │ REST / JWT Auth               │ Direct (Optional)
                    ▼                               ▼
┌───────────────────────────────────────┐  ┌─────────────────────────────┐
│   Backend Core (Spring Boot 4.1.1)    │  │   ML Service (FastAPI)      │
│   Port 8080 | http://localhost:8080   ├──┤   Port 8000                 │
└───────────────────┬───────────────────┘  └─────────────────────────────┘
                    │ JDBC (HikariCP)
                    ▼
┌───────────────────────────────────────┐
│     MySQL 8.0 Relational DB           │
│     Port 3306 | DB: `film_buff`       │
└───────────────────────────────────────┘
```

---

## 2. Runtime Services & Port Map

| Component | Framework / Tool | Runtime Command | Default Port | Health Check / Validation |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | React 19 + Vite 8 + Tailwind CSS | `npm --prefix frontend run dev` | `5173` | `GET http://localhost:5173/` |
| **Backend** | Java 26 + Spring Boot 4.1.1 + Spring Data JPA | `cd backend && ./mvnw spring-boot:run` | `8080` | `GET http://localhost:8080/api/tmdb/test` |
| **ML Engine** | Python 3 + FastAPI + Uvicorn + Scikit-Learn | `python -m uvicorn api.app:app --app-dir machine_learning --port 8000` | `8000` | `GET http://localhost:8000/health` |
| **Database** | MySQL 8.0 | Native OS / Docker Service | `3306` | JDBC connect to `jdbc:mysql://localhost:3306/film_buff` |

All services can be launched concurrently using:
```bash
npm run dev
```

---

## 3. Frontend Architecture

- **Entry Point**: [`frontend/src/main.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/main.jsx)
- **Routing**: `react-router-dom` v7 via [`frontend/src/routes/AppRoutes.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/routes/AppRoutes.jsx)
- **State Management & Contexts**:
  - `AuthContext`: [`frontend/src/context/AuthContext.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/context/AuthContext.jsx) &rarr; manages JWT token, user state in `localStorage`, login/logout lifecycle.
  - `ThemeContext`: [`frontend/src/context/ThemeContext.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/context/ThemeContext.jsx) &rarr; persists dark/light theme tokens.
  - `ToastContext`: [`frontend/src/context/ToastContext.jsx`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/context/ToastContext.jsx) &rarr; global toast notification system.
- **HTTP Client**: Axios instance in [`frontend/src/services/api.js`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/services/api.js):
  - Base URL: `VITE_API_URL` (resolves to `http://localhost:8080/api`).
  - Request Interceptor: Injects `Authorization: Bearer <token>` for all protected endpoints.
  - Response Interceptor: Listens for `401 Unauthorized` and clears invalid credentials from `localStorage`.

---

## 4. Backend Architecture (Spring Boot)

- **Entry Point**: [`com.example.backend.BackendApplication`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/BackendApplication.java)
- **Security & Authorization**:
  - [`SecurityConfig.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/config/SecurityConfig.java) defines stateless session management, CORS configuration for all origins, and route matchers.
  - [`JwtAuthenticationFilter.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/security/JwtAuthenticationFilter.java) intercepts requests, extracts Bearer tokens, validates HMAC signatures, and populates `SecurityContextHolder`.
  - [`JwtService.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/security/JwtService.java) generates 24-hour expiration tokens with email claims.
- **Password Security**: BCrypt password encoder (`BCryptPasswordEncoder`).
- **Database Persistence**: Spring Data JPA with Hibernate dialect (`MySQLDialect`), `ddl-auto=update`, HikariCP connection pooling.

---

## 5. Machine Learning Architecture (FastAPI)

- **Entry Point**: [`machine_learning/api/app.py`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/machine_learning/api/app.py)
- **Model Pipeline**: Serialized Scikit-Learn `ElasticNetPipeline` loaded from `machine_learning/models/elastic_net_model4.pkl`.
- **Inputs**: `budget`, `runtime`, `release_year`, `release_month`, `original_language`, `main_country`, `genres` (one-hot encoded for 18 distinct film genres).
- **Transformation**: Logarithmic feature scaling (`np.log1p` on budget) and exponential inversion (`np.expm1` on prediction).
- **Output**: Point estimate for total worldwide box office revenue in USD and USD millions.

---

## 6. External Integrations

### 1. TMDB (The Movie Database) API
- **Protocol**: HTTPS REST API (`https://api.themoviedb.org/3`)
- **Backend Service**: [`TmdbService.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/service/TmdbService.java)
- **Authentication**: Bearer token specified in `tmdb.api.token` (`application.properties`).
- **Caching**: Thread-safe in-memory `ConcurrentHashMap<String, CacheEntry>` with TTLs ranging from 10 minutes (search) to 24 hours (genre lists) to minimize latency and third-party rate limits.
- **Fallbacks**: Built-in fallback JSON structures prevent catastrophic page crashes if TMDB is unreachable.

### 2. Firebase Authentication (Optional/Hybrid)
- **Configuration**: [`FirebaseConfig.java`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/backend/src/main/java/com/example/backend/config/FirebaseConfig.java) and [`firebase.js`](file:///c:/Users/DELL/OneDrive/Desktop/Cinephile/frontend/src/firebase/firebase.js).
- Handles social logins / token verification if initialized.
