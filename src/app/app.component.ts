import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { MenuService } from './services/menu.service';
import { TranslateService } from '@ngx-translate/core';
import { AppVersionService } from './services/app-version.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  constructor(
    public menuService: MenuService,
    private translate: TranslateService,
    private platform: Platform,
    private appVersionService: AppVersionService
  ) {
    const savedLang = localStorage.getItem('appLang') || 'fr';
    translate.setDefaultLang(savedLang);
    translate.use(savedLang);
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      // Check for app updates only on mobile devices
      if (this.platform.is('cordova') || this.platform.is('capacitor')) {
        this.checkAppVersion();
      }
    });
  }

  private checkAppVersion() {
    this.appVersionService.checkForUpdate().subscribe(needsUpdate => {
      if (needsUpdate) {
        // Show forced update alert (user cannot dismiss)
        this.appVersionService.showUpdateAlert(true);
      }
    });
  }

}
