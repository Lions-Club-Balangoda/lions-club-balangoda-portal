# Lions Club of Balangoda Web Portal & Content Management System

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.2-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3.0-blue?logo=react)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-CSS_4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Scrum Framework](https://img.shields.io/badge/Process-Scrum_Working_Agreement-green)](Docs/scrum-working-agreement.md)

An official humanitarian service portal, project archive, and lightweight administrative CMS designed and developed for the **Lions Club of Balangoda (Lions Clubs International District 306)**.

* **Course:** IS5109 – Information Systems Project for Community (Group 14)  
* **Institution:** Department of Computing & Information Systems, Faculty of Computing, Sabaragamuwa University of Sri Lanka  
* **Client:** Lions Club of Balangoda (Ref. LCB/LEOSUSL1, President Lion Prof. T. Sanjeewa Prasad Jayaweera)  
* **Supervisor:** Mr. K. P. D. P. Patabandi (Temporary Lecturer)  

---

> ## 📌 PINNED: Team Scrum Working Agreement & Governance
> 
> *The team's official working agreement is pinned here as the central operating contract for all six members across Sprints 1, 2, and 3. For the complete, unedited standard, see [Docs/scrum-working-agreement.md](Docs/scrum-working-agreement.md).*

### 1. Definition of Ready (DoR)
A user story enters a sprint **only** when all six criteria are satisfied. **Blocked work is never pulled into a sprint.**
1. **Clear Objective / User Outcome:** Written in standard persona syntax (`As a... I want... So that...`) with a distinct problem statement and business value.
2. **Testable Acceptance Criteria:** Explicitly articulated in Gherkin or quantifiable conditions of satisfaction (no unmeasured adjectives).
3. **Dependencies Identified:** All technical, schema, and API blockers resolved or accompanied by an active resolution plan.
4. **Sprint-Sized Scope:** Sized to fit comfortably within one sprint (≤ 8 story points).
5. **Testing Approach Defined:** Testing level (unit/integration/manual) established and QA reviewer assigned.
6. **External Info & Assets Ready:** Required client assets, photographs, copy, or credentials ready.

### 2. Definition of Done (DoD)
A story, task, or bug fix is marked **Done** in Jira and merged into `main` **only** when all applicable criteria are met:
* **Acceptance criteria 100% met and verified.**
* **Committed and pushed to shared repo** with standardized issue keys (`type(scope): message [LBW-XX]`).
* **Independent peer review completed** by a team member who did not write the code (no self-approvals).
* **Automated & manual tests pass** with zero regression failures.
* **Security & authorization verified** (parameterized SQL queries, XSS sanitization, RBAC checks).
* **Architecture aligned** with Next.js 16 App Router, strict TypeScript, and MVC layering.
* **Documentation updated** (TSDoc comments, API contracts, schema notes).
* **No unresolved release-blocking defects** (zero open P1/P2 bugs).
* **Live demonstrated and verified** in staging or local build.
* **Production / Handover items additionally require:** deployment verification on HTTPS hosting, client acceptance sign-off, delivered admin operations manual, and weekly database backup verification.

---

### 3. Rotating Coordination Roles Matrix

Coordination roles rotate every sprint to maintain shared ownership. **These are stewardship roles, NOT exclusive implementation silos:** every member writes code, implements features, and authors automated tests every sprint.

| Coordination Role | Sprint 1 | Sprint 2 | Sprint 3 |
|---|---|---|---|
| **Sprint Facilitation & Stakeholder Coordination** | **Yoosuf** (22FIS0519) | **Zeenath** (22FIS0593) | **Jinos** (22FIS0572) |
| **Backlog Quality & Requirements Traceability** | **Asmad** (22FIS0543) | **Yoosuf** (22FIS0519) | **Zeenath** (22FIS0593) |
| **Technical Architecture & Integration** | **Nafris** (22FIS0545) | **Asmad** (22FIS0543) | **Yoosuf** (22FIS0519) |
| **Testing Strategy & Acceptance Criteria** | **Ahnaf** (22FIS0569) | **Nafris** (22FIS0545) | **Asmad** (22FIS0543) |
| **UI/UX Consistency & Usability Review** | **Jinos** (22FIS0572) | **Ahnaf** (22FIS0569) | **Nafris** (22FIS0545) |
| **Deployment Readiness & Documentation** | **Zeenath** (22FIS0593) | **Jinos** (22FIS0572) | **Ahnaf** (22FIS0569) |

---

### 4. Team Calendar: Confirmed Sprint Review & Retrospective Dates

| Sprint | Review Date (Demo & Client Inspection) | Retrospective Date (Process Improvement) | Lead Facilitator |
|---|---|---|---|
| **Sprint 1** | **Friday, October 23, 2026** (02:00 – 03:30 PM) | **Friday, October 23, 2026** (04:00 – 05:00 PM) | M.H.M Yoosuf |
| **Sprint 2** | **Friday, November 13, 2026** (02:00 – 03:30 PM) | **Friday, November 13, 2026** (04:00 – 05:00 PM) | M.S.F.I. Zeenath |
| **Sprint 3** | **Friday, December 04, 2026** (02:00 – 03:30 PM) | **Friday, December 04, 2026** (04:00 – 05:00 PM) | M.J.A Jinos |
| **Handover** | **Wed, Dec 09, 2026 (Client Training)** | **Fri, Dec 11, 2026 (Final Project Handover)** | All Members |

*Daily Standups run Monday–Friday at 08:30 AM (strictly 15 min). Backlog Refinements run Wednesdays at 05:00 PM. Full schedule in [Docs/team-calendar.md](Docs/team-calendar.md).*

---

### 5. Team Acknowledgment & Sign-Off

All six members have reviewed, accepted, and signed the team working agreement:

| # | Index No | Name | Email | Sprint 1 Role | Sign-Off Status |
|---|---|---|---|---|---|
| 1 | 22FIS0519 | **M.H.M Yoosuf** | 22fis0519@ms.sab.ac.lk | Sprint Facilitation & Author | `ACKNOWLEDGED & SIGNED` |
| 2 | 22FIS0543 | **M.P Asmad Sahee** | 22fis0543@ms.sab.ac.lk | Backlog Quality Coordinator | `ACKNOWLEDGED & SIGNED` |
| 3 | 22FIS0545 | **M.N.M Nafris** | 22fis0545@ms.sab.ac.lk | Technical Architecture Lead | `ACKNOWLEDGED & SIGNED` |
| 4 | 22FIS0569 | **M.A.J.A Ahnaf** | 22fis0569@ms.sab.ac.lk | Testing Strategy / Reviewer | `ACKNOWLEDGED & SIGNED` |
| 5 | 22FIS0572 | **M.J.A Jinos** | 22fis0572@ms.sab.ac.lk | UI/UX Consistency Lead | `ACKNOWLEDGED & SIGNED` |
| 6 | 22FIS0593 | **M.S.F.I. Zeenath** | 22fis0593@ms.sab.ac.lk | Deployment & Documentation | `ACKNOWLEDGED & SIGNED` |

---

> ## 🎯 PINNED: Requirements Validation & Frozen MVP Scope
>
> *Ratified on October 07, 2026, during the formal validation session with Club President Lion Prof. T. Sanjeewa Prasad Jayaweera and Secretary Lion H.M. Bandara. Complete record in [Docs/mvp-scope-specification.md](Docs/mvp-scope-specification.md) and [Docs/requirements-validation-session-minutes.md](Docs/requirements-validation-session-minutes.md).*

### Scope Boundary Summary
* **Confirmed for MVP (Sprints 1–3):**
  * `FR-01`: Public homepage (mission, vision, Balangoda charter history, 4 service pillars, dynamic impact counters).
  * `FR-02`: Searchable community projects archive with service pillar categories and year filter.
  * `FR-03`: Detailed project narrative with high-resolution responsive lightbox photo gallery.
  * `FR-04`: Executive board directory filtered by Lionistic administrative year.
  * `FR-05`: Dedicated volunteer registration (`/volunteer`) and contact forms (`/contact`) with transactional email notifications.
  * `FR-06`: Code-free Admin CMS for projects, news/announcements, and board records with WYSIWYG editor.
  * `FR-07`: Submissions review dashboard with status progression and one-click **CSV data export**.
  * `NFR-01` to `NFR-04`: < 2.5s load time on 4G, WCAG 2.1 AA responsive UI, 99.5% uptime with weekly DB backups, MVC layering.
  * `SEC-01` to `SEC-05`: TLS/HTTPS, input sanitization against XSS, parameterized queries, bcrypt salt factor 12, CSRF defenses.
* **Refinements Accepted into Backlog:** Added missing `NEWS_ANNOUNCEMENT` CMS entity, split volunteer intake from general inquiries, and added admin-editable impact counters.
* **Deferred to Post-MVP (Phase 2):** Direct online payment gateway (bank wire transfer coordinates used for MVP), multi-language Sinhala/Tamil localization, public discussion commenting, and SMS gateway.
* **Club-Supplied Data Owners:**
  * Balangoda Charter History & Board Directory: Lion H.M. Bandara (Secretary) — *Due Oct 16 / Oct 20*
  * High-Res Brand Logos & Crests: Lion Prof. T. Sanjeewa Prasad Jayaweera (President) — *Delivered*
  * Flagship Project Archives (5–10 initiatives): Lion Dr. R.M. Senarathne (Project Chair) — *Due Oct 23*
  * Bank Wire Coordinates & Domain Hosting Budget: Lion K.G. Wijeratne (Treasurer) — *Due Oct 19 / Oct 23*

---

## 🛠️ Getting Started

### Prerequisites
* Node.js 20+ (Node 26 LTS recommended)
* npm 10+
* Git

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/Lions-Club-Balangoda/lions-club-balangoda-portal.git
cd lions-club-balangoda-portal

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the portal.

---

## 📚 Project Documentation Directory

- **Requirements Validation Minutes:** [Docs/requirements-validation-session-minutes.md](Docs/requirements-validation-session-minutes.md)
- **MVP Scope Freeze Specification:** [Docs/mvp-scope-specification.md](Docs/mvp-scope-specification.md)
- **Product Backlog & Scope Traceability:** [Docs/product-backlog.md](Docs/product-backlog.md)
- **Scrum Working Agreement:** [Docs/scrum-working-agreement.md](Docs/scrum-working-agreement.md)
- **Ceremonies & Milestone Calendar:** [Docs/team-calendar.md](Docs/team-calendar.md)
- **DoR & DoD Actionable Checklists:** [Docs/dor-dod-checklist.md](Docs/dor-dod-checklist.md)
- **Approved Project Proposal:** [Docs/project-proposal.md](Docs/project-proposal.md)
- **Database Schema Specification:** [Docs/database-schema-specification.md](Docs/database-schema-specification.md)
- **CMS Admin Screen Specifications:** [Docs/CMS-Admin/screen-specifications.md](Docs/CMS-Admin/screen-specifications.md)
- **QA Strategy & Test Cases:** [Docs/QA/test-strategy.md](Docs/QA/test-strategy.md)
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
Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Development Workflow

This project is developed by a six-member team for the **Lions Club of Balangoda Web Portal & CMS** (IS5109 Community Project, Sabaragamuwa University of Sri Lanka). All team members must adhere to the standardized workflow outlined below.

### 1. GitHub & Jira Integration
- Every task, bug, or feature is tracked on Jira with issue keys formatted as `LBW-XX` (e.g., `LBW-12`, `LBW-20`).
- Every commit message and Pull Request must reference the corresponding Jira issue key.

### 2. Repository Structure
The repository maintains the following structure:
```text
lions-club-balangoda-portal/
├── .github/                       # GitHub configurations (PR templates, issue templates)
│   └── pull_request_template.md   # Standard pull request submission template
├── Docs/                          # Project proposals, specifications, and architecture docs
├── public/                        # Static assets (images, SVGs, favicon)
├── src/                           # Application source code
│   └── app/                       # Next.js App Router (pages, layouts, globals.css)
├── .env.example                   # Sanitized environment variable template
├── .gitignore                     # Git ignore rules for secrets, builds, and dependencies
├── CONTRIBUTING.md                # Comprehensive team contribution and workflow guide
├── eslint.config.mjs              # ESLint configuration
├── next.config.ts                 # Next.js framework configuration
├── package.json                   # Project dependencies and script commands
├── README.md                      # Project documentation and onboarding guide
└── tsconfig.json                  # TypeScript compiler configuration
```

### 3. Team-Based Branch Naming Convention
Our team has decided that **branch names are individual team member names**.
- We **do not** use category or feature-based prefixes such as `feature/`, `fix/`, `docs/`, or `chore/`.
- Each of the six team members works on their own dedicated branch, named using their agreed team identifier.
  - Examples: `ahmed_ahnaf`, `jinos`, `member_3`, `member_4`, `member_5`, `member_6`.
- Example active branch: `ahmed_ahnaf`.
- All changes must be submitted through Pull Requests targeting `main`.

### 4. Synchronizing Your Individual Branch
Always synchronize your dedicated branch with `main` before starting new work:
```bash
# 1. Update your local main branch
git checkout main
git pull origin main

# 2. Switch to your personal branch (example: ahmed_ahnaf)
git checkout ahmed_ahnaf

# 3. Merge the latest updates from main
git merge main

# 4. Push your synchronized branch to remote
git push origin ahmed_ahnaf
```

### 5. Commit Message Conventions
Commit messages must identify the change type, scope, and the corresponding Jira issue key:
```text
type(scope): short description [LBW-XX]
```
**Types:**
- `feat`: New functionality (e.g., `feat(auth): add user registration [LBW-12]`)
- `fix`: Bug fix (e.g., `fix(api): resolve response error [LBW-15]`)
- `docs`: Documentation changes (e.g., `docs(readme): update installation guide [LBW-18]`)
- `test`: Adding or modifying tests
- `refactor`: Code changes without altering external behavior
- `chore`: Maintenance, configuration, or dependency updates (e.g., `chore(git): define repository workflow [LBW-20]`)

### 6. Pull Request Workflow
1. Push your changes to your individual branch on GitHub.
2. Open a Pull Request targeting `main`.
3. Complete the standardized template located at `.github/pull_request_template.md`.
4. Link the corresponding Jira ticket (e.g., `Closes LBW-XX`).
5. Ensure all security checklist items are verified.

### 7. Mandatory Independent Code Review
- **Minimum One Approval:** Every PR requires at least **one approving review** before merging into `main`.
- **Independent Peer Review:** The reviewer must be a different team member from the PR author. PR authors cannot approve their own PRs.
- **Reviewer Duties:** Reviewers must inspect code correctness, project consistency, security, and verify acceptance criteria.
- Any requested changes must be resolved by the author before merging.

### 8. Main Branch Protection Policy
- Direct commits and direct pushes to `main` are blocked.
- Merging to `main` is only permitted via approved Pull Requests.
- Stale pull request approvals are dismissed when new commits are pushed.
- All conversation threads in the PR must be resolved before merging.

### 9. Environment Configuration
To set up your local environment:
1. Copy `.env.example` to create `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and configure your local database credentials, auth secrets, and Cloudinary keys.
3. Never commit `.env` or `.env.local` to Git. Real secrets must never be pushed to the repository.

### 10. Detailed Guidelines
For full details on conflict resolution, code standards, and team collaboration protocols, please consult [CONTRIBUTING.md](CONTRIBUTING.md).
