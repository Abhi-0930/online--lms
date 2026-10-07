const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const moduleCount = await prisma.module.count();
  const lessonCount = await prisma.lesson.count();
  
  console.log('--- DATABASE STATS ---');
  console.log(`Total Modules in DB: ${moduleCount}`);
  console.log(`Total Lessons/Topics in DB: ${lessonCount}\n`);

  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      modules: {
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            select: {
              id: true,
              title: true,
              type: true,
              position: true,
            },
            orderBy: { position: 'asc' }
          }
        },
        orderBy: { position: 'asc' }
      }
    }
  });

  courses.forEach((c) => {
    console.log(`Course: "${c.title}" (ID: ${c.id})`);
    console.log(`  Modules count: ${c.modules.length}`);
    c.modules.forEach((m) => {
      console.log(`    [Module ${m.position}] ${m.title} (ID: ${m.id}) -> Lessons: ${m.lessons.length}`);
      m.lessons.slice(0, 3).forEach((l) => {
        console.log(`        - [${l.type}] ${l.title} (Pos: ${l.position}, ID: ${l.id})`);
      });
      if (m.lessons.length > 3) {
        console.log(`        ... and ${m.lessons.length - 3} more lessons`);
      }
    });
    console.log('');
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
