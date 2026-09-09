import { FastifyInstance } from 'fastify';
import progressController from './progress.controller';

export default async function progressRoutes(fastify: FastifyInstance) {
  await fastify.register(progressController, { prefix: '/api/v1' });
}
