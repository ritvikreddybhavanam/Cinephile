# Cinephile QA & E2E Testing Knowledge Base

## Overview
This knowledge base provides an implementation-verified reference of the entire Cinephile full-stack application. It is designed so that any engineer or automated AI assistant can write and maintain robust Playwright end-to-end tests without needing to rediscover or reverse-engineer the codebase.

All claims in these documents are grounded in source code inspection of frontend React components, Spring Boot controllers, services, JPA repositories, MySQL schemas, FastAPI machine learning services, and external integrations (TMDB, Firebase).

---

## Document Index

| Document | Purpose & Scope |
| :--- | :--- |
| **[1. APPLICATION_ARCHITECTURE.md](./APPLICATION_ARCHITECTURE.md)** | Full-stack architecture, runtime services, ports, startup procedures, data flow, JWT authentication, and external integrations. |
| **[2. FEATURE_INVENTORY.md](./FEATURE_INVENTORY.md)** | Complete catalog of 14 major feature modules, user-visible entry points, implementation status, and source file evidence. |
| **[3. ROUTE_AND_COMPONENT_INVENTORY.md](./ROUTE_AND_COMPONENT_INVENTORY.md)** | Exhaustive matrix of all 32 frontend routes, route guards, URL parameters, states, and shared reusable UI components. |
| **[4. API_AND_DATABASE_MAP.md](./API_AND_DATABASE_MAP.md)** | Specification of all 42 REST API endpoints, HTTP contracts, DTO payloads, JPA entities, tables, relationships, and constraints. |
| **[5. PLAYWRIGHT_TEST_CATALOG.md](./PLAYWRIGHT_TEST_CATALOG.md)** | 50+ uniquely identified test scenarios (P0–P3) covering happy-path, boundary, negative, auth, pagination, race condition, and regression tests. |
| **[6. TEST_DATA_AND_ENVIRONMENT.md](./TEST_DATA_AND_ENVIRONMENT.md)** | Test data requirements, database isolation, test account seeding, network interception/mocking strategy, and CI execution. |
| **[7. PLAYWRIGHT_IMPLEMENTATION_PLAN.md](./PLAYWRIGHT_IMPLEMENTATION_PLAN.md)** | Architecture for tests: Page Object Models (POM), fixtures, storage states, custom selectors, mobile projects, and reporting. |
| **[8. KNOWN_GAPS_AND_RISKS.md](./KNOWN_GAPS_AND_RISKS.md)** | Codebase audit findings, security observations, client/server validation mismatches, rate limit risks, and testability gaps. |
| **[9. AUDIT_COVERAGE.md](./AUDIT_COVERAGE.md)** | End-to-end traceability matrix mapping Features &rarr; Routes &rarr; APIs &rarr; Database Entities &rarr; Test Scenarios. |

---

## Instructions for Test Authors & AI Agents

1. **Do not fabricate endpoints or selectors**: Consult [API_AND_DATABASE_MAP.md](./API_AND_DATABASE_MAP.md) and [ROUTE_AND_COMPONENT_INVENTORY.md](./ROUTE_AND_COMPONENT_INVENTORY.md) for actual endpoints and CSS/DOM selectors.
2. **Handle Protected Routes**: 26 of the 32 frontend routes require authentication via `PrivateRoute` (`localStorage.token`). Use Playwright storage state fixtures documented in [PLAYWRIGHT_IMPLEMENTATION_PLAN.md](./PLAYWRIGHT_IMPLEMENTATION_PLAN.md).
3. **External Dependencies**: TMDB API is proxied through the backend with server-side caching. When running tests in hermetic environments, intercept `/api/tmdb/**` routes using Playwright's `page.route()`.
4. **Machine Learning Service**: Ensure the Python FastAPI service is running on port `8000` when executing Box Office Prediction tests (`FEAT-PRED`).
