import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '@config/environment';
import { errorHandler } from '@shared/middleware/errorHandler';
import { requestLogger } from '@shared/middleware/logger';
import { globalRateLimiter } from '@shared/middleware/rateLimiter';
import { ResponseHandler } from '@shared/utils/response';
import { logger } from '@shared/utils/logger';
import practiceRoutes from '@modules/practice/practice.routes';

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: env.cors.origin,
      credentials: true,
    })
  );

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  if (env.isDevelopment) {
    app.use(requestLogger);
  }

  // Global rate limiting
  app.use(globalRateLimiter);

  app.use('/api/practice', practiceRoutes);

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    ResponseHandler.success(res, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.nodeEnv,
    });
  });

  // API version endpoint
  app.get(`${env.apiPrefix}/version`, (_req: Request, res: Response) => {
    ResponseHandler.success(res, {
      version: '1.0.0',
      apiVersion: 'v1',
      environment: env.nodeEnv,
    });
  });

  // API routes will be mounted here
  // app.use(`${env.apiPrefix}/practice`, practiceRoutes);
  // app.use(`${env.apiPrefix}/review`, reviewRoutes);
  // app.use(`${env.apiPrefix}/analytics`, analyticsRoutes);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    ResponseHandler.error(res, 'NOT_FOUND', 'Route not found', 404);
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  logger.info('Express app initialized');

  return app;
};

export default createApp;
