import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { SharedDataService } from '../../services/shared-data.service';
import { TeachService } from '../../services/teach.service';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../services/spinner.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { MOCK_COUNTRIES } from '../../mocks/countries-data';
import { MOCK_PROVINCES } from '../../mocks/province-data';

@Component({
  selector: 'app-course-detail-level',
  templateUrl: './course-detail-level.page.html',
  styleUrls: ['./course-detail-level.page.scss'],
})
export class CourseDetailLevelPage implements OnInit, OnDestroy {
  monitorData: any;
  private subscription: Subscription;

  showGeneral:boolean = true;
  showSports:boolean = false;
  showWinter: boolean = true;
  showSummer: boolean = false;
  showOther: boolean = false;
  showLevel:boolean = false;

  dataSports:any[] = [
    {id:1,name:'Ski',image:'assets/icon/icons-outline-disciplinas-1.svg',checked:false},
    {id:2,name:'Snowboard',image:'assets/icon/icons-outline-disciplinas-2.svg',checked:false},
    {id:3,name:'Telemark',image:'assets/icon/icons-outline-disciplinas-3.svg',checked:false},
    {id:4,name:'S.Rando',image:'assets/icon/icons-outline-disciplinas-4.svg',checked:false},
  ];

  bookingsCurrent: any[] = [];
  degrees: any[] = [];
  sportDegrees: any[] = [];
  sports: any[] = [];
  languages: any[] = [];

  selectedBooking:any;
  bookingId:any;
  dateBooking:any;
  clientIdBooking:any;
  sportIdBooking:any;
  clientMonitor:any;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private teachService: TeachService, private toastr: ToastrService, private spinnerService: SpinnerService, private translate: TranslateService) {}

  async ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(async monitorData => {
      if (monitorData) {
        this.monitorData = monitorData;
        try {
          this.degrees = await firstValueFrom(this.sharedDataService.fetchDegrees(this.monitorData.active_school));
          this.sports = await firstValueFrom(this.sharedDataService.fetchSports(this.monitorData.active_school));
          this.languages = await firstValueFrom(this.sharedDataService.fetchLanguages());
        } catch (error) {
          console.error('Error fetching data:', error);
          this.toastr.error(this.translate.instant('toast.error_loading_data'));
        }
  
        this.activatedRoute.params.subscribe( async params => {
          this.bookingId = +params['id'];
          this.dateBooking = params['date'];
          this.clientIdBooking = +params['client'];
          this.sportIdBooking = +params['sport'];
          if (this.bookingId && this.dateBooking && this.clientIdBooking && this.sportIdBooking) {
            this.spinnerService.show();
            this.loadBookings();
          } else {
            this.goTo('home');
          }
        });
      }
    });
  }

  getLanguageById(languageId: number): string {
    const language = this.languages.find(c => c.id === languageId);
    return language ? language.code.toUpperCase() : '';
  }

  getCountryById(countryId: number): string {
    const country = MOCK_COUNTRIES.find(c => c.id === countryId);
    return country ? country.iso : 'Aucun';
  }

  getProvinceById(provinceId: number): string {
    const province = MOCK_PROVINCES.find(c => c.id === provinceId);
    return province ? province.name : 'Aucune';
  }

  loadBookings() {
    this.sportDegrees = this.degrees.filter(degree => degree.sport_id === this.sportIdBooking);
    this.teachService.getData('teach/getAgenda', null, { date_start: this.dateBooking, date_end: this.dateBooking, school_id: this.monitorData.active_school }).subscribe(
      (data:any) => {
        //console.log(data);
        this.processBookings(data.data.bookings);
      },
      error => {
        console.error('There was an error!', error);
        this.spinnerService.hide();
      }
    );
  }

  processBookings(bookings: any[]) {
    const uniqueCourseGroups = new Map();
    this.bookingsCurrent = [];
  
    bookings.forEach(booking => {
      if (booking.course) {
        let key = `${booking.course_id}`;
        if(booking.course.course_type == 1){
          key = `${booking.course_id}-${booking.course_subgroup_id}`;
        }
        if (!uniqueCourseGroups.has(key)) {
          //insert booking in client
          const clientWithBooking = {
            ...booking.client,
            booking_client: booking.booking
          };

          uniqueCourseGroups.set(key, {
            ...booking,
            all_clients: [clientWithBooking],
            selected_detail: booking.id === this.bookingId
          });
          this.bookingsCurrent.push(uniqueCourseGroups.get(key));
        } else {
          //insert booking in client
          const clientWithBooking = {
            ...booking.client,
            booking_client: booking.booking
          };

          uniqueCourseGroups.get(key).all_clients.push(clientWithBooking);
          
          if (booking.id === this.bookingId) {
            uniqueCourseGroups.get(key).selected_detail = true;
          }
        }
      }
    });
  
    this.selectedBooking = this.bookingsCurrent.find(booking => booking.selected_detail === true);

    if (this.selectedBooking && this.selectedBooking.course && this.sports) {
      this.selectedBooking.course.sport = this.sports.find(sport => sport.id === this.sportIdBooking);
    }

    this.spinnerService.hide();
    this.getClient();

    //console.log('Processed Bookings:', this.bookingsCurrent);
    //console.log('Selected Booking:', this.selectedBooking);
  }

  getClient() {
    this.spinnerService.show();
    this.teachService.getData(`teach/clients/${this.clientIdBooking}`).subscribe(
      (data:any) => {
        const client = data.data;
        if (client) {
          const birthDate = moment(client.birth_date);
          const age = moment().diff(birthDate, 'years');
          client.birth_years = age;

          let sport = client.sports.find((sport:any) => sport.id === this.sportIdBooking);

          this.spinnerService.hide();

          if (sport && sport.pivot) {
            if(sport.pivot.degree_id){
              client.degree_sport = sport.pivot.degree_id;
            }
            else{
              client.degree_sport = 0;
            } 
          } else {
            client.degree_sport = 0;
          }
          this.clientMonitor = client;
          //console.log(this.clientMonitor);
        } else {
          //Not a client of monitor
          this.goTo('clients');
        }
      },
      error => {
        console.error('There was an error fetching clients!', error);
        this.spinnerService.hide();
      }
    );
  }

  getBirthYears(date:string) {
    const birthDate = moment(date);
    return moment().diff(birthDate, 'years');
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
