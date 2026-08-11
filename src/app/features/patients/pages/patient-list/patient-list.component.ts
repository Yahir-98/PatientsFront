import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Patient } from '../../../../core/models/patient.model';
import { PatientService } from '../../../../core/services/patient.service';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  totalRecords = 0;
  loading = false;
  page = 1;
  pageSize = 10;

  filterForm: FormGroup;
  exportVisible = false;
  exportDate: Date | null = null;
  exporting = false;
  readonly today = new Date();

  constructor(
    private readonly fb: FormBuilder,
    private readonly patientService: PatientService,
    private readonly router: Router,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService
  ) {
    this.filterForm = this.fb.group({
      name: [''],
      documentNumber: ['']
    });
  }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    const { name, documentNumber } = this.filterForm.value;

    this.patientService
      .getPatients({
        page: this.page,
        pageSize: this.pageSize,
        name: name || undefined,
        documentNumber: documentNumber || undefined
      })
      .subscribe({
        next: (result) => {
          this.patients = result.items;
          this.totalRecords = result.totalCount;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  onSearch(): void {
    this.page = 1;
    this.loadPatients();
  }

  onClearFilters(): void {
    this.filterForm.reset({ name: '', documentNumber: '' });
    this.page = 1;
    this.loadPatients();
  }

  onPageChange(event: { first?: number; rows?: number; page?: number }): void {
    this.pageSize = event.rows ?? 10;
    this.page = (event.page ?? 0) + 1;
    this.loadPatients();
  }

  viewPatient(patient: Patient): void {
    this.router.navigate(['/patients', patient.patientId]);
  }

  editPatient(patient: Patient): void {
    this.router.navigate(['/patients', patient.patientId, 'edit']);
  }

  createPatient(): void {
    this.router.navigate(['/patients/new']);
  }

  confirmDelete(patient: Patient): void {
    this.confirmationService.confirm({
      message: `¿Seguro que deseas eliminar a ${patient.firstName} ${patient.lastName}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deletePatient(patient.patientId)
    });
  }

  openExportDialog(): void {
    this.exportDate = null;
    this.exportVisible = true;
  }

  exportCsv(): void {
    if (!this.exportDate) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Fecha requerida',
        detail: 'Selecciona una fecha de creación para exportar.'
      });
      return;
    }

    this.exporting = true;
    const isoDate = this.toIsoDate(this.exportDate);

    this.patientService.getPatientsCreatedAfter(isoDate).subscribe({
      next: (patients) => {
        this.downloadCsv(patients);
        this.exporting = false;
        this.exportVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Exportación lista',
          detail: `Se exportaron ${patients.length} paciente(s).`
        });
      },
      error: () => {
        this.exporting = false;
      }
    });
  }

  fullDocument(patient: Patient): string {
    return `${patient.documentType} ${patient.documentNumber}`;
  }

  private deletePatient(id: number): void {
    this.loading = true;
    this.patientService.deletePatient(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'El paciente fue eliminado correctamente.'
        });
        this.loadPatients();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private downloadCsv(patients: Patient[]): void {
    const headers = [
      'PatientId',
      'DocumentType',
      'DocumentNumber',
      'FirstName',
      'LastName',
      'BirthDate',
      'PhoneNumber',
      'Email',
      'CreatedAt'
    ];

    const rows = patients.map((p) =>
      [
        p.patientId,
        p.documentType,
        p.documentNumber,
        p.firstName,
        p.lastName,
        p.birthDate,
        p.phoneNumber ?? '',
        p.email ?? '',
        p.createdAt
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pacientes-desde-${this.toIsoDate(this.exportDate!)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
