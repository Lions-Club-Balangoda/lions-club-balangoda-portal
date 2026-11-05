# Test Cases: Projects List Vertical Slice (FR-02 / UC02)

**Project:** Lions Club of Balangoda Web Portal & Content Management System  
**Course:** IS5109 Community Project (Group 14)  
**Assigned QA Reviewer:** M.N.M Nafris (22FIS0545)  
**Author:** Ahmed Ahnaf (Branch: `ahmed_ahnaf`)  
**Sprint:** Sprint 1 Milestone  
**Execution Environment:** Node.js v24.14.0 Test Runner (`node:test` + `node:assert`)  
**Overall Execution Result:** **12 / 12 PASSED (100% Pass Rate)**  

---

## 1. Test Suite Summary & Traceability

| Metric | Value |
|---|---|
| **Target Vertical Slice** | Public Community Projects Directory (`/projects`) |
| **Requirements Traceability** | `FR-02` (Project Search & Filter), `UC02` (Browse & Filter Projects), `NFR-02` (Usability), `SEC-02`/`SEC-03` |
| **Jira Issue Reference** | `[LBW-22]` |
| **Automated Test Harness** | [`tests/projects-list.test.mjs`](file:///c:/Users/HP/Desktop/3.1/community-project/lions-club-balangoda-portal/tests/projects-list.test.mjs) |
| **Implementation Slices** | [`src/types/project.ts`](file:///c:/Users/HP/Desktop/3.1/community-project/lions-club-balangoda-portal/src/types/project.ts), [`src/data/mock-projects.ts`](file:///c:/Users/HP/Desktop/3.1/community-project/lions-club-balangoda-portal/src/data/mock-projects.ts), [`src/lib/projects.ts`](file:///c:/Users/HP/Desktop/3.1/community-project/lions-club-balangoda-portal/src/lib/projects.ts), [`src/components/projects/`](file:///c:/Users/HP/Desktop/3.1/community-project/lions-club-balangoda-portal/src/components/projects/), [`src/app/projects/page.tsx`](file:///c:/Users/HP/Desktop/3.1/community-project/lions-club-balangoda-portal/src/app/projects/page.tsx) |

---

## 2. Test Case Specifications & Execution Results

### TC-PROJ-001: Initial Load & Rendering of Published Projects
- **Test Objective:** Verify that loading the projects slice returns all published projects with required card metadata while strictly filtering out draft items.
- **Traceability:** `FR-02`, `UC02`
- **Test Level:** Unit & Integration
- **Priority:** **P1 - Critical**
- **Preconditions:** Seed dataset contains 5 published projects across 4 pillars and 1 draft project.
- **Execution Steps:**
  1. Call `filterProjects(SEED_PROJECTS)` with default options.
  2. Inspect result count and verify each record has `id`, `title`, `slug`, `category`, `summary`, `coverImageUrl`, `eventDate`, and `status = 'PUBLISHED'`.
  3. Verify no `DRAFT` items exist in the returned array.
- **Expected Outcome:** Exactly 5 published projects returned; zero draft items leaked.
- **Actual Result:** **PASS** (Returned 5 items, all status `PUBLISHED`, execution duration: 2.4 ms).

---

### TC-PROJ-002: Category Filtering by Service Pillar
- **Test Objective:** Verify that selecting individual service pillar categories restricts results to matching items.
- **Traceability:** `FR-02`, Proposal Service Pillars (Healthcare, Education, Environment, Poverty Relief)
- **Test Level:** Unit & Integration
- **Priority:** **P1 - Critical**
- **Preconditions:** Dataset loaded with multiple categories.
- **Execution Steps:**
  1. Query with `{ category: 'HEALTHCARE' }`.
  2. Query with `{ category: 'EDUCATION' }`.
  3. Query with `{ category: 'ENVIRONMENT' }`.
  4. Query with `{ category: 'POVERTY_RELIEF' }`.
- **Expected Outcome:**
  - `HEALTHCARE`: Exactly 2 projects returned; all category values equal `HEALTHCARE`.
  - `EDUCATION`: Exactly 1 published project returned; category equals `EDUCATION`.
  - `ENVIRONMENT`: Exactly 1 project returned; category equals `ENVIRONMENT`.
  - `POVERTY_RELIEF`: Exactly 1 project returned; category equals `POVERTY_RELIEF`.
- **Actual Result:** **PASS** (100% category match across all 4 pillars, duration: 0.6 ms).

---

### TC-PROJ-003: Keyword Search by Project Title (Case-Insensitive)
- **Test Objective:** Verify that search query matches keywords in the title regardless of casing.
- **Traceability:** `FR-02`, `UC02`
- **Test Level:** Unit / Functional
- **Priority:** **P2 - High**
- **Preconditions:** Seed projects loaded.
- **Execution Steps:**
  1. Query with lowercase `"vision"`.
  2. Query with uppercase `"CATARACT"`.
- **Expected Outcome:** Both queries successfully locate `proj-001` (*"Annual Free Cataract Surgery & Vision Screening Camp"*).
- **Actual Result:** **PASS** (Case-insensitive matching confirmed, duration: 2.0 ms).

---

### TC-PROJ-004: Keyword Search Matches Location and Summary
- **Test Objective:** Verify that keyword search operates across project location and narrative summary fields.
- **Traceability:** `FR-02`
- **Test Level:** Unit / Functional
- **Priority:** **P2 - High**
- **Preconditions:** Seed projects loaded.
- **Execution Steps:**
  1. Search location keyword: `"Medadumbara"`.
  2. Search location keyword: `"Kaltota"`.
  3. Search summary keyword: `"saplings"`.
- **Expected Outcome:**
  - `"Medadumbara"` matches Education book drive.
  - `"Kaltota"` matches Poverty Relief flood response.
  - `"saplings"` matches Environment reforestation campaign.
- **Actual Result:** **PASS** (Multi-attribute substring matching verified, duration: 0.4 ms).

---

### TC-PROJ-005: Combined Category and Keyword Filtering
- **Test Objective:** Verify that applying both category and keyword filters simultaneously narrows results accurately.
- **Traceability:** `FR-02`
- **Test Level:** Integration
- **Priority:** **P2 - High**
- **Preconditions:** Seed dataset.
- **Execution Steps:**
  1. Query `{ category: 'HEALTHCARE', query: 'Diabetes' }`.
  2. Query `{ category: 'EDUCATION', query: 'Diabetes' }`.
- **Expected Outcome:**
  - First query returns 1 matching project (Diabetes Mobile Clinic).
  - Second query returns 0 projects (category mismatch).
- **Actual Result:** **PASS** (Logical AND conjunction verified, duration: 0.3 ms).

---

### TC-PROJ-006: Empty Search Results State Handling
- **Test Objective:** Verify that search queries with no matches return an empty array without runtime exceptions.
- **Traceability:** `FR-02`, `NFR-02`
- **Test Level:** Unit / Edge Case
- **Priority:** **P3 - Medium**
- **Execution Steps:**
  1. Query with non-existent string `"NonexistentProjectQueryXYZ"`.
- **Expected Outcome:** Returns empty array `[]` (length 0).
- **Actual Result:** **PASS** (Empty array returned safely, duration: 0.3 ms).

---

### TC-PROJ-007: Filter by Event Year
- **Test Objective:** Verify that projects can be filtered by event occurrence year.
- **Traceability:** `FR-02`, `UC02`
- **Test Level:** Unit / Functional
- **Priority:** **P2 - High**
- **Execution Steps:**
  1. Filter with `{ year: '2026' }`.
  2. Filter with `{ year: '2025' }`.
- **Expected Outcome:**
  - `2026`: Returns 3 published projects.
  - `2025`: Returns 2 published projects.
- **Actual Result:** **PASS** (Exact year extraction and matching verified, duration: 3.0 ms).

---

### TC-PROJ-008: Security Rule: Draft Projects Strictly Blocked from Public View
- **Test Objective:** Ensure that internal draft projects are completely hidden from public queries, even when searching specifically for the draft project's title.
- **Traceability:** `FR-06`, Data Privacy Policy
- **Test Level:** Unit / Security
- **Priority:** **P1 - Critical**
- **Execution Steps:**
  1. Query specifically for draft title `"Vocational IT Skills"`.
  2. Query all items in category `EDUCATION` (where draft exists).
- **Expected Outcome:** Draft project never returned under default public query options.
- **Actual Result:** **PASS** (Draft project strictly quarantined, duration: 0.3 ms).

---

### TC-PROJ-009: Input Sanitization Against XSS Payloads
- **Test Objective:** Verify that search input sanitization strips script tags and escapes dangerous HTML characters to prevent Cross-Site Scripting.
- **Traceability:** `SEC-02`, `SEC-03`
- **Test Level:** Unit / Security
- **Priority:** **P1 - Critical**
- **Execution Steps:**
  1. Pass malicious payload `<script>alert('xss')</script>`.
  2. Pass HTML injection `<b>Bold text</b>`.
  3. Execute filter with payload.
- **Expected Outcome:** Script tags stripped to empty; angle brackets escaped; safe execution returns 0 matches without browser script execution.
- **Actual Result:** **PASS** (XSS neutralized cleanly, duration: 0.6 ms).

---

### TC-PROJ-010: Slug Lookup & Detail Routing Retrieval
- **Test Objective:** Verify unique slug resolution for published projects and rejection of draft slugs.
- **Traceability:** `FR-02`, Routing
- **Test Level:** Unit / Functional
- **Priority:** **P2 - High**
- **Execution Steps:**
  1. Lookup published slug: `'annual-free-cataract-surgery-vision-camp-2026'`.
  2. Lookup draft slug: `'youth-vocational-it-skills-workshop-draft'`.
  3. Lookup non-existent slug.
- **Expected Outcome:** Published project returned; draft and non-existent slugs return `undefined`.
- **Actual Result:** **PASS** (Correct slug resolution verified, duration: 0.5 ms).

---

### TC-PROJ-011: Unique Years Extraction & Sorting
- **Test Objective:** Verify that the year filter extractor aggregates unique event years from published projects and sorts them descending.
- **Traceability:** `FR-02`, UI Filtering
- **Test Level:** Unit / Helper
- **Priority:** **P3 - Medium**
- **Execution Steps:**
  1. Call `getUniqueProjectYears(SEED_PROJECTS)`.
- **Expected Outcome:** Returns array `['2026', '2025']`.
- **Actual Result:** **PASS** (Unique, descending array verified, duration: 23.8 ms).

---

### TC-PROJ-012: Chronological Descending Date Ordering
- **Test Objective:** Verify that returned project lists are automatically ordered by `eventDate` descending (newest projects appear first).
- **Traceability:** `FR-02`, `UC02`
- **Test Level:** Unit / Sorting
- **Priority:** **P2 - High**
- **Execution Steps:**
  1. Call `filterProjects(SEED_PROJECTS)`.
  2. Compare timestamps for each consecutive project pair.
- **Expected Outcome:** Each project date is greater than or equal to the subsequent project date.
- **Actual Result:** **PASS** (Strict descending chronology verified, duration: 0.5 ms).

---

## 3. Test Execution Command & Verification

To reproduce these test results on any machine:
```bash
# From repository root
npm test
# OR directly via Node.js native test runner
node --experimental-strip-types --test tests/projects-list.test.mjs
```

### Execution Log Excerpt:
```text
▶ Projects List Vertical Slice (FR-02, UC02) Test Suite
  ✔ TC-PROJ-001: Initial load returns all published projects and excludes drafts (2.43ms)
  ✔ TC-PROJ-002: Filter projects by Service Pillar category (0.60ms)
  ✔ TC-PROJ-003: Keyword search by project title (case-insensitive) (2.03ms)
  ✔ TC-PROJ-004: Keyword search matches project location and summary (0.41ms)
  ✔ TC-PROJ-005: Combined category and keyword search filters accurately (0.27ms)
  ✔ TC-PROJ-006: Empty search results state handling (0.30ms)
  ✔ TC-PROJ-007: Filter by event year correctly matches dates (2.98ms)
  ✔ TC-PROJ-008: Security rule: Draft projects are strictly blocked from public view (0.32ms)
  ✔ TC-PROJ-009: Input sanitization protects against XSS payloads (0.61ms)
  ✔ TC-PROJ-010: Slug lookup retrieves published projects and rejects drafts (0.51ms)
  ✔ TC-PROJ-011: Unique years extraction returns sorted published years (23.84ms)
  ✔ TC-PROJ-012: Results are sorted chronologically descending (newest first) (0.52ms)
✔ Projects List Vertical Slice (FR-02, UC02) Test Suite (37.88ms)
ℹ tests 12
ℹ suites 1
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 343.08ms
```

