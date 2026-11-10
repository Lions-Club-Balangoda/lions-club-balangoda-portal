/**
 * src/lib/auth/password.ts
 * Password Hashing, Verification, and Policy Enforcement
 * 
 * Security Standard: SEC-04
 * Requirement: Passwords must be salted and hashed with bcrypt (work factor >= 10)
 *              or Argon2. Plaintext is never stored or logged.
 * Course: IS5109 Community Project (Group 14)
 */

import bcrypt from 'bcryptjs';

/**
 * Baseline security parameters per SEC-04 and MVP scope specifications.
 */
export const MIN_BCRYPT_COST = 10;
export const DEFAULT_BCRYPT_COST = 12; // Aligned with Docs/mvp-scope-specification.md
export const MIN_PASSWORD_LENGTH = 8;  // Server-side minimum password length policy
export const MAX_PASSWORD_LENGTH = 72; // Bcrypt maximum input length constraint (72 bytes)

/**
 * Result structure returned by server-side password policy validation.
 */
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a password against server-side security policies.
 * Plaintext is processed in-memory only and never persisted or logged.
 * 
 * Policy rules:
 * 1. Must be a defined string.
 * 2. Cannot be empty or contain only whitespace.
 * 3. Must be at least MIN_PASSWORD_LENGTH (8) characters long.
 * 4. Cannot exceed MAX_PASSWORD_LENGTH (72) characters to prevent DoS attacks.
 */
export function validatePasswordPolicy(password: unknown): PasswordValidationResult {
  const errors: string[] = [];

  if (typeof password !== 'string') {
    return {
      valid: false,
      errors: ['Password must be a valid string'],
    };
  }

  const trimmed = password.trim();

  if (trimmed.length === 0) {
    errors.push('Password cannot be empty or contain only whitespace');
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }

  // Bcrypt operates on a maximum of 72 bytes. Input beyond 72 bytes can lead to truncation attacks.
  const byteLength = Buffer.byteLength(password, 'utf8');
  if (byteLength > MAX_PASSWORD_LENGTH) {
    errors.push(`Password cannot exceed ${MAX_PASSWORD_LENGTH} characters`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Asserts that a password meets server-side policy, throwing an Error if invalid.
 */
export function assertPasswordPolicy(password: unknown): void {
  const result = validatePasswordPolicy(password);
  if (!result.valid) {
    throw new Error(`Password policy violation: ${result.errors.join('; ')}`);
  }
}

/**
 * Securely salts and hashes a plaintext password using bcrypt.
 * 
 * Constraints enforced:
 * - Work factor (cost) must be >= 10 (defaults to 12).
 * - Enforces server-side password policy prior to hashing.
 * - Plaintext is never stored, retained, or logged.
 * 
 * @param password Plaintext password to hash
 * @param cost Bcrypt cost factor / work rounds (default: 12)
 * @returns Standard Modular Crypt Format bcrypt hash string
 */
export async function hashPassword(
  password: string,
  cost: number = DEFAULT_BCRYPT_COST
): Promise<string> {
  // 1. Enforce minimum bcrypt cost (SEC-04)
  if (typeof cost !== 'number' || cost < MIN_BCRYPT_COST) {
    throw new Error(
      `Bcrypt cost factor must be at least ${MIN_BCRYPT_COST} (SEC-04 policy requirement). Provided: ${cost}`
    );
  }

  // 2. Server-side policy validation
  assertPasswordPolicy(password);

  // 3. Generate cryptographically secure salt with specified cost
  const salt = await bcrypt.genSalt(cost);

  // 4. Compute salted bcrypt hash
  const hash = await bcrypt.hash(password, salt);

  return hash;
}

/**
 * Constant-time password verification against an existing bcrypt hash.
 * 
 * Protects against timing attacks and gracefully handles malformed inputs.
 * Plaintext password is never stored or logged.
 * 
 * @param password Plaintext password to verify
 * @param hash Stored bcrypt hash from database
 * @returns True if password matches hash, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  if (
    !password ||
    !hash ||
    typeof password !== 'string' ||
    typeof hash !== 'string'
  ) {
    return false;
  }

  // Validate standard bcrypt hash format ($2a$, $2b$, or $2y$, cost, 22-char salt, 31-char hash)
  const bcryptRegex = /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/;
  if (!bcryptRegex.test(hash.trim())) {
    return false;
  }

  try {
    return await bcrypt.compare(password, hash.trim());
  } catch {
    return false;
  }
}

/**
 * Extracts the work factor (cost) from a standard bcrypt hash.
 * 
 * @param hash Stored bcrypt hash string
 * @returns The integer cost factor (e.g. 10, 12), or NaN if invalid
 */
export function getBcryptCost(hash: string): number {
  if (!hash || typeof hash !== 'string') {
    return NaN;
  }
  const match = hash.match(/^\$2[aby]?\$(\d{2})\$/);
  return match ? parseInt(match[1], 10) : NaN;
}

/**
 * Determines whether an existing hash should be re-hashed to match target cost.
 * Useful for transparently migrating older hashes with cost < 12.
 */
export function isPasswordRehashNeeded(
  hash: string,
  targetCost: number = DEFAULT_BCRYPT_COST
): boolean {
  const currentCost = getBcryptCost(hash);
  return isNaN(currentCost) || currentCost < targetCost;
}

/**
 * Sensitive field patterns that must be sanitized before logging.
 */
const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /passwd/i,
  /secret/i,
  /token/i,
  /hash/i,
  /authorization/i,
  /cookie/i,
  /api[_-]?key/i,
  /database[_-]?url/i,
  /connection[_-]?string/i,
];

/**
 * Sanitizes logging payloads to ensure passwords, tokens, and secrets are NEVER logged.
 * Plaintext and hashed credentials are replaced with "[REDACTED]".
 */
export function sanitizeLogContext<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogContext(item)) as unknown as T;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogContext(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
