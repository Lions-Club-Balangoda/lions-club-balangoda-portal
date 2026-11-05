This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

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
