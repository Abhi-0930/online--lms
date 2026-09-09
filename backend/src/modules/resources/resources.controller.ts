import { FastifyInstance } from 'fastify';
import { ResourcesService } from './resources.service';

export default async function resourcesController(fastify: FastifyInstance) {
  const resourcesService = new ResourcesService(fastify.prisma);

  // Public: Get resources for a course
  fastify.get('/courses/:courseId', async (request) => {
    const { courseId } = request.params as any;
    return resourcesService.getResourcesByCourse(courseId);
  });

  // Public: Get resources for a lesson
  fastify.get('/lessons/:lessonId', async (request) => {
    const { lessonId } = request.params as any;
    return resourcesService.getResourcesByLesson(lessonId);
  });

  // Instructor/Admin: Create resource
  fastify.post('/', {
    onRequest: [fastify.authenticate, fastify.authorize(['INSTRUCTOR', 'ADMIN'])],
  }, async (request, reply) => {
    const body = request.body as any;
    const resource = await resourcesService.createResource(body);
    return reply.status(201).send(resource);
  });

  // Instructor/Admin: Update resource
  fastify.put('/:id', {
    onRequest: [fastify.authenticate, fastify.authorize(['INSTRUCTOR', 'ADMIN'])],
  }, async (request) => {
    const { id } = request.params as any;
    const body = request.body as any;
    return resourcesService.updateResource(id, body);
  });

  // Instructor/Admin: Delete resource
  fastify.delete('/:id', {
    onRequest: [fastify.authenticate, fastify.authorize(['INSTRUCTOR', 'ADMIN'])],
  }, async (request) => {
    const { id } = request.params as any;
    return resourcesService.deleteResource(id);
  });
}
