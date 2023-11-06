import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CourseDetailLevelUpdatePageRoutingModule } from './course-detail-level-update-routing.module';

import { CourseDetailLevelUpdatePage } from './course-detail-level-update.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CourseDetailLevelUpdatePageRoutingModule,
    ComponentsModule
  ],
  declarations: [CourseDetailLevelUpdatePage]
})
export class CourseDetailLevelUpdatePageModule {}
