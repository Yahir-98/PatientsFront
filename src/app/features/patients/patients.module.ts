import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService } from 'primeng/api';

import { PatientsRoutingModule } from './patients-routing.module';
import { PatientListComponent } from './pages/patient-list/patient-list.component';
import { PatientFormComponent } from './pages/patient-form/patient-form.component';
import { PatientDetailComponent } from './pages/patient-detail/patient-detail.component';

@NgModule({
  declarations: [
    PatientListComponent,
    PatientFormComponent,
    PatientDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PatientsRoutingModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    DialogModule,
    ConfirmDialogModule,
    TooltipModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  providers: [ConfirmationService]
})
export class PatientsModule {}
