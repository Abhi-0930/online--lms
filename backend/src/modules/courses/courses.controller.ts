import { FastifyInstance } from 'fastify';
import { CoursesService } from './courses.service';
import { AdminService } from '../admin/admin.service';
import {
  createCourseSchema,
  updateCourseSchema,
  createModuleSchema,
  createLessonSchema,
  courseQuerySchema,
} from './courses.schema';

export default async function coursesController(fastify: FastifyInstance) {
  const coursesService = new CoursesService(fastify.prisma);
  const adminService = new AdminService(fastify.prisma);

  // Public: Get all courses with pagination and filters
  fastify.get('/', {
    schema: courseQuerySchema,
  }, async (request, reply) => {
    reply.header('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
    const query = request.query as any;
    return coursesService.getAllCourses(query);
  });

  // Public: Get course by slug
  fastify.get('/:slug', async (request, reply) => {
    reply.header('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
    const { slug } = request.params as any;
    return coursesService.getCourseBySlug(slug);
  });

  // Instructor/Admin: Create course
  fastify.post('/', {
    onRequest: [fastify.authenticate, fastify.authorize(['INSTRUCTOR', 'ADMIN'])],
    schema: createCourseSchema,
  }, async (request, reply) => {
    const user = request.user as any;
    const body = request.body as any;
    const course = await coursesService.createCourse(body, user.id);
    return reply.status(201).send(course);
  });

  // Instructor/Admin: Update course
  fastify.put('/:id', {
    onRequest: [fastify.authenticate, fastify.authorize(['INSTRUCTOR', 'ADMIN'])],
    schema: updateCourseSchema,
  }, async (request) => {
    const { id } = request.params as any;
    const body = request.body as any;
    return coursesService.updateCourse(id, body);
  });

  // Instructor/Admin: Delete course
  fastify.delete('/:id', {
    onRequest: [fastify.authenticate, fastify.authorize(['INSTRUCTOR', 'ADMIN'])],
  }, async (request) => {
    const { id } = request.params as any;
    return coursesService.deleteCourse(id);
  });

  // Instructor/Admin: Create module
  fastify.post('/:courseId/modules', {
    onRequest: [fastify.authenticate, fastify.authorize(['INSTRUCTOR', 'ADMIN'])],
    schema: createModuleSchema,
  }, async (request, reply) => {
    const { courseId } = request.params as any;
    const body = request.body as any;
    const module = await coursesService.createModule(courseId, body);
    return reply.status(201).send(module);
  });

  // Instructor/Admin: Create lesson
  fastify.post('/modules/:moduleId/lessons', {
    onRequest: [fastify.authenticate, fastify.authorize(['INSTRUCTOR', 'ADMIN'])],
    schema: createLessonSchema,
  }, async (request, reply) => {
    const { moduleId } = request.params as any;
    const body = request.body as any;
    const lesson = await coursesService.createLesson(moduleId, body);
    return reply.status(201).send(lesson);
  });

  // Lesson Discussions: Get discussions for a lesson
  fastify.get('/lessons/:lessonId/discussions', async (request) => {
    const { lessonId } = request.params as { lessonId: string };
    const { userId, userEmail } = (request.query as any) || {};
    return adminService.getCourseDiscussions(lessonId, { onlyApproved: true, userId, userEmail });
  });

  fastify.get('/:courseId/lessons/:lessonId/discussions', async (request) => {
    const { lessonId } = request.params as { lessonId: string };
    const { userId, userEmail } = (request.query as any) || {};
    return adminService.getCourseDiscussions(lessonId, { onlyApproved: true, userId, userEmail });
  });

  // Lesson Discussions: Post a discussion question
  fastify.post('/lessons/:lessonId/discussions', async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string };
    const body = request.body as any;
    try {
      const discussion = await adminService.saveCourseDiscussion(lessonId, body);
      return reply.code(201).send(discussion);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to post lesson discussion' });
    }
  });

  fastify.post('/:courseId/lessons/:lessonId/discussions', async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string };
    const body = request.body as any;
    try {
      const discussion = await adminService.saveCourseDiscussion(lessonId, body);
      return reply.code(201).send(discussion);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to post lesson discussion' });
    }
  });

  // Lesson Discussions: Like a discussion
  fastify.post('/discussions/:discussionId/like', async (request, reply) => {
    const { discussionId } = request.params as { discussionId: string };
    const { delta, userEmail, userId } = (request.body as any) || {};
    try {
      const updated = await adminService.likeCourseDiscussion(discussionId, { delta, userEmail, userId });
      return reply.send(updated);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to like discussion' });
    }
  });

  // Lesson Discussions: Reply to a discussion
  fastify.post('/discussions/:discussionId/reply', async (request, reply) => {
    const { discussionId } = request.params as { discussionId: string };
    const body = request.body as any;
    try {
      const updated = await adminService.replyToCourseDiscussion(discussionId, body);
      return reply.send(updated);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to reply to discussion' });
    }
  });
}
