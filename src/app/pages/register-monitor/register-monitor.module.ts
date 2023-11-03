import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterMonitorPageRoutingModule } from './register-monitor-routing.module';

import { RegisterMonitorPage } from './register-monitor.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegisterMonitorPageRoutingModule,
    ComponentsModule
  ],
  declarations: [RegisterMonitorPage]
})
export class RegisterMonitorPageModule {}
