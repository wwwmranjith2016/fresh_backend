import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 401);
  }

  if (err.code === 'P2002') {
    return sendError(res, 'A record with this value already exists', 409);
  }

  if (err.code === 'P2025') {
    return sendError(res, 'Record not found', 404);
  }

  return sendError(res, err.message || 'Internal server error', err.statusCode || 500);
};

export const notFoundHandler = (req: Request, res: Response) => {
  return sendError(res, 'Route not found', 404);
};
