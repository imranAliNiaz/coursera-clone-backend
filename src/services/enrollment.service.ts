import { prisma } from "../config/prisma";
import type { Prisma } from "@prisma/client";
import { issueCertificateForEnrollment } from "./certificate.service";
import { createNotification } from "./notification.service";
import type {
  UpdateLessonProgressData,
  EnrollmentStatus,
  StudentCourseProgress,
} from "../types/enrollment.types";

export const enrollUser = async (userId: string, courseId: string) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new Error("Course not found");

  if (course.status !== "Published")
    throw new Error("Course is not available for enrollment");

  const existingEnrollment = await prisma.enrollment.findFirst({
    where: { userId, courseId },
  });

  if (existingEnrollment)
    throw new Error("User already enrolled in this course");

  const enrollment = await prisma.enrollment.create({
    data: {
      userId,
      courseId,
      progress: 0,
      completed: false,
    },
    include: {
      course: {
        select: {
          title: true,
          thumbnail: true,
          instructor: { select: { name: true } },
        },
      },
    },
  });

  try {
    await createNotification({
      userId,
      type: "ENROLLMENT",
      title: `You enrolled in ${enrollment.course.title}`,
      message:
        "Start learning today and complete the course to earn your certificate.",
      link: `/learn/${courseId}`,
      imageUrl: enrollment.course.thumbnail || undefined,
      meta: { courseId },
    });
  } catch (err) {
    console.error("[NOTIFY] Failed to create enrollment notification:", err);
  }

  return enrollment;
};

export const getUserEnrollments = async (userId: string) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          thumbnail: true,
          description: true,
          difficulty: true,
          category: true,
          instructor: { select: { id: true, name: true } },
          modules: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
                select: { id: true, title: true, type: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const courseIds = enrollments.map((e) => e.course.id);
  const reviews = await prisma.review.findMany({
    where: { userId, courseId: { in: courseIds } },
    select: { courseId: true, rating: true },
  });

  const certificates = await prisma.certificate.findMany({
    where: { userId, courseId: { in: courseIds } },
    select: {
      id: true,
      courseId: true,
      imageUrl: true,
      verificationCode: true,
    },
  });

  const reviewedByCourseId = new Map(
    reviews.map((r) => [r.courseId, r.rating]),
  );

  const certByCourseId = new Map(certificates.map((c) => [c.courseId, c]));

  return enrollments.map((enrollment) => ({
    ...enrollment,
    hasReviewed: reviewedByCourseId.has(enrollment.course.id),
    myRating: reviewedByCourseId.get(enrollment.course.id) ?? null,
    certificate: certByCourseId.get(enrollment.course.id) ?? null,
  }));
};

export const updateProgress = async (
  enrollmentId: string,
  userId: string,
  progress: number,
  completed: boolean,
) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
  });

  if (!enrollment) throw new Error("Enrollment not found");

  if (enrollment.userId !== userId) {
    throw new Error("Not authorized to update this enrollment");
  }

  const updatedEnrollment = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      progress,
      completed,
    },
  });

  return updatedEnrollment;
};

export const getCourseEnrollments = async (
  courseId: string,
  instructorId: string,
  userRole: string,
) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });

  if (!course) throw new Error("Course not found");

  if (
    userRole.toLowerCase() !== "admin" &&
    course.instructorId !== instructorId
  ) {
    throw new Error("Not authorized to view enrollments for this course");
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments;
};

export const getEnrollmentStatus = async (
  userId: string,
  courseId: string,
): Promise<EnrollmentStatus> => {
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, courseId },
    select: { id: true },
  });

  return {
    isEnrolled: !!enrollment,
    enrollmentId: enrollment?.id || null,
  };
};

export const getStudentCourseProgress = async (
  userId: string,
  courseId: string,
): Promise<StudentCourseProgress | null> => {
  const [enrollment, modules] = await Promise.all([
    prisma.enrollment.findFirst({
      where: { userId, courseId },
      include: {
        lessonProgress: {
          select: { lessonId: true, completed: true, lastPlayed: true },
        },
      },
    }),
    prisma.module.findMany({
      where: { courseId },
      include: {
        lessons: {
          select: { id: true },
        },
      },
      orderBy: { order: "asc" },
    }),
  ]);

  if (!enrollment) return null;

  const completedLessonIds = new Set(
    enrollment.lessonProgress.filter((p) => p.completed).map((p) => p.lessonId),
  );

  const moduleProgress = modules.map((module) => {
    const lessonIds = module.lessons.map((l) => l.id);
    const completedLessons = lessonIds.filter((id) =>
      completedLessonIds.has(id),
    ).length;
    const completed =
      lessonIds.length > 0 && completedLessons === lessonIds.length;
    return {
      moduleId: module.id,
      totalLessons: lessonIds.length,
      completedLessons,
      completed,
    };
  });

  return {
    enrollmentId: enrollment.id,
    progress: enrollment.progress,
    completed: enrollment.completed,
    lessonProgress: enrollment.lessonProgress,
    moduleProgress,
  };
};

