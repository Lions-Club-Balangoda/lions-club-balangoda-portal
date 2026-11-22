import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import { getDatabase, query } from './db.ts';
import { sanitizeSearchQuery, sanitizeProjectDescription, sanitizeSlug } from './projects.ts';
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

let defaultProjectsDb: DatabaseSync | null = null;

export function setProjectsDatabase(db: DatabaseSync | null): void {
  defaultProjectsDb = db;
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
    const db = customDb || defaultProjectsDb || getDatabase();

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
    const db = customDb || defaultProjectsDb || getDatabase();
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

export interface CreateProjectInput {
  title: string;
  category: Project['category'];
  summary: string;
  description: string;
  eventDate: string;
  location: string;
  coverImageUrl?: string | null;
  status?: ContentStatus;
  slug?: string;
  photos?: string[];
  impactMetrics?: ProjectImpactMetric[];
}

export interface UpdateProjectInput {
  title?: string;
  category?: Project['category'];
  summary?: string;
  description?: string;
  eventDate?: string;
  location?: string;
  coverImageUrl?: string | null;
  status?: ContentStatus;
  slug?: string;
  photos?: string[];
  impactMetrics?: ProjectImpactMetric[];
}

/**
 * Retrieves a single project by ID regardless of status (for CMS admin).
 */
export function getProjectById(id: string, customDb?: DatabaseSync): Project | null {
  try {
    const db = customDb || defaultProjectsDb || getDatabase();
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
      WHERE p.project_id = ?
      LIMIT 1
    `;

    const rows = query<RawProjectRow>(sql, [id], db);
    if (rows.length === 0) return null;

    const row = rows[0];

    let gallery: ProjectGalleryImage[] = [];
    try {
      const gRows = query<{
        id: string;
        imageUrl: string;
        caption: string | null;
        displayOrder: number;
      }>(
        `SELECT image_id AS id, image_url AS imageUrl, caption, display_order AS displayOrder
         FROM project_gallery WHERE project_id = ? ORDER BY display_order ASC`,
        [row.id],
        db
      );
      gallery = gRows.map((g) => ({
        id: g.id,
        imageUrl: g.imageUrl,
        caption: g.caption,
        displayOrder: g.displayOrder,
      }));
    } catch {
      gallery = [];
    }

    let impactMetrics: ProjectImpactMetric[] = [];
    try {
      const mRows = query<{
        label: string;
        value: string;
        prefix: string | null;
        suffix: string | null;
      }>(
        `SELECT label, metric_value AS value, prefix, suffix
         FROM project_impact_metrics WHERE project_id = ? ORDER BY display_order ASC`,
        [row.id],
        db
      );
      impactMetrics = mRows.map((m) => ({
        label: m.label,
        value: m.value,
        prefix: m.prefix,
        suffix: m.suffix,
      }));
    } catch {
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
  } catch (err) {
    console.error('[ProjectsRepository] Error fetching project by ID:', (err as Error)?.message);
    throw new Error('Database operation failed');
  }
}

/**
 * Retrieves all projects for CMS administration (including DRAFT and ARCHIVED).
 */
export function getAllProjectsForAdmin(
  criteria: { query?: string; category?: string; status?: string } = {},
  customDb?: DatabaseSync
): Project[] {
  try {
    const db = customDb || defaultProjectsDb || getDatabase();
    let sql = `
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
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (criteria.status && criteria.status !== 'ALL') {
      sql += ` AND p.status = ?`;
      params.push(criteria.status);
    }

    if (criteria.category && criteria.category !== 'ALL') {
      sql += ` AND p.category = ?`;
      params.push(criteria.category);
    }

    if (criteria.query && criteria.query.trim()) {
      const sanitized = sanitizeSearchQuery(criteria.query.trim());
      if (sanitized) {
        sql += ` AND (p.title LIKE ? OR p.summary LIKE ?)`;
        params.push(`%${sanitized}%`, `%${sanitized}%`);
      }
    }

    sql += ` ORDER BY p.created_at DESC`;

    const rows = query<RawProjectRow>(sql, params, db);
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      category: r.category as Project['category'],
      summary: r.summary,
      description: r.description,
      coverImageUrl: r.coverImageUrl,
      eventDate: r.eventDate,
      location: r.location,
      status: r.status,
      publishedAt: r.publishedAt,
      authorId: r.authorId,
      authorName: r.authorName || null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  } catch (err) {
    console.error('[ProjectsRepository] Error fetching admin projects:', (err as Error)?.message);
    throw new Error('Database operation failed');
  }
}

/**
 * Creates a new project in the database.
 */
export function createProject(
  input: CreateProjectInput,
  authorId: string,
  customDb?: DatabaseSync
): Project {
  if (!input.title || !input.title.trim()) {
    throw new Error('Validation error: Project title is required.');
  }

  const db = customDb || defaultProjectsDb || getDatabase();
  const projectId = 'proj-' + crypto.randomUUID();

  // Generate and sanitize unique slug
  let baseSlug = input.slug ? sanitizeSlug(input.slug) : sanitizeSlug(input.title);
  if (!baseSlug) {
    baseSlug = `project-${Date.now()}`;
  }

  // Ensure unique slug
  let slug = baseSlug;
  const existing = db.prepare('SELECT project_id FROM projects WHERE slug = ?').get(slug);
  if (existing) {
    slug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;
  }

  const status = input.status || 'DRAFT';
  const publishedAt = status === 'PUBLISHED' ? new Date().toISOString() : null;
  const sanitizedDescription = sanitizeProjectDescription(input.description || '');

  const insertStmt = db.prepare(`
    INSERT INTO projects (
      project_id, title, slug, category, summary, description,
      cover_image_url, event_date, location, status, published_at, author_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStmt.run(
    projectId,
    input.title.trim(),
    slug,
    input.category || 'OTHER',
    input.summary?.trim() || '',
    sanitizedDescription,
    input.coverImageUrl || null,
    input.eventDate || new Date().toISOString().split('T')[0],
    input.location?.trim() || 'Balangoda',
    status,
    publishedAt,
    authorId
  );

  // Insert gallery photos if provided
  if (input.photos && Array.isArray(input.photos)) {
    const photoStmt = db.prepare(`
      INSERT INTO project_gallery (image_id, project_id, image_url, caption, display_order, is_cover)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    input.photos.forEach((photoUrl, idx) => {
      if (photoUrl && typeof photoUrl === 'string') {
        photoStmt.run(
          'gal-' + crypto.randomUUID(),
          projectId,
          photoUrl.trim(),
          null,
          idx,
          idx === 0 ? 1 : 0
        );
      }
    });
  }

  // Insert impact metrics if provided
  if (input.impactMetrics && Array.isArray(input.impactMetrics)) {
    const metricStmt = db.prepare(`
      INSERT INTO project_impact_metrics (metric_id, project_id, label, metric_value, prefix, suffix, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    input.impactMetrics.forEach((m, idx) => {
      metricStmt.run(
        'met-' + crypto.randomUUID(),
        projectId,
        m.label,
        m.value,
        m.prefix || null,
        m.suffix || null,
        idx
      );
    });
  }

  const created = getProjectById(projectId, db);
  if (!created) {
    throw new Error('Failed to retrieve newly created project.');
  }

  return created;
}

/**
 * Updates an existing project in the database.
 */
export function updateProject(
  id: string,
  input: UpdateProjectInput,
  customDb?: DatabaseSync
): Project | null {
  const db = customDb || defaultProjectsDb || getDatabase();
  const existing = getProjectById(id, db);
  if (!existing) {
    return null;
  }

  const updates: string[] = [];
  const params: (string | number | null)[] = [];

  if (input.title !== undefined) {
    updates.push('title = ?');
    params.push(input.title.trim());
  }

  if (input.slug !== undefined) {
    const cleanSlug = sanitizeSlug(input.slug);
    updates.push('slug = ?');
    params.push(cleanSlug);
  }

  if (input.category !== undefined) {
    updates.push('category = ?');
    params.push(input.category);
  }

  if (input.summary !== undefined) {
    updates.push('summary = ?');
    params.push(input.summary.trim());
  }

  if (input.description !== undefined) {
    updates.push('description = ?');
    params.push(sanitizeProjectDescription(input.description));
  }

  if (input.coverImageUrl !== undefined) {
    updates.push('cover_image_url = ?');
    params.push(input.coverImageUrl);
  }

  if (input.eventDate !== undefined) {
    updates.push('event_date = ?');
    params.push(input.eventDate);
  }

  if (input.location !== undefined) {
    updates.push('location = ?');
    params.push(input.location.trim());
  }

  if (input.status !== undefined) {
    updates.push('status = ?');
    params.push(input.status);

    if (input.status === 'PUBLISHED' && !existing.publishedAt) {
      updates.push('published_at = CURRENT_TIMESTAMP');
    }
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');

  if (updates.length > 0) {
    params.push(id);
    const sql = `UPDATE projects SET ${updates.join(', ')} WHERE project_id = ?`;
    db.prepare(sql).run(...params);
  }

  // Update gallery if photos are passed
  if (input.photos !== undefined && Array.isArray(input.photos)) {
    db.prepare('DELETE FROM project_gallery WHERE project_id = ?').run(id);
    const photoStmt = db.prepare(`
      INSERT INTO project_gallery (image_id, project_id, image_url, caption, display_order, is_cover)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    input.photos.forEach((photoUrl, idx) => {
      if (photoUrl && typeof photoUrl === 'string') {
        photoStmt.run(
          'gal-' + crypto.randomUUID(),
          id,
          photoUrl.trim(),
          null,
          idx,
          idx === 0 ? 1 : 0
        );
      }
    });
  }

  // Update metrics if passed
  if (input.impactMetrics !== undefined && Array.isArray(input.impactMetrics)) {
    db.prepare('DELETE FROM project_impact_metrics WHERE project_id = ?').run(id);
    const metricStmt = db.prepare(`
      INSERT INTO project_impact_metrics (metric_id, project_id, label, metric_value, prefix, suffix, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    input.impactMetrics.forEach((m, idx) => {
      metricStmt.run(
        'met-' + crypto.randomUUID(),
        id,
        m.label,
        m.value,
        m.prefix || null,
        m.suffix || null,
        idx
      );
    });
  }

  return getProjectById(id, db);
}

/**
 * Permanently deletes a project and cascading associations (gallery and impact metrics).
 */
export function deleteProject(id: string, customDb?: DatabaseSync): boolean {
  try {
    const db = customDb || defaultProjectsDb || getDatabase();
    db.prepare('DELETE FROM project_gallery WHERE project_id = ?').run(id);
    db.prepare('DELETE FROM project_impact_metrics WHERE project_id = ?').run(id);
    const result = db.prepare('DELETE FROM projects WHERE project_id = ?').run(id);
    return Boolean(result.changes && result.changes > 0);
  } catch (err) {
    console.error('[ProjectsRepository] Error deleting project:', (err as Error)?.message);
    throw new Error('Database operation failed');
  }
}
