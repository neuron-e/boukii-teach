import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TeachService } from './teach.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  private unreadCountValue = 0;

  constructor(private teachService: TeachService) {}

  refreshUnreadCount(): void {
    const monitorId = this.getMonitorId();
    const params = monitorId ? { monitor_id: monitorId } : undefined;
    this.teachService.getData<any>('teach/notifications/unread-count', null, params).subscribe({
      next: (response) => {
        const count = Number(response?.data?.count ?? 0);
        const safeCount = Number.isNaN(count) ? 0 : count;
        this.unreadCountValue = safeCount;
        this.unreadCountSubject.next(safeCount);
      },
      error: () => {
        // keep last known count on error
      }
    });
  }

  markRead(id: number): Observable<any> {
    const monitorId = this.getMonitorId();
    const payload = monitorId ? { monitor_id: monitorId } : {};
    return this.teachService.postData(`teach/notifications/${id}/read`, payload);
  }

  markAllRead(): Observable<any> {
    const monitorId = this.getMonitorId();
    const payload = monitorId ? { monitor_id: monitorId } : {};
    return this.teachService.postData('teach/notifications/read-all', payload);
  }

  setUnreadCount(count: number): void {
    const safeCount = Number.isNaN(Number(count)) ? 0 : Number(count);
    const normalized = Math.max(0, safeCount);
    this.unreadCountValue = normalized;
    this.unreadCountSubject.next(normalized);
  }

  incrementUnreadCount(step: number = 1): void {
    const next = Math.max(0, this.unreadCountValue + step);
    this.unreadCountValue = next;
    this.unreadCountSubject.next(next);
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
