import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const targetEmail = "abhishek.j3094@gmail.com";
  console.log(`Looking up user with email: ${targetEmail}...`);

  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
    include: {
      onboarding: true,
      devices: true,
      enrollments: true,
    },
  });

  if (!user) {
    console.log(`User with email "${targetEmail}" was not found in the database.`);
    return;
  }

  console.log(`Found user: ID=${user.id}, FullName="${user.fullName}", Email="${user.email}"`);

  // Delete all related records
  await prisma.activityLog.deleteMany({ where: { userId: user.id } }).catch(() => {});
  await prisma.lessonProgress.deleteMany({ where: { userId: user.id } }).catch(() => {});
  await prisma.enrollment.deleteMany({ where: { userId: user.id } }).catch(() => {});
  await prisma.cohortEnrollment.deleteMany({ where: { userId: user.id } }).catch(() => {});
  await prisma.payment.deleteMany({ where: { userId: user.id } }).catch(() => {});
  await prisma.userRoadmapProgress.deleteMany({ where: { userId: user.id } }).catch(() => {});
  await prisma.userDevice.deleteMany({ where: { userId: user.id } }).catch(() => {});
  await prisma.userOnboarding.deleteMany({ where: { userId: user.id } }).catch(() => {});

  // Delete user
  const deletedUser = await prisma.user.delete({
    where: { id: user.id },
  });

  console.log(`Successfully deleted user: ${deletedUser.email} (ID: ${deletedUser.id})`);
}

main()
  .catch((e) => {
    console.error("Error deleting user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
