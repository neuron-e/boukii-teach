import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MonitorDetailPage } from './monitor-detail.page';

const routes: Routes = [
  {
    path: '',
    component: MonitorDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MonitorDetailPageRoutingModule {}
