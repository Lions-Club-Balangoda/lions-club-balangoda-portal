# IS5109 – IS Project for Community: Project Proposal (Approved)

**Title:** Design and Development of a Comprehensive Web Portal and Content Management System for the Lions Club of Balangoda
**Group:** 14
**Institution:** Department of Computing & Information Systems, Faculty of Computing, Sabaragamuwa University of Sri Lanka
**Date:** September 2026
**Internal Supervisor:** Mr. K. P. D. P. Patabandi (Temporary Lecturer)
**Client:** Lions Club of Balangoda (Lions Clubs International District 306)
**Client approval letter:** Ref. LCB/LEOSUSL1, dated 2026-09-25, signed by Lion Prof. T. Sanjeewa Prasad Jayaweera (President). The club agrees to provide requirements, event records and media, to take part in system reviews, and to pay the annual domain and hosting costs.

> Purpose of this file: single-source reference for the agentic editor. Section 1 is the source of truth (transcribed from the approved proposal). Section 2 lists gaps and inconsistencies in the proposal. Section 3 gives recommended implementation decisions. Where Sections 2/3 differ from Section 1, they are clarifications, not changes to approved scope.

---

## 1. Approved Proposal Content

### 1.1 Team

| # | Index No | Name | Email | Mobile |
|---|----------|------|-------|--------|
| 1 | 22FIS0519 | M.H.M Yoosuf | 22fis0519@ms.sab.ac.lk | 0765258965 |
| 2 | 22FIS0543 | M.P Asmad Sahee | 22fis0543@ms.sab.ac.lk | 0704185782 |
| 3 | 22FIS0545 | M.N.M Nafris | 22fis0545@ms.sab.ac.lk | 0729023235 |
| 4 | 22FIS0569 | M.A.J.A Ahnaf | 22fis0569@ms.sab.ac.lk | 0764640282 |
| 5 | 22FIS0572 | M.J.A Jinos | 22fis0572@ms.sab.ac.lk | 0757346339 |
| 6 | 22FIS0593 | M.S.F.I. Zeenath | 22fis0593@ms.sab.ac.lk | 0763068368 |

### 1.2 Introduction

The Lions Club of Balangoda is an established non-profit humanitarian service organization under Lions Clubs International District 306. It works across Balangoda and surrounding rural regions on healthcare (vision screenings, blood donation drives, diabetes awareness), education (scholarships, book donations), environmental protection, and poverty relief.

Problems caused by having no official digital portal:

- **Low global visibility & trust:** sponsors, benefactors and overseas donors have no verified touchpoint to validate credentials or review past projects.
- **Fragmented service archives:** project records, impact statistics and photos are scattered across personal social media and paper reports, so institutional memory is lost between administrative terms.
- **Manual inquiry & volunteer intake:** community members, prospective volunteers and partner organizations have no structured channel to apply, submit requests or start partnerships.

Solution: a tailored, responsive web portal and CMS modeled on the architecture of **sabraleos.org** (Leo Club of Sabaragamuwa University of Sri Lanka). It serves as the authoritative digital home that preserves achievements, documents ongoing work and streamlines stakeholder engagement.

### 1.3 Objectives

**Overall:** design, develop, test and deploy a secure, mobile-first web portal and custom administrative CMS for the Lions Club of Balangoda, modernizing outreach and providing a central platform for transparency and archival preservation.

**Specific:**

1. **Project showcase & archive:** interactive, searchable service showcase with rich image galleries, impact metrics and project briefs.
2. **Administrative CMS:** user-friendly CMS so officers can publish news, projects and announcements without writing code.
3. **Stakeholder engagement:** structured forms for general inquiries, donor communication and volunteer applications, with **automated email notifications**.
4. **Leadership directory:** dynamic directory of executive board members and committee chairs across administrative terms.
5. **Performance & accessibility:** cross-device responsiveness, load time **< 2.5 s**, SEO discoverability.

### 1.4 Feasibility

