import { prisma } from "../config/prisma";
import { assertNoEnrollments, verifyCourseOwnership } from "./course.service";

export interface ModuleOrderUpdate {
  id: string;
  order: number;
}

export const getCourseModules = async (courseId: string) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) throw new Error("Course not found");
  return course.modules;
};

export const createModule = async (
  courseId: string,
  title: string,
  order: number,
  userId: string,
  userRole: string,
) => {
  await verifyCourseOwnership(courseId, userId, userRole);
  await assertNoEnrollments(courseId);

  return await prisma.module.create({
    data: {
      title,
      order,
      courseId,
    },
  });
};

export const updateModule = async (
  id: string,
  title: string,
  userId: string,
  userRole: string,
) => {
  const module = await prisma.module.findUnique({ where: { id } });
  if (!module) throw new Error("Module not found");

  await verifyCourseOwnership(module.courseId, userId, userRole);
  await assertNoEnrollments(module.courseId);

  return await prisma.module.update({
    where: { id },
    data: { title },
  });
};

export const deleteModule = async (
  id: string,
  userId: string,
  userRole: string,
) => {
  const module = await prisma.module.findUnique({ where: { id } });
  if (!module) throw new Error("Module not found");

  await verifyCourseOwnership(module.courseId, userId, userRole);
  await assertNoEnrollments(module.courseId);

  return await prisma.module.delete({
    where: { id },
  });
};

export const reorderModules = async (
  courseId: string,
  moduleOrders: ModuleOrderUpdate[],
  userId: string,
  userRole: string,
) => {
  await verifyCourseOwnership(courseId, userId, userRole);
  await assertNoEnrollments(courseId);

  const updates = moduleOrders.map((item) =>
    prisma.module.update({
      where: { id: item.id },
      data: { order: item.order },
    }),
  );
  return await prisma.$transaction(updates);
};
