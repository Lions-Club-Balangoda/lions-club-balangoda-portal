import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Import domain logic and mock data
import {
  filterProjects,
  getUniqueProjectCategories,
  getUniqueProjectYears,
  SERVICE_PILLAR_LABELS,
  serializeProjectFilterParams,
  parseProjectFilterParams,
} from '../src/lib/projects.ts';
import { SEED_PROJECTS } from '../src/data/mock-projects.ts';

describe('Project Category and Year Filtering with URL Sharing (LBW-35, EPIC-4) Test Suite', () => {
  // AC1: Visitors can filter by category and by year, individually or together
  describe('AC1: Filter by category and year, individually and together', () => {
    it('filters projects by individual category', () => {
      const healthcare = filterProjects(SEED_PROJECTS, { category: 'HEALTHCARE' });
      assert.strictEqual(healthcare.length, 2, 'Should return exactly 2 healthcare projects');
      assert.ok(
        healthcare.every((p) => p.category === 'HEALTHCARE'),
        'All items must have category = HEALTHCARE'
      );

      const environment = filterProjects(SEED_PROJECTS, { category: 'ENVIRONMENT' });
      assert.strictEqual(environment.length, 1);
      assert.strictEqual(environment[0].category, 'ENVIRONMENT');
    });

    it('filters projects by individual event year', () => {
      const projects2026 = filterProjects(SEED_PROJECTS, { year: '2026' });
      assert.strictEqual(projects2026.length, 3, 'Should return 3 published projects from 2026');
      assert.ok(
        projects2026.every((p) => p.eventDate.startsWith('2026')),
        'All projects must be from year 2026'
      );

      const projects2025 = filterProjects(SEED_PROJECTS, { year: '2025' });
      assert.strictEqual(projects2025.length, 2, 'Should return 2 published projects from 2025');
      assert.ok(
        projects2025.every((p) => p.eventDate.startsWith('2025')),
        'All projects must be from year 2025'
      );
    });

    it('filters projects by both category and year simultaneously (AND intersection)', () => {
      const healthcare2026 = filterProjects(SEED_PROJECTS, {
        category: 'HEALTHCARE',
        year: '2026',
      });
      assert.strictEqual(healthcare2026.length, 2);
      assert.ok(
        healthcare2026.every(
          (p) => p.category === 'HEALTHCARE' && p.eventDate.startsWith('2026')
        )
      );

      const healthcare2025 = filterProjects(SEED_PROJECTS, {
        category: 'HEALTHCARE',
        year: '2025',
      });
      assert.strictEqual(
        healthcare2025.length,
        0,
        'Should return 0 when healthcare projects do not match 2025'
      );
    });
  });

  // AC2: Filters combine with keyword search (AND logic) and can be reset
  describe('AC2: Combining category/year filters with keyword search and reset capability', () => {
    it('combines category + year + keyword search using AND logic', () => {
      const match = filterProjects(SEED_PROJECTS, {
        category: 'HEALTHCARE',
        year: '2026',
        query: 'Cataract',
      });
      assert.strictEqual(match.length, 1);
      assert.strictEqual(match[0].slug, 'annual-free-cataract-surgery-vision-camp-2026');

      const mismatchKeyword = filterProjects(SEED_PROJECTS, {
        category: 'HEALTHCARE',
        year: '2026',
        query: 'Reforestation',
      });
      assert.strictEqual(mismatchKeyword.length, 0);
    });

    it('resetting all filter criteria returns all published projects', () => {
      const resetResults = filterProjects(SEED_PROJECTS, {
        category: 'ALL',
        year: 'ALL',
        query: '',
      });
      assert.strictEqual(resetResults.length, 5, 'Reset must return all 5 published projects');
      assert.ok(
        resetResults.every((p) => p.status === 'PUBLISHED'),
        'All returned items must be published'
      );
    });
  });

  // AC3: Filter options come from real published data (no empty categories/years)
  describe('AC3: Filter options derived from real published data', () => {
    it('extracts unique categories strictly from published projects', () => {
      const publishedCategories = getUniqueProjectCategories(SEED_PROJECTS);

      // Verify that every returned category is actually represented by at least one published project
      for (const cat of publishedCategories) {
        const matches = SEED_PROJECTS.filter(
          (p) => p.status === 'PUBLISHED' && p.category === cat
        );
        assert.ok(
          matches.length > 0,
          `Category ${cat} must have at least one published project in data`
        );
      }

      // Verify that categories with 0 published items are NOT in the list
      const nonExistentCategoryProjects = [
        {
          id: 'p-1',
          title: 'Camp',
          slug: 'camp',
          category: 'HEALTHCARE',
          summary: 'Sum',
          description: 'Desc',
          coverImageUrl: null,
          eventDate: '2026-01-01',
          location: 'Balangoda',
          status: 'PUBLISHED',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ];
      const singleCategory = getUniqueProjectCategories(nonExistentCategoryProjects);
      assert.deepStrictEqual(singleCategory, ['HEALTHCARE']);
      assert.strictEqual(singleCategory.includes('ENVIRONMENT'), false);
      assert.strictEqual(singleCategory.includes('EDUCATION'), false);
    });

    it('extracts unique years strictly from published projects', () => {
      const publishedYears = getUniqueProjectYears(SEED_PROJECTS);
      assert.deepStrictEqual(publishedYears, ['2026', '2025']);

      // Verify sorted in descending order
      for (let i = 0; i < publishedYears.length - 1; i++) {
        assert.ok(
          parseInt(publishedYears[i], 10) >= parseInt(publishedYears[i + 1], 10),
          'Years must be in descending order'
        );
      }
    });

    it('provides friendly labels for all known service pillars', () => {
      assert.strictEqual(SERVICE_PILLAR_LABELS.HEALTHCARE, 'Healthcare');
      assert.strictEqual(SERVICE_PILLAR_LABELS.EDUCATION, 'Education');
      assert.strictEqual(SERVICE_PILLAR_LABELS.ENVIRONMENT, 'Environment');
      assert.strictEqual(SERVICE_PILLAR_LABELS.POVERTY_RELIEF, 'Poverty Relief');
    });
  });

  // AC4: Empty results display a useful message
  describe('AC4: Empty state message and reset actions in UI', () => {
    it('ProjectsList UI component contains contextual empty state and reset action buttons', () => {
      const componentPath = path.join(
        process.cwd(),
        'src/components/projects/ProjectsList.tsx'
      );
      const source = fs.readFileSync(componentPath, 'utf8');

      assert.ok(
        source.includes('data-testid="no-search-results"'),
        'Must contain testid for no search/filter results'
      );
      assert.ok(
        source.includes('No community projects matched your filter criteria'),
        'Must display friendly message when category/year filters match nothing'
      );
      assert.ok(
        source.includes('data-testid="reset-filters-btn"'),
        'Must have reset-filters-btn button'
      );
      assert.ok(
        source.includes('data-testid="reset-all-filters-btn"'),
        'Must have reset-all-filters-btn button in filter status bar'
      );
    });
  });

  // AC5: Filter state is reflected in the URL so results can be shared
  describe('AC5: Filter state reflected in URL for shareable links', () => {
    it('serializes category, year, and search query to URL query string', () => {
      const qs = serializeProjectFilterParams({
        category: 'HEALTHCARE',
        year: '2026',
        query: 'eye clinic',
      });
      assert.strictEqual(qs, '?category=HEALTHCARE&year=2026&q=eye+clinic');
    });

    it('omits default ALL and empty values when serializing to URL', () => {
      const qs = serializeProjectFilterParams({
        category: 'ALL',
        year: 'ALL',
        query: '',
      });
      assert.strictEqual(qs, '', 'Default ALL filters should yield clean empty query string');
    });

    it('parses URLSearchParams object correctly into filter criteria', () => {
      const searchParams = new URLSearchParams('category=ENVIRONMENT&year=2025&q=trees');
      const parsed = parseProjectFilterParams(searchParams);

      assert.strictEqual(parsed.category, 'ENVIRONMENT');
      assert.strictEqual(parsed.year, '2025');
      assert.strictEqual(parsed.query, 'trees');
    });

    it('parses plain object search params dictionary correctly', () => {
      const parsed = parseProjectFilterParams({
        category: 'POVERTY_RELIEF',
        year: '2025',
        q: 'food relief',
      });

      assert.strictEqual(parsed.category, 'POVERTY_RELIEF');
      assert.strictEqual(parsed.year, '2025');
      assert.strictEqual(parsed.query, 'food relief');
    });

    it('safely handles invalid or missing URL parameters with fallback defaults', () => {
      const searchParams = new URLSearchParams('category=INVALID_PILLAR&year=abcd&q=<script>alert(1)</script>');
      const parsed = parseProjectFilterParams(searchParams);

      assert.strictEqual(parsed.category, 'ALL', 'Invalid category should fallback to ALL');
      assert.strictEqual(parsed.year, 'ALL', 'Invalid year format should fallback to ALL');
      assert.strictEqual(parsed.query.includes('<script>'), false, 'Search query must be sanitized');
    });

    it('ProjectsList component source imports Next.js navigation hooks for URL sync', () => {
      const componentPath = path.join(
        process.cwd(),
        'src/components/projects/ProjectsList.tsx'
      );
      const source = fs.readFileSync(componentPath, 'utf8');

      assert.ok(source.includes('useSearchParams'), 'Must use useSearchParams hook');
      assert.ok(source.includes('useRouter'), 'Must use useRouter hook');
      assert.ok(source.includes('usePathname'), 'Must use usePathname hook');
      assert.ok(
        source.includes('window.history.replaceState') || source.includes('router.replace'),
        'Must sync state to URL without full page reload'
      );
    });

    it('Projects page wraps ProjectsList in a Suspense boundary for SSR safety', () => {
      const pagePath = path.join(
        process.cwd(),
        'src/app/projects/page.tsx'
      );
      const source = fs.readFileSync(pagePath, 'utf8');

      assert.ok(source.includes('<Suspense'), 'Page must wrap list in Suspense');
      assert.ok(source.includes('ProjectsList'), 'ProjectsList must be child of Suspense');
    });
  });

  // AC6: Layout remains usable at 360px
  describe('AC6: Usable layout at 360px viewport', () => {
    it('ProjectsList component source enforces mobile responsiveness safeguards', () => {
      const componentPath = path.join(
        process.cwd(),
        'src/components/projects/ProjectsList.tsx'
      );
      const source = fs.readFileSync(componentPath, 'utf8');

      assert.ok(source.includes('w-full max-w-full min-w-0'), 'Must constrain width on narrow mobile viewports');
      assert.ok(source.includes('overflow-x-auto'), 'Category tabs must scroll horizontally without breaking page width');
      assert.ok(source.includes('grid-cols-1'), 'Projects grid must use single-column display on mobile');
    });
  });
});
