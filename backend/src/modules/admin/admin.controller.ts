import { FastifyInstance } from 'fastify';
import { AdminService } from './admin.service';
import { AdminWsBroadcaster } from './admin.ws';

export default async function adminController(fastify: FastifyInstance) {
  const adminService = new AdminService(fastify.prisma);

  // Real-time WebSocket connection for Admin Panel
  fastify.get('/ws', { websocket: true }, (connection) => {
    const ws = (connection as any).socket || connection;
    AdminWsBroadcaster.addClient(ws, fastify.prisma);
  });

  // REST fallback / initial snapshot endpoints
  fastify.get('/stats', async () => {
    return adminService.getDashboardStats();
  });

  fastify.get('/students', async () => {
    return adminService.getAllStudents();
  });

  fastify.get('/courses', async () => {
    return adminService.getAllCourses();
  });

  fastify.post('/courses', async (request, reply) => {
    const body = request.body as any;
    try {
      const course = await adminService.saveCourseDraft(body);
      // Real-time broadcast to all admin WebSocket clients
      await AdminWsBroadcaster.broadcastUpdate(fastify.prisma);
      return reply.code(201).send(course);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to create course' });
    }
  });
}

