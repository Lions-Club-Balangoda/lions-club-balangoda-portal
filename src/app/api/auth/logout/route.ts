import { NextResponse } from 'next/server.js';

/**
 * API Route: POST /api/auth/logout
 * Handles officer logout, terminates session, and deletes authentication cookies.
 */
export async function POST() {
  const response = NextResponse.json(
    {
      success: true,
      message: 'You have been securely signed out.',
    },
    { status: 200 }
  );

  response.cookies.delete('lions_session_token');
  response.cookies.set({
    name: 'lions_session_token',
    value: '',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
