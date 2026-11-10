# Test Cases: Projects Search by Keyword Slice (Sprint 2)

**User Story:** As a community visitor, I want to search published projects by keyword so that I can find specific service activities  
**Project:** Lions Club of Balangoda Web Portal & Content Management System  
**Course:** IS5109 Community Project (Group 14)  
**Assigned QA Reviewer:** M.N.M Nafris (22FIS0545)  
**Author:** Ahmed Ahnaf (Branch: `ahmed_ahnaf_SP02`)  
**Sprint:** Sprint 2 Milestone  
**Priority:** Highest  
**Execution Environment:** Node.js v24.14.0 Test Runner (`node:test` + `node:assert`)  
**Overall Execution Result:** **17 / 17 PASSED (100% Pass Rate)**  

---

## 1. Acceptance Criteria & Test Traceability Matrix

| AC # | Acceptance Criteria Description | Test Case ID | Test Level | Automated Test Suite | Result |
|---|---|---|---|---|---|
| **AC1** | Visitors can search published projects by keyword across title and summary | `TC-SRCH-001` | Integration & Unit | `tests/projects-search.test.mjs` (AC1 Suite) | **PASS** (4 subtests) |
| **AC2** | Search input is sanitised and queries are parameterised | `TC-SRCH-002` | Security & Integration | `tests/projects-search.test.mjs` (AC2 Suite) | **PASS** (3 subtests) |
| **AC3** | Search works together with the category/year filters | `TC-SRCH-003` | Functional & Integration | `tests/projects-search.test.mjs` (AC3 Suite) | **PASS** (4 subtests) |
| **AC4** | No matches shows a helpful empty-state message with a way to clear the search | `TC-SRCH-004` | UI & Integration | `tests/projects-search.test.mjs` (AC4 Suite) | **PASS** (2 subtests) |
| **AC5** | Only published projects are returned (DRAFT and ARCHIVED strictly excluded) | `TC-SRCH-005` | Security & Data Integrity | `tests/projects-search.test.mjs` (AC5 Suite) | **PASS** (4 subtests) |
| **AC6** | Usable on mobile (360px viewport without horizontal overflow) | `TC-SRCH-006` | Responsiveness & UI | `tests/projects-search.test.mjs` (AC6 Suite) | **PASS** (1 subtest) |

---

## 2. Implementation Traceability

