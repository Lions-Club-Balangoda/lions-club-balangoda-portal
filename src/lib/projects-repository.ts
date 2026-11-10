import { DatabaseSync } from 'node:sqlite';
import { getDatabase, query } from './db.ts';
import { sanitizeSearchQuery } from './projects.ts';
import type { Project, ContentStatus } from '../types/project.ts';

interface RawProjectRow {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  description: string;
  coverImageUrl: string | null;
  eventDate: string;
  location: string;
  status: ContentStatus;
  publishedAt: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchProjectsCriteria {
  query?: string;
  category?: string;
  year?: string;
}

/**
 * Searches and filters published projects from the database via strictly parameterised SQL.
 * 
 * Acceptance criteria:
 * - Visitors can search published projects by keyword across title and summary.
 * - Search input is sanitised and queries are parameterised.
 * - Search works together with category and year filters.
 * - Only published projects are returned (DRAFT and ARCHIVED items are strictly blocked).
 * - Safe error handling: no raw SQL or stack traces exposed on failure.
 */
export function searchPublishedProjects(
  criteria: SearchProjectsCriteria = {},
  customDb?: DatabaseSync
): Project[] {
  try {
    const db = customDb || getDatabase();

    let sql = `
      SELECT
        project_id AS id,
        title,
        slug,
        category,
        summary,
        description,
        cover_image_url AS coverImageUrl,
        event_date AS eventDate,
        location,
        status,
        published_at AS publishedAt,
        author_id AS authorId,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM projects
      WHERE status = ?
    `;

    // Strictly parameterised query: status is always 'PUBLISHED'
    const params: (string | number | bigint | null | Uint8Array)[] = ['PUBLISHED'];

    // 1. Category Filter (Parameterised)
    if (criteria.category && criteria.category !== 'ALL') {
      sql += ` AND category = ?`;
      params.push(criteria.category);
    }

    // 2. Year Filter (Parameterised)
    if (criteria.year && criteria.year !== 'ALL' && /^\d{4}$/.test(criteria.year)) {
      sql += ` AND event_date LIKE ?`;
      params.push(`${criteria.year}-%`);
    }

    // 3. Keyword Search across Title and Summary (Sanitised & Parameterised)
    if (criteria.query && criteria.query.trim()) {
      const sanitized = sanitizeSearchQuery(criteria.query);
      if (sanitized.length > 0) {
        sql += ` AND (title LIKE ? OR summary LIKE ?)`;
        params.push(`%${sanitized}%`, `%${sanitized}%`);
      }
    }

    sql += ` ORDER BY event_date DESC`;

    const rows = query<RawProjectRow>(sql, params, db);

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      category: row.category as Project['category'],
      summary: row.summary,
      description: row.description,
      coverImageUrl: row.coverImageUrl,
      eventDate: row.eventDate,
      location: row.location,
      status: row.status,
      publishedAt: row.publishedAt,
      authorId: row.authorId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ProjectsRepository] Error executing search query:', message);
    throw new Error('Database operation failed');
  }
}

/**
 * Retrieves published projects with optional filter criteria or custom database instance.
 * Fully backwards-compatible with getPublishedProjects(customDb).
 */
export function getPublishedProjects(
  criteriaOrDb?: SearchProjectsCriteria | DatabaseSync,
  customDb?: DatabaseSync
): Project[] {
  if (criteriaOrDb && typeof (criteriaOrDb as DatabaseSync).prepare === 'function') {
    return searchPublishedProjects({}, criteriaOrDb as DatabaseSync);
  }
  return searchPublishedProjects((criteriaOrDb as SearchProjectsCriteria) || {}, customDb);
}

/**
 * Retrieves a single published project by slug. Rejects DRAFT or ARCHIVED.
 */
export function getPublishedProjectBySlug(slug: string, customDb?: DatabaseSync): Project | null {
  try {
    const db = customDb || getDatabase();
    const sql = `
      SELECT
        project_id AS id,
        title,
        slug,
        category,
        summary,
        description,
        cover_image_url AS coverImageUrl,
        event_date AS eventDate,
        location,
        status,
        published_at AS publishedAt,
        author_id AS authorId,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM projects
      WHERE slug = ? AND status = ?
      LIMIT 1
    `;

    // Strictly parameterised query: [slug, 'PUBLISHED']
    const rows = query<RawProjectRow>(sql, [slug, 'PUBLISHED'], db);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      category: row.category as Project['category'],
      summary: row.summary,
      description: row.description,
      coverImageUrl: row.coverImageUrl,
      eventDate: row.eventDate,
      location: row.location,
      status: row.status,
      publishedAt: row.publishedAt,
      authorId: row.authorId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ProjectsRepository] Error executing query by slug:', message);
    throw new Error('Database operation failed');
  }
}
