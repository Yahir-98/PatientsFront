import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PatientListComponent } from './patient-list.component';
import { PatientService } from '../../../../core/services/patient.service';

describe('PatientListComponent', () => {
  let component: PatientListComponent;
  let fixture: ComponentFixture<PatientListComponent>;
  let patientServiceSpy: jasmine.SpyObj<PatientService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    patientServiceSpy = jasmine.createSpyObj('PatientService', [
      'getPatients',
      'deletePatient',
      'getPatientsCreatedAfter'
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    patientServiceSpy.getPatients.and.returnValue(
      of({
        items: [
          {
            patientId: 1,
            documentType: 'CC',
            documentNumber: '100',
            firstName: 'Ana',
            lastName: 'Lopez',
            birthDate: '1990-01-01',
            email: 'ana@test.com',
            phoneNumber: '300',
            createdAt: '2026-01-01T00:00:00Z'
          }
        ],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false
      })
    );

    await TestBed.configureTestingModule({
      declarations: [PatientListComponent],
      imports: [ReactiveFormsModule, FormsModule],
      providers: [
        { provide: PatientService, useValue: patientServiceSpy },
        { provide: Router, useValue: routerSpy },
        ConfirmationService,
        MessageService
      ]
    })
      .overrideComponent(PatientListComponent, {
        set: {
          template: `<form [formGroup]="filterForm"></form>`
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(PatientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load patients on init', () => {
    expect(component.patients.length).toBe(1);
    expect(component.totalRecords).toBe(1);
    expect(patientServiceSpy.getPatients).toHaveBeenCalled();
  });

  it('should navigate to create page', () => {
    component.createPatient();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/patients/new']);
  });

  it('should reset page and reload when searching', () => {
    component.page = 3;
    component.filterForm.patchValue({ name: 'Ana' });
    component.onSearch();

    expect(component.page).toBe(1);
    expect(patientServiceSpy.getPatients).toHaveBeenCalledWith(
      jasmine.objectContaining({ name: 'Ana', page: 1 })
    );
  });
});
