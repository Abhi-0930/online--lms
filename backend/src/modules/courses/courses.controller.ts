import { FastifyInstance } from 'fastify';
import { CoursesService } from './courses.service';
import {
  createCourseSchema,
  updateCourseSchema,
  createModuleSchema,
  createLessonSchema,
  courseQuerySchema,
} from './courses.schema';

export default async function coursesController(fastify: FastifyInstance) {
  const coursesService = new CoursesService(fastify.prisma);

  // Public: Get all courses with pagination and filters
  fastify.get('/', {
    schema: courseQuerySchema,
  }, async (request) => {
    const query = request.query as any;
    return coursesService.getAllCourses(query);
  });

  // Public: Get course by slug
  fastify.get('/:slug', async (request) => {
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
}
