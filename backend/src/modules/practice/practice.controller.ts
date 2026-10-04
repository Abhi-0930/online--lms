import { FastifyInstance } from 'fastify';
import { AdminService } from '../admin/admin.service';
import { AdminWsBroadcaster } from '../admin/admin.ws';

export default async function practiceController(fastify: FastifyInstance) {
  const adminService = new AdminService(fastify.prisma);

  // Get all public live practice problems
  fastify.get('/', async (request, reply) => {
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');

    const { difficulty, topic, category, search } = request.query as {
      difficulty?: string;
      topic?: string;
      category?: string;
      search?: string;
    };

    const all = await adminService.getAllPracticeProblems();
    
    // Filter all active/live practice problems (exclude drafts and archived)
    let problems = all.filter((p) => {
      const st = (p.status || 'Live').toLowerCase();
      return st !== 'draft' && st !== 'archived';
    });

    if (difficulty && difficulty !== 'All') {
      problems = problems.filter((p) => (p.difficulty || '').toLowerCase() === difficulty.toLowerCase());
    }

    const targetCategory = topic || category;
    if (targetCategory && targetCategory !== 'All' && targetCategory !== 'All topics') {
      const cat = targetCategory.toLowerCase().trim();
      problems = problems.filter((p) => {
        const pCat = (p.category || '').toLowerCase();
        const pTopic = ((p as any).topic || '').toLowerCase();
        const tags = Array.isArray(p.tags) ? p.tags.map((t: string) => String(t).toLowerCase()) : [];
        return (
          pCat === cat ||
          pTopic === cat ||
          pCat.includes(cat) ||
          cat.includes(pCat) ||
          tags.includes(cat) ||
          tags.some((t: string) => t.includes(cat) || cat.includes(t))
        );
      });
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      problems = problems.filter((p) =>
        `${p.title || ''} ${p.category || ''} ${p.difficulty || ''} ${p.description || ''} ${Array.isArray(p.tags) ? p.tags.join(' ') : ''}`.toLowerCase().includes(q)
      );
    }

    return problems;
  });

  // Get problem by slug or id
  fastify.get('/:slugOrId', async (request, reply) => {
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');

    const { slugOrId } = request.params as { slugOrId: string };
    const all = await adminService.getAllPracticeProblems();
    const query = (slugOrId || '').toLowerCase().trim();
    
    const problem = all.find((p) => {
      const idStr = String(p.id).toLowerCase();
      const slugStr = (p.slug || '').toLowerCase();
      const titleSlug = (p.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return idStr === query || slugStr === query || titleSlug === query;
    });

    if (!problem) {
      return reply.code(404).send({ error: 'Practice problem not found' });
    }

    return problem;
  });

  // Get problem submissions (Approved for Community Solutions + student's own submissions)
  fastify.get('/:slugOrId/submissions', async (request, reply) => {
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');

    const { slugOrId } = request.params as { slugOrId: string };
    const { userId, userEmail, studentEmail } = (request.query || {}) as {
      userId?: string;
      userEmail?: string;
      studentEmail?: string;
    };
    return adminService.getPracticeProblemSubmissions(slugOrId, {
      onlyApproved: !userId && !userEmail && !studentEmail,
      userId,
      userEmail: userEmail || studentEmail,
    });
  });

  // Submit code for a practice problem
  fastify.post('/:slugOrId/submissions', async (request, reply) => {
    const { slugOrId } = request.params as { slugOrId: string };
    const body = request.body as any;
    try {
      const submission = await adminService.savePracticeProblemSubmission(slugOrId, body);
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.code(201).send(submission);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to record practice submission' });
    }
  });

  // Get problem discussions (Approved for community + student's own pending discussions)
  fastify.get('/:slugOrId/discussions', async (request, reply) => {
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    reply.header('Pragma', 'no-cache');
    reply.header('Expires', '0');

    const { slugOrId } = request.params as { slugOrId: string };
    const { userId, userEmail } = request.query as { userId?: string; userEmail?: string };
    return adminService.getPracticeDiscussions(slugOrId, { onlyApproved: true, userId, userEmail });
  });

  // Post a discussion question / thread for a practice problem (Pending review for admin approval)
  fastify.post('/:slugOrId/discussions', async (request, reply) => {
    const { slugOrId } = request.params as { slugOrId: string };
    const body = request.body as any;
    try {
      const discussion = await adminService.savePracticeDiscussion(slugOrId, {
        ...body,
        status: 'Pending Review',
        authorRole: 'student',
      });
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.code(201).send(discussion);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to post practice discussion' });
    }
  });

  // Upvote / like a discussion
  fastify.post('/discussions/:discussionId/like', async (request, reply) => {
    const { discussionId } = request.params as { discussionId: string };
    const { delta, userEmail, userId } = (request.body as { delta?: number; userEmail?: string; userId?: string }) || {};
    const updated = await adminService.likePracticeDiscussion(discussionId, { delta, userEmail, userId });
    AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
    return reply.send(updated);
  });

  // Reply to a discussion
  fastify.post('/discussions/:discussionId/replies', async (request, reply) => {
    const { discussionId } = request.params as { discussionId: string };
    const body = request.body as any;
    try {
      const updated = await adminService.replyToPracticeDiscussion(discussionId, {
        ...body,
        authorRole: body.authorRole || 'student',
      });
      AdminWsBroadcaster.broadcastUpdate(fastify.prisma).catch(() => {});
      return reply.code(201).send(updated);
    } catch (err: any) {
      return reply.code(400).send({ error: err.message || 'Failed to reply to discussion' });
    }
  });
}

