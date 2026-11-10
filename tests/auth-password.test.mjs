import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  hashPassword,
  verifyPassword,
  validatePasswordPolicy,
  assertPasswordPolicy,
  getBcryptCost,
  isPasswordRehashNeeded,
  sanitizeLogContext,
  MIN_BCRYPT_COST,
  DEFAULT_BCRYPT_COST,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
} from '../src/lib/auth/password.ts';

describe('Password Hashing & Security Policy Test Suite (SEC-04)', () => {
  // ── AC1: Salted and Hashed with Bcrypt (Work Factor >= 10) ──────────────────
  describe('AC1: Bcrypt Hashing with Work Factor >= 10', () => {
    it('hashes passwords using default work factor of 12', async () => {
      const password = 'StrongOfficerPassword2026!';
      const hash = await hashPassword(password);

      assert.strictEqual(typeof hash, 'string');
      assert.ok(
        hash.startsWith('$2b$12$') || hash.startsWith('$2a$12$'),
        'Hash must begin with bcrypt work factor $2b$12$ or $2a$12$'
      );
      assert.strictEqual(getBcryptCost(hash), 12);
    });

    it('allows custom cost factor >= 10', async () => {
      const password = 'CustomCostPassword@123';
      const cost10Hash = await hashPassword(password, 10);
      assert.strictEqual(getBcryptCost(cost10Hash), 10);

      const cost11Hash = await hashPassword(password, 11);
      assert.strictEqual(getBcryptCost(cost11Hash), 11);
    });

    it('strictly rejects cost factor < 10 with SEC-04 policy violation error', async () => {
      const password = 'ValidPassword123!';

      await assert.rejects(
        async () => {
          await hashPassword(password, 9);
        },
        {
          name: 'Error',
          message: /Bcrypt cost factor must be at least 10 \(SEC-04 policy requirement\)/,
        }
      );

      await assert.rejects(
        async () => {
          await hashPassword(password, 4);
        },
        {
          name: 'Error',
          message: /Bcrypt cost factor must be at least 10/,
        }
      );
    });

    it('generates unique cryptographic salts for identical passwords', async () => {
      const password = 'IdenticalPassword2026#';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      assert.notStrictEqual(
        hash1,
        hash2,
        'Bcrypt must salt each hash independently so identical passwords produce unique hashes'
      );
      assert.strictEqual(getBcryptCost(hash1), DEFAULT_BCRYPT_COST);
      assert.strictEqual(getBcryptCost(hash2), DEFAULT_BCRYPT_COST);
    });

    it('verifies correct plaintext password against bcrypt hash in constant time', async () => {
      const password = 'CorrectPassword#2026';
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      assert.strictEqual(isValid, true, 'Correct password must verify as true');
    });

    it('rejects incorrect password attempt', async () => {
      const correct = 'OfficerSecretPass123!';
      const wrong = 'WrongOfficerPass456!';
      const hash = await hashPassword(correct);

      const isValid = await verifyPassword(wrong, hash);
      assert.strictEqual(isValid, false, 'Incorrect password must verify as false');
    });

    it('verifies seed admin password against initial seed database hash', async () => {
      const seedHash = '$2b$12$zyuUFqLkNFIuVXWNsajKKemoOujmhWN0Sx9hyipOaswocgPSr0FFK';
      const adminPassword = 'Admin@Lions2026!';

      const isValid = await verifyPassword(adminPassword, seedHash);
      assert.strictEqual(isValid, true, 'Admin@Lions2026! must verify against seed hash');

      const wrongAttempt = await verifyPassword('WrongAdminPassword', seedHash);
      assert.strictEqual(wrongAttempt, false);
    });

    it('safely handles empty or malformed hashes without crashing', async () => {
      assert.strictEqual(await verifyPassword('Password123!', ''), false);
      assert.strictEqual(await verifyPassword('Password123!', 'invalid-hash'), false);
      assert.strictEqual(await verifyPassword('Password123!', '$2b$12$tooshort'), false);
      assert.strictEqual(await verifyPassword('', '$2b$12$zyuUFqLkNFIuVXWNsajKKemoOujmhWN0Sx9hyipOaswocgPSr0FFK'), false);
    });

    it('detects when an older hash needs re-hashing to match target cost', () => {
      const cost10Hash = '$2b$10$N3awrbzbxnM/6m0iDXuCEO1234567890123456789012345678901';
      const cost12Hash = '$2b$12$zyuUFqLkNFIuVXWNsajKKemoOujmhWN0Sx9hyipOaswocgPSr0FFK';

      assert.strictEqual(isPasswordRehashNeeded(cost10Hash, 12), true);
      assert.strictEqual(isPasswordRehashNeeded(cost12Hash, 12), false);
    });
  });

  // ── AC1: Plaintext Is Never Stored or Logged ────────────────────────────────
  describe('AC1: Plaintext Credential Sanitisation & Safe Logging', () => {
    it('deeply sanitizes sensitive fields from log payloads', () => {
      const sensitivePayload = {
        userId: 'usr-123',
        username: 'lion_admin',
        password: 'PlainTextPassword123!',
        password_hash: '$2b$12$zyuUFqLkNFIuVXWNsajKKemoOujmhWN0Sx9hyipOaswocgPSr0FFK',
        sessionToken: 'jwt.token.string',
        meta: {
          ipAddress: '192.168.1.1',
          apiKey: 'secret_key_abc123',
          dbConnectionString: 'postgresql://user:pass@localhost:5432/db',
        },
      };

      const sanitized = sanitizeLogContext(sensitivePayload);

      assert.strictEqual(sanitized.userId, 'usr-123');
      assert.strictEqual(sanitized.username, 'lion_admin');
      assert.strictEqual(sanitized.password, '[REDACTED]');
      assert.strictEqual(sanitized.password_hash, '[REDACTED]');
      assert.strictEqual(sanitized.sessionToken, '[REDACTED]');
      assert.strictEqual(sanitized.meta.ipAddress, '192.168.1.1');
      assert.strictEqual(sanitized.meta.apiKey, '[REDACTED]');
      assert.strictEqual(sanitized.meta.dbConnectionString, '[REDACTED]');

      // Original payload must remain untouched
      assert.strictEqual(sensitivePayload.password, 'PlainTextPassword123!');
    });

    it('sanitizes array structures containing credential objects', () => {
      const usersList = [
        { id: '1', email: 'a@lions.org', password: 'SecretPassword1!' },
        { id: '2', email: 'b@lions.org', password: 'SecretPassword2!' },
      ];

      const cleaned = sanitizeLogContext(usersList);
      assert.strictEqual(cleaned[0].password, '[REDACTED]');
      assert.strictEqual(cleaned[1].password, '[REDACTED]');
      assert.strictEqual(cleaned[0].email, 'a@lions.org');
    });
  });

  // ── AC2: Server-Side Password Policy Enforcement ────────────────────────────
  describe('AC2: Server-Side Password Policy Enforcement', () => {
    it('validates compliant passwords (>= 8 characters)', () => {
      const result = validatePasswordPolicy('ValidPassword8!');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('rejects passwords shorter than 8 characters', () => {
      const shortPass = 'Short1!';
      const result = validatePasswordPolicy(shortPass);

      assert.strictEqual(result.valid, false);
      assert.ok(
        result.errors.some((e) => e.includes('at least 8 characters')),
        'Error message must state minimum 8 characters requirement'
      );
    });

    it('rejects empty, null, or undefined passwords', () => {
      const emptyResult = validatePasswordPolicy('');
      assert.strictEqual(emptyResult.valid, false);

      const whitespaceResult = validatePasswordPolicy('     ');
      assert.strictEqual(whitespaceResult.valid, false);
      assert.ok(whitespaceResult.errors.some((e) => e.includes('empty or contain only whitespace')));

      const nullResult = validatePasswordPolicy(null);
      assert.strictEqual(nullResult.valid, false);

      const undefinedResult = validatePasswordPolicy(undefined);
      assert.strictEqual(undefinedResult.valid, false);
    });

    it('rejects passwords exceeding 72 characters to protect against DoS truncation', () => {
      const overlyLongPassword = 'A'.repeat(73);
      const result = validatePasswordPolicy(overlyLongPassword);

      assert.strictEqual(result.valid, false);
      assert.ok(
        result.errors.some((e) => e.includes('cannot exceed 72 characters')),
        'Error message must flag exceeding 72 character limit'
      );
    });

    it('assertPasswordPolicy throws an Error when violation occurs', () => {
      assert.throws(
        () => {
          assertPasswordPolicy('12345');
        },
        {
          name: 'Error',
          message: /Password policy violation: Password must be at least 8 characters long/,
        }
      );
    });

    it('hashPassword rejects passwords violating server-side policy prior to hashing', async () => {
      await assert.rejects(
        async () => {
          await hashPassword('short');
        },
        {
          name: 'Error',
          message: /Password policy violation: Password must be at least 8 characters long/,
        }
      );
    });
  });
});

