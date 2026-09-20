import { FastifyInstance } from 'fastify';
import practiceController from './practice.controller';

export default async function practiceRoutes(fastify: FastifyInstance) {
  await fastify.register(practiceController, { prefix: '/api/v1/practice-problems' });
}
