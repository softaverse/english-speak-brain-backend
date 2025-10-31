import OpenAI, { toFile } from 'openai';
import { openaiConfig } from '../../config/openai';
import { logger } from '../../shared/utils/logger';
import { AppError } from '../../shared/utils/errors';
import { ErrorCodes } from '../../shared/constants/errorCodes';
import { HttpStatus } from '../../shared/constants/enums';
import { createReadStream } from 'fs';
import { Readable } from 'stream';

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

// Log API key status (masked for security)
logger.info('OpenAI client initialized', {
  hasApiKey: !!openaiConfig.apiKey,
  apiKeyPrefix: openaiConfig.apiKey?.substring(0, 7) + '...',
  hasOrganization: !!openaiConfig.organization,
  timeout: openaiConfig.timeout,
});

/**
 * Transcription options interface
 */
export interface TranscriptionOptions {
  language?: string;
  prompt?: string;
  temperature?: number;
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
}

/**
 * Transcription response interface
 */
export interface TranscriptionResponse {
  text: string;
  language?: string;
  duration?: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
  }>;
  segments?: Array<{
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
  }>;
}

/**
 * Transcribes audio file to text using OpenAI Whisper API
 *
 * @param audioFile - The audio file to transcribe (File object or file path)
 * @param options - Optional transcription settings
 * @returns Transcription result with text and optional metadata
 *
 * @example
 * ```typescript
 * // With file path
 * const result = await transcribeAudio('/path/to/audio.mp3');
 * console.log(result.text);
 *
 * // With file upload and options
 * const result = await transcribeAudio(audioFile, {
 *   language: 'en',
 *   temperature: 0.2,
 *   responseFormat: 'verbose_json'
 * });
 * ```
 */
export async function transcribeAudio(
  audioFile: File | string | Buffer | Readable,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResponse> {
  try {
    const {
      language = openaiConfig.whisper.language,
      prompt,
      temperature = openaiConfig.whisper.temperature,
      responseFormat = openaiConfig.whisper.responseFormat,
    } = options;

    logger.info('Starting audio transcription', {
      language,
      temperature,
      responseFormat,
      fileType: typeof audioFile,
      isBuffer: Buffer.isBuffer(audioFile),
    });

    // Prepare the file for upload
    let file: any;

    if (typeof audioFile === 'string') {
      // If it's a file path, create a read stream
      logger.info('Processing file from path');
      file = createReadStream(audioFile);
    } else if (Buffer.isBuffer(audioFile)) {
      // If it's a Buffer, convert using toFile for OpenAI SDK
      logger.info('Processing buffer, size:', audioFile.length);

      // Use OpenAI's toFile method to convert Buffer to File
      file = await toFile(audioFile, 'audio.webm', { type: 'audio/webm' });
    } else if (audioFile instanceof Readable) {
      logger.info('Processing readable stream');
      file = audioFile;
    } else {
      logger.info('Processing file object');
      file = audioFile;
    }

    logger.info('Calling OpenAI Whisper API');

    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: openaiConfig.whisper.model,
      language: language,
      prompt: prompt,
      temperature: temperature,
      response_format: responseFormat,
    });

    logger.info('Audio transcription completed successfully');

    // Handle different response formats
    if (typeof transcription === 'string') {
      return { text: transcription };
    }

    // For JSON responses, return the full object
    return transcription as TranscriptionResponse;
  } catch (error) {
    // Enhanced error logging
    logger.error('Error transcribing audio', {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack,
      } : error,
      errorType: error?.constructor?.name,
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
        `Failed to transcribe audio: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    throw new AppError(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'Failed to transcribe audio',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Transcribes audio with word-level timestamps
 * This is useful for synchronization and detailed analysis
 *
 * @param audioFile - The audio file to transcribe
 * @param options - Optional transcription settings
 * @returns Transcription with detailed word and segment information
 */
export async function transcribeAudioWithTimestamps(
  audioFile: File | string | Buffer | Readable,
  options: Omit<TranscriptionOptions, 'responseFormat'> = {}
): Promise<TranscriptionResponse> {
  return transcribeAudio(audioFile, {
    ...options,
    responseFormat: 'verbose_json',
  });
}

/**
 * Validates if the file is a supported audio format
 * Supported formats: mp3, mp4, mpeg, mpga, m4a, wav, webm
 *
 * @param filename - The name of the file to validate
 * @returns true if the format is supported
 */
export function isSupportedAudioFormat(filename: string): boolean {
  const supportedExtensions = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? supportedExtensions.includes(extension) : false;
}

/**
 * Get the maximum file size for audio uploads (25 MB)
 * This is the OpenAI API limit
 */
export const MAX_AUDIO_FILE_SIZE = 25 * 1024 * 1024; // 25 MB in bytes

export default {
  transcribeAudio,
  transcribeAudioWithTimestamps,
  isSupportedAudioFormat,
  MAX_AUDIO_FILE_SIZE,
};
