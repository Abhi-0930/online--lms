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

    AdminService.fallbackCourses = AdminService.loadCoursesMetaFromFile();
    AdminService.deletedCoursesIds = AdminService.loadDeletedCoursesFromFile();

    const isDeleted = (course: any) => {
      const cId = String(course.id || '').trim();
      const cSlug = String(course.slug || '').trim();
      const cTitle = String(course.title || '').trim().toLowerCase();
      return (
        AdminService.deletedCoursesIds.has(cId) ||
        AdminService.deletedCoursesIds.has(cSlug) ||
        AdminService.deletedCoursesIds.has(cTitle) ||
        (cId && AdminService.deletedCoursesIds.has(cId.toLowerCase())) ||
        (cSlug && AdminService.deletedCoursesIds.has(cSlug.toLowerCase()))
      );
    };

    const where: any = {};

    if (status) {
      const s = String(status).toUpperCase();
      if (s === 'PUBLISHED' || s === 'DRAFT' || s === 'ARCHIVED') {
        where.status = s;
      }
    }

    if (level) {
      const lvl = String(level).toUpperCase().replace(/\s+/g, '_');
      if (['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'].includes(lvl)) {
        where.level = lvl;
      }
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
      if (isDeleted(c)) continue;
      const fallback = AdminService.fallbackCourses.get(String(c.id)) ||
                       AdminService.fallbackCourses.get(String(c.slug)) || {};

      const merged = {
        ...fallback,
        ...c,
        id: String(c.id),
        slug: c.slug || fallback.slug || String(c.id),
        title: c.title || fallback.title,
        subtitle: (c.subtitle !== undefined && c.subtitle !== null) ? c.subtitle : (fallback.subtitle || ''),
        description: c.description || fallback.description || '',
        coverImageUrl: c.coverImageUrl || fallback.coverImageUrl || fallback.thumbnailPreview || null,
        thumbnailPreview: c.coverImageUrl || fallback.thumbnailPreview || fallback.coverImageUrl || null,
        modules: cleanCourseModules((c.modules && c.modules.length > 0) ? c.modules : (fallback.modules || [])),
        category: fallback.category || 'Development',
        language: fallback.language || 'English',
        level: c.level ? String(c.level).charAt(0) + String(c.level).slice(1).toLowerCase().replace(/_/g, ' ') : (fallback.level || 'Beginner'),
        price: c.price !== undefined && c.price !== null ? Number(c.price) : (fallback.price !== undefined ? Number(fallback.price) : 0),
        discountPrice: c.discountPrice !== undefined && c.discountPrice !== null ? Number(c.discountPrice) : (fallback.discountPrice !== undefined ? Number(fallback.discountPrice) : 0),
        currency: fallback.currency || 'INR ₹',
        courseType: fallback.courseType || (Number(c.price) > 0 ? 'Paid' : 'Free'),
        accessType: fallback.accessType || 'Lifetime Access',
        durationCycleMode: fallback.durationCycleMode || 'Date Range',
        startDate: (c as any).startDate || fallback.startDate,
        endDate: (c as any).endDate || fallback.endDate,
        durationValue: fallback.durationValue || '90',
        durationUnit: fallback.durationUnit || 'Days',
        subscriptionCycle: fallback.subscriptionCycle || 'Monthly',
        enrollmentLimit: fallback.enrollmentLimit || 'Unlimited',
        courseVisibility: fallback.courseVisibility || 'Public',
        skillsCovered: fallback.skillsCovered || fallback.tags || [],
        prerequisites: fallback.prerequisites || '',
        estimatedDuration: fallback.estimatedDuration || '12 Weeks',
        certificateAvailable: fallback.certificateAvailable !== undefined ? fallback.certificateAvailable : true,
        seoTitle: fallback.seoTitle || '',
        seoDescription: fallback.seoDescription || '',
        targetAudience: fallback.targetAudience || '',
        learningOutcomes: fallback.learningOutcomes || [],
        requirements: fallback.requirements || [],
        targetLearners: fallback.targetLearners || [],
        tags: fallback.tags || fallback.skillsCovered || [],
        status: c.status === 'PUBLISHED' ? 'Published' : c.status === 'DRAFT' ? 'Draft' : (fallback.status || 'Published'),
        updatedAt: c.updatedAt || fallback.updatedAt || new Date().toISOString(),
      };
      courseMap.set(String(c.id), merged);
    }

    // Include fallback courses that might only exist in metadata
    for (const fallback of AdminService.fallbackCourses.values()) {
      if (isDeleted(fallback)) continue;
      const canonicalId = String(fallback.id || '');
      const fallbackSlug = String(fallback.slug || '');
      const alreadyExists = (canonicalId && courseMap.has(canonicalId)) ||
        (fallbackSlug && Array.from(courseMap.values()).some((item: any) => item.slug === fallbackSlug || item.id === canonicalId));

      if (!alreadyExists && canonicalId) {
        if (search) {
          const matchSearch =
            (fallback.title && fallback.title.toLowerCase().includes(search.toLowerCase())) ||
            (fallback.description && fallback.description.toLowerCase().includes(search.toLowerCase()));
          if (!matchSearch) continue;
        }
        if (level && fallback.level && String(fallback.level).toLowerCase() !== String(level).toLowerCase()) {
          continue;
        }
        if (status && fallback.status && String(fallback.status).toLowerCase() !== String(status).toLowerCase()) {
          continue;
        }

        courseMap.set(canonicalId, {
          ...fallback,
          id: canonicalId,
          slug: fallbackSlug || canonicalId,
          modules: cleanCourseModules(fallback.modules || []),
          status: fallback.status === 'Draft' || fallback.status === 'DRAFT' ? 'Draft' : 'Published',
        });
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
    AdminService.fallbackCourses = AdminService.loadCoursesMetaFromFile();
    AdminService.deletedCoursesIds = AdminService.loadDeletedCoursesFromFile();

    const isDeleted = (course: any) => {
      const cId = String(course.id || '').trim();
      const cSlug = String(course.slug || '').trim();
      const cTitle = String(course.title || '').trim().toLowerCase();
      return (
        AdminService.deletedCoursesIds.has(cId) ||
        AdminService.deletedCoursesIds.has(cSlug) ||
        AdminService.deletedCoursesIds.has(cTitle) ||
        (cId && AdminService.deletedCoursesIds.has(cId.toLowerCase())) ||
        (cSlug && AdminService.deletedCoursesIds.has(cSlug.toLowerCase()))
      );
    };

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

    const fallbackKey = AdminService.fallbackCourses.has(slug)
      ? slug
      : Array.from(AdminService.fallbackCourses.keys()).find((k) => {
          const c = AdminService.fallbackCourses.get(k);
          return c && (c.slug === slug || c.id === slug || String(c.title || '').toLowerCase() === slug.toLowerCase());
        });

    const fallback = fallbackKey ? AdminService.fallbackCourses.get(fallbackKey) : {};

    if (!course && !fallbackKey) {
      throw new Error('Course not found');
    }

    if (course && isDeleted(course)) {
      throw new Error('Course not found');
    }

    const merged = {
      ...fallback,
      ...(course || {}),
      id: String(course?.id || fallback?.id || slug),
      slug: course?.slug || fallback?.slug || slug,
      title: course?.title || fallback?.title || 'Untitled Course',
      subtitle: (course?.subtitle !== undefined && course?.subtitle !== null) ? course.subtitle : (fallback?.subtitle || ''),
      description: course?.description || fallback?.description || '',
      coverImageUrl: course?.coverImageUrl || fallback?.coverImageUrl || fallback?.thumbnailPreview || null,
      thumbnailPreview: course?.coverImageUrl || fallback?.thumbnailPreview || fallback?.coverImageUrl || null,
      modules: cleanCourseModules((course?.modules && course.modules.length > 0) ? course.modules : (fallback?.modules || [])),
      category: fallback?.category || 'Development',
      language: fallback?.language || 'English',
      level: course?.level ? String(course.level).charAt(0) + String(course.level).slice(1).toLowerCase().replace(/_/g, ' ') : (fallback?.level || 'Beginner'),
      price: (course?.price !== undefined && course?.price !== null) ? Number(course.price) : (fallback?.price !== undefined ? Number(fallback.price) : 0),
      discountPrice: (course?.discountPrice !== undefined && course?.discountPrice !== null) ? Number(course.discountPrice) : (fallback?.discountPrice !== undefined ? Number(fallback.discountPrice) : 0),
      currency: fallback?.currency || 'INR ₹',
      courseType: fallback?.courseType || (Number(course?.price || fallback?.price || 0) > 0 ? 'Paid' : 'Free'),
      accessType: fallback?.accessType || 'Lifetime Access',
      durationCycleMode: fallback?.durationCycleMode || 'Date Range',
      startDate: (course as any)?.startDate || fallback?.startDate,
      endDate: (course as any)?.endDate || fallback?.endDate,
      durationValue: fallback?.durationValue || '90',
      durationUnit: fallback?.durationUnit || 'Days',
      subscriptionCycle: fallback?.subscriptionCycle || 'Monthly',
      enrollmentLimit: fallback?.enrollmentLimit || 'Unlimited',
      courseVisibility: fallback?.courseVisibility || 'Public',
      skillsCovered: fallback?.skillsCovered || fallback?.tags || [],
      prerequisites: fallback?.prerequisites || '',
      estimatedDuration: fallback?.estimatedDuration || '12 Weeks',
      certificateAvailable: fallback?.certificateAvailable !== undefined ? fallback.certificateAvailable : true,
      seoTitle: fallback?.seoTitle || '',
      seoDescription: fallback?.seoDescription || '',
      targetAudience: fallback?.targetAudience || '',
      learningOutcomes: fallback?.learningOutcomes || [],
      requirements: fallback?.requirements || [],
      targetLearners: fallback?.targetLearners || [],
      tags: fallback?.tags || fallback?.skillsCovered || [],
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
