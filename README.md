# Incident Tracker

A full-stack web app for creating, browsing, and managing production incidents. The frontend offers filtering, sorting, pagination, and a detail panel; the backend exposes a REST API with SQLite storage and request validation.

## Tech Stack

| Layer   | Stack |
|--------|--------|
| **Frontend** | React 18, TypeScript, Vite, Axios |
| **Backend**  | Node.js, Express, TypeScript, SQLite3, Zod (validation) |

## Project Structure

```
incident-tracker-assignment/
├── frontend/           # React + Vite app
│   ├── src/
│   │   ├── api.ts           # API client
│   │   ├── types.ts         # Shared types
│   │   ├── App.tsx
│   │   └── components/      # IncidentFilters, IncidentTable, IncidentDetail, CreateIncidentForm
│   └── package.json
├── backend/            # Express API
│   ├── src/
│   │   ├── server.ts        # Routes and app setup
│   │   ├── db.ts            # SQLite DB and schema
│   │   ├── validation.ts    # Zod schemas
│   │   └── seed.ts          # Sample data seeder
│   ├── data/                # incidents.db (created at runtime)
│   └── package.json
└── README.md
```

## Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (or yarn/pnpm)

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

- API runs at **http://localhost:4000**
- Database file: `backend/data/incidents.db` (created automatically)

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

- App runs at **http://localhost:5173**
- CORS is set for `http://localhost:5173`; ensure the backend is running when using the UI.

### 3. Seed sample data (optional)

To populate the DB with 200 sample incidents:

```bash
cd backend
npm run seed
```

## Scripts

### Backend (`backend/package.json`)

| Script   | Command | Description |
|----------|---------|-------------|
| `dev`    | `ts-node-dev --respawn --transpile-only src/server.ts` | Run API with hot reload |
| `build`  | `tsc`   | Compile TypeScript to `dist/` |
| `start`  | `node dist/server.js` | Run compiled server |
| `seed`   | `ts-node-dev --transpile-only src/seed.ts` | Seed incidents table |

### Frontend (`frontend/package.json`)

| Script   | Command | Description |
|----------|---------|-------------|
| `dev`    | `vite`  | Dev server on port 5173 |
| `build`  | `vite build` | Production build |
| `preview`| `vite preview` | Preview production build |

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/health` | Health check |
| `GET`  | `/api/incidents` | List incidents (paginated, filterable, sortable) |
| `GET`  | `/api/incidents/:id` | Get one incident |
| `POST` | `/api/incidents` | Create incident |
| `PATCH`| `/api/incidents/:id` | Update incident |

### List query parameters

- `page`, `pageSize` — Pagination (defaults: 1, 20; max pageSize 100)
- `search` — Full-text search on title, service, owner, summary
- `severity` — Filter by SEV1, SEV2, SEV3, SEV4
- `status` — Filter by OPEN, MITIGATED, RESOLVED
- `service`, `owner` — Exact match filters
- `sortBy` — One of: `createdAt`, `updatedAt`, `severity`, `status`, `service`, `title`
- `sortOrder` — `asc` or `desc`

### Incident payload

- **Required:** `title`, `service`, `severity` (SEV1–SEV4)
- **Optional:** `status` (default OPEN), `owner`, `summary`

## Features

- **Create incidents** — Form in the sidebar with validation
- **List & paginate** — Table with server-side pagination
- **Filter** — By search text, severity, status (and API supports service/owner)
- **Sort** — By date, severity, status, service, title (asc/desc)
- **View & edit** — Click a row to open detail in the sidebar; edit and save
- **Validation** — Backend uses Zod; frontend uses the same types

---

## Design decisions & tradeoffs

| Decision | Rationale | Tradeoff |
|----------|-----------|----------|
| **SQLite** | No separate DB server; single file, easy to run and seed. Fits an assignment and small/medium datasets. | Not ideal for high concurrency or horizontal scaling; would swap for Postgres in production. |
| **All API routes in `server.ts`** | Single file keeps the API easy to follow for a small surface area. | With more endpoints, would split into route modules and shared middleware. |
| **React state only (no Redux/React Query)** | `useState`/`useEffect` and one `loadIncidents()` keep dependencies minimal and behavior explicit. | No built-in cache or deduplication; refetch on every filter/sort/page change. With more time, would use React Query or SWR. |
| **Zod only on backend** | Request validation and clear 400 responses without pushing Zod into the frontend bundle. | Types are duplicated in `frontend/src/types.ts`; a shared package or codegen would keep them in sync. |
| **Server-side pagination** | Keeps response size bounded and works with large tables. | More round-trips than infinite scroll; acceptable for an admin-style list. |
| **Debounced search (400ms)** | Reduces requests while typing and avoids hammering the API. | Slight delay before results update; tunable. |
| **CORS origin `http://localhost:5173`** | Simple for local dev with Vite’s default port. | Production would need `CORS_ORIGIN` (or similar) from env. |
| **No delete endpoint** | Scope focused on create, list, filter, sort, and update. | Delete could be added later with soft-delete or hard delete plus UI. |

---

## Improvements with more time

- **Shared types/schemas** — Monorepo or a shared package so frontend and backend use one source of truth (e.g. Zod schemas) and avoid drift.
- **Server state library** — React Query or SWR for caching, deduplication, optimistic updates, and clearer loading/error states.
- **Testing** — Unit tests (Vitest/Jest) for validation and API client; E2E (Playwright/Cypress) for critical flows (create, filter, edit).
- **Config & env** — `VITE_API_URL` and backend `CORS_ORIGIN`/`PORT` from environment for different deployments.
- **Backend structure** — Route modules (`routes/incidents.ts`), shared validation middleware, and a small service layer for DB access.
- **UX** — Skeleton loaders, error boundaries, toast notifications for create/update, and clearer empty states.
- **Accessibility** — ARIA labels, keyboard navigation, and focus management in the table and sidebar.
- **Delete incident** — `DELETE /api/incidents/:id` plus confirmation in the UI (and optional soft-delete).
- **Postgres (or similar)** — For production: migrations, connection pooling, and better concurrency than SQLite.

---

## Submitting to the hiring team

Share the **repository link** with the hiring team upon completion so they can clone, run, and review the project.

---

## License

Private / assignment project.
