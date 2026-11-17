import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Pure domain logic and mock data
import {
  validateLionisticYearFormat,
  filterTermsWithMembers,
  getCurrentBoardTerm,
  getMembersForTerm,
  resolveBoardDirectoryState,
} from '../src/lib/board.ts';
import { SEED_BOARD_TERMS, SEED_EXECUTIVE_MEMBERS } from '../src/data/mock-board.ts';

// Repository and Database layer
import { createTestDatabase } from '../src/lib/db.ts';
import {
  getTermsWithBoardRecords,
  getExecutiveMembersByTerm,
  getBoardDirectoryData,
} from '../src/lib/board-repository.ts';

describe('Board Directory by Lionistic Year (FR-04, UC04) Test Suite', () => {
  /* ========================================================================
   * Acceptance Criterion 1: A year selector lists only years that have board records.
   * ======================================================================== */
  describe('AC1: Year selector lists only years with board records (empty years omitted)', () => {
    it('TC-BOARD-001: Filters out empty terms that have zero executive member records', () => {
      // In SEED_BOARD_TERMS: '2025-2026' has 5 active, '2024-2025' has 3 active, '2023-2024' has 0 members
      const validTerms = filterTermsWithMembers(SEED_BOARD_TERMS, SEED_EXECUTIVE_MEMBERS);

      assert.strictEqual(
        validTerms.length,
        2,
        'Must only include 2 terms that have active members'
      );

      const termIds = validTerms.map((t) => t.termId);
      assert.ok(termIds.includes('2025-2026'), 'Must include 2025-2026');
      assert.ok(termIds.includes('2024-2025'), 'Must include 2024-2025');
      assert.strictEqual(
        termIds.includes('2023-2024'),
        false,
        'Empty term 2023-2024 must NOT be offered in the selector'
      );
    });

    it('TC-BOARD-002: Inactive members are excluded and do not qualify an empty term', () => {
      // Create a test term with ONLY an inactive member
      const testTerms = [
        {
          termId: '2020-2021',
          termLabel: 'Lionistic Year 2020/2021',
          startDate: '2020-07-01',
          endDate: '2021-06-30',
          isCurrent: false,
          theme: 'Historical',
        },
      ];
      const inactiveOnlyMembers = [
        {
          memberId: 'mem-inactive-only',
          termId: '2020-2021',
          fullName: 'Inactive Officer',
          designation: 'Advisor',
          lionTitle: 'Lion',
          bio: null,
          profileImageUrl: null,
          contactEmail: null,
          contactPhone: null,
          displayOrder: 1,
          status: 'INACTIVE',
        },
      ];

      const result = filterTermsWithMembers(testTerms, inactiveOnlyMembers);
      assert.strictEqual(
        result.length,
        0,
        'A term with only INACTIVE members must not be offered in the year selector'
      );
    });

    it('TC-BOARD-003: Database repository query strictly filters empty terms via parameterised HAVING count > 0', () => {
      const db = createTestDatabase();

      // Seed 1 active term and 1 empty term
      db.prepare(
        `INSERT INTO board_terms (term_id, term_label, start_date, end_date, is_current, theme)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run('2025-2026', 'Year 2025/2026', '2025-07-01', '2026-06-30', 1, 'Theme Current');

      db.prepare(
        `INSERT INTO board_terms (term_id, term_label, start_date, end_date, is_current, theme)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run('2021-2022', 'Year 2021/2022', '2021-07-01', '2022-06-30', 0, 'Theme Empty');

      // Add member to 2025-2026 only
      db.prepare(
        `INSERT INTO executive_members (member_id, term_id, full_name, designation, status)
         VALUES (?, ?, ?, ?, ?)`
      ).run('m-1', '2025-2026', 'President Name', 'Club President', 'ACTIVE');

      const terms = getTermsWithBoardRecords(db);
      assert.strictEqual(terms.length, 1, 'Repository must return exactly 1 term with records');
      assert.strictEqual(terms[0].termId, '2025-2026');
      assert.strictEqual(terms[0].memberCount, 1);
    });
  });

  /* ========================================================================
   * Acceptance Criterion 2: Selecting a year shows that term's members; current year is preselected.
   * ======================================================================== */
  describe('AC2: Selecting a year shows members, current year is preselected', () => {
    it('TC-BOARD-004: When no year is requested, current year (2025-2026) is preselected by default', () => {
      const state = resolveBoardDirectoryState(SEED_BOARD_TERMS, SEED_EXECUTIVE_MEMBERS);

      assert.ok(state.selectedTerm, 'Selected term must not be null');
      assert.strictEqual(
        state.selectedTerm.termId,
        '2025-2026',
        'Current term (2025-2026) must be preselected by default'
      );
      assert.strictEqual(state.selectedTerm.isCurrent, true);
      assert.strictEqual(state.isInvalidYear, false);
      assert.strictEqual(state.invalidYearRequested, null);

      // Verify that members returned belong to 2025-2026 and are sorted by displayOrder ASC
      assert.ok(state.members.length >= 3, 'Must return active members for 2025-2026');
      assert.ok(state.members.every((m) => m.termId === '2025-2026'));
      assert.strictEqual(state.members[0].designation, 'Club President');
      assert.strictEqual(state.members[1].designation, 'Club Secretary');
      assert.strictEqual(state.members[2].designation, 'Club Treasurer');
    });

    it('TC-BOARD-004B: getCurrentBoardTerm identifies isCurrent=true or falls back to latest start date', () => {
      const current = getCurrentBoardTerm(SEED_BOARD_TERMS);
      assert.ok(current);
      assert.strictEqual(current.termId, '2025-2026');
      assert.strictEqual(current.isCurrent, true);

      // Verify fallback when no term has isCurrent=true
      const termsWithoutCurrent = SEED_BOARD_TERMS.map((t) => ({ ...t, isCurrent: false }));
      const fallback = getCurrentBoardTerm(termsWithoutCurrent);
      assert.ok(fallback);
      assert.strictEqual(fallback.termId, '2025-2026');
    });

    it('TC-BOARD-005: Selecting past year (2024-2025) shows that term members', () => {
      const state = resolveBoardDirectoryState(
        SEED_BOARD_TERMS,
        SEED_EXECUTIVE_MEMBERS,
        '2024-2025'
      );

      assert.ok(state.selectedTerm);
      assert.strictEqual(state.selectedTerm.termId, '2024-2025');
      assert.strictEqual(state.isInvalidYear, false);
      assert.strictEqual(state.invalidYearRequested, null);

      // Verify 2024-2025 officers
      assert.strictEqual(state.members.length, 3);
      assert.ok(state.members.every((m) => m.termId === '2024-2025'));
      assert.strictEqual(state.members[0].designation, 'Immediate Past President');
    });

    it('TC-BOARD-006: getMembersForTerm strictly returns active members sorted by display_order ASC', () => {
      const members = getMembersForTerm(SEED_EXECUTIVE_MEMBERS, '2025-2026');

      // Verify inactive member 'mem-2025-006-inactive' is excluded
      const hasInactive = members.some((m) => m.status === 'INACTIVE');
      assert.strictEqual(hasInactive, false, 'INACTIVE members must be excluded');

      // Verify ordering
      for (let i = 1; i < members.length; i++) {
        assert.ok(
          members[i].displayOrder >= members[i - 1].displayOrder,
          'Members must be ordered by displayOrder ASC'
        );
      }
    });

    it('TC-BOARD-006B: getExecutiveMembersByTerm retrieves active members from database sorted by display_order', () => {
      const db = createTestDatabase();
      db.prepare(
        `INSERT INTO board_terms (term_id, term_label, start_date, end_date, is_current)
         VALUES (?, ?, ?, ?, ?)`
      ).run('2025-2026', 'Year 2025/2026', '2025-07-01', '2026-06-30', 1);

      db.prepare(
        `INSERT INTO executive_members (member_id, term_id, full_name, designation, display_order, status)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run('m-1', '2025-2026', 'First Member', 'President', 1, 'ACTIVE');

      db.prepare(
        `INSERT INTO executive_members (member_id, term_id, full_name, designation, display_order, status)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run('m-2', '2025-2026', 'Second Member', 'Secretary', 2, 'ACTIVE');

      const dbMembers = getExecutiveMembersByTerm('2025-2026', db);
      assert.strictEqual(dbMembers.length, 2);
      assert.strictEqual(dbMembers[0].fullName, 'First Member');
      assert.strictEqual(dbMembers[1].fullName, 'Second Member');
    });

    it('TC-BOARD-007: Database repository getBoardDirectoryData returns current term on empty param', () => {
      const db = createTestDatabase();

      // Seed current term
      db.prepare(
        `INSERT INTO board_terms (term_id, term_label, start_date, end_date, is_current, theme)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run('2025-2026', 'Year 2025/2026', '2025-07-01', '2026-06-30', 1, 'Current Theme');

      db.prepare(
        `INSERT INTO executive_members (member_id, term_id, full_name, designation, display_order, status)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run('m-p', '2025-2026', 'President Name', 'Club President', 1, 'ACTIVE');

      const data = getBoardDirectoryData(undefined, db);
      assert.strictEqual(data.selectedTerm?.termId, '2025-2026');
      assert.strictEqual(data.members.length, 1);
      assert.strictEqual(data.members[0].fullName, 'President Name');
      assert.strictEqual(data.isInvalidYear, false);
    });
  });

  /* ========================================================================
   * Acceptance Criterion 3: Empty years are not offered; invalid year in URL shows friendly message.
   * ======================================================================== */
  describe('AC3: Empty years not offered and invalid year URL triggers friendly message', () => {
    it('TC-BOARD-008: Requesting an empty year (2023-2024) in URL flags isInvalidYear and defaults to current', () => {
      const state = resolveBoardDirectoryState(
        SEED_BOARD_TERMS,
        SEED_EXECUTIVE_MEMBERS,
        '2023-2024'
      );

      assert.strictEqual(
        state.isInvalidYear,
        true,
        'Requesting empty term 2023-2024 must trigger invalid state'
      );
      assert.strictEqual(state.invalidYearRequested, '2023-2024');
      assert.strictEqual(
        state.selectedTerm?.termId,
        '2025-2026',
        'Must safely fallback to displaying current term'
      );
      assert.ok(state.members.length > 0, 'Must show current members rather than a blank page');
    });

    it('TC-BOARD-009: Requesting arbitrary nonexistent year in URL triggers friendly message and defaults to current', () => {
      const state = resolveBoardDirectoryState(
        SEED_BOARD_TERMS,
        SEED_EXECUTIVE_MEMBERS,
        '1995-1996'
      );

      assert.strictEqual(state.isInvalidYear, true);
      assert.strictEqual(state.invalidYearRequested, '1995-1996');
      assert.strictEqual(state.selectedTerm?.termId, '2025-2026');
    });

    it('TC-BOARD-010: Requesting malformed string in URL triggers friendly message without throwing', () => {
      const state = resolveBoardDirectoryState(
        SEED_BOARD_TERMS,
        SEED_EXECUTIVE_MEMBERS,
        'invalid-year-format'
      );

      assert.strictEqual(state.isInvalidYear, true);
      assert.strictEqual(state.invalidYearRequested, 'invalid-year-format');
      assert.strictEqual(state.selectedTerm?.termId, '2025-2026');
    });

    it('TC-BOARD-011: SQL injection attempts in year parameter are safely defended', () => {
      const injectionParam = "' OR '1'='1";
      const db = createTestDatabase();

      // Seed database
      db.prepare(
        `INSERT INTO board_terms (term_id, term_label, start_date, end_date, is_current, theme)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run('2025-2026', 'Year 2025/2026', '2025-07-01', '2026-06-30', 1, 'Current Theme');
      db.prepare(
        `INSERT INTO executive_members (member_id, term_id, full_name, designation, display_order, status)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run('m-sec', '2025-2026', 'Safe Member', 'Club Secretary', 1, 'ACTIVE');

      // Call repository with injection attack
      const data = getBoardDirectoryData(injectionParam, db);
      assert.strictEqual(data.isInvalidYear, true);
      assert.strictEqual(data.invalidYearRequested, injectionParam);
      assert.strictEqual(data.selectedTerm?.termId, '2025-2026');
      assert.strictEqual(data.members.length, 1);
    });

    it('TC-BOARD-012: UI component source code contains role="alert" and friendly error message banner', () => {
      const boardDirSource = fs.readFileSync(
        path.join(process.cwd(), 'src/components/board/BoardDirectory.tsx'),
        'utf8'
      );

      assert.ok(
        boardDirSource.includes('role="alert"'),
        'BoardDirectory component must render accessible role="alert" for invalid year notice'
      );
      assert.ok(
        boardDirSource.includes('data-testid="invalid-year-alert"'),
        'Must contain invalid-year-alert testid'
      );
      assert.ok(
        boardDirSource.includes('Not Found') ||
          boardDirSource.includes('No active committee records exist'),
        'Must display friendly explanation'
      );
    });
  });

  /* ========================================================================
   * Acceptance Criterion 4: Selection works by keyboard and on mobile.
   * ======================================================================== */
  describe('AC4: Selection works by keyboard and on mobile (360px viewport safety)', () => {
    it('TC-BOARD-013: YearSelector source provides native <select> for mobile and accessible role="tab" for desktop', () => {
      const selectorSource = fs.readFileSync(
        path.join(process.cwd(), 'src/components/board/YearSelector.tsx'),
        'utf8'
      );

      // Mobile accessibility
      assert.ok(
        selectorSource.includes('<select'),
        'Must render native <select> for mobile touch pickers'
      );
      assert.ok(
        selectorSource.includes('aria-label="Filter board directory by Lionistic Year"'),
        'Select element must have explicit aria-label'
      );
      assert.ok(
        selectorSource.includes('htmlFor="lionistic-year-dropdown"'),
        'Must have label htmlFor attribute'
      );

      // Keyboard & tab navigation
      assert.ok(selectorSource.includes('role="tablist"'), 'Must contain role="tablist"');
      assert.ok(selectorSource.includes('role="tab"'), 'Must contain role="tab"');
      assert.ok(selectorSource.includes('aria-selected'), 'Must manage aria-selected attribute');
      assert.ok(
        selectorSource.includes('tabIndex={0}'),
        'Tabs must have tabIndex={0} for keyboard focus'
      );
      assert.ok(
        selectorSource.includes("e.key === 'Enter'") && selectorSource.includes("e.key === ' '"),
        'Must handle Enter and Space keydown events'
      );
    });

    it('TC-BOARD-014: Layout classes enforce mobile responsiveness down to 360px without horizontal scroll', () => {
      const pageSource = fs.readFileSync(
        path.join(process.cwd(), 'src/app/board/page.tsx'),
        'utf8'
      );
      const directorySource = fs.readFileSync(
        path.join(process.cwd(), 'src/components/board/BoardDirectory.tsx'),
        'utf8'
      );

      // Check overflow-x-hidden and full width bounds
      assert.ok(
        pageSource.includes('overflow-x-hidden'),
        'Page must guard against horizontal overflow'
      );
      assert.ok(pageSource.includes('w-full'), 'Page must use full width bounds');
      assert.ok(
        directorySource.includes('grid-cols-1'),
        'Members grid must start single column on mobile'
      );
      assert.ok(directorySource.includes('sm:grid-cols-2'), 'Members grid must adapt on tablet');
      assert.ok(
        directorySource.includes('lg:grid-cols-3'),
        'Members grid must use 3 columns on desktop'
      );
    });

    it('TC-BOARD-015: Lionistic Year string validation strictly requires YYYY-YYYY consecutive years', () => {
      assert.strictEqual(validateLionisticYearFormat('2025-2026'), true);
      assert.strictEqual(validateLionisticYearFormat('2024-2025'), true);
      assert.strictEqual(validateLionisticYearFormat('2023-2024'), true);

      // Non-consecutive years
      assert.strictEqual(validateLionisticYearFormat('2024-2026'), false);
      assert.strictEqual(validateLionisticYearFormat('2025-2024'), false);

      // Malformed strings
      assert.strictEqual(validateLionisticYearFormat('2025/2026'), false);
      assert.strictEqual(validateLionisticYearFormat('25-26'), false);
      assert.strictEqual(validateLionisticYearFormat(''), false);
      assert.strictEqual(validateLionisticYearFormat(null), false);
      assert.strictEqual(validateLionisticYearFormat(undefined), false);
    });
  });
});