export const updateLessonProgress = async (
  userId: string,
  enrollmentId: string,
  lessonId: string,
  data: UpdateLessonProgressData,
) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
  });

  if (!enrollment) throw new Error("Enrollment not found");
  if (enrollment.userId !== userId) throw new Error("Unauthorized");

  const {
    completed: requestedCompleted,
    lastPlayed,
    passed,
    forceComplete,
    score,
    videoDuration,
  } = data;

  const [lesson, existingProgress] = await Promise.all([
    prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { type: true, duration: true },
    }),
    prisma.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: { enrollmentId, lessonId },
      },
      select: { lastPlayed: true, completed: true, passed: true, score: true },
    }),
  ]);

  let completed = requestedCompleted;
  let resolvedPassed = passed;
  let resolvedScore = score;
  const alreadyCompleted = existingProgress?.completed === true;
  const alreadyPassed = existingProgress?.passed === true;
  const existingScore = existingProgress?.score ?? null;

  if (lesson?.type === "ASSESSMENT") {
    if (alreadyPassed) {
      completed = true;
      resolvedPassed = true;
      if (typeof score === "number") {
        if (existingScore === null || score > existingScore) {
          resolvedScore = score;
        } else {
          resolvedScore = undefined;
        }
      } else {
        resolvedScore = undefined;
      }
    } else {
      if (!passed) {
        completed = false;
      } else {
        completed = true;
      }
    }
  }

  if (lesson?.type === "VIDEO") {
    if (alreadyCompleted) {
      completed = true;
    } else if (completed && !forceComplete) {
      const duration = lesson.duration ?? videoDuration ?? 0;
      const resolvedLastPlayed =
        typeof lastPlayed === "number"
          ? lastPlayed
          : (existingProgress?.lastPlayed ?? 0);
      const watchedEnough =
        duration > 0 && resolvedLastPlayed >= Math.floor(duration * 0.98);
      if (!watchedEnough) completed = false;
    }
  }

  const updateData: Prisma.LessonProgressUpdateInput = {};
  if (typeof lastPlayed === "number") updateData.lastPlayed = lastPlayed;
  if (typeof completed === "boolean") updateData.completed = completed;
  if (typeof resolvedPassed === "boolean") updateData.passed = resolvedPassed;
  if (typeof resolvedScore === "number") updateData.score = resolvedScore;

  const progress = await prisma.lessonProgress.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId,
        lessonId,
      },
    },
    update: updateData,
    create: {
      enrollmentId,
      lessonId,
      ...(typeof lastPlayed === "number" ? { lastPlayed } : {}),
      completed: typeof completed === "boolean" ? completed : false,
      ...(typeof resolvedPassed === "boolean"
        ? { passed: resolvedPassed }
        : {}),
      ...(typeof resolvedScore === "number" ? { score: resolvedScore } : {}),
    },
  });

  const [totalLessons, completedLessons, modules, completedProgress] =
    await Promise.all([
      prisma.lesson.count({
        where: { module: { courseId: enrollment.courseId } },
      }),
      prisma.lessonProgress.count({
        where: { enrollmentId, completed: true },
      }),
      prisma.module.findMany({
        where: { courseId: enrollment.courseId },
        include: {
          lessons: {
            select: { id: true },
          },
        },
      }),
      prisma.lessonProgress.findMany({
        where: { enrollmentId, completed: true },
        select: { lessonId: true },
      }),
    ]);

  const completedLessonIds = new Set(completedProgress.map((p) => p.lessonId));

  const totalModules = modules.length;
  const completedModules = modules.filter((module) => {
    if (!module.lessons || module.lessons.length === 0) return false;
    return module.lessons.every((lesson) => completedLessonIds.has(lesson.id));
  }).length;

  const newProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isCompleted = totalModules > 0 && completedModules === totalModules;

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      progress: newProgress,
      completed: isCompleted,
      ...(isCompleted && !enrollment.completed
        ? { completedAt: new Date() }
        : {}),
    },
  });

  if (isCompleted) {
    const existingCert = await prisma.certificate.findUnique({
      where: {
        userId_courseId: { userId, courseId: enrollment.courseId },
      },
    });

    if (!existingCert) {
      try {
        await createNotification({
          userId,
          type: "COURSE_COMPLETED",
          title: "Course completed",
          message:
            "Great work! Your course is complete. Your certificate will be generated shortly.",
          link: "/accomplishments",
          meta: { courseId: enrollment.courseId, enrollmentId },
        });
      } catch (err) {
        console.error(
          "[NOTIFY] Failed to create course completion notification:",
          err,
        );
      }
      await issueCertificateForEnrollment(enrollmentId);
    }
  }

  return progress;
};
