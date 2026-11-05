# CMS Admin Requirements Traceability Matrix (RTM)

**Project:** Lions Club of Balangoda Web Portal & Content Management System  
**Course:** IS5109 – Information Systems Project for Community (Group 14)  
**Client:** Lions Club of Balangoda (Lions Clubs International District 306)  
**Target Users:** Non-technical Club Officers (President, Secretary, IT Coordinator, Project Chairs)  
**Reviewer:** Jinos  
**Author:** Ahmed Ahnaf (Branch: `ahmed_ahnaf`)  
**Design Phase:** Sprint 1 Milestone  

---

## 1. Source Requirements Definition

This specification strictly derives from the approved project proposal (`Docs/project-proposal.md`) and the database schema specification (`Docs/database-schema-specification.md`). No requirements have been fabricated.

### 1.1 Exact Definition of FR-06
> **FR-06:** Admin CMS for creating, updating and deleting projects, news and board records.
- **Linked Proposal Use Cases:**
  - `UC07`: Secure authentication / login.
  - `UC08`: Publish & manage projects without code.
  - `UC09`: Publish & manage news / announcements without code.
  - `UC10`: Curate media gallery & event photos.
  - `UC11`: Update executive board & profiles.
- **Linked Modules:**
  - `M01`: Authentication & Security (Role-Based Access Control, session verification).
  - `M02`: Project & News Management (Code-free CRUD, WYSIWYG editor, image uploads).
  - `M03`: Board Directory (Maintain current and past Lions board members, designations, bios, term years).
- **Core Entities & Methods:**
  - `ContentItem` (`publish(): void`, `archive(): void`)
  - `Project` (`addImage()`, `removeImage()`)
  - `NewsAnnouncement` (`pinToTop()`, `isPinned`, `expireDate`)
  - `ExecutiveMember` (`displayOrder`, `termYear`)

### 1.2 Exact Definition of FR-07
> **FR-07:** Admins can review, manage and export received volunteer submissions and inquiries.
- **Linked Proposal Use Cases:**
  - `UC12`: Review & export volunteer signups & inquiries.
- **Proposal Resolution (Section 2, Item 10):**
  - Standard export format specified as **CSV (Comma Separated Values)** for spreadsheet interoperability in Microsoft Excel and Google Sheets.
- **Core Entities:**
  - `volunteer_applications` (Status lifecycle: `PENDING`, `REVIEWED`, `INTERVIEWED`, `ACCEPTED`, `REJECTED`, admin internal notes, reviewed_by).
  - `general_inquiries` (Status lifecycle: `NEW`, `IN_PROGRESS`, `RESOLVED`, `SPAM`, inquiry categories: `GENERAL`, `SPONSORSHIP`, `PARTNERSHIP`, `DONATION`, `FEEDBACK`).

---

## 2. Requirements Traceability Matrix Table

