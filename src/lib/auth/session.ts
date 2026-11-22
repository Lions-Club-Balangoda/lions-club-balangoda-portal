import crypto from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { getDatabase } from '../db.ts';
import { verifyPassword } from './password.ts';
import { getServerSecret } from './secrets.ts';

export type UserRole = 'ADMIN' | 'EDITOR';

export interface SessionUser {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
}

export interface SessionPayload {
  sub: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthSuccessResult {
  success: true;
  user: SessionUser;
  token: string;
}

export interface AuthFailureResult {
  success: false;
  error: string;
  statusCode: number;
}

export type AuthResult = AuthSuccessResult | AuthFailureResult;

const DEFAULT_SECRET = 'ci-test-secret-must-be-at-least-32-chars-long-balangoda-portal';
const TOKEN_EXPIRY_SECONDS = 60 * 60 * 8; // 8 hours

/**
 * Encodes an object or buffer to base64url format.
 */
function toBase64Url(data: string | Buffer): string {
  const buf = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
  return buf.toString('base64url');
}

/**
 * Decodes a base64url string to utf8 string.
 */
function fromBase64Url(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf8');
}

/**
 * Resolves the signing secret safely from environment secrets.
 */
export function getAuthSecret(): string {
  try {
    return getServerSecret('NEXTAUTH_SECRET', { fallback: DEFAULT_SECRET }) || DEFAULT_SECRET;
  } catch {
    return DEFAULT_SECRET;
  }
}

/**
 * Generates an HMAC-SHA256 signed session token (RFC 7519 JWT structure).
 */
export function createSessionToken(
  user: SessionUser,
  customSecret?: string,
  expiresInSeconds: number = TOKEN_EXPIRY_SECONDS
): string {
  const secret = customSecret || getAuthSecret();
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);

  const payload: SessionPayload = {
    sub: user.userId,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto.createHmac('sha256', secret).update(dataToSign).digest('base64url');

  return `${dataToSign}.${signature}`;
}

/**
 * Verifies and decodes a session token.
 * Uses constant-time comparison to protect against timing attacks.
 */
export function verifySessionToken(
  token: string | null | undefined,
  customSecret?: string
): SessionPayload | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const secret = customSecret || getAuthSecret();
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(dataToSign)
    .digest('base64url');

  const sigBuf = Buffer.from(signature, 'utf8');
  const expBuf = Buffer.from(expectedSignature, 'utf8');

  if (sigBuf.length !== expBuf.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);

    // Verify token expiration
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

let defaultAuthDb: DatabaseSync | null = null;

/**
 * Injects a default database instance for testing or custom runtime configurations.
 */
export function setAuthDatabase(db: DatabaseSync | null): void {
  defaultAuthDb = db;
}

/**
 * Authenticates a user with email/username and password.
 * Follows defensive security:
 * - Generic error message on failure to prevent username enumeration.
 * - Constant-time password verification via bcrypt.
 * - Checks that the user account is active.
 * - Updates last_login_at on success.
 */
export async function authenticateUser(
  identifier: string,
  password?: string,
  customDb?: DatabaseSync
): Promise<AuthResult> {
  if (!identifier || !identifier.trim() || !password) {
    return {
      success: false,
      error: 'Please provide both email/username and password.',
      statusCode: 400,
    };
  }

  const db = customDb || defaultAuthDb || getDatabase();
  const normalizedIdentifier = identifier.trim().toLowerCase();

  try {
    const stmt = db.prepare(`
      SELECT user_id, username, email, password_hash, full_name, role, is_active
      FROM users
      WHERE LOWER(email) = ? OR LOWER(username) = ?
      LIMIT 1
    `);

    const row = stmt.get(normalizedIdentifier, normalizedIdentifier) as
      | {
          user_id: string;
          username: string;
          email: string;
          password_hash: string;
          full_name: string;
          role: string;
          is_active: number;
        }
      | undefined;

    if (!row) {
      return {
        success: false,
        error: 'Invalid email or password. Please verify your credentials and try again.',
        statusCode: 401,
      };
    }

    if (row.is_active !== 1) {
      return {
        success: false,
        error: 'Your account has been deactivated. Please contact the administrator.',
        statusCode: 401,
      };
    }

    const isValidPassword = await verifyPassword(password, row.password_hash);
    if (!isValidPassword) {
      return {
        success: false,
        error: 'Invalid email or password. Please verify your credentials and try again.',
        statusCode: 401,
      };
    }

    // Update last_login_at timestamp
    try {
      db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = ?').run(
        row.user_id
      );
    } catch {
      // Non-fatal if timestamp update fails
    }

    const user: SessionUser = {
      userId: row.user_id,
      username: row.username,
      email: row.email,
      fullName: row.full_name,
      role: row.role as UserRole,
      isActive: Boolean(row.is_active),
    };

    const token = createSessionToken(user);

    return {
      success: true,
      user,
      token,
    };
  } catch (err) {
    console.error(
      '[authenticateUser] Error executing authentication query:',
      (err as Error)?.message
    );
    return {
      success: false,
      error: 'An internal error occurred during authentication. Please try again.',
      statusCode: 500,
    };
  }
}

/**
 * Extracts Bearer token from an Authorization header.
 */
export function extractBearerToken(authHeader: string | null | undefined): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/**
 * Extracts session token from either Authorization header or cookies.
 */
export function extractTokenFromRequest(request: {
  headers?: Headers | Record<string, string | string[] | undefined>;
}): string | null {
  const headers = request.headers;
  if (!headers) return null;

  // 1. Check Authorization header
  let authHeader: string | null = null;
  if (typeof (headers as Headers).get === 'function') {
    authHeader = (headers as Headers).get('authorization');
  } else {
    const record = headers as Record<string, string | string[] | undefined>;
    authHeader = (record['authorization'] as string) || (record['Authorization'] as string) || null;
  }

  const bearer = extractBearerToken(authHeader);
  if (bearer) return bearer;

  // 2. Check Cookie header
  let cookieHeader: string | null = null;
  if (typeof (headers as Headers).get === 'function') {
    cookieHeader = (headers as Headers).get('cookie');
  } else {
    const record = headers as Record<string, string | string[] | undefined>;
    cookieHeader = (record['cookie'] as string) || (record['Cookie'] as string) || null;
  }

  if (cookieHeader) {
    const parts = cookieHeader.split(';');
    for (const part of parts) {
      const [key, ...vals] = part.trim().split('=');
      if (key === 'lions_session_token' || key === 'session_token') {
        return decodeURIComponent(vals.join('=').trim());
      }
    }
  }

  return null;
}

/**
 * Authorizes a request, verifying authentication and checking role requirements.
 */
export function authorizeRequest(
  request: { headers?: Headers | Record<string, string | string[] | undefined> },
  allowedRoles?: UserRole[],
  customSecret?: string
): { authorized: boolean; user?: SessionUser; error?: string; statusCode: number } {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return {
      authorized: false,
      error: 'Unauthorized: Missing or invalid authentication token.',
      statusCode: 401,
    };
  }

  const payload = verifySessionToken(token, customSecret);
  if (!payload) {
    return {
      authorized: false,
      error: 'Unauthorized: Session is invalid or has expired. Please sign in again.',
      statusCode: 401,
    };
  }

  const user: SessionUser = {
    userId: payload.sub,
    username: payload.username,
    email: payload.email,
    fullName: payload.fullName,
    role: payload.role,
    isActive: true,
  };

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      authorized: false,
      error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles. Your role is ${user.role}.`,
      statusCode: 403,
    };
  }

  return {
    authorized: true,
    user,
    statusCode: 200,
  };
}
