export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  details?: string[] | null;
}

export interface Patient {
  patientId: number;
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phoneNumber?: string | null;
  email?: string | null;
  createdAt: string;
  appointments?: Appointment[];
}

export interface Appointment {
  appointmentId: number;
  patientId: number;
  appointmentDate: string;
  reason?: string | null;
  status?: string | null;
  notes?: string | null;
}

export interface CreatePatientRequest {
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phoneNumber?: string | null;
  email?: string | null;
}

export interface UpdatePatientRequest {
  documentType?: string;
  documentNumber?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  phoneNumber?: string | null;
  email?: string | null;
}

export interface PatientListParams {
  page?: number;
  pageSize?: number;
  name?: string;
  documentNumber?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
