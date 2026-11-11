import { DatabaseSync } from 'node:sqlite';
import { getDatabase, query } from './db.ts';
import { sanitizeSearchQuery, sanitizeProjectDescription } from './projects.ts';
import type {
  Project,
  ContentStatus,
  ProjectImpactMetric,
  ProjectGalleryImage,
} from '../types/project.ts';

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
  authorName?: string | null;
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
 * Attaches associated gallery images and impact metrics where present.
 */
export function getPublishedProjectBySlug(slug: string, customDb?: DatabaseSync): Project | null {
  try {
    const db = customDb || getDatabase();
    const sql = `
      SELECT
        p.project_id AS id,
        p.title,
        p.slug,
        p.category,
        p.summary,
        p.description,
        p.cover_image_url AS coverImageUrl,
        p.event_date AS eventDate,
        p.location,
        p.status,
        p.published_at AS publishedAt,
        p.author_id AS authorId,
        u.full_name AS authorName,
        p.created_at AS createdAt,
        p.updated_at AS updatedAt
      FROM projects p
      LEFT JOIN users u ON p.author_id = u.user_id
      WHERE p.slug = ? AND p.status = ?
      LIMIT 1
    `;

    // Strictly parameterised query: [slug, 'PUBLISHED']
    const rows = query<RawProjectRow>(sql, [slug, 'PUBLISHED'], db);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];

    // Query gallery photos if table exists
    let gallery: ProjectGalleryImage[] = [];
    try {
      const galleryRows = query<{
        id: string;
        imageUrl: string;
        caption: string | null;
        displayOrder: number;
      }>(
        `SELECT image_id AS id, image_url AS imageUrl, caption, display_order AS displayOrder
         FROM project_gallery
         WHERE project_id = ?
         ORDER BY display_order ASC`,
        [row.id],
        db
      );
      gallery = galleryRows.map((g) => ({
        id: g.id,
        imageUrl: g.imageUrl,
        caption: g.caption,
        displayOrder: g.displayOrder,
      }));
    } catch {
      // Table might not exist in simplified test fixtures
      gallery = [];
    }

    // Query impact metrics if table exists
    let impactMetrics: ProjectImpactMetric[] = [];
    try {
      const metricRows = query<{
        label: string;
        value: string;
        prefix: string | null;
        suffix: string | null;
      }>(
        `SELECT label, metric_value AS value, prefix, suffix
         FROM project_impact_metrics
         WHERE project_id = ?
         ORDER BY display_order ASC`,
        [row.id],
        db
      );
      impactMetrics = metricRows.map((m) => ({
        label: m.label,
        value: m.value,
        prefix: m.prefix,
        suffix: m.suffix,
      }));
    } catch {
      // Table might not exist in simplified test fixtures
      impactMetrics = [];
    }

    const photos = gallery.map((g) => g.imageUrl);

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      category: row.category as Project['category'],
      summary: row.summary,
      description: sanitizeProjectDescription(row.description),
      coverImageUrl: row.coverImageUrl,
      eventDate: row.eventDate,
      location: row.location,
      status: row.status,
      publishedAt: row.publishedAt,
      authorId: row.authorId,
      authorName: row.authorName || null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      impactMetrics: impactMetrics.length > 0 ? impactMetrics : undefined,
      gallery: gallery.length > 0 ? gallery : undefined,
      photos: photos.length > 0 ? photos : undefined,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ProjectsRepository] Error executing query by slug:', message);
    throw new Error('Database operation failed');
  }
}
