import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

export class CohortsService {
  constructor(private prisma: PrismaClient) {}

  async getAllCohorts(filters?: { courseId?: string; status?: string }) {
    const where: any = {};
    
    if (filters?.courseId) {
      where.courseId = filters.courseId;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }

    const cohorts = await this.prisma.cohort.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImageUrl: true,
          },
        },
        instructor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return cohorts;
  }

  async getCohortById(id: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
        instructor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!cohort) {
      throw new Error('Cohort not found');
    }

    return cohort;
  }

  async createCohort(data: any) {
    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    // Verify instructor exists and has correct role
    const instructor = await this.prisma.user.findUnique({
      where: { id: data.instructorId },
    });

    if (!instructor || (instructor.role !== 'INSTRUCTOR' && instructor.role !== 'ADMIN')) {
      throw new Error('Invalid instructor');
    }

    const cohort = await this.prisma.cohort.create({
      data: {
        courseId: data.courseId,
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        instructorId: data.instructorId,
        maxStudents: data.maxStudents || 50,
        currentStudents: 0,
        status: 'UPCOMING',
        imageUrl: data.imageUrl,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        instructor: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    logger.info({ cohortId: cohort.id }, 'Cohort created');

    return cohort;
  }

  async updateCohort(id: string, data: any) {
    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.maxStudents) updateData.maxStudents = data.maxStudents;
    if (data.status) updateData.status = data.status;
    if (data.imageUrl) updateData.imageUrl = data.imageUrl;

    const cohort = await this.prisma.cohort.update({
      where: { id },
      data: updateData,
    });

    logger.info({ cohortId: id }, 'Cohort updated');

    return cohort;
  }

  async deleteCohort(id: string) {
    await this.prisma.cohort.delete({
      where: { id },
    });

    logger.info({ cohortId: id }, 'Cohort deleted');

    return { success: true };
  }

  async enrollInCohort(userId: string, cohortId: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id: cohortId },
    });

    if (!cohort) {
      throw new Error('Cohort not found');
    }

    // Check if cohort is full
    if (cohort.currentStudents >= cohort.maxStudents) {
      throw new Error('Cohort is full');
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.cohortEnrollment.findUnique({
      where: {
        cohortId_userId: {
          cohortId,
          userId,
        },
      },
    });

    if (existingEnrollment) {
      throw new Error('Already enrolled in this cohort');
    }

    // Create enrollment
    const enrollment = await this.prisma.cohortEnrollment.create({
      data: {
        cohortId,
        userId,
      },
    });

    // Update current students count
    await this.prisma.cohort.update({
      where: { id: cohortId },
      data: {
        currentStudents: {
          increment: 1,
        },
      },
    });

    logger.info({ userId, cohortId }, 'User enrolled in cohort');

    return enrollment;
  }

  async getCohortEnrollments(cohortId: string) {
    const enrollments = await this.prisma.cohortEnrollment.findMany({
      where: { cohortId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return enrollments;
  }

  async getUserCohorts(userId: string) {
    const enrollments = await this.prisma.cohortEnrollment.findMany({
      where: { userId },
      include: {
        cohort: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverImageUrl: true,
              },
            },
            instructor: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return enrollments;
  }

  async leaveCohort(userId: string, cohortId: string) {
    const enrollment = await this.prisma.cohortEnrollment.findUnique({
      where: {
        cohortId_userId: {
          cohortId,
          userId,
        },
      },
    });

    if (!enrollment) {
      throw new Error('Not enrolled in this cohort');
    }

    await this.prisma.cohortEnrollment.delete({
      where: {
        cohortId_userId: {
          cohortId,
          userId,
        },
      },
    });

    // Update current students count
    await this.prisma.cohort.update({
      where: { id: cohortId },
      data: {
        currentStudents: {
          decrement: 1,
        },
      },
    });

    logger.info({ userId, cohortId }, 'User left cohort');

    return { success: true };
  }
}
