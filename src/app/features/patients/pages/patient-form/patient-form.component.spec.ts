import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { PatientFormComponent } from './patient-form.component';
import { PatientService } from '../../../../core/services/patient.service';

describe('PatientFormComponent', () => {
  let component: PatientFormComponent;
  let fixture: ComponentFixture<PatientFormComponent>;
  let patientServiceSpy: jasmine.SpyObj<PatientService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    patientServiceSpy = jasmine.createSpyObj('PatientService', [
      'getPatientById',
      'createPatient',
      'updatePatient'
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      declarations: [PatientFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: PatientService, useValue: patientServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } }
        }
      ]
    })
      .overrideComponent(PatientFormComponent, {
        set: {
          template: `<form [formGroup]="form"></form>`
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(PatientFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.isEdit).toBeFalse();
  });

  it('should mark form as invalid when required fields are empty', () => {
    component.form.patchValue({
      documentType: '',
      documentNumber: '',
      firstName: '',
      lastName: '',
      birthDate: null
    });

    expect(component.form.invalid).toBeTrue();
    component.submit();
    expect(patientServiceSpy.createPatient).not.toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalled();
  });

  it('should create patient when form is valid', () => {
    patientServiceSpy.createPatient.and.returnValue(
      of({
        patientId: 1,
        documentType: 'CC',
        documentNumber: '123',
        firstName: 'Ana',
        lastName: 'Lopez',
        birthDate: '1995-05-05',
        createdAt: '2026-01-01T00:00:00Z'
      })
    );

    component.form.setValue({
      documentType: 'CC',
      documentNumber: '123',
      firstName: 'Ana',
      lastName: 'Lopez',
      birthDate: new Date(1995, 4, 5),
      phoneNumber: '',
      email: 'ana@test.com'
    });

    component.submit();

    expect(patientServiceSpy.createPatient).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/patients', 1]);
  });
});
