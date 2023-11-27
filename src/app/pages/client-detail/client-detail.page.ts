import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { TeachService } from '../../services/teach.service';
import * as moment from 'moment';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.page.html',
  styleUrls: ['./client-detail.page.scss'],
})
export class ClientDetailPage implements OnInit, OnDestroy {
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

  selectedSport:any;
  currentLevel: number = 0;
  clientMonitor:any;
  clientObservation:any;
  clientId:any;
  degrees: any[] = [];
  sportDegrees: any[] = [];
  sports: any[] = [];
  sportSelected:any;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private monitorDataService: MonitorDataService, private teachService: TeachService) {}

  async ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(monitorData => {
      if (monitorData) {
        this.monitorData = monitorData;
  
        this.activatedRoute.params.subscribe(async params => {
          this.clientId = +params['id'];
          if (this.clientId) {
            await this.getClient();
            await this.getDegrees();
            await this.getSports();            

          } else {
            this.goTo('clients');
          }
        });
      }
    });
  }  

  async getClient() {
    try {
      // Fetch client data and wait for the response
      const data: any = await this.teachService.getData(`teach/clients/${this.clientId}`).toPromise();
      const client = data.data;
      if (client) {
        const birthDate = moment(client.birth_date);
        const age = moment().diff(birthDate, 'years');
        client.birth_years = age;
  
        client.degree_sport = 0;
        if(client.sports && client.sports.length){
          if(client.sports[0]){
            client.sports[0].selected = true;
            if(client.sports[0].pivot.degree_id){
              client.degree_sport = client.sports[0].pivot.degree_id;
            }
          }
        }
        this.clientMonitor = client;
        console.log(this.clientMonitor);
      } else {
        // Not a client of monitor
        this.goTo('clients');
      }
    } catch (error) {
      console.error('There was an error fetching clients!', error);
    }
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
      let useSport = 1;
      if(this.clientMonitor && this.clientMonitor.sports && this.clientMonitor.sports.length) {
        if(this.clientMonitor.sports[0].id){
          useSport = this.clientMonitor.sports[0].id;
        }
      }
      this.sportSelected = useSport;
      this.sportDegrees = this.degrees.filter(degree => degree.sport_id === useSport);
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

  changeSport(index:any) {
    let newDegree = 0;
      if(this.clientMonitor.sports[index]){
        this.clientMonitor.sports.forEach((sport:any) => {
          sport.selected = false;
        });
        this.clientMonitor.sports[index].selected = true;
        if(this.clientMonitor.sports[index].pivot.degree_id){
          newDegree = this.clientMonitor.sports[index].pivot.degree_id;
        }

        this.sportSelected = this.clientMonitor.sports[index].id;
      }
    this.clientMonitor.degree_sport = newDegree;
    this.sportDegrees = this.degrees.filter(degree => degree.sport_id === this.clientMonitor.sports[index].id);
    console.log('Sport Degrees:', this.sportDegrees);
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
  
  doShowLevel(sport:any) {
    this.selectedSport=sport;
    if(sport.level){
      this.currentLevel = sport.level;
    }
    else{
      this.currentLevel = 0;
    }
    this.showLevel=true;
  }

  updateLevel() {
    this.selectedSport.level = this.currentLevel;
    this.currentLevel=0;
    this.showLevel=false;
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