| Layer / Component | File Path | Enhancements Applied |
|---|---|---|
| **Data Access / Repository** | [`src/lib/projects-repository.ts`](file:///c:/Users/HP/Desktop/3.1/community-project/lions-club-balangoda-portal/src/lib/projects-repository.ts) | Implemented `searchPublishedProjects` with parameterised SQL `(title LIKE ? OR summary LIKE ?)`, `category = ?`, `event_date LIKE ?`, strictly binding `['PUBLISHED', ...]` params. Preserved backward compatibility for `getPublishedProjects`. |
| **API Endpoint** | [`src/app/api/projects/route.ts`](file:///c:/Users/HP/Desktop/3.1/community-project/lions-club-balangoda-portal/src/app/api/projects/route.ts) | Handles `GET /api/projects?q=&category=&year=`, sanitising query inputs and returning JSON `{ success: true, data: projects, count: projects.length }` with sanitised 500 error reporting. |
| **Domain Logic** | [`src/lib/projects.ts`](file:///c:/Users/HP/Desktop/3.1/community-project/lions-club-balangoda-portal/src/lib/projects.ts) | Sanitises search input with `sanitizeSearchQuery`. Searches across title, summary, location, and description. Rejects malicious stripped inputs safely (yielding 0 matches). |
| **Client UI Component** | [`src/components/projects/ProjectsList.tsx`](file:///c:/Users/HP/Desktop/3.1/community-project/lions-club-balangoda-portal/src/components/projects/ProjectsList.tsx) | Features keyword search input across title and summary, helpful empty state message (`data-testid="no-search-results"`), dedicated "Clear Search" button (`data-testid="clear-search-btn"`), "Reset All Filters" button (`data-testid="reset-filters-btn"`), and 360px mobile protection (`w-full max-w-full min-w-0 box-border overflow-x-auto grid-cols-1`). |
| **Acceptance Test Suite** | [`tests/projects-search.test.mjs`](file:///c:/Users/HP/Desktop/3.1/community-project/lions-club-balangoda-portal/tests/projects-search.test.mjs) | 17 automated tests verifying AC1–AC6 on isolated SQLite test fixtures. |

---

## 3. Detailed Test Case Specifications

### TC-SRCH-001: Search Across Project Title and Summary (AC1)

| Metadata Field | Specification |
|---|---|
| **Module / Slice** | Public Portal - Projects Search by Keyword |
| **Requirements Traceability** | AC1 (Title & Summary Search), FR-02, UC02 |
| **Test Level** | Integration & Automated Unit Level (`node:test`) |
| **Test Type** | Functional |
| **Test Priority** | **P1 - Critical** |
| **Author** | Ahmed Ahnaf |
| **Reviewer** | M.N.M Nafris |

#### Preconditions & Environment Setup
- Isolated SQLite database initialized with published projects across Healthcare, Education, Environment, and Poverty Relief.
- Target project `proj-pub-01` contains title *"Cataract Surgery"*.
- Target project `proj-pub-02` contains phrase *"geometry sets"* only inside `summary` (not present in `title`).
- Target project `proj-pub-03` contains phrase *"saplings"* only inside `summary`.

#### Test Execution Steps

| Step # | Action Description | Test Input Data | Expected System Response |
|---|---|---|---|
| 1 | Query repository with keyword matching title | `{ query: 'Cataract' }` | Exactly 1 project returned (`proj-pub-01`); title contains 'Cataract'. |
| 2 | Query repository with keyword existing only in summary | `{ query: 'geometry sets' }` | Exactly 1 project returned (`proj-pub-02`); summary contains keyword; title does not. |
| 3 | Query repository with mixed-case and uppercase variations | `{ query: 'reforestation' }`, `{ query: 'REFORESTATION' }`, `{ query: 'ReFoReStAtIoN' }` | All 3 casing variants locate identical project (`proj-pub-03`). |
| 4 | Query repository with environmental summary term | `{ query: 'saplings' }` | Exactly 1 project returned (`proj-pub-03`); summary contains 'saplings'. |

#### Execution Log & Verification
- **Status:** **PASS** (4 subtests passed in 4.16 ms).
- **Actual Result:** Verified case-insensitive matching across both title and summary fields as required by AC1.

---

### TC-SRCH-002: Input Sanitisation and Parameterised SQL Queries (AC2)

| Metadata Field | Specification |
|---|---|
| **Module / Slice** | Public Portal - Projects Search Security |
| **Requirements Traceability** | AC2 (Sanitisation & Parameterisation), SEC-02, SEC-03 |
| **Test Level** | Security & Integration (`node:test`) |
| **Test Type** | Security & Negative Validation |
| **Test Priority** | **P1 - Critical** |
| **Author** | Ahmed Ahnaf |
| **Reviewer** | M.N.M Nafris |

#### Preconditions & Environment Setup
- Database contains both published projects and confidential DRAFT / ARCHIVED records.
- SQL statement uses parameterised query binding (`?`).

#### Test Execution Steps

| Step # | Action Description | Test Input Data | Expected System Response |
|---|---|---|---|
| 1 | Pass XSS payload with `<script>` tags to `sanitizeSearchQuery` | `"<script>alert('xss-exploit')</script>"` | HTML tags stripped; returns empty string. |
| 2 | Pass XSS image onerror payload to `sanitizeSearchQuery` | `"<img src=x onerror=alert('hack')>"` | HTML angle brackets stripped; no raw tags survive. |
| 3 | Execute parameterised search with classic SQL injection payload | `{ query: "' OR 1=1 --" }` | Treated strictly as literal string parameter; returns 0 matches; zero draft/archived records leaked. |
| 4 | Execute search query containing both script tag and valid term | `{ query: "<script>document.cookie</script>Cataract" }` | Script tags stripped safely; remaining term `"Cataract"` matches published project `proj-pub-01`. |

#### Execution Log & Verification
- **Status:** **PASS** (3 subtests passed in 4.06 ms).
- **Actual Result:** No SQL injection vulnerability found; XSS payloads effectively neutralized.

---

### TC-SRCH-003: Multi-Filter Intersection - Search with Category and Year (AC3)

| Metadata Field | Specification |
|---|---|
| **Module / Slice** | Public Portal - Projects Search & Filtering |
| **Requirements Traceability** | AC3 (Search + Category + Year Co-existence), FR-02 |
| **Test Level** | Functional & Integration |
| **Test Priority** | **P1 - Critical** |
| **Author** | Ahmed Ahnaf |
| **Reviewer** | M.N.M Nafris |

#### Preconditions & Environment Setup
- Healthcare project exists in 2026.
- Education project exists in 2026.
- Environment project exists in 2025.

#### Test Execution Steps

| Step # | Action Description | Test Input Data | Expected System Response |
|---|---|---|---|
| 1 | Search keyword with matching category | `{ query: 'Cataract', category: 'HEALTHCARE' }` | Returns 1 project (`proj-pub-01`). |
| 2 | Search keyword with mismatching category | `{ query: 'Cataract', category: 'EDUCATION' }` | Returns 0 matches (category constraint enforced). |
| 3 | Search keyword with matching year filter | `{ query: 'Reforestation', year: '2025' }` | Returns 1 project (`proj-pub-03`). |
| 4 | Search keyword with mismatching year filter | `{ query: 'Reforestation', year: '2026' }` | Returns 0 matches (year constraint enforced). |
| 5 | Search with 3-way intersection (keyword + category + year) | `{ query: 'textbooks', category: 'EDUCATION', year: '2026' }` | Returns exactly 1 matching project (`proj-pub-02`). |
| 6 | Search with 3-way intersection where year mismatches | `{ query: 'textbooks', category: 'EDUCATION', year: '2025' }` | Returns 0 matches. |

#### Execution Log & Verification
- **Status:** **PASS** (4 subtests passed in 3.62 ms).
- **Actual Result:** Search query filters concurrently with category and year using boolean `AND` intersection logic.

---

### TC-SRCH-004: Empty State Display & Clear Search Controls (AC4)

| Metadata Field | Specification |
|---|---|
| **Module / Slice** | Public Portal - Projects Search UI |
| **Requirements Traceability** | AC4 (Empty State & Clear Mechanism), NFR-02 |
| **Test Level** | UI Component & Integration |
| **Test Priority** | **P2 - High** |
| **Author** | Ahmed Ahnaf |
| **Reviewer** | M.N.M Nafris |

#### Preconditions & Environment Setup
- UI component `ProjectsList.tsx` rendered with projects dataset.

#### Test Execution Steps

| Step # | Action Description | Test Input Data | Expected System Response |
|---|---|---|---|
| 1 | Query repository with nonexistent string | `{ query: 'CompletelyNonexistentKeywordXYZ123' }` | Returns empty array `[]` without error. |
| 2 | Inspect empty state container | Search query with 0 matches | Container rendered with `data-testid="no-search-results"`. |
| 3 | Inspect contextual user guidance | Search query `"nonexistent"` | Shows message *"No published projects found matching "nonexistent""* and helpful suggestions. |
| 4 | Inspect clear search action | Inspect UI controls | Dedicated button with `data-testid="clear-search-btn"` resets search input; button with `data-testid="reset-filters-btn"` resets all filters. |

#### Execution Log & Verification
- **Status:** **PASS** (2 subtests passed in 1.71 ms).
- **Actual Result:** Contextual empty state and one-click clear buttons present and verified.

---

### TC-SRCH-005: Strict Exclusion of Draft and Archived Data (AC5)

| Metadata Field | Specification |
|---|---|
| **Module / Slice** | Public Portal - Privacy & Data Governance |
| **Requirements Traceability** | AC5 (Public Portal Data Privacy), SEC-01 |
| **Test Level** | Security & Data Integrity |
| **Test Priority** | **P1 - Critical** |
| **Author** | Ahmed Ahnaf |
| **Reviewer** | M.N.M Nafris |

#### Preconditions & Environment Setup
- Test database seeded with confidential DRAFT project `proj-draft-05` (*"Upcoming Diabetes Screening Camp"*, summary: *"mobile blood glucose"*).
- Test database seeded with ARCHIVED project `proj-archived-06` (*"Past Eye Clinic 2019"*).

#### Test Execution Steps

| Step # | Action Description | Test Input Data | Expected System Response |
|---|---|---|---|
| 1 | Query repository with exact draft project title | `{ query: 'Diabetes Screening Camp' }` | Returns 0 matches; draft title is never exposed. |
| 2 | Query repository with confidential draft summary content | `{ query: 'mobile blood glucose' }` | Returns 0 matches; draft summary is never leaked. |
| 3 | Query repository with exact archived project title | `{ query: 'Past Eye Clinic 2019' }` | Returns 0 matches; archived project is blocked. |
| 4 | Query repository with blank criteria | `{}` | Returns all published projects; all returned records strictly have `status === 'PUBLISHED'`. |

#### Execution Log & Verification
- **Status:** **PASS** (4 subtests passed in 1.89 ms).
- **Actual Result:** Zero unapproved drafts or archived projects exposed under any search query.

---

### TC-SRCH-006: Mobile Usability & Responsive Layout at 360px (AC6)

| Metadata Field | Specification |
|---|---|
| **Module / Slice** | Public Portal - Responsive Mobile Layout |
| **Requirements Traceability** | AC6 (Mobile Usability 360px), NFR-02 |
| **Test Level** | UI Component Verification |
| **Test Priority** | **P2 - High** |
| **Author** | Ahmed Ahnaf |
| **Reviewer** | M.N.M Nafris |

#### Preconditions & Environment Setup
- Standard mobile viewport: 360px width.

#### Test Execution Steps

| Step # | Action Description | Target Property | Expected System Response |
|---|---|---|---|
| 1 | Inspect root container styles | `className` attributes | Includes `w-full max-w-full min-w-0` preventing flex and grid children from overflowing the 360px viewport. |
| 2 | Inspect search input box sizing | `className` attributes | Includes `box-border w-full` to prevent border/padding overflow. |
| 3 | Inspect category pill bar | Horizontal scroll container | Uses `overflow-x-auto` allowing horizontal finger swipe without horizontal page scrolling. |
| 4 | Inspect projects grid layout | Grid columns configuration | Configured with `grid-cols-1` on mobile, scaling to `md:grid-cols-2 lg:grid-cols-3`. |

#### Execution Log & Verification
- **Status:** **PASS** (1 subtest passed in 1.07 ms).
- **Actual Result:** Responsive CSS classes strictly prevent 360px viewport horizontal overflow.

---

## 4. Overall Quality Assurance Sign-Off

- **Automated Test Run Summary:**
  - `tests/projects-api.test.mjs`: 4 / 4 PASSED
  - `tests/projects-list.test.mjs`: 12 / 12 PASSED
  - `tests/projects-search.test.mjs`: 17 / 17 PASSED
  - `tests/projects-ui.test.mjs`: 7 / 7 PASSED
  - **Total Passing Tests:** **40 / 40 (100% Pass Rate)**
- **Regression Impact:** Zero regressions across existing API and UI tests.
- **Reviewer Action:** Submitted to **M.N.M Nafris (QA Reviewer)** for sprint acceptance and Jira sign-off.

