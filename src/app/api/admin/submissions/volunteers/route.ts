/**
 * src/app/api/admin/submissions/volunteers/route.ts
 * Protected Volunteer Submissions Review Endpoint for Club Officers
 *
 * Story: LBW-51 (AC6: Personal data readable only by authorized administrators via CMS)
 * Security Standard: SEC-01 (Data Privacy), SEC-04 (Access Control)
 */

import { NextResponse } from 'next/server.js';
import { requirePermission } from '../../../../../lib/auth/guards.ts';
import { getVolunteerApplications } from '../../../../../lib/volunteers-repository.ts';

export async function GET(request: Request) {
  // AC6: Enforce server-side authorization (VOLUNTEERS:READ)
  const auth = await requirePermission(request, 'VOLUNTEERS', 'READ');
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const applications = getVolunteerApplications(100, 0);

  return NextResponse.json({
    success: true,
    count: applications.length,
    data: applications,
  });
}
