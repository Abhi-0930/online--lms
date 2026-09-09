import { FastifyInstance } from 'fastify';
import { ProgressService } from './progress.service';
import { updateProgressSchema, enrollSchema } from './progress.schema';

export default async function progressController(fastify: FastifyInstance) {
  const progressService = new ProgressService(fastify.prisma);

  // Enroll in a course
  fastify.post('/courses/:courseId/enroll', {
    onRequest: [fastify.authenticate],
    schema: enrollSchema,
  }, async (request, reply) => {
    const user = request.user as any;
    const { courseId } = request.params as any;
    const body = request.body as any;
    const enrollment = await progressService.enrollUser(user.id, courseId, body.expiresAt);
    return reply.status(201).send(enrollment);
  });

  // Update lesson progress
  fastify.post('/lessons/:lessonId/progress', {
    onRequest: [fastify.authenticate],
    schema: updateProgressSchema,
  }, async (request, reply) => {
    const user = request.user as any;
    const { lessonId } = request.params as any;
    const body = request.body as any;
    const progress = await progressService.updateLessonProgress(user.id, lessonId, body);
    return reply.send(progress);
  });

  // Get progress for a specific course
  fastify.get('/courses/:courseId/progress', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const user = request.user as any;
    const { courseId } = request.params as any;
    return progressService.getUserProgress(user.id, courseId);
  });

  // Get all user enrollments
  fastify.get('/enrollments', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const user = request.user as any;
    return progressService.getUserEnrollments(user.id);
  });
}
