import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Define environment schema with Zod
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  API_PREFIX: z.string().default('/api'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  OPENAI_ORG_ID: z.string().optional(),

  // File Upload
  MAX_FILE_SIZE: z.string().default('10485760'), // 10MB
  UPLOAD_DIR: z.string().default('./uploads'),
  ALLOWED_AUDIO_TYPES: z
    .string()
    .default('audio/mpeg,audio/wav,audio/webm,audio/mp4'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_DIR: z.string().default('./logs'),

  // Session (future use)
  SESSION_SECRET: z.string().optional(),
  SESSION_TIMEOUT: z.string().default('86400000'), // 24 hours

  // JWT (future use)
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsedEnv.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

// Export typed environment config
export const env = {
  // Server
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parseInt(parsedEnv.data.PORT, 10),
  apiPrefix: parsedEnv.data.API_PREFIX,
  isDevelopment: parsedEnv.data.NODE_ENV === 'development',
  isProduction: parsedEnv.data.NODE_ENV === 'production',
  isTest: parsedEnv.data.NODE_ENV === 'test',

  // Database
  databaseUrl: parsedEnv.data.DATABASE_URL,

  // Redis
  redis: {
    url: parsedEnv.data.REDIS_URL,
    password: parsedEnv.data.REDIS_PASSWORD,
  },

  // OpenAI
  openai: {
    apiKey: parsedEnv.data.OPENAI_API_KEY,
    orgId: parsedEnv.data.OPENAI_ORG_ID,
  },

  // File Upload
  fileUpload: {
    maxSize: parseInt(parsedEnv.data.MAX_FILE_SIZE, 10),
    uploadDir: parsedEnv.data.UPLOAD_DIR,
    allowedAudioTypes: parsedEnv.data.ALLOWED_AUDIO_TYPES.split(','),
  },

  // CORS
  cors: {
    origin: parsedEnv.data.CORS_ORIGIN,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(parsedEnv.data.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(parsedEnv.data.RATE_LIMIT_MAX_REQUESTS, 10),
  },

  // Logging
  logging: {
    level: parsedEnv.data.LOG_LEVEL,
    dir: parsedEnv.data.LOG_DIR,
  },

  // Session
  session: {
    secret: parsedEnv.data.SESSION_SECRET,
    timeout: parseInt(parsedEnv.data.SESSION_TIMEOUT, 10),
  },

  // JWT
  jwt: {
    secret: parsedEnv.data.JWT_SECRET,
    expiresIn: parsedEnv.data.JWT_EXPIRES_IN,
    refreshExpiresIn: parsedEnv.data.JWT_REFRESH_EXPIRES_IN,
  },
} as const;

export type Environment = typeof env;
