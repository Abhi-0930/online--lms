import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, fullName: true, role: true },
  });
  console.log('USERS IN DB count:', users.length);
  console.log('USERS:', JSON.stringify(users, null, 2));

  const courses = await prisma.course.findMany({
    select: { id: true, slug: true, title: true, price: true, discountPrice: true, status: true, instructorId: true },
  });
  console.log('COURSES IN DB count:', courses.length);
  console.log('COURSES:', JSON.stringify(courses, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
