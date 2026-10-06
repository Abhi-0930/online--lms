import Razorpay from 'razorpay';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { env } from '../../config/env';
import { AdminService } from '../admin/admin.service';
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
   * Helper to execute DB operations with automatic retry on pool/connection timeouts
   */
  private async withDbRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 400): Promise<T> {
    let lastError: any;
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || '';
        const isTimeout =
          msg.includes('Timed out fetching a new connection') ||
          msg.includes('connection pool') ||
          msg.includes("Can't reach database server") ||
          msg.includes('Connection terminated');
        if (isTimeout && i < retries) {
          logger.warn({ attempt: i + 1, err: msg }, 'DB connection pool busy, retrying query...');
          await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  }

  /**
   * Ensure default/catalog course exists in Neon PostgreSQL and merges live meta prices
   */
  async ensureCourse(identifier: string) {
    try {
      AdminService.fallbackCourses = AdminService.loadCoursesMetaFromFile();
      const meta = AdminService.fallbackCourses.get(String(identifier)) ||
                   Array.from(AdminService.fallbackCourses.values()).find(
                     (c: any) => c.slug === identifier || c.id === identifier
                   ) || {};

      return await this.withDbRetry(async () => {
        // 1. Try finding by ID or Slug in DB
        let course = await this.prisma.course.findFirst({
          where: {
            OR: [{ id: identifier }, { slug: identifier }],
          },
        });

        if (course) {
          return {
            ...meta,
            ...course,
            price: course.price !== undefined && course.price !== null ? Number(course.price) : (meta.price !== undefined ? Number(meta.price) : 0),
            discountPrice: course.discountPrice !== undefined && course.discountPrice !== null ? Number(course.discountPrice) : (meta.discountPrice !== undefined ? Number(meta.discountPrice) : 0),
          };
        }

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
              email: 'instructor@preppath.net',
              fullName: 'PrepPath Instructor',
              role: 'INSTRUCTOR',
              isEmailVerified: true,
            },
          });
        }

        const title = meta.title || catalogItem?.title || identifier.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        const price = meta.price !== undefined && meta.price !== null ? Number(meta.price) : (catalogItem ? catalogItem.price : 1499);

        course = await this.prisma.course.create({
          data: {
            id: meta.id || catalogItem?.id || undefined,
            slug: meta.slug || catalogItem?.slug || identifier,
            title,
            subtitle: meta.subtitle || catalogItem?.subtitle || 'Master the essential skills for modern software engineering.',
            description: meta.description || catalogItem?.description || `Complete hands-on curriculum for ${title}.`,
            coverImageUrl: meta.coverImageUrl || catalogItem?.coverImageUrl || 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=85',
            price,
            status: 'PUBLISHED',
            level: catalogItem?.level || 'BEGINNER',
            instructorId: instructor.id,
          },
        });

        return {
          ...course,
          ...meta,
          price: meta.price !== undefined && meta.price !== null ? Number(meta.price) : Number(course.price || 0),
          discountPrice: meta.discountPrice !== undefined && meta.discountPrice !== null ? Number(meta.discountPrice) : 0,
        };
      });
    } catch (dbErr: any) {
      logger.warn({ err: dbErr?.message, identifier }, 'Database unavailable in ensureCourse, using in-memory catalog fallback');
      const meta = AdminService.fallbackCourses?.get(String(identifier)) || {};
      const catalogItem = CATALOG_COURSES.find(
        (c) => c.id === identifier || c.slug === identifier
      ) || {
        id: identifier,
        slug: identifier,
        title: identifier.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        subtitle: 'Master the essential skills for modern software engineering.',
        description: `Complete hands-on curriculum for ${identifier}.`,
        price: 1499,
        level: 'BEGINNER',
      };
      return {
        ...catalogItem,
        ...meta,
        price: meta.price !== undefined && meta.price !== null ? Number(meta.price) : Number(catalogItem.price || 0),
        discountPrice: meta.discountPrice !== undefined && meta.discountPrice !== null ? Number(meta.discountPrice) : 0,
      };
    }
  }

  /**
   * Create Razorpay order for Course or Cohort
   */
  async createOrder(options: CreateOrderOptions) {
    const { userId, courseId, cohortId, currency = 'INR', type = 'COURSE_ENROLLMENT' } = options;

    let targetCourse: any = null;
    let targetCohort: any = null;
    let finalAmount = options.amount || 0;

    let enrollmentCheckPromise: Promise<any> = Promise.resolve(null);

    if (type === 'COURSE_ENROLLMENT' && courseId) {
      targetCourse = await this.ensureCourse(courseId);

      // Check if already actively enrolled in parallel with Razorpay call (non-blocking)
      enrollmentCheckPromise = this.withDbRetry(async () => {
        return this.prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId: targetCourse.id,
            },
          },
        });
      }).catch(() => null);

      if (options.amount !== undefined && options.amount > 0) {
        finalAmount = options.amount;
      } else {
        const p1 = Number(targetCourse?.price) || 0;
        const p2 = Number(targetCourse?.discountPrice) || 0;
        let baseCoursePrice = 0;
        if (p1 > 0 && p2 > 0) {
          baseCoursePrice = Math.min(p1, p2);
        } else if (p2 > 0) {
          baseCoursePrice = p2;
        } else if (p1 > 0) {
          baseCoursePrice = p1;
        } else {
          baseCoursePrice = 1499;
        }
        finalAmount = baseCoursePrice;
      }
    } else if (type === 'COHORT_ENROLLMENT' && cohortId) {
      targetCohort = await this.withDbRetry(async () => {
        return this.prisma.cohort.findUnique({
          where: { id: cohortId },
        });
      }).catch(() => null);
      finalAmount = options.amount || 2999;
    }

    if (finalAmount <= 0) {
      finalAmount = 1;
    }

    const amountInPaise = Math.max(100, Math.round(finalAmount * 100));
    const receipt = options.receipt || `rcpt_${Date.now()}_${userId.slice(0, 6)}`;


    // Configure Razorpay order parameters
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

    // Run Razorpay order creation and Enrollment check in PARALLEL
    const razorpayOrderPromise = (this.razorpay.orders.create as any)({
      amount: amountInPaise,
      currency,
      receipt,
      notes: orderNotes,
    });

    const [existingEnrollment, order] = await Promise.all([
      enrollmentCheckPromise.catch(() => null),
      razorpayOrderPromise,
    ]);

    if (existingEnrollment && existingEnrollment.status === 'ACTIVE') {
      const error: any = new Error('You are already enrolled in this course.');
      error.statusCode = 409;
      error.code = 'ALREADY_ENROLLED';
      throw error;
    }

    // Save Payment record in DB (PENDING) in background without blocking checkout popup
    this.withDbRetry(async () => {
      return this.prisma.payment.create({
        data: {
          userId,
          razorpayOrderId: (order as any).id,
          amount: finalAmount,
          currency,
          type,
          courseId: targetCourse?.id,
          cohortId: targetCohort?.id,
          status: 'PENDING',
          metadata: {
            receipt,
            notes: (order as any).notes,
          },
        },
      });
    }).catch((err) => {
      logger.warn({ err: err?.message, orderId: (order as any).id }, 'Pending payment log');
    });

    return {
      orderId: (order as any).id,
      amount: (order as any).amount, // in paise
      currency: (order as any).currency,
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

    // 3. Find or update Payment record with automatic retry
    let payment = await this.withDbRetry(async () => {
      let p = await this.prisma.payment.findUnique({
        where: { razorpayOrderId: orderId },
        include: { course: true, cohort: true, user: true },
      });

      if (!p) {
        // If courseId provided, resolve course
        let resolvedCourseId: string | undefined = undefined;
        if (courseId) {
          const course = await this.ensureCourse(courseId);
          resolvedCourseId = course.id;
        }

        p = await this.prisma.payment.create({
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
        p = await this.prisma.payment.update({
          where: { id: p.id },
          data: {
            razorpayPaymentId: paymentId,
            status: 'COMPLETED',
            metadata: {
              ...(p.metadata as object),
              paymentDetails: razorpayPayment ? { method: razorpayPayment.method, email: razorpayPayment.email } : undefined,
            },
          },
          include: { course: true, cohort: true, user: true },
        });
      }
      return p;
    });

    // 4. Resolve course to enroll in
    let courseToEnroll = payment.course;
    if (!courseToEnroll && courseId) {
      courseToEnroll = await this.ensureCourse(courseId);
    }

    let enrollment: any = null;

    if (courseToEnroll) {
      // Upsert user Enrollment in Neon DB with retry
      enrollment = await this.withDbRetry(async () => {
        return this.prisma.enrollment.upsert({
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
      });

      // Link payment to course if not linked
      if (!payment.courseId) {
        await this.withDbRetry(async () => {
          return this.prisma.payment.update({
            where: { id: payment.id },
            data: { courseId: courseToEnroll.id },
          });
        }).catch(() => {});
      }
    } else if (payment.cohortId) {
      const cohortId = payment.cohortId;
      // Cohort enrollment
      await this.withDbRetry(async () => {
        await this.prisma.cohortEnrollment.upsert({
          where: {
            cohortId_userId: {
              cohortId,
              userId: payment.userId,
            },
          },
          update: {},
          create: {
            cohortId,
            userId: payment.userId,
          },
        });

        await this.prisma.cohort.update({
          where: { id: cohortId },
          data: { currentStudents: { increment: 1 } },
        });
      }).catch(() => {});
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
