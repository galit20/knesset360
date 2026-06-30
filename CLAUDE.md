# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Knesset360 is a third-year CS final project (Ayala Egoz & Galit Oren, 2026) that visualizes Israeli Parliament (Knesset) legislative data — faction statistics, bill submission/passage rates, top MKs, and committee activity across Knessets 20–25.

## Commands

### Frontend (`knesset360-frontend/`)

```bash
npm install       # install dependencies
npm run dev       # dev server on http://localhost:5173
npm run build     # production build
npm run lint      # ESLint
npm run preview   # preview production build
```

### Backend (`knesset360-backend/app/`)

```bash
# Run from knesset360-backend/app/ so imports resolve correctly
uvicorn main:app --reload   # API server on http://localhost:8000
```

### Database

PostgreSQL credentials live in `db-files/database.ini` (not committed). The full schema is in `db-files/whole_knesset_db.sql` (~38 MB). Load it with:

```bash
psql -U postgres -d Knesset360_db -f db-files/whole_knesset_db.sql
```

## Architecture

### Structure

```
knesset360/
├── knesset360-frontend/     # React 19 + Vite + React Router 7
├── knesset360-backend/app/  # FastAPI + psycopg2
│   ├── main.py              # All API routes
│   ├── db.py                # PostgreSQL connection helper
│   └── config.py            # database.ini parser
└── db-files/                # DB config, SQL dump, utility scripts
```

### Frontend → Backend communication

The frontend calls the backend directly via `fetch()` against `http://localhost:8000`. All calls are GET requests with query parameters. There is no shared types layer — the JSON shape is implicit between `main.py` and the React components.

Routing uses React Router v7 (`BrowserRouter`). Implemented routes: `/` (Home) and `/factions`. Routes `/timeline`, `/statistics`, and `/about` exist in the NavBar but have no page components yet.

### Backend design

All routes are in `knesset360-backend/app/main.py`. The backend uses raw SQL via `psycopg2` with `RealDictCursor` (returns rows as dicts). There is no ORM.

The **faction name alias system** (`FACTION_NAME_ALIASES` dict + `normalize_faction_name()`) is critical — faction names in the DB vary by Knesset term (e.g., names include party leader names). Every route that looks up bills by faction name must call `normalize_faction_name()` on the faction name before querying, otherwise bill counts will be wrong or zero.

### Database schema (key tables)

| Table | Purpose |
|---|---|
| `kns_faction` | Political parties; `knessetnum` ties to a specific Knesset |
| `kns_bill` | Bills; `statusid=118` means passed into law |
| `kns_billinitiator` | Links bills to MKs; `isinitiator=true` marks primary sponsors |
| `kns_persontoposition` | Links MKs to factions via `factionname` (text, not FK) |
| `kns_person` | MK personal info |
| `kns_committee` | Committees |

Bills are linked to factions through `kns_billinitiator → kns_persontoposition.factionname` (a denormalized text match, not a foreign key). This is why `TRIM()` and name normalization are required in every faction-scoped query.

Bill status groups used throughout:
- **עברו** (passed): `statusid = 118`
- **בתהליך** (in progress): a large set of status IDs
- **נעצרו** (stopped): `statusid IN (177, 122, 124, 110)`

### Faction logos

Static images are served from `knesset360-frontend/public/faction-logos/`. The frontend maps faction names to logo filenames. New factions need both a logo file added here and a mapping in the frontend component.
