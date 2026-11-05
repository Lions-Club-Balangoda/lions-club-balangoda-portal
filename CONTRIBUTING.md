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
# Contributing Guidelines

Welcome to the **Lions Club of Balangoda Web Portal & Content Management System** repository. This project is developed by a six-member team for the **IS5109 – Information Systems Project for Community** at Sabaragamuwa University of Sri Lanka, in partnership with the Lions Club of Balangoda (District 306).

To ensure high code quality, smooth collaboration, and repository integrity, all six team members must adhere to these guidelines.

---

## 1. Team-Based Branching Strategy

Our team operates on a **dedicated team member branching model**. 

> [!IMPORTANT]
> **Team Decision on Branch Naming:**  
> Our team has officially decided that **branch names are individual team member names**.  
> We **DO NOT** use task-type or feature-based branch prefixes such as `feature/`, `fix/`, `docs/`, or `chore/`.  
> Every team member works solely on their own dedicated branch named with their agreed team identifier.

### Branch Conventions & Rules:
1. **`main` is the protected integration branch:** It represents tested, stable, and deployable code. Direct commits and direct pushes to `main` are strictly forbidden.
2. **Individual Member Branches:** Each of the six team members works on their own dedicated branch.
   - Example branch names: `ahmed_ahnaf`, `jinos`, `member_3`, `member_4`, `member_5`, `member_6`.
   - Your branch must remain dedicated to you; do not commit directly to another member's branch without prior coordination.
3. **No Feature Branches:** Do not create branches like `feature/login`, `fix/nav-bar`, or `chore/config`. Keep your work on your dedicated personal branch.
4. **Pull Requests Required:** All contributions must be merged into `main` exclusively through GitHub Pull Requests.
5. **Jira Issue Reference:** While branches use member names, the specific work being performed is tracked via Jira issue keys (e.g., `LBW-XX`) in commit messages and Pull Requests.

---

## 2. Synchronizing Your Dedicated Branch

Before starting any new work, or before submitting a Pull Request, team members must synchronize their dedicated branch with the latest changes from `main`.

### Step-by-Step Commands (Example using `ahmed_ahnaf`):

1. **Fetch and update your local `main` branch:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Switch to your personal branch:**
   ```bash
   git checkout ahmed_ahnaf
   ```

3. **Merge the latest `main` changes into your branch:**
   ```bash
   git merge main
   ```

4. **Push your updated branch to GitHub:**
   ```bash
   git push origin ahmed_ahnaf
   ```

*(Team members should substitute `ahmed_ahnaf` with their respective assigned branch name, e.g., `jinos`.)*

---

## 3. Resolving Merge Conflicts Safely

Merge conflicts may happen when multiple team members modify the same files. Follow this safe resolution protocol:

1. **Communicate First:** If Git reports a conflict during `git merge main`, identify which team member authored the conflicting code and discuss the resolution before altering logic.
2. **Identify Conflicted Files:**
   ```bash
   git status
   ```
3. **Inspect and Resolve Markers:** Open the conflicting files and locate the conflict markers:
   ```text
   <<<<<<< HEAD (Current change on your branch)
   ... your code ...
   =======
   ... incoming code from main ...
   >>>>>>> main
   ```
4. **Clean and Verify:** Edit the file to preserve the correct combined functionality. Remove all markers (`<<<<<<<`, `=======`, `>>>>>>>`).
5. **Test Locally:** Ensure the project compiles and tests pass:
   ```bash
   npm run build
   npm run lint
   ```
6. **Stage and Commit the Resolution:**
   ```bash
   git add <resolved-file>
   git commit -m "chore(merge): resolve conflicts from main into ahmed_ahnaf [LBW-XX]"
   ```
7. **Push to Remote:**
   ```bash
   git push origin ahmed_ahnaf
   ```

---

## 4. Commit Message Conventions

Although branches use team member names, every commit must clearly identify the type of change, scope, and the corresponding Jira issue key.

### Format:
```text
type(scope): short description [LBW-XX]
```

### Allowed Types:
- **`feat`**: New functionality or user-facing feature.
- **`fix`**: Bug fix or error resolution.
- **`docs`**: Documentation updates or additions.
- **`test`**: Adding or updating tests.
- **`refactor`**: Code restructuring without altering external functionality.
- **`chore`**: Maintenance, package dependencies, configuration, or workflow updates.

