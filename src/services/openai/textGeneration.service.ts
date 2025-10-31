import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
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
 * Text generation options
 */
export interface TextGenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string | string[];
  user?: string;
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
 * Text generation response
 */
export interface TextGenerationResponse {
  text: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
  id: string;
  created: number;
}

/**
 * Generate text completion using OpenAI GPT models
 *
 * @param messages - Array of chat messages
 * @param options - Optional generation settings
 * @returns Generated text and metadata
 *
 * @example
 * ```typescript
 * const messages = [
 *   { role: 'system', content: 'You are a helpful English teacher.' },
 *   { role: 'user', content: 'Explain the past perfect tense.' }
 * ];
 *
 * const result = await generateText(messages, {
 *   temperature: 0.7,
 *   maxTokens: 500
 * });
 *
 * console.log(result.text);
 * ```
 */
export async function generateText(
  messages: ChatMessage[],
  options: TextGenerationOptions = {}
): Promise<TextGenerationResponse> {
  try {
    const {
      model = openaiConfig.gpt.model,
      temperature = openaiConfig.gpt.temperature,
      maxTokens = openaiConfig.gpt.maxTokens,
      topP = 1,
      frequencyPenalty = 0,
      presencePenalty = 0,
      stop,
      user,
    } = options;

    logger.info('Generating text completion', {
      model,
      messageCount: messages.length,
      temperature,
      maxTokens,
    });

    // Convert messages to OpenAI format
    const formattedMessages: ChatCompletionMessageParam[] = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Call OpenAI Chat Completions API
    const completion = await openai.chat.completions.create({
      model,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      stop,
      user,
    });

    logger.info('Text generation completed successfully', {
      id: completion.id,
      model: completion.model,
      usage: completion.usage,
    });

    const choice = completion.choices[0];
    if (!choice || !choice.message) {
      throw new Error('No completion choice returned from OpenAI');
    }

    return {
      text: choice.message.content || '',
      model: completion.model,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
      finishReason: choice.finish_reason,
      id: completion.id,
      created: completion.created,
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
  const messages: ChatMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  return generateText(messages, options);
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
    maxTokens: 1000,
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
    maxTokens: 800,
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
    maxTokens: 1500,
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
- Keep responses natural and conversational
- Gently correct errors by rephrasing correctly in your response
- Ask follow-up questions to encourage more practice
- Use appropriate vocabulary for the learner's level
- Be encouraging and supportive`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  return generateText(messages, {
    temperature: 0.8,
    maxTokens: 300,
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
    maxTokens: 1000,
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
