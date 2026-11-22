/**
 * src/lib/auth/session.ts
 * Cryptographic Session Token & JWT Handling (Web Crypto API)
 *
 * Compatible with Next.js App Router, Middleware (Edge runtime), and Node.js.
 * Enforces tamper-proof HMAC-SHA256 signatures and constant-time verification.
 *
 * Security Standard: SEC-04
 */

import type { AuthUser, UserRole } from '../../types/rbac.ts';

export const SESSION_COOKIE_NAME = 'lbw_session';
export const DEFAULT_SESSION_EXPIRY_SECONDS = 60 * 60 * 8; // 8 hours (WF-AUTH-02)

export interface SessionTokenPayload {
  sub: string; // userId
  usr: string; // username
  eml: string; // email
  fnm: string; // fullName
  rol: UserRole; // role: ADMIN | EDITOR
  iat: number; // issued at (seconds)
  exp: number; // expires at (seconds)
}

function base64UrlEncode(data: Uint8Array): string {
  let str = '';
  for (let i = 0; i < data.length; i++) {
    str += String.fromCharCode(data[i]);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function uint8ArrayToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

async function getCryptoKey(secret: string, usage: 'sign' | 'verify'): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);

  return globalThis.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage]
  );
}

/**
 * Signs a session token for an authenticated user.
 */
export async function signSessionToken(
  user: AuthUser,
  secret: string,
  expiresInSeconds = DEFAULT_SESSION_EXPIRY_SECONDS
): Promise<string> {
  if (!secret || secret.length < 16) {
    throw new Error('SEC-04 Violation: Session signing secret must be at least 16 characters long.');
  }

  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionTokenPayload = {
    sub: user.userId,
    usr: user.username,
    eml: user.email,
    fnm: user.fullName,
    rol: user.role,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(stringToUint8Array(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(stringToUint8Array(JSON.stringify(payload)));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey(secret, 'sign');
  const signatureBuffer = await globalThis.crypto.subtle.sign(
    'HMAC',
    key,
    stringToUint8Array(dataToSign)
  );

  const encodedSignature = base64UrlEncode(new Uint8Array(signatureBuffer));
  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Verifies a session token and extracts the authenticated user payload.
 * Returns null if token is missing, expired, tampered with, or invalid.
 */
export async function verifySessionToken(
  token: string | null | undefined,
  secret: string
): Promise<AuthUser | null> {
  if (!token || typeof token !== 'string') return null;
  if (!secret) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const dataToVerify = `${encodedHeader}.${encodedPayload}`;

  try {
    const key = await getCryptoKey(secret, 'verify');
    const signatureBytes = base64UrlDecode(encodedSignature);

    const isValid = await globalThis.crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      stringToUint8Array(dataToVerify)
    );

    if (!isValid) return null;

    const payloadJson = uint8ArrayToString(base64UrlDecode(encodedPayload));
    const payload: SessionTokenPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null; // Expired (WF-AUTH-02)
    }

    if (!payload.sub || !payload.rol) {
      return null;
    }

    return {
      userId: payload.sub,
      username: payload.usr,
      email: payload.eml,
      fullName: payload.fnm,
      role: payload.rol,
    };
  } catch {
    return null;
  }
}
