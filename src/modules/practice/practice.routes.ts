import { Router } from 'express';
import multer from 'multer';
import { TranscriptionController } from './controllers/transcription.controller';
import { TextGenerationController } from './controllers/textGeneration.controller';
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
 * @route   POST /api/practice/generate/text
 * @desc    Generate text from chat messages
 * @access  Public/Private
 * @body    {messages: ChatMessage[], options?: TextGenerationOptions}
 */
router.post(
  '/generate/text',
  TextGenerationController.generateText
);

/**
 * @route   POST /api/practice/generate/completion
 * @desc    Generate simple text completion
 * @access  Public/Private
 * @body    {prompt: string, systemPrompt?: string, options?: TextGenerationOptions}
 */
router.post(
  '/generate/completion',
  TextGenerationController.generateCompletion
);

/**
 * @route   POST /api/practice/generate/analyze
 * @desc    Analyze English text for errors and improvements
 * @access  Public/Private
 * @body    {text: string, options?: TextGenerationOptions}
 */
router.post(
  '/generate/analyze',
  TextGenerationController.analyzeText
);

/**
 * @route   POST /api/practice/generate/correct
 * @desc    Correct grammar errors in text
 * @access  Public/Private
 * @body    {text: string, options?: TextGenerationOptions}
 */
router.post(
  '/generate/correct',
  TextGenerationController.correctGrammar
);

/**
 * @route   POST /api/practice/generate/exercises
 * @desc    Generate practice exercises
 * @access  Public/Private
 * @body    {errorType: string, difficulty?: string, count?: number, options?: TextGenerationOptions}
 */
router.post(
  '/generate/exercises',
  TextGenerationController.generateExercises
);

/**
 * @route   POST /api/practice/generate/conversation
 * @desc    Generate conversational response
 * @access  Public/Private
 * @body    {message: string, history?: ChatMessage[], options?: TextGenerationOptions}
 */
router.post(
  '/generate/conversation',
  TextGenerationController.generateConversation
);

/**
 * @route   POST /api/practice/generate/explain
 * @desc    Explain grammar concept
 * @access  Public/Private
 * @body    {concept: string, level?: string, options?: TextGenerationOptions}
 */
router.post(
  '/generate/explain',
  TextGenerationController.explainConcept
);

export default router;
