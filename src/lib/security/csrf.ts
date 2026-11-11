import crypto from 'node:crypto';

/**
 * Anti-CSRF Protection Module (SEC-05)
 *
 * Implements defenses against Cross-Site Request Forgery (CSRF):
 * 1. Cryptographically secure random anti-CSRF token generation (32 bytes).
 * 2. Constant-time token verification using crypto.timingSafeEqual to prevent side-channel timing leaks.
 * 3. Origin & Fetch Metadata (Sec-Fetch-Site) verification on all state-changing methods (POST, PUT, PATCH, DELETE).
 * 4. Double-submit cookie & X-CSRF-Token header validation for cookie-based state-modifying requests.
 *
 * RATIONALE ON TOKEN AUTH WITHOUT COOKIES (SEC-05 Architecture):
 * When an administrative client uses pure Bearer Token authentication (Authorization: Bearer <JWT>)
 * stored in non-ambient storage (e.g. memory or IndexedDB) and sent strictly via custom HTTP request headers,
 * the application is inherently immune to browser ambient CSRF attacks. Browsers NEVER automatically
 * attach custom Authorization headers on cross-origin requests, unlike cookies.
 *
 * However, whenever authentication relies on ambient credentials (such as session cookies, HttpOnly cookies,
 * or standard HTML form submissions), Anti-CSRF verification is MANDATORY. This module provides complete
 * defense-in-depth covering both token validation and origin/Sec-Fetch-Site header enforcement.
 */

export const CSRF_HEADER_NAME = 'x-csrf-token';
export const CSRF_COOKIE_NAME = 'lions_csrf_token';
export const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export interface CsrfValidationOptions {
  allowedOrigins?: string[];
  requireTokenForStateChanging?: boolean;
}

export interface CsrfValidationResult {
  valid: boolean;
  reason?: string;
  statusCode?: number;
}

/**
 * Generates a cryptographically strong anti-CSRF token (32 random bytes = 64 hex chars).
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Constant-time comparison of two tokens to defend against timing attacks.
 */
export function verifyCsrfToken(
  submittedToken: string | null | undefined,
  storedToken: string | null | undefined
): boolean {
  if (!submittedToken || !storedToken) {
    return false;
  }

  // Tokens must be non-empty strings of identical character length
  if (typeof submittedToken !== 'string' || typeof storedToken !== 'string') {
    return false;
  }

  const subBuf = Buffer.from(submittedToken, 'utf8');
  const storedBuf = Buffer.from(storedToken, 'utf8');

  if (subBuf.length !== storedBuf.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(subBuf, storedBuf);
  } catch {
    return false;
  }
}

/**
 * Extracts a header value from various Request / Headers shapes.
 */
function getHeader(
  headers: Headers | Record<string, string | string[] | undefined> | undefined,
  name: string
): string | null {
  if (!headers) return null;
  const target = name.toLowerCase();

  if (typeof (headers as Headers).get === 'function') {
    return (headers as Headers).get(target);
  }

  const record = headers as Record<string, string | string[] | undefined>;
  for (const [k, v] of Object.entries(record)) {
    if (k.toLowerCase() === target) {
      if (Array.isArray(v)) return v[0] || null;
      return v || null;
    }
  }
  return null;
}

/**
 * Parses cookies from Cookie header string.
 */
export function parseCookies(cookieHeader: string | null | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  const parts = cookieHeader.split(';');

  for (const part of parts) {
    const [rawKey, ...rawVal] = part.trim().split('=');
    if (rawKey) {
      cookies[rawKey.trim()] = decodeURIComponent(rawVal.join('=').trim());
    }
  }
  return cookies;
}

/**
 * Verifies incoming HTTP request against CSRF attacks on state-changing methods.
 */
export function verifyCsrfRequest(
  request: {
    method?: string;
    url?: string;
    headers?: Headers | Record<string, string | string[] | undefined>;
  },
  options: CsrfValidationOptions = {}
): CsrfValidationResult {
  const method = (request.method || 'GET').toUpperCase();

  // 1. Safe HTTP methods bypass anti-CSRF checks
  if (SAFE_METHODS.has(method)) {
    return { valid: true };
  }

  const headers = request.headers;

  // 2. Fetch Metadata Defense: Sec-Fetch-Site check (Modern Browsers)
  const secFetchSite = getHeader(headers, 'sec-fetch-site');
  if (secFetchSite === 'cross-site') {
    return {
      valid: false,
      reason: 'Cross-site state-changing request blocked by Sec-Fetch-Site policy.',
      statusCode: 403,
    };
  }

  // 3. Origin / Referer Validation against Allowed Origins
  const origin = getHeader(headers, 'origin');
  const referer = getHeader(headers, 'referer');
  const host = getHeader(headers, 'host');

  const configuredAllowed = options.allowedOrigins || [];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const validHosts = new Set<string>();
  if (host) validHosts.add(host.toLowerCase());
  if (appUrl) {
    try {
      validHosts.add(new URL(appUrl).host.toLowerCase());
    } catch {
      // ignore malformed appUrl
    }
  }
  for (const ao of configuredAllowed) {
    try {
      validHosts.add(new URL(ao).host.toLowerCase());
    } catch {
      validHosts.add(ao.toLowerCase());
    }
  }

  // If Origin is provided, verify it
  if (origin) {
    try {
      const originHost = new URL(origin).host.toLowerCase();
      if (!validHosts.has(originHost)) {
        return {
          valid: false,
          reason: `Origin header '${origin}' does not match trusted application origin.`,
          statusCode: 403,
        };
      }
    } catch {
      return {
        valid: false,
        reason: 'Malformed Origin header.',
        statusCode: 403,
      };
    }
  } else if (referer) {
    // Fallback to Referer header if Origin is omitted
    try {
      const refererHost = new URL(referer).host.toLowerCase();
      if (!validHosts.has(refererHost)) {
        return {
          valid: false,
          reason: `Referer header '${referer}' does not match trusted application origin.`,
          statusCode: 403,
        };
      }
    } catch {
      return {
        valid: false,
        reason: 'Malformed Referer header.',
        statusCode: 403,
      };
    }
  }

  // 4. Token verification if required or if cookie session present
  const cookieHeader = getHeader(headers, 'cookie');
  const cookies = parseCookies(cookieHeader);
  const cookieToken = cookies[CSRF_COOKIE_NAME];
  const headerToken = getHeader(headers, CSRF_HEADER_NAME);

  if (options.requireTokenForStateChanging || cookieToken) {
    if (!headerToken || !cookieToken) {
      return {
        valid: false,
        reason: 'Missing CSRF token in request header or session cookie.',
        statusCode: 403,
      };
    }

    if (!verifyCsrfToken(headerToken, cookieToken)) {
      return {
        valid: false,
        reason: 'Invalid CSRF token mismatch.',
        statusCode: 403,
      };
    }
  }

  return { valid: true };
}
