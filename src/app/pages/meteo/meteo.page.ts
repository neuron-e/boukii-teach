import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { SharedDataService } from '../../services/shared-data.service';
import { TeachService } from '../../services/teach.service';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../services/spinner.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Component({
  selector: 'app-meteo',
  templateUrl: './meteo.page.html',
  styleUrls: ['./meteo.page.scss'],
})
export class MeteoPage implements OnInit, OnDestroy {
  monitorData: any;
  private subscription: Subscription;

  stations: any[] = [];
  meteo:any[] = [];
  meteoWeek:any[] = [];
  monitorStation:any;
  weekdays: string[];

  constructor(private router: Router, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private teachService: TeachService, private toastr: ToastrService, private spinnerService: SpinnerService, private translate: TranslateService) {
    this.translate.onLangChange.subscribe(() => {
      this.loadWeekdays();
    });
  
    this.loadWeekdays();
  }

  loadWeekdays() {
    this.weekdays = [
      this.translate.instant('days_abbrev.sunday'),
      this.translate.instant('days_abbrev.monday'),
      this.translate.instant('days_abbrev.tuesday'),
      this.translate.instant('days_abbrev.wednesday'),
      this.translate.instant('days_abbrev.thursday'),
      this.translate.instant('days_abbrev.friday'),
      this.translate.instant('days_abbrev.saturday'),
    ];
  }

  async ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(async data => {
      if (data) {
        this.spinnerService.show();
        this.monitorData = data;
        try {
          this.stations = await firstValueFrom(this.sharedDataService.fetchStations());
        } catch (error) {
          console.error('Error fetching data:', error);
          this.toastr.error("Erreur lors du chargement des données");
        }
        await this.getStation();
        await this.getMeteo();
        await this.getMeteoWeek();
        this.spinnerService.hide();
      }
    });
  }

  async getStation() {
    this.monitorStation = this.stations.find(station => station.id === this.monitorData.active_station);
    console.log(this.monitorStation);
  }

  async getMeteo() {
    try {
      const data: any = await this.teachService.getData('teach/weather', null, { station_id: this.monitorData.active_station }).toPromise();
      console.log(data);
      this.meteo = data.data;
    } catch (error) {
      console.error('There was an error!', error);
    }
  }

  async getMeteoWeek() {
    try {
      const data: any = await this.teachService.getData('teach/weather/week', null, { station_id: this.monitorData.active_station }).toPromise();
      console.log(data);
      this.meteoWeek = data.data;
    } catch (error) {
      console.error('There was an error!', error);
    }
  }

  getDayIndex(date:string) {
    return moment(date, 'YYYY-MM-DD').day();
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
