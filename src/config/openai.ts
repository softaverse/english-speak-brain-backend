import { env } from './environment';

export const openaiConfig = {
  apiKey: env.openai.apiKey,
  organization: env.openai.orgId,
  whisper: {
    model: 'whisper-1',
    language: 'en',
    responseFormat: 'json' as const,
    temperature: 0.2,
  },
  gpt: {
    model: 'gpt-4-turbo-preview',
    temperature: 0.3,
    maxTokens: 2000,
  },
  timeout: 60000, // 60 seconds
} as const;
