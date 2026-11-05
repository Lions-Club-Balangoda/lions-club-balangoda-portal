# Textual Screen Specifications for CMS Admin

**Project:** Lions Club of Balangoda Web Portal & Content Management System  
**Course:** IS5109 Community Project (Group 14)  
**Target Users:** Non-Technical Club Officers (President, Secretary, IT Coordinator, Directors)  
**Requirement Mapping:** FR-06 & FR-07  
**Reviewer:** Jinos  
**Author:** Ahmed Ahnaf (Branch: `ahmed_ahnaf`)  

> **Design Methodology Notice:**  
> In compliance with project guidelines, this document establishes **purely textual screen specifications**. No visual wireframes, Figma designs, graphical mockups, or UI prototypes are utilized. Every screen is defined through structured technical criteria covering information hierarchy, form inputs, validation rules, user actions, and feedback states.

---

## Screen Inventory

1. **`SCR-01`**: Admin Login Screen (`/admin/login`)
2. **`SCR-02`**: CMS Admin Dashboard (`/admin`)
3. **`SCR-03`**: Projects List Screen (`/admin/projects`)
4. **`SCR-04`**: Project Create Screen (`/admin/projects/create`)
5. **`SCR-05`**: Project Edit Screen (`/admin/projects/[id]/edit`)
6. **`SCR-06`**: Project Detail Screen (`/admin/projects/[id]`)
7. **`SCR-07`**: News & Announcements List Screen (`/admin/news`)
8. **`SCR-08`**: News Create Screen (`/admin/news/create`)
9. **`SCR-09`**: News Edit Screen (`/admin/news/[id]/edit`)
10. **`SCR-10`**: News Detail Screen (`/admin/news/[id]`)
11. **`SCR-11`**: Executive Board Records List Screen (`/admin/board`)
12. **`SCR-12`**: Board Record Create Screen (`/admin/board/create`)
13. **`SCR-13`**: Board Record Edit Screen (`/admin/board/[id]/edit`)
14. **`SCR-14`**: Board Record Detail Screen (`/admin/board/[id]`)
15. **`SCR-15`**: Media Upload & Library Modal (`/admin/media`)
16. **`SCR-16`**: Submissions & Inquiries Management Screen (`/admin/submissions`)
17. **`SCR-17`**: Volunteer Application Review Detail Screen (`/admin/submissions/volunteers/[id]`)
18. **`SCR-18`**: General & Sponsor Inquiry Detail Screen (`/admin/submissions/inquiries/[id]`)
19. **`SCR-19`**: Delete Confirmation Modal Pattern (Permanent Deletion)
20. **`SCR-20`**: Unpublish Confirmation Modal Pattern (Safe Revert to Draft)

---

## Detailed Screen Specifications

### SCR-01: Admin Login Screen
- **Route:** `/admin/login`
- **Purpose:** Secure entry point for club officers to access administrative functions.
- **Intended User:** Authorized Club Officers (`ADMIN` or `EDITOR`).
- **Entry Point / Navigation:** Direct URL entry, automatic redirection from protected routes, or discrete "Club Officer Login" link in public portal footer.
- **Information Displayed:**
  - Official Lions Club of Balangoda emblem / branding.
  - Heading: *"Lions Club of Balangoda – Officer Portal"*.
  - Subheading: *"Enter your registered club officer credentials to manage website content."*
  - Security reassurance notice (*"TLS 256-bit Encrypted Session"*).
- **Input Fields:**
  - `email`: Text input (type `email`). Label: *"Official Email Address"*. Placeholder: `officer@balangodalions.org`. **Required.**
  - `password`: Password input (type `password` with toggleable eye icon). Label: *"Password"*. **Required.**
  - `remember_me`: Checkbox. Label: *"Remember me on this browser"*. Optional.
- **Available Actions:**
  - Primary Button: **"Sign In"** (triggers authentication).
  - Text Link: *"Forgot password?"* (navigates to password reset initiation).
  - Secondary Link: *"← Return to Public Website"* (navigates to `/`).
