# Lions Club of Balangoda – CMS Admin Specifications Index

**Course:** IS5109 Information Systems Project for Community  
**Team:** Group 14 (Sabaragamuwa University of Sri Lanka)  
**Client:** Lions Club of Balangoda (Lions Clubs International District 306)  
**Task:** Design CMS Admin Workflows and Interaction Specifications  
**Author:** Ahmed Ahnaf (Branch: `ahmed_ahnaf`)  
**Reviewer:** Jinos  

---

## Documentation Overview

This directory contains the complete textual specifications, interaction workflows, screen designs, validation matrices, and review records for the **Lions Club of Balangoda Web Portal & Content Management System (CMS)**.

In strict adherence to project instructions, all specifications are textual and requirements-focused. No visual wireframes, Figma mockups, or UI prototypes were used.

### Directory Contents

| Document | Description |
|---|---|
| [requirements-traceability.md](requirements-traceability.md) | **Requirements Traceability Matrix (RTM):** Comprehensive mapping of all 33 administrative operations to proposal requirements FR-06 and FR-07, use cases UC07–UC12, and database schema entities. |
| [admin-workflows.md](admin-workflows.md) | **Admin User Workflows:** Detailed, numbered interaction flows with Mermaid flowcharts for Authentication, Dashboard, Projects, News, Board Records, Media Library, and Submissions. |
| [screen-specifications.md](screen-specifications.md) | **Textual Screen Specifications:** In-depth textual definitions for all 20 CMS administrative screens (SCR-01 through SCR-20), specifying purpose, layout hierarchy, required/optional inputs, actions, and feedback. |
| [validation-and-feedback.md](validation-and-feedback.md) | **Validation & Feedback Matrix:** Comprehensive guide to non-technical error handling, field validation constraints, plain-language messages, actionable corrections, and success notifications. |
| [confirmation-patterns.md](confirmation-patterns.md) | **Confirmation Patterns:** Detailed architectural specification establishing the protective separation between irreversible Deletion (SCR-19) and safe, reversible Unpublishing (SCR-20). |
| [sprint-1-review.md](sprint-1-review.md) | **Sprint 1 Review Record:** Formal review ledger declaring the official review status (`PENDING CLUB OFFICER REVIEW`), structured stakeholder checklist, and next actions. |

---

## Key Requirements Reference

- **FR-06:** *Admin CMS for creating, updating and deleting projects, news and board records.*
- **FR-07:** *Admins can review, manage and export received volunteer submissions and inquiries.*
- **Target Users:** Non-technical club officers (Club President, Secretary, Project Chairs).
- **Core Technology Context:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS, PostgreSQL/MySQL, Cloudinary Asset CDN.

