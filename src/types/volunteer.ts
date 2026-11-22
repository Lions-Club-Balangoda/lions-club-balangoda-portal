/**
 * src/types/volunteer.ts
 * Volunteer Intake Types and Service Pillar Areas
 *
 * Story: LBW-51 (Prospective volunteer registration public form)
 * Security Standard: SEC-01 (Privacy & Data Protection), SEC-02 (Input Sanitization)
 * Course: IS5109 Community Project (Group 14)
 */

export type VolunteerStatus = 'New' | 'Reviewed' | 'Interviewed' | 'Accepted' | 'Rejected';

export const VOLUNTEER_STATUSES: readonly VolunteerStatus[] = [
  'New',
  'Reviewed',
  'Interviewed',
  'Accepted',
  'Rejected',
] as const;

export const VOLUNTEER_AREAS_OF_INTEREST = [
  'Vision Care & Healthcare',
  'Youth Education & Literacy',
  'Environmental Stewardship',
  'Hunger & Poverty Relief',
  'Community Development & Other',
] as const;

export type VolunteerAreaOfInterest = (typeof VOLUNTEER_AREAS_OF_INTEREST)[number] | string;

export interface VolunteerRegistrationInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  areaOfInterest: VolunteerAreaOfInterest;
  motivationStatement?: string;
}

export interface VolunteerApplicationRecord {
  applicationId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  areaOfInterest: string;
  motivationStatement: string | null;
  status: VolunteerStatus;
  submittedAt: string;
  updatedAt: string;
}

export interface VolunteerValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: VolunteerRegistrationInput;
}
