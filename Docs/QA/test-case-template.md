# Standardized Test Case Template

**Project:** Lions Club of Balangoda Web Portal & Content Management System  
**Course:** IS5109 Community Project (Group 14)  
**Assigned QA Reviewer:** M.N.M Nafris (22FIS0545)  
**Author:** Ahmed Ahnaf (Branch: `ahmed_ahnaf`)  
**Standard Version:** 1.0 (Sprint 1)  

---

## 1. Test Case Template Structure

All team members authoring manual, API, or automated test cases must use this standardized template.

```markdown
### [TEST_CASE_ID]: [Concise Title Summarizing Test Objective]

| Metadata Field | Specification |
|---|---|
| **Module / Slice** | [e.g., Public Portal - Projects List Vertical Slice] |
| **Requirements Traceability** | [e.g., FR-02 (Project Search & Filter), UC02, Jira: LBW-22] |
| **Test Level** | [Unit | Integration / API | End-to-End (E2E) | Manual / Exploratory] |
| **Test Type** | [Functional | Negative / Validation | Security | Performance | Accessibility] |
| **Test Priority** | [P1 - Critical | P2 - High | P3 - Medium | P4 - Low] |
| **Author** | [Team Member Name] |
| **Reviewer** | M.N.M Nafris (QA Lead) |

#### Preconditions & Environment Setup
- **System State:** [e.g., Application running locally at `http://localhost:3000`]
- **Database / Mock Data:** [e.g., Seed projects loaded with at least 5 published records and 1 draft record]
- **Authentication:** [e.g., Unauthenticated public visitor / Authenticated Admin officer]
- **Viewport / Device:** [e.g., Desktop 1920x1080 or Mobile 360x640 per NFR-02]

#### Test Execution Steps

| Step # | Action Description | Test Input Data | Expected System Response |
|---|---|---|---|
| 1 | [e.g., Navigate to target URL] | [URL: `/projects`] | [HTTP 200 OK; page title "Our Community Projects" rendered] |
| 2 | [e.g., Enter search keyword] | [Query string: "Vision"] | [Search input accepts text; real-time filter updates] |
| 3 | [e.g., Select category filter pill] | [Pillar: "Healthcare"] | [Only matching Healthcare vision projects displayed] |
| 4 | [e.g., Inspect card details] | [Inspect first card] | [Card shows thumbnail, date, pillar badge, summary, and link] |

#### Expected Outcome Summary
- [Clear statement of the required end state for test passage]

#### Post-Conditions & Clean-up
- [e.g., Reset search input or clear test database records]

#### Execution Log & Verification

| Execution Field | Value |
|---|---|
| **Execution Date** | [YYYY-MM-DD] |
| **Executed By** | [Tester Name] |
| **Execution Status** | [PASS | FAIL | BLOCKED | SKIPPED] |
| **Actual Result** | [Detailed observation of what actually occurred during test run] |
| **Associated Bug ID** | [Bug key if failed, e.g., BUG-LBW-04 (or N/A)] |
| **Severity if Failed** | [Critical | High | Medium | Low (or N/A)] |
```

---

## 2. Concrete Example 1: Functional Search & Filter Test (P1)

### TC-PROJ-002: Filter Community Projects by Service Pillar Category

| Metadata Field | Specification |
|---|---|
| **Module / Slice** | Public Portal - Projects List Vertical Slice |
| **Requirements Traceability** | FR-02 (Category Filter), UC02, Jira: LBW-22 |
| **Test Level** | Integration & Automated Unit Level (`node:test`) |
| **Test Type** | Functional Business Logic |
| **Test Priority** | **P1 - Critical** |
| **Author** | Ahmed Ahnaf |
| **Reviewer** | M.N.M Nafris |

#### Preconditions & Environment Setup
- System loaded with standard Balangoda Lions seed projects (includes Healthcare, Education, Environment, and Poverty Relief items).
- All target projects have `status = 'PUBLISHED'`.
- Viewport set to standard responsive width.

#### Test Execution Steps

| Step # | Action Description | Test Input Data | Expected System Response |
|---|---|---|---|
| 1 | Load the projects vertical slice | Navigate to `/projects` | All published projects rendered across all categories. |
| 2 | Click the "Healthcare" service pillar filter button | Filter selection: `HEALTHCARE` | Filter button displays active visual styling; list updates immediately. |
| 3 | Inspect every project card visible in the filtered results | UI Card Category Badges | 100% of visible cards display the "Healthcare" badge. Zero cards from other categories appear. |
| 4 | Verify project count indicator | Text counter | Counter displays exact count of Healthcare projects (e.g., "Showing 2 Healthcare projects"). |
| 5 | Click the "All Pillars" filter button | Filter selection: `ALL` | All published projects across all pillars are restored to view. |

#### Expected Outcome Summary
Category filtering dynamically limits displayed projects to the selected humanitarian service pillar without page reload or loss of project card metadata.

#### Post-Conditions & Clean-up
None (read-only filter operation).

#### Execution Log & Verification

| Execution Field | Value |
|---|---|
| **Execution Date** | 2026-11-05 |
| **Executed By** | Ahmed Ahnaf |
| **Execution Status** | **PASS** |
| **Actual Result** | Filter correctly isolated Healthcare projects and restored all items on reset. |
| **Associated Bug ID** | N/A |
| **Severity if Failed** | High (P2) |

---

## 3. Concrete Example 2: Security & Negative Input Test (P2)

### TC-PROJ-010: Search Input Script Injection & XSS Sanitization

| Metadata Field | Specification |
|---|---|
| **Module / Slice** | Public Portal - Projects Search |
| **Requirements Traceability** | FR-02, SEC-02, SEC-03, Jira: LBW-22 |
| **Test Level** | Unit / Security |
| **Test Type** | Security (XSS Defense) |
| **Test Priority** | **P2 - High** |
| **Author** | Ahmed Ahnaf |
| **Reviewer** | M.N.M Nafris |

#### Preconditions & Environment Setup
- Projects list loaded with search bar rendered.

#### Test Execution Steps

| Step # | Action Description | Test Input Data | Expected System Response |
|---|---|---|---|
| 1 | Enter malicious JavaScript XSS payload into the project search input box | `<script>alert('xss-attack')</script>` | Input field accepts text without executing script. |
| 2 | Inspect DOM rendering of the active search query display | Inspect element in browser | Value is rendered as plain text string; no script execution dialog or browser alert is triggered. |
| 3 | Observe project list response | Filter matching | System treats string literally; safely returns empty state: "No projects found matching '<script>alert('xss-attack')</script>'". |

#### Expected Outcome Summary
Special HTML characters are sanitized; search engine executes parameterized substring match; no unsanitized HTML is injected into the DOM.

#### Post-Conditions & Clean-up
Clear search input.

#### Execution Log & Verification

| Execution Field | Value |
|---|---|
| **Execution Date** | 2026-11-05 |
| **Executed By** | Ahmed Ahnaf |
| **Execution Status** | **PASS** |
| **Actual Result** | Script tags safely rendered as inert text. Zero alert execution. |
| **Associated Bug ID** | N/A |
| **Severity if Failed** | Critical (P1) |
