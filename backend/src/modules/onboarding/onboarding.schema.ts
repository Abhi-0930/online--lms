import { Type } from '@fastify/type-provider-typebox';

export const saveStep1Schema = {
  body: Type.Object({
    educationStatus: Type.String(),
    userId: Type.Optional(Type.String()),
  }),
};

export const saveStep2Schema = {
  body: Type.Object({
    targetRoles: Type.Union([Type.Array(Type.String()), Type.String()]),
    userId: Type.Optional(Type.String()),
  }),
};

export const onboardingResponseSchema = {
  200: Type.Object({
    id: Type.String(),
    userId: Type.String(),
    educationStatus: Type.Union([Type.String(), Type.Null()]),
    targetDomain: Type.Union([Type.String(), Type.Null()]),
    experienceLevel: Type.Union([Type.String(), Type.Null()]),
    primaryGoal: Type.Union([Type.String(), Type.Null()]),
    completedStep: Type.Number(),
    isCompleted: Type.Boolean(),
  }),
};
