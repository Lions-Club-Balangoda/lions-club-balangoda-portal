## Pull Request Description

### 1. Jira Issue Reference
- **Jira Issue Key:** `LBW-XX`
- **Issue Title:** [Provide issue title]
- **Sprint:** Sprint [1 / 2 / 3]
- **Primary Author:** @[username]
- **Assigned Peer Reviewer:** @[username]

---

### 2. Summary of Changes
[Provide a concise explanation of what was implemented, fixed, or updated.]

---

### 3. Verification of Definition of Done (DoD)
All checks below must be verified prior to approval and merge:

- [ ] **Acceptance Criteria Met:** 100% of acceptance criteria defined in Jira are satisfied.
- [ ] **Commit Format:** Commits follow `type(scope): message [LBW-XX]` convention.
- [ ] **Independent Peer Review:** Code inspected and reviewed by an assigned team member who is not the author.
- [ ] **Automated Tests Passing:** Unit/integration tests added/updated and passing cleanly (`npm test`).
- [ ] **No Regressions:** Existing functionality and public/admin routes remain stable.
- [ ] **Security Standards:**
  - [ ] Input sanitization applied against Cross-Site Scripting (XSS).
  - [ ] Parameterized database queries utilized (zero SQL injection vulnerabilities).
  - [ ] Role-Based Access Control verified where applicable.
  - [ ] No API keys, credentials, or `.env` files committed.
- [ ] **Architectural Alignment:** Follows Next.js 16 App Router conventions and MVC layering.
- [ ] **Documentation:** Public methods carry TSDoc comments; architecture or guide docs updated.
- [ ] **Zero Release-Blocking Defects:** No open P1 (Critical) or P2 (High) severity defects.
- [ ] **Live Demo Verified:** Verified in local environment (`npm run dev` and `npm run build`).

---

### 4. Peer Reviewer Sign-Off
- [ ] **Code Correctness & Logic:** Verified
- [ ] **Non-Functional & Responsive Checks:** Verified
- [ ] **Approval:** `APPROVED FOR MERGE` by @[reviewer_username]
## Pull Request Title
<!-- 
Format: type(scope): short description [LBW-XX]
Example: feat(auth): add user registration [LBW-12]
-->

## Related Jira Issue
<!-- Reference the Jira issue key (e.g., Closes LBW-XX or Relates to LBW-XX) -->
Closes LBW-

---

## Description
<!-- Provide a concise explanation of what this pull request accomplishes and the problem it solves. -->


## Changes Made
<!-- List the specific changes introduced in this PR. Use markdown checkboxes. -->
- [ ] 
- [ ] 
- [ ] 

---

## Testing & Verification
<!-- Explain how these changes were tested (manual verification steps, automated tests, linting, build checks). -->
- **Local Dev Server Verification:** (e.g., tested locally with `npm run dev`)
- **Linting & Type Checking:** (e.g., passed `npm run lint` / `npm run build`)
- **Steps to Reproduce / Verify:**
  1. 
  2. 

---

## Security Checklist
*Please verify all items before submitting your Pull Request:*
- [ ] No passwords, API keys, tokens, or credentials have been committed.
- [ ] No `.env` or local secret configuration files have been committed.
- [ ] All changes are contained within the author's designated individual branch.
- [ ] No unrelated files or unintended modifications are included in this PR.

---

## Reviewer Checklist
*To be completed by the reviewing team member:*
- [ ] **Correctness:** Code functions according to the requirements and solves the stated issue.
- [ ] **Readability:** Code is clean, maintainable, and follows project coding standards.
- [ ] **Security:** No secrets exposed, inputs are sanitized, and security best practices are followed.
- [ ] **Project Consistency:** Adheres to established directory structure, Next.js conventions, and project conventions.
- [ ] **Acceptance Criteria:** All acceptance criteria specified in the related Jira task have been satisfied.

---

## Review & Approval
<!-- Reviewer notes, questions, and approval sign-off. -->
- **Reviewer:** 
- **Review Status:** [ ] Approved / [ ] Changes Requested
- **Notes & Feedback:**

