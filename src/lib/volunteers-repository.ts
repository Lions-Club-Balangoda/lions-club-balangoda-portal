/**
 * src/lib/volunteers-repository.ts
 * Volunteer Intake Database & Repository Layer
 *
 * Story: LBW-51 (Prospective volunteer registration public form)
 * Acceptance Criteria:
 *   - AC1: Valid submissions stored with timestamp and status "New"
 *   - AC4: Duplicate rapid re-submissions (same email within short window) handled with friendly message
 *   - AC6: Personal data readable only by authorized administrators via CMS
 *
 * Security Standard: SEC-01 (Data Privacy), SEC-02 (Parameterised Queries)
 */

import { getDatabase } from './db.ts';
import type {
  VolunteerRegistrationInput,
  VolunteerApplicationRecord,
  VolunteerStatus,
} from '../types/volunteer.ts';

// 5-minute rapid submission window (AC4)
export const RAPID_SUBMISSION_WINDOW_SECONDS = 300;

export interface SaveVolunteerResult {
  success: boolean;
  isDuplicate: boolean;
  applicationId?: string;
  message: string;
}

/**
 * Checks if a duplicate submission exists for this email within the rate-limit window.
 */
export function isRapidDuplicateSubmission(
  email: string,
  windowSeconds = RAPID_SUBMISSION_WINDOW_SECONDS
): boolean {
  const db = getDatabase();
  const normalizedEmail = email.trim().toLowerCase();
  const cutoffTime = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const row = db
    .prepare(
      `
    SELECT application_id, submitted_at
    FROM volunteer_applications
    WHERE LOWER(email) = ? AND submitted_at >= ?
    ORDER BY submitted_at DESC
    LIMIT 1
  `
    )
    .get(normalizedEmail, cutoffTime) as { application_id: string } | undefined;

  return !!row;
}

/**
 * Stores a prospective volunteer registration in the database.
 * Enforces default status "New" (AC1) and prevents rapid duplicates (AC4).
 */
export async function saveVolunteerApplication(
  input: VolunteerRegistrationInput
): Promise<SaveVolunteerResult> {
  const normalizedEmail = input.email.trim().toLowerCase();

  // 1. Check for rapid duplicate submission (AC4)
  if (isRapidDuplicateSubmission(normalizedEmail)) {
    return {
      success: false,
      isDuplicate: true,
      message:
        'You have already submitted a volunteer application recently. Our club committee will review your submission and contact you shortly.',
    };
  }

  const applicationId = `vol_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const submittedAt = new Date().toISOString();
  const defaultStatus: VolunteerStatus = 'New';

  // 2. Persist locally to SQLite database
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO volunteer_applications (
      application_id, full_name, email, phone_number,
      area_of_interest, motivation_statement, status, submitted_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    applicationId,
    input.fullName.trim(),
    normalizedEmail,
    input.phoneNumber.trim(),
    input.areaOfInterest,
    input.motivationStatement ? input.motivationStatement.trim() : null,
    defaultStatus,
    submittedAt,
    submittedAt
  );

  // 3. Attempt async sync to Supabase if credentials are active
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/volunteer_applications`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          application_id: undefined, // Let Supabase generate or map
          full_name: input.fullName.trim(),
          email: normalizedEmail,
          phone_number: input.phoneNumber.trim(),
          area_of_interest: input.areaOfInterest,
          motivation_statement: input.motivationStatement ? input.motivationStatement.trim() : null,
          status: defaultStatus,
        }),
      });
    } catch {
      // Local persistence guaranteed; background sync failure does not break user experience
    }
  }

  return {
    success: true,
    isDuplicate: false,
    applicationId,
    message:
      'Thank you for volunteering with Lions Club of Balangoda! Your registration has been received successfully. Our team will review your application and reach out to you shortly.',
  };
}

/**
 * Retrieves volunteer applications. Strictly restricted to CMS Administrator (AC6).
 */
export function getVolunteerApplications(limit = 50, offset = 0): VolunteerApplicationRecord[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      `
    SELECT
      application_id AS applicationId,
      full_name AS fullName,
      email,
      phone_number AS phoneNumber,
      area_of_interest AS areaOfInterest,
      motivation_statement AS motivationStatement,
      status,
      submitted_at AS submittedAt,
      updated_at AS updatedAt
    FROM volunteer_applications
    ORDER BY submitted_at DESC
    LIMIT ? OFFSET ?
  `
    )
    .all(limit, offset) as VolunteerApplicationRecord[];

  return rows;
}
