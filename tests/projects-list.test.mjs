import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Import domain logic and mock data from the Projects vertical slice
import {
  filterProjects,
  getProjectBySlug,
  getUniqueProjectYears,
  sanitizeSearchQuery,
} from '../src/lib/projects.ts';
import { SEED_PROJECTS } from '../src/data/mock-projects.ts';

describe('Projects List Vertical Slice (FR-02, UC02) Test Suite', () => {
  it('TC-PROJ-001: Initial load returns all published projects and excludes drafts', () => {
    const results = filterProjects(SEED_PROJECTS);

    // Total seed items: 6 (5 published, 1 draft)
    assert.strictEqual(results.length, 5, 'Should return exactly 5 published projects');

    // Verify no DRAFT items leaked
    const hasDrafts = results.some((p) => p.status === 'DRAFT');
    assert.strictEqual(hasDrafts, false, 'Draft projects must not appear in public results');

    // Verify all items have required card fields
    results.forEach((p) => {
      assert.ok(p.id, 'Project must have an id');
      assert.ok(p.title, 'Project must have a title');
      assert.ok(p.slug, 'Project must have a slug');
      assert.ok(p.category, 'Project must have a category');
      assert.ok(p.summary, 'Project must have a summary');
      assert.ok(p.coverImageUrl, 'Project must have a cover image URL');
      assert.ok(p.eventDate, 'Project must have an event date');
      assert.strictEqual(p.status, 'PUBLISHED', 'Project status must be PUBLISHED');
    });
  });

  it('TC-PROJ-002: Filter projects by Service Pillar category', () => {
    const healthcareProjects = filterProjects(SEED_PROJECTS, { category: 'HEALTHCARE' });
    assert.strictEqual(healthcareProjects.length, 2, 'Should return 2 healthcare projects');
    assert.ok(
      healthcareProjects.every((p) => p.category === 'HEALTHCARE'),
      'All returned projects must belong to HEALTHCARE pillar'
    );

    const educationProjects = filterProjects(SEED_PROJECTS, { category: 'EDUCATION' });
    assert.strictEqual(
      educationProjects.length,
      1,
      'Should return 1 published education project (draft excluded)'
    );
    assert.strictEqual(educationProjects[0].category, 'EDUCATION');

    const envProjects = filterProjects(SEED_PROJECTS, { category: 'ENVIRONMENT' });
    assert.strictEqual(envProjects.length, 1, 'Should return 1 environment project');
    assert.strictEqual(envProjects[0].category, 'ENVIRONMENT');

    const reliefProjects = filterProjects(SEED_PROJECTS, { category: 'POVERTY_RELIEF' });
    assert.strictEqual(reliefProjects.length, 1, 'Should return 1 poverty relief project');
    assert.strictEqual(reliefProjects[0].category, 'POVERTY_RELIEF');
  });

  it('TC-PROJ-003: Keyword search by project title (case-insensitive)', () => {
    const searchVision = filterProjects(SEED_PROJECTS, { query: 'vision' });
    assert.strictEqual(searchVision.length, 1);
    assert.ok(searchVision[0].title.includes('Vision Screening'));

    const searchUpper = filterProjects(SEED_PROJECTS, { query: 'CATARACT' });
    assert.strictEqual(searchUpper.length, 1);
    assert.ok(searchUpper[0].title.includes('Cataract'));
  });

  it('TC-PROJ-004: Keyword search matches project location and summary', () => {
    // Search by specific location: "Medadumbara"
    const medadumbaraResults = filterProjects(SEED_PROJECTS, { query: 'Medadumbara' });
    assert.strictEqual(medadumbaraResults.length, 1);
    assert.strictEqual(medadumbaraResults[0].slug, 'school-supplies-book-donation-drive-2026');
    assert.ok(medadumbaraResults[0].location.includes('Medadumbara'));

    // Search by location: "Kaltota"
    const kaltotaResults = filterProjects(SEED_PROJECTS, { query: 'Kaltota' });
    assert.strictEqual(kaltotaResults.length, 1);
    assert.strictEqual(kaltotaResults[0].category, 'POVERTY_RELIEF');

    // Search by summary keyword: "saplings"
    const summarySearch = filterProjects(SEED_PROJECTS, { query: 'saplings' });
    assert.strictEqual(summarySearch.length, 1);
    assert.strictEqual(summarySearch[0].slug, 'green-balangoda-watershed-reforestation-2025');
  });

  it('TC-PROJ-005: Combined category and keyword search filters accurately', () => {
    // Category: HEALTHCARE, Query: "Diabetes"
    const combinedMatch = filterProjects(SEED_PROJECTS, {
      category: 'HEALTHCARE',
      query: 'Diabetes',
    });
    assert.strictEqual(combinedMatch.length, 1);
    assert.strictEqual(combinedMatch[0].slug, 'mobile-diabetes-awareness-screening-clinic-2026');

    // Category: EDUCATION, Query: "Diabetes" -> Should yield 0 results
    const combinedMismatch = filterProjects(SEED_PROJECTS, {
      category: 'EDUCATION',
      query: 'Diabetes',
    });
    assert.strictEqual(
      combinedMismatch.length,
      0,
      'Should yield 0 results when query does not match category'
    );
  });

  it('TC-PROJ-006: Empty search results state handling', () => {
    const noResults = filterProjects(SEED_PROJECTS, { query: 'NonexistentProjectQueryXYZ' });
    assert.strictEqual(Array.isArray(noResults), true);
    assert.strictEqual(noResults.length, 0, 'Should return empty array for non-matching search');
  });

  it('TC-PROJ-007: Filter by event year correctly matches dates', () => {
    const year2026 = filterProjects(SEED_PROJECTS, { year: '2026' });
    assert.strictEqual(year2026.length, 3, 'Should return 3 published projects in 2026');
    assert.ok(year2026.every((p) => p.eventDate.startsWith('2026')));

    const year2025 = filterProjects(SEED_PROJECTS, { year: '2025' });
    assert.strictEqual(year2025.length, 2, 'Should return 2 published projects in 2025');
    assert.ok(year2025.every((p) => p.eventDate.startsWith('2025')));
  });

  it('TC-PROJ-008: Security rule: Draft projects are strictly blocked from public view', () => {
    // Attempt to search specifically for the draft project's title
    const searchDraft = filterProjects(SEED_PROJECTS, { query: 'Vocational IT Skills' });
    assert.strictEqual(searchDraft.length, 0, 'Public search must never return draft projects');

    // Attempt to filter by EDUCATION category where draft exists
    const educationProjects = filterProjects(SEED_PROJECTS, { category: 'EDUCATION' });
    const hasDraft = educationProjects.some((p) => p.status === 'DRAFT');
    assert.strictEqual(hasDraft, false);
  });

  it('TC-PROJ-009: Input sanitization protects against XSS payloads', () => {
    const maliciousScript = "<script>alert('xss')</script>";
    const sanitized = sanitizeSearchQuery(maliciousScript);
    assert.strictEqual(sanitized, '', 'Script tags must be completely stripped');

    const htmlInjection = '<b>Bold text</b>';
    const sanitizedHtml = sanitizeSearchQuery(htmlInjection);
    assert.ok(!sanitizedHtml.includes('<'), 'Less-than angle bracket must be escaped');
    assert.ok(!sanitizedHtml.includes('>'), 'Greater-than angle bracket must be escaped');

    // Executing filter with malicious script should safely return empty without crashing
    const searchWithPayload = filterProjects(SEED_PROJECTS, { query: maliciousScript });
    assert.strictEqual(searchWithPayload.length, 0);
  });

  it('TC-PROJ-010: Slug lookup retrieves published projects and rejects drafts', () => {
    const publishedProject = getProjectBySlug('annual-free-cataract-surgery-vision-camp-2026');
    assert.ok(publishedProject);
    assert.strictEqual(publishedProject.id, 'proj-001');

    const draftProject = getProjectBySlug('youth-vocational-it-skills-workshop-draft');
    assert.strictEqual(draftProject, undefined, 'Draft project slug lookup must return undefined');

    const nonexistent = getProjectBySlug('nonexistent-slug');
    assert.strictEqual(nonexistent, undefined);
  });

  it('TC-PROJ-011: Unique years extraction returns sorted published years', () => {
    const years = getUniqueProjectYears(SEED_PROJECTS);
    assert.deepStrictEqual(years, ['2026', '2025'], 'Years should be unique and sorted descending');
  });

  it('TC-PROJ-012: Results are sorted chronologically descending (newest first)', () => {
    const results = filterProjects(SEED_PROJECTS);
    for (let i = 0; i < results.length - 1; i++) {
      const currentDate = new Date(results[i].eventDate).getTime();
      const nextDate = new Date(results[i + 1].eventDate).getTime();
      assert.ok(
        currentDate >= nextDate,
        `Projects must be ordered by eventDate descending: ${results[i].eventDate} >= ${results[i + 1].eventDate}`
      );
    }
  });
});
