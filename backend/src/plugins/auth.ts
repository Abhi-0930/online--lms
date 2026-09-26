import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import logger from '../utils/logger';
import { AuthService } from '../modules/auth/auth.service';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  sessionToken: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorize: (roles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    jwt: {
      sign(payload: any): string;
      verify<T = any>(token: string): T;
    };
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      let token: string | undefined;

      // 1. Check HttpOnly cookie first
      const cookieToken = (request as any).cookies?.access_token;
      if (cookieToken) {
        token = cookieToken;
      } else {
        // 2. Fallback to Authorization Bearer header
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return reply.status(401).send({ error: 'Unauthorized', message: 'Missing authentication token' });
      }

      const decoded = fastify.jwt.verify<AuthenticatedUser>(token);

      const clientSessionToken = (request.headers['x-session-token'] as string) || decoded?.sessionToken;

      if (!clientSessionToken) {
        return reply.status(401).send({
          error: 'Unauthorized',
          code: 'SESSION_REVOKED',
          message: 'Your session has ended because your account was logged into on another device.',
        });
      }

      const session = await fastify.prisma.userDevice.findUnique({
        where: {
          sessionToken: clientSessionToken,
        },
      }).catch(() => null);

      if (!session) {
        return reply.status(401).send({
          error: 'Unauthorized',
          code: 'SESSION_REVOKED',
          message: 'Your session has ended because your account was logged into on another device.',
        });
      }

      // Update active timestamp asynchronously
      fastify.prisma.userDevice.update({
        where: {
          sessionToken: decoded.sessionToken,
        },
        data: {
          lastActiveAt: new Date(),
        },
      }).catch(() => {});

      if (decoded?.email) {
        const memUser = AuthService.fallbackUsers.get(decoded.email.toLowerCase());
        if (memUser) {
          memUser.lastActiveAt = new Date().toISOString();
        }
      }

      request.user = decoded;
    } catch (err: any) {
      logger.error({ err }, 'Authentication failed');
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }
  });

  // Role-based authorization decorator
  fastify.decorate('authorize', (roles: string[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      if (!user) {
        return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required' });
      }

      if (!roles.includes(user.role)) {
        return reply.status(403).send({ error: 'Forbidden', message: 'Insufficient permissions' });
      }
    };
  });
};

export default fp(authPlugin);
