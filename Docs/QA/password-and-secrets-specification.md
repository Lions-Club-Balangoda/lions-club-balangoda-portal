# Test Cases: Password Hashing & Secrets Management (SEC-04)

**Feature / Story:** Password Hashing (Bcrypt cost >= 10) & Secrets Management  
**Project:** Lions Club of Balangoda Web Portal & Content Management System  
**Course:** IS5109 Community Project (Group 14)  
**Assigned QA Reviewer:** M.Y.M Yoosuf (22FIS0409)  
**Author:** Ahmed Ahnaf (Branch: `ahmed_ahnaf_SP02`)  
**Sprint:** Sprint 2 Milestone  
**Priority:** Highest  
**Security Standard:** SEC-04  
**Execution Environment:** Node.js v24.14.0 Test Runner (`node:test` + `node:assert`)  
**Overall Execution Result:** **27 / 27 PASSED (100% Pass Rate across SEC-04 Suites; 67 / 67 Total Project Tests Passing)**  

---

## 1. Acceptance Criteria & Test Traceability Matrix

| AC # | Acceptance Criteria Description | Test Case ID | Test Level | Automated Test Suite | Result |
|---|---|---|---|---|---|
| **AC1** | Passwords are salted and hashed with bcrypt (work factor >= 10) or Argon2; plaintext is never stored or logged | `TC-SEC-001` | Security & Cryptography | `tests/auth-password.test.mjs` (AC1 Suite) | **PASS** (11 subtests) |
| **AC2** | Password policy (minimum length) enforced server-side | `TC-SEC-002` | Functional & Validation | `tests/auth-password.test.mjs` (AC2 Suite) | **PASS** (6 subtests) |
| **AC3** | No secrets (DB URL, JWT/session secret, email, media keys) in repository history or client bundle; verified by secret scan | `TC-SEC-003` | Security & Static Analysis | `tests/secrets-scan.test.mjs` (AC3 Suite) | **PASS** (6 subtests) |
| **AC4** | `.env.example` lists variables without values | `TC-SEC-004` | Configuration & Governance | `tests/secrets-scan.test.mjs` (AC4 Suite) | **PASS** (4 subtests) |

---

## 2. Implementation Architecture

