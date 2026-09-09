import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

export class ProgressService {
  constructor(private prisma: PrismaClient) {}

  async enrollUser(userId: string, courseId: string, expiresAt?: string) {
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new Error('Already enrolled in this course');
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: 'ACTIVE',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        course: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });

    logger.info({ userId, courseId }, 'User enrolled in course');

    return enrollment;
  }

  async updateLessonProgress(
    userId: string,
    lessonId: string,
    data: { isCompleted?: boolean; watchTimeSeconds?: number }
  ) {
    const progress = await this.prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        ...data,
        completedAt: data.isCompleted ? new Date() : null,
      },
      create: {
        userId,
        lessonId,
        isCompleted: data.isCompleted || false,
        watchTimeSeconds: data.watchTimeSeconds || 0,
        completedAt: data.isCompleted ? new Date() : null,
      },
    });

    // Log activity
    if (data.isCompleted) {
      await this.prisma.activityLog.create({
        data: {
          userId,
          action: 'LESSON_COMPLETE',
          metadata: { lessonId },
        },
      });
    }

    // Recalculate course progress
    await this.recalculateCourseProgress(userId, lessonId);

    logger.info({ userId, lessonId }, 'Lesson progress updated');

    return progress;
  }

  async recalculateCourseProgress(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });

    if (!lesson) return;

    const courseId = lesson.module.course.id;

    // Get all lessons in the course
    const allLessons = await this.prisma.lesson.findMany({
      where: {
        module: { courseId },
      },
    });

    // Get completed lessons for user
    const completedLessons = await this.prisma.lessonProgress.count({
      where: {
        userId,
        lesson: {
          module: { courseId },
        },
        isCompleted: true,
      },
    });

    const progressPct = allLessons.length > 0 ? (completedLessons / allLessons.length) * 100 : 0;

    // Update enrollment progress
    await this.prisma.enrollment.update({
      where: {
        userId_courseId: { userId, courseId },
      },
      data: {
        progressPct,
        completedAt: progressPct === 100 ? new Date() : null,
        status: progressPct === 100 ? 'COMPLETED' : 'ACTIVE',
      },
    });
  }

  async getUserProgress(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: {
                    progress: {
                      where: { userId },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new Error('Not enrolled in this course');
    }

    return enrollment;
  }

  async getUserEnrollments(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImageUrl: true,
            level: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return enrollments;
  }
}
