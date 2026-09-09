import { Type } from '@fastify/type-provider-typebox';

export const createCourseSchema = {
  body: Type.Object({
    slug: Type.String(),
    title: Type.String(),
    subtitle: Type.Optional(Type.String()),
    description: Type.String(),
    coverImageUrl: Type.Optional(Type.String()),
    price: Type.Optional(Type.Number()),
    status: Type.Optional(Type.Enum({ DRAFT: 'DRAFT', PUBLISHED: 'PUBLISHED', ARCHIVED: 'ARCHIVED' })),
    level: Type.Optional(Type.Enum({ BEGINNER: 'BEGINNER', INTERMEDIATE: 'INTERMEDIATE', ADVANCED: 'ADVANCED', ALL_LEVELS: 'ALL_LEVELS' })),
  }),
};

export const updateCourseSchema = {
  body: Type.Object({
    title: Type.Optional(Type.String()),
    subtitle: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    coverImageUrl: Type.Optional(Type.String()),
    price: Type.Optional(Type.Number()),
    status: Type.Optional(Type.Enum({ DRAFT: 'DRAFT', PUBLISHED: 'PUBLISHED', ARCHIVED: 'ARCHIVED' })),
    level: Type.Optional(Type.Enum({ BEGINNER: 'BEGINNER', INTERMEDIATE: 'INTERMEDIATE', ADVANCED: 'ADVANCED', ALL_LEVELS: 'ALL_LEVELS' })),
  }),
};

export const createModuleSchema = {
  body: Type.Object({
    title: Type.String(),
    description: Type.Optional(Type.String()),
    position: Type.Optional(Type.Number()),
  }),
};

export const createLessonSchema = {
  body: Type.Object({
    title: Type.String(),
    slug: Type.String(),
    type: Type.Optional(Type.Enum({ VIDEO: 'VIDEO', ARTICLE: 'ARTICLE', QUIZ: 'QUIZ', ASSIGNMENT: 'ASSIGNMENT' })),
    content: Type.Optional(Type.String()),
    videoUrl: Type.Optional(Type.String()),
    durationSeconds: Type.Optional(Type.Number()),
    isFreePreview: Type.Optional(Type.Boolean()),
    position: Type.Optional(Type.Number()),
  }),
};

export const courseQuerySchema = {
  querystring: Type.Object({
    page: Type.Optional(Type.Number()),
    limit: Type.Optional(Type.Number()),
    status: Type.Optional(Type.String()),
    level: Type.Optional(Type.String()),
    search: Type.Optional(Type.String()),
  }),
};
