import { Type } from '@fastify/type-provider-typebox';

export const createOrderSchema = {
  body: Type.Object({
    courseId: Type.Optional(Type.String()),
    cohortId: Type.Optional(Type.String()),
    amount: Type.Optional(Type.Number()),
    currency: Type.Optional(Type.String()),
    type: Type.Optional(Type.String()),
    receipt: Type.Optional(Type.String()),
    notes: Type.Optional(Type.Record(Type.String(), Type.Any())),
  }),
};

export const verifyPaymentSchema = {
  body: Type.Object({
    orderId: Type.String(),
    paymentId: Type.String(),
    signature: Type.String(),
    courseId: Type.Optional(Type.String()),
  }),
};

export const getPaymentSchema = {
  params: Type.Object({
    orderId: Type.String(),
  }),
};
