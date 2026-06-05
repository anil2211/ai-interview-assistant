import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { IJwtPayload, IAuthRequest } from '../types';
import { ERROR_CODES, HTTP_STATUS } from '../utils/constants';
import { sendError } from '../utils/helpers';

function extractToken(req: IAuthRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}

function verifyToken(token: string): IJwtPayload {
  return jwt.verify(token, config.jwtSecret) as IJwtPayload;
}

export function authenticate(req: IAuthRequest, res: Response, next: NextFunction): void {
  try {
    const token = extractToken(req);

    if (!token) {
      sendError(res, 'Authentication required. Please provide a valid token.', ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const decoded = verifyToken(token);

    if (!decoded.userId || !decoded.role) {
      sendError(res, 'Invalid token payload.', ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      sendError(res, 'Token has expired. Please refresh your token.', ERROR_CODES.TOKEN_EXPIRED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }
    if (error.name === 'JsonWebTokenError') {
      sendError(res, 'Invalid token.', ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }
    sendError(res, 'Authentication failed.', ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }
}

export function optionalAuth(req: IAuthRequest, _res: Response, next: NextFunction): void {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = verifyToken(token);
      if (decoded.userId && decoded.role) {
        req.user = {
          userId: decoded.userId,
          role: decoded.role,
        };
      }
    }
  } catch {
    // Token invalid or expired - continue without user
  }

  next();
}

export function requireRole(...roles: string[]) {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(
        res,
        'You do not have permission to access this resource.',
        ERROR_CODES.FORBIDDEN,
        HTTP_STATUS.FORBIDDEN
      );
      return;
    }

    next();
  };
}

export function adminOnly(req: IAuthRequest, res: Response, next: NextFunction): void {
  requireRole('admin')(req, res, next);
}
