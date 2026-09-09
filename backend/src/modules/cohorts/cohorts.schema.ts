import { Type } from '@fastify/type-provider-typebox';

export const createCohortSchema = {
  body: Type.Object({
    courseId: Type.String(),
    name: Type.String(),
    description: Type.Optional(Type.String()),
    startDate: Type.String(),
    endDate: Type.String(),
    instructorId: Type.String(),
    maxStudents: Type.Optional(Type.Number()),
    imageUrl: Type.Optional(Type.String()),
  }),
};

export const updateCohortSchema = {
  body: Type.Object({
    name: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    startDate: Type.Optional(Type.String()),
    endDate: Type.Optional(Type.String()),
    maxStudents: Type.Optional(Type.Number()),
    status: Type.Optional(Type.String()),
    imageUrl: Type.Optional(Type.String()),
  }),
};

export const enrollInCohortSchema = {
  body: Type.Object({
    cohortId: Type.String(),
  }),
};
