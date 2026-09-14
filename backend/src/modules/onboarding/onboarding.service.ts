import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger';

export class OnboardingService {
  constructor(private prisma: PrismaClient) {}

  // In-memory fallback store when PostgreSQL is offline
  private static onboardingStore = new Map<string, any>();

  async saveStep1(userId: string, educationStatus: string) {
    let record: any = {
      id: uuidv4(),
      userId,
      educationStatus,
      completedStep: 1,
      isCompleted: false,
      updatedAt: new Date(),
    };

    try {
      record = await this.prisma.userOnboarding.upsert({
        where: { userId },
        update: {
          educationStatus,
          completedStep: 1,
        },
        create: {
          id: uuidv4(),
          userId,
          educationStatus,
          completedStep: 1,
          isCompleted: false,
        },
      });
      logger.info({ userId, educationStatus }, 'Saved Step 1 onboarding in database');
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Database write deferred, saved onboarding in memory store');
    }

    OnboardingService.onboardingStore.set(userId, record);
    return record;
  }

  async saveStep2(userId: string, targetRoles: string[] | string) {
    const rolesString = Array.isArray(targetRoles) ? targetRoles.join(', ') : targetRoles;
    let record: any = OnboardingService.onboardingStore.get(userId) || {
      id: uuidv4(),
      userId,
      completedStep: 2,
      isCompleted: false,
    };

    record.targetDomain = rolesString;
    record.completedStep = 2;
    record.updatedAt = new Date();

    try {
      record = await this.prisma.userOnboarding.upsert({
        where: { userId },
        update: {
          targetDomain: rolesString,
          completedStep: 2,
        },
        create: {
          id: uuidv4(),
          userId,
          targetDomain: rolesString,
          completedStep: 2,
          isCompleted: false,
        },
      });
      logger.info({ userId, targetRoles: rolesString }, 'Saved Step 2 onboarding in database');
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Database write deferred, saved step 2 in memory store');
    }

    OnboardingService.onboardingStore.set(userId, record);
    return record;
  }

  async getOnboarding(userId: string) {
    try {
      const record = await this.prisma.userOnboarding.findUnique({
        where: { userId },
      });
      if (record) return record;
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Database read deferred, fetching onboarding from memory');
    }

    return OnboardingService.onboardingStore.get(userId) || null;
  }
}
