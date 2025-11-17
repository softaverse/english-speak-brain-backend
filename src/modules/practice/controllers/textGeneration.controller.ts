import { Request, Response, NextFunction } from 'express';
import { talkWithSpecificTopic, generateText, generateResponseSuggestions } from '@services/openai';
import { ResponseHandler } from '@shared/utils/response';
import { AppError } from '@shared/utils/errors';
import { ErrorCodes } from '@shared/constants/errorCodes';
import { HttpStatus } from '@shared/constants/enums';
import { logger } from '@shared/utils/logger';

/**
 * Controller for handling text generation requests
 */
export class TextGenerationController {
  private static readonly MAX_TOPIC_LENGTH = 1000;
  private static readonly MAX_INITIAL_MESSAGE_LENGTH = 2000;
  private static readonly MAX_PROMPT_LENGTH = 5000;
  private static readonly MAX_CONVERSATION_HISTORY_LENGTH = 10000;

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

      if (topic.length > TextGenerationController.MAX_TOPIC_LENGTH) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          `Topic is too long. Maximum ${TextGenerationController.MAX_TOPIC_LENGTH} characters allowed.`,
          HttpStatus.BAD_REQUEST
        );
      }

      if (initial_message.length > TextGenerationController.MAX_INITIAL_MESSAGE_LENGTH) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          `Initial message is too long. Maximum ${TextGenerationController.MAX_INITIAL_MESSAGE_LENGTH} characters allowed.`,
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

  /**
   * Generate text using OpenAI Responses API
   * POST /api/practice/generate/text
   *
   * @body {prompt: string, options?: {store?: boolean, include?: string[]}}
   */
  public static async generateText(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { prompt, options } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Prompt is required and must be a string',
          HttpStatus.BAD_REQUEST
        );
      }

      if (prompt.length > TextGenerationController.MAX_PROMPT_LENGTH) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          `Prompt is too long. Maximum ${TextGenerationController.MAX_PROMPT_LENGTH} characters allowed.`,
          HttpStatus.BAD_REQUEST
        );
      }

      logger.info('Generating text', {
        promptLength: prompt.length,
      });

      const result = await generateText(prompt, options);

      ResponseHandler.success(res, result, 'Text generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate response suggestions for conversation
   * POST /api/practice/generate/suggestions
   *
   * @body {topic: string, conversationHistory: string, options?: {store?: boolean, include?: string[]}}
   */
  public static async generateSuggestions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { topic, conversationHistory, options } = req.body;

      if (!topic || typeof topic !== 'string') {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Topic is required and must be a string',
          HttpStatus.BAD_REQUEST
        );
      }

      if (!conversationHistory || typeof conversationHistory !== 'string') {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Conversation history is required and must be a string',
          HttpStatus.BAD_REQUEST
        );
      }

      if (topic.length > TextGenerationController.MAX_TOPIC_LENGTH) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          `Topic is too long. Maximum ${TextGenerationController.MAX_TOPIC_LENGTH} characters allowed.`,
          HttpStatus.BAD_REQUEST
        );
      }

      if (conversationHistory.length > TextGenerationController.MAX_CONVERSATION_HISTORY_LENGTH) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          `Conversation history is too long. Maximum ${TextGenerationController.MAX_CONVERSATION_HISTORY_LENGTH} characters allowed.`,
          HttpStatus.BAD_REQUEST
        );
      }

      logger.info('Generating response suggestions', {
        topicLength: topic.length,
        historyLength: conversationHistory.length,
      });

      const result = await generateResponseSuggestions(topic, conversationHistory, options);

      ResponseHandler.success(res, result, 'Response suggestions generated successfully');
    } catch (error) {
      next(error);
    }
  }
}
