import { prisma } from "../config/prisma";
import type { CreateReviewData } from "../types/review.types";

export const createReview = async (data: CreateReviewData) => {
  const course = await prisma.course.findUnique({
    where: { id: data.courseId },
  });
  if (!course) throw new Error("Course not found");
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: data.userId, courseId: data.courseId },
  });

  if (!enrollment) {
    throw new Error("You must be enrolled in the course to leave a review");
  }

  const existingReview = await prisma.review.findFirst({
    where: { userId: data.userId, courseId: data.courseId },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this course");
  }

  if (data.rating < 1 || data.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const review = await prisma.review.create({
    data: {
      userId: data.userId,
      courseId: data.courseId,
      rating: data.rating,
      comment: data.comment,
    },
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  return review;
};

export const getCourseReviews = async (courseId: string) => {
  const reviews = await prisma.review.findMany({
    where: { courseId },
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: { id: "desc" },
  });

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  return {
    reviews,
    summary: {
      totalReviews: reviews.length,
      averageRating: parseFloat(averageRating.toFixed(1)),
    },
  };
};

export const deleteReview = async (
  reviewId: string,
  userId: string,
  userRole: string,
) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review) throw new Error("Review not found");

  if (userRole.toLowerCase() !== "admin" && review.userId !== userId) {
    throw new Error("Not authorized to delete this review");
  }

  await prisma.review.delete({ where: { id: reviewId } });

  return { message: "Review deleted successfully" };
};

export const getAllReviews = async () => {
  const reviews = await prisma.review.findMany({
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      course: {
        select: {
          id: true,
          title: true,
          instructor: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
};

export const getInstructorReviews = async (instructorId: string) => {
  const reviews = await prisma.review.findMany({
    where: {
      course: { instructorId },
    },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      course: {
        select: {
          id: true,
          title: true,
          instructor: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
};
