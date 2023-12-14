import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeteoPageRoutingModule } from './meteo-routing.module';

import { MeteoPage } from './meteo.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeteoPageRoutingModule,
    TranslateModule
  ],
  declarations: [MeteoPage]
})
export class MeteoPageModule {}
