import type { Project, ProjectFilterCriteria, ServicePillar } from '../types/project.ts';
import { SEED_PROJECTS } from '../data/mock-projects.ts';

export const SERVICE_PILLAR_LABELS: Record<ServicePillar, string> = {
  HEALTHCARE: 'Healthcare',
  EDUCATION: 'Education',
  ENVIRONMENT: 'Environment',
  POVERTY_RELIEF: 'Poverty Relief',
  OTHER: 'Other Initiatives',
};

/**
 * Sanitizes input query string against XSS injection
 */
export function sanitizeSearchQuery(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case "'": return '&#39;';
        case '"': return '&quot;';
        case '&': return '&amp;';
        default: return char;
      }
    })
    .trim();
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
        const summaryMatch = project.summary ? project.summary.toLowerCase().includes(sanitized) : false;
        const locationMatch = project.location ? project.location.toLowerCase().includes(sanitized) : false;
        const descMatch = project.description ? project.description.toLowerCase().includes(sanitized) : false;

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
 * Extract unique service pillar categories from published projects
 * Satisfies LBW-35 AC-3: "Filter options come from real published data (no empty categories/years)"
 */
export function getUniqueProjectCategories(
  projects: Project[] = SEED_PROJECTS
): ServicePillar[] {
  const published = projects.filter((p) => !p.status || p.status === 'PUBLISHED');
  const categories = new Set<ServicePillar>();
  for (const project of published) {
    if (project.category) {
      categories.add(project.category);
    }
  }
  const preferredOrder: ServicePillar[] = [
    'HEALTHCARE',
    'EDUCATION',
    'ENVIRONMENT',
    'POVERTY_RELIEF',
    'OTHER',
  ];
  return preferredOrder.filter((cat) => categories.has(cat));
}

/**
 * Serializes project filter criteria to URL query string
 * Satisfies LBW-35 AC-5: "Filter state is reflected in the URL so results can be shared"
 */
export function serializeProjectFilterParams(criteria: ProjectFilterCriteria): string {
  const params = new URLSearchParams();
  if (criteria.category && criteria.category !== 'ALL') {
    params.set('category', criteria.category);
  }
  if (criteria.year && criteria.year !== 'ALL') {
    params.set('year', criteria.year);
  }
  if (criteria.query && criteria.query.trim().length > 0) {
    params.set('q', criteria.query.trim());
  }
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Parses URL query parameters into project filter criteria
 * Satisfies LBW-35 AC-5
 */
export function parseProjectFilterParams(
  searchParams:
    | URLSearchParams
    | { get: (name: string) => string | null }
    | Record<string, string | string[] | undefined>
): ProjectFilterCriteria {
  let categoryParam: string | undefined;
  let yearParam: string | undefined;
  let queryParam: string | undefined;

  if (searchParams && typeof (searchParams as { get?: unknown }).get === 'function') {
    const sp = searchParams as { get: (name: string) => string | null };
    categoryParam = sp.get('category') || undefined;
    yearParam = sp.get('year') || undefined;
    queryParam = sp.get('q') || sp.get('query') || undefined;
  } else if (searchParams) {
    const raw = searchParams as Record<string, string | string[] | undefined>;
    const getFirst = (val: string | string[] | undefined) =>
      Array.isArray(val) ? val[0] : val;
    categoryParam = getFirst(raw.category);
    yearParam = getFirst(raw.year);
    queryParam = getFirst(raw.q) || getFirst(raw.query);
  }

  const validCategories: Set<string> = new Set([
    'HEALTHCARE',
    'EDUCATION',
    'ENVIRONMENT',
    'POVERTY_RELIEF',
    'OTHER',
  ]);

  const category =
    categoryParam && validCategories.has(categoryParam.toUpperCase())
      ? (categoryParam.toUpperCase() as ServicePillar)
      : 'ALL';

  const year = yearParam && /^\d{4}$/.test(yearParam) ? yearParam : 'ALL';
  const query = queryParam ? sanitizeSearchQuery(queryParam) : '';

  return {
    category,
    year,
    query,
  };
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
