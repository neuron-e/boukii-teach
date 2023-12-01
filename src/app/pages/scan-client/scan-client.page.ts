import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuService } from '../../services/menu.service';
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
  selector: 'app-scan-client',
  templateUrl: './scan-client.page.html',
  styleUrls: ['./scan-client.page.scss'],
})
export class ScanClientPage implements OnInit, OnDestroy {
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

  clientId:any;
  monitors:any[] = [];
  stations:any[] = [];
  schools:any[] = [];
  degrees:any[] = [];
  sports:any[] = [];
  languages: any[] = [];
  clientMonitor:any;
  bookingsToday:any[];
  bookingsTomorrow:any[];
  todayDateFull:string = moment().locale('fr').format('dddd, D MMMM');
  tomorrowDateFull:string = moment().add(1, 'days').locale('fr').format('dddd, D MMMM');
  todayDateFormatted: string = moment().format('YYYY-MM-DD');
  tomorrowDateFormatted: string = moment().add(1, 'days').format('YYYY-MM-DD');

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private changeDetectorRef: ChangeDetectorRef, private menuService: MenuService, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private teachService: TeachService, private toastr: ToastrService, private spinnerService: SpinnerService) {}

  async ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(async data => {
      if (data) {
        this.monitorData = data;
        try {
          this.degrees = await firstValueFrom(this.sharedDataService.fetchDegrees(this.monitorData.active_school));
          this.sports = await firstValueFrom(this.sharedDataService.fetchSports(this.monitorData.active_school));
          this.languages = await firstValueFrom(this.sharedDataService.fetchLanguages());
          this.stations = await firstValueFrom(this.sharedDataService.fetchStations());
          this.schools = await firstValueFrom(this.sharedDataService.fetchSchools());
        } catch (error) {
          console.error('Error fetching data:', error);
          this.toastr.error("Erreur lors du chargement des données");
        }
  
        this.activatedRoute.params.subscribe( async params => {
          this.clientId = +params['client'];
          console.log(this.clientId);
          if(this.clientId){
            this.spinnerService.show();
            await this.getMonitors();
            this.getClient(this.clientId);
            this.loadBookings(this.clientId);
          }
          else{
            this.toastr.error('Aucun client trouvé');
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

  async getMonitors() {
    try {
      const data: any = await this.teachService.getData('monitors').toPromise();
      console.log(data);
      this.monitors = data.data;
    } catch (error) {
      console.error('There was an error!', error);
    }
  }

  getClient(client_id:any) {
    this.spinnerService.show();
    this.teachService.getData(`clients/${client_id}`).subscribe(
      (data:any) => {
        const client = data.data;
        this.spinnerService.hide();
        if (client) {
          client.birth_years = this.getBirthYears(client.birth_date);
          this.clientMonitor = client;
          this.changeDetectorRef.detectChanges();
          console.log(this.clientMonitor);
        } else {
          this.toastr.error('Aucun client trouvé');
          this.goTo('home');
        }
      },
      error => {
        console.error('There was an error fetching clients!', error);
        this.spinnerService.hide();
      }
    );
  } 

  loadBookings(client_id:any) {
    this.spinnerService.show();
    this.teachService.getData('teach/clients/' + client_id + '/bookings', null, { date_start: this.todayDateFormatted, date_end: this.tomorrowDateFormatted }).subscribe(
      (data: any) => {
        console.log(data);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const bookingsForToday = data.data.filter((booking:any) => this.isSameDay(new Date(booking.date), today));
        const bookingsForTomorrow = data.data.filter((booking:any) => this.isSameDay(new Date(booking.date), tomorrow));

        this.bookingsToday = this.addFieldsBookings(bookingsForToday);
        this.bookingsTomorrow = this.addFieldsBookings(bookingsForTomorrow);

        this.changeDetectorRef.detectChanges();

        this.spinnerService.hide();

        console.log('Bookings for Today:', this.bookingsToday);
        console.log('Bookings for Tomorrow:', this.bookingsTomorrow);
      },
      error => {
        console.error('There was an error!', error);
        this.spinnerService.hide();
      }
    );
  }

  isSameDay(date1:any, date2:any) {
      return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
  }

  addFieldsBookings(bookings:any) {
      return bookings.map((booking:any) => {
          return {
              ...booking,
              monitor_data: this.monitors.find(monitor => monitor.id === booking.monitor_id),
              school_data: this.schools.find(school => school.id === booking.course.school_id),
              station_data: this.stations.find(station => station.id === booking.course.station_id),
              degree_data: this.degrees.find(degree => degree.id === booking.degree_id),
              sport_data: this.sports.find(sport => sport.id === booking.course.sport_id)
          };
      });
  }


  getBirthYears(date:string) {
    const birthDate = moment(date);
    return moment().diff(birthDate, 'years');
  }  

  formatTimeRange(hour_start:string, hour_end:string) {
    const formatTime = (time:string) => time.substring(0, 5);
    return `${formatTime(hour_start)}-${formatTime(hour_end)}`;
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