| Req ID | Requirement Description | CMS Operation | Admin Action | Expected System Response | Relevant Workflow | Relevant Screen Spec | Validation & Feedback | Coverage Status |
|---|---|---|---|---|---|---|---|---|
| **FR-06.AUTH.1** | Secure access to administrative portal | Admin Authentication | Enter email and password; click "Sign In" | Authenticate credentials; generate secure session; navigate to CMS Dashboard | WF-AUTH-01 | SCR-01 (Admin Login) | Validate non-empty fields; invalid credential toast | **COMPLETED** |
| **FR-06.AUTH.2** | Graceful handling of invalid logins | Authentication Rejection | Enter incorrect password or unrecognized email | Block authentication; display plain-language error banner without leaking user existence | WF-AUTH-02 | SCR-01 (Admin Login) | Red alert banner: "Invalid email or password" | **COMPLETED** |
| **FR-06.AUTH.3** | End authenticated session safely | Admin Logout | Click "Sign Out" button in admin navigation header | Invalidate active session tokens; redirect to public portal with confirmation toast | WF-AUTH-03 | Global Admin Header | "You have safely signed out" toast | **COMPLETED** |
| **FR-06.DASH.1** | Administrative overview and shortcuts | View Dashboard | Access `/admin` after login | Display high-level activity metrics, quick action buttons, and recent submissions | WF-DASH-01 | SCR-02 (Dashboard) | Fetch real-time counts from database | **COMPLETED** |
| **FR-06.PROJ.1** | List community service projects | View Project List | Navigate to Projects tab (`/admin/projects`) | Display paginated table of projects with category, date, publication status, and action buttons | WF-PROJ-01 | SCR-03 (Projects List) | Filter by status/category; empty state message | **COMPLETED** |
| **FR-06.PROJ.2** | Record new humanitarian project | Create Project | Click "New Project"; fill form; select Save as Draft or Publish | Validate inputs; generate unique slug; store project; upload cover image; show success alert | WF-PROJ-02 | SCR-04 (Project Create) | Required field checks; date format check; success toast | **COMPLETED** |
| **FR-06.PROJ.3** | Inspect full project history & media | View Project Details | Click "View" or project title in projects table | Display read-only view with metadata, body content, gallery preview, and change history | WF-PROJ-03 | SCR-06 (Project Detail) | Load project by ID; handle 404 if not found | **COMPLETED** |
| **FR-06.PROJ.4** | Modify project details or content | Edit Project | Click "Edit" on project; modify fields; click "Update Project" | Validate modified fields; save updates; update `updated_at` timestamp; display confirmation | WF-PROJ-04 | SCR-05 (Project Edit) | Ensure slug uniqueness; optimistic UI with rollback | **COMPLETED** |
| **FR-06.PROJ.5** | Remove obsolete or mistakenly added project | Delete Project | Click "Delete" action; review warning dialog; confirm deletion | Cascade delete attached gallery records; remove record from database; redirect to list | WF-PROJ-05 | SCR-19 (Delete Confirmation) | Two-step confirmation dialog; warning of permanence | **COMPLETED** |
| **FR-06.PROJ.6** | Make project publicly visible | Publish Project | Click "Publish" on draft project | Set `status = 'PUBLISHED'`; set `published_at`; show green live status badge | WF-PROJ-06 | SCR-04, SCR-05 | Ensure cover image and required content present | **COMPLETED** |
| **FR-06.PROJ.7** | Withdraw project from public view | Unpublish Project | Click "Unpublish" on live project; confirm dialog | Set `status = 'DRAFT'`; remove from public portal; keep all content intact in CMS | WF-PROJ-07 | SCR-20 (Unpublish Confirmation) | Non-destructive confirmation dialog; amber badge | **COMPLETED** |
| **FR-06.NEWS.1** | List news articles & announcements | View News List | Navigate to News tab (`/admin/news`) | Display paginated table of news items with news type, author, pin status, and publish date | WF-NEWS-01 | SCR-07 (News List) | Search and type filter; empty state prompt | **COMPLETED** |
| **FR-06.NEWS.2** | Create club announcement or press release | Create News Item | Click "New Article"; fill title, body, type; optionally pin | Validate inputs; generate slug; save article; display success banner | WF-NEWS-02 | SCR-08 (News Create) | Validate title, news type; check optional expiry date | **COMPLETED** |
| **FR-06.NEWS.3** | Inspect announcement details | View News Details | Click "View" on news article row | Display preview of article formatting, pin status, expiration, and cover image | WF-NEWS-03 | SCR-10 (News Detail) | Load article by ID; display live/draft status | **COMPLETED** |
| **FR-06.NEWS.4** | Edit news article content | Edit News Item | Click "Edit"; alter text or change pin status; click Save | Apply changes; refresh cache; update timestamp; show success confirmation | WF-NEWS-04 | SCR-09 (News Edit) | Field validation; preserve original author | **COMPLETED** |
| **FR-06.NEWS.5** | Remove news article | Delete News Item | Click "Delete"; confirm deletion dialog | Remove record from database; redirect to news table with confirmation notice | WF-NEWS-05 | SCR-19 (Delete Confirmation) | Permanent deletion warning; red confirmation button | **COMPLETED** |
| **FR-06.NEWS.6** | Pin urgent notice to public homepage | Pin News Announcement | Toggle "Pin to Top" switch | Set `is_pinned = TRUE`; elevate item in public homepage news feed | WF-NEWS-06 | SCR-08, SCR-09 | Only active announcements can be pinned | **COMPLETED** |
| **FR-06.NEWS.7** | Unpublish live announcement | Unpublish News | Click "Unpublish"; confirm in prompt | Set `status = 'DRAFT'`; remove from public portal; retain CMS draft | WF-NEWS-07 | SCR-20 (Unpublish Confirmation) | Clarify that article is hidden but not deleted | **COMPLETED** |
| **FR-06.BOARD.1** | View executive board roster | View Board Records | Navigate to Board tab (`/admin/board`) | Display directory grouped or filterable by Lionistic term year (e.g., 2026/2027) | WF-BOARD-01 | SCR-11 (Board Records List) | Term selector dropdown; display order sorting | **COMPLETED** |
| **FR-06.BOARD.2** | Add new executive officer | Create Board Record | Click "Add Member"; input name, designation, term, photo | Validate inputs; associate with board term; save record; update public roster | WF-BOARD-02 | SCR-12 (Board Record Create) | Validate term selection, name, designation | **COMPLETED** |
| **FR-06.BOARD.3** | View member profile and contact info | View Board Details | Click officer row in board list | Display full profile, Lion title, contact email, phone, and display sequence | WF-BOARD-03 | SCR-14 (Board Detail) | Display associated photo and term label | **COMPLETED** |
| **FR-06.BOARD.4** | Update member title or bio | Edit Board Record | Click "Edit" on officer; modify designation/order; save | Persist updates; re-sort roster according to `display_order`; show success toast | WF-BOARD-04 | SCR-13 (Board Record Edit) | Prevent negative display order; email validation | **COMPLETED** |
| **FR-06.BOARD.5** | Remove officer record | Delete Board Record | Click "Delete" on officer; confirm in dialog | Delete officer record from database; confirm removal with green toast | WF-BOARD-05 | SCR-19 (Delete Confirmation) | Verify officer is not primary contact before deletion | **COMPLETED** |
| **FR-06.MEDIA.1** | Upload photo assets without coding | Upload Media | Click "Upload Photo" or drag-and-drop into media uploader | Validate file type (JPG/PNG/WebP) and size (< 5 MB); upload to Cloudinary CDN; save asset record | WF-MEDIA-01 | SCR-15 (Media Upload Modal) | Client-side file type and size validation | **COMPLETED** |
| **FR-06.MEDIA.2** | Curate photo galleries for projects | Associate Gallery Photos | Select uploaded media items inside Project Create/Edit form | Link asset IDs to project gallery table; display drag-and-drop ordering grid | WF-MEDIA-02 | SCR-04, SCR-05, SCR-15 | Max 20 photos per project; caption validation | **COMPLETED** |
| **FR-07.VOL.1** | Inspect incoming volunteer signups | View Volunteer Submissions | Navigate to Submissions tab (`/admin/submissions?tab=volunteers`) | Display tabular list of applicants with date, contact details, areas of interest, and status badge | WF-SUB-01 | SCR-16 (Submissions List) | Filter by status (`PENDING`, `ACCEPTED`, etc.) | **COMPLETED** |
| **FR-07.VOL.2** | Review detailed applicant profile | View Volunteer Details | Click applicant row or "Review" button | Open full application with skills, availability, motivation note, and internal notes log | WF-SUB-02 | SCR-17 (Volunteer Detail) | Read-only applicant data; editable review notes | **COMPLETED** |
| **FR-07.VOL.3** | Update volunteer application status | Manage Volunteer Status | Select new status (`REVIEWED`, `INTERVIEWED`, `ACCEPTED`, `REJECTED`) and save | Update record status in DB; record `reviewed_by` officer ID; show status badge update | WF-SUB-03 | SCR-17 (Volunteer Detail) | Record timestamp and officer identity | **COMPLETED** |
| **FR-07.VOL.4** | Export volunteer data to spreadsheet | Export Volunteers to CSV | Click "Export Volunteers (CSV)" button | Generate RFC 4180 compliant CSV file containing filtered volunteer records; prompt download | WF-SUB-04 | SCR-16 (Submissions List) | Sanitize CSV injection characters (`=`, `+`, `-`, `@`) | **COMPLETED** |
| **FR-07.INQ.1** | Review public and sponsor inquiries | View Inquiries List | Navigate to Submissions tab (`/admin/submissions?tab=inquiries`) | Display table of inquiries with date, sender name, inquiry type (General/Sponsorship), and status | WF-SUB-05 | SCR-16 (Submissions List) | Filter by inquiry type and status (`NEW`, `RESOLVED`) | **COMPLETED** |
| **FR-07.INQ.2** | Read full inquiry message | View Inquiry Details | Click on inquiry row or "Read Message" | Display sender contact, subject, message body, submission timestamp, and staff notes | WF-SUB-06 | SCR-18 (Inquiry Detail) | Display sender email mailto shortcut | **COMPLETED** |
| **FR-07.INQ.3** | Track inquiry resolution lifecycle | Manage Inquiry Status | Update status (`IN_PROGRESS`, `RESOLVED`, `SPAM`); enter internal note; save | Persist status change; update resolution timestamp if resolved; display success toast | WF-SUB-07 | SCR-18 (Inquiry Detail) | Internal note required when resolving or marking spam | **COMPLETED** |
| **FR-07.INQ.4** | Export inquiries for committee meetings | Export Inquiries to CSV | Click "Export Inquiries (CSV)" button | Generate CSV file of inquiries for spreadsheet analysis; prompt browser file download | WF-SUB-08 | SCR-16 (Submissions List) | UTF-8 with BOM for Excel compatibility | **COMPLETED** |

---

## 3. Scope Coverage Verification

- **FR-06 Operations Covered:**
  - Projects: Create, Read (List & Detail), Update, Delete, Publish, Unpublish (100%)
  - News & Announcements: Create, Read (List & Detail), Update, Delete, Publish, Unpublish, Pin to Top (100%)
  - Executive Board: Create, Read (List & Detail), Update, Delete (100%)
  - Media & Gallery: Select, Upload, Validate, Preview, Associate (100%)
- **FR-07 Operations Covered:**
  - Volunteer Submissions: List, View Detail, Manage Status Lifecycle, Add Internal Notes, Export to CSV (100%)
  - General & Sponsorship Inquiries: List, View Detail, Update Resolution Status, Add Internal Notes, Export to CSV (100%)
- **Authentication & Dashboard Support Operations:**
  - Login, Invalid Login Handling, Session Management, Logout, Dashboard Summaries & Shortcuts (100%)

All 33 discrete administrative operations are fully mapped to dedicated workflows, textual screen specifications, and validation rules in the accompanying documentation files.
