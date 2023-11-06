import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CourseDetailLevelPageRoutingModule } from './course-detail-level-routing.module';

import { CourseDetailLevelPage } from './course-detail-level.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CourseDetailLevelPageRoutingModule,
    ComponentsModule
  ],
  declarations: [CourseDetailLevelPage]
})
export class CourseDetailLevelPageModule {}
