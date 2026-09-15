import { PrismaClient } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { OnboardingService } from '../onboarding/onboarding.service';

export class AdminService {
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

  async getDashboardStats() {
    let dbUsers: any[] = [];
    try {
      dbUsers = await this.prisma.user.findMany({
        include: {
          onboarding: true,
          enrollments: true,
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

    // Recent activity items
    const recentActivities = allUsers.slice(0, 5).map((u) => {
      const name = u.fullName || u.name || u.email.split('@')[0];
      const createdDate = new Date(u.createdAt || Date.now());
      const minsAgo = Math.max(1, Math.floor((Date.now() - createdDate.getTime()) / 60000));
      let timeStr = `${minsAgo} min ago`;
      if (minsAgo >= 60) {
        const hours = Math.floor(minsAgo / 60);
        timeStr = hours >= 24 ? `${Math.floor(hours / 24)} days ago` : `${hours} hr ago`;
      }
      return {
        title: `Student enrolled: ${name}`,
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

      // Determine course / track
      let courseName = 'Full Stack Development';
      if (u.enrollments && u.enrollments.length > 0 && u.enrollments[0]?.course?.title) {
        courseName = u.enrollments[0].course.title;
      } else if (targetDomain) {
        courseName = targetDomain.replace(/[_-]/g, ' ').toUpperCase();
      }

      // Progress
      let progress = 65;
      if (onboarding?.isCompleted) {
        progress = 100;
      } else if (onboarding?.completedStep) {
        progress = Math.min(100, Math.round((onboarding.completedStep / 4) * 100));
      }

      // Time calculation
      const createdDate = new Date(u.createdAt || Date.now());
      const minsAgo = Math.max(2, Math.floor((Date.now() - createdDate.getTime()) / 60000));
      let activityStr = `${minsAgo} min ago`;
      if (minsAgo >= 60) {
        const hours = Math.floor(minsAgo / 60);
        activityStr = hours >= 24 ? `${Math.floor(hours / 24)} days ago` : `${hours} hrs ago`;
      }

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
        status: progress > 50 ? 'On track' : 'In progress',
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
          modules: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      dbCourses = [];
    }

    if (dbCourses.length === 0) {
      return [];
    }

    const students = await this.getAllStudents();

    return dbCourses.map((course) => {
      const courseStudents = students.filter((s) => {
        const cName = (s.course || '').toLowerCase();
        const title = course.title.toLowerCase();
        return cName.includes(title) || title.includes(cName);
      });

      const count = courseStudents.length;
      const avgProgress =
        count > 0
          ? Math.round(courseStudents.reduce((sum, s) => sum + (s.progress || 0), 0) / count)
          : 0;

      return {
        id: course.id,
        title: course.title,
        track: course.subtitle || course.description?.slice(0, 30) || 'General track',
        instructor: course.instructor?.fullName || 'Instructor',
        students: count,
        completion: avgProgress,
        revenue: '₹0',
        status: course.status === 'PUBLISHED' ? 'Published' : course.status === 'DRAFT' ? 'Draft' : 'Review',
        color: '#dbeafe',
        initials: course.title.slice(0, 3).toUpperCase(),
      };
    });
  }
}
