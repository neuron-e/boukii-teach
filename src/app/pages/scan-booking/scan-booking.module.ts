import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ScanBookingPageRoutingModule } from './scan-booking-routing.module';

import { ScanBookingPage } from './scan-booking.page';
import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ScanBookingPageRoutingModule,
    ComponentsModule,
    TranslateModule
  ],
  declarations: [ScanBookingPage]
})
export class ScanBookingPageModule {}
