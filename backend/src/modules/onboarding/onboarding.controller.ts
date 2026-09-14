import { FastifyInstance } from 'fastify';
import { OnboardingService } from './onboarding.service';
import { saveStep1Schema, saveStep2Schema, saveStep3Schema, saveStep4Schema } from './onboarding.schema';

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

  // Save Step 2: Target Roles
  fastify.post('/step-2', {
    schema: saveStep2Schema,
  }, async (request, reply) => {
    const body = request.body as any;

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

    const result = await onboardingService.saveStep4(userId, body.name);
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
