import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CourseParticipationPageRoutingModule } from './course-participation-routing.module';

import { CourseParticipationPage } from './course-participation.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CourseParticipationPageRoutingModule,
    ComponentsModule
  ],
  declarations: [CourseParticipationPage]
})
export class CourseParticipationPageModule {}
