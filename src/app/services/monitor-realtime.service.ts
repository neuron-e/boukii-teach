import { Injectable, NgZone } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { BehaviorSubject } from 'rxjs';
import { Client as BeamsClient } from '@pusher/push-notifications-web';
import { PushNotifications, PushNotificationSchema } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Router } from '@angular/router';
import { TeachService } from './teach.service';
import { NotificationService } from './notification.service';
import { environment } from '../../environments/environment';

export interface MonitorNotification {
  type: string;
  monitor_id: number;
  payload: any;
}

@Injectable({
  providedIn: 'root'
})
export class MonitorRealtimeService {
  private echo: Echo<any> | null = null;
  private channel: any = null;
  private currentMonitorId: number | null = null;
  private nativeBeamsClient: any = null;
  private eventsSubject = new BehaviorSubject<MonitorNotification | null>(null);
  private pushListenersRegistered = false;
  private registeredPushToken: string | null = null;
  private registeredMonitorId: number | null = null;

  public events$ = this.eventsSubject.asObservable();

  constructor(
    private toastController: ToastController,
    private platform: Platform,
    private teachService: TeachService,
    private router: Router,
    private ngZone: NgZone,
    private notificationService: NotificationService
  ) {}

  connect(monitorId: number): void {
    if (!monitorId) {
      console.warn('[MonitorRealtimeService] monitorId missing, skipping connect');
      return;
    }
    if (this.currentMonitorId === monitorId && this.channel) {
      return;
    }
    if (!this.isEnabled()) {
      console.warn('[MonitorRealtimeService] wsConfig disabled or incomplete. Enable in environment.');
      return;
    }

    console.log('[MonitorRealtimeService] connecting', { monitorId });
    this.disconnect();
    this.currentMonitorId = monitorId;
    this.registerPushNotifications(monitorId);
    this.echo = this.createEcho();
    this.channel = this.echo?.private(`monitor.${monitorId}`);

    if (!this.channel) {
      console.warn('[MonitorRealtimeService] Could not subscribe to monitor channel');
      return;
    }

    this.channel.listen('.monitor.assigned', (event: MonitorNotification) => {
      console.log('[MonitorRealtimeService] monitor.assigned', event);
      this.handleEvent(event);
    });

    this.channel.listen('.monitor.removed', (event: MonitorNotification) => {
      console.log('[MonitorRealtimeService] monitor.removed', event);
      this.handleEvent(event);
    });

    this.channel.error((error: any) => {
      console.error('[MonitorRealtimeService] Channel error', error);
    });
  }

  disconnect(): void {
    this.unregisterPushNotifications();
    if (this.channel && this.currentMonitorId && this.echo) {
      this.echo.leave(`monitor.${this.currentMonitorId}`);
    }
    this.channel = null;
    this.echo = null;
    this.currentMonitorId = null;
  }

  private handleEvent(event: MonitorNotification): void {
    this.eventsSubject.next(event);
    const notification = (event as any)?.notification;
    if (notification?.body) {
      const message = notification?.title ? `${notification.title}: ${notification.body}` : notification.body;
      this.presentToast(message);
      this.updateUnreadCountFromIncoming(event);
      return;
    }
    const bookingLabel = event?.payload?.booking_id ?? event?.payload?.course_date_id ?? '';
    const message = event?.type?.includes('removed')
      ? `Fuiste desasignado de la reserva ${bookingLabel}`
      : `Nueva asignacion en la reserva ${bookingLabel}`;
    this.presentToast(message);
    this.updateUnreadCountFromIncoming(event);
  }

  private isEnabled(): boolean {
    const cfg: any = (environment as any).wsConfig || {};
    return cfg.key && cfg.enabled !== false;
  }

  private createEcho(): Echo<any> {
    const cfg: any = (environment as any).wsConfig || {};
    (window as any).Pusher = Pusher;
    const token = this.getAuthToken();
    const apiUrl = (environment as any).apiUrl || '';
    const baseUrl = apiUrl.replace(/\/api$/, '');
    const authEndpoint = cfg.authEndpoint || `${baseUrl}/broadcasting/auth`;

    const resolvedHost = cfg.wsHost || null; // only if explicitly provided
    const resolvedPort = cfg.wsPort ?? cfg.port ?? null;
    const resolvedWssPort = cfg.wssPort ?? cfg.wsPort ?? cfg.port ?? resolvedPort;

    console.log('[MonitorRealtimeService] authEndpoint', authEndpoint);
    console.log('[MonitorRealtimeService] ws config', {
      wsHost: resolvedHost,
      wsPort: resolvedPort,
      wssPort: resolvedWssPort,
      forceTLS: cfg.forceTLS ?? false,
      enabledTransports: cfg.enabledTransports || ['ws'],
    });
    const echoOptions: any = {
      broadcaster: 'pusher',
      key: cfg.key,
      cluster: cfg.cluster,
      forceTLS: cfg.forceTLS ?? false,
      disableStats: cfg.disableStats ?? true,
      enabledTransports: cfg.enabledTransports || ['ws', 'wss'],
      encrypted: cfg.forceTLS ?? false,
      authEndpoint,
      auth: {
        headers: token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : { Accept: 'application/json' },
      },
    };

    // Only set host/ports if explicitly provided; otherwise let Pusher cluster handle it.
    if (resolvedHost) {
      echoOptions.wsHost = resolvedHost;
    }
    if (resolvedPort) {
      echoOptions.wsPort = resolvedPort;
    }
    if (resolvedWssPort) {
      echoOptions.wssPort = resolvedWssPort;
    }

    return new Echo(echoOptions);
  }


