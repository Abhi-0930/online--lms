import { FastifyInstance } from 'fastify';
import coursesController from './courses.controller';

export default async function coursesRoutes(fastify: FastifyInstance) {
  await fastify.register(coursesController, { prefix: '/api/v1/courses' });
}
