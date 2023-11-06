import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CourseTransferPageRoutingModule } from './course-transfer-routing.module';

import { CourseTransferPage } from './course-transfer.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CourseTransferPageRoutingModule,
    ComponentsModule
  ],
  declarations: [CourseTransferPage]
})
export class CourseTransferPageModule {}