| Layer / File | Path | Key Security Enhancements |
|---|---|---|
| **Password Security Module** | [`src/lib/auth/password.ts`](file:///c:/Users/HP/Desktop/3.1/community-project/lions-club-balangoda-portal/src/lib/auth/password.ts) | Implements `hashPassword` (default cost 12, strictly rejects cost < 10), `verifyPassword` (constant-time comparison, handles malformed inputs safely), `validatePasswordPolicy` (minimum length 8, rejects empty/whitespace, max length 72), and `sanitizeLogContext` (deep redaction of sensitive credentials in log payloads). |
| **Backend Password Utility** | [`server/utils/password.ts`](file:///c:/Users/HP/Desktop/3.1/community-project/lions-club-balangoda-portal/server/utils/password.ts) | Re-exports password security utilities for backend Express architecture and future authentication controllers. |
| **Secrets Management Module** | [`src/lib/auth/secrets.ts`](file:///c:/Users/HP/Desktop/3.1/community-project/lions-club-balangoda-portal/src/lib/auth/secrets.ts) | Enforces strict isolation of private server secrets (`DATABASE_URL`, `NEXTAUTH_SECRET`, `CLOUDINARY_API_SECRET`, `SMTP_PASSWORD`). Blocks access to `NEXT_PUBLIC_` variables as server secrets. Implements regex-based secret scanning engine `scanContentForExposedSecrets`. |
| **Environment Template** | [`.env.example`](file:///c:/Users/HP/Desktop/3.1/community-project/lions-club-balangoda-portal/.env.example) | Cleaned template declaring all application, database, auth, Cloudinary, and SMTP variables **strictly without values**, adhering to AC4. |
| **Database Initial Seed** | [`database/seeds/001_initial_seed.sql`](file:///c:/Users/HP/Desktop/3.1/community-project/lions-club-balangoda-portal/database/seeds/001_initial_seed.sql) | Updated placeholder seed hash with a valid bcrypt work factor 12 hash of initial administrator password (`Admin@Lions2026!`). |
| **Security Test Suites** | [`tests/auth-password.test.mjs`](file:///c:/Users/HP/Desktop/3.1/community-project/lions-club-balangoda-portal/tests/auth-password.test.mjs)<br>[`tests/secrets-scan.test.mjs`](file:///c:/Users/HP/Desktop/3.1/community-project/lions-club-balangoda-portal/tests/secrets-scan.test.mjs) | 27 automated tests covering bcrypt cost factor >= 10, salting, constant-time verification, safe logging redaction, server-side policy enforcement, secret scan, and empty `.env.example` validation. |

---

## 3. Detailed Test Case Specifications

### TC-SEC-001: Salted Bcrypt Hashing (Work Factor >= 10) & Plaintext Redaction (AC1)

| Metadata Field | Specification |
|---|---|
| **Module / Slice** | Authentication & Security - Password Infrastructure |
| **Requirements Traceability** | SEC-04, Proposal §1.4 (Security), MVP Scope §SEC-04 |
| **Test Level** | Unit & Cryptographic Integration (`node:test`) |
| **Test Type** | Security & Functional |
| **Test Priority** | **P1 - Critical** |
| **Author** | Ahmed Ahnaf |
| **Reviewer** | M.Y.M Yoosuf |

#### Preconditions & Environment Setup
- `bcryptjs` package installed.
- System operating with `DEFAULT_BCRYPT_COST = 12` and `MIN_BCRYPT_COST = 10`.

#### Test Execution Steps

| Step # | Action Description | Test Input Data | Expected System Response |
|---|---|---|---|
| 1 | Hash password with default settings | `"StrongOfficerPassword2026!"` | Hash generated starting with `$2b$12$` or `$2a$12$`; cost factor equals 12. |
| 2 | Hash password with custom cost 10 and 11 | `"CustomCostPassword@123"`, cost: 10 & 11 | Returns valid hashes with cost factors 10 and 11 respectively. |
| 3 | Attempt to hash with cost factor < 10 (e.g. 9 or 4) | Cost: 9, Cost: 4 | Operation rejected with `Error: Bcrypt cost factor must be at least 10 (SEC-04 policy requirement)`. |
| 4 | Hash identical password twice | `"IdenticalPassword2026#"` | Two distinct, unique hashes produced due to unique random cryptographic salting (`hash1 !== hash2`). |
| 5 | Verify valid plaintext password against stored hash | Correct plaintext + valid hash | Returns `true` via constant-time comparison. |
| 6 | Verify invalid password attempt | Incorrect plaintext + valid hash | Returns `false`. |
| 7 | Verify seed admin password | `"Admin@Lions2026!"` against seed hash | Returns `true`; invalid attempt returns `false`. |
| 8 | Pass empty or malformed hashes to verifier | `""`, `"invalid-hash"`, `"$2b$12$short"` | Returns `false` gracefully without throwing unhandled exceptions. |
| 9 | Sanitize log payloads containing credentials | Object with `password`, `sessionToken`, `apiKey` | Sensitive fields replaced with `"[REDACTED]"`; original payload unmodified. |

#### Execution Log & Verification
- **Status:** **PASS** (11 subtests passed in 3.60 s).
- **Actual Result:** Bcrypt work factor >= 10 strictly enforced; random salting verified; sensitive credentials sanitized from logs.

---

### TC-SEC-002: Server-Side Password Policy Enforcement (AC2)

| Metadata Field | Specification |
|---|---|
| **Module / Slice** | Authentication & Security - Password Validation |
| **Requirements Traceability** | SEC-04, Screen Specifications SCR-01 (Admin Login) |
| **Test Level** | Unit & Validation Logic |
| **Test Type** | Negative & Validation |
| **Test Priority** | **P1 - Critical** |
| **Author** | Ahmed Ahnaf |
| **Reviewer** | M.Y.M Yoosuf |

#### Preconditions & Environment Setup
- Server-side validation module `validatePasswordPolicy` loaded.
- `MIN_PASSWORD_LENGTH = 8`, `MAX_PASSWORD_LENGTH = 72`.

#### Test Execution Steps

| Step # | Action Description | Test Input Data | Expected System Response |
|---|---|---|---|
| 1 | Validate compliant password | `"ValidPassword8!"` (15 chars) | `{ valid: true, errors: [] }`. |
| 2 | Validate short password (< 8 chars) | `"Short1!"` (6 chars) | `{ valid: false, errors: ['Password must be at least 8 characters long'] }`. |
| 3 | Validate empty or whitespace input | `""`, `"   "` | Rejected with explicit error *"Password cannot be empty or contain only whitespace"*. |
| 4 | Validate non-string types | `null`, `undefined` | `{ valid: false, errors: ['Password must be a valid string'] }`. |
| 5 | Validate password exceeding 72 characters | String of 73 characters | Rejected with *"Password cannot exceed 72 characters"* to protect against truncation attacks. |
| 6 | Execute `assertPasswordPolicy` on invalid password | `"12345"` | Throws `Error: Password policy violation: Password must be at least 8 characters long`. |
| 7 | Call `hashPassword` with non-compliant password | `"short"` | Pre-hashing assertion triggers and rejects immediately before hashing. |

#### Execution Log & Verification
- **Status:** **PASS** (6 subtests passed in 0.95 ms).
- **Actual Result:** Server-side minimum length (>= 8 chars) and byte bounds enforced before any database or hashing operation.

---

### TC-SEC-003: Secret Scanning & Client Bundle Boundary Protection (AC3)

| Metadata Field | Specification |
|---|---|
| **Module / Slice** | Security & Configuration - Secrets Protection |
| **Requirements Traceability** | SEC-04, Gitleaks CI Check (`security.yml`) |
| **Test Level** | Static Analysis & Integration |
| **Test Type** | Security Audit |
| **Test Priority** | **P1 - Critical** |
| **Author** | Ahmed Ahnaf |
| **Reviewer** | M.Y.M Yoosuf |

#### Preconditions & Environment Setup
- Full codebase checked on branch `ahmed_ahnaf_SP02`.
- High-precision regex scanner `scanContentForExposedSecrets` configured.

#### Test Execution Steps

| Step # | Action Description | Test Scope | Expected System Response |
|---|---|---|---|
| 1 | Run secret scan engine against simulated leak | Synthetic URI with credentials | Successfully flags embedded database password. |
| 2 | Scan all source files in `src/`, `server/`, and `scripts/` | `.ts`, `.tsx`, `.js`, `.mjs`, `.json` | Zero hardcoded passwords, private keys, or high-entropy secrets detected. |
| 3 | Scan all client-side files in `src/components/` and `src/app/` (non-API) | Client UI code | Zero occurrences of `process.env.DATABASE_URL`, `process.env.NEXTAUTH_SECRET`, `CLOUDINARY_API_SECRET`, or `SMTP_PASSWORD`. |
| 4 | Verify client safety naming rule | `NEXT_PUBLIC_*` variables | Non-sensitive keys return `true`; keys with sensitive keywords (`NEXT_PUBLIC_DATABASE_URL`, `NEXT_PUBLIC_JWT_SECRET`) return `false`. |
| 5 | Attempt to read `NEXT_PUBLIC_` variable via `getServerSecret` | `getServerSecret('NEXT_PUBLIC_APP_URL')` | Throws security violation exception. |
| 6 | Audit placeholder detection | `your_secret_here`, `db_password` | Accurately flagged as insecure placeholders. |

#### Execution Log & Verification
- **Status:** **PASS** (6 subtests passed in 82.55 ms).
- **Actual Result:** Client bundle strictly isolated from server secrets; zero hardcoded credentials detected in source tree.

---

### TC-SEC-004: Environment Variable Template Listing without Values (AC4)

| Metadata Field | Specification |
|---|---|
| **Module / Slice** | Configuration Governance |
| **Requirements Traceability** | SEC-04 (AC4: .env.example lists variables without values) |
| **Test Level** | Configuration & Integration |
| **Test Type** | Governance & Compliance |
| **Test Priority** | **P1 - Critical** |
| **Author** | Ahmed Ahnaf |
| **Reviewer** | M.Y.M Yoosuf |

#### Preconditions & Environment Setup
- `.env.example` located at repository root.
- `.gitignore` configured with environment file exclusions.

#### Test Execution Steps

| Step # | Action Description | Target Property | Expected System Response |
|---|---|---|---|
| 1 | Inspect `.env.example` existence | File system check | `.env.example` exists at root. |
| 2 | Parse all variable declarations in `.env.example` | Non-comment lines | Every non-comment line follows `KEY=` with strictly empty value after the `=` sign. |
| 3 | Verify presence of required service variables | Application, DB, Auth, Cloudinary, SMTP | All 23 required keys present (`NODE_ENV`, `DATABASE_URL`, `NEXTAUTH_SECRET`, `CLOUDINARY_API_SECRET`, `SMTP_PASSWORD`, etc.). |
| 4 | Inspect `.gitignore` rules | Git exclusions | `.env` and `.env.local` ignored; `!.env.example` explicitly preserved. |

#### Execution Log & Verification
- **Status:** **PASS** (4 subtests passed in 12.94 ms).
- **Actual Result:** `.env.example` lists all 23 configuration variables without values.

---

## 4. Overall Test Execution Sign-Off

- **Security Test Suites (SEC-04):**
  - `tests/auth-password.test.mjs`: **17 / 17 PASSED**
  - `tests/secrets-scan.test.mjs`: **10 / 10 PASSED**
- **Existing Functional & QA Suites:**
  - `tests/projects-api.test.mjs`: **4 / 4 PASSED**
  - `tests/projects-ui.test.mjs`: **7 / 7 PASSED**
  - `tests/projects-list.test.mjs`: **12 / 12 PASSED**
  - `tests/projects-search.test.mjs`: **17 / 17 PASSED**
- **Cumulative Test Results:** **67 / 67 PASSED (100% Pass Rate across 17 suites, 0 failures, 0 regressions)**.
- **Reviewer Action:** Submitted to **M.Y.M Yoosuf (Reviewer)** for code review and Jira sign-off.

