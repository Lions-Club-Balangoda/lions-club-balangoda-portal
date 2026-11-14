import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from './db.ts';
import { sanitizeNewsQuery, sanitizeNewsContent } from './news.ts';
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
    const db = customDb || getDatabase();

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
    const db = customDb || getDatabase();

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