- **Validation Rules:**
  - Email: Must be non-empty and valid email syntax.
  - Password: Must be non-empty (minimum 8 characters).
- **Success Feedback:** Submit button shows spinner *"Signing in..."*; on success, navigates to `/admin` with top toast *"Welcome back, Lion [Name]!"*.
- **Error Feedback:** Red alert banner above form: *"Invalid email or password. Please verify and try again."* (No disclosure of which field was invalid).
- **Navigation After Completion:** Redirects to `/admin` or previously intercepted target URL.

---

### SCR-02: CMS Admin Dashboard
- **Route:** `/admin`
- **Purpose:** Operational command center presenting high-level activity metrics and quick navigation shortcuts.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Entry Point / Navigation:** Left-hand navigation sidebar: *"Dashboard"* (top item).
- **Information Displayed:**
  - Welcome Banner: *"Good day, Lion [Full Name] ([Role Badge]) – Term 2026/2027"*.
  - Four Metric Summary Cards:
    1. **Active Projects:** Total published projects count + draft count.
    2. **Published News:** Total active news posts + count of pinned announcements.
    3. **Pending Volunteer Signups:** Number of applications awaiting review (highlighted if > 0).
    4. **Unresolved Inquiries:** Number of contact/sponsorship messages requiring reply.
  - Quick Action Section: Single-click shortcuts for primary tasks.
  - Recent Submissions Feed: List of last 5 volunteer signups and public inquiries with timestamps.
  - System Status: Confirmation that database backups and SSL encryption are healthy.
- **Available Actions:**
  - Shortcut Button: **"+ New Project"** (navigates to `SCR-04`).
  - Shortcut Button: **"+ New Announcement"** (navigates to `SCR-08`).
  - Shortcut Button: **"Review Volunteer Submissions"** (navigates to `SCR-16`).
  - Shortcut Button: **"Upload Photos"** (opens `SCR-15`).
- **Validation Rules:** None (read-only view).
- **Success Feedback:** Real-time data loaded cleanly.
- **Error Feedback:** Metric card displays *"Unable to load count. [Retry]"* if an individual query fails.
- **Navigation After Completion:** Stays on dashboard or follows clicked shortcut.

---

### SCR-03: Projects List Screen
- **Route:** `/admin/projects`
- **Purpose:** Central management view for browsing, filtering, and managing community service projects.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Entry Point / Navigation:** Left sidebar: *"Projects"*. Breadcrumbs: `Dashboard > Projects`.
- **Information Displayed:**
  - Page Title: *"Community Service Projects"*.
  - Subtitle: *"Manage club humanitarian activities, public stories, and photo galleries."*
  - Search Bar: Real-time search by project title, keyword, or location.
  - Filter Controls: Dropdown for Service Pillar (`All`, `Healthcare`, `Education`, `Environment`, `Poverty Relief`, `Other`); Dropdown for Status (`All`, `Published`, `Draft`).
  - Projects Table Columns:
    - Cover Thumbnail (60x40px).
    - Title & Location.
    - Service Pillar / Category (colored badge).
    - Event Date (formatted DD MMM YYYY).
    - Publication Status Badge (`PUBLISHED` green, `DRAFT` amber).
    - Action Icons: View (eye), Edit (pencil), Delete (trashcan).
  - Pagination Controls: Page size selector (10, 25, 50), Next / Previous buttons, Total item counter.
  - Empty State: When no records found: *"No projects found matching your search. Create your first project by clicking '+ New Project'."*
- **Available Actions:**
  - Primary Button: **"+ New Project"** (top right, navigates to `SCR-04`).
  - Table Row Actions:
    - Click Title or View icon → Navigates to `SCR-06` (Project Detail).
    - Click Edit icon → Navigates to `SCR-05` (Project Edit).
    - Click Delete icon → Triggers `SCR-19` (Delete Confirmation).
