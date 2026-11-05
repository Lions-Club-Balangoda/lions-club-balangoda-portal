# Quality Assurance Test Strategy

**Project:** Lions Club of Balangoda Web Portal & Content Management System  
**Course:** IS5109 – Information Systems Project for Community (Group 14)  
**Institution:** Department of Computing & Information Systems, Sabaragamuwa University of Sri Lanka  
**Client:** Lions Club of Balangoda (Lions Clubs International District 306)  
**Author:** Ahmed Ahnaf (Branch: `ahmed_ahnaf`)  
**Assigned QA Reviewer:** M.N.M Nafris (22FIS0545)  
**Status:** Approved for Sprint 1 Execution  

---

## 1. Executive Summary & Purpose

This Quality Assurance Test Strategy establishes the formal testing philosophy, test levels, automation tooling, defect management processes, and quality gates for the **Lions Club of Balangoda Web Portal & CMS**.

The objective is to ensure that the system delivered to the Lions Club is functionally correct, secure, resilient, accessible to community members across diverse devices (360 px to 1920 px per `NFR-02`), and effortless for non-technical club officers to operate (`M01`–`M04`).

---

## 2. Test Levels & Scope

Testing is structured into four distinct, complementary levels according to the software testing pyramid:

```
        / \
       /   \        Level 4: Manual & Exploratory Testing (UAT, Officer Usability)
      /=====\
     /       \      Level 3: End-to-End (E2E) Testing (Playwright User Journeys)
    /=========\
   /           \    Level 2: API & Integration Testing (Routes, Database, Services)
  /=============\
 /               \  Level 1: Unit & Component Testing (Domain Logic, Validators, UI Units)
/_________________\
```

### Level 1: Unit & Component Testing
- **Focus:** Isolated functions, data transformation utilities, domain entities, input validators, and individual UI components.
- **Scope:**
  - Validation routines (email formatting, slug generation, date checks).
  - Business rules (filtering projects by category, searching keywords, status checks).
  - UI components (Project cards, badges, modal dialogs, empty state components).
- **Tooling:** Node.js Native Test Runner (`node:test` + `node:assert`), Vitest / Jest, and `@testing-library/react`.
- **Target Coverage:** Minimum 80% line and branch coverage on business logic and utilities.
- **Execution Frequency:** Run on every local commit and in automated CI pull request checks.

### Level 2: API & Integration Testing
- **Focus:** Interaction between architectural layers (Next.js Route Handlers, Database Queries, Repository interfaces, External Services like Cloudinary and SMTP).
- **Scope:**
  - Next.js API route handlers (`/api/projects`, `/api/admin/...`, `/api/volunteer`).
  - Database schema integrity, SQL queries, foreign key cascade behaviors (`Docs/database-schema-specification.md`).
  - Authentication session validation, role-based access checks (`ADMIN` vs `EDITOR`).
- **Tooling:** Supertest, direct Route Handler test harnesses with mock database connections / test containers.
- **Execution Frequency:** Run on pull requests targeting `main`.

### Level 3: End-to-End (E2E) Testing
- **Focus:** Complete user journeys spanning public visitors and administrative club officers in real browser engines.
- **Scope:**
  - Public journeys: Homepage exploration → Browse projects → Filter by category → Search keyword → Open project gallery lightbox (`UC01`, `UC02`, `UC03`).
  - Public submission journeys: Fill volunteer application → Form validation → Submission confirmation (`UC05`, `FR-05`).
  - Admin journeys: Officer login (`SCR-01`) → Dashboard overview (`SCR-02`) → Create and publish project (`SCR-04`) → Confirm live visibility on public portal.
  - Responsive Viewports: Mobile (360px × 640px, 390px × 844px), Tablet (768px × 1024px), Desktop (1280px × 720px, 1920px × 1080px) to verify `NFR-02`.
- **Tooling:** Playwright (Chromium, Firefox, WebKit).
- **Execution Frequency:** Nightly automated regression runs and pre-release validation.

### Level 4: Manual & Exploratory Testing
- **Focus:** Non-functional aspects that automated testing cannot fully evaluate.
- **Scope:**
  - **Officer Usability Testing:** Walkthrough sessions with non-technical club officers (President, Secretary) to ensure clarity of form labels, error messages, and delete/unpublish dialogs.
  - **Visual & Cross-Browser Verification:** Inspect layout rendering, typography (Geist font), contrast ratios, and Lions Club branding across Safari, Chrome, Edge, and mobile browsers.
  - **Accessibility Auditing (WCAG 2.1 AA):** Keyboard tab navigation, screen reader announcements (`aria-live`, `alt` attributes on gallery images).
