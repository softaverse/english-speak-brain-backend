import { Request, Response, NextFunction } from 'express';
import { translateText } from '@services/openai';
import { ResponseHandler } from '@shared/utils/response';
import { AppError } from '@shared/utils/errors';
import { ErrorCodes } from '@shared/constants/errorCodes';
import { HttpStatus } from '@shared/constants/enums';
import { logger } from '@shared/utils/logger';

/**
 * Controller for handling translation requests
 */
export class TranslationController {
  private static readonly MAX_TEXT_LENGTH = 5000;
  private static readonly DEFAULT_TARGET_LANGUAGE = 'zh-TW';
  private static readonly SUPPORTED_LANGUAGES = [
    'zh-CN',
    'zh-TW',
    'ja',
    'ko',
    'es',
    'fr',
    'de',
  ];

  /**
   * Translate text from English to target language
   * POST /api/practice/translate
   *
   * @body {text: string, targetLanguage?: string}
   */
  public static async translate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { text, targetLanguage = TranslationController.DEFAULT_TARGET_LANGUAGE } = req.body;

      // Validate text
      if (!text || typeof text !== 'string') {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Text is required and must be a string',
          HttpStatus.BAD_REQUEST
        );
      }

      if (text.trim().length === 0) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Text cannot be empty',
          HttpStatus.BAD_REQUEST
        );
      }

      if (text.length > TranslationController.MAX_TEXT_LENGTH) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          `Text is too long. Maximum ${TranslationController.MAX_TEXT_LENGTH} characters allowed.`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Validate target language
      if (typeof targetLanguage !== 'string') {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Target language must be a string',
          HttpStatus.BAD_REQUEST
        );
      }

      if (!TranslationController.SUPPORTED_LANGUAGES.includes(targetLanguage)) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          `Unsupported target language: ${targetLanguage}. Supported languages are: ${TranslationController.SUPPORTED_LANGUAGES.join(', ')}`,
          HttpStatus.BAD_REQUEST
        );
      }

      logger.info('Translating text', {
        textLength: text.length,
        targetLanguage,
      });

      const result = await translateText(text, targetLanguage);

      ResponseHandler.success(res, result, 'Text translated successfully');
    } catch (error) {
      next(error);
    }
  }
}
