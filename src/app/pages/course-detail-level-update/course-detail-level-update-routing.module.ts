import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CourseDetailLevelUpdatePage } from './course-detail-level-update.page';

const routes: Routes = [
  {
    path: '',
    component: CourseDetailLevelUpdatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CourseDetailLevelUpdatePageRoutingModule {}
