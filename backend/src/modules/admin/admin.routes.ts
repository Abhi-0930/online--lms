import { FastifyInstance } from 'fastify';
import adminController from './admin.controller';
import { AdminService } from './admin.service';

export default async function adminRoutes(fastify: FastifyInstance) {
  await fastify.register(adminController, { prefix: '/api/v1/admin' });

  // Public live sessions route for learner frontend
  fastify.get('/api/v1/live-sessions', async () => {
    const adminService = new AdminService(fastify.prisma);
    const all = await adminService.getAllLiveSessions();
    return all.filter((s: any) => s.status !== 'Draft');
  });

  // Public announcements route for learner frontend
  fastify.get('/api/v1/announcements', async () => {
    const adminService = new AdminService(fastify.prisma);
    const all = await adminService.getAllAnnouncements();
    return all.filter((a: any) => a.status !== 'Draft');
  });
}
