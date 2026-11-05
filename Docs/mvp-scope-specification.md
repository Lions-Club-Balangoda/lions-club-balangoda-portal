# MVP Scope Freeze Specification & Requirements Matrix

**Project:** Web Portal & Content Management System for Lions Club of Balangoda  
**Course:** IS5109 – Information Systems Project for Community (Group 14)  
**Institution:** Faculty of Computing, Sabaragamuwa University of Sri Lanka  
**Client:** Lions Club of Balangoda (Lions Clubs International District 306)  
**Task:** Freeze MVP Scope across FR, NFR, and SEC Requirements  
**Priority:** Highest | **Paired Leads:** M.H.M Yoosuf (22FIS0519) & M.P Asmad Sahee (22FIS0543)  
**Reviewer:** M.A.J.A Ahnaf (22FIS0569)  
**Status:** **FROZEN & RATIFIED**  
**Effective Date:** 2026-10-07 | **Target Delivery:** Sprint 3 (December 2026)

---

## 1. Executive Summary & Scope Freeze Charter

Following the formal Requirements Validation Session held on October 07, 2026, with the executive officers of the Lions Club of Balangoda, this document establishes the **authoritative, frozen boundary of the Minimum Viable Product (MVP)**. 

### 1.1 Scope Boundary Rules
1. **Unilateral Additions Prohibited:** No new feature, page, or third-party integration may be added to Sprints 1, 2, or 3 without a formal change control submission approved by both the Academic Supervisor and the Club President.
2. **Delivery Safeguard:** Any non-critical functionality that threatens the Sprint 3 release date or violates the LKR 17,500 annual budget is deferred to Post-MVP (Phase 2).
3. **Single Source of Truth:** This matrix supersedes preliminary drafts and binds all six members of Group 14.

---

## 2. Requirements Validation & Scope Freeze Matrix

Every requirement from the approved project proposal has been evaluated and assigned an official lifecycle state:
- **CONFIRMED FOR MVP:** Included in Sprints 1–3 exactly as specified.
- **CHANGED / REFINED FOR MVP:** Included in Sprints 1–3 with necessary architectural or functional refinements.
- **DEFERRED TO PHASE 2:** Postponed until after the initial production release and client handover.

### 2.1 Functional Requirements (FR-01 to FR-07)

