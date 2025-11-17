import OpenAI from 'openai';
import { openaiConfig } from '../../config/openai';
import { logger } from '../../shared/utils/logger';
import { AppError } from '../../shared/utils/errors';
import { ErrorCodes } from '../../shared/constants/errorCodes';
import { HttpStatus } from '../../shared/constants/enums';

// Validate API key
if (!openaiConfig.apiKey || openaiConfig.apiKey === 'your_openai_api_key_here') {
  throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openaiConfig.apiKey,
  organization: openaiConfig.organization,
  timeout: openaiConfig.timeout,
});

logger.info('OpenAI translation client initialized');

/**
 * Translation response interface
 */
export interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Language code to full name mapping
 */
const LANGUAGE_NAMES: Record<string, string> = {
  'zh-CN': 'Simplified Chinese',
  'zh-TW': 'Traditional Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
};

/**
 * Supported languages for translation
 * Derived from LANGUAGE_NAMES to ensure consistency
 */
export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_NAMES) as Array<keyof typeof LANGUAGE_NAMES>;

/**
 * Translate text from English to target language using OpenAI
 *
 * @param text - The text to translate
 * @param targetLanguage - The target language code (e.g., 'zh-TW', 'zh-CN', 'ja', etc.)
 * @returns Translation result
 *
 * @example
 * ```typescript
 * const result = await translateText(
 *   "Hello, how are you?",
 *   "zh-TW"
 * );
 * ```
 */
export async function translateText(
  text: string,
  targetLanguage: string
): Promise<TranslationResponse> {
  try {
    const targetLanguageName = LANGUAGE_NAMES[targetLanguage];

    if (!targetLanguageName) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        `Unsupported target language: ${targetLanguage}`,
        HttpStatus.BAD_REQUEST
      );
    }

    logger.info('Translating text', {
      textLength: text.length,
      targetLanguage,
    });

    const completion = await openai.chat.completions.create({
      model: openaiConfig.gpt.model,
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the given English text to ${targetLanguageName}. Only provide the translation without any additional explanation or commentary.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      max_completion_tokens: openaiConfig.gpt.maxCompletionTokens,
    });

    const translatedText = completion.choices[0]?.message?.content?.trim() ?? '';

    if (!translatedText) {
      throw new AppError(
        ErrorCodes.OPENAI_API_ERROR,
        'No translation received from OpenAI',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    logger.info('Translation completed successfully', {
      translatedTextLength: translatedText.length,
      model: completion.model,
      usage: completion.usage,
    });

    return {
      translatedText,
      sourceLanguage: 'en',
      targetLanguage,
      model: completion.model,
      usage: {
        promptTokens: completion.usage?.prompt_tokens ?? 0,
        completionTokens: completion.usage?.completion_tokens ?? 0,
        totalTokens: completion.usage?.total_tokens ?? 0,
      },
    };
  } catch (error) {
    logger.error('Error translating text', {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack,
      } : error,
    });

    if (error instanceof AppError) {
      throw error;
    } else if (error instanceof OpenAI.APIError) {
      logger.error('OpenAI API Error details', {
        status: error.status,
        message: error.message,
        type: error.type,
        code: error.code,
      });

      throw new AppError(
        ErrorCodes.OPENAI_API_ERROR,
        `OpenAI API Error: ${error.message}`,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    } else if (error instanceof Error) {
      throw new AppError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        `Failed to translate text: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    } else {
      throw new AppError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'Failed to translate text',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default {
  translateText,
};
