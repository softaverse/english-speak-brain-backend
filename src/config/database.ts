import { PrismaClient } from '@prisma/client';
import { env } from './environment';

export const createDatabaseClient = () => {
  return new PrismaClient({
    log: env.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: env.isDevelopment ? 'pretty' : 'minimal',
  });
};

export const databaseConfig = {
  url: env.databaseUrl,
  poolTimeout: 10000, // 10 seconds
  maxConnections: 10,
} as const;
