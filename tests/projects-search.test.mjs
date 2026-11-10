import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Import domain logic and repository functions
import {
  filterProjects,
  sanitizeSearchQuery,
} from '../src/lib/projects.ts';
import {
  searchPublishedProjects,
  getPublishedProjects,
} from '../src/lib/projects-repository.ts';
import { createTestDatabase } from '../src/lib/db.ts';
import { SEED_PROJECTS } from '../src/data/mock-projects.ts';

describe('Published Projects Search by Keyword Slice (Acceptance Criteria Suite)', () => {
  let testDb;

  before(() => {
    // Spin up an isolated test database with controlled fixtures
    testDb = createTestDatabase();

    // Insert author
    testDb.prepare(`
      INSERT INTO users (user_id, username, email, password_hash, full_name, role)
      VALUES ('usr-test-search', 'search_author', 'author@lionsbalangoda.test', 'hash', 'Lion Search Admin', 'ADMIN')
    `).run();

    const insertProject = testDb.prepare(`
      INSERT INTO projects (
        project_id, title, slug, category, summary, description,
        cover_image_url, event_date, location, status, published_at, author_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. Published Project 1 (Healthcare / 2026)
    insertProject.run(
      'proj-pub-01',
      'Annual Free Cataract Surgery & Eye Screening Camp',
      'cataract-surgery-camp-2026',
      'HEALTHCARE',
      'Comprehensive vision screening and free cataract surgeries for 450 rural elders in Balangoda.',
      '<p>Medical report detailing vision treatments and eyeglasses distribution.</p>',
      'https://example.com/cataract.jpg',
      '2026-03-15',
      'Base Hospital Auditorium, Balangoda',
      'PUBLISHED',
      '2026-03-16T08:00:00Z',
      'usr-test-search'
    );

    // 2. Published Project 2 (Education / 2026)
    insertProject.run(
      'proj-pub-02',
      'School Supplies & Textbook Donation Drive for Students',
      'school-supplies-textbook-donation-2026',
      'EDUCATION',
      'Distribution of essential textbooks, geometry sets, and backpacks to 280 underprivileged primary students.',
      '<p>Educational support program conducted at Medadumbara Vidyalaya.</p>',
      'https://example.com/books.jpg',
      '2026-01-20',
      'Medadumbara Maha Vidyalaya, Balangoda',
      'PUBLISHED',
      '2026-01-21T09:00:00Z',
      'usr-test-search'
    );

    // 3. Published Project 3 (Environment / 2025)
    insertProject.run(
      'proj-pub-03',
      'Green Balangoda: Watershed Reforestation Campaign',
      'green-balangoda-watershed-reforestation-2025',
      'ENVIRONMENT',
      'Planting 1,200 native tree saplings to restore the Walawe river catchment basin and stop landslides.',
      '<p>Community tree-planting initiative with youth volunteers.</p>',
      'https://example.com/trees.jpg',
      '2025-11-10',
      'Walawe River Basin, Kaltota',
      'PUBLISHED',
      '2025-11-11T10:00:00Z',
      'usr-test-search'
    );

    // 4. Published Project 4 (Poverty Relief / 2025)
    insertProject.run(
      'proj-pub-04',
      'Emergency Flood Relief and Dry Ration Distribution',
      'emergency-flood-relief-dry-rations-2025',
      'POVERTY_RELIEF',
      'Emergency relief packs containing dry rations, infant formula, and clean water for 150 displaced families.',
      '<p>Flood emergency response in Kaltota.</p>',
      'https://example.com/flood.jpg',
      '2025-06-18',
      'Community Hall, Kaltota',
      'PUBLISHED',
      '2025-06-19T14:00:00Z',
      'usr-test-search'
    );

    // 5. UNPUBLISHED DRAFT (MUST NEVER BE RETURNED)
    insertProject.run(
      'proj-draft-05',
      'Upcoming Diabetes Screening Camp (Internal Draft)',
      'upcoming-diabetes-screening-camp-draft',
      'HEALTHCARE',
      'Planning draft for mobile blood glucose clinic in tea plantations.',
      '<p>Confidential board notes.</p>',
      'https://example.com/draft.jpg',
      '2026-10-01',
      'Balangoda Urban Council',
      'DRAFT',
      null,
      'usr-test-search'
    );

    // 6. ARCHIVED (MUST NEVER BE RETURNED)
    insertProject.run(
      'proj-archived-06',
      'Past Eye Clinic 2019 (Archived Record)',
      'past-eye-clinic-2019-archived',
      'HEALTHCARE',
      'Archived record of historical eye clinic.',
      '<p>Archived data.</p>',
      'https://example.com/archived.jpg',
      '2019-02-15',
      'Balangoda',
      'ARCHIVED',
      '2019-02-16T10:00:00Z',
      'usr-test-search'
    );
  });

  after(() => {
    testDb.close();
  });

  // AC1: Visitors can search published projects by keyword across title and summary
  describe('AC1: Keyword search across title and summary', () => {
    it('searches by keyword matching title', () => {
      const results = searchPublishedProjects({ query: 'Cataract' }, testDb);
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, 'proj-pub-01');
      assert.ok(results[0].title.includes('Cataract'));
    });

    it('searches by keyword matching summary', () => {
      // "geometry sets" is present in summary of proj-pub-02 but NOT in its title
      const results = searchPublishedProjects({ query: 'geometry sets' }, testDb);
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, 'proj-pub-02');
      assert.ok(results[0].summary.includes('geometry sets'));
      assert.ok(!results[0].title.includes('geometry sets'));
    });

    it('searches case-insensitively across title and summary', () => {
      const lower = searchPublishedProjects({ query: 'reforestation' }, testDb);
      const upper = searchPublishedProjects({ query: 'REFORESTATION' }, testDb);
      const mixed = searchPublishedProjects({ query: 'ReFoReStAtIoN' }, testDb);

      assert.strictEqual(lower.length, 1);
      assert.strictEqual(upper.length, 1);
      assert.strictEqual(mixed.length, 1);
      assert.strictEqual(lower[0].id, upper[0].id);
      assert.strictEqual(lower[0].id, mixed[0].id);
    });

    it('searches summary keyword "saplings" and finds matching initiative', () => {
      const results = searchPublishedProjects({ query: 'saplings' }, testDb);
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, 'proj-pub-03');
      assert.ok(results[0].summary.includes('saplings'));
    });
  });

  // AC2: Search input is sanitised and queries are parameterised
  describe('AC2: Input sanitisation and parameterised queries', () => {
    it('sanitises XSS script tags and special injection characters', () => {
      const scriptPayload = "<script>alert('xss-exploit')</script>";
      const sanitized = sanitizeSearchQuery(scriptPayload);
      assert.strictEqual(sanitized, '', 'Script tags must be stripped');

      const tagPayload = "<img src=x onerror=alert('hack')>";
      const sanitizedTag = sanitizeSearchQuery(tagPayload);
      assert.ok(!sanitizedTag.includes('<'));
      assert.ok(!sanitizedTag.includes('>'));
    });

    it('parameterised query safely blocks SQL injection attacks', () => {
      // Classic SQL injection attempt to bypass WHERE status = 'PUBLISHED'
      const sqlInjection = "' OR 1=1 --";
      const results = searchPublishedProjects({ query: sqlInjection }, testDb);

      // Must NOT return draft or archived projects (which a raw unparameterised query would leak)
      assert.strictEqual(results.length, 0, 'SQL injection must yield 0 results through parameterised statement');
      const hasDraft = results.some((p) => p.status === 'DRAFT');
      assert.strictEqual(hasDraft, false);
    });

    it('sanitises query with script tags and runs parameterised search safely', () => {
      const xssAttempt = "<script>document.cookie</script>Cataract";
      const results = searchPublishedProjects({ query: xssAttempt }, testDb);

      // After stripping <script> tags, "Cataract" remains and finds the project safely
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, 'proj-pub-01');
    });
  });

  // AC3: Search works together with category and year filters
  describe('AC3: Search works together with category/year filters', () => {
    it('combines keyword search with category filter matching project', () => {
      const results = searchPublishedProjects(
        { query: 'Cataract', category: 'HEALTHCARE' },
        testDb
      );
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, 'proj-pub-01');
    });

    it('combines keyword search with category filter resulting in 0 matches on category mismatch', () => {
      // "Cataract" exists in HEALTHCARE, so filtering under EDUCATION must return 0
      const results = searchPublishedProjects(
        { query: 'Cataract', category: 'EDUCATION' },
        testDb
      );
      assert.strictEqual(results.length, 0);
    });

    it('combines keyword search with event year filter matching', () => {
      // "Reforestation" occurred in 2025
      const match2025 = searchPublishedProjects(
        { query: 'Reforestation', year: '2025' },
        testDb
      );
      assert.strictEqual(match2025.length, 1);
      assert.strictEqual(match2025[0].id, 'proj-pub-03');

      // Filtering under year 2026 must return 0
      const mismatch2026 = searchPublishedProjects(
        { query: 'Reforestation', year: '2026' },
        testDb
      );
      assert.strictEqual(mismatch2026.length, 0);
    });

    it('combines keyword search + category + year in a 3-way intersection', () => {
      const threeWayMatch = searchPublishedProjects(
        { query: 'textbooks', category: 'EDUCATION', year: '2026' },
        testDb
      );
      assert.strictEqual(threeWayMatch.length, 1);
      assert.strictEqual(threeWayMatch[0].id, 'proj-pub-02');

      const threeWayMismatch = searchPublishedProjects(
        { query: 'textbooks', category: 'EDUCATION', year: '2025' },
        testDb
      );
      assert.strictEqual(threeWayMismatch.length, 0);
    });
  });

  // AC4: No matches shows a helpful empty-state message with a way to clear the search
  describe('AC4: Empty state message and clear search mechanism', () => {
    it('returns empty array when search query matches no projects', () => {
      const results = searchPublishedProjects(
        { query: 'CompletelyNonexistentKeywordXYZ123' },
        testDb
      );
      assert.strictEqual(Array.isArray(results), true);
      assert.strictEqual(results.length, 0);
    });

    it('UI component source contains helpful empty state and dedicated clear search button', () => {
      const componentPath = path.join(
        process.cwd(),
        'src/components/projects/ProjectsList.tsx'
      );
      const source = fs.readFileSync(componentPath, 'utf8');

      // 1. Test for helpful empty state container
      assert.ok(
        source.includes('data-testid="no-search-results"'),
        'Must contain data-testid="no-search-results"'
      );

      // 2. Test for dynamic contextual heading showing search query
      assert.ok(
        source.includes('No published projects found matching'),
        'Must display helpful message mentioning the search query'
      );

      // 3. Test for helpful advice text
      assert.ok(
        source.includes('Try checking for spelling mistakes'),
        'Must provide constructive guidance to the community visitor'
      );

      // 4. Test for Clear Search button
      assert.ok(
        source.includes('data-testid="clear-search-btn"'),
        'Must have data-testid="clear-search-btn" to clear search query'
      );

      // 5. Test for Reset All Filters button
      assert.ok(
        source.includes('data-testid="reset-filters-btn"'),
        'Must have data-testid="reset-filters-btn"'
      );
    });
  });

  // AC5: Only published projects are returned
  describe('AC5: Public data privacy - only published projects returned', () => {
    it('strictly excludes DRAFT projects when searching for exact draft title', () => {
      const searchDraft = searchPublishedProjects(
        { query: 'Diabetes Screening Camp' },
        testDb
      );
      assert.strictEqual(searchDraft.length, 0, 'Draft project must not be returned');
    });

    it('strictly excludes DRAFT projects when searching by draft summary content', () => {
      const searchDraftSummary = searchPublishedProjects(
        { query: 'mobile blood glucose' },
        testDb
      );
      assert.strictEqual(searchDraftSummary.length, 0, 'Draft summary must not leak');
    });

    it('strictly excludes ARCHIVED projects when searching for exact archived title', () => {
      const searchArchived = searchPublishedProjects(
        { query: 'Past Eye Clinic 2019' },
        testDb
      );
      assert.strictEqual(searchArchived.length, 0, 'Archived project must not be returned');
    });

    it('all returned search results strictly have status = "PUBLISHED"', () => {
      const allResults = searchPublishedProjects({}, testDb);
      assert.ok(allResults.length > 0);
      assert.ok(
        allResults.every((p) => p.status === 'PUBLISHED'),
        'Every returned project must have status = PUBLISHED'
      );
    });
  });

  // AC6: Usable on mobile (360px)
  describe('AC6: Usable on mobile (360px viewport)', () => {
    it('UI component source enforces mobile responsiveness without horizontal page overflow', () => {
      const componentPath = path.join(
        process.cwd(),
        'src/components/projects/ProjectsList.tsx'
      );
      const source = fs.readFileSync(componentPath, 'utf8');

      // Test container has max-w-full and min-w-0 to prevent flex/grid overflow
      assert.ok(
        source.includes('w-full max-w-full min-w-0'),
        'Container must have max-w-full and min-w-0 for mobile viewport protection'
      );

      // Test search input has box-border and full width
      assert.ok(
        source.includes('box-border'),
        'Search input must have box-border'
      );

      // Test category pills use horizontal scroll without page overflow
      assert.ok(
        source.includes('overflow-x-auto'),
        'Category pills must scroll horizontally on small viewports'
      );

      // Test grid uses single column on mobile 360px (grid-cols-1)
      assert.ok(
        source.includes('grid-cols-1'),
        'Grid must use single column on mobile viewports'
      );
    });
  });
});

