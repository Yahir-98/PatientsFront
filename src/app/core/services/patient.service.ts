import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CreatePatientRequest,
  PagedResult,
  Patient,
  PatientListParams,
  UpdatePatientRequest
} from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly baseUrl = `${environment.apiUrl}/patients`;

  constructor(private readonly http: HttpClient) {}

  getPatients(params: PatientListParams = {}): Observable<PagedResult<Patient>> {
    const httpParams = new HttpParams()
      .set('name', params.name?.trim() ?? '')
      .set('documentNumber', params.documentNumber?.trim() ?? '')
      .set('page', String(params.page ?? 1))
      .set('pageSize', String(params.pageSize ?? 10));

    return this.http
      .get<ApiResponse<PagedResult<Patient>>>(this.baseUrl, { params: httpParams })
      .pipe(map((response) => response.data));
  }

  getPatientById(id: number): Observable<Patient> {
    return this.http
      .get<ApiResponse<Patient>>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  createPatient(payload: CreatePatientRequest): Observable<Patient> {
    return this.http
      .post<ApiResponse<Patient>>(this.baseUrl, payload)
      .pipe(map((response) => response.data));
  }

  updatePatient(id: number, payload: UpdatePatientRequest): Observable<Patient> {
    return this.http
      .put<ApiResponse<Patient>>(`${this.baseUrl}/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  deletePatient(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.baseUrl}/${id}`)
      .pipe(map(() => undefined));
  }

  getPatientsCreatedAfter(date: string): Observable<Patient[]> {
    const params = new HttpParams().set('date', date);
    return this.http
      .get<ApiResponse<Patient[] | PagedResult<Patient>>>(`${this.baseUrl}/created-after`, {
        params
      })
      .pipe(
        map((response) => {
          const data = response.data;
          return Array.isArray(data) ? data : data?.items ?? [];
        })
      );
  }
}
