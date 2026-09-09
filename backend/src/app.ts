import Fastify from 'fastify';
import { env } from './config/env';
import logger from './utils/logger';
import prismaPlugin from './plugins/prisma';
import authPlugin from './plugins/auth';
import resendPlugin from './plugins/resend';
import swaggerPlugin from './plugins/swagger';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import authRoutes from './modules/auth/auth.routes';
import coursesRoutes from './modules/courses/courses.routes';
import progressRoutes from './modules/progress/progress.routes';
import roadmapsRoutes from './modules/roadmaps/roadmaps.routes';
import resourcesRoutes from './modules/resources/resources.routes';
import cohortsRoutes from './modules/cohorts/cohorts.routes';
import paymentRoutes from './modules/payments/payment.routes';

export async function createApp() {
  const fastify = Fastify({
    logger: logger as any,
  });

  // Register CORS
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  // Register Rate Limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    skipOnError: true,
  });

  // Register JWT
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
  });

  // Register Core Plugins
  await fastify.register(prismaPlugin);
  await fastify.register(authPlugin);
  await fastify.register(resendPlugin);
  await fastify.register(swaggerPlugin);

  // Register Routes
  await fastify.register(authRoutes);
  await fastify.register(coursesRoutes);
  await fastify.register(progressRoutes);
  await fastify.register(roadmapsRoutes);
  await fastify.register(resourcesRoutes);
  await fastify.register(cohortsRoutes);
  await fastify.register(paymentRoutes);

  // Health Check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Global Error Handler
  fastify.setErrorHandler((error, request, reply) => {
    logger.error({ error, request }, 'Unhandled error');

    const statusCode = error.statusCode || 500;
    const response = {
      error: error.name || 'InternalServerError',
      message: error.message || 'An unexpected error occurred',
    };

    if (env.NODE_ENV === 'development') {
      (response as any).stack = error.stack;
    }

    reply.status(statusCode).send(response);
  });

  // 404 Handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: 'NotFound',
      message: `Route ${request.method} ${request.url} not found`,
    });
  });

  return fastify;
}
