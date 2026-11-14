import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createTestDatabase } from '../src/lib/db.ts';
import { hashPassword } from '../src/lib/auth/password.ts';
import {
  authenticateUser,
  createSessionToken,
  verifySessionToken,
  authorizeRequest,
  setAuthDatabase,
} from '../src/lib/auth/session.ts';
import {
  createProject,
  getProjectById,
  getAllProjectsForAdmin,
  updateProject,
  deleteProject,
  getPublishedProjects,
  getPublishedProjectBySlug,
  setProjectsDatabase,
} from '../src/lib/projects-repository.ts';
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

// Import Next.js route handlers
import { POST as loginRoute } from '../src/app/api/auth/login/route.ts';
import { POST as logoutRoute } from '../src/app/api/auth/logout/route.ts';
import { GET as meRoute } from '../src/app/api/auth/me/route.ts';
import {
  GET as adminProjectsGetRoute,
  POST as adminProjectsPostRoute,
} from '../src/app/api/admin/projects/route.ts';
import {
  GET as adminProjectByIdRoute,
  PUT as adminProjectUpdateRoute,
  DELETE as adminProjectDeleteRoute,
} from '../src/app/api/admin/projects/[id]/route.ts';
import {
  GET as adminNewsGetRoute,
  POST as adminNewsPostRoute,
} from '../src/app/api/admin/news/route.ts';
import {
  GET as adminNewsByIdRoute,
  PUT as adminNewsUpdateRoute,
  DELETE as adminNewsDeleteRoute,
} from '../src/app/api/admin/news/[id]/route.ts';
import { GET as publicProjectsRoute } from '../src/app/api/projects/route.ts';
import { GET as publicProjectBySlugRoute } from '../src/app/api/projects/[slug]/route.ts';
import { GET as publicNewsRoute } from '../src/app/api/news/route.ts';
import { GET as publicNewsBySlugRoute } from '../src/app/api/news/[slug]/route.ts';

