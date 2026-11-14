import { NextResponse, type NextRequest } from 'next/server.js';
import { getPublishedNewsFromDb } from '../../../lib/news-repository.ts';
import { createSafeErrorResponse } from '../../../lib/security/safe-error.ts';

/**
 * Public API Route: GET /api/news
 * Retrieves published news articles and announcements.
 *
 * Security & Acceptance Constraints:
 * 1. Only news items with status = 'PUBLISHED' are returned.
 * 2. Drafts and archived announcements are strictly excluded.
 * 3. Supports keyword search (?q=) and type filtering (?type=).
 * 4. Pinned announcements are ordered first, followed by newest published articles.
 */
export async function GET(request?: Request | NextRequest) {
  try {
    let query = '';
    let newsType = 'ALL';

    if (request && 'url' in request && request.url) {
      const url = new URL(request.url);
      query = url.searchParams.get('q') || url.searchParams.get('query') || '';
      newsType = url.searchParams.get('type') || url.searchParams.get('newsType') || 'ALL';
    }

    const newsItems = getPublishedNewsFromDb({ query, newsType });

    return NextResponse.json(
      {
        success: true,
        data: newsItems,
        count: newsItems.length,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (err) {
    return createSafeErrorResponse(err, {
      statusCode: 500,
      fallbackMessage: 'Unable to load news and announcements at this time.',
      trackingPrefix: 'API /api/news',
    });
  }
}