| Req ID | Requirement Title & Original Description | Scope Status | Decision Notes & Technical Refinement | Sprint |
|---|---|---|---|---|
| **FR-01** | **Homepage & Service Pillars:** Club mission, vision, history, and 4 humanitarian service pillars. | **CONFIRMED FOR MVP** | Homepage will feature: (1) Hero section with Lions brand imagery; (2) History of Balangoda Charter; (3) 4 Service Pillars (Healthcare, Education, Environment, Poverty Relief); (4) Impact Counters; (5) Latest initiatives preview. | **Sprint 2** |
| **FR-02** | **Project Archive & Search:** Search and filter community projects by category, keyword, and year. | **CONFIRMED FOR MVP** | Implemented on `/projects` with live search, service pillar category buttons, and year dropdown. Case-insensitive search covers title, summary, and location. Automated test suite in `tests/projects-list.test.mjs`. | **Sprint 1 / 2** |
| **FR-03** | **Project Details & Image Gallery:** Responsive image galleries with lightbox for each documented activity. | **CONFIRMED FOR MVP** | Dynamic route `/projects/[slug]` with rich project narrative, impact metrics badge, and a high-resolution lightbox gallery powered by Cloudinary asset URLs. | **Sprint 2** |
| **FR-04** | **Executive Committee Directory:** Filterable directory of board members by Lionistic administrative year. | **CHANGED / REFINED FOR MVP** | **Refinement:** The proposal stored `term_year` as a loose string. The schema now normalizes `board_terms` (e.g., `'2025-2026'`, `is_current: boolean`, presidential theme). Directory at `/board` filters by term and orders officers by rank (`display_order`). | **Sprint 2** |
| **FR-05** | **Volunteer Signups & Inquiries:** Capture and validate public volunteer signups and general inquiries via web forms. | **CHANGED / REFINED FOR MVP** | **Refinement:** Split into two dedicated forms: `/volunteer` (captures skills, availability, and district) and `/contact` (general & sponsorship inquiries). Includes automated email notification to club and applicant. | **Sprint 2 / 3** |
| **FR-06** | **Admin CMS for Content Management:** Code-free CRUD for projects, news/announcements, and board records. | **CHANGED / REFINED FOR MVP** | **Refinement (Resolves Proposal Gap #2):** Added full `NEWS_ANNOUNCEMENT` module to the ER schema. Admin CMS includes WYSIWYG rich text editor, Cloudinary image upload, and role-based permissions (Admin vs. Editor). Detailed in screen specs `SCR-01` to `SCR-20`. | **Sprint 3** |
| **FR-07** | **Submissions Review & Data Export:** Admins can review, manage, and export received volunteer submissions and inquiries. | **CHANGED / REFINED FOR MVP** | **Refinement (Resolves Proposal Gap #10):** Admin interface `/admin/submissions` provides tabbed views for Volunteers and Inquiries, status updates (`NEW` → `IN_PROGRESS` → `RESOLVED`), and one-click standard **CSV data export**. | **Sprint 3** |

---

### 2.2 Non-Functional Requirements (NFR-01 to NFR-04)

| Req ID | Requirement Title & Standard | Scope Status | Compliance Strategy | Sprint |
|---|---|---|---|---|
| **NFR-01** | **Performance (< 2.5s on 4G):** Landing page loads in under 2.5s on standard mobile networks. | **CONFIRMED FOR MVP** | Next.js App Router server-side rendering (SSR), automatic WebP/AVIF compression via Next.js Image and Cloudinary CDN transformations. | **Sprint 2 / 3** |
| **NFR-02** | **Usability & Responsiveness:** Cross-device responsive from 360px to 1920px; WCAG 2.1 AA accessibility. | **CONFIRMED FOR MVP** | Mobile-first CSS with Tailwind v4, accessible color contrast ratios exceeding 4.5:1 against Lions Gold and Navy Blue, full keyboard navigability. | **Sprint 2 / 3** |
| **NFR-03** | **Availability & Reliability:** 99.5% uptime; weekly automated database backups. | **CONFIRMED FOR MVP** | Hosted on production cloud infrastructure with health monitoring; automated weekly SQL database dump to secure backup storage. | **Sprint 3 / Handover** |
| **NFR-04** | **Maintainability:** Modular architecture and clean MVC layering. | **CONFIRMED FOR MVP** | Strict layering: UI Components → Server Actions/API Controllers → Domain Services → Repositories → Database Pool. Zero tight coupling. | **All Sprints** |

---

### 2.3 Security Requirements (SEC-01 to SEC-05)

| Req ID | Requirement Title & Standard | Scope Status | Implementation Mechanism | Sprint |
|---|---|---|---|---|
| **SEC-01** | **Transport Security:** TLS/HTTPS on all public and administrative traffic. | **CONFIRMED FOR MVP** | Automatic SSL/TLS termination with HTTP to HTTPS redirect on custom domain. | **Sprint 3** |
| **SEC-02** | **Input Sanitization & SQL Parameterization:** Parameterized queries to defeat SQL injection; input sanitization. | **CONFIRMED FOR MVP** | Zero raw SQL string concatenation. Server-side string sanitization utility (`sanitizeSearchQuery`, DOMPurify on HTML input). | **Sprint 1 / 2 / 3** |
| **SEC-03** | **Output Encoding & CSP:** Defend against XSS; implement Content Security Policy. | **CONFIRMED FOR MVP** | React automatic JSX escaping + HTTP Content-Security-Policy headers configured in `next.config.ts`. | **Sprint 2 / 3** |
| **SEC-04** | **Password Security:** Salted and hashed passwords with bcrypt (work factor ≥ 10) or Argon2. | **CONFIRMED FOR MVP** | Bcrypt with 12 salt rounds for all administrative accounts; secure password reset token mechanism with 1-hour expiration. | **Sprint 3** |
| **SEC-05** | **Anti-CSRF Verification:** CSRF token verification on all state-changing admin POST/PUT/DELETE requests. | **CONFIRMED FOR MVP** | Next.js Server Actions origin header validation and CSRF double-submit cookies on state-modifying endpoints. | **Sprint 3** |

---

### 2.4 Deferred Scope Items (Post-MVP Phase 2)

The following capabilities were analyzed and formally deferred to Phase 2 with explicit justification:

| Feature / Item | Original Context | Deferral Justification | Phase 2 Roadmap Target |
|---|---|---|---|
| **Direct Online Payment Gateway (IPG)** | Donor contributions via credit/debit card on website | Merchant IPG registration in Sri Lanka requires corporate banking verification, recurring merchant fees, and PCI-DSS compliance audits exceeding academic budget and timeline. **MVP Alternative:** Verified Club Bank Account wire details and donor pledge inquiry form. | Phase 2.1 (Post-Handover) |
| **Multi-Language Localization (Sinhala & Tamil)** | Proposal did not specify language; Sinhala/Tamil considered during session | Translating dynamic CMS news and project archives requires dedicated bilingual content administrators. **MVP Alternative:** Clean, universally accessible English; rich imagery and video briefs. | Phase 2.2 |
| **Public Discussion / Commenting System** | Interactive commenting under community project briefs | Introduces serious spam, moderation liabilities, and defamation risks for an established non-profit. Non-technical officers cannot moderate comments 24/7. | Phase 2.3 |
| **Automated SMS Notifications** | SMS alerts to club members for emergency announcements | Commercial SMS gateways in Sri Lanka require recurring per-SMS charges. **MVP Alternative:** Transactional email alerts to official club inboxes at zero marginal cost. | Phase 2.4 |
| **Mobile App (Android/iOS)** | Native mobile applications for members | Responsive web app built to PWA standards achieves full mobile accessibility without maintaining two separate native mobile codebases. | Future Scope |

---

## 3. Club-Supplied Data Ownership Register

To prevent project bottlenecks, specific club officers have been designated as official data owners. Each owner is accountable for providing verified club records per the agreed schedule:

| # | Data Artifact | Description & Required Format | Designated Club Owner | Delivery Deadline | Status |
|---|---|---|---|---|---|
| **D1** | **Club History & Balangoda Charter** | 500-word historical narrative of the Balangoda club, founding date, charter president, and milestone community achievements (Word/PDF). | **Lion H.M. Bandara** (Secretary) | **Oct 16, 2026** | In Preparation |
| **D2** | **Official Brand Assets & Crests** | Vector / high-resolution PNG of Lions Clubs International District 306 logo, Balangoda Club banner, and official color standards. | **Lion Prof. T. Sanjeewa Prasad Jayaweera** (President) | **Oct 12, 2026** | **Delivered** |
| **D3** | **Executive Board Directory Records** | Full names, designations, high-res portrait photos, emails, and phone numbers for current (2025–2026) and past (2024–2025) board members. | **Lion H.M. Bandara** (Secretary) | **Oct 20, 2026** | In Preparation |
| **D4** | **Flagship Projects Archive (5–10 Projects)** | Project title, date, location, service pillar, impact count (beneficiaries), summary narrative, and 5–8 high-resolution photos per project. | **Lion Dr. R.M. Senarathne** (Project Chair) | **Oct 23, 2026** | In Progress (3 of 6 received) |
| **D5** | **Club Contact Details & Office Location** | Official secretariat physical address, GPS coordinates, public phone numbers, and official club inquiries email address (`lionsbalangoda@gmail.com`). | **Lion H.M. Bandara** (Secretary) | **Oct 14, 2026** | **Delivered** |
| **D6** | **Donation Bank Account Coordinates** | Official Lions Club of Balangoda bank account name, account number, bank branch, and SWIFT code for wire transfers. | **Lion K.G. Wijeratne** (Treasurer) | **Oct 19, 2026** | In Preparation |
| **D7** | **Domain & Hosting Payment Details** | Payment receipt for `.org` / `.lk` domain registration and hosting provisioning (budget allocation: LKR 17,500). | **Lion K.G. Wijeratne** (Treasurer) | **Oct 23, 2026** | Processing |

---

## 4. Open Questions Register

All open questions identified during requirements validation have been assigned an explicit owner, resolution plan, and binding due date:

| # | Question / Issue | Impact & Context | Designated Owner | Due Date | Status & Resolution Plan |
|---|---|---|---|---|---|
| **OQ-01** | **Domain Extension Choice (`.org` vs `.lk`):** Which top-level domain should be registered? | Branding & annual renewal fee structure. | **Lion K.G. Wijeratne** (Treasurer) & **Yoosuf** | **Oct 16, 2026** | *Proposal:* Register `lionsbalangoda.org` for global donor recognition; optionally reserve `lionsbalangoda.lk`. Awaiting final vote at monthly board meeting. |
| **OQ-02** | **Email Dispatch Provider:** Should the system use Google Workspace SMTP or a transactional API (Resend/Brevo)? | Reliability of automated email delivery to `lionsbalangoda@gmail.com` and applicants. | **M.N.M Nafris** (Tech Lead) & **Lion Bandara** | **Oct 19, 2026** | *Recommendation:* Use Resend transactional email with verified DKIM/SPF on custom domain for 99.9% inbox delivery. Free tier easily covers club monthly volume (< 100 emails/mo). |
| **OQ-03** | **Cloudinary CDN Account Management:** Who holds the master Cloudinary CDN account credentials? | Long-term asset hosting security after student project handover. | **M.S.F.I. Zeenath** & **Lion Bandara** | **Oct 21, 2026** | Setup dedicated free-tier Cloudinary account tied to the official club email (`lionsbalangoda@gmail.com`) and document keys in the Operations Manual. |
| **OQ-04** | **Initial Seed Data Volume:** How many past projects should be pre-loaded at launch? | Demonstration readiness and archival depth for initial club review. | **Lion Dr. R.M. Senarathne** & **Ahnaf** | **Oct 14, 2026** | *Agreed Target:* Minimum 6 comprehensive flagship projects (2 Healthcare, 2 Education, 1 Environment, 1 Poverty Relief) pre-loaded before Sprint 2 Review. |
| **OQ-05** | **Volunteer Registration Fields:** What specific volunteer capabilities does the club need to capture? | Form field structure on `/volunteer`. | **M.P Asmad Sahee** & **Lion Bandara** | **Oct 12, 2026** | Fields finalized: Full Name, Email, Mobile/WhatsApp, NIC/Age, Profession/Skills (Medical, Logistics, IT, General), Availability (Weekends/Anytime), and Notes. |

---

## 5. Scope Approval & Sign-Off

This document serves as the formal baseline for Group 14's backlog prioritization and sprint planning.

**Ratified on 2026-10-07 by:**
- **M.H.M Yoosuf (22FIS0519)** — Sprint Facilitator & Author
- **M.P Asmad Sahee (22FIS0543)** — Backlog Quality Coordinator
- **M.A.J.A Ahnaf (22FIS0569)** — QA & Testing Strategy Lead
- **Lion Prof. T. Sanjeewa Prasad Jayaweera** — President, Lions Club of Balangoda
- **Lion H.M. Bandara** — Secretary, Lions Club of Balangoda
