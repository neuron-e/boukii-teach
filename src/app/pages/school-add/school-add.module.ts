import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SchoolAddPageRoutingModule } from './school-add-routing.module';

import { SchoolAddPage } from './school-add.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SchoolAddPageRoutingModule
  ],
  declarations: [SchoolAddPage]
})
export class SchoolAddPageModule {}
