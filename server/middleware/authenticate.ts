/**
 * server/middleware/authenticate.ts
 * JWT / session authentication middleware placeholder.
 *
 * Verifies the token from the Authorization header or cookie,
 * attaches the decoded user to req.user, and passes control to next().
 * Rejects with 401 if the token is missing or invalid.
 *
 * Implementation depends on the auth library chosen (NextAuth / jose / jsonwebtoken).
 */

import type { Request, Response, NextFunction } from 'express';

// Extend the Express Request type to include the authenticated user.
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: 'ADMIN' | 'EDITOR';
      };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  // TODO: implement JWT / session verification here.
  // Example with jsonwebtoken:
  //
  // const token = req.headers.authorization?.split(' ')[1] ?? req.cookies?.token;
  // if (!token) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
  // try {
  //   const payload = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
  //   req.user = payload as Express.Request['user'];
  //   next();
  // } catch {
  //   res.status(401).json({ success: false, message: 'Invalid or expired token' });
  // }

  next(); // Placeholder — remove once JWT verification is implemented
}

export function requireRole(role: 'ADMIN' | 'EDITOR') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    if (role === 'ADMIN' && req.user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
      return;
    }
    next();
  };
}

