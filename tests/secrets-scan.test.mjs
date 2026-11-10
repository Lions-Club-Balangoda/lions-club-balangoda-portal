import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  getServerSecret,
  isPlaceholderSecret,
  isClientSafeVariableName,
  scanContentForExposedSecrets,
  REQUIRED_SERVER_SECRETS,
} from '../src/lib/auth/secrets.ts';

describe('Secrets Management & Secret Scan Suite (SEC-04)', () => {
  const rootDir = process.cwd();

  // ── AC4: .env.example lists variables without values ────────────────────────
  describe('AC4: .env.example Specification', () => {
    const envExamplePath = path.join(rootDir, '.env.example');

    it('.env.example file exists at repository root', () => {
      assert.ok(fs.existsSync(envExamplePath), '.env.example must exist at root');
    });

    it('all environment variables in .env.example are listed without values', () => {
      const content = fs.readFileSync(envExamplePath, 'utf8');
      const lines = content.split('\n');

      const variableLines = lines
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.startsWith('#'));

      assert.ok(variableLines.length > 0, '.env.example must declare variables');

      for (const line of variableLines) {
        assert.ok(
          line.includes('='),
          `Configuration line must be in KEY= format: "${line}"`
        );

        const [key, ...rest] = line.split('=');
        const value = rest.join('=').trim();

        // AC4 Requirement: .env.example lists variables WITHOUT values
        assert.strictEqual(
          value,
          '',
          `Variable '${key}' in .env.example must have NO value assigned (found: '${value}')`
        );
      }
    });

    it('.env.example contains all required application, database, and auth keys', () => {
      const content = fs.readFileSync(envExamplePath, 'utf8');

      const expectedKeys = [
        'NODE_ENV',
        'NEXT_PUBLIC_APP_URL',
        'PORT',
        'API_PORT',
        'NEXT_PUBLIC_API_URL',
        'DATABASE_URL',
        'DB_HOST',
        'DB_PORT',
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD',
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
        'SMTP_HOST',
        'SMTP_PORT',
        'SMTP_USER',
        'SMTP_PASSWORD',
        'SMTP_SECURE',
        'EMAIL_FROM',
        'ADMIN_NOTIFICATION_EMAIL',
      ];

      for (const key of expectedKeys) {
        const regex = new RegExp(`^${key}=`, 'm');
        assert.ok(
          regex.test(content),
          `.env.example must list variable '${key}='`
        );
      }
    });

    it('.gitignore strictly ignores all real environment secret files except .env.example', () => {
      const gitignorePath = path.join(rootDir, '.gitignore');
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

      assert.ok(
        gitignoreContent.includes('.env'),
        '.gitignore must ignore .env files'
      );
      assert.ok(
        gitignoreContent.includes('.env.local'),
        '.gitignore must ignore .env.local files'
      );
      assert.ok(
        gitignoreContent.includes('!.env.example'),
        '.gitignore must explicitly keep .env.example tracked'
      );
    });
  });

  // ── AC3: Secret Scan of Repository & Client Bundle Safety ───────────────────
  describe('AC3: Repository Secret Scan & Client Bundle Boundary', () => {
    it('detects and flags leaked real secrets in code or configuration', () => {
      // Test the scan engine against a simulated leak
      const leakedString = 'const db = "postgresql://lion_admin:RealSuperSecretPassword123@db.balangodalions.org:5432/portal";';
      const scanResult = scanContentForExposedSecrets(leakedString, 'mock-leak.ts');

      assert.strictEqual(scanResult.clean, false);
      assert.ok(scanResult.issues.length > 0);
      assert.ok(scanResult.issues[0].includes('Embedded Database Password'));
    });

    it('repository source files (src, server, scripts) contain no hardcoded database passwords or private keys', () => {
      const directoriesToScan = ['src', 'server', 'scripts'];
      const fileExtensions = ['.ts', '.tsx', '.js', '.mjs', '.json'];

      function collectFiles(dir) {
        let results = [];
        const fullDir = path.join(rootDir, dir);
        if (!fs.existsSync(fullDir)) return results;

        const list = fs.readdirSync(fullDir);
        for (const file of list) {
          const filePath = path.join(fullDir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            results = results.concat(collectFiles(path.join(dir, file)));
          } else if (fileExtensions.some((ext) => file.endsWith(ext))) {
            results.push(filePath);
          }
        }
        return results;
      }

      const allFiles = directoriesToScan.flatMap(collectFiles);
      assert.ok(allFiles.length > 0, 'Found files to scan');

      const allIssues = [];
      for (const filePath of allFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        const relPath = path.relative(rootDir, filePath);
        const { clean, issues } = scanContentForExposedSecrets(content, relPath);
        if (!clean) {
          allIssues.push(...issues);
        }
      }

      assert.strictEqual(
        allIssues.length,
        0,
        `Secret scan detected potential hardcoded secrets in source files:\n${allIssues.join('\n')}`
      );
    });

    it('client components and pages never import or expose private server secrets', () => {
      // Client code lives under src/components and src/app (excluding src/app/api)
      const clientDirs = [
        path.join(rootDir, 'src', 'components'),
        path.join(rootDir, 'src', 'app'),
      ];

      function scanClientFiles(dir) {
        let results = [];
        if (!fs.existsSync(dir)) return results;

        const list = fs.readdirSync(dir);
        for (const file of list) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            // Exclude API routes which run exclusively server-side
            if (!filePath.includes(path.join('src', 'app', 'api'))) {
              results = results.concat(scanClientFiles(filePath));
            }
          } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(filePath);
          }
        }
        return results;
      }

      const clientFiles = clientDirs.flatMap(scanClientFiles);
      assert.ok(clientFiles.length > 0, 'Found client component files');

      for (const filePath of clientFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        const relPath = path.relative(rootDir, filePath);

        for (const secretKey of REQUIRED_SERVER_SECRETS) {
          // Client code must NEVER reference process.env.DATABASE_URL, NEXTAUTH_SECRET, etc.
          assert.ok(
            !content.includes(`process.env.${secretKey}`),
            `Client file '${relPath}' directly references server secret 'process.env.${secretKey}'`
          );
        }
      }
    });

    it('only variables prefixed with NEXT_PUBLIC_ and without sensitive keywords are client-safe', () => {
      // Valid client variables
      assert.strictEqual(isClientSafeVariableName('NEXT_PUBLIC_APP_URL'), true);
      assert.strictEqual(isClientSafeVariableName('NEXT_PUBLIC_API_URL'), true);
      assert.strictEqual(isClientSafeVariableName('NEXT_PUBLIC_ANALYTICS_ID'), true);

      // Server-only variables (must NOT be client-safe)
      assert.strictEqual(isClientSafeVariableName('DATABASE_URL'), false);
      assert.strictEqual(isClientSafeVariableName('NEXTAUTH_SECRET'), false);
      assert.strictEqual(isClientSafeVariableName('CLOUDINARY_API_SECRET'), false);
      assert.strictEqual(isClientSafeVariableName('SMTP_PASSWORD'), false);

      // Malicious or accidental misconfigurations with NEXT_PUBLIC_ and sensitive keywords
      assert.strictEqual(isClientSafeVariableName('NEXT_PUBLIC_DATABASE_URL'), false);
      assert.strictEqual(isClientSafeVariableName('NEXT_PUBLIC_JWT_SECRET'), false);
      assert.strictEqual(isClientSafeVariableName('NEXT_PUBLIC_ADMIN_PASSWORD'), false);
      assert.strictEqual(isClientSafeVariableName('NEXT_PUBLIC_CLOUDINARY_API_KEY'), false);
    });

    it('getServerSecret prevents access to NEXT_PUBLIC_ variables as server secrets', () => {
      assert.throws(
        () => {
          getServerSecret('NEXT_PUBLIC_APP_URL');
        },
        {
          name: 'Error',
          message: /Security violation: Attempted to read client-exposed variable/,
        }
      );
    });

    it('isPlaceholderSecret accurately flags template placeholders', () => {
      assert.strictEqual(isPlaceholderSecret('your_cloudinary_api_secret'), true);
      assert.strictEqual(isPlaceholderSecret('replace_with_your_generated_secret'), true);
      assert.strictEqual(isPlaceholderSecret('db_password'), true);
      assert.strictEqual(isPlaceholderSecret('password'), true);
      assert.strictEqual(isPlaceholderSecret('smtp.example.com'), true);

      // Real high-entropy values
      assert.strictEqual(isPlaceholderSecret('7f8b9a2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4'), false);
    });
  });
});

