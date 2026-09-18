import { PrismaClient } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { OnboardingService } from '../onboarding/onboarding.service';

export class AdminService {
  public static fallbackCourses = new Map<string, any>();
  public static fallbackAssignments = new Map<string, any>();
  public static fallbackSubmissions = new Map<string, any>();

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
        where: { role: 'STUDENT' },
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
      dbUsers = Array.from(AuthService.fallbackUsers.values()).filter((u) => (u.role || 'STUDENT') === 'STUDENT');
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
        where: { role: 'STUDENT' },
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
      dbUsers = Array.from(AuthService.fallbackUsers.values()).filter((u) => (u.role || 'STUDENT') === 'STUDENT');
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
        createdAt: course.createdAt || new Date().toISOString(),
        updatedAt: course.updatedAt || course.createdAt || new Date().toISOString(),
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

  async getAllAssignments() {
    let dbAssignments: any[] = [];
    try {
      dbAssignments = await (this.prisma as any).assignment.findMany({
        include: {
          course: {
            select: { id: true, title: true, slug: true },
          },
          submissions: {
            select: { id: true, score: true, maxScore: true, status: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      dbAssignments = [];
    }

    const assignmentMap = new Map<string, any>();
    for (const a of dbAssignments) {
      assignmentMap.set(a.id, a);
    }
    for (const fallback of AdminService.fallbackAssignments.values()) {
      if (!assignmentMap.has(fallback.id)) {
        assignmentMap.set(fallback.id, fallback);
      }
    }

    const allList = Array.from(assignmentMap.values());

    return allList.map((item) => {
      const subs = Array.isArray(item.submissions) ? item.submissions : [];
      const subCount = subs.length;
      const gradedSubs = subs.filter((s: any) => s.score !== null && s.score !== undefined);
      const avgScore = gradedSubs.length > 0
        ? Math.round(gradedSubs.reduce((acc: number, s: any) => acc + Number(s.score), 0) / gradedSubs.length)
        : null;
      const maxScore = item.totalMarks || 100;

      const formattedDueDate = item.dueDateString || item.deadline || (item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date');

      const rawStatus = (item.status || 'DRAFT').toUpperCase();
      const status = rawStatus === 'PUBLISHED' ? 'Published' : rawStatus === 'SCHEDULED' ? 'Scheduled' : 'Draft';

      return {
        id: item.id,
        title: item.title,
        description: item.description || '',
        instructions: item.instructions || '',
        course: item.course?.title || item.courseName || item.course || 'DSA Placement Program',
        courseId: item.courseId || item.course?.id || null,
        module: item.module || 'General',
        topic: item.topic || '',
        difficulty: item.difficulty || 'Medium',
        dueDate: formattedDueDate,
        deadline: item.deadline || formattedDueDate,
        deadlineTime: item.deadlineTime || '',
        releaseDate: item.releaseDate || '',
        startTime: item.startTime || '',
        submissions: subCount,
        maxScore,
        avgGrade: avgScore !== null ? `${avgScore}/${maxScore}` : '--',
        status,
        problemsCount: item.problemsCount || (Array.isArray(item.problemsList) ? item.problemsList.length : 0),
        problemsList: item.problemsList || [],
        resources: item.resources || [],
        submissionTypes: item.submissionTypes || ['Code Editor / IDE', 'ZIP / File upload', 'GitHub repository link'],
        allowLate: item.allowLate || false,
        latePenalty: item.latePenalty || '10% per day',
        maxFileSize: item.maxFileSize || '25 MB',
        maxAttempts: item.maxAttempts || 'Unlimited',
        totalMarks: item.totalMarks || 100,
        passingMarks: item.passingMarks || 40,
        gradingMode: item.gradingMode || 'Manual Review',
        targetCohort: item.targetCohort || 'All Learners',
        notifyStudents: item.notifyStudents ?? true,
        createdAt: item.createdAt || new Date().toISOString(),
      };
    });
  }

  async saveAssignment(data: any) {
    const statusEnum = (data.status || 'DRAFT').toUpperCase();
    const mappedStatus = statusEnum === 'PUBLISHED' ? 'PUBLISHED' : statusEnum === 'SCHEDULED' ? 'SCHEDULED' : 'DRAFT';

    let courseId: string | null = null;
    if (data.course) {
      try {
        const found = await this.prisma.course.findFirst({
          where: {
            OR: [
              { id: data.course },
              { title: { contains: data.course, mode: 'insensitive' } },
            ],
          },
        });
        if (found) courseId = found.id;
      } catch {}
    }

    if (data.id && (AdminService.fallbackAssignments.has(data.id) || typeof data.id === 'string')) {
      try {
        const updated = await (this.prisma as any).assignment.upsert({
          where: { id: String(data.id) },
          update: {
            title: data.title,
            description: data.description || null,
            instructions: data.instructions || null,
            courseId,
            courseName: data.course || null,
            module: data.module || null,
            topic: data.topic || null,
            difficulty: data.difficulty || 'Medium',
            problemsCount: data.problemsCount || (Array.isArray(data.problemsList) ? data.problemsList.length : 0),
            problemsList: data.problemsList || [],
            releaseDate: data.releaseDate || null,
            startTime: data.startTime || null,
            deadline: data.deadline || null,
            deadlineTime: data.deadlineTime || null,
            dueDateString: data.deadline || data.dueDate || null,
            allowLate: data.allowLate ?? false,
            latePenalty: data.latePenalty || null,
            resources: data.resources || [],
            submissionTypes: data.submissionTypes || [],
            maxFileSize: data.maxFileSize || null,
            maxAttempts: data.maxAttempts || null,
            totalMarks: Number(data.totalMarks) || 100,
            passingMarks: Number(data.passingMarks) || 40,
            gradingMode: data.gradingMode || null,
            targetCohort: data.targetCohort || null,
            status: mappedStatus,
            notifyStudents: data.notifyStudents ?? true,
          },
          create: {
            id: String(data.id),
            title: data.title,
            description: data.description || null,
            instructions: data.instructions || null,
            courseId,
            courseName: data.course || null,
            module: data.module || null,
            topic: data.topic || null,
            difficulty: data.difficulty || 'Medium',
            problemsCount: data.problemsCount || (Array.isArray(data.problemsList) ? data.problemsList.length : 0),
            problemsList: data.problemsList || [],
            releaseDate: data.releaseDate || null,
            startTime: data.startTime || null,
            deadline: data.deadline || null,
            deadlineTime: data.deadlineTime || null,
            dueDateString: data.deadline || data.dueDate || null,
            allowLate: data.allowLate ?? false,
            latePenalty: data.latePenalty || null,
            resources: data.resources || [],
            submissionTypes: data.submissionTypes || [],
            maxFileSize: data.maxFileSize || null,
            maxAttempts: data.maxAttempts || null,
            totalMarks: Number(data.totalMarks) || 100,
            passingMarks: Number(data.passingMarks) || 40,
            gradingMode: data.gradingMode || null,
            targetCohort: data.targetCohort || null,
            status: mappedStatus,
            notifyStudents: data.notifyStudents ?? true,
          },
        });
        AdminService.fallbackAssignments.set(updated.id, { ...data, ...updated });
        return updated;
      } catch (dbErr) {
        const fullAssignment = {
          id: String(data.id),
          ...data,
          status: mappedStatus,
          updatedAt: new Date(),
        };
        AdminService.fallbackAssignments.set(String(data.id), fullAssignment);
        return fullAssignment;
      }
    }

    try {
      const created = await (this.prisma as any).assignment.create({
        data: {
          title: data.title,
          description: data.description || null,
          instructions: data.instructions || null,
          courseId,
          courseName: data.course || null,
          module: data.module || null,
          topic: data.topic || null,
          difficulty: data.difficulty || 'Medium',
          problemsCount: data.problemsCount || (Array.isArray(data.problemsList) ? data.problemsList.length : 0),
          problemsList: data.problemsList || [],
          releaseDate: data.releaseDate || null,
          startTime: data.startTime || null,
          deadline: data.deadline || null,
          deadlineTime: data.deadlineTime || null,
          dueDateString: data.deadline || data.dueDate || null,
          allowLate: data.allowLate ?? false,
          latePenalty: data.latePenalty || null,
          resources: data.resources || [],
          submissionTypes: data.submissionTypes || [],
          maxFileSize: data.maxFileSize || null,
          maxAttempts: data.maxAttempts || null,
          totalMarks: Number(data.totalMarks) || 100,
          passingMarks: Number(data.passingMarks) || 40,
          gradingMode: data.gradingMode || null,
          targetCohort: data.targetCohort || null,
          status: mappedStatus,
          notifyStudents: data.notifyStudents ?? true,
        },
      });
      AdminService.fallbackAssignments.set(created.id, { ...data, ...created });
      return created;
    } catch (dbErr) {
      const newId = `asgn_${Date.now()}`;
      const fullAssignment = {
        id: newId,
        ...data,
        status: mappedStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      AdminService.fallbackAssignments.set(newId, fullAssignment);
      return fullAssignment;
    }
  }

  async updateAssignment(id: string, data: any) {
    let mappedStatus: string | undefined = undefined;
    if (data.status) {
      const s = data.status.toUpperCase();
      mappedStatus = s === 'PUBLISHED' ? 'PUBLISHED' : s === 'SCHEDULED' ? 'SCHEDULED' : 'DRAFT';
    }

    try {
      const updated = await (this.prisma as any).assignment.update({
        where: { id },
        data: {
          ...(data.title ? { title: data.title } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(mappedStatus ? { status: mappedStatus } : {}),
          ...(data.deadline ? { deadline: data.deadline, dueDateString: data.deadline } : {}),
          ...(data.totalMarks !== undefined ? { totalMarks: Number(data.totalMarks) } : {}),
        },
      });
      if (AdminService.fallbackAssignments.has(id)) {
        AdminService.fallbackAssignments.set(id, {
          ...AdminService.fallbackAssignments.get(id),
          ...data,
          ...updated,
        });
      }
      return updated;
    } catch {
      if (AdminService.fallbackAssignments.has(id)) {
        const existing = AdminService.fallbackAssignments.get(id);
        const updated = {
          ...existing,
          ...data,
          status: mappedStatus || existing.status,
          updatedAt: new Date(),
        };
        AdminService.fallbackAssignments.set(id, updated);
        return updated;
      }
      return { id, ...data };
    }
  }

  async deleteAssignment(id: string) {
    try {
      await (this.prisma as any).assignment.delete({
        where: { id },
      });
    } catch {}
    AdminService.fallbackAssignments.delete(id);
    return { success: true, id };
  }

  async getAllSubmissions() {
    let dbSubmissions: any[] = [];
    try {
      dbSubmissions = await (this.prisma as any).assignmentSubmission.findMany({
        include: {
          assignment: true,
          user: true,
        },
        orderBy: { submittedAt: 'desc' },
      });
    } catch {
      dbSubmissions = [];
    }

    const subMap = new Map<string, any>();
    for (const s of dbSubmissions) {
      subMap.set(s.id, s);
    }
    for (const fallback of AdminService.fallbackSubmissions.values()) {
      if (!subMap.has(fallback.id)) {
        subMap.set(fallback.id, fallback);
      }
    }

    const allList = Array.from(subMap.values());

    return allList.map((sub) => {
      const studentName = sub.user?.fullName || sub.student || 'Learner';
      const assignmentTitle = sub.assignment?.title || sub.item || 'Assignment';
      const courseName = sub.assignment?.courseName || sub.course || 'DSA Placement Program';
      const maxScore = sub.maxScore || sub.assignment?.totalMarks || 100;
      const scoreStr = sub.score !== null && sub.score !== undefined ? `${sub.score}/${maxScore}` : 'Pending';

      const statusMap: Record<string, string> = {
        GRADED: 'Graded',
        PENDING: 'Needs review',
        NEEDS_REVIEW: 'Needs review',
        ACTION_REQUIRED: 'Action required',
      };
      const displayStatus = statusMap[(sub.status || '').toUpperCase()] || sub.status || 'Needs review';

      const { label: timeAgo } = this.formatLastActive(sub.submittedAt);

      return {
        id: sub.id.startsWith('SUB-') ? sub.id : `SUB-${sub.id.slice(0, 6)}`,
        rawId: sub.id,
        student: studentName,
        studentEmail: sub.user?.email || '',
        item: assignmentTitle,
        course: courseName,
        submitted: timeAgo,
        submittedAt: sub.submittedAt || new Date().toISOString(),
        score: scoreStr,
        status: displayStatus,
        content: sub.content || '',
        fileUrl: sub.fileUrl || '',
        githubUrl: sub.githubUrl || '',
        feedback: sub.feedback || '',
      };
    });
  }

  async getAllContent() {
    const items: Array<{
      id: string | number;
      title: string;
      type: string;
      parent: string;
      owner: string;
      status: string;
      updated: string;
    }> = [];

    // 1. Extract lessons/topics from all courses
    const courses = await this.getAllCourses();
    for (const course of courses) {
      const owner = course.instructorName || course.instructor || 'Platform Admin';
      const status = course.status || 'Published';
      const updated = course.updatedAt ? this.formatLastActive(course.updatedAt).label : 'Recently';

      if (Array.isArray(course.modules)) {
        for (const mod of course.modules) {
          if (Array.isArray(mod.topics)) {
            for (const top of mod.topics) {
              if (Array.isArray(top.subtopics) && top.subtopics.length > 0) {
                for (const sub of top.subtopics) {
                  items.push({
                    id: sub.id || `sub_${mod.id}_${top.id}_${sub.title}`,
                    title: sub.title || top.title,
                    type: sub.type || 'Video',
                    parent: `${course.title} · ${mod.title || 'Curriculum'}`,
                    owner,
                    status,
                    updated,
                  });
                }
              } else {
                items.push({
                  id: top.id || `top_${mod.id}_${top.title}`,
                  title: top.title,
                  type: 'Video',
                  parent: `${course.title} · ${mod.title || 'Curriculum'}`,
                  owner,
                  status,
                  updated,
                });
              }
            }
          }
        }
      }
    }



    // 3. Extract database resources
    try {
      const dbResources = await this.prisma.resource.findMany({
        include: { course: true, lesson: true },
        orderBy: { createdAt: 'desc' },
      });
      for (const res of dbResources) {
        let typeName = 'Resource';
        if (res.type === 'PDF') typeName = 'PDF';
        else if (res.type === 'VIDEO_RECORDING') typeName = 'Video';

        items.push({
          id: res.id,
          title: res.title,
          type: typeName,
          parent: res.course?.title || (res.lesson ? res.lesson.title : 'General Resources'),
          owner: 'Admin',
          status: 'Published',
          updated: this.formatLastActive(res.createdAt).label,
        });
      }
    } catch {}

    return items;
  }
}

