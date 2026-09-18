import { FastifyInstance } from 'fastify';
import assignmentsController from './assignments.controller';

export default async function assignmentsRoutes(fastify: FastifyInstance) {
  await fastify.register(assignmentsController, { prefix: '/api/v1/assignments' });
}
