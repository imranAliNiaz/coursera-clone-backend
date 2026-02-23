export interface CreateCourseData {
  title: string;
  subtitle?: string;
  description: string;
  outcomes?: string;
  category?: string;
  difficulty?: string;
  language?: string;
  skills?: string[];
  durationMinutes?: number;
  thumbnail?: string;
  price?: number;
  status?: string;
  instructorId: string;
}

export interface UpdateCourseData {
  title?: string;
  subtitle?: string;
  description?: string;
  outcomes?: string;
  category?: string;
  difficulty?: string;
  language?: string;
  skills?: string[];
  durationMinutes?: number;
  thumbnail?: string;
  price?: number;
  status?: string;
}

export interface CourseFilters {
  category?: string | string[];
  difficulty?: string | string[];
  language?: string | string[];
  search?: string;
  status?: string;
  sortBy?: string;
  skills?: string[];
  durationMin?: number;
  durationMax?: number;
  durationBuckets?: string[];
  instructorId?: string | string[];
}

export interface CreateLessonData {
  title: string;
  order: number;
  type?: "VIDEO" | "READING" | "ASSESSMENT";
  description?: string | null;
  videoUrl?: string | null;
  content?: string | null;
  duration?: number | null;
}

export interface UpdateLessonData {
  title?: string;
  type?: "VIDEO" | "READING" | "ASSESSMENT";
  description?: string | null;
  videoUrl?: string | null;
  content?: string | null;
  duration?: number | null;
}

export interface AssessmentQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface AssessmentContent {
  title: string;
  questions: AssessmentQuestion[];
  passingScore: number;
  instructions?: string;
}
