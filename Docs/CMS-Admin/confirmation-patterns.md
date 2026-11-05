# CMS Admin Confirmation Patterns: Delete vs. Unpublish

**Project:** Lions Club of Balangoda Web Portal & Content Management System  
**Course:** IS5109 Community Project (Group 14)  
**Target Users:** Non-Technical Club Officers  
**Requirement Mapping:** FR-06 & FR-07  
**Reviewer:** Jinos  
**Author:** Ahmed Ahnaf (Branch: `ahmed_ahnaf`)  

---

## 1. Critical Architectural Distinction: Delete vs. Unpublish

In software designed for non-technical community volunteers, conflating **"Delete"** with **"Unpublish"** leads to catastrophic data loss. A club officer who simply wishes to temporarily hide an event from the public website must never be placed in a position where they accidentally destroy hours of written history, committee records, or event photos.

Therefore, the Lions Club of Balangoda CMS enforces a **strict architectural and conceptual separation** between these two operations:

| Attribute | **Delete** (`DELETE /api/admin/...`) | **Unpublish** (`PUT /api/admin/.../status`) |
|---|---|---|
| **Underlying Operation** | Permanent database row deletion (with cascade removal of child records) | Metadata update setting `status = 'DRAFT'` |
| **Reversibility** | **Irreversible:** Data is completely erased from PostgreSQL/MySQL | **Fully Reversible:** Can be re-published with a single click at any time |
| **Data Preservation** | Zero preservation; text, dates, and media links are purged | 100% preservation; all text, dates, photos, and settings remain in CMS |
| **Public Impact** | Removed from public website immediately; URLs return HTTP 404 | Hidden from public website immediately; URLs return HTTP 404 or redirect |
| **Child Records Impact** | Cascade deletes attached `project_gallery` photo links and tags | All child gallery photos remain intact and linked in draft state |
| **UI Visual Identity** | **Red / Danger** theme with warning shield icon (`#DC2626`) | **Amber / Warning** theme with eye-slash icon (`#D97706`) |
| **Officer Confirmation** | Two-step modal requiring explicit confirmation (or typed title) | One-click confirmation dialog explaining safety of drafts |

---

## 2. Specification: Delete Confirmation Pattern (SCR-19)

### 2.1 Context & Intent
- **Trigger:** Officer clicks the red "Delete" action button on any Project, News article, Board record, or Media asset.
- **Goal:** Prevent accidental, irreversible loss of club history.

### 2.2 Modal Specification
```text
+-------------------------------------------------------------------------+
| [!] PERMANENTLY DELETE RECORD?                                      [X] |
+-------------------------------------------------------------------------+
|                                                                         |
|  You are about to permanently delete:                                   |
|  "Annual Diabetes Awareness & Blood Donation Drive 2026"                |
|                                                                         |
|  WARNING - THIS ACTION CANNOT BE UNDONE:                                |
|  * This project will be permanently erased from the club database.      |
|  * All 14 associated gallery photos and captions will be unlinked.     |
|  * The public web link will immediately stop working (404 error).       |
|                                                                         |
|  If you only want to hide this project from the public website, please  |
|  use "Unpublish" instead.                                               |
|                                                                         |
|  [Optional for high-impact: Type DELETE below to confirm]              |
|  [                                                      ]               |
|                                                                         |
+-------------------------------------------------------------------------+
|  [ Cancel, Keep Project ]            [ (X) Yes, Permanently Delete ]    |
+-------------------------------------------------------------------------+
```

### 2.3 Step-by-Step Behavioral Rules
1. **Affected Record:** Display the specific title, name, or identifier in bold quotation marks so the officer confirms the exact item being targeted.
2. **Action Being Performed:** Irreversible removal from database (`DELETE FROM projects WHERE project_id = $1`).
3. **Plain Language Consequence:** The prompt explicitly warns:
   - *"This project will be permanently erased from the database."*
   - *"All [X] attached gallery photos will be removed."*
   - *"Public visitors will no longer be able to see or access this page."*
   - *"This action cannot be undone."*
