import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewBookingPageRoutingModule } from './new-booking-routing.module';

import { NewBookingPage } from './new-booking.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewBookingPageRoutingModule,
    ComponentsModule
  ],
  declarations: [NewBookingPage]
})
export class NewBookingPageModule {}
