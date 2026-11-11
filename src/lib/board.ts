import type { BoardTerm, ExecutiveMember, BoardDirectoryViewModel } from '../types/board.ts';

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
 * Filters board terms to include ONLY terms that contain at least one active executive member record.
 * Acceptance criteria: "A year selector lists only years that have board records. Empty years are not offered."
 */
export function filterTermsWithMembers(
  terms: BoardTerm[],
  members: ExecutiveMember[]
): BoardTerm[] {
  // Count active members per term
  const activeMemberCountMap = new Map<string, number>();
  for (const member of members) {
    if (member.status === 'ACTIVE') {
      const current = activeMemberCountMap.get(member.termId) || 0;
      activeMemberCountMap.set(member.termId, current + 1);
    }
  }

  // Filter only terms with > 0 active members, attaching the count
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

  // Fallback to highest start_date
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

  // If no terms have records at all
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
