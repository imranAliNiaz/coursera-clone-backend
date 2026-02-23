export interface CreateNotificationInput {
  userId: string;
  type: "ENROLLMENT" | "COURSE_COMPLETED" | "CERTIFICATE_READY" | "GENERAL";
  title: string;
  message: string;
  link: string;
  imageUrl?: string;
  meta?: Record<string, unknown>;
}
