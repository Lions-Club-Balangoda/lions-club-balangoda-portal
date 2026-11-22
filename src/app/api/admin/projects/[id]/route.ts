import { NextResponse, type NextRequest } from 'next/server.js';
import { authorizeRequest } from '../../../../../lib/auth/session.ts';
import {
  getProjectById,
  updateProject,
  deleteProject,
  type UpdateProjectInput,
} from '../../../../../lib/projects-repository.ts';
import { createSafeErrorResponse } from '../../../../../lib/security/safe-error.ts';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * CMS Admin Route: GET /api/admin/projects/[id]
 */
export async function GET(request: Request | NextRequest, context: RouteContext) {
  const auth = authorizeRequest(request, ['ADMIN', 'EDITOR']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const { id } = await context.params;
    const project = getProjectById(id);

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: project }, { status: 200 });
  } catch (err) {
    return createSafeErrorResponse(err, {
      statusCode: 500,
      fallbackMessage: 'Failed to retrieve project record.',
      trackingPrefix: 'API /api/admin/projects/[id] GET',
    });
  }
}

/**
 * CMS Admin Route: PUT/PATCH /api/admin/projects/[id]
 */
export async function PUT(request: Request | NextRequest, context: RouteContext) {
  const auth = authorizeRequest(request, ['ADMIN', 'EDITOR']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as UpdateProjectInput;

    const updated = updateProject(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Project not found.' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: updated, message: 'Project updated successfully.' },
      { status: 200 }
    );
  } catch (err) {
    return createSafeErrorResponse(err, {
      statusCode: 500,
      fallbackMessage: 'Failed to update project record.',
      trackingPrefix: 'API /api/admin/projects/[id] PUT',
    });
  }
}

export { PUT as PATCH };

/**
 * CMS Admin Route: DELETE /api/admin/projects/[id]
 * Strictly restricted to ADMIN role (FR-06 / SEC-05 role enforcement).
 * EDITORS receive 403 Forbidden.
 */
export async function DELETE(request: Request | NextRequest, context: RouteContext) {
  // Enforce ADMIN role strictly:
  const auth = authorizeRequest(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const { id } = await context.params;
    const deleted = deleteProject(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Project not found or already deleted.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Project permanently deleted.' },
      { status: 200 }
    );
  } catch (err) {
    return createSafeErrorResponse(err, {
      statusCode: 500,
      fallbackMessage: 'Failed to delete project record.',
      trackingPrefix: 'API /api/admin/projects/[id] DELETE',
    });
  }
}
