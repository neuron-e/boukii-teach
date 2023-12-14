import { Component } from '@angular/core';
import { MenuService } from './services/menu.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(public menuService: MenuService, private translate: TranslateService) {
    const savedLang = localStorage.getItem('appLang') || 'fr';
    translate.setDefaultLang(savedLang);
    translate.use(savedLang);
  }

}
