import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { Subscription } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { TeachService } from '../../services/teach.service';
import * as moment from 'moment';
import 'moment/locale/fr';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
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

  weatherWeek:any[] = [
    {hour:'08:00',degrees:10,img:'assets/icon/weather_1.png'},
    {hour:'12:00',degrees:7,img:'assets/icon/weather_12.png'},
    {hour:'17:00',degrees:10,img:'assets/icon/weather_1.png'},
  ];


  bookingsToday: any[] = [];
  courseCollectiveToday: number = 0;
  coursePrivateToday: number = 0;
  courseActivityToday: number = 0;
  degrees: any[] = [];
  sports: any[] = [];

  todayDate:string = moment().format('YYYY-MM-DD');
  todayDateFull:string = moment().locale('fr').format('dddd, D MMMM');

  constructor(private router: Router, private menuService: MenuService, private monitorDataService: MonitorDataService, private teachService: TeachService) {}

  ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(data => {
      if (data) {
        this.monitorData = data;
        this.loadBookings();
        this.getDegrees();
        this.getSports();
      }
    });

    this.teachService.getData('teach/getAgenda', null, { date_start: '2023-11-01', date_end: '2023-11-30' }).subscribe(
      data => {
        console.log(data);
      },
      error => {
        console.error('There was an error!', error);
      }
    );
    this.teachService.getData('teach/clients').subscribe(
      data => {
        console.log(data);
      },
      error => {
        console.error('There was an error!', error);
      }
    );
    this.teachService.getData('teach/monitor/pastBookings').subscribe(
      data => {
        console.log(data);
      },
      error => {
        console.error('There was an error!', error);
      }
    );
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

  loadBookings() {
    this.teachService.getData('teach/getAgenda').subscribe(
      (data:any) => {
        console.log(data);
        this.processBookings(data.data.bookings);
      },
      error => {
        console.error('There was an error!', error);
      }
    );
  }

  processBookings(bookings: any[]) {
    const uniqueCourseGroups = new Map();
    this.bookingsToday = [];
    this.courseCollectiveToday = 0;
    this.coursePrivateToday = 0;
  
    bookings.forEach(booking => {
      if (booking.course) {
        let key = `${booking.course_id}`;
        if(booking.course.course_type == 1){
          key = `${booking.course_id}-${booking.course_group_id}`;
        }
        if (!uniqueCourseGroups.has(key)) {
          uniqueCourseGroups.set(key, {
            ...booking,
            all_clients: [booking.client]
          });
          this.bookingsToday.push(uniqueCourseGroups.get(key));
        } else {
          uniqueCourseGroups.get(key).all_clients.push(booking.client);
        }
  
        // Count course types
        if (booking.course.course_type == 1) {
          this.courseCollectiveToday++;
        } else if (booking.course.course_type == 2) {
          this.coursePrivateToday++;
        }
      }
    });
  
    console.log('Processed Bookings:', this.bookingsToday);
    console.log('Collective Courses Today:', this.courseCollectiveToday);
    console.log('Private Courses Today:', this.coursePrivateToday);
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
    this.subscription.unsubscribe();
  }

}
