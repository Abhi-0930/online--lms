import { FastifyInstance } from 'fastify';
import resourcesController from './resources.controller';

export default async function resourcesRoutes(fastify: FastifyInstance) {
  await fastify.register(resourcesController, { prefix: '/api/v1/resources' });
}
