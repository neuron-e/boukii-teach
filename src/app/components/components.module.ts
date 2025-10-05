import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LevelWheelComponent } from './level-wheel/level-wheel.component';
import { LevelUserComponent } from './level-user/level-user.component';
import { LevelFullComponent } from './level-full/level-full.component';
import { FooterComponent } from './footer/footer.component';
import { MenuComponent } from './menu/menu.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { FileViewComponent } from './file-view/file-view.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { SchoolSelectorComponent } from './school-selector/school-selector.component';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [LevelWheelComponent, LevelUserComponent, LevelFullComponent, FooterComponent, MenuComponent, FileUploadComponent, FileViewComponent, SpinnerComponent, SchoolSelectorComponent],
  imports: [
    CommonModule, FormsModule, IonicModule.forRoot(), TranslateModule
  ],
  exports: [LevelWheelComponent, LevelUserComponent, LevelFullComponent, FooterComponent, MenuComponent, FileUploadComponent, FileViewComponent, SpinnerComponent, SchoolSelectorComponent]
})
export class ComponentsModule { }
