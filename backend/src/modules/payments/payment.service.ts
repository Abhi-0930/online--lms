import Razorpay from 'razorpay';
import { PrismaClient } from '@prisma/client';

interface CreateOrderOptions {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
}

interface VerifyPaymentOptions {
  orderId: string;
  paymentId: string;
  signature: string;
}

export class PaymentService {
  private razorpay: Razorpay;

  constructor(private prisma: PrismaClient) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
  }

  /**
   * Create a Razorpay order
   */
  async createOrder(options: CreateOrderOptions) {
    const { amount, currency = 'INR', receipt, notes } = options;

    const order = await this.razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
      notes,
    });

    return order;
  }

  /**
   * Verify Razorpay payment signature
   */
  async verifyPayment(options: VerifyPaymentOptions): Promise<boolean> {
    const { orderId, paymentId, signature } = options;
    const secret = process.env.RAZORPAY_KEY_SECRET || '';

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(orderId + '|' + paymentId);
    const generatedSignature = hmac.digest('hex');

    return generatedSignature === signature;
  }

  /**
   * Fetch payment details from Razorpay
   */
  async fetchPayment(paymentId: string) {
    return await this.razorpay.payments.fetch(paymentId);
  }

  /**
   * Create payment record in database
   */
  async createPaymentRecord(data: {
    userId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    type: 'COURSE_ENROLLMENT' | 'COHORT_ENROLLMENT' | 'SUBSCRIPTION';
    courseId?: string;
    cohortId?: string;
    metadata?: Record<string, any>;
  }) {
    return await this.prisma.payment.create({
      data: {
        userId: data.userId,
        razorpayOrderId: data.razorpayOrderId,
        amount: data.amount,
        currency: data.currency,
        type: data.type,
        courseId: data.courseId,
        cohortId: data.cohortId,
        metadata: data.metadata,
      },
    });
  }

  /**
   * Update payment record after successful verification
   */
  async updatePaymentRecord(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    status: 'COMPLETED' | 'FAILED'
  ) {
    return await this.prisma.payment.update({
      where: { razorpayOrderId },
      data: {
        razorpayPaymentId,
        status,
      },
    });
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: string) {
    return await this.prisma.payment.findUnique({
      where: { razorpayOrderId: orderId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
          },
        },
        cohort: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });
  }

  /**
   * Get user payments
   */
  async getUserPayments(userId: string) {
    return await this.prisma.payment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        cohort: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Create enrollment after successful payment
   */
  async createEnrollmentAfterPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { course: true, cohort: true },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.type === 'COURSE_ENROLLMENT' && payment.courseId) {
      // Check if enrollment already exists
      const existingEnrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: payment.userId,
            courseId: payment.courseId,
          },
        },
      });

      if (!existingEnrollment) {
        await this.prisma.enrollment.create({
          data: {
            userId: payment.userId,
            courseId: payment.courseId,
            status: 'ACTIVE',
          },
        });
      }
    } else if (payment.type === 'COHORT_ENROLLMENT' && payment.cohortId) {
      // Check if cohort enrollment already exists
      const existingEnrollment = await this.prisma.cohortEnrollment.findUnique({
        where: {
          cohortId_userId: {
            cohortId: payment.cohortId,
            userId: payment.userId,
          },
        },
      });

      if (!existingEnrollment) {
        await this.prisma.cohortEnrollment.create({
          data: {
            cohortId: payment.cohortId,
            userId: payment.userId,
          },
        });

        // Increment cohort current students
        await this.prisma.cohort.update({
          where: { id: payment.cohortId },
          data: {
            currentStudents: {
              increment: 1,
            },
          },
        });
      }
    }
  }
}

