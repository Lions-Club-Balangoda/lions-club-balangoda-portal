import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

let instance: DatabaseSync | null = null;

/**
 * Initializes the database tables matching 001_initial_schema.sql
 */
function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'EDITOR',
      is_active INTEGER NOT NULL DEFAULT 1,
      last_login_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      project_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      summary TEXT NOT NULL,
      description TEXT NOT NULL,
      cover_image_url TEXT,
      cover_asset_id TEXT,
      event_date TEXT NOT NULL,
      location TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      published_at TEXT,
      author_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
    CREATE INDEX IF NOT EXISTS idx_projects_event_date ON projects(event_date);
    CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
  `);
}

/**
 * Seeds placeholder test data for development/test environments.
 * Requirement: Uses placeholder rows clearly marked as test data in dev only (no fictional club data in staging/production).
 */
export function seedDevelopmentTestData(db: DatabaseSync) {
  // Only seed in non-production environments
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // Check if projects already exist
  const countRow = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
  if (countRow && countRow.count > 0) {
    return;
  }

  // Insert test author
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (user_id, username, email, password_hash, full_name, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertUser.run(
    'usr-dev-001',
    'dev_test_author',
    'dev@lionsclubbalangoda.test',
    '$2a$12$devtestpasswordhashplaceholder',
    'Dev Test Administrator',
    'ADMIN'
  );

  const insertProject = db.prepare(`
    INSERT INTO projects (
      project_id, title, slug, category, summary, description,
      cover_image_url, event_date, location, status, published_at, author_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Published Dev-Test initiatives (clearly marked [DEV-TEST])
  insertProject.run(
    'proj-test-001',
    '[DEV-TEST] Annual Free Cataract Surgery & Vision Camp 2026',
    'dev-test-annual-free-cataract-surgery-vision-camp-2026',
    'HEALTHCARE',
    'Placeholder dev test project: Comprehensive vision screening and 50+ free cataract surgeries for rural elders in Balangoda.',
    '<p>Detailed medical report and post-operative follow-up records conducted by volunteer ophthalmologists.</p>',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    '2026-03-15',
    'Base Hospital Auditorium, Balangoda',
    'PUBLISHED',
    '2026-03-16T10:00:00Z',
    'usr-dev-001'
  );

  insertProject.run(
    'proj-test-002',
    '[DEV-TEST] School Supplies & Book Donation Drive 2026',
    'dev-test-school-supplies-book-donation-drive-2026',
    'EDUCATION',
    'Placeholder dev test project: Distribution of essential textbooks, school bags, and stationery sets to 250 students.',
    '<p>Educational support initiative supporting low-income primary students across Medadumbara Vidyalaya.</p>',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    '2026-02-10',
    'Medadumbara Maha Vidyalaya, Balangoda',
    'PUBLISHED',
    '2026-02-11T09:00:00Z',
    'usr-dev-001'
  );

  insertProject.run(
    'proj-test-003',
    '[DEV-TEST] Green Balangoda Watershed Reforestation 2025',
    'dev-test-green-balangoda-watershed-reforestation-2025',
    'ENVIRONMENT',
    'Placeholder dev test project: Planting 1,200 native tree saplings to prevent soil erosion along the upper Walawe river basin.',
    '<p>Environmental conservation program executed in partnership with the Forest Department and youth volunteers.</p>',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    '2025-11-20',
    'Walawe River Catchment Basin, Kaltota',
    'PUBLISHED',
    '2025-11-21T08:30:00Z',
    'usr-dev-001'
  );

  insertProject.run(
    'proj-test-004',
    '[DEV-TEST] Emergency Flood Relief & Dry Rations Distribution',
    'dev-test-emergency-flood-relief-dry-rations-distribution',
    'POVERTY_RELIEF',
    'Placeholder dev test project: Emergency relief packs with dry rations, baby food, and water purification tablets.',
    '<p>Rapid emergency relief mobilization assisting 180 families displaced by flash floods in rural Kaltota.</p>',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    '2025-05-18',
    'Community Centre, Kaltota',
    'PUBLISHED',
    '2025-05-19T14:00:00Z',
    'usr-dev-001'
  );

  // Draft project (MUST NEVER APPEAR in public list)
  insertProject.run(
    'proj-test-005-draft',
    '[DEV-TEST] Upcoming Diabetes Awareness Clinic (Unpublished Draft)',
    'dev-test-upcoming-diabetes-awareness-clinic-draft',
    'HEALTHCARE',
    'Draft internal project for planning mobile blood glucose screening units.',
    '<p>Internal draft agenda. Not yet approved by the club executive board.</p>',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
    '2026-06-01',
    'Balangoda Urban Council Ground',
    'DRAFT',
    null,
    'usr-dev-001'
  );

  // Archived project (MUST NEVER APPEAR in public list)
  insertProject.run(
    'proj-test-006-archived',
    '[DEV-TEST] Past COVID-19 Sanitizer Drive 2021 (Archived)',
    'dev-test-past-covid-sanitizer-drive-2021-archived',
    'HEALTHCARE',
    'Historical archived initiative.',
    '<p>Archived documentation.</p>',
    null,
    '2021-08-14',
    'Balangoda Market Square',
    'ARCHIVED',
    '2021-08-15T10:00:00Z',
    'usr-dev-001'
  );
}

/**
 * Returns the singleton Database instance.
 */
export function getDatabase(): DatabaseSync {
  if (instance) {
    return instance;
  }

  // Ensure .data directory exists for local persistence in dev
  const dataDir = path.join(process.cwd(), '.data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'portal.sqlite');
  instance = new DatabaseSync(dbPath);

  initSchema(instance);
  seedDevelopmentTestData(instance);

  return instance;
}

/**
 * Factory for creating an isolated in-memory database for testing.
 */
export function createTestDatabase(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  initSchema(db);
  return db;
}

/**
 * Parameterised query helper that ensures SQL injection protection.
 */
export function query<T = unknown>(
  sql: string,
  params: unknown[] = [],
  customDb?: DatabaseSync
): T[] {
  const db = customDb || getDatabase();
  const stmt = db.prepare(sql);
  return stmt.all(...(params as (string | number | bigint | null | Uint8Array)[])) as T[];
}
