# Team Contribution Guide & Engineering Workflow

Welcome to the **Lions Club of Balangoda Web Portal & Content Management System** repository. This project is developed by Group 14 for the **IS5109 – Information Systems Project for Community** at the Faculty of Computing, Sabaragamuwa University of Sri Lanka, in partnership with the Lions Club of Balangoda (District 306).

All contributions must strictly adhere to our pinned [Scrum Working Agreement](Docs/scrum-working-agreement.md).

---

## 1. Core Operating Principles

1. **Every Member Implements & Tests:** Every sprint, every team member writes code, develops full-stack features, and creates automated/manual test cases. There are no non-coding roles.
2. **Rotating Coordination Roles:** Roles rotate every sprint (Sprint Facilitation, Backlog Quality, Technical Architecture, Testing Strategy, UI/UX Consistency, Deployment Readiness).
3. **No Permanent Silos:** No permanent frontend, backend, database, QA, or documentation silos. Knowledge is shared across the entire team.
4. **Primary Author + Collaborating Reviewer:** Every significant PR must have a designated reviewer who did not author the code.

---

## 2. Jira & Git Branching Workflow

### 2.1 Jira Issue Tracking
- Every task, user story, and bug is tracked on Jira with issue keys formatted as `LBW-XX` (e.g., `LBW-01`, `LBW-15`).
- Pull requests and commit messages must reference the corresponding Jira issue key.

### 2.2 Branch Naming Standard
- Branch names incorporate the team member's identifier and feature scope:
  `yoosuf/scrum-working-agreement`, `ahmed_ahnaf/projects-list`, `zahi/database-schema`
- **Main Branch Protection:** Direct commits and pushes to `main` are strictly forbidden. All code enters `main` via approved Pull Requests.

### 2.3 Commit Message Convention
Commits must follow the Conventional Commits specification with Jira issue key tags:
```text
type(scope): short description [LBW-XX]
```
* `feat`: New user-facing or system capability
* `fix`: Bug resolution
* `docs`: Documentation, specifications, or agreements
* `test`: Test suite additions or modifications
* `refactor`: Internal code reorganization without behavioral change
* `chore`: Build scripts, dependencies, or tool configurations

---

## 3. Definition of Ready (DoR) Gate

Before any story is pulled from the Product Backlog into a Sprint Backlog during Sprint Planning:
1. **Objective Clear:** Formatted as `As a... I want... So that...` with clear business intent.
2. **Testable Acceptance Criteria:** Explicitly specified in Gherkin or quantifiable conditions.
3. **Dependencies Resolved:** All technical, schema, and API dependencies identified and unblocked.
4. **Sprint-Sized:** Sized ≤ 8 story points.
5. **Test Strategy Defined:** QA approach and test level identified.
6. **Assets Available:** Required client copy, images, and brand materials ready.

*Blocked items are strictly forbidden from entering a sprint.*

---

## 4. Definition of Done (DoD) Gate

Before any Pull Request is approved and merged into `main`:
- [ ] Acceptance criteria 100% met and verified.
- [ ] Code committed with standardized Jira tags (`[LBW-XX]`).
- [ ] Independent code review passed (author cannot approve own PR).
- [ ] Automated tests pass with zero regressions.
- [ ] Security standards satisfied (input sanitization against XSS, parameterized queries, RBAC).
- [ ] Architecture aligns with Next.js 16 App Router and MVC layering.
- [ ] Documentation and inline TSDoc comments updated.
- [ ] Zero unresolved P1 (Critical) or P2 (High) defects.
- [ ] Live demo verified on staging or local build.

---

## 5. Scrum Ceremonies Cadence

| Ceremony | Schedule | Time | Platform / Venue |
|---|---|---|---|
| **Daily Standup** | Monday – Friday (Daily) | 08:30 – 08:45 AM (Strict 15m) | Discord Stage |
| **Backlog Refinement** | Wednesdays (Weekly) | 05:00 – 06:00 PM (1h) | Discord / Google Meet |
| **Sprint Review (Demo)** | Final Friday of Sprint | 02:00 – 03:30 PM (1.5h) | Faculty Boardroom / Meet |
| **Sprint Retrospective** | Final Friday of Sprint | 04:00 – 05:00 PM (1h) | Discord Private Room |

*Refer to [Docs/team-calendar.md](Docs/team-calendar.md) for confirmed calendar dates for Sprints 1, 2, and 3.*
