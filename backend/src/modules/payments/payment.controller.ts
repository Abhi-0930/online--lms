import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PaymentService } from './payment.service';
import {
  createOrderSchema,
  verifyPaymentSchema,
  CreateOrderInput,
  VerifyPaymentInput,
} from './payment.schema';

export async function paymentController(fastify: FastifyInstance) {
  const paymentService = new PaymentService(fastify.prisma);

  /**
   * POST /payments/create-order
   * Create a Razorpay order
   */
  fastify.post('/payments/create-order', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    const body = request.body as CreateOrderInput;
    const { amount, currency, type, courseId, cohortId, receipt, notes } = body;

    // Validate course/cohort exists if provided
    if (type === 'COURSE_ENROLLMENT' && courseId) {
      const course = await fastify.prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        return reply.status(404).send({ error: 'Course not found' });
      }
    }

    if (type === 'COHORT_ENROLLMENT' && cohortId) {
      const cohort = await fastify.prisma.cohort.findUnique({
        where: { id: cohortId },
      });
      if (!cohort) {
        return reply.status(404).send({ error: 'Cohort not found' });
      }
    }

    try {
      // Create Razorpay order
      const order = await paymentService.createOrder({
        amount,
        currency: currency || 'INR',
        receipt: receipt || `receipt_${Date.now()}`,
        notes: notes || { userId: user.id, type, courseId, cohortId },
      });

      // Create payment record in database
      await paymentService.createPaymentRecord({
        userId: user.id,
        razorpayOrderId: order.id,
        amount,
        currency: currency || 'INR',
        type,
        courseId,
        cohortId,
        metadata: notes,
      });

      return reply.send(order);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message || 'Failed to create order' });
    }
  });

  /**
   * POST /payments/verify
   * Verify Razorpay payment signature
   */
  fastify.post('/payments/verify', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as VerifyPaymentInput;
    const { orderId, paymentId, signature } = body;

    try {
      // Verify signature
      const isValid = await paymentService.verifyPayment({
        orderId,
        paymentId,
        signature,
      });

      if (!isValid) {
        // Update payment as failed
        await paymentService.updatePaymentRecord(orderId, paymentId, 'FAILED');
        return reply.status(400).send({ error: 'Invalid payment signature' });
      }

      // Fetch payment details from Razorpay
      const razorpayPayment = await paymentService.fetchPayment(paymentId);

      if (razorpayPayment.status !== 'captured') {
        await paymentService.updatePaymentRecord(orderId, paymentId, 'FAILED');
        return reply.status(400).send({ error: 'Payment not captured' });
      }

      // Update payment as completed
      const payment = await paymentService.updatePaymentRecord(orderId, paymentId, 'COMPLETED');

      // Create enrollment if payment is for course/cohort
      await paymentService.createEnrollmentAfterPayment(payment.id);

      return reply.send({
        success: true,
        message: 'Payment verified successfully',
        payment: await paymentService.getPaymentByOrderId(orderId),
      });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message || 'Payment verification failed' });
    }
  });

  /**
   * GET /payments/:orderId
   * Get payment details by order ID
   */
  fastify.get('/payments/:orderId', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { orderId } = request.params as { orderId: string };

    try {
      const payment = await paymentService.getPaymentByOrderId(orderId);

      if (!payment) {
        return reply.status(404).send({ error: 'Payment not found' });
      }

      return reply.send(payment);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message || 'Failed to fetch payment' });
    }
  });

  /**
   * GET /payments
   * Get all payments for the authenticated user
   */
  fastify.get('/payments', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;

    try {
      const payments = await paymentService.getUserPayments(user.id);
      return reply.send(payments);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message || 'Failed to fetch payments' });
    }
  });
}
