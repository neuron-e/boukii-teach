import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Subscription, forkJoin, firstValueFrom } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { SharedDataService } from '../../services/shared-data.service';
import { TeachService } from '../../services/teach.service';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../services/spinner.service';
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

  constructor(private router: Router, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private teachService: TeachService, private toastr: ToastrService, private spinnerService: SpinnerService) {}

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
          this.toastr.error("Erreur lors du chargement des données");
        }
        
        this.fetchAllData();
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
        //Get only monitor data
        this.monitorSchools = results.monitorSchools.data.filter((ms:any) => ms.monitor_id === this.monitorData.id);
        this.onlyMonitorStationsWithSchools();

        console.log(this.monitorStationsWithSchools);
      },
      error: (error) => {
        this.spinnerService.hide();
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
        let relatedSchools = this.stationsSchools
          .filter(ss => ss.station_id === station.id)
          .map(ss => this.schools.find(school => school.id === ss.school_id && validSchoolIds.includes(school.id)))
          .filter(school => school != null);
  
        return { ...station, schools: relatedSchools };
      });

    this.spinnerService.hide();
  }
  
  changeSchoolActive(school_id:number, station_id:number) {
    if(school_id){
      const isConfirmed = confirm("Etes-vous sûr de vouloir changer d'école active?");
      if (isConfirmed && this.monitorData) {
        this.spinnerService.show();
        console.log('changing active school');

        const updateData = {
          active_school: school_id,
          active_station: station_id,

          //Required for put
          phone: this.monitorData.phone,
          telephone: this.monitorData.telephone,
          first_name: this.monitorData.first_name,
          last_name: this.monitorData.last_name,
          birth_date: moment.utc(this.monitorData.birth_date).format('YYYY-MM-DDTHH:mm:ss.SSS') + '000Z',
          address: this.monitorData.address,
          avs: this.monitorData.avs,
          bank_details: this.monitorData.bank_details,
          children: this.monitorData.children,
          work_license: this.monitorData.work_license
        };
    
        this.teachService.updateData('monitors', this.monitorData.id, updateData).subscribe(
          response => {
            // Handle response
            console.log('Update successful', response);
            //Update monitor subscription
            this.monitorDataService.fetchMonitorData(this.monitorData.id);
            this.spinnerService.hide();
            this.toastr.success('Mis à jour correctement');
            this.goTo('home');
          },
          error => {
            // Handle error
            this.spinnerService.hide();
            this.toastr.error('Mise à jour a échoué');
            console.error('Update failed', error);
          }
        );
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
