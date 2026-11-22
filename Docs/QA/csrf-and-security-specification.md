# Security Architecture Specification: Anti-CSRF, Security Headers, Sanitisation & Error Handling (SEC-02, SEC-03, SEC-05)

**Feature / Story:** CSRF Protection, HTTP Security Headers, Shared Input Sanitisation, and Safe Error Responses  
**Project:** Web Portal & Content Management System for Lions Club of Balangoda  
**Course:** IS5109 Community Project (Group 14)  
**Priority:** Highest  
**Paired Leads:** M.H.M Yoosuf (22FIS0519)  
**Reviewer:** M.P Asmad Sahee (22FIS0543)  
**Security Standards Covered:** SEC-01, SEC-02, SEC-03, SEC-05  
**Status:** **RATIFIED & IMPLEMENTED**  

---

## 1. Executive Summary & Traceability

This specification defines the defensive security posture for both the public-facing community web portal and administrative interfaces. It satisfies all acceptance criteria:

1. **Anti-CSRF Verification (SEC-05):** State-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) are protected using Origin verification, Fetch Metadata (`Sec-Fetch-Site`), and cryptographically secure double-submit token verification.
2. **Security Headers & CSP (SEC-01, SEC-03, NFR-02):** Strict Content-Security-Policy (CSP), clickjacking frame protection (`X-Frame-Options: DENY`, `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, and production-only HSTS.
3. **Shared Validation & Input Sanitisation (SEC-02):** Centralized input sanitization for HTML/rich text, search queries, slugs, email, and objects; 100% parameterization of SQL statements.
4. **Safe Error Responses (NFR-04, SEC-02):** Production error responses return sanitized, generic messages; stack traces and raw SQL exceptions are restricted strictly to server-side logs.

---

## 2. Anti-CSRF Architecture & Token Authentication Rationale (SEC-05)

### 2.1 Threat Model
Cross-Site Request Forgery (CSRF) exploits ambient browser credentials (such as cookies automatically dispatched with cross-site requests). An attacker lures an authenticated club administrator to a malicious site which triggers unauthorized state-changing actions (e.g. deleting a project or approving an unvetted news release).

### 2.2 Rationale on Token Authentication without Cookies
- **Pure Header Token Authentication (Bearer JWT):** When an API client stores access tokens in non-ambient storage (such as in-memory state or local application variables) and transmits credentials strictly via the `Authorization: Bearer <token>` header, the application is **inherently immune to browser CSRF attacks**. Modern web browsers *never* automatically attach custom `Authorization` headers to cross-site requests.
- **Ambient Cookie Authentication & Form Submissions:** When an administrative session utilizes cookies (e.g. `HttpOnly`, `SameSite` cookies) or Next.js Server Actions invoked from web browsers, ambient credentials are sent. In this mode, **Anti-CSRF verification is mandatory**.

### 2.3 Triple-Tier CSRF Defense Strategy
Our implementation in [`src/lib/security/csrf.ts`](file:///Users/husnihussain/Documents/lions-club-balangoda-portal/src/lib/security/csrf.ts) implements three concentric defensive layers:

1. **Fetch Metadata Filter (`Sec-Fetch-Site`):** Modern browsers transmit the `Sec-Fetch-Site` header. Any state-changing request with `Sec-Fetch-Site: cross-site` is immediately rejected with `403 Forbidden`.
2. **Origin & Referer Header Verification:** State-changing requests must present an `Origin` or `Referer` matching the trusted application host (`process.env.NEXT_PUBLIC_APP_URL`). Mismatched origins are blocked.
3. **Cryptographically Secure Double-Submit Token:** For cookie-authenticated requests, a 32-byte cryptographically random token (`generateCsrfToken()`) is verified in constant time (`crypto.timingSafeEqual`) against the `x-csrf-token` header, disarming side-channel timing attacks.

---

## 3. HTTP Security Headers & Content Security Policy (SEC-01, SEC-03)

Configured at the root layer in [`next.config.ts`](file:///Users/husnihussain/Documents/lions-club-balangoda-portal/next.config.ts) and [`src/lib/security/headers.ts`](file:///Users/husnihussain/Documents/lions-club-balangoda-portal/src/lib/security/headers.ts):

| Header | Configured Value | Security Purpose |
|---|---|---|
| **`Content-Security-Policy`** | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com; connect-src 'self' https://api.cloudinary.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'` | Prevents unauthorized script execution, malicious iframes, and cross-site asset injection. |
| **`X-Frame-Options`** | `DENY` | Eliminates clickjacking by forbidding framing of any portal route. |
| **`X-Content-Type-Options`** | `nosniff` | Blocks MIME-confusion attacks and malicious file sniffing. |
| **`X-XSS-Protection`** | `0` | Disables legacy buggy browser XSS auditors in favor of strict CSP. |
| **`Referrer-Policy`** | `strict-origin-when-cross-origin` | Protects visitor URL path privacy when navigating to external destinations. |
| **`Permissions-Policy`** | `camera=(), microphone=(), geolocation=(), browsing-topics=()` | Disables invasive browser APIs and ad-tracking features. |
| **`Strict-Transport-Security`** | `max-age=63072000; includeSubDomains; preload` | Enforces TLS/HTTPS in production environments (SEC-01). |

---

## 4. Shared Input Validation & Sanitisation Layer (SEC-02)

Implemented in [`src/lib/security/sanitization.ts`](file:///Users/husnihussain/Documents/lions-club-balangoda-portal/src/lib/security/sanitization.ts):

1. **Rich Text / HTML Content Sanitization (`sanitizeHtml`):**
   - Strips `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<input>`, `<button>`, `<applet>`.
   - Strips inline event handlers (`onclick`, `onerror`, `onload`, `onmouseover`, etc.).
   - Disarms `javascript:`, `vbscript:`, and `data:` schemes in attributes.
   - Preserves safe semantic elements (`<p>`, `<h3>`, `<strong>`, `<em>`, `<ul>`, `<li>`, `<blockquote>`).
2. **Text & Query Sanitisation (`sanitizeText`, `sanitizeSearchQuery`):**
   - HTML-encodes `<`, `>`, `'`, `"`, `&`.
   - Bounded character lengths to prevent resource exhaustion.
3. **Identifier Sanitisation (`sanitizeSlug`):**
   - Strictly validates slug formats against `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
4. **Prototype Pollution Protection (`sanitizeObject`):**
   - Recursively walks JSON payloads, stripping `__proto__`, `constructor`, and `prototype` keys.
5. **Universal Database Query Parameterization:**
   - 100% of SQLite database queries in repository layers use parameterized statements (`?` with values passed separately). Zero raw SQL concatenation.

---

## 5. Safe Error Responses & Production Information Leak Prevention

Implemented in [`src/lib/security/safe-error.ts`](file:///Users/husnihussain/Documents/lions-club-balangoda-portal/src/lib/security/safe-error.ts), [`server/middleware/errorHandler.ts`](file:///Users/husnihussain/Documents/lions-club-balangoda-portal/server/middleware/errorHandler.ts), and Next.js error boundaries:

- **Production Mode:** API endpoints and web routes return uniform, user-friendly error messages (e.g., `An unexpected error occurred. Please try again later.`).
- **Internal Details Redacted:** Stack traces, internal file paths, SQLite error codes, table names, and SQL fragments are **strictly omitted** from client payloads.
- **Server Logging:** The complete technical error (stack trace, error message, ISO timestamp) is logged exclusively to server logs with a tracking identifier.
