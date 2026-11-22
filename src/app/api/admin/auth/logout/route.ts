/**
 * src/app/api/admin/auth/logout/route.ts
 * Admin CMS Logout Route Handler
 *
 * Workflow: WF-AUTH-03 (Admin Logout)
 */

import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '../../../../lib/auth/session.ts';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'You have safely signed out.',
  });

  // Clear HTTP-only session cookie
  response.cookies.delete(SESSION_COOKIE_NAME);

  return response;
}
