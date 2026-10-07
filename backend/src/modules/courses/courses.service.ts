import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';
import { AdminService, reconstructTopicsFromLessons, cleanLessonTitle } from '../admin/admin.service';

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
            modules: {
              include: { lessons: { orderBy: { position: 'asc' } } },
              orderBy: { position: 'asc' },
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

    const activeCourses = courses.filter((c) => !isDeleted(c));

    const mappedCourses = activeCourses.map((c) => {
      const fallback = AdminService.fallbackCourses.get(String(c.id)) ||
                       AdminService.fallbackCourses.get(String(c.slug)) || {};

      const mappedModules = (c.modules || []).map((mod: any, mIdx: number) => {
        const lessons = mod.lessons || [];
        const reconstructedTopics = reconstructTopicsFromLessons(lessons);

        return {
          id: mod.id || `mod_${mIdx}`,
          title: cleanLessonTitle(mod.title) || `Module ${mIdx + 1}`,
          description: mod.description || '',
          position: mod.position || (mIdx + 1),
          lessons: lessons.map((l: any, lIdx: number) => ({
            id: l.id || `les_${lIdx}`,
            title: cleanLessonTitle(l.title),
            slug: l.slug || `lesson-${lIdx}`,
            type: l.type ? (l.type.charAt(0).toUpperCase() + l.type.slice(1).toLowerCase()) : 'Video',
            durationSeconds: l.durationSeconds || 0,
            duration: l.durationSeconds ? `${Math.round(l.durationSeconds / 60)} mins` : '15 mins',
            isFreePreview: Boolean(l.isFreePreview),
            videoUrl: l.videoUrl || null,
            content: l.content || null,
            position: l.position || (lIdx + 1),
          })),
          topics: (mod.topics && mod.topics.length > 0) ? mod.topics : (reconstructedTopics.length > 0 ? reconstructedTopics : (lessons.length > 0 ? [
            {
              id: `top_${mod.id || mIdx}`,
              title: 'Topic',
              subtopics: lessons.map((l: any, sIdx: number) => ({
                id: l.id || `sub_${sIdx}`,
                title: cleanLessonTitle(l.title),
                type: l.type ? (l.type.charAt(0).toUpperCase() + l.type.slice(1).toLowerCase()) : 'Video',
                duration: l.durationSeconds ? `${Math.round(l.durationSeconds / 60)} mins` : '15 mins',
                durationSeconds: l.durationSeconds || 0,
                videoUrl: l.videoUrl || null,
                isFreePreview: Boolean(l.isFreePreview),
                content: l.content || null,
              })),
            }
          ] : [])),
        };
      });

      return {
        ...fallback,
        ...fallback,
        ...c,
        id: String(c.id),
        slug: c.slug || fallback.slug || String(c.id),
        title: c.title || fallback.title,
        subtitle: (c.subtitle !== undefined && c.subtitle !== null) ? c.subtitle : (fallback.subtitle || ''),
        description: c.description || fallback.description || '',
        coverImageUrl: c.coverImageUrl || fallback.coverImageUrl || fallback.thumbnailPreview || null,
        thumbnailPreview: c.coverImageUrl || fallback.thumbnailPreview || fallback.coverImageUrl || null,
        modules: mappedModules,
        category: c.category || fallback.category || '',
        language: c.language || fallback.language || 'English',
        level: c.level ? String(c.level).charAt(0) + String(c.level).slice(1).toLowerCase().replace(/_/g, ' ') : (fallback.level || 'Beginner'),
        price: c.price !== undefined && c.price !== null ? Number(c.price) : (fallback.price !== undefined ? Number(fallback.price) : 0),
        discountPrice: c.discountPrice !== undefined && c.discountPrice !== null ? Number(c.discountPrice) : (fallback.discountPrice !== undefined ? Number(fallback.discountPrice) : 0),
        currency: c.currency || fallback.currency || 'INR ₹',
        courseType: c.courseType || fallback.courseType || (Number(c.price) > 0 ? 'Paid' : 'Free'),
        accessType: c.accessType || fallback.accessType || 'Lifetime Access',
        durationCycleMode: fallback.durationCycleMode || 'Date Range',
        startDate: c.startDate || fallback.startDate || '',
        endDate: c.endDate || fallback.endDate || '',
        durationValue: c.durationValue || fallback.durationValue || '90',
        durationUnit: c.durationUnit || fallback.durationUnit || 'Days',
        subscriptionCycle: c.subscriptionCycle || fallback.subscriptionCycle || 'Monthly',
        instructor: c.instructor?.fullName || fallback.instructorName || (typeof fallback.instructor === 'string' ? fallback.instructor : fallback.instructor?.fullName || ''),
        instructorName: c.instructor?.fullName || fallback.instructorName || (typeof fallback.instructor === 'string' ? fallback.instructor : fallback.instructor?.fullName || ''),
        skillsCovered: (Array.isArray(c.skillsCovered) && c.skillsCovered.length > 0) ? c.skillsCovered : (Array.isArray(c.tags) && c.tags.length > 0 ? c.tags : (fallback.skillsCovered || fallback.tags || [])),
        prerequisites: c.prerequisites || fallback.prerequisites || '',
        estimatedDuration: c.estimatedDuration !== undefined ? c.estimatedDuration : (fallback.estimatedDuration || ''),
        certificateAvailable: c.certificateAvailable !== undefined && c.certificateAvailable !== null ? c.certificateAvailable : (fallback.certificateAvailable !== undefined ? fallback.certificateAvailable : true),
        seoTitle: c.seoTitle || fallback.seoTitle || '',
        seoDescription: c.seoDescription || fallback.seoDescription || '',
        targetAudience: c.targetAudience || fallback.targetAudience || '',
        learningOutcomes: (Array.isArray(c.learningOutcomes) && c.learningOutcomes.length > 0) ? c.learningOutcomes : (fallback.learningOutcomes || []),
        requirements: (Array.isArray(c.requirements) && c.requirements.length > 0) ? c.requirements : (fallback.requirements || []),
        targetLearners: (Array.isArray(c.targetLearners) && c.targetLearners.length > 0) ? c.targetLearners : (fallback.targetLearners || []),
        tags: (Array.isArray(c.tags) && c.tags.length > 0) ? c.tags : (Array.isArray(c.skillsCovered) && c.skillsCovered.length > 0 ? c.skillsCovered : (fallback.tags || fallback.skillsCovered || [])),
        status: c.status === 'PUBLISHED' ? 'Published' : c.status === 'DRAFT' ? 'Draft' : c.status === 'ARCHIVED' ? 'Archived' : (fallback.status || 'Published'),
        updatedAt: c.updatedAt || fallback.updatedAt || new Date().toISOString(),
      };
    });

    return {
      courses: mappedCourses,
      pagination: {
        page,
        limit,
        total: Math.max(total, mappedCourses.length),
        totalPages: Math.ceil(Math.max(total, mappedCourses.length) / limit),
      },
    };
  }

  async getCourseBySlug(slug: string) {
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

    if (!course || isDeleted(course)) {
      throw new Error('Course not found');
    }

    const fallback = AdminService.fallbackCourses.get(String(course.id)) ||
                     AdminService.fallbackCourses.get(String(course.slug)) || {};

    const mappedModules = (course.modules || []).map((mod: any, mIdx: number) => {
      const lessons = mod.lessons || [];
      const reconstructedTopics = reconstructTopicsFromLessons(lessons);

      return {
        id: mod.id || `mod_${mIdx}`,
        title: cleanLessonTitle(mod.title) || `Module ${mIdx + 1}`,
        description: mod.description || '',
        position: mod.position || (mIdx + 1),
        lessons: lessons.map((l: any, lIdx: number) => ({
          id: l.id || `les_${lIdx}`,
          title: cleanLessonTitle(l.title),
          slug: l.slug || `lesson-${lIdx}`,
          type: l.type ? (l.type.charAt(0).toUpperCase() + l.type.slice(1).toLowerCase()) : 'Video',
          durationSeconds: l.durationSeconds || 0,
          duration: l.durationSeconds ? `${Math.round(l.durationSeconds / 60)} mins` : '15 mins',
          isFreePreview: Boolean(l.isFreePreview),
          videoUrl: l.videoUrl || null,
          content: l.content || null,
          position: l.position || (lIdx + 1),
        })),
        topics: (mod.topics && mod.topics.length > 0) ? mod.topics : (reconstructedTopics.length > 0 ? reconstructedTopics : (lessons.length > 0 ? [
          {
            id: `top_${mod.id || mIdx}`,
            title: 'Topic',
            subtopics: lessons.map((l: any, sIdx: number) => ({
              id: l.id || `sub_${sIdx}`,
              title: cleanLessonTitle(l.title),
              type: l.type ? (l.type.charAt(0).toUpperCase() + l.type.slice(1).toLowerCase()) : 'Video',
              duration: l.durationSeconds ? `${Math.round(l.durationSeconds / 60)} mins` : '15 mins',
              durationSeconds: l.durationSeconds || 0,
              videoUrl: l.videoUrl || null,
              isFreePreview: Boolean(l.isFreePreview),
              content: l.content || null,
            })),
          }
        ] : [])),
      };
    });

    const merged = {
      ...fallback,
      ...course,
      id: String(course.id),
      slug: course.slug || fallback.slug || slug,
      title: course.title || fallback.title || 'Untitled Course',
      subtitle: (course.subtitle !== undefined && course.subtitle !== null) ? course.subtitle : (fallback.subtitle || ''),
      description: course.description || fallback.description || '',
      coverImageUrl: course.coverImageUrl || fallback.coverImageUrl || fallback.thumbnailPreview || null,
      thumbnailPreview: course.coverImageUrl || fallback.thumbnailPreview || fallback.coverImageUrl || null,
      modules: mappedModules,
      category: course.category || fallback.category || '',
      language: course.language || fallback.language || 'English',
      level: course.level ? String(course.level).charAt(0) + String(course.level).slice(1).toLowerCase().replace(/_/g, ' ') : (fallback.level || 'Beginner'),
      price: (course.price !== undefined && course.price !== null) ? Number(course.price) : (fallback.price !== undefined ? Number(fallback.price) : 0),
      discountPrice: (course.discountPrice !== undefined && course.discountPrice !== null) ? Number(course.discountPrice) : (fallback.discountPrice !== undefined ? Number(fallback.discountPrice) : 0),
      currency: course.currency || fallback.currency || 'INR ₹',
      courseType: course.courseType || fallback.courseType || (Number(course.price || fallback.price || 0) > 0 ? 'Paid' : 'Free'),
      accessType: course.accessType || fallback.accessType || 'Lifetime Access',
      durationCycleMode: fallback.durationCycleMode || 'Date Range',
      startDate: course.startDate || fallback.startDate || '',
      endDate: course.endDate || fallback.endDate || '',
      durationValue: course.durationValue || fallback.durationValue || '90',
      durationUnit: course.durationUnit || fallback.durationUnit || 'Days',
      subscriptionCycle: course.subscriptionCycle || fallback.subscriptionCycle || 'Monthly',
      enrollmentLimit: course.enrollmentLimit || fallback.enrollmentLimit || 'Unlimited',
      instructor: course.instructor?.fullName || fallback.instructorName || (typeof fallback.instructor === 'string' ? fallback.instructor : fallback.instructor?.fullName || ''),
      instructorName: course.instructor?.fullName || fallback.instructorName || (typeof fallback.instructor === 'string' ? fallback.instructor : fallback.instructor?.fullName || ''),
      status: course.status === 'PUBLISHED' ? 'Published' : course.status === 'DRAFT' ? 'Draft' : course.status === 'ARCHIVED' ? 'Archived' : (fallback.status || 'Published'),
      skillsCovered: (Array.isArray(course.skillsCovered) && course.skillsCovered.length > 0) ? course.skillsCovered : (Array.isArray(course.tags) && course.tags.length > 0 ? course.tags : (fallback.skillsCovered || fallback.tags || [])),
      prerequisites: course.prerequisites || fallback.prerequisites || '',
      estimatedDuration: course.estimatedDuration !== undefined ? course.estimatedDuration : (fallback.estimatedDuration || ''),
      certificateAvailable: course.certificateAvailable !== undefined && course.certificateAvailable !== null ? course.certificateAvailable : (fallback.certificateAvailable !== undefined ? fallback.certificateAvailable : true),
      seoTitle: course.seoTitle || fallback.seoTitle || '',
      seoDescription: course.seoDescription || fallback.seoDescription || '',
      targetAudience: course.targetAudience || fallback.targetAudience || '',
      learningOutcomes: (Array.isArray(course.learningOutcomes) && course.learningOutcomes.length > 0) ? course.learningOutcomes : (fallback.learningOutcomes || []),
      requirements: (Array.isArray(course.requirements) && course.requirements.length > 0) ? course.requirements : (fallback.requirements || []),
      targetLearners: (Array.isArray(course.targetLearners) && course.targetLearners.length > 0) ? course.targetLearners : (fallback.targetLearners || []),
      tags: (Array.isArray(course.tags) && course.tags.length > 0) ? course.tags : (Array.isArray(course.skillsCovered) && course.skillsCovered.length > 0 ? course.skillsCovered : (fallback.tags || fallback.skillsCovered || [])),
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
