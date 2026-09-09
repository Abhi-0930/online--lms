import { FastifyInstance } from 'fastify';
import { CohortsService } from './cohorts.service';
import { createCohortSchema, updateCohortSchema, enrollInCohortSchema } from './cohorts.schema';

export default async function cohortsController(fastify: FastifyInstance) {
  const cohortsService = new CohortsService(fastify.prisma);

  // Public: Get all cohorts
  fastify.get('/', async (request) => {
    const query = request.query as any;
    const filters = {
      courseId: query.courseId,
      status: query.status,
    };
    return cohortsService.getAllCohorts(filters);
  });

  // Public: Get cohort by ID
  fastify.get('/:id', async (request) => {
    const { id } = request.params as any;
    return cohortsService.getCohortById(id);
  });

  // Admin: Create cohort
  fastify.post('/', {
    onRequest: [fastify.authenticate, fastify.authorize(['ADMIN'])],
    schema: createCohortSchema,
  }, async (request, reply) => {
    const body = request.body as any;
    const cohort = await cohortsService.createCohort(body);
    return reply.status(201).send(cohort);
  });

  // Admin: Update cohort
  fastify.put('/:id', {
    onRequest: [fastify.authenticate, fastify.authorize(['ADMIN'])],
    schema: updateCohortSchema,
  }, async (request) => {
    const { id } = request.params as any;
    const body = request.body as any;
    return cohortsService.updateCohort(id, body);
  });

  // Admin: Delete cohort
  fastify.delete('/:id', {
    onRequest: [fastify.authenticate, fastify.authorize(['ADMIN'])],
  }, async (request) => {
    const { id } = request.params as any;
    return cohortsService.deleteCohort(id);
  });

  // Authenticated: Enroll in cohort
  fastify.post('/enroll', {
    onRequest: [fastify.authenticate],
    schema: enrollInCohortSchema,
  }, async (request, reply) => {
    const user = request.user as any;
    const body = request.body as any;
    const enrollment = await cohortsService.enrollInCohort(user.id, body.cohortId);
    return reply.status(201).send(enrollment);
  });

  // Admin: Get cohort enrollments
  fastify.get('/:id/enrollments', {
    onRequest: [fastify.authenticate, fastify.authorize(['ADMIN', 'INSTRUCTOR'])],
  }, async (request) => {
    const { id } = request.params as any;
    return cohortsService.getCohortEnrollments(id);
  });

  // Authenticated: Get user's cohorts
  fastify.get('/user/my-cohorts', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const user = request.user as any;
    return cohortsService.getUserCohorts(user.id);
  });

  // Authenticated: Leave cohort
  fastify.post('/:id/leave', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const user = request.user as any;
    const { id } = request.params as any;
    return cohortsService.leaveCohort(user.id, id);
  });
}
