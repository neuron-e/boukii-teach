import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StationsListPageRoutingModule } from './stations-list-routing.module';

import { StationsListPage } from './stations-list.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StationsListPageRoutingModule,
    ComponentsModule
  ],
  declarations: [StationsListPage]
})
export class StationsListPageModule {}
