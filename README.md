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

## License

Private / assignment project.
