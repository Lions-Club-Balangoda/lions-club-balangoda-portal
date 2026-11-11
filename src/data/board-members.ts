import type { BoardTerm, ExecutiveMember } from '../types/board.ts';

/**
 * Verified Lionistic Board Terms
 * Aligned with database/seeds/001_initial_seed.sql
 */
export const BOARD_TERMS: BoardTerm[] = [
  {
    termId: '2025-2026',
    termLabel: 'Lionistic Year 2025/2026',
    startDate: '2025-07-01',
    endDate: '2026-06-30',
    isCurrent: true,
    theme: 'Lead With Care, Serve With Pride',
  },
  {
    termId: '2024-2025',
    termLabel: 'Lionistic Year 2024/2025',
    startDate: '2024-07-01',
    endDate: '2025-06-30',
    isCurrent: false,
    theme: 'Make Your Mark',
  },
  {
    termId: '2023-2024',
    termLabel: 'Lionistic Year 2023/2024',
    startDate: '2023-07-01',
    endDate: '2024-06-30',
    isCurrent: false,
    theme: 'Changing the World through Service',
  },
];

/**
 * Club-approved verified Executive Committee records
 * Sources: Docs/requirements-validation-session-minutes.md & Docs/mvp-scope-specification.md
 * Note: Per AC-5, only verified, club-approved data appears in staging/production.
 */
export const VERIFIED_BOARD_MEMBERS: ExecutiveMember[] = [
  {
    id: 'exec-2025-001',
    termId: '2025-2026',
    fullName: 'T. Sanjeewa Prasad Jayaweera',
    designation: 'Club President',
    lionTitle: 'Lion Prof.',
    bio: 'Authorized Club President leading strategic community service and educational upliftment across the Balangoda region.',
    profileImageUrl: null,
    contactEmail: 'lionsbalangoda@gmail.com',
    contactPhone: null,
    displayOrder: 1,
    status: 'ACTIVE',
    isVerified: true,
  },
  {
    id: 'exec-2025-002',
    termId: '2025-2026',
    fullName: 'H.M. Bandara',
    designation: 'Club Secretary',
    lionTitle: 'Lion',
    bio: 'Club Secretary & Administrative Officer overseeing secretariat correspondence, board records, and community intake.',
    profileImageUrl: null,
    contactEmail: 'lionsbalangoda@gmail.com',
    contactPhone: null,
    displayOrder: 2,
    status: 'ACTIVE',
    isVerified: true,
  },
  {
    id: 'exec-2025-003',
    termId: '2025-2026',
    fullName: 'K.G. Wijeratne',
    designation: 'Club Treasurer',
    lionTitle: 'Lion',
    bio: 'Club Treasurer & Finance Director managing humanitarian project funds, governance, and donor transparency.',
    profileImageUrl: null,
    contactEmail: null,
    contactPhone: null,
    displayOrder: 3,
    status: 'ACTIVE',
    isVerified: true,
  },
  {
    id: 'exec-2025-004',
    termId: '2025-2026',
    fullName: 'Dr. R.M. Senarathne',
    designation: 'Project Committee Chair',
    lionTitle: 'Lion',
    bio: null, // Intentionally omitted until verified bio is supplied (tests clean rendering without bio)
    profileImageUrl: null,
    contactEmail: null,
    contactPhone: null,
    displayOrder: 4,
    status: 'ACTIVE',
    isVerified: true,
  },
];

