import { NextResponse, type NextRequest } from 'next/server';
import { verifyCsrfRequest } from './lib/security/csrf';
import { getSecurityHeaders } from './lib/security/headers';

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

  // 2. Proceed with request processing
  const response = NextResponse.next();

  // 3. Attach standard security headers
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
