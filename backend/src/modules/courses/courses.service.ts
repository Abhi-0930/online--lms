import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

export class CoursesService {
  constructor(private prisma: PrismaClient) {}

  async getAllCourses(params: {
    page?: number;
    limit?: number;
    status?: string;
    level?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, status, level, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (level) {
      where.level = level;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          instructor: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          modules: {
            orderBy: { position: 'asc' },
            include: {
              lessons: {
                orderBy: { position: 'asc' },
              },
            },
          },
          _count: {
            select: {
              modules: true,
              enrollments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCourseBySlug(slug: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        instructor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        modules: {
          orderBy: { position: 'asc' },
          include: {
            lessons: {
              orderBy: { position: 'asc' },
            },
          },
        },
        resources: true,
      },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    return course;
  }

  async createCourse(data: any, instructorId: string) {
    const course = await this.prisma.course.create({
      data: {
        ...data,
        instructorId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    logger.info({ courseId: course.id, instructorId }, 'Course created');

    return course;
  }

  async updateCourse(id: string, data: any) {
    const course = await this.prisma.course.update({
      where: { id },
      data,
      include: {
        instructor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    logger.info({ courseId: course.id }, 'Course updated');

    return course;
  }

  async deleteCourse(id: string) {
    await this.prisma.course.delete({
      where: { id },
    });

    logger.info({ courseId: id }, 'Course deleted');

    return { success: true };
  }

  async createModule(courseId: string, data: any) {
    const module = await this.prisma.module.create({
      data: {
        ...data,
        courseId,
      },
    });

    logger.info({ moduleId: module.id, courseId }, 'Module created');

    return module;
  }

  async createLesson(moduleId: string, data: any) {
    const lesson = await this.prisma.lesson.create({
      data: {
        ...data,
        moduleId,
      },
    });

    logger.info({ lessonId: lesson.id, moduleId }, 'Lesson created');

    return lesson;
  }
}
