import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegisterMonitorPage } from './register-monitor.page';

const routes: Routes = [
  {
    path: '',
    component: RegisterMonitorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegisterMonitorPageRoutingModule {}
