import { FastifyInstance } from 'fastify';
import adminController from './admin.controller';
import { AdminService } from './admin.service';
import { AdminWsBroadcaster } from './admin.ws';

export default async function adminRoutes(fastify: FastifyInstance) {
  await fastify.register(adminController, { prefix: '/api/v1/admin' });

  // Public WebSocket fallback endpoints
  fastify.get('/ws', { websocket: true }, (connection) => {
    const ws = (connection as any).socket || connection;
    AdminWsBroadcaster.addClient(ws, fastify.prisma);
  });

  fastify.get('/api/v1/ws', { websocket: true }, (connection) => {
    const ws = (connection as any).socket || connection;
    AdminWsBroadcaster.addClient(ws, fastify.prisma);
  });

  // Public live sessions route for learner frontend
  fastify.get('/api/v1/live-sessions', async (_request, reply) => {
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');
    const adminService = new AdminService(fastify.prisma);
    const all = await adminService.getAllLiveSessions();
    return all.filter((s: any) => s.status !== 'Draft');
  });

  // Public announcements route for learner frontend
  fastify.get('/api/v1/announcements', async (_request, reply) => {
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');
    const adminService = new AdminService(fastify.prisma);
    const all = await adminService.getAllAnnouncements();
    return all.filter((a: any) => a.status !== 'Draft');
  });

  // Public recordings route for learner frontend
  fastify.get('/api/v1/recordings', async (_request, reply) => {
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');
    const adminService = new AdminService(fastify.prisma);
    const all = await adminService.getAllRecordings();
    return all.filter((r: any) => r.status !== 'Draft');
  });

  fastify.delete('/api/v1/recordings/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const adminService = new AdminService(fastify.prisma);
      const result = await adminService.deleteRecording(id);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.send(result);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to delete recording' });
    }
  });
}

