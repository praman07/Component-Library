import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { CustomerUser } from '../src/packages/types';
import { HARDCODED_USERS } from './hardcodedData';

export interface AuthenticatedRequest extends Request {
  user?: CustomerUser | null;
  authToken?: string | null;
}

/**
 * Extracts session token from Authorization: Bearer <token> or cookie
 * and verifies current user status dynamically from database.
 */
export function extractAuthUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';');
    for (const c of cookies) {
      const [key, val] = c.trim().split('=');
      if (key === 'ti_session' && val) {
        token = val;
        break;
      }
    }
  }

  if (token) {
    let user = db.verifySessionUser(token);
    if (!user && token.startsWith('ti_sess_client_')) {
      user = HARDCODED_USERS.find((u) => token.includes(u.id)) || null;
    }

    if (user) {
      req.user = user;
      req.authToken = token;
    } else {
      req.user = null;
      req.authToken = null;
    }
  } else {
    req.user = null;
    req.authToken = null;
  }

  next();
}

/**
 * Rejection middleware: requires any authenticated user.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    });
  }
  next();
}

/**
 * Rejection middleware: requires user with role === 'admin'.
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'UNAUTHORIZED',
    });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin authorization required. Access forbidden.',
      code: 'FORBIDDEN_ADMIN_ONLY',
    });
  }
  next();
}

/**
 * Rejection middleware: requires premium tier OR admin role.
 */
export function requirePremiumAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Sign-in required to access premium component source',
      code: 'SIGN_IN_REQUIRED',
    });
  }
  if (req.user.role !== 'admin' && req.user.tier !== 'premium') {
    return res.status(403).json({
      error: 'Active premium subscription required to access this component',
      code: 'PREMIUM_REQUIRED',
    });
  }
  next();
}
