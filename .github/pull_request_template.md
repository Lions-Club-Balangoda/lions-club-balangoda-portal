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
