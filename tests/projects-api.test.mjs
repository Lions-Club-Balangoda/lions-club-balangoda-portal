import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { getPublishedProjects, getPublishedProjectBySlug } from '../src/lib/projects-repository.ts';
import { createTestDatabase } from '../src/lib/db.ts';

describe('Community Projects API & Parameterised Database Layer (LBW-10)', () => {
  let testDb;

  before(() => {
    // Spin up an isolated test database with controlled fixtures
    testDb = createTestDatabase();

    // Insert author
    testDb
      .prepare(
        `
      INSERT INTO users (user_id, username, email, password_hash, full_name, role)
      VALUES ('usr-test-01', 'test_chair', 'chair@lionsbalangoda.test', 'hash', 'Lion Dr. Test', 'ADMIN')
    `
      )
      .run();

    const insertProject = testDb.prepare(`
      INSERT INTO projects (
        project_id, title, slug, category, summary, description,
        cover_image_url, event_date, location, status, published_at, author_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. Published project 1
    insertProject.run(
      'proj-pub-001',
      '[DEV-TEST] Cataract Surgery Camp',
      'cataract-surgery-camp-2026',
      'HEALTHCARE',
      'Vision screening and free cataract surgeries.',
      '<p>Long report</p>',
      'https://example.com/images/cataract.jpg',
      '2026-03-15',
      'Balangoda Town Hall',
      'PUBLISHED',
      '2026-03-16T08:00:00Z',
      'usr-test-01'
    );

    // 2. Published project 2
    insertProject.run(
      'proj-pub-002',
      '[DEV-TEST] School Book Donation',
      'school-book-donation-2026',
      'EDUCATION',
      'Textbooks and bags for 200 children.',
      '<p>Long report</p>',
      'https://example.com/images/books.jpg',
      '2026-02-10',
      'Medadumbara Vidyalaya',
      'PUBLISHED',
      '2026-02-11T09:00:00Z',
      'usr-test-01'
    );

    // 3. Unpublished Draft project (MUST NEVER BE RETURNED)
    insertProject.run(
      'proj-draft-003',
      '[DEV-TEST] Secret Future Project (Draft)',
      'secret-future-project-draft',
      'ENVIRONMENT',
      'Internal planning document for upcoming tree drive.',
      '<p>Draft copy</p>',
      'https://example.com/images/draft.jpg',
      '2026-07-01',
      'Kaltota Forest Reserve',
      'DRAFT',
      null,
      'usr-test-01'
    );

    // 4. Archived project (MUST NEVER BE RETURNED)
    insertProject.run(
      'proj-archived-004',
      '[DEV-TEST] Past Flood Relief 2020 (Archived)',
      'past-flood-relief-2020-archived',
      'POVERTY_RELIEF',
      'Historical emergency relief effort from 2020.',
      '<p>Archived copy</p>',
      'https://example.com/images/archived.jpg',
      '2020-05-10',
      'Kaltota',
      'ARCHIVED',
      '2020-05-11T10:00:00Z',
      'usr-test-01'
    );
  });

  after(() => {
    testDb.close();
  });

  it('AC1 & AC6: Returns published projects via parameterised query with title, category, date, cover image', () => {
    const projects = getPublishedProjects(testDb);

    assert.ok(Array.isArray(projects), 'Result must be an array');
    assert.strictEqual(projects.length, 2, 'Should only return the 2 PUBLISHED projects');

    // Verify all AC1 required fields
    for (const p of projects) {
      assert.ok(p.id, 'Project must contain id');
      assert.ok(p.title, 'Project must contain title');
      assert.ok(p.category, 'Project must contain category');
      assert.ok(p.eventDate, 'Project must contain eventDate');
      assert.ok(p.coverImageUrl, 'Project must contain coverImageUrl');
      assert.strictEqual(p.status, 'PUBLISHED', 'Every item must have status PUBLISHED');
    }

    // Verify chronological order (newest first)
    assert.strictEqual(projects[0].id, 'proj-pub-001'); // 2026-03-15
    assert.strictEqual(projects[1].id, 'proj-pub-002'); // 2026-02-10
  });

  it('AC2: Strictly excludes unpublished DRAFT and ARCHIVED projects from API/repository response', () => {
    const projects = getPublishedProjects(testDb);

    // Verify draft is completely excluded
    const hasDraft = projects.some((p) => p.status === 'DRAFT' || p.id === 'proj-draft-003');
    assert.strictEqual(
      hasDraft,
      false,
      'Unpublished DRAFT projects must never leak into public results'
    );

    // Verify archived is completely excluded
    const hasArchived = projects.some(
      (p) => p.status === 'ARCHIVED' || p.id === 'proj-archived-004'
    );
    assert.strictEqual(hasArchived, false, 'ARCHIVED projects must never leak into public results');

    // Verify slug query also rejects drafts
    const draftLookup = getPublishedProjectBySlug('secret-future-project-draft', testDb);
    assert.strictEqual(draftLookup, null, 'Direct slug query for DRAFT project must return null');

    const publishedLookup = getPublishedProjectBySlug('cataract-surgery-camp-2026', testDb);
    assert.ok(publishedLookup, 'Published slug lookup must succeed');
    assert.strictEqual(publishedLookup.id, 'proj-pub-001');
  });

  it('AC3: When database has no published projects, returns empty array without throwing', () => {
    // Create an empty database
    const emptyDb = createTestDatabase();
    const results = getPublishedProjects(emptyDb);
    assert.ok(Array.isArray(results));
    assert.strictEqual(results.length, 0, 'Must return empty array when no projects exist');
    emptyDb.close();
  });

  it('AC4: When database fails, errors are sanitized and no raw SQL or stack trace is exposed', () => {
    // Simulate database failure by passing a closed DB
    const brokenDb = createTestDatabase();
    brokenDb.close(); // closing causes any prepare/query to throw

    let caughtError = null;
    try {
      getPublishedProjects(brokenDb);
    } catch (err) {
      caughtError = err;
    }

    assert.ok(caughtError, 'Expected an error to be thrown on DB failure');
    assert.strictEqual(caughtError.message, 'Database operation failed');

    // Verify no raw SQL keywords are exposed
    const errText = caughtError.message.toLowerCase();
    assert.strictEqual(errText.includes('select'), false);
    assert.strictEqual(errText.includes('projects'), false);
    assert.strictEqual(errText.includes('sqlite'), false);
    assert.strictEqual(errText.includes('syntax error'), false);
  });
});
