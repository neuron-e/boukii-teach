import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Platform, AlertController } from '@ionic/angular';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppVersionService {
  // Current app version - update this with each release
  private readonly currentVersion = {
    android: '1.2.1',
    ios: '1.2.1',
    versionCode: 44
  };

  constructor(
    private http: HttpClient,
    private platform: Platform,
    private alertController: AlertController
  ) {}

  /**
   * Check if app needs to be updated
   * Makes a call to backend to get minimum required version
   */
  checkForUpdate(): Observable<boolean> {
    return this.http.get<any>(`${environment.apiUrl}/app-version`).pipe(
      map(response => {
        if (!response || !response.data) {
          return false;
        }

        const serverVersion = response.data;
        const currentPlatform = this.platform.is('android') ? 'android' : 'ios';

        if (currentPlatform === 'android') {
          const requiredVersionCode = serverVersion.android_version_code || 0;
          return this.currentVersion.versionCode < requiredVersionCode;
        } else {
          const requiredVersion = serverVersion.ios_version || '0.0.0';
          return this.compareVersions(this.currentVersion.ios, requiredVersion) < 0;
        }
      }),
      catchError(error => {
        console.error('Error checking app version:', error);
        return of(false); // Don't block user if version check fails
      })
    );
  }

  /**
   * Show update alert to user
   * @param isForced - If true, user cannot dismiss the alert
   */
  async showUpdateAlert(isForced: boolean = false): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Actualización disponible',
      message: isForced
        ? 'Hay una nueva versión disponible. Por favor, actualiza la aplicación para continuar.'
        : 'Hay una nueva versión disponible. ¿Deseas actualizar ahora?',
      backdropDismiss: !isForced,
      buttons: [
        ...(!isForced ? [{
          text: 'Más tarde',
          role: 'cancel'
        }] : []),
        {
          text: 'Actualizar',
          handler: () => {
            this.openStore();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Open app store for update
   */
  private openStore(): void {
    if (this.platform.is('android')) {
      window.open('https://play.google.com/store/apps/details?id=com.quental.boukii.boukii', '_system');
    } else if (this.platform.is('ios')) {
      // Replace with your actual App Store ID
      window.open('https://apps.apple.com/app/idYOUR_APP_ID', '_system');
    }
  }

  /**
   * Compare two semantic versions
   * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  private compareVersions(v1: string, v2: string): number {
    const v1parts = v1.split('.').map(Number);
    const v2parts = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;

      if (v1part > v2part) return 1;
      if (v1part < v2part) return -1;
    }

    return 0;
  }

  /**
   * Get current app version
   */
  getCurrentVersion(): string {
    return this.platform.is('android')
      ? this.currentVersion.android
      : this.currentVersion.ios;
  }
}
