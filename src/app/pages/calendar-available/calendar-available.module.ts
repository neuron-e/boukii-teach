import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CalendarAvailablePageRoutingModule } from './calendar-available-routing.module';

import { CalendarAvailablePage } from './calendar-available.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarAvailablePageRoutingModule,
    TranslateModule
  ],
  declarations: [CalendarAvailablePage]
})
export class CalendarAvailablePageModule {}
