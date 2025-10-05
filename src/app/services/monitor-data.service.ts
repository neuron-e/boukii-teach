import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { TeachService } from './teach.service';

@Injectable({
  providedIn: 'root'
})
export class MonitorDataService {
  private monitorDataSubject = new BehaviorSubject<any>(null);
  private subscriptions = new Subscription();

  constructor(private teachService: TeachService) {}

  setMonitorData(data: any) {
    this.monitorDataSubject.next(data);
  }

  getMonitorData(): Observable<any> {
    return this.monitorDataSubject.asObservable();
  }

  fetchMonitorData(id: number) {
    const sub = this.teachService.getData('monitors', id, {'with[]': 'schools'}).subscribe(
      (data: any) => {
        this.setMonitorData(data.data);
        //console.log(data.data);
      },
      error => {
        console.error('Error fetching monitor data:', error);
      }
    );
    this.subscriptions.add(sub);
    return sub;
  }

  updateActiveSchool(schoolId: number) {
    const currentData = this.monitorDataSubject.value;
    if (currentData) {
      const updatedData = {
        ...currentData,
        active_school: schoolId
      };
      this.setMonitorData(updatedData);
      // Save to localStorage
      localStorage.setItem('activeSchool', schoolId.toString());
    }
  }

  getActiveSchool(): number | null {
    const stored = localStorage.getItem('activeSchool');
    return stored ? parseInt(stored, 10) : null;
  }

  clearMonitorData() {
    this.monitorDataSubject.next(null);
  }

  //If more subscriptions created in future
  /*
  addSubscription(subscription: Subscription) {
    this.subscriptions.add(subscription);
  }
  */

  clearSubscriptions() {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
  }
}
