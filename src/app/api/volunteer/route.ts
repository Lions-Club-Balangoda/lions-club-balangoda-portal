/**
 * src/app/api/volunteer/route.ts
 * Prospective Volunteer Registration API Endpoint
 *
 * Story: LBW-51 (Prospective volunteer registration public form)
 * Acceptance Criteria:
 *   - AC1: Stores valid submissions with timestamp and status "New"
 *   - AC2: Field-level validation rejection (400)
 *   - AC3: Sanitization and length limits enforced
 *   - AC4: Duplicate rapid submissions handled with friendly message (429)
 *   - AC5: Clear success message returned on valid submission (201)
 *   - AC6: Public GET blocked; personal data private (SEC-01)
 */

import { NextResponse } from 'next/server.js';
import { validateVolunteerInput } from '../../../lib/volunteers-validation.ts';
import { saveVolunteerApplication } from '../../../lib/volunteers-repository.ts';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    // 1. Validate & Sanitize Input (AC2, AC3)
    const validation = validateVolunteerInput(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'ValidationError',
          message: 'Please review and correct the errors below.',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // 2. Persist Application & Check Rapid Duplicates (AC1, AC4)
    const result = await saveVolunteerApplication(validation.sanitizedData);

    if (result.isDuplicate) {
      return NextResponse.json(
        {
          success: false,
          duplicate: true,
          error: 'DuplicateSubmission',
          message: result.message,
        },
        { status: 429 }
      );
    }

    // 3. Success Response (AC1, AC5)
    return NextResponse.json(
      {
        success: true,
        message: result.message,
        applicationId: result.applicationId,
      },
      { status: 201 }
    );
  } catch {
    // AC5: Zero stack traces leaked
    return NextResponse.json(
      {
        success: false,
        error: 'InternalServerError',
        message: 'An unexpected error occurred while saving your application. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * Public GET is blocked to protect applicant privacy (AC6, SEC-01).
 * Personal volunteer data is strictly readable by authorized administrators via CMS.
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Unauthorized',
      message:
        'Volunteer applicant submissions contain confidential personal data and are accessible only to authorized club officers via the CMS portal.',
    },
    { status: 405 }
  );
}
