import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  getBoardTermsSorted,
  getDefaultBoardTerm,
  getMembersByTerm,
  getMemberInitials,
  formatMemberDisplayName,
  sanitizeMemberText,
} from '../src/lib/board.ts';
import { BOARD_TERMS, VERIFIED_BOARD_MEMBERS } from '../src/data/board-members.ts';
import {
  getBoardTermsFromDb,
  getExecutiveMembersFromDb,
  getBoardDirectoryFromDb,
} from '../src/lib/board-repository.ts';
import { createTestDatabase } from '../src/lib/db.ts';

describe('Executive Board Directory (LBW-48, EPIC-07) Test Suite', () => {
  it('TC-BOARD-001: Selects the current committee term by default (AC-1)', () => {
    const defaultTerm = getDefaultBoardTerm(BOARD_TERMS);
    assert.ok(defaultTerm, 'Default term must be resolved');
    assert.strictEqual(defaultTerm.termId, '2025-2026', 'Current term 2025-2026 must be default');
    assert.strictEqual(defaultTerm.isCurrent, true);
  });

  it('TC-BOARD-002: Lists current and previous Lionistic terms sorted cleanly (AC-2)', () => {
    const sorted = getBoardTermsSorted(BOARD_TERMS);
    assert.strictEqual(sorted.length, 3, 'Should contain current and 2 previous terms');
    assert.strictEqual(sorted[0].termId, '2025-2026', 'Current term must be first');
    assert.strictEqual(sorted[1].termId, '2024-2025', '2024-2025 must follow');
    assert.strictEqual(sorted[2].termId, '2023-2024', '2023-2024 must be last');
  });

  it('TC-BOARD-003: Members are strictly ordered by configured displayOrder ascending (AC-4)', () => {
    const shuffledMembers = [
      { ...VERIFIED_BOARD_MEMBERS[3], displayOrder: 4 },
      { ...VERIFIED_BOARD_MEMBERS[1], displayOrder: 2 },
      { ...VERIFIED_BOARD_MEMBERS[0], displayOrder: 1 },
      { ...VERIFIED_BOARD_MEMBERS[2], displayOrder: 3 },
    ];

    const ordered = getMembersByTerm(shuffledMembers, '2025-2026');
    assert.strictEqual(ordered.length, 4);
    assert.deepStrictEqual(
      ordered.map((m) => m.displayOrder),
      [1, 2, 3, 4],
      'Members must be sorted strictly by displayOrder ASC'
    );
    assert.strictEqual(ordered[0].designation, 'Club President');
  });

  it('TC-BOARD-004: Members without photos or bios produce valid fallbacks cleanly (AC-3)', () => {
    const memberWithoutBioOrPhoto = VERIFIED_BOARD_MEMBERS.find(
      (m) => m.profileImageUrl === null && m.bio === null
    );
    assert.ok(memberWithoutBioOrPhoto, 'Seed contains verified member without photo/bio');

    const initials = getMemberInitials(memberWithoutBioOrPhoto.fullName);
    assert.ok(initials.length >= 1 && initials.length <= 2, 'Initials fallback must be 1-2 letters');
    assert.strictEqual(initials, 'RS', 'Dr. R.M. Senarathne should yield RS initials');

    const cleanBio = sanitizeMemberText(memberWithoutBioOrPhoto.bio);
    assert.strictEqual(cleanBio, '', 'Null bio must sanitize cleanly to empty string');

    const formattedName = formatMemberDisplayName(memberWithoutBioOrPhoto);
    assert.strictEqual(formattedName, 'Lion Dr. R.M. Senarathne');
  });

  it('TC-BOARD-005: Inactive members are excluded from public committee view', () => {
    const sampleWithInactive = [
      ...VERIFIED_BOARD_MEMBERS,
      {
        id: 'exec-inactive-001',
        termId: '2025-2026',
        fullName: 'Inactive Officer',
        designation: 'Former Advisor',
        lionTitle: 'Lion',
        bio: null,
        profileImageUrl: null,
        contactEmail: null,
        contactPhone: null,
        displayOrder: 5,
        status: 'INACTIVE',
        isVerified: true,
      },
    ];

    const visible = getMembersByTerm(sampleWithInactive, '2025-2026');
    assert.strictEqual(
      visible.some((m) => m.status === 'INACTIVE'),
      false,
      'INACTIVE members must never appear publicly'
    );
  });

  it('TC-BOARD-006: Only verified, club-approved data appears in staging/production (AC-5)', () => {
    const mixedMembers = [
      ...VERIFIED_BOARD_MEMBERS,
      {
        id: 'exec-unverified-001',
        termId: '2025-2026',
        fullName: '[DEV-TEST] Placeholder Officer',
        designation: 'Test Role',
        lionTitle: 'Lion',
        bio: 'Unverified fictional placeholder',
        profileImageUrl: null,
        contactEmail: null,
        contactPhone: null,
        displayOrder: 99,
        status: 'ACTIVE',
        isVerified: false,
      },
    ];

    // Default behavior enforces verified-only
    const publicMembers = getMembersByTerm(mixedMembers, '2025-2026');
    assert.strictEqual(
      publicMembers.every((m) => m.isVerified === true),
      true,
      'Unverified records must be excluded by default'
    );

    // Even if allowUnverified is requested, production/staging must override and block it
    const originalEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = 'production';
      const prodMembers = getMembersByTerm(mixedMembers, '2025-2026', {
        allowUnverified: true,
      });
      assert.strictEqual(
        prodMembers.some((m) => !m.isVerified),
        false,
        'Production must strictly block unverified members even when allowUnverified=true'
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('TC-BOARD-007: Database repository queries enforce verification, active status, and display_order', () => {
    const db = createTestDatabase();

    db.prepare(`
      INSERT INTO board_terms (term_id, term_label, start_date, end_date, is_current, theme)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('2025-2026', 'Lionistic Year 2025/2026', '2025-07-01', '2026-06-30', 1, 'Lead With Care, Serve With Pride');

    db.prepare(`
      INSERT INTO board_terms (term_id, term_label, start_date, end_date, is_current, theme)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('2024-2025', 'Lionistic Year 2024/2025', '2024-07-01', '2025-06-30', 0, 'Make Your Mark');

    const insertMember = db.prepare(`
      INSERT INTO executive_members (
        member_id, term_id, full_name, designation, lion_title, display_order, status, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertMember.run('m2', '2025-2026', 'H.M. Bandara', 'Club Secretary', 'Lion', 2, 'ACTIVE', 1);
    insertMember.run('m1', '2025-2026', 'T. Sanjeewa Prasad Jayaweera', 'Club President', 'Lion Prof.', 1, 'ACTIVE', 1);
    insertMember.run('m3', '2025-2026', 'Unverified Placeholder', 'Test Role', 'Lion', 3, 'ACTIVE', 0);
    insertMember.run('m4', '2025-2026', 'Inactive Officer', 'Advisor', 'Lion', 4, 'INACTIVE', 1);

    const terms = getBoardTermsFromDb(db);
    assert.strictEqual(terms.length, 2);
    assert.strictEqual(terms[0].termId, '2025-2026');

    const members = getExecutiveMembersFromDb('2025-2026', db);
    assert.strictEqual(members.length, 2, 'Only active and verified members returned');
    assert.strictEqual(members[0].id, 'm1', 'Ordered by display_order ASC');
    assert.strictEqual(members[1].id, 'm2');

    const directory = getBoardDirectoryFromDb(db);
    assert.strictEqual(directory.terms.length, 2);
    assert.strictEqual(directory.members.length, 2);
  });

  it('TC-BOARD-008: Sanitizes bio strings against XSS injection', () => {
    const raw = '<script>alert(1)</script><b>Experienced community leader.</b>';
    const clean = sanitizeMemberText(raw);
    assert.strictEqual(clean, 'Experienced community leader.');
  });
});

