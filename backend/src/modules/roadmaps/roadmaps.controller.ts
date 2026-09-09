import { FastifyInstance } from 'fastify';
import { RoadmapsService } from './roadmaps.service';

export default async function roadmapsController(fastify: FastifyInstance) {
  const roadmapsService = new RoadmapsService(fastify.prisma);

  // Public: Get all published roadmaps
  fastify.get('/', async () => {
    return roadmapsService.getAllRoadmaps();
  });

  // Public: Get roadmap by slug
  fastify.get('/:slug', async (request) => {
    const { slug } = request.params as any;
    const user = request.user as any;
    return roadmapsService.getRoadmapBySlug(slug, user?.id);
  });

  // Admin: Create roadmap
  fastify.post('/', {
    onRequest: [fastify.authenticate, fastify.authorize(['ADMIN'])],
  }, async (request, reply) => {
    const body = request.body as any;
    const roadmap = await roadmapsService.createRoadmap(body);
    return reply.status(201).send(roadmap);
  });

  // Admin: Update roadmap
  fastify.put('/:id', {
    onRequest: [fastify.authenticate, fastify.authorize(['ADMIN'])],
  }, async (request) => {
    const { id } = request.params as any;
    const body = request.body as any;
    return roadmapsService.updateRoadmap(id, body);
  });

  // Admin: Add item to roadmap
  fastify.post('/:roadmapId/items', {
    onRequest: [fastify.authenticate, fastify.authorize(['ADMIN'])],
  }, async (request, reply) => {
    const { roadmapId } = request.params as any;
    const body = request.body as any;
    const item = await roadmapsService.addRoadmapItem(
      roadmapId,
      body.courseId,
      body.stepOrder,
      body.isRequired
    );
    return reply.status(201).send(item);
  });

  // Update user progress (internal endpoint, called when course is completed)
  fastify.post('/:roadmapId/progress', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const user = request.user as any;
    const { roadmapId } = request.params as any;
    const progress = await roadmapsService.updateUserProgress(user.id, roadmapId);
    return reply.send(progress);
  });
}
