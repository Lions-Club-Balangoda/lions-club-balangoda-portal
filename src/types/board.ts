/**
 * Executive Board Directory and Lionistic Term Types
 * Aligned with Database Schema Specification (Docs/database-schema-specification.md)
 */

export type MemberStatus = 'ACTIVE' | 'INACTIVE';

export interface BoardTerm {
  termId: string; // e.g., '2025-2026'
  termLabel: string; // e.g., 'Lionistic Year 2025/2026'
  startDate: string; // ISO Date YYYY-MM-DD
  endDate: string; // ISO Date YYYY-MM-DD
  isCurrent: boolean;
  theme?: string | null;
}

export interface ExecutiveMember {
  id: string;
  termId: string;
  fullName: string;
  designation: string;
  lionTitle?: string | null;
  bio?: string | null;
  profileImageUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  displayOrder: number;
  status: MemberStatus;
  isVerified: boolean;
}

export interface BoardDirectoryData {
  terms: BoardTerm[];
  members: ExecutiveMember[];
}

