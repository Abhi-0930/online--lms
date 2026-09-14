import { FastifyInstance } from 'fastify';
import { AuthService } from './auth.service';
import {
  registerSchema,
  loginSchema,
  revokeDeviceSchema,
  googleCallbackSchema,
  googleTokenSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from './auth.schema';
import { getClientIp } from '../../utils/device';
import { env } from '../../config/env';
import logger from '../../utils/logger';

export default async function authController(fastify: FastifyInstance) {
  const authService = new AuthService(fastify.prisma);

  const handleGoogleCallback = async (request: any, reply: any) => {
    const query = request.query as any;

    if (query?.error) {
      const frontendErrorUrl = `${env.FRONTEND_URL}/login?error=${encodeURIComponent(query.error)}`;
      return reply.redirect(frontendErrorUrl);
    }

    if (!query?.code) {
      return reply.status(400).send({ error: 'BadRequest', message: 'Missing authorization code' });
    }

    const ip = getClientIp(request.headers);
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const deviceId = query?.deviceId || `web-${Buffer.from(userAgent + ip).toString('base64').substring(0, 16)}`;
    const deviceName = query?.deviceName || 'Web Browser (Google OAuth)';

    try {
      const result = await authService.loginWithGoogleCallback({
        code: query.code,
        mode: query?.state,
        deviceId,
        deviceName,
        ip,
        userAgent,
      });

      const accessToken = fastify.jwt.sign({
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        sessionToken: result.sessionToken,
      });

      // Redirect to frontend with token
      const redirectUrl = new URL(`${env.FRONTEND_URL}/auth/callback`);
      redirectUrl.searchParams.set('token', accessToken);
      redirectUrl.searchParams.set('sessionToken', result.sessionToken);
      redirectUrl.searchParams.set('userId', result.user.id);
      redirectUrl.searchParams.set('role', result.user.role);

      return reply.redirect(redirectUrl.toString());
    } catch (err: any) {
      logger.error({ err, message: err.message, code: err.code, statusCode: err.statusCode }, 'Google OAuth error handled');
      if (err.code === 'ACCOUNT_NOT_FOUND' || err.statusCode === 404) {
        const redirectUrl = new URL(`${env.FRONTEND_URL}/register`);
        redirectUrl.searchParams.set('error', 'ACCOUNT_NOT_FOUND');
        if (err.email) redirectUrl.searchParams.set('email', err.email);
        return reply.redirect(redirectUrl.toString());
      }
      if (err.code === 'DEVICE_LIMIT_REACHED' || err.statusCode === 409) {
        return reply.redirect(`${env.FRONTEND_URL}/login?error=DEVICE_LIMIT_REACHED`);
      }
      return reply.redirect(`${env.FRONTEND_URL}/login?error=AUTH_FAILED`);
    }
  };

  // Google OAuth - Get Consent URL / Redirect to Google OR Handle Callback
  fastify.get('/google', async (request, reply) => {
    const query = request.query as any;

    // If Google redirected back to /google with code or error
    if (query?.code || query?.error) {
      return handleGoogleCallback(request, reply);
    }

    const authUrl = authService.getGoogleAuthUrl(query?.state);

    if (query?.json === 'true' || request.headers.accept?.includes('application/json')) {
      return reply.send({ url: authUrl });
    }

    return reply.redirect(authUrl);
  });

  // Google OAuth - Redirect Callback Handler
  fastify.get('/google/callback', {
    schema: googleCallbackSchema,
  }, handleGoogleCallback);

  // Google OAuth - Verify ID Token (For Single Sign-On / Mobile / One Tap)
  fastify.post('/google/token', {
    schema: googleTokenSchema,
  }, async (request, reply) => {
    const body = request.body as any;
    const ip = getClientIp(request.headers);
    const userAgent = request.headers['user-agent'] || 'Unknown';

    const result = await authService.loginWithGoogleIdToken({
      idToken: body.idToken,
      deviceId: body.deviceId,
      deviceName: body.deviceName,
      ip,
      userAgent,
    });

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

  // Forgot Password - Step 1: Request 6-digit OTP code
  fastify.post('/forgot-password', {
    schema: forgotPasswordSchema,
  }, async (request, reply) => {
    const body = request.body as any;
    const result = await authService.requestPasswordReset(body.email);
    return reply.send(result);
  });

  // Forgot Password - Step 2: Verify 6-digit OTP code
  fastify.post('/verify-otp', {
    schema: verifyOtpSchema,
  }, async (request, reply) => {
    const body = request.body as any;
    try {
      const result = await authService.verifyPasswordResetOtp(body.email, body.otp);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ message: err.message || 'Invalid verification code' });
    }
  });

  // Forgot Password - Step 3: Reset password with resetToken
  fastify.post('/reset-password', {
    schema: resetPasswordSchema,
  }, async (request, reply) => {
    const body = request.body as any;
    try {
      const result = await authService.resetPassword(body.email, body.resetToken, body.newPassword);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ message: err.message || 'Failed to reset password' });
    }
  });
}
