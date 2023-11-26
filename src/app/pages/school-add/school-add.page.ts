import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Subscription, forkJoin } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { TeachService } from '../../services/teach.service';

@Component({
  selector: 'app-school-add',
  templateUrl: './school-add.page.html',
  styleUrls: ['./school-add.page.scss'],
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
export class SchoolAddPage implements OnInit, OnDestroy {

  monitorData: any;
  private subscription: Subscription;

  showStation:boolean=false;
  stationIndex:any;
  moreState: string = 'out';
  stations: any[] = [];
  schools: any[] = [];
  stationsSchools: any[] = [];
  monitorSchools: any[] = [];
  stationsWithSchools: any[] = [];
  searchQuery: string = '';

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
        this.associateStationsWithSchools();

        console.log(this.stationsWithSchools);
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      }
    });
  }

  associateStationsWithSchools() {
    this.stations.sort((a, b) => a.id - b.id);

    this.stationsWithSchools = this.stations.map(station => {
      const relatedSchools = this.stationsSchools
        .filter(ss => ss.station_id === station.id)
        .map(ss => {
          const school = this.schools.find(school => school.id === ss.school_id);
          //Associated to monitor
          const isMonitorSchool = this.monitorSchools.some(ms => ms.school_id === school.id && ms.station_id === station.id);
          return isMonitorSchool ? { ...school, monitor_school: true } : school;
        })
        .filter(school => school != null);

      return { ...station, schools: relatedSchools };
    });
  }

  applyFilter() {
    if (!this.searchQuery) {
      this.stationsWithSchools = this.stations.map(station => {
        const relatedSchools = this.stationsSchools
          .filter(ss => ss.station_id === station.id)
          .map(ss => {
            const school = this.schools.find(school => school.id === ss.school_id);
            //Associated to monitor
            const isMonitorSchool = this.monitorSchools.some(ms => ms.school_id === school.id && ms.station_id === station.id);
            return isMonitorSchool ? { ...school, monitor_school: true } : school;
          })
          .filter(school => school != null);
  
        return { ...station, schools: relatedSchools };
      });
      return;
    }
  
    const lowerCaseQuery = this.searchQuery.toLowerCase();
    this.stationsWithSchools = this.stations
      .filter(station => 
        (station.name && station.name.toLowerCase().includes(lowerCaseQuery)) || 
        (station.city && station.city.toLowerCase().includes(lowerCaseQuery))
      )
      .map(station => {
        const relatedSchools = this.stationsSchools
          .filter(ss => ss.station_id === station.id)
          .map(ss => {
            const school = this.schools.find(school => school.id === ss.school_id);
            //Associated to monitor
            const isMonitorSchool = this.monitorSchools.some(ms => ms.school_id === school.id && ms.station_id === station.id);
            return isMonitorSchool ? { ...school, monitor_school: true } : school;
          })
          .filter(school => school != null);
  
        return { ...station, schools: relatedSchools };
      });
  }  

  seeSchools(index:any) {
    this.stationIndex = index;
    this.showStation = true;
  }

  hideSchools() {
    this.stationIndex = null;
    this.showStation = false;
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
