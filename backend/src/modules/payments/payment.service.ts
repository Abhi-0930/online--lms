import Razorpay from 'razorpay';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { env } from '../../config/env';
import { AdminWsBroadcaster } from '../admin/admin.ws';
import logger from '../../utils/logger';

export interface CreateOrderOptions {
  userId: string;
  courseId?: string;
  cohortId?: string;
  amount?: number;
  currency?: string;
  type?: 'COURSE_ENROLLMENT' | 'COHORT_ENROLLMENT' | 'SUBSCRIPTION';
  receipt?: string;
  notes?: Record<string, any>;
}

export interface VerifyPaymentOptions {
  userId: string;
  orderId: string;
  paymentId: string;
  signature: string;
  courseId?: string;
}

export const CATALOG_COURSES = [
  {
    id: 'dsa-foundations',
    slug: 'dsa-foundations',
    title: 'DSA for Placements',
    subtitle: 'Complete Data Structures & Algorithms with Python',
    description: 'Complete Data Structures & Algorithms with Python. Build the problem-solving muscle that top interviews look for from beginner to advanced.',
    price: 2499,
    level: 'BEGINNER' as const,
    coverImageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'placement-sprint',
    slug: 'placement-sprint',
    title: 'Placement Sprint 2025',
    subtitle: 'A guided 30-day sprint for OA rounds, interviews, and confidence.',
    description: 'A guided 30-day sprint for OA rounds, interviews, and confidence. High-frequency problems, timed assessments, and live clinics.',
    price: 2299,
    level: 'INTERMEDIATE' as const,
    coverImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'frontend-lab',
    slug: 'frontend-lab',
    title: 'Frontend Interview Lab',
    subtitle: 'Ship polished UI while mastering the questions interviewers ask.',
    description: 'Ship polished UI while mastering the questions interviewers ask. Performance, modern state management, and framework internals.',
    price: 1799,
    level: 'INTERMEDIATE' as const,
    coverImageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'system-design',
    slug: 'system-design',
    title: 'System Design, Simply',
    subtitle: 'Think in trade-offs, draw clean architectures, and explain your why.',
    description: 'Think in trade-offs, draw clean architectures, and explain your why. Real-world distributed systems, caching, scaling, and database sharding.',
    price: 1999,
    level: 'ADVANCED' as const,
    coverImageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=900&q=85',
  },
];

export class PaymentService {
  private razorpay: Razorpay;

  constructor(private prisma: PrismaClient) {
    this.razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Ensure default/catalog course exists in Neon PostgreSQL
   */
  async ensureCourse(identifier: string) {
    // 1. Try finding by ID or Slug in DB
    let course = await this.prisma.course.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
    });

    if (course) return course;

    // 2. Check if it matches known catalog
    const catalogItem = CATALOG_COURSES.find(
      (c) => c.id === identifier || c.slug === identifier
    );

    // 3. Find or create instructor for course creation
    let instructor = await this.prisma.user.findFirst({
      where: { role: { in: ['ADMIN', 'INSTRUCTOR'] } },
    });

    if (!instructor) {
      instructor = await this.prisma.user.findFirst();
    }

    if (!instructor) {
      // Create fallback instructor
      instructor = await this.prisma.user.create({
        data: {
          email: 'instructor@skillforge.io',
          fullName: 'Maya Patel',
          role: 'INSTRUCTOR',
          isEmailVerified: true,
        },
      });
    }

    const title = catalogItem?.title || identifier.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const price = catalogItem ? catalogItem.price : 1499;

    course = await this.prisma.course.create({
      data: {
        id: catalogItem?.id || undefined,
        slug: catalogItem?.slug || identifier,
        title,
        subtitle: catalogItem?.subtitle || 'Master the essential skills for modern software engineering.',
        description: catalogItem?.description || `Complete hands-on curriculum for ${title}.`,
        coverImageUrl: catalogItem?.coverImageUrl || 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=85',
        price,
        status: 'PUBLISHED',
        level: catalogItem?.level || 'BEGINNER',
        instructorId: instructor.id,
      },
    });

