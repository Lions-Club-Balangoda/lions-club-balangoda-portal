/**
 * src/types/media.ts
 * Domain Types for Media Asset Management & Cloudinary CDN Storage
 * 
 * Aligned with Database Schema Specification (Docs/database-schema-specification.md)
 * Task: LBW-42 (Configure media storage for image uploads)
 * Course: IS5109 Community Project (Group 14)
 */

export type AllowedImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp';
export type AllowedImageExtension = 'jpg' | 'jpeg' | 'png' | 'webp';

export interface MediaAsset {
  assetId: string;
  publicId: string;
  secureUrl: string;
  fileName: string | null;
  fileType: string;
  fileSizeBytes: number | null;
  width: number | null;
  height: number | null;
  altText: string | null;
  uploadedBy: string | null;
  createdAt: string;
}

export interface MediaUploadOptions {
  folder?: string;
  altText?: string;
  uploadedBy?: string;
  maxSizeBytes?: number;
  allowedMimeTypes?: AllowedImageMimeType[];
}

export interface MediaTransformOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'png' | 'jpg';
  crop?: 'fill' | 'scale' | 'fit' | 'limit';
}

export interface MediaUploadResult {
  success: boolean;
  asset?: MediaAsset;
  url?: string;
  secureUrl?: string;
  publicId?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  error?: string;
}

