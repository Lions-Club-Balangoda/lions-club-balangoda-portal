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

    CREATE TABLE IF NOT EXISTS board_terms (
      term_id TEXT PRIMARY KEY,
      term_label TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      is_current INTEGER NOT NULL DEFAULT 0,
      theme TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS executive_members (
      member_id TEXT PRIMARY KEY,
      term_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      designation TEXT NOT NULL,
      lion_title TEXT,
      bio TEXT,
      profile_image_url TEXT,
      profile_asset_id TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (term_id) REFERENCES board_terms(term_id)
    );

    CREATE INDEX IF NOT EXISTS idx_board_terms_current ON board_terms(is_current);
    CREATE INDEX IF NOT EXISTS idx_board_terms_dates ON board_terms(start_date DESC);
    CREATE INDEX IF NOT EXISTS idx_exec_members_term_order ON executive_members(term_id, display_order ASC);
    CREATE INDEX IF NOT EXISTS idx_exec_members_status ON executive_members(status);
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

  // Check if board_terms already exist
  const countTerms = db.prepare('SELECT COUNT(*) as count FROM board_terms').get() as {
    count: number;
  };
  if (!countTerms || countTerms.count === 0) {
    const insertTerm = db.prepare(`
      INSERT INTO board_terms (term_id, term_label, start_date, end_date, is_current, theme)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertTerm.run(
      '2023-2024',
      'Lionistic Year 2023/2024',
      '2023-07-01',
      '2024-06-30',
      0,
      'Changing the World through Service'
    );
    insertTerm.run(
      '2024-2025',
      'Lionistic Year 2024/2025',
      '2024-07-01',
      '2025-06-30',
      0,
      'Make Your Mark'
    );
    insertTerm.run(
      '2025-2026',
      'Lionistic Year 2025/2026',
      '2025-07-01',
      '2026-06-30',
      1,
      'Lead With Care, Serve With Pride'
    );

    const insertMember = db.prepare(`
      INSERT INTO executive_members (
        member_id, term_id, full_name, designation, lion_title, bio,
        profile_image_url, contact_email, contact_phone, display_order, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 2025-2026 members
    insertMember.run(
      'mem-2025-001',
      '2025-2026',
      'T. Sanjeewa Prasad Jayaweera',
      'Club President',
      'Lion Prof.',
      'Dean & Professor leading community service, educational upliftment, and sustainable healthcare initiatives across the Balangoda region.',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      'president@lionsclubbalangoda.org',
      '+94 45 228 7200',
      1,
      'ACTIVE'
    );
    insertMember.run(
      'mem-2025-002',
      '2025-2026',
      'Sunil Rathnayake',
      'Club Secretary',
      'Lion',
      'Overseeing club administrative affairs, project correspondence, and international reporting with District 306.',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      'secretary@lionsclubbalangoda.org',
      '+94 45 228 7201',
      2,
      'ACTIVE'
    );
    insertMember.run(
      'mem-2025-003',
      '2025-2026',
      'Chinthaka Fernando',
      'Club Treasurer',
      'Lion',
      'Directing club financial governance, philanthropic project audit transparency, and treasury stewardship.',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      'treasurer@lionsclubbalangoda.org',
      '+94 45 228 7202',
      3,
      'ACTIVE'
    );
    insertMember.run(
      'mem-2025-004',
      '2025-2026',
      'Dr. R.M. Senarathne',
      '1st Vice President & Project Chair',
      'Lion Dr.',
      'Consultant physician spearheading rural vision testing clinics and disaster health relief camps.',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
      'projects@lionsclubbalangoda.org',
      '+94 45 228 7203',
      4,
      'ACTIVE'
    );
    insertMember.run(
      'mem-2025-005',
      '2025-2026',
      'H.M. Bandara',
      'Club Director & Membership Chair',
      'Lion',
      'Dedicated community leader coordinating volunteer engagement and sustainable youth service wings.',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
      'membership@lionsclubbalangoda.org',
      '+94 45 228 7204',
      5,
      'ACTIVE'
    );
    insertMember.run(
      'mem-2025-006-inactive',
      '2025-2026',
      'K.G. Somapala',
      'Honorary Member (Inactive)',
      'Lion',
      'Past honorary member.',
      null,
      null,
      null,
      99,
      'INACTIVE'
    );

    // 2024-2025 members
    insertMember.run(
      'mem-2024-001',
      '2024-2025',
      'H.M. Bandara',
      'Immediate Past President',
      'Lion',
      'Led the landmark Sabaragamuwa environmental reforestation program and youth empowerment drive during 2024/2025.',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
      'pastpresident@lionsclubbalangoda.org',
      '+94 45 228 7204',
      1,
      'ACTIVE'
    );
    insertMember.run(
      'mem-2024-002',
      '2024-2025',
      'Samantha Perera',
      'Club Secretary (2024-2025)',
      'Lion',
      'Managed club correspondence, documentation, and charter anniversary events in the 2024-2025 lionistic year.',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      'pastsecretary@lionsclubbalangoda.org',
      null,
      2,
      'ACTIVE'
    );
    insertMember.run(
      'mem-2024-003',
      '2024-2025',
      'Nihal Jayawardena',
      'Club Treasurer (2024-2025)',
      'Lion',
      'Safeguarded club financial stewardship and oversaw disaster relief funds distribution across Balangoda.',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
      'pasttreasurer@lionsclubbalangoda.org',
      null,
      3,
      'ACTIVE'
    );
  }
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
