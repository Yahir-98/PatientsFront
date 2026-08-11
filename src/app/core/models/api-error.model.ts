export interface ApiError {
  message: string;
  details?: string[] | null;
  status?: number;
}
