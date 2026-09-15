import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger';
import { AuthService } from '../auth/auth.service';

export class OnboardingService {
  constructor(private prisma: PrismaClient) {}

  // In-memory fallback store when PostgreSQL is offline
  public static onboardingStore = new Map<string, any>();

  public static getOnboardingRecord(userId: string): any {
    return OnboardingService.onboardingStore.get(userId) || null;
  }

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

    for (const [email, u] of AuthService.fallbackUsers.entries()) {
      if (u.id === userId) {
        u.onboarding = { ...(u.onboarding || {}), ...record, educationStatus };
        AuthService.fallbackUsers.set(email, u);
      }
    }

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

    for (const [email, u] of AuthService.fallbackUsers.entries()) {
      if (u.id === userId) {
        u.onboarding = { ...(u.onboarding || {}), ...record, targetDomain: rolesString };
        AuthService.fallbackUsers.set(email, u);
      }
    }

    return record;
  }

  async saveStep3(userId: string, targetCompanies: string[] | string) {
    const companiesString = Array.isArray(targetCompanies) ? targetCompanies.join(', ') : targetCompanies;
    let record: any = OnboardingService.onboardingStore.get(userId) || {
      id: uuidv4(),
      userId,
      completedStep: 3,
      isCompleted: false,
    };

    record.experienceLevel = companiesString;
    record.completedStep = 3;
    record.updatedAt = new Date();

    try {
      record = await this.prisma.userOnboarding.upsert({
        where: { userId },
        update: {
          experienceLevel: companiesString,
          completedStep: 3,
        },
        create: {
          id: uuidv4(),
          userId,
          experienceLevel: companiesString,
          completedStep: 3,
          isCompleted: false,
        },
      });
      logger.info({ userId, targetCompanies: companiesString }, 'Saved Step 3 onboarding in database');
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Database write deferred, saved step 3 in memory store');
    }

    OnboardingService.onboardingStore.set(userId, record);

    for (const [email, u] of AuthService.fallbackUsers.entries()) {
      if (u.id === userId) {
        u.onboarding = { ...(u.onboarding || {}), ...record, experienceLevel: companiesString };
        AuthService.fallbackUsers.set(email, u);
      }
    }

    return record;
  }

  async saveStep4(userId: string, name: string) {
    let record: any = OnboardingService.onboardingStore.get(userId) || {
      id: uuidv4(),
      userId,
      completedStep: 4,
      isCompleted: true,
    };

    record.primaryGoal = name;
    record.completedStep = 4;
    record.isCompleted = true;
    record.completedAt = new Date();
    record.updatedAt = new Date();

    try {
      // Update User table fullName if valid registered user
      if (userId && !userId.startsWith('guest-')) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { fullName: name },
        }).catch(() => {});
      }

      record = await this.prisma.userOnboarding.upsert({
        where: { userId },
        update: {
          primaryGoal: name,
          completedStep: 4,
          isCompleted: true,
          completedAt: new Date(),
        },
        create: {
          id: uuidv4(),
          userId,
          primaryGoal: name,
          completedStep: 4,
          isCompleted: true,
          completedAt: new Date(),
        },
      });
      logger.info({ userId, name }, 'Saved Step 4 onboarding in database & marked complete');
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Database write deferred, saved step 4 in memory store');
    }

    OnboardingService.onboardingStore.set(userId, record);

    for (const [email, u] of AuthService.fallbackUsers.entries()) {
      if (u.id === userId) {
        u.fullName = name;
        u.name = name;
        u.onboarding = { ...(u.onboarding || {}), ...record, primaryGoal: name };
        AuthService.fallbackUsers.set(email, u);
      }
    }
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
