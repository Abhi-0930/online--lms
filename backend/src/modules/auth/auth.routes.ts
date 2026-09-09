import { FastifyInstance } from 'fastify';
import authController from './auth.controller';

export default async function authRoutes(fastify: FastifyInstance) {
  await fastify.register(authController, { prefix: '/api/v1/auth' });
}
