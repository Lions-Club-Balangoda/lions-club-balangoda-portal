/**
 * src/app/api/admin/users/route.ts
 * Super-Admin User Management Endpoint
 *
 * Story: LBW-39 (AC1, AC3: Only Administrator can manage users)
 * Acceptance Criteria:
 *   - AC2: Unauthenticated requests rejected with 401
 *   - AC3: User without ADMIN role receives 403 Forbidden
 *   - AC4: Enforced on the server
 *   - AC5: No stack traces or SQL details in error responses
 */

import { NextResponse } from 'next/server';
import { requireRole } from '../../../../lib/auth/guards.ts';

const SYSTEM_USERS = [
  {
    userId: 'usr_admin_001',
    username: 'admin',
    email: 'admin@balangodalions.org',
    fullName: 'Club Administrator',
    role: 'ADMIN',
    isActive: true,
    lastLoginAt: '2026-11-20T10:15:00Z',
  },
  {
    userId: 'usr_editor_001',
    username: 'editor',
    email: 'editor@balangodalions.org',
    fullName: 'Club Editor',
    role: 'EDITOR',
    isActive: true,
    lastLoginAt: '2026-11-19T14:30:00Z',
  },
];

export async function GET(request: Request) {
  // Enforce ADMIN role on the server (AC1, AC3, AC4)
  const auth = await requireRole(request, 'ADMIN');
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  return NextResponse.json({
    success: true,
    data: SYSTEM_USERS,
  });
}

export async function POST(request: Request) {
  const auth = await requireRole(request, 'ADMIN');
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const body = await request.json();
    const { username, email, fullName, role } = body;

    if (!username || !email || !fullName || !role) {
      return NextResponse.json(
        { success: false, error: 'ValidationError', message: 'All user fields are required.' },
        { status: 400 }
      );
    }

    if (role !== 'ADMIN' && role !== 'EDITOR') {
      return NextResponse.json(
        { success: false, error: 'ValidationError', message: 'Role must be ADMIN or EDITOR.' },
        { status: 400 }
      );
    }

    const newUser = {
      userId: `usr_${Date.now()}`,
      username: username.trim(),
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      role,
      isActive: true,
      lastLoginAt: null,
    };

    return NextResponse.json(
      {
        success: true,
        message: `Officer account created with role ${role}.`,
        data: newUser,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'InternalServerError', message: 'Failed to create user.' },
      { status: 500 }
    );
  }
}