- **Technical:** team is competent in HTML5/CSS3, JavaScript/TypeScript, React/Next.js, Node.js/Express or PHP/Laravel, MySQL/PostgreSQL. Deployment stack: cPanel/VPS, Cloudinary (image CDN), Vercel/Render (API + frontend).
- **Operational:** users are community members, corporate sponsors and club officials. Public UI must need no technical knowledge. Admin CMS uses a WYSIWYG editor, clear button labels and structured form fields. Team delivers an **administrative operations manual** and an **onboarding training session**.
- **Economic:** all development, UI/UX, testing and initial deployment are free (academic project). Only cost: annual domain (.lk or .org) plus shared hosting, about **LKR 17,500**, paid by the club.

### 1.5 Use Cases

Actors: **Public Visitor**, **Club Administrator**.

Public Visitor:

| ID | Use case |
|----|----------|
| UC01 | View club info & service pillars |
| UC02 | Browse & filter projects by category / year |
| UC03 | Read published news & announcements |
| UC04 | View executive board directory by term |
| UC05 | Submit volunteer registration form |
| UC06 | Submit general / sponsorship inquiry |

Club Administrator:

| ID | Use case |
|----|----------|
| UC07 | Secure authentication / login |
| UC08 | Publish & manage projects without code |
| UC09 | Publish & manage news / announcements without code |
| UC10 | Curate media gallery & event photos |
| UC11 | Update executive board & profiles |
| UC12 | Review & export volunteer signups & inquiries |

### 1.6 ER Diagram (as drawn in the proposal)

Relationships: **USER 1—N PROJECT** ("creates / manages"); **PROJECT 1—N PROJECT_GALLERY** ("contains"). EXECUTIVE_MEMBER and INQUIRY_VOLUNTEER are standalone entities.

| Entity | Attributes (PK underlined in the original = first column listed) |
|--------|------|
| USER | **user_id** (PK), username, email, password_hash, role, created_at |
| PROJECT | **project_id** (PK), title, slug, category, description, summary, cover_image_url, event_date, status, location, user_id (FK → USER), created_at |
| PROJECT_GALLERY | **image_id** (PK), project_id (FK → PROJECT), image_url, caption, uploaded_at |
| EXECUTIVE_MEMBER | **member_id** (PK), full_name, designation, term_year, bio, profile_image_url, contact_email, display_order |
| INQUIRY_VOLUNTEER | **inquiry_id** (PK), sender_name, sender_email, contact_number, inquiry_type, message_content, status, submitted_at |

### 1.7 Class Diagram (as drawn in the proposal)

**`<<abstract>> ContentItem`** (protected attributes): `id: String`, `title: String`, `slug: String`, `content: String`, `coverImageUrl: String`, `status: String`, `createdAt: DateTime`. Methods: `publish(): void`, `archive(): void`.

**`Project extends ContentItem`**: private `category: String`, `eventDate: Date`, `location: String`, `gallery: List<GalleryImage>`. Methods: `addImage(img: GalleryImage): void`, `removeImage(id: String): void`.

**`NewsAnnouncement extends ContentItem`**: private `newsType: String`, `isPinned: Boolean`, `expireDate: Date`. Method: `pinToTop(): void`.

Layered flow (each uses/delegates/connects to the next):

- **`CMSAdminController`** (`- cmsService: CMSService`): `createProject(dto: ProjectDTO): Project`, `updateProject(id: String, dto: ProjectDTO): Project`, `createNews(dto: NewsDTO): NewsAnnouncement`, `publishContent(id: String): Boolean`
  → *uses* →
- **`CMSService`** (`- contentRepo: ContentRepository`, `- storageService: StorageService`): `saveProject(data: ProjectDTO): Project`, `saveNews(data: NewsDTO): NewsAnnouncement`, `deleteContent(id: String): Boolean`
  → *delegates* →
- **`ContentRepository`** (`- dbConnection: DatabaseConnection`): `findContentById(id: String): ContentItem`, `save(item: ContentItem): Boolean`, `delete(id: String): Boolean`
  → *connects* →
- **`DatabaseConnection`** (`- connectionPool: Object`): `executeQuery(sql: String, params: List): ResultSet`

### 1.8 Development Environment

**Hardware**

- Dev machines: Intel Core i5 / Ryzen 5 or equivalent, 8 GB RAM (16 GB recommended), 256 GB SSD, broadband.
- Production: cloud VPS / shared host, 1 vCPU, 1 GB RAM, 15 GB SSD, 99.5% uptime guarantee.