- **Validation Rules:** None for listing; search string sanitized.
- **Success Feedback:** Live table update on filter/search change.
- **Error Feedback:** Red banner if database query fails: *"Failed to load projects. [Retry]"*.
- **Navigation After Completion:** Navigates to selected detail, editor, or create view.

---

### SCR-04: Project Create Screen
- **Route:** `/admin/projects/create`
- **Purpose:** Form for officers to record and publish a new community service project without technical coding.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Entry Point / Navigation:** Button on `SCR-03` or dashboard shortcut. Breadcrumbs: `Dashboard > Projects > New Project`.
- **Information Displayed:**
  - Header: *"Create New Service Project"*.
  - Helper Notice: *"Fill out project details below. You can save as a draft to finish later or publish immediately to the website."*
  - Logical Form Grouping:
    - Section 1: Basic Information (Title, Category, Dates, Location).
    - Section 2: Media & Visuals (Cover Image, Gallery Photos).
    - Section 3: Story & Narrative (Summary, Detailed Body).
- **Input Fields:**
  - `title`: Single-line text input. Label: *"Project Title"*. Placeholder: *"e.g., Annual Cataract Surgery Camp 2026"*. **Required.** (5–150 characters).
  - `slug`: Text input with lock icon. Label: *"Web Link (Slug)"*. Auto-generated from title, editable. Helper text: *"The public URL for this project."* **Required.** (unique).
  - `category`: Select dropdown. Label: *"Service Pillar / Category"*. Options: `Healthcare`, `Education`, `Environment`, `Poverty Relief`, `Other`. **Required.**
  - `event_date`: Date picker. Label: *"Event Date"*. **Required.**
  - `location`: Single-line text input. Label: *"Location / Venue"*. Placeholder: *"e.g., Balangoda District Hospital"*. **Required.**
  - `cover_image`: Media selector component. Button: *"Select Cover Photo"*. Shows thumbnail preview once chosen. **Required for publishing; optional for draft.**
  - `summary`: Multi-line text area. Label: *"Short Summary"*. Helper text: *"Brief summary displayed on homepage cards (max 300 characters)."* **Required.**
  - `content`: Rich-Text WYSIWYG editor (toolbar with Bold, Italic, Headings, Bullet Lists, Blockquotes). Label: *"Project Story & Impact Details"*. **Required.**
  - `gallery_images`: Multi-file photo selector. Helper text: *"Attach up to 20 photos for the project gallery lightbox."* Optional.
- **Available Actions:**
  - Primary Action 1: **"Publish Now"** (validates all fields, marks `PUBLISHED`, makes live).
  - Secondary Action 2: **"Save as Draft"** (saves progress with `DRAFT` status).
  - Tertiary Action 3: **"Cancel"** (discards unsaved input after confirmation).
- **Validation Rules:**
  - Title, category, event_date, location, summary, content are mandatory.
  - Cover image must be uploaded before publishing.
  - Slug must be unique in `projects` table.
- **Success Feedback:** Green toast: *"Project '[Title]' was successfully created and [published / saved as draft]!"*
- **Error Feedback:** Form scrolls to top error; fields with errors outlined in red with helper text: *"Please enter a project title (minimum 5 characters)."*
- **Navigation After Completion:** Redirects to `SCR-03` (Projects List).

---

### SCR-05: Project Edit Screen
- **Route:** `/admin/projects/[id]/edit`
- **Purpose:** Allows officers to update an existing project's text, category, dates, or media.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Entry Point / Navigation:** Edit button on `SCR-03` or `SCR-06`. Breadcrumbs: `Dashboard > Projects > [Title] > Edit`.
- **Information Displayed:**
  - Header: *"Edit Project: [Project Title]"*.
  - Current Status Indicator: Badge showing current state (`PUBLISHED` or `DRAFT`).
  - Form pre-populated with all existing database values.
  - Last updated metadata: *"Last modified on [Date] by Lion [Officer Name]"*.
