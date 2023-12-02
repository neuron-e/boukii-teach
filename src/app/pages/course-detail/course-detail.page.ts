import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { SharedDataService } from '../../services/shared-data.service';
import { TeachService } from '../../services/teach.service';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../services/spinner.service';
import * as moment from 'moment';
import 'moment/locale/fr';
import { MOCK_COUNTRIES } from '../../mocks/countries-data';
import { MOCK_PROVINCES } from '../../mocks/province-data';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.page.html',
  styleUrls: ['./course-detail.page.scss'],
})
export class CourseDetailPage implements OnInit, OnDestroy {
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

  showA:boolean=true;
  showB:boolean=false;
  showC:boolean=false;

  currentDateFull:string;
  bookingsCurrent: any[] = [];
  courseBookings:any;
  degrees: any[] = [];
  sports: any[] = [];
  languages: any[] = [];

  selectedBooking:any;
  bookingId:any;
  dateBooking:any;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private teachService: TeachService, private toastr: ToastrService, private spinnerService: SpinnerService) {}

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
          this.toastr.error("Erreur lors du chargement des données");
        }
  
        this.activatedRoute.params.subscribe( async params => {
          this.bookingId = +params['id'];
          this.dateBooking = params['date'];
          if (this.bookingId && this.dateBooking) {
            this.spinnerService.show();
            this.currentDateFull = moment(this.dateBooking).locale('fr').format('D MMMM YYYY');
            this.loadBookings();
            //this.loadCourses();
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

  loadCourses() {
    this.teachService.getData('teach/courses', '15').subscribe(
      (data:any) => {
        console.log(data);
        this.courseBookings = data.data;
        console.log(this.courseBookings);
        this.spinnerService.hide();
      },
      error => {
        console.error('There was an error!', error);
        this.spinnerService.hide();
      }
    );
  }

  loadBookings() {
    this.teachService.getData('teach/getAgenda', null, { date_start: this.dateBooking, date_end: this.dateBooking, school_id: this.monitorData.active_school }).subscribe(
      (data:any) => {
        console.log(data);
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
            booking_client: booking.booking,
            degree_sport: this.getClientLevel(booking.client.sports,booking.course.sport_id)
          };

          const course_sport = this.sports.find(s => s.id === booking.course.sport_id);
          const sport_degrees = this.degrees.filter(degree => degree.sport_id === booking.course.sport_id);
          let degree_sport = this.degrees.find(degree => degree.id === booking.degree_id);
          degree_sport = degree_sport ? degree_sport : this.degrees[0];

          uniqueCourseGroups.set(key, {
            ...booking,
            all_clients: [clientWithBooking],
            selected_detail: booking.id === this.bookingId,
            course_sport: course_sport,
            sport_degrees: sport_degrees,
            degree_sport: degree_sport
          });
          this.bookingsCurrent.push(uniqueCourseGroups.get(key));
        } else {
          //insert booking in client
          const clientWithBooking = {
            ...booking.client,
            booking_client: booking.booking,
            degree_sport: this.getClientLevel(booking.client.sports,booking.course.sport_id)
          };

          uniqueCourseGroups.get(key).all_clients.push(clientWithBooking);
          
          if (booking.id === this.bookingId) {
            uniqueCourseGroups.get(key).selected_detail = true;
          }
        }
      }
    });
  
    this.selectedBooking = this.bookingsCurrent.find(booking => booking.selected_detail === true);

    this.spinnerService.hide();
    console.log('Processed Bookings:', this.bookingsCurrent);
    console.log('Selected Booking:', this.selectedBooking);
  }  

  getClientLevel(sports: any[], sport_id: number): number {
    const foundObject = sports.find(obj => obj.id === sport_id);
    return foundObject ? foundObject.pivot.degree_id : 0;
  }

  formatTimeRange(hour_start:string, hour_end:string) {
    const formatTime = (time:string) => time.substring(0, 5);
    return `${formatTime(hour_start)}-${formatTime(hour_end)}`;
  }

  formatTimeStart(hour_start:string) {
    const formatTime = (time:string) => time.substring(0, 5);
    return `${formatTime(hour_start)}`;
  }

  formatTimeEnd(hour_end:string) {
    const formatTime = (time:string) => time.substring(0, 5);
    return `${formatTime(hour_end)}`;
  }

  formatDate(date:string) {
    return moment(date).format('DD-MM-YYYY');
  }

  getPositionDate(courseDates: any[], courseDateId: string): number {
    const index = courseDates.findIndex(date => date.id === courseDateId);
    return index >= 0 ? index + 1 : 0;
  }  

  getHoursMinutes(hour_start:string, hour_end:string) {
    const parseTime = (time:string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return { hours, minutes };
    };
  
    const startTime = parseTime(hour_start);
    const endTime = parseTime(hour_end);
  
    let durationHours = endTime.hours - startTime.hours;
    let durationMinutes = endTime.minutes - startTime.minutes;
  
    if (durationMinutes < 0) {
      durationHours--;
      durationMinutes += 60;
    }
  
    return `${durationHours}h${durationMinutes}m`;
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
