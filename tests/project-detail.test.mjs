import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Import domain logic, repository, and helpers
import { getPublishedProjectBySlug } from '../src/lib/projects-repository.ts';
import {
  getPublishedProjectBySlugFromData,
  sanitizeProjectDescription,
  normalizeProjectPhotos,
  hasImpactMetrics,
  formatProjectDate,
} from '../src/lib/projects.ts';
import { createTestDatabase } from '../src/lib/db.ts';

describe('Project Detail Page Slice (FR-03, LBW-11)', () => {
  let testDb;

  before(() => {
    // Isolated in-memory database with full schema (projects, gallery, metrics)
    testDb = createTestDatabase();

    // 1. Author
    testDb
      .prepare(
        `INSERT INTO users (user_id, username, email, password_hash, full_name, role)
         VALUES ('usr-chair-01', 'dr_senarathne', 'chair@lionsbalangoda.test', 'hash', 'Lion Dr. R.M. Senarathne', 'ADMIN')`
      )
      .run();

    // 2. Insert Full Published Project (with metrics and gallery)
    const insertProject = testDb.prepare(`
      INSERT INTO projects (
        project_id, title, slug, category, summary, description,
        cover_image_url, event_date, location, status, published_at, author_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProject.run(
      'proj-full-001',
      'Annual Free Cataract Surgery Camp 2026',
      'annual-free-cataract-surgery-camp-2026',
      'HEALTHCARE',
      'Vision screening and 68 cataract surgeries funded.',
      '<p>Comprehensive eye clinic report with <script>alert("xss")</script>clinical details.</p>',
      'https://example.com/cover-cataract.jpg',
      '2026-03-15',
      'Balangoda Base Hospital',
      'PUBLISHED',
      '2026-03-16T08:00:00Z',
      'usr-chair-01'
    );

    // Gallery images
    const insertGallery = testDb.prepare(`
      INSERT INTO project_gallery (image_id, project_id, image_url, caption, display_order)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertGallery.run(
      'img-001',
      'proj-full-001',
      'https://example.com/photo1.jpg',
      'Examining elderly patient',
      1
    );
    insertGallery.run(
      'img-002',
      'proj-full-001',
      'https://example.com/photo2.jpg',
      'Spectacles handover',
      2
    );

    // Impact metrics
    const insertMetric = testDb.prepare(`
      INSERT INTO project_impact_metrics (metric_id, project_id, label, metric_value, prefix, suffix, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertMetric.run('met-001', 'proj-full-001', 'Patients Screened', '450', null, '+', 1);
    insertMetric.run('met-002', 'proj-full-001', 'Cataract Surgeries', '68', null, null, 2);

    // 3. Insert Minimal Published Project (NO metrics, NO photos, NO cover: AC-2 test)
    insertProject.run(
      'proj-minimal-002',
      'Emergency Flood Relief 2025',
      'emergency-flood-relief-2025',
      'POVERTY_RELIEF',
      'Emergency dry ration supply.',
      '<p>Disaster response operation providing food and water.</p>',
      null, // No cover image
      '2025-06-18',
      'Kaltota Community Hall',
      'PUBLISHED',
      '2025-06-19T08:00:00Z',
      'usr-chair-01'
    );

    // 4. Insert DRAFT project (AC-3: MUST NOT BE ACCESSIBLE)
    insertProject.run(
      'proj-draft-003',
      'Secret Upcoming Workshop (Draft)',
      'secret-upcoming-workshop-draft',
      'EDUCATION',
      'Draft summary not yet approved.',
      '<p>Internal notes.</p>',
      'https://example.com/draft.jpg',
      '2026-12-01',
      'Balangoda Public Library',
      'DRAFT',
      null,
      'usr-chair-01'
    );

    // 5. Insert ARCHIVED project (AC-3: MUST NOT BE ACCESSIBLE)
    insertProject.run(
      'proj-archived-004',
      'Past Sanitizer Drive 2021 (Archived)',
      'past-sanitizer-drive-2021-archived',
      'HEALTHCARE',
      'Archived initiative.',
      '<p>Old archives.</p>',
      null,
      '2021-08-14',
      'Balangoda Square',
      'ARCHIVED',
      '2021-08-15T08:00:00Z',
      'usr-chair-01'
    );
  });

  after(() => {
    testDb.close();
  });

  /* -----------------------------------------------------------------------
   * AC-1: Unique Slug, Description, Date, Location, Category, Metrics, Photos
   * ----------------------------------------------------------------------- */
  describe('AC-1: Data Display & Unique Slug Resolution', () => {
    it('retrieves published project by unique slug with all required details', () => {
      const project = getPublishedProjectBySlug('annual-free-cataract-surgery-camp-2026', testDb);

      assert.ok(project, 'Project must be found');
      assert.strictEqual(project.slug, 'annual-free-cataract-surgery-camp-2026');
      assert.strictEqual(project.title, 'Annual Free Cataract Surgery Camp 2026');
      assert.strictEqual(project.category, 'HEALTHCARE');
      assert.strictEqual(project.location, 'Balangoda Base Hospital');
      assert.strictEqual(project.eventDate, '2026-03-15');
      assert.strictEqual(project.status, 'PUBLISHED');
      assert.ok(project.description.length > 0, 'Description must not be empty');

      // Date formatting verification
      const formatted = formatProjectDate(project.eventDate);
      assert.ok(formatted.includes('2026'), 'Formatted date must include year');

      // Verified author attachment
      assert.strictEqual(project.authorName, 'Lion Dr. R.M. Senarathne');

      // Impact metrics present
      assert.ok(project.impactMetrics, 'Impact metrics should be attached');
      assert.strictEqual(project.impactMetrics.length, 2);
      assert.strictEqual(project.impactMetrics[0].label, 'Patients Screened');
      assert.strictEqual(project.impactMetrics[0].value, '450');
      assert.strictEqual(project.impactMetrics[0].suffix, '+');

      // Photographs present
      assert.ok(project.gallery, 'Gallery should be attached');
      assert.strictEqual(project.gallery.length, 2);
      assert.strictEqual(project.gallery[0].imageUrl, 'https://example.com/photo1.jpg');
      assert.strictEqual(project.gallery[0].caption, 'Examining elderly patient');

      // Photos string array normalized
      const normalizedPhotos = normalizeProjectPhotos(project);
      assert.strictEqual(normalizedPhotos.length, 2);
    });

    it('resolves published project from seed data with verified service pillars', () => {
      const cataract = getPublishedProjectBySlugFromData(
        'annual-free-cataract-surgery-vision-camp-2026'
      );
      assert.ok(cataract);
      assert.strictEqual(cataract.category, 'HEALTHCARE');
      assert.ok(hasImpactMetrics(cataract));
      assert.ok(normalizeProjectPhotos(cataract).length > 0);

      const school = getPublishedProjectBySlugFromData('school-supplies-book-donation-drive-2026');
      assert.ok(school);
      assert.strictEqual(school.category, 'EDUCATION');
      assert.ok(hasImpactMetrics(school));
      assert.ok(normalizeProjectPhotos(school).length > 0);

      const trees = getPublishedProjectBySlugFromData(
        'green-balangoda-watershed-reforestation-2025'
      );
      assert.ok(trees);
      assert.strictEqual(trees.category, 'ENVIRONMENT');
      assert.ok(hasImpactMetrics(trees));
    });
  });

  /* -----------------------------------------------------------------------
   * AC-2: Missing Optional Data Handled Without Empty Boxes or Errors
   * ----------------------------------------------------------------------- */
  describe('AC-2: Defensive Handling of Missing Optional Data', () => {
    it('handles project with missing metrics, photos, and cover without error', () => {
      const minimal = getPublishedProjectBySlug('emergency-flood-relief-2025', testDb);

      assert.ok(minimal, 'Minimal project must be returned');
      assert.strictEqual(minimal.coverImageUrl, null, 'Cover image is null');
      assert.strictEqual(minimal.impactMetrics, undefined, 'Metrics should be undefined');
      assert.strictEqual(minimal.gallery, undefined, 'Gallery should be undefined');
      assert.strictEqual(minimal.photos, undefined, 'Photos should be undefined');

      // Helpers handle undefined without throwing
      assert.strictEqual(hasImpactMetrics(minimal), false);
      const photos = normalizeProjectPhotos(minimal);
      assert.ok(Array.isArray(photos));
      assert.strictEqual(photos.length, 0);
    });

    it('seed project for Flood Relief has no metrics or photos to test AC-2', () => {
      const flood = getPublishedProjectBySlugFromData('emergency-flood-relief-dry-rations-2025');
      assert.ok(flood);
      assert.strictEqual(hasImpactMetrics(flood), false);
      assert.strictEqual(normalizeProjectPhotos(flood).length, 0);
    });

    it('UI components return null when metrics or photos are absent', () => {
      const metricsSource = fs.readFileSync(
        path.join(process.cwd(), 'src/components/projects/ProjectImpactMetrics.tsx'),
        'utf8'
      );
      const gallerySource = fs.readFileSync(
        path.join(process.cwd(), 'src/components/projects/ProjectGallery.tsx'),
        'utf8'
      );

      // Verify ProjectImpactMetrics returns null when metrics are missing/empty
      assert.ok(
        metricsSource.includes('return null;'),
        'ProjectImpactMetrics must return null on empty/missing metrics'
      );

      // Verify ProjectGallery returns null when photos are missing/empty
      assert.ok(
        gallerySource.includes('return null;'),
        'ProjectGallery must return null on empty/missing photos'
      );

      // Verify page template conditionally renders sections
      const pageSource = fs.readFileSync(
        path.join(process.cwd(), 'src/app/projects/[slug]/page.tsx'),
        'utf8'
      );
      assert.ok(
        pageSource.includes('{hasMetrics &&'),
        'Page must conditionally render impact metrics'
      );
      assert.ok(
        pageSource.includes('{hasPhotos &&'),
        'Page must conditionally render photo gallery'
      );
      assert.ok(
        pageSource.includes('{project.coverImageUrl &&'),
        'Page must conditionally render cover image'
      );
    });
  });

  /* -----------------------------------------------------------------------
   * AC-3: Unknown or Unpublished Slug Shows Friendly 404
   * ----------------------------------------------------------------------- */
  describe('AC-3: Strict 404 Protection on Unknown or Unpublished Slugs', () => {
    it('returns null for non-existent / unknown slug', () => {
      const unknownDb = getPublishedProjectBySlug('non-existent-project-slug', testDb);
      assert.strictEqual(unknownDb, null, 'Unknown slug must return null');

      const unknownSeed = getPublishedProjectBySlugFromData('non-existent-project-slug');
      assert.strictEqual(unknownSeed, null, 'Unknown slug in seed must return null');
    });

    it('strictly rejects DRAFT projects and returns null', () => {
      const draftDb = getPublishedProjectBySlug('secret-upcoming-workshop-draft', testDb);
      assert.strictEqual(draftDb, null, 'Draft project must never be accessible via slug query');

      const draftSeed = getPublishedProjectBySlugFromData(
        'youth-vocational-it-skills-workshop-draft'
      );
      assert.strictEqual(draftSeed, null, 'Seed draft project must return null');
    });

    it('strictly rejects ARCHIVED projects and returns null', () => {
      const archivedDb = getPublishedProjectBySlug('past-sanitizer-drive-2021-archived', testDb);
      assert.strictEqual(
        archivedDb,
        null,
        'Archived project must never be accessible via slug query'
      );
    });

    it('project detail page calls notFound() when project is null or unpublished', () => {
      const pageSource = fs.readFileSync(
        path.join(process.cwd(), 'src/app/projects/[slug]/page.tsx'),
        'utf8'
      );
      assert.ok(
        pageSource.includes('notFound()'),
        'ProjectDetailPage must call notFound() when project is missing'
      );
      assert.ok(
        pageSource.includes("project.status !== 'PUBLISHED'"),
        'Page must strictly guard that status is PUBLISHED'
      );
    });

    it('not-found.tsx renders friendly 404 message and return navigation', () => {
      const notFoundSource = fs.readFileSync(
        path.join(process.cwd(), 'src/app/projects/[slug]/not-found.tsx'),
        'utf8'
      );
      assert.ok(
        notFoundSource.includes('Project Not Found'),
        'Not found page must display friendly Project Not Found heading'
      );
      assert.ok(
        notFoundSource.includes('data-testid="project-not-found"'),
        'Must have project-not-found test id'
      );
      assert.ok(
        notFoundSource.includes('Browse All Projects'),
        'Must have link back to all projects'
      );
    });
  });

  /* -----------------------------------------------------------------------
   * AC-4: Rich Text/Description Rendered Safely (Sanitized)
   * ----------------------------------------------------------------------- */
  describe('AC-4: Rich Text & Description Sanitization (SEC-02, SEC-03)', () => {
    it('strips script tags and executable contents from rich text description', () => {
      const dirty = '<p>Normal text</p><script>alert("XSS")</script><p>More text</p>';
      const clean = sanitizeProjectDescription(dirty);
      assert.strictEqual(clean.includes('<script'), false);
      assert.strictEqual(clean.includes('alert'), false);
      assert.ok(clean.includes('<p>Normal text</p>'));
      assert.ok(clean.includes('<p>More text</p>'));
    });

    it('strips inline event handlers (onclick, onerror, onload)', () => {
      const dirty = '<img src="valid.jpg" onerror="alert(1)" onclick="stealCookies()" />';
      const clean = sanitizeProjectDescription(dirty);
      assert.strictEqual(clean.includes('onerror'), false);
      assert.strictEqual(clean.includes('onclick'), false);
      assert.strictEqual(clean.includes('alert'), false);
    });

    it('disarms javascript: and data: URIs in href and src attributes', () => {
      const dirty =
        '<a href="javascript:alert(1)">Click</a><img src="data:text/html,<script>alert(1)</script>" />';
      const clean = sanitizeProjectDescription(dirty);
      assert.strictEqual(clean.includes('javascript:'), false);
      assert.strictEqual(clean.includes('data:'), false);
    });

    it('strips iframes, objects, forms, and embed tags', () => {
      const dirty =
        '<iframe src="https://evil.com"></iframe><embed src="flash.swf" /><form action="/hack"><input /></form>';
      const clean = sanitizeProjectDescription(dirty);
      assert.strictEqual(clean.includes('<iframe'), false);
      assert.strictEqual(clean.includes('<embed'), false);
      assert.strictEqual(clean.includes('<form'), false);
      assert.strictEqual(clean.includes('<input'), false);
    });

    it('preserves safe formatting tags (p, h3, ul, li, strong, em, blockquote)', () => {
      const safe =
        '<h3>Overview</h3><p>We <strong>served</strong> <em>450</em> patients.</p><ul><li>One</li><li>Two</li></ul><blockquote>Quote</blockquote>';
      const clean = sanitizeProjectDescription(safe);
      assert.strictEqual(clean, safe);
    });

    it('repository query automatically sanitizes description on retrieval', () => {
      const project = getPublishedProjectBySlug('annual-free-cataract-surgery-camp-2026', testDb);
      assert.ok(project);
      assert.strictEqual(project.description.includes('<script'), false);
      assert.strictEqual(project.description.includes('alert'), false);
    });
  });

  /* -----------------------------------------------------------------------
   * AC-5: Responsiveness from 360px to 1920px (NFR-02)
   * ----------------------------------------------------------------------- */
  describe('AC-5: Cross-Device Responsiveness (360px to 1920px)', () => {
    it('page wrapper enforces width constraints and prevents horizontal scrolling', () => {
      const pageSource = fs.readFileSync(
        path.join(process.cwd(), 'src/app/projects/[slug]/page.tsx'),
        'utf8'
      );

      assert.ok(pageSource.includes('w-full'), 'Page must have w-full');
      assert.ok(pageSource.includes('max-w-full'), 'Page must have max-w-full');
      assert.ok(
        pageSource.includes('overflow-x-hidden'),
        'Page must enforce overflow-x-hidden to prevent horizontal scrolling on 360px'
      );
      assert.ok(
        pageSource.includes('min-w-0'),
        'Containers must have min-w-0 for flex/grid child wrapping'
      );
    });

    it('gallery grid starts at 1 column on mobile 360px and scales to 3 cols on desktop', () => {
      const gallerySource = fs.readFileSync(
        path.join(process.cwd(), 'src/components/projects/ProjectGallery.tsx'),
        'utf8'
      );

      assert.ok(
        gallerySource.includes('grid-cols-1'),
        'Gallery must start at 1 column on 360px mobile'
      );
      assert.ok(
        gallerySource.includes('sm:grid-cols-2'),
        'Gallery must scale to 2 columns on tablet'
      );
      assert.ok(
        gallerySource.includes('lg:grid-cols-3'),
        'Gallery must scale to 3 columns on desktop'
      );
    });

    it('impact metrics grid scales responsively across viewport widths', () => {
      const metricsSource = fs.readFileSync(
        path.join(process.cwd(), 'src/components/projects/ProjectImpactMetrics.tsx'),
        'utf8'
      );

      assert.ok(metricsSource.includes('grid-cols-1'), 'Metrics must start at 1 column on mobile');
      assert.ok(metricsSource.includes('sm:grid-cols-2'), 'Metrics must support sm breakpoint');
      assert.ok(metricsSource.includes('lg:grid-cols-3'), 'Metrics must support lg breakpoint');
    });

    it('contains no rigid fixed-pixel widths exceeding 360px', () => {
      const files = [
        'src/app/projects/[slug]/page.tsx',
        'src/components/projects/ProjectGallery.tsx',
        'src/components/projects/ProjectImpactMetrics.tsx',
        'src/app/projects/[slug]/not-found.tsx',
      ];

      for (const relPath of files) {
        const content = fs.readFileSync(path.join(process.cwd(), relPath), 'utf8');
        assert.strictEqual(
          content.includes('w-[400px]'),
          false,
          `${relPath} must not have fixed 400px`
        );
        assert.strictEqual(
          content.includes('w-[500px]'),
          false,
          `${relPath} must not have fixed 500px`
        );
        assert.strictEqual(
          content.includes('w-[800px]'),
          false,
          `${relPath} must not have fixed 800px`
        );
      }
    });
  });

  /* -----------------------------------------------------------------------
   * Lightbox Modal & Accessibility Features
   * ----------------------------------------------------------------------- */
  describe('Lightbox Modal & Accessibility Standards', () => {
    it('ProjectGallery has accessible dialog attributes and keyboard listeners', () => {
      const gallerySource = fs.readFileSync(
        path.join(process.cwd(), 'src/components/projects/ProjectGallery.tsx'),
        'utf8'
      );

      assert.ok(gallerySource.includes('role="dialog"'), 'Lightbox must have role="dialog"');
      assert.ok(
        gallerySource.includes('aria-modal="true"'),
        'Lightbox must have aria-modal="true"'
      );
      assert.ok(
        gallerySource.includes('data-testid="gallery-lightbox"'),
        'Lightbox must have test id'
      );
      assert.ok(gallerySource.includes("e.key === 'Escape'"), 'Lightbox must close on Escape key');
      assert.ok(
        gallerySource.includes("e.key === 'ArrowLeft'"),
        'Lightbox must navigate on ArrowLeft'
      );
      assert.ok(
        gallerySource.includes("e.key === 'ArrowRight'"),
        'Lightbox must navigate on ArrowRight'
      );
      assert.ok(
        gallerySource.includes('aria-label="Close photo preview"'),
        'Close button must have accessible aria-label'
      );
    });
  });

  /* -----------------------------------------------------------------------
   * Database Error Sanitization & Security (SEC-02)
   * ----------------------------------------------------------------------- */
  describe('Database Security & Parameterization (SEC-02)', () => {
    it('slug query uses parameterised statements with zero raw SQL injection vulnerability', () => {
      const injectionAttempt = "annual-free-cataract-surgery-camp-2026' OR '1'='1";
      const result = getPublishedProjectBySlug(injectionAttempt, testDb);
      assert.strictEqual(result, null, 'SQL injection attempt via slug must fail safely');
    });

    it('sanitizes database error and never leaks raw SQL or stack traces', () => {
      const brokenDb = createTestDatabase();
      brokenDb.close();

      let caught = null;
      try {
        getPublishedProjectBySlug('some-slug', brokenDb);
      } catch (err) {
        caught = err;
      }

      assert.ok(caught, 'Must throw on DB failure');
      assert.strictEqual(caught.message, 'Database operation failed');
      const lower = caught.message.toLowerCase();
      assert.strictEqual(lower.includes('select'), false);
      assert.strictEqual(lower.includes('projects'), false);
      assert.strictEqual(lower.includes('sqlite'), false);
    });
  });
});
