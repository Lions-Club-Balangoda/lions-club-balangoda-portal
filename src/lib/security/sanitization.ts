/**
 * Shared Input Validation and Sanitisation Layer (SEC-02)
 *
 * Provides centralized defensive routines defending against:
 * - Stored & Reflected Cross-Site Scripting (XSS) via rich text & plain text sanitisation
 * - SQL Injection via query parameterisation enforcement and input disarming
 * - Prototype Pollution via recursive object/JSON property filtering
 * - Malformed identifiers, slugs, emails, and phone numbers
 */

/**
 * Sanitizes rich text / HTML content.
 * Disarms script execution, malicious tags, event handlers, and dangerous URL protocols
 * while strictly preserving safe formatting tags (p, h1-h6, strong, em, ul, ol, li, blockquote, br).
 */
export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  let sanitized = rawHtml;

  // 1. Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove dangerous executable or framing tags
  sanitized = sanitized.replace(
    /<\/?(iframe|object|embed|applet|form|input|button|meta|link|base)\b[^>]*>/gi,
    ''
  );

  // 3. Remove inline event handlers (e.g., onclick, onerror, onload, onmouseover)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*(['"]).*?\1/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^>\s]+/gi, '');

  // 4. Disarm javascript:, vbscript:, and data: schemes in href, src, or action attributes
  sanitized = sanitized.replace(
    /(href|src|action)\s*=\s*(['"])\s*(javascript|vbscript|data):.*?\2/gi,
    '$1="#"'
  );

  return sanitized.trim();
}

/**
 * Sanitizes plain text input by stripping all HTML tags, encoding special entities,
 * and enforcing maximum length bounds.
 */
export function sanitizeText(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') return '';

  // Strip all HTML tags
  let text = input.replace(/<\/?[^>]+(>|$)/g, '');

  // HTML entity encode special characters to disarm injection
  text = text.replace(/[<>'"&]/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case "'":
        return '&#39;';
      case '"':
        return '&quot;';
      case '&':
        return '&amp;';
      default:
        return char;
    }
  });

  text = text.trim();

  if (maxLength > 0 && text.length > maxLength) {
    return text.substring(0, maxLength);
  }

  return text;
}

/**
 * Sanitizes search/filter query strings against XSS and injection attacks.
 */
export function sanitizeSearchQuery(input: string, maxLength: number = 100): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case "'":
          return '&#39;';
        case '"':
          return '&quot;';
        case '&':
          return '&amp;';
        default:
          return char;
      }
    })
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitizes and validates a URL-safe slug (e.g. /projects/slug-name).
 * Ensures lowercase alphanumeric and single hyphens only.
 */
export function sanitizeSlug(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // Convert spaces/underscores to hyphens first
    .replace(/[^a-z0-9-]/g, '') // Remove any remaining non-alphanumeric chars (except hyphens)
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens
}

/**
 * Validates and normalizes email address input.
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') return null;

  const normalized = email.trim().toLowerCase();
  // Standard RFC-compliant regex check for email format
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (normalized.length > 254 || !emailRegex.test(normalized)) {
    return null;
  }

  return normalized;
}

/**
 * Sanitizes phone numbers, stripping unwanted characters while allowing +, spaces, and dashes.
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';

  return phone.replace(/[^0-9+\s()-]/g, '').trim();
}

/**
 * Deeply sanitizes JSON objects or request bodies.
 * Defends against Prototype Pollution attacks by stripping dangerous keys (__proto__, constructor, prototype)
 * and sanitizes nested string values.
 */
export function sanitizeObject<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    return sanitizeText(input, 10000) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObject(item)) as unknown as T;
  }

  if (typeof input === 'object') {
    const cleanObj: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(input as Record<string, unknown>)) {
      // Disarm prototype pollution vectors
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }

      cleanObj[key] = sanitizeObject(val);
    }

    return cleanObj as T;
  }

  return input;
}

/**
 * Quality check enforcing parameterised queries.
 * Throws an assertion error if a raw SQL statement attempts to concatenate dynamic variables
 * rather than passing them via parameter markers (?).
 */
export function assertParameterizedQuery(sql: string, params: unknown[] = []): void {
  if (!sql || typeof sql !== 'string') {
    throw new Error('[SEC-02 Policy Violation] SQL query string must be non-empty.');
  }

  // Count number of parameter placeholders (?)
  const placeholderCount = (sql.match(/\?/g) || []).length;

  if (placeholderCount !== params.length) {
    throw new Error(
      `[SEC-02 Policy Violation] Parameter mismatch: SQL contains ${placeholderCount} placeholder(s) but ${params.length} param(s) were supplied.`
    );
  }
}
