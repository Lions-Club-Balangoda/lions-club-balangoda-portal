import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  NAV_ITEMS,
  CLUB_CONTACT_INFO,
  isActiveRoute,
} from '../src/data/navigation.ts';

describe('Responsive Navigation & Brand Footer (LBW-32, NFR-02) Test Suite', () => {
  it('TC-NAV-001: Navigation includes all required public routes (Home, About, Projects, News, Board, Volunteer, Contact)', () => {
    const requiredRoutes = [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Projects', href: '/projects' },
      { label: 'News', href: '/news' },
      { label: 'Board', href: '/board' },
      { label: 'Volunteer', href: '/volunteer' },
      { label: 'Contact', href: '/contact' },
    ];

    assert.strictEqual(
      NAV_ITEMS.length,
      requiredRoutes.length,
      `Navigation must have exactly ${requiredRoutes.length} public links`
    );

    requiredRoutes.forEach((expected) => {
      const found = NAV_ITEMS.find((item) => item.href === expected.href);
      assert.ok(found, `Navigation must include route: ${expected.href}`);
      assert.strictEqual(
        found.label,
        expected.label,
        `Route ${expected.href} must have label "${expected.label}"`
      );
    });
  });

  it('TC-NAV-002: Active route detection highlights root path correctly', () => {
    assert.strictEqual(
      isActiveRoute('/', '/'),
      true,
      'Root path "/" must be active when current pathname is "/"'
    );
    assert.strictEqual(
      isActiveRoute('/', '/about'),
      false,
      'About link must NOT be active when on root "/"'
    );
    assert.strictEqual(
      isActiveRoute('/', '/projects'),
      false,
      'Projects link must NOT be active when on root "/"'
    );
  });

  it('TC-NAV-003: Active route detection highlights exact and nested sub-routes', () => {
    // Exact match
    assert.strictEqual(
      isActiveRoute('/projects', '/projects'),
      true,
      'Projects link must be active on "/projects"'
    );
    // Nested child route
    assert.strictEqual(
      isActiveRoute('/projects/annual-cataract-surgeries-2025', '/projects'),
      true,
      'Projects link must be active on child detail page "/projects/..."'
    );
    // Non-active match
    assert.strictEqual(
      isActiveRoute('/about', '/projects'),
      false,
      'Projects link must NOT be active on "/about"'
    );
    // Root link is not active on subpages
    assert.strictEqual(
      isActiveRoute('/projects', '/'),
      false,
      'Home link "/" must NOT be active when on "/projects"'
    );
  });

  it('TC-NAV-004: Active route detection handles trailing slashes gracefully', () => {
    assert.strictEqual(
      isActiveRoute('/volunteer/', '/volunteer'),
      true,
      'Trailing slash on current path should still match link'
    );
    assert.strictEqual(
      isActiveRoute('/contact', '/contact/'),
      true,
      'Trailing slash on link href should still match current path'
    );
  });

  it('TC-NAV-005: Navigation items have valid, accessible structure', () => {
    NAV_ITEMS.forEach((item) => {
      assert.ok(typeof item.label === 'string' && item.label.trim().length > 0, 'Nav item must have non-empty label');
      assert.ok(typeof item.href === 'string' && item.href.startsWith('/'), 'Nav item href must start with "/"');
    });
  });

  it('TC-FOOTER-001: Verified club contact details are present and accurate', () => {
    assert.strictEqual(
      CLUB_CONTACT_INFO.clubName,
      'Lions Club of Balangoda',
      'Club name must be Lions Club of Balangoda'
    );
    assert.strictEqual(
      CLUB_CONTACT_INFO.email,
      'lionsbalangoda@gmail.com',
      'Official verified email must be lionsbalangoda@gmail.com'
    );
    assert.ok(
      CLUB_CONTACT_INFO.district.includes('District 306'),
      'District must specify District 306'
    );
    assert.strictEqual(
      CLUB_CONTACT_INFO.motto,
      'We Serve',
      'Lions motto must be "We Serve"'
    );
    assert.ok(
      CLUB_CONTACT_INFO.city.includes('Balangoda'),
      'Address must specify Balangoda location'
    );
  });

  it('TC-FOOTER-002: Footer links cover all core community public areas', () => {
    const requiredFooterKeys = ['/', '/about', '/projects', '/news', '/board', '/volunteer', '/contact'];
    requiredFooterKeys.forEach((href) => {
      const match = NAV_ITEMS.some((item) => item.href === href);
      assert.ok(match, `Footer must include public link to ${href}`);
    });
  });
});

