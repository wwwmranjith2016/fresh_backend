import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt.util';
import { sendError } from '../utils/response.util';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401);
    }

    const token = authHeader.substring(7);

    const payload = verifyAccessToken(token);

    req.user = payload;

    next();
  } catch (error: any) {
    return sendError(res, 'Invalid or expired token', 401);
  }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return sendError(res, 'Unauthorized: Admin access required', 403);
  }
  next();
};
