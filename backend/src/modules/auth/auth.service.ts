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
}