**Software**

- OS: Windows 10/11, macOS, or Ubuntu 22.04 LTS.
- Editor: VS Code with ESLint, Prettier, Git integration.
- DB tools: MySQL Workbench, phpMyAdmin, or DBeaver.
- VCS: Git + GitHub.
- Design/testing: Postman (API), Figma (UI/UX wireframes).

**Technology** (the proposal gives alternatives; see Section 3 for recommended picks)

- Frontend: Next.js / React.js or HTML5, Tailwind CSS, JavaScript (ES6+).
- Backend: Node.js + Express.js (or PHP 8.x + Laravel).
- Database: MySQL 8.0 or PostgreSQL.
- Assets: Cloudinary CDN or AWS S3.
- Hosting: Vercel / Render, or cPanel-managed Apache/Nginx.

### 1.9 Modules

| ID | Module | Scope & features | Target users |
|----|--------|------------------|--------------|
| M01 | Authentication & Security | Encrypted login, JWT/session verification, role-based access control, password recovery | Admins, Editors |
| M02 | Project & News Management (CMS) | Code-free CRUD for projects, news articles, announcements; WYSIWYG editor; image uploads | Admins, Editors |
| M03 | Board Directory | Maintain current and past Lions board members, designations, bios, service term years | Admins, Public |
| M04 | Public Portal & Gallery | Dynamic homepage, club impact counters, searchable project archive, lightbox image galleries | General public, donors |

### 1.10 Functional Requirements

- **FR-01** Render club mission, vision, history and humanitarian service pillars on the public homepage.
- **FR-02** Search and filter community projects by category, keyword and year.
- **FR-03** Responsive image galleries with lightbox for each documented activity.
- **FR-04** Executive committee directory, filterable by Lionistic administrative year.
- **FR-05** Capture and validate public volunteer signups and general inquiries via secure web forms.
- **FR-06** Admin CMS for creating, updating and deleting projects, news and board records.
- **FR-07** Admins can review, manage and export received volunteer submissions and inquiries.

### 1.11 Non-Functional Requirements

- **NFR-01 Performance:** landing page loads in under 2.5 s on standard 4G.
- **NFR-02 Usability:** fully responsive from 360 px to 1920 px; WCAG 2.1 AA.
- **NFR-03 Availability:** 99.5% uptime; weekly database backups.
- **NFR-04 Maintainability:** clean MVC architecture and modular components.

### 1.12 Security Requirements

- **SEC-01** TLS/HTTPS on all public and admin client-server traffic.
- **SEC-02** Sanitize all form inputs; use parameterized queries (SQL injection defense).
- **SEC-03** HTML-encode all dynamic output; implement Content Security Policy (XSS defense).
- **SEC-04** Admin passwords salted and hashed with bcrypt (work factor ≥ 10) or Argon2.
- **SEC-05** Anti-CSRF token verification on all state-changing admin POST/PUT/DELETE requests.

### 1.13 Uniqueness of the Product

- **Proven structural paradigm:** adapts the layout of sabraleos.org for an established community organization.
- **Impact metrics dashboard:** automated homepage counters (e.g. beneficiaries served, vision screenings completed, trees planted).
- **Zero ongoing agency dependency:** lightweight admin console for non-technical officers, no retainer fees.

### 1.14 Methodology: Agile Scrum, 4 sprints

| Sprint | Weeks | Focus | Deliverables |
|--------|-------|-------|--------------|
| 1 | 1–2 | Inception & Design | Stakeholder discovery with club officers, requirements, Figma wireframes, DB schema specification |
| 2 | 3–5 | Core Architecture & UI | Project init, DB migrations, public page layouts (Home, About, Service Pillars) |
| 3 | 6–8 | CMS & Integration | Admin auth, CMS CRUD dashboard, dynamic project archive, photo gallery, contact form handling |
| 4 | 9–11 | UAT & Deployment | Cross-browser testing, accessibility review, UAT with club officials, documentation, live deployment |

### 1.15 Gantt Chart (task list, 12 weeks W1–W12)

