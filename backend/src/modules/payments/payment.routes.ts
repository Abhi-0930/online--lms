import { FastifyInstance } from 'fastify';
import { paymentController } from './payment.controller';

export default async function paymentRoutes(fastify: FastifyInstance) {
  // Register with canonical API v1 prefix
  await fastify.register(paymentController, { prefix: '/api/v1/payments' });
  // Also register with /payments fallback for backwards compatibility
  await fastify.register(paymentController, { prefix: '/payments' });
}
