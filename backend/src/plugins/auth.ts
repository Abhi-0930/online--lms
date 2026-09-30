import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import logger from '../utils/logger';
import { AuthService } from '../modules/auth/auth.service';
import { env } from '../config/env';

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
          code: 'UNAUTHORIZED',
          message: 'Missing authentication session token',
        });
      }

      let sessionExists = AuthService.isValidSession(clientSessionToken);

      if (!sessionExists) {
        // Fallback: check database in case of fresh server start
        const dbSession = await fastify.prisma.userDevice.findUnique({
          where: { sessionToken: clientSessionToken },
        }).catch(() => null);

        if (dbSession) {
          sessionExists = true;
          AuthService.trackSession({
            sessionToken: dbSession.sessionToken,
            userId: dbSession.userId,
            deviceId: dbSession.deviceId,
            deviceName: dbSession.deviceName,
            ipAddress: dbSession.ipAddress,
            userAgent: dbSession.userAgent,
            lastActiveAt: dbSession.lastActiveAt,
            createdAt: dbSession.createdAt,
          });
        }
      }

      if (!sessionExists) {
        const isProd = env.NODE_ENV === 'production' || process.env.RENDER === 'true';
        reply.clearCookie('access_token', {
          path: '/',
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
        });
        return reply.status(401).send({
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
          message: 'Session expired or invalid',
        });
      }

      // Touch active timestamp in memory and DB
      AuthService.touchSession(clientSessionToken);
      fastify.prisma.userDevice.update({
        where: {
          sessionToken: clientSessionToken,
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
