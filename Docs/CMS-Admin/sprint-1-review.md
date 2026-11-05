# Sprint 1 Milestone Review Record: CMS Admin Specifications

**Project:** Lions Club of Balangoda Web Portal & Content Management System  
**Course:** IS5109 Community Project (Group 14)  
**Institution:** Sabaragamuwa University of Sri Lanka  
**Client:** Lions Club of Balangoda (District 306)  
**Author:** Ahmed Ahnaf (Branch: `ahmed_ahnaf`)  
**Student Peer Reviewer:** Jinos  
**Milestone Date:** Sprint 1 Completion (05 November 2026)  

---

## 1. Review Status Declaration

> [!IMPORTANT]
> **Official Review Status:**  
> **`Review status: PENDING CLUB OFFICER REVIEW`**  
>  
> In strict accordance with academic integrity and project standards, no club officer feedback, stakeholder approval, or acceptance sign-off has been fabricated or assumed. This document formally presents the completed Sprint 1 CMS Admin specifications package prepared by Group 14 for review by the executive officers of the Lions Club of Balangoda.

---

## 2. Purpose of the Review

The purpose of this Sprint 1 milestone review is to:
1. Validate that the administrative workflows, textual screen designs, and validation rules accurately match the real-world operational needs of the club officers.
2. Confirm that non-technical club officers (President, Secretary, Project Committee Chairs) find the plain-language terminology, form fields, and confirmation dialogs clear and intuitive.
3. Obtain client feedback before backend CMS development and UI component implementation begin in Sprints 2 and 3.

---

## 3. Documentation Package Submitted for Review

The following specifications located in `Docs/CMS-Admin/` constitute the complete review package:

1. **`requirements-traceability.md`:** Requirements Traceability Matrix linking all 33 administrative operations to proposal requirements FR-06 and FR-07.
2. **`admin-workflows.md`:** Comprehensive step-by-step interaction flows and Mermaid flowcharts for Authentication, Dashboard, Projects, News, Board Records, Media Library, and Submissions Review.
3. **`screen-specifications.md`:** Purely textual screen specifications for all 20 required CMS screens, defining information hierarchy, required/optional inputs, actions, and feedback.
4. **`validation-and-feedback.md`:** Usability matrix outlining plain-English error messages, field constraints, success toasts, and visual badges.
5. **`confirmation-patterns.md`:** Protective dialog specifications strictly separating irreversible Deletion from safe, reversible Unpublishing.

---

## 4. Reviewer Roles & Responsibilities

| Reviewer Name / Body | Role in Project | Review Scope | Review Status |
|---|---|---|---|
| **M.J.A Jinos** | Student Peer Reviewer (Group 14) | Technical consistency, traceability to FR-06/FR-07, Git branching compliance, and absence of visual wireframes | **PENDING REVIEW** |
| **Lion Prof. T. Sanjeewa Prasad Jayaweera** | Club President (Lions Club of Balangoda) | Executive oversight, board directory representation, public brand alignment | **PENDING REVIEW** |
| **Club Secretary & IT Committee** | Client Operations Officers | Usability of project creation forms, news publishing, volunteer applicant screening, and CSV spreadsheet exports | **PENDING REVIEW** |

---

## 5. Structured Review Checklist for Club Officers

During the upcoming Sprint 1 stakeholder session, club officers will evaluate the specification against these criteria:

- [ ] **Terminology & Clarity:** Are form labels and instructions free of confusing programming jargon?
- [ ] **Content Fields:** Do the project and news forms capture all necessary information for club reporting?
- [ ] **Board Hierarchy:** Does the board directory structure correctly model Lionistic administrative terms and designations?
- [ ] **Safety from Data Loss:** Is the distinction between permanently deleting content versus unpublishing to drafts clearly understandable?
- [ ] **Volunteer & Inquiry Management:** Does the submissions review workflow adequately support committee review of prospective volunteers?
- [ ] **Export Utility:** Does the proposed CSV export format satisfy the club's reporting and meeting documentation needs?

---

## 6. Feedback Log

| Item # | Date | Reviewer | Section | Feedback / Observation | Action Taken / Plan | Status |
|---|---|---|---|---|---|---|
| *1* | *Pending* | Club Secretary | Forms | *Awaiting officer review session* | *Will be updated following client meeting* | **PENDING** |
| *2* | *Pending* | President | Board Roster | *Awaiting officer review session* | *Will be updated following client meeting* | **PENDING** |
| *3* | *Pending* | Jinos | Peer Review | *Awaiting peer review on branch ahmed_ahnaf* | *Address review comments in PR* | **PENDING** |

---

## 7. Next Actions & Sprint 2 Transition

1. **Conduct Walkthrough Meeting:** Schedule an interactive walkthrough session with the Lions Club of Balangoda executive committee to present these textual workflows and screen specifications.
2. **Incorporate Officer Feedback:** Log all suggestions, field additions, or terminology adjustments directly into this review record.
3. **Sprint 2 Architecture:** Proceed with Sprint 2 tasks (database migrations, backend API routes, and public UI layouts) on the firm foundation of approved CMS interaction specifications.

