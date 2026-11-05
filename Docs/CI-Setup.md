# CI / GitHub Actions Setup Guide

> **Who should read this:** any team member setting up the repository or reviewing the CI configuration.

---

## Workflows

| File | Trigger | Purpose |
|---|---|---|
| `.github/workflows/ci.yml` | PR → `main`, push → `main` | Lint (ESLint + Prettier), tests, Next.js build |
| `.github/workflows/security.yml` | PR → `main`, push → `main` | npm audit (high/critical CVEs), Gitleaks secret scan |
| `.github/dependabot.yml` | Weekly (Monday 09:00 SL time) | Auto-PR for outdated npm and Actions dependencies |

---

## Required Branch Protection Rules

After merging this PR, a repository **Admin** must configure the following in
**GitHub → Settings → Branches → Add rule** for the `main` branch:

1. ✅ **Require a pull request before merging** (1 approving review minimum)
2. ✅ **Require status checks to pass before merging**
   - Required checks to add:
     - `Lint (ESLint + Prettier)`
     - `Tests (Node.js built-in runner)`
     - `Build (Next.js production)`
     - `Dependency Audit (npm audit)`
     - `Secret Scan (Gitleaks)`
3. ✅ **Require branches to be up to date before merging**
4. ✅ **Do not allow bypassing the above settings**

> Without step 2, failing CI checks are visible but do not block merging.

---

## Secrets

The CI workflows use **only `GITHUB_TOKEN`** (automatically provided by GitHub Actions — no manual setup needed). This token is used by Gitleaks to post scan results.

Future secrets (e.g., `DATABASE_URL` for integration tests, `CLOUDINARY_API_KEY` for upload tests) must be added via:
**GitHub → Settings → Secrets and variables → Actions → New repository secret**

**Never commit real credentials to the repository.**

---

## Running Checks Locally

Before pushing, run the same checks the CI runs:

```bash
# Lint
npm run lint

# Prettier format check
npm run format:check

# Tests
npm test

# Build
npm run build

# Dependency audit
npm audit --audit-level=high
```

---

## Dependabot PRs

Dependabot will open weekly PRs for outdated packages. These PRs:
- Are labelled `dependencies`.
- Run through the full CI pipeline automatically.
- Must receive one approval before merging (same rule as team PRs).
- Minor and patch updates are grouped into a single PR to reduce noise.
