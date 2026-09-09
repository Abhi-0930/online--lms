import { PrismaClient } from '@prisma/client';
import logger from '../../utils/logger';

export class ResourcesService {
  constructor(private prisma: PrismaClient) {}

  async getResourcesByCourse(courseId: string) {
    const resources = await this.prisma.resource.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
    });

    return resources;
  }

  async getResourcesByLesson(lessonId: string) {
    const resources = await this.prisma.resource.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'desc' },
    });

    return resources;
  }

  async createResource(data: any) {
    const resource = await this.prisma.resource.create({
      data,
    });

    logger.info({ resourceId: resource.id }, 'Resource created');

    return resource;
  }

  async updateResource(id: string, data: any) {
    const resource = await this.prisma.resource.update({
      where: { id },
      data,
    });

    logger.info({ resourceId: id }, 'Resource updated');

    return resource;
  }

  async deleteResource(id: string) {
    await this.prisma.resource.delete({
      where: { id },
    });

    logger.info({ resourceId: id }, 'Resource deleted');

    return { success: true };
  }
}
