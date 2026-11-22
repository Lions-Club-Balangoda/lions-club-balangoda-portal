/**
 * src/app/api/admin/projects/[id]/route.ts
 * Protected Project Item Management Endpoint
 *
 * Story: LBW-39 (AC1, AC3: Only Administrator can delete content; Editor can edit/publish)
 * Security Standard: SEC-02, SEC-04
 */

import { NextResponse } from 'next/server';
import { requirePermission, requireAuth } from '../../../../../lib/auth/guards.ts';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAuth(request);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { id } = await context.params;

  return NextResponse.json({
    success: true,
    data: {
      projectId: id,
      title: 'Community Eye Clinic 2026',
      status: 'PUBLISHED',
      category: 'Healthcare',
    },
  });
}

export async function PUT(request: Request, context: RouteContext) {
  // AC1: Both ADMIN and EDITOR can update content
  const auth = await requirePermission(request, 'PROJECTS', 'UPDATE');
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    success: true,
    message: `Project ${id} updated successfully.`,
    data: { projectId: id, ...body },
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  // AC1, AC3: ONLY Administrator can delete content! Editor receives 403 Forbidden.
  const auth = await requirePermission(request, 'PROJECTS', 'DELETE');
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { id } = await context.params;

  return NextResponse.json({
    success: true,
    message: `Project ${id} permanently deleted.`,
  });
}
