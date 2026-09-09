import { FastifyInstance } from 'fastify';
import cohortsController from './cohorts.controller';

export default async function cohortsRoutes(fastify: FastifyInstance) {
  await fastify.register(cohortsController, { prefix: '/api/v1/cohorts' });
}
