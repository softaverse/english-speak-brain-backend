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
    model: 'gpt-5-nano-2025-08-07',
    temperature: 0.3,
    maxTokens: 2000,
    // maxTokens: null,
  },
  prompts: {
    talkWithSpecificTopic: {
      id: 'pmpt_690cafff67748196b1128b3affd644690712eb38faca12d4',
      version: '8',
    },
  },
  timeout: 60000, // 60 seconds
} as const;
