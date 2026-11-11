/**
 * scripts/seed.ts
 * Database seed script for local development.
 *
 * Runs the SQL seed files from database/seeds/ against the local PostgreSQL
 * database configured in your .env.local.
 *
 * Usage:
 *   npm run db:seed
 *
 * Prerequisites:
 *   1. PostgreSQL running locally (see README.md § Local Database Setup).
 *   2. Migrations applied: npm run db:migrate
 *   3. .env.local populated from .env.example.
 *
 * The script is intentionally idempotent — it uses ON CONFLICT DO NOTHING
 * in the SQL files so it is safe to run multiple times.
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Environment — load .env.local before anything else.
// ---------------------------------------------------------------------------
// When the team adds dotenv or @dotenvx/dotenvx, replace this comment with:
//   import 'dotenv/config';
// or:
//   import dotenv from 'dotenv';
//   dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error(
    '[seed] DATABASE_URL is not set.\n' +
      'Copy .env.example → .env.local and fill in your database credentials, then retry.'
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Seed file discovery — runs all files in database/seeds/ in filename order.
// ---------------------------------------------------------------------------
const SEEDS_DIR = path.join(process.cwd(), 'database', 'seeds');

async function runSeeds(): Promise<void> {
  // Dynamically require the pg client only when the team has installed it.
  // This avoids a hard dependency error before the backend packages are set up.
  let Client: typeof import('pg').Client;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ({ Client } = require('pg'));
  } catch {
    console.error(
      '[seed] The "pg" package is not installed.\n' +
        'Run:  npm install pg @types/pg\n' +
        'Then retry:  npm run db:seed'
    );
    process.exit(1);
  }

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log('[seed] Connected to database.');

  const seedFiles = fs
    .readdirSync(SEEDS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort(); // Runs 001_... before 002_... etc.

  if (seedFiles.length === 0) {
    console.warn(`[seed] No .sql files found in ${SEEDS_DIR}. Nothing to seed.`);
    await client.end();
    return;
  }

  for (const file of seedFiles) {
    const filePath = path.join(SEEDS_DIR, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`[seed] Running: ${file}`);
    try {
      await client.query(sql);
      console.log(`[seed] ✓ Done: ${file}`);
    } catch (err) {
      console.error(`[seed] ✗ Failed: ${file}`, err);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log('[seed] All seed files applied successfully.');
}

runSeeds().catch((err) => {
  console.error('[seed] Unexpected error:', err);
  process.exit(1);
});
