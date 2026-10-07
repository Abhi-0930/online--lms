import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const metaPath = path.join(__dirname, '../data/courses_meta.json');
  let metaData: Record<string, any> = {};
  if (fs.existsSync(metaPath)) {
    try {
      metaData = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    } catch (e) {
      console.error('Error reading meta file:', e);
    }
  }

  const courses = await prisma.course.findMany({
    include: { instructor: true }
  });

  console.log(`Found ${courses.length} courses in PostgreSQL.`);

  for (const c of courses) {
    let nameToSet: string | null = null;

    // Check meta by ID
    if (metaData[c.id]?.instructorName) {
      nameToSet = metaData[c.id].instructorName;
    } else if (metaData[c.slug]?.instructorName) {
      nameToSet = metaData[c.slug].instructorName;
    } else {
      // search meta values
      for (const val of Object.values(metaData)) {
        if (val && (val.id === c.id || val.slug === c.slug || val.title === c.title)) {
          if (val.instructorName) {
            nameToSet = val.instructorName;
            break;
          }
        }
      }
    }

    if (!nameToSet && c.instructor?.fullName && c.instructor.fullName !== 'Admin User') {
      nameToSet = c.instructor.fullName;
    }

    if (!nameToSet) {
      nameToSet = 'Abhishek'; // Default fallback instructor name if still not set
    }

    console.log(`Updating Course "${c.title}" (${c.id}) -> instructorName: "${nameToSet}"`);
    await prisma.$executeRawUnsafe(
      `UPDATE "Course" SET "instructorName" = $1 WHERE "id" = $2`,
      nameToSet,
      c.id
    );
  }

  console.log('All courses updated successfully with instructorName in PostgreSQL.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
