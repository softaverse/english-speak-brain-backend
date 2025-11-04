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
 * Text generation options for Responses API
 * Based on https://platform.openai.com/docs/api-reference/responses/create
 * Note: Responses API does not support frequency_penalty, presence_penalty, or stop
 */
export interface TextGenerationOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  tools?: Array<any>; // Built-in tools, MCP tools, or function calls
  toolChoice?: string | object;
  parallelToolCalls?: boolean;
  instructions?: string; // System message
  previousResponseId?: string; // For stateful conversations
  store?: boolean; // Whether to store the response
  stream?: boolean;
  safetyIdentifier?: string; // Replaces deprecated user field
  metadata?: Record<string, string>;
  include?: Array<string>; // Additional output data to include
}

/**
 * Message role types
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * Chat message interface
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
}

/**
 * Text generation response from Responses API
 * Based on https://platform.openai.com/docs/api-reference/responses/create
 */
export interface TextGenerationResponse {
  text: string; // Extracted from output[].content[].text
  model: string;
  usage: {
    promptTokens: number; // input_tokens
    completionTokens: number; // output_tokens
    totalTokens: number; // total_tokens
    cachedTokens?: number; // input_tokens_details.cached_tokens
    reasoningTokens?: number; // output_tokens_details.reasoning_tokens
  };
  status: string; // completed, failed, in_progress, etc.
  id: string; // Response ID
  createdAt: number; // created_at timestamp
  output: Array<any>; // Full output array for advanced use cases
}

/**
 * Generate text completion using OpenAI Responses API
 *
 * @param input - String input or array of chat messages
 * @param options - Optional generation settings
 * @returns Generated text and metadata
 *
 * @example
 * ```typescript
 * // Simple string input
 * const result = await generateText('Tell me a story', {
 *   temperature: 0.7,
 *   maxOutputTokens: 500
 * });
 *
 * // With system instructions
 * const result = await generateText('Explain the past perfect tense.', {
 *   instructions: 'You are a helpful English teacher.',
 *   temperature: 0.7,
 *   maxOutputTokens: 500
 * });
 *
 * // With conversation history using messages
 * const result = await generateText([
 *   { role: 'user', content: 'Hello' },
 *   { role: 'assistant', content: 'Hi there!' },
 *   { role: 'user', content: 'How are you?' }
 * ], {
 *   instructions: 'You are a friendly assistant.',
 * });
 * ```
 */