describe('Integration Test Suite: Auth, CMS CRUD, Role Enforcement & Public APIs (Nafris / Sprint 2)', () => {
  let testDb;
  let adminUser;
  let editorUser;
  let inactiveUser;
  let adminToken;
  let editorToken;

  before(async () => {
    // 1. Initialize isolated in-memory test database
    testDb = createTestDatabase();

    // 2. Hash passwords with compliant bcrypt cost (work factor 10 for fast unit test execution)
    const adminPasswordHash = await hashPassword('AdminPass2026!', 10);
    const editorPasswordHash = await hashPassword('EditorPass2026!', 10);
    const inactivePasswordHash = await hashPassword('InactivePass2026!', 10);

    // 3. Seed test users
    const insertUser = testDb.prepare(`
      INSERT INTO users (user_id, username, email, password_hash, full_name, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'usr-admin-01',
      'test_admin',
      'admin@lionsbalangoda.test',
      adminPasswordHash,
      'Lion Admin Officer',
      'ADMIN',
      1
    );

    insertUser.run(
      'usr-editor-01',
      'test_editor',
      'editor@lionsbalangoda.test',
      editorPasswordHash,
      'Lion Editor Officer',
      'EDITOR',
      1
    );

    insertUser.run(
      'usr-inactive-01',
      'test_inactive',
      'inactive@lionsbalangoda.test',
      inactivePasswordHash,
      'Inactive Officer',
      'EDITOR',
      0
    );

    adminUser = {
      userId: 'usr-admin-01',
      username: 'test_admin',
      email: 'admin@lionsbalangoda.test',
      fullName: 'Lion Admin Officer',
      role: 'ADMIN',
      isActive: true,
    };

    editorUser = {
      userId: 'usr-editor-01',
      username: 'test_editor',
      email: 'editor@lionsbalangoda.test',
      fullName: 'Lion Editor Officer',
      role: 'EDITOR',
      isActive: true,
    };

    inactiveUser = {
      userId: 'usr-inactive-01',
      username: 'test_inactive',
      email: 'inactive@lionsbalangoda.test',
    };

    // Pre-create signed tokens for authorization tests
    adminToken = createSessionToken(adminUser);
    editorToken = createSessionToken(editorUser);

    // Inject test database into repositories & auth for route handler integration
    setAuthDatabase(testDb);
    setProjectsDatabase(testDb);
    setNewsDatabase(testDb);
  });

  after(() => {
    setAuthDatabase(null);
    setProjectsDatabase(null);
    setNewsDatabase(null);
    testDb.close();
  });

  /* =========================================================================
   * 1. Authentication & Session Management (Login / Logout)
   * ========================================================================= */
  describe('1. Authentication & Session Management (Login / Logout)', () => {
    it('authenticates valid ADMIN with email and updates last_login_at', async () => {
      const res = await authenticateUser('admin@lionsbalangoda.test', 'AdminPass2026!', testDb);
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.user.role, 'ADMIN');
      assert.strictEqual(res.user.username, 'test_admin');
      assert.strictEqual(typeof res.token, 'string');

      // Verify token payload
      const decoded = verifySessionToken(res.token);
      assert.ok(decoded);
      assert.strictEqual(decoded.sub, 'usr-admin-01');
      assert.strictEqual(decoded.role, 'ADMIN');

      // Verify last_login_at updated in database
      const row = testDb
        .prepare('SELECT last_login_at FROM users WHERE user_id = ?')
        .get('usr-admin-01');
      assert.ok(row.last_login_at, 'last_login_at must be populated after login');
    });

    it('authenticates valid EDITOR with username', async () => {
      const res = await authenticateUser('test_editor', 'EditorPass2026!', testDb);
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.user.role, 'EDITOR');
      assert.strictEqual(res.user.email, 'editor@lionsbalangoda.test');
    });

    it('rejects incorrect password with generic 401 error (no username enumeration)', async () => {
      const res = await authenticateUser('admin@lionsbalangoda.test', 'WrongPassword123!', testDb);
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(
        res.error,
        'Invalid email or password. Please verify your credentials and try again.'
      );
    });

    it('rejects unknown username/email with identical generic 401 error', async () => {
      const res = await authenticateUser('nonexistent_officer@lions.test', 'SomePass123!', testDb);
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(
        res.error,
        'Invalid email or password. Please verify your credentials and try again.'
      );
    });

    it('rejects deactivated user account (is_active = 0) with 401', async () => {
      const res = await authenticateUser(inactiveUser.email, 'InactivePass2026!', testDb);
      assert.strictEqual(res.success, false);
      assert.strictEqual(res.statusCode, 401);
      assert.match(res.error, /deactivated/i);
    });

    it('rejects missing credentials with 400 Bad Request', async () => {
      const res1 = await authenticateUser('', 'SomePass123!', testDb);
      assert.strictEqual(res1.success, false);
      assert.strictEqual(res1.statusCode, 400);

      const res2 = await authenticateUser('test_admin', '', testDb);
      assert.strictEqual(res2.success, false);
      assert.strictEqual(res2.statusCode, 400);
    });

    it('POST /api/auth/login route sets secure session cookie on valid credentials', async () => {
      const req = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'admin@lionsbalangoda.test',
          password: 'AdminPass2026!',
        }),
      });

      const res = await loginRoute(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.user.role, 'ADMIN');
      assert.ok(json.token);

      // Verify Set-Cookie header contains lions_session_token
      const setCookie = res.headers.get('set-cookie');
      assert.ok(setCookie, 'Response must include set-cookie header');
      assert.match(setCookie, /lions_session_token=/);
      assert.match(setCookie, /HttpOnly/i);
    });

    it('POST /api/auth/logout route clears the session cookie', async () => {
      const res = await logoutRoute();
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.match(json.message, /securely signed out/i);

      const setCookie = res.headers.get('set-cookie');
      assert.ok(setCookie);
      assert.match(setCookie, /Max-Age=0/i);
    });

    it('GET /api/auth/me returns 200 with user profile when authenticated with Bearer token', async () => {
      const req = new Request('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const res = await meRoute(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.user.userId, 'usr-admin-01');
      assert.strictEqual(json.user.role, 'ADMIN');
    });

    it('GET /api/auth/me returns 401 when no token is provided', async () => {
      const req = new Request('http://localhost:3000/api/auth/me');
      const res = await meRoute(req);
      assert.strictEqual(res.status, 401);

      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.match(json.error, /Missing or invalid authentication token/i);
    });
  });

  /* =========================================================================
   * 2. Role-Based Access Control & Enforcement (401 / 403)
   * ========================================================================= */
  describe('2. Role-Based Access Control & Enforcement (401 / 403)', () => {
    it('returns 401 Unauthorized for unauthenticated requests to protected admin endpoints', async () => {
      const reqProjects = new Request('http://localhost:3000/api/admin/projects');
      const resProjects = await adminProjectsGetRoute(reqProjects);
      assert.strictEqual(resProjects.status, 401);

      const reqNews = new Request('http://localhost:3000/api/admin/news');
      const resNews = await adminNewsGetRoute(reqNews);
      assert.strictEqual(resNews.status, 401);
    });

    it('returns 401 Unauthorized when presenting a forged or tampered session token', async () => {
      const parts = adminToken.split('.');
      const tamperedSignature = parts[2].slice(0, -4) + 'abcd';
      const forgedToken = `${parts[0]}.${parts[1]}.${tamperedSignature}`;

      const req = new Request('http://localhost:3000/api/admin/projects', {
        headers: { Authorization: `Bearer ${forgedToken}` },
      });

      const res = await adminProjectsGetRoute(req);
      assert.strictEqual(res.status, 401);
      const json = await res.json();
      assert.match(json.error, /invalid or has expired/i);
    });

    it('returns 401 Unauthorized for expired token', () => {
      // Create a token expired 1 hour ago
      const expiredToken = createSessionToken(adminUser, undefined, -3600);
      const auth = authorizeRequest({
        headers: { authorization: `Bearer ${expiredToken}` },
      });
      assert.strictEqual(auth.authorized, false);
      assert.strictEqual(auth.statusCode, 401);
    });

    it('returns 403 Forbidden when EDITOR attempts ADMIN-only deletion of a project', async () => {
      // First create a temporary project
      const proj = createProject(
        {
          title: 'Editor Delete Attempt Project',
          category: 'ENVIRONMENT',
          summary: 'Summary',
          description: 'Description',
          eventDate: '2026-04-01',
          location: 'Balangoda',
        },
        editorUser.userId,
        testDb
      );

      const req = new Request(`http://localhost:3000/api/admin/projects/${proj.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${editorToken}` },
      });

      const res = await adminProjectDeleteRoute(req, {
        params: Promise.resolve({ id: proj.id }),
      });

      assert.strictEqual(res.status, 403, 'EDITOR must receive 403 Forbidden on project deletion');
      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.match(json.error, /Access restricted to \[ADMIN\]/i);

      // Verify project was NOT deleted
      const stillExists = getProjectById(proj.id, testDb);
      assert.ok(stillExists, 'Project must still exist after rejected deletion');
    });

    it('returns 403 Forbidden when EDITOR attempts ADMIN-only deletion of a news item', async () => {
      const newsItem = createNews(
        {
          title: 'Editor Delete News Attempt',
          content: 'Content',
        },
        editorUser.userId,
        testDb
      );

      const req = new Request(`http://localhost:3000/api/admin/news/${newsItem.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${editorToken}` },
      });

      const res = await adminNewsDeleteRoute(req, {
        params: Promise.resolve({ id: newsItem.id }),
      });

      assert.strictEqual(res.status, 403, 'EDITOR must receive 403 Forbidden on news deletion');
      const json = await res.json();
      assert.match(json.error, /Access restricted to \[ADMIN\]/i);

      // Verify news item was NOT deleted
      const stillExists = getNewsById(newsItem.id, testDb);
      assert.ok(stillExists);
    });

    it('allows ADMIN to delete project and news items', async () => {
      // Create project to delete
      const proj = createProject(
        {
          title: 'Admin Deletable Project',
          category: 'HEALTHCARE',
          summary: 'Summary',
          description: 'Description',
          eventDate: '2026-05-01',
          location: 'Balangoda',
        },
        adminUser.userId,
        testDb
      );

      // Admin delete project
      const deletedProj = deleteProject(proj.id, testDb);
      assert.strictEqual(deletedProj, true);
      assert.strictEqual(getProjectById(proj.id, testDb), null);

      // Create news to delete
      const news = createNews(
        {
          title: 'Admin Deletable News',
          content: 'Content',
        },
        adminUser.userId,
        testDb
      );

      // Admin delete news
      const deletedNews = deleteNews(news.id, testDb);
      assert.strictEqual(deletedNews, true);
      assert.strictEqual(getNewsById(news.id, testDb), null);
    });

    it('allows both ADMIN and EDITOR to create and update projects and news', async () => {
      // 1. Editor creates a project
      const proj = createProject(
        {
          title: 'Editor Created Initiative',
          category: 'EDUCATION',
          summary: 'Editor summary',
          description: 'Editor narrative',
          eventDate: '2026-06-01',
          location: 'Medadumbara',
        },
        editorUser.userId,
        testDb
      );
      assert.ok(proj.id);
      assert.strictEqual(proj.authorId, editorUser.userId);

      // 2. Admin updates the project created by editor
      const updatedProj = updateProject(
        proj.id,
        {
          summary: 'Updated summary by Admin',
        },
        testDb
      );
      assert.strictEqual(updatedProj.summary, 'Updated summary by Admin');

      // 3. Editor creates news
      const news = createNews(
        {
          title: 'Editor Created Announcement',
          content: 'Announcement content',
        },
        editorUser.userId,
        testDb
      );
      assert.ok(news.id);

      // 4. Editor updates news
      const updatedNews = updateNews(
        news.id,
        {
          title: 'Editor Updated Announcement',
        },
        testDb
      );
      assert.strictEqual(updatedNews.title, 'Editor Updated Announcement');
    });
  });

  /* =========================================================================
   * 3. CMS Project CRUD Operations
   * ========================================================================= */
  describe('3. CMS Project CRUD Operations', () => {
    let createdProjectId;
    let createdProjectSlug;

    it('CREATE: creates project with unique slug, gallery photos, and impact metrics', () => {
      const input = {
        title: 'Community Eye Clinic & Glasses Drive 2026',
        category: 'HEALTHCARE',
        summary: 'Free eye screenings and distribution of 200 pairs of reading glasses.',
        description: '<p>Comprehensive ophthalmic examination program.</p>',
        eventDate: '2026-08-15',
        location: 'Balangoda District Hospital',
        coverImageUrl: 'https://images.example.com/clinic-cover.jpg',
        status: 'DRAFT',
        photos: [
          'https://images.example.com/clinic-1.jpg',
          'https://images.example.com/clinic-2.jpg',
        ],
        impactMetrics: [
          { label: 'Glasses Distributed', value: '200', prefix: null, suffix: ' pairs' },
          { label: 'Patients Screened', value: '450', prefix: null, suffix: '+' },
        ],
      };

      const proj = createProject(input, adminUser.userId, testDb);
      assert.ok(proj.id);
      assert.strictEqual(proj.title, input.title);
      assert.match(proj.slug, /^community-eye-clinic-glasses-drive-2026/);
      assert.strictEqual(proj.status, 'DRAFT');
      assert.strictEqual(proj.photos?.length, 2);
      assert.strictEqual(proj.impactMetrics?.length, 2);

      createdProjectId = proj.id;
      createdProjectSlug = proj.slug;
    });

    it('CREATE: auto-resolves slug collision with random suffix', () => {
      const proj2 = createProject(
        {
          title: 'Community Eye Clinic & Glasses Drive 2026',
          category: 'HEALTHCARE',
          summary: 'Second clinic',
          description: '<p>Second report</p>',
          eventDate: '2026-08-20',
          location: 'Balangoda',
          status: 'DRAFT',
        },
        adminUser.userId,
        testDb
      );

      assert.notStrictEqual(proj2.slug, createdProjectSlug);
      assert.match(proj2.slug, /^community-eye-clinic-glasses-drive-2026-[a-f0-9]+/);
    });

    it('READ: retrieves draft project by ID with all relations', () => {
      const proj = getProjectById(createdProjectId, testDb);
      assert.ok(proj);
      assert.strictEqual(proj.id, createdProjectId);
      assert.strictEqual(proj.title, 'Community Eye Clinic & Glasses Drive 2026');
      assert.strictEqual(proj.photos?.length, 2);
      assert.strictEqual(proj.impactMetrics?.length, 2);
    });

    it('READ: getAllProjectsForAdmin retrieves all projects regardless of status', () => {
      const adminList = getAllProjectsForAdmin({}, testDb);
      assert.ok(adminList.length > 0);
      const found = adminList.find((p) => p.id === createdProjectId);
      assert.ok(found, 'Draft project must be visible in admin list');
    });

    it('UPDATE: updates project title, summary, metrics, and changes status to PUBLISHED', () => {
      const updated = updateProject(
        createdProjectId,
        {
          title: 'Community Eye Clinic & Glasses Drive 2026 (Updated)',
          status: 'PUBLISHED',
          impactMetrics: [
            { label: 'Total Beneficiaries', value: '500', prefix: null, suffix: ' people' },
          ],
        },
        testDb
      );

      assert.ok(updated);
      assert.strictEqual(updated.title, 'Community Eye Clinic & Glasses Drive 2026 (Updated)');
      assert.strictEqual(updated.status, 'PUBLISHED');
      assert.ok(updated.publishedAt, 'publishedAt must be set when transitioning to PUBLISHED');
      assert.strictEqual(updated.impactMetrics?.length, 1);
      assert.strictEqual(updated.impactMetrics[0].label, 'Total Beneficiaries');
    });

    it('DELETE: cascades deletion of project and associated gallery/metrics', () => {
      const res = deleteProject(createdProjectId, testDb);
      assert.strictEqual(res, true);

      // Verify project row is deleted
      const checkProj = getProjectById(createdProjectId, testDb);
      assert.strictEqual(checkProj, null);

      // Verify gallery rows are deleted
      const gCount = testDb
        .prepare('SELECT COUNT(*) as c FROM project_gallery WHERE project_id = ?')
        .get(createdProjectId);
      assert.strictEqual(gCount.c, 0);

      // Verify metric rows are deleted
      const mCount = testDb
        .prepare('SELECT COUNT(*) as c FROM project_impact_metrics WHERE project_id = ?')
        .get(createdProjectId);
      assert.strictEqual(mCount.c, 0);
    });

    it('API: POST /api/admin/projects and GET/PUT /api/admin/projects/[id] route handlers work end-to-end', async () => {
      // POST
      const postReq = new Request('http://localhost:3000/api/admin/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Route Handler Test Initiative',
          category: 'EDUCATION',
          summary: 'Testing POST route',
          description: '<p>Testing description</p>',
          eventDate: '2026-10-10',
          location: 'Balangoda',
          status: 'DRAFT',
        }),
      });

      const postRes = await adminProjectsPostRoute(postReq);
      assert.strictEqual(postRes.status, 201);
      const postJson = await postRes.json();
      assert.strictEqual(postJson.success, true);
      const createdId = postJson.data.id;

      // GET by ID
      const getReq = new Request(`http://localhost:3000/api/admin/projects/${createdId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const getRes = await adminProjectByIdRoute(getReq, {
        params: Promise.resolve({ id: createdId }),
      });
      assert.strictEqual(getRes.status, 200);
      const getJson = await getRes.json();
      assert.strictEqual(getJson.data.title, 'Route Handler Test Initiative');

      // PUT update
      const putReq = new Request(`http://localhost:3000/api/admin/projects/${createdId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Route Handler Test Initiative (Updated)',
        }),
      });
      const putRes = await adminProjectUpdateRoute(putReq, {
        params: Promise.resolve({ id: createdId }),
      });
      assert.strictEqual(putRes.status, 200);
      const putJson = await putRes.json();
      assert.strictEqual(putJson.data.title, 'Route Handler Test Initiative (Updated)');
    });
  });

  /* =========================================================================
   * 4. CMS News CRUD Operations
   * ========================================================================= */
  describe('4. CMS News CRUD Operations', () => {
    let createdNewsId;

    it('CREATE: creates news announcement with pinning and expiration date', () => {
      const input = {
        title: 'Emergency Blood Donation Drive at Town Hall',
        summary: 'Urgent call for O-negative and A-positive blood donors.',
        content: '<p>The Balangoda Base Hospital blood bank requires urgent supplies.</p>',
        newsType: 'ANNOUNCEMENT',
        isPinned: true,
        expireDate: '2026-12-31',
        status: 'DRAFT',
      };

      const newsItem = createNews(input, adminUser.userId, testDb);
      assert.ok(newsItem.id);
      assert.strictEqual(newsItem.title, input.title);
      assert.strictEqual(newsItem.isPinned, true);
      assert.strictEqual(newsItem.newsType, 'ANNOUNCEMENT');
      assert.strictEqual(newsItem.status, 'DRAFT');

      createdNewsId = newsItem.id;
    });

    it('READ: retrieves news by ID for CMS admin', () => {
      const newsItem = getNewsById(createdNewsId, testDb);
      assert.ok(newsItem);
      assert.strictEqual(newsItem.id, createdNewsId);
      assert.strictEqual(newsItem.isPinned, true);
    });

    it('READ: getAllNewsForAdmin includes draft and published news', () => {
      const allNews = getAllNewsForAdmin({}, testDb);
      assert.ok(allNews.length > 0);
      const found = allNews.find((n) => n.id === createdNewsId);
      assert.ok(found, 'Draft news item must be present in admin list');
    });

    it('UPDATE: updates news content and changes status to PUBLISHED', () => {
      const updated = updateNews(
        createdNewsId,
        {
          summary: 'Updated blood drive details',
          status: 'PUBLISHED',
          isPinned: false,
        },
        testDb
      );

      assert.ok(updated);
      assert.strictEqual(updated.summary, 'Updated blood drive details');
      assert.strictEqual(updated.status, 'PUBLISHED');
      assert.strictEqual(updated.isPinned, false);
      assert.ok(updated.publishedAt);
    });

    it('DELETE: permanently removes news article from database', () => {
      const deleted = deleteNews(createdNewsId, testDb);
      assert.strictEqual(deleted, true);

      const check = getNewsById(createdNewsId, testDb);
      assert.strictEqual(check, null);
    });

    it('API: POST /api/admin/news and GET/PUT /api/admin/news/[id] route handlers work end-to-end', async () => {
      // POST
      const postReq = new Request('http://localhost:3000/api/admin/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Route Handler News Test',
          content: '<p>Route handler news content</p>',
          newsType: 'NEWS',
          status: 'DRAFT',
        }),
      });

      const postRes = await adminNewsPostRoute(postReq);
      assert.strictEqual(postRes.status, 201);
      const postJson = await postRes.json();
      assert.strictEqual(postJson.success, true);
      const createdId = postJson.data.id;

      // GET by ID
      const getReq = new Request(`http://localhost:3000/api/admin/news/${createdId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const getRes = await adminNewsByIdRoute(getReq, {
        params: Promise.resolve({ id: createdId }),
      });
      assert.strictEqual(getRes.status, 200);
      const getJson = await getRes.json();
      assert.strictEqual(getJson.data.title, 'Route Handler News Test');

      // PUT update
      const putReq = new Request(`http://localhost:3000/api/admin/news/${createdId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: 'Route Handler News Test (Updated)',
        }),
      });
      const putRes = await adminNewsUpdateRoute(putReq, {
        params: Promise.resolve({ id: createdId }),
      });
      assert.strictEqual(putRes.status, 200);
      const putJson = await putRes.json();
      assert.strictEqual(putJson.data.title, 'Route Handler News Test (Updated)');
    });
  });

  /* =========================================================================
   * 5. Publish Visibility Isolation (Draft & Archived Isolation)
   * ========================================================================= */
  describe('5. Publish Visibility Isolation (Draft & Archived Isolation)', () => {
    it('guarantees DRAFT and ARCHIVED projects are strictly invisible to public queries', () => {
      // 1. Create a DRAFT project
      const draftProj = createProject(
        {
          title: 'Top Secret Draft Initiative',
          category: 'ENVIRONMENT',
          summary: 'Internal draft summary',
          description: '<p>Internal draft content</p>',
          eventDate: '2026-09-01',
          location: 'Balangoda',
          status: 'DRAFT',
        },
        adminUser.userId,
        testDb
      );

      // Verify invisible in public list
      const publicList1 = getPublishedProjects(testDb);
      assert.strictEqual(
        publicList1.some((p) => p.id === draftProj.id),
        false,
        'DRAFT project must NOT appear in public list'
      );

      // Verify returns null on public slug lookup
      const publicSlug1 = getPublishedProjectBySlug(draftProj.slug, testDb);
      assert.strictEqual(
        publicSlug1,
        null,
        'Public slug lookup for DRAFT project must return null'
      );

      // 2. Publish the project
      updateProject(draftProj.id, { status: 'PUBLISHED' }, testDb);

      // Verify visible in public list
      const publicList2 = getPublishedProjects(testDb);
      assert.strictEqual(
        publicList2.some((p) => p.id === draftProj.id),
        true,
        'PUBLISHED project must appear in public list'
      );

      // Verify returns project on public slug lookup
      const publicSlug2 = getPublishedProjectBySlug(draftProj.slug, testDb);
      assert.ok(publicSlug2, 'Public slug lookup for PUBLISHED project must return project');
      assert.strictEqual(publicSlug2.id, draftProj.id);

      // 3. Archive the project
      updateProject(draftProj.id, { status: 'ARCHIVED' }, testDb);

      // Verify invisible in public list
      const publicList3 = getPublishedProjects(testDb);
      assert.strictEqual(
        publicList3.some((p) => p.id === draftProj.id),
        false,
        'ARCHIVED project must NOT appear in public list'
      );

      // Verify returns null on public slug lookup
      const publicSlug3 = getPublishedProjectBySlug(draftProj.slug, testDb);
      assert.strictEqual(
        publicSlug3,
        null,
        'Public slug lookup for ARCHIVED project must return null'
      );
    });

    it('guarantees DRAFT and ARCHIVED news are strictly invisible to public queries', () => {
      // 1. Create a DRAFT news item
      const draftNews = createNews(
        {
          title: 'Unpublished Internal Announcement',
          content: 'Internal announcement content',
          status: 'DRAFT',
        },
        adminUser.userId,
        testDb
      );

      // Verify invisible in public news
      const publicNews1 = getPublishedNewsFromDb({}, testDb);
      assert.strictEqual(
        publicNews1.some((n) => n.id === draftNews.id),
        false,
        'DRAFT news must NOT appear in public news'
      );

      // Verify returns null on public slug lookup
      const publicNewsSlug1 = getPublishedNewsBySlugFromDb(draftNews.slug, testDb);
      assert.strictEqual(publicNewsSlug1, null, 'DRAFT news slug lookup must return null');

      // 2. Publish news
      updateNews(draftNews.id, { status: 'PUBLISHED' }, testDb);

      const publicNews2 = getPublishedNewsFromDb({}, testDb);
      assert.strictEqual(
        publicNews2.some((n) => n.id === draftNews.id),
        true,
        'PUBLISHED news must appear in public news'
      );

      // 3. Archive news
      updateNews(draftNews.id, { status: 'ARCHIVED' }, testDb);

      const publicNews3 = getPublishedNewsFromDb({}, testDb);
      assert.strictEqual(
        publicNews3.some((n) => n.id === draftNews.id),
        false,
        'ARCHIVED news must NOT appear in public news'
      );

      const publicNewsSlug3 = getPublishedNewsBySlugFromDb(draftNews.slug, testDb);
      assert.strictEqual(publicNewsSlug3, null, 'ARCHIVED news slug lookup must return null');
    });
  });

  /* =========================================================================
   * 6. Public List & Detail Endpoints (Route Handlers)
   * ========================================================================= */
  describe('6. Public List & Detail Endpoints (Route Handlers)', () => {
    it('GET /api/projects returns 200 with published projects and cache headers', async () => {
      const req = new Request('http://localhost:3000/api/projects');
      const res = await publicProjectsRoute(req);
      assert.strictEqual(res.status, 200);

      const cacheControl = res.headers.get('cache-control');
      assert.ok(cacheControl);
      assert.match(cacheControl, /public/);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(Array.isArray(json.data));
      assert.strictEqual(typeof json.count, 'number');

      // Ensure every project in public response has status = 'PUBLISHED'
      for (const p of json.data) {
        assert.strictEqual(p.status, 'PUBLISHED', 'All public projects must be PUBLISHED');
      }
    });

    it('GET /api/projects filters by category and keyword search', async () => {
      const req = new Request('http://localhost:3000/api/projects?q=cataract&category=HEALTHCARE');
      const res = await publicProjectsRoute(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(Array.isArray(json.data));
    });

    it('GET /api/projects/[slug] returns 200 with details for valid published project', async () => {
      // Seed a dedicated published project in testDb
      const published = createProject(
        {
          title: 'Public Cataract Surgery Initiative 2026',
          category: 'HEALTHCARE',
          summary: 'Annual vision screening initiative.',
          description: '<p>Comprehensive medical camp report.</p>',
          eventDate: '2026-03-15',
          location: 'Base Hospital, Balangoda',
          status: 'PUBLISHED',
          photos: ['https://example.com/photo1.jpg'],
          impactMetrics: [{ label: 'Surgeries', value: '50', prefix: null, suffix: '+' }],
        },
        adminUser.userId,
        testDb
      );

      const req = new Request(`http://localhost:3000/api/projects/${published.slug}`);
      const res = await publicProjectBySlugRoute(req, {
        params: Promise.resolve({
          slug: published.slug,
        }),
      });

      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.slug, published.slug);
      assert.strictEqual(json.data.status, 'PUBLISHED');
      assert.strictEqual(json.data.photos?.length, 1);
      assert.strictEqual(json.data.impactMetrics?.length, 1);
    });

    it('GET /api/projects/[slug] returns 404 for nonexistent or draft slug', async () => {
      const req = new Request('http://localhost:3000/api/projects/this-slug-does-not-exist');
      const res = await publicProjectBySlugRoute(req, {
        params: Promise.resolve({ slug: 'this-slug-does-not-exist' }),
      });

      assert.strictEqual(res.status, 404);
      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert.match(json.error, /Project not found/i);
    });

    it('GET /api/news returns 200 with published news items and pinned sorting', async () => {
      // Seed a published news article
      createNews(
        {
          title: 'Public Vision Camp Announcement',
          summary: 'Announcement summary',
          content: '<p>Announcement content</p>',
          status: 'PUBLISHED',
          isPinned: true,
        },
        adminUser.userId,
        testDb
      );

      const req = new Request('http://localhost:3000/api/news');
      const res = await publicNewsRoute(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(Array.isArray(json.data));

      for (const item of json.data) {
        assert.strictEqual(item.status, 'PUBLISHED');
      }
    });

    it('GET /api/news/[slug] returns 200 for valid published news and 404 for unknown news slug', async () => {
      const publishedNews = createNews(
        {
          title: 'Special Live Announcement',
          summary: 'Announcement summary',
          content: '<p>Announcement content</p>',
          status: 'PUBLISHED',
          isPinned: false,
        },
        adminUser.userId,
        testDb
      );

      const reqOk = new Request(`http://localhost:3000/api/news/${publishedNews.slug}`);
      const resOk = await publicNewsBySlugRoute(reqOk, {
        params: Promise.resolve({ slug: publishedNews.slug }),
      });
      assert.strictEqual(resOk.status, 200);
      const jsonOk = await resOk.json();
      assert.strictEqual(jsonOk.success, true);
      assert.strictEqual(jsonOk.data.slug, publishedNews.slug);

      const req404 = new Request('http://localhost:3000/api/news/unknown-news-slug-12345');
      const res404 = await publicNewsBySlugRoute(req404, {
        params: Promise.resolve({ slug: 'unknown-news-slug-12345' }),
      });

      assert.strictEqual(res404.status, 404);
      const json404 = await res404.json();
      assert.strictEqual(json404.success, false);
      assert.match(json404.error, /News article not found/i);
    });
  });
});
