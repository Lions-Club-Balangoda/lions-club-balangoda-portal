import { NextResponse, type NextRequest } from 'next/server.js';
import { verifyCsrfRequest } from './lib/security/csrf.ts';
import { getSecurityHeaders } from './lib/security/headers.ts';

/**
 * Global Edge Security Middleware (SEC-01, SEC-03, SEC-05)
 *
 * Enforces:
 * 1. Anti-CSRF verification on all state-changing requests (POST, PUT, PATCH, DELETE).
 * 2. Origin and Sec-Fetch-Site validation.
 * 3. Security response headers (CSP, HSTS, frame protections, nosniff, referrer policy).
 */
export function middleware(request: NextRequest) {
  // 1. Anti-CSRF check for state-changing HTTP requests
  const csrfResult = verifyCsrfRequest(request);
  if (!csrfResult.valid) {
    return NextResponse.json(
      {
        success: false,
        error: csrfResult.reason || 'CSRF verification failed: Request blocked.',
      },
      {
        status: csrfResult.statusCode || 403,
      }
    );
  }

  // 2. Admin Route Protection & Authentication Redirection (LBW-43 AC-3)
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const sessionCookie =
      request.cookies.get('lions_session_token')?.value ||
      request.cookies.get('session_token')?.value;

    const authHeader = request.headers.get('authorization');
    const bearerToken =
      authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    const token = sessionCookie || bearerToken;
    let hasValidToken = false;

    if (token && typeof token === 'string' && token.includes('.')) {
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          while (base64.length % 4) {
            base64 += '=';
          }
          const payloadJson = atob(base64);
          const payload = JSON.parse(payloadJson);
          const now = Math.floor(Date.now() / 1000);
          if (payload && (!payload.exp || payload.exp > now)) {
            hasValidToken = true;
          }
        } catch {
          hasValidToken = false;
        }
      }
    }

    if (!hasValidToken) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Proceed with request processing
  const response = NextResponse.next();

  // 4. Attach standard security headers
  const securityHeaders = getSecurityHeaders();
  for (const header of securityHeaders) {
    response.headers.set(header.key, header.value);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Apply middleware to all request paths except:
     * - _next/static (static client bundles)
     * - _next/image (image optimization files)
     * - favicon.ico (metadata icon)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
