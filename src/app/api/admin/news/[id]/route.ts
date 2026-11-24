import { NextResponse, type NextRequest } from 'next/server.js';
import { authorizeRequest } from '../../../../../lib/auth/session.ts';
import {
  getNewsById,
  updateNews,
  deleteNews,
  type UpdateNewsInput,
} from '../../../../../lib/news-repository.ts';
import { validateNewsUpdateInput } from '../../../../../lib/news-validation.ts';
import { createSafeErrorResponse } from '../../../../../lib/security/safe-error.ts';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * CMS Admin Route: GET /api/admin/news/[id]
 * Retrieves full news record (including DRAFT and ARCHIVED) for editing/viewing.
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
 * Updates news article content, lifecycle status (Publish/Unpublish), or pinning.
 * Enforces server-side validation with field-level errors (SEC-02).
 */
export async function PUT(request: Request | NextRequest, context: RouteContext) {
  const auth = authorizeRequest(request, ['ADMIN', 'EDITOR']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const { id } = await context.params;
    const rawBody = await request.json().catch(() => ({}));
    const validation = validateNewsUpdateInput(rawBody);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed. Please correct the highlighted errors.',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const updated = updateNews(id, validation.sanitizedData as UpdateNewsInput);
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
