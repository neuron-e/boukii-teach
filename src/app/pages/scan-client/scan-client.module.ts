import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ScanClientPageRoutingModule } from './scan-client-routing.module';

import { ScanClientPage } from './scan-client.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ScanClientPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ScanClientPage]
})
export class ScanClientPageModule {}
