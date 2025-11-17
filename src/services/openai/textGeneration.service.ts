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
 * Request parameters for OpenAI Responses API with reusable prompt
 */
interface ResponsesAPIPromptRequestParams {
  prompt: {
    id: string;
    version: string;
    variables: Record<string, string>;
  };
  input: Array<any>;
  reasoning: Record<string, any>;
  store: boolean;
  include?: Array<string>;
}

/**
 * Request parameters for OpenAI Responses API with direct input
 */
interface ResponsesAPIInputRequestParams {
  model: string;
  input: string;
  store: boolean;
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
 * Helper function to extract text from OpenAI Responses API output
 * Uses declarative array methods for cleaner, more maintainable code
 *
 * @param output - The output array from OpenAI Responses API
 * @returns Extracted text content or empty string if not found
 */
function extractTextFromResponse(output: Array<any> | undefined): string {
  const messageItem = output?.find(item => item.type === 'message');
  const textContent = messageItem?.content?.find((content: any) => content.type === 'output_text');
  return textContent?.text || '';
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
    const requestParams: ResponsesAPIPromptRequestParams = {
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

    logger.info('Topic conversation generated successfully', {
      id: response.id,
      model: response.model,
      status: response.status,
      usage: response.usage,
    });

    // Extract text from output using helper function
    const extractedText = extractTextFromResponse(response.output);

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

/**
 * Generate text using OpenAI Responses API
 * This function generates text based on a simple prompt
 *
 * @param prompt - The prompt for text generation
 * @param options - Optional generation settings (store, include, etc.)
 * @returns Generated text response
 *
 * @example
 * ```typescript
 * const result = await generateText("Tell me a three sentence bedtime story about a unicorn.");
 * ```
 */
export async function generateText(
  prompt: string,
  options: TextGenerationOptions = {}
): Promise<TextGenerationResponse> {
  try {
    const {
      store = true,
      include,
    } = options;

    logger.info('Generating text response', {
      prompt: prompt.substring(0, 50) + '...',
      store,
    });

    // Build request parameters
    const requestParams: ResponsesAPIInputRequestParams = {
      model: openaiConfig.gpt.model,
      input: prompt,
      store,
    };

    // Add include only if provided
    if (include && include.length > 0) {
      requestParams.include = include;
    }

    // Call OpenAI Responses API
    const response = await openai.responses.create(requestParams);

    logger.info('Text generated successfully', {
      id: response.id,
      model: response.model,
      status: response.status,
      usage: response.usage,
    });

    // Extract text from output using helper function
    const extractedText = extractTextFromResponse(response.output);

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
    logger.error('Error generating text', {
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
        `Failed to generate text: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    throw new AppError(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to generate text',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Response suggestions interface
 */
export interface ResponseSuggestionsResult {
  suggestions: string[];
}

/**
 * Generate response suggestions for conversation
 * This function generates structured suggestions and parses them reliably
 *
 * @param topic - The conversation topic
 * @param conversationHistory - Recent conversation messages
 * @param options - Optional generation settings (store, include, etc.)
 * @returns Parsed array of 3 suggestions
 *
 * @example
 * ```typescript
 * const result = await generateResponseSuggestions(
 *   "Job interview",
 *   "Teacher: Tell me about yourself.\nUser: I am a software engineer."
 * );
 * console.log(result.suggestions); // ["I have 5 years...", "I specialize in...", "I'm passionate about..."]
 * ```
 */
export async function generateResponseSuggestions(
  topic: string,
  conversationHistory: string,
  options: TextGenerationOptions = {}
): Promise<ResponseSuggestionsResult> {
  try {
    const prompt = `Based on the following conversation topic and history, generate exactly 3 helpful response suggestions that the user could say next.

Topic: ${topic}

Conversation History:
${conversationHistory}

IMPORTANT: Your response must be a valid JSON object with this exact structure:
{
  "suggestions": [
    "First suggestion as a complete, natural sentence",
    "Second suggestion as a complete, natural sentence",
    "Third suggestion as a complete, natural sentence"
  ]
}

Each suggestion should be relevant, helpful, conversational, and different from each other. Provide ONLY the JSON object, no other text.`;

    logger.info('Generating response suggestions', {
      topicLength: topic.length,
      historyLength: conversationHistory.length,
    });

    const response = await generateText(prompt, { ...options, store: false });

    // Parse JSON response
    let parsedResponse: ResponseSuggestionsResult;
    try {
      // Clean the text - remove markdown code blocks if present
      let cleanText = response.text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      parsedResponse = JSON.parse(cleanText);

      // Validate structure
      if (!parsedResponse.suggestions || !Array.isArray(parsedResponse.suggestions)) {
        throw new Error('Invalid response structure: missing suggestions array');
      }

      // Ensure we have exactly 3 suggestions
      if (parsedResponse.suggestions.length < 3) {
        throw new Error(`Expected 3 suggestions, got ${parsedResponse.suggestions.length}`);
      }

      // Take only first 3 suggestions
      parsedResponse.suggestions = parsedResponse.suggestions
        .slice(0, 3)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (parsedResponse.suggestions.length < 3) {
        throw new Error('Not enough valid suggestions after filtering');
      }

    } catch (parseError) {
      logger.error('Failed to parse response suggestions', {
        error: parseError instanceof Error ? parseError.message : 'Unknown error',
        responseText: response.text.substring(0, 200),
      });

      // Fallback: try to split by newlines as last resort
      const suggestions = response.text
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('{') && !s.startsWith('['))
        .slice(0, 3);

      if (suggestions.length >= 3) {
        logger.warn('Used fallback parsing for suggestions');
        parsedResponse = { suggestions: suggestions.slice(0, 3) };
      } else {
        throw new AppError(
          ErrorCodes.INTERNAL_SERVER_ERROR,
          'Failed to parse response suggestions from LLM output',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }

    logger.info('Response suggestions generated successfully', {
      count: parsedResponse.suggestions.length,
    });

    return parsedResponse;

  } catch (error) {
    logger.error('Error generating response suggestions', {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack,
      } : error,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to generate response suggestions',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export default {
  talkWithSpecificTopic,
  generateText,
  generateResponseSuggestions,
};
