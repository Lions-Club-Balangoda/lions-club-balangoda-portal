import { NextResponse } from 'next/server';
import { getPublishedProjects } from '../../../lib/projects-repository';

/**
 * Public API Route: GET /api/projects
 * Retrieves all published community service projects.
 * 
 * Security & Acceptance Constraints:
 * 1. Only projects with status = 'PUBLISHED' are returned; drafts and archived items are strictly excluded.
 * 2. Parameterised database queries are enforced via the repository layer.
 * 3. In the event of a database or server failure, returns a friendly error message
 *    with HTTP 500. Under no circumstances is any stack trace, schema detail, or SQL query exposed.
 */
export async function GET() {
  try {
    const projects = getPublishedProjects();

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
    // Internal server log only
    const errorMessage = err instanceof Error ? err.message : 'Unknown server error';
    console.error('[API /api/projects] Failed to load projects:', errorMessage);

    // Secure response: friendly user message, zero sensitive leak
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to load community service projects at this time. Please try again later.',
      },
      {
        status: 500,
      }
    );
  }
}
