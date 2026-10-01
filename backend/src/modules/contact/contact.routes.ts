import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { sendContactFormEmail } from '../../utils/email';
import logger from '../../utils/logger';

interface ContactBody {
  name: string;
  email: string;
  message: string;
  phone?: string;
}

export const contactRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post<{ Body: ContactBody }>(
    '/contact',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'email', 'message'],
          properties: {
            name: { type: 'string', minLength: 1 },
            email: { type: 'string', format: 'email' },
            message: { type: 'string', minLength: 1 },
            phone: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { name, email, message, phone } = request.body;

      try {
        await sendContactFormEmail({ name, email, message, phone });
        return reply.status(200).send({
          success: true,
          message: 'Thank you! Your message has been sent to hello@preppath.net.',
        });
      } catch (err) {
        logger.error({ err }, 'Failed to process contact form submission');
        return reply.status(500).send({
          error: 'InternalServerError',
          message: 'Failed to deliver message. Please email hello@preppath.net directly.',
        });
      }
    }
  );
};

export default contactRoutes;
