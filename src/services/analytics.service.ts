import { prisma } from "../config/prisma";
import type {
  AdminAnalytics,
  InstructorAnalytics,
  TimeseriesData,
  InstructorInsights,
} from "../types/analytics.types";

export const getAdminAnalytics = async (): Promise<AdminAnalytics> => {
  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalReviews,
    totalCertificates,
    recentSignups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.review.count(),
    prisma.certificate.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  const paidEnrollments = await prisma.enrollment.findMany({
    include: { course: { select: { price: true } } },
  });

  const totalRevenue = paidEnrollments.reduce(
    (acc, curr) => acc + (curr.course.price || 0),
    0,
  );

  return {
    overview: {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalReviews,
      totalCertificates,
      totalRevenue,
    },
    recentSignups,
  };
};

export const getAdminTimeseries = async (): Promise<{
  timeseries: TimeseriesData[];
}> => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 29);
  start.setHours(0, 0, 0, 0);

  const dayMap = new Map<string, TimeseriesData>();
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
    dayMap.set(key, { date: key, enrollments: 0, revenue: 0 });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { createdAt: { gte: start } },
    include: { course: { select: { price: true } } },
  });

  for (const e of enrollments) {
    const d = new Date(e.createdAt);
    const key = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
    const entry = dayMap.get(key);
    if (entry) {
      entry.enrollments += 1;
      entry.revenue += e.course?.price || 0;
    }
  }

  return {
    timeseries: Array.from(dayMap.values()),
  };
};

export const getInstructorAnalytics = async (
  instructorId: string,
): Promise<InstructorAnalytics> => {
  const [totalCourses, publishedCoursesCount, draftCoursesCount] =
    await Promise.all([
      prisma.course.count({ where: { instructorId } }),
      prisma.course.count({
        where: {
          instructorId,
          status: { in: ["Published", "published", "PUBLISHED"] },
        },
      }),
      prisma.course.count({
        where: {
          instructorId,
          status: { in: ["Draft", "draft", "DRAFT"] },
        },
      }),
    ]);

  const courses = await prisma.course.findMany({
    where: { instructorId },
    select: { id: true, title: true, price: true, status: true },
  });

  const courseIds = courses.map((c) => c.id);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalEnrollments,
    totalReviews,
    enrollmentsByCourse,
    reviews,
    certificatesByCourse,
    monthlyEnrollments,
    lastMonthEnrollments,
  ] = await Promise.all([
    prisma.enrollment.count({ where: { courseId: { in: courseIds } } }),
    prisma.review.count({ where: { courseId: { in: courseIds } } }),
    prisma.enrollment.groupBy({
      by: ["courseId"],
      where: { courseId: { in: courseIds } },
      _count: true,
    }),
    prisma.review.findMany({
      where: { courseId: { in: courseIds } },
      select: { rating: true },
    }),
    prisma.certificate.groupBy({
      by: ["courseId"],
      where: { courseId: { in: courseIds } },
      _count: true,
    }),
    prisma.enrollment.findMany({
      where: {
        courseId: { in: courseIds },
        createdAt: { gte: monthStart, lt: nextMonthStart },
      },
      include: { course: { select: { price: true } } },
    }),
    prisma.enrollment.findMany({
      where: {
        courseId: { in: courseIds },
        createdAt: { gte: lastMonthStart, lt: monthStart },
      },
      include: { course: { select: { price: true } } },
    }),
  ]);

  const revenue = courses.reduce((acc, course) => {
    const enrollment = enrollmentsByCourse.find(
      (e) => e.courseId === course.id,
    );
    const count = enrollment?._count || 0;
    return acc + course.price * count;
  }, 0);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;
  const monthlyStudentsCount = monthlyEnrollments.length;
  const monthlyRevenue = monthlyEnrollments.reduce(
    (acc, e) => acc + (e.course?.price || 0),
    0,
  );
  const lastMonthRevenue = lastMonthEnrollments.reduce(
    (acc, e) => acc + (e.course?.price || 0),
    0,
  );
  const monthlyRevenueChangePct =
    lastMonthRevenue > 0
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : null;

  return {
    overview: {
      totalCourses,
      publishedCoursesCount,
      draftCoursesCount,
      totalStudents: totalEnrollments,
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalRevenue: revenue,
      monthlyStudentsCount,
      monthlyRevenue,
      lastMonthRevenue,
      monthlyRevenueChangePct:
        typeof monthlyRevenueChangePct === "number"
          ? parseFloat(monthlyRevenueChangePct.toFixed(1))
          : null,
    },
    courses: courses.map((c) => {
      const enrollment = enrollmentsByCourse.find((e) => e.courseId === c.id);
      const certificates = certificatesByCourse.find(
        (e) => e.courseId === c.id,
      );
      return {
        ...c,
        students: enrollment?._count || 0,
        certificates: certificates?._count || 0,
      };
    }),
  };
};

const formatDayKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getInstructorTimeseries = async (
  instructorId: string,
): Promise<{
  timeseries: (TimeseriesData | undefined)[];
  insights: InstructorInsights;
}> => {
  const courses = await prisma.course.findMany({
    where: { instructorId },
    select: { id: true, title: true, price: true },
  });
  const courseIds = courses.map((c) => c.id);

  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 29);
  start.setHours(0, 0, 0, 0);

  const days: string[] = [];
  const dayMap = new Map<string, TimeseriesData>();
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = formatDayKey(d);
    days.push(key);
    dayMap.set(key, { date: key, enrollments: 0, revenue: 0 });
  }

  const [
    recentEnrollments,
    allEnrollmentsCount,
    completedEnrollmentsCount,
    reviews,
  ] = await Promise.all([
    prisma.enrollment.findMany({
      where: { courseId: { in: courseIds }, createdAt: { gte: start } },
      include: { course: { select: { price: true } } },
    }),
    prisma.enrollment.count({ where: { courseId: { in: courseIds } } }),
    prisma.enrollment.count({
      where: { courseId: { in: courseIds }, completed: true },
    }),
    prisma.review.findMany({
      where: { courseId: { in: courseIds } },
      select: { rating: true },
    }),
  ]);

  for (const e of recentEnrollments) {
    const key = formatDayKey(new Date(e.createdAt));
    const entry = dayMap.get(key);
    if (entry) {
      entry.enrollments += 1;
      entry.revenue += e.course?.price || 0;
    }
  }

  const enrollmentsByCourse = await prisma.enrollment.groupBy({
    by: ["courseId"],
    where: { courseId: { in: courseIds } },
    _count: true,
  });
  let topCourse: { id: string; title: string; students: number } | null = null;
  for (const course of courses) {
    const count =
      enrollmentsByCourse.find((e) => e.courseId === course.id)?._count || 0;
    if (!topCourse || count > topCourse.students) {
      topCourse = { id: course.id, title: course.title, students: count };
    }
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;
  const completionRate =
    allEnrollmentsCount > 0
      ? (completedEnrollmentsCount / allEnrollmentsCount) * 100
      : 0;

  return {
    timeseries: days.map((d) => dayMap.get(d)),
    insights: {
      topCourse,
      completionRate: parseFloat(completionRate.toFixed(1)),
      reviewsCount: reviews.length,
      averageRating: parseFloat(averageRating.toFixed(1)),
    },
  };
};
