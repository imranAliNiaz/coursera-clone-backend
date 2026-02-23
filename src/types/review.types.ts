export interface CreateReviewData {
  userId: string;
  courseId: string;
  rating: number;
  comment?: string;
}

export interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
}
