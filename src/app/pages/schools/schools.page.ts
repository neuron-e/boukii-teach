import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Subscription, forkJoin, firstValueFrom } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { SharedDataService } from '../../services/shared-data.service';
import { TeachService } from '../../services/teach.service';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../services/spinner.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

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

  selectedSchool:any;

  constructor(private router: Router, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private teachService: TeachService, private toastr: ToastrService, private spinnerService: SpinnerService, private translate: TranslateService) {}

  async ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(async data => {
      if (data) {
        this.spinnerService.show();
        this.monitorData = data;

        try {
          this.stations = await firstValueFrom(this.sharedDataService.fetchStations());
          this.schools = await firstValueFrom(this.sharedDataService.fetchSchools());
        } catch (error) {
          console.error('Error fetching data:', error);
          this.toastr.error(this.translate.instant('toast.error_loading_data'));
        }

        // If monitor already has schools loaded, use them directly
        if (this.monitorData.schools && this.monitorData.schools.length > 0) {
          this.useMonitorSchools();
        } else {
          // Otherwise fetch from API
          this.fetchAllData();
        }
      }
    }, error => {
      console.error('Error fetching monitor data:', error);
    });
  }

  fetchAllData() {
    forkJoin({
      stationsSchools: this.teachService.getData('stations-schools'),
      monitorSchools: this.teachService.getData('monitors-schools')
    }).subscribe({
      next: (results:any) => {
        this.stationsSchools = results.stationsSchools.data;
        //console.log(this.stationsSchools);
        //Get only monitor data
        this.monitorSchools = results.monitorSchools.data.filter((ms:any) => ms.monitor_id === this.monitorData.id);
        this.onlyMonitorStationsWithSchools();

        //console.log(this.monitorStationsWithSchools);
      },
      error: (error) => {
        this.spinnerService.hide();
        console.error('Error fetching data:', error);
      }
    });
  }

  useMonitorSchools() {
    // Create a single "group" with all schools (no station grouping)
    this.monitorStationsWithSchools = [{
      id: 0,
      name: this.translate.instant('my_schools'),
      schools: this.monitorData.schools
    }];

    this.spinnerService.hide();
  }

  onlyMonitorStationsWithSchools() {
    //Get only monitors data
    const validSchoolIds = this.monitorSchools.map((ms:any) => ms.school_id);

    this.stations.sort((a, b) => a.id - b.id);

    this.monitorStationsWithSchools = this.stations.map(station => {
        let relatedSchools = this.stationsSchools
          .filter(ss => ss.station_id === station.id && validSchoolIds.includes(ss.school_id))
          .map(ss => this.schools.find(school => school.id === ss.school_id))
          .filter(school => school != null);

        return { ...station, schools: relatedSchools };
    }).filter(station => station.schools.length > 0);

    //console.log(this.monitorStationsWithSchools);
    this.spinnerService.hide();
  }
  
  async changeSchoolActive(school_id:number, station_id:number) {
    if(school_id){
      const isConfirmed = confirm(this.translate.instant('change_school_confirm'));
      if (isConfirmed && this.monitorData) {
        this.spinnerService.show();

        try {
          // Update in backend
          await firstValueFrom(this.teachService.updateData('monitors', this.monitorData.id, {
            active_school: school_id,
            active_station: station_id
          }));

          // Update local data
          this.monitorDataService.updateActiveSchool(school_id);

          // Refresh data for new school
          await firstValueFrom(this.sharedDataService.fetchDegrees(school_id));
          await firstValueFrom(this.sharedDataService.fetchSports(school_id));

          this.spinnerService.hide();
          this.toastr.success(this.translate.instant('toast.school_changed'));

          // Reload page to refresh all data
          window.location.reload();
        } catch (error) {
          console.error('Error changing school:', error);
          this.spinnerService.hide();
          this.toastr.error(this.translate.instant('toast.error'));
        }
      }
    }
  }

  toggleMore(school:any) {
    this.moreState = 'in';
    this.selectedSchool = school;
  }

  toggleMoreHide() {
    this.moreState = 'out';
    this.selectedSchool = null;
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

  ngOnDestroy() {
    if (this.subscription) {
        this.subscription.unsubscribe();
    }
  }

}