Tasks: Requirement Gathering & Proposal; UI/UX Wireframing & System Design; Database Setup & Backend Core; Frontend Implementation (Public); Admin CMS & Security Integration; Quality Assurance & Unit Testing; Client Review & UAT (Lions Club); Production Handover & Training.

Week-by-week marks were not recoverable from the source PDF. Number of weeks per task: 2, 2, 2, 3, 3, 2, 2, 1. Use the sprint table in 1.14 for scheduling.

### 1.16 Cost Estimate

| Item | Term | Unit cost (LKR) | Total (LKR) | Responsible |
|------|------|-----------------|-------------|-------------|
| Domain registration (.org / .lk) | 1 year | 5,500.00 | 5,500.00 | Lions Club of Balangoda |
| Cloud web hosting & SSL certificate | 1 year | 12,000.00 | 12,000.00 | Lions Club of Balangoda |
| UI/UX design & system architecture | Academic | 0 | 0 | Student team |
| Full-stack software development | Academic | 0 | 0 | Student team |
| UAT, deployment & end-user training | Academic | 0 | 0 | Student team |

**Total: LKR 17,500.00**

### 1.17 References

- Leo Club of Sabaragamuwa University of Sri Lanka. (n.d.). Official Portal of Sabra Leos. https://sabraleos.org
- Lions Clubs International. (2024). Lions Brand Guidelines, Logos, and Graphic Standards.
- Pressman, R. S., & Maxim, B. R. (2020). *Software Engineering: A Practitioner's Approach* (9th ed.). McGraw-Hill.
- Schwaber, K., & Sutherland, J. (2020). *The Scrum Guide*. Creative Commons.
- W3C. (2018). *Web Content Accessibility Guidelines (WCAG) 2.1*.

---

## 2. Gaps and Inconsistencies in the Proposal

Resolve these early; the proposal does not.

1. **Module count:** text says five modules, but only M01–M04 are defined. Treat it as **four modules**.
2. **News has no table:** the class diagram defines `NewsAnnouncement` and UC09/FR-06 require news CRUD, but the ER diagram has no NEWS entity. Add one (see 3.2).
3. **Duplicate `location`** attribute on PROJECT in the ER diagram. Keep a single `location`.
4. **Timeline mismatch:** sprints cover weeks 1–11, the Gantt shows 12 weeks (extra week is handover and training).
5. **Roles:** M01 mentions "Admins, Editors" and RBAC, but the ER `USER.role` has no defined values and the use cases only have "Club Administrator". Define roles (see 3.3).
6. **Stack is not chosen:** every layer is "A or B".
7. **Email notifications** (objective 3) are required but no email provider is named.
8. **Impact counters** (homepage) have no data source defined. Needs a table or an admin-editable settings entity.
9. **Password recovery** (M01) needs email delivery and a reset-token mechanism, not shown in the ER.
10. **Export format** for UC12/FR-07 is unspecified (CSV is the sensible choice).
11. **Content scope gaps:** FR-01 requires mission, vision, history and service pillars content, which the club must supply. The "service pillars" are healthcare, education, environment and poverty relief per the introduction.
12. **Class diagram** shows `StorageService` (used by `CMSService`) but doesn't define it. It is the image-upload abstraction (Cloudinary/S3).
13. **Language:** no requirement is stated for Sinhala/Tamil. Assume English only unless the client says otherwise.

---

## 3. Recommended Implementation Decisions

Recommendations, not part of the approved text. Change if the team decides otherwise.

### 3.1 Suggested stack (resolves the "A or B" choices)

- **Frontend:** React (Next.js or Vite) + TypeScript + Tailwind CSS. Next.js helps NFR-01 and SEO via SSR/SSG.
- **Backend:** Node.js + Express, MVC layering that mirrors the class diagram (Controller → Service → Repository → DB).
- **Database:** PostgreSQL (or MySQL 8). Use an ORM or query builder with parameterized queries only (SEC-02).
- **Media:** Cloudinary (image CDN, transformations help the < 2.5 s target).
- **Email:** any transactional provider or SMTP (e.g. Resend/Brevo/Gmail SMTP) for inquiry/volunteer notifications and password reset.
- **Hosting:** the budget (LKR 17,500/yr) covers domain plus one hosting plan; confirm the chosen stack fits the actual hosting (cPanel favors PHP/MySQL; Node needs VPS/Render/Vercel).
- **Rich text:** a WYSIWYG editor (e.g. TipTap, Quill) with server-side HTML sanitization.

