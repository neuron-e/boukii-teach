import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StationPageRoutingModule } from './station-routing.module';

import { StationPage } from './station.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StationPageRoutingModule,
    ComponentsModule
  ],
  declarations: [StationPage]
})
export class StationPageModule {}
