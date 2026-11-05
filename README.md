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

- **Scrum Working Agreement:** [Docs/scrum-working-agreement.md](Docs/scrum-working-agreement.md)
- **Ceremonies & Milestone Calendar:** [Docs/team-calendar.md](Docs/team-calendar.md)
- **DoR & DoD Actionable Checklists:** [Docs/dor-dod-checklist.md](Docs/dor-dod-checklist.md)
- **Approved Project Proposal:** [Docs/project-proposal.md](Docs/project-proposal.md)
- **Database Schema Specification:** [Docs/database-schema-specification.md](Docs/database-schema-specification.md)
- **CMS Admin Screen Specifications:** [Docs/CMS-Admin/screen-specifications.md](Docs/CMS-Admin/screen-specifications.md)
- **QA Strategy & Test Cases:** [Docs/QA/test-strategy.md](Docs/QA/test-strategy.md)
