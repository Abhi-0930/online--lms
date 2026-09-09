import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create Admin User
  const adminPassword = await argon2.hash('Admin123!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lms.com' },
    update: {},
    create: {
      email: 'admin@lms.com',
      passwordHash: adminPassword,
      fullName: 'Admin User',
      role: 'ADMIN',
      isEmailVerified: true,
      maxDevices: 5,
    },
  });

  console.log('Created admin user:', admin.email);

  // Create Instructor User
  const instructorPassword = await argon2.hash('Instructor123!');
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@lms.com' },
    update: {},
    create: {
      email: 'instructor@lms.com',
      passwordHash: instructorPassword,
      fullName: 'John Instructor',
      role: 'INSTRUCTOR',
      isEmailVerified: true,
      maxDevices: 3,
    },
  });

  console.log('Created instructor user:', instructor.email);

  // Create Sample Course
  const course = await prisma.course.create({
    data: {
      slug: 'introduction-to-web-development',
      title: 'Introduction to Web Development',
      subtitle: 'Learn HTML, CSS, and JavaScript from scratch',
      description: 'A comprehensive beginner-friendly course covering the fundamentals of web development.',
      coverImageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
      price: 49.99,
      status: 'PUBLISHED',
      level: 'BEGINNER',
      instructorId: instructor.id,
      modules: {
        create: [
          {
            title: 'Getting Started',
            description: 'Introduction to the course and setup',
            position: 1,
            lessons: {
              create: [
                {
                  title: 'Course Overview',
                  slug: 'course-overview',
                  type: 'VIDEO',
                  content: 'Welcome to the course! In this lesson, we will cover what you will learn.',
                  videoUrl: 'https://example.com/video1',
                  durationSeconds: 300,
                  position: 1,
                },
                {
                  title: 'Setting Up Your Environment',
                  slug: 'setting-up-environment',
                  type: 'ARTICLE',
                  content: '# Setting Up Your Environment\n\nFollow these steps to set up your development environment...',
                  durationSeconds: 600,
                  position: 2,
                },
              ],
            },
          },
          {
            title: 'HTML Fundamentals',
            description: 'Learn the building blocks of web pages',
            position: 2,
            lessons: {
              create: [
                {
                  title: 'HTML Basics',
                  slug: 'html-basics',
                  type: 'VIDEO',
                  content: 'Learn about HTML tags, elements, and structure.',
                  videoUrl: 'https://example.com/video2',
                  durationSeconds: 900,
                  position: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Created course:', course.title);

  // Create Sample Roadmap
  const roadmap = await prisma.roadmap.create({
    data: {
      slug: 'full-stack-web-developer',
      title: 'Full-Stack Web Developer Roadmap',
      description: 'A complete path to becoming a full-stack web developer',
      iconUrl: 'https://example.com/icon.png',
      isPublished: true,
      items: {
        create: [
          {
            courseId: course.id,
            stepOrder: 1,
            isRequired: true,
          },
        ],
      },
    },
  });

  console.log('Created roadmap:', roadmap.title);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
