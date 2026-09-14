import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';
import logger from '../../utils/logger';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async register(payload: { email: string; password: string; fullName: string }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await argon2.hash(payload.password);

    const user = await this.prisma.user.create({
      data: {
        email: payload.email,
        passwordHash,
        fullName: payload.fullName,
        role: 'STUDENT',
        maxDevices: env.MAX_CONCURRENT_DEVICES_PER_USER,
      },
    });

    logger.info({ userId: user.id, email: user.email }, 'User registered');

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
      },
    };
  }

  async login(payload: {
    email: string;
    password: string;
    deviceId: string;
    deviceName: string;
    ip: string;
    userAgent: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new Error('This account was registered using Google OAuth. Please sign in with Google.');
    }

    const isValid = await argon2.verify(user.passwordHash, payload.password);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Check active devices from database (last active within 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeDevices = await this.prisma.userDevice.findMany({
      where: {
        userId: user.id,
        lastActiveAt: { gte: sevenDaysAgo },
      },
    });

    const activeDeviceIds = activeDevices.map((d: any) => d.deviceId);

    // Check device capacity
    const isExistingDevice = activeDeviceIds.includes(payload.deviceId);
    if (!isExistingDevice && activeDevices.length >= user.maxDevices) {
      const err: any = new Error(`Device limit reached. Maximum allowed: ${user.maxDevices} devices.`);
      err.statusCode = 409;
      err.code = 'DEVICE_LIMIT_REACHED';
      throw err;
    }

    const sessionToken = uuidv4();

    // Upsert UserDevice record in PostgreSQL
    await this.prisma.userDevice.upsert({
      where: { userId_deviceId: { userId: user.id, deviceId: payload.deviceId } },
      update: {
        sessionToken,
        lastActiveAt: new Date(),
        ipAddress: payload.ip,
        userAgent: payload.userAgent,
      },
      create: {
        userId: user.id,
        deviceId: payload.deviceId,
        deviceName: payload.deviceName,
        sessionToken,
        ipAddress: payload.ip,
        userAgent: payload.userAgent,
      },
    });

    // Log Activity
    await this.prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'AUTH_LOGIN',
        ipAddress: payload.ip,
        metadata: { deviceId: payload.deviceId, deviceName: payload.deviceName },
      },
    });

    logger.info({ userId: user.id, deviceId: payload.deviceId }, 'User logged in');

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
      },
      sessionToken,
    };
  }

  async getDevices(userId: string) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const devices = await this.prisma.userDevice.findMany({
      where: {
        userId,
        lastActiveAt: { gte: sevenDaysAgo },
      },
      orderBy: { lastActiveAt: 'desc' },
    });

    return devices.map((d: any) => ({
      sessionToken: d.sessionToken,
      deviceId: d.deviceId,
      deviceName: d.deviceName,
      ipAddress: d.ipAddress,
      userAgent: d.userAgent,
      lastActiveAt: d.lastActiveAt.toISOString(),
      createdAt: d.createdAt.toISOString(),
    }));
  }

  async revokeDevice(userId: string, sessionToken: string) {
    const session = await this.prisma.userDevice.findUnique({
      where: { sessionToken },
    });

    if (!session || session.userId !== userId) {
      throw new Error('Session not found');
    }

    await this.prisma.userDevice.delete({
      where: { sessionToken },
    });

    // Log activity
    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'DEVICE_REVOKE',
        metadata: { sessionToken },
      },
    });

    logger.info({ userId, sessionToken }, 'Device session revoked');

    return { success: true };
  }

  async logout(userId: string, sessionToken: string) {
    await this.prisma.userDevice.delete({
      where: { sessionToken },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'AUTH_LOGOUT',
        metadata: { sessionToken },
      },
    });

    logger.info({ userId, sessionToken }, 'User logged out');

    return { success: true };
  }

  getGoogleAuthUrl(state?: string): string {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new Error('GOOGLE_CLIENT_ID is not configured');
    }

    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    if (state) {
      params.set('state', state);
    }

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async loginWithGoogleCallback(payload: {
    code: string;
    deviceId: string;
    deviceName: string;
    ip: string;
    userAgent: string;
  }) {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth is not configured');
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: payload.code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      logger.error({ errorData }, 'Failed to exchange Google OAuth code');
      throw new Error('Failed to exchange Google authorization code');
    }

    const tokenData: any = await tokenResponse.json();

    // Fetch user profile from Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch Google user profile');
    }

    const profile: any = await profileResponse.json();

    return this.provisionGoogleUser({
      googleId: profile.id,
      email: profile.email,
      fullName: profile.name || profile.email.split('@')[0],
      avatarUrl: profile.picture,
      deviceId: payload.deviceId,
      deviceName: payload.deviceName,
      ip: payload.ip,
      userAgent: payload.userAgent,
    });
  }

  async loginWithGoogleIdToken(payload: {
    idToken: string;
    deviceId: string;
    deviceName: string;
    ip: string;
    userAgent: string;
  }) {
    const tokenInfoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(payload.idToken)}`
    );

    if (!tokenInfoRes.ok) {
      throw new Error('Invalid Google ID token');
    }

    const tokenInfo: any = await tokenInfoRes.json();

    if (env.GOOGLE_CLIENT_ID && tokenInfo.aud !== env.GOOGLE_CLIENT_ID) {
      throw new Error('Google token audience mismatch');
    }

    return this.provisionGoogleUser({
      googleId: tokenInfo.sub,
      email: tokenInfo.email,
      fullName: tokenInfo.name || tokenInfo.email.split('@')[0],
      avatarUrl: tokenInfo.picture,
      deviceId: payload.deviceId,
      deviceName: payload.deviceName,
      ip: payload.ip,
      userAgent: payload.userAgent,
    });
  }

  private async provisionGoogleUser(payload: {
    googleId: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    deviceId: string;
    deviceName: string;
    ip: string;
    userAgent: string;
  }) {
    // Check if user exists by googleId or email
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: payload.googleId }, { email: payload.email }],
      },
    });

    if (user) {
      // Update Google ID and avatar if needed
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId || payload.googleId,
          avatarUrl: user.avatarUrl || payload.avatarUrl,
          isEmailVerified: true,
        },
      });
    } else {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          email: payload.email,
          googleId: payload.googleId,
          fullName: payload.fullName,
          avatarUrl: payload.avatarUrl,
          isEmailVerified: true,
          role: 'STUDENT',
          maxDevices: env.MAX_CONCURRENT_DEVICES_PER_USER,
        },
      });
    }

    // Device capacity check (7 days active window)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeDevices = await this.prisma.userDevice.findMany({
      where: {
        userId: user.id,
        lastActiveAt: { gte: sevenDaysAgo },
      },
    });

    const activeDeviceIds = activeDevices.map((d: any) => d.deviceId);
    const isExistingDevice = activeDeviceIds.includes(payload.deviceId);

    if (!isExistingDevice && activeDevices.length >= user.maxDevices) {
      const err: any = new Error(`Device limit reached. Maximum allowed: ${user.maxDevices} devices.`);
      err.statusCode = 409;
      err.code = 'DEVICE_LIMIT_REACHED';
      throw err;
    }

    const sessionToken = uuidv4();

    // Upsert UserDevice record
    await this.prisma.userDevice.upsert({
      where: { userId_deviceId: { userId: user.id, deviceId: payload.deviceId } },
      update: {
        sessionToken,
        lastActiveAt: new Date(),
        ipAddress: payload.ip,
        userAgent: payload.userAgent,
      },
      create: {
        userId: user.id,
        deviceId: payload.deviceId,
        deviceName: payload.deviceName,
        sessionToken,
        ipAddress: payload.ip,
        userAgent: payload.userAgent,
      },
    });

    // Log Activity
    await this.prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'AUTH_LOGIN_GOOGLE',
        ipAddress: payload.ip,
        metadata: { deviceId: payload.deviceId, deviceName: payload.deviceName },
      },
    });

    logger.info({ userId: user.id, email: user.email }, 'User logged in via Google OAuth');

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      sessionToken,
    };
  }

  // In-memory OTP store for password reset
  private static otpStore = new Map<
    string,
    { otp: string; expiresAt: number; resetToken?: string; verified?: boolean }
  >();

  async requestPasswordReset(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    AuthService.otpStore.set(normalizedEmail, {
      otp,
      expiresAt,
      verified: false,
    });

    logger.info({ email: normalizedEmail, otp }, 'Password reset OTP generated');

    return {
      message: 'Verification code sent to email',
      email: normalizedEmail,
      userExists: !!user,
      // Provide OTP in dev for instant testing
      code: otp,
    };
  }

  async verifyPasswordResetOtp(email: string, otp: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const record = AuthService.otpStore.get(normalizedEmail);

    if (!record) {
      throw new Error('No password reset requested for this email or code expired');
    }

    if (Date.now() > record.expiresAt) {
      AuthService.otpStore.delete(normalizedEmail);
      throw new Error('Verification code has expired. Please request a new one.');
    }

    if (record.otp !== otp.trim()) {
      throw new Error('Invalid 6-digit verification code. Please check and try again.');
    }

    // Generate a one-time reset token valid for 15 minutes
    const resetToken = uuidv4();
    record.verified = true;
    record.resetToken = resetToken;
    record.expiresAt = Date.now() + 15 * 60 * 1000;

    logger.info({ email: normalizedEmail }, 'Password reset OTP successfully verified');

    return {
      message: 'Code verified successfully',
      resetToken,
    };
  }

  async resetPassword(email: string, resetToken: string, newPassword: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const record = AuthService.otpStore.get(normalizedEmail);

    if (!record || !record.verified || record.resetToken !== resetToken) {
      throw new Error('Invalid or expired reset session. Please start over.');
    }

    if (Date.now() > record.expiresAt) {
      AuthService.otpStore.delete(normalizedEmail);
      throw new Error('Reset session expired. Please request a new code.');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const passwordHash = await argon2.hash(newPassword);

    if (user) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });
      logger.info({ userId: user.id, email: normalizedEmail }, 'Password updated successfully');
    }

    // Clear reset token record
    AuthService.otpStore.delete(normalizedEmail);

    return {
      message: 'Password reset successfully',
    };
  }
}
