import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/utils/errors';
import { ResponseHandler } from '@shared/utils/response';
import { logger } from '@shared/utils/logger';
import { HttpStatus } from '@shared/constants/enums';
import { ErrorCodes } from '@shared/constants/errorCodes';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known AppError
  if (err instanceof AppError) {
    return ResponseHandler.error(res, err.code, err.message, err.statusCode, err.details);
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return ResponseHandler.error(
      res,
      ErrorCodes.VALIDATION_ERROR,
      'Validation failed',
      HttpStatus.BAD_REQUEST,
      err.errors
    );
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return ResponseHandler.error(
      res,
      ErrorCodes.DATABASE_ERROR,
      'Database error',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  // Handle unknown errors
  return ResponseHandler.error(
    res,
    ErrorCodes.INTERNAL_SERVER_ERROR,
    'An unexpected error occurred',
    HttpStatus.INTERNAL_SERVER_ERROR
  );
};

// Async error wrapper
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return Promise.resolve(fn(req, res, next)).catch(next) as Promise<void>;
  };
