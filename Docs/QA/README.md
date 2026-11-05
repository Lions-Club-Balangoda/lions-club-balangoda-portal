# Quality Assurance & Testing Framework

**Project:** Lions Club of Balangoda Web Portal & Content Management System  
**Course:** IS5109 Information Systems Project for Community  
**Team:** Group 14 (Sabaragamuwa University of Sri Lanka)  
**Client:** Lions Club of Balangoda (Lions Clubs International District 306)  
**Assigned QA Reviewer:** M.N.M Nafris (22FIS0545)  
**Author:** Ahmed Ahnaf (Branch: `ahmed_ahnaf`)  

---

## QA Framework Overview

This directory contains the complete Quality Assurance strategy, test case templates, bug severity classification, and test suites for the Lions Club of Balangoda Web Portal & CMS.

### Published Documentation

| Document | Purpose & Description |
|---|---|
| [test-strategy.md](test-strategy.md) | **Test Strategy Specification:** Defines the 4 test levels (Unit, API/Integration, E2E, Manual), tooling aligned with Next.js/React/Node, test case locations, and CI/CD quality gates. |
| [test-case-template.md](test-case-template.md) | **Standardized Test Case Template:** Reusable template for authoring manual and automated test specifications with field guidelines and concrete examples. |
| [bug-severity-scale.md](bug-severity-scale.md) | **Bug Severity Scale & Release Gate Policy:** Formal definitions of Critical (P1), High (P2), Medium (P3), and Low (P4) severities, detailing exactly what blocks release. |
| [projects-list-test-cases.md](projects-list-test-cases.md) | **Initial Test Cases (Projects List Slice):** 12 formal test specifications with execution verification for the Community Projects search and filtering vertical slice (`FR-02`). |

---

## Executing Automated Tests

All automated unit and integration tests are located in [`tests/`](../../tests/) and can be run using the standard npm test script:

```bash
# Run all automated test suites
npm test

# Run the projects-list vertical slice test directly
node --experimental-strip-types --test tests/projects-list.test.mjs
```
