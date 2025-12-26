import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TeachService } from '../../services/teach.service';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../services/spinner.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Component({
  selector: 'app-scan-booking',
  templateUrl: './scan-booking.page.html',
  styleUrls: ['./scan-booking.page.scss'],
})
export class ScanBookingPage implements OnInit, OnDestroy {
  private subscription?: Subscription;
  token?: string;
  data: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teachService: TeachService,
    private toastr: ToastrService,
    private spinnerService: SpinnerService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.toastr.error(this.translate.instant('toast.no_client_found'));
        this.goTo('home');
        return;
      }
      this.loadBooking();
    });
  }

  loadBooking() {
    this.spinnerService.show();
    this.teachService.getData('teach/scan/booking', null, { token: this.token }).subscribe(
      (response: any) => {
        this.data = response.data ?? response;
        this.spinnerService.hide();
      },
      (error: any) => {
        console.error('Error resolving scan token:', error);
        this.spinnerService.hide();
        this.toastr.error(this.translate.instant('toast.no_client_found'));
        this.goTo('home');
      }
    );
  }

  formatTimeRange(hourStart?: string, hourEnd?: string) {
    if (!hourStart || !hourEnd) {
      return '';
    }
    return `${hourStart.substring(0, 5)}-${hourEnd.substring(0, 5)}`;
  }

  formatDate(date?: string) {
    if (!date) {
      return '';
    }
    const parsed = moment(date);
    return parsed.isValid() ? parsed.format('DD-MM-YYYY') : '';
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
