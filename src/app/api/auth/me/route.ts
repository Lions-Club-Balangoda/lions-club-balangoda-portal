import { NextResponse, type NextRequest } from 'next/server.js';
import { authorizeRequest } from '../../../../lib/auth/session.ts';

/**
 * API Route: GET /api/auth/me
 * Retrieves current authenticated officer session details.
 */
export async function GET(request: Request | NextRequest) {
  const auth = authorizeRequest(request);
  if (!auth.authorized) {
    return NextResponse.json(
      {
        success: false,
        error: auth.error,
      },
      { status: auth.statusCode }
    );
  }

  return NextResponse.json(
    {
      success: true,
      user: auth.user,
    },
    { status: 200 }
  );
}
