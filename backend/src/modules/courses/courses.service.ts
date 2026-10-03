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

    AdminService.fallbackCourses = AdminService.loadCoursesMetaFromFile();
    const courseMap = new Map<string, any>();
    for (const c of courses) {
      const meta = AdminService.fallbackCourses.get(String(c.id)) ||
                   AdminService.fallbackCourses.get(String(c.slug)) || {};
      const merged = {
        ...c,
        ...meta,
        id: String(c.id),
        title: meta.title || c.title,
        subtitle: meta.subtitle !== undefined ? meta.subtitle : (c.subtitle || ''),
        description: meta.description || c.description || '',
        coverImageUrl: meta.coverImageUrl || meta.thumbnailPreview || c.coverImageUrl || null,
        thumbnailPreview: meta.thumbnailPreview || meta.coverImageUrl || c.coverImageUrl || null,
        modules: (meta.modules && meta.modules.length > 0) ? meta.modules : (c.modules || []),
        category: meta.category || c.category || 'Development',
        language: meta.language || c.language || 'English',
        level: meta.level || (c.level ? String(c.level).charAt(0) + String(c.level).slice(1).toLowerCase().replace(/_/g, ' ') : 'Beginner'),
        price: meta.price !== undefined && meta.price !== null ? Number(meta.price) : (c.price !== undefined ? Number(c.price) : 0),
        discountPrice: meta.discountPrice !== undefined && meta.discountPrice !== null ? Number(meta.discountPrice) : 0,
        currency: meta.currency || c.currency || 'INR ₹',
        courseType: meta.courseType || c.courseType || ((Number(meta.price) > 0 || Number(c.price) > 0) ? 'Paid' : 'Free'),
        accessType: meta.accessType || c.accessType || 'Lifetime Access',
        durationCycleMode: meta.durationCycleMode || c.durationCycleMode || 'Date Range',
        startDate: meta.startDate || c.startDate,
        endDate: meta.endDate || c.endDate,
        durationValue: meta.durationValue || c.durationValue || '90',
        durationUnit: meta.durationUnit || c.durationUnit || 'Days',
        subscriptionCycle: meta.subscriptionCycle || c.subscriptionCycle || 'Monthly',
        enrollmentLimit: meta.enrollmentLimit || c.enrollmentLimit || 'Unlimited',
        courseVisibility: meta.courseVisibility || c.courseVisibility || 'Public',
        skillsCovered: meta.skillsCovered || meta.tags || c.skillsCovered || c.tags || [],
        prerequisites: meta.prerequisites || c.prerequisites || '',
        estimatedDuration: meta.estimatedDuration || c.estimatedDuration || '12 Weeks',
        certificateAvailable: meta.certificateAvailable !== undefined ? meta.certificateAvailable : true,
        seoTitle: meta.seoTitle || c.seoTitle || '',
        seoDescription: meta.seoDescription || c.seoDescription || '',
        targetAudience: meta.targetAudience || c.targetAudience || '',
        learningOutcomes: meta.learningOutcomes || c.learningOutcomes || [],
        requirements: meta.requirements || c.requirements || [],
        targetLearners: meta.targetLearners || c.targetLearners || [],
        tags: meta.tags || meta.skillsCovered || c.tags || c.skillsCovered || [],
        status: meta.status || (c.status === 'PUBLISHED' ? 'Published' : c.status === 'DRAFT' ? 'Draft' : 'Review'),
        updatedAt: meta.updatedAt || c.updatedAt || new Date().toISOString(),
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

    AdminService.fallbackCourses = AdminService.loadCoursesMetaFromFile();
    const meta = AdminService.fallbackCourses.get(String(course?.id || slug)) || 
                 AdminService.fallbackCourses.get(String(slug)) || 
                 Array.from(AdminService.fallbackCourses.values()).find(c => c.slug === slug || c.id === slug) || {};

    if (!course && !meta.id) {
      throw new Error('Course not found');
    }

    const merged = {
      ...(course || {}),
      ...meta,
      id: String(course?.id || meta.id || slug),
      title: meta.title || course?.title,
      subtitle: meta.subtitle !== undefined ? meta.subtitle : (course?.subtitle || ''),
      description: meta.description || course?.description || '',
      coverImageUrl: meta.coverImageUrl || meta.thumbnailPreview || course?.coverImageUrl || null,
      thumbnailPreview: meta.thumbnailPreview || meta.coverImageUrl || course?.coverImageUrl || null,
      modules: (meta.modules && meta.modules.length > 0) ? meta.modules : (course?.modules || []),
      category: meta.category || course?.category || 'Development',
      language: meta.language || course?.language || 'English',
      level: meta.level || (course?.level ? String(course.level).charAt(0) + String(course.level).slice(1).toLowerCase().replace(/_/g, ' ') : 'Beginner'),
      price: meta.price !== undefined && meta.price !== null ? Number(meta.price) : (course?.price !== undefined ? Number(course.price) : 0),
      discountPrice: meta.discountPrice !== undefined && meta.discountPrice !== null ? Number(meta.discountPrice) : 0,
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
      ...(course || {}),
      ...data,
      id: course?.id || id,
      title: data.title || course?.title || existing.title,
      description: data.description || course?.description || existing.description,
      coverImageUrl: data.coverImageUrl || data.thumbnailPreview || existing.coverImageUrl || course?.coverImageUrl || null,
      thumbnailPreview: data.thumbnailPreview || data.coverImageUrl || existing.thumbnailPreview || course?.coverImageUrl || null,
      price: data.price !== undefined ? data.price : (existing.price !== undefined ? existing.price : (course?.price !== undefined ? Number(course.price) : 0)),
      discountPrice: data.discountPrice !== undefined ? data.discountPrice : existing.discountPrice,
      status: data.status ? (data.status === 'PUBLISHED' ? 'Published' : data.status === 'DRAFT' ? 'Draft' : data.status) : (existing.status || 'Published'),
      level: data.level || existing.level || 'Beginner',
      category: data.category || existing.category || 'Development',
      language: data.language || existing.language || 'English',
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
    if (full.slug || course?.slug) {
      AdminService.fallbackCourses.set(String(full.slug || course?.slug), full);
    }
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
