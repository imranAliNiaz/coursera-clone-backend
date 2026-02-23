import { prisma } from "../config/prisma";
import type { Prisma } from "@prisma/client";
import { assertNoEnrollments, verifyCourseOwnership } from "./course.service";
import type { CreateLessonData, UpdateLessonData } from "../types/course.types";

const validateAssessmentJSON = (content: string) => {
  try {
    const parsed = JSON.parse(content);
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Assessment must have a questions array");
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid assessment data: ${message}`);
  }
};

const getLessonCourseId = async (lessonId: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { select: { courseId: true } } },
  });
  if (!lesson) throw new Error("Lesson not found");
  return lesson.module.courseId;
};

export const createLesson = async (
  moduleId: string,
  data: CreateLessonData,
  userId: string | undefined,
  userRole: string | undefined,
) => {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true },
  });
  if (!module) throw new Error("Module not found");

  await verifyCourseOwnership(module.courseId, userId, userRole);
  await assertNoEnrollments(module.courseId);

  if (data.type === "ASSESSMENT" && data.content) {
    validateAssessmentJSON(data.content);
  }

  return await prisma.lesson.create({
    data: {
      title: data.title,
      order: data.order,
      moduleId,
      type: data.type || "VIDEO",
      description: data.description,
      content: data.content,
      videoUrl: data.videoUrl,
      duration: data.duration,
    },
  });
};

export const updateLesson = async (
  id: string,
  data: UpdateLessonData,
  userId: string | undefined,
  userRole: string | undefined,
) => {
  const courseId = await getLessonCourseId(id);
  await verifyCourseOwnership(courseId, userId, userRole);
  await assertNoEnrollments(courseId);

  const existingLesson = await prisma.lesson.findUnique({ where: { id } });
  if (!existingLesson) throw new Error("Lesson not found");

  const updateData: UpdateLessonData = { ...data };
  const type = data.type || existingLesson.type;

  if (type === "VIDEO") {
    if (data.type || existingLesson.type === "VIDEO") {
      updateData.content = null;
    }
  } else if (type === "READING") {
    updateData.videoUrl = null;
    updateData.duration = null;
  } else if (type === "ASSESSMENT") {
    updateData.videoUrl = null;
    updateData.duration = null;
    if (updateData.content) {
      validateAssessmentJSON(updateData.content);
    }
  }

  return await prisma.lesson.update({
    where: { id },
    data: updateData as Prisma.LessonUpdateInput,
  });
};

export const deleteLesson = async (
  id: string,
  userId: string | undefined,
  userRole: string | undefined,
) => {
  const courseId = await getLessonCourseId(id);
  await verifyCourseOwnership(courseId, userId, userRole);
  await assertNoEnrollments(courseId);

  return await prisma.lesson.delete({
    where: { id },
  });
};

export const reorderLessons = async (
  lessonOrders: { id: string; order: number }[],
  userId: string | undefined,
  userRole: string | undefined,
) => {
  if (lessonOrders.length === 0) return;

  const firstLessonId = lessonOrders[0].id;
  const courseId = await getLessonCourseId(firstLessonId);
  await verifyCourseOwnership(courseId, userId, userRole);
  await assertNoEnrollments(courseId);

  const updates = lessonOrders.map((item) =>
    prisma.lesson.update({
      where: { id: item.id },
      data: { order: item.order },
    }),
  );

  return await prisma.$transaction(updates);
};
