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
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.code(201).send(course);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to create course' });
    }
  });

  fastify.patch('/courses/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    try {
      const updated = await adminService.updateCourse(id, body);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.send(updated);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to update course' });
    }
  });

  fastify.delete('/courses/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const result = await adminService.deleteCourse(id);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.send(result);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to delete course' });
    }
  });

  // Assignments management
  fastify.get('/assignments', async () => {
    return adminService.getAllAssignments();
  });

  fastify.post('/assignments', async (request, reply) => {
    const body = request.body as any;
    try {
      const assignment = await adminService.saveAssignment(body);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.code(201).send(assignment);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to save assignment' });
    }
  });

  fastify.patch('/assignments/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    try {
      const updated = await adminService.updateAssignment(id, body);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.send(updated);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to update assignment' });
    }
  });

  fastify.delete('/assignments/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const result = await adminService.deleteAssignment(id);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.send(result);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to delete assignment' });
    }
  });

  // Submissions management
  fastify.get('/submissions', async () => {
    return adminService.getAllSubmissions();
  });

  // Content Library management
  fastify.get('/content', async () => {
    return adminService.getAllContent();
  });

  fastify.patch('/content/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    try {
      const updated = await adminService.updateContentItem(id, body);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.send(updated);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to update content item' });
    }
  });

  fastify.delete('/content/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const result = await adminService.deleteContentItem(id);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.send(result);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to delete content item' });
    }
  });

  // Practice Problems management
  fastify.get('/practice-problems', async () => {
    return adminService.getAllPracticeProblems();
  });

  fastify.post('/practice-problems', async (request, reply) => {
    const body = request.body as any;
    try {
      const problem = await adminService.savePracticeProblem(body);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.code(201).send(problem);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to create practice problem' });
    }
  });

  fastify.patch('/practice-problems/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    try {
      const updated = await adminService.updatePracticeProblem(id, body);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.send(updated);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to update practice problem' });
    }
  });

  fastify.delete('/practice-problems/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const result = await adminService.deletePracticeProblem(id);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.send(result);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to delete practice problem' });
    }
  });

  // Live Sessions & Webinars management
  fastify.get('/live-sessions', async () => {
    return adminService.getAllLiveSessions();
  });

  fastify.post('/live-sessions', async (request, reply) => {
    const body = request.body as any;
    try {
      const session = await adminService.saveLiveSession(body);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.code(201).send(session);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to schedule live session' });
    }
  });

  fastify.patch('/live-sessions/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    try {
      const updated = await adminService.updateLiveSession(id, body);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.send(updated);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to update live session' });
    }
  });

  fastify.delete('/live-sessions/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const result = await adminService.deleteLiveSession(id);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.send(result);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to delete live session' });
    }
  });

  // Admin and instructor users from DB
  fastify.get('/instructors', async () => {
    return adminService.getInstructors();
  });

  // Announcements management
  fastify.get('/announcements', async () => {
    return adminService.getAllAnnouncements();
  });

  fastify.post('/announcements', async (request, reply) => {
    const body = request.body as any;
    try {
      const ann = await adminService.saveAnnouncement(body);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.code(201).send(ann);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to save announcement' });
    }
  });

  fastify.delete('/announcements/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const result = await adminService.deleteAnnouncement(id);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.send(result);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to delete announcement' });
    }
  });

  // Lecture & Class Recordings management
  fastify.get('/recordings', async () => {
    return adminService.getAllRecordings();
  });

  fastify.post('/recordings', async (request, reply) => {
    const body = request.body as any;
    try {
      const recording = await adminService.saveRecording(body);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.code(201).send(recording);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to upload/save recording' });
    }
  });

  fastify.patch('/recordings/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    try {
      const updated = await adminService.updateRecording(id, body);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.send(updated);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to update recording' });
    }
  });

  fastify.delete('/recordings/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const result = await adminService.deleteRecording(id);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.send(result);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to delete recording' });
    }
  });

  // Learner Transactions & Payments
  fastify.get('/payments', async () => {
    return adminService.getAllPayments();
  });

  fastify.get('/transactions', async () => {
    return adminService.getAllPayments();
  });

  // Audit Logs
  fastify.get('/audit-logs', async () => {
    return adminService.getAuditLogs();
  });

  fastify.post('/audit-logs', async (request, reply) => {
    const body = request.body as any;
    try {
      AdminService.logAuditEvent(body);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.code(201).send({ success: true });
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to save audit log' });
    }
  });
}


