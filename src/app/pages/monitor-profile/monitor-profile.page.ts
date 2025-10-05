import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, filter, firstValueFrom, forkJoin } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { SharedDataService } from '../../services/shared-data.service';
import { TeachService } from '../../services/teach.service';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../services/spinner.service';
import { TranslateService } from '@ngx-translate/core';
import { MOCK_COUNTRIES } from '../../mocks/countries-data';
import { MOCK_PROVINCES } from '../../mocks/province-data';
import * as moment from 'moment';

@Component({
  selector: 'app-monitor-profile',
  templateUrl: './monitor-profile.page.html',
  styleUrls: ['./monitor-profile.page.scss'],
})
export class MonitorProfilePage implements OnInit, OnDestroy {
  monitorData: any;
  private subscription: Subscription;

  showPhotoMonitor: boolean = false;

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
  showChangePassword:boolean = false;

  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  isMarried:boolean = false;
  isSingle:boolean = false;
  isWorkYes:boolean = false;
  isWorkNo:boolean = false;
  isChildYes:boolean = false;
  isChildNo:boolean = false;

  languages: any[] = [];
  sports: any[] = [];
  degrees: any[] = [];
  filteredSports: any[] = [];
  sportDegrees: any[] = [];
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
  civilStatus: any;
  familyAllowance: boolean;
  image: string;
  language1Id: any;
  language2Id: any;
  language3Id: any;
  language4Id: any;
  language5Id: any;
  language6Id: any;
  partnerPercentage: number;
  partnerWorkLicense: string;
  partnerWorks: boolean;
  province: string;
  updatedAt: string;
  userId: number;
  workLicense: string;
  worldCountry: string;

  typeSport:number=1;

  countries = MOCK_COUNTRIES;
  provinces = MOCK_PROVINCES;

  constructor(private router: Router, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private teachService: TeachService, private toastr: ToastrService, private spinnerService: SpinnerService, private translate: TranslateService) {}

