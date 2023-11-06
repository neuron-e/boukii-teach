import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalendarAvailablePage } from './calendar-available.page';

const routes: Routes = [
  {
    path: '',
    component: CalendarAvailablePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalendarAvailablePageRoutingModule {}
