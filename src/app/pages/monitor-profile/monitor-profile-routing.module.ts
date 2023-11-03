import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MonitorProfilePage } from './monitor-profile.page';

const routes: Routes = [
  {
    path: '',
    component: MonitorProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MonitorProfilePageRoutingModule {}
