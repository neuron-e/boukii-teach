import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CourseGroupPage } from './course-group.page';

const routes: Routes = [
  {
    path: '',
    component: CourseGroupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CourseGroupPageRoutingModule {}
