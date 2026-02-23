export interface CertificateGenerationParams {
  certificateNumber: string;
  verificationCode: string;
  learnerName: string;
  courseTitle: string;
  instructorName: string;
  completionDate: Date;
  grade?: number;
  durationHours?: number;
  durationMinutes?: number;
  partnerName?: string;
  issuedAt?: Date;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  duration?: number;
}
