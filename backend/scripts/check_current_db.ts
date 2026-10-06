import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      discountPrice: true,
      status: true,
      updatedAt: true,
    },
  });
  console.log('--- POSTGRES DB COURSES ---');
  console.log(JSON.stringify(courses, null, 2));
}

main().finally(() => prisma.$disconnect());
