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
  languages: any[] = [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private teachService: TeachService, private toastr: ToastrService, private spinnerService: SpinnerService, private translate: TranslateService) {}

  async ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(async monitorData => {
      if (monitorData) {
        this.monitorData = monitorData;
        try {
          this.degrees = await firstValueFrom(this.sharedDataService.fetchDegrees(this.monitorData.active_school));
          this.sports = await firstValueFrom(this.sharedDataService.fetchSports(this.monitorData.active_school));
          this.languages = await firstValueFrom(this.sharedDataService.fetchLanguages());
          console.log('Client-detail loaded degrees:', this.degrees.length);
          console.log('Client-detail loaded sports:', this.sports.length);
        } catch (error) {
          console.error('Error fetching data:', error);
          this.toastr.error(this.translate.instant('toast.error_loading_data'));
          // Initialize with empty arrays to prevent undefined errors
          this.degrees = [];
          this.sports = [];
          this.languages = [];
        }
  
        this.activatedRoute.params.subscribe(async params => {
          this.clientId = +params['id'];
          if (this.clientId) {
            this.spinnerService.show();
            await this.getClient();
            this.spinnerService.hide();

          } else {
            this.goTo('clients');
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

          // Filter by sport
        let useSport = 1;
        if(this.clientMonitor && this.clientMonitor.sports && this.clientMonitor.sports.length) {
          if(this.clientMonitor.sports[0].id){
            useSport = this.clientMonitor.sports[0].id;
          }
        }
        this.sportSelected = useSport;
        console.log('Available degrees:', this.degrees);
        console.log('Selected sport:', useSport);
        this.sportDegrees = this.degrees && this.degrees.length > 0 ? this.degrees.filter(degree => degree.sport_id === useSport) : [];
        console.log('Filtered sport degrees:', this.sportDegrees);
      } else {
        // Not a client of monitor
        this.goTo('clients');
      }
    } catch (error) {
      console.error('There was an error fetching clients!', error);
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
    this.sportDegrees = this.degrees && this.degrees.length > 0 ? this.degrees.filter(degree => degree.sport_id === this.clientMonitor.sports[index].id) : [];
    console.log('Sport Degrees after change:', this.sportDegrees);
  }

  getBirthYears(date:string) {
    const birthDate = moment(date);
    return moment().diff(birthDate, 'years');
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
    if (this.subscription) {
        this.subscription.unsubscribe();
    }
  }

}
