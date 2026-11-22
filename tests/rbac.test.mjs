/**
 * tests/rbac.test.mjs
 * Automated Test Suite for Role-Based Access Control (RBAC) [LBW-39]
 *
 * Story: LBW-39 - Role-based access control (administrator and editor)
 * Acceptance Criteria Covered:
 *   - AC1: Roles Administrator and Editor exist; permissions per operation are documented
 *   - AC2: Unauthenticated requests to /admin routes & APIs rejected (401) and UI redirects to login
 *   - AC3: User without required role receives 403 Forbidden on restricted operations
 *   - AC4: Authorization is enforced on the server, not solely by hiding UI
 *   - AC5: Error responses contain no stack traces or internal implementation details
 *
 * Security Standard: SEC-02, SEC-04
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  USER_ROLES,
  ROLE_DEFINITIONS,
  hasPermission,
  satisfiesRole,
} from '../src/types/rbac.ts';

import {
  signSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
} from '../src/lib/auth/session.ts';

import {
  requireAuth,
  requireRole,
  requirePermission,
  createDefensiveAuthResponse,
  extractToken,
} from '../src/lib/auth/guards.ts';

import { middleware } from '../src/middleware.ts';
import { NextRequest } from 'next/server.js';

const TEST_SECRET = 'super-secret-test-key-minimum-32-characters-long!';

const MOCK_ADMIN = {
  userId: 'usr_admin_test',
  username: 'admin',
  email: 'admin@balangodalions.org',
  fullName: 'Test Administrator',
  role: 'ADMIN',
};

const MOCK_EDITOR = {
  userId: 'usr_editor_test',
  username: 'editor',
  email: 'editor@balangodalions.org',
  fullName: 'Test Content Editor',
  role: 'EDITOR',
};

describe('Role-Based Access Control (RBAC) Test Suite [LBW-39]', () => {
  // ── AC1: Roles Administrator and Editor exist with documented permissions ─
  describe('AC1: Roles & Documented Permission Matrix', () => {
    it('declares exactly Administrator and Editor roles in system', () => {
      assert.deepStrictEqual(USER_ROLES, ['ADMIN', 'EDITOR']);
      assert.ok(ROLE_DEFINITIONS.ADMIN, 'Administrator role definition must exist');
      assert.ok(ROLE_DEFINITIONS.EDITOR, 'Editor role definition must exist');
      assert.strictEqual(ROLE_DEFINITIONS.ADMIN.label, 'Administrator');
      assert.strictEqual(ROLE_DEFINITIONS.EDITOR.label, 'Editor');
    });

    it('Administrator possesses full destructive permissions (DELETE)', () => {
      assert.strictEqual(hasPermission('ADMIN', 'PROJECTS', 'DELETE'), true);
      assert.strictEqual(hasPermission('ADMIN', 'NEWS', 'DELETE'), true);
      assert.strictEqual(hasPermission('ADMIN', 'BOARD', 'DELETE'), true);
      assert.strictEqual(hasPermission('ADMIN', 'VOLUNTEERS', 'DELETE'), true);
    });

    it('Editor is strictly denied destructive content deletion (DELETE)', () => {
      assert.strictEqual(hasPermission('EDITOR', 'PROJECTS', 'DELETE'), false);
      assert.strictEqual(hasPermission('EDITOR', 'NEWS', 'DELETE'), false);
      assert.strictEqual(hasPermission('EDITOR', 'BOARD', 'DELETE'), false);
      assert.strictEqual(hasPermission('EDITOR', 'VOLUNTEERS', 'DELETE'), false);
    });

    it('Editor can create, update, and publish content', () => {
      assert.strictEqual(hasPermission('EDITOR', 'PROJECTS', 'CREATE'), true);
      assert.strictEqual(hasPermission('EDITOR', 'PROJECTS', 'UPDATE'), true);
      assert.strictEqual(hasPermission('EDITOR', 'PROJECTS', 'PUBLISH'), true);
      assert.strictEqual(hasPermission('EDITOR', 'NEWS', 'CREATE'), true);
      assert.strictEqual(hasPermission('EDITOR', 'NEWS', 'UPDATE'), true);
      assert.strictEqual(hasPermission('EDITOR', 'NEWS', 'PUBLISH'), true);
    });

    it('Only Administrator can export volunteer and inquiry submissions (CSV)', () => {
      assert.strictEqual(hasPermission('ADMIN', 'VOLUNTEERS', 'EXPORT'), true);
      assert.strictEqual(hasPermission('ADMIN', 'INQUIRIES', 'EXPORT'), true);
      assert.strictEqual(hasPermission('EDITOR', 'VOLUNTEERS', 'EXPORT'), false);
      assert.strictEqual(hasPermission('EDITOR', 'INQUIRIES', 'EXPORT'), false);
    });

    it('Only Administrator can manage system users and settings', () => {
      assert.strictEqual(hasPermission('ADMIN', 'USERS', 'MANAGE'), true);
      assert.strictEqual(hasPermission('ADMIN', 'SETTINGS', 'MANAGE'), true);
      assert.strictEqual(hasPermission('EDITOR', 'USERS', 'MANAGE'), false);
      assert.strictEqual(hasPermission('EDITOR', 'SETTINGS', 'MANAGE'), false);
    });

    it('satisfiesRole correctly evaluates role hierarchy', () => {
      assert.strictEqual(satisfiesRole('ADMIN', 'ADMIN'), true);
      assert.strictEqual(satisfiesRole('ADMIN', 'EDITOR'), true); // Admin satisfies Editor
      assert.strictEqual(satisfiesRole('EDITOR', 'EDITOR'), true);
      assert.strictEqual(satisfiesRole('EDITOR', 'ADMIN'), false); // Editor cannot satisfy Admin
    });
  });

  // ── AC2: Unauthenticated Requests Rejected (401) and UI Redirects ──────────
  describe('AC2: Unauthenticated Request Rejection (401) & Login Redirection', () => {
    it('requireAuth rejects request with missing token as 401 Unauthorized', async () => {
      const emptyReq = new Request('https://portal.balangodalions.org/api/admin/projects');
      const result = await requireAuth(emptyReq);

      assert.strictEqual(result.user, null);
      assert.ok(result.errorResponse);
      assert.strictEqual(result.errorResponse.status, 401);

      const json = await result.errorResponse.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error, 'Unauthorized');
      assert.ok(json.message.includes('Authentication required'));
    });

    it('requireAuth rejects expired session tokens with 401 Unauthorized', async () => {
      // Create token expired 10 seconds ago
      const expiredToken = await signSessionToken(MOCK_ADMIN, TEST_SECRET, -10);
      const req = new Request('https://portal.balangodalions.org/api/admin/projects', {
        headers: { Authorization: `Bearer ${expiredToken}` },
      });

      // Set environment secret temporarily
      const originalSecret = process.env.NEXTAUTH_SECRET;
      process.env.NEXTAUTH_SECRET = TEST_SECRET;

      try {
        const result = await requireAuth(req);
        assert.strictEqual(result.user, null);
        assert.strictEqual(result.errorResponse?.status, 401);
      } finally {
        process.env.NEXTAUTH_SECRET = originalSecret;
      }
    });

    it('requireAuth rejects forged or malformed tokens with 401', async () => {
      const forgedReq = new Request('https://portal.balangodalions.org/api/admin/projects', {
        headers: { Authorization: 'Bearer forged.malicious.token' },
      });
      const result = await requireAuth(forgedReq);
      assert.strictEqual(result.user, null);
      assert.strictEqual(result.errorResponse?.status, 401);
    });

    it('Middleware rejects unauthenticated API request with 401 JSON', async () => {
      const req = new NextRequest('https://portal.balangodalions.org/api/admin/users');
      const res = await middleware(req);

      assert.strictEqual(res.status, 401);
      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error, 'Unauthorized');
    });

    it('Middleware redirects unauthenticated web page navigation to /admin/login?redirect=...', async () => {
      const req = new NextRequest('https://portal.balangodalions.org/admin/projects');
      const res = await middleware(req);

      assert.strictEqual(res.status, 307); // Next.js redirect
      const location = res.headers.get('location');
      assert.ok(location?.includes('/admin/login'), 'Must redirect to login page');
      assert.ok(location?.includes('redirect=%2Fadmin%2Fprojects'), 'Must preserve redirect path');
    });
  });

  // ── AC3: Insufficient Role Rejection (403 Forbidden) ──────────────────────
  describe('AC3: Role Enforcement (403 Forbidden)', () => {
    it('Editor receives 403 Forbidden when calling requireRole("ADMIN")', async () => {
      const originalSecret = process.env.NEXTAUTH_SECRET;
      process.env.NEXTAUTH_SECRET = TEST_SECRET;

      try {
        const editorToken = await signSessionToken(MOCK_EDITOR, TEST_SECRET);
        const req = new Request('https://portal.balangodalions.org/api/admin/users', {
          headers: { Authorization: `Bearer ${editorToken}` },
        });

        const result = await requireRole(req, 'ADMIN');
        assert.strictEqual(result.user?.role, 'EDITOR');
        assert.ok(result.errorResponse);
        assert.strictEqual(result.errorResponse.status, 403);

        const json = await result.errorResponse.json();
        assert.strictEqual(json.success, false);
        assert.strictEqual(json.error, 'Forbidden');
        assert.ok(json.message.includes('Administrator privileges'));
      } finally {
        process.env.NEXTAUTH_SECRET = originalSecret;
      }
    });

    it('Editor receives 403 Forbidden when attempting destructive deletion (PROJECTS:DELETE)', async () => {
      const originalSecret = process.env.NEXTAUTH_SECRET;
      process.env.NEXTAUTH_SECRET = TEST_SECRET;

      try {
        const editorToken = await signSessionToken(MOCK_EDITOR, TEST_SECRET);
        const req = new Request('https://portal.balangodalions.org/api/admin/projects/proj_001', {
          headers: { Authorization: `Bearer ${editorToken}` },
        });

        const result = await requirePermission(req, 'PROJECTS', 'DELETE');
        assert.strictEqual(result.errorResponse?.status, 403);

        const json = await result.errorResponse.json();
        assert.strictEqual(json.error, 'Forbidden');
        assert.ok(json.message.includes('not authorized to delete projects'));
      } finally {
        process.env.NEXTAUTH_SECRET = originalSecret;
      }
    });

    it('Editor receives 403 Forbidden when attempting CSV export (VOLUNTEERS:EXPORT)', async () => {
      const originalSecret = process.env.NEXTAUTH_SECRET;
      process.env.NEXTAUTH_SECRET = TEST_SECRET;

      try {
        const editorToken = await signSessionToken(MOCK_EDITOR, TEST_SECRET);
        const req = new Request('https://portal.balangodalions.org/api/admin/submissions/export', {
          headers: { Authorization: `Bearer ${editorToken}` },
        });

        const result = await requirePermission(req, 'VOLUNTEERS', 'EXPORT');
        assert.strictEqual(result.errorResponse?.status, 403);
      } finally {
        process.env.NEXTAUTH_SECRET = originalSecret;
      }
    });

    it('Administrator is successfully authorized for destructive operations', async () => {
      const originalSecret = process.env.NEXTAUTH_SECRET;
      process.env.NEXTAUTH_SECRET = TEST_SECRET;

      try {
        const adminToken = await signSessionToken(MOCK_ADMIN, TEST_SECRET);
        const req = new Request('https://portal.balangodalions.org/api/admin/projects/proj_001', {
          headers: { Authorization: `Bearer ${adminToken}` },
        });

        const result = await requirePermission(req, 'PROJECTS', 'DELETE');
        assert.strictEqual(result.errorResponse, null);
        assert.strictEqual(result.user?.role, 'ADMIN');
      } finally {
        process.env.NEXTAUTH_SECRET = originalSecret;
      }
    });

    it('Editor is successfully authorized for permitted editing operations', async () => {
      const originalSecret = process.env.NEXTAUTH_SECRET;
      process.env.NEXTAUTH_SECRET = TEST_SECRET;

      try {
        const editorToken = await signSessionToken(MOCK_EDITOR, TEST_SECRET);
        const req = new Request('https://portal.balangodalions.org/api/admin/projects/proj_001', {
          headers: { Authorization: `Bearer ${editorToken}` },
        });

        const result = await requirePermission(req, 'PROJECTS', 'UPDATE');
        assert.strictEqual(result.errorResponse, null);
        assert.strictEqual(result.user?.role, 'EDITOR');
      } finally {
        process.env.NEXTAUTH_SECRET = originalSecret;
      }
    });
  });

  // ── AC4: Server-Side Cryptographic Enforcement ────────────────────────────
  describe('AC4: Server-Side Cryptographic Enforcement', () => {
    it('tampering with the JWT payload invalidates cryptographic signature', async () => {
      const validToken = await signSessionToken(MOCK_EDITOR, TEST_SECRET);
      const [header, payload, signature] = validToken.split('.');

      // Attacker attempts privilege escalation by replacing 'EDITOR' with 'ADMIN' in payload
      const decodedPayload = JSON.parse(
        Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
      );
      decodedPayload.rol = 'ADMIN';

      const tamperedPayload = Buffer.from(JSON.stringify(decodedPayload))
        .toString('base64url');

      const forgedToken = `${header}.${tamperedPayload}.${signature}`;

      // Server-side verification MUST reject tampered token
      const verified = await verifySessionToken(forgedToken, TEST_SECRET);
      assert.strictEqual(verified, null, 'Server must reject forged signature');
    });

    it('tokens signed with a different secret are rejected', async () => {
      const foreignSecret = 'an-attacker-crafted-secret-key-32chars!';
      const foreignToken = await signSessionToken(MOCK_ADMIN, foreignSecret);

      const verified = await verifySessionToken(foreignToken, TEST_SECRET);
      assert.strictEqual(verified, null, 'Server must reject tokens signed with untrusted secret');
    });

    it('extractToken correctly parses both Bearer headers and HTTP cookies', async () => {
      const token = await signSessionToken(MOCK_ADMIN, TEST_SECRET);

      // Bearer header
      const bearerReq = new Request('https://portal.balangodalions.org/api', {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert.strictEqual(extractToken(bearerReq), token);

      // Cookie
      const cookieReq = new Request('https://portal.balangodalions.org/api', {
        headers: { Cookie: `theme=dark; ${SESSION_COOKIE_NAME}=${token}; other=1` },
      });
      assert.strictEqual(extractToken(cookieReq), token);
    });
  });

  // ── AC5: Defensive Error Handling (Zero Stack Traces / Internals) ──────────
  describe('AC5: Defensive Error Handling (No Stack Traces or Internals)', () => {
    it('401 response contains strictly sanitized JSON without internal details', async () => {
      const res = createDefensiveAuthResponse(401);
      assert.strictEqual(res.status, 401);

      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error, 'Unauthorized');

      // Verify zero leak of stack traces, sql, or internal file paths
      const serialized = JSON.stringify(json);
      assert.strictEqual(serialized.includes('stack'), false);
      assert.strictEqual(serialized.includes('at '), false);
      assert.strictEqual(serialized.includes('node_modules'), false);
      assert.strictEqual(serialized.includes('SELECT'), false);
    });

    it('403 response contains strictly sanitized JSON without internal details', async () => {
      const res = createDefensiveAuthResponse(403);
      assert.strictEqual(res.status, 403);

      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error, 'Forbidden');

      const serialized = JSON.stringify(json);
      assert.strictEqual(serialized.includes('stack'), false);
      assert.strictEqual(serialized.includes('Trace'), false);
      assert.strictEqual(serialized.includes('src/'), false);
    });

    it('500 response conceals all internal error parameters from caller', async () => {
      const res = createDefensiveAuthResponse(500);
      assert.strictEqual(res.status, 500);

      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error, 'InternalServerError');
      assert.strictEqual(
        json.message,
        'An unexpected internal error occurred. Please try again later.'
      );
    });
  });
});
