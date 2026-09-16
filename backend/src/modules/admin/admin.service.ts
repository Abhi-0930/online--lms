import { PrismaClient } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { OnboardingService } from '../onboarding/onboarding.service';

export class AdminService {
  public static fallbackCourses = new Map<string, any>();

  constructor(private prisma: PrismaClient) {}

  private formatEducationLabel(status?: string | null): string {
    if (!status) return 'Student';
    const s = status.toLowerCase();
    if (s === '1st_year' || s === '1st year') return '1st Year Student';
    if (s === '2nd_year' || s === '2nd year') return '2nd Year Student';
    if (s === '3rd_year' || s === '3rd year') return '3rd Year Student';
    if (s === '4th_year' || s === '4th year') return '4th Year Student';
    if (s === 'working_professional' || s === 'working professional') return 'Working Professional';
    return status;
  }

  private getInitials(name: string, email: string): string {
    const target = name && name.trim() !== 'Learner' ? name : email.split('@')[0];
    const parts = target.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return target.slice(0, 2).toUpperCase();
  }

  private formatLastActive(dateInput: Date | string | number | null | undefined): { label: string; date: string } {
    if (!dateInput) {
      return { label: 'Never', date: new Date().toISOString() };
    }
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return { label: 'Never', date: new Date().toISOString() };
    }

    const now = Date.now();
    const diffMs = Math.max(0, now - date.getTime());
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let label = '';
    if (diffMins < 1) {
      label = 'Just now';
    } else if (diffMins === 1) {
      label = '1 min ago';
    } else if (diffMins < 60) {
      label = `${diffMins} mins ago`;
    } else if (diffHours === 1) {
      label = '1 hr ago';
    } else if (diffHours < 24) {
      label = `${diffHours} hrs ago`;
    } else if (diffDays === 1) {
      label = 'Yesterday';
    } else if (diffDays < 7) {
      label = `${diffDays} days ago`;
    } else {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    return { label, date: date.toISOString() };
  }

