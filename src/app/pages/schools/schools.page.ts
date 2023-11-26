import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Subscription, forkJoin } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { TeachService } from '../../services/teach.service';

@Component({
  selector: 'app-schools',
  templateUrl: './schools.page.html',
  styleUrls: ['./schools.page.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateY(0)'
      })),
      state('out', style({
        transform: 'translateY(100%)'
      })),
      transition('in => out', [
        animate('300ms ease-in-out')
      ]),
      transition('out => in', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class SchoolsPage implements OnInit, OnDestroy {

  monitorData: any;
  private subscription: Subscription;

  moreState: string = 'out';
  stations: any[] = [];
  schools: any[] = [];
  stationsSchools: any[] = [];
  monitorSchools: any[] = [];
  monitorStationsWithSchools: any[] = [];

  constructor(private router: Router, private monitorDataService: MonitorDataService, private teachService: TeachService) {}

  ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(data => {
      if (data) {
        this.monitorData = data;
        this.fetchAllData();
      }
    }, error => {
      console.error('Error fetching monitor data:', error);
    });
  }

  fetchAllData() {
    forkJoin({
      stations: this.teachService.getData('stations'),
      schools: this.teachService.getData('schools'),
      stationsSchools: this.teachService.getData('stations-schools'),
      monitorSchools: this.teachService.getData('monitors-schools')
    }).subscribe({
      next: (results:any) => {
        this.stations = results.stations.data;
        this.schools = results.schools.data;
        this.stationsSchools = results.stationsSchools.data;
        //Get only monitor data
        this.monitorSchools = results.monitorSchools.data.filter((ms:any) => ms.monitor_id === this.monitorData.id);
        this.onlyMonitorStationsWithSchools();

        console.log(this.monitorStationsWithSchools);
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      }
    });
  }

  onlyMonitorStationsWithSchools() {
    //Get only monitors data
    const validStationIds = this.monitorSchools.map((ms:any) => ms.station_id);
    const validSchoolIds = this.monitorSchools.map((ms:any) => ms.school_id);
  
    this.stations.sort((a, b) => a.id - b.id);
  
    this.monitorStationsWithSchools = this.stations
      .filter(station => validStationIds.includes(station.id))
      .map(station => {
        const relatedSchools = this.stationsSchools
          .filter(ss => ss.station_id === station.id)
          .map(ss => this.schools.find(school => school.id === ss.school_id && validSchoolIds.includes(school.id)))
          .filter(school => school != null);
  
        return { ...station, schools: relatedSchools };
      });
  }
  

  toggleMore() {
    this.moreState = this.moreState === 'out' ? 'in' : 'out';
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
