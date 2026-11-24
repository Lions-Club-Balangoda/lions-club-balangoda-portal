/**
 * src/lib/news-validation.ts
 * Server-Side Validation and Sanitization for News & Announcements
 *
 * Story: News & Announcements Management (CMS CRUD)
 * Acceptance Criteria Covered:
 *   - Authorised users can create, view, update, publish, unpublish, and delete news
 *   - Server-side validation with clear field-level errors (title, type, body, expireDate)
 *   - Stored XSS defense (body content sanitized)
 *   - Validates length limits and required fields
 *
 * Security Standards: SEC-02 (Input Validation), SEC-03 (Sanitization & XSS Defense)
 */

import type { NewsType, ContentStatus } from '../types/news.ts';
import { sanitizeNewsContent } from './news.ts';
import { sanitizeSlug } from './projects.ts';

export const VALID_NEWS_TYPES: readonly NewsType[] = [
  'NEWS',
  'ANNOUNCEMENT',
  'PRESS_RELEASE',
] as const;

export const VALID_CONTENT_STATUSES: readonly ContentStatus[] = [
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
] as const;

export interface NewsValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: {
    title: string;
    summary: string;
    content: string;
    coverImageUrl: string | null;
    newsType: NewsType;
    isPinned: boolean;
    expireDate: string | null;
    status: ContentStatus;
    slug?: string;
  };
}

/**
 * Validates a prospective news creation payload.
 */
export function validateNewsCreateInput(raw: unknown): NewsValidationResult {
  const errors: Record<string, string> = {};

  if (!raw || typeof raw !== 'object') {
    return {
      isValid: false,
      errors: { form: 'Invalid request body. Form data is required.' },
      sanitizedData: {
        title: '',
        summary: '',
        content: '',
        coverImageUrl: null,
        newsType: 'NEWS',
        isPinned: false,
        expireDate: null,
        status: 'DRAFT',
      },
    };
  }

  const data = raw as Record<string, unknown>;

  // 1. Title validation (Required, 5-200 characters)
  const rawTitle = typeof data.title === 'string' ? data.title.trim() : '';
  if (!rawTitle) {
    errors.title = 'News headline/title is required.';
  } else if (rawTitle.length < 5) {
    errors.title = 'Title must be at least 5 characters long.';
  } else if (rawTitle.length > 200) {
    errors.title = 'Title must not exceed 200 characters.';
  }

  // 2. News Type validation (Required, must be one of VALID_NEWS_TYPES)
  const rawType = typeof data.newsType === 'string' ? data.newsType.trim().toUpperCase() : '';
  if (!rawType) {
    errors.newsType = 'News type is required.';
  } else if (!VALID_NEWS_TYPES.includes(rawType as NewsType)) {
    errors.newsType = `Invalid news type. Allowed types: ${VALID_NEWS_TYPES.join(', ')}.`;
  }

  // 3. Content (body) validation (Required, non-empty)
  const rawContent = typeof data.content === 'string' ? data.content : '';
  const sanitizedContent = sanitizeNewsContent(rawContent);
  // Strip tags to check if there is actual textual substance
  const plainTextContent = sanitizedContent.replace(/<[^>]*>/g, '').trim();
  if (!plainTextContent) {
    errors.content = 'Article body content is required.';
  }

  // 4. Summary validation (Optional, max 500 characters)
  const rawSummary = typeof data.summary === 'string' ? data.summary.trim() : '';
  if (rawSummary.length > 500) {
    errors.summary = 'Summary must not exceed 500 characters.';
  }

  // 5. Expiration Date validation (Optional; if entered, must be a future date)
  let validExpireDate: string | null = null;
  if (data.expireDate !== undefined && data.expireDate !== null && data.expireDate !== '') {
    if (typeof data.expireDate === 'string') {
      const parsedDate = new Date(data.expireDate);
      if (isNaN(parsedDate.getTime())) {
        errors.expireDate = 'Invalid expiration date format.';
      } else {
        const now = new Date();
        if (parsedDate.getTime() <= now.getTime()) {
          errors.expireDate = 'Auto-unpin date must be set to a future date.';
        } else {
          validExpireDate = parsedDate.toISOString();
        }
      }
    } else {
      errors.expireDate = 'Invalid expiration date.';
    }
  }

  // 6. Status validation (Optional, default DRAFT)
  let status: ContentStatus = 'DRAFT';
  if (data.status !== undefined && data.status !== null) {
    const rawStatus = String(data.status).trim().toUpperCase();
    if (!VALID_CONTENT_STATUSES.includes(rawStatus as ContentStatus)) {
      errors.status = `Invalid content status. Allowed statuses: ${VALID_CONTENT_STATUSES.join(', ')}.`;
    } else {
      status = rawStatus as ContentStatus;
    }
  }

  // 7. Cover Image URL validation (Optional, max 2048 chars)
  let coverImageUrl: string | null = null;
  if (typeof data.coverImageUrl === 'string' && data.coverImageUrl.trim()) {
    const trimmed = data.coverImageUrl.trim();
    if (trimmed.length > 2048) {
      errors.coverImageUrl = 'Cover image URL must not exceed 2048 characters.';
    } else {
      coverImageUrl = trimmed;
    }
  }

  // 8. Pinned flag
  const isPinned = Boolean(data.isPinned);

  // 9. Slug (Optional; generated if omitted)
  let slug: string | undefined = undefined;
  if (typeof data.slug === 'string' && data.slug.trim()) {
    slug = sanitizeSlug(data.slug.trim());
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: {
      title: rawTitle,
      summary: rawSummary,
      content: sanitizedContent,
      coverImageUrl,
      newsType: (rawType as NewsType) || 'NEWS',
      isPinned,
      expireDate: validExpireDate,
      status,
      slug,
    },
  };
}

