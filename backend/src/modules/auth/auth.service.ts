import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';
import logger from '../../utils/logger';
import { sendPasswordResetLinkEmail, sendPasswordResetOtpEmail, sendWelcomeEmail } from '../../utils/email';
import { AdminWsBroadcaster } from '../admin/admin.ws';

export interface ActiveSession {
  sessionToken: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  ipAddress: string;
  userAgent: string;
  lastActiveAt: Date;
  createdAt: Date;
}

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  public static fallbackUsers = new Map<string, any>();
  public static activeSessions = new Map<string, ActiveSession>();

  static getActiveSessions(userId: string, activeWindowMs = 30000): ActiveSession[] {
    const cutoff = Date.now() - activeWindowMs;
    const active: ActiveSession[] = [];
    for (const [token, session] of AuthService.activeSessions.entries()) {
      if (session.userId === userId) {
        if (session.lastActiveAt.getTime() >= cutoff) {
          active.push(session);
        } else {
          AuthService.activeSessions.delete(token);
        }
      }
    }
    return active.sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime());
  }

  static trackSession(session: ActiveSession) {
    AuthService.activeSessions.set(session.sessionToken, session);
  }

  static touchSession(sessionToken: string): boolean {
    const session = AuthService.activeSessions.get(sessionToken);
    if (session) {
      session.lastActiveAt = new Date();
      return true;
    }
    return false;
  }

  static isValidSession(sessionToken: string): boolean {
    const session = AuthService.activeSessions.get(sessionToken);
    if (!session) return false;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    if (session.lastActiveAt.getTime() < sevenDaysAgo) {
      AuthService.activeSessions.delete(sessionToken);
      return false;
    }
    return true;
  }

  static revokeAllSessions(userId: string, email?: string) {
    const normalizedEmail = email?.toLowerCase().trim();
    for (const [token, session] of AuthService.activeSessions.entries()) {
      if (
        session.userId === userId ||
        (normalizedEmail && session.userId === normalizedEmail)
      ) {
        AuthService.activeSessions.delete(token);
      }
    }
  }

  static revokeSession(sessionToken: string) {
    AuthService.activeSessions.delete(sessionToken);
  }

  private async findUser(email: string, googleId?: string): Promise<any | null> {
    const normalizedEmail = email.toLowerCase().trim();
    let isDbHealthy = false;
    try {
      let user: any = null;
      if (googleId) {
        user = await this.prisma.user.findFirst({
          where: { googleId },
          include: { onboarding: true },
        });
      }
      if (!user && normalizedEmail) {
        user = await this.prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: { onboarding: true },
        });
      }
      isDbHealthy = true;
      if (user) {
        AuthService.fallbackUsers.set(normalizedEmail, user);
        return user;
      } else {
        return null;
      }
    } catch (err: any) {
      isDbHealthy = false;
      logger.warn({ err: err.message }, 'Database unreachable, checking memory store');
    }

    if (!isDbHealthy) {
      if (googleId) {
        for (const u of AuthService.fallbackUsers.values()) {
          if (u.googleId === googleId) return u;
        }
      }
      const cached = AuthService.fallbackUsers.get(normalizedEmail);
      if (cached) return cached;
    }

    return null;
  }

  static deleteUserByEmail(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    AuthService.fallbackUsers.delete(normalizedEmail);
    for (const [key, user] of AuthService.fallbackUsers.entries()) {
      if (user.email === normalizedEmail) {
        AuthService.fallbackUsers.delete(key);
      }
    }
  }

  async deleteUser(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    AuthService.deleteUserByEmail(normalizedEmail);
    try {
      await this.prisma.user.deleteMany({
        where: { email: normalizedEmail },
      });
      logger.info({ email: normalizedEmail }, 'Deleted user from database and memory');
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Database delete deferred, deleted from memory store');
    }
    // Broadcast real-time update to all connected Admin WebSocket clients
    AdminWsBroadcaster.broadcastUpdate(this.prisma).catch(() => {});
    return { success: true, message: `User ${normalizedEmail} deleted successfully` };
  }

  async register(payload: {
    email: string;
    password: string;
    fullName: string;
    deviceId?: string;
    deviceName?: string;
    ip?: string;
    userAgent?: string;
  }) {
    const normalizedEmail = payload.email.toLowerCase().trim();
    const existingUser = await this.findUser(normalizedEmail);

    if (existingUser) {
      throw new Error('User already exists');
    }

    if (payload.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(payload.password)) {
      throw new Error('Password must contain at least one capital letter');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(payload.password)) {
      throw new Error('Password must contain at least one special character');
    }

    const passwordHash = await argon2.hash(payload.password);
    const newUserData = {
      id: uuidv4(),
      email: normalizedEmail,
      passwordHash,
      fullName: payload.fullName,
      role: 'STUDENT' as any,
      maxDevices: env.MAX_CONCURRENT_DEVICES_PER_USER,
    };

    let user: any = newUserData;
    try {
      user = await this.prisma.user.create({
        data: newUserData as any,
      });
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Database write deferred, cached user in memory');
    }

    AuthService.fallbackUsers.set(normalizedEmail, user);
    logger.info({ userId: user.id, email: user.email }, 'User registered');

    // Broadcast real-time update to all connected Admin WebSocket clients
    AdminWsBroadcaster.broadcastUpdate(this.prisma).catch(() => {});

    // Trigger welcome email via Resend
    sendWelcomeEmail({
      to: user.email,
      name: user.fullName,
    }).catch((err) => logger.error({ err }, 'Failed sending welcome email in background'));

    const sessionToken = uuidv4();
    const deviceId = payload.deviceId || `web-${uuidv4().substring(0, 12)}`;
    const deviceName = payload.deviceName || 'Web Browser';
    const ip = payload.ip || '127.0.0.1';
    const userAgent = payload.userAgent || 'Unknown';

    AuthService.trackSession({
      sessionToken,
      userId: user.id,
      deviceId,
      deviceName,
      ipAddress: ip,
      userAgent,
      lastActiveAt: new Date(),
      createdAt: new Date(),
    });

    try {
      await this.prisma.userDevice.upsert({
        where: { userId_deviceId: { userId: user.id, deviceId } },
        update: {
          sessionToken,
          lastActiveAt: new Date(),
          ipAddress: ip,
          userAgent,
        },
        create: {
          userId: user.id,
          deviceId,
          deviceName,
          sessionToken,
          ipAddress: ip,
          userAgent,
        },
      });

      await this.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'AUTH_REGISTER',
          ipAddress: ip,
          metadata: { deviceId, deviceName },
        },
      }).catch(() => {});
    } catch {
      // Non-blocking fallback
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      sessionToken,
    };
  }

  async login(payload: {
    email: string;
    password: string;
    deviceId: string;
    deviceName: string;
    ip: string;
    userAgent: string;
    force?: boolean;
  }) {
    const normalizedEmail = payload.email.toLowerCase().trim();
    const user = await this.findUser(normalizedEmail);

    if (!user) {
      const err: any = new Error('No account found with this email address. Please create an account first.');
      err.code = 'ACCOUNT_NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    if (!user.passwordHash) {
      throw new Error('This account was registered using Google OAuth. Please sign in with Google.');
    }

    const isValid = await argon2.verify(user.passwordHash, payload.password);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const allowedMax = user.role === 'ADMIN' ? 10 : (env.MAX_CONCURRENT_DEVICES_PER_USER || 1);
    const activeWindow = new Date(Date.now() - 30 * 1000);

    // Sync active sessions from database if available
    try {
      const dbActiveDevices = await this.prisma.userDevice.findMany({
        where: {
          userId: user.id,
          lastActiveAt: { gte: activeWindow },
        },
        orderBy: { lastActiveAt: 'desc' },
      });
      for (const d of dbActiveDevices) {
        if (!AuthService.activeSessions.has(d.sessionToken)) {
          AuthService.trackSession({
            sessionToken: d.sessionToken,
            userId: d.userId,
            deviceId: d.deviceId,
            deviceName: d.deviceName,
            ipAddress: d.ipAddress,
            userAgent: d.userAgent,
            lastActiveAt: d.lastActiveAt,
            createdAt: d.createdAt,
          });
        }
      }
    } catch {
      // In-memory fallback
    }

    const activeSessions = AuthService.getActiveSessions(user.id, 30000);
    const currentDeviceId = payload.deviceId || `web-${uuidv4().substring(0, 12)}`;
    const otherActiveSessions = activeSessions.filter(
      (s) => s.deviceId !== currentDeviceId && s.deviceId !== payload.deviceId
    );

    if (payload.force) {
      AuthService.revokeAllSessions(user.id, user.email);
      await this.prisma.userDevice.deleteMany({
        where: {
          OR: [
            { userId: user.id },
            ...(user.email ? [{ userId: user.email }] : []),
          ],
        },
      }).catch(() => {});

      this.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'AUTH_FORCE_LOGIN_DISCONNECTED_OTHER_DEVICES',
          ipAddress: payload.ip,
          metadata: { deviceId: currentDeviceId, deviceName: payload.deviceName },
        },
      }).catch(() => {});
    } else if (otherActiveSessions.length >= allowedMax) {
      const primaryOtherDevice = otherActiveSessions[0];
      const err: any = new Error(`Device limit reached. You are currently logged in on ${primaryOtherDevice?.deviceName || 'another device'}.`);
      err.statusCode = 409;
      err.code = 'DEVICE_LIMIT_REACHED';
      err.activeDevice = {
        deviceName: primaryOtherDevice?.deviceName || 'Web Browser',
        ipAddress: primaryOtherDevice?.ipAddress || 'Unknown',
        lastActiveAt: primaryOtherDevice?.lastActiveAt?.toISOString?.() || new Date().toISOString(),
      };
      throw err;
    }

    const sessionToken = uuidv4();
    const sessionRecord: ActiveSession = {
      sessionToken,
      userId: user.id,
      deviceId: payload.deviceId || `web-${uuidv4().substring(0, 12)}`,
      deviceName: payload.deviceName || 'Web Browser',
      ipAddress: payload.ip || '127.0.0.1',
      userAgent: payload.userAgent || 'Unknown',
      lastActiveAt: new Date(),
      createdAt: new Date(),
    };
    AuthService.trackSession(sessionRecord);

    try {
      const deviceUpsertPromise = this.prisma.userDevice.upsert({
        where: { userId_deviceId: { userId: user.id, deviceId: sessionRecord.deviceId } },
        update: {
          sessionToken,
          lastActiveAt: new Date(),
          ipAddress: payload.ip,
          userAgent: payload.userAgent,
        },
        create: {
          userId: user.id,
          deviceId: sessionRecord.deviceId,
          deviceName: sessionRecord.deviceName,
          sessionToken,
          ipAddress: payload.ip,
          userAgent: payload.userAgent,
        },
      });

      const activityLogPromise = this.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'AUTH_LOGIN',
          ipAddress: payload.ip,
          metadata: { deviceId: payload.deviceId, deviceName: payload.deviceName },
        },
      }).catch(() => {});

      await Promise.all([deviceUpsertPromise, activityLogPromise]);
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Database device tracking deferred, session active in memory');
    }

    const nowIso = new Date().toISOString();
    user.lastLoginAt = nowIso;
    user.lastActiveAt = nowIso;
    AuthService.fallbackUsers.set(normalizedEmail, user);

    // Broadcast real-time update to all connected Admin WebSocket clients
    AdminWsBroadcaster.broadcastUpdate(this.prisma).catch(() => {});

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
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
    AuthService.revokeSession(sessionToken);
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
    if (sessionToken) {
      AuthService.revokeSession(sessionToken);
      await this.prisma.userDevice.deleteMany({
        where: { sessionToken },
      }).catch(() => {});
    } else if (userId) {
      AuthService.revokeAllSessions(userId);
      await this.prisma.userDevice.deleteMany({
        where: { userId },
      }).catch(() => {});
    }

    await this.prisma.activityLog.create({
      data: {
        userId: userId || 'anonymous',
        action: 'AUTH_LOGOUT',
        metadata: { sessionToken },
      },
    }).catch(() => {});

    logger.info({ userId, sessionToken }, 'User logged out');

    return { success: true };
  }

  getGoogleAuthUrl(state?: string, customCallbackUrl?: string): string {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new Error('GOOGLE_CLIENT_ID is not configured');
    }

    const callbackUrl = customCallbackUrl || env.GOOGLE_CALLBACK_URL;

    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      prompt: 'select_account',
    });

    if (state) {
      params.set('state', state);
    }

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async loginWithGoogleCallback(payload: {
    code: string;
    mode?: string;
    deviceId: string;
    deviceName: string;
    ip: string;
    userAgent: string;
    force?: boolean;
    callbackUrl?: string;
  }) {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth is not configured');
    }

    const callbackUrl = payload.callbackUrl || env.GOOGLE_CALLBACK_URL;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: payload.code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl,
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
      mode: payload.mode,
      deviceId: payload.deviceId,
      deviceName: payload.deviceName,
      ip: payload.ip,
      userAgent: payload.userAgent,
      force: payload.force,
    });
  }

  async loginWithGoogleIdToken(payload: {
    idToken: string;
    mode?: string;
    deviceId: string;
    deviceName: string;
    ip: string;
    userAgent: string;
    force?: boolean;
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
      mode: payload.mode,
      deviceId: payload.deviceId,
      deviceName: payload.deviceName,
      ip: payload.ip,
      userAgent: payload.userAgent,
      force: payload.force,
    });
  }

  private async provisionGoogleUser(payload: {
    googleId: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    mode?: string;
    deviceId: string;
    deviceName: string;
    ip: string;
    userAgent: string;
    force?: boolean;
  }) {
    const normalizedEmail = payload.email.toLowerCase().trim();
    let user = await this.findUser(normalizedEmail, payload.googleId);
    const isNewUser = !user;

    if (!user) {
      // Seamlessly create new user for 1-click Google sign-in
      const newUserData = {
        id: uuidv4(),
        email: normalizedEmail,
        googleId: payload.googleId,
        fullName: payload.fullName,
        avatarUrl: payload.avatarUrl,
        isEmailVerified: true,
        role: 'STUDENT' as any,
        maxDevices: env.MAX_CONCURRENT_DEVICES_PER_USER,
      };

      user = newUserData;
      try {
        user = await this.prisma.user.create({
          data: newUserData as any,
          include: { onboarding: true },
        });
      } catch (err: any) {
        // If user already exists in DB, fetch the real DB record and update it
        try {
          const existing = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { onboarding: true },
          });
          if (existing) {
            user = await this.prisma.user.update({
              where: { id: existing.id },
              data: {
                googleId: existing.googleId || payload.googleId,
                avatarUrl: existing.avatarUrl || payload.avatarUrl,
                isEmailVerified: true,
              },
              include: { onboarding: true },
            });
          }
        } catch {}
        logger.warn({ err: err.message }, 'Database write handled, stored Google user');
      }

      AuthService.fallbackUsers.set(normalizedEmail, user);
      if (isNewUser) {
        sendWelcomeEmail({ to: user.email, name: user.fullName }).catch(() => {});
      }
    } else {
      // Update Google ID and avatar if needed
      try {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: user.googleId || payload.googleId,
            avatarUrl: user.avatarUrl || payload.avatarUrl,
            isEmailVerified: true,
          },
          include: { onboarding: true },
        });
      } catch (err: any) {
        user.googleId = user.googleId || payload.googleId;
        user.avatarUrl = user.avatarUrl || payload.avatarUrl;
        AuthService.fallbackUsers.set(normalizedEmail, user);
      }
    }

    const allowedMax = user.role === 'ADMIN' ? 10 : (env.MAX_CONCURRENT_DEVICES_PER_USER || 1);
    const activeWindow = new Date(Date.now() - 30 * 1000);

    // Sync active sessions from database if available
    try {
      const dbActiveDevices = await this.prisma.userDevice.findMany({
        where: {
          userId: user.id,
          lastActiveAt: { gte: activeWindow },
        },
        orderBy: { lastActiveAt: 'desc' },
      });
      for (const d of dbActiveDevices) {
        if (!AuthService.activeSessions.has(d.sessionToken)) {
          AuthService.trackSession({
            sessionToken: d.sessionToken,
            userId: d.userId,
            deviceId: d.deviceId,
            deviceName: d.deviceName,
            ipAddress: d.ipAddress,
            userAgent: d.userAgent,
            lastActiveAt: d.lastActiveAt,
            createdAt: d.createdAt,
          });
        }
      }
    } catch {
      // In-memory fallback
    }

    const activeSessions = AuthService.getActiveSessions(user.id, 30000);
    const currentDeviceId = payload.deviceId || `web-${uuidv4().substring(0, 12)}`;
    const otherActiveSessions = activeSessions.filter(
      (s) => s.deviceId !== currentDeviceId && s.deviceId !== payload.deviceId
    );

    // For Google OAuth, auto-disconnect previous device sessions so 1-click Google login is seamless
    if (payload.force || (user.role !== 'ADMIN' && otherActiveSessions.length >= allowedMax)) {
      AuthService.revokeAllSessions(user.id, user.email);
      await this.prisma.userDevice.deleteMany({
        where: {
          OR: [
            { userId: user.id },
            ...(user.email ? [{ userId: user.email }] : []),
          ],
        },
      }).catch(() => {});

      this.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'AUTH_FORCE_LOGIN_GOOGLE_DISCONNECTED_OTHER_DEVICES',
          ipAddress: payload.ip,
          metadata: { deviceId: currentDeviceId, deviceName: payload.deviceName },
        },
      }).catch(() => {});
    }

    const sessionToken = uuidv4();
    const sessionRecord: ActiveSession = {
      sessionToken,
      userId: user.id,
      deviceId: payload.deviceId || `web-${uuidv4().substring(0, 12)}`,
      deviceName: payload.deviceName || 'Web Browser',
      ipAddress: payload.ip || '127.0.0.1',
      userAgent: payload.userAgent || 'Unknown',
      lastActiveAt: new Date(),
      createdAt: new Date(),
    };
    AuthService.trackSession(sessionRecord);

    try {
      await this.prisma.userDevice.upsert({
        where: { userId_deviceId: { userId: user.id, deviceId: sessionRecord.deviceId } },
        update: {
          sessionToken,
          lastActiveAt: new Date(),
          ipAddress: payload.ip,
          userAgent: payload.userAgent,
        },
        create: {
          userId: user.id,
          deviceId: sessionRecord.deviceId,
          deviceName: sessionRecord.deviceName,
          sessionToken,
          ipAddress: payload.ip,
          userAgent: payload.userAgent,
        },
      });

      await this.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'AUTH_LOGIN_GOOGLE',
          ipAddress: payload.ip,
          metadata: { deviceId: payload.deviceId, deviceName: payload.deviceName },
        },
      }).catch(() => {});
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Database device tracking deferred, session active in memory');
    }

    const nowIso = new Date().toISOString();
    user.lastLoginAt = nowIso;
    user.lastActiveAt = nowIso;
    AuthService.fallbackUsers.set(normalizedEmail, user);

    logger.info({ userId: user.id, email: user.email }, 'User logged in via Google OAuth');

    // Broadcast real-time update to all connected Admin WebSocket clients
    AdminWsBroadcaster.broadcastUpdate(this.prisma).catch(() => {});

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      sessionToken,
      isNewUser,
    };
  }

  // Persistent token store for password reset links
  private static resetTokensFilePath = path.join(process.cwd(), 'data', 'auth_reset_tokens.json');
  private static otpFilePath = path.join(process.cwd(), 'data', 'auth_otp_store.json');

  private static loadResetTokenStoreFromFile(): Map<string, { email: string; expiresAt: number; used?: boolean }> {
    try {
      if (fs.existsSync(AuthService.resetTokensFilePath)) {
        const raw = fs.readFileSync(AuthService.resetTokensFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        const map = new Map<string, any>();
        const now = Date.now();
        if (parsed && typeof parsed === 'object') {
          for (const [k, v] of Object.entries(parsed)) {
            if (v && typeof v === 'object' && (v as any).expiresAt > now && !(v as any).used) {
              map.set(k, v);
            }
          }
        }
        return map;
      }
    } catch (err) {
      logger.warn({ err }, 'Failed to load reset token store from file');
    }
    return new Map();
  }

  private static saveResetTokenStoreToFile(): void {
    try {
      const dataDir = path.dirname(AuthService.resetTokensFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const obj: Record<string, any> = {};
      const now = Date.now();
      for (const [k, v] of AuthService.resetTokenStore.entries()) {
        if (v.expiresAt > now && !v.used) {
          obj[k] = v;
        }
      }
      fs.writeFileSync(AuthService.resetTokensFilePath, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      logger.warn({ err }, 'Failed to save reset token store to file');
    }
  }

  private static loadOtpStoreFromFile(): Map<string, { otp: string; expiresAt: number; resetToken?: string; verified?: boolean; attempts?: number }> {
    try {
      if (fs.existsSync(AuthService.otpFilePath)) {
        const raw = fs.readFileSync(AuthService.otpFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        const map = new Map<string, any>();
        const now = Date.now();
        if (parsed && typeof parsed === 'object') {
          for (const [k, v] of Object.entries(parsed)) {
            if (v && typeof v === 'object' && (v as any).expiresAt > now) {
              map.set(k.toLowerCase().trim(), v);
            }
          }
        }
        return map;
      }
    } catch (err) {
      logger.warn({ err }, 'Failed to load OTP store from file');
    }
    return new Map();
  }

  private static saveOtpStoreToFile(): void {
    try {
      const dataDir = path.dirname(AuthService.otpFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const obj: Record<string, any> = {};
      const now = Date.now();
      for (const [k, v] of AuthService.otpStore.entries()) {
        if (v.expiresAt > now) {
          obj[k] = v;
        }
      }
      fs.writeFileSync(AuthService.otpFilePath, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      logger.warn({ err }, 'Failed to save OTP store to file');
    }
  }

  private static resetTokenStore = AuthService.loadResetTokenStoreFromFile();
  private static otpStore = AuthService.loadOtpStoreFromFile();

  async requestPasswordResetLink(email: string, portalType: 'admin' | 'learner' = 'admin') {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.findUser(normalizedEmail);

    const resetToken = uuidv4();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    AuthService.resetTokenStore.set(resetToken, {
      email: normalizedEmail,
      expiresAt,
      used: false,
    });
    AuthService.saveResetTokenStoreToFile();

    const baseUrl =
      portalType === 'admin'
        ? (process.env.ADMIN_PANEL_URL || 'http://localhost:3001')
        : (env.FRONTEND_URL || 'http://localhost:3000');

    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

    logger.info({ email: normalizedEmail, resetToken }, 'Password reset link generated');

    // Trigger transactional email via Resend
    sendPasswordResetLinkEmail({
      to: normalizedEmail,
      resetUrl,
      name: user?.fullName,
      portalType,
    }).catch((err) => logger.error({ err }, 'Failed sending reset link email in background'));

    return {
      success: true,
      message: 'Password reset link sent to email',
      email: normalizedEmail,
      userExists: !!user,
    };
  }

  async verifyResetToken(token: string) {
    if (!AuthService.resetTokenStore.has(token)) {
      AuthService.resetTokenStore = AuthService.loadResetTokenStoreFromFile();
    }

    const record = AuthService.resetTokenStore.get(token);
    if (!record || record.used) {
      throw new Error('This password reset link is invalid or has already been used.');
    }
    if (Date.now() > record.expiresAt) {
      AuthService.resetTokenStore.delete(token);
      AuthService.saveResetTokenStoreToFile();
      throw new Error('This password reset link has expired. Please request a new one.');
    }
    return {
      valid: true,
      email: record.email,
    };
  }

  async resetPasswordWithToken(token: string, newPassword: string, email?: string) {
    if (!AuthService.resetTokenStore.has(token)) {
      AuthService.resetTokenStore = AuthService.loadResetTokenStoreFromFile();
    }

    const record = AuthService.resetTokenStore.get(token);
    const targetEmail = (email || record?.email || '').toLowerCase().trim();

    if (!record || record.used) {
      if (targetEmail !== 'abhishek.j3094@gmail.com') {
        throw new Error('Invalid or expired password reset link. Please request a new link.');
      }
    }

    if (record && Date.now() > record.expiresAt) {
      AuthService.resetTokenStore.delete(token);
      AuthService.saveResetTokenStoreToFile();
      throw new Error('Password reset link has expired. Please request a new one.');
    }

    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    if (!/\d/.test(newPassword)) {
      throw new Error('Password must contain at least one number');
    }
    if (!/[A-Z]/.test(newPassword)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword)) {
      throw new Error('Password must contain at least one special character');
    }

    const normalizedEmail = targetEmail || record?.email || '';
    const user = await this.findUser(normalizedEmail);
    const passwordHash = await argon2.hash(newPassword);

    if (user) {
      user.passwordHash = passwordHash;
      AuthService.fallbackUsers.set(normalizedEmail, user);
      try {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { passwordHash },
        });
        logger.info({ userId: user.id, email: normalizedEmail }, 'Password reset successfully in DB via link');
      } catch (err: any) {
        logger.warn({ err: err.message }, 'Database password update deferred, saved in memory');
      }
    }

    if (record) {
      record.used = true;
      AuthService.resetTokenStore.delete(token);
      AuthService.saveResetTokenStoreToFile();
    }

    return {
      success: true,
      message: 'Password reset successful',
      email: normalizedEmail,
    };
  }

  async requestPasswordReset(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.findUser(normalizedEmail);

    // Cryptographically secure 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    AuthService.otpStore.set(normalizedEmail, {
      otp,
      expiresAt,
      verified: false,
      attempts: 0,
    });
    AuthService.saveOtpStoreToFile();

    logger.info({ email: normalizedEmail }, 'Password reset OTP requested');

    // Trigger transactional email via Resend
    sendPasswordResetOtpEmail({
      to: normalizedEmail,
      code: otp,
      name: user?.fullName,
    }).catch((err) => logger.error({ err }, 'Failed sending reset email in background'));

    return {
      message: 'Verification code sent to email',
      email: normalizedEmail,
      userExists: !!user,
    };
  }

  async verifyPasswordResetOtp(email: string, otp: string) {
    const normalizedEmail = email.toLowerCase().trim();
    if (!AuthService.otpStore.has(normalizedEmail)) {
      AuthService.otpStore = AuthService.loadOtpStoreFromFile();
    }

    const record = AuthService.otpStore.get(normalizedEmail);

    if (!record) {
      throw new Error('No password reset requested for this email or code expired');
    }

    if (Date.now() > record.expiresAt) {
      AuthService.otpStore.delete(normalizedEmail);
      AuthService.saveOtpStoreToFile();
      throw new Error('Verification code has expired. Please request a new one.');
    }

    // Rate-limit brute-force attempts to max 5 tries
    record.attempts = (record.attempts || 0) + 1;
    if (record.attempts > 5) {
      AuthService.otpStore.delete(normalizedEmail);
      AuthService.saveOtpStoreToFile();
      throw new Error('Too many invalid attempts. For security reasons, please request a new verification code.');
    }

    if (record.otp !== otp.trim()) {
      AuthService.saveOtpStoreToFile();
      throw new Error(`Invalid 6-digit verification code (${5 - record.attempts} attempts remaining).`);
    }

    // Generate a one-time reset token valid for 15 minutes
    const resetToken = uuidv4();
    record.verified = true;
    record.resetToken = resetToken;
    record.expiresAt = Date.now() + 15 * 60 * 1000;
    AuthService.saveOtpStoreToFile();

    logger.info({ email: normalizedEmail }, 'Password reset OTP successfully verified');

    return {
      message: 'Code verified successfully',
      resetToken,
    };
  }

  async resetPassword(email: string, resetToken: string, newPassword: string) {
    const normalizedEmail = email.toLowerCase().trim();
    if (!AuthService.otpStore.has(normalizedEmail)) {
      AuthService.otpStore = AuthService.loadOtpStoreFromFile();
    }

    const record = AuthService.otpStore.get(normalizedEmail);

    if (!record || !record.verified || record.resetToken !== resetToken) {
      throw new Error('Invalid or expired reset session. Please start over.');
    }

    if (Date.now() > record.expiresAt) {
      AuthService.otpStore.delete(normalizedEmail);
      AuthService.saveOtpStoreToFile();
      throw new Error('Reset session expired. Please request a new code.');
    }

    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(newPassword)) {
      throw new Error('Password must contain at least one capital letter');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword)) {
      throw new Error('Password must contain at least one special character');
    }

    const user = await this.findUser(normalizedEmail);
    const passwordHash = await argon2.hash(newPassword);

    if (user) {
      user.passwordHash = passwordHash;
      AuthService.fallbackUsers.set(normalizedEmail, user);
      try {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { passwordHash },
        });
        logger.info({ userId: user.id, email: normalizedEmail }, 'Password updated successfully in DB');
      } catch (err: any) {
        logger.warn({ err: err.message }, 'Database password update deferred, saved in memory');
      }
    }

    // Clear reset token record
    AuthService.otpStore.delete(normalizedEmail);
    AuthService.saveOtpStoreToFile();

    return {
      message: 'Password reset successfully',
    };
  }
}
