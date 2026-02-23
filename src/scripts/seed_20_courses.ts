import { prisma } from "../config/prisma";

const INSTRUCTOR_ID = "697c56715acbe2d08c2bce50";

const courses = [
  {
    title: "React Foundations for Beginners",
    subtitle: "Build modern UIs with components and hooks",
    description:
      "This course introduces React from the ground up with clear, guided examples. You will build small UI components and learn how to compose them into complete screens. The course emphasizes practical patterns you can reuse in real projects.",
    outcomes:
      "You will build reusable React components and understand JSX. You will manage state and side effects using hooks. You will structure a basic React application with good UI practices.",
    category: "Development",
    difficulty: "Beginner",
    language: "English",
    skills: ["React", "JavaScript", "UI", "Hooks"],
    durationMinutes: 180,
    price: 19.99,
    status: "Published",
  },
  {
    title: "Advanced React Patterns",
    subtitle: "Context, performance, and architecture",
    description:
      "This course explores advanced patterns for building scalable React applications. You will learn how to organize large codebases and improve performance. Real-world examples show how to apply these patterns in production.",
    outcomes:
      "You will apply advanced component patterns to reduce duplication. You will optimize React performance using memoization and profiling. You will structure a scalable architecture for complex applications.",
    category: "Development",
    difficulty: "Advanced",
    language: "English",
    skills: ["React", "Performance", "Architecture"],
    durationMinutes: 360,
    price: 49.99,
    status: "Published",
  },
  {
    title: "Node.js APIs with Express",
    subtitle: "Build REST APIs with real-world patterns",
    description:
      "Learn how to build secure and maintainable REST APIs using Express. You will implement routing, middleware, and validation for real use cases. The course also covers error handling and API best practices.",
    outcomes:
      "You will design RESTful endpoints that follow common conventions. You will implement middleware and input validation correctly. You will build a complete API with authentication basics.",
    category: "Development",
    difficulty: "Intermediate",
    language: "English",
    skills: ["Node.js", "Express", "REST", "APIs"],
    durationMinutes: 240,
    price: 29.99,
    status: "Published",
  },
  {
    title: "TypeScript Essentials",
    subtitle: "Write safer JavaScript at scale",
    description:
      "This course teaches TypeScript fundamentals with practical examples. You will learn how types prevent bugs and improve developer confidence. The lessons focus on everyday patterns you can apply immediately.",
    outcomes:
      "You will use type annotations to catch errors earlier. You will create interfaces and generics for reusable code. You will configure TypeScript in a modern project.",
    category: "Development",
    difficulty: "Beginner",
    language: "English",
    skills: ["TypeScript", "JavaScript", "Tooling"],
    durationMinutes: 150,
    price: 0,
    status: "Published",
  },
  {
    title: "Next.js & Tailwind in Practice",
    subtitle: "Build fast, SEO-friendly React apps",
    description:
      "Learn how to build production-ready web apps using Next.js and Tailwind CSS. You will explore routing, layouts, and server rendering. The course includes practical UI implementation tips.",
    outcomes:
      "You will build pages with the Next.js App Router. You will style interfaces efficiently using Tailwind CSS. You will understand how server rendering improves performance and SEO.",
    category: "Development",
    difficulty: "Intermediate",
    language: "English",
    skills: ["Next.js", "Tailwind CSS", "React"],
    durationMinutes: 300,
    price: 39.99,
    status: "Published",
  },
  {
    title: "Python for Data Analysis",
    subtitle: "Analyze and visualize data with Pandas",
    description:
      "This course introduces Python for data analysis with hands-on datasets. You will clean, transform, and visualize data using practical workflows. The focus is on making insights that are easy to communicate.",
    outcomes:
      "You will clean and transform datasets using Pandas. You will create meaningful visualizations for analysis. You will interpret analysis results with confidence.",
    category: "Data Science",
    difficulty: "Beginner",
    language: "English",
    skills: ["Python", "Pandas", "Data Analysis"],
    durationMinutes: 240,
    price: 24.99,
    status: "Published",
  },
  {
    title: "Machine Learning Foundations",
    subtitle: "Build your first ML models",
    description:
      "Learn the fundamentals of machine learning with clear examples and minimal math. You will train and evaluate models using real datasets. The course emphasizes good modeling workflow and evaluation.",
    outcomes:
      "You will build supervised learning models with Scikit-Learn. You will evaluate models using appropriate metrics. You will prepare data for effective machine learning.",
    category: "Artificial Intelligence",
    difficulty: "Intermediate",
    language: "English",
    skills: ["Machine Learning", "Scikit-Learn", "Data Prep"],
    durationMinutes: 360,
    price: 34.99,
    status: "Published",
  },
  {
    title: "Deep Learning with PyTorch",
    subtitle: "Neural networks from the ground up",
    description:
      "This course dives into deep learning using PyTorch. You will build and train neural networks from scratch. Lessons include training loops, tuning, and evaluation strategies.",
    outcomes:
      "You will build neural networks using PyTorch modules. You will train models and track performance across epochs. You will evaluate deep learning models with confidence.",
    category: "Artificial Intelligence",
    difficulty: "Advanced",
    language: "English",
    skills: ["PyTorch", "Deep Learning", "Neural Networks"],
    durationMinutes: 540,
    price: 59.99,
    status: "Published",
  },
  {
    title: "Data Visualization with Tableau",
    subtitle: "Create dashboards and share insights",
    description:
      "Learn how to design dashboards that highlight key business insights. You will work with real data and practice best visualization principles. The course emphasizes clarity and impact.",
    outcomes:
      "You will build interactive dashboards in Tableau. You will apply data visualization best practices. You will communicate insights clearly to stakeholders.",
    category: "Data Science",
    difficulty: "Beginner",
    language: "English",
    skills: ["Tableau", "Dashboards", "Visualization"],
    durationMinutes: 120,
    price: 19.99,
    status: "Published",
  },
  {
    title: "UI Design with Figma",
    subtitle: "Design clean, modern interfaces",
    description:
      "This course teaches the core principles of interface design using Figma. You will build screens with consistent layouts and spacing. The focus is on clean visual hierarchy and reusable components.",
    outcomes:
      "You will design modern UI layouts with strong hierarchy. You will create reusable components in Figma. You will export design assets ready for development.",
    category: "Design",
    difficulty: "Beginner",
    language: "English",
    skills: ["Figma", "UI Design", "Prototyping"],
    durationMinutes: 180,
    price: 0,
    status: "Published",
  },
  {
    title: "UX Research Methods",
    subtitle: "Discover and validate user needs",
    description:
      "Learn practical research methods that inform product decisions. You will plan interviews, surveys, and usability tests. The course emphasizes turning research into actionable insights.",
    outcomes:
      "You will plan and conduct user interviews effectively. You will run usability tests and analyze results. You will synthesize research into clear product insights.",
    category: "Design",
    difficulty: "Intermediate",
    language: "English",
    skills: ["UX Research", "User Interviews", "Testing"],
    durationMinutes: 240,
    price: 29.99,
    status: "Published",
  },
  {
    title: "Business Analytics Essentials",
    subtitle: "Make data-driven business decisions",
    description:
      "This course introduces analytics skills for business professionals. You will learn how to define KPIs and interpret reports. Practical exercises show how to make better decisions with data.",
    outcomes:
      "You will define and track meaningful KPIs. You will interpret business reports and trends. You will apply analytics to real decision scenarios.",
    category: "Business",
    difficulty: "Beginner",
    language: "English",
    skills: ["Business Analytics", "KPIs", "Reporting"],
    durationMinutes: 150,
    price: 14.99,
    status: "Published",
  },
  {
    title: "Product Management Fundamentals",
    subtitle: "Build and launch successful products",
    description:
      "Learn the fundamentals of product management from idea to launch. You will explore roadmaps, prioritization, and stakeholder alignment. The course provides frameworks for real-world product work.",
    outcomes:
      "You will create product roadmaps that align with strategy. You will prioritize features using structured frameworks. You will communicate product decisions effectively.",
    category: "Business",
    difficulty: "Intermediate",
    language: "English",
    skills: ["Product Management", "Roadmaps", "Strategy"],
    durationMinutes: 240,
    price: 34.99,
    status: "Published",
  },
  {
    title: "AI for Everyone",
    subtitle: "Understand AI without heavy math",
    description:
      "This course explains AI concepts in simple, practical terms. You will explore real-world AI applications and ethical considerations. The goal is to help non-technical learners understand AI impact.",
    outcomes:
      "You will explain core AI concepts clearly. You will identify real-world AI use cases across industries. You will evaluate AI systems for ethical risks.",
    category: "Artificial Intelligence",
    difficulty: "Beginner",
    language: "English",
    skills: ["AI", "Ethics", "Use Cases"],
    durationMinutes: 60,
    price: 0,
    status: "Published",
  },
  {
    title: "Prompt Engineering Basics",
    subtitle: "Get better outputs from AI tools",
    description:
      "Learn how to structure prompts for consistent, useful results. You will practice iteration and evaluation techniques. The course focuses on practical use of modern AI tools.",
    outcomes:
      "You will write prompts that improve model output quality. You will evaluate and refine prompts systematically. You will apply prompting techniques to real tasks.",
    category: "Artificial Intelligence",
    difficulty: "Intermediate",
    language: "English",
    skills: ["Prompting", "LLMs", "AI Tools"],
    durationMinutes: 120,
    price: 19.99,
    status: "Published",
  },
  {
    title: "Database Design with Prisma & MongoDB",
    subtitle: "Model data for scalable apps",
    description:
      "This course teaches database modeling for modern web apps. You will design schemas with Prisma and apply best practices. The focus is on scalability and data integrity.",
    outcomes:
      "You will design scalable schemas for MongoDB. You will implement relationships using Prisma. You will validate and evolve schemas safely.",
    category: "Development",
    difficulty: "Intermediate",
    language: "English",
    skills: ["Prisma", "MongoDB", "Database Design"],
    durationMinutes: 210,
    price: 24.99,
    status: "Published",
  },
  {
    title: "Cybersecurity Foundations",
    subtitle: "Protect systems and data",
    description:
      "Learn essential cybersecurity concepts for modern applications. You will explore threat models, common vulnerabilities, and best practices. The course is designed for developers and tech teams.",
    outcomes:
      "You will identify common security threats and vulnerabilities. You will apply best practices for secure development. You will understand risk and mitigation strategies.",
    category: "Development",
    difficulty: "Beginner",
    language: "English",
    skills: ["Security", "Risk", "Best Practices"],
    durationMinutes: 180,
    price: 14.99,
    status: "Published",
  },
  {
    title: "Advanced Business Strategy",
    subtitle: "Competitive advantage and growth",
    description:
      "This course covers strategy frameworks and market analysis techniques. You will analyze case studies and develop growth plans. The focus is on real-world strategic decision-making.",
    outcomes:
      "You will apply strategy frameworks to business scenarios. You will analyze competition and market positioning. You will create structured growth plans.",
    category: "Business",
    difficulty: "Advanced",
    language: "English",
    skills: ["Strategy", "Analysis", "Leadership"],
    durationMinutes: 420,
    price: 59.99,
    status: "Published",
  },
  {
    title: "Data Engineering with Python",
    subtitle: "Pipelines, ETL, and data workflows",
    description:
      "Learn how to build reliable data pipelines with Python. You will explore ETL workflows and data quality techniques. The course emphasizes building maintainable systems.",
    outcomes:
      "You will build ETL pipelines using Python. You will ensure data quality with validation checks. You will schedule and monitor data workflows.",
    category: "Data Science",
    difficulty: "Intermediate",
    language: "English",
    skills: ["Python", "ETL", "Data Pipelines"],
    durationMinutes: 300,
    price: 39.99,
    status: "Published",
  },
  {
    title: "Design Systems for Teams",
    subtitle: "Scale UI consistency across products",
    description:
      "This course teaches how to build and maintain a design system. You will create reusable components and define visual guidelines. The focus is on collaboration between design and engineering.",
    outcomes:
      "You will define design tokens and reusable UI components. You will document visual guidelines for teams. You will manage consistent UI across multiple products.",
    category: "Design",
    difficulty: "Advanced",
    language: "English",
    skills: ["Design Systems", "UI", "Consistency"],
    durationMinutes: 360,
    price: 49.99,
    status: "Published",
  },
  {
    title: "SQL for Analysts",
    subtitle: "Query data for insights",
    description:
      "Learn SQL fundamentals with hands-on queries. You will practice filtering, joins, and aggregations. The course uses realistic datasets and analysis tasks.",
    outcomes:
      "You will write SQL queries with joins and aggregations. You will filter datasets to answer business questions. You will create reusable SQL scripts for analysis.",
    category: "Data Science",
    difficulty: "Beginner",
    language: "English",
    skills: ["SQL", "Data Analysis", "Queries"],
    durationMinutes: 150,
    price: 14.99,
    status: "Published",
  },
  {
    title: "Marketing Analytics for Growth",
    subtitle: "Measure performance and optimize campaigns",
    description:
      "This course covers analytics for marketing teams and growth leaders. You will explore attribution models and campaign measurement. Practical exercises focus on decision-making with data.",
    outcomes:
      "You will measure campaign performance using key metrics. You will apply attribution models to understand channel impact. You will optimize marketing decisions with analytics.",
    category: "Business",
    difficulty: "Intermediate",
    language: "English",
    skills: ["Marketing Analytics", "Attribution", "Growth"],
    durationMinutes: 210,
    price: 29.99,
    status: "Published",
  }
];

async function main() {
  const instructor = await prisma.user.findUnique({
    where: { id: INSTRUCTOR_ID },
    select: { id: true, name: true, role: true },
  });

  if (!instructor) {
    throw new Error(`Instructor not found: ${INSTRUCTOR_ID}`);
  }

  if (instructor.role !== "instructor") {
    throw new Error(
      `User ${INSTRUCTOR_ID} is not an instructor (role=${instructor.role})`,
    );
  }

  let created = 0;
  for (const course of courses) {
    const existing = await prisma.course.findFirst({
      where: { title: course.title, instructorId: INSTRUCTOR_ID },
      select: { id: true },
    });

    if (existing) {
      console.log(`Skipping existing: ${course.title}`);
      continue;
    }

    await prisma.course.create({
      data: {
        ...course,
        instructorId: INSTRUCTOR_ID,
      },
    });
    created += 1;
    console.log(`Created: ${course.title}`);
  }

  console.log(`Done. Created ${created} course(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
