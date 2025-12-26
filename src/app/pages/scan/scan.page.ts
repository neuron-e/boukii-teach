import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import {
  BarcodeScanner,
  BarcodeFormat,
  BarcodesScannedEvent,
  ScanErrorEvent,
} from '@capacitor-mlkit/barcode-scanning';
import type { PluginListenerHandle } from '@capacitor/core';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../services/spinner.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage implements OnDestroy {
  private scanSub?: PluginListenerHandle;
  private handling = false;

  constructor(
    private router: Router,
    private menuService: MenuService,
    private toastr: ToastrService,
    private spinnerService: SpinnerService,
    private translate: TranslateService
  ) {}

  async ionViewDidEnter() {
    // Pedir permisos primero
    const hasPermissions = await this.requestCameraPermissions();
    if (hasPermissions) {
      await this.initializeScanner();
    }
  }

  async requestCameraPermissions(): Promise<boolean> {
    try {
      console.log('Checking camera permissions...');
      const perm = await BarcodeScanner.checkPermissions();
      console.log('Camera permissions status:', perm);

      if (perm.camera !== 'granted') {
        console.log('Requesting camera permissions...');
        const req = await BarcodeScanner.requestPermissions();
        console.log('Permission request result:', req);

        if (req.camera !== 'granted') {
          this.toastr.error(this.translate.instant('toast.camera_permission_denied'));
          this.router.navigate(['/home']);
          return false;
        }
      }

      return true;
    } catch (error: any) {
      console.error('Error requesting camera permissions:', error);
      this.toastr.error(this.translate.instant('toast.camera_permission_denied'));
      this.router.navigate(['/home']);
      return false;
    }
  }

  async initializeScanner() {
    try {

      // Preparar UI
      const wrapper = document.querySelector('.qr-scanner-wrapper');
      const wrapperFrame = document.querySelector('.qr-scanner-frame');
      const ionContent = document.querySelector('.ion-content-scan');
      const body = document.body;

      if (wrapper && ionContent && wrapperFrame) {
        wrapper.classList.add('barcode-scanner-active');
        ionContent.classList.add('ion-content-transparent');
        body.style.background = 'transparent';
        wrapperFrame.classList.remove('display-none');
      } else {
        console.error('qr-scanner-wrapper element not found');
      }

      // Iniciar escáner
      await BarcodeScanner.startScan({ formats: [BarcodeFormat.QrCode] });

      // 👉 Listener correcto
      this.scanSub = await BarcodeScanner.addListener(
        'barcodesScanned',
        async (event: BarcodesScannedEvent) => {
          if (this.handling) return;
          const value = event.barcodes?.[0]?.rawValue;
          if (!value) return;

          this.handling = true;
          this.spinnerService.show();

          try {
            await this.stopScanner();          // cerrar cámara y UI
            await this.scanSub?.remove();      // evitar llamadas duplicadas
            this.toastr.success(this.translate.instant('toast.scanned_successfully'));
            this.router.navigate(['/scan-booking', value]);
          } finally {
            this.spinnerService.hide();
            this.handling = false;
          }
        }
      );

      // (opcional) errores del escaneo
      await BarcodeScanner.addListener('scanError', (e: ScanErrorEvent) => {
        this.toastr.error(e?.message ?? this.translate.instant('toast.scan_error'));
      });
    } catch (error: any) {
      console.error('Error starting QR Code scanner:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });

      // Si el error es de permisos, redirigir
      if (error?.message?.includes('permission') || error?.message?.includes('Permission')) {
        this.toastr.error(this.translate.instant('toast.camera_permission_denied'));
      } else {
        this.toastr.error(this.translate.instant('toast.scan_error'));
      }

      await this.stopScanner();
      this.router.navigate(['/home']);
    }
  }

  async stopScanner() {
    // Reset UI
    const wrapper = document.querySelector('.qr-scanner-wrapper');
    const wrapperFrame = document.querySelector('.qr-scanner-frame');
    const ionContent = document.querySelector('.ion-content-scan');
    const body = document.body;

    if (wrapper && ionContent && wrapperFrame) {
      wrapper.classList.remove('barcode-scanner-active');
      ionContent.classList.remove('ion-content-transparent');
      body.style.removeProperty('background');
      wrapperFrame.classList.add('display-none');
    }

    await BarcodeScanner.stopScan();
  }

  ionViewWillLeave() {
    this.stopScanner();
    this.scanSub?.remove();
  }

  ngOnDestroy() {
    this.scanSub?.remove();
  }

  toggleMenu() {
    this.menuService.toggleMenu();
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }
}
