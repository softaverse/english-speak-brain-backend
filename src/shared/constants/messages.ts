import { ErrorCodes } from './errorCodes';

export const ErrorMessages: Record<string, string> = {
  // General
  [ErrorCodes.VALIDATION_ERROR]: 'Validation error occurred',
  [ErrorCodes.NOT_FOUND]: 'Resource not found',
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 'Internal server error',
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Too many requests, please try again later',
  [ErrorCodes.UNAUTHORIZED]: 'Authentication required',
  [ErrorCodes.FORBIDDEN]: 'Access forbidden',

  // Practice Module
  [ErrorCodes.AUDIO_FILE_MISSING]: 'Audio file is required',
  [ErrorCodes.AUDIO_FILE_TOO_LARGE]: 'Audio file size exceeds the limit',
  [ErrorCodes.INVALID_AUDIO_FORMAT]: 'Invalid audio format',
  [ErrorCodes.TRANSCRIPTION_FAILED]: 'Failed to transcribe audio',
  [ErrorCodes.ANALYSIS_FAILED]: 'Failed to analyze speech',
  [ErrorCodes.SESSION_NOT_FOUND]: 'Practice session not found',
  [ErrorCodes.SESSION_ALREADY_ENDED]: 'Practice session already ended',

  // Review Module
  [ErrorCodes.NO_REVIEW_AVAILABLE]: 'No review available for today',
  [ErrorCodes.REVIEW_NOT_FOUND]: 'Review not found',
  [ErrorCodes.EXERCISE_NOT_FOUND]: 'Exercise not found',
  [ErrorCodes.ALREADY_SUBMITTED]: 'Exercise already submitted',
  [ErrorCodes.REVIEW_ALREADY_COMPLETED]: 'Review already completed',

  // Analytics Module
  [ErrorCodes.INSUFFICIENT_DATA]: 'Insufficient data for analysis',
  [ErrorCodes.INVALID_DATE_RANGE]: 'Invalid date range',

  // External Services
  [ErrorCodes.OPENAI_API_ERROR]: 'OpenAI API error',
  [ErrorCodes.DATABASE_ERROR]: 'Database error',
  [ErrorCodes.REDIS_ERROR]: 'Redis error',
};

export const SuccessMessages = {
  PRACTICE_ANALYZED: 'Speech analysis completed successfully',
  SESSION_STARTED: 'Practice session started',
  SESSION_ENDED: 'Practice session ended',
  REVIEW_SUBMITTED: 'Exercise submitted successfully',
  REVIEW_COMPLETED: 'Daily review completed',
} as const;