- **Input Fields:**
  - Identical structure to `SCR-04`, pre-filled with active values.
- **Available Actions:**
  - Primary Button: **"Save Changes"** (updates database record).
  - Status Toggle Button: **"Unpublish Project"** (if currently published, opens `SCR-20`) or **"Publish Project"** (if draft).
  - Secondary Button: **"Cancel"** (discards modifications).
  - Danger Link: **"Delete Project"** (triggers `SCR-19`).
- **Validation Rules:** Same rules as creation.
- **Success Feedback:** Green banner: *"Project updates have been saved successfully."*
- **Error Feedback:** Inline field validation errors.
- **Navigation After Completion:** Navigates to `SCR-06` (Project Detail).

---

### SCR-06: Project Detail Screen
- **Route:** `/admin/projects/[id]`
- **Purpose:** Full read-only administrative inspection of a project record and its associated media.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Entry Point / Navigation:** Clicking project title in `SCR-03`.
- **Information Displayed:**
  - Header with Project Title, Category badge, Status badge (`PUBLISHED` / `DRAFT`).
  - Action Bar: "Edit Project", "Unpublish / Publish", "View on Public Site", "Delete".
  - Metadata Grid: Event Date, Location, Author, Created At, Last Modified At, Public URL.
  - Cover Photo Preview.
  - Project Summary Card.
  - Formatted Story Content.
  - Attached Gallery Grid: Display of all gallery images with captions and thumbnail previews.
- **Available Actions:**
  - Button: **"Edit Project"** (navigates to `SCR-05`).
  - Button: **"View Public Page"** (opens `/projects/[slug]` in new tab if published).
  - Button: **"Back to Projects"** (returns to `SCR-03`).
- **Validation Rules:** None.
- **Success Feedback:** Loaded successfully.
- **Error Feedback:** 404 message if project ID not found.
- **Navigation After Completion:** Returns to project list or edit view.

---

### SCR-07: News & Announcements List Screen
- **Route:** `/admin/news`
- **Purpose:** Central list of all club news articles, announcements, and bulletins.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Entry Point / Navigation:** Left sidebar: *"News & Bulletins"*.
- **Information Displayed:**
  - Page Title: *"Club News & Announcements"*.
  - Filter Tabs: *"All"*, *"News"*, *"Announcements"*, *"Drafts"*.
  - Table Columns:
    - Cover Thumbnail.
    - Title.
    - Type (`NEWS`, `ANNOUNCEMENT`, `PRESS_RELEASE`).
    - Pin Status (📌 icon indicating homepage feature).
    - Status Badge (`PUBLISHED` or `DRAFT`).
    - Published Date.
    - Actions: View, Edit, Delete.
- **Available Actions:**
  - Primary Button: **"+ New Article"** (navigates to `SCR-08`).
  - Row Actions: Edit, View, Delete.
- **Validation Rules:** None.
- **Success Feedback:** Real-time table updates.
- **Error Feedback:** Query failure banner.
- **Navigation After Completion:** Opens selected article.

---

### SCR-08: News Create Screen
- **Route:** `/admin/news/create`
- **Purpose:** Form for drafting or publishing news articles and homepage announcements.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Entry Point / Navigation:** Button on `SCR-07`. Breadcrumbs: `Dashboard > News > New Article`.
- **Input Fields:**
  - `title`: Text input. Label: *"Article Headline / Title"*. **Required.** (5–200 characters).
  - `news_type`: Select dropdown. Label: *"Type"*. Options: `News Article`, `Club Announcement`, `Press Release`. **Required.**
  - `slug`: Text input (auto-generated). **Required.**
  - `cover_image`: Media selector. Label: *"Featured Header Image"*. Optional for announcement; recommended for news.
  - `content`: Rich-Text WYSIWYG editor. Label: *"Article Content"*. **Required.**
  - `is_pinned`: Toggle switch. Label: *"Pin this announcement to the top of the homepage"*. Optional (Default: False).
  - `expire_date`: Date picker. Label: *"Auto-Unpin Date"*. Helper text: *"Optional. The article will automatically unpin from the homepage after this date."* Optional (Must be in future if entered).
