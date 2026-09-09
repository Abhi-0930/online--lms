import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const prismaPlugin = fp(async (fastify) => {
  const prisma = new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  });

  if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
      logger.debug({ query: e.query, params: e.params, duration: e.duration }, 'Prisma Query');
    });
  }

  await prisma.$connect();
  logger.info('Prisma client connected');

  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect();
    logger.info('Prisma client disconnected');
  });
});

export default prismaPlugin;
