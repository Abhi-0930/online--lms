import { FastifyInstance } from 'fastify';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema, revokeDeviceSchema } from './auth.schema';
import { getClientIp } from '../../utils/device';

export default async function authController(fastify: FastifyInstance) {
  const authService = new AuthService(fastify.prisma);

  fastify.post('/register', {
    schema: registerSchema,
  }, async (request, reply) => {
    const body = request.body as any;
    const result = await authService.register(body);
    return reply.status(201).send(result);
  });

  fastify.post('/login', {
    schema: loginSchema,
  }, async (request, reply) => {
    const body = request.body as any;
    const ip = getClientIp(request.headers);
    const userAgent = request.headers['user-agent'] || 'Unknown';

    const result = await authService.login({
      ...body,
      ip,
      userAgent,
    });

    // Generate JWT access token
    const accessToken = fastify.jwt.sign({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      sessionToken: result.sessionToken,
    });

    return reply.send({
      ...result,
      accessToken,
    });
  });

  fastify.post('/logout', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const user = request.user as any;
    await authService.logout(user.id, user.sessionToken);
    return reply.send({ success: true });
  });

  fastify.get('/devices', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const user = request.user as any;
    const devices = await authService.getDevices(user.id);
    return reply.send(devices);
  });

  fastify.post('/devices/revoke', {
    onRequest: [fastify.authenticate],
    schema: revokeDeviceSchema,
  }, async (request, reply) => {
    const user = request.user as any;
    const body = request.body as any;
    await authService.revokeDevice(user.id, body.sessionToken);
    return reply.send({ success: true });
  });
}
