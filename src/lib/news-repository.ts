import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import { getDatabase } from './db.ts';
import { sanitizeNewsQuery, sanitizeNewsContent } from './news.ts';
import { sanitizeSlug } from './projects.ts';
import type { NewsItem, NewsType, ContentStatus } from '../types/news.ts';
import { SEED_NEWS } from '../data/mock-news.ts';

interface RawNewsRow {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  newsType: NewsType;
  isPinned: number;
  expireDate: string | null;
  status: ContentStatus;
  publishedAt: string | null;
  authorId: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchNewsCriteria {
  query?: string;
  newsType?: string;
}

/**
 * Maps raw database row to clean NewsItem entity
 */
function mapRowToNewsItem(row: RawNewsRow): NewsItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary || '',
    content: sanitizeNewsContent(row.content || ''),
    coverImageUrl: row.coverImageUrl,
    newsType: row.newsType,
    isPinned: Boolean(row.isPinned),
    status: row.status,
    publishedAt: row.publishedAt || row.createdAt,
    expireDate: row.expireDate,
    authorName: row.authorName || 'Lions Club Secretariat',
    authorId: row.authorId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

let defaultNewsDb: DatabaseSync | null = null;

export function setNewsDatabase(db: DatabaseSync | null): void {
  defaultNewsDb = db;
}

/**
 * Retrieves published news and announcements from the database.
 * Strictly enforces that only PUBLISHED items are returned.
 * Sorts by is_pinned DESC, published_at DESC (newest first).
 */
export function getPublishedNewsFromDb(
  criteria: SearchNewsCriteria = {},
  customDb?: DatabaseSync
): NewsItem[] {
  try {
    const db = customDb || defaultNewsDb || getDatabase();

    let sql = `
      SELECT
        n.news_id AS id,
        n.title,
        n.slug,
        n.summary,
        n.content,
        n.cover_image_url AS coverImageUrl,
        n.news_type AS newsType,
        n.is_pinned AS isPinned,
        n.expire_date AS expireDate,
        n.status,
        n.published_at AS publishedAt,
        n.author_id AS authorId,
        u.full_name AS authorName,
        n.created_at AS createdAt,
        n.updated_at AS updatedAt
      FROM news_announcements n
      LEFT JOIN users u ON n.author_id = u.user_id
      WHERE n.status = 'PUBLISHED'
    `;

    const params: (string | number)[] = [];

    if (criteria.newsType && criteria.newsType !== 'ALL') {
      sql += ' AND n.news_type = ?';
      params.push(criteria.newsType);
    }

    if (criteria.query && criteria.query.trim()) {
      const sanitized = sanitizeNewsQuery(criteria.query.trim()).toLowerCase();
      sql += ' AND (LOWER(n.title) LIKE ? OR LOWER(n.summary) LIKE ?)';
      params.push(`%${sanitized}%`, `%${sanitized}%`);
    }

    // Newest first with pinned announcements prioritized
    sql += ' ORDER BY n.is_pinned DESC, n.published_at DESC';

    const stmt = db.prepare(sql);
    const rows = stmt.all(...params) as unknown as RawNewsRow[];

    if (!rows || rows.length === 0) {
      // Fallback to static seed data if db table has no rows
      return SEED_NEWS.filter((item) => item.status === 'PUBLISHED');
    }

    return rows.map(mapRowToNewsItem);
  } catch (err) {
    // Defensive security: never leak raw SQL or stack trace
    console.error(
      '[NewsRepository] Error querying news: sanitized fallback used',
      (err as Error)?.message
    );
    return SEED_NEWS.filter((item) => item.status === 'PUBLISHED');
  }
}

/**
 * Retrieves a single published news item by slug from the database.
 * Strictly guarantees that DRAFT or ARCHIVED items return null.
 */
export function getPublishedNewsBySlugFromDb(
  slug: string,
  customDb?: DatabaseSync
): NewsItem | null {
  if (!slug) return null;

  try {
    const db = customDb || defaultNewsDb || getDatabase();

    const sql = `
      SELECT
        n.news_id AS id,
        n.title,
        n.slug,
        n.summary,
        n.content,
        n.cover_image_url AS coverImageUrl,
        n.news_type AS newsType,
        n.is_pinned AS isPinned,
        n.expire_date AS expireDate,
        n.status,
        n.published_at AS publishedAt,
        n.author_id AS authorId,
        u.full_name AS authorName,
        n.created_at AS createdAt,
        n.updated_at AS updatedAt
      FROM news_announcements n
      LEFT JOIN users u ON n.author_id = u.user_id
      WHERE n.slug = ? AND n.status = 'PUBLISHED'
      LIMIT 1
    `;

    const stmt = db.prepare(sql);
    const row = stmt.get(slug) as unknown as RawNewsRow | undefined;

    if (!row) {
      // Fallback to seed data lookup
      const fallback = SEED_NEWS.find(
        (item) => item.slug.toLowerCase() === slug.toLowerCase() && item.status === 'PUBLISHED'
      );
      return fallback || null;
    }

    return mapRowToNewsItem(row);
  } catch (err) {
    console.error(
      '[NewsRepository] Error querying news by slug: sanitized fallback used',
      (err as Error)?.message
    );
    const fallback = SEED_NEWS.find(
      (item) => item.slug.toLowerCase() === slug.toLowerCase() && item.status === 'PUBLISHED'
    );
    return fallback || null;
  }
}

export interface CreateNewsInput {
  title: string;
  summary?: string;
  content: string;
  coverImageUrl?: string | null;
  newsType?: NewsType;
  isPinned?: boolean;
  expireDate?: string | null;
  status?: ContentStatus;
  slug?: string;
}

export interface UpdateNewsInput {
  title?: string;
  summary?: string;
  content?: string;
  coverImageUrl?: string | null;
  newsType?: NewsType;
  isPinned?: boolean;
  expireDate?: string | null;
  status?: ContentStatus;
  slug?: string;
}

/**
 * Retrieves a single news announcement by ID regardless of status (for CMS admin).
 */
export function getNewsById(id: string, customDb?: DatabaseSync): NewsItem | null {
  try {
    const db = customDb || defaultNewsDb || getDatabase();
    const sql = `
      SELECT
        n.news_id AS id,
        n.title,
        n.slug,
        n.summary,
        n.content,
        n.cover_image_url AS coverImageUrl,
        n.news_type AS newsType,
        n.is_pinned AS isPinned,
        n.expire_date AS expireDate,
        n.status,
        n.published_at AS publishedAt,
        n.author_id AS authorId,
        u.full_name AS authorName,
        n.created_at AS createdAt,
        n.updated_at AS updatedAt
      FROM news_announcements n
      LEFT JOIN users u ON n.author_id = u.user_id
      WHERE n.news_id = ?
      LIMIT 1
    `;

    const stmt = db.prepare(sql);
    const row = stmt.get(id) as unknown as RawNewsRow | undefined;
    if (!row) return null;

    return mapRowToNewsItem(row);
  } catch (err) {
    console.error('[NewsRepository] Error fetching news by ID:', (err as Error)?.message);
    throw new Error('Database operation failed');
  }
}

/**
 * Retrieves all news articles for CMS administration (including DRAFT and ARCHIVED).
 */
export function getAllNewsForAdmin(
  criteria: { query?: string; newsType?: string; status?: string } = {},
  customDb?: DatabaseSync
): NewsItem[] {
  try {
    const db = customDb || defaultNewsDb || getDatabase();
    let sql = `
      SELECT
        n.news_id AS id,
        n.title,
        n.slug,
        n.summary,
        n.content,
        n.cover_image_url AS coverImageUrl,
        n.news_type AS newsType,
        n.is_pinned AS isPinned,
        n.expire_date AS expireDate,
        n.status,
        n.published_at AS publishedAt,
        n.author_id AS authorId,
        u.full_name AS authorName,
        n.created_at AS createdAt,
        n.updated_at AS updatedAt
      FROM news_announcements n
      LEFT JOIN users u ON n.author_id = u.user_id
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (criteria.status && criteria.status !== 'ALL') {
      sql += ' AND n.status = ?';
      params.push(criteria.status);
    }

    if (criteria.newsType && criteria.newsType !== 'ALL') {
      sql += ' AND n.news_type = ?';
      params.push(criteria.newsType);
    }

    if (criteria.query && criteria.query.trim()) {
      const sanitized = sanitizeNewsQuery(criteria.query.trim()).toLowerCase();
      sql += ' AND (LOWER(n.title) LIKE ? OR LOWER(n.summary) LIKE ?)';
      params.push(`%${sanitized}%`, `%${sanitized}%`);
    }

    sql += ' ORDER BY n.is_pinned DESC, n.created_at DESC';

    const stmt = db.prepare(sql);
    const rows = stmt.all(...params) as unknown as RawNewsRow[];
    return rows.map(mapRowToNewsItem);
  } catch (err) {
    console.error('[NewsRepository] Error fetching admin news:', (err as Error)?.message);
    throw new Error('Database operation failed');
  }
}

/**
 * Creates a new news article or announcement in the database.
 */
export function createNews(
  input: CreateNewsInput,
  authorId: string,
  customDb?: DatabaseSync
): NewsItem {
  if (!input.title || !input.title.trim()) {
    throw new Error('Validation error: Article title is required.');
  }

  const db = customDb || defaultNewsDb || getDatabase();
  const newsId = 'news-' + crypto.randomUUID();

  let baseSlug = input.slug ? sanitizeSlug(input.slug) : sanitizeSlug(input.title);
  if (!baseSlug) {
    baseSlug = `news-${Date.now()}`;
  }

  // Ensure unique slug
  let slug = baseSlug;
  const existing = db.prepare('SELECT news_id FROM news_announcements WHERE slug = ?').get(slug);
  if (existing) {
    slug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;
  }

  const status = input.status || 'DRAFT';
  const publishedAt = status === 'PUBLISHED' ? new Date().toISOString() : null;
  const sanitizedContent = sanitizeNewsContent(input.content || '');

  const stmt = db.prepare(`
    INSERT INTO news_announcements (
      news_id, title, slug, summary, content, cover_image_url,
      news_type, is_pinned, expire_date, status, published_at, author_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    newsId,
    input.title.trim(),
    slug,
    input.summary?.trim() || '',
    sanitizedContent,
    input.coverImageUrl || null,
    input.newsType || 'NEWS',
    input.isPinned ? 1 : 0,
    input.expireDate || null,
    status,
    publishedAt,
    authorId
  );

  const created = getNewsById(newsId, db);
  if (!created) {
    throw new Error('Failed to retrieve newly created news article.');
  }

  return created;
}

/**
 * Updates an existing news announcement in the database.
 */
export function updateNews(
  id: string,
  input: UpdateNewsInput,
  customDb?: DatabaseSync
): NewsItem | null {
  const db = customDb || defaultNewsDb || getDatabase();
  const existing = getNewsById(id, db);
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

  if (input.summary !== undefined) {
    updates.push('summary = ?');
    params.push(input.summary.trim());
  }

  if (input.content !== undefined) {
    updates.push('content = ?');
    params.push(sanitizeNewsContent(input.content));
  }

  if (input.coverImageUrl !== undefined) {
    updates.push('cover_image_url = ?');
    params.push(input.coverImageUrl);
  }

  if (input.newsType !== undefined) {
    updates.push('news_type = ?');
    params.push(input.newsType);
  }

  if (input.isPinned !== undefined) {
    updates.push('is_pinned = ?');
    params.push(input.isPinned ? 1 : 0);
  }

  if (input.expireDate !== undefined) {
    updates.push('expire_date = ?');
    params.push(input.expireDate);
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
    const sql = `UPDATE news_announcements SET ${updates.join(', ')} WHERE news_id = ?`;
    db.prepare(sql).run(...params);
  }

  return getNewsById(id, db);
}

/**
 * Permanently deletes a news article from the database.
 */
export function deleteNews(id: string, customDb?: DatabaseSync): boolean {
  try {
    const db = customDb || defaultNewsDb || getDatabase();
    const result = db.prepare('DELETE FROM news_announcements WHERE news_id = ?').run(id);
    return Boolean(result.changes && result.changes > 0);
  } catch (err) {
    console.error('[NewsRepository] Error deleting news article:', (err as Error)?.message);
    throw new Error('Database operation failed');
  }
}
