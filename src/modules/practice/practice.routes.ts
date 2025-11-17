import { Router } from 'express';
import multer from 'multer';
import { TranscriptionController } from './controllers/transcription.controller';
import { TextGenerationController } from './controllers/textGeneration.controller';
import { TranslationController } from './controllers/translation.controller';
import { MAX_AUDIO_FILE_SIZE } from '@services/openai';

const router = Router();

/**
 * Configure multer for handling audio file uploads
 * Store files in memory as buffers for direct OpenAI API upload
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_AUDIO_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    // Accept audio files only
    const allowedMimeTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/mp4',
      'audio/wav',
      'audio/webm',
      'audio/m4a',
      'audio/x-m4a',
      'video/mp4', // Some audio files might have video mime type
    ];

    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  },
});

/**
 * @route   POST /api/practice/transcribe
 * @desc    Transcribe audio file to text
 * @access  Public/Private (depends on your auth setup)
 * @body    {audio: File, language?: string, prompt?: string, temperature?: number}
 */
router.post(
  '/transcribe',
  upload.single('audio'),
  TranscriptionController.transcribeAudio
);

/**
 * @route   POST /api/practice/transcribe/detailed
 * @desc    Transcribe audio with word-level timestamps
 * @access  Public/Private (depends on your auth setup)
 * @body    {audio: File, language?: string, prompt?: string, temperature?: number}
 */
router.post(
  '/transcribe/detailed',
  upload.single('audio'),
  TranscriptionController.transcribeWithTimestamps
);

/**
 * @route   GET /api/practice/transcribe/formats
 * @desc    Get supported audio formats and size limits
 * @access  Public
 */
router.get(
  '/transcribe/formats',
  TranscriptionController.getSupportedFormats
);

// ============ Text Generation Routes ============

/**
 * @route   POST /api/practice/generate/talk-with-topic
 * @desc    Generate conversation with specific topic using reusable OpenAI prompt
 * @access  Public/Private
 * @body    {topic: string, initial_message: string, options?: TextGenerationOptions}
 */
router.post(
  '/generate/talk-with-topic',
  TextGenerationController.talkWithSpecificTopic
);

/**
 * @route   POST /api/practice/generate/text
 * @desc    Generate text using OpenAI Responses API
 * @access  Public/Private
 * @body    {prompt: string, options?: TextGenerationOptions}
 */
router.post(
  '/generate/text',
  TextGenerationController.generateText
);

// ============ Translation Routes ============

/**
 * @route   POST /api/practice/translate
 * @desc    Translate text from English to target language
 * @access  Public/Private
 * @body    {text: string, targetLanguage?: string}
 */
router.post(
  '/translate',
  TranslationController.translate
);

export default router;
