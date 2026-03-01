# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIPENSA (based on Whaticket) is a multi-tenant omnichannel communication platform focused on WhatsApp, with AI agents, marketing automation (Meta Ads), and workflow builders. Backend is Express/TypeScript, frontend is React/TypeScript.

## Common Commands

### Backend (run from `backend/`)
```bash
npm run dev:server          # Dev server with hot reload (ts-node-dev)
npm run build               # TypeScript compile to dist/
npm start                   # Production (node dist/server.js)
npm run start:cluster       # Production cluster mode (node dist/server-cluster.js)
npm run db:migrate          # Run Sequelize migrations (requires build first)
npm run db:seed             # Run seeders
npm test                    # Jest tests (NODE_ENV=test, runs migrations first)
npm run lint                # ESLint
```

**Important:** Sequelize CLI reads from `dist/` (see `.sequelizerc`), so you must `npm run build` before running migrations.

### Frontend (run from `frontend/`)
```bash
npm start                   # Dev server (CRA, requires --openssl-legacy-provider)
npm run build               # Production build (no sourcemaps)
npm test                    # React testing
```

### Docker
```bash
docker-compose up -d                          # Production (uses PM2 cluster mode)
docker-compose -f docker-compose.local.yml up -d  # Local dev (ports: 5433/6380/8082/3001)
```

## Architecture

### Backend (`backend/src/`)

**Entry point:** `server.ts` → `app.ts` (Express setup). Cluster: `server-cluster.ts`.

**Request flow:** Routes → Middleware (isAuth) → Controllers → Services → Models (Sequelize/PostgreSQL)

**Key architectural layers:**
- `routes/` — Express route definitions (52 files). Public API routes in `routes/api/`.
- `middleware/` — Auth (`isAuth`), rate limiting (`rateLimiter.ts`), token verification.
- `controllers/` — Request/response handling (50 files). API controllers in `controllers/api/`.
- `services/` — Business logic (56 service directories). This is where most logic lives.
- `models/` — Sequelize models (62 models). Multi-tenant via `companyId` on most models.
- `config/` — Configuration modules: `cors.ts` (shared CORS origins), `upload.ts`, `database.ts`, `redis.ts`, `auth.ts`.
- `libs/` — Shared infrastructure: `wbot.ts` (Baileys WhatsApp client manager), `socket.ts` (Socket.IO + Redis adapter), `queue.ts` (Bull wrapper), `cache.ts`.
- `queues.ts` — Central queue definitions and handlers (~2000 lines). Manages: UserMonitor, ScheduleMonitor, SendScheduledMessages, CampaignQueue, MessageQueue. Queue concurrency is configurable via `QUEUE_CONCURRENCY_*` env vars.
- `jobs/` — Individual job handlers consumed by Bull queues.
- `HubEcosystem/` — Alternative channel integration (Typebot). Has its own controllers/services/routes.

**Real-time:** Socket.IO with `@socket.io/redis-adapter` for horizontal scaling. Events namespaced by companyId: `company-${companyId}-ticket`, etc.

**Multi-tenancy:** Almost all models and queries are scoped by `companyId`. Companies have Plans with feature limits. The `isAuth` middleware extracts `companyId` from JWT.

**WhatsApp integration:** `libs/wbot.ts` manages Baileys sessions. `services/WbotServices/wbotMessageListener.ts` is the main message handler (~5000+ lines). Messages flow through queues for rate limiting (`REDIS_OPT_LIMITER_MAX` / `REDIS_OPT_LIMITER_DURATION`).

### Frontend (`frontend/src/`)

**Stack:** React 16 + Material-UI v4/v5 + Zustand + Socket.IO client.

- `pages/` — Route-level components (57 directories). Major pages: Dashboard, Chat, Contacts, Campaigns, FlowBuilder, Kanban, AgentSetup.
- `components/` — Reusable components (100+).
- `context/` — React Contexts: Auth, Socket, Tickets, etc.
- `stores/` — Zustand state stores.
- `HubEcosystem/` — Alternative channel UI components.
- `translate/` — i18n translations.

### Database

**PostgreSQL 12** with Sequelize v5 ORM. 285+ migrations in `backend/src/database/migrations/`. Connection config in `backend/src/config/database.ts` with configurable pool (5-20 connections).

Key model relationships:
- Company → Users, Tickets, Contacts, Whatsapps, Queues, Plans
- Ticket → Messages, Contact, User (agent), Queue, Tags
- Whatsapp → WhatsappQueues → Queues

## Environment Variables

Backend: copy `backend/.env.exemple` → `backend/.env`. See `.env.exemple` for full list with documentation.

Key vars:
- `DB_*` — PostgreSQL connection
- `REDIS_URI` — Redis connection (used by Bull queues, Socket.IO adapter, rate limiter)
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — Auth tokens (generate with `openssl rand -hex 32`)
- `COMPANY_TOKEN` — API auth token (must be unique and strong)
- `FRONTEND_URL` / `BACKEND_URL` — Public URLs (used in CORS, email links, etc.)
- `EXTRA_CORS_ORIGINS` — Additional CORS origins (comma-separated)
- `QUEUE_CONCURRENCY_*` — Bull queue concurrency settings
- `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` — Meta integration
- `STRIPE_*` — Payment processing

Frontend: copy `frontend/.env.exemple` → `frontend/.env`. Key var: `REACT_APP_BACKEND_URL`.

Testing: `backend/.env.test` is committed with test-specific DB/Redis config.

## Code Conventions

- **Logger:** Use `import logger from "../utils/logger"` (Winston/Pino). Never use `console.log` in production code — ESLint `no-console` is set to `warn`. Never log `req.body`, `req.params`, tokens, passwords, or full error objects.
- **SQL:** Always use Sequelize `replacements: {}` for raw queries. Never interpolate variables into SQL strings.
- **Auth:** All routes must use `isAuth` middleware unless they are intentionally public (e.g., `/api/imaginasoft/*`, `/api/clinic/*`). Public routes must have rate limiting (`clinicLimiter` or `webhookLimiter`).
- **CORS:** Managed centrally in `backend/src/config/cors.ts`. Localhost origins are only included when `NODE_ENV !== production`. Additional origins via `EXTRA_CORS_ORIGINS` env var.
- **Secrets:** No hardcoded credentials or domain names. All secrets and URLs go in environment variables. Never use fallback hardcoded values for passwords.
- **Input validation:** Use Yup schemas in controllers for user-facing endpoints (see `UserController` for pattern).
- **Services pattern:** Business logic goes in `services/`, controllers are thin wrappers that call services and return responses.
- **Socket events:** Emit via `getIO().of(String(companyId)).emit(...)` with company namespace.
- **File paths:** Use `__dirname`-based detection for src/dist paths. Never hardcode `localhost:8090` or other dev URLs.
- **Nginx:** Use `.template` files with `${BACKEND_DOMAIN}` / `${FRONTEND_DOMAIN}` placeholders. Generate actual config via `envsubst`.
