import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { AuthService } from '../auth/auth.service';
import { OnboardingService } from '../onboarding/onboarding.service';

export class AdminService {
  private static metaFilePath = path.resolve(process.cwd(), 'data', 'courses_meta.json');
  private static problemsFilePath = path.resolve(process.cwd(), 'data', 'practice_problems.json');
  private static assignmentsFilePath = path.resolve(process.cwd(), 'data', 'assignments.json');
  private static liveSessionsFilePath = path.resolve(process.cwd(), 'data', 'live_sessions.json');
  private static announcementsFilePath = path.resolve(process.cwd(), 'data', 'announcements.json');
  private static contentOverridesFilePath = path.resolve(process.cwd(), 'data', 'content_overrides.json');
  private static deletedContentFilePath = path.resolve(process.cwd(), 'data', 'deleted_content.json');

  private static loadDeletedContentFromFile(): Set<string> {
    try {
      if (fs.existsSync(AdminService.deletedContentFilePath)) {
        const raw = fs.readFileSync(AdminService.deletedContentFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return new Set<string>(parsed.map((id) => String(id)));
        }
      }
    } catch (err) {
      console.warn('Failed to load deleted content IDs from file:', err);
    }
    return new Set<string>();
  }

  private static loadContentOverridesFromFile(): Map<string, any> {
    try {
      if (fs.existsSync(AdminService.contentOverridesFilePath)) {
        const raw = fs.readFileSync(AdminService.contentOverridesFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const map = new Map<string, any>();
          for (const item of parsed) {
            if (item && item.id) {
              map.set(String(item.id), item);
            }
          }
          return map;
        } else if (parsed && typeof parsed === 'object') {
          const map = new Map<string, any>();
          for (const [k, v] of Object.entries(parsed)) {
            map.set(String(k), v);
          }
          return map;
        }
      }
    } catch (err) {
      console.warn('Failed to load content overrides from file:', err);
    }
    return new Map<string, any>();
  }

  private static loadCoursesMetaFromFile(): Map<string, any> {
    try {
      if (fs.existsSync(AdminService.metaFilePath)) {
        const raw = fs.readFileSync(AdminService.metaFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const map = new Map<string, any>();
          for (const item of parsed) {
            if (item && item.id) {
              map.set(String(item.id), item);
            }
          }
          return map;
        } else if (parsed && typeof parsed === 'object') {
          const map = new Map<string, any>();
          for (const [k, v] of Object.entries(parsed)) {
            map.set(String(k), v);
          }
          return map;
        }
      }
    } catch (err) {
      console.warn('Failed to load courses metadata from file:', err);
    }
    return new Map<string, any>();
  }

  private static loadProblemsFromFile(): Map<string, any> {
    try {
      if (fs.existsSync(AdminService.problemsFilePath)) {
        const raw = fs.readFileSync(AdminService.problemsFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const map = new Map<string, any>();
          for (const item of parsed) {
            if (item && item.id) {
              map.set(String(item.id), item);
            }
          }
          return map;
        } else if (parsed && typeof parsed === 'object') {
          const map = new Map<string, any>();
          for (const [k, v] of Object.entries(parsed)) {
            map.set(String(k), v);
          }
          return map;
        }
      }
    } catch (err) {
      console.warn('Failed to load practice problems from file:', err);
    }
    return new Map<string, any>();
  }

  public static loadAssignmentsFromFile(): Map<string, any> {
    try {
      if (fs.existsSync(AdminService.assignmentsFilePath)) {
        const raw = fs.readFileSync(AdminService.assignmentsFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const map = new Map<string, any>();
          for (const item of parsed) {
            if (item && item.id) {
              map.set(String(item.id), item);
            }
          }
          return map;
        } else if (parsed && typeof parsed === 'object') {
          const map = new Map<string, any>();
          for (const [k, v] of Object.entries(parsed)) {
            map.set(String(k), v);
          }
          return map;
        }
      }
    } catch (err) {
      console.warn('Failed to load assignments from file:', err);
    }
    return new Map<string, any>();
  }

  public static loadLiveSessionsFromFile(): Map<string, any> {
    try {
      if (fs.existsSync(AdminService.liveSessionsFilePath)) {
        const raw = fs.readFileSync(AdminService.liveSessionsFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const map = new Map<string, any>();
          for (const item of parsed) {
            if (item && item.id) {
              map.set(String(item.id), item);
            }
          }
          return map;
        } else if (parsed && typeof parsed === 'object') {
          const map = new Map<string, any>();
          for (const [k, v] of Object.entries(parsed)) {
            map.set(String(k), v);
          }
          return map;
        }
      }
    } catch (err) {
      console.warn('Failed to load live sessions from file:', err);
    }
    return new Map<string, any>();
  }

