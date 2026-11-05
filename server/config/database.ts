/**
 * server/config/database.ts
 * Database connection configuration.
 *
 * Reads DATABASE_URL (and individual DB_* variables as fallback) from the
 * environment.  No credentials are hard-coded here.
 *
 * Replace the placeholder pool setup below with the actual pg / mysql2 pool
 * once the ORM or query-builder is chosen by the team.
 */

export const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? 'lions_club_balangoda',
  user: process.env.DB_USER ?? 'db_user',
  password: process.env.DB_PASSWORD,
  // SSL is required in production (SEC-01).
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
};

// Placeholder — swap for real pool once stack is finalized:
// import { Pool } from 'pg';
// export const pool = new Pool(dbConfig);
