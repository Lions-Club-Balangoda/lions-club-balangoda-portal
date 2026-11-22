/**
 * server/middleware/errorHandler.ts
 * Centralised Express error-handling middleware.
 *
 * Place app.use(errorHandler) AFTER all routes in server/index.ts.
 * Never expose internal error details (stack traces, SQL messages) to clients
 * in production — log them server-side only.
 */

import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import crypto from 'node:crypto';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean; // Distinguishes expected errors from programming bugs
}

/**
 * Checks whether an error message contains technical database or SQL fragments.
 */
function containsTechnicalSqlDetails(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('sqlite') ||
    lower.includes('syntax error') ||
    lower.includes('select ') ||
    lower.includes('insert ') ||
    lower.includes('update ') ||
    lower.includes('delete ') ||
    lower.includes('table ') ||
    lower.includes('column ')
  );
}

export const errorHandler: ErrorRequestHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  const statusCode = err.statusCode ?? 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const trackingId = crypto.randomUUID();

  // Always log the full error server-side.
  console.error(`[error] [ErrorID: ${trackingId}] ${err.message}`, isProduction ? '' : err.stack);

  // In production, return generic message if non-operational or if technical SQL leak detected
  let clientMessage = 'An unexpected error occurred. Please try again later.';
  if (err.isOperational && !containsTechnicalSqlDetails(err.message)) {
    clientMessage = isProduction ? 'A service error occurred. Please try again.' : err.message;
  }

  res.setHeader('x-error-tracking-id', trackingId);
  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    trackingId,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
