import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Import domain logic and UI state evaluation
import {
  evaluateProjectsUIState,
  filterProjects,
  formatProjectDate,
  sanitizeSearchQuery,
} from '../src/lib/projects.ts';
import { SEED_PROJECTS } from '../src/data/mock-projects.ts';

describe('Community Projects UI Presentation & States (LBW-10)', () => {
  it('AC1: Given published projects exist, maps and verifies title, category, date, and cover image', () => {
    const uiState = evaluateProjectsUIState({ projects: SEED_PROJECTS });

    assert.strictEqual(uiState.state, 'SUCCESS');
    assert.ok(uiState.items.length > 0, 'Must have published items');

    // Verify all required fields for each project card
    for (const project of uiState.items) {
      assert.ok(project.title, 'Project card must display title');
      assert.ok(project.category, 'Project card must display category');
      assert.ok(project.eventDate, 'Project card must have event date');
      assert.ok(project.coverImageUrl, 'Project card must have cover image URL');

      // Date formatting verification
      const formatted = formatProjectDate(project.eventDate);
      assert.ok(formatted.length > 0, 'Formatted date must not be empty');
      assert.strictEqual(
        project.status,
        'PUBLISHED',
        'Only PUBLISHED projects allowed in UI state'
      );
    }
  });

  it('AC2: Defensive UI state strictly excludes DRAFT and ARCHIVED items', () => {
    const mixed = [
      ...SEED_PROJECTS,
      {
        id: 'draft-999',
        title: '[DEV-TEST] Internal Board Draft',
        slug: 'internal-draft',
        category: 'HEALTHCARE',
        summary: 'Draft summary',
        description: 'Draft',
        coverImageUrl: 'https://example.com/draft.jpg',
        eventDate: '2026-06-01',
        location: 'Balangoda',
        status: 'DRAFT',
        createdAt: '2026-06-01',
        updatedAt: '2026-06-01',
      },
      {
        id: 'archived-888',
        title: '[DEV-TEST] Old Archive Item',
        slug: 'old-archive',
        category: 'POVERTY_RELIEF',
        summary: 'Archive summary',
        description: 'Archive',
        coverImageUrl: 'https://example.com/archived.jpg',
        eventDate: '2021-01-01',
        location: 'Balangoda',
        status: 'ARCHIVED',
        createdAt: '2021-01-01',
        updatedAt: '2021-01-01',
      },
    ];

    const uiState = evaluateProjectsUIState({ projects: mixed });
    assert.strictEqual(uiState.state, 'SUCCESS');

    const hasDraft = uiState.items.some((p) => p.status === 'DRAFT' || p.id === 'draft-999');
    assert.strictEqual(hasDraft, false, 'Draft project must be excluded from UI presentation');

    const hasArchived = uiState.items.some(
      (p) => p.status === 'ARCHIVED' || p.id === 'archived-888'
    );
    assert.strictEqual(
      hasArchived,
      false,
      'Archived project must be excluded from UI presentation'
    );
  });

  it('AC3: Given no projects exist, then a clear empty-state message is triggered', () => {
    const emptyState = evaluateProjectsUIState({ projects: [] });

    assert.strictEqual(emptyState.state, 'EMPTY', 'UI state must transition to EMPTY');
    assert.strictEqual(emptyState.items.length, 0);

    // Verify empty state text in UI component source
    const componentSource = fs.readFileSync(
      path.join(process.cwd(), 'src/components/projects/ProjectsList.tsx'),
      'utf8'
    );
    assert.ok(
      componentSource.includes('No Community Projects Published Yet'),
      'ProjectsList component must contain empty state header'
    );
    assert.ok(
      componentSource.includes('data-testid="projects-empty-state"'),
      'ProjectsList component must have projects-empty-state test ID'
    );
  });

  it('AC4: Given the API fails, friendly error message shown and no stack trace or SQL is exposed', () => {
    const errorState = evaluateProjectsUIState({
      projects: [],
      error: 'Database connection failed',
    });

    assert.strictEqual(errorState.state, 'ERROR');
    assert.strictEqual(errorState.errorMessage, 'Unable to Load Community Projects');
    assert.strictEqual(errorState.items.length, 0);

    // Verify error state in UI component source
    const componentSource = fs.readFileSync(
      path.join(process.cwd(), 'src/components/projects/ProjectsList.tsx'),
      'utf8'
    );
    assert.ok(
      componentSource.includes('Unable to Load Community Projects'),
      'ProjectsList component must display friendly error header'
    );
    assert.ok(
      componentSource.includes('data-testid="projects-error-state"'),
      'ProjectsList component must have projects-error-state test ID'
    );

    // Ensure component source does not expose stack trace or raw SQL in error template
    assert.strictEqual(
      componentSource.includes('error.stack'),
      false,
      'UI component must not expose error.stack'
    );
    assert.strictEqual(
      componentSource.includes('SELECT'),
      false,
      'UI component must not expose SQL keywords'
    );
  });

  it('AC5: Mobile responsiveness safety at 360px width without horizontal scroll', () => {
    const cardSource = fs.readFileSync(
      path.join(process.cwd(), 'src/components/projects/ProjectCard.tsx'),
      'utf8'
    );
    const listSource = fs.readFileSync(
      path.join(process.cwd(), 'src/components/projects/ProjectsList.tsx'),
      'utf8'
    );
    const pageSource = fs.readFileSync(
      path.join(process.cwd(), 'src/app/projects/page.tsx'),
      'utf8'
    );

    // 1. ProjectCard must use responsive width constraints
    assert.ok(cardSource.includes('w-full'), 'Card must have w-full');
    assert.ok(cardSource.includes('max-w-full'), 'Card must have max-w-full');
    assert.ok(cardSource.includes('min-w-0'), 'Card must have min-w-0 to prevent flex overflow');
    assert.ok(cardSource.includes('overflow-hidden'), 'Card must hide overflow');

    // 2. ProjectsList grid must start at 1 column on mobile (grid-cols-1)
    assert.ok(
      listSource.includes('grid-cols-1'),
      'Grid must be 1 column on mobile screens (360px)'
    );

    // 3. Page layout must enforce horizontal overflow containment
    assert.ok(
      pageSource.includes('overflow-x-hidden') || pageSource.includes('max-w-full'),
      'Page wrapper must prevent horizontal scroll'
    );

    // 4. Verify no fixed widths wider than 360px
    assert.strictEqual(cardSource.includes('w-[400px]'), false);
    assert.strictEqual(cardSource.includes('w-[500px]'), false);
    assert.strictEqual(listSource.includes('w-[600px]'), false);
  });

  it('Filtering & Search: Category and keyword query filtering work accurately', () => {
    // Filter by HEALTHCARE
    const healthcare = filterProjects(SEED_PROJECTS, { category: 'HEALTHCARE' });
    assert.ok(healthcare.length > 0);
    assert.ok(healthcare.every((p) => p.category === 'HEALTHCARE'));

    // Search by title keyword "Vision"
    const visionResults = filterProjects(SEED_PROJECTS, { query: 'Vision' });
    assert.ok(visionResults.length > 0);
    assert.ok(visionResults[0].title.includes('Vision'));

    // XSS Sanitization test
    const clean = sanitizeSearchQuery("<script>alert('xss')</script>Hello");
    assert.strictEqual(clean, 'Hello');
  });
});
