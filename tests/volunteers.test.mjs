/**
 * tests/volunteers.test.mjs
 * Automated Test Suite for Prospective Volunteer Registration [LBW-51]
 *
 * Story: LBW-51 - Prospective volunteer registration public form
 * Acceptance Criteria Covered:
 *   - AC1: Valid submissions (name, email, phone, interest, message) stored with timestamp and status "New"
 *   - AC2: Invalid submissions rejected server-side with clear field-level messages; client-side validation guides user
 *   - AC3: Input is sanitised; length limits are enforced
 *   - AC4: Duplicate rapid re-submissions (same email within short window) handled with friendly message
 *   - AC5: Clear success message shown after submission
 *   - AC6: Personal data readable only by authorised administrators via CMS
 *
 * Security Standard: SEC-01 (Privacy Protection), SEC-02 (Input Validation & Parameterised Queries)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  validateVolunteerInput,
} from '../src/lib/volunteers-validation.ts';

import {
  saveVolunteerApplication,
  isRapidDuplicateSubmission,
  getVolunteerApplications,
} from '../src/lib/volunteers-repository.ts';

import { POST, GET as publicGet } from '../src/app/api/volunteer/route.ts';
import { GET as adminGet } from '../src/app/api/admin/submissions/volunteers/route.ts';
import { signSessionToken } from '../src/lib/auth/session.ts';

const TEST_SECRET = 'balangoda-dev-session-signing-secret-key-32chars!';

const VALID_INPUT = {
  fullName: 'Kasun Bandara',
  email: 'kasun.bandara@example.com',
  phoneNumber: '+94 77 456 7890',
  areaOfInterest: 'Vision Care & Healthcare',
  motivationStatement: 'I am an optometry student eager to support eye testing camps in Balangoda.',
};

describe('Prospective Volunteer Registration Test Suite [LBW-51]', () => {
  // ── AC1: Valid submissions stored with timestamp and status "New" ─────────
  describe('AC1: Valid Submissions Intake & "New" Status Lifecycle', () => {
    it('validates a complete, compliant volunteer registration payload', () => {
      const result = validateVolunteerInput(VALID_INPUT);
      assert.strictEqual(result.isValid, true);
      assert.deepStrictEqual(result.errors, {});
      assert.strictEqual(result.sanitizedData.fullName, 'Kasun Bandara');
      assert.strictEqual(result.sanitizedData.email, 'kasun.bandara@example.com');
      assert.strictEqual(result.sanitizedData.areaOfInterest, 'Vision Care & Healthcare');
    });

    it('persists valid application with status "New" and ISO timestamp', async () => {
      const uniqueEmail = `volunteer_${Date.now()}@example.com`;
      const input = { ...VALID_INPUT, email: uniqueEmail };

      const saveResult = await saveVolunteerApplication(input);
      assert.strictEqual(saveResult.success, true);
      assert.strictEqual(saveResult.isDuplicate, false);
      assert.ok(saveResult.applicationId, 'Must return assigned application ID');

      // Verify stored record in database
      const applications = getVolunteerApplications(10, 0);
      const saved = applications.find((a) => a.applicationId === saveResult.applicationId);

      assert.ok(saved, 'Saved application must be retrievable from repository');
      assert.strictEqual(saved.status, 'New');
      assert.strictEqual(saved.fullName, 'Kasun Bandara');
      assert.strictEqual(saved.email, uniqueEmail);
      assert.strictEqual(saved.areaOfInterest, 'Vision Care & Healthcare');
      assert.ok(saved.submittedAt, 'Must have submitted_at timestamp');
    });

    it('API POST /api/volunteer returns 201 Created and reference ID', async () => {
      const uniqueEmail = `api_volunteer_${Date.now()}@example.com`;
      const req = new Request('https://portal.balangodalions.org/api/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...VALID_INPUT, email: uniqueEmail }),
      });

      const res = await POST(req);
      assert.strictEqual(res.status, 201);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.applicationId);
      assert.ok(json.message.includes('received successfully'));
    });
  });

  // ── AC2: Field-Level Validation Messages ──────────────────────────────────
  describe('AC2: Field-Level Validation Rejection & User Guidance', () => {
    it('rejects empty or missing full name with clear field-level error', () => {
      const result = validateVolunteerInput({ ...VALID_INPUT, fullName: '  ' });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.fullName?.includes('Full name is required'));
    });

    it('rejects full name shorter than 2 characters', () => {
      const result = validateVolunteerInput({ ...VALID_INPUT, fullName: 'A' });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.fullName?.includes('at least 2 characters'));
    });

    it('rejects missing or malformed email address with RFC 5322 guidance', () => {
      const missingEmail = validateVolunteerInput({ ...VALID_INPUT, email: '' });
      assert.strictEqual(missingEmail.isValid, false);
      assert.ok(missingEmail.errors.email?.includes('Email address is required'));

      const invalidEmail = validateVolunteerInput({ ...VALID_INPUT, email: 'not-an-email' });
      assert.strictEqual(invalidEmail.isValid, false);
      assert.ok(invalidEmail.errors.email?.includes('valid email address'));
    });

    it('rejects missing or invalid telephone numbers', () => {
      const missingPhone = validateVolunteerInput({ ...VALID_INPUT, phoneNumber: '' });
      assert.strictEqual(missingPhone.isValid, false);
      assert.ok(missingPhone.errors.phoneNumber?.includes('Phone number is required'));

      const invalidPhone = validateVolunteerInput({ ...VALID_INPUT, phoneNumber: 'abc-call-me' });
      assert.strictEqual(invalidPhone.isValid, false);
      assert.ok(invalidPhone.errors.phoneNumber?.includes('valid phone number'));
    });

    it('rejects missing area of interest', () => {
      const missingArea = validateVolunteerInput({ ...VALID_INPUT, areaOfInterest: '' });
      assert.strictEqual(missingArea.isValid, false);
      assert.ok(missingArea.errors.areaOfInterest?.includes('select your area'));
    });

    it('API POST /api/volunteer returns 400 Bad Request with structured field errors', async () => {
      const req = new Request('https://portal.balangodalions.org/api/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: '', email: 'bad-email' }),
      });

      const res = await POST(req);
      assert.strictEqual(res.status, 400);

      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error, 'ValidationError');
      assert.ok(json.errors.fullName);
      assert.ok(json.errors.email);
    });
  });

  // ── AC3: Input Sanitisation & Length Limits ───────────────────────────────
  describe('AC3: Input Sanitisation & Length Limits Enforced', () => {
    it('sanitises XSS script tags and HTML injection from all inputs', () => {
      const maliciousInput = {
        fullName: 'Dr. John <script>alert("xss")</script>Smith',
        email: 'john.smith@example.com',
        phoneNumber: '+94 77 123 4567',
        areaOfInterest: 'Vision Care <img src=x onerror=alert(1)>',
        motivationStatement: 'Hello <script src="evil.js"></script>World<b>Bold</b>',
      };

      const result = validateVolunteerInput(maliciousInput);
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.sanitizedData.fullName, 'Dr. John Smith');
      assert.strictEqual(result.sanitizedData.areaOfInterest, 'Vision Care');
      assert.strictEqual(result.sanitizedData.motivationStatement, 'Hello WorldBold');
    });

    it('enforces maximum length limits on full name (150 chars)', () => {
      const longName = 'A'.repeat(151);
      const result = validateVolunteerInput({ ...VALID_INPUT, fullName: longName });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.fullName?.includes('cannot exceed 150 characters'));
    });

    it('enforces maximum length limits on email (255 chars)', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = validateVolunteerInput({ ...VALID_INPUT, email: longEmail });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.email?.includes('cannot exceed 255 characters'));
    });

    it('enforces maximum length limits on motivation message (2,000 chars)', () => {
      const longMessage = 'M'.repeat(2001);
      const result = validateVolunteerInput({ ...VALID_INPUT, motivationStatement: longMessage });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.motivationStatement?.includes('cannot exceed 2,000 characters'));
    });
  });

  // ── AC4: Duplicate Rapid Re-submissions (Rate Limiting) ────────────────────
  describe('AC4: Duplicate Rapid Re-submissions Handling', () => {
    it('identifies duplicate rapid re-submission for same email within window', async () => {
      const rapidEmail = `rapid_submitter_${Date.now()}@example.com`;
      const input = { ...VALID_INPUT, email: rapidEmail };

      // First submission succeeds
      const firstSave = await saveVolunteerApplication(input);
      assert.strictEqual(firstSave.success, true);
      assert.strictEqual(firstSave.isDuplicate, false);

      // Rapid re-submission (same email immediately after)
      assert.strictEqual(isRapidDuplicateSubmission(rapidEmail), true);

      const secondSave = await saveVolunteerApplication(input);
      assert.strictEqual(secondSave.success, false);
      assert.strictEqual(secondSave.isDuplicate, true);
      assert.ok(secondSave.message.includes('already submitted a volunteer application recently'));
    });

    it('API returns 429 Too Many Requests with friendly duplicate advisory', async () => {
      const rapidEmail = `api_rapid_${Date.now()}@example.com`;
      const payload = JSON.stringify({ ...VALID_INPUT, email: rapidEmail });

      // First API call succeeds
      const req1 = new Request('https://portal.balangodalions.org/api/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      const res1 = await POST(req1);
      assert.strictEqual(res1.status, 201);

      // Second immediate API call returns 429
      const req2 = new Request('https://portal.balangodalions.org/api/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      const res2 = await POST(req2);
      assert.strictEqual(res2.status, 429);

      const json2 = await res2.json();
      assert.strictEqual(json2.success, false);
      assert.strictEqual(json2.duplicate, true);
      assert.ok(json2.message.includes('already submitted'));
    });
  });

  // ── AC5: Clear Success Message Shown ─────────────────────────────────────
  describe('AC5: Clear Success Feedback & Acknowledgement', () => {
    it('returns informative, appreciative success message', async () => {
      const uniqueEmail = `grateful_volunteer_${Date.now()}@example.com`;
      const result = await saveVolunteerApplication({ ...VALID_INPUT, email: uniqueEmail });

      assert.strictEqual(result.success, true);
      assert.ok(result.message.includes('Thank you for volunteering with Lions Club of Balangoda'));
      assert.ok(result.message.includes('Our team will review your application and reach out'));
    });
  });

  // ── AC6: Personal Data Confidentiality (SEC-01) ───────────────────────────
  describe('AC6: Personal Data Privacy & Restricted Access (SEC-01)', () => {
    it('public GET /api/volunteer is blocked (405 Method Not Allowed)', async () => {
      const res = await publicGet();
      assert.strictEqual(res.status, 405);

      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.ok(json.message.includes('confidential personal data'));
    });

    it('unauthenticated GET to admin submissions endpoint is rejected (401)', async () => {
      const unauthReq = new Request(
        'https://portal.balangodalions.org/api/admin/submissions/volunteers'
      );
      const res = await adminGet(unauthReq);
      assert.strictEqual(res.status, 401);
    });

    it('authorized administrator can inspect volunteer applications', async () => {
      const adminToken = await signSessionToken(
        {
          userId: 'usr_admin',
          username: 'admin',
          email: 'admin@balangodalions.org',
          fullName: 'Club Secretary',
          role: 'ADMIN',
        },
        TEST_SECRET
      );

      const authReq = new Request(
        'https://portal.balangodalions.org/api/admin/submissions/volunteers',
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      const res = await adminGet(authReq);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(Array.isArray(json.data));
    });
  });

  // ── AC7: UI Accessibility & Mobile Responsiveness ─────────────────────────
  describe('AC7: UI Accessibility & Mobile Layout Safety', () => {
    const pagePath = path.join(process.cwd(), 'src', 'app', 'volunteer', 'page.tsx');

    it('volunteer registration page exists with required semantic form elements', () => {
      assert.ok(fs.existsSync(pagePath), 'src/app/volunteer/page.tsx must exist');
      const content = fs.readFileSync(pagePath, 'utf8');

      assert.ok(content.includes('<form'), 'Must render HTML form');
      assert.ok(content.includes('id="fullName"'), 'Must render fullName input');
      assert.ok(content.includes('id="email"'), 'Must render email input');
      assert.ok(content.includes('id="phoneNumber"'), 'Must render phoneNumber input');
      assert.ok(content.includes('id="areaOfInterest"'), 'Must render areaOfInterest select');
      assert.ok(content.includes('id="motivationStatement"'), 'Must render motivation textarea');
    });

    it('UI includes clear privacy notice and accessible error bindings', () => {
      const content = fs.readFileSync(pagePath, 'utf8');

      assert.ok(content.includes('Privacy Assurance'), 'Must include privacy assurance notice');
      assert.ok(content.includes('role="alert"'), 'Errors must declare role=alert for screen readers');
      assert.ok(content.includes('isSuccess'), 'Must include success confirmation state');
    });
  });
});
