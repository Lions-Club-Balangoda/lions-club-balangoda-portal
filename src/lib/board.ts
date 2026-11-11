import type { BoardTerm, ExecutiveMember } from '../types/board.ts';
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
 * Retrieves active, verified members for a specific Lionistic term,
 * ordered strictly by displayOrder ascending (AC-4).
 *
 * AC-5 Enforcement: In staging/production (or by default), unverified items are strictly blocked.
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
      if (!allowUnverified && !member.isVerified) return false;
      return true;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Generates clean 1-2 character monogram initials for members without a portrait photo (AC-3).
 */
export function getMemberInitials(fullName: string): string {
  if (!fullName || !fullName.trim()) return 'LC';

  // Strip initials/prefixes like "Dr.", "Prof.", "T." when forming two-letter avatar
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
export function formatMemberDisplayName(member: Pick<ExecutiveMember, 'lionTitle' | 'fullName'>): string {
  const title = member.lionTitle?.trim();
  const name = member.fullName?.trim();
  if (!name) return '';
  return title ? `${title} ${name}` : name;
}

