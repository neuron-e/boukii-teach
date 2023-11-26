import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { MonitorDataService } from '../services/monitor-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private monitorDataService: MonitorDataService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const token = localStorage.getItem('token');
      const monitorId = localStorage.getItem('monitorId');

      if (!token || !monitorId) {
        this.router.navigate(['/start']);
        return of(false);
      }

      return new Observable(observer => {
        this.monitorDataService.getMonitorData().subscribe(data => {
          if (!data && monitorId) {
            this.monitorDataService.fetchMonitorData(parseInt(monitorId)).add(() => {
              observer.next(true);
              observer.complete();
            });
          } else {
            observer.next(true);
            observer.complete();
          }
        });
      });
  }

}