export async function generateText(
  input: string | ChatMessage[],
  options: TextGenerationOptions = {}
): Promise<TextGenerationResponse> {
  try {
    const {
      model = openaiConfig.gpt.model,
      temperature = openaiConfig.gpt.temperature,
      maxOutputTokens = openaiConfig.gpt.maxTokens,
      topP = 1,
      tools,
      toolChoice,
      parallelToolCalls = true,
      instructions,
      previousResponseId,
      store = false,
      stream = false,
      safetyIdentifier,
      metadata,
      include,
    } = options;

    // Prepare input for Responses API
    let apiInput: string | Array<any>;

    if (typeof input === 'string') {
      apiInput = input;
    } else {
      // Convert ChatMessage array to Responses API format
      // Extract system message as instructions if present
      const userMessages = input.filter(msg => msg.role !== 'system');
      apiInput = userMessages.map(msg => ({
        type: 'message',
        role: msg.role,
        content: msg.content,
      }));
    }

    // Extract system instructions from messages if not provided
    let systemInstructions = instructions;
    if (!systemInstructions && Array.isArray(input)) {
      const systemMessage = input.find(msg => msg.role === 'system');
      if (systemMessage) {
        systemInstructions = systemMessage.content;
      }
    }

    logger.info('Generating text using Responses API', {
      model,
      inputType: typeof input === 'string' ? 'string' : 'messages',
      messageCount: Array.isArray(input) ? input.length : 1,
      temperature,
      maxOutputTokens,
      hasInstructions: !!systemInstructions,
    });

    // Detect if model is an o-series or reasoning model
    // o-series models (o1, o3, o3-mini, gpt-5) don't support temperature/top_p
    const isReasoningModel = model.startsWith('o1') ||
                             model.startsWith('o3') ||
                             model.startsWith('gpt-5');

    // Log warning if reasoning model is used with unsupported parameters
    if (isReasoningModel && (temperature !== undefined || topP !== undefined)) {
      logger.warn('Reasoning model detected - temperature and top_p parameters will be ignored', {
        model,
        temperature,
        topP,
      });
    }

    // Build request parameters
    const requestParams: any = {
      model,
      input: apiInput,
      parallel_tool_calls: parallelToolCalls,
      store,
      stream,
      reasoning: { effort: 'low' }
    };

    // Add temperature and top_p only for non-reasoning models
    if (!isReasoningModel) {
      if (temperature !== undefined) requestParams.temperature = temperature;
      if (topP !== undefined) requestParams.top_p = topP;
    }

    // Add optional parameters
    if (maxOutputTokens) requestParams.max_output_tokens = maxOutputTokens;
    if (systemInstructions) requestParams.instructions = systemInstructions;
    if (tools && tools.length > 0) requestParams.tools = tools;
    if (toolChoice) requestParams.tool_choice = toolChoice;
    if (previousResponseId) requestParams.previous_response_id = previousResponseId;
    if (safetyIdentifier) requestParams.safety_identifier = safetyIdentifier;
    if (metadata) requestParams.metadata = metadata;
    if (include) requestParams.include = include;

    // Call OpenAI Responses API
    const response = await openai.responses.create(requestParams);

    console.log("response: ", response);
    

    logger.info('Text generation completed successfully', {
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
 * Generate a simple completion from a single prompt
 * Uses the Responses API with simple string input
 *
 * @param prompt - The user prompt
 * @param systemPrompt - Optional system prompt to set context
 * @param options - Optional generation settings
 * @returns Generated text and metadata
 *
 * @example
 * ```typescript
 * const result = await generateCompletion(
 *   'What is the difference between "affect" and "effect"?',
 *   'You are an English grammar expert.',
 *   { temperature: 0.5 }
 * );
 * ```
 */
export async function generateCompletion(
  prompt: string,
  systemPrompt?: string,
  options: TextGenerationOptions = {}
): Promise<TextGenerationResponse> {
  // Use Responses API with instructions parameter for system prompt
  return generateText(prompt, {
    ...options,
    instructions: systemPrompt || options.instructions,
  });
}

/**
 * Analyze English speech/text and provide feedback
 *
 * @param text - The text to analyze
 * @param options - Optional generation settings
 * @returns Analysis and feedback
 *
 * @example
 * ```typescript
 * const analysis = await analyzeEnglishText(
 *   'I goed to the store yesterday and buyed some milk.'
 * );
 * ```
 */
export async function analyzeEnglishText(
  text: string,
  options: TextGenerationOptions = {}
): Promise<TextGenerationResponse> {
  const systemPrompt = `You are an expert English language teacher and grammar checker.
Analyze the provided text for:
1. Grammar errors
2. Vocabulary usage
3. Sentence structure
4. Clarity and coherence

Provide constructive feedback in a friendly, encouraging tone.
For each error, explain:
- What the error is
- Why it's incorrect
- How to correct it
- An example of correct usage

Format your response in clear sections.`;

  const userPrompt = `Please analyze this English text and provide detailed feedback:\n\n"${text}"`;

  return generateCompletion(userPrompt, systemPrompt, {
    temperature: 0.3,
    maxOutputTokens: 1000,
    ...options,
  });
}

/**
 * Generate grammar correction suggestions
 *
 * @param text - The text to correct
 * @param options - Optional generation settings
 * @returns Corrected text and explanations
 */
export async function correctGrammar(
  text: string,
  options: TextGenerationOptions = {}
): Promise<TextGenerationResponse> {
  const systemPrompt = `You are a grammar correction assistant.
Correct any grammatical errors in the provided text while maintaining the original meaning.
Return a JSON object with:
1. "corrected": the corrected text
2. "errors": array of errors found with explanations
3. "suggestions": additional suggestions for improvement`;

  const userPrompt = `Correct the grammar in this text:\n\n"${text}"`;

  return generateCompletion(userPrompt, systemPrompt, {
    temperature: 0.2,
    maxOutputTokens: 800,
    ...options,
  });
}

/**
 * Generate practice exercises based on common errors
 *
 * @param errorType - Type of error (e.g., 'past tense', 'articles', 'prepositions')
 * @param difficulty - Difficulty level ('beginner', 'intermediate', 'advanced')
 * @param count - Number of exercises to generate
 * @param options - Optional generation settings
 * @returns Generated exercises
 */
export async function generateExercises(
  errorType: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
  count: number = 5,
  options: TextGenerationOptions = {}
): Promise<TextGenerationResponse> {
  const systemPrompt = `You are an English language learning content creator.
Generate practice exercises that are clear, educational, and appropriate for the specified level.
Each exercise should include:
1. The question/task
2. Multiple choice options (if applicable)
3. The correct answer
4. A brief explanation`;

  const userPrompt = `Generate ${count} ${difficulty}-level practice exercises focused on: ${errorType}

Format as a numbered list with clear instructions and explanations.`;

  return generateCompletion(userPrompt, systemPrompt, {
    temperature: 0.7,
    maxOutputTokens: 1500,
    ...options,
  });
}

/**
 * Generate conversational response for practice
 *
 * @param userMessage - User's message
 * @param conversationHistory - Previous messages in the conversation
 * @param options - Optional generation settings
 * @returns AI response
 */
export async function generateConversationResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  options: TextGenerationOptions = {}
): Promise<TextGenerationResponse> {
  const systemPrompt = `You are a friendly English conversation partner helping someone practice English.
- Keep responses natural and conversational directly related to the user's message
- Gently correct errors by rephrasing correctly in your response
- If you need to correct errors, you may say something like this: 「You said: (repeat the error version), we often say: (corrected version)」
- You must ask one follow-up question to encourage more practice after response
- Use appropriate vocabulary for the learner's level
- Be encouraging and supportive
- Limit your response to the number of sentences like the user's message`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  return generateText(messages, {
    temperature: 0.8,
    maxOutputTokens: 300,
    ...options,
  });
}

/**
 * Explain English grammar concepts
 *
 * @param concept - The grammar concept to explain
 * @param level - Complexity level of explanation
 * @param options - Optional generation settings
 * @returns Explanation with examples
 */
export async function explainGrammarConcept(
  concept: string,
  level: 'simple' | 'detailed' | 'advanced' = 'detailed',
  options: TextGenerationOptions = {}
): Promise<TextGenerationResponse> {
  const levelInstructions = {
    simple: 'Explain in simple terms suitable for beginners, using basic vocabulary.',
    detailed: 'Provide a detailed explanation with multiple examples and common usage patterns.',
    advanced: 'Include advanced usage, exceptions, and nuances that native speakers should know.',
  };

  const systemPrompt = `You are an expert English grammar teacher.
${levelInstructions[level]}
Always include:
1. Clear definition
2. Multiple examples
3. Common mistakes to avoid
4. Practice suggestions`;

  const userPrompt = `Explain this English grammar concept: ${concept}`;

  return generateCompletion(userPrompt, systemPrompt, {
    temperature: 0.5,
    maxOutputTokens: 1000,
    ...options,
  });
}

export default {
  generateText,
  generateCompletion,
  analyzeEnglishText,
  correctGrammar,
  generateExercises,
  generateConversationResponse,
  explainGrammarConcept,
};
