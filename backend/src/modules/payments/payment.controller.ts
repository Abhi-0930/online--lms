import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PaymentService } from './payment.service';
import { createOrderSchema, verifyPaymentSchema } from './payment.schema';
import { env } from '../../config/env';
import logger from '../../utils/logger';

export async function paymentController(fastify: FastifyInstance) {
  const paymentService = new PaymentService(fastify.prisma);

  /**
   * GET /key (or /payments/key)
   * Public endpoint to get Razorpay public Key ID
   */
  fastify.get('/key', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      keyId: env.RAZORPAY_KEY_ID,
      currency: 'INR',
    });
  });

  /**
   * POST /create-order
   * Create Razorpay order for course or cohort
   */
  fastify.post('/create-order', {
    onRequest: [fastify.authenticate],
    schema: createOrderSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    const body = (request.body || {}) as any;
    const { courseId, cohortId, amount, currency, type, receipt, notes } = body;

    if (!courseId && !cohortId) {
      return reply.status(400).send({
        error: 'BadRequest',
        message: 'Either courseId or cohortId is required to create a payment order.',
      });
    }

    try {
      const order = await paymentService.createOrder({
        userId: user.id,
        courseId,
        cohortId,
        amount,
        currency,
        type: type || (cohortId ? 'COHORT_ENROLLMENT' : 'COURSE_ENROLLMENT'),
        receipt,
        notes,
      });

      return reply.status(200).send(order);
    } catch (error: any) {
      logger.error({ error, userId: user.id, courseId }, 'Failed to create payment order');
      if (error.code === 'ALREADY_ENROLLED') {
        return reply.status(409).send({
          error: 'Conflict',
          code: 'ALREADY_ENROLLED',
          message: error.message || 'You are already enrolled in this course.',
        });
      }
      return reply.status(error.statusCode || 500).send({
        error: error.name || 'InternalServerError',
        message: error.message || 'Failed to initialize payment order',
      });
    }
  });

  /**
   * POST /verify
   * Verify Razorpay payment signature and activate enrollment
   */
  fastify.post('/verify', {
    onRequest: [fastify.authenticate],
    schema: verifyPaymentSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    const body = request.body as any;
    const { orderId, paymentId, signature, courseId } = body;

    try {
      const result = await paymentService.verifyPayment({
        userId: user.id,
        orderId,
        paymentId,
        signature,
        courseId,
      });

      return reply.status(200).send(result);
    } catch (error: any) {
      logger.error({ error, userId: user.id, orderId, paymentId }, 'Payment verification failed');
      return reply.status(error.statusCode || 400).send({
        error: error.name || 'PaymentVerificationError',
        message: error.message || 'Payment signature verification failed',
      });
    }
  });

  /**
   * GET /my-enrollments
   * Get all active course enrollments for current student
   */
  fastify.get('/my-enrollments', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    try {
      const enrollments = await paymentService.getUserEnrollments(user.id);
      return reply.send({ enrollments });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message || 'Failed to fetch enrollments' });
    }
  });

  /**
   * GET /check-enrollment/:courseId
   * Check if current user is enrolled in course
   */
  fastify.get('/check-enrollment/:courseId', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    const { courseId } = request.params as { courseId: string };
    try {
      const result = await paymentService.checkEnrollment(user.id, courseId);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message || 'Failed to check enrollment' });
    }
  });

  /**
   * GET /history
   * Get user's payment history
   */
  fastify.get('/history', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    try {
      const payments = await paymentService.getUserPayments(user.id);
      return reply.send({ payments });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message || 'Failed to fetch payment history' });
    }
  });

  /**
   * GET /order/:orderId
   * Get payment details by Razorpay order ID
   */
  fastify.get('/order/:orderId', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { orderId } = request.params as { orderId: string };
    try {
      const payment = await paymentService.getPaymentByOrderId(orderId);
      if (!payment) {
        return reply.status(404).send({ error: 'Payment record not found' });
      }
      return reply.send(payment);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message || 'Failed to fetch payment' });
    }
  });
}
