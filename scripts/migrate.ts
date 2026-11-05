/**
 * scripts/migrate.ts
 * Database migration runner for local development.
 *
 * Runs all .sql files in database/migrations/ in filename order.
 * Uses a simple migrations_log table to track which files have already run,
 * making it safe to run repeatedly.
 *
 * Usage:
 *   npm run db:migrate
 *
 * Prerequisites:
 *   1. PostgreSQL running locally.
 *   2. .env.local populated from .env.example.
 */

import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error(
    '[migrate] DATABASE_URL is not set.\n' +
      'Copy .env.example → .env.local and set your database credentials.'
  );
  process.exit(1);
}

const MIGRATIONS_DIR = path.join(process.cwd(), 'database', 'migrations');

async function runMigrations(): Promise<void> {
  let Client: typeof import('pg').Client;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ({ Client } = require('pg'));
  } catch {
    console.error('[migrate] The "pg" package is not installed. Run: npm install pg @types/pg');
    process.exit(1);
  }

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log('[migrate] Connected to database.');

  // Ensure the tracking table exists.
  await client.query(`
    CREATE TABLE IF NOT EXISTS migrations_log (
      id           SERIAL PRIMARY KEY,
      filename     VARCHAR(255) NOT NULL UNIQUE,
      applied_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const migrationFiles = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql') && !f.endsWith('.down.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.warn(`[migrate] No migration files found in ${MIGRATIONS_DIR}.`);
    await client.end();
    return;
  }

  for (const file of migrationFiles) {
    const { rows } = await client.query('SELECT 1 FROM migrations_log WHERE filename = $1', [file]);
    if (rows.length > 0) {
      console.log(`[migrate] Skipping (already applied): ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    console.log(`[migrate] Applying: ${file}`);
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO migrations_log (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`[migrate] ✓ Applied: ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`[migrate] ✗ Failed: ${file}`, err);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log('[migrate] All migrations applied.');
}

runMigrations().catch((err) => {
  console.error('[migrate] Unexpected error:', err);
  process.exit(1);
});