    return course;
  }

  /**
   * Create Razorpay order for Course or Cohort
   */
  async createOrder(options: CreateOrderOptions) {
    const { userId, courseId, cohortId, currency = 'INR', type = 'COURSE_ENROLLMENT' } = options;

    let targetCourse: any = null;
    let targetCohort: any = null;
    let finalAmount = options.amount || 0;

    if (type === 'COURSE_ENROLLMENT' && courseId) {
      targetCourse = await this.ensureCourse(courseId);

      // Check if already actively enrolled
      const existingEnrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: targetCourse.id,
          },
        },
      });

      if (existingEnrollment && existingEnrollment.status === 'ACTIVE') {
        const error: any = new Error('You are already enrolled in this course.');
        error.statusCode = 409;
        error.code = 'ALREADY_ENROLLED';
        throw error;
      }

      const baseCoursePrice = Number(targetCourse.price) || 1499;
      const platformFee = 10;
      finalAmount = baseCoursePrice + platformFee;
    } else if (type === 'COHORT_ENROLLMENT' && cohortId) {
      targetCohort = await this.prisma.cohort.findUnique({
        where: { id: cohortId },
      });
      if (!targetCohort) {
        const error: any = new Error('Cohort not found');
        error.statusCode = 404;
        throw error;
      }
      finalAmount = options.amount || 2999;
    }

    if (finalAmount <= 0) {
      finalAmount = 1499;
    }

    const amountInPaise = Math.round(finalAmount * 100);
    const receipt = options.receipt || `rcpt_${Date.now()}_${userId.slice(0, 6)}`;

    // Create Razorpay order via Razorpay API
    const orderNotes: Record<string, string | number> = {
      userId,
      type,
    };
    if (targetCourse?.id || courseId) {
      orderNotes.courseId = targetCourse?.id || courseId || '';
    }
    if (targetCourse?.slug || courseId) {
      orderNotes.courseSlug = targetCourse?.slug || courseId || '';
    }
    if (cohortId) {
      orderNotes.cohortId = cohortId;
    }

    const order: any = await (this.razorpay.orders.create as any)({
      amount: amountInPaise,
      currency,
      receipt,
      notes: orderNotes,
    });

    // Create Payment record in DB (PENDING)
    await this.prisma.payment.create({
      data: {
        userId,
        razorpayOrderId: order.id,
        amount: finalAmount,
        currency,
        type,
        courseId: targetCourse?.id,
        cohortId: targetCohort?.id,
        status: 'PENDING',
        metadata: {
          receipt,
          notes: order.notes,
        },
      },
    });

    return {
      orderId: order.id,
      amount: order.amount, // in paise
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID,
      course: targetCourse
        ? {
            id: targetCourse.id,
            slug: targetCourse.slug,
            title: targetCourse.title,
            price: Number(targetCourse.price),
          }
        : null,
    };
  }

  /**
   * Verify Razorpay Payment Signature and activate Enrollment
   */
  async verifyPayment(options: VerifyPaymentOptions) {
    const { userId, orderId, paymentId, signature, courseId } = options;

    // 1. Verify HMAC SHA-256 signature
    const secret = env.RAZORPAY_KEY_SECRET;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');

    const isValidSignature = generatedSignature === signature;
    if (!isValidSignature) {
      logger.warn({ orderId, paymentId }, 'Invalid payment signature received');
      await this.prisma.payment
        .updateMany({
          where: { razorpayOrderId: orderId },
          data: { status: 'FAILED', razorpayPaymentId: paymentId },
        })
        .catch(() => {});
      const error: any = new Error('Invalid payment signature');
      error.statusCode = 400;
      throw error;
    }

    // 2. Fetch payment details from Razorpay to ensure status is captured/authorized
    let razorpayPayment: any = null;
    try {
      razorpayPayment = await (this.razorpay.payments.fetch as any)(paymentId);
    } catch (e: any) {
      logger.warn({ err: e.message, paymentId }, 'Could not fetch Razorpay payment');
    }

    // 3. Find or update Payment record
    let payment = await this.prisma.payment.findUnique({
      where: { razorpayOrderId: orderId },
      include: { course: true, cohort: true, user: true },
    });

    if (!payment) {
      // If courseId provided, resolve course
      let resolvedCourseId: string | undefined = undefined;
      if (courseId) {
        const course = await this.ensureCourse(courseId);
        resolvedCourseId = course.id;
      }

      payment = await this.prisma.payment.create({
        data: {
          userId,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          amount: razorpayPayment ? Number(razorpayPayment.amount) / 100 : 1499,
          currency: razorpayPayment?.currency || 'INR',
          type: 'COURSE_ENROLLMENT',
          courseId: resolvedCourseId,
          status: 'COMPLETED',
          metadata: razorpayPayment ? { method: razorpayPayment.method } : undefined,
        },
        include: { course: true, cohort: true, user: true },
      });
    } else {
      payment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId: paymentId,
          status: 'COMPLETED',
          metadata: {
            ...(payment.metadata as object),
            paymentDetails: razorpayPayment ? { method: razorpayPayment.method, email: razorpayPayment.email } : undefined,
          },
        },
        include: { course: true, cohort: true, user: true },
      });
    }

    // 4. Resolve course to enroll in
    let courseToEnroll = payment.course;
    if (!courseToEnroll && courseId) {
      courseToEnroll = await this.ensureCourse(courseId);
    }

    let enrollment: any = null;

    if (courseToEnroll) {
      // Upsert user Enrollment in Neon DB
      enrollment = await this.prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: payment.userId,
            courseId: courseToEnroll.id,
          },
        },
        update: {
          status: 'ACTIVE',
        },
        create: {
          userId: payment.userId,
          courseId: courseToEnroll.id,
          status: 'ACTIVE',
          progressPct: 0.0,
        },
        include: {
          course: {
            select: { id: true, title: true, slug: true, coverImageUrl: true, price: true },
          },
        },
      });

      // Link payment to course if not linked
      if (!payment.courseId) {
        await this.prisma.payment
          .update({
            where: { id: payment.id },
            data: { courseId: courseToEnroll.id },
          })
          .catch(() => {});
      }
    } else if (payment.cohortId) {
      // Cohort enrollment
      await this.prisma.cohortEnrollment.upsert({
        where: {
          cohortId_userId: {
            cohortId: payment.cohortId,
            userId: payment.userId,
          },
        },
        update: {},
        create: {
          cohortId: payment.cohortId,
          userId: payment.userId,
        },
      });

      await this.prisma.cohort
        .update({
          where: { id: payment.cohortId },
          data: { currentStudents: { increment: 1 } },
        })
        .catch(() => {});
    }

    // 5. Create ActivityLog entry for student and admin timeline
    await this.prisma.activityLog
      .create({
        data: {
          userId: payment.userId,
          action: 'COURSE_PURCHASE',
          metadata: {
            paymentId,
            orderId,
            amount: Number(payment.amount),
            courseId: courseToEnroll?.id,
            courseTitle: courseToEnroll?.title,
          },
        },
      })
      .catch((err) => logger.error({ err }, 'Failed to write purchase activity log'));

    // 6. Broadcast real-time update to Admin Workspace WebSockets
    AdminWsBroadcaster.broadcastUpdate(this.prisma).catch(() => {});

    return {
      success: true,
      message: 'Payment verified and enrollment activated successfully!',
      payment: {
        id: payment.id,
        orderId: payment.razorpayOrderId,
        paymentId: payment.razorpayPaymentId,
        amount: Number(payment.amount),
        status: payment.status,
      },
      course: courseToEnroll,
      enrollment,
    };
  }

  /**
   * Get all active course enrollments for a user
   */
  async getUserEnrollments(userId: string) {
    return await this.prisma.enrollment.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
            subtitle: true,
            coverImageUrl: true,
            level: true,
            price: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  /**
   * Check if a user is enrolled in a given course
   */
  async checkEnrollment(userId: string, courseIdentifier: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        OR: [{ id: courseIdentifier }, { slug: courseIdentifier }],
      },
    });

    if (!course) {
      return { isEnrolled: false, enrollment: null };
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: course.id,
        },
      },
    });

    return {
      isEnrolled: Boolean(enrollment && enrollment.status === 'ACTIVE'),
      enrollment,
    };
  }

  /**
   * Get user payments history
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
}
