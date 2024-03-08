import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { SharedDataService } from '../../services/shared-data.service';
import { TeachService } from '../../services/teach.service';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../services/spinner.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
  monitorData: any;
  private subscription: Subscription;

  bookingsToday: any[] = [];
  courseCollectiveToday: number = 0;
  coursePrivateToday: number = 0;
  courseActivityToday: number = 0;
  degrees: any[] = [];
  sports: any[] = [];
  stations: any[] = [];
  schools: any[] = [];
  meteo:any[] = [];
  monitorStation:any;
  monitorSchool:any;

  todayDate:string = moment().format('YYYY-MM-DD');
  todayDateFull:string;

  constructor(private router: Router, private menuService: MenuService, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private teachService: TeachService, private toastr: ToastrService, private spinnerService: SpinnerService, private translate: TranslateService) {
    this.translate.onLangChange.subscribe((lang:any) => {
      this.updateDate(lang.lang);
    });
  
    this.updateDate(this.translate.currentLang);
  }

  updateDate(lang: string) {
    moment.locale(lang);
    this.todayDateFull = moment().format('dddd, D MMMM');
  }

  async ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(async data => {
      if (data) {
        this.spinnerService.show();
        this.monitorData = data;
        try {
          this.degrees = await firstValueFrom(this.sharedDataService.fetchDegrees(this.monitorData.active_school));
          this.sports = await firstValueFrom(this.sharedDataService.fetchSports(this.monitorData.active_school));
          this.stations = await firstValueFrom(this.sharedDataService.fetchStations());
          this.schools = await firstValueFrom(this.sharedDataService.fetchSchools());
        } catch (error) {
          console.error('Error fetching data:', error);
          this.toastr.error(this.translate.instant('toast.error_loading_data'));
        }
        await this.getStation();
        await this.getSchool();
        await this.getMeteo();
        await this.getMeteoWeek();
        this.loadBookings();
      }
    });
  }

  async getStation() {
    //console.log(this.stations);
    //console.log(this.monitorData.active_station);
    this.monitorStation = this.stations.find(station => station.id === this.monitorData.active_station);
    //console.log(this.monitorStation);
  }

  async getSchool() {
    this.monitorSchool = this.schools.find(school => school.id === this.monitorData.active_school);
  }

  async getMeteo() {
    try {
      const data: any = await this.teachService.getData('teach/weather', null, { station_id: this.monitorData.active_station }).toPromise();
      //console.log(data);
      this.meteo = data.data;
    } catch (error) {
      console.error('There was an error!', error);
    }
  }

  async getMeteoWeek() {
    try {
      const data: any = await this.teachService.getData('teach/weather/week', null, { station_id: this.monitorData.active_station }).toPromise();
      //console.log(data);
    } catch (error) {
      console.error('There was an error!', error);
    }
  }

  loadBookings() {
    const searchData:any = {};
    if(this.monitorData.active_school){
      searchData.school_id = this.monitorData.active_school;
    }
    this.teachService.getData('teach/getAgenda', null, searchData).subscribe(
      (data:any) => {
        //console.log(data);
        this.processBookings(data.data.bookings, data.data.subgroups);
      },
      error => {
        this.spinnerService.hide();
        console.error('There was an error!', error);
      }
    );
  }

  processBookings(bookings: any[], subgroups: any[]) {
    const uniqueCourseGroups = new Map();
    this.bookingsToday = [];
    this.courseCollectiveToday = 0;
    this.coursePrivateToday = 0;
  
    bookings.forEach(booking => {
      if (booking.course) {
        let key = `${booking.course_id}`;
        if(booking.course.course_type == 1){
          key = `${booking.course_id}-${booking.course_subgroup_id}`;
        }
        else if(booking.course.course_type == 2){
          key = `${booking.course_id}-${booking.hour_start}-${booking.hour_end}`;
        }
        if (!uniqueCourseGroups.has(key)) {

          // Count course types
          if (booking.course.course_type == 1) {
            this.courseCollectiveToday++;
          } else if (booking.course.course_type == 2) {
            this.coursePrivateToday++;
          }
          
          let bookingToAdd = { ...booking, all_clients: [booking.client] };
          // course_sport
          const sport = this.sports.find(s => s.id === booking.course.sport_id);
          bookingToAdd.course_sport = sport || null;
          // course_degree -> course_type=1
          if (booking.course.course_type == 1) {
            const degree = this.degrees.find(d => d.id === booking.degree_id);
            bookingToAdd.course_degree = degree || this.degrees[0];
          }

          uniqueCourseGroups.set(key, bookingToAdd);
          this.bookingsToday.push(uniqueCourseGroups.get(key));
        } else {
          uniqueCourseGroups.get(key).all_clients.push(booking.client);
        }
      }
    });

    subgroups.forEach(subgroup => {
      if (subgroup.course) {

        const course_sport = this.sports.find(s => s.id === subgroup.course.sport_id);
        const sport_degrees = this.degrees.filter(degree => degree.sport_id === subgroup.course.sport_id);
        let degree_sport = this.degrees.find(degree => degree.id === subgroup.degree_id);
        degree_sport = degree_sport ? degree_sport : this.degrees[0];


        const dateTotalAndIndex = subgroup.course.course_type === 2 ? { date_total: 0, date_index: 0 } : {
          date_total: subgroup.course.course_dates.length,
          date_index: this.getPositionDate(subgroup.course.course_dates, subgroup.course_date_id)
        };

        if(dateTotalAndIndex.date_index > 0){
          const subgroupObject = {
            ...subgroup,
            course_subgroup_id: subgroup.id,
            hour_start: subgroup.course.course_dates[dateTotalAndIndex.date_index - 1].hour_start,
            hour_end: subgroup.course.course_dates[dateTotalAndIndex.date_index - 1].hour_end,
            client: null,
            client_id: null,
            all_clients: [],
            course_sport: course_sport,
            sport_degrees: sport_degrees,
            degree_sport: degree_sport
          };
          // course_sport
          const sport = this.sports.find(s => s.id === subgroup.course.sport_id);
          subgroupObject.course_sport = sport || null;
          // course_degree -> course_type=1
          const degree = this.degrees.find(d => d.id === subgroup.degree_id);
          subgroupObject.course_degree = degree || this.degrees[0];
          subgroupObject.id = 's-'+subgroup.id;

          this.courseCollectiveToday++;
          this.bookingsToday.push(subgroupObject);
        }
      }
    });

    this.bookingsToday.sort((a, b) => {
      const hourStartA = a.hour_start;
      const hourStartB = b.hour_start;
      if (hourStartA < hourStartB) return -1;
      if (hourStartA > hourStartB) return 1;
      return 0;
    });
  
    this.spinnerService.hide();

    //console.log('Processed Bookings:', this.bookingsToday);
    //console.log('Collective Courses Today:', this.courseCollectiveToday);
    //console.log('Private Courses Today:', this.coursePrivateToday);
  }  

  formatTimeRange(hour_start:string, hour_end:string) {
    const formatTime = (time:string) => time.substring(0, 5);
    return `${formatTime(hour_start)}-${formatTime(hour_end)}`;
  }

  getPositionDate(courseDates: any[], courseDateId: string): number {
    const index = courseDates.findIndex(date => date.id === courseDateId);
    return index >= 0 ? index + 1 : 0;
  }

  toggleMenu() {
    this.menuService.toggleMenu();
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