  async getDashboardStats() {
    let dbUsers: any[] = [];
    try {
      dbUsers = await this.prisma.user.findMany({
        include: {
          onboarding: true,
          enrollments: true,
          devices: {
            orderBy: { lastActiveAt: 'desc' },
            take: 1,
          },
          activityLogs: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      dbUsers = Array.from(AuthService.fallbackUsers.values());
    }

    // Merge in-memory fallback users if any
    const userMap = new Map<string, any>();
    for (const u of dbUsers) {
      userMap.set(u.email.toLowerCase(), u);
    }
    for (const u of AuthService.fallbackUsers.values()) {
      if (!userMap.has(u.email.toLowerCase())) {
        userMap.set(u.email.toLowerCase(), u);
      } else {
        const existing = userMap.get(u.email.toLowerCase());
        if (u.lastActiveAt) existing.lastActiveAt = u.lastActiveAt;
        if (u.lastLoginAt) existing.lastLoginAt = u.lastLoginAt;
      }
    }

    const allUsers = Array.from(userMap.values());
    const totalStudents = allUsers.length;
    // Active students matches total students per requirement
    const activeStudents = totalStudents;

    let totalEnrollments = 0;
    try {
      totalEnrollments = await this.prisma.enrollment.count();
    } catch {
      totalEnrollments = 0;
    }

    let totalCourses = 0;
    try {
      totalCourses = await this.prisma.course.count();
    } catch {
      totalCourses = 0;
    }
    totalCourses += AdminService.fallbackCourses.size;

    // Recent activity items based on true last active timestamps
    const recentActivities = allUsers.slice(0, 5).map((u) => {
      const name = u.fullName || u.name || u.email.split('@')[0];

      const candidateDates: number[] = [];
      if (u.lastActiveAt) candidateDates.push(new Date(u.lastActiveAt).getTime());
      if (u.lastLoginAt) candidateDates.push(new Date(u.lastLoginAt).getTime());
      if (u.devices && u.devices.length > 0 && u.devices[0]?.lastActiveAt) {
        candidateDates.push(new Date(u.devices[0].lastActiveAt).getTime());
      }
      if (u.activityLogs && u.activityLogs.length > 0 && u.activityLogs[0]?.createdAt) {
        candidateDates.push(new Date(u.activityLogs[0].createdAt).getTime());
      }
      if (u.onboarding?.updatedAt) {
        candidateDates.push(new Date(u.onboarding.updatedAt).getTime());
      }
      if (u.updatedAt) {
        candidateDates.push(new Date(u.updatedAt).getTime());
      }
      if (u.createdAt) {
        candidateDates.push(new Date(u.createdAt).getTime());
      }

      const validTimestamps = candidateDates.filter((t) => !isNaN(t) && t > 0);
      const latestTimestamp = validTimestamps.length > 0 ? Math.max(...validTimestamps) : Date.now();
      const { label: timeStr } = this.formatLastActive(latestTimestamp);

      const hasEnrollments = Array.isArray(u.enrollments) && u.enrollments.length > 0;
      return {
        title: hasEnrollments ? `Student enrolled: ${name}` : `Learner registered: ${name}`,
        detail: u.email,
        time: timeStr,
      };
    });

    return {
      totalStudents,
      activeStudents,
      paidEnrollments: totalEnrollments,
      coursesCount: totalCourses,
      recentActivities,
    };
  }

  async getAllStudents() {
    let dbUsers: any[] = [];
    try {
      dbUsers = await this.prisma.user.findMany({
        include: {
          onboarding: true,
          enrollments: {
            include: { course: true },
          },
          devices: {
            orderBy: { lastActiveAt: 'desc' },
            take: 1,
          },
          activityLogs: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      dbUsers = Array.from(AuthService.fallbackUsers.values());
    }

    const userMap = new Map<string, any>();
    for (const u of dbUsers) {
      userMap.set(u.email.toLowerCase(), u);
    }
    for (const u of AuthService.fallbackUsers.values()) {
      if (!userMap.has(u.email.toLowerCase())) {
        userMap.set(u.email.toLowerCase(), u);
      } else {
        const existing = userMap.get(u.email.toLowerCase());
        if (u.lastActiveAt) existing.lastActiveAt = u.lastActiveAt;
        if (u.lastLoginAt) existing.lastLoginAt = u.lastLoginAt;
      }
    }

    const allUsers = Array.from(userMap.values());

    return allUsers.map((u, index) => {
      const email = u.email;
      let name = u.fullName || u.name;
      if (!name || name.trim().toLowerCase() === 'learner') {
        name = email.split('@')[0];
      }
      name = name
        .replace(/[._-]+/g, ' ')
        .replace(/\d+/g, '')
        .trim();
      name = name
        ? name
            .split(/\s+/)
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ')
        : email.split('@')[0];

      // Onboarding data
      const onboarding =
        u.onboarding ||
        OnboardingService.getOnboardingRecord(u.id) ||
        OnboardingService.getOnboardingRecord(email);

      const educationStatus = onboarding?.educationStatus;
      const educationLabel = this.formatEducationLabel(educationStatus);
      const targetDomain = onboarding?.targetDomain;
      const primaryGoal = onboarding?.primaryGoal;

      // Determine course / track and progress
      const hasEnrollments = Array.isArray(u.enrollments) && u.enrollments.length > 0;
      let courseName = 'Not enrolled';
      let progress = 0;
      let status = 'Not enrolled';

      if (hasEnrollments) {
        const firstEnrollment = u.enrollments[0];
        courseName =
          firstEnrollment?.course?.title ||
          (typeof firstEnrollment === 'string' ? firstEnrollment : 'Enrolled Course');

        if (typeof firstEnrollment?.progress === 'number') {
          progress = firstEnrollment.progress;
        } else if (onboarding?.isCompleted) {
          progress = 100;
        } else if (onboarding?.completedStep) {
          progress = Math.min(100, Math.round((onboarding.completedStep / 4) * 100));
        } else {
          progress = 25;
        }

        status = progress >= 70 ? 'On track' : progress > 0 ? 'In progress' : 'Enrolled';
      }

      // Collect all candidate timestamps to determine true last active / login
      const candidateDates: number[] = [];

      if (u.devices && u.devices.length > 0 && u.devices[0]?.lastActiveAt) {
        candidateDates.push(new Date(u.devices[0].lastActiveAt).getTime());
      }
      if (u.activityLogs && u.activityLogs.length > 0 && u.activityLogs[0]?.createdAt) {
        candidateDates.push(new Date(u.activityLogs[0].createdAt).getTime());
      }
      if (u.lastActiveAt) {
        candidateDates.push(new Date(u.lastActiveAt).getTime());
      }
      if (u.lastLoginAt) {
        candidateDates.push(new Date(u.lastLoginAt).getTime());
      }
      if (onboarding?.updatedAt) {
        candidateDates.push(new Date(onboarding.updatedAt).getTime());
      }
      if (onboarding?.completedAt) {
        candidateDates.push(new Date(onboarding.completedAt).getTime());
      }
      if (u.updatedAt) {
        candidateDates.push(new Date(u.updatedAt).getTime());
      }
      if (u.createdAt) {
        candidateDates.push(new Date(u.createdAt).getTime());
      }

      const validTimestamps = candidateDates.filter((t) => !isNaN(t) && t > 0);
      const latestTimestamp = validTimestamps.length > 0 ? Math.max(...validTimestamps) : Date.now();
      const { label: activityStr, date: lastActiveIso } = this.formatLastActive(latestTimestamp);

      return {
        id: u.id || index + 1,
        name,
        email,
        role: u.role || 'STUDENT',
        education: educationLabel,
        rawEducation: educationStatus,
        targetDomain,
        primaryGoal,
        course: courseName,
        progress,
        activity: activityStr,
        lastActiveAt: lastActiveIso,
        status,
        avatar: this.getInitials(name, email),
        createdAt: u.createdAt || new Date().toISOString(),
      };
    });
  }

  async getAllCourses() {
    let dbCourses: any[] = [];
    try {
      dbCourses = await this.prisma.course.findMany({
        include: {
          instructor: true,
          enrollments: true,
          modules: {
            include: { lessons: true },
            orderBy: { position: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      dbCourses = [];
    }

    const courseMap = new Map<string, any>();
    for (const course of dbCourses) {
      courseMap.set(course.id, course);
    }
    for (const fallback of AdminService.fallbackCourses.values()) {
      if (!courseMap.has(fallback.id)) {
        courseMap.set(fallback.id, fallback);
      }
    }

    const allCoursesList = Array.from(courseMap.values());

    if (allCoursesList.length === 0) {
      return [];
    }

    const students = await this.getAllStudents();

    return allCoursesList.map((course) => {
      const courseStudents = students.filter((s) => {
        const cName = (s.course || '').toLowerCase();
        const title = (course.title || '').toLowerCase();
        return cName.includes(title) || title.includes(cName);
      });

      const count = courseStudents.length;
      const avgProgress =
        count > 0
          ? Math.round(courseStudents.reduce((sum, s) => sum + (s.progress || 0), 0) / count)
          : 0;

      const mappedModules = (course.modules || []).map((mod: any, mIdx: number) => {
        if (mod.topics) {
          return mod;
        }
        const lessons = mod.lessons || [];
        return {
          id: mod.id || `mod_${mIdx}`,
          title: mod.title || `Module ${mIdx + 1}`,
          description: mod.description || '',
          topics: lessons.length > 0 ? [
            {
              id: `top_${mod.id || mIdx}`,
              title: 'Lessons & Topics',
              subtopics: lessons.map((l: any) => ({
                id: l.id,
                title: l.title,
                type: l.type ? (l.type.charAt(0).toUpperCase() + l.type.slice(1).toLowerCase()) : 'Video',
                duration: l.durationSeconds ? `${Math.round(l.durationSeconds / 60)} mins` : '15 mins',
              })),
            }
          ] : [],
        };
      });

      const priceStr = course.price !== undefined ? String(course.price) : '0';

      return {
        id: course.id,
        title: course.title,
        subtitle: course.subtitle || course.track || '',
        description: course.description || '',
        language: course.language || 'English',
        category: course.category || 'Development',
        level: course.level ? (course.level === 'ALL_LEVELS' ? 'All Levels' : course.level.charAt(0).toUpperCase() + course.level.slice(1).toLowerCase()) : 'Beginner',
        coverImageUrl: course.coverImageUrl || course.thumbnailPreview || null,
        thumbnailPreview: course.thumbnailPreview || course.coverImageUrl || null,
        price: priceStr,
        discountPrice: course.discountPrice !== undefined ? String(course.discountPrice) : '',
        currency: course.currency || 'INR ₹',
        courseType: course.courseType || (Number(priceStr) > 0 ? 'Paid' : 'Free'),
        accessType: course.accessType || 'Lifetime Access',
        durationCycleMode: course.durationCycleMode || 'Date Range',
        startDate: course.startDate || '',
        endDate: course.endDate || '',
        durationValue: course.durationValue || '90',
        durationUnit: course.durationUnit || 'Days',
        subscriptionCycle: course.subscriptionCycle || 'Monthly',
        enrollmentLimit: course.enrollmentLimit || 'Unlimited',
        courseVisibility: course.courseVisibility || 'Public',
        modules: mappedModules,
        track: course.subtitle || (course.description ? course.description.slice(0, 30) : 'General track'),
        instructor: course.instructor?.fullName || course.instructorName || 'Platform Admin',
        instructorName: course.instructor?.fullName || course.instructorName || 'Platform Admin',
        students: count,
        completion: avgProgress,
        revenue: Number(priceStr) > 0 ? `₹${priceStr}` : '₹0',
        status:
          course.status === 'PUBLISHED' || course.status === 'Published'
            ? 'Published'
            : course.status === 'DRAFT' || course.status === 'Draft'
            ? 'Draft'
            : 'Review',
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
        color: course.color || '#dbeafe',
        initials: (course.title || 'COU').slice(0, 3).toUpperCase(),
      };
    });
  }

  async saveCourseDraft(data: {
    id?: string;
    title: string;
    subtitle?: string;
    description: string;
    language?: string;
    category?: string;
    level?: string;
    coverImageUrl?: string;
    thumbnailPreview?: string;
    price?: number;
    discountPrice?: number;
    currency?: string;
    courseType?: string;
    accessType?: string;
    durationCycleMode?: string;
    startDate?: string;
    endDate?: string;
    durationValue?: string;
    durationUnit?: string;
    subscriptionCycle?: string;
    enrollmentLimit?: string;
    courseVisibility?: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    instructorName?: string;
    skillsCovered?: string[];
    prerequisites?: string;
    estimatedDuration?: string;
    certificateAvailable?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    targetAudience?: string;
    learningOutcomes?: string[];
    requirements?: string[];
    targetLearners?: string[];
    tags?: string[];
    modules?: Array<{
      id?: string;
      title: string;
      description?: string;
      topics?: Array<{
        id?: string;
        title: string;
        subtopics?: Array<{
          id?: string;
          title: string;
          type?: string;
          duration?: string;
        }>;
      }>;
    }>;
  }) {
    const baseSlug = data.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `course-${Date.now()}`;
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    let levelEnum: any = 'BEGINNER';
    if (data.level) {
      const lvl = data.level.toUpperCase().replace(/\s+/g, '_');
      if (lvl === 'INTERMEDIATE') levelEnum = 'INTERMEDIATE';
      else if (lvl === 'ADVANCED') levelEnum = 'ADVANCED';
      else if (lvl === 'ALL_LEVELS' || lvl === 'ALL') levelEnum = 'ALL_LEVELS';
    }

    const instructorDisplayName = data.instructorName?.trim() || 'Platform Admin';

    if (data.id && AdminService.fallbackCourses.has(data.id)) {
      const existing = AdminService.fallbackCourses.get(data.id);
      const updated = {
        ...existing,
        ...data,
        id: data.id,
        instructor: { fullName: instructorDisplayName, email: 'admin@learnhub.com' },
        updatedAt: new Date(),
      };
      AdminService.fallbackCourses.set(data.id, updated);
      try {
        await this.prisma.course.update({
          where: { id: data.id },
          data: {
            title: data.title,
            subtitle: data.subtitle || null,
            description: data.description,
            coverImageUrl: data.coverImageUrl || data.thumbnailPreview || null,
            price: data.price !== undefined ? data.price : undefined,
            status: data.status || 'DRAFT',
          },
        });
      } catch {}
      return updated;
    }

    try {
      let instructor: any = null;
      if (data.instructorName?.trim()) {
        instructor = await this.prisma.user.findFirst({
          where: { fullName: { contains: data.instructorName.trim(), mode: 'insensitive' } },
        });
      }

      if (!instructor) {
        instructor = await this.prisma.user.findFirst({
          where: { role: { in: ['ADMIN', 'INSTRUCTOR'] } },
        });
      }

      if (!instructor) {
        instructor = await this.prisma.user.findFirst();
      }

      if (!instructor) {
        instructor = await this.prisma.user.create({
          data: {
            email: 'admin@learnhub.com',
            fullName: instructorDisplayName,
            role: 'ADMIN',
            isEmailVerified: true,
          },
        });
      }

      const modulesCreate = data.modules && data.modules.length > 0 ? {
        create: data.modules.map((mod, mIdx) => ({
          title: mod.title,
          description: mod.description || null,
          position: mIdx + 1,
          lessons: mod.topics && mod.topics.length > 0 ? {
            create: mod.topics.flatMap((top, tIdx) => {
              if (top.subtopics && top.subtopics.length > 0) {
                return top.subtopics.map((sub, sIdx) => {
                  const subType = (sub.type || 'Video').toUpperCase();
                  let lessonType: any = 'VIDEO';
                  if (subType === 'QUIZ') lessonType = 'QUIZ';
                  else if (subType === 'ASSIGNMENT') lessonType = 'ASSIGNMENT';
                  else if (subType === 'ARTICLE') lessonType = 'ARTICLE';

                  return {
                    title: `${top.title} · ${sub.title}`,
                    slug: `lesson-${Date.now()}-${mIdx}-${tIdx}-${sIdx}`,
                    type: lessonType,
                    position: (tIdx * 10) + sIdx + 1,
                  };
                });
              }
              return [{
                title: top.title,
                slug: `lesson-${Date.now()}-${mIdx}-${tIdx}`,
                type: 'VIDEO' as const,
                position: tIdx + 1,
              }];
            }),
          } : undefined,
        })),
      } : undefined;

      const course = await this.prisma.course.create({
        data: {
          slug,
          title: data.title,
          subtitle: data.subtitle || null,
          description: data.description,
          coverImageUrl: data.coverImageUrl || data.thumbnailPreview || null,
          price: data.price || 0,
          level: levelEnum,
          status: data.status || 'DRAFT',
          instructorId: instructor.id,
          modules: modulesCreate,
        },
        include: {
          instructor: true,
          modules: {
            include: { lessons: true },
          },
        },
      });

      const fullCourse = {
        ...course,
        ...data,
        id: course.id,
        instructor: { fullName: instructorDisplayName, email: 'admin@learnhub.com' },
      };
      AdminService.fallbackCourses.set(course.id, fullCourse);
      return fullCourse;
    } catch (dbErr) {
      const fallbackId = data.id || `course_${Date.now()}`;
      const fallbackCourse = {
        id: fallbackId,
        slug,
        title: data.title,
        subtitle: data.subtitle || null,
        description: data.description,
        language: data.language || 'English',
        category: data.category || 'Development',
        level: data.level || 'Beginner',
        coverImageUrl: data.coverImageUrl || data.thumbnailPreview || null,
        thumbnailPreview: data.coverImageUrl || data.thumbnailPreview || null,
        price: data.price || 0,
        discountPrice: data.discountPrice || 0,
        currency: data.currency || 'INR ₹',
        courseType: data.courseType || (data.price && data.price > 0 ? 'Paid' : 'Free'),
        accessType: data.accessType || 'Lifetime Access',
        durationCycleMode: data.durationCycleMode || 'Date Range',
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        endDate: data.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        durationValue: data.durationValue || '90',
        durationUnit: data.durationUnit || 'Days',
        subscriptionCycle: data.subscriptionCycle || 'Monthly',
        enrollmentLimit: data.enrollmentLimit || 'Unlimited',
        courseVisibility: data.courseVisibility || 'Public',
        status: data.status || 'DRAFT',
        instructorId: 'admin_user',
        instructor: { fullName: instructorDisplayName, email: 'admin@learnhub.com' },
        instructorName: instructorDisplayName,
        modules: data.modules || [],
        skillsCovered: data.skillsCovered || data.tags || [],
        prerequisites: data.prerequisites || '',
        estimatedDuration: data.estimatedDuration || '12 Weeks',
        certificateAvailable: data.certificateAvailable !== undefined ? data.certificateAvailable : true,
        seoTitle: data.seoTitle || '',
        seoDescription: data.seoDescription || '',
        targetAudience: data.targetAudience || '',
        learningOutcomes: data.learningOutcomes || [],
        requirements: data.requirements || [],
        targetLearners: data.targetLearners || [],
        tags: data.tags || data.skillsCovered || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      AdminService.fallbackCourses.set(fallbackId, fallbackCourse);
      return fallbackCourse;
    }
  }

  async updateCourse(
    id: string,
    data: {
      status?: string;
      title?: string;
      price?: number;
      description?: string;
      [key: string]: any;
    }
  ) {
    let mappedStatus: any = undefined;
    if (data.status) {
      const s = data.status.toUpperCase();
      if (s === 'PUBLISHED') mappedStatus = 'PUBLISHED';
      else if (s === 'DRAFT') mappedStatus = 'DRAFT';
      else if (s === 'ARCHIVED') mappedStatus = 'ARCHIVED';
      else if (s === 'REVIEW' || s === 'UNDER REVIEW') mappedStatus = 'DRAFT';
    }

    try {
      const updated = await this.prisma.course.update({
        where: { id },
        data: {
          ...(data.title ? { title: data.title } : {}),
          ...(data.description ? { description: data.description } : {}),
          ...(data.price !== undefined ? { price: data.price } : {}),
          ...(mappedStatus ? { status: mappedStatus } : {}),
        },
      });
      if (AdminService.fallbackCourses.has(id)) {
        AdminService.fallbackCourses.set(id, {
          ...AdminService.fallbackCourses.get(id),
          ...data,
          ...updated,
        });
      }
      return updated;
    } catch {
      if (AdminService.fallbackCourses.has(id)) {
        const existing = AdminService.fallbackCourses.get(id);
        const updated = {
          ...existing,
          ...data,
          ...(data.title ? { title: data.title } : {}),
          ...(data.description ? { description: data.description } : {}),
          ...(data.price !== undefined ? { price: data.price } : {}),
          ...(data.status ? { status: data.status } : {}),
          updatedAt: new Date(),
        };
        AdminService.fallbackCourses.set(id, updated);
        return updated;
      }
      return { id, ...data };
    }
  }

  async deleteCourse(id: string) {
    try {
      await this.prisma.course.delete({
        where: { id },
      });
    } catch {
      // ignore db unreachable
    }
    AdminService.fallbackCourses.delete(id);
    return { success: true, id };
  }
}

