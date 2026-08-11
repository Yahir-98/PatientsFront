import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Appointment, Patient } from '../../../../core/models/patient.model';
import { PatientService } from '../../../../core/services/patient.service';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss']
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  appointments: Appointment[] = [];
  loading = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly patientService: PatientService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/patients']);
      return;
    }

    this.loadPatient(id);
  }

  edit(): void {
    if (!this.patient) {
      return;
    }
    this.router.navigate(['/patients', this.patient.patientId, 'edit']);
  }

  back(): void {
    this.router.navigate(['/patients']);
  }

  confirmDelete(): void {
    if (!this.patient) {
      return;
    }

    this.confirmationService.confirm({
      message: `¿Seguro que deseas eliminar a ${this.patient.firstName} ${this.patient.lastName}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deletePatient()
    });
  }

  private loadPatient(id: number): void {
    this.loading = true;
    this.patientService.getPatientById(id).subscribe({
      next: (patient) => {
        this.patient = patient;
        this.appointments = patient.appointments ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/patients']);
      }
    });
  }

  private deletePatient(): void {
    if (!this.patient) {
      return;
    }

    this.loading = true;
    this.patientService.deletePatient(this.patient.patientId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'El paciente fue eliminado correctamente.'
        });
        this.router.navigate(['/patients']);
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
