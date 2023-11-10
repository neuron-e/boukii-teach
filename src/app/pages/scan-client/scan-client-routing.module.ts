import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ScanClientPage } from './scan-client.page';

const routes: Routes = [
  {
    path: '',
    component: ScanClientPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScanClientPageRoutingModule {}
