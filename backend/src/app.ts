import Fastify from 'fastify';
import { env } from './config/env';
import logger from './utils/logger';
import prismaPlugin from './plugins/prisma';
import authPlugin from './plugins/auth';
import resendPlugin from './plugins/resend';
import swaggerPlugin from './plugins/swagger';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import websocketPlugin from '@fastify/websocket';
import helmet from '@fastify/helmet';
import authRoutes from './modules/auth/auth.routes';
import coursesRoutes from './modules/courses/courses.routes';
import progressRoutes from './modules/progress/progress.routes';
import roadmapsRoutes from './modules/roadmaps/roadmaps.routes';
import resourcesRoutes from './modules/resources/resources.routes';
import cohortsRoutes from './modules/cohorts/cohorts.routes';
import paymentRoutes from './modules/payments/payment.routes';
import onboardingRoutes from './modules/onboarding/onboarding.routes';
import assignmentsRoutes from './modules/assignments/assignments.routes';
import practiceRoutes from './modules/practice/practice.routes';
import contactRoutes from './modules/contact/contact.routes';
import adminRoutes from './modules/admin/admin.routes';

export async function createApp() {
  const fastify = Fastify({
    logger: logger as any,
    bodyLimit: 2 * 1024 * 1024, // 2MB safe global default limit to prevent payload flood DoS
  });

  // Register Helmet for OWASP recommended security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Disabled for API backend to not break Swagger UI or JSON clients
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
  });

  // Register CORS (with credentials for secure cookies)
  const allowedOrigins = new Set([
    'https://www.preppath.net',
    'https://preppath.net',
    'https://online-lms-coral.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    env.FRONTEND_URL?.replace(/\/+$/, ''),
    env.ADMIN_URL?.replace(/\/+$/, ''),
  ].filter(Boolean));

  await fastify.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const cleanOrigin = origin.replace(/\/+$/, '');
      if (
        allowedOrigins.has(cleanOrigin) ||
        (env.NODE_ENV === 'development' && (cleanOrigin.includes('localhost') || cleanOrigin.includes('127.0.0.1')))
      ) {
        return cb(null, true);
      }
      return cb(new Error('Not allowed by CORS policy'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cookie',
      'X-Session-Token',
      'x-session-token',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Cache-Control',
      'cache-control',
      'Pragma',
      'pragma',
      'Expires',
      'expires',
    ],
    exposedHeaders: ['Set-Cookie', 'X-Session-Token'],
  });

  // Register Cookie Plugin
  await fastify.register(cookie, {
    secret: env.JWT_SECRET,
    hook: 'onRequest',
  });

  // Register Rate Limiting
  await fastify.register(rateLimit, {
    max: env.NODE_ENV === 'development' ? 1000 : 200,
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
  await fastify.register(websocketPlugin);

  // Register Routes
  await fastify.register(authRoutes);
  await fastify.register(coursesRoutes);
  await fastify.register(progressRoutes);
  await fastify.register(roadmapsRoutes);
  await fastify.register(resourcesRoutes);
  await fastify.register(cohortsRoutes);
  await fastify.register(paymentRoutes);
  await fastify.register(onboardingRoutes);
  await fastify.register(assignmentsRoutes);
  await fastify.register(practiceRoutes);
  await fastify.register(contactRoutes);
  await fastify.register(adminRoutes);

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
    