import { FastifyInstance } from 'fastify';
import { AuthService } from './auth.service';
import { OnboardingService } from '../onboarding/onboarding.service';
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
import { v4 as uuidv4 } from 'uuid';

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

    let parsedState: any = {};
    if (query?.state) {
      try {
        if (typeof query.state === 'string' && query.state.startsWith('{')) {
          parsedState = JSON.parse(query.state);
        } else if (typeof query.state === 'string') {
          const decoded = Buffer.from(query.state, 'base64url').toString('utf8');
          parsedState = JSON.parse(decoded);
        }
      } catch {
        parsedState = { mode: query.state };
      }
    }

    const ip = getClientIp(request.headers);
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const deviceId = parsedState.deviceId || query?.deviceId || `web-${uuidv4().substring(0, 12)}`;
    const deviceName = parsedState.deviceName || query?.deviceName || 'Web Browser (Google OAuth)';
    const mode = parsedState.mode || 'login';

    try {
      const result = await authService.loginWithGoogleCallback({
        code: query.code,
        mode,
        deviceId,
        deviceName,
        ip,
        userAgent,
        force: parsedState.force === true,
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

    const statePayload = {
      mode: query?.state || 'login',
      deviceId: query?.deviceId || '',
      deviceName: query?.deviceName || '',
      force: query?.force === 'true' || query?.force === true,
    };
    const stateStr = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

    const authUrl = authService.getGoogleAuthUrl(stateStr);

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

    try {
      const result = await authService.loginWithGoogleIdToken({
        idToken: body.idToken,
        deviceId: body.deviceId,
        deviceName: body.deviceName,
        ip,
        userAgent,
        force: body.force,
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
    } catch (err: any) {
      return reply.status(err.statusCode || 400).send({
        error: err.code || 'GoogleAuthFailed',
        message: err.message || 'Google authentication failed',
        code: err.code || 'GoogleAuthFailed',
        activeDevice: err.activeDevice || null,
      });
    }
  });

  fastify.post('/register', {
    schema: registerSchema,
  }, async (request, reply) => {
    const body = request.body as any;
    const ip = getClientIp(request.headers);
    const userAgent = request.headers['user-agent'] || 'Unknown';
    const result = await authService.register({
      ...body,
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

    try {
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
    } catch (err: any) {
      return reply.status(err.statusCode || 400).send({
        error: err.code || 'InvalidCredentials',
        message: err.message || 'Invalid email or password',
        code: err.code || 'InvalidCredentials',
        activeDevice: err.activeDevice || null,
      });
    }
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

    let rawName = (dbUser.fullName || dbUser.name || dbUser.onboarding?.primaryGoal || '').trim();
    if (!rawName || rawName.toLowerCase() === 'learner') {
      rawName = dbUser.email && dbUser.email.includes('@') ? dbUser.email.split('@')[0] : 'Learner';
    }

    let resolvedName = 'Learner';
    if (rawName && rawName.toLowerCase() !== 'learner') {
      const cleaned = rawName.replace(/[._-]+/g, ' ').replace(/\d+/g, '').trim();
      if (cleaned) {
        resolvedName = cleaned
          .split(/\s+/)
          .filter(Boolean)
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      } else {
        resolvedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      }
    }

    let userOnboarding = dbUser.onboarding || OnboardingService.getOnboardingRecord(dbUser.id);
    if (!userOnboarding) {
      for (const record of OnboardingService.onboardingStore.values()) {
        if (record.userId === dbUser.id || record.userId === dbUser.email) {
          userOnboarding = record;
          break;
        }
      }
    }

    if (!userOnboarding) {
      try {
        const found = await fastify.prisma.userOnboarding.findFirst({
          where: {
            OR: [
              { userId: dbUser.id },
              { userId: dbUser.email },
            ],
          },
          orderBy: { updatedAt: 'desc' },
        });
        if (found) userOnboarding = found;
      } catch {}
    }

    return reply.send({
      success: true,
      sessionToken: (request as any).user?.sessionToken,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: resolvedName,
        fullName: resolvedName,
        role: dbUser.role || 'STUDENT',
        avatarUrl: dbUser.avatarUrl,
        isEmailVerified: Boolean(dbUser.isEmailVerified),
        onboarding: userOnboarding,
      },
    });
  });

  fastify.post('/logout', async (request, reply) => {
    clearAuthCookie(reply);
    let userId: string | undefined;
    let sessionToken: string | undefined;

    try {
      const cookieToken = (request as any).cookies?.access_token;
      let token = cookieToken;
      if (!token) {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }
      if (token) {
        const decoded = fastify.jwt.verify<any>(token);
        userId = decoded?.id;
        sessionToken = decoded?.sessionToken;
      }
    } catch {}

    if (userId || sessionToken) {
      await authService.logout(userId || '', sessionToken || '').catch(() => {});
    }
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

  // Forgot Password - Request Password Reset Link (via Resend)
  fastify.post('/forgot-password-link', async (request, reply) => {
    const body = request.body as any;
    if (!body?.email) {
      return reply.status(400).send({ error: 'BadRequest', message: 'Email is required' });
    }
    const result = await authService.requestPasswordResetLink(body.email, body.portalType || 'admin');
    return reply.send(result);
  });

  // Verify Reset Token from Link
  fastify.get('/verify-reset-token', async (request, reply) => {
    const query = request.query as any;
    if (!query?.token) {
      return reply.status(400).send({ error: 'BadRequest', message: 'Token is required' });
    }
    try {
      const result = await authService.verifyResetToken(query.token);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: 'InvalidToken', message: err.message || 'Invalid or expired token' });
    }
  });

  // Reset Password via Link Token
  fastify.post('/reset-password-link', async (request, reply) => {
    const body = request.body as any;
    if (!body?.token || !body?.newPassword) {
      return reply.status(400).send({ error: 'BadRequest', message: 'Token and newPassword are required' });
    }
    try {
      const result = await authService.resetPasswordWithToken(body.token, body.newPassword, body.email);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: 'ResetFailed', message: err.message || 'Failed to reset password' });
    }
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
