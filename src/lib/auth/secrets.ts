/**
 * src/lib/auth/secrets.ts
 * Secrets Management and Environment Variable Access Guard
 *
 * Security Standard: SEC-04
 * Requirement: No secrets (DB URL, JWT/session secret, email, media keys)
 *              in the repository history or client bundle; verified by secret scan.
 * Course: IS5109 Community Project (Group 14)
 */

/**
 * List of private server-side secret keys.
 * Under NO circumstances should any of these ever be prefixed with NEXT_PUBLIC_
 * or included in any client-side JavaScript bundles.
 */
export const REQUIRED_SERVER_SECRETS = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'CLOUDINARY_API_SECRET',
  'SMTP_PASSWORD',
] as const;

export const OPTIONAL_SERVER_SECRETS = ['DB_PASSWORD', 'CLOUDINARY_API_KEY', 'SMTP_USER'] as const;

/**
 * Keywords indicating sensitive secret material.
 */
const SENSITIVE_KEYWORDS = [
  'SECRET',
  'PASSWORD',
  'PASSWD',
  'TOKEN',
  'PRIVATE_KEY',
  'API_KEY',
  'DB_PASSWORD',
  'DATABASE_URL',
];

/**
 * Validates whether an environment variable name is safe for exposure to the client bundle.
 * Client variables in Next.js MUST start with NEXT_PUBLIC_ AND must NOT contain sensitive keywords.
 */
export function isClientSafeVariableName(name: string): boolean {
  if (!name.startsWith('NEXT_PUBLIC_')) {
    return false; // Non-prefixed variables are server-only
  }

  const suffix = name.replace('NEXT_PUBLIC_', '').toUpperCase();
  const hasSensitiveKeyword = SENSITIVE_KEYWORDS.some((kw) => suffix.includes(kw));

  return !hasSensitiveKeyword;
}

/**
 * Safely accesses a server-side secret.
 * Guarantees that client-exposed variables are never accidentally requested as secrets.
 *
 * @param key Environment variable key name
 * @param options Configuration options (required in production, fallback)
 */
export function getServerSecret(
  key: string,
  options: { required?: boolean; fallback?: string } = {}
): string | undefined {
  // Reject keys prefixed with NEXT_PUBLIC_ as server secrets
  if (key.startsWith('NEXT_PUBLIC_')) {
    throw new Error(
      `Security violation: Attempted to read client-exposed variable '${key}' as a server secret.`
    );
  }

  const value = process.env[key] ?? options.fallback;

  const isProduction = process.env.NODE_ENV === 'production';
  const isRequired = options.required ?? isProduction;

  if (isRequired && (!value || isPlaceholderSecret(value))) {
    throw new Error(
      `Configuration error: Required server secret '${key}' is missing or set to an insecure placeholder.`
    );
  }

  return value;
}

/**
 * Checks whether a given secret string is an insecure template placeholder.
 */
export function isPlaceholderSecret(value: string): boolean {
  const normalized = value.toLowerCase().trim();
  return (
    normalized.startsWith('your_') ||
    normalized.startsWith('replace_with_') ||
    normalized.includes('placeholder') ||
    normalized.includes('example.com') ||
    normalized === 'db_password' ||
    normalized === 'password' ||
    normalized === 'secret'
  );
}

/**
 * Audits environment configuration at runtime.
 */
export function validateEnvironmentSecrets(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === 'production';

  for (const key of REQUIRED_SERVER_SECRETS) {
    const val = process.env[key];
    if (!val) {
      if (isProduction) {
        missing.push(key);
      } else {
        warnings.push(`Secret '${key}' is unset in development environment.`);
      }
    } else if (isPlaceholderSecret(val)) {
      if (isProduction) {
        missing.push(`${key} (insecure placeholder)`);
      } else {
        warnings.push(`Secret '${key}' contains a placeholder value.`);
      }
    }
  }

  // Verify NEXTAUTH_SECRET strength in production (must be >= 32 characters)
  const authSecret = process.env.NEXTAUTH_SECRET;
  if (authSecret && isProduction && authSecret.length < 32) {
    missing.push('NEXTAUTH_SECRET (insufficient entropy: must be at least 32 characters)');
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * High-precision regex patterns for scanning files or text content for leaked secrets.
 */
export const SECRET_SCAN_PATTERNS = [
  // 1. Database URLs with real passwords (e.g. postgresql://user:realpassword@host:port/db)
  {
    name: 'Embedded Database Password in Connection URI',
    regex: /(?:postgres(?:ql)?|mysql):\/\/[^:\s]+:([^@\s]+)@[a-zA-Z0-9.-]+(?::\d+)?\/[^\s'"]+/i,
    ignorePlaceholders: [
      ':db_password@',
      ':password@',
      ':<password>@',
      ':your_password@',
      ':db_pass@',
    ],
  },
  // 2. Private RSA / EC / PGP keys
  {
    name: 'Private Cryptographic Key Block',
    regex: /-----BEGIN\s+(?:RSA\s+|EC\s+|DSA\s+|OPENSSH\s+)?PRIVATE KEY-----/,
  },
  // 3. AWS Access / Secret Key ID
  {
    name: 'Hardcoded AWS Access Key',
    regex: /\b(AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}\b/,
  },
  // 4. Cloudinary real API secrets (32+ alphanumeric characters)
  {
    name: 'Hardcoded Cloudinary API Secret',
    regex: /CLOUDINARY_API_SECRET\s*=\s*['"][a-zA-Z0-9_-]{24,}['"]/,
  },
  // 5. JWT / NextAuth real high-entropy secret assignments
  {
    name: 'Hardcoded Production NEXTAUTH_SECRET',
    regex: /NEXTAUTH_SECRET\s*=\s*['"][a-zA-Z0-9+/=_-]{32,}['"]/,
  },
];

/**
 * Scans a string of file content for accidentally hardcoded secrets.
 *
 * @param content Source code or configuration string to audit
 * @param filePath Optional file path for audit reporting
 */
export function scanContentForExposedSecrets(
  content: string,
  filePath: string = 'unknown'
): { clean: boolean; issues: string[] } {
  const issues: string[] = [];

  for (const pattern of SECRET_SCAN_PATTERNS) {
    const match = content.match(pattern.regex);
    if (match) {
      const matchedString = match[0];
      const isIgnored =
        pattern.ignorePlaceholders &&
        pattern.ignorePlaceholders.some((placeholder) =>
          matchedString.toLowerCase().includes(placeholder)
        );

      if (!isIgnored) {
        issues.push(`[${filePath}] Detected ${pattern.name}: ${matchedString.slice(0, 20)}...`);
      }
    }
  }

  return {
    clean: issues.length === 0,
    issues,
  };
}
