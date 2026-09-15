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
}
