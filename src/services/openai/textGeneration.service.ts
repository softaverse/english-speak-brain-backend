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

logger.info('OpenAI text generation client initialized');

/**
 * Text generation options for talkWithSpecificTopic
 */
export interface TextGenerationOptions {
  store?: boolean;
  include?: Array<string>;
}

/**
 * Text generation response from Responses API
 */
export interface TextGenerationResponse {
  text: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cachedTokens?: number;
    reasoningTokens?: number;
  };
  status: string;
  id: string;
  createdAt: number;
  output: Array<any>;
}

/**
 * Talk with specific topic using reusable OpenAI prompt
 * This function uses OpenAI's reusable prompt feature to generate conversation responses
 *
 * @param topic - The conversation topic/scenario
 * @param initial_message - The initial message in the conversation
 * @param options - Optional generation settings (store, include, etc.)
 * @returns Generated conversation response
 *
 * @example
 * ```typescript
 * const result = await talkWithSpecificTopic(
 *   "You are attending a job interview...",
 *   "Tell me about yourself"
 * );
 * ```
 */
export async function talkWithSpecificTopic(
  topic: string,
  initial_message: string,
  options: TextGenerationOptions = {}
): Promise<TextGenerationResponse> {
  try {
    const {
      store = true,
      include,
    } = options;

    logger.info('Generating response with specific topic using reusable prompt', {
      topic: topic.substring(0, 50) + '...',
      initial_message: initial_message.substring(0, 50) + '...',
      store,
    });

    // Build request parameters
    const requestParams: any = {
      prompt: {
        id: openaiConfig.prompts.talkWithSpecificTopic.id,
        version: openaiConfig.prompts.talkWithSpecificTopic.version,
        variables: {
          topic: topic,
          initial_message: initial_message
        }
      },
      input: [],
      reasoning: {},
      store,
    };

    // Add include only if provided
    if (include && include.length > 0) {
      requestParams.include = include;
    }

    // Call OpenAI Responses API with reusable prompt
    const response = await openai.responses.create(requestParams);

    console.log("response: ", response);

    logger.info('Topic conversation generated successfully', {
      id: response.id,
      model: response.model,
      status: response.status,
      usage: response.usage,
    });

    // Extract text from output
    let extractedText = '';
    if (response.output && Array.isArray(response.output) && response.output.length > 0) {
      // Find the first message with output_text
      for (const item of response.output) {
        if (item.type === 'message' && item.content && Array.isArray(item.content)) {
          for (const contentItem of item.content) {
            if (contentItem.type === 'output_text' && contentItem.text) {
              extractedText = contentItem.text;
              break;
            }
          }
        }
        if (extractedText) break;
      }
    }
    console.log("extractedText: ", extractedText);

    return {
      text: extractedText,
      model: response.model,
      usage: {
        promptTokens: response.usage?.input_tokens || 0,
        completionTokens: response.usage?.output_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
        cachedTokens: response.usage?.input_tokens_details?.cached_tokens || 0,
        reasoningTokens: response.usage?.output_tokens_details?.reasoning_tokens || 0,
      },
      status: response.status || 'completed',
      id: response.id,
      createdAt: response.created_at,
      output: response.output,
    };
  } catch (error) {
    logger.error('Error generating topic conversation', {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack,
      } : error,
    });

    if (error instanceof OpenAI.APIError) {
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
    }

    if (error instanceof Error) {
      throw new AppError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        `Failed to generate topic conversation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    throw new AppError(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to generate topic conversation',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export default {
  talkWithSpecificTopic,
};