  async ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(async data => {
      if (data) {
        this.spinnerService.show();
        this.monitorData = data;
        //console.log(this.countries);
        //console.log(this.provinces);
        try {
          this.languages = await firstValueFrom(this.sharedDataService.fetchLanguages());
          await this.getMonitorSports();
          this.degrees = await firstValueFrom(this.sharedDataService.fetchDegrees(this.monitorData.active_school));
          this.degrees.sort((a, b) => a.degree_order - b.degree_order);
          this.sports = await firstValueFrom(this.sharedDataService.fetchSports(this.monitorData.active_school));
          this.sports.sort((a, b) => a.id - b.id);
          this.sports = this.sports.map(sport => {
            // Check if this sport's id is in monitorData.sports
            const isChecked = this.monitorData.sports.some((monitorSport:any) => monitorSport.id === sport.id);
            return { ...sport, checked: isChecked };
          });
          
          this.filteredSports = this.sports.filter(sport => sport.sport_type === this.typeSport);
        } catch (error) {
          console.error('Error fetching data:', error);
          this.toastr.error(this.translate.instant('toast.error_loading_data'));
        }

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
        this.language4Id = data.language4_id;
        this.language5Id = data.language5_id;
        this.language6Id = data.language6_id;
        this.partnerPercentage = data.partner_percentaje;
        this.partnerWorkLicense = data.partner_work_license;
        this.partnerWorks = data.partner_works;
        this.province = data.province;
        this.updatedAt = data.updated_at;
        this.userId = data.user_id;
        this.workLicense = data.work_license;
        this.worldCountry = data.world_country;

        this.spinnerService.hide();
      }
    });
  }

  async getMonitorSports() {
    try {
      const data: any = await this.teachService.getData('monitor-sports-degrees', null, {
        monitor_id: this.monitorData.id,
        school_id: this.monitorData.active_school
      }).toPromise();
      this.sportDegrees = data.data;
      console.log('GET MONITOR SPORTS DEBUG: Loaded sport degrees:', this.sportDegrees);
    } catch (error) {
      console.error('GET MONITOR SPORTS DEBUG: Error loading sports:', error);
    }
  }

  filterSports(type:number) {
    this.filteredSports = this.sports.filter(sport => sport.sport_type === type);
    this.typeSport = type;
  }

  checkSport(id:any){
    this.sports = this.sports.map(sport => {
      if (sport.id === id) {
        return { ...sport, checked: !sport.checked };
      }
      return sport;
    });
    this.filterSports(this.typeSport);
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

  saveSports() {
    this.spinnerService.show();

    console.log('SAVE SPORTS DEBUG: Monitor data:', this.monitorData);
    console.log('SAVE SPORTS DEBUG: Active school:', this.monitorData.active_school);
    console.log('SAVE SPORTS DEBUG: Current sports:', this.sports);
    console.log('SAVE SPORTS DEBUG: Current sportDegrees:', this.sportDegrees);
    console.log('SAVE SPORTS DEBUG: Degrees:', this.degrees);

    const checkedSports = this.sports.filter(sport => sport.checked);
    const addObjects = checkedSports.filter(checkedSport =>
      !this.monitorData.sports.some((monitorSport:any) => monitorSport.id === checkedSport.id));
    const deleteObjects = this.monitorData.sports.filter((monitorSport:any) =>
      !checkedSports.some(checkedSport => checkedSport.id === monitorSport.id));

    console.log('SAVE SPORTS DEBUG: Checked sports:', checkedSports);
    console.log('SAVE SPORTS DEBUG: Sports to add:', addObjects);
    console.log('SAVE SPORTS DEBUG: Sports to delete:', deleteObjects);

    const addRequests = addObjects.map(obj => {
      let filteredDegrees = this.degrees.filter(degree => degree.sport_id === obj.id);
      let degreeId;

      if (filteredDegrees && filteredDegrees.length > 0) {
        // Use the highest degree for the sport
        degreeId = filteredDegrees[filteredDegrees.length - 1].id;
      } else if (this.degrees && this.degrees.length > 0) {
        // Use the first available degree if no sport-specific degrees found
        degreeId = this.degrees[0].id;
      } else {
        // Skip creating this entry if no degrees are available
        console.warn(`No degrees available for sport ${obj.id}, skipping`);
        return null;
      }

      const data = {
        sport_id: obj.id,
        school_id: this.monitorData.active_school,
        degree_id: degreeId,
        monitor_id: this.monitorData.id,
        salary_level: 1,
        allow_adults: true,
        is_default: false
      };
      console.log('SAVE SPORTS DEBUG: Adding sport with data:', data);
      return this.teachService.postData('monitor-sports-degrees', data);
    }).filter(request => request !== null); // Remove null requests

    const deleteRequests = deleteObjects.map((obj:any) => {
      const sportDegreeId = this.sportDegrees.find(sd => sd.sport_id === obj.id && sd.monitor_id === this.monitorData.id)?.id;
      if (sportDegreeId) {
        console.log('SAVE SPORTS DEBUG: Deleting sport degree id:', sportDegreeId);
        return this.teachService.deleteData('monitor-sports-degrees', sportDegreeId);
      }
      return null;
    }).filter((request:any) => request !== null);

    const allRequests = [...addRequests, ...deleteRequests];

    if (allRequests.length > 0) {
      console.log('SAVE SPORTS DEBUG: Total requests to execute:', allRequests.length);
      forkJoin(allRequests).subscribe({
        next: (results) => {
          console.log('SAVE SPORTS DEBUG: All operations completed successfully:', results);
          this.spinnerService.hide();
          this.toastr.success(this.translate.instant('toast.updated_correctly'));
          this.monitorDataService.fetchMonitorData(this.monitorData.id);
          this.router.navigate(['home']);
        },
        error: (error) => {
          console.error('SAVE SPORTS DEBUG: Error occurred:', error);
          this.spinnerService.hide();
          this.toastr.error(this.translate.instant('toast.update_failed'));
        }
      });
    } else {
      console.log('SAVE SPORTS DEBUG: No changes to save');
      this.spinnerService.hide();
      this.toastr.info(this.translate.instant('toast.no_changes'));
      this.router.navigate(['home']);
    }
  }

  saveChanges(): void {
    this.spinnerService.show();

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
      language1_id: this.language1Id,
      language2_id: this.language2Id,
      language3_id: this.language3Id,
      language4_id: this.language4Id,
      language5_id: this.language5Id,
      language6_id: this.language6Id,

      // Additional fields
      active_school: this.activeSchool,
      avs: this.avs,
      bank_details: this.bankDetails,
      children: this.children,
      civil_status: this.civilStatus,
      family_allowance: this.familyAllowance,
      partner_percentaje: this.partnerPercentage,
      partner_work_license: this.partnerWorkLicense,
      partner_works: this.partnerWorks,
      province: this.province,
      work_license: this.workLicense,
      world_country: this.worldCountry
    };

    this.teachService.updateData('monitors', this.monitorData.id, updateData).subscribe(
      response => {
        // Handle response
        //console.log('Update successful', response);
        //Update monitor subscription
        this.monitorDataService.fetchMonitorData(this.monitorData.id);
        this.spinnerService.hide();
        this.toastr.success(this.translate.instant('toast.updated_correctly'));
        this.goTo('home');
      },
      error => {
        // Handle error
        this.spinnerService.hide();
        this.toastr.error(this.translate.instant('toast.update_failed'));
        console.error('Update failed', error);
      }
    );
  }

  changeMonitorPhoto(fileData: { base64: string, isVideo: boolean }): void {
    if(fileData.base64) {
      this.spinnerService.show();

      const updateData = {
        image: fileData.base64,

        //Required for put
        phone: this.phone,
        telephone: this.telephone,
        first_name: this.firstName,
        last_name: this.lastName,
        birth_date: moment.utc(this.birth).format('YYYY-MM-DDTHH:mm:ss.SSS') + '000Z',
        address: this.address,
        city: this.city,
        cp: this.cp,
        country: this.country,
        avs: this.avs,
        bank_details: this.bankDetails,
        children: this.children,
        partner_work_license: this.partnerWorkLicense,
        work_license: this.workLicense
      };

      this.teachService.updateData('monitors', this.monitorData.id, updateData).subscribe(
        response => {
          // Handle response
          //console.log('Update successful', response);
          //Update monitor subscription
          this.monitorDataService.fetchMonitorData(this.monitorData.id);
          this.spinnerService.hide();
          this.toastr.success(this.translate.instant('toast.updated_correctly'));
          this.goTo('home');
        },
        error => {
          // Handle error
          this.spinnerService.hide();
          this.toastr.error(this.translate.instant('toast.update_failed'));
          console.error('Update failed', error);
        }
      );
    }
  }

  togglePhotoMonitor(): void {
    this.showPhotoMonitor = !this.showPhotoMonitor;
  }

  changePassword(): void {
    // Validation
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.toastr.error(this.translate.instant('toast.fill_all_fields'));
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error(this.translate.instant('toast.passwords_dont_match'));
      return;
    }

    if (this.newPassword.length < 6) {
      this.toastr.error(this.translate.instant('toast.password_min_length'));
      return;
    }

    this.spinnerService.show();

    const changePasswordData = {
      current_password: this.currentPassword,
      new_password: this.newPassword,
      new_password_confirmation: this.confirmPassword
    };

    this.teachService.postData('teach/change-password', changePasswordData).subscribe(
      response => {
        this.spinnerService.hide();
        this.toastr.success(this.translate.instant('toast.password_changed'));
        // Reset form
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.showChangePassword = false;
        this.showGeneral = true;
      },
      error => {
        this.spinnerService.hide();
        const errorMessage = error.error?.message || this.translate.instant('toast.password_change_failed');
        this.toastr.error(errorMessage);
        console.error('Password change failed', error);
      }
    );
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