  public static saveMetaToFile() {
    try {
      const dir = path.dirname(AdminService.metaFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = Object.fromEntries(AdminService.fallbackCourses.entries());
      fs.writeFileSync(AdminService.metaFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to save courses metadata to file:', err);
    }
  }

  public static saveProblemsToFile() {
    try {
      const dir = path.dirname(AdminService.problemsFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = Array.from(AdminService.fallbackProblems.values());
      fs.writeFileSync(AdminService.problemsFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to save practice problems to file:', err);
    }
  }

  public static saveAssignmentsToFile() {
    try {
      const dir = path.dirname(AdminService.assignmentsFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = Array.from(AdminService.fallbackAssignments.values());
      fs.writeFileSync(AdminService.assignmentsFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to save assignments to file:', err);
    }
  }

  public static saveLiveSessionsToFile() {
    try {
      const dir = path.dirname(AdminService.liveSessionsFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = Array.from(AdminService.fallbackLiveSessions.values());
      fs.writeFileSync(AdminService.liveSessionsFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to save live sessions to file:', err);
    }
  }

  private static loadAnnouncementsFromFile(): Map<string, any> {
    try {
      if (fs.existsSync(AdminService.announcementsFilePath)) {
        const raw = fs.readFileSync(AdminService.announcementsFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const map = new Map<string, any>();
          for (const item of parsed) {
            if (item && item.id) {
              map.set(String(item.id), item);
            }
          }
          return map;
        } else if (parsed && typeof parsed === 'object') {
          const map = new Map<string, any>();
          for (const [k, v] of Object.entries(parsed)) {
            map.set(String(k), v);
          }
          return map;
        }
      }
    } catch (err) {
      console.warn('Failed to load announcements from file:', err);
    }
    return new Map<string, any>();
  }

  public static saveAnnouncementsToFile() {
    try {
      const dir = path.dirname(AdminService.announcementsFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = Array.from(AdminService.fallbackAnnouncements.values());
      fs.writeFileSync(AdminService.announcementsFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to save announcements to file:', err);
    }
  }

  public static saveContentOverridesToFile() {
    try {
      const dir = path.dirname(AdminService.contentOverridesFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = Array.from(AdminService.fallbackContentOverrides.values());
      fs.writeFileSync(AdminService.contentOverridesFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to save content overrides to file:', err);
    }
  }

  public static saveDeletedContentToFile() {
    try {
      const dir = path.dirname(AdminService.deletedContentFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = Array.from(AdminService.deletedContentIds);
      fs.writeFileSync(AdminService.deletedContentFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to save deleted content IDs to file:', err);
    }
  }

  public static fallbackCourses = AdminService.loadCoursesMetaFromFile();
  public static fallbackProblems = AdminService.loadProblemsFromFile();
  public static fallbackAssignments = AdminService.loadAssignmentsFromFile();
  public static fallbackLiveSessions = AdminService.loadLiveSessionsFromFile();
  public static fallbackAnnouncements = AdminService.loadAnnouncementsFromFile();
  public static fallbackContentOverrides = AdminService.loadContentOverridesFromFile();
  public static deletedContentIds = AdminService.loadDeletedContentFromFile();
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
      const dbCourseIds = (await this.prisma.course.findMany({ select: { id: true } })).map((c) => String(c.id));
      const allCourseIds = new Set(dbCourseIds);
      for (const id of AdminService.fallbackCourses.keys()) {
        allCourseIds.add(String(id));
      }
      totalCourses = allCourseIds.size;
    } catch {
      totalCourses = AdminService.fallbackCourses.size;
    }

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
    AdminService.fallbackCourses = AdminService.loadCoursesMetaFromFile();
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
      const fallback = AdminService.fallbackCourses.get(String(course.id)) || {};
      courseMap.set(String(course.id), {
        ...fallback,
        ...course,
        modules: (fallback.modules && fallback.modules.length > 0) ? fallback.modules : course.modules,
      });
    }
    for (const fallback of AdminService.fallbackCourses.values()) {
      if (!courseMap.has(String(fallback.id))) {
        courseMap.set(String(fallback.id), fallback);
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

      const priceStr = course.price !== undefined && course.price !== null ? String(course.price) : '0';

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
        discountPrice: course.discountPrice !== undefined && course.discountPrice !== null ? String(course.discountPrice) : '',
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
        skillsCovered: Array.isArray(course.skillsCovered) ? course.skillsCovered : (Array.isArray(course.tags) ? course.tags : []),
        prerequisites: course.prerequisites || '',
        estimatedDuration: course.estimatedDuration || '12 Weeks',
        certificateAvailable: course.certificateAvailable !== undefined ? course.certificateAvailable : true,
        seoTitle: course.seoTitle || '',
        seoDescription: course.seoDescription || '',
        targetAudience: course.targetAudience || '',
        learningOutcomes: Array.isArray(course.learningOutcomes) ? course.learningOutcomes : [],
        requirements: Array.isArray(course.requirements) ? course.requirements : [],
        targetLearners: Array.isArray(course.targetLearners) ? course.targetLearners : [],
        tags: Array.isArray(course.tags) ? course.tags : (Array.isArray(course.skillsCovered) ? course.skillsCovered : []),
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
    const baseSlug = (data.title || 'course')
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

    let statusVal: any = 'PUBLISHED';
    if (data.status) {
      const s = String(data.status).toUpperCase();
      if (s === 'DRAFT') statusVal = 'DRAFT';
      else if (s === 'ARCHIVED') statusVal = 'ARCHIVED';
      else statusVal = 'PUBLISHED';
    }

    const instructorDisplayName = data.instructorName?.trim() || 'Admin User';
    const coverImage = data.coverImageUrl || data.thumbnailPreview || null;
    const priceNumber = typeof data.price === 'number' && !isNaN(data.price) ? data.price : 0;

    // Check if updating an existing course
    if (data.id) {
      let existingDbCourse: any = null;
      try {
        existingDbCourse = await this.prisma.course.findUnique({
          where: { id: data.id },
          include: { modules: true },
        });
      } catch {
        existingDbCourse = null;
      }

      if (existingDbCourse) {
        try {
          const updated = await this.prisma.course.update({
            where: { id: data.id },
            data: {
              title: data.title || existingDbCourse.title,
              subtitle: data.subtitle !== undefined ? data.subtitle : existingDbCourse.subtitle,
              description: data.description || existingDbCourse.description,
              coverImageUrl: coverImage !== null ? coverImage : existingDbCourse.coverImageUrl,
              price: priceNumber,
              level: levelEnum,
              status: statusVal,
            },
            include: {
              instructor: true,
              modules: {
                include: { lessons: true },
              },
            },
          });

          // If modules provided on update, re-sync them
          if (data.modules && data.modules.length > 0) {
            try {
              await this.prisma.module.deleteMany({ where: { courseId: data.id } });
              for (let mIdx = 0; mIdx < data.modules.length; mIdx++) {
                const mod = data.modules[mIdx];
                const modLessons = mod.topics && mod.topics.length > 0
                  ? mod.topics.flatMap((top, tIdx) => {
                      if (top.subtopics && top.subtopics.length > 0) {
                        return top.subtopics.map((sub, sIdx) => {
                          const subType = (sub.type || 'Video').toUpperCase();
                          let lessonType: any = 'VIDEO';
                          if (subType === 'QUIZ') lessonType = 'QUIZ';
                          else if (subType === 'ASSIGNMENT') lessonType = 'ASSIGNMENT';
                          else if (subType === 'ARTICLE') lessonType = 'ARTICLE';

                          return {
                            title: top.title ? `${top.title} · ${sub.title || 'Lesson'}` : (sub.title || 'Lesson'),
                            slug: `lesson-${Date.now()}-${mIdx}-${tIdx}-${sIdx}`,
                            type: lessonType,
                            position: (tIdx * 10) + sIdx + 1,
                          };
                        });
                      }
                      return [{
                        title: top.title || `Lesson ${tIdx + 1}`,
                        slug: `lesson-${Date.now()}-${mIdx}-${tIdx}`,
                        type: 'VIDEO' as const,
                        position: tIdx + 1,
                      }];
                    })
                  : [];

                await this.prisma.module.create({
                  data: {
                    courseId: data.id,
                    title: mod.title || `Module ${mIdx + 1}`,
                    description: mod.description || null,
                    position: mIdx + 1,
                    lessons: modLessons.length > 0 ? { create: modLessons } : undefined,
                  },
                });
              }
            } catch (syncErr) {
              console.error('Module sync warning:', syncErr);
            }
          }

          const existingFallback = AdminService.fallbackCourses.get(String(updated.id)) || {};
          const fullUpdated = {
            ...existingFallback,
            ...updated,
            ...data,
            id: updated.id,
            title: data.title || updated.title,
            subtitle: data.subtitle !== undefined ? data.subtitle : updated.subtitle,
            description: data.description || updated.description,
            price: priceNumber,
            discountPrice: data.discountPrice !== undefined ? data.discountPrice : (existingFallback.discountPrice !== undefined ? existingFallback.discountPrice : 0),
            currency: data.currency || existingFallback.currency || 'INR ₹',
            courseType: data.courseType || (priceNumber > 0 ? 'Paid' : 'Free'),
            accessType: data.accessType || existingFallback.accessType || 'Lifetime Access',
            durationCycleMode: data.durationCycleMode || existingFallback.durationCycleMode || 'Date Range',
            startDate: data.startDate || existingFallback.startDate,
            endDate: data.endDate || existingFallback.endDate,
            durationValue: data.durationValue || existingFallback.durationValue || '90',
            durationUnit: data.durationUnit || existingFallback.durationUnit || 'Days',
            subscriptionCycle: data.subscriptionCycle || existingFallback.subscriptionCycle || 'Monthly',
            enrollmentLimit: data.enrollmentLimit || existingFallback.enrollmentLimit || 'Unlimited',
            courseVisibility: data.courseVisibility || existingFallback.courseVisibility || 'Public',
            learningOutcomes: data.learningOutcomes || existingFallback.learningOutcomes || [],
            prerequisites: data.prerequisites !== undefined ? data.prerequisites : (existingFallback.prerequisites || ''),
            requirements: data.requirements || existingFallback.requirements || [],
            targetAudience: data.targetAudience !== undefined ? data.targetAudience : (existingFallback.targetAudience || ''),
            targetLearners: data.targetLearners || existingFallback.targetLearners || [],
            skillsCovered: data.skillsCovered || data.tags || existingFallback.skillsCovered || [],
            tags: data.tags || data.skillsCovered || existingFallback.tags || [],
            modules: (data.modules && data.modules.length > 0) ? data.modules : (existingFallback.modules || []),
            instructor: { fullName: instructorDisplayName, email: 'admin@learnhub.com' },
            instructorName: instructorDisplayName,
            estimatedDuration: data.estimatedDuration || existingFallback.estimatedDuration || '12 Weeks',
            certificateAvailable: data.certificateAvailable !== undefined ? data.certificateAvailable : (existingFallback.certificateAvailable !== undefined ? existingFallback.certificateAvailable : true),
            seoTitle: data.seoTitle !== undefined ? data.seoTitle : (existingFallback.seoTitle || ''),
            seoDescription: data.seoDescription !== undefined ? data.seoDescription : (existingFallback.seoDescription || ''),
            status:
              statusVal === 'PUBLISHED' || statusVal === 'Published'
                ? 'Published'
                : statusVal === 'DRAFT' || statusVal === 'Draft'
                ? 'Draft'
                : 'Review',
            updatedAt: new Date(),
          };
          AdminService.fallbackCourses.set(String(updated.id), fullUpdated);
          AdminService.saveMetaToFile();
          return fullUpdated;
        } catch (updateErr) {
          console.error('Course update DB error:', updateErr);
        }
      }

      // If not in DB or DB update had issue, update fallback metadata directly
      if (AdminService.fallbackCourses.has(String(data.id)) || data.id) {
        const existingFallback = AdminService.fallbackCourses.get(String(data.id)) || {};
        const fullUpdated = {
          ...existingFallback,
          ...data,
          id: data.id,
          title: data.title || existingFallback.title || 'Untitled Course',
          subtitle: data.subtitle !== undefined ? data.subtitle : existingFallback.subtitle,
          description: data.description || existingFallback.description || '',
          language: data.language || existingFallback.language || 'English',
          category: data.category || existingFallback.category || 'Development',
          level: data.level || existingFallback.level || 'Beginner',
          coverImageUrl: coverImage !== null ? coverImage : existingFallback.coverImageUrl,
          thumbnailPreview: coverImage !== null ? coverImage : existingFallback.thumbnailPreview,
          price: priceNumber,
          discountPrice: data.discountPrice !== undefined ? data.discountPrice : (existingFallback.discountPrice !== undefined ? existingFallback.discountPrice : 0),
          currency: data.currency || existingFallback.currency || 'INR ₹',
          courseType: data.courseType || (priceNumber > 0 ? 'Paid' : 'Free'),
          accessType: data.accessType || existingFallback.accessType || 'Lifetime Access',
          durationCycleMode: data.durationCycleMode || existingFallback.durationCycleMode || 'Date Range',
          startDate: data.startDate || existingFallback.startDate,
          endDate: data.endDate || existingFallback.endDate,
          durationValue: data.durationValue || existingFallback.durationValue || '90',
          durationUnit: data.durationUnit || existingFallback.durationUnit || 'Days',
          subscriptionCycle: data.subscriptionCycle || existingFallback.subscriptionCycle || 'Monthly',
          enrollmentLimit: data.enrollmentLimit || existingFallback.enrollmentLimit || 'Unlimited',
          courseVisibility: data.courseVisibility || existingFallback.courseVisibility || 'Public',
          learningOutcomes: data.learningOutcomes || existingFallback.learningOutcomes || [],
          prerequisites: data.prerequisites !== undefined ? data.prerequisites : (existingFallback.prerequisites || ''),
          requirements: data.requirements || existingFallback.requirements || [],
          targetAudience: data.targetAudience !== undefined ? data.targetAudience : (existingFallback.targetAudience || ''),
          targetLearners: data.targetLearners || existingFallback.targetLearners || [],
          skillsCovered: data.skillsCovered || data.tags || existingFallback.skillsCovered || [],
          tags: data.tags || data.skillsCovered || existingFallback.tags || [],
          modules: (data.modules && data.modules.length > 0) ? data.modules : (existingFallback.modules || []),
          instructor: { fullName: instructorDisplayName, email: 'admin@learnhub.com' },
          instructorName: instructorDisplayName,
          estimatedDuration: data.estimatedDuration || existingFallback.estimatedDuration || '12 Weeks',
          certificateAvailable: data.certificateAvailable !== undefined ? data.certificateAvailable : (existingFallback.certificateAvailable !== undefined ? existingFallback.certificateAvailable : true),
          seoTitle: data.seoTitle !== undefined ? data.seoTitle : (existingFallback.seoTitle || ''),
          seoDescription: data.seoDescription !== undefined ? data.seoDescription : (existingFallback.seoDescription || ''),
          status:
            statusVal === 'PUBLISHED' || statusVal === 'Published'
              ? 'Published'
              : statusVal === 'DRAFT' || statusVal === 'Draft'
              ? 'Draft'
              : 'Review',
          updatedAt: new Date(),
        };
        AdminService.fallbackCourses.set(String(data.id), fullUpdated);
        AdminService.saveMetaToFile();
        return fullUpdated;
      }
    }

    // Creating a brand new course
    let instructor: any = null;
    try {
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
            email: 'admin@lms.com',
            fullName: instructorDisplayName,
            role: 'ADMIN',
            isEmailVerified: true,
          },
        });
      }
    } catch (instErr) {
      console.error('Instructor lookup error:', instErr);
    }

    const modulesCreate = data.modules && data.modules.length > 0 ? {
      create: data.modules.map((mod, mIdx) => ({
        title: mod.title || `Module ${mIdx + 1}`,
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
                  title: top.title ? `${top.title} · ${sub.title || 'Lesson'}` : (sub.title || 'Lesson'),
                  slug: `lesson-${Date.now()}-${mIdx}-${tIdx}-${sIdx}`,
                  type: lessonType,
                  position: (tIdx * 10) + sIdx + 1,
                };
              });
            }
            return [{
              title: top.title || `Lesson ${tIdx + 1}`,
              slug: `lesson-${Date.now()}-${mIdx}-${tIdx}`,
              type: 'VIDEO' as const,
              position: tIdx + 1,
            }];
          }),
        } : undefined,
      })),
    } : undefined;

    try {
      const course = await this.prisma.course.create({
        data: {
          slug,
          title: data.title || 'Untitled Course',
          subtitle: data.subtitle || null,
          description: data.description || '',
          coverImageUrl: coverImage,
          price: priceNumber,
          level: levelEnum,
          status: statusVal,
          instructorId: instructor?.id || '80bb4d0d-098b-4826-a0ed-9b8488123e1c',
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
      AdminService.fallbackCourses.set(String(course.id), fullCourse);
      AdminService.saveMetaToFile();
      return fullCourse;
    } catch (dbErr) {
      console.error('Failed to create course in Prisma:', dbErr);
      const fallbackId = data.id || `course_${Date.now()}`;
      const fallbackCourse = {
        id: fallbackId,
        slug,
        title: data.title || 'Untitled Course',
        subtitle: data.subtitle || null,
        description: data.description || '',
        language: data.language || 'English',
        category: data.category || 'Development',
        level: data.level || 'Beginner',
        coverImageUrl: coverImage,
        thumbnailPreview: coverImage,
        price: priceNumber,
        discountPrice: data.discountPrice || 0,
        currency: data.currency || 'INR ₹',
        courseType: data.courseType || (priceNumber > 0 ? 'Paid' : 'Free'),
        accessType: data.accessType || 'Lifetime Access',
        durationCycleMode: data.durationCycleMode || 'Date Range',
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        endDate: data.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        durationValue: data.durationValue || '90',
        durationUnit: data.durationUnit || 'Days',
        subscriptionCycle: data.subscriptionCycle || 'Monthly',
        enrollmentLimit: data.enrollmentLimit || 'Unlimited',
        courseVisibility: data.courseVisibility || 'Public',
        status: statusVal,
        instructorId: instructor?.id || 'admin_user',
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
      AdminService.fallbackCourses.set(String(fallbackId), fallbackCourse);
      AdminService.saveMetaToFile();
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
      const existing = AdminService.fallbackCourses.get(String(id)) || {};
      const full = {
        ...existing,
        ...data,
        ...updated,
        id: updated.id,
        price: data.price !== undefined ? data.price : (updated.price !== undefined ? updated.price : existing.price),
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
      return full;
    } catch {
      const existing = AdminService.fallbackCourses.get(String(id)) || {};
      const updated = {
        ...existing,
        ...data,
        id,
        price: data.price !== undefined ? data.price : existing.price,
        discountPrice: data.discountPrice !== undefined ? data.discountPrice : existing.discountPrice,
        learningOutcomes: data.learningOutcomes || existing.learningOutcomes || [],
        prerequisites: data.prerequisites !== undefined ? data.prerequisites : (existing.prerequisites || ''),
        requirements: data.requirements || existing.requirements || [],
        targetAudience: data.targetAudience !== undefined ? data.targetAudience : (existing.targetAudience || ''),
        targetLearners: data.targetLearners || existing.targetLearners || [],
        skillsCovered: data.skillsCovered || data.tags || existing.skillsCovered || [],
        tags: data.tags || data.skillsCovered || existing.tags || [],
        modules: (data.modules && data.modules.length > 0) ? data.modules : (existing.modules || []),
        status: data.status ? data.status : existing.status,
        updatedAt: new Date(),
      };
      AdminService.fallbackCourses.set(String(id), updated);
      AdminService.saveMetaToFile();
      return updated;
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
    AdminService.fallbackCourses.delete(String(id));
    AdminService.saveMetaToFile();
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

    AdminService.fallbackAssignments = AdminService.loadAssignmentsFromFile();
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
        AdminService.saveAssignmentsToFile();
        return updated;
      } catch (dbErr) {
        const fullAssignment = {
          id: String(data.id),
          ...data,
          status: mappedStatus,
          updatedAt: new Date(),
        };
        AdminService.fallbackAssignments.set(String(data.id), fullAssignment);
        AdminService.saveAssignmentsToFile();
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
      AdminService.saveAssignmentsToFile();
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
      AdminService.saveAssignmentsToFile();
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
      AdminService.saveAssignmentsToFile();
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
        AdminService.saveAssignmentsToFile();
        return updated;
      }
      AdminService.saveAssignmentsToFile();
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
    AdminService.saveAssignmentsToFile();
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
    AdminService.fallbackCourses = AdminService.loadCoursesMetaFromFile();
    AdminService.fallbackProblems = AdminService.loadProblemsFromFile();
    AdminService.fallbackAssignments = AdminService.loadAssignmentsFromFile();
    AdminService.fallbackContentOverrides = AdminService.loadContentOverridesFromFile();
    AdminService.deletedContentIds = AdminService.loadDeletedContentFromFile();

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
    for (let cIdx = 0; cIdx < courses.length; cIdx++) {
      const course = courses[cIdx];
      const owner = course.instructorName || course.instructor || 'Platform Admin';
      const status = course.status || 'Published';
      const updated = course.updatedAt ? this.formatLastActive(course.updatedAt).label : 'Recently';

      if (Array.isArray(course.modules)) {
        for (let mIdx = 0; mIdx < course.modules.length; mIdx++) {
          const mod = course.modules[mIdx];
          if (Array.isArray(mod.topics)) {
            for (let tIdx = 0; tIdx < mod.topics.length; tIdx++) {
              const top = mod.topics[tIdx];
              if (Array.isArray(top.subtopics) && top.subtopics.length > 0) {
                for (let sIdx = 0; sIdx < top.subtopics.length; sIdx++) {
                  const sub = top.subtopics[sIdx];
                  const uniqueId = String(sub.id || `sub_${course.id || cIdx}_${mod.id || mIdx}_${top.id || tIdx}_${sIdx}`);
                  if (AdminService.deletedContentIds.has(uniqueId)) continue;
                  items.push({
                    id: uniqueId,
                    title: sub.title || top.title || `Lesson ${sIdx + 1}`,
                    type: sub.type || 'Video',
                    parent: `${course.title} · ${mod.title || 'Curriculum'}`,
                    owner,
                    status,
                    updated,
                  });
                }
              } else {
                const uniqueId = String(top.id || `top_${course.id || cIdx}_${mod.id || mIdx}_${tIdx}`);
                if (AdminService.deletedContentIds.has(uniqueId)) continue;
                items.push({
                  id: uniqueId,
                  title: top.title || `Topic ${tIdx + 1}`,
                  type: top.type || 'Video',
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

    // 2. Extract database resources
    try {
      const dbResources = await this.prisma.resource.findMany({
        include: { course: true, lesson: true },
        orderBy: { createdAt: 'desc' },
      });
      for (const res of dbResources) {
        const uniqueId = String(res.id);
        if (AdminService.deletedContentIds.has(uniqueId)) continue;
        let typeName = 'Resource';
        if (res.type === 'PDF') typeName = 'PDF';
        else if (res.type === 'VIDEO_RECORDING') typeName = 'Video';

        items.push({
          id: uniqueId,
          title: res.title,
          type: typeName,
          parent: res.course?.title || (res.lesson ? res.lesson.title : 'General Resources'),
          owner: 'Admin',
          status: 'Published',
          updated: this.formatLastActive(res.createdAt).label,
        });
      }
    } catch {}

    // 3. Extract real practice problems
    try {
      const problems = await this.getAllPracticeProblems();
      for (const prob of problems) {
        const uniqueId = String(prob.id);
        if (AdminService.deletedContentIds.has(uniqueId)) continue;
        items.push({
          id: uniqueId,
          title: prob.title,
          type: 'Practice problem',
          parent: `DSA & Practice · ${prob.category || 'Problem Solving'}`,
          owner: 'Admin',
          status: prob.status === 'Live' ? 'Published' : 'Draft',
          updated: prob.updatedAt ? this.formatLastActive(prob.updatedAt).label : 'Recently',
        });
      }
    } catch {}

    // 4. Extract real assignments
    try {
      const assignments = await this.getAllAssignments();
      for (const a of assignments) {
        const uniqueId = String(a.id);
        if (AdminService.deletedContentIds.has(uniqueId)) continue;
        items.push({
          id: uniqueId,
          title: a.title,
          type: 'Assignment',
          parent: (a as any).courseName || (a as any).course?.title || (a as any).course || 'Assignments & Challenges',
          owner: 'Admin',
          status: a.status === 'Published' || a.status === 'PUBLISHED' ? 'Published' : 'Draft',
          updated: a.dueDate || 'Recently',
        });
      }
    } catch {}

    // 5. Merge persistent overrides and updates
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const idStr = String(item.id);
      const override = AdminService.fallbackContentOverrides.get(idStr);
      if (override) {
        items[i] = {
          ...item,
          ...override,
          id: item.id,
          updated: override.updated || this.formatLastActive(override.updatedAt || new Date()).label,
        };
      }
    }

    return items.filter((item) => !AdminService.deletedContentIds.has(String(item.id)));
  }

  async updateContentItem(id: string | number, updates: any) {
    const idStr = String(id);
    const existing = AdminService.fallbackContentOverrides.get(idStr) || {};
    const updated = {
      ...existing,
      ...updates,
      id,
      updated: 'Just now',
      updatedAt: new Date().toISOString(),
    };
    AdminService.fallbackContentOverrides.set(idStr, updated);
    AdminService.saveContentOverridesToFile();

    // 1. Update in Prisma database if matching Resource ID
    try {
      await this.prisma.resource.update({
        where: { id: idStr },
        data: {
          title: updates.title,
          ...(updates.type ? { type: updates.type === 'PDF' ? 'PDF' : 'VIDEO_RECORDING' } : {}),
        },
      });
    } catch {}

    // 2. Update in fallbackCourses if matching topic/subtopic
    for (const [, course] of AdminService.fallbackCourses.entries()) {
      let changed = false;
      if (Array.isArray(course.modules)) {
        for (const mod of course.modules) {
          if (Array.isArray(mod.topics)) {
            for (const top of mod.topics) {
              if (top.id && String(top.id) === idStr) {
                if (updates.title) top.title = updates.title;
                if (updates.type) top.type = updates.type;
                changed = true;
              }
              if (Array.isArray(top.subtopics)) {
                for (const sub of top.subtopics) {
                  if ((sub.id && String(sub.id) === idStr) || `sub_${mod.id}_${top.id}_${sub.title}` === idStr) {
                    if (updates.title) sub.title = updates.title;
                    if (updates.type) sub.type = updates.type;
                    changed = true;
                  }
                }
              }
            }
          }
        }
      }
      if (changed) {
        AdminService.saveMetaToFile();
      }
    }

    return updated;
  }

  async deleteContentItem(id: string | number) {
    const idStr = String(id);
    AdminService.deletedContentIds.add(idStr);
    AdminService.saveDeletedContentToFile();

    AdminService.fallbackContentOverrides.delete(idStr);
    AdminService.saveContentOverridesToFile();

    // 1. Delete from Prisma Resource if exists
    try {
      await this.prisma.resource.delete({
        where: { id: idStr },
      });
    } catch {}

    // 2. Delete from Prisma Lesson if exists
    try {
      await this.prisma.lesson.delete({
        where: { id: idStr },
      });
    } catch {}

    // 3. Remove from fallbackCourses if matching topic/subtopic
    for (const [, course] of AdminService.fallbackCourses.entries()) {
      let changed = false;
      if (Array.isArray(course.modules)) {
        for (const mod of course.modules) {
          if (Array.isArray(mod.topics)) {
            mod.topics = mod.topics.filter((top: any) => {
              if (String(top.id) === idStr) {
                changed = true;
                return false;
              }
              if (Array.isArray(top.subtopics)) {
                const prevCount = top.subtopics.length;
                top.subtopics = top.subtopics.filter(
                  (sub: any) => String(sub.id) !== idStr && String(sub.title) !== idStr
                );
                if (top.subtopics.length !== prevCount) changed = true;
              }
              return true;
            });
          }
        }
      }
      if (changed) {
        AdminService.saveMetaToFile();
      }
    }

    return { success: true, id: idStr };
  }

  async getAllPracticeProblems() {
    let dbProblems: any[] = [];
    try {
      dbProblems = await (this.prisma as any).practiceProblem.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      dbProblems = [];
    }

    const parseArray = (val: any): any[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
        return val.split(',').map((s) => s.trim()).filter(Boolean);
      }
      return [];
    };

    const parseObject = (val: any): Record<string, string> => {
      if (!val) return {};
      if (typeof val === 'object' && !Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          if (typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
        } catch {}
      }
      return {};
    };

    const getDefaultTags = (category: string, title: string, difficulty: string): string[] => {
      const set = new Set<string>();
      if (category && category !== 'General') set.add(category);
      const tLower = (title || '').toLowerCase();
      const cLower = (category || '').toLowerCase();

      if (tLower.includes('sum') || cLower.includes('hash') || cLower.includes('array')) {
        set.add('Array');
        set.add('Hash Table');
        set.add('Two Pointers');
      } else if (tLower.includes('tree') || cLower.includes('tree')) {
        set.add('Tree');
        set.add('Binary Tree');
        set.add('DFS');
      } else if (tLower.includes('graph') || cLower.includes('graph')) {
        set.add('Graph');
        set.add('BFS');
        set.add('DFS');
      } else if (tLower.includes('string') || cLower.includes('string')) {
        set.add('String');
        set.add('Two Pointers');
        set.add('Sliding Window');
      } else if (tLower.includes('list') || cLower.includes('linked')) {
        set.add('Linked List');
        set.add('Two Pointers');
      } else if (tLower.includes('dp') || cLower.includes('dynamic')) {
        set.add('Dynamic Programming');
        set.add('Array');
      } else {
        set.add('Array');
        set.add('Algorithms');
        set.add('Data Structures');
      }
      if (difficulty) set.add(difficulty);
      return Array.from(set);
    };

    const getDefaultCompanies = (_category?: string, _title?: string): string => {
      const topCompanies = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Adobe'];
      return topCompanies.join(', ');
    };

    const getDefaultEditorial = (_category: string, title: string, _description: string) => {
      return {
        approach: `To solve "${title}", identify the key invariants and optimal subproblems. Utilizing specialized data structures (such as hash maps, two pointers, or memoized states) enables sequential processing in optimal time while keeping auxiliary memory minimal.`,
        algorithm: `1. Initialize auxiliary data structures to track visited elements or state.\n2. Iterate through the input dataset sequentially.\n3. Check invariant conditions and update the accumulated state.\n4. Return the computed result or optimal index configuration.`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      };
    };

    const isValidLanguageCode = (code: string | undefined, lang: string): boolean => {
      if (!code || typeof code !== 'string' || !code.trim()) return false;
      const t = code.trim();
      if (lang === 'javascript' || lang === 'typescript') {
        if (t.startsWith('def ') || t.startsWith('class Solution:\n    def ') || (t.includes('def ') && !t.includes('function') && !t.includes('class '))) {
          return false;
        }
      }
      if (lang === 'java') {
        if (t.startsWith('def ') || (t.includes('def ') && !t.includes('class Solution'))) {
          return false;
        }
      }
      if (lang === 'cpp') {
        if (t.startsWith('def ') || (t.includes('def ') && !t.includes('class Solution') && !t.includes('vector<'))) {
          return false;
        }
      }
      return true;
    };

    const getDefaultSolutions = (title: string, _category?: string) => {
      const fnName = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '') || 'solve' : 'solve';
      return {
        python: `class Solution:\n    def ${fnName}(self, *args, **kwargs):\n        # Optimal Python 3 solution for ${title}\n        # Time: O(N) | Space: O(N)\n        pass\n`,
        javascript: `/**\n * @return {any}\n */\nfunction ${fnName}(...args) {\n    // Optimal JavaScript solution for ${title}\n    return [];\n}\n`,
        typescript: `function ${fnName}(...args: any[]): any {\n    // Optimal TypeScript solution for ${title}\n    return [];\n}\n`,
        java: `class Solution {\n    public Object ${fnName}() {\n        // Optimal Java solution for ${title}\n        return null;\n    }\n}\n`,
        cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    void ${fnName}() {\n        // Optimal C++ solution for ${title}\n    }\n};\n`,
      };
    };

    const enrichProblem = (prob: any, index?: number) => {
      const id = String(prob.id || `prob-${(index || 0) + 1}`);
      const title = prob.title || 'Untitled Problem';
      const category = prob.category || prob.topic || 'General';
      const difficulty = prob.difficulty || 'Medium';

      const parsedTags = parseArray(prob.tags);
      const tags = parsedTags.length > 0 ? parsedTags : getDefaultTags(category, title, difficulty);

      const parsedCompanies = typeof prob.companies === 'string' && prob.companies.trim()
        ? prob.companies
        : Array.isArray(prob.companies) && prob.companies.length > 0
        ? prob.companies.join(', ')
        : getDefaultCompanies(category, title);

      const parsedExamples = parseArray(prob.examples);
      const examples = parsedExamples.length > 0
        ? parsedExamples
        : (prob.sampleInput || prob.sampleOutput)
        ? [{ id: 1, input: prob.sampleInput || 'N/A', output: prob.sampleOutput || 'N/A', explanation: `Sample test case for ${title}.` }]
        : [{ id: 1, input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: `Standard sample test case for ${title}.` }];

      const defaultEditorial = getDefaultEditorial(category, title, prob.description || '');
      const editorialApproach = prob.editorialApproach && prob.editorialApproach.trim() ? prob.editorialApproach : defaultEditorial.approach;
      const editorialAlgorithm = prob.editorialAlgorithm && prob.editorialAlgorithm.trim() ? prob.editorialAlgorithm : defaultEditorial.algorithm;
      const timeComplexity = prob.timeComplexity && prob.timeComplexity.trim() ? prob.timeComplexity : defaultEditorial.timeComplexity;
      const spaceComplexity = prob.spaceComplexity && prob.spaceComplexity.trim() ? prob.spaceComplexity : defaultEditorial.spaceComplexity;

      const starterCode = parseObject(prob.starterCode);
      const refSolution = parseObject(prob.referenceSolution);
      const defaultSolutions = getDefaultSolutions(title, category);

      const referenceSolution = {
        python: isValidLanguageCode(refSolution.python, 'python') ? refSolution.python : (isValidLanguageCode(starterCode.python, 'python') ? starterCode.python : defaultSolutions.python),
        javascript: isValidLanguageCode(refSolution.javascript, 'javascript') ? refSolution.javascript : (isValidLanguageCode(starterCode.javascript, 'javascript') ? starterCode.javascript : defaultSolutions.javascript),
        typescript: isValidLanguageCode(refSolution.typescript, 'typescript') ? refSolution.typescript : (isValidLanguageCode(starterCode.typescript, 'typescript') ? starterCode.typescript : defaultSolutions.typescript),
        java: isValidLanguageCode(refSolution.java, 'java') ? refSolution.java : (isValidLanguageCode(starterCode.java, 'java') ? starterCode.java : defaultSolutions.java),
        cpp: isValidLanguageCode(refSolution.cpp, 'cpp') ? refSolution.cpp : (isValidLanguageCode(starterCode.cpp, 'cpp') ? starterCode.cpp : defaultSolutions.cpp),
      };

      const parsedHints = parseArray(prob.hints);
      const hints = parsedHints.length > 0
        ? parsedHints
        : [
            `Think about the optimal data structure to represent ${category.toLowerCase()} operations.`,
            `Can you reduce the time complexity by trading auxiliary memory?`,
            `Look for repeated subproblems or invariant relationships.`
          ];

      return {
        id,
        slug: prob.slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `problem-${id}`),
        title,
        category,
        difficulty,
        acceptance: prob.acceptance || '78.5%',
        submissions: typeof prob.submissions === 'number' ? prob.submissions : 0,
        testCases: typeof prob.testCases === 'number' ? prob.testCases : examples.length,
        status: prob.status === 'Draft' || prob.status === 'DRAFT' ? 'Draft' : 'Live',
        description: prob.description || '',
        sampleInput: prob.sampleInput || (examples[0] ? examples[0].input : ''),
        sampleOutput: prob.sampleOutput || (examples[0] ? examples[0].output : ''),
        constraints: prob.constraints || '1 <= n <= 10^5\n-10^9 <= element <= 10^9\nOptimal time complexity required.',
        hints,
        starterCode,
        tags,
        companies: parsedCompanies,
        examples,
        editorialApproach,
        editorialAlgorithm,
        timeComplexity,
        spaceComplexity,
        testCasesList: parseArray(prob.testCasesList).length > 0 ? parseArray(prob.testCasesList) : examples,
        referenceSolution,
        estimatedSolveTime: prob.estimatedSolveTime || '15 minutes',
        visibility: prob.visibility || 'Public',
        createdAt: prob.createdAt || new Date().toISOString(),
        updatedAt: prob.updatedAt || new Date().toISOString(),
      };
    };

    // Live merge from file & DB
    const fileProblems = AdminService.loadProblemsFromFile();
    for (const [k, v] of fileProblems.entries()) {
      AdminService.fallbackProblems.set(String(k), v);
    }

    const problemMap = new Map<string, any>();
    for (const p of AdminService.fallbackProblems.values()) {
      problemMap.set(String(p.id), p);
    }
    for (const p of dbProblems) {
      problemMap.set(String(p.id), { ...problemMap.get(String(p.id)), ...p });
    }

    const allList = Array.from(problemMap.values());
    return allList.map((prob, index) => enrichProblem(prob, index));
  }

  async savePracticeProblem(data: {
    id?: string;
    title: string;
    category?: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    acceptance?: string;
    submissions?: number;
    testCases?: number;
    status?: 'Live' | 'Draft';
    description?: string;
    sampleInput?: string;
    sampleOutput?: string;
    constraints?: string;
    hints?: string[];
    starterCode?: Record<string, string>;
    tags?: string[];
    companies?: string;
    examples?: any[];
    editorialApproach?: string;
    editorialAlgorithm?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    testCasesList?: any[];
    referenceSolution?: Record<string, string>;
    estimatedSolveTime?: string;
    visibility?: string;
  }) {
    const baseSlug = (data.title || 'problem')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    let createdDbProblem: any = null;
    try {
      createdDbProblem = await (this.prisma as any).practiceProblem.create({
        data: {
          slug,
          title: data.title || 'Untitled Problem',
          category: data.category || 'Arrays',
          difficulty: data.difficulty || 'Medium',
          acceptance: data.acceptance || '0.0%',
          submissions: typeof data.submissions === 'number' ? data.submissions : 0,
          testCases: typeof data.testCases === 'number' ? data.testCases : (data.testCasesList?.length || 0),
          status: data.status || 'Live',
          description: data.description || null,
          sampleInput: data.sampleInput || null,
          sampleOutput: data.sampleOutput || null,
          constraints: data.constraints || null,
          hints: Array.isArray(data.hints) ? data.hints : [],
          starterCode: data.starterCode || {},
          tags: Array.isArray(data.tags) ? data.tags : [],
          companies: data.companies || null,
          examples: Array.isArray(data.examples) ? data.examples : [],
          editorialApproach: data.editorialApproach || null,
          editorialAlgorithm: data.editorialAlgorithm || null,
          timeComplexity: data.timeComplexity || null,
          spaceComplexity: data.spaceComplexity || null,
          testCasesList: Array.isArray(data.testCasesList) ? data.testCasesList : [],
          referenceSolution: data.referenceSolution || {},
          estimatedSolveTime: data.estimatedSolveTime || '15 minutes',
          visibility: data.visibility || 'Public',
        },
      });
    } catch (dbErr) {
      console.warn('Practice problem DB create fallback:', dbErr);
    }

    const id = createdDbProblem ? String(createdDbProblem.id) : (data.id || `prob-${Date.now()}`);
    const result = {
      ...data,
      id,
      slug: createdDbProblem?.slug || slug,
      title: data.title || 'Untitled Problem',
      category: data.category || 'Arrays',
      difficulty: data.difficulty || 'Medium',
      acceptance: data.acceptance || '0.0%',
      submissions: typeof data.submissions === 'number' ? data.submissions : 0,
      testCases: typeof data.testCases === 'number' ? data.testCases : (data.testCasesList?.length || 0),
      status: data.status || 'Live',
      description: data.description || '',
      sampleInput: data.sampleInput || '',
      sampleOutput: data.sampleOutput || '',
      constraints: data.constraints || '',
      hints: Array.isArray(data.hints) ? data.hints : [],
      starterCode: data.starterCode || {},
      tags: Array.isArray(data.tags) ? data.tags : [],
      companies: data.companies || '',
      examples: Array.isArray(data.examples) ? data.examples : [],
      editorialApproach: data.editorialApproach || '',
      editorialAlgorithm: data.editorialAlgorithm || '',
      timeComplexity: data.timeComplexity || '',
      spaceComplexity: data.spaceComplexity || '',
      testCasesList: Array.isArray(data.testCasesList) ? data.testCasesList : [],
      referenceSolution: data.referenceSolution || {},
      estimatedSolveTime: data.estimatedSolveTime || '15 minutes',
      visibility: data.visibility || 'Public',
      createdAt: createdDbProblem?.createdAt || new Date().toISOString(),
      updatedAt: createdDbProblem?.updatedAt || new Date().toISOString(),
    };

    AdminService.fallbackProblems.set(id, result);
    AdminService.saveProblemsToFile();
    return result;
  }

  async updatePracticeProblem(id: string, data: Partial<{
    title: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    acceptance: string;
    submissions: number;
    testCases: number;
    status: 'Live' | 'Draft';
    description: string;
    sampleInput: string;
    sampleOutput: string;
    constraints: string;
    hints: string[];
    starterCode: Record<string, string>;
    tags: string[];
    companies: string;
    examples: any[];
    editorialApproach: string;
    editorialAlgorithm: string;
    timeComplexity: string;
    spaceComplexity: string;
    testCasesList: any[];
    referenceSolution: Record<string, string>;
    estimatedSolveTime: string;
    visibility: string;
  }>) {
    let updatedDbProblem: any = null;
    try {
      updatedDbProblem = await (this.prisma as any).practiceProblem.update({
        where: { id },
        data: {
          ...(data.title ? { title: data.title } : {}),
          ...(data.category ? { category: data.category } : {}),
          ...(data.difficulty ? { difficulty: data.difficulty } : {}),
          ...(data.acceptance ? { acceptance: data.acceptance } : {}),
          ...(data.submissions !== undefined ? { submissions: data.submissions } : {}),
          ...(data.testCases !== undefined ? { testCases: data.testCases } : {}),
          ...(data.status ? { status: data.status } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.sampleInput !== undefined ? { sampleInput: data.sampleInput } : {}),
          ...(data.sampleOutput !== undefined ? { sampleOutput: data.sampleOutput } : {}),
          ...(data.constraints !== undefined ? { constraints: data.constraints } : {}),
          ...(data.hints !== undefined ? { hints: data.hints } : {}),
          ...(data.starterCode !== undefined ? { starterCode: data.starterCode } : {}),
          ...(data.tags !== undefined ? { tags: data.tags } : {}),
          ...(data.companies !== undefined ? { companies: data.companies } : {}),
          ...(data.examples !== undefined ? { examples: data.examples } : {}),
          ...(data.editorialApproach !== undefined ? { editorialApproach: data.editorialApproach } : {}),
          ...(data.editorialAlgorithm !== undefined ? { editorialAlgorithm: data.editorialAlgorithm } : {}),
          ...(data.timeComplexity !== undefined ? { timeComplexity: data.timeComplexity } : {}),
          ...(data.spaceComplexity !== undefined ? { spaceComplexity: data.spaceComplexity } : {}),
          ...(data.testCasesList !== undefined ? { testCasesList: data.testCasesList } : {}),
          ...(data.referenceSolution !== undefined ? { referenceSolution: data.referenceSolution } : {}),
          ...(data.estimatedSolveTime !== undefined ? { estimatedSolveTime: data.estimatedSolveTime } : {}),
          ...(data.visibility !== undefined ? { visibility: data.visibility } : {}),
        },
      });
    } catch (dbErr) {
      console.warn('Practice problem DB update fallback:', dbErr);
    }

    const existing = AdminService.fallbackProblems.get(String(id)) || {};
    const updated = {
      ...existing,
      ...data,
      ...updatedDbProblem,
      id,
      slug: data.title
        ? data.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : (existing.slug || `problem-${id}`),
      title: data.title !== undefined ? data.title : (existing.title || 'Untitled Problem'),
      category: data.category !== undefined ? data.category : (existing.category || 'General'),
      difficulty: data.difficulty !== undefined ? data.difficulty : (existing.difficulty || 'Medium'),
      acceptance: data.acceptance !== undefined ? data.acceptance : (existing.acceptance || '0.0%'),
      submissions: data.submissions !== undefined ? data.submissions : (existing.submissions || 0),
      testCases: data.testCases !== undefined ? data.testCases : (existing.testCases || (data.testCasesList?.length || 0)),
      status: data.status !== undefined ? data.status : (existing.status || 'Live'),
      description: data.description !== undefined ? data.description : (existing.description || ''),
      sampleInput: data.sampleInput !== undefined ? data.sampleInput : (existing.sampleInput || ''),
      sampleOutput: data.sampleOutput !== undefined ? data.sampleOutput : (existing.sampleOutput || ''),
      constraints: data.constraints !== undefined ? data.constraints : (existing.constraints || ''),
      hints: data.hints !== undefined ? data.hints : (existing.hints || []),
      starterCode: data.starterCode !== undefined ? data.starterCode : (existing.starterCode || {}),
      tags: data.tags !== undefined ? data.tags : (existing.tags || []),
      companies: data.companies !== undefined ? data.companies : (existing.companies || ''),
      examples: data.examples !== undefined ? data.examples : (existing.examples || []),
      editorialApproach: data.editorialApproach !== undefined ? data.editorialApproach : (existing.editorialApproach || ''),
      editorialAlgorithm: data.editorialAlgorithm !== undefined ? data.editorialAlgorithm : (existing.editorialAlgorithm || ''),
      timeComplexity: data.timeComplexity !== undefined ? data.timeComplexity : (existing.timeComplexity || ''),
      spaceComplexity: data.spaceComplexity !== undefined ? data.spaceComplexity : (existing.spaceComplexity || ''),
      testCasesList: data.testCasesList !== undefined ? data.testCasesList : (existing.testCasesList || []),
      referenceSolution: data.referenceSolution !== undefined ? data.referenceSolution : (existing.referenceSolution || {}),
      estimatedSolveTime: data.estimatedSolveTime !== undefined ? data.estimatedSolveTime : (existing.estimatedSolveTime || '15 minutes'),
      visibility: data.visibility !== undefined ? data.visibility : (existing.visibility || 'Public'),
      updatedAt: new Date().toISOString(),
    };

    AdminService.fallbackProblems.set(String(id), updated);
    AdminService.saveProblemsToFile();
    return updated;
  }

  async deletePracticeProblem(id: string) {
    try {
      await (this.prisma as any).practiceProblem.delete({
        where: { id },
      });
    } catch (dbErr) {
      console.warn('Practice problem DB delete fallback:', dbErr);
    }

    AdminService.fallbackProblems.delete(String(id));
    AdminService.saveProblemsToFile();
    return { success: true, id };
  }

  // ==========================================
  // LIVE SESSIONS CRUD OPERATIONS
  // ==========================================
  async getAllLiveSessions() {
    let dbSessions: any[] = [];
    try {
      if ((this.prisma as any).liveSession) {
        dbSessions = await (this.prisma as any).liveSession.findMany({
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch (err) {
      console.warn('Live sessions DB fetch fallback:', err);
    }

    const merged = new Map<string, any>();
    for (const [id, s] of AdminService.fallbackLiveSessions.entries()) {
      merged.set(String(id), s);
    }
    for (const s of dbSessions) {
      if (s && s.id) {
        const existing = merged.get(String(s.id)) || {};
        merged.set(String(s.id), { ...existing, ...s });
      }
    }

    return Array.from(merged.values()).sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }

  public static syncLiveSessionAnnouncement(session: any) {
    if (!session || !session.id) return;
    const rawId = String(session.id);
    const cleanId = rawId.replace(/^sess_/, '');
    const annId = `ann_sess_${cleanId}`;

    // If session is Draft, remove the announcement
    if (session.status === 'Draft') {
      AdminService.fallbackAnnouncements.delete(annId);
      AdminService.fallbackAnnouncements.delete(`ann_sess_${rawId}`);
      AdminService.fallbackAnnouncements.delete(`ann_sess_sess_${cleanId}`);
      AdminService.saveAnnouncementsToFile();
      return;
    }

    const annObj = {
      id: annId,
      title: session.title ? `Live Class: ${session.title}` : 'Live Class',
      content: session.description || `Scheduled on ${session.date || ''} from ${session.startTime || ''} to ${session.endTime || ''} (${session.timezone || 'IST'}). Platform: ${session.platform || 'Google Meet'}.`,
      category: 'Live Class',
      targetAudience: session.targetCohort || 'All Enrolled Students',
      publishedAt: session.createdAt || new Date().toISOString(),
      date: session.date || new Date().toISOString().split('T')[0],
      isPinned: true,
      status: session.status === 'Completed' ? 'Archived' : 'Published',
      meetingLink: session.meetingLink || '',
      platform: session.platform || 'Google Meet',
      instructor: session.instructor || 'Platform Admin',
      sessionId: session.id,
      sessionData: session,
      course: session.course || '',
      module: session.module || '',
      topic: session.topic || '',
      startTime: session.startTime || '',
      endTime: session.endTime || '',
      timezone: session.timezone || '',
      hostNotes: session.hostNotes || '',
      passcode: session.passcode || '',
      resources: session.resources || [],
      sessionType: session.sessionType || 'Live Class',
      description: session.description || '',
    };

    // Clean up any double-prefixed keys like ann_sess_sess_...
    AdminService.fallbackAnnouncements.delete(`ann_sess_${rawId}`);
    AdminService.fallbackAnnouncements.delete(`ann_sess_sess_${cleanId}`);

    AdminService.fallbackAnnouncements.set(annId, annObj);
    AdminService.saveAnnouncementsToFile();
  }

  async saveLiveSession(data: any) {
    AdminService.fallbackLiveSessions = AdminService.loadLiveSessionsFromFile();
    AdminService.fallbackAnnouncements = AdminService.loadAnnouncementsFromFile();
    const id = data.id ? String(data.id) : `sess_${Date.now()}`;
    const existing = AdminService.fallbackLiveSessions.get(id) || {};
    const sessionObj = {
      ...existing,
      ...data,
      id,
      title: data.title !== undefined ? data.title : (existing.title || 'Untitled Live Session'),
      instructor: data.instructor || existing.instructor || 'Platform Admin',
      sessionType: data.sessionType || existing.sessionType || 'Live Class',
      description: data.description !== undefined ? data.description : (existing.description || ''),
      courseId: data.courseId || existing.courseId || null,
      course: data.course !== undefined ? data.course : (existing.course || ''),
      module: data.module !== undefined ? data.module : (existing.module || ''),
      topic: data.topic !== undefined ? data.topic : (existing.topic || ''),
      targetCohort: data.targetCohort || existing.targetCohort || 'All Enrolled Students',
      date: data.date || existing.date || new Date().toISOString().split('T')[0],
      timezone: data.timezone || existing.timezone || 'IST (UTC+5:30) - Asia/Kolkata',
      startTime: data.startTime || existing.startTime || '18:00',
      endTime: data.endTime || existing.endTime || '19:30',
      platform: data.platform || existing.platform || 'Google Meet',
      meetingLink: data.meetingLink !== undefined ? data.meetingLink : (existing.meetingLink || ''),
      passcode: data.passcode !== undefined ? data.passcode : (existing.passcode || ''),
      hostNotes: data.hostNotes !== undefined ? data.hostNotes : (existing.hostNotes || ''),
      resources: data.resources || existing.resources || [],
      emailReminders: data.emailReminders !== undefined ? data.emailReminders : (existing.emailReminders ?? true),
      inAppNotifications: data.inAppNotifications !== undefined ? data.inAppNotifications : (existing.inAppNotifications ?? true),
      reminderSchedule: data.reminderSchedule || existing.reminderSchedule || '30 minutes before',
      autoRecord: data.autoRecord !== undefined ? data.autoRecord : (existing.autoRecord ?? true),
      uploadRecording: data.uploadRecording !== undefined ? data.uploadRecording : (existing.uploadRecording ?? true),
      aiNotes: data.aiNotes !== undefined ? data.aiNotes : (existing.aiNotes ?? true),
      autoPublishRecording: data.autoPublishRecording !== undefined ? data.autoPublishRecording : (existing.autoPublishRecording ?? false),
      trackAttendance: data.trackAttendance !== undefined ? data.trackAttendance : (existing.trackAttendance ?? true),
      attendanceMethod: data.attendanceMethod || existing.attendanceMethod || 'Automatic on join (min 15 mins)',
      attendanceThreshold: data.attendanceThreshold || existing.attendanceThreshold || '75%',
      maxAttendees: data.maxAttendees || existing.maxAttendees || '250',
      visibility: data.visibility || existing.visibility || 'All enrolled students',
      status: data.status || existing.status || 'Scheduled',
      attendees: data.attendees !== undefined ? Number(data.attendees) : (existing.attendees ? Number(existing.attendees) : 0),
      createdAt: existing.createdAt || data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let dbSaved: any = null;
    try {
      if ((this.prisma as any).liveSession) {
        dbSaved = await (this.prisma as any).liveSession.upsert({
          where: { id },
          create: sessionObj,
          update: sessionObj,
        });
      }
    } catch (dbErr) {
      console.warn('Live session DB upsert fallback:', dbErr);
    }

    const finalSession = { ...sessionObj, ...(dbSaved || {}) };
    AdminService.fallbackLiveSessions.set(id, finalSession);
    AdminService.saveLiveSessionsToFile();

    // Auto-create/sync announcement for learner announcements page
    AdminService.syncLiveSessionAnnouncement(finalSession);

    return finalSession;
  }

  async updateLiveSession(id: string, data: any) {
    AdminService.fallbackLiveSessions = AdminService.loadLiveSessionsFromFile();
    AdminService.fallbackAnnouncements = AdminService.loadAnnouncementsFromFile();
    let dbUpdated: any = null;
    try {
      if ((this.prisma as any).liveSession) {
        dbUpdated = await (this.prisma as any).liveSession.update({
          where: { id },
          data: {
            ...data,
            updatedAt: new Date(),
          },
        });
      }
    } catch (dbErr) {
      console.warn('Live session DB update fallback:', dbErr);
    }

    const existing = AdminService.fallbackLiveSessions.get(String(id)) || {};
    const updated = {
      ...existing,
      ...data,
      ...(dbUpdated || {}),
      id: String(id),
      updatedAt: new Date().toISOString(),
    };

    AdminService.fallbackLiveSessions.set(String(id), updated);
    AdminService.saveLiveSessionsToFile();

    // Auto-create/sync announcement for learner announcements page
    AdminService.syncLiveSessionAnnouncement(updated);

    return updated;
  }

  async deleteLiveSession(id: string) {
    AdminService.fallbackLiveSessions = AdminService.loadLiveSessionsFromFile();
    AdminService.fallbackAnnouncements = AdminService.loadAnnouncementsFromFile();
    try {
      if ((this.prisma as any).liveSession) {
        await (this.prisma as any).liveSession.delete({
          where: { id },
        });
      }
    } catch (dbErr) {
      console.warn('Live session DB delete fallback:', dbErr);
    }

    AdminService.fallbackLiveSessions.delete(String(id));
    AdminService.saveLiveSessionsToFile();

    const cleanId = String(id).replace(/^sess_/, '');
    AdminService.fallbackAnnouncements.delete(`ann_sess_${cleanId}`);
    AdminService.fallbackAnnouncements.delete(`ann_sess_${id}`);
    AdminService.fallbackAnnouncements.delete(`ann_sess_sess_${cleanId}`);
    AdminService.saveAnnouncementsToFile();

    return { success: true, id };
  }

  // ==========================================
  // ANNOUNCEMENTS CRUD OPERATIONS
  // ==========================================
  async getAllAnnouncements() {
    AdminService.fallbackAnnouncements = AdminService.loadAnnouncementsFromFile();
    AdminService.fallbackLiveSessions = AdminService.loadLiveSessionsFromFile();

    // Auto-sync announcements from all active scheduled live sessions
    for (const s of AdminService.fallbackLiveSessions.values()) {
      if (s) {
        AdminService.syncLiveSessionAnnouncement(s);
      }
    }

    return Array.from(AdminService.fallbackAnnouncements.values()).sort((a, b) => {
      const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return timeB - timeA;
    });
  }

  async saveAnnouncement(data: any) {
    const id = data.id ? String(data.id) : `ann_${Date.now()}`;
    const annObj = {
      id,
      title: data.title || 'Platform Announcement',
      content: data.content || data.body || '',
      category: data.category || 'General',
      targetAudience: data.targetAudience || 'All Students',
      publishedAt: data.publishedAt || new Date().toISOString(),
      date: data.date || new Date().toISOString().split('T')[0],
      isPinned: Boolean(data.isPinned),
      status: data.status || 'Published',
      ctaLabel: data.ctaLabel || '',
      ctaUrl: data.ctaUrl || '',
    };
    AdminService.fallbackAnnouncements.set(id, annObj);
    AdminService.saveAnnouncementsToFile();
    return annObj;
  }

  async deleteAnnouncement(id: string) {
    AdminService.fallbackAnnouncements.delete(String(id));
    AdminService.saveAnnouncementsToFile();
    return { success: true, id };
  }

  async getInstructors() {
    let dbUsers: any[] = [];
    try {
      dbUsers = await this.prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'INSTRUCTOR'] },
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          avatarUrl: true,
        },
        orderBy: { fullName: 'asc' },
      });
    } catch (err) {
      console.warn('Failed to query admin/instructor users from DB:', err);
    }

    const cleanNameStr = (name?: string | null) => {
      if (!name) return '';
      return name
        .replace(/\s*\((Admin|Instructor|Staff)\)\s*/gi, '')
        .replace(/\s+Admin$/i, '')
        .trim();
    };

    const userMap = new Map<string, any>();
    for (const u of dbUsers) {
      if (u && u.email) {
        const cleaned = cleanNameStr(u.fullName) || u.email.split('@')[0];
        userMap.set(u.email.toLowerCase(), {
          id: u.id,
          fullName: cleaned,
          email: u.email,
          role: u.role || 'ADMIN',
          avatarUrl: u.avatarUrl || null,
        });
      }
    }

    for (const u of AuthService.fallbackUsers.values()) {
      if (
        u &&
        u.email &&
        (u.role === 'ADMIN' || u.role === 'INSTRUCTOR' || u.email.toLowerCase() === 'abhishek.j3094@gmail.com')
      ) {
        if (!userMap.has(u.email.toLowerCase())) {
          const cleaned = cleanNameStr(u.fullName || u.name) || 'Abhishek J';
          userMap.set(u.email.toLowerCase(), {
            id: u.id || `admin_${Date.now()}`,
            fullName: cleaned,
            email: u.email,
            role: u.role || 'ADMIN',
            avatarUrl: u.avatarUrl || null,
          });
        }
      }
    }

    if (userMap.size === 0) {
      try {
        const anyAdmin = await this.prisma.user.findFirst({
          where: {
            OR: [
              { email: 'abhishek.j3094@gmail.com' },
              { role: { in: ['ADMIN', 'INSTRUCTOR'] } },
            ],
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        });
        if (anyAdmin && anyAdmin.email) {
          const cleaned = cleanNameStr(anyAdmin.fullName) || 'Abhishek J';
          userMap.set(anyAdmin.email.toLowerCase(), {
            id: anyAdmin.id,
            fullName: cleaned,
            email: anyAdmin.email,
            role: anyAdmin.role || 'ADMIN',
            avatarUrl: anyAdmin.avatarUrl || null,
          });
        }
      } catch {}
    }

    const list = Array.from(userMap.values());
    if (list.length === 0) {
      return [
        {
          id: 'admin_primary',
          fullName: 'Abhishek J',
          email: 'abhishek.j3094@gmail.com',
          role: 'ADMIN',
          avatarUrl: null,
        },
      ];
    }
    return list;
  }
}


