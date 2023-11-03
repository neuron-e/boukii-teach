import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LevelWheelComponent } from './level-wheel/level-wheel.component';
import { LevelUserComponent } from './level-user/level-user.component';
import { LevelFullComponent } from './level-full/level-full.component';
import { FooterComponent } from './footer/footer.component';
import { MenuComponent } from './menu/menu.component';


@NgModule({
  declarations: [LevelWheelComponent, LevelUserComponent, LevelFullComponent, FooterComponent, MenuComponent],
  imports: [
    CommonModule, IonicModule.forRoot()
  ],
  exports: [LevelWheelComponent, LevelUserComponent, LevelFullComponent, FooterComponent, MenuComponent]
})
export class ComponentsModule { }
