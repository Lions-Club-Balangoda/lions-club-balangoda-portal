/**
 * Project Entity and Filter Types
 * Aligned with Database Schema Specification (Docs/database-schema-specification.md)
 */

export type ServicePillar =
  | 'HEALTHCARE'
  | 'EDUCATION'
  | 'ENVIRONMENT'
  | 'POVERTY_RELIEF'
  | 'OTHER';

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: ServicePillar;
  summary: string;
  description: string;
  coverImageUrl: string;
  eventDate: string; // ISO Date YYYY-MM-DD
  location: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFilterCriteria {
  category?: ServicePillar | 'ALL';
  query?: string;
  year?: string | 'ALL';
  status?: ContentStatus | 'ALL';
}

