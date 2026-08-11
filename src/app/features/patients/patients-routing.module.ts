import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientListComponent } from './pages/patient-list/patient-list.component';
import { PatientFormComponent } from './pages/patient-form/patient-form.component';
import { PatientDetailComponent } from './pages/patient-detail/patient-detail.component';

const routes: Routes = [
  { path: '', component: PatientListComponent },
  { path: 'new', component: PatientFormComponent },
  { path: ':id/edit', component: PatientFormComponent },
  { path: ':id', component: PatientDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientsRoutingModule {}
