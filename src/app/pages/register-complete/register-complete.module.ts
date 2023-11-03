import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterCompletePageRoutingModule } from './register-complete-routing.module';

import { RegisterCompletePage } from './register-complete.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegisterCompletePageRoutingModule
  ],
  declarations: [RegisterCompletePage]
})
export class RegisterCompletePageModule {}
