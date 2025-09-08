import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { BarcodeScanner, BarcodeFormat, BarcodeScannedEvent } from '@capacitor-mlkit/barcode-scanning';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../services/spinner.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage {

  constructor(private router: Router, private menuService: MenuService, private toastr: ToastrService, private spinnerService: SpinnerService, private translate: TranslateService) {}

  ionViewDidEnter() {
    this.initializeScanner();
  }

  async initializeScanner() {
    try {
      //Permissions
      const permissions = await BarcodeScanner.checkPermissions();
      if (permissions.camera !== 'granted') {
        await BarcodeScanner.requestPermissions();
      }

      //Prepare scanner
      const wrapper = document.querySelector('.qr-scanner-wrapper');
      const wrapperFrame = document.querySelector('.qr-scanner-frame');
      const ionContent = document.querySelector('.ion-content-scan');
      const body = document.body;
      if (wrapper && ionContent && wrapperFrame) {
        wrapper.classList.add('barcode-scanner-active');
        ionContent.classList.add('ion-content-transparent');
        body.style.background = 'transparent';
        wrapperFrame.classList.remove('display-none');
        //console.log("Class 'barcode-scanner-active' added to the element");
      } else {
        console.error("qr-scanner-wrapper element not found");
      }
      // Start scanner
      BarcodeScanner.startScan({ formats: [BarcodeFormat.QrCode] });

      BarcodeScanner.addListener('barcodeScanned', async (event: BarcodeScannedEvent) => {
        const barcode = event.barcode;
        if (barcode) {
          this.spinnerService.show();
          setTimeout(() => {
            this.spinnerService.hide();
            this.toastr.success(this.translate.instant('toast.scanned_successfully'));
            this.router.navigate(['/scan-client', barcode.rawValue]);
          }, 1000);
        }
        await this.stopScanner();
      });
    } catch (error) {
      console.error('Error starting QR Code scanner:', error);
      this.toastr.error(this.translate.instant('toast.scan_error'));
      await this.stopScanner();
    }
  }

  async stopScanner() {
    const wrapper = document.querySelector('.qr-scanner-wrapper');
    const wrapperFrame = document.querySelector('.qr-scanner-frame');
    const ionContent = document.querySelector('.ion-content-scan');
    const body = document.body;

    if (wrapper && ionContent && wrapperFrame) {
      wrapper.classList.remove('barcode-scanner-active');
      ionContent.classList.remove('ion-content-transparent');
      body.style.removeProperty('background');
      wrapperFrame.classList.add('display-none');
      //console.log("Scanner stopped and styles reset");
    } else {
      console.error("qr-scanner-wrapper element not found");
    }

    await BarcodeScanner.stopScan();
    await BarcodeScanner.removeAllListeners();
  }

  ionViewWillLeave() {
    this.stopScanner();
  }

  toggleMenu() {
    this.menuService.toggleMenu();
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }
}