- **Tooling:** Chrome DevTools, Lighthouse, WAVE accessibility extension.
- **Execution Frequency:** Conducted at the conclusion of each Sprint milestone.

---

## 3. Technology Stack & Testing Tooling

| Architectural Layer | Project Technology | Testing Tooling | Purpose |
|---|---|---|---|
| **Framework & UI** | Next.js 16 (App Router), React 19, Tailwind CSS v4 | `@testing-library/react`, Vitest / `node:test` | Component rendering, event handling, responsive styles |
| **Language & Types** | TypeScript 5.x | TypeScript Compiler (`tsc --noEmit`), ESLint 9 | Static type safety, strict null checks, lint compliance |
| **API & Backend** | Next.js Route Handlers, Node.js | `node:test`, Supertest, native fetch mocking | Endpoint status codes, JSON payload validation, auth checks |
| **Database & Schema** | PostgreSQL 14+ / MySQL 8.0, SQL migrations | Test database instance, SQL assertion scripts | Transaction integrity, foreign key cascades, migration rollback |
| **End-to-End (E2E)** | Full application runtime | Playwright | Multi-browser cross-device user journey automation |
| **Performance** | Web Vitals (`NFR-01` < 2.5s LCP) | Lighthouse CI, Chrome DevTools Network throttling | 4G loading speed, asset payload compression, image CDN checks |
| **Security Auditing** | `SEC-01` to `SEC-05` (OWASP Top 10) | Automated vulnerability scanners, manual input fuzzing | SQL injection defense, XSS output encoding, CSRF tokens |

---

## 4. Test Case Organization: Where Test Cases Live

To guarantee transparency and accessibility across both developers and non-technical reviewers:

```text
lions-club-balangoda-portal/
├── Docs/
│   └── QA/                                # QA Documentation & Test Plans
│       ├── test-strategy.md               # Main Test Strategy specification (this document)
│       ├── test-case-template.md          # Standardized reusable Test Case template
│       ├── bug-severity-scale.md          # Severity definitions, release blockers & triage rules
│       ├── projects-list-test-cases.md    # Test cases for the projects-list vertical slice
│       └── README.md                      # QA Index and overview
├── tests/                                 # Executable Automated Test Suites
│   ├── unit/                              # Unit test files (.test.ts / .test.mjs)
│   ├── integration/                       # API route and database integration tests
│   ├── e2e/                               # Playwright end-to-end specifications
│   └── projects-list.test.mjs             # Executable test runner for vertical slice
```

- **Manual / Specification Test Cases:** Published in Markdown under `Docs/QA/` for review by QA Lead Nafris and project stakeholders.
- **Automated Test Code:** Stored in the root `tests/` directory version-controlled alongside application code.

---

## 5. Defect Management & Release Gate Criteria

Defects discovered during testing are classified into four severity tiers:

1. **Critical (P1 - Blocker):** System crash, data loss, security flaw, or essential feature completely unusable with no workaround. **Blocks release unconditionally.**
2. **High (P2 - Major):** Core functional defect (e.g., search returns incorrect records, layout collapsed on mobile) with difficult or unacceptable workaround. **Blocks release** unless approved by QA Lead Nafris.
3. **Medium (P3 - Moderate):** Minor feature defect, non-critical validation glitch, or edge-case failure with reasonable workaround. Does not block release.
4. **Low (P4 - Minor / Cosmetic):** Typographical error, minor spacing, or visual polish. Does not block release.

*(See [`bug-severity-scale.md`](bug-severity-scale.md) for complete definitions and release gate thresholds).*

---

## 6. Sprint 1 Execution: Projects-List Vertical Slice

For the **Sprint 1 Vertical Slice**, testing focuses on the **Community Projects List** (`FR-02`, `UC02`):
- Rendering verified with seed humanitarian projects (Healthcare, Education, Environment, Poverty Relief).
- Dynamic category filtering and real-time keyword search.
- Date sorting and event year filtering.
- Public privacy rule: Draft projects (`status = 'DRAFT'`) are strictly excluded from the public portal.
- Empty search state validation.
- Input sanitization against script injection (`SEC-02`, `SEC-03`).

All initial test cases are formally specified in [`projects-list-test-cases.md`](projects-list-test-cases.md) and backed by the executable test suite in `tests/projects-list.test.mjs`.
