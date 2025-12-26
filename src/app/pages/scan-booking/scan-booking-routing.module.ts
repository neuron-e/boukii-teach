import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScanBookingPage } from './scan-booking.page';

const routes: Routes = [
  {
    path: '',
    component: ScanBookingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScanBookingPageRoutingModule {}
