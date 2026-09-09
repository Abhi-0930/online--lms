import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

export class RoadmapsService {
  constructor(private prisma: PrismaClient) {}

  async getAllRoadmaps() {
    const roadmaps = await this.prisma.roadmap.findMany({
      where: { isPublished: true },
      include: {
        items: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverImageUrl: true,
                level: true,
              },
            },
          },
          orderBy: { stepOrder: 'asc' },
        },
        _count: {
          select: {
            items: true,
            userProgress: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return roadmaps;
  }

  async getRoadmapBySlug(slug: string, userId?: string) {
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { slug },
      include: {
        items: {
          include: {
            course: {
              include: {
                instructor: {
                  select: {
                    id: true,
                    fullName: true,
                  },
                },
              },
            },
          },
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    if (!roadmap) {
      throw new Error('Roadmap not found');
    }

    // If userId provided, include user progress
    if (userId) {
      const userProgress = await this.prisma.userRoadmapProgress.findUnique({
        where: {
          userId_roadmapId: {
            userId,
            roadmapId: roadmap.id,
          },
        },
      });

      return {
        ...roadmap,
        userProgress,
      };
    }

    return roadmap;
  }

  async createRoadmap(data: any) {
    const roadmap = await this.prisma.roadmap.create({
      data,
    });

    logger.info({ roadmapId: roadmap.id }, 'Roadmap created');

    return roadmap;
  }

  async updateRoadmap(id: string, data: any) {
    const roadmap = await this.prisma.roadmap.update({
      where: { id },
      data,
    });

    logger.info({ roadmapId: id }, 'Roadmap updated');

    return roadmap;
  }

  async addRoadmapItem(roadmapId: string, courseId: string, stepOrder: number, isRequired: boolean = true) {
    const item = await this.prisma.roadmapItem.create({
      data: {
        roadmapId,
        courseId,
        stepOrder,
        isRequired,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    logger.info({ roadmapId, courseId }, 'Roadmap item added');

    return item;
  }

  async updateUserProgress(userId: string, roadmapId: string) {
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: {
        items: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!roadmap) {
      throw new Error('Roadmap not found');
    }

    const requiredItems = roadmap.items.filter((item) => item.isRequired);
    const completedItems = requiredItems.filter((item) =>
      item.course.enrollments.some((enrollment) => enrollment.status === 'COMPLETED')
    );

    const progressPct = requiredItems.length > 0 ? (completedItems.length / requiredItems.length) * 100 : 0;

    const progress = await this.prisma.userRoadmapProgress.upsert({
      where: {
        userId_roadmapId: {
          userId,
          roadmapId,
        },
      },
      update: {
        progressPct,
      },
      create: {
        userId,
        roadmapId,
        progressPct,
      },
    });

    logger.info({ userId, roadmapId, progressPct }, 'Roadmap progress updated');

    return progress;
  }
}
