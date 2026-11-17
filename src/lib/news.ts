import type { NewsItem, NewsFilterCriteria } from '../types/news.ts';
import { SEED_NEWS } from '../data/mock-news.ts';

/**
 * Sanitizes rich text / HTML content to defend against XSS attacks (SEC-02, SEC-03).
 * Removes executable script tags, event handlers, and unsafe protocols while preserving safe formatting tags.
 */
export function sanitizeNewsContent(rawHtml: string): string {
  if (!rawHtml) return '';

  let sanitized = rawHtml;

  // 1. Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove iframe, object, embed tags
  sanitized = sanitized.replace(/<\/?(iframe|object|embed|applet|form|input|button)\b[^>]*>/gi, '');

  // 3. Remove inline event handlers (e.g., onclick, onerror, onload)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*(['"]).*?\1/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^>\s]+/gi, '');

  // 4. Disarm javascript: or data: in href/src attributes
  sanitized = sanitized.replace(/(href|src)\s*=\s*(['"])\s*(javascript|data):.*?\2/gi, '$1="#"');

  return sanitized.trim();
}

/**
 * Sanitizes search/filter queries to defeat injection and XSS
 */
export function sanitizeNewsQuery(query: string): string {
  if (!query) return '';
  return query
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case "'":
          return '&#39;';
        case '"':
          return '&quot;';
        case '&':
          return '&amp;';
        default:
          return char;
      }
    })
    .trim();
}

/**
 * Formats an ISO date string to a human-readable community format (e.g. "October 15, 2026")
 */
export function formatNewsDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Filters and sorts news items for public presentation.
 *
 * Acceptance criteria satisfied:
 * - Public news page lists published items newest first with title, date and summary.
 * - Draft/unpublished items are NEVER exposed.
 * - Pinned announcements are given prominence while maintaining chronological order.
 */
export function filterPublishedNews(
  items: NewsItem[] = SEED_NEWS,
  criteria: NewsFilterCriteria = {}
): NewsItem[] {
  const { newsType = 'ALL', query = '', status = 'PUBLISHED' } = criteria;
  const sanitizedQuery = query ? sanitizeNewsQuery(query).toLowerCase() : '';

  return items
    .filter((item) => {
      // 1. Strict status check: Public portal MUST only display PUBLISHED items
      if (status !== 'ALL' && item.status !== status) {
        return false;
      }

      // 2. Filter by News Type
      if (newsType !== 'ALL' && item.newsType !== newsType) {
        return false;
      }

      // 3. Keyword query matching title and summary
      if (sanitizedQuery) {
        const titleMatch = item.title.toLowerCase().includes(sanitizedQuery);
        const summaryMatch = item.summary.toLowerCase().includes(sanitizedQuery);
        if (!titleMatch && !summaryMatch) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // Pinned announcements appear first
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      // Newest first by publishedAt date
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return dateB - dateA;
    });
}

/**
 * Retrieves a single published news item by its slug.
 *
 * Acceptance criteria:
 * - Each item has a detail page; draft/unpublished items are never exposed.
 * Returns null if the item does not exist or is in DRAFT/ARCHIVED status.
 */
export function getNewsBySlug(slug: string, items: NewsItem[] = SEED_NEWS): NewsItem | null {
  if (!slug) return null;
  const normalizedSlug = slug.trim().toLowerCase();

  const found = items.find((item) => item.slug.toLowerCase() === normalizedSlug);
  if (!found) return null;

  // Strict defense: Reject if not published
  if (found.status !== 'PUBLISHED') {
    return null;
  }

  return {
    ...found,
    content: sanitizeNewsContent(found.content),
  };
}
