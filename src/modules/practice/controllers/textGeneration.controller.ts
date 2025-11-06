import { Request, Response, NextFunction } from 'express';
import { talkWithSpecificTopic } from '@services/openai';
import { ResponseHandler } from '@shared/utils/response';
import { AppError } from '@shared/utils/errors';
import { ErrorCodes } from '@shared/constants/errorCodes';
import { HttpStatus } from '@shared/constants/enums';
import { logger } from '@shared/utils/logger';

/**
 * Controller for handling text generation requests
 */
export class TextGenerationController {
  /**
   * Talk with specific topic using reusable OpenAI prompt
   * POST /api/practice/generate/talk-with-topic
   *
   * @body {topic: string, initial_message: string, options?: {store?: boolean, include?: string[]}}
   */
  public static async talkWithSpecificTopic(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { topic, initial_message, options } = req.body;

      if (!topic || typeof topic !== 'string') {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Topic is required and must be a string',
          HttpStatus.BAD_REQUEST
        );
      }

      if (!initial_message || typeof initial_message !== 'string') {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Initial message is required and must be a string',
          HttpStatus.BAD_REQUEST
        );
      }

      if (topic.length > 1000) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Topic is too long. Maximum 1000 characters allowed.',
          HttpStatus.BAD_REQUEST
        );
      }

      if (initial_message.length > 2000) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Initial message is too long. Maximum 2000 characters allowed.',
          HttpStatus.BAD_REQUEST
        );
      }

      logger.info('Generating conversation with specific topic', {
        topicLength: topic.length,
        initialMessageLength: initial_message.length,
      });

      const result = await talkWithSpecificTopic(topic, initial_message, options);

      ResponseHandler.success(res, result, 'Topic conversation generated successfully');
    } catch (error) {
      next(error);
    }
  }
}
