import { ErrorCode, ErrorCodes } from '@shared/constants/errorCodes';
import { ErrorMessages } from '@shared/constants/messages';
import { HttpStatus } from '@shared/constants/enums';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    code: ErrorCode,
    message?: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
    details?: unknown
  ) {
    super(message || ErrorMessages[code] || 'An error occurred');

    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(ErrorCodes.VALIDATION_ERROR, message, HttpStatus.BAD_REQUEST, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(ErrorCodes.NOT_FOUND, message, HttpStatus.NOT_FOUND);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(ErrorCodes.UNAUTHORIZED, message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(ErrorCodes.FORBIDDEN, message, HttpStatus.FORBIDDEN);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(ErrorCodes.VALIDATION_ERROR, message, HttpStatus.CONFLICT);
  }
}

export class InternalServerError extends AppError {
  constructor(message?: string, details?: unknown) {
    super(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      message || 'Internal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
      details
    );
  }
}
