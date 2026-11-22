import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Import CSRF, Headers, Sanitization, and Safe Error modules
import {
  generateCsrfToken,
  verifyCsrfToken,
  verifyCsrfRequest,
  CSRF_HEADER_NAME,
  CSRF_COOKIE_NAME,
} from '../src/lib/security/csrf.ts';
import { buildContentSecurityPolicy, getSecurityHeaders } from '../src/lib/security/headers.ts';
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeSearchQuery,
  sanitizeSlug,
  sanitizeEmail,
  sanitizePhoneNumber,
  sanitizeObject,
  assertParameterizedQuery,
} from '../src/lib/security/sanitization.ts';
import { formatSafeErrorForClient } from '../src/lib/security/safe-error.ts';

describe('Security Architecture & Defensive Hardening Suite (SEC-01, SEC-02, SEC-03, SEC-05)', () => {
  /* =========================================================================
   * AC-1: Anti-CSRF Verification & Token Rationale (SEC-05)
   * ========================================================================= */
  describe('AC-1: Anti-CSRF Protection & Token Rationale (SEC-05)', () => {
    it('generateCsrfToken produces 32-byte cryptographically secure hex strings', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();

      assert.strictEqual(typeof token1, 'string');
      assert.strictEqual(token1.length, 64, '32 bytes hex-encoded must be 64 characters');
      assert.strictEqual(token2.length, 64);
      assert.notStrictEqual(
        token1,
        token2,
        'Consecutive tokens must be cryptographically distinct'
      );
    });

    it('verifyCsrfToken performs constant-time verification safely', () => {
      const token = generateCsrfToken();
      assert.strictEqual(verifyCsrfToken(token, token), true, 'Identical tokens must verify');
      assert.strictEqual(
        verifyCsrfToken(token, generateCsrfToken()),
        false,
        'Mismatched tokens must fail'
      );
      assert.strictEqual(verifyCsrfToken(token, ''), false, 'Empty token must fail');
      assert.strictEqual(verifyCsrfToken(null, token), false, 'Null token must fail');
      assert.strictEqual(verifyCsrfToken(undefined, token), false, 'Undefined token must fail');
      assert.strictEqual(
        verifyCsrfToken('short', token),
        false,
        'Length mismatch must fail without throwing'
      );
    });

    it('verifyCsrfRequest permits safe read-only methods (GET, HEAD, OPTIONS)', () => {
      for (const method of ['GET', 'HEAD', 'OPTIONS']) {
        const result = verifyCsrfRequest({ method });
        assert.strictEqual(result.valid, true, `Method ${method} must be allowed unconditionally`);
      }
    });

    it('verifyCsrfRequest blocks cross-site state-changing requests via Sec-Fetch-Site', () => {
      const crossSitePost = {
        method: 'POST',
        headers: {
          'sec-fetch-site': 'cross-site',
        },
      };

      const result = verifyCsrfRequest(crossSitePost);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.statusCode, 403);
      assert.ok(result.reason.includes('Sec-Fetch-Site'));
    });

    it('verifyCsrfRequest blocks state-changing requests with mismatched Origin header', () => {
      const attackerPost = {
        method: 'POST',
        headers: {
          origin: 'https://evil-attacker.com',
          host: 'lionsclubbalangoda.org',
        },
      };

      const result = verifyCsrfRequest(attackerPost);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.statusCode, 403);
      assert.ok(result.reason.includes('Origin'));
    });

    it('verifyCsrfRequest allows state-changing requests with valid matching Origin', () => {
      const validPost = {
        method: 'POST',
        headers: {
          origin: 'https://lionsclubbalangoda.org',
          host: 'lionsclubbalangoda.org',
        },
      };

      const result = verifyCsrfRequest(validPost);
      assert.strictEqual(result.valid, true);
    });

    it('verifyCsrfRequest enforces double-submit token when cookie session is present', () => {
      const token = generateCsrfToken();

      // Missing header token
      const missingHeader = {
        method: 'POST',
        headers: {
          host: 'localhost:3000',
          cookie: `${CSRF_COOKIE_NAME}=${token}`,
        },
      };
      assert.strictEqual(verifyCsrfRequest(missingHeader).valid, false);

      // Mismatched token
      const mismatch = {
        method: 'POST',
        headers: {
          host: 'localhost:3000',
          cookie: `${CSRF_COOKIE_NAME}=${token}`,
          [CSRF_HEADER_NAME]: generateCsrfToken(),
        },
      };
      assert.strictEqual(verifyCsrfRequest(mismatch).valid, false);

      // Valid matching token
      const validTokenReq = {
        method: 'POST',
        headers: {
          host: 'localhost:3000',
          cookie: `${CSRF_COOKIE_NAME}=${token}`,
          [CSRF_HEADER_NAME]: token,
        },
      };
      assert.strictEqual(verifyCsrfRequest(validTokenReq).valid, true);
    });

    it('rationale for token auth without cookies is comprehensively documented', () => {
      const docPath = path.join(process.cwd(), 'Docs/QA/csrf-and-security-specification.md');
      assert.ok(fs.existsSync(docPath), 'Security specification documentation must exist');

      const content = fs.readFileSync(docPath, 'utf8');
      assert.ok(
        content.includes('Rationale on Token Authentication without Cookies'),
        'Doc must contain token auth rationale section'
      );
      assert.ok(
        content.includes('Authorization: Bearer'),
        'Doc must explain Bearer token custom header mechanics'
      );
      assert.ok(
        content.includes('ambient'),
        'Doc must document the distinction with browser ambient credentials'
      );
      assert.ok(content.includes('SEC-05'), 'Doc must reference SEC-05 compliance');
    });
  });

  /* =========================================================================
   * AC-2: Security Headers & CSP (SEC-01, SEC-03)
   * ========================================================================= */
  describe('AC-2: Security Headers & Content Security Policy (SEC-01, SEC-03)', () => {
    it('generates strict Content-Security-Policy with required directives', () => {
      const csp = buildContentSecurityPolicy();

      assert.ok(csp.includes("default-src 'self'"), 'CSP must restrict default-src to self');
      assert.ok(
        csp.includes("frame-ancestors 'none'"),
        'CSP must block framing (anti-clickjacking)'
      );
      assert.ok(csp.includes("object-src 'none'"), 'CSP must disallow plugins/objects');
      assert.ok(csp.includes("base-uri 'self'"), 'CSP must restrict base-uri');
      assert.ok(csp.includes("form-action 'self'"), 'CSP must restrict form actions');
      assert.ok(csp.includes('https://images.unsplash.com'), 'CSP must allow approved image CDN');
      assert.ok(csp.includes('https://res.cloudinary.com'), 'CSP must allow Cloudinary CDN');
      assert.ok(csp.includes('https://fonts.googleapis.com'), 'CSP must allow Google Fonts CSS');
    });

    it('enforces frame protection via X-Frame-Options: DENY', () => {
      const headers = getSecurityHeaders({ isProduction: false });
      const frameHeader = headers.find((h) => h.key === 'X-Frame-Options');

      assert.ok(frameHeader, 'X-Frame-Options must be present');
      assert.strictEqual(frameHeader.value, 'DENY', 'Frame protection must be set to DENY');
    });

    it('enforces MIME sniffing protection via X-Content-Type-Options: nosniff', () => {
      const headers = getSecurityHeaders();
      const nosniff = headers.find((h) => h.key === 'X-Content-Type-Options');

      assert.ok(nosniff, 'X-Content-Type-Options must be present');
      assert.strictEqual(nosniff.value, 'nosniff');
    });

    it('includes Strict-Transport-Security (HSTS) in production', () => {
      const prodHeaders = getSecurityHeaders({ isProduction: true });
      const hstsHeader = prodHeaders.find((h) => h.key === 'Strict-Transport-Security');

      assert.ok(hstsHeader, 'HSTS must be enabled in production');
      assert.ok(
        hstsHeader.value.includes('max-age=63072000'),
        'HSTS max-age must be at least 1 year (63072000)'
      );
      assert.ok(hstsHeader.value.includes('includeSubDomains'), 'HSTS must includeSubDomains');
      assert.ok(hstsHeader.value.includes('preload'), 'HSTS must include preload');

      const devHeaders = getSecurityHeaders({ isProduction: false });
      const devHsts = devHeaders.find((h) => h.key === 'Strict-Transport-Security');
      assert.strictEqual(
        devHsts,
        undefined,
        'HSTS should be omitted in development to allow local HTTP'
      );
    });

    it('next.config.ts configures security headers on all routes', () => {
      const configSource = fs.readFileSync(path.join(process.cwd(), 'next.config.ts'), 'utf8');

      assert.ok(
        configSource.includes('async headers()'),
        'next.config.ts must export async headers()'
      );
      assert.ok(configSource.includes('Content-Security-Policy'), 'next.config.ts must set CSP');
      assert.ok(
        configSource.includes('X-Frame-Options'),
        'next.config.ts must set X-Frame-Options'
      );
      assert.ok(
        configSource.includes('X-Content-Type-Options'),
        'next.config.ts must set X-Content-Type-Options'
      );
      assert.ok(configSource.includes('Strict-Transport-Security'), 'next.config.ts must set HSTS');
    });
  });

  /* =========================================================================
   * AC-3: Shared Validation & Input Sanitisation Layer (SEC-02)
   * ========================================================================= */
  describe('AC-3: Shared Validation & Input Sanitisation Layer (SEC-02)', () => {
    it('sanitizeHtml disarms script tags, iframes, inline event handlers, and javascript: URIs', () => {
      const payload = `
        <p>Valid intro</p>
        <script>alert("hacked")</script>
        <iframe src="https://attacker.com"></iframe>
        <a href="javascript:steal()">Click me</a>
        <img src="valid.png" onerror="stealData()" />
        <strong>Safe bold</strong>
      `;

      const clean = sanitizeHtml(payload);
      assert.strictEqual(clean.includes('<script'), false);
      assert.strictEqual(clean.includes('<iframe'), false);
      assert.strictEqual(clean.includes('javascript:'), false);
      assert.strictEqual(clean.includes('onerror'), false);
      assert.strictEqual(clean.includes('alert'), false);
      assert.ok(clean.includes('<p>Valid intro</p>'));
      assert.ok(clean.includes('<strong>Safe bold</strong>'));
    });

    it('sanitizeText strips tags, entity-encodes special characters, and truncates length', () => {
      const dirty = `<b>Hello</b> <script>alert(1)</script> "O'Reilly" & Sons`;
      const clean = sanitizeText(dirty, 50);

      assert.strictEqual(clean.includes('<'), false);
      assert.strictEqual(clean.includes('>'), false);
      assert.ok(clean.includes('&quot;'));
      assert.ok(clean.includes('&#39;'));
      assert.ok(clean.includes('&amp;'));
      assert.ok(clean.length <= 50);
    });

    it('sanitizeSearchQuery cleans keyword searches against XSS', () => {
      const query = sanitizeSearchQuery("<script>alert('xss')</script>Cataract");
      assert.strictEqual(query, 'Cataract');
    });

    it('sanitizeSlug produces normalized URL-safe strings', () => {
      assert.strictEqual(
        sanitizeSlug('Annual Cataract & Vision Camp 2026!'),
        'annual-cataract-vision-camp-2026'
      );
      assert.strictEqual(sanitizeSlug('---multiple---dashes---'), 'multiple-dashes');
      assert.strictEqual(sanitizeSlug('Special_Chars@#$123'), 'special-chars123');
    });

    it('sanitizeEmail validates format and returns normalized lowercase email', () => {
      assert.strictEqual(sanitizeEmail('  Officer@LionsClub.Org  '), 'officer@lionsclub.org');
      assert.strictEqual(sanitizeEmail('invalid-email-address'), null);
      assert.strictEqual(sanitizeEmail(''), null);
      assert.strictEqual(sanitizeEmail(null), null);
    });

    it('sanitizePhoneNumber strips unwanted characters safely', () => {
      assert.strictEqual(sanitizePhoneNumber('+94 (45) 228-7200 <script>'), '+94 (45) 228-7200');
    });

    it('sanitizeObject disarms Prototype Pollution vectors recursively', () => {
      const maliciousPayload = {
        title: '<b>Community Clean</b>',
        description: '<script>alert(1)</script>Description',
        nested: {
          name: 'Child <tag>',
        },
      };

      // Attempt injection of dangerous keys
      maliciousPayload['__proto__'] = { polluted: true };
      maliciousPayload['constructor'] = { polluted: true };

      const clean = sanitizeObject(maliciousPayload);
      assert.strictEqual(Object.prototype.hasOwnProperty.call(clean, '__proto__'), false);
      assert.strictEqual(Object.prototype.hasOwnProperty.call(clean, 'constructor'), false);
      assert.strictEqual({}.polluted, undefined, 'Global prototype must not be polluted');
      assert.strictEqual(clean.description.includes('<script'), false);
    });

    it('assertParameterizedQuery verifies placeholder alignment with parameter count', () => {
      // Correct parameterization
      assert.doesNotThrow(() => {
        assertParameterizedQuery('SELECT * FROM projects WHERE slug = ? AND status = ?', [
          'test-slug',
          'PUBLISHED',
        ]);
      });

      // Mismatched parameters must throw policy violation
      assert.throws(() => {
        assertParameterizedQuery('SELECT * FROM projects WHERE slug = ? AND status = ?', [
          'only-one-param',
        ]);
      }, /SEC-02 Policy Violation/);
    });

    it('verifies that all repository queries across the codebase use parameterised statements', () => {
      const repoFiles = [
        'src/lib/projects-repository.ts',
        'src/lib/news-repository.ts',
        'src/lib/board-repository.ts',
      ];

      for (const file of repoFiles) {
        const fullPath = path.join(process.cwd(), file);
        if (!fs.existsSync(fullPath)) continue;
        const code = fs.readFileSync(fullPath, 'utf8');

        // Look for dangerous SQL patterns: string concatenation inside query() or db.prepare()
        const dangerousConcat = /query\s*\(\s*`[^`]*\$\{/g;
        assert.strictEqual(
          dangerousConcat.test(code),
          false,
          `${file} must not use template string variable concatenation inside query calls`
        );
      }
    });
  });

  /* =========================================================================
   * AC-4: Safe Error Responses (SEC-02, NFR-04)
   * ========================================================================= */
  describe('AC-4: Production Safe Error Responses & Logging (SEC-02, NFR-04)', () => {
    it('formatSafeErrorForClient returns generic message in production', () => {
      const rawError = new Error(
        'SQLITE_ERROR: no such table: secret_table near "SELECT": syntax error'
      );
      const safeResponse = formatSafeErrorForClient(
        rawError,
        'Unable to load requested resources. Please try again later.',
        true // isProduction = true
      );

      assert.strictEqual(safeResponse.success, false);
      assert.strictEqual(
        safeResponse.error,
        'Unable to load requested resources. Please try again later.'
      );
      assert.ok(safeResponse.trackingId, 'Safe error response must provide a tracking ID');

      // Verify zero leak of SQL, table names, or technical error strings
      assert.strictEqual(safeResponse.error.includes('SQLITE'), false);
      assert.strictEqual(safeResponse.error.includes('secret_table'), false);
      assert.strictEqual(safeResponse.error.includes('syntax error'), false);
      assert.strictEqual(safeResponse.details, undefined, 'Details must be omitted in production');
    });

    it('formatSafeErrorForClient attaches details in development for debugging', () => {
      const devError = new Error('Database connection timed out');
      const devResponse = formatSafeErrorForClient(devError, 'Default message', false);

      assert.strictEqual(devResponse.success, false);
      assert.strictEqual(devResponse.error, 'Database connection timed out');
      assert.ok(devResponse.trackingId);
      assert.ok(devResponse.details);
    });

    it('Express errorHandler sanitizes production responses and blocks SQL leaks', () => {
      const middlewareSource = fs.readFileSync(
        path.join(process.cwd(), 'server/middleware/errorHandler.ts'),
        'utf8'
      );

      assert.ok(
        middlewareSource.includes('containsTechnicalSqlDetails'),
        'Express error handler must detect and sanitize SQL details'
      );
      assert.ok(
        middlewareSource.includes('isProduction'),
        'Express error handler must distinguish production environments'
      );
      assert.ok(
        middlewareSource.includes('trackingId'),
        'Express error handler must generate tracking ID for server correlation'
      );
      assert.ok(
        middlewareSource.includes("isProduction ? '' : err.stack"),
        'Express error handler must log stack server-side and suppress in production payload'
      );
    });

    it('client error boundary components exist without leaking stack traces', () => {
      const errorBoundaries = [
        'src/app/error.tsx',
        'src/app/projects/error.tsx',
        'src/app/news/error.tsx',
        'src/app/board/error.tsx',
      ];

      for (const boundary of errorBoundaries) {
        const fullPath = path.join(process.cwd(), boundary);
        assert.ok(fs.existsSync(fullPath), `${boundary} must exist`);

        const code = fs.readFileSync(fullPath, 'utf8');
        assert.ok(code.includes("'use client'"), `${boundary} must be a client component`);
        assert.ok(code.includes('console.error'), `${boundary} must log error details securely`);
        assert.strictEqual(
          code.includes('error.stack'),
          false,
          `${boundary} must not render error.stack to DOM`
        );
      }
    });
  });
});