### 3.2 Suggested data model additions

```
NEWS_ANNOUNCEMENT
  news_id PK, title, slug (unique), content, cover_image_url,
  news_type, is_pinned (bool), expire_date, status (draft|published|archived),
  user_id FK -> USER, created_at, updated_at

IMPACT_STAT            -- for homepage counters
  stat_id PK, label, value (int), icon, display_order

PASSWORD_RESET_TOKEN   -- for M01 password recovery
  token_hash, user_id FK, expires_at, used_at
```

Other conventions:

- `PROJECT.status` and `NEWS.status`: `draft | published | archived` (matches `publish()` / `archive()` in the class diagram).
- `PROJECT.category` values aligned to service pillars: healthcare, education, environment, poverty relief (extendable).
- `INQUIRY_VOLUNTEER.inquiry_type`: `volunteer | general | sponsorship`; `status`: `new | in_progress | resolved`.
- `EXECUTIVE_MEMBER.term_year` drives the board filter (FR-04); `display_order` controls ordering within a term.
- Slugs unique per table; index `slug`, `status`, `category`, `event_date`, `term_year`.

### 3.3 Roles and access

- **Admin:** all CMS actions, user management, view/export inquiries.
- **Editor:** create/edit projects, news, gallery and board records; cannot manage users.
- Public visitors are unauthenticated and read-only, except for the two public forms.

### 3.4 Pages / routes (derived from use cases)

Public: `/` (hero, mission/vision, service pillars, impact counters, latest projects/news), `/about`, `/projects` (search + category/year filters), `/projects/[slug]` (gallery + lightbox), `/news`, `/news/[slug]`, `/board` (term filter), `/volunteer`, `/contact`.
Admin (behind login): `/admin/login`, `/admin` dashboard, `/admin/projects`, `/admin/news`, `/admin/gallery`, `/admin/board`, `/admin/submissions` (review, status, CSV export), `/admin/users` (admin only), `/admin/stats`.

### 3.5 Build order (maps to sprints)

1. **Sprint 1:** Figma wireframes, finalize schema (including 3.2), repo and CI setup.
2. **Sprint 2:** project scaffold, migrations and seed data, public layouts (Home, About, pillars), design tokens (Lions branding per the Lions brand guidelines).
3. **Sprint 3:** auth + RBAC, CMS CRUD (projects, news, board, gallery uploads), project archive with search/filter, forms with validation and email notifications, submissions admin and CSV export.
4. **Sprint 4:** cross-browser and accessibility audit (WCAG 2.1 AA), performance tuning (< 2.5 s LCP on 4G), UAT with club officers, admin manual, training session, production deploy with HTTPS and weekly DB backups.

### 3.6 Acceptance checklist (from requirements)

- [ ] Homepage shows mission, vision, history, service pillars (FR-01)
- [ ] Project search + category/keyword/year filter (FR-02)
- [ ] Responsive gallery with lightbox (FR-03)
- [ ] Board directory filtered by term (FR-04)
- [ ] Volunteer and inquiry forms validated server-side; email notification sent (FR-05, objective 3)
- [ ] Admin CRUD for projects, news, board (FR-06); gallery uploads
- [ ] Admin can review/manage/export submissions (FR-07)
- [ ] Homepage impact counters, admin-editable
- [ ] Landing page < 2.5 s on 4G (NFR-01)
- [ ] 360–1920 px responsive, WCAG 2.1 AA (NFR-02)
- [ ] 99.5% uptime hosting, weekly DB backups (NFR-03)
- [ ] MVC/modular code structure (NFR-04)
- [ ] HTTPS everywhere (SEC-01); parameterized queries and input sanitization (SEC-02); output encoding + CSP (SEC-03); bcrypt ≥ 10 or Argon2 (SEC-04); CSRF tokens on state-changing admin requests (SEC-05)
- [ ] Admin operations manual delivered; onboarding training held
- [ ] SEO basics: meta tags, sitemap, semantic HTML, Open Graph