4. **Cancel Action:**
   - Officer clicks **"Cancel, Keep Record"**, presses the `Escape` key, or clicks outside the modal boundary.
   - Modal closes immediately with zero changes. Parent table remains untouched.
5. **Confirmation Action:**
   - Officer clicks the prominent red button **"Yes, Permanently Delete"**.
   - Button enters loading state (*"Deleting..."*); modal controls disable to prevent duplicate clicks.
6. **Resulting System Behavior:**
   - API issues `DELETE` query with cascade to `project_gallery`.
   - CDN image assets are marked for background garbage collection.
   - Public frontend cache for this URL is purged.
7. **Success Feedback:**
   - Modal closes immediately.
   - The targeted row animates out with a fade-and-collapse effect from the table.
   - Green toast notification appears: *"Project '[Project Title]' has been permanently deleted."*
8. **Failure Feedback:**
   - If network or server fails, modal remains open and displays a red error box: *"Could not delete this record due to a server error. Your data has not been modified. Please try again."*

---

## 3. Specification: Unpublish Confirmation Pattern (SCR-20)

### 3.1 Context & Intent
- **Trigger:** Officer clicks the "Unpublish" button on any live Project or News item.
- **Goal:** Allow officers to safely withdraw content from the public portal without anxiety or data loss.

### 3.2 Modal Specification
```text
+-------------------------------------------------------------------------+
| [?] UNPUBLISH CONTENT?                                              [X] |
+-------------------------------------------------------------------------+
|                                                                         |
|  You are unpublishing:                                                  |
|  "Free Vision Screening Camp 2026"                                      |
|                                                                         |
|  WHAT HAPPENS NEXT:                                                     |
|  * This project will immediately be hidden from the public website.     |
|  * ALL YOUR WORK IS SAFE: Your text, dates, photos, and settings will    |
|    remain safely stored in the CMS.                                     |
|  * The project will be saved as a "Draft".                              |
|  * You can edit or re-publish it at any time with a single click.       |
|                                                                         |
+-------------------------------------------------------------------------+
|  [ Cancel, Keep Published ]          [ (/) Yes, Unpublish to Drafts ]   |
+-------------------------------------------------------------------------+
```

### 3.3 Step-by-Step Behavioral Rules
1. **Affected Record:** Displays the title and current status badge (`PUBLISHED`).
2. **Action Being Performed:** Status transition from `PUBLISHED` to `DRAFT` (`UPDATE projects SET status = 'DRAFT' WHERE project_id = $1`).
3. **Plain Language Consequence:** The prompt reassuringly explains:
   - *"This will hide the project from public website visitors immediately."*
   - *"None of your work will be lost. All text, photos, and formatting remain safely saved in the CMS."*
   - *"You can re-publish this item whenever you are ready."*
4. **Cancel Action:**
   - Officer clicks **"Cancel, Keep Published"** or presses `Escape`.
   - Modal closes; content remains live on the public site without interruption.
5. **Confirmation Action:**
   - Officer clicks the amber button **"Yes, Unpublish to Drafts"**.
   - Button shows brief spinner (*"Unpublishing..."*).
6. **Resulting System Behavior:**
   - Database record updated: `status = 'DRAFT'`.
   - Public cache invalidated so the public page immediately stops displaying the item.
7. **Success Feedback:**
   - Modal closes.
   - The status badge on the screen transitions from green (`PUBLISHED`) to amber (`DRAFT`).
   - Amber toast notification appears: *"Project '[Project Title]' has been unpublished and moved to your CMS Drafts."*
8. **Failure Feedback:**
   - If network fails, modal displays: *"Could not unpublish. Please check your internet connection and try again."*

---

## 4. Summary of Protective Controls for Non-Technical Officers

1. **Distinct Colors & Icons:** Red warning shield for Delete; Amber eye-slash for Unpublish.
2. **Clear Alternatives Offered:** Delete modal explicitly informs officers: *"If you only want to hide this item, use Unpublish instead."*
3. **No Hidden Cascade Losses:** If deleting a project will remove gallery photos, the exact photo count is displayed in the warning dialog.
4. **Zero Double-Clicks:** All confirmation buttons automatically disable upon first click to prevent race conditions or duplicate network dispatches.

