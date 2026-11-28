/**
 * src/app/api/admin/submissions/export/route.ts
 * Volunteer & Inquiry Submissions CSV Export Endpoint
 *
 * Story: LBW-39 (AC1, AC3: Only Administrator can export submissions)
 * Requirements: FR-07 (Submissions CSV Export), SEC-01 (Privacy Protection)
 */

import { NextResponse } from 'next/server';
import { requirePermission } from '../../../../../lib/auth/guards.ts';

const MOCK_VOLUNTEER_SUBMISSIONS = [
  {
    id: 'vol_001',
    fullName: 'Kamal Perera',
    email: 'kamal.perera@example.com',
    phone: '+94 77 123 4567',
    interest: 'Vision Care & Health Camps',
    status: 'REVIEWED',
    createdAt: '2026-11-15T09:00:00Z',
  },
  {
    id: 'vol_002',
    fullName: 'Nimali Jayawardena',
    email: 'nimali.j@example.com',
    phone: '+94 71 987 6543',
    interest: 'Youth Education & Literacy',
    status: 'NEW',
    createdAt: '2026-11-16T14:30:00Z',
  },
];

export async function GET(request: Request) {
  // AC1, AC3: Only Administrator can export submissions
  const auth = await requirePermission(request, 'VOLUNTEERS', 'EXPORT');
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  // Format RFC 4180 CSV export
  const headers = ['Submission ID', 'Full Name', 'Email', 'Phone', 'Area of Interest', 'Status', 'Submitted At'];
  const rows = MOCK_VOLUNTEER_SUBMISSIONS.map((s) => [
    s.id,
    `"${s.fullName.replace(/"/g, '""')}"`,
    `"${s.email.replace(/"/g, '""')}"`,
    `"${s.phone.replace(/"/g, '""')}"`,
    `"${s.interest.replace(/"/g, '""')}"`,
    s.status,
    s.createdAt,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="lions_club_volunteers_export.csv"',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
