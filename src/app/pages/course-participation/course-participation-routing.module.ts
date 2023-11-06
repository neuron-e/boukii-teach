import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CourseParticipationPage } from './course-participation.page';

const routes: Routes = [
  {
    path: '',
    component: CourseParticipationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CourseParticipationPageRoutingModule {}
