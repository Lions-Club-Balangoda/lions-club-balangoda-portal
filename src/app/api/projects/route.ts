import { NextResponse, type NextRequest } from 'next/server';
import { searchPublishedProjects } from '../../../lib/projects-repository';
import { createSafeErrorResponse } from '../../../lib/security/safe-error';

/**
 * Public API Route: GET /api/projects
 * Retrieves published community service projects with optional keyword search and category/year filters.
 *
 * Security & Acceptance Constraints:
 * 1. Visitors can search published projects by keyword across title and summary via `?q=` or `?query=`.
 * 2. Search works together with category (`?category=`) and year (`?year=`) query parameters.
 * 3. Only projects with status = 'PUBLISHED' are returned; drafts and archived items are strictly excluded.
 * 4. Input is sanitized and parameterised database queries are enforced via the repository layer.
 * 5. In the event of a database or server failure, returns a friendly error message
 *    with HTTP 500 without leaking stack traces or SQL schemas.
 */
export async function GET(request?: Request | NextRequest) {
  try {
    let query = '';
    let category = 'ALL';
    let year = 'ALL';

    if (request && request.url) {
      const url = new URL(request.url);
      query = url.searchParams.get('q') || url.searchParams.get('query') || '';
      category = url.searchParams.get('category') || 'ALL';
      year = url.searchParams.get('year') || 'ALL';
    }

    const projects = searchPublishedProjects({ query, category, year });

    return NextResponse.json(
      {
        success: true,
        data: projects,
        count: projects.length,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (err: unknown) {
    return createSafeErrorResponse(err, {
      statusCode: 500,
      fallbackMessage:
        'Unable to load community service projects at this time. Please try again later.',
      trackingPrefix: 'API /api/projects',
    });
  }
}
