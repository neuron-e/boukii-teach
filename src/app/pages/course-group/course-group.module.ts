import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CourseGroupPageRoutingModule } from './course-group-routing.module';

import { CourseGroupPage } from './course-group.page';
import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CourseGroupPageRoutingModule,
    ComponentsModule,
    TranslateModule
  ],
  declarations: [CourseGroupPage]
})
export class CourseGroupPageModule {}
