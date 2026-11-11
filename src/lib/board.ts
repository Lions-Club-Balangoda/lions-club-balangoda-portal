import type { BoardTerm, ExecutiveMember, BoardDirectoryViewModel } from '../types/board.ts';
import { BOARD_TERMS, VERIFIED_BOARD_MEMBERS } from '../data/board-members.ts';

/**
 * Checks if the application is running in staging or production.
 * Requirement (AC-5): Only verified, club-approved data appears in staging/production.
 */
export function isStagingOrProduction(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
  return nodeEnv === 'production' || appEnv === 'staging' || appEnv === 'production';
}

/**
 * Sorts board terms so the current term appears first, followed by previous terms newest-first.
 */
export function getBoardTermsSorted(terms: BoardTerm[] = BOARD_TERMS): BoardTerm[] {
  return [...terms].sort((a, b) => {
    if (a.isCurrent !== b.isCurrent) {
      return a.isCurrent ? -1 : 1;
    }
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });
}

/**
 * Selects the default board term (the current committee by default, AC-1).
 */
export function getDefaultBoardTerm(terms: BoardTerm[] = BOARD_TERMS): BoardTerm | null {
  if (!terms || terms.length === 0) return null;
  const current = terms.find((t) => t.isCurrent);
  if (current) return current;
  const sorted = getBoardTermsSorted(terms);
  return sorted[0] || null;
}

/**
 * Validates whether a given string is a syntactically valid Lionistic Year format (e.g., "2025-2026").
 * Must follow YYYY-YYYY where endYear === startYear + 1.
 */
export function validateLionisticYearFormat(year: unknown): boolean {
  if (typeof year !== 'string') return false;
  const trimmed = year.trim();
  const match = /^(\d{4})-(\d{4})$/.exec(trimmed);
  if (!match) return false;

  const start = parseInt(match[1], 10);
  const end = parseInt(match[2], 10);
  return end === start + 1;
}

/**
 * Sanitizes text fields (e.g. bio) against XSS/script injection.
 */
export function sanitizeMemberText(input?: string | null): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>?/gm, '')
    .trim();
}

/**
 * Filters board terms to include ONLY terms that contain at least one active executive member record.
 * Acceptance criteria: "A year selector lists only years that have board records. Empty years are not offered."
 */
export function filterTermsWithMembers(
  terms: BoardTerm[],
  members: ExecutiveMember[]
): BoardTerm[] {
  const activeMemberCountMap = new Map<string, number>();
  for (const member of members) {
    if (member.status === 'ACTIVE') {
      const current = activeMemberCountMap.get(member.termId) || 0;
      activeMemberCountMap.set(member.termId, current + 1);
    }
  }

  return terms
    .filter((term) => (activeMemberCountMap.get(term.termId) || 0) > 0)
    .map((term) => ({
      ...term,
      memberCount: activeMemberCountMap.get(term.termId) || 0,
    }))
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

/**
 * Retrieves the current lionistic board term.
 * Looks for `isCurrent === true`, falling back to the most recent term if not explicitly set.
 */
export function getCurrentBoardTerm(terms: BoardTerm[]): BoardTerm | null {
  if (!terms || terms.length === 0) return null;
  const current = terms.find((t) => t.isCurrent);
  if (current) return current;

  return [...terms].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )[0];
}

/**
 * Filters active executive members for a specific lionistic term, sorted by display_order.
 */
export function getMembersForTerm(members: ExecutiveMember[], termId: string): ExecutiveMember[] {
  if (!termId || !members) return [];
  return members
    .filter((m) => m.termId === termId && m.status === 'ACTIVE')
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Retrieves active, verified members for a specific Lionistic term,
 * ordered strictly by displayOrder ascending (AC-4, LBW-48).
 */
export function getMembersByTerm(
  members: ExecutiveMember[] = VERIFIED_BOARD_MEMBERS,
  termId: string,
  options: { allowUnverified?: boolean } = {}
): ExecutiveMember[] {
  if (!termId) return [];

  const allowUnverified = isStagingOrProduction() ? false : Boolean(options.allowUnverified);

  return members
    .filter((member) => {
      if (member.termId !== termId) return false;
      if (member.status !== 'ACTIVE') return false;
      if (!allowUnverified && member.isVerified === false) return false;
      return true;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Generates clean 1-2 character monogram initials for members without a portrait photo (AC-3).
 */
export function getMemberInitials(fullName: string): string {
  if (!fullName || !fullName.trim()) return 'LC';

  const parts = fullName
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/[^a-zA-Z]/g, ''))
    .filter((part) => part.length > 0 && !['Dr', 'Prof', 'Mr', 'Mrs', 'Ms'].includes(part));

  if (parts.length === 0) return 'LC';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();

  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return `${first}${last}`.toUpperCase();
}

/**
 * Formats the display name combining optional Lionistic title and full name.
 */
export function formatMemberDisplayName(
  member: Pick<ExecutiveMember, 'lionTitle' | 'fullName'>
): string {
  const title = member.lionTitle?.trim();
  const name = member.fullName?.trim();
  if (!name) return '';
  return title ? `${title} ${name}` : name;
}

/**
 * Resolves the view model state for the board directory.
 *
 * Acceptance Criteria Handled:
 * 1. Only years that have board records are listed.
 * 2. Current year is preselected when no year or default is loaded.
 * 3. Empty years are not offered.
 * 4. An invalid year in the URL shows a friendly message and safely defaults to current year.
 */
export function resolveBoardDirectoryState(
  terms: BoardTerm[],
  members: ExecutiveMember[],
  requestedYear?: string | null
): BoardDirectoryViewModel {
  const termsWithRecords = filterTermsWithMembers(terms, members);
  const currentTerm = getCurrentBoardTerm(termsWithRecords);

  if (termsWithRecords.length === 0 || !currentTerm) {
    return {
      terms: [],
      selectedTerm: null,
      members: [],
      isInvalidYear: Boolean(requestedYear),
      invalidYearRequested: requestedYear || null,
    };
  }

  // Case 1: No specific year requested in URL -> preselect current year
  if (!requestedYear || !requestedYear.trim()) {
    return {
      terms: termsWithRecords,
      selectedTerm: currentTerm,
      members: getMembersForTerm(members, currentTerm.termId),
      isInvalidYear: false,
      invalidYearRequested: null,
    };
  }

  const cleanRequestedYear = requestedYear.trim();

  // Case 2: Specific year requested -> verify it exists in termsWithRecords
  const matchedTerm = termsWithRecords.find(
    (t) => t.termId.toLowerCase() === cleanRequestedYear.toLowerCase()
  );

  if (matchedTerm) {
    return {
      terms: termsWithRecords,
      selectedTerm: matchedTerm,
      members: getMembersForTerm(members, matchedTerm.termId),
      isInvalidYear: false,
      invalidYearRequested: null,
    };
  }

  // Case 3: Invalid year in URL or empty year requested -> show friendly message and fallback to current
  return {
    terms: termsWithRecords,
    selectedTerm: currentTerm,
    members: getMembersForTerm(members, currentTerm.termId),
    isInvalidYear: true,
    invalidYearRequested: cleanRequestedYear,
  };
}
