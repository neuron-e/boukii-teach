import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, forkJoin, firstValueFrom } from 'rxjs';
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
  selector: 'app-course-participation',
  templateUrl: './course-participation.page.html',
  styleUrls: ['./course-participation.page.scss'],
})
export class CourseParticipationPage implements OnInit {
  monitorData: any;
  private subscription: Subscription;

  starterLevel:any = {id:0,name:'Débutante',level:'STARTER LEAGUE',percentage:0,color:'#c8c8c8',objectives:["Je n'ai jamais fait de ski."]};
  dataLevels:any[] = [
    {id:1,name:'Prince Bleu',level:'BLUE LEAGUE',percentage:30,color:'#0057ff',inactive_color:'#80adff',objectives:["Virage chasse-neige sur piste bleue facile","Dérapage latéral","Skier des bosses et des sauts faciles avec les skis parallèles","Virage chasse-neige sur piste bleue facile"]},
    {id:2,name:'Roi Bleu',level:'BLUE LEAGUE',percentage:60,color:'#0057ff',inactive_color:'#80adff',objectives:["Virage chasse-neige sur piste bleue facile","Dérapage latéral","Skier des bosses et des sauts faciles avec les skis parallèles","Virage chasse-neige sur piste bleue facile"]},
    {id:3,name:'Star Bleu',level:'BLUE LEAGUE',percentage:100,color:'#0057ff',inactive_color:'#80adff',objectives:["Virage chasse-neige sur piste bleue facile","Dérapage latéral","Skier des bosses et des sauts faciles avec les skis parallèles","Virage chasse-neige sur piste bleue facile"]},
    {id:4,name:'Prince Red',level:'RED LEAGUE',percentage:30,color:'#e9484a',inactive_color:'#fba0a1',objectives:["Virage chasse-neige sur piste bleue facile","Dérapage latéral","Skier des bosses et des sauts faciles avec les skis parallèles","Virage chasse-neige sur piste bleue facile"]},
    {id:5,name:'Roi Red',level:'RED LEAGUE',percentage:60,color:'#e9484a',inactive_color:'#fba0a1',objectives:["Virage chasse-neige sur piste bleue facile","Dérapage latéral","Skier des bosses et des sauts faciles avec les skis parallèles","Virage chasse-neige sur piste bleue facile"]},
    {id:6,name:'Star Red',level:'RED LEAGUE',percentage:100,color:'#e9484a',inactive_color:'#fba0a1',objectives:["Virage chasse-neige sur piste bleue facile","Dérapage latéral","Skier des bosses et des sauts faciles avec les skis parallèles","Virage chasse-neige sur piste bleue facile"]},
    {id:7,name:'Prince Noir',level:'BLACK LEAGUE',percentage:30,color:'#373737',inactive_color:'#806f6f',objectives:["Virage chasse-neige sur piste bleue facile","Dérapage latéral","Skier des bosses et des sauts faciles avec les skis parallèles","Virage chasse-neige sur piste bleue facile"]},
    {id:8,name:'Roi Noir',level:'BLACK LEAGUE',percentage:60,color:'#373737',inactive_color:'#806f6f',objectives:["Virage chasse-neige sur piste bleue facile","Dérapage latéral","Skier des bosses et des sauts faciles avec les skis parallèles","Virage chasse-neige sur piste bleue facile"]},
    {id:9,name:'Star Noir',level:'BLACK LEAGUE',percentage:100,color:'#373737',inactive_color:'#806f6f',objectives:["Virage chasse-neige sur piste bleue facile","Dérapage latéral","Skier des bosses et des sauts faciles avec les skis parallèles","Virage chasse-neige sur piste bleue facile"]},
  ];
  allLevels: any[] = [this.starterLevel, ...this.dataLevels];


  degrees: any[] = [];
  sports: any[] = [];
  languages: any[] = [];
  bookingId:any;
  dateBooking:any;
  courseId:any;
  courseBookings:any;

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
          this.bookingId = params['id'];
          this.dateBooking = params['date'];
          this.courseId = +params['course'];
          if (this.bookingId && this.dateBooking && this.courseId) {
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
    this.teachService.getData('teach/courses', this.courseId).subscribe(
      (data:any) => {
        //console.log(data);
        this.courseBookings = this.processBookings(data.data);
        //console.log(this.courseBookings);
        this.spinnerService.hide();
      },
      error => {
        console.error('There was an error!', error);
        this.spinnerService.hide();
      }
    );
  }

  processBookings(data:any) {
    data.booking_users.sort((a:any, b:any) => {
      const dateA = moment(a.date);
      const dateB = moment(b.date);
      return dateA.diff(dateB);
    });
    const clientBookings:any = {};
    data.booking_users.forEach((booking:any) => {
      if(booking.monitor_id === this.monitorData.id){
        const clientId = booking.client_id;
        if (!clientBookings[clientId]) {
            clientBookings[clientId] = { 
                client: booking, 
                bookings: [] 
            };
        }
        clientBookings[clientId].bookings.push(booking);
      }
    });

    data.client_bookings = Object.values(clientBookings);

    return data;
  }

  getBirthYears(date:string) {
    const birthDate = moment(date);
    return moment().diff(birthDate, 'years');
  }

  getDateFormat(date:string) {
    return moment(date).format('DD-MM-YYYY');
  }

  isDateBeforeOrEqualToToday(dateString: string): boolean {
    const inputDate = moment(dateString).startOf('day');
    const today = moment().startOf('day');
    return inputDate.isSameOrBefore(today);
  }

  saveConfirm() {
    this.spinnerService.show();
    const updateObservables:any[] = [];

    this.courseBookings.booking_users.forEach((booking: any) => {
        if (this.isDateBeforeOrEqualToToday(booking.date)) {
            let fieldsToRemove = ['client','created_at','deleted_at','updated_at'];
            let newBooking = this.removeFieldsFromObject(booking, fieldsToRemove);

            const updateObservable = this.teachService.updateData('booking-users', booking.id, newBooking);
            updateObservables.push(updateObservable);
        }
    });

    if (updateObservables.length > 0) {
        forkJoin(updateObservables).subscribe(
            responses => {
                //console.log('All updates completed', responses);
                this.spinnerService.hide();
                this.toastr.success(this.translate.instant('toast.registered_correctly'));
                this.goTo('course-detail',this.bookingId,this.dateBooking);
            },
            error => {
                console.error('Error occurred during updates:', error);
                this.spinnerService.hide();
                this.toastr.error(this.translate.instant('toast.error'));
            }
        );
    } else {
        this.spinnerService.hide();
        this.toastr.success(this.translate.instant('toast.registered_correctly'));
        this.goTo('course-detail',this.bookingId,this.dateBooking);
    }
  }

  removeFieldsFromObject(obj:any, fieldsToRemove:any) {
    fieldsToRemove.forEach((field:any) => {
        delete obj[field];
    });
    return obj;
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
