import { Request, Response, NextFunction } from 'express';
import { translateText, SUPPORTED_LANGUAGES } from '@services/openai';
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
  private static readonly SUPPORTED_LANGUAGES_SET = new Set(SUPPORTED_LANGUAGES);
  private static readonly SUPPORTED_LANGUAGES_STRING = SUPPORTED_LANGUAGES.join(', ');

  /**
   * Validates the translation request parameters
   * @param body - The request body containing text and targetLanguage
   * @throws {AppError} If validation fails
   */
  private static validateRequest(body: {
    text?: unknown;
    targetLanguage?: unknown;
  }): asserts body is { text: string; targetLanguage: string } {
    const { text, targetLanguage } = body;

    // Validate text
    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'Text is required and must be a non-empty string',
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

    if (!TranslationController.SUPPORTED_LANGUAGES_SET.has(targetLanguage)) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        `Unsupported target language: ${targetLanguage}. Supported languages are: ${TranslationController.SUPPORTED_LANGUAGES_STRING}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

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
      const bodyForValidation = {
        text: req.body.text,
        targetLanguage:
          req.body.targetLanguage === undefined
            ? TranslationController.DEFAULT_TARGET_LANGUAGE
            : req.body.targetLanguage,
      };

      // Validate request parameters
      TranslationController.validateRequest(bodyForValidation);

      // After validation, TypeScript knows text and targetLanguage are strings
      const { text, targetLanguage } = bodyForValidation;

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
