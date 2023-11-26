import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { TeachService } from '../../services/teach.service';
import * as moment from 'moment';
import 'moment/locale/fr';

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
  degrees: any[] = [];
  sports: any[] = [];

  selectedBooking:any;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private monitorDataService: MonitorDataService, private teachService: TeachService) {}

  ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(monitorData => {
      if (monitorData) {
        this.monitorData = monitorData;
  
        this.activatedRoute.params.subscribe(params => {
          const bookingId = +params['id'];
          const dateBooking = params['date'];
          if (bookingId && dateBooking) {
            this.currentDateFull = moment(dateBooking).locale('fr').format('D MMMM YYYY');
            this.loadBookings(bookingId,dateBooking);
            this.getDegrees();
            this.getSports();
          } else {
            this.goTo('home');
          }
        });
      }
    });
  }

  loadBookings(bookingId:number,dateBooking:string) {
    this.teachService.getData('teach/getAgenda', null, { date_start: dateBooking, date_end: dateBooking }).subscribe(
      (data:any) => {
        console.log(data);
        this.processBookings(bookingId,data.data.bookings);
      },
      error => {
        console.error('There was an error!', error);
      }
    );
  }

  processBookings(bookingId: number, bookings: any[]) {
    const uniqueCourseGroups = new Map();
    this.bookingsCurrent = [];
  
    bookings.forEach(booking => {
      if (booking.course) {
        let key = `${booking.course_id}`;
        if(booking.course.course_type == 1){
          key = `${booking.course_id}-${booking.course_group_id}`;
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
            selected_detail: booking.id === bookingId
          });
          this.bookingsCurrent.push(uniqueCourseGroups.get(key));
        } else {
          //insert booking in client
          const clientWithBooking = {
            ...booking.client,
            booking_client: booking.booking
          };

          uniqueCourseGroups.get(key).all_clients.push(clientWithBooking);
          
          if (booking.id === bookingId) {
            uniqueCourseGroups.get(key).selected_detail = true;
          }
        }
      }
    });
  
    this.selectedBooking = this.bookingsCurrent.find(booking => booking.selected_detail === true);

    console.log('Processed Bookings:', this.bookingsCurrent);
    console.log('Selected Booking:', this.selectedBooking);
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

  getDegrees() {
    this.teachService.getData('degrees').subscribe(
      (data:any) => {
        console.log(data);
        this.degrees = data.data;
      },
      error => {
        console.error('There was an error!', error);
      }
    );
  }

  getSports() {
    this.teachService.getData('sports').subscribe(
      (data:any) => {
        console.log(data);
        this.sports = data.data;
      },
      error => {
        console.error('There was an error!', error);
      }
    );
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
