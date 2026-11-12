import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Import media domain logic and repository
import {
  getMediaStorageConfig,
  validateImageBuffer,
  buildOptimizedMediaUrl,
  uploadMediaAsset,
  sanitizeFileName,
  ALLOWED_IMAGE_MIME_TYPES,
  DEFAULT_MAX_FILE_SIZE,
} from '../src/lib/media.ts';
import {
  insertMediaAsset,
  getMediaAssetById,
  getMediaAssetByPublicId,
} from '../src/lib/media-repository.ts';
import { createTestDatabase } from '../src/lib/db.ts';
import { isClientSafeVariableName } from '../src/lib/auth/secrets.ts';

describe('Media Storage & Image Upload Pipeline (LBW-42, EPIC-6) Test Suite', () => {
  // Sample binary buffers with valid magic bytes
  const VALID_JPEG_BUFFER = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const VALID_PNG_BUFFER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
  const VALID_WEBP_BUFFER = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x24, 0x00, 0x00, 0x00, // length
    0x57, 0x45, 0x42, 0x50, // WEBP
  ]);

  // AC1: Media account/bucket configured with keys in environment secrets only
  describe('AC1: Environment Secrets & Security Isolation', () => {
    it('.env.example declares Cloudinary media variables without values', () => {
      const envPath = path.join(process.cwd(), '.env.example');
      const content = fs.readFileSync(envPath, 'utf8');

      assert.ok(content.includes('CLOUDINARY_CLOUD_NAME='), 'Must declare CLOUDINARY_CLOUD_NAME');
      assert.ok(content.includes('CLOUDINARY_API_KEY='), 'Must declare CLOUDINARY_API_KEY');
      assert.ok(content.includes('CLOUDINARY_API_SECRET='), 'Must declare CLOUDINARY_API_SECRET');

      // Verify no hardcoded values assigned in template
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.startsWith('CLOUDINARY_')) {
          const [, value] = line.split('=');
          assert.strictEqual(value.trim(), '', `Cloudinary variable in .env.example must be empty: "${line}"`);
        }
      }
    });

    it('private media secret keys are strictly blocked from client bundle exposure', () => {
      assert.strictEqual(isClientSafeVariableName('CLOUDINARY_API_SECRET'), false);
      assert.strictEqual(isClientSafeVariableName('NEXT_PUBLIC_CLOUDINARY_API_SECRET'), false);
      assert.strictEqual(isClientSafeVariableName('NEXT_PUBLIC_CLOUDINARY_SECRET'), false);
    });

    it('getMediaStorageConfig returns configuration status without leaking secret values', () => {
      const config = getMediaStorageConfig();

      assert.ok(typeof config.configured === 'boolean');
      assert.ok(typeof config.cloudName === 'string');
      assert.ok(typeof config.hasApiKey === 'boolean');
      assert.ok(typeof config.hasApiSecret === 'boolean');
      assert.ok(typeof config.isStagingFallback === 'boolean');

      // Verify actual secret string is not in returned object
      assert.strictEqual('apiSecret' in config, false, 'apiSecret value must never be returned');
      assert.strictEqual('CLOUDINARY_API_SECRET' in config, false);
    });
  });

  // AC2: Server-side upload helper restricts file type (JPEG/PNG/WebP) and size and returns delivery URL
  describe('AC2: File Type & Size Restrictions', () => {
    it('allowed MIME types are strictly limited to JPEG, PNG, and WebP', () => {
      assert.deepStrictEqual(Array.from(ALLOWED_IMAGE_MIME_TYPES), [
        'image/jpeg',
        'image/png',
        'image/webp',
      ]);
    });

    it('validates authentic JPEG, PNG, and WebP buffers by magic bytes', () => {
      const jpegResult = validateImageBuffer(VALID_JPEG_BUFFER, 'camp.jpg');
      assert.strictEqual(jpegResult.valid, true);
      assert.strictEqual(jpegResult.mimeType, 'image/jpeg');

      const pngResult = validateImageBuffer(VALID_PNG_BUFFER, 'logo.png');
      assert.strictEqual(pngResult.valid, true);
      assert.strictEqual(pngResult.mimeType, 'image/png');

      const webpResult = validateImageBuffer(VALID_WEBP_BUFFER, 'banner.webp');
      assert.strictEqual(webpResult.valid, true);
      assert.strictEqual(webpResult.mimeType, 'image/webp');
    });

    it('rejects disallowed file types (SVG, PDF, EXE, HTML script)', () => {
      const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
      const svgResult = validateImageBuffer(svgBuffer, 'exploit.svg');
      assert.strictEqual(svgResult.valid, false);
      assert.ok(svgResult.error?.includes('Unsupported file type'));

      const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // MZ header
      const exeResult = validateImageBuffer(exeBuffer, 'malware.exe');
      assert.strictEqual(exeResult.valid, false);

      const pdfBuffer = Buffer.from('%PDF-1.4');
      const pdfResult = validateImageBuffer(pdfBuffer, 'document.pdf');
      assert.strictEqual(pdfResult.valid, false);
    });

    it('rejects files exceeding the maximum size limit', () => {
      const oversizedBuffer = Buffer.alloc(DEFAULT_MAX_FILE_SIZE + 1024); // 5MB + 1KB
      oversizedBuffer[0] = 0xff;
      oversizedBuffer[1] = 0xd8;
      oversizedBuffer[2] = 0xff;

      const result = validateImageBuffer(oversizedBuffer, 'large-photo.jpg');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('exceeds the maximum allowed limit'));
    });

    it('rejects empty file payloads', () => {
      const emptyBuffer = Buffer.alloc(0);
      const result = validateImageBuffer(emptyBuffer, 'empty.jpg');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error?.includes('Empty file payload'));
    });

    it('sanitizes file names against directory traversal and dangerous characters', () => {
      assert.strictEqual(sanitizeFileName('../../etc/passwd.jpg'), 'etcpasswd.jpg');
      assert.strictEqual(sanitizeFileName('camp photo (1) <v2>?.png'), 'camp_photo__1___v2__.png');
    });
  });

  // AC3: Images are served over HTTPS with automatic resizing/compression where supported
  describe('AC3: HTTPS Delivery & Automatic Resizing/Compression', () => {
    it('always generates HTTPS URLs', () => {
      const url = buildOptimizedMediaUrl('lions-balangoda/cataract-camp-2026');
      assert.ok(url.startsWith('https://'), 'URL must use HTTPS protocol');
    });

    it('automatically applies f_auto and q_auto for automatic format and compression', () => {
      const url = buildOptimizedMediaUrl('lions-balangoda/vision-care');
      assert.ok(url.includes('f_auto'), 'URL must include automatic format selection (f_auto)');
      assert.ok(url.includes('q_auto'), 'URL must include automatic quality compression (q_auto)');
    });

    it('applies custom dimensions and cropping correctly', () => {
      const url = buildOptimizedMediaUrl('lions-balangoda/tree-planting', {
        width: 800,
        height: 600,
        crop: 'fill',
      });
      assert.ok(url.includes('w_800'));
      assert.ok(url.includes('h_600'));
      assert.ok(url.includes('c_fill'));
      assert.ok(url.includes('f_auto,q_auto'));
    });

    it('converts insecure http:// Cloudinary URLs to https:// and injects optimization', () => {
      const legacyUrl = 'http://res.cloudinary.com/lions-balangoda/image/upload/sample.jpg';
      const optimized = buildOptimizedMediaUrl(legacyUrl);
      assert.ok(optimized.startsWith('https://'));
      assert.ok(optimized.includes('/f_auto,q_auto/'));
    });
  });

  // AC4: Uploads are testable from staging
  describe('AC4: Staging Upload Pipeline & Database Persistence', () => {
    before(() => {
      // Ensure database is initialized with media_assets schema
      createTestDatabase();
    });

    it('uploadMediaAsset completes successfully in staging/test environment', async () => {
      const result = await uploadMediaAsset(VALID_JPEG_BUFFER, 'health-camp-stage.jpg', {
        folder: 'projects',
        altText: 'Free Health Screening Clinic',
      });

      assert.strictEqual(result.success, true);
      assert.ok(result.secureUrl, 'Must return a secureUrl');
      assert.ok(result.secureUrl.startsWith('https://'), 'Must be an HTTPS URL');
      assert.ok(result.publicId, 'Must return a publicId');
      assert.strictEqual(result.format, 'jpg');
      assert.ok(result.width && result.width > 0);
      assert.ok(result.height && result.height > 0);
      assert.strictEqual(result.bytes, VALID_JPEG_BUFFER.length);
    });

    it('persists and retrieves media asset records in the database with parameterized queries', () => {
      const mockAsset = {
        assetId: 'ast-test-001',
        publicId: 'projects/2026-cataract-screening',
        secureUrl: 'https://res.cloudinary.com/lions-balangoda/image/upload/f_auto,q_auto/projects/2026-cataract-screening.jpg',
        fileName: 'cataract-screening.jpg',
        fileType: 'image/jpeg',
        fileSizeBytes: 1048576,
        width: 1920,
        height: 1080,
        altText: 'Annual Free Cataract Surgery Camp',
        uploadedBy: 'usr-dev-001',
        createdAt: new Date().toISOString(),
      };

      const inserted = insertMediaAsset(mockAsset);
      assert.strictEqual(inserted.assetId, 'ast-test-001');

      // Retrieve by assetId
      const retrieved = getMediaAssetById('ast-test-001');
      assert.ok(retrieved, 'Asset must be retrievable by assetId');
      assert.strictEqual(retrieved.publicId, 'projects/2026-cataract-screening');
      assert.strictEqual(retrieved.secureUrl, mockAsset.secureUrl);
      assert.strictEqual(retrieved.fileType, 'image/jpeg');
      assert.strictEqual(retrieved.width, 1920);
      assert.strictEqual(retrieved.height, 1080);

      // Retrieve by publicId
      const byPublicId = getMediaAssetByPublicId('projects/2026-cataract-screening');
      assert.ok(byPublicId, 'Asset must be retrievable by publicId');
      assert.strictEqual(byPublicId.assetId, 'ast-test-001');
    });

    it('uploadMediaAsset returns friendly error when given invalid file buffer in staging', async () => {
      const invalidBuffer = Buffer.from('plain text document, not an image');
      const result = await uploadMediaAsset(invalidBuffer, 'notes.txt');

      assert.strictEqual(result.success, false);
      assert.ok(result.error);
      assert.ok(result.error.includes('Unsupported file type'));
    });
  });
});

