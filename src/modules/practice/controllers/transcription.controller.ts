import { Request, Response, NextFunction } from 'express';
import {
  transcribeAudio,
  transcribeAudioWithTimestamps,
  isSupportedAudioFormat,
  MAX_AUDIO_FILE_SIZE,
} from '@services/openai';
import { ResponseHandler } from '@shared/utils/response';
import { AppError } from '@shared/utils/errors';
import { ErrorCodes } from '@shared/constants/errorCodes';
import { HttpStatus } from '@shared/constants/enums';
import { logger } from '@shared/utils/logger';

/**
 * Controller for handling audio transcription requests
 */
export class TranscriptionController {
  /**
   * Transcribe uploaded audio file to text
   * POST /api/practice/transcribe
   *
   * @example
   * ```typescript
   * // Using FormData with audio file
   * const formData = new FormData();
   * formData.append('audio', audioFile);
   * formData.append('language', 'en'); // optional
   * formData.append('prompt', 'context text'); // optional
   *
   * fetch('/api/practice/transcribe', {
   *   method: 'POST',
   *   body: formData
   * });
   * ```
   */
  public static async transcribeAudio(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Check if file was uploaded
      if (!req.file) {
        throw new AppError(
          ErrorCodes.AUDIO_FILE_MISSING,
          'No audio file provided',
          HttpStatus.BAD_REQUEST
        );
      }

      const { language, prompt, temperature } = req.body;
      const audioFile = req.file;

      // Validate file format
      if (!isSupportedAudioFormat(audioFile.originalname)) {
        throw new AppError(
          ErrorCodes.INVALID_AUDIO_FORMAT,
          'Unsupported audio format. Supported formats: mp3, mp4, mpeg, mpga, m4a, wav, webm',
          HttpStatus.BAD_REQUEST
        );
      }

      // Validate file size
      if (audioFile.size > MAX_AUDIO_FILE_SIZE) {
        throw new AppError(
          ErrorCodes.AUDIO_FILE_TOO_LARGE,
          `File size exceeds maximum limit of ${MAX_AUDIO_FILE_SIZE / (1024 * 1024)}MB`,
          HttpStatus.BAD_REQUEST
        );
      }

      logger.info('Transcribing audio file', {
        filename: audioFile.originalname,
        size: audioFile.size,
        mimetype: audioFile.mimetype,
      });

      // Transcribe the audio
      const result = await transcribeAudio(audioFile.buffer, {
        language,
        prompt,
        temperature: temperature ? parseFloat(temperature) : undefined,
      });

      ResponseHandler.success(res, result, 'Audio transcribed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Transcribe audio with detailed timestamps
   * POST /api/practice/transcribe/detailed
   *
   * Returns word-level timestamps and segment information
   */
  public static async transcribeWithTimestamps(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError(
          ErrorCodes.AUDIO_FILE_MISSING,
          'No audio file provided',
          HttpStatus.BAD_REQUEST
        );
      }

      const { language, prompt, temperature } = req.body;
      const audioFile = req.file;

      // Validate file format
      if (!isSupportedAudioFormat(audioFile.originalname)) {
        throw new AppError(
          ErrorCodes.INVALID_AUDIO_FORMAT,
          'Unsupported audio format. Supported formats: mp3, mp4, mpeg, mpga, m4a, wav, webm',
          HttpStatus.BAD_REQUEST
        );
      }

      // Validate file size
      if (audioFile.size > MAX_AUDIO_FILE_SIZE) {
        throw new AppError(
          ErrorCodes.AUDIO_FILE_TOO_LARGE,
          `File size exceeds maximum limit of ${MAX_AUDIO_FILE_SIZE / (1024 * 1024)}MB`,
          HttpStatus.BAD_REQUEST
        );
      }

      logger.info('Transcribing audio file with timestamps', {
        filename: audioFile.originalname,
        size: audioFile.size,
      });

      // Transcribe with detailed timestamps
      const result = await transcribeAudioWithTimestamps(audioFile.buffer, {
        language,
        prompt,
        temperature: temperature ? parseFloat(temperature) : undefined,
      });

      ResponseHandler.success(res, result, 'Audio transcribed with timestamps successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get supported audio formats
   * GET /api/practice/transcribe/formats
   */
  public static async getSupportedFormats(
    req: Request,
    res: Response
  ): Promise<void> {
    const formats = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];
    const maxSize = MAX_AUDIO_FILE_SIZE;

    ResponseHandler.success(
      res,
      {
        formats,
        maxFileSize: maxSize,
        maxFileSizeMB: maxSize / (1024 * 1024),
      },
      'Supported formats retrieved successfully'
    );
  }
}
