import rateLimit from 'express-rate-limit';
import { env } from '@config/environment';
import { ResponseHandler } from '@shared/utils/response';
import { ErrorCodes } from '@shared/constants/errorCodes';
import { HttpStatus } from '@shared/constants/enums';
import { Request, Response } from 'express';

// Global rate limiter
export const globalRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    ResponseHandler.error(
      res,
      ErrorCodes.RATE_LIMIT_EXCEEDED,
      'Too many requests, please try again later',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
});

// File upload rate limiter (stricter)
export const fileUploadRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    ResponseHandler.error(
      res,
      ErrorCodes.RATE_LIMIT_EXCEEDED,
      'Too many file uploads, please slow down',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
});

// AI analysis rate limiter (very strict)
export const aiAnalysisRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    ResponseHandler.error(
      res,
      ErrorCodes.RATE_LIMIT_EXCEEDED,
      'Too many analysis requests, please wait a moment',
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
});
