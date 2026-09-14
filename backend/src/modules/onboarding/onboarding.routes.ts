import { FastifyInstance } from 'fastify';
import onboardingController from './onboarding.controller';

export default async function onboardingRoutes(fastify: FastifyInstance) {
  fastify.register(onboardingController, { prefix: '/api/v1/onboarding' });
}
