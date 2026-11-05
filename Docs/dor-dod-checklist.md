# Definition of Ready (DoR) & Definition of Done (DoD) Actionable Checklists

**Project:** Lions Club of Balangoda Web Portal & CMS  
**Course:** IS5109 Community Project (Group 14)  
**Author:** M.H.M Yoosuf (22FIS0519) — Branch: `yoosuf/scrum-working-agreement`  
**Reviewer:** M.A.J.A Ahnaf (22FIS0569)  
**Reference:** [Scrum Working Agreement](scrum-working-agreement.md)

---

## 1. Definition of Ready (DoR) Checklist (For Jira Backlog Items)

> **Instructions for Authors & Backlog Quality Coordinators:**  
> Copy and paste this template into the description of any new Jira Story or Task (`LBW-XX`). All checks must be verified as `[x]` before the item can be pulled into a sprint.

```markdown
### 📋 Definition of Ready (DoR) Verification
- [ ] **R1: Clear Objective & Outcome:** User story follows `As a... I want to... So that...` with clear business intent.
- [ ] **R2: Testable Acceptance Criteria:** AC specified in Gherkin or quantifiable conditions of satisfaction.
- [ ] **R3: Dependencies Cleared:** Technical, schema, asset, and API dependencies identified; no open blockers.
- [ ] **R4: Sprint-Sized Scope:** Sized at ≤ 8 story points; can be completed comfortably within one sprint.
- [ ] **R5: Testing Approach Defined:** QA level (Unit / Integration / Manual) and reviewer assigned.
- [ ] **R6: External Assets Ready:** Required client copy, photos, brand assets, or credentials available.

*DoR Gatekeeper Approval:* [ ] Verified by Backlog Quality Coordinator
```

---

## 2. Definition of Done (DoD) Checklist (For Pull Requests)

> **Instructions for PR Authors & Reviewers:**  
> Copy and paste this template into every GitHub Pull Request targeting `main` or `Dev`.

```markdown
### ✅ Definition of Done (DoD) Verification
- [ ] **Acceptance Criteria:** 100% of acceptance criteria verified and demonstrable.
- [ ] **VCS Cleanliness:** Code committed with standardized format `type(scope): message [LBW-XX]`.
- [ ] **Independent Code Review:** Inspected and approved by an independent peer (author cannot approve).
- [ ] **Automated Tests:** Unit/integration tests added or updated; all local & CI tests pass cleanly.
- [ ] **Regression & Integration:** No broken existing workflows; clean merge without merge conflicts.
- [ ] **Security & Sanitization:**
  - Form inputs sanitized against XSS payloads.
  - Queries strictly parameterized; zero raw concatenation.
  - Authorization / RBAC enforced on protected routes.
  - No credentials or `.env` files committed.
- [ ] **Architecture Standards:** Follows Next.js 16 App Router standards, TypeScript strict typing, and MVC layering.
- [ ] **Documentation:** Public methods documented with TSDoc; project docs/specs updated.
- [ ] **Defect Zero:** No open Critical (P1) or High (P2) bugs against this slice.
- [ ] **Working Demo:** Verified in local dev (`npm run dev`) and clean build (`npm run build`).

*Peer Reviewer Sign-Off:* Reviewed and Approved by @[username]
```

---

## 3. Production & Release Gate Checklist (For Milestone Releases)

```markdown
### 🚀 Production & Handover Release Gate
- [ ] **Staging / Production Deployment:** Live build verified on target hosting platform.
- [ ] **Performance Audit:** LCP & FCP < 2.5 seconds on 4G connection (NFR-01 verified).
- [ ] **Accessibility Audit:** WCAG 2.1 AA compliance audit passed (zero critical contrast/ARIA errors).
- [ ] **Client Demonstration & Sign-Off:** Verified and accepted by Lions Club of Balangoda officers.
- [ ] **Documentation Handover:** CMS Admin Operations Manual delivered to client.
- [ ] **Onboarding Completed:** Training session conducted for non-technical club editors.
- [ ] **Disaster Recovery:** Weekly automated database backup verified and active.
```
