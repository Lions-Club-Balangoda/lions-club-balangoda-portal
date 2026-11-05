# Lions Club of Balangoda — Community Web Portal & CMS

> **IS5109 Community Project** · Group 14 · Department of Computing & Information Systems, Sabaragamuwa University of Sri Lanka
>
> Client: Lions Club of Balangoda (Lions Clubs International District 306)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Local Development Setup](#4-local-development-setup)
5. [Environment Variables](#5-environment-variables)
6. [Available Scripts](#6-available-scripts)
7. [Architecture — Layered MVC](#7-architecture--layered-mvc)
8. [Database](#8-database)
9. [Contributing & Branch Workflow](#9-contributing--branch-workflow)
10. [Team](#10-team)

---

## 1. Project Overview

A responsive, mobile-first web portal and administrative CMS for the Lions Club of Balangoda, replacing fragmented social-media archives with a single authoritative digital home. The portal enables:

- Public browsing of community projects, news, and the executive board directory.
- Structured volunteer sign-up and sponsor inquiry forms with automated email notifications.
- A code-free admin CMS for club officers to publish content without technical knowledge.

**Key references:** `Docs/project-proposal.md` (source of truth for all requirements, entities, and acceptance criteria).

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 |
| **Backend API** | Node.js · Express (`server/`) |
| **Database** | PostgreSQL 14+ |
| **Media CDN** | Cloudinary |
| **Email** | SMTP (Resend / Brevo / Gmail SMTP) |
| **Hosting** | Vercel (frontend) · Render / VPS (API) |
| **Linting** | ESLint (Next.js config) · Prettier |
| **VCS** | Git · GitHub |

---

## 3. Folder Structure

```
lions-club-balangoda-portal/
│
├── .github/                        # GitHub configurations
│   └── pull_request_template.md    # Standardised PR checklist
│
├── database/                       # SQL migrations & seeds (Zahi's work)
│   ├── migrations/                 # 001_initial_schema.sql, etc. (run in order)
│   └── seeds/                      # 001_initial_seed.sql (idempotent baseline data)
│
├── Docs/                           # Project documentation
│   ├── project-proposal.md         # Approved proposal — single source of truth
│   └── ...                         # Architecture specs, QA docs, etc.
│
├── public/                         # Static assets served at root URL
│
├── scripts/                        # Developer utility scripts
│   ├── migrate.ts                  # Runs database/migrations/*.sql in order
│   └── seed.ts                     # Loads database/seeds/*.sql (idempotent)
│
├── server/                         # Express REST API (layered MVC)
│   ├── config/
│   │   ├── database.ts             # DB connection config (reads from env)
│   │   └── env.ts                  # Startup env-variable validation
│   ├── controllers/                # HTTP handlers — parse request, call service, send response
│   ├── middleware/
│   │   ├── authenticate.ts         # JWT / session verification
│   │   └── errorHandler.ts         # Centralised error responses
│   ├── repositories/               # Data-access layer — raw DB queries only
│   ├── routes/                     # Express routers — map HTTP verbs → controllers
│   ├── services/                   # Business logic — calls repositories, never HTTP
│   ├── types/                      # Shared TypeScript interfaces for the API layer
│   ├── utils/                      # Shared helpers (slug generation, sanitisation, etc.)
│   └── index.ts                    # Express app entry point
│
├── src/                            # Next.js App Router source
│   ├── app/                        # Route segments, layouts, page.tsx files
│   ├── components/                 # Reusable UI components, organised by domain
│   │   ├── board/                  # Executive board components
│   │   ├── forms/                  # Volunteer & inquiry form components
│   │   ├── layout/                 # Header, Footer, Navigation
│   │   ├── news/                   # News & announcement components
│   │   ├── projects/               # Project card, list, gallery components
│   │   └── ui/                     # Generic design-system primitives (Button, Badge, etc.)
│   ├── data/                       # Static / mock data for development
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Pure utility functions (filtering, sanitisation)
│   ├── styles/                     # Global styles, design tokens
│   └── types/                      # Shared TypeScript types (project, news, board, etc.)
│
├── tests/                          # Test files (*.test.mjs, *.test.ts)
│
├── .env.example                    # Environment variable template — commit this
├── .gitignore                      # Excludes secrets, build artefacts, OS files
├── .prettierrc.json                # Prettier formatting rules
├── .prettierignore                 # Prettier exclusions
├── eslint.config.mjs               # ESLint rules (Next.js + TypeScript)
├── next.config.ts                  # Next.js configuration
├── package.json                    # Dependencies & npm scripts
├── tsconfig.json                   # TypeScript config for Next.js (frontend)
├── tsconfig.server.json            # TypeScript config for Express (backend)
└── CONTRIBUTING.md                 # Full team workflow guide
```

---

## 4. Local Development Setup

> **Target:** a fresh clone running frontend, backend, and database locally in under 30 minutes.

### Prerequisites

| Tool | Minimum version | Install |
|---|---|---|
| Node.js | 20 LTS | https://nodejs.org |
| npm | 10+ | bundled with Node.js |
| PostgreSQL | 14 | https://www.postgresql.org/download/ |
| Git | 2.40+ | https://git-scm.com |

### Step-by-step

**1. Clone the repository**

```bash
git clone https://github.com/Lions-Club-Balangoda/lions-club-balangoda-portal.git
cd lions-club-balangoda-portal
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Your local PostgreSQL credentials (see step 4) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` and paste the output |
| `CLOUDINARY_*` | Free account at https://cloudinary.com (can skip for non-media work) |
| `SMTP_*` | Use Mailtrap (https://mailtrap.io) for local email testing |

**4. Set up local PostgreSQL database**

```bash
# Using psql (macOS / Linux)
psql -U postgres -c "CREATE DATABASE lions_club_balangoda;"
psql -U postgres -c "CREATE USER db_user WITH ENCRYPTED PASSWORD 'db_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE lions_club_balangoda TO db_user;"
```

> On **Windows** use pgAdmin or run the same commands in the psql shell.

**5. Run database migrations**

```bash
npm run db:migrate
```

This applies all SQL files from `database/migrations/` in order. It is safe to run multiple times.

**6. Load seed data**

```bash
npm run db:seed
```

Populates the database with an initial admin user, board terms, executive members, impact statistics, and sample content. All inserts use `ON CONFLICT DO NOTHING` — safe to re-run.

**7. Start the Next.js frontend** (in one terminal)

```bash
npm run dev
```

Runs at **http://localhost:3000**

**8. Start the Express backend API** (in a second terminal)

```bash
npm run server:dev
```

Runs at **http://localhost:4000**  
Health check: http://localhost:4000/api/health

---

### Verification checklist

After completing the steps above, confirm:

- [ ] `http://localhost:3000` loads the Next.js default page without errors.
- [ ] `http://localhost:4000/api/health` returns `{ "status": "ok", ... }`.
- [ ] Database tables exist — run `psql -d lions_club_balangoda -c "\dt"` and see the schema tables.
- [ ] Seed data is present — run `psql -d lions_club_balangoda -c "SELECT username, role FROM users;"` and see `admin_balangoda`.

If anything fails, check the [Troubleshooting](#troubleshooting) section below.

---

### Troubleshooting

**`DATABASE_URL is not set` error on `db:migrate` or `db:seed`**
→ Ensure `.env.local` exists and contains a valid `DATABASE_URL`. Run `export DATABASE_URL=...` manually if needed, or install `dotenv-cli`: `npx dotenv-cli -e .env.local -- npm run db:migrate`.

**`pg` package not found during seed/migrate**
→ The `pg` driver must be installed: `npm install pg @types/pg`.

**Next.js port 3000 already in use**
→ Kill the process: `npx kill-port 3000`, then re-run `npm run dev`.

**PostgreSQL: role "db_user" does not exist**
→ Re-run step 4 above. Confirm with `psql -U postgres -c "\du"`.

---

## 5. Environment Variables

All configuration is loaded from environment variables. **No secrets are committed.**

See [`.env.example`](.env.example) for the full list with descriptions.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | JWT signing secret (min 32 chars) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Frontend base URL |
| `API_PORT` | Optional | Express server port (default: 4000) |
| `CLOUDINARY_CLOUD_NAME` | For uploads | Cloudinary account name |
| `CLOUDINARY_API_KEY` | For uploads | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | For uploads | Cloudinary API secret |
| `SMTP_HOST` | For emails | SMTP server host |
| `SMTP_PORT` | For emails | SMTP port (587 for STARTTLS) |
| `SMTP_USER` | For emails | SMTP username |
| `SMTP_PASSWORD` | For emails | SMTP password |
| `EMAIL_FROM` | For emails | Sender address |
| `ADMIN_NOTIFICATION_EMAIL` | For emails | Admin receiving address |

---

## 6. Available Scripts

| Script | Command | Description |
|---|---|---|
| Dev server (frontend) | `npm run dev` | Next.js with Turbopack, hot reload |
| Build (frontend) | `npm run build` | Production Next.js build |
| Start (frontend) | `npm run start` | Serve production build |
| Dev server (backend) | `npm run server:dev` | Express with `--watch` hot reload |
| Build (backend) | `npm run server:build` | TypeScript → `dist/` via tsconfig.server.json |
| Lint | `npm run lint` | ESLint check |
| Lint + fix | `npm run lint:fix` | ESLint auto-fix |
| Format | `npm run format` | Prettier write |
| Format check | `npm run format:check` | Prettier check (CI-friendly) |
| Migrate | `npm run db:migrate` | Apply pending SQL migrations |
| Seed | `npm run db:seed` | Load baseline seed data |
| Test | `npm test` | Node.js built-in test runner |

---

## 7. Architecture — Layered MVC

The backend follows the layered architecture defined in the class diagram (project proposal §1.7, NFR-04):

```
HTTP Request
     │
     ▼
 Routes (server/routes/)
     │  Mounts controllers on HTTP verbs + paths
     ▼
 Controllers (server/controllers/)
     │  Parse & validate req, call service, send response
     ▼
 Services (server/services/)
     │  Business logic, orchestration — no HTTP objects here
     ▼
 Repositories (server/repositories/)
     │  Parameterised DB queries only — no business logic
     ▼
 DatabaseConnection (server/config/database.ts)
     │  pg Pool / connection
     ▼
 PostgreSQL
```

**Frontend layer** (Next.js App Router):

```
src/app/           ← Pages & layouts (route segments)
src/components/    ← Domain UI components
src/lib/           ← Pure utility functions (filtering, sanitisation)
src/types/         ← Shared TypeScript types
src/hooks/         ← Custom React hooks
src/data/          ← Static / mock data for development
```

Calls the Express API over `NEXT_PUBLIC_API_URL` for all dynamic data.

---

## 8. Database

Migrations and seed files are in `database/`.

```
database/
├── migrations/
│   └── 001_initial_schema.sql    # Full schema: users, projects, news, board, etc.
└── seeds/
    └── 001_initial_seed.sql      # Admin user, board terms, sample content
```

- Migrations run in filename order. The `scripts/migrate.ts` runner tracks applied files in `migrations_log`.
- Seed data is idempotent (`ON CONFLICT DO NOTHING`).
- For rollback, `database/migrations/001_initial_schema.down.sql` drops all tables.

**Initial admin credentials (local dev only):**

| Field | Value |
|---|---|
| Username | `admin_balangoda` |
| Email | `admin@lionsclubbalangoda.org` |
| Password | `Admin@Lions2026!` |

> ⚠️ Change these before any production deployment.

---

## 9. Contributing & Branch Workflow

Branch naming follows the team convention — each member works on a **personal branch** named after their identifier (e.g., `ahmed_ahnaf`, `Zahi`, `nafris`).

For detailed workflow instructions including commit message format (`type(scope): message [LBW-XX]`), PR checklist, and code review rules, see **[CONTRIBUTING.md](CONTRIBUTING.md)**.

**Quick sync:**

```bash
git checkout main && git pull origin main
git checkout <your-branch>
git merge main
git push origin <your-branch>
```

---

## 10. Team

| # | Index No | Name | Role |
|---|---|---|---|
| 1 | 22FIS0519 | M.H.M Yoosuf | Team Member |
| 2 | 22FIS0543 | M.P Asmad Sahee (Zahi) | Team Member |
| 3 | 22FIS0545 | M.N.M Nafris | Team Member |
| 4 | 22FIS0569 | M.A.J.A Ahnaf | Team Member |
| 5 | 22FIS0572 | M.J.A Jinos | Team Member |
| 6 | 22FIS0593 | M.S.F.I. Zeenath | Team Member |

**Supervisor:** Mr. K. P. D. P. Patabandi · **Client:** Lions Club of Balangoda
