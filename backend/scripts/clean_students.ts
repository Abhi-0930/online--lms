import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('--- Fetching all users in Database ---');
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
    },
  });

  console.log(`Found ${allUsers.length} total users in DB:`);
  for (const u of allUsers) {
    console.log(`- [${u.role}] ${u.fullName} (${u.email}) - ID: ${u.id}`);
  }

  // Delete all STUDENT users (preserve ADMIN and INSTRUCTOR)
  const studentUsers = allUsers.filter((u) => u.role === 'STUDENT');
  console.log(`\nIdentified ${studentUsers.length} student users to delete.`);

  if (studentUsers.length > 0) {
    const studentIds = studentUsers.map((u) => u.id);

    console.log('Cleaning related student records...');

    const lp = await prisma.lessonProgress.deleteMany({
      where: { userId: { in: studentIds } },
    }).catch(() => ({ count: 0 }));
    console.log(`Deleted ${lp.count} lesson progress records.`);

    const rp = await prisma.userRoadmapProgress.deleteMany({
      where: { userId: { in: studentIds } },
    }).catch(() => ({ count: 0 }));
    console.log(`Deleted ${rp.count} roadmap progress records.`);

    const as = await prisma.assignmentSubmission.deleteMany({
      where: { userId: { in: studentIds } },
    }).catch(() => ({ count: 0 }));
    console.log(`Deleted ${as.count} assignment submission records.`);

    const al = await prisma.activityLog.deleteMany({
      where: { userId: { in: studentIds } },
    }).catch(() => ({ count: 0 }));
    console.log(`Deleted ${al.count} activity logs.`);

    const ce = await prisma.cohortEnrollment.deleteMany({
      where: { userId: { in: studentIds } },
    }).catch(() => ({ count: 0 }));
    console.log(`Deleted ${ce.count} cohort enrollments.`);

    const enr = await prisma.enrollment.deleteMany({
      where: { userId: { in: studentIds } },
    }).catch(() => ({ count: 0 }));
    console.log(`Deleted ${enr.count} course enrollments.`);

    const pm = await prisma.payment.deleteMany({
      where: { userId: { in: studentIds } },
    }).catch(() => ({ count: 0 }));
    console.log(`Deleted ${pm.count} payment records.`);

    const ob = await prisma.userOnboarding.deleteMany({
      where: { userId: { in: studentIds } },
    }).catch(() => ({ count: 0 }));
    console.log(`Deleted ${ob.count} user onboarding records.`);

    const ud = await prisma.userDevice.deleteMany({
      where: { userId: { in: studentIds } },
    }).catch(() => ({ count: 0 }));
    console.log(`Deleted ${ud.count} user devices.`);

    const res = await prisma.user.deleteMany({
      where: { id: { in: studentIds } },
    });
    console.log(`\nSuccessfully deleted ${res.count} student users from PostgreSQL database.`);
  }

  const remaining = await prisma.user.findMany({
    select: { id: true, email: true, fullName: true, role: true },
  });
  console.log(`\nRemaining users in DB (${remaining.length}):`);
  for (const u of remaining) {
    console.log(`- [${u.role}] ${u.fullName} (${u.email})`);
  }
}

main()
  .catch((e) => {
    console.error('Error running clean script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
