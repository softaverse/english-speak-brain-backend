import { Request, Response, NextFunction } from 'express';
import {
  generateText,
  generateCompletion,
  analyzeEnglishText,
  correctGrammar,
  generateExercises,
  generateConversationResponse,
  explainGrammarConcept,
  type ChatMessage,
  type TextGenerationOptions,
} from '@services/openai';
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
   * Generate text from messages
   * POST /api/practice/generate/text
   *
   * @body {messages: ChatMessage[], options?: TextGenerationOptions}
   */
  public static async generateText(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { messages, options } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Messages array is required and cannot be empty',
          HttpStatus.BAD_REQUEST
        );
      }

      // Validate message format
      for (const msg of messages) {
        if (!msg.role || !msg.content) {
          throw new AppError(
            ErrorCodes.VALIDATION_ERROR,
            'Each message must have role and content',
            HttpStatus.BAD_REQUEST
          );
        }
      }

      logger.info('Generating text from messages', {
        messageCount: messages.length,
      });

      const result = await generateText(messages, options);

      ResponseHandler.success(res, result, 'Text generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate simple completion
   * POST /api/practice/generate/completion
   *
   * @body {prompt: string, systemPrompt?: string, options?: TextGenerationOptions}
   */
  public static async generateCompletion(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { prompt, systemPrompt, options } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Prompt is required and must be a string',
          HttpStatus.BAD_REQUEST
        );
      }

      logger.info('Generating completion', {
        promptLength: prompt.length,
        hasSystemPrompt: !!systemPrompt,
      });

      const result = await generateCompletion(prompt, systemPrompt, options);

      ResponseHandler.success(res, result, 'Completion generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Analyze English text
   * POST /api/practice/generate/analyze
   *
   * @body {text: string, options?: TextGenerationOptions}
   */
  public static async analyzeText(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { text, options } = req.body;

      if (!text || typeof text !== 'string') {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Text is required and must be a string',
          HttpStatus.BAD_REQUEST
        );
      }

      if (text.length > 5000) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Text is too long. Maximum 5000 characters allowed.',
          HttpStatus.BAD_REQUEST
        );
      }

      logger.info('Analyzing English text', {
        textLength: text.length,
      });

      const result = await analyzeEnglishText(text, options);

      ResponseHandler.success(res, result, 'Text analyzed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Correct grammar
   * POST /api/practice/generate/correct
   *
   * @body {text: string, options?: TextGenerationOptions}
   */
  public static async correctGrammar(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { text, options } = req.body;

      if (!text || typeof text !== 'string') {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Text is required and must be a string',
          HttpStatus.BAD_REQUEST
        );
      }

      logger.info('Correcting grammar', {
        textLength: text.length,
      });

      const result = await correctGrammar(text, options);

      ResponseHandler.success(res, result, 'Grammar corrected successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate exercises
   * POST /api/practice/generate/exercises
   *
   * @body {errorType: string, difficulty?: string, count?: number, options?: TextGenerationOptions}
   */
  public static async generateExercises(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { errorType, difficulty = 'intermediate', count = 5, options } = req.body;

      if (!errorType || typeof errorType !== 'string') {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Error type is required and must be a string',
          HttpStatus.BAD_REQUEST
        );
      }

      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      if (!validDifficulties.includes(difficulty)) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          `Difficulty must be one of: ${validDifficulties.join(', ')}`,
          HttpStatus.BAD_REQUEST
        );
      }

      if (count < 1 || count > 20) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Count must be between 1 and 20',
          HttpStatus.BAD_REQUEST
        );
      }

      logger.info('Generating exercises', {
        errorType,
        difficulty,
        count,
      });

      const result = await generateExercises(errorType, difficulty as any, count, options);

      ResponseHandler.success(res, result, 'Exercises generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate conversation response
   * POST /api/practice/generate/conversation
   *
   * @body {message: string, history?: ChatMessage[], options?: TextGenerationOptions}
   */
  public static async generateConversation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { message, history = [], options } = req.body;

      if (!message || typeof message !== 'string') {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Message is required and must be a string',
          HttpStatus.BAD_REQUEST
        );
      }

      if (!Array.isArray(history)) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'History must be an array',
          HttpStatus.BAD_REQUEST
        );
      }

      logger.info('Generating conversation response', {
        messageLength: message.length,
        historyLength: history.length,
      });

      const result = await generateConversationResponse(message, history, options);

      ResponseHandler.success(res, result, 'Conversation response generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Explain grammar concept
   * POST /api/practice/generate/explain
   *
   * @body {concept: string, level?: string, options?: TextGenerationOptions}
   */
  public static async explainConcept(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { concept, level = 'detailed', options } = req.body;

      if (!concept || typeof concept !== 'string') {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Concept is required and must be a string',
          HttpStatus.BAD_REQUEST
        );
      }

      const validLevels = ['simple', 'detailed', 'advanced'];
      if (!validLevels.includes(level)) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          `Level must be one of: ${validLevels.join(', ')}`,
          HttpStatus.BAD_REQUEST
        );
      }

      logger.info('Explaining grammar concept', {
        concept,
        level,
      });

      const result = await explainGrammarConcept(concept, level as any, options);

      ResponseHandler.success(res, result, 'Concept explained successfully');
    } catch (error) {
      next(error);
    }
  }
}