/**
 * Validates a partial news update payload.
 */
export function validateNewsUpdateInput(raw: unknown): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: Partial<NewsValidationResult['sanitizedData']>;
} {
  const errors: Record<string, string> = {};

  if (!raw || typeof raw !== 'object') {
    return {
      isValid: false,
      errors: { form: 'Invalid request body.' },
      sanitizedData: {},
    };
  }

  const data = raw as Record<string, unknown>;
  const sanitized: Partial<NewsValidationResult['sanitizedData']> = {};

  // Title
  if (data.title !== undefined) {
    const rawTitle = typeof data.title === 'string' ? data.title.trim() : '';
    if (!rawTitle) {
      errors.title = 'News headline/title cannot be empty.';
    } else if (rawTitle.length < 5) {
      errors.title = 'Title must be at least 5 characters long.';
    } else if (rawTitle.length > 200) {
      errors.title = 'Title must not exceed 200 characters.';
    } else {
      sanitized.title = rawTitle;
    }
  }

  // News Type
  if (data.newsType !== undefined) {
    const rawType = typeof data.newsType === 'string' ? data.newsType.trim().toUpperCase() : '';
    if (!VALID_NEWS_TYPES.includes(rawType as NewsType)) {
      errors.newsType = `Invalid news type. Allowed types: ${VALID_NEWS_TYPES.join(', ')}.`;
    } else {
      sanitized.newsType = rawType as NewsType;
    }
  }

  // Content
  if (data.content !== undefined) {
    const rawContent = typeof data.content === 'string' ? data.content : '';
    const cleanContent = sanitizeNewsContent(rawContent);
    const plainText = cleanContent.replace(/<[^>]*>/g, '').trim();
    if (!plainText) {
      errors.content = 'Article body content cannot be empty.';
    } else {
      sanitized.content = cleanContent;
    }
  }

  // Summary
  if (data.summary !== undefined) {
    const rawSummary = typeof data.summary === 'string' ? data.summary.trim() : '';
    if (rawSummary.length > 500) {
      errors.summary = 'Summary must not exceed 500 characters.';
    } else {
      sanitized.summary = rawSummary;
    }
  }

  // Expiration Date
  if (data.expireDate !== undefined) {
    if (data.expireDate === null || data.expireDate === '') {
      sanitized.expireDate = null;
    } else if (typeof data.expireDate === 'string') {
      const parsedDate = new Date(data.expireDate);
      if (isNaN(parsedDate.getTime())) {
        errors.expireDate = 'Invalid expiration date format.';
      } else {
        const now = new Date();
        if (parsedDate.getTime() <= now.getTime()) {
          errors.expireDate = 'Auto-unpin date must be set to a future date.';
        } else {
          sanitized.expireDate = parsedDate.toISOString();
        }
      }
    } else {
      errors.expireDate = 'Invalid expiration date.';
    }
  }

  // Status
  if (data.status !== undefined) {
    const rawStatus = String(data.status).trim().toUpperCase();
    if (!VALID_CONTENT_STATUSES.includes(rawStatus as ContentStatus)) {
      errors.status = `Invalid content status. Allowed statuses: ${VALID_CONTENT_STATUSES.join(', ')}.`;
    } else {
      sanitized.status = rawStatus as ContentStatus;
    }
  }

  // Cover Image URL
  if (data.coverImageUrl !== undefined) {
    if (data.coverImageUrl === null || data.coverImageUrl === '') {
      sanitized.coverImageUrl = null;
    } else if (typeof data.coverImageUrl === 'string') {
      const trimmed = data.coverImageUrl.trim();
      if (trimmed.length > 2048) {
        errors.coverImageUrl = 'Cover image URL must not exceed 2048 characters.';
      } else {
        sanitized.coverImageUrl = trimmed;
      }
    }
  }

  // Pinned
  if (data.isPinned !== undefined) {
    sanitized.isPinned = Boolean(data.isPinned);
  }

  // Slug
  if (data.slug !== undefined) {
    if (typeof data.slug === 'string' && data.slug.trim()) {
      sanitized.slug = sanitizeSlug(data.slug.trim());
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: sanitized,
  };
}
