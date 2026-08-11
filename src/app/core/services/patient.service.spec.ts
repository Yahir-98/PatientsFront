import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientService } from './patient.service';
import { environment } from '../../../environments/environment';
import { CreatePatientRequest, Patient } from '../models/patient.model';

describe('PatientService', () => {
  let service: PatientService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/patients`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PatientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should unwrap ApiResponse data for getPatients', () => {
    service.getPatients({ page: 2, pageSize: 5, name: 'Ana', documentNumber: '123' }).subscribe((result) => {
      expect(result.items.length).toBe(1);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(2);
      expect(result.hasNextPage).toBeFalse();
    });

    const req = httpMock.expectOne(
      (request) =>
        request.url === baseUrl &&
        request.params.get('name') === 'Ana' &&
        request.params.get('documentNumber') === '123' &&
        request.params.get('page') === '2' &&
        request.params.get('pageSize') === '5'
    );

    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      message: 'OK',
      data: {
        items: [{ patientId: 1, firstName: 'Ana' } as Patient],
        page: 2,
        pageSize: 5,
        totalCount: 1,
        totalPages: 1,
        hasPreviousPage: true,
        hasNextPage: false
      },
      details: []
    });
  });

  it('should unwrap ApiResponse data when creating a patient', () => {
    const payload: CreatePatientRequest = {
      documentType: 'CC',
      documentNumber: '1001',
      firstName: 'Luis',
      lastName: 'Pérez',
      birthDate: '1990-01-01'
    };

    service.createPatient(payload).subscribe((patient) => {
      expect(patient.patientId).toBe(10);
      expect(patient.firstName).toBe('Luis');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({
      success: true,
      message: 'Created',
      data: { ...payload, patientId: 10, createdAt: '2026-01-01T00:00:00Z' },
      details: []
    });
  });

  it('should call delete endpoint and complete', () => {
    service.deletePatient(7).subscribe((response) => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(`${baseUrl}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush({
      success: true,
      message: 'Deleted',
      data: null,
      details: []
    });
  });
});
