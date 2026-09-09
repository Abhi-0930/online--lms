import fp from 'fastify-plugin';
import { Resend } from 'resend';
import { env } from '../config/env';
import logger from '../utils/logger';

declare module 'fastify' {
  interface FastifyInstance {
    resend: Resend;
  }
}

const resendPlugin = fp(async (fastify) => {
  if (!env.RESEND_API_KEY) {
    logger.warn('RESEND_API_KEY not configured, email features will be disabled');
    fastify.decorate('resend', null);
    return;
  }

  const resend = new Resend(env.RESEND_API_KEY);
  fastify.decorate('resend', resend);

  logger.info('Resend email client initialized');
});

export default resendPlugin;
