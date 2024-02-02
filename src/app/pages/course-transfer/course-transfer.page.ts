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
  selector: 'app-course-transfer',
  templateUrl: './course-transfer.page.html',
  styleUrls: ['./course-transfer.page.scss'],
})
export class CourseTransferPage implements OnInit, OnDestroy {
  monitorData: any;
  private subscription: Subscription;
  
  confirmTransfer:boolean=false;

  courseBookings:any;
  courseSport:any;
  sportDegrees:any[] = [];
  subgroupBookings:any;
  courseDateIndex:any;
  monitorSubgroup:any;
  restSubgroups:any;
  degrees: any[] = [];
  sports: any[] = [];
  languages: any[] = [];

  selectedBooking:any;
  bookingId:any;
  dateBooking:any;
  courseId:any;
  hourStart:any;
  groupId:any;
  subgroupId:any;

  checkedBookings: any[] = [];
  selectedSubgroup: any;
  selectedClients: any[] = [];

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
          this.hourStart = params['hour'];
          this.groupId = +params['group'];
          this.subgroupId = +params['subgroup'];
          if (this.bookingId && this.dateBooking && this.courseId && this.hourStart && this.groupId && this.subgroupId) {
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
        this.courseBookings = data.data;
        this.courseBookings.course_dates.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        this.sportDegrees = this.degrees.filter(degree => degree.sport_id === this.courseBookings.sport_id);
        this.courseSport = this.sports.find(sport => sport.id === this.courseBookings.sport_id) || this.sports[0];
        this.subgroupBookings = this.courseBookings.booking_users.reduce((acc: any, user: any) => {
          if (acc[user.course_subgroup_id]) {
              acc[user.course_subgroup_id].push(user);
          } else {
              acc[user.course_subgroup_id] = [user];
          }
          return acc;
        }, {});

        //console.log(this.subgroupBookings);

        const matchingCourseDate = this.courseBookings.course_dates.find((courseDate: any, index: number) => {
          const courseDateOnly = courseDate.date.split('T')[0];
          const courseHourStart = courseDate.hour_start;

          if (courseDateOnly === this.dateBooking && courseHourStart === this.hourStart) {
            // Save the index where the match is found
            this.courseDateIndex = index;
            return true;
          }
          return false;
        });

        if (matchingCourseDate) {
          //console.log('Matching course date:', matchingCourseDate);
          // Do something with the matching course date

          const allSubgroups:any[] = [];
          matchingCourseDate.course_groups.forEach((group:any) => {
            //Add the group to the subgroup
            //const groupInfo = { ...group };
            //delete groupInfo.course_subgroups;

            group.course_subgroups.forEach((subgroup:any, index:number) => {
              const degree_data = this.degrees.find(degree => degree.id === subgroup.degree_id) || this.degrees[0];
              const bookings_number = this.subgroupBookings[subgroup.id];
              allSubgroups.push({
                ...subgroup, 
                /*group: groupInfo,*/ 
                group_id: group.id,
                subgroup_order: index+1,
                degree_data: degree_data,
                bookings_number: bookings_number
              });
            });
          });

          this.monitorSubgroup = allSubgroups.find(subgroup => subgroup.id === this.subgroupId);
          this.restSubgroups = allSubgroups.filter(subgroup => subgroup.id !== this.subgroupId);

          // Outputs
          //console.log('Specified Subgroup:', this.monitorSubgroup);
          //console.log('Remaining Subgroups:', this.restSubgroups);
        } else {
          //console.log('No matching course date found');
        }

        this.spinnerService.hide();
      },
      error => {
        console.error('There was an error!', error);
        this.spinnerService.hide();
      }
    );
  }

  getClientLevel(sports: any[], sport_id: number): number {
    const foundObject = sports.find(obj => obj.id === sport_id);
    return foundObject ? foundObject.pivot.degree_id : 0;
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

  isBookingChecked(booking:any): boolean {
    return this.checkedBookings.includes(booking);
  }

  handleCheckboxChange(booking: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.checkedBookings.push(booking);
    } else {
      const index = this.checkedBookings.indexOf(booking);
      if (index > -1) {
        this.checkedBookings.splice(index, 1);
      }
    }
  }  

  isDisabledContinue(): boolean {
    return this.checkedBookings.length === 0;
  }

  isDisabledSave(): boolean {
    return !this.selectedSubgroup;
  }

  continueTransfer() {
    if(!this.isDisabledContinue()){
      this.confirmTransfer = true;
      //console.log('Checked Bookings:', this.checkedBookings);
    }
  }

  saveTransfer() {
    if (!this.isDisabledSave() && !this.isDisabledContinue()) {
      this.checkedBookings.forEach(booking => {
        this.selectedClients.push(booking.client_id);
      });
      //console.log('Old Subgroup:', this.monitorSubgroup);
      //console.log('New Subgroup:', this.selectedSubgroup);
      //console.log('Clients to transfer:', this.selectedClients);
      const isConfirmed = confirm('Êtes-vous sûr de vouloir transférer ces étudiants?');
      if (isConfirmed) {
        this.spinnerService.show();
      
        const data = {
          initialSubgroupId: this.monitorSubgroup.id,
          targetSubgroupId: this.selectedSubgroup.id,
          clientIds: this.selectedClients,
          moveAllDays: true
        };
      
        firstValueFrom(this.teachService.postData('clients/transfer', data))
          .then(response => {
            //console.log('Transfer successful:', response);
            this.spinnerService.hide();
            this.toastr.success(this.translate.instant('toast.registered_correctly'));
            this.goTo('course-detail', this.bookingId, this.dateBooking);
          })
          .catch(error => {
            console.error('Error during transfer:', error);
            this.spinnerService.hide();
            this.toastr.error(this.translate.instant('toast.error'));
          });
      }
    }
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
