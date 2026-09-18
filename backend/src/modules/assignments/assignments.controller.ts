import { FastifyInstance } from 'fastify';
import { AssignmentsService } from './assignments.service';
import { AdminWsBroadcaster } from '../admin/admin.ws';

export default async function assignmentsController(fastify: FastifyInstance) {
  const assignmentsService = new AssignmentsService(fastify.prisma);

  // List all published assignments (for student dashboard & assignments page)
  fastify.get('/', async (request, reply) => {
    let userId: string | undefined = undefined;
    try {
      const decoded: any = await request.jwtVerify();
      userId = decoded?.id || decoded?.userId;
    } catch {
      // Unauthenticated request is OK (public catalog)
    }

    const assignments = await assignmentsService.getPublishedAssignments(userId);
    return reply.send({ assignments });
  });

  // Get specific assignment details
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    let userId: string | undefined = undefined;
    try {
      const decoded: any = await request.jwtVerify();
      userId = decoded?.id || decoded?.userId;
    } catch {}

    const assignment = await assignmentsService.getAssignmentById(id, userId);
    if (!assignment) {
      return reply.code(404).send({ error: 'Assignment not found' });
    }
    return reply.send(assignment);
  });

  // Submit an assignment
  fastify.post('/:id/submit', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      content?: string;
      fileUrl?: string;
      githubUrl?: string;
      userId?: string;
    };

    let userId = body.userId;
    if (!userId) {
      try {
        const decoded: any = await request.jwtVerify();
        userId = decoded?.id || decoded?.userId;
      } catch {}
    }

    if (!userId) {
      // Find default student or fallback user
      const student = await fastify.prisma.user.findFirst({ where: { role: 'STUDENT' } });
      userId = student?.id || 'demo_student';
    }

    try {
      const submission = await assignmentsService.submitAssignment(id, userId, body);
      // Broadcast WebSocket update so admin sees the submission immediately
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.code(201).send(submission);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to submit assignment' });
    }
  });

  // Get current user's submission history
  fastify.get('/my-submissions', async (request, reply) => {
    let userId: string | undefined = undefined;
    try {
      const decoded: any = await request.jwtVerify();
      userId = decoded?.id || decoded?.userId;
    } catch {}

    if (!userId) {
      const student = await fastify.prisma.user.findFirst({ where: { role: 'STUDENT' } });
      userId = student?.id || 'demo_student';
    }

    const submissions = await assignmentsService.getUserSubmissions(userId);
    return reply.send({ submissions });
  });
}
