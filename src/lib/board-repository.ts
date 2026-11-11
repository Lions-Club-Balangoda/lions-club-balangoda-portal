import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from './db.ts';
import { getBoardTermsSorted, sanitizeMemberText } from './board.ts';
import { BOARD_TERMS, VERIFIED_BOARD_MEMBERS } from '../data/board-members.ts';
import type {
  BoardTerm,
  ExecutiveMember,
  MemberStatus,
  BoardDirectoryData,
} from '../types/board.ts';

interface RawTermRow {
  termId: string;
  termLabel: string;
  startDate: string;
  endDate: string;
  isCurrent: number;
  theme: string | null;
}

interface RawMemberRow {
  id: string;
  termId: string;
  fullName: string;
  designation: string;
  lionTitle: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  displayOrder: number;
  status: MemberStatus;
  isVerified: number;
}

function mapTermRow(row: RawTermRow): BoardTerm {
  return {
    termId: row.termId,
    termLabel: row.termLabel,
    startDate: row.startDate,
    endDate: row.endDate,
    isCurrent: Boolean(row.isCurrent),
    theme: row.theme,
  };
}

function mapMemberRow(row: RawMemberRow): ExecutiveMember {
  return {
    id: row.id,
    termId: row.termId,
    fullName: row.fullName,
    designation: row.designation,
    lionTitle: row.lionTitle,
    bio: row.bio ? sanitizeMemberText(row.bio) : null,
    profileImageUrl: row.profileImageUrl,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    displayOrder: Number(row.displayOrder) || 0,
    status: row.status,
    isVerified: Boolean(row.isVerified),
  };
}

/**
 * Retrieves all Lionistic board terms sorted with current term first, then newest first.
 */
export function getBoardTermsFromDb(customDb?: DatabaseSync): BoardTerm[] {
  try {
    const db = customDb || getDatabase();
    const sql = `
      SELECT
        term_id AS termId,
        term_label AS termLabel,
        start_date AS startDate,
        end_date AS endDate,
        is_current AS isCurrent,
        theme
      FROM board_terms
      ORDER BY is_current DESC, start_date DESC
    `;
    const rows = db.prepare(sql).all() as unknown as RawTermRow[];
    if (!rows || rows.length === 0) {
      return getBoardTermsSorted(BOARD_TERMS);
    }
    return rows.map(mapTermRow);
  } catch (err) {
    console.error('[BoardRepository] Error loading terms:', (err as Error)?.message);
    return getBoardTermsSorted(BOARD_TERMS);
  }
}

/**
 * Retrieves verified, active executive committee members ordered by display_order ASC.
 * Strictly blocks INACTIVE or unverified records (AC-4, AC-5).
 */
export function getExecutiveMembersFromDb(
  termId?: string,
  customDb?: DatabaseSync
): ExecutiveMember[] {
  try {
    const db = customDb || getDatabase();
    let sql = `
      SELECT
        member_id AS id,
        term_id AS termId,
        full_name AS fullName,
        designation,
        lion_title AS lionTitle,
        bio,
        profile_image_url AS profileImageUrl,
        contact_email AS contactEmail,
        contact_phone AS contactPhone,
        display_order AS displayOrder,
        status,
        is_verified AS isVerified
      FROM executive_members
      WHERE status = 'ACTIVE' AND is_verified = 1
    `;

    const params: string[] = [];
    if (termId) {
      sql += ' AND term_id = ?';
      params.push(termId);
    }

    sql += ' ORDER BY display_order ASC';

    const rows = db.prepare(sql).all(...params) as unknown as RawMemberRow[];
    if (!rows || rows.length === 0) {
      const fallback = VERIFIED_BOARD_MEMBERS.filter(
        (m) => m.status === 'ACTIVE' && m.isVerified && (!termId || m.termId === termId)
      );
      return [...fallback].sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return rows.map(mapMemberRow);
  } catch (err) {
    console.error('[BoardRepository] Error loading members:', (err as Error)?.message);
    const fallback = VERIFIED_BOARD_MEMBERS.filter(
      (m) => m.status === 'ACTIVE' && m.isVerified && (!termId || m.termId === termId)
    );
    return [...fallback].sort((a, b) => a.displayOrder - b.displayOrder);
  }
}

/**
 * Loads complete directory data (terms + verified active members) safely for SSR.
 */
export function getBoardDirectoryFromDb(customDb?: DatabaseSync): BoardDirectoryData {
  const terms = getBoardTermsFromDb(customDb);
  const members = getExecutiveMembersFromDb(undefined, customDb);
  return { terms, members };
}

