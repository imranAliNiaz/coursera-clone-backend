export interface AdminAnalytics {
  overview: {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalReviews: number;
    totalCertificates: number;
    totalRevenue: number;
  };
  recentSignups: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date | null;
  }[];
}

export interface TimeseriesData {
  date: string;
  enrollments: number;
  revenue: number;
}

export interface InstructorAnalytics {
  overview: {
    totalCourses: number;
    publishedCoursesCount: number;
    draftCoursesCount: number;
    totalStudents: number;
    totalReviews: number;
    averageRating: number;
    totalRevenue: number;
    monthlyStudentsCount: number;
    monthlyRevenue: number;
    lastMonthRevenue: number;
    monthlyRevenueChangePct: number | null;
  };
  courses: {
    id: string;
    title: string;
    price: number;
    status: string;
    students: number;
    certificates: number;
  }[];
}

export interface InstructorInsights {
  topCourse: {
    id: string;
    title: string;
    students: number;
  } | null;
  completionRate: number;
  reviewsCount: number;
  averageRating: number;
}
