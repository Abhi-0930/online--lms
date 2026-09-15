import { FastifyInstance, FastifyRequest } from 'fastify';
import { OnboardingService } from './onboarding.service';
import { saveStep1Schema, saveStep2Schema, saveStep3Schema, saveStep4Schema } from './onboarding.schema';

export default async function onboardingController(fastify: FastifyInstance) {
  const onboardingService = new OnboardingService(fastify.prisma);

  function extractUserId(request: FastifyRequest): string {
    // 1. Check HttpOnly cookie
    try {
      const cookieToken = (request as any).cookies?.access_token;
      if (cookieToken) {
        const decoded: any = fastify.jwt.verify(cookieToken);
        if (decoded?.id) return decoded.id;
      }
    } catch {}

    // 2. Check Authorization Bearer header
    try {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded: any = fastify.jwt.verify(token);
        if (decoded?.id) return decoded.id;
      }
    } catch {}

    // 3. Check request.user if set
    if ((request as any).user?.id) return (request as any).user.id;

    // 4. Check body or query userId
    const bodyUserId = (request.body as any)?.userId;
    if (bodyUserId) return bodyUserId;

    const queryUserId = (request.query as any)?.userId;
    if (queryUserId) return queryUserId;

    return `guest-${Date.now()}`;
  }

  // Save Step 1: Education Status
  fastify.post('/step-1', {
    schema: saveStep1Schema,
  }, async (request, reply) => {
    const body = request.body as any;
    const userId = extractUserId(request);
    const result = await onboardingService.saveStep1(userId, body.educationStatus);
    return reply.send({
      success: true,
      data: result,
    });
  });

  // Save Step 2: Target Roles
  fastify.post('/step-2', {
    schema: saveStep2Schema,
  }, async (request, reply) => {
    const body = request.body as any;
    const userId = extractUserId(request);
    const result = await onboardingService.saveStep2(userId, body.targetRoles);
    return reply.send({
      success: true,
      data: result,
    });
  });

  // Save Step 3: Target Companies
  fastify.post('/step-3', {
    schema: saveStep3Schema,
  }, async (request, reply) => {
    const body = request.body as any;
    const userId = extractUserId(request);
    const result = await onboardingService.saveStep3(userId, body.targetCompanies);
    return reply.send({
      success: true,
      data: result,
    });
  });

  // Save Step 4: Name & Complete Onboarding
  fastify.post('/step-4', {
    schema: saveStep4Schema,
  }, async (request, reply) => {
    const body = request.body as any;
    const userId = extractUserId(request);
    const result = await onboardingService.saveStep4(userId, body.name);
    return reply.send({
      success: true,
      data: result,
    });
  });

  // Get Onboarding Status
  fastify.get('/', async (request, reply) => {
    const userId = extractUserId(request);
    if (!userId || userId.startsWith('guest-')) {
      return reply.status(400).send({ error: 'BadRequest', message: 'User ID is required' });
    }

    const result = await onboardingService.getOnboarding(userId);
    return reply.send({
      success: true,
      data: result,
    });
  });
}
