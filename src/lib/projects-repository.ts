import { DatabaseSync } from 'node:sqlite';
import { getDatabase, query } from './db.ts';
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

/**
 * Retrieves all published projects from the database via a strictly parameterised query.
 * Acceptance criteria:
 * - Given published projects exist, each project's title, category, date, and cover image are listed.
 * - Given a project is unpublished or draft, then it never appears in the public list or API response.
 * - Data comes from the database through a parameterised query.
 * - When database fails, throws a sanitized error without exposing raw SQL or stack traces.
 */
export function getPublishedProjects(customDb?: DatabaseSync): Project[] {
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
      WHERE status = ?
      ORDER BY event_date DESC
    `;

    // Strictly parameterised query: status must match 'PUBLISHED'
    const rows = query<RawProjectRow>(sql, ['PUBLISHED'], db);

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
    // Log error internally on server without exposing details
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ProjectsRepository] Error executing query:', message);
    
    // Throw clean, sanitized error with no SQL query or stack trace
    throw new Error('Database operation failed');
  }
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
