import { Injectable } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { BehaviorSubject } from 'rxjs';
import { Client as BeamsClient } from '@pusher/push-notifications-web';
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

  public events$ = this.eventsSubject.asObservable();

  constructor(private toastController: ToastController, private platform: Platform) {}

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
    const bookingLabel = event?.payload?.booking_id ?? event?.payload?.course_date_id ?? '';
    const message = event?.type?.includes('removed')
      ? `Fuiste desasignado de la reserva ${bookingLabel}`
      : `Nueva asignacion en la reserva ${bookingLabel}`;
    // TODO: replace with localized copy and richer UI / storage persistence.
    this.presentToast(message);
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
    const instanceId = (environment as any).beamsInstanceId;
    if (!instanceId) {
      console.warn('[MonitorRealtimeService] Beams instanceId not configured');
      return;
    }

    if (this.platform.is('capacitor') || this.platform.is('cordova')) {
      this.registerNativeBeams(instanceId, monitorId);
      return;
    }

    this.registerWebBeams(instanceId, monitorId);
  }

  private unregisterPushNotifications(): void {
    if (!this.currentMonitorId) {
      return;
    }
    if (this.nativeBeamsClient?.removeDeviceInterest) {
      this.nativeBeamsClient.removeDeviceInterest(`monitor.${this.currentMonitorId}`)
        .catch((err: any) => console.warn('[MonitorRealtimeService] Beams remove interest failed', err));
    }
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
