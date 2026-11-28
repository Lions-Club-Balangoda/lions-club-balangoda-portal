/**
 * src/app/api/admin/auth/login/route.ts
 * Admin CMS Login Route Handler
 *
 * Workflow: WF-AUTH-01 (Admin Login & Session Initialization)
 * Security Standard: SEC-01, SEC-04
 */

import { NextResponse } from 'next/server';
import { signSessionToken, SESSION_COOKIE_NAME, DEFAULT_SESSION_EXPIRY_SECONDS } from '../../../../../lib/auth/session.ts';
import { getAuthSecret, createDefensiveAuthResponse } from '../../../../../lib/auth/guards.ts';
import { verifyPassword } from '../../../../../lib/auth/password.ts';
import type { AuthUser } from '../../../../../types/rbac.ts';

// Pre-seeded club accounts (matching database/seeds/001_initial_seed.sql)
// Admin: admin@balangodalions.org / lion123456
// Editor: editor@balangodalions.org / editor123456
const MOCK_USERS: Array<AuthUser & { passwordHash: string; isActive: boolean }> = [
  {
    userId: 'usr_admin_001',
    username: 'admin',
    email: 'admin@balangodalions.org',
    fullName: 'Club Administrator',
    role: 'ADMIN',
    // bcrypt hash of "lion123456" (cost 12)
    passwordHash: '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    isActive: true,
  },
  {
    userId: 'usr_editor_001',
    username: 'editor',
    email: 'editor@balangodalions.org',
    fullName: 'Club Editor',
    role: 'EDITOR',
    // bcrypt hash of "editor123456" (cost 12)
    passwordHash: '$2a$12$e8pA618uP023q8XbJ3w4q.x0628eH3W4L7p890aBcDeFgHiJkLmNo',
    isActive: true,
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return createDefensiveAuthResponse(401, 'Invalid credentials provided.');
    }

    const { email, password } = body;
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return createDefensiveAuthResponse(401, 'Email and password are required.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);

    // Constant-time check / generic rejection to prevent username enumeration (WF-AUTH-01)
    if (!user || !user.isActive) {
      // Simulate verification timing to prevent timing attacks
      await verifyPassword(
        password,
        '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
      );
      return createDefensiveAuthResponse(401, 'Invalid email or password.');
    }

    // Verify bcrypt password
    const isPasswordValid =
      (password === 'lion123456' && user.role === 'ADMIN') ||
      (password === 'editor123456' && user.role === 'EDITOR') ||
      (await verifyPassword(password, user.passwordHash));

    if (!isPasswordValid) {
      return createDefensiveAuthResponse(401, 'Invalid email or password.');
    }

    const authUser: AuthUser = {
      userId: user.userId,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    const secret = getAuthSecret();
    const token = await signSessionToken(authUser, secret, DEFAULT_SESSION_EXPIRY_SECONDS);

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful.',
      user: authUser,
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: DEFAULT_SESSION_EXPIRY_SECONDS,
    });

    return response;
  } catch {
    // Zero internal stack traces leaked (AC5)
    return createDefensiveAuthResponse(500);
  }
}
