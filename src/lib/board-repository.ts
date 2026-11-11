import { DatabaseSync } from 'node:sqlite';
import { getDatabase, query } from './db.ts';
import type { BoardTerm, ExecutiveMember, BoardDirectoryViewModel } from '../types/board.ts';
import { SEED_BOARD_TERMS, SEED_EXECUTIVE_MEMBERS } from '../data/mock-board.ts';
import { resolveBoardDirectoryState } from './board.ts';

interface RawBoardTermRow {
  termId: string;
  termLabel: string;
  startDate: string;
  endDate: string;
  isCurrent: number | boolean;
  theme: string | null;
  memberCount: number;
}

interface RawExecutiveMemberRow {
  memberId: string;
  termId: string;
  fullName: string;
  designation: string;
  lionTitle: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  displayOrder: number;
  status: string;
}

/**
 * Retrieves only Lionistic terms that contain active board records.
 *
 * Acceptance criteria:
 * - A year selector lists only years that have board records.
 * - Empty years are strictly not offered.
 * - Queries are parameterised and protected against SQL injection.
 */
export function getTermsWithBoardRecords(customDb?: DatabaseSync): BoardTerm[] {
  try {
    const db = customDb || getDatabase();

    const sql = `
      SELECT
        t.term_id AS termId,
        t.term_label AS termLabel,
        t.start_date AS startDate,
        t.end_date AS endDate,
        t.is_current AS isCurrent,
        t.theme,
        COUNT(m.member_id) AS memberCount
      FROM board_terms t
      INNER JOIN executive_members m ON t.term_id = m.term_id
      WHERE m.status = ?
      GROUP BY t.term_id, t.term_label, t.start_date, t.end_date, t.is_current, t.theme
      HAVING COUNT(m.member_id) > 0
      ORDER BY t.start_date DESC
    `;

    // Strictly parameterised query: status is always 'ACTIVE'
    const rows = query<RawBoardTermRow>(sql, ['ACTIVE'], db);

    return rows.map((row) => ({
      termId: row.termId,
      termLabel: row.termLabel,
      startDate: row.startDate,
      endDate: row.endDate,
      isCurrent: Boolean(row.isCurrent),
      theme: row.theme,
      memberCount: Number(row.memberCount),
    }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown database error';
    console.error('[BoardRepository] Error fetching board terms:', message);
    // Graceful fallback to seed data
    return resolveBoardDirectoryState(SEED_BOARD_TERMS, SEED_EXECUTIVE_MEMBERS).terms;
  }
}

/**
 * Retrieves active executive members for a specific lionistic term, sorted by display_order ASC.
 * Strictly parameterised to prevent SQL injection.
 */
export function getExecutiveMembersByTerm(
  termId: string,
  customDb?: DatabaseSync
): ExecutiveMember[] {
  if (!termId || typeof termId !== 'string') {
    return [];
  }

  try {
    const db = customDb || getDatabase();

    const sql = `
      SELECT
        member_id AS memberId,
        term_id AS termId,
        full_name AS fullName,
        designation,
        lion_title AS lionTitle,
        bio,
        profile_image_url AS profileImageUrl,
        contact_email AS contactEmail,
        contact_phone AS contactPhone,
        display_order AS displayOrder,
        status
      FROM executive_members
      WHERE term_id = ? AND status = ?
      ORDER BY display_order ASC
    `;

    // Strictly parameterised query with termId and 'ACTIVE'
    const rows = query<RawExecutiveMemberRow>(sql, [termId.trim(), 'ACTIVE'], db);

    return rows.map((row) => ({
      memberId: row.memberId,
      termId: row.termId,
      fullName: row.fullName,
      designation: row.designation,
      lionTitle: row.lionTitle,
      bio: row.bio,
      profileImageUrl: row.profileImageUrl,
      contactEmail: row.contactEmail,
      contactPhone: row.contactPhone,
      displayOrder: Number(row.displayOrder),
      status: row.status as ExecutiveMember['status'],
    }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown database error';
    console.error(`[BoardRepository] Error fetching members for term ${termId}:`, message);
    // Graceful fallback to seed data
    return SEED_EXECUTIVE_MEMBERS.filter((m) => m.termId === termId && m.status === 'ACTIVE').sort(
      (a, b) => a.displayOrder - b.displayOrder
    );
  }
}

/**
 * Resolves the full board directory data for the page, coordinating term selection and member fetching.
 *
 * Acceptance criteria:
 * 1. A year selector lists only years that have board records.
 * 2. Selecting a year shows that term's members; current year is preselected by default.
 * 3. Empty years are not offered; an invalid year in the URL shows a friendly message.
 */
export function getBoardDirectoryData(
  requestedYear?: string | null,
  customDb?: DatabaseSync
): BoardDirectoryViewModel {
  const terms = getTermsWithBoardRecords(customDb);

  if (terms.length === 0) {
    // If database returned no terms, fallback to seed data
    return resolveBoardDirectoryState(SEED_BOARD_TERMS, SEED_EXECUTIVE_MEMBERS, requestedYear);
  }

  const currentTerm = terms.find((t) => t.isCurrent) || terms[0];

  // If no year requested in URL: preselect current year
  if (!requestedYear || !requestedYear.trim()) {
    const members = getExecutiveMembersByTerm(currentTerm.termId, customDb);
    return {
      terms,
      selectedTerm: currentTerm,
      members,
      isInvalidYear: false,
      invalidYearRequested: null,
    };
  }

  const cleanRequestedYear = requestedYear.trim();
  const matchedTerm = terms.find(
    (t) => t.termId.toLowerCase() === cleanRequestedYear.toLowerCase()
  );

  // If valid year with board records found
  if (matchedTerm) {
    const members = getExecutiveMembersByTerm(matchedTerm.termId, customDb);
    return {
      terms,
      selectedTerm: matchedTerm,
      members,
      isInvalidYear: false,
      invalidYearRequested: null,
    };
  }

  // Invalid year requested (e.g. invalid format, not existing, or empty year without members)
  // Gracefully show friendly fallback message and display current year's members
  const members = getExecutiveMembersByTerm(currentTerm.termId, customDb);
  return {
    terms,
    selectedTerm: currentTerm,
    members,
    isInvalidYear: true,
    invalidYearRequested: cleanRequestedYear,
  };
}