### Examples:
- `feat(auth): add user registration [LBW-12]`
- `fix(api): resolve response error [LBW-15]`
- `docs(readme): update installation guide [LBW-18]`
- `chore(git): define repository workflow [LBW-20]`
- `refactor(db): streamline query execution for events [LBW-24]`

> **Note:** Never omit the Jira issue key (`[LBW-XX]`). It provides traceability between project management and repository history.

---

## 5. Repository Directory Structure

Maintain a clean, organized repository. Respect existing project directories and do not introduce arbitrary top-level folders.

```text
lions-club-balangoda-portal/
├── .github/                       # GitHub configuration & PR templates
│   └── pull_request_template.md   # Standardized template for Pull Requests
├── Docs/                          # Project specifications & documentation
│   ├── project-proposal.md        # Approved community project proposal
│   └── database-schema-...md      # Database architecture and specifications
├── public/                        # Static public assets (images, icons, SVGs)
├── src/                           # Application source code
│   └── app/                       # Next.js App Router (pages, layouts, globals.css)
├── .env.example                   # Sanitized environment variable template
├── .gitignore                     # Git ignore rules for secrets, builds & temp files
├── CONTRIBUTING.md                # Development workflow & contribution guide
├── eslint.config.mjs              # ESLint configuration
├── next.config.ts                 # Next.js configuration
├── package.json                   # Project dependencies and npm scripts
├── README.md                      # Project overview and quickstart guide
└── tsconfig.json                  # TypeScript configuration
```

---

## 6. Pull Request Creation & Review Workflow

All code contributions must go through a formal peer review before merging into `main`.

### Creating a Pull Request:
1. Ensure your personal branch is up to date with `main`.
2. Push all commits to your remote branch (`git push origin <your_name>`).
3. Open a Pull Request targeting the `main` branch.
4. Title the PR using the standard convention:
   `type(scope): short description [LBW-XX]`
5. Fill out all sections of `.github/pull_request_template.md`:
   - Link the relevant Jira task (`Closes LBW-XX`).
   - Describe the purpose and modifications made.
   - Complete the **Security Checklist**.
6. Assign at least one peer reviewer (e.g., Jinos).

### Code Review Rules:
- **Mandatory Approval:** Every Pull Request requires at least **one approving review** before it can be merged.
- **Independent Reviewer:** The reviewer must be a different team member from the PR author. Authors are strictly prohibited from approving their own PRs.
- **Thorough Inspection:** Reviewers must verify correctness, code readability, architectural consistency, and security.
- **Resolution of Feedback:** If changes are requested, the author must push updates to their dedicated branch until all conversations are resolved.
- **Merge Method:** Once approved and all checks pass, merge into `main` using **Squash and merge** or standard merge according to team lead instructions.

---

## 7. Main Branch Protection Policy

The `main` branch is protected by repository rules:
1. **Require a pull request before merging:** Direct pushes are blocked.
2. **Require approvals:** At least 1 approving review from an authorized peer.
3. **Dismiss stale pull request approvals:** When new commits are pushed to an open PR, prior approvals are dismissed.
4. **Require conversation resolution:** All comments, discussions, and review requests must be formally resolved.
5. **No administrative bypass:** Even administrators must abide by review requirements.

---

## 8. Environment Variables and Security Rules

- **Zero Secrets in Git:** Never commit passwords, tokens, API keys, or private certificates.
- **Strict `.env` Ignorance:** `.gitignore` blocks `.env`, `.env.local`, `.env.*.local`, and related files.
- **Using `.env.example`:** Maintain `.env.example` with safe placeholder values for any new environment variables required by the project.
- **Local Setup:** Each developer must copy `.env.example` to `.env.local` for local execution:
  ```bash
  cp .env.example .env.local
  ```

---

## 9. Six-Person Team Collaboration Guidelines

1. **Daily Communication:** Keep fellow team members informed about current Jira tasks.
2. **Role Boundaries:** Respect module allocations (Frontend, Backend, Database, CMS, QA) agreed upon in the project proposal.
3. **Prompt Reviews:** Respond to review requests from teammates within 24 hours to prevent development bottlenecks.
4. **Verification Before PR:** Run `npm run lint` and `npm run build` locally before requesting a review.

