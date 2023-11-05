import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SchoolAddPage } from './school-add.page';

const routes: Routes = [
  {
    path: '',
    component: SchoolAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SchoolAddPageRoutingModule {}
