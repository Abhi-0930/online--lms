import { FastifyInstance } from 'fastify';
import adminController from './admin.controller';

export default async function adminRoutes(fastify: FastifyInstance) {
  await fastify.register(adminController, { prefix: '/api/v1/admin' });
}
