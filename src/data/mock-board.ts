import type { BoardTerm, ExecutiveMember } from '../types/board.ts';

export const SEED_BOARD_TERMS: BoardTerm[] = [
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
    // Intentionally 0 members in this term to test acceptance criterion:
    // "Empty years are not offered in the selector"
  },
];

export const SEED_EXECUTIVE_MEMBERS: ExecutiveMember[] = [
  // 2025-2026 (Current Term)
  {
    memberId: 'mem-2025-001',
    termId: '2025-2026',
    fullName: 'T. Sanjeewa Prasad Jayaweera',
    designation: 'Club President',
    lionTitle: 'Lion Prof.',
    bio: 'Dean & Professor leading community service, educational upliftment, and sustainable healthcare initiatives across the Balangoda region.',
    profileImageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    contactEmail: 'president@lionsclubbalangoda.org',
    contactPhone: '+94 45 228 7200',
    displayOrder: 1,
    status: 'ACTIVE',
  },
  {
    memberId: 'mem-2025-002',
    termId: '2025-2026',
    fullName: 'Sunil Rathnayake',
    designation: 'Club Secretary',
    lionTitle: 'Lion',
    bio: 'Overseeing club administrative affairs, project correspondence, and international reporting with District 306.',
    profileImageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    contactEmail: 'secretary@lionsclubbalangoda.org',
    contactPhone: '+94 45 228 7201',
    displayOrder: 2,
    status: 'ACTIVE',
  },
  {
    memberId: 'mem-2025-003',
    termId: '2025-2026',
    fullName: 'Chinthaka Fernando',
    designation: 'Club Treasurer',
    lionTitle: 'Lion',
    bio: 'Directing club financial governance, philanthropic project audit transparency, and treasury stewardship.',
    profileImageUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    contactEmail: 'treasurer@lionsclubbalangoda.org',
    contactPhone: '+94 45 228 7202',
    displayOrder: 3,
    status: 'ACTIVE',
  },
  {
    memberId: 'mem-2025-004',
    termId: '2025-2026',
    fullName: 'Dr. R.M. Senarathne',
    designation: '1st Vice President & Project Chair',
    lionTitle: 'Lion Dr.',
    bio: 'Consultant physician spearheading rural vision testing clinics and disaster health relief camps.',
    profileImageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    contactEmail: 'projects@lionsclubbalangoda.org',
    contactPhone: '+94 45 228 7203',
    displayOrder: 4,
    status: 'ACTIVE',
  },
  {
    memberId: 'mem-2025-005',
    termId: '2025-2026',
    fullName: 'H.M. Bandara',
    designation: 'Club Director & Membership Chair',
    lionTitle: 'Lion',
    bio: 'Dedicated community leader coordinating volunteer engagement and sustainable youth service wings.',
    profileImageUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    contactEmail: 'membership@lionsclubbalangoda.org',
    contactPhone: '+94 45 228 7204',
    displayOrder: 5,
    status: 'ACTIVE',
  },
  {
    // Inactive member: should never appear in active board directory
    memberId: 'mem-2025-006-inactive',
    termId: '2025-2026',
    fullName: 'K.G. Somapala',
    designation: 'Honorary Member (Inactive)',
    lionTitle: 'Lion',
    bio: 'Past honorary member.',
    profileImageUrl: null,
    contactEmail: null,
    contactPhone: null,
    displayOrder: 99,
    status: 'INACTIVE',
  },

  // 2024-2025 (Past Committee)
  {
    memberId: 'mem-2024-001',
    termId: '2024-2025',
    fullName: 'H.M. Bandara',
    designation: 'Immediate Past President',
    lionTitle: 'Lion',
    bio: 'Led the landmark Sabaragamuwa environmental reforestation program and youth empowerment drive during 2024/2025.',
    profileImageUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    contactEmail: 'pastpresident@lionsclubbalangoda.org',
    contactPhone: '+94 45 228 7204',
    displayOrder: 1,
    status: 'ACTIVE',
  },
  {
    memberId: 'mem-2024-002',
    termId: '2024-2025',
    fullName: 'Samantha Perera',
    designation: 'Club Secretary (2024-2025)',
    lionTitle: 'Lion',
    bio: 'Managed club correspondence, documentation, and charter anniversary events in the 2024-2025 lionistic year.',
    profileImageUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    contactEmail: 'pastsecretary@lionsclubbalangoda.org',
    contactPhone: null,
    displayOrder: 2,
    status: 'ACTIVE',
  },
  {
    memberId: 'mem-2024-003',
    termId: '2024-2025',
    fullName: 'Nihal Jayawardena',
    designation: 'Club Treasurer (2024-2025)',
    lionTitle: 'Lion',
    bio: 'Safeguarded club financial stewardship and oversaw disaster relief funds distribution across Balangoda.',
    profileImageUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    contactEmail: 'pasttreasurer@lionsclubbalangoda.org',
    contactPhone: null,
    displayOrder: 3,
    status: 'ACTIVE',
  },
];
