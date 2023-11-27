import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { TeachService } from '../../services/teach.service';
import * as moment from 'moment';

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

  selectedBooking:any;
  bookingId:any;
  dateBooking:any;
  clientIdBooking:any;
  sportIdBooking:any;
  clientMonitor:any;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private monitorDataService: MonitorDataService, private teachService: TeachService) {}

  async ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe( monitorData => {
      if (monitorData) {
        this.monitorData = monitorData;
  
        this.activatedRoute.params.subscribe( async params => {
          this.bookingId = +params['id'];
          this.dateBooking = params['date'];
          this.clientIdBooking = +params['client'];
          this.sportIdBooking = +params['sport'];
          if (this.bookingId && this.dateBooking && this.clientIdBooking && this.sportIdBooking) {
            await this.getDegrees();
            await this.getSports();
            this.loadBookings();
          } else {
            this.goTo('home');
          }
        });
      }
    });
  }

  loadBookings() {
    this.teachService.getData('teach/getAgenda', null, { date_start: this.dateBooking, date_end: this.dateBooking }).subscribe(
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

    this.getClient();

    console.log('Processed Bookings:', this.bookingsCurrent);
    console.log('Selected Booking:', this.selectedBooking);
  }

  getClient() {
    this.teachService.getData(`teach/clients/${this.clientIdBooking}`).subscribe(
      (data:any) => {
        const client = data.data;
        if (client) {
          const birthDate = moment(client.birth_date);
          const age = moment().diff(birthDate, 'years');
          client.birth_years = age;

          let sport = client.sports.find((sport:any) => sport.id === this.sportIdBooking);
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
          console.log(this.clientMonitor);
        } else {
          //Not a client of monitor
          this.goTo('clients');
        }
      },
      error => {
        console.error('There was an error fetching clients!', error);
      }
    );
  }

  async getDegrees() {
    try {
      const data: any = await this.teachService.getData('degrees').toPromise();
      console.log(data);
      this.degrees = data.data;
  
      this.degrees.sort((a, b) => a.degree_order - b.degree_order);
  
      // Inactive color
      this.degrees.forEach(degree => {
        degree.inactive_color = this.lightenColor(degree.color, 30);
      });
  
      // Filter by sport
      this.sportDegrees = this.degrees.filter(degree => degree.sport_id === this.sportIdBooking);
      console.log('Processed Degrees:', this.degrees);
      console.log('Sport Degrees:', this.sportDegrees);
    } catch (error) {
      console.error('There was an error!', error);
    }
  }  

  async getSports() {
    try {
      const data: any = await this.teachService.getData('sports').toPromise();
      console.log(data);
      this.sports = data.data;
    } catch (error) {
      console.error('There was an error!', error);
    }
  }

  getBirthYears(date:string) {
    const birthDate = moment(date);
    return moment().diff(birthDate, 'years');
  }

  lightenColor(hexColor:any, percent:any) {
    let r:any = parseInt(hexColor.substring(1, 3), 16);
    let g:any = parseInt(hexColor.substring(3, 5), 16);
    let b:any = parseInt(hexColor.substring(5, 7), 16);

    // Increase the lightness
    r = Math.round(r + (255 - r) * percent / 100);
    g = Math.round(g + (255 - g) * percent / 100);
    b = Math.round(b + (255 - b) * percent / 100);

    // Convert RGB back to hex
    r = r.toString(16).padStart(2, '0');
    g = g.toString(16).padStart(2, '0');
    b = b.toString(16).padStart(2, '0');

    return `#${r}${g}${b}`;
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
