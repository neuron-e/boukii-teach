import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientLevelPageRoutingModule } from './client-level-routing.module';

import { ClientLevelPage } from './client-level.page';
import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientLevelPageRoutingModule,
    ComponentsModule,
    TranslateModule
  ],
  declarations: [ClientLevelPage]
})
export class ClientLevelPageModule {}
