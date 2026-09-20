import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';
import { AdminService } from '../admin/admin.service';

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

    let courses: any[] = [];
    let total = 0;
    try {
      [courses, total] = await Promise.all([
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
    } catch {
      courses = [];
      total = 0;
    }

    const courseMap = new Map<string, any>();
    for (const c of courses) {
      const meta = AdminService.fallbackCourses.get(String(c.id)) ||
                   AdminService.fallbackCourses.get(String(c.slug)) || {};
      const merged = {
        ...meta,
        ...c,
        modules: (meta.modules && meta.modules.length > 0) ? meta.modules : c.modules,
        category: meta.category || c.category,
        language: meta.language || c.language || 'English',
        level: meta.level || c.level || 'Beginner',
        price: c.price !== undefined ? c.price : meta.price,
        discountPrice: meta.discountPrice !== undefined ? meta.discountPrice : c.discountPrice,
        currency: meta.currency || c.currency || 'INR ₹',
        courseType: meta.courseType || c.courseType,
        accessType: meta.accessType || c.accessType,
        durationCycleMode: meta.durationCycleMode || c.durationCycleMode,
        startDate: meta.startDate || c.startDate,
        endDate: meta.endDate || c.endDate,
        durationValue: meta.durationValue || c.durationValue,
        durationUnit: meta.durationUnit || c.durationUnit,
        subscriptionCycle: meta.subscriptionCycle || c.subscriptionCycle,
        enrollmentLimit: meta.enrollmentLimit || c.enrollmentLimit,
        courseVisibility: meta.courseVisibility || c.courseVisibility,
        skillsCovered: meta.skillsCovered || c.skillsCovered || meta.tags || c.tags || [],
        prerequisites: meta.prerequisites || c.prerequisites || '',
        estimatedDuration: meta.estimatedDuration || c.estimatedDuration || '12 Weeks',
        certificateAvailable: meta.certificateAvailable !== undefined ? meta.certificateAvailable : true,
        seoTitle: meta.seoTitle || c.seoTitle || '',
        seoDescription: meta.seoDescription || c.seoDescription || '',
        targetAudience: meta.targetAudience || c.targetAudience || '',
        learningOutcomes: meta.learningOutcomes || c.learningOutcomes || [],
        requirements: meta.requirements || c.requirements || [],
        targetLearners: meta.targetLearners || c.targetLearners || [],
        tags: meta.tags || c.tags || meta.skillsCovered || c.skillsCovered || [],
      };
      courseMap.set(String(c.id), merged);
    }

    for (const [id, meta] of AdminService.fallbackCourses.entries()) {
      if (!courseMap.has(String(id))) {
        courseMap.set(String(id), meta);
      }
    }

    const mergedCourses = Array.from(courseMap.values());

    return {
      courses: mergedCourses,
      pagination: {
        page,
        limit,
        total: Math.max(total, mergedCourses.length),
        totalPages: Math.ceil(Math.max(total, mergedCourses.length) / limit),
      },
    };
  }

  async getCourseBySlug(slug: string) {
    let course: any = null;
    try {
      course = await this.prisma.course.findFirst({
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
    } catch {
      course = null;
    }

    const meta = AdminService.fallbackCourses.get(String(course?.id || slug)) || 
                 AdminService.fallbackCourses.get(String(slug)) || 
                 Array.from(AdminService.fallbackCourses.values()).find(c => c.slug === slug || c.id === slug) || {};

    if (!course && !meta.id) {
      throw new Error('Course not found');
    }

    const merged = {
      ...meta,
      ...(course || {}),
      modules: (meta.modules && meta.modules.length > 0) ? meta.modules : (course?.modules || []),
      category: meta.category || course?.category,
      language: meta.language || course?.language || 'English',
      level: meta.level || course?.level || 'Beginner',
      price: course?.price !== undefined ? course.price : meta.price,
      discountPrice: meta.discountPrice !== undefined ? meta.discountPrice : course?.discountPrice,
      currency: meta.currency || course?.currency || 'INR ₹',
      courseType: meta.courseType || course?.courseType,
      accessType: meta.accessType || course?.accessType,
      durationCycleMode: meta.durationCycleMode || course?.durationCycleMode,
      startDate: meta.startDate || course?.startDate,
      endDate: meta.endDate || course?.endDate,
      durationValue: meta.durationValue || course?.durationValue,
      durationUnit: meta.durationUnit || course?.durationUnit,
      subscriptionCycle: meta.subscriptionCycle || course?.subscriptionCycle,
      enrollmentLimit: meta.enrollmentLimit || course?.enrollmentLimit,
      courseVisibility: meta.courseVisibility || course?.courseVisibility,
      skillsCovered: meta.skillsCovered || course?.skillsCovered || meta.tags || course?.tags || [],
      prerequisites: meta.prerequisites || course?.prerequisites || '',
      estimatedDuration: meta.estimatedDuration || course?.estimatedDuration || '12 Weeks',
      certificateAvailable: meta.certificateAvailable !== undefined ? meta.certificateAvailable : true,
      seoTitle: meta.seoTitle || course?.seoTitle || '',
      seoDescription: meta.seoDescription || course?.seoDescription || '',
      targetAudience: meta.targetAudience || course?.targetAudience || '',
      learningOutcomes: meta.learningOutcomes || course?.learningOutcomes || [],
      requirements: meta.requirements || course?.requirements || [],
      targetLearners: meta.targetLearners || course?.targetLearners || [],
      tags: meta.tags || course?.tags || meta.skillsCovered || course?.skillsCovered || [],
    };

    return merged;
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
    let course: any = null;
    try {
      course = await this.prisma.course.update({
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
    } catch {
      // Prisma update fallback
    }

    const existing = AdminService.fallbackCourses.get(String(id)) || {};
    const full = {
      ...existing,
      ...data,
      ...(course || {}),
      id: course?.id || id,
      price: data.price !== undefined ? data.price : (course?.price !== undefined ? course.price : existing.price),
      discountPrice: data.discountPrice !== undefined ? data.discountPrice : existing.discountPrice,
      learningOutcomes: data.learningOutcomes || existing.learningOutcomes || [],
      prerequisites: data.prerequisites !== undefined ? data.prerequisites : (existing.prerequisites || ''),
      requirements: data.requirements || existing.requirements || [],
      targetAudience: data.targetAudience !== undefined ? data.targetAudience : (existing.targetAudience || ''),
      targetLearners: data.targetLearners || existing.targetLearners || [],
      skillsCovered: data.skillsCovered || data.tags || existing.skillsCovered || [],
      tags: data.tags || data.skillsCovered || existing.tags || [],
      modules: (data.modules && data.modules.length > 0) ? data.modules : (existing.modules || []),
      updatedAt: new Date(),
    };
    AdminService.fallbackCourses.set(String(id), full);
    AdminService.saveMetaToFile();

    logger.info({ courseId: id }, 'Course updated');

    return full;
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
