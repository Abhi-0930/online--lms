import { FastifyInstance } from 'fastify';
import { AdminService } from '../admin/admin.service';

export default async function practiceController(fastify: FastifyInstance) {
  const adminService = new AdminService(fastify.prisma);

  // Get all public live practice problems
  fastify.get('/', async (request) => {
    const { difficulty, topic, category, search } = request.query as {
      difficulty?: string;
      topic?: string;
      category?: string;
      search?: string;
    };

    const all = await adminService.getAllPracticeProblems();
    
    // Filter only Live problems for public practice view
    let problems = all.filter((p) => p.status === 'Live');

    if (difficulty && difficulty !== 'All') {
      problems = problems.filter((p) => p.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    const targetCategory = topic || category;
    if (targetCategory && targetCategory !== 'All' && targetCategory !== 'All topics') {
      problems = problems.filter((p) => p.category.toLowerCase() === targetCategory.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      problems = problems.filter((p) =>
        `${p.title} ${p.category} ${p.difficulty} ${p.description || ''}`.toLowerCase().includes(q)
      );
    }

    return problems;
  });

  // Get problem by slug or id
  fastify.get('/:slugOrId', async (request, reply) => {
    const { slugOrId } = request.params as { slugOrId: string };
    const all = await adminService.getAllPracticeProblems();
    
    const problem = all.find(
      (p) => String(p.id) === slugOrId || p.slug === slugOrId || p.slug === slugOrId.toLowerCase()
    );

    if (!problem) {
      return reply.code(404).send({ error: 'Practice problem not found' });
    }

    return problem;
  });
}
