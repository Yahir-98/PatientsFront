import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ApiError } from '../../../../core/models/api-error.model';
import { PatientService } from '../../../../core/services/patient.service';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitting = false;
  isEdit = false;
  patientId: number | null = null;
  readonly today = new Date();

  readonly documentTypes = [
    { label: 'CC', value: 'CC' },
    { label: 'CE', value: 'CE' },
    { label: 'TI', value: 'TI' },
    { label: 'PA', value: 'PA' },
    { label: 'NIT', value: 'NIT' }
  ];

  get title(): string {
    return this.isEdit ? 'Editar paciente' : 'Nuevo paciente';
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly patientService: PatientService,
    private readonly messageService: MessageService
  ) {
    this.form = this.fb.group({
      documentType: ['CC', Validators.required],
      documentNumber: ['', [Validators.required, Validators.maxLength(20)]],
      firstName: ['', [Validators.required, Validators.maxLength(80)]],
      lastName: ['', [Validators.required, Validators.maxLength(80)]],
      birthDate: [null as Date | null, Validators.required],
      phoneNumber: ['', Validators.maxLength(20)],
      email: ['', [Validators.email, Validators.maxLength(120)]]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam && idParam !== 'new') {
      this.isEdit = true;
      this.patientId = Number(idParam);
      this.loadPatient(this.patientId);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Revisa los campos obligatorios e intenta de nuevo.'
      });
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      documentType: raw.documentType,
      documentNumber: raw.documentNumber.trim(),
      firstName: raw.firstName.trim(),
      lastName: raw.lastName.trim(),
      birthDate: this.toIsoDate(raw.birthDate),
      phoneNumber: raw.phoneNumber?.trim() || null,
      email: raw.email?.trim() || null
    };

    this.submitting = true;

    const request$ =
      this.isEdit && this.patientId
        ? this.patientService.updatePatient(this.patientId, payload)
        : this.patientService.createPatient(payload);

    request$.subscribe({
      next: (patient) => {
        this.submitting = false;
        this.messageService.add({
          severity: 'success',
          summary: this.isEdit ? 'Actualizado' : 'Creado',
          detail: this.isEdit
            ? 'El paciente se actualizó correctamente.'
            : 'El paciente se creó correctamente.'
        });
        this.router.navigate(['/patients', patient.patientId]);
      },
      error: (error: ApiError) => {
        this.submitting = false;
        this.applyDuplicateError(error);
      }
    });
  }

  cancel(): void {
    if (this.isEdit && this.patientId) {
      this.router.navigate(['/patients', this.patientId]);
      return;
    }

    this.router.navigate(['/patients']);
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private loadPatient(id: number): void {
    this.loading = true;
    this.patientService.getPatientById(id).subscribe({
      next: (patient) => {
        this.form.patchValue({
          documentType: patient.documentType,
          documentNumber: patient.documentNumber,
          firstName: patient.firstName,
          lastName: patient.lastName,
          birthDate: patient.birthDate ? new Date(patient.birthDate) : null,
          phoneNumber: patient.phoneNumber ?? '',
          email: patient.email ?? ''
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/patients']);
      }
    });
  }

  private applyDuplicateError(error: ApiError): void {
    const text = `${error.message} ${(error.details ?? []).join(' ')}`.toLowerCase();
    const isDuplicate =
      error.status === 409 ||
      text.includes('duplic') ||
      text.includes('document') ||
      text.includes('ya existe');

    if (isDuplicate) {
      this.form.get('documentNumber')?.setErrors({ duplicate: true });
      this.form.get('documentNumber')?.markAsTouched();
    }
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
