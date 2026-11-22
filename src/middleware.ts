/**
 * src/middleware.ts
 * Next.js Edge-Compatible Administrative & RBAC Route Middleware
 *
 * Story: LBW-39 (Role-based access control - administrator and editor)
 * Acceptance Criteria:
 *   - AC2: Unauthenticated requests to /admin/* routes reject (401) and redirect UI to login screen
 *   - AC3: User without required role receives 403 on restricted operations
 *   - AC4: Authorization enforced on server, not solely by hiding UI
 *   - AC5: Error responses contain no stack traces or internal details
 *
 * Security Standard: SEC-02, SEC-04
 */

import { NextResponse } from 'next/server.js';
import type { NextRequest } from 'next/server.js';
import { verifySessionToken, SESSION_COOKIE_NAME } from './lib/auth/session.ts';
import { getAuthSecret, createDefensiveAuthResponse } from './lib/auth/guards.ts';

/**
 * Super-Admin Only Routes (Require ADMIN role)
 * Editors are rejected with 403 Forbidden.
 */
const ADMIN_ONLY_PATHS = [
  '/admin/users',
  '/admin/settings',
  '/api/admin/users',
  '/api/admin/submissions/export',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and public assets to bypass middleware
  if (pathname === '/admin/login' || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Check if the current route is an administrative page or protected API
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  // 1. Extract session token from cookie or Authorization header
  const tokenFromCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = tokenFromCookie || tokenFromHeader;

  const secret = getAuthSecret();
  const user = await verifySessionToken(token, secret);

  // 2. AC2: Handle unauthenticated requests
  if (!user) {
    if (isAdminApi) {
      // API requests receive 401 Unauthorized JSON response
      return createDefensiveAuthResponse(
        401,
        'Authentication required. Please sign in to access this API.'
      );
    }

    // Page requests redirect to /admin/login with redirect query param
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. AC3: Enforce role-based access for Administrator-only paths
  const isAdminOnlyRoute = ADMIN_ONLY_PATHS.some((path) => pathname.startsWith(path));
  if (isAdminOnlyRoute && user.role !== 'ADMIN') {
    if (isAdminApi) {
      return createDefensiveAuthResponse(
        403,
        'Access denied. Administrator privilege is required for this operation.'
      );
    }

    // For web page navigation, redirect to dashboard with access denial notice
    const dashboardUrl = new URL('/admin', request.url);
    dashboardUrl.searchParams.set('error', 'forbidden');
    return NextResponse.redirect(dashboardUrl);
  }

  // 4. Attach verified user headers for downstream server components and handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.userId);
  requestHeaders.set('x-user-role', user.role);
  requestHeaders.set('x-user-email', user.email);
  requestHeaders.set('x-user-name', encodeURIComponent(user.fullName));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
