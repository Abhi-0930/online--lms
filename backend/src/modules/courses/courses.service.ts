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

    AdminService.fallbackCourses = AdminService.loadCoursesMetaFromFile();
    AdminService.deletedCoursesIds = AdminService.loadDeletedCoursesFromFile();

    const isDeleted = (c: any) => {
      if (!c) return true;
      const cId = String(c.id || '').trim();
      const cSlug = String(c.slug || '').trim();
      const cTitle = String(c.title || '').trim().toLowerCase();
      return (
        AdminService.deletedCoursesIds.has(cId) ||
        AdminService.deletedCoursesIds.has(cSlug) ||
        AdminService.deletedCoursesIds.has(cTitle) ||
        (cId && AdminService.deletedCoursesIds.has(cId.toLowerCase())) ||
        (cSlug && AdminService.deletedCoursesIds.has(cSlug.toLowerCase()))
      );
    };

    const courseMap = new Map<string, any>();
    for (const c of courses) {
      if (isDeleted(c)) continue;
      const meta = AdminService.fallbackCourses.get(String(c.id)) ||
                   AdminService.fallbackCourses.get(String(c.slug)) ||
                   Array.from(AdminService.fallbackCourses.values()).find(
                     (f: any) => f.id === c.id || f.slug === c.slug || (c.title && f.title && String(f.title).toLowerCase() === String(c.title).toLowerCase())
                   ) || {};
      const merged = {
        ...meta,
        ...c,
        id: String(c.id),
        slug: c.slug || meta.slug || String(c.id),
        title: c.title || meta.title,
        subtitle: c.subtitle !== undefined && c.subtitle !== null ? c.subtitle : (meta.subtitle || ''),
        description: c.description || meta.description || '',
        coverImageUrl: c.coverImageUrl || meta.coverImageUrl || meta.thumbnailPreview || null,
        thumbnailPreview: c.coverImageUrl || meta.thumbnailPreview || meta.coverImageUrl || null,
        modules: cleanCourseModules((c.modules && c.modules.length > 0) ? c.modules : (meta.modules || [])),
        category: meta.category || c.category || 'Development',
        language: meta.language || c.language || 'English',
        level: c.level ? String(c.level).charAt(0) + String(c.level).slice(1).toLowerCase().replace(/_/g, ' ') : (meta.level || 'Beginner'),
        price: c.price !== undefined && c.price !== null ? Number(c.price) : (meta.price !== undefined ? Number(meta.price) : 0),
        discountPrice: c.discountPrice !== undefined && c.discountPrice !== null ? Number(c.discountPrice) : (meta.discountPrice !== undefined ? Number(meta.discountPrice) : 0),
        currency: meta.currency || c.currency || 'INR ₹',
        courseType: meta.courseType || c.courseType || ((Number(c.price) > 0 || Number(meta.price) > 0) ? 'Paid' : 'Free'),
        accessType: meta.accessType || c.accessType || 'Lifetime Access',
        durationCycleMode: meta.durationCycleMode || c.durationCycleMode || 'Date Range',
        startDate: c.startDate || meta.startDate,
        endDate: c.endDate || meta.endDate,
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
        status: c.status === 'PUBLISHED' ? 'Published' : c.status === 'DRAFT' ? 'Draft' : (meta.status || 'Review'),
        updatedAt: c.updatedAt || meta.updatedAt || new Date().toISOString(),
      };
      courseMap.set(String(c.id), merged);
    }

    for (const meta of AdminService.fallbackCourses.values()) {
      if (isDeleted(meta)) continue;
      const canonicalId = String(meta.id || '');
      const metaSlug = String(meta.slug || '');
      const alreadyExists = (canonicalId && courseMap.has(canonicalId)) ||
        (metaSlug && Array.from(courseMap.values()).some((c: any) => c.slug === metaSlug || c.id === canonicalId));
      if (!alreadyExists && canonicalId) {
        courseMap.set(canonicalId, meta);
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
    AdminService.deletedCoursesIds = AdminService.loadDeletedCoursesFromFile();
    const slugStr = String(slug || '').trim();
    if (AdminService.deletedCoursesIds.has(slugStr)) {
      throw new Error('Course not found');
    }

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

    if (course && (AdminService.deletedCoursesIds.has(String(course.id)) || AdminService.deletedCoursesIds.has(String(course.slug)))) {
      throw new Error('Course not found');
    }

    AdminService.fallbackCourses = AdminService.loadCoursesMetaFromFile();
    const meta = AdminService.fallbackCourses.get(String(course?.id || slug)) || 
                 AdminService.fallbackCourses.get(String(slug)) || 
                 Array.from(AdminService.fallbackCourses.values()).find(c => c.slug === slug || c.id === slug) || {};

    if ((!course && !meta.id) || (meta.id && AdminService.deletedCoursesIds.has(String(meta.id))) || (meta.slug && AdminService.deletedCoursesIds.has(String(meta.slug)))) {
      throw new Error('Course not found');
    }

    const merged = {
      ...meta,
      ...(course || {}),
      id: String(course?.id || meta.id || slug),
      title: course?.title || meta.title,
      subtitle: (course?.subtitle !== undefined && course?.subtitle !== null) ? course.subtitle : (meta.subtitle || ''),
      description: course?.description || meta.description || '',
      coverImageUrl: course?.coverImageUrl || meta.coverImageUrl || meta.thumbnailPreview || null,
      thumbnailPreview: course?.coverImageUrl || meta.thumbnailPreview || meta.coverImageUrl || null,
      modules: cleanCourseModules((course?.modules && course?.modules.length > 0) ? course.modules : (meta.modules || [])),
      category: meta.category || course?.category || 'Development',
      language: meta.language || course?.language || 'English',
      level: course?.level ? String(course.level).charAt(0) + String(course.level).slice(1).toLowerCase().replace(/_/g, ' ') : (meta.level || 'Beginner'),
      price: (course?.price !== undefined && course?.price !== null) ? Number(course.price) : (meta.price !== undefined ? Number(meta.price) : 0),
      discountPrice: (course?.discountPrice !== undefined && course?.discountPrice !== null) ? Number(course.discountPrice) : (meta.discountPrice !== undefined ? Number(meta.discountPrice) : 0),
      currency: meta.currency || course?.currency || 'INR ₹',
      courseType: meta.courseType || course?.courseType,
      accessType: meta.accessType || course?.accessType,
      durationCycleMode: meta.durationCycleMode || course?.durationCycleMode,
      startDate: course?.startDate || meta.startDate,
      endDate: course?.endDate || meta.endDate,
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
