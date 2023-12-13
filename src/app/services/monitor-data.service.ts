import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TeachService } from './teach.service';

@Injectable({
  providedIn: 'root'
})
export class MonitorDataService {
  private monitorDataSubject = new BehaviorSubject<any>(null);

  constructor(private teachService: TeachService) {}

  setMonitorData(data: any) {
    this.monitorDataSubject.next(data);
  }

  getMonitorData(): Observable<any> {
    return this.monitorDataSubject.asObservable();
  }

  fetchMonitorData(id: number) {
    return this.teachService.getData('monitors', id, {'with[]':'sports'}).subscribe(
      (data:any) => {
        this.setMonitorData(data.data);
        console.log(data.data);
      },
      error => {
        console.error('Error fetching monitor data:', error);
      }
    );
  }

  clearMonitorData() {
    this.monitorDataSubject.next(null);
  }
}
