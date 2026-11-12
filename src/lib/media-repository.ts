/**
 * src/lib/media-repository.ts
 * Parameterized Database Repository for Media Assets
 * 
 * Task: LBW-42 (Configure media storage for image uploads)
 * Security Standard: SEC-02 (Parameterized SQL queries, zero SQL injection)
 * Course: IS5109 Community Project (Group 14)
 */

import { getDatabase } from './db.ts';
import type { MediaAsset } from '../types/media.ts';

/**
 * Persists an uploaded media asset record into the database.
 * Strictly uses parameterized queries.
 */
export function insertMediaAsset(asset: MediaAsset): MediaAsset {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO media_assets (
      asset_id,
      public_id,
      secure_url,
      file_name,
      file_type,
      file_size_bytes,
      width,
      height,
      alt_text,
      uploaded_by,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    asset.assetId,
    asset.publicId,
    asset.secureUrl,
    asset.fileName || null,
    asset.fileType,
    asset.fileSizeBytes || null,
    asset.width || null,
    asset.height || null,
    asset.altText || null,
    asset.uploadedBy || null,
    asset.createdAt || new Date().toISOString()
  );

  return asset;
}

/**
 * Retrieves a media asset by its primary key assetId.
 */
export function getMediaAssetById(assetId: string): MediaAsset | null {
  if (!assetId) return null;
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      asset_id AS assetId,
      public_id AS publicId,
      secure_url AS secureUrl,
      file_name AS fileName,
      file_type AS fileType,
      file_size_bytes AS fileSizeBytes,
      width,
      height,
      alt_text AS altText,
      uploaded_by AS uploadedBy,
      created_at AS createdAt
    FROM media_assets
    WHERE asset_id = ?
  `);

  const row = stmt.get(assetId) as MediaAsset | undefined;
  return row || null;
}

/**
 * Retrieves a media asset by its unique publicId (Cloudinary ID or S3 key).
 */
export function getMediaAssetByPublicId(publicId: string): MediaAsset | null {
  if (!publicId) return null;
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT
      asset_id AS assetId,
      public_id AS publicId,
      secure_url AS secureUrl,
      file_name AS fileName,
      file_type AS fileType,
      file_size_bytes AS fileSizeBytes,
      width,
      height,
      alt_text AS altText,
      uploaded_by AS uploadedBy,
      created_at AS createdAt
    FROM media_assets
    WHERE public_id = ?
  `);

  const row = stmt.get(publicId) as MediaAsset | undefined;
  return row || null;
}
