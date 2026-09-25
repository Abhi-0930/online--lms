import { Type } from '@fastify/type-provider-typebox';

export const registerSchema = {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8 }),
    fullName: Type.String({ minLength: 2 }),
    deviceId: Type.Optional(Type.String()),
    deviceName: Type.Optional(Type.String()),
  }),
};

export const loginSchema = {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String(),
    deviceId: Type.String(),
    deviceName: Type.String(),
    force: Type.Optional(Type.Boolean()),
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

export const googleCallbackSchema = {
  querystring: Type.Object({
    code: Type.Optional(Type.String()),
    state: Type.Optional(Type.String()),
    error: Type.Optional(Type.String()),
    iss: Type.Optional(Type.String()),
    scope: Type.Optional(Type.String()),
    authuser: Type.Optional(Type.String()),
    prompt: Type.Optional(Type.String()),
  }, { additionalProperties: true }),
};

export const googleTokenSchema = {
  body: Type.Object({
    idToken: Type.String(),
    deviceId: Type.String(),
    deviceName: Type.String(),
    force: Type.Optional(Type.Boolean()),
  }),
};

export const forgotPasswordSchema = {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
  }),
};

export const verifyOtpSchema = {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    otp: Type.String({ minLength: 6, maxLength: 6 }),
  }),
};

export const resetPasswordSchema = {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    resetToken: Type.String(),
    newPassword: Type.String({ minLength: 8 }),
  }),
};

