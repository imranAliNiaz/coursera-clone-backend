export interface UpdateLessonProgressData {
  completed?: boolean;
  lastPlayed?: number;
  passed?: boolean;
  forceComplete?: boolean;
  score?: number;
  videoDuration?: number;
}

export interface EnrollmentStatus {
  isEnrolled: boolean;
  enrollmentId: string | null;
}

export interface ModuleProgress {
  moduleId: string;
  totalLessons: number;
  completedLessons: number;
  completed: boolean;
}

export interface StudentCourseProgress {
  enrollmentId: string;
  progress: number;
  completed: boolean;
  lessonProgress: {
    lessonId: string;
    completed: boolean;
    lastPlayed: number | null;
  }[];
  moduleProgress: ModuleProgress[];
}