- **Available Actions:**
  - **"Publish Now"**, **"Save as Draft"**, **"Cancel"**.
- **Validation Rules:** Title and content mandatory. Expiration date must be later than today.
- **Success Feedback:** Toast: *"News article '[Title]' published successfully!"*
- **Error Feedback:** Inline field error messages.
- **Navigation After Completion:** Redirects to `SCR-07` (News List).

---

### SCR-09: News Edit Screen
- **Route:** `/admin/news/[id]/edit`
- **Purpose:** Edit existing news text, toggle pinned status, or update expiration.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Input Fields:** Pre-filled fields identical to `SCR-08`.
- **Available Actions:** **"Save Changes"**, **"Unpublish"** (opens `SCR-20`), **"Cancel"**, **"Delete"** (opens `SCR-19`).
- **Success Feedback:** Toast: *"Article updates saved."*
- **Navigation After Completion:** Redirects to `SCR-10` (News Detail).

---

### SCR-10: News Detail Screen
- **Route:** `/admin/news/[id]`
- **Purpose:** Read-only inspection of news article formatting and publication metadata.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Information Displayed:** Title, Type badge, Pin status banner, Cover image, Full article text, Author, Created timestamp, Public preview link.
- **Available Actions:** **"Edit Article"**, **"Back to News List"**, **"Delete Article"**.
- **Navigation After Completion:** Follows action link.

---

### SCR-11: Executive Board Records List Screen
- **Route:** `/admin/board`
- **Purpose:** View and organize the directory of club officers by administrative term year.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Entry Point / Navigation:** Left sidebar: *"Executive Board"*.
- **Information Displayed:**
  - Page Title: *"Executive Board & Leadership"*.
  - Subtitle: *"Maintain current and historical club leadership rosters."*
  - Term Selector Dropdown: Shows terms (e.g., `2026/2027 (Current)`, `2025/2026`, `2024/2025`).
  - Term Theme Banner: Displays theme for the selected term (e.g., *"Service with Integrity"*).
  - Board Members Table (Sorted by Display Order):
    - Photo thumbnail (circular avatar).
    - Full Name & Lion Title (e.g., *"Lion Prof. T. Sanjeewa Prasad Jayaweera"*).
    - Club Designation (e.g., *"Club President"*).
    - Official Contact (Email & Phone).
    - Display Order number (`1`, `2`, `3`).
    - Actions: Edit, Delete.
- **Available Actions:**
  - Primary Button: **"+ Add Board Member"** (navigates to `SCR-12`).
  - Row Actions: Edit (pencil), Delete (trashcan).
- **Validation Rules:** None for viewing.
- **Success Feedback:** Table re-renders when switching terms.
- **Error Feedback:** Network error prompt.
- **Navigation After Completion:** Opens selected officer record.

---

### SCR-12: Board Record Create Screen
- **Route:** `/admin/board/create`
- **Purpose:** Add a club officer to an executive board term roster.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Input Fields:**
  - `term_id`: Select dropdown. Label: *"Lionistic Term Year"*. Pre-selected to active term. **Required.**
  - `full_name`: Text input. Label: *"Full Name"*. Placeholder: *"e.g., Sanjeewa Prasad Jayaweera"*. **Required.** (2–150 chars).
  - `lion_title`: Text input. Label: *"Lion Title"*. Placeholder: *"e.g., Lion Prof., Lion Dr., Lion"* Optional.
  - `designation`: Text input. Label: *"Club Office / Designation"*. Placeholder: *"e.g., Club President, Secretary, Treasurer"*. **Required.** (2–100 chars).
  - `display_order`: Number input. Label: *"Display Hierarchy / Order"*. Helper text: *"Lower numbers appear first (e.g., 1 for President, 2 for Secretary)."* **Required.** (Positive integer).
  - `contact_email`: Email input. Label: *"Official Contact Email"*. Optional.
  - `contact_phone`: Phone input. Label: *"Contact Phone Number"*. Optional.
  - `profile_photo`: Media selector. Label: *"Official Portrait Photo"*. Optional.
  - `bio`: Text area. Label: *"Short Executive Bio / Message"*. Optional.
