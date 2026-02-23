export interface GoogleUserData {
  email: string;
  name: string;
  providerId: string;
  avatarUrl?: string;
}

export interface WorkExperienceInput {
  title: string;
  company: string;
  location?: string;
  employmentType?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface WorkExperience extends WorkExperienceInput {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EducationInput {
  instituteName: string;
  degreeDetails: string;
  startDate: string;
  endDate: string;
}

export interface Education extends EducationInput {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProfileCertificateInput {
  certificateName: string;
  completionDate: string;
}

export interface ProfileCertificate extends ProfileCertificateInput {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserAdminCreateInput {
  name: string;
  email: string;
  password?: string;
  role: string;
}
