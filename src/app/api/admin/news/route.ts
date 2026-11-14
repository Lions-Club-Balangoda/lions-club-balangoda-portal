import { NextResponse, type NextRequest } from 'next/server.js';
import { authorizeRequest } from '../../../../lib/auth/session.ts';
import {
  getAllNewsForAdmin,
  createNews,
  type CreateNewsInput,
} from '../../../../lib/news-repository.ts';
import { createSafeErrorResponse } from '../../../../lib/security/safe-error.ts';

/**
 * CMS Admin Route: GET /api/admin/news
 * Lists all news articles (including DRAFT and ARCHIVED) for authenticated officers.
 */
export async function GET(request: Request | NextRequest) {
  const auth = authorizeRequest(request, ['ADMIN', 'EDITOR']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    let query = '';
    let newsType = 'ALL';
    let status = 'ALL';

    if (request && 'url' in request && request.url) {
      const url = new URL(request.url);
      query = url.searchParams.get('q') || url.searchParams.get('query') || '';
      newsType = url.searchParams.get('type') || 'ALL';
      status = url.searchParams.get('status') || 'ALL';
    }

    const newsItems = getAllNewsForAdmin({ query, newsType, status });
    return NextResponse.json(
      {
        success: true,
        data: newsItems,
        count: newsItems.length,
      },
      { status: 200 }
    );
  } catch (err) {
    return createSafeErrorResponse(err, {
      statusCode: 500,
      fallbackMessage: 'Failed to retrieve administrative news records.',
      trackingPrefix: 'API /api/admin/news GET',
    });
  }
}

/**
 * CMS Admin Route: POST /api/admin/news
 * Creates a new news article/announcement in the CMS. Requires ADMIN or EDITOR role.
 */
export async function POST(request: Request | NextRequest) {
  const auth = authorizeRequest(request, ['ADMIN', 'EDITOR']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Partial<CreateNewsInput>;

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: 'News article title is required.' },
        { status: 400 }
      );
    }

    const created = createNews(body as CreateNewsInput, auth.user!.userId);

    return NextResponse.json(
      {
        success: true,
        data: created,
        message: 'News article created successfully.',
      },
      { status: 201 }
    );
  } catch (err) {
    return createSafeErrorResponse(err, {
      statusCode: 500,
      fallbackMessage: 'Failed to create news record.',
      trackingPrefix: 'API /api/admin/news POST',
    });
  }
}
