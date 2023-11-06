import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CourseDetailLevelPage } from './course-detail-level.page';

const routes: Routes = [
  {
    path: '',
    component: CourseDetailLevelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CourseDetailLevelPageRoutingModule {}
