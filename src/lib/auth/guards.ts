/**
 * src/lib/auth/guards.ts
 * Server-Side Route and API Authorization Guards
 *
 * Story: LBW-39 (Role-based access control - administrator and editor)
 * Acceptance Criteria:
 *   - AC2: Unauthenticated requests return 401 Unauthorized
 *   - AC3: Insufficient role returns 403 Forbidden
 *   - AC4: Authorization enforced on server, never client-only
 *   - AC5: Zero stack traces or internal implementation details leaked
 *
 * Security Standard: SEC-02, SEC-04
 */

import { NextResponse } from 'next/server.js';
import type { AuthUser, UserRole, Resource, Operation } from '../../types/rbac.ts';
import { satisfiesRole, hasPermission } from '../../types/rbac.ts';
import { verifySessionToken, SESSION_COOKIE_NAME } from './session.ts';

/**
 * Standard Defensive Error Payload (AC5)
 * Strictly omits stack traces, internal paths, and SQL queries.
 */
export interface DefensiveErrorPayload {
  success: false;
  error: 'Unauthorized' | 'Forbidden' | 'InternalServerError';
  message: string;
}

/**
 * Retrieves the cryptographic secret for session validation.
 */
export function getAuthSecret(): string {
  const secret =
    process.env.NEXTAUTH_SECRET ||
    process.env.SUPABASE_SECRET_KEY ||
    'balangoda-dev-session-signing-secret-key-32chars!';
  return secret;
}

/**
 * Extracts session token from HTTP Request headers or Cookie header.
 */
export function extractToken(request: Request | Headers | string | null | undefined): string | null {
  if (!request) return null;

  if (typeof request === 'string') {
    return request;
  }

  const headers = request instanceof Request ? request.headers : request;

  // 1. Check Authorization: Bearer <token>
  const authHeader = headers.get('authorization') || headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Check Cookie header: lbw_session=<token>
  const cookieHeader = headers.get('cookie') || headers.get('Cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    const sessionCookie = cookies.find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
    if (sessionCookie) {
      return sessionCookie.substring(SESSION_COOKIE_NAME.length + 1).trim();
    }
  }

  return null;
}

/**
 * Generates standard defensive JSON error responses (AC5).
 * Stack traces and internal paths are never exposed.
 */
export function createDefensiveAuthResponse(
  status: 401 | 403 | 500,
  message?: string
): NextResponse<DefensiveErrorPayload> {
  const errorType =
    status === 401 ? 'Unauthorized' : status === 403 ? 'Forbidden' : 'InternalServerError';

  const defaultMessages = {
    401: 'Authentication required. Please sign in to access this resource.',
    403: 'Access denied. You do not have permission to perform this operation.',
    500: 'An unexpected internal error occurred. Please try again later.',
  };

  const payload: DefensiveErrorPayload = {
    success: false,
    error: errorType,
    message: message || defaultMessages[status],
  };

  return NextResponse.json(payload, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export interface GuardResult {
  user: AuthUser | null;
  errorResponse: NextResponse<DefensiveErrorPayload> | null;
}

/**
 * Server-Side Authentication Guard (AC2, AC4)
 * Validates session token; returns 401 if unauthenticated.
 */
export async function requireAuth(request: Request | Headers): Promise<GuardResult> {
  const token = extractToken(request);
  const secret = getAuthSecret();

  if (!token) {
    return {
      user: null,
      errorResponse: createDefensiveAuthResponse(401),
    };
  }

  const user = await verifySessionToken(token, secret);
  if (!user) {
    return {
      user: null,
      errorResponse: createDefensiveAuthResponse(
        401,
        'Invalid or expired session. Please sign in again.'
      ),
    };
  }

  return {
    user,
    errorResponse: null,
  };
}

/**
 * Server-Side Role Guard (AC3, AC4)
 * Enforces role hierarchy on the server. Returns 401 if unauthenticated, 403 if role insufficient.
 */
export async function requireRole(
  request: Request | Headers,
  requiredRole: UserRole
): Promise<GuardResult> {
  const authResult = await requireAuth(request);
  if (authResult.errorResponse || !authResult.user) {
    return authResult;
  }

  const user = authResult.user;
  if (!satisfiesRole(user.role, requiredRole)) {
    return {
      user,
      errorResponse: createDefensiveAuthResponse(
        403,
        `Access denied. This operation requires ${requiredRole === 'ADMIN' ? 'Administrator' : 'Editor'} privileges.`
      ),
    };
  }

  return {
    user,
    errorResponse: null,
  };
}

/**
 * Server-Side Operation Permission Guard (AC1, AC3, AC4)
 * Enforces granular resource:operation permission on the server.
 */
export async function requirePermission(
  request: Request | Headers,
  resource: Resource,
  operation: Operation
): Promise<GuardResult> {
  const authResult = await requireAuth(request);
  if (authResult.errorResponse || !authResult.user) {
    return authResult;
  }

  const user = authResult.user;
  if (!hasPermission(user.role, resource, operation)) {
    return {
      user,
      errorResponse: createDefensiveAuthResponse(
        403,
        `Access denied. Your role (${user.role}) is not authorized to ${operation.toLowerCase()} ${resource.toLowerCase()}.`
      ),
    };
  }

  return {
    user,
    errorResponse: null,
  };
}
