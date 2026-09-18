import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

export class AssignmentsService {
  public static fallbackAssignments = new Map<string, any>();
  public static fallbackSubmissions = new Map<string, any>();

  constructor(private prisma: PrismaClient) {}

  async getPublishedAssignments(userId?: string) {
    try {
      const assignments = await this.prisma.assignment.findMany({
        where: {
          status: { in: ['PUBLISHED', 'Published'] },
        },
        include: {
          course: {
            select: { id: true, title: true, slug: true },
          },
          submissions: userId
            ? {
                where: { userId },
                take: 1,
                orderBy: { submittedAt: 'desc' },
              }
            : false,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Merge with in-memory fallbacks if any
      const map = new Map<string, any>();
      for (const a of assignments) {
        map.set(a.id, a);
      }
      for (const fa of AssignmentsService.fallbackAssignments.values()) {
        if ((fa.status || '').toUpperCase() === 'PUBLISHED' && !map.has(fa.id)) {
          map.set(fa.id, fa);
        }
      }

      return Array.from(map.values()).map((a) => {
        const userSubmission = Array.isArray(a.submissions) && a.submissions.length > 0 ? a.submissions[0] : null;
        return {
          id: a.id,
          title: a.title,
          description: a.description || '',
          instructions: a.instructions || '',
          course: a.course?.title || a.courseName || 'General',
          courseId: a.courseId || a.course?.id || null,
          module: a.module || 'General',
          topic: a.topic || '',
          difficulty: a.difficulty || 'Medium',
          problemsCount: a.problemsCount || (Array.isArray(a.problemsList) ? a.problemsList.length : 0),
          problemsList: a.problemsList || [],
          dueDate: a.dueDateString || a.deadline || (a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'),
          dueDateRaw: a.dueDate || null,
          releaseDate: a.releaseDate || '',
          allowLate: a.allowLate || false,
          resources: a.resources || [],
          submissionTypes: a.submissionTypes || ['Code Editor', 'ZIP File', 'GitHub'],
          totalMarks: a.totalMarks || 100,
          passingMarks: a.passingMarks || 40,
          status: a.status,
          userSubmission: userSubmission
            ? {
                id: userSubmission.id,
                status: userSubmission.status,
                score: userSubmission.score,
                maxScore: userSubmission.maxScore || 100,
                submittedAt: userSubmission.submittedAt,
                content: userSubmission.content,
                githubUrl: userSubmission.githubUrl,
                fileUrl: userSubmission.fileUrl,
              }
            : null,
        };
      });
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Failed to query assignments from DB, using memory fallback');
      return Array.from(AssignmentsService.fallbackAssignments.values())
        .filter((a) => (a.status || '').toUpperCase() === 'PUBLISHED')
        .map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description || '',
          instructions: a.instructions || '',
          course: a.course || a.courseName || 'General',
          courseId: a.courseId || null,
          module: a.module || 'General',
          topic: a.topic || '',
          difficulty: a.difficulty || 'Medium',
          problemsCount: a.problemsCount || 0,
          problemsList: a.problemsList || [],
          dueDate: a.dueDate || a.deadline || 'No deadline',
          dueDateRaw: null,
          releaseDate: a.releaseDate || '',
          allowLate: a.allowLate || false,
          resources: a.resources || [],
          submissionTypes: a.submissionTypes || ['Code Editor', 'ZIP File', 'GitHub'],
          totalMarks: a.totalMarks || 100,
          passingMarks: a.passingMarks || 40,
          status: a.status,
          userSubmission: null,
        }));
    }
  }

  async getAssignmentById(id: string, userId?: string) {
    try {
      const assignment = await this.prisma.assignment.findUnique({
        where: { id },
        include: {
          course: true,
          submissions: userId
            ? {
                where: { userId },
                take: 1,
                orderBy: { submittedAt: 'desc' },
              }
            : false,
        },
      });

      if (assignment) return assignment;
    } catch {}

    if (AssignmentsService.fallbackAssignments.has(id)) {
      return AssignmentsService.fallbackAssignments.get(id);
    }

    return null;
  }

  async submitAssignment(
    assignmentId: string,
    userId: string,
    data: {
      content?: string;
      fileUrl?: string;
      githubUrl?: string;
    }
  ) {
    try {
      // Find assignment to get maxScore
      let assignment = await this.prisma.assignment.findUnique({ where: { id: assignmentId } });
      const maxScore = assignment?.totalMarks || 100;

      const submission = await this.prisma.assignmentSubmission.create({
        data: {
          assignmentId,
          userId,
          content: data.content || null,
          fileUrl: data.fileUrl || null,
          githubUrl: data.githubUrl || null,
          status: 'PENDING',
          maxScore,
        },
        include: {
          assignment: true,
          user: {
            select: { id: true, fullName: true, email: true, avatarUrl: true },
          },
        },
      });

      return submission;
    } catch (dbErr) {
      // Fallback
      const subId = `SUB-${Date.now().toString().slice(-4)}`;
      const submission = {
        id: subId,
        assignmentId,
        userId,
        content: data.content || '',
        fileUrl: data.fileUrl || null,
        githubUrl: data.githubUrl || null,
        status: 'PENDING',
        score: null,
        maxScore: 100,
        feedback: null,
        submittedAt: new Date(),
        updatedAt: new Date(),
      };
      AssignmentsService.fallbackSubmissions.set(subId, submission);
      return submission;
    }
  }

  async getUserSubmissions(userId: string) {
    try {
      return await this.prisma.assignmentSubmission.findMany({
        where: { userId },
        include: {
          assignment: {
            select: { id: true, title: true, courseName: true, totalMarks: true },
          },
        },
        orderBy: { submittedAt: 'desc' },
      });
    } catch {
      return Array.from(AssignmentsService.fallbackSubmissions.values()).filter(
        (s) => s.userId === userId
      );
    }
  }
}