- **Available Actions:**
  - Primary Button: **"Save Officer"**.
  - Secondary Button: **"Save & Add Another"**.
  - Tertiary Button: **"Cancel"**.
- **Validation Rules:** Full name, designation, and term are mandatory. Display order must be ≥ 0.
- **Success Feedback:** Toast: *"Officer '[Full Name]' was successfully added to the [Term] Board!"*
- **Error Feedback:** Red inline highlights on missing fields.
- **Navigation After Completion:** Redirects to `SCR-11` (Board List).

---

### SCR-13: Board Record Edit Screen
- **Route:** `/admin/board/[id]/edit`
- **Purpose:** Update officer designation, contact details, profile photo, or display sequence.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Input Fields:** Pre-filled fields identical to `SCR-12`.
- **Available Actions:** **"Save Changes"**, **"Cancel"**, **"Delete Record"** (triggers `SCR-19`).
- **Success Feedback:** Toast: *"Officer record updated."*
- **Navigation After Completion:** Redirects to `SCR-11` or `SCR-14`.

---

### SCR-14: Board Record Detail Screen
- **Route:** `/admin/board/[id]`
- **Purpose:** Read-only inspection of an officer's profile, contact info, and bio.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Information Displayed:** High-resolution portrait, Full name with title, Designation, Term year, Contact email/phone, Biography, Display order.
- **Available Actions:** **"Edit Profile"**, **"Back to Board Roster"**.
- **Navigation After Completion:** Returns to board roster.

---

### SCR-15: Media Upload & Library Modal
- **Route:** Triggered via modal on any editor screen or accessible at `/admin/media`
- **Purpose:** Code-free photo uploader and gallery asset selector for non-technical officers.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Information Displayed:**
  - Modal Title: *"Media Library & Photo Uploader"*.
  - Drag-and-Drop Zone: Distinct dashed boundary with icon and text: *"Drag and drop image files here, or click to browse"*.
  - Upload Specifications Note: *"Supported formats: JPG, PNG, WebP. Maximum file size: 5.0 MB per image."*
  - Upload Progress Indicator: Shows progress bar (0–100%) and file name during active upload.
  - Asset Grid: Thumbnails of recently uploaded media.
  - Selected Image Panel: Shows file size, image dimensions, and text input for **Alt Text / Description** (for screen reader accessibility).
- **Available Actions:**
  - Primary Button: **"Use Selected Photo"** (passes selected asset back to form).
  - Secondary Button: **"Upload New Photo"** (opens OS file picker).
  - Close Button: **"Cancel / Close"** (closes modal).
- **Validation Rules:**
  - File extension and MIME type checked client-side.
  - File size strictly capped at 5 MB.
- **Success Feedback:** Green checkmark on thumbnail; toast: *"Photo uploaded successfully."*
- **Error Feedback:** Red alert inside modal: *"The selected file is too large (6.2 MB). Please select an image under 5.0 MB."*
- **Navigation After Completion:** Injects chosen image URL into calling form.

---

