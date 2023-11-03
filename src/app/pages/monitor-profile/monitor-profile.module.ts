import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MonitorProfilePageRoutingModule } from './monitor-profile-routing.module';

import { MonitorProfilePage } from './monitor-profile.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MonitorProfilePageRoutingModule,
    ComponentsModule
  ],
  declarations: [MonitorProfilePage]
})
export class MonitorProfilePageModule {}
