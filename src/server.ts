import { createApp } from './app';
import { env } from '@config/environment';
import { logger } from '@shared/utils/logger';
import { prisma } from '@database/client';
import { createRedisClient, closeRedisClient } from '@config/redis';

const app = createApp();

// Connect to external services
const connectServices = async (): Promise<void> => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected');

    // Connect Redis (optional - don't fail if Redis is not available)
    try {
      const redis = createRedisClient();
      await redis.ping();
      logger.info('✅ Redis connected');
    } catch (error) {
      logger.warn('⚠️ Redis connection failed, continuing without cache');
    }
  } catch (error) {
    logger.error('❌ Failed to connect to services:', error);
    throw error;
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received, starting graceful shutdown...`);

  try {
    // Close database connection
    await prisma.$disconnect();
    logger.info('Database disconnected');

    // Close Redis connection
    await closeRedisClient();

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to services
    await connectServices();

    // Start listening
    const server = app.listen(env.port, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 EnglishBrain Backend API                             ║
║                                                           ║
║   Environment: ${env.nodeEnv.padEnd(44)} ║
║   Server: http://localhost:${env.port.toString().padEnd(33)} ║
║   API: http://localhost:${env.port}${env.apiPrefix.padEnd(27)} ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
      gracefulShutdown('unhandledRejection');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
