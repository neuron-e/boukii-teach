import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { TeachService } from './teach.service';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private degreesSubject = new BehaviorSubject<any[]>([]);
  private sportsSubject = new BehaviorSubject<any[]>([]);
  private languagesSubject = new BehaviorSubject<any[]>([]);
  private stationsSubject = new BehaviorSubject<any[]>([]);
  private schoolsSubject = new BehaviorSubject<any[]>([]);

  constructor(private teachService: TeachService) {}

  fetchDegrees(school_id: any): Observable<any[]> {
    if (this.degreesSubject.getValue().length === 0) {
      return this.teachService.getData('degrees', null, { school_id: school_id }).pipe(
        switchMap((data: any) => {
          data.data.sort((a: any, b: any) => a.degree_order - b.degree_order);
          data.data.forEach((degree: any) => {
            degree.inactive_color = this.lightenColor(degree.color, 30);
          });
          console.log('degrees fetched');
          this.degreesSubject.next(data.data);
          return of(data.data);
        }),
        catchError(error => {
          console.error('Error fetching degrees:', error);
          this.degreesSubject.next([]);
          return of([]);
        })
      );
    } else {
      console.log('already degrees');
      return this.degreesSubject.asObservable();
    }
  }
  
  fetchSports(school_id: any): Observable<any[]> {
    if (this.sportsSubject.getValue().length === 0) {
      return this.teachService.getData('sports', null, { school_id: school_id }).pipe(
        switchMap((data: any) => {
          console.log('sports fetched');
          this.sportsSubject.next(data.data);
          return of(data.data);
        }),
        catchError(error => {
          console.error('Error fetching sports:', error);
          this.sportsSubject.next([]);
          return of([]);
        })
      );
    } else {
      console.log('already sports');
      return this.sportsSubject.asObservable();
    }
  }
  
  fetchLanguages(): Observable<any[]> {
    if (this.languagesSubject.getValue().length === 0) {
      return this.teachService.getData('languages').pipe(
        switchMap((data: any) => {
          console.log('languages fetched');
          this.languagesSubject.next(data.data);
          return of(data.data);
        }),
        catchError(error => {
          console.error('Error fetching languages:', error);
          this.languagesSubject.next([]);
          return of([]);
        })
      );
    } else {
      console.log('already languages');
      return this.languagesSubject.asObservable();
    }
  }

  fetchStations(): Observable<any[]> {
    if (this.stationsSubject.getValue().length === 0) {
      return this.teachService.getData('stations').pipe(
        switchMap((data: any) => {
          console.log('stations fetched');
          this.stationsSubject.next(data.data);
          return of(data.data);
        }),
        catchError(error => {
          console.error('Error fetching stations:', error);
          this.stationsSubject.next([]);
          return of([]);
        })
      );
    } else {
      console.log('already stations');
      return this.stationsSubject.asObservable();
    }
  }
  
  fetchSchools(): Observable<any[]> {
    if (this.schoolsSubject.getValue().length === 0) {
      return this.teachService.getData('schools').pipe(
        switchMap((data: any) => {
          console.log('schools fetched');
          this.schoolsSubject.next(data.data);
          return of(data.data);
        }),
        catchError(error => {
          console.error('Error fetching schools:', error);
          this.schoolsSubject.next([]);
          return of([]);
        })
      );
    } else {
      console.log('already schools');
      return this.schoolsSubject.asObservable();
    }
  }

  clearDegreesData() {
    this.degreesSubject.next([]);
  }

  clearSportsData() {
    this.sportsSubject.next([]);
  }

  clearLanguagesData() {
    this.languagesSubject.next([]);
  }

  clearStationsData() {
    this.stationsSubject.next([]);
  }

  clearSchoolsData() {
    this.schoolsSubject.next([]);
  }

  private lightenColor(hexColor: string, percent: number): string {
    let r:any = parseInt(hexColor.substring(1, 3), 16);
    let g:any = parseInt(hexColor.substring(3, 5), 16);
    let b:any = parseInt(hexColor.substring(5, 7), 16);

    // Increase the lightness
    r = Math.round(r + (255 - r) * percent / 100);
    g = Math.round(g + (255 - g) * percent / 100);
    b = Math.round(b + (255 - b) * percent / 100);

    // Convert RGB back to hex
    r = r.toString(16).padStart(2, '0');
    g = g.toString(16).padStart(2, '0');
    b = b.toString(16).padStart(2, '0');

    return `#${r}${g}${b}`;
  }
}
