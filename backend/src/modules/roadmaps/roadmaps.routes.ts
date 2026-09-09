import { FastifyInstance } from 'fastify';
import roadmapsController from './roadmaps.controller';

export default async function roadmapsRoutes(fastify: FastifyInstance) {
  await fastify.register(roadmapsController, { prefix: '/api/v1/roadmaps' });
}
