import type { Project, ProjectFilterCriteria } from '../types/project.ts';
import { SEED_PROJECTS } from '../data/mock-projects.ts';

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
 * Core business filtering logic for Community Projects Vertical Slice (FR-02, UC02)
 * Pure, deterministic function suitable for unit, integration, and UI testing.
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

  const sanitizedQuery = query ? query.trim().toLowerCase() : '';

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

      // 4. Keyword Search Query (Title, Summary, Location, Description)
      if (sanitizedQuery.length > 0) {
        const titleMatch = project.title.toLowerCase().includes(sanitizedQuery);
        const summaryMatch = project.summary.toLowerCase().includes(sanitizedQuery);
        const locationMatch = project.location.toLowerCase().includes(sanitizedQuery);
        const descMatch = project.description.toLowerCase().includes(sanitizedQuery);

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