### SCR-16: Submissions & Inquiries Management Screen
- **Route:** `/admin/submissions`
- **Purpose:** Centralized hub for reviewing public stakeholder engagement (volunteers and inquiries) per FR-07.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Entry Point / Navigation:** Left sidebar: *"Submissions & Inquiries"*.
- **Information Displayed:**
  - Page Title: *"Stakeholder Submissions & Inquiries"*.
  - Tab Switcher:
    - Tab 1: **"Volunteer Signups"** (with unread badge counter, e.g., `(3)`).
    - Tab 2: **"Inquiries & Sponsorships"** (with unread badge counter, e.g., `(5)`).
  - **Volunteer Signups View (Tab 1):**
    - Status Filter: `All`, `Pending`, `Reviewed`, `Interviewed`, `Accepted`, `Rejected`.
    - Table Columns: Date, Applicant Name, Email, Phone, City, Skills / Interests, Status Badge, Action ("Review").
    - Export Button: **"Export Volunteers (CSV)"**.
  - **Inquiries View (Tab 2):**
    - Type Filter: `All`, `General`, `Sponsorship`, `Donation`, `Partnership`.
    - Status Filter: `All`, `New`, `In Progress`, `Resolved`, `Spam`.
    - Table Columns: Date, Sender Name, Category, Subject, Status Badge, Action ("Read").
    - Export Button: **"Export Inquiries (CSV)"**.
- **Available Actions:**
  - Click Table Row → Navigates to `SCR-17` (Volunteer) or `SCR-18` (Inquiry).
  - Click Export CSV Button → Triggers CSV download workflow (`WF-SUB-04` or `WF-SUB-08`).
- **Validation Rules:** None.
- **Success Feedback:** Dynamic filtering without reload; instant CSV file download initiation.
- **Error Feedback:** *"Failed to generate export file. Please try again."*
- **Navigation After Completion:** Opens selected submission record.

---

### SCR-17: Volunteer Application Review Detail Screen
- **Route:** `/admin/submissions/volunteers/[id]`
- **Purpose:** Complete review interface for examining an individual volunteer applicant's submission.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Information Displayed:**
  - Header: *"Volunteer Application: [Applicant Full Name]"*.
  - Submission Timestamp: *"Submitted on DD MMM YYYY at HH:MM"*.
  - Applicant Profile Card:
    - Full Name, NIC / Passport, Date of Birth, Gender.
    - Address & City.
    - Contact Email (with 1-click mailto link).
    - Phone Number (with 1-click tel link).
    - Occupation / Current Status.
  - Volunteer Questionnaire Responses:
    - Skills & Areas of Interest (e.g., Healthcare camps, youth education, event logistics).
    - Availability (e.g., Weekends, weekday evenings).
    - Previous Volunteer Experience text.
    - Personal Motivation Statement ("Why I want to serve with Balangoda Lions").
  - Administrative Action Panel:
    - Status Selector: Dropdown with options: `PENDING`, `REVIEWED`, `INTERVIEWED`, `ACCEPTED`, `REJECTED`.
    - Internal Administrative Notes: Multi-line text area for recording committee interview remarks, assigned club mentor, or phone call logs.
    - Reviewer Audit Trail: Shows who last reviewed this application and when.
- **Input Fields:**
  - `status`: Select dropdown.
  - `admin_notes`: Text area (max 1,000 characters).
- **Available Actions:**
  - Primary Button: **"Save Status & Notes"**.
  - Secondary Button: **"← Back to Volunteer Submissions"**.
- **Validation Rules:** Status must be a valid enum. Notes limited to 1,000 chars.
- **Success Feedback:** Green banner: *"Application status updated to [Status]."*
- **Error Feedback:** Alert: *"Failed to save notes. Please try again."*
- **Navigation After Completion:** Stays on screen or returns to `SCR-16`.

---

### SCR-18: General & Sponsor Inquiry Detail Screen
- **Route:** `/admin/submissions/inquiries/[id]`
- **Purpose:** Read and resolve contact requests, community inquiries, and sponsorship proposals.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Information Displayed:**
  - Header: *"Inquiry: [Subject]"*.
  - Inquiry Type Badge (`SPONSORSHIP` purple, `GENERAL` blue, `DONATION` green).
  - Sender Card: Name, Email address, Phone number, Organization / Business Name (if applicable).
  - Message Content Card: Full text of the inquiry submitted through the public website.
  - Status & Resolution Panel:
    - Current Status: `NEW`, `IN_PROGRESS`, `RESOLVED`, `SPAM`.
    - Internal Notes: Log of actions taken (e.g., *"Secretary sent sponsorship package via email on 05 Nov"*).
    - Assigned Officer: Dropdown to assign follow-up to a specific board member.
