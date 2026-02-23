import { prisma } from "../config/prisma";
import type { Prisma } from "@prisma/client";
import type {
  CreateCourseData,
  UpdateCourseData,
  CourseFilters,
} from "../types/course.types";

export const getAllCourses = async (
  page = 1,
  limit = 10,
  filters: CourseFilters = {},
) => {
  const skip = (page - 1) * limit;
  const where: Prisma.CourseWhereInput = {};

  const and: Prisma.CourseWhereInput[] = [];

  if (filters.status) {
    and.push({ status: filters.status });
  }

  if (filters.category) {
    if (Array.isArray(filters.category)) {
      and.push({ category: { in: filters.category } });
    } else {
      and.push({ category: filters.category });
    }
  }

  if (filters.difficulty) {
    if (Array.isArray(filters.difficulty)) {
      and.push({ difficulty: { in: filters.difficulty } });
    } else {
      and.push({ difficulty: filters.difficulty });
    }
  }

  if (filters.language) {
    if (Array.isArray(filters.language)) {
      and.push({ language: { in: filters.language } });
    } else {
      and.push({ language: filters.language });
    }
  }

  if (filters.instructorId) {
    if (Array.isArray(filters.instructorId)) {
      and.push({ instructorId: { in: filters.instructorId } });
    } else {
      and.push({ instructorId: filters.instructorId });
    }
  }

  if (filters.search) {
    and.push({
      OR: [
        { title: { contains: filters.search, mode: "insensitive" } },
        { subtitle: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ],
    });
  }

  if (filters.skills && filters.skills.length > 0) {
    and.push({ skills: { hasSome: filters.skills } });
  }

  if (filters.durationMin !== undefined || filters.durationMax !== undefined) {
    const durationFilter: Prisma.IntFilter = {};
    if (filters.durationMin !== undefined)
      durationFilter.gte = filters.durationMin;
    if (filters.durationMax !== undefined)
      durationFilter.lte = filters.durationMax;
    and.push({ durationMinutes: durationFilter });
  }

  if (filters.durationBuckets && filters.durationBuckets.length > 0) {
    const rawRanges = filters.durationBuckets.map((bucket) => {
      if (bucket === "short") return { durationMinutes: { lt: 120 } };
      if (bucket === "medium")
        return { durationMinutes: { gte: 120, lte: 600 } };
      if (bucket === "long") return { durationMinutes: { gte: 600 } };
      return null;
    });

    const ranges = rawRanges.filter((r) => r !== null);

    if (ranges.length > 0) {
      and.push({ OR: ranges as Prisma.CourseWhereInput[] });
    }
  }

  if (and.length > 0) {
    where.AND = and;
  }

  const orderBy: Prisma.CourseOrderByWithRelationInput = {};
  if (filters.sortBy) {
    const [field, direction] = filters.sortBy.split(":");
    if (field === "popularity") {
      orderBy.enrollments = {
        _count: (direction as Prisma.SortOrder) || "desc",
      };
    } else {
      (orderBy as Record<string, unknown>)[field] = direction || "asc";
    }
  } else {
    orderBy.createdAt = "desc";
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        instructor: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { enrollments: true, reviews: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return {
    courses: courses.map((c) => ({
      ...c,
      studentCount: c._count.enrollments,
      reviewCount: c._count.reviews,
    })),
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getCourseById = async (id: string) => {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          workExperiences: true,
          educations: true,
          profileCertificates: true,
        },
      },
      modules: {
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              type: true,
              duration: true,
              videoUrl: true,
              content: true,
              order: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { order: "asc" },
      },
      _count: { select: { enrollments: true, reviews: true } },
    },
  });

  if (!course) throw new Error("Course not found");

  return {
    ...course,
    studentCount: course._count.enrollments,
    reviewCount: course._count.reviews,
  };
};

export const createCourse = async (data: CreateCourseData) => {
  return await prisma.course.create({
    data,
  });
};

export const updateCourse = async (
  id: string,
  userId: string,
  userRole: string,
  data: UpdateCourseData,
) => {
  await verifyCourseOwnership(id, userId, userRole);
  return await prisma.course.update({
    where: { id },
    data,
  });
};

export const deleteCourse = async (
  id: string,
  userId: string,
  userRole: string,
) => {
  await verifyCourseOwnership(id, userId, userRole);
  await assertNoEnrollments(id);

  const modules = await prisma.module.findMany({ where: { courseId: id } });
  const moduleIds = modules.map((m) => m.id);

  await prisma.$transaction([
    prisma.lesson.deleteMany({ where: { moduleId: { in: moduleIds } } }),
    prisma.module.deleteMany({ where: { courseId: id } }),
    prisma.course.delete({ where: { id } }),
  ]);

  return { message: "Course deleted successfully" };
};

export const getInstructorCourses = async (instructorId: string) => {
  return await prisma.course.findMany({
    where: { instructorId },
    include: {
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getAdminCourses = async () => {
  return await prisma.course.findMany({
    include: {
      instructor: { select: { id: true, name: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateCourseThumbnail = async (
  id: string,
  thumbnailUrl: string,
) => {
  return await prisma.course.update({
    where: { id },
    data: { thumbnail: thumbnailUrl },
  });
};

export const getRecommendedCourses = async () => {
  return await prisma.course.findMany({
    where: { status: "Published" },
    take: 6,
    orderBy: { enrollments: { _count: "desc" } },
    include: {
      instructor: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
};

export const trackCourseView = async (userId: string, courseId: string) => {
  await prisma.recentView.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: { viewedAt: new Date() },
    create: { userId, courseId },
  });
};

export const getRecentlyViewedCourses = async (userId: string) => {
  const views = await prisma.recentView.findMany({
    where: { userId },
    take: 10,
    orderBy: { viewedAt: "desc" },
    include: {
      course: {
        include: {
          instructor: { select: { id: true, name: true } },
        },
      },
    },
  });

  return views.map((v) => v.course);
};

export const verifyCourseOwnership = async (
  courseId: string,
  userId: string | undefined,
  userRole: string | undefined,
) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });

  if (!course) throw new Error("Course not found");

  if (userRole?.toLowerCase() !== "admin" && course.instructorId !== userId) {
    throw new Error("Not authorized to perform this action");
  }
};

export const assertNoEnrollments = async (courseId: string) => {
  const count = await prisma.enrollment.count({ where: { courseId } });
  if (count > 0) {
    throw new Error(`Cannot modify or delete course with ${count} enrollments`);
  }
};
