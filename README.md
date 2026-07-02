# Knesset360

**An open data platform for tracking, analyzing, and visualizing Israeli parliamentary activity**

> Final Year Project — B.Sc. Computer Science, Ben-Gurion University of the Negev
> **Ayala Egoz & Galit Rachel Oren** | Supervisor: Prof. Niv Gilboa | 2025–2026

---

## Live Site

The platform is fully deployed and accessible at:

**[https://knesset360.vercel.app](https://knesset360.vercel.app)**

No installation or local setup is needed to view the project — everything runs in the cloud.

> **Note:** The app may take a few seconds to load on first visit as the backend wakes from sleep.

---

## What is Knesset360?

Knesset360 is a parliamentary platform that makes Knesset data accessible to the general public. The system aggregates data from multiple government sources, processes it, and presents it in a visual, interactive, data-driven way — with no political bias.

The project covers Knessets 20–25 (2015 to present) and presents hundreds of thousands of records including bills, committee sessions, members of Knesset, factions, and votes.

---

## Pages

### Home
Overview of the project, key facts, a countdown to the next election, and entry points to the four analysis topics: Health, Education, Crime, and Road Safety.

### Timeline
An interactive timeline that correlates parliamentary activity with real-world social indicators across four domains:
- **Topic filtering** — switch between Health, Education, Crime, and Road Safety; each topic loads its own dataset and visualizations
- **Dual-axis charts** — overlay Knesset legislation volume with external indicators (e.g. hospital wait times, crime rates, road fatality counts) to surface correlations over time
- **Historical event markers** — key Knesset milestones (elections, wars, government formations) are pinned on the timeline so trends can be interpreted in political context
- **Data sourced from multiple agencies** — CBS, Ministry of Health, Ministry of Education, Israel Police, and Data.gov.il, all normalized and aligned to the same time axis

### Factions
An in-depth analysis of parliamentary factions:
- **Parliament arc infographic** — interactive seat map showing the distribution of seats by faction
- Faction leaders and official logos
- **Voting deviations** — identifying MKs who voted against their faction's position
- **Top MKs** — most active members by number of bill initiations
- Navigation across Knessets 20–25

### Dashboard
Main control panel featuring:
- **Stat cards** — MK count, mid-term replacements, total bills, government ministries per Knesset
- **Bills per month chart** with historical reference lines (Iron Swords, Guardian of the Walls, Roaring Lion)
- **Active committees** — ranked by number of sessions
- **Seat distribution** by faction
- **Committee calendar** — interactive monthly calendar showing committee sessions by day
- **Last week summary** (Knesset 25 only) — plenum sessions, committee sessions, bills passed/failed/in-progress, most active committees and MKs

### About
Project description, data sources, tech stack, and the data processing pipeline.

---

## Technical Architecture

```
┌─────────────────────┐        ┌─────────────────────┐
│   React Frontend    │◄──────►│   FastAPI Backend   │
│   (Vite, Recharts)  │  HTTP  │   (Python, uvicorn) │
│      Vercel         │        │       Render        │
└─────────────────────┘        └──────────┬──────────┘
                                          │
                               ┌──────────▼───────────┐
                               │  PostgreSQL Database │
                               │        Neon          │
                               │  (20 tables, 1M+     │
                               │      records)        │
                               └──────────────────────┘
                                          │
                               ┌──────────▼───────────┐
                               │    Elasticsearch     │
                               │    Elastic Cloud     │
                               │  MKs, Committees &   │
                               │  Plenums records     │
                               │       (5GB)          │
                               └──────────────────────┘
```

### Frontend
- **React 18** + **Vite** — modern UI framework
- **React Router** — client-side navigation
- **Recharts** — charts and data visualizations
- Hebrew RTL layout, custom color palette, IBM Plex Sans Hebrew font

### Backend
- **FastAPI** (Python) — REST API
- **PostgreSQL** — relational database with 20 tables
- **psycopg2** — PostgreSQL connector
- **Elasticsearch** — search engine (integrated and ready)

### Data Sources

| Source | Content |
|---|---|
| Knesset OData API | Bills, votes, committees, MKs, factions |
| CBS (Central Bureau of Statistics) | Health, education, crime, population data |
| Ministry of Health | Public health indicators |
| Ministry of Education | Budgets and education metrics |
| Israel Police | Crime and road safety statistics |
| Data.gov.il | Crime and road safety statistics |

---

## Deployment & Infrastructure

The project is fully deployed using cloud-managed services with zero local dependencies.

| Layer | Service | Details |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | React/Vite app, auto-deployed from GitHub on every push. Global CDN, zero-config HTTPS. |
| **Backend** | [Render](https://render.com) | FastAPI Python server running on a free-tier web service. Spins up on request. |
| **Database** | [Neon](https://neon.tech) | Serverless PostgreSQL. Hosts all 20 relational tables with 1M+ records. Scales automatically. |
| **Search** | [Elastic Cloud](https://cloud.elastic.co) | Managed Elasticsearch cluster (~5GB) indexing MK speeches, committee sessions, and plenum records for full-text search. |

### Deployment Flow
```
GitHub push
    └─► Vercel (frontend auto-build)
    └─► Render (backend, manual or auto-deploy)
             └─► Neon PostgreSQL  (always-on serverless DB)
             └─► Elastic Cloud    (managed search cluster)
```

---

## Running Locally (Development)

### Prerequisites
- Python 3.13+
- Node.js 24+
- PostgreSQL 18+

### Backend
```bash
cd knesset360-backend
pip install -r requirements.txt
# Configure DB connection in app/config.py
cd app
python -m uvicorn main:app --reload
# API runs at http://localhost:8000
```

### Frontend
```bash
cd knesset360-frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

### Database
Import data from the SQL file:
```bash
psql -U postgres -d knesset360 -f db-files/whole_knesset_db.sql
```
> Please contact us for the SQL file if needed.

---

## Project Structure

```
knesset360/
├── knesset360-frontend/       # React/Vite
│   ├── src/
│   │   ├── pages/             # Home, Timeline, Factions, Dashboard, About
│   │   ├── components/        # MkAvatar, EmptyStateBanner
│   │   └── App.jsx            # Main router
│   └── public/
│       ├── mk-photos/         # MK photos (keyed by personid)
│       └── faction-logos/     # Faction logos
├── knesset360-backend/        # FastAPI/Python
│   ├── app/
│   │   ├── main.py            # All API endpoints
│   │   ├── db.py              # PostgreSQL connection
│   │   └── config.py          # Environment config
│   ├── faction_platforms/     # Faction platform JSON files
│   └── static_data/           # Static CSV datasets
└── db-files/                  # SQL scripts and backups
```

---

## Main API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/dashboard/stats` | General statistics per Knesset |
| `GET /api/dashboard/bills-per-month` | Bills grouped by month |
| `GET /api/dashboard/hot-committees` | Most active committees |
| `GET /api/dashboard/faction-seats` | Seat count by faction |
| `GET /api/dashboard/committee-calendar` | Committee sessions by month |
| `GET /api/dashboard/last-week-summary` | Last week summary (Knesset 25) |
| `GET /api/factions` | List of factions |
| `GET /api/factions/{id}/voting-deviations` | Voting deviation analysis |
| `GET /api/timeline/{subject}` | Timeline data by topic |

---

## Team

| | |
|---|---|
| **Ayala Egoz** | Full-stack development, UI/UX design, database queries |
| **Galit Rachel Oren** | Full-stack development, data processing, architecture |
| **Supervisor** | Prof. Niv Gilboa |
| **Institution** | Ben-Gurion University of the Negev, Dept. of Computer Science |

---

*© 2026 Ayala Egoz & Galit Rachel Oren — All rights reserved*