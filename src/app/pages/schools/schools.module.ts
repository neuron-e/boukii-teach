import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SchoolsPageRoutingModule } from './schools-routing.module';

import { SchoolsPage } from './schools.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SchoolsPageRoutingModule,
    TranslateModule
  ],
  declarations: [SchoolsPage]
})
export class SchoolsPageModule {}
