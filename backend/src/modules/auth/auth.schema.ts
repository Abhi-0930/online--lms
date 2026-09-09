import { Type } from '@fastify/type-provider-typebox';

export const registerSchema = {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8 }),
    fullName: Type.String({ minLength: 2 }),
  }),
};

export const loginSchema = {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String(),
    deviceId: Type.String(),
    deviceName: Type.String(),
  }),
};

export const revokeDeviceSchema = {
  body: Type.Object({
    sessionToken: Type.String(),
  }),
};

export const authResponseSchema = {
  200: Type.Object({
    user: Type.Object({
      id: Type.String(),
      email: Type.String(),
      name: Type.String(),
      role: Type.String(),
    }),
    sessionToken: Type.String(),
    accessToken: Type.String(),
  }),
};

export const deviceListSchema = {
  200: Type.Array(
    Type.Object({
      sessionToken: Type.String(),
      deviceId: Type.String(),
      deviceName: Type.String(),
      ipAddress: Type.String(),
      userAgent: Type.String(),
      lastActiveAt: Type.String(),
      createdAt: Type.String(),
    })
  ),
};
