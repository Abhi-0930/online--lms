import { Type } from '@fastify/type-provider-typebox';

export const updateProgressSchema = {
  body: Type.Object({
    isCompleted: Type.Optional(Type.Boolean()),
    watchTimeSeconds: Type.Optional(Type.Number()),
  }),
};

export const enrollSchema = {
  body: Type.Object({
    expiresAt: Type.Optional(Type.String()),
  }),
};
