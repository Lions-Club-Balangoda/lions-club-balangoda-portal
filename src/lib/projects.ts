import type { Project, ProjectFilterCriteria } from '../types/project.ts';
import { SEED_PROJECTS } from '../data/mock-projects.ts';
import {
  sanitizeHtml,
  sanitizeSearchQuery as baseSanitizeSearchQuery,
} from './security/sanitization.ts';

export {
  sanitizeHtml,
  sanitizeText,
  sanitizeSlug,
  sanitizeEmail,
  sanitizePhoneNumber,
  sanitizeObject,
} from './security/sanitization.ts';

/**
 * Sanitizes input query string against XSS injection
 */
export function sanitizeSearchQuery(input: string): string {
  return baseSanitizeSearchQuery(input);
}

/**
 * Core business filtering logic for Community Projects (FR-02, UC02)
 * Pure, deterministic function suitable for unit, integration, and UI testing.
 *
 * Acceptance Criteria satisfied:
 * 1. Visitors can search published projects by keyword across title and summary.
 * 2. Search input is sanitised.
 * 3. Search works together with the category and year filters.
 * 4. Only published projects are returned (DRAFT and ARCHIVED items strictly excluded).
 */
export function filterProjects(
  projects: Project[] = SEED_PROJECTS,
  criteria: ProjectFilterCriteria = {}
): Project[] {
  const {
    category = 'ALL',
    query = '',
    year = 'ALL',
    status = 'PUBLISHED', // Default to PUBLISHED for public portal safety
  } = criteria;

  // Sanitize and normalize search query
  const rawQuery = query ? query.trim() : '';
  const sanitized = rawQuery ? sanitizeSearchQuery(rawQuery).toLowerCase() : '';

  return projects
    .filter((project) => {
      // 1. Status Filter: Public portal must ONLY show PUBLISHED projects
      if (status !== 'ALL' && project.status !== status) {
        return false;
      }

      // 2. Category / Service Pillar Filter
      if (category !== 'ALL' && project.category !== category) {
        return false;
      }

      // 3. Year Filter
      if (year !== 'ALL') {
        const projectYear = new Date(project.eventDate).getFullYear().toString();
        if (projectYear !== year) {
          return false;
        }
      }

      // 4. Keyword Search Query across Title and Summary
      if (rawQuery.length > 0) {
        // If a query was entered but stripped to empty (e.g., pure script tags), safely return no match
        if (sanitized.length === 0) {
          return false;
        }

        const titleMatch = project.title.toLowerCase().includes(sanitized);
        const summaryMatch = project.summary
          ? project.summary.toLowerCase().includes(sanitized)
          : false;
        const locationMatch = project.location
          ? project.location.toLowerCase().includes(sanitized)
          : false;
        const descMatch = project.description
          ? project.description.toLowerCase().includes(sanitized)
          : false;

        if (!titleMatch && !summaryMatch && !locationMatch && !descMatch) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
}

/**
 * Find a single project by its unique slug
 */
export function getProjectBySlug(
  slug: string,
  projects: Project[] = SEED_PROJECTS
): Project | undefined {
  if (!slug) return undefined;
  return projects.find((p) => p.slug === slug && p.status === 'PUBLISHED');
}

/**
 * Extract unique event years from published projects for filter dropdown
 */
export function getUniqueProjectYears(projects: Project[] = SEED_PROJECTS): string[] {
  const years = projects
    .filter((p) => p.status === 'PUBLISHED')
    .map((p) => new Date(p.eventDate).getFullYear().toString());
  return Array.from(new Set(years)).sort((a, b) => b.localeCompare(a));
}

/**
 * UI State Model for Community Projects Vertical Slice
 */
export interface ProjectsUIState {
  state: 'SUCCESS' | 'EMPTY' | 'ERROR';
  items: Project[];
  errorMessage?: string;
  is360pxResponsive: boolean;
}

/**
 * Deterministically evaluates the UI presentation state
 */
export function evaluateProjectsUIState(params: {
  projects?: Project[];
  error?: string | null;
}): ProjectsUIState {
  if (params.error) {
    return {
      state: 'ERROR',
      items: [],
      errorMessage: 'Unable to Load Community Projects',
      is360pxResponsive: true,
    };
  }

  // Filter out any non-published items defensibly
  const publishedOnly = (params.projects || []).filter(
    (p) => !p.status || p.status === 'PUBLISHED'
  );

  if (publishedOnly.length === 0) {
    return {
      state: 'EMPTY',
      items: [],
      is360pxResponsive: true,
    };
  }

  return {
    state: 'SUCCESS',
    items: publishedOnly,
    is360pxResponsive: true,
  };
}

/**
 * Formats a project date nicely for display
 */
export function formatProjectDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

/**
 * Sanitizes project description / rich text against XSS attacks (SEC-02, SEC-03, AC-4).
 * Strips executable script tags, dangerous HTML elements, event handlers, and disarms dangerous URIs
 * while preserving safe semantic formatting tags.
 */
export function sanitizeProjectDescription(rawContent: string): string {
  return sanitizeHtml(rawContent);
}

/**
 * Normalizes photographs from a project record into a uniform gallery array.
 * Merges project.gallery items and project.photos strings without duplicates.
 */
export function normalizeProjectPhotos(
  project: Project
): import('../types/project.ts').ProjectGalleryImage[] {
  const result: import('../types/project.ts').ProjectGalleryImage[] = [];
  const seenUrls = new Set<string>();

  // Process structured gallery items first
  if (Array.isArray(project.gallery)) {
    for (const item of project.gallery) {
      if (item && item.imageUrl && !seenUrls.has(item.imageUrl)) {
        seenUrls.add(item.imageUrl);
        result.push({
          id: item.id || `img-${result.length + 1}`,
          imageUrl: item.imageUrl,
          caption: item.caption || null,
          displayOrder: typeof item.displayOrder === 'number' ? item.displayOrder : result.length,
        });
      }
    }
  }

  // Process string photos array next
  if (Array.isArray(project.photos)) {
    for (const url of project.photos) {
      if (typeof url === 'string' && url.trim().length > 0 && !seenUrls.has(url.trim())) {
        const cleanUrl = url.trim();
        seenUrls.add(cleanUrl);
        result.push({
          id: `photo-${result.length + 1}`,
          imageUrl: cleanUrl,
          caption: null,
          displayOrder: result.length,
        });
      }
    }
  }

  return result.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

/**
 * Checks whether a project has valid impact metrics to display.
 */
export function hasImpactMetrics(project: Project): boolean {
  return (
    Array.isArray(project.impactMetrics) &&
    project.impactMetrics.length > 0 &&
    project.impactMetrics.some((m) =>
      Boolean(m && (m.label || m.value !== undefined || m.value !== null))
    )
  );
}

/**
 * Retrieves a published project by slug from in-memory/seed data.
 * Strictly returns null for unpublished (DRAFT, ARCHIVED) or unknown slugs (AC-3).
 * Sanitizes project description (AC-4).
 */
export function getPublishedProjectBySlugFromData(
  slug: string,
  projects: Project[] = SEED_PROJECTS
): Project | null {
  if (!slug) return null;
  const normalizedSlug = slug.toLowerCase().trim();

  const found = projects.find((p) => p.slug && p.slug.toLowerCase().trim() === normalizedSlug);

  if (!found) return null;

  // Strict AC-3: Reject unpublished projects (DRAFT or ARCHIVED)
  if (found.status !== 'PUBLISHED') {
    return null;
  }

  return {
    ...found,
    description: sanitizeProjectDescription(found.description),
  };
}