- **Input Fields:**
  - `status`: Select dropdown.
  - `internal_notes`: Multi-line text area.
- **Available Actions:**
  - Primary Button: **"Save Resolution & Notes"**.
  - Shortcut Button: **"Reply via Email"** (opens default email client pre-addressed to sender with inquiry subject).
  - Secondary Button: **"← Back to Inquiries"**.
- **Validation Rules:** Valid status selection.
- **Success Feedback:** Toast: *"Inquiry marked as [RESOLVED]."*
- **Error Feedback:** Red banner if save fails.
- **Navigation After Completion:** Returns to `SCR-16`.

---

### SCR-19: Delete Confirmation Modal Pattern (Permanent)
- **Component:** Universal Destructive Action Modal.
- **Purpose:** Prevents accidental data destruction by club officers through explicit warnings.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Trigger:** Clicking any red "Delete" action icon or button in the CMS.
- **Information Displayed:**
  - Icon: Red exclamation shield / warning icon.
  - Modal Heading: *"Permanently Delete [Item Type]?"*.
  - Affected Record Identifier: In bold text (e.g., *"Free Cataract Surgery Camp 2026"*).
  - Explicit Consequence Explanation (Plain English):
    *"This action will permanently delete this [project / news article / board member] from the database along with all attached photos and records. This action cannot be undone. Public visitors will no longer be able to see or access this content."*
  - Safety Confirmation: For high-impact items (Projects with > 5 gallery images), presents a confirmation prompt: *"Type 'DELETE' to confirm"*.
- **Available Actions:**
  - Primary Button (Red): **"Yes, Permanently Delete"** (executes deletion).
  - Secondary Button (Gray): **"Cancel, Keep Record"** (safely dismisses modal with zero alterations).
- **Validation Rules:** If confirmation text required, button remains disabled until exact word is entered.
- **Success Feedback:** Modal closes immediately; target row fades out from parent table; green toast appears: *"'[Item Title]' was permanently deleted."*
- **Error Feedback:** If deletion fails on backend, modal displays red inline error: *"Could not delete record. A server error occurred. Please try again."*
- **Navigation After Completion:** Returns focus to the parent list view.

---

### SCR-20: Unpublish Confirmation Modal Pattern (Reversible)
- **Component:** Safe State-Change Confirmation Modal.
- **Purpose:** Guides officers when hiding live content without scaring them with deletion warnings.
- **Intended User:** Club Officers (`ADMIN`, `EDITOR`).
- **Trigger:** Clicking "Unpublish" on any live Project or News item.
- **Information Displayed:**
  - Icon: Amber/Yellow informational eye-slash icon.
  - Modal Heading: *"Unpublish [Item Type]?"*.
  - Affected Record Identifier: In bold text (e.g., *"Tree Planting Campaign Phase 2"*).
  - Plain English Consequence Explanation:
    *"This will immediately remove this [project / news article] from the public website. However, none of your content will be lost. The item will be safely saved in your CMS drafts, and you can edit or re-publish it at any time."*
- **Available Actions:**
  - Primary Button (Amber): **"Yes, Unpublish and Move to Drafts"** (executes status change to `DRAFT`).
  - Secondary Button (Gray): **"Cancel, Keep Live"** (dismisses modal; item remains published).
- **Validation Rules:** None.
- **Success Feedback:** Modal closes; status badge on item transitions from green `PUBLISHED` to amber `DRAFT`; toast appears: *"'[Item Title]' has been unpublished and moved to Drafts."*
- **Error Feedback:** If request fails, displays: *"Could not unpublish. Please check your connection."*
- **Navigation After Completion:** Remains on the current editor or detail screen with status refreshed.
