/**
 * Project Entity and Filter Types
 * Aligned with Database Schema Specification (Docs/database-schema-specification.md)
 */

export type ServicePillar = 'HEALTHCARE' | 'EDUCATION' | 'ENVIRONMENT' | 'POVERTY_RELIEF' | 'OTHER';

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ProjectImpactMetric {
  label: string;
  value: number | string;
  prefix?: string | null;
  suffix?: string | null;
}

export interface ProjectGalleryImage {
  id?: string;
  imageUrl: string;
  caption?: string | null;
  displayOrder?: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: ServicePillar;
  summary: string;
  description: string;
  coverImageUrl: string | null;
  eventDate: string; // ISO Date YYYY-MM-DD
  location: string;
  status: ContentStatus;
  publishedAt?: string | null;
  authorId?: string;
  authorName?: string | null;
  createdAt: string;
  updatedAt: string;
  // Optional impact metrics (where present)
  impactMetrics?: ProjectImpactMetric[];
  // Optional photograph gallery (where available)
  gallery?: ProjectGalleryImage[];
  photos?: string[];
}

export interface ProjectFilterCriteria {
  category?: ServicePillar | 'ALL';
  query?: string;
  year?: string | 'ALL';
  status?: ContentStatus | 'ALL';
}

export interface ProjectsApiResponse {
  success: boolean;
  data?: Project[];
  error?: string;
  count?: number;
}
