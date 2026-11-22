/**
 * src/lib/volunteers-validation.ts
 * Server-Side Input Sanitization and Field Validation for Volunteer Intake
 *
 * Story: LBW-51 (AC2: Field-level validation messages; AC3: Input sanitization and length limits)
 * Security Standards: SEC-02 (Input Validation & Sanitization), SEC-01 (Privacy)
 */

import type { VolunteerValidationResult } from '../types/volunteer.ts';

// RFC 5322 compliant email regex
const RFC_5322_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Standard international & local telephone regex
const PHONE_REGEX = /^[+0-9\s\-()]{7,25}$/;

/**
 * Sanitizes strings by stripping potentially harmful HTML tags, script markers, and dangerous characters.
 */
export function sanitizeString(val: string): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Validates and sanitizes a prospective volunteer registration payload.
 */
export function validateVolunteerInput(raw: unknown): VolunteerValidationResult {
  const errors: Record<string, string> = {};

  if (!raw || typeof raw !== 'object') {
    return {
      isValid: false,
      errors: { form: 'Invalid request body. Form data is required.' },
      sanitizedData: {
        fullName: '',
        email: '',
        phoneNumber: '',
        areaOfInterest: '',
        motivationStatement: '',
      },
    };
  }

  const input = raw as Record<string, unknown>;

  // 1. Full Name Validation (AC2, AC3: 2-150 chars)
  const rawName = typeof input.fullName === 'string' ? input.fullName : '';
  const fullName = sanitizeString(rawName);
  if (!fullName) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  } else if (fullName.length > 150) {
    errors.fullName = 'Full name cannot exceed 150 characters.';
  }

  // 2. Email Validation (AC2, AC3: RFC 5322 format, max 255 chars)
  const rawEmail = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const email = sanitizeString(rawEmail);
  if (!email) {
    errors.email = 'Email address is required.';
  } else if (email.length > 255) {
    errors.email = 'Email address cannot exceed 255 characters.';
  } else if (!RFC_5322_EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address (e.g. name@example.com).';
  }

  // 3. Phone Number Validation (AC2, AC3: valid phone characters, 7-50 chars)
  const rawPhone = typeof input.phoneNumber === 'string' ? input.phoneNumber : '';
  const phoneNumber = sanitizeString(rawPhone);
  if (!phoneNumber) {
    errors.phoneNumber = 'Phone number is required.';
  } else if (phoneNumber.length > 50) {
    errors.phoneNumber = 'Phone number cannot exceed 50 characters.';
  } else if (!PHONE_REGEX.test(phoneNumber)) {
    errors.phoneNumber = 'Please enter a valid phone number (e.g. +94 77 123 4567).';
  }

  // 4. Area of Interest Validation (AC2, AC3: non-empty, max 100 chars)
  const rawInterest = typeof input.areaOfInterest === 'string' ? input.areaOfInterest : '';
  const areaOfInterest = sanitizeString(rawInterest);
  if (!areaOfInterest) {
    errors.areaOfInterest = 'Please select your area of service interest.';
  } else if (areaOfInterest.length > 100) {
    errors.areaOfInterest = 'Area of interest cannot exceed 100 characters.';
  }

  // 5. Motivation / Message Statement (Optional, max 2000 chars)
  const rawMotivation =
    typeof input.motivationStatement === 'string' ? input.motivationStatement : '';
  const motivationStatement = sanitizeString(rawMotivation);
  if (motivationStatement.length > 2000) {
    errors.motivationStatement = 'Message statement cannot exceed 2,000 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData: {
      fullName,
      email,
      phoneNumber,
      areaOfInterest,
      motivationStatement,
    },
  };
}
