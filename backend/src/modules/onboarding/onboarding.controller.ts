import { FastifyInstance } from 'fastify';
import { OnboardingService } from './onboarding.service';
import { saveStep1Schema } from './onboarding.schema';

export default async function onboardingController(fastify: FastifyInstance) {
  const onboardingService = new OnboardingService(fastify.prisma);

  // Save Step 1: Education Status
  fastify.post('/step-1', {
    schema: saveStep1Schema,
  }, async (request, reply) => {
    const body = request.body as any;
    
    // Extract userId from JWT auth header or request body
    let userId = body.userId;
    try {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded: any = fastify.jwt.verify(token);
        if (decoded?.id) {
          userId = decoded.id;
        }
      }
    } catch {
      // If token verification fails, use body.userId or default
    }

    if (!userId) {
      userId = `guest-${Date.now()}`;
    }

    const result = await onboardingService.saveStep1(userId, body.educationStatus);
    return reply.send({
      success: true,
      data: result,
    });
  });

  // Get Onboarding Status
  fastify.get('/', async (request, reply) => {
    let userId = (request.query as any)?.userId;
    try {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded: any = fastify.jwt.verify(token);
        if (decoded?.id) {
          userId = decoded.id;
        }
      }
    } catch {
      // Fall through
    }

    if (!userId) {
      return reply.status(400).send({ error: 'BadRequest', message: 'User ID is required' });
    }

    const result = await onboardingService.getOnboarding(userId);
    return reply.send({
      success: true,
      data: result,
    });
  });
}
