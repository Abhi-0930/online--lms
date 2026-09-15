import { FastifyInstance } from 'fastify';
import { AdminService } from './admin.service';

export default async function adminController(fastify: FastifyInstance) {
  const adminService = new AdminService(fastify.prisma);

  // Get real dashboard overview stats
  fastify.get('/stats', async () => {
    return adminService.getDashboardStats();
  });

  // Get real list of all students / registered platform users
  fastify.get('/students', async () => {
    return adminService.getAllStudents();
  });
}
