import { prisma } from "../config/prisma";

async function main() {
  // 1. Find an instructor
  let instructor = await prisma.user.findFirst({
    where: { role: "instructor" },
  });

  if (!instructor) {
    console.log("No instructor found, creating one...");
    instructor = await prisma.user.create({
      data: {
        name: "Dr. Angela Yu",
        email: "instructor@example.com",
        role: "instructor",
        avatarUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      },
    });
  }

  console.log(`Using instructor: ${instructor.name} (${instructor.id})`);

  // 2. Create the mock course
  const courseData = {
    title: "Full-Stack React & Node.js Mastery",
    subtitle:
      "Build production-ready applications with React, TypeScript, and Express.",
    description:
      "In this comprehensive course, you will learn how to build modern web applications from scratch. We cover everything from database modeling with Prisma and MongoDB to frontend architecture with React and Redux.",
    outcomes:
      "Build real-world applications; Master TypeScript; Understand Backend API design; Deploy to production.",
    skills: ["React", "TypeScript", "Node.js", "Prisma"],
    durationMinutes: 600,
    category: "Development",
    difficulty: "Intermediate",
    language: "English",
    price: 49.99,
    status: "Published",
    instructorId: instructor.id,
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
  };

  const course = await prisma.course.create({
    data: courseData,
  });

  console.log(`Mock course created: ${course.title} (${course.id})`);

  // 3. Add some lessons/modules
  const module = await prisma.module.create({
    data: {
      title: "Module 1: Introduction to Full-Stack",
      order: 1,
      courseId: course.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: "1.1 Welcome to the course",
      content: "Introductory lesson about the roadmap.",
      order: 1,
      moduleId: module.id,
      videoUrl: "https://example.com/video1",
    },
  });

  console.log("Mock modules and lessons added.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
