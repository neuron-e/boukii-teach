import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TeachService } from '../../services/teach.service';
import { NotificationService } from '../../services/notification.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  notifications: any[] = [];
  filteredNotifications: any[] = [];
  loading = false;
  showUnreadOnly = false;
  selectedDate = '';

  constructor(
    private router: Router,
    private teachService: TeachService,
    private notificationService: NotificationService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  ionViewWillEnter() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.loading = true;
    const monitorId = this.getMonitorId();
    const params: any = { perPage: 50 };
    if (monitorId) {
      params.monitor_id = monitorId;
    }
    this.teachService.getData<any>('teach/notifications', null, params).subscribe({
      next: (response) => {
        this.notifications = response?.data || [];
        this.applyFilters();
        if (this.notifications.length === 0) {
          this.notificationService.setUnreadCount(0);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilters() {
    const dateFilter = this.selectedDate;
    const unreadOnly = this.showUnreadOnly;
    this.filteredNotifications = this.notifications.filter((item) => {
      if (unreadOnly && item.read_at) {
        return false;
      }
      if (dateFilter) {
        const eventDate = item?.event_date || item?.payload?.date;
        return eventDate === dateFilter;
      }
      return true;
    });
  }

  toggleUnreadOnly() {
    this.showUnreadOnly = !this.showUnreadOnly;
    this.applyFilters();
  }

  onDateChange(event: Event) {
    const target = event.target as HTMLInputElement | null;
    this.selectedDate = target?.value || '';
    this.applyFilters();
  }

  clearDateFilter() {
    this.selectedDate = '';
    this.applyFilters();
  }

  markAllRead() {
    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map((item) => ({ ...item, read_at: new Date().toISOString() }));
        this.applyFilters();
        this.notificationService.refreshUnreadCount();
      }
    });
  }

  openNotification(item: any) {
    if (item?.id && !item.read_at) {
      this.notificationService.markRead(item.id).subscribe({
        next: () => {
          item.read_at = new Date().toISOString();
          this.notificationService.refreshUnreadCount();
        }
      });
    }
    const targetDate = this.normalizeDateString(item?.event_date || item?.payload?.date);
    if (targetDate) {
      localStorage.setItem('calendarTargetDate', targetDate);
      this.router.navigate(['calendar'], { queryParams: { date: targetDate } });
      return;
    }
    this.router.navigate(['calendar']);
  }

  formatDate(value: any): string {
    if (!value) {
      return '';
    }
    return moment(value).format('DD/MM/YYYY HH:mm');
  }

  getDisplayTitle(notification: any): string {
    const type = notification?.type;
    if (!type) {
      return notification?.title || '';
    }
    const params = this.getTranslationParams(notification);
    const key = `notification_types.${type}.title`;
    const resolved = this.translateInstant(key, params);
    return resolved || notification?.title || '';
  }

  getDisplayBody(notification: any): string {
    const type = notification?.type;
    if (!type) {
      return notification?.body || '';
    }
    const params = this.getTranslationParams(notification);
    if (this.requiresWhen(type) && !params['when']) {
      return notification?.body || '';
    }
    if (this.requiresBooking(type) && !params['booking']) {
      return notification?.body || '';
    }
    if (this.requiresNwdType(type) && !params['nwd_type']) {
      return notification?.body || '';
    }
    const key = `notification_types.${type}.body`;
    const resolved = this.translateInstant(key, params);
    return resolved || notification?.body || '';
  }

  private getTranslationParams(notification: any): { [key: string]: string } {
    const payload = notification?.payload || {};
    const when = this.formatWhen(payload);
    const booking = payload?.booking_id || payload?.course_date_id || '';
    const nwdType = this.resolveNwdTypeLabel(payload);
    return {
      when,
      booking: booking ? String(booking) : '',
      nwd_type: nwdType
    };
  }

  private formatWhen(payload: any): string {
    if (!payload) {
      return '';
    }
    const dateValue = this.normalizeDateString(payload?.date);
    const formattedDate = dateValue ? moment(dateValue, 'YYYY-MM-DD').format('DD/MM/YYYY') : '';
    const hourStart = payload?.hour_start || '';
    const hourEnd = payload?.hour_end || '';
    if (formattedDate && hourStart && hourEnd) {
      return `${formattedDate} ${hourStart}-${hourEnd}`;
    }
    return formattedDate || '';
  }

  private normalizeDateString(value: any): string {
    if (!value) {
      return '';
    }
    const raw = String(value);
    if (raw.includes('T') || raw.includes(' ')) {
      return raw.slice(0, 10);
    }
    return raw;
  }

  private translateInstant(key: string, params: { [key: string]: string }): string {
    const value = this.translate.instant(key, params);
    return value === key ? '' : value;
  }

  private requiresWhen(type: string): boolean {
    return ['booking_created', 'booking_updated', 'booking_cancelled', 'group_assigned', 'private_assigned', 'subgroup_changed'].includes(type);
  }

  private requiresBooking(type: string): boolean {
    return ['group_removed', 'private_removed'].includes(type);
  }

  private requiresNwdType(type: string): boolean {
    return ['nwd_created', 'nwd_updated', 'nwd_deleted'].includes(type);
  }

  private resolveNwdTypeLabel(payload: any): string {
    const subtype = Number(payload?.nwd_subtype_id ?? payload?.user_nwd_subtype_id ?? payload?.nwd_type_id);
    let key = 'notification_nwd_types.unpaid';
    if (subtype === 2) {
      key = 'notification_nwd_types.paid';
    } else if (!Number.isNaN(subtype) && subtype !== 1) {
      key = 'notification_nwd_types.absence';
    }
    const label = this.translateInstant(key, {});
    return label || '';
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

  private getMonitorId(): number | null {
    const raw = localStorage.getItem('monitorId');
    if (!raw) {
      return null;
    }
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? null : parsed;
  }

}
