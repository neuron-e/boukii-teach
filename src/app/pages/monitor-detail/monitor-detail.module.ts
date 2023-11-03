import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MonitorDetailPageRoutingModule } from './monitor-detail-routing.module';

import { MonitorDetailPage } from './monitor-detail.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MonitorDetailPageRoutingModule,
    ComponentsModule
  ],
  declarations: [MonitorDetailPage]
})
export class MonitorDetailPageModule {}
