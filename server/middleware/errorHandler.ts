/**
 * server/middleware/errorHandler.ts
 * Centralised Express error-handling middleware.
 *
 * Place app.use(errorHandler) AFTER all routes in server/index.ts.
 * Never expose internal error details (stack traces, SQL messages) to clients
 * in production — log them server-side only.
 */

import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean; // Distinguishes expected errors from programming bugs
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

  // Always log the full error server-side.
  console.error(`[error] ${err.message}`, isProduction ? '' : err.stack);

  res.status(statusCode).json({
    success: false,
    message: err.isOperational
      ? err.message
      : 'An unexpected error occurred. Please try again later.',
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

