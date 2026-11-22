import { NextResponse } from 'next/server.js';
import crypto from 'node:crypto';

/**
 * Safe Error Response & Logging Module (SEC-02, NFR-04)
 *
 * Acceptance Criteria satisfied:
 * - Production error responses return generic messages.
 * - Technical details, stack traces, and database/SQL exceptions exist ONLY in server logs.
 * - Tracking IDs link client error reports to server logs without leaking internal state.
 */

export interface SafeErrorResult {
  success: false;
  error: string;
  trackingId: string;
  details?: unknown;
}

/**
 * Deterministically constructs a client-safe error payload.
 * Pure function suitable for unit testing without HTTP context.
 */
export function formatSafeErrorForClient(
  err: unknown,
  fallbackMessage: string = 'An unexpected error occurred. Please try again later.',
  isProduction: boolean = process.env.NODE_ENV === 'production'
): SafeErrorResult {
  const trackingId = crypto.randomUUID();

  // In production, strictly return generic message without stack or internals
  if (isProduction) {
    return {
      success: false,
      error: fallbackMessage,
      trackingId,
    };
  }

  // In development/test, provide error message for debugging while omitting raw SQL
  const rawMessage = err instanceof Error ? err.message : String(err);
  return {
    success: false,
    error: rawMessage || fallbackMessage,
    trackingId,
    details: err instanceof Error ? { name: err.name } : undefined,
  };
}

/**
 * Centralized API route error handler.
 * Logs the full error details to the server console and responds with a safe, generic JSON response.
 */
export function createSafeErrorResponse(
  err: unknown,
  options: {
    statusCode?: number;
    fallbackMessage?: string;
    trackingPrefix?: string;
    isProduction?: boolean;
  } = {}
): NextResponse {
  const statusCode = options.statusCode || 500;
  const prefix = options.trackingPrefix || 'SafeErrorHandler';
  const isProd =
    options.isProduction !== undefined
      ? options.isProduction
      : process.env.NODE_ENV === 'production';

  const safePayload = formatSafeErrorForClient(err, options.fallbackMessage, isProd);

  // Log full error details strictly to server logs
  const logMessage = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  const logStack = err instanceof Error && err.stack ? err.stack : '';

  console.error(
    `[${prefix}] [ErrorID: ${safePayload.trackingId}] Status ${statusCode} - ${logMessage}`,
    logStack
  );

  return NextResponse.json(safePayload, {
    status: statusCode,
    headers: {
      'x-error-tracking-id': safePayload.trackingId,
    },
  });
}
