import { prisma } from "../config/prisma";

async function main() {
  // 1. Find an instructor
  let instructor = await prisma.user.findFirst({
    where: { role: "instructor" },
  });

  if (!instructor) {
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

  const courses = [
    {
      title: "Python for Data Science Bootcamp",
      subtitle:
        "Learn Python from zero and master data analysis with Pandas and NumPy.",
      description:
        "This course is designed for beginners who want to break into the field of data science. You will learn the fundamentals of Python and how to use it for data manipulation and visualization.",
      outcomes:
        "Python programming; Data Analysis; Data Visualization; NumPy and Pandas.",
      skills: ["Python", "Data Analysis", "Data Visualization", "Pandas"],
      durationMinutes: 360,
      category: "Data Science",
      difficulty: "Beginner",
      language: "English",
      price: 29.99,
      status: "Published",
      instructorId: instructor.id,
      thumbnail:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
    },
    {
      title: "Advanced UX/UI Design Principles",
      subtitle:
        "Master the art of creating beautiful and functional user interfaces.",
      description:
        "Dive deep into user experience research and user interface design. Create high-fidelity prototypes and learn how to conduct usability testing like a pro.",
      outcomes: "User Research; Prototyping; UI Design; Figma mastery.",
      skills: ["UI Design", "User Research", "Figma", "Prototyping"],
      durationMinutes: 420,
      category: "Design",
      difficulty: "Advanced",
      language: "English",
      price: 59.99,
      status: "Published",
      instructorId: instructor.id,
      thumbnail:
        "https://images.unsplash.com/photo-1586717791821-3f44a563dc4c?w=800&auto=format&fit=crop&q=60",
    },
    {
      title: "Machine Learning Fundamentals",
      subtitle:
        "Begin your AI journey with linear regression, classification, and clustering.",
      description:
        "Understand the core concepts of machine learning without overwhelming math. Practice with real-world datasets and build your first AI models.",
      outcomes:
        "Machine Learning basics; Scikit-Learn; Data Preprocessing; Model Evaluation.",
      skills: ["Machine Learning", "Scikit-Learn", "Data Preprocessing"],
      durationMinutes: 480,
      category: "Artificial Intelligence",
      difficulty: "Intermediate",
      language: "English",
      price: 39.99,
      status: "Published",
      instructorId: instructor.id,
      thumbnail:
        "https://images.unsplash.com/photo-1555255707-c07966488bc0?w=800&auto=format&fit=crop&q=60",
    },
    {
      title: "Modern Frontend with Next.js & Tailwind",
      subtitle:
        "Build blazing fast, SEO-friendly applications with the most popular React framework.",
      description:
        "Learn Server Components, App Router, and how to style your apps efficiently using Tailwind CSS. This course covers everything from basic routing to advanced server-side rendering.",
      outcomes:
        "Next.js App Router; Tailwind CSS; Server Actions; Full-stack React.",
      skills: ["React", "Next.js", "Tailwind CSS"],
      durationMinutes: 300,
      category: "Development",
      difficulty: "Intermediate",
      language: "English",
      price: 44.99,
      status: "Published",
      instructorId: instructor.id,
      thumbnail:
        "https://images.unsplash.com/photo-1622737133809-d95047b9e673?w=800&auto=format&fit=crop&q=60",
    },
  ];

  for (const courseData of courses) {
    const course = await prisma.course.create({
      data: courseData,
    });
    console.log(`Created: ${course.title}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
