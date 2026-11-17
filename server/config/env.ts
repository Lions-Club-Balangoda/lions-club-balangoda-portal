/**
 * server/config/env.ts
 * Validates that all required environment variables are present at startup.
 * Throw early so the server never silently starts with missing credentials.
 *
 * Usage: call validateEnv() as the very first thing in server/index.ts.
 */

const REQUIRED_VARS = ['DATABASE_URL', 'NEXTAUTH_SECRET'] as const;

export function validateEnv(): void {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `[config] Missing required environment variables:\n  ${missing.join('\n  ')}\n` +
        'Copy .env.example to .env.local and fill in all values before starting the server.'
    );
    process.exit(1);
  }
}
