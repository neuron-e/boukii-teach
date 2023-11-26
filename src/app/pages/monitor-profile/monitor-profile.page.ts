import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { TeachService } from '../../services/teach.service';
import * as moment from 'moment';

@Component({
  selector: 'app-monitor-profile',
  templateUrl: './monitor-profile.page.html',
  styleUrls: ['./monitor-profile.page.scss'],
})
export class MonitorProfilePage implements OnInit, OnDestroy {
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

  showGeneral:boolean = true;
  showSports:boolean = false;
  showWork:boolean = false;
  showWinter: boolean = true;
  showSummer: boolean = false;
  showOther: boolean = false;
  showLevel:boolean = false;

  isMarried:boolean = false;
  isSingle:boolean = false;
  isWorkYes:boolean = false;
  isWorkNo:boolean = false;
  isChildYes:boolean = false;
  isChildNo:boolean = false;

  dataSports:any[] = [
    {id:1,name:'Ski',image:'assets/icon/icons-outline-disciplinas-1.svg',checked:false},
    {id:2,name:'Snowboard',image:'assets/icon/icons-outline-disciplinas-2.svg',checked:false},
    {id:3,name:'Telemark',image:'assets/icon/icons-outline-disciplinas-3.svg',checked:false},
    {id:4,name:'S.Rando',image:'assets/icon/icons-outline-disciplinas-4.svg',checked:false},
  ];

  selectedSport:any;
  currentLevel: number = 0;

  email: string;
  phone: string;
  telephone: string;
  firstName: string;
  lastName: string;
  userName: string;
  birth: string;
  address: string;
  city: string;
  cp: string;
  country: string;

  activeSchool: number;
  avs: string;
  bankDetails: string;
  children: boolean;
  civilStatus: boolean;
  familyAllowance: boolean;
  image: string;
  language1Id: number;
  language2Id: number;
  language3Id: number;
  partnerPercentage: number;
  partnerWorkLicense: string;
  partnerWorks: boolean;
  province: string;
  updatedAt: string;
  userId: number;
  workLicense: string;

  constructor(private router: Router, private monitorDataService: MonitorDataService, private teachService: TeachService) {}

  ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(data => {
      if (data) {
        this.monitorData = data;
        //Initiliaze data
        this.email = data.email;
        this.phone = data.phone;
        this.telephone = data.telephone;
        this.firstName = data.first_name;
        this.lastName = data.last_name;
        this.userName = data.first_name; //missing username
        this.birth = moment(data.birth_date).format('YYYY-MM-DD');
        this.address = data.address;
        this.city = data.city;
        this.cp = data.cp;
        this.country = data.country;

        this.activeSchool = data.active_school;
        this.avs = data.avs;
        this.bankDetails = data.bank_details;
        this.children = data.children;
        this.civilStatus = data.civil_status;
        this.familyAllowance = data.family_allowance;
        this.image = data.image;
        this.language1Id = data.language1_id;
        this.language2Id = data.language2_id;
        this.language3Id = data.language3_id;
        this.partnerPercentage = data.partner_percentage;
        this.partnerWorkLicense = data.partner_work_license;
        this.partnerWorks = data.partner_works;
        this.province = data.province;
        this.updatedAt = data.updated_at;
        this.userId = data.user_id;
        this.workLicense = data.work_license;
      }
    });
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
    this.selectedSport.checked=true;
    this.selectedSport.level = this.currentLevel;
    this.currentLevel=0;
    this.showLevel=false;
  }

  disableChildButton(): boolean {
    const baseCondition = (this.isMarried || this.isSingle) && (this.isChildYes || this.isChildNo);
    if (!baseCondition) {
      return true;
    }
    if (this.isMarried && (!this.isWorkYes && !this.isWorkNo)) {
      return true;
    }
    return false;
  }  

  saveChanges(): void {
    const updateData = {
      //email: this.email,
      phone: this.phone,
      telephone: this.telephone,
      first_name: this.firstName,
      last_name: this.lastName,
      //user_name: this.userName, -> missing username
      birth_date: moment.utc(this.birth).format('YYYY-MM-DDTHH:mm:ss.SSS') + '000Z',
      address: this.address,
      city: this.city,
      cp: this.cp,
      country: this.country,

      // Additional fields
      active_school: this.activeSchool,
      avs: this.avs,
      bank_details: this.bankDetails,
      children: this.children,
      partner_work_license: this.partnerWorkLicense,
      work_license: this.workLicense
    };

    this.teachService.updateData('monitors', this.monitorData.id, updateData).subscribe(
      response => {
        // Handle response
        console.log('Update successful', response);
        this.goTo('monitor-detail');
      },
      error => {
        // Handle error
        console.error('Update failed', error);
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
