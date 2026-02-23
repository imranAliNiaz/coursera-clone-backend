export interface CloudinaryUploadResult {
  secure_url?: string;
  public_id?: string;
  duration?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
