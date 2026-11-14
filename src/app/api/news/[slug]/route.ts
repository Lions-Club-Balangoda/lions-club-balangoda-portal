import { NextResponse, type NextRequest } from 'next/server.js';
import { getPublishedNewsBySlugFromDb } from '../../../../lib/news-repository.ts';
import { createSafeErrorResponse } from '../../../../lib/security/safe-error.ts';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * Public API Route: GET /api/news/[slug]
 * Retrieves a single published news article or announcement.
 *
 * Security & Acceptance Constraints:
 * 1. Only news items with status = 'PUBLISHED' are returned.
 * 2. Unknown, draft, or archived slugs return HTTP 404 with a friendly error response.
 * 3. Rich text contents are safely sanitized.
 */
export async function GET(_request: Request | NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    if (!slug || !slug.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'News article slug is required.',
        },
        { status: 400 }
      );
    }

    const newsItem = getPublishedNewsBySlugFromDb(slug.trim());

    if (!newsItem) {
      return NextResponse.json(
        {
          success: false,
          error:
            'News article not found. The requested article may have been unpublished or does not exist.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newsItem,
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
      fallbackMessage: 'Unable to load news article details at this time.',
      trackingPrefix: 'API /api/news/[slug]',
    });
  }
}
