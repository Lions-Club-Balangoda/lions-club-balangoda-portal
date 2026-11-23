/**
 * tests/admin-dashboard.test.mjs
 * Test Suite for CMS Admin Dashboard & Navigation
 *
 * Story: LBW-43 (Dashboard and Admin Navigation)
 * Epic: LBW-6 (Content Management System)
 * Acceptance Criteria Covered:
 *   AC1: Links to Projects, News/Announcements, Board, Media, Submissions (appear based on role)
 *   AC2: Wireframe layout with clear non-technical labels
 *   AC3: Admin routes redirect unauthenticated visitors to login
 *   AC4: Usable on tablet and desktop; basic usability on mobile
 */

import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  ADMIN_NAV_ITEMS,
  getPermittedAdminNavItems,
  isAdminRouteActive,
} from '../src/data/admin-navigation.ts';
import { middleware } from '../src/middleware.ts';
import { NextRequest } from 'next/server.js';
import { createSessionToken } from '../src/lib/auth/session.ts';

describe('CMS Admin Dashboard & Navigation (LBW-43) Test Suite', () => {
  describe('AC-1: Role-Permitted Navigation Items & Access Control', () => {
    it('TC-DASH-001: All standard CMS navigation modules are defined with correct paths and non-technical labels', () => {
      const requiredModules = [
        { id: 'dashboard', href: '/admin', label: 'Dashboard' },
        { id: 'projects', href: '/admin/projects', label: 'Projects' },
        { id: 'news', href: '/admin/news', label: 'News & Announcements' },
        { id: 'board', href: '/admin/board', label: 'Executive Board' },
        { id: 'media', href: '/admin/media', label: 'Media Assets' },
        { id: 'submissions', href: '/admin/submissions', label: 'Submissions & Inquiries' },
        { id: 'users', href: '/admin/users', label: 'User Accounts' },
      ];

      requiredModules.forEach((expected) => {
        const found = ADMIN_NAV_ITEMS.find((item) => item.id === expected.id);
        assert.ok(found, `Navigation must include module: ${expected.id}`);
        assert.strictEqual(
          found.href,
          expected.href,
          `Module ${expected.id} must point to ${expected.href}`
        );
        assert.strictEqual(
          found.label,
          expected.label,
          `Module ${expected.id} must have clear non-technical label "${expected.label}"`
        );
        assert.ok(
          found.description && found.description.length > 10,
          `Module ${expected.id} must have human-readable description for non-technical officers`
        );
      });
    });

    it('TC-DASH-002: ADMIN role receives all 7 navigation items including User Accounts', () => {
      const permitted = getPermittedAdminNavItems('ADMIN');
      assert.strictEqual(permitted.length, 7, 'ADMIN role must have access to all 7 navigation items');

      const userManagement = permitted.find((item) => item.id === 'users');
      assert.ok(userManagement, 'ADMIN role must see User Accounts management');
      assert.strictEqual(userManagement.href, '/admin/users');
    });

    it('TC-DASH-003: EDITOR role receives 6 content management items and CANNOT see User Accounts', () => {
      const permitted = getPermittedAdminNavItems('EDITOR');
      assert.strictEqual(
        permitted.length,
        6,
        'EDITOR role must have access to exactly 6 items (content modules)'
      );

      const hasProjects = permitted.some((item) => item.id === 'projects');
      const hasNews = permitted.some((item) => item.id === 'news');
      const hasBoard = permitted.some((item) => item.id === 'board');
      const hasMedia = permitted.some((item) => item.id === 'media');
      const hasSubmissions = permitted.some((item) => item.id === 'submissions');
      const hasUsers = permitted.some((item) => item.id === 'users');

      assert.ok(hasProjects, 'EDITOR must see Projects');
      assert.ok(hasNews, 'EDITOR must see News & Announcements');
      assert.ok(hasBoard, 'EDITOR must see Executive Board');
      assert.ok(hasMedia, 'EDITOR must see Media Assets');
      assert.ok(hasSubmissions, 'EDITOR must see Submissions & Inquiries');
      assert.strictEqual(hasUsers, false, 'EDITOR role must NOT see User Accounts');
    });

    it('TC-DASH-004: Unauthenticated or null role returns empty navigation list', () => {
      const permittedNull = getPermittedAdminNavItems(null);
      const permittedUndefined = getPermittedAdminNavItems(undefined);

      assert.deepStrictEqual(permittedNull, []);
      assert.deepStrictEqual(permittedUndefined, []);
    });
  });

  describe('AC-2: Wireframe Layout & Route Detection', () => {
    it('TC-DASH-005: Route active detection distinguishes root admin and module paths', () => {
      // Exact dashboard match
      assert.strictEqual(isAdminRouteActive('/admin', '/admin'), true);
      assert.strictEqual(isAdminRouteActive('/admin/', '/admin'), true);

      // Projects subpaths
      assert.strictEqual(isAdminRouteActive('/admin/projects', '/admin/projects'), true);
      assert.strictEqual(isAdminRouteActive('/admin/projects/create', '/admin/projects'), true);
      assert.strictEqual(isAdminRouteActive('/admin/projects/123/edit', '/admin/projects'), true);
      assert.strictEqual(isAdminRouteActive('/admin/projects', '/admin'), false);

      // News subpaths
      assert.strictEqual(isAdminRouteActive('/admin/news', '/admin/news'), true);
      assert.strictEqual(isAdminRouteActive('/admin/news/new-event', '/admin/news'), true);
      assert.strictEqual(isAdminRouteActive('/admin/news', '/admin/board'), false);
    });

    it('TC-DASH-006: Admin dashboard page source verifies required wireframe sections and metrics', () => {
      const pageFile = path.resolve('src/app/admin/page.tsx');
      assert.ok(fs.existsSync(pageFile), 'src/app/admin/page.tsx must exist');

      const content = fs.readFileSync(pageFile, 'utf8');

      // Wireframe SCR-02 requirements:
      assert.ok(
        content.includes('admin-welcome-banner'),
        'Dashboard must render welcome banner with officer name and term'
      );
      assert.ok(
        content.includes('metric-card-projects'),
        'Dashboard must render Active Projects metric card'
      );
      assert.ok(
        content.includes('metric-card-news'),
        'Dashboard must render Published News metric card'
      );
      assert.ok(
        content.includes('metric-card-volunteers'),
        'Dashboard must render Pending Volunteers metric card'
      );
      assert.ok(
        content.includes('metric-card-inquiries'),
        'Dashboard must render Unresolved Inquiries metric card'
      );
      assert.ok(
        content.includes('quick-action-new-project'),
        'Dashboard must render "+ New Project" quick action'
      );
      assert.ok(
        content.includes('quick-action-new-announcement'),
        'Dashboard must render "+ New Announcement" quick action'
      );
      assert.ok(
        content.includes('permitted-modules-grid'),
        'Dashboard must render permitted management areas grid'
      );
    });
  });

  describe('AC-3: Admin Route Protection & Authentication Redirection', () => {
    it('TC-DASH-007: Unauthenticated request to /admin redirects to /admin/login with redirect query param', () => {
      const req = new NextRequest('http://localhost:3000/admin', {
        headers: {
          host: 'localhost:3000',
        },
      });

      const res = middleware(req);
      assert.strictEqual(res.status, 307, 'Must return temporary redirect for unauthenticated user');

      const location = res.headers.get('location');
      assert.ok(location, 'Must provide redirect location header');
      assert.ok(
        location.includes('/admin/login?redirect=%2Fadmin') ||
          location.includes('/admin/login?redirect=/admin'),
        `Redirect location must include /admin/login with redirect target, got: ${location}`
      );
    });

    it('TC-DASH-008: Unauthenticated request to deep admin route /admin/projects redirects with preserved target', () => {
      const req = new NextRequest('http://localhost:3000/admin/projects', {
        headers: {
          host: 'localhost:3000',
        },
      });

      const res = middleware(req);
      assert.strictEqual(res.status, 307);

      const location = res.headers.get('location');
      assert.ok(
        location.includes('redirect=%2Fadmin%2Fprojects') ||
          location.includes('redirect=/admin/projects'),
        `Target path /admin/projects must be preserved in redirect URL, got: ${location}`
      );
    });

    it('TC-DASH-009: /admin/login itself does not redirect to avoid circular loop', () => {
      const req = new NextRequest('http://localhost:3000/admin/login', {
        headers: {
          host: 'localhost:3000',
        },
      });

      const res = middleware(req);
      assert.notStrictEqual(
        res.status,
        307,
        '/admin/login must NOT trigger redirection to itself'
      );
    });

    it('TC-DASH-010: Request with valid unexpired session cookie allows access to /admin', () => {
      const validToken = createSessionToken({
        userId: 'usr_test_admin',
        username: 'admin',
        email: 'admin@balangodalions.org',
        fullName: 'Lion Test Officer',
        role: 'ADMIN',
        isActive: true,
      });

      const req = new NextRequest('http://localhost:3000/admin', {
        headers: {
          host: 'localhost:3000',
          cookie: `lions_session_token=${validToken}`,
        },
      });

      const res = middleware(req);
      assert.strictEqual(
        res.status,
        200,
        'Authenticated officer with valid session token must proceed to /admin'
      );
    });
  });

  describe('AC-4: Responsive Layout Usability (Desktop, Tablet, Mobile)', () => {
    it('TC-DASH-011: AdminSidebar renders desktop sidebar and accessible mobile drawer structure', () => {
      const sidebarFile = path.resolve('src/components/admin/AdminSidebar.tsx');
      assert.ok(fs.existsSync(sidebarFile), 'src/components/admin/AdminSidebar.tsx must exist');

      const content = fs.readFileSync(sidebarFile, 'utf8');

      // Desktop layout classes
      assert.ok(
        content.includes('hidden md:flex'),
        'Sidebar must use hidden md:flex for responsive desktop/tablet visibility'
      );
      assert.ok(
        content.includes('admin-desktop-sidebar'),
        'Sidebar must include desktop aside element'
      );

      // Mobile drawer classes & accessibility
      assert.ok(
        content.includes('admin-mobile-drawer'),
        'Component must include mobile drawer panel'
      );
      assert.ok(
        content.includes('role="dialog"') && content.includes('aria-modal="true"'),
        'Mobile drawer must adhere to WAI-ARIA dialog standards'
      );
      assert.ok(
        content.includes('Escape'),
        'Mobile drawer must close on Escape key press for keyboard accessibility'
      );
    });

    it('TC-DASH-012: AdminHeader includes mobile menu toggle button and officer role badge', () => {
      const headerFile = path.resolve('src/components/admin/AdminHeader.tsx');
      assert.ok(fs.existsSync(headerFile), 'src/components/admin/AdminHeader.tsx must exist');

      const content = fs.readFileSync(headerFile, 'utf8');

      assert.ok(
        content.includes('md:hidden'),
        'Header must contain hamburger toggle button visible only on mobile screens'
      );
      assert.ok(
        content.includes('user-role-badge'),
        'Header must render role badge for logged-in officer'
      );
      assert.ok(
        content.includes('Sign Out'),
        'Header must provide clear Sign Out button'
      );
    });
  });
});

