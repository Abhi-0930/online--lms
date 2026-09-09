import { z } from 'zod';

// Create Order Schema
export const createOrderSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('INR'),
  type: z.enum(['COURSE_ENROLLMENT', 'COHORT_ENROLLMENT', 'SUBSCRIPTION']),
  courseId: z.string().optional(),
  cohortId: z.string().optional(),
  receipt: z.string().optional(),
  notes: z.record(z.any()).optional(),
}).refine(
  (data) => {
    if (data.type === 'COURSE_ENROLLMENT' && !data.courseId) {
      return false;
    }
    if (data.type === 'COHORT_ENROLLMENT' && !data.cohortId) {
      return false;
    }
    return true;
  },
  {
    message: 'courseId is required for COURSE_ENROLLMENT, cohortId is required for COHORT_ENROLLMENT',
  }
);

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// Verify Payment Schema
export const verifyPaymentSchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  signature: z.string(),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

// Get Payment Schema
export const getPaymentSchema = z.object({
  orderId: z.string(),
});

export type GetPaymentInput = z.infer<typeof getPaymentSchema>;
