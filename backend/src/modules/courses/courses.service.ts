import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';
import { AdminService, cleanCourseModules } from '../admin/admin.service';

export class CoursesService {
  constructor(private prisma: PrismaClient) {}

  async getAllCourses(params: {
    page?: number;
    limit?: number;
    status?: string;
    level?: string;
    search?: string;
  } = {}) {
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
      const merged = {
        ...c,
        id: String(c.id),
        slug: c.slug || String(c.id),
        title: c.title,
        subtitle: c.subtitle || '',
        description: c.description || '',
        coverImageUrl: c.coverImageUrl || null,
        thumbnailPreview: c.coverImageUrl || null,
        modules: cleanCourseModules(c.modules || []),
        category: c.category || 'Development',
        language: c.language || 'English',
        level: c.level ? String(c.level).charAt(0) + String(c.level).slice(1).toLowerCase().replace(/_/g, ' ') : 'Beginner',
        price: c.price !== undefined && c.price !== null ? Number(c.price) : 0,
        discountPrice: c.discountPrice !== undefined && c.discountPrice !== null ? Number(c.discountPrice) : 0,
        currency: c.currency || 'INR ₹',
        courseType: c.courseType || (Number(c.price) > 0 ? 'Paid' : 'Free'),
        accessType: c.accessType || 'Lifetime Access',
        durationCycleMode: c.durationCycleMode || 'Date Range',
        startDate: c.startDate,
        endDate: c.endDate,
        durationValue: c.durationValue || '90',
        durationUnit: c.durationUnit || 'Days',
        subscriptionCycle: c.subscriptionCycle || 'Monthly',
        enrollmentLimit: c.enrollmentLimit || 'Unlimited',
        courseVisibility: c.courseVisibility || 'Public',
        skillsCovered: c.skillsCovered || c.tags || [],
        prerequisites: c.prerequisites || '',
        estimatedDuration: c.estimatedDuration || '12 Weeks',
        certificateAvailable: c.certificateAvailable !== undefined ? c.certificateAvailable : true,
        seoTitle: c.seoTitle || '',
        seoDescription: c.seoDescription || '',
        targetAudience: c.targetAudience || '',
        learningOutcomes: c.learningOutcomes || [],
        requirements: c.requirements || [],
        targetLearners: c.targetLearners || [],
        tags: c.tags || c.skillsCovered || [],
        status: c.status === 'PUBLISHED' ? 'Published' : c.status === 'DRAFT' ? 'Draft' : 'Review',
        updatedAt: c.updatedAt || new Date().toISOString(),
      };
      courseMap.set(String(c.id), merged);
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

    if (!course) {
      throw new Error('Course not found');
    }

    const merged = {
      ...course,
      id: String(course.id),
      title: course.title,
      subtitle: course.subtitle || '',
      description: course.description || '',
      coverImageUrl: course.coverImageUrl || null,
      thumbnailPreview: course.coverImageUrl || null,
      modules: cleanCourseModules(course.modules || []),
      category: course.category || 'Development',
      language: course.language || 'English',
      level: course.level ? String(course.level).charAt(0) + String(course.level).slice(1).toLowerCase().replace(/_/g, ' ') : 'Beginner',
      price: (course.price !== undefined && course.price !== null) ? Number(course.price) : 0,
      discountPrice: (course.discountPrice !== undefined && course.discountPrice !== null) ? Number(course.discountPrice) : 0,
      currency: course.currency || 'INR ₹',
      courseType: course.courseType || (Number(course.price) > 0 ? 'Paid' : 'Free'),
      accessType: course.accessType || 'Lifetime Access',
      durationCycleMode: course.durationCycleMode || 'Date Range',
      startDate: course.startDate,
      endDate: course.endDate,
      durationValue: course.durationValue || '90',
      durationUnit: course.durationUnit || 'Days',
      subscriptionCycle: course.subscriptionCycle || 'Monthly',
      enrollmentLimit: course.enrollmentLimit || 'Unlimited',
      courseVisibility: course.courseVisibility || 'Public',
      skillsCovered: course.skillsCovered || course.tags || [],
      prerequisites: course.prerequisites || '',
      estimatedDuration: course.estimatedDuration || '12 Weeks',
      certificateAvailable: course.certificateAvailable !== undefined ? course.certificateAvailable : true,
      seoTitle: course.seoTitle || '',
      seoDescription: course.seoDescription || '',
      targetAudience: course.targetAudience || '',
      learningOutcomes: course.learningOutcomes || [],
      requirements: course.requirements || [],
      targetLearners: course.targetLearners || [],
      tags: course.tags || course.skillsCovered || [],
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
    const adminService = new AdminService(this.prisma);
    const full = await adminService.saveCourseDraft({
      ...data,
      id,
    });

    logger.info({ courseId: id }, 'Course updated');

    return full;
  }

  async deleteCourse(id: string) {
    const adminService = new AdminService(this.prisma);
    const result = await adminService.deleteCourse(id);
    logger.info({ courseId: id }, 'Course deleted');
    return result;
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
