/**
 * News and Announcements Entity and Filter Types
 * Aligned with Database Schema Specification (Docs/database-schema-specification.md)
 */

export type NewsType = 'NEWS' | 'ANNOUNCEMENT' | 'PRESS_RELEASE';

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl?: string | null;
  newsType: NewsType;
  isPinned: boolean;
  status: ContentStatus;
  publishedAt: string; // ISO DateTime
  expireDate?: string | null;
  authorName?: string;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsFilterCriteria {
  newsType?: NewsType | 'ALL';
  query?: string;
  status?: ContentStatus | 'ALL';
}

export interface NewsApiResponse {
  success: boolean;
  data?: NewsItem[];
  item?: NewsItem;
  error?: string;
  count?: number;
}

