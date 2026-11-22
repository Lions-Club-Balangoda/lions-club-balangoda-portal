import { NextResponse, type NextRequest } from 'next/server.js';
import { authorizeRequest } from '../../../../lib/auth/session.ts';
import {
  getAllProjectsForAdmin,
  createProject,
  type CreateProjectInput,
} from '../../../../lib/projects-repository.ts';
import { createSafeErrorResponse } from '../../../../lib/security/safe-error.ts';

/**
 * CMS Admin Route: GET /api/admin/projects
 * Lists all projects (including DRAFT and ARCHIVED) for authenticated officers.
 */
export async function GET(request: Request | NextRequest) {
  const auth = authorizeRequest(request, ['ADMIN', 'EDITOR']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    let query = '';
    let category = 'ALL';
    let status = 'ALL';

    if (request && 'url' in request && request.url) {
      const url = new URL(request.url);
      query = url.searchParams.get('q') || url.searchParams.get('query') || '';
      category = url.searchParams.get('category') || 'ALL';
      status = url.searchParams.get('status') || 'ALL';
    }

    const projects = getAllProjectsForAdmin({ query, category, status });
    return NextResponse.json(
      {
        success: true,
        data: projects,
        count: projects.length,
      },
      { status: 200 }
    );
  } catch (err) {
    return createSafeErrorResponse(err, {
      statusCode: 500,
      fallbackMessage: 'Failed to retrieve administrative project records.',
      trackingPrefix: 'API /api/admin/projects GET',
    });
  }
}

/**
 * CMS Admin Route: POST /api/admin/projects
 * Creates a new project in the CMS. Requires ADMIN or EDITOR role.
 */
export async function POST(request: Request | NextRequest) {
  const auth = authorizeRequest(request, ['ADMIN', 'EDITOR']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Partial<CreateProjectInput>;

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Project title is required.' },
        { status: 400 }
      );
    }

    const created = createProject(body as CreateProjectInput, auth.user!.userId);

    return NextResponse.json(
      {
        success: true,
        data: created,
        message: 'Project created successfully.',
      },
      { status: 201 }
    );
  } catch (err) {
    return createSafeErrorResponse(err, {
      statusCode: 500,
      fallbackMessage: 'Failed to create project record.',
      trackingPrefix: 'API /api/admin/projects POST',
    });
  }
}
