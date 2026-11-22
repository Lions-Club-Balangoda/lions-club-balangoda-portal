import { NextResponse, type NextRequest } from 'next/server.js';
import { authorizeRequest } from '../../../../../lib/auth/session.ts';
import {
  getNewsById,
  updateNews,
  deleteNews,
  type UpdateNewsInput,
} from '../../../../../lib/news-repository.ts';
import { createSafeErrorResponse } from '../../../../../lib/security/safe-error.ts';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * CMS Admin Route: GET /api/admin/news/[id]
 */
export async function GET(request: Request | NextRequest, context: RouteContext) {
  const auth = authorizeRequest(request, ['ADMIN', 'EDITOR']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const { id } = await context.params;
    const newsItem = getNewsById(id);

    if (!newsItem) {
      return NextResponse.json(
        { success: false, error: 'News article not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: newsItem }, { status: 200 });
  } catch (err) {
    return createSafeErrorResponse(err, {
      statusCode: 500,
      fallbackMessage: 'Failed to retrieve news record.',
      trackingPrefix: 'API /api/admin/news/[id] GET',
    });
  }
}

/**
 * CMS Admin Route: PUT/PATCH /api/admin/news/[id]
 */
export async function PUT(request: Request | NextRequest, context: RouteContext) {
  const auth = authorizeRequest(request, ['ADMIN', 'EDITOR']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as UpdateNewsInput;

    const updated = updateNews(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'News article not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updated, message: 'News article updated successfully.' },
      { status: 200 }
    );
  } catch (err) {
    return createSafeErrorResponse(err, {
      statusCode: 500,
      fallbackMessage: 'Failed to update news record.',
      trackingPrefix: 'API /api/admin/news/[id] PUT',
    });
  }
}

export { PUT as PATCH };

/**
 * CMS Admin Route: DELETE /api/admin/news/[id]
 * Strictly restricted to ADMIN role. EDITORS receive 403 Forbidden.
 */
export async function DELETE(request: Request | NextRequest, context: RouteContext) {
  const auth = authorizeRequest(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const { id } = await context.params;
    const deleted = deleteNews(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'News article not found or already deleted.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'News article permanently deleted.' },
      { status: 200 }
    );
  } catch (err) {
    return createSafeErrorResponse(err, {
      statusCode: 500,
      fallbackMessage: 'Failed to delete news record.',
      trackingPrefix: 'API /api/admin/news/[id] DELETE',
    });
  }
}