  private async presentToast(message: string): Promise<void> {
    try {
      const toast = await this.toastController.create({
        message,
        duration: 4000,
        position: 'top',
      });
      await toast.present();
    } catch (error) {
      console.warn('[MonitorRealtimeService] Toast failed', error);
    }
  }

  private getAuthToken(): string | null {
    const raw = localStorage.getItem('token');
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === 'string' ? parsed : parsed?.token ?? null;
    } catch (e) {
      return raw;
    }
  }

  private registerPushNotifications(monitorId: number | null): void {
    if (!monitorId) {
      return;
    }
    if (this.platform.is('capacitor') || this.platform.is('cordova')) {
      this.registerNativePushNotifications(monitorId);
      return;
    }

    const instanceId = (environment as any).beamsInstanceId;
    if (!instanceId) {
      console.warn('[MonitorRealtimeService] Beams instanceId not configured');
      return;
    }

    this.registerWebBeams(instanceId, monitorId);
  }

  private unregisterPushNotifications(): void {
    if (this.platform.is('capacitor') || this.platform.is('cordova')) {
      this.unregisterNativePushNotifications();
      return;
    }
    if (!this.currentMonitorId) {
      return;
    }
    if (this.nativeBeamsClient?.removeDeviceInterest) {
      this.nativeBeamsClient.removeDeviceInterest(`monitor.${this.currentMonitorId}`)
        .catch((err: any) => console.warn('[MonitorRealtimeService] Beams remove interest failed', err));
    }
  }

  private registerNativePushNotifications(monitorId: number): void {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    if (!this.pushListenersRegistered) {
      this.pushListenersRegistered = true;

      LocalNotifications.requestPermissions().catch(() => null);
      LocalNotifications.createChannel({
        id: 'foreground_notifications',
        name: 'Foreground notifications',
        importance: 4,
        visibility: 1,
      }).catch(() => null);

      PushNotifications.addListener('registration', (token) => {
        this.fetchFcmToken(monitorId);
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.warn('[MonitorRealtimeService] Push registration error', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        const title = notification?.title ? `${notification.title}: ` : '';
        const body = notification?.body ?? '';
        if (body) {
          this.presentToast(`${title}${body}`);
          this.showForegroundNotification(notification?.title ?? 'Boukii', body, notification?.data);
        }
        this.updateUnreadCountFromIncoming(notification?.data || {});
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (event) => {
        const data = event?.notification?.data || {};
        this.handleNotificationNavigation(data);
      });

      FirebaseMessaging.addListener('tokenReceived', (event) => {
        this.savePushToken(event?.token, monitorId);
      });

      FirebaseMessaging.addListener('notificationReceived', (event: any) => {
        const title = event?.notification?.title ? `${event.notification.title}: ` : '';
        const body = event?.notification?.body ?? '';
        if (body) {
          this.presentToast(`${title}${body}`);
          this.showForegroundNotification(event?.notification?.title ?? 'Boukii', body, event?.notification?.data);
        }
        this.updateUnreadCountFromIncoming(event?.notification?.data || event?.data || {});
      });

      FirebaseMessaging.addListener('notificationActionPerformed', (event: any) => {
        const data = event?.notification?.data || {};
        this.handleNotificationNavigation(data);
      });

      LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
        const data = event?.notification?.extra || {};
        this.handleNotificationNavigation(data);
      });
    }

    PushNotifications.requestPermissions()
      .then((result) => {
        if (result.receive !== 'granted') {
          console.warn('[MonitorRealtimeService] Push permission not granted');
          return;
        }
        return PushNotifications.register();
      })
      .then(() => this.fetchFcmToken(monitorId))
      .catch((error) => {
        console.warn('[MonitorRealtimeService] Push registration failed', error);
      });

    const existingToken = localStorage.getItem('pushToken');
    if (existingToken) {
      this.savePushToken(existingToken, monitorId);
    }
  }

  private unregisterNativePushNotifications(): void {
    const token = localStorage.getItem('pushToken');
    if (token) {
      const encoded = encodeURIComponent(token);
      this.teachService.deleteData('teach/push-tokens', encoded).subscribe({
        error: (err) => console.warn('[MonitorRealtimeService] Push token removal failed', err),
      });
      localStorage.removeItem('pushToken');
    }
    FirebaseMessaging.deleteToken().catch(() => null);
    PushNotifications.removeAllListeners().catch(() => null);
    this.pushListenersRegistered = false;
    this.registeredPushToken = null;
    this.registeredMonitorId = null;
  }

  private async fetchFcmToken(monitorId: number): Promise<void> {
    try {
      const tokenResponse = await FirebaseMessaging.getToken();
      if (tokenResponse?.token) {
        this.savePushToken(tokenResponse.token, monitorId);
      }
    } catch (error) {
      console.warn('[MonitorRealtimeService] FCM token fetch failed', error);
    }
  }

  private savePushToken(token: string | undefined, monitorId: number): void {
    if (!token) {
      return;
    }
    if (token === this.registeredPushToken && monitorId === this.registeredMonitorId) {
      return;
    }

    this.registeredPushToken = token;
    this.registeredMonitorId = monitorId;
    localStorage.setItem('pushToken', token);

    const locale = localStorage.getItem('appLang') || 'fr';
    const payload = {
      token,
      monitor_id: monitorId,
      platform: Capacitor.getPlatform(),
      locale,
    };
    this.teachService.postData('teach/push-tokens', payload).subscribe({
      error: (err) => console.warn('[MonitorRealtimeService] Push token save failed', err),
    });
  }

  private handleNotificationNavigation(data: any): void {
    const payload = this.extractPayload(data);
    const date = payload?.date || data?.date;
    const targetDate = this.normalizeDateString(date) || new Date().toISOString().slice(0, 10);
    localStorage.setItem('calendarTargetDate', targetDate);

    if (!this.hasAuthSession()) {
      return;
    }

    const notificationId = data?.notification_id || payload?.notification_id;
    if (notificationId) {
      const parsedId = Number(notificationId);
      if (!Number.isNaN(parsedId)) {
        this.notificationService.markRead(parsedId).subscribe({
          next: () => this.notificationService.refreshUnreadCount(),
          error: () => null,
        });
      }
    }

    this.ngZone.run(() => {
      this.router.navigate(['calendar'], { queryParams: { date: targetDate } });
    });
  }

  private showForegroundNotification(title: string, body: string, data: any): void {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    const id = Math.floor(Date.now() % 2147483647);
    LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          extra: data || {},
          channelId: 'foreground_notifications',
        }
      ]
    }).catch(() => null);
  }

  private extractPayload(data: any): any {
    if (!data) {
      return null;
    }
    const raw = data.payload;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch (error) {
        return null;
      }
    }
    return raw;
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

  private updateUnreadCountFromIncoming(data: any): void {
    const payload = this.extractPayload(data);
    const notificationId = data?.notification_id || data?.notificationId || payload?.notification_id;
    if (notificationId) {
      this.notificationService.refreshUnreadCount();
      return;
    }
    this.notificationService.incrementUnreadCount(1);
  }

  private hasAuthSession(): boolean {
    const token = localStorage.getItem('token');
    const monitorId = localStorage.getItem('monitorId');
    return Boolean(token && monitorId);
  }

  private registerNativeBeams(instanceId: string, monitorId: number): void {
    const beams = (window as any).PusherPushNotifications;
    if (!beams?.Client) {
      console.warn('[MonitorRealtimeService] Native Beams plugin missing');
      return;
    }

    if (this.nativeBeamsClient) {
      if (this.currentMonitorId && this.currentMonitorId !== monitorId) {
        this.nativeBeamsClient.removeDeviceInterest?.(`monitor.${this.currentMonitorId}`);
      }
    } else {
      this.nativeBeamsClient = new beams.Client({ instanceId });
    }

    this.nativeBeamsClient
      .start()
      .then(() => this.nativeBeamsClient.addDeviceInterest(`monitor.${monitorId}`))
      .then(() => console.log('[MonitorRealtimeService] Native Beams subscribed to monitor.', monitorId))
      .catch((err: any) => console.error('[MonitorRealtimeService] Native Beams error', err));
  }

  private registerWebBeams(instanceId: string, monitorId: number): void {
    try {
      const beamsClient = new BeamsClient({
        instanceId,
      });
      beamsClient
        .start()
        .then(() => beamsClient.addDeviceInterest(`monitor.${monitorId}`))
        .then(() => console.log('[MonitorRealtimeService] Web Beams subscribed to monitor.', monitorId))
        .catch((err: any) => console.error('[MonitorRealtimeService] Web Beams error', err));
    } catch (error: any) {
      console.error('[MonitorRealtimeService] Beams init failed', error);
    }
  }
}
