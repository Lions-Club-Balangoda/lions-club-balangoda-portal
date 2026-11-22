import { NextResponse, type NextRequest } from 'next/server.js';
import { authenticateUser } from '../../../../lib/auth/session.ts';
import { createSafeErrorResponse } from '../../../../lib/security/safe-error.ts';

/**
 * API Route: POST /api/auth/login
 * Handles officer authentication into the CMS.
 *
 * Security Requirements:
 * - Constant-time bcrypt password verification (SEC-04).
 * - Generic error messages to prevent username enumeration.
 * - Secure HTTP-only session cookie set upon successful authentication.
 * - Returns session token and user profile for client state.
 */
export async function POST(request: Request | NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const identifier = (body.identifier || body.email || body.username) as string;
    const password = body.password as string;

    const authResult = await authenticateUser(identifier, password);

    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error,
        },
        { status: authResult.statusCode }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        user: authResult.user,
        token: authResult.token,
      },
      { status: 200 }
    );

    // Set secure HTTP-only session cookie
    response.cookies.set({
      name: 'lions_session_token',
      value: authResult.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;
  } catch (err) {
    return createSafeErrorResponse(err, {
      statusCode: 500,
      fallbackMessage: 'Authentication service temporarily unavailable. Please try again.',
      trackingPrefix: 'API /api/auth/login',
    });
  }
}
