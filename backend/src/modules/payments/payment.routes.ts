import { FastifyInstance } from 'fastify';
import { paymentController } from './payment.controller';

export default async function paymentRoutes(fastify: FastifyInstance) {
  await paymentController(fastify);
}
