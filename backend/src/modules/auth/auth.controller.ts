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

  const setAuthCookie = (reply: any, token: string) => {
    reply.setCookie('access_token', token, {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
  };

  const clearAuthCookie = (reply: any) => {
    reply.clearCookie('access_token', {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  };

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

      // Set HttpOnly secure cookie for zero-localStorage vulnerability
      setAuthCookie(reply, accessToken);

      // Redirect to frontend callback
      const redirectUrl = new URL(`${env.FRONTEND_URL}/auth/callback`);
      if (result.isNewUser) {
        redirectUrl.searchParams.set('isNewUser', 'true');
      }

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

  // Google OAuth - Verify ID Token
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

    setAuthCookie(reply, accessToken);

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

    const accessToken = fastify.jwt.sign({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      sessionToken: result.sessionToken,
    });

    setAuthCookie(reply, accessToken);

    return reply.status(201).send({
      ...result,
      accessToken,
    });
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

    setAuthCookie(reply, accessToken);

    return reply.send({
      ...result,
      accessToken,
    });
  });

  // Get Current Authenticated User (from HttpOnly Cookie / In-Memory Session)
  fastify.get('/me', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const user = request.user as any;
    let dbUser: any = null;

    try {
      dbUser = await fastify.prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          avatarUrl: true,
          isEmailVerified: true,
          createdAt: true,
          onboarding: {
            select: {
              educationStatus: true,
              targetDomain: true,
              experienceLevel: true,
              primaryGoal: true,
              completedStep: true,
              isCompleted: true,
            },
          },
        },
      });
    } catch {}

    if (!dbUser) {
      for (const u of AuthService.fallbackUsers.values()) {
        if (u.id === user.id || u.email === user.email) {
          dbUser = u;
          break;
        }
      }
    }

    // If still not found in memory, construct from verified token payload
    if (!dbUser && user?.email) {
      dbUser = {
        id: user.id,
        email: user.email,
        fullName: user.email.split('@')[0],
        role: user.role || 'STUDENT',
        isEmailVerified: false,
      };
    }

    if (!dbUser) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'User not found' });
    }

    let rawName = dbUser.onboarding?.primaryGoal || dbUser.fullName || dbUser.name;
    if (!rawName || rawName.trim().toLowerCase() === 'learner') {
      rawName = dbUser.email ? dbUser.email.split('@')[0] : 'Learner';
    }

    let resolvedName = 'Learner';
    if (rawName && rawName.trim().toLowerCase() !== 'learner') {
      const cleaned = rawName.replace(/[._-]+/g, ' ').replace(/\d+/g, '').trim();
      if (cleaned) {
        resolvedName = cleaned
          .split(/\s+/)
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      } else {
        resolvedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      }
    }

    return reply.send({
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: resolvedName,
        fullName: resolvedName,
        role: dbUser.role || 'STUDENT',
        avatarUrl: dbUser.avatarUrl,
        isEmailVerified: Boolean(dbUser.isEmailVerified),
        onboarding: dbUser.onboarding,
      },
    });
  });

  fastify.post('/logout', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const user = request.user as any;
    clearAuthCookie(reply);
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

  // Delete User (Utility / Testing)
  fastify.post('/delete-user', async (request, reply) => {
    const body = request.body as any;
    const email = body?.email || (request.query as any)?.email;
    if (!email) {
      return reply.status(400).send({ error: 'BadRequest', message: 'Email is required' });
    }
    const result = await authService.deleteUser(email);
    return reply.send(result);
  });
}
