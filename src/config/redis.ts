import Redis from 'ioredis';
import { env } from './environment';
import { logger } from '@shared/utils/logger';

let redisClient: Redis | null = null;

export const createRedisClient = (): Redis => {
  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis(env.redis.url, {
    password: env.redis.password,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis connected');
  });

  redisClient.on('error', (error) => {
    logger.error('❌ Redis connection error:', error);
  });

  redisClient.on('close', () => {
    logger.warn('⚠️ Redis connection closed');
  });

  return redisClient;
};

export const getRedisClient = (): Redis | null => {
  return redisClient;
};

export const closeRedisClient = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis client disconnected');
  }
};

export const redisConfig = {
  url: env.redis.url,
  password: env.redis.password,
  ttl: {
    short: 300, // 5 minutes
    medium: 3600, // 1 hour
    long: 86400, // 24 hours
  },
} as const;
