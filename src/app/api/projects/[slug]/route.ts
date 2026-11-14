import { NextResponse, type NextRequest } from 'next/server.js';
import { getPublishedProjectBySlug } from '../../../../lib/projects-repository.ts';
import { createSafeErrorResponse } from '../../../../lib/security/safe-error.ts';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * Public API Route: GET /api/projects/[slug]
 * Retrieves a single published community service project by slug.
 *
 * Security & Acceptance Constraints:
 * 1. Only projects with status = 'PUBLISHED' are returned.
 * 2. Unknown, draft, or archived slugs return HTTP 404 with a friendly error response.
 * 3. Rich text descriptions are safely sanitized.
 * 4. Includes associated gallery photos and impact metrics where present.
 */
export async function GET(_request: Request | NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    if (!slug || !slug.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project slug is required.',
        },
        { status: 400 }
      );
    }

    const project = getPublishedProjectBySlug(slug.trim());

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Project not found. The requested initiative may have been moved, unpublished, or does not exist.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: project,
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
      fallbackMessage: 'Unable to load project details at this time. Please try again later.',
      trackingPrefix: 'API /api/projects/[slug]',
    });
  }
}
