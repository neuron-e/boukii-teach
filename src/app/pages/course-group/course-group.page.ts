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

@Component({
  selector: 'app-course-group',
  templateUrl: './course-group.page.html',
  styleUrls: ['./course-group.page.scss'],
})
export class CourseGroupPage implements OnInit, OnDestroy {
  monitorData: any;
  private subscription: Subscription;

  courseBookings:any;
  courseSport:any;
  subgroupBookings:any;
  courseDateIndex:any;
  monitorSubgroup:any;
  restSubgroups:any;
  degrees: any[] = [];
  sports: any[] = [];

  selectedBooking:any;
  bookingId:any;
  dateBooking:any;
  courseId:any;
  hourStart:any;
  groupId:any;
  subgroupId:any;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private teachService: TeachService, private toastr: ToastrService, private spinnerService: SpinnerService, private translate: TranslateService) {}

  async ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(async monitorData => {
      if (monitorData) {
        this.monitorData = monitorData;
        try {
          this.degrees = await firstValueFrom(this.sharedDataService.fetchDegrees(this.monitorData.active_school));
          this.sports = await firstValueFrom(this.sharedDataService.fetchSports(this.monitorData.active_school));
          console.log('DEGREES LOADED:', this.degrees);
          console.log('DEGREES ANNOTATIONS:', this.degrees.map(d => ({ id: d.id, annotation: d.annotation })));
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
          console.log('Parsed subgroupId:', this.subgroupId, 'type:', typeof this.subgroupId);
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

  loadBookings() {
    this.teachService.getData('teach/courses', this.courseId).subscribe(
      (data:any) => {
        //console.log(data);
        this.courseBookings = data.data;
        this.courseBookings.course_dates.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        this.courseSport = this.sports.find(sport => sport.id === this.courseBookings.sport_id) || this.sports[0];
        this.subgroupBookings = this.courseBookings.booking_users.reduce((acc: any, user: any) => {
          if (acc[user.course_subgroup_id]) {
              acc[user.course_subgroup_id] += 1;
          } else {
              acc[user.course_subgroup_id] = 1;
          }
          return acc;
        }, {});

        // Initialize courseDateIndex to avoid undefined
        this.courseDateIndex = -1;

        const matchingCourseDate = this.courseBookings.course_dates.find((courseDate: any, index: number) => {
          const courseDateOnly = courseDate.date.split('T')[0];
          const courseHourStart = courseDate.hour_start;

          console.log('Comparing dates:', {
            courseDateOnly,
            dateBooking: this.dateBooking,
            courseHourStart,
            hourStart: this.hourStart,
            matches: courseDateOnly === this.dateBooking && courseHourStart === this.hourStart
          });

          if (courseDateOnly === this.dateBooking && courseHourStart === this.hourStart) {
            // Save the index where the match is found
            this.courseDateIndex = index;
            return true;
          }
          return false;
        });

        console.log('Final courseDateIndex:', this.courseDateIndex);
        console.log('courseDateIndex type:', typeof this.courseDateIndex);
        console.log('courseDateIndex >= 0:', this.courseDateIndex >= 0);
        console.log('courseDateIndex + 1:', this.courseDateIndex + 1);
        console.log('Available course dates:', this.courseBookings.course_dates.map((cd: any, idx: number) => ({
          index: idx,
          date: cd.date,
          hour_start: cd.hour_start
        })));

        if (matchingCourseDate) {
          console.log('Matching course date found:', matchingCourseDate);
          // Do something with the matching course date

          const allSubgroups:any[] = [];
          matchingCourseDate.course_groups.forEach((group:any) => {
            //Add the group to the subgroup
            //const groupInfo = { ...group };
            //delete groupInfo.course_subgroups;

            group.course_subgroups.forEach((subgroup:any, index:number) => {
              const degree_data = this.degrees.find(degree => degree.id === subgroup.degree_id) || this.degrees[0] || {};
              const bookings_number = this.subgroupBookings[subgroup.id] || 0;
              console.log(`SUBGROUP ${subgroup.id}:`, {
                degree_id: subgroup.degree_id,
                found_degree: degree_data,
                annotation: degree_data?.annotation,
                subgroup_order: index+1
              });
              allSubgroups.push({
                ...subgroup,
                /*group: groupInfo,*/
                subgroup_order: index+1,
                degree_data: degree_data,
                bookings_number: bookings_number
              });
            });
          });

          console.log('All subgroups created:', allSubgroups);
          console.log('Looking for subgroupId:', this.subgroupId);
          console.log('Available subgroup IDs:', allSubgroups.map(sg => sg.id));

          this.monitorSubgroup = allSubgroups.find(subgroup => subgroup.id === this.subgroupId);
          this.restSubgroups = allSubgroups.filter(subgroup => subgroup.id !== this.subgroupId);

          console.log('Found monitorSubgroup:', this.monitorSubgroup);
          console.log('monitorSubgroup.subgroup_order:', this.monitorSubgroup?.subgroup_order);
          console.log('monitorSubgroup full properties:', {
            id: this.monitorSubgroup?.id,
            monitor_id: this.monitorSubgroup?.monitor_id,
            max_participants: this.monitorSubgroup?.max_participants,
            bookings_number: this.monitorSubgroup?.bookings_number,
            subgroup_order: this.monitorSubgroup?.subgroup_order,
            course_group_id: this.monitorSubgroup?.course_group_id,
            degree_data: this.monitorSubgroup?.degree_data
          });
          console.log('DEGREE ANNOTATION CHECK:', this.monitorSubgroup?.degree_data?.annotation);
          console.log('DEGREE LEAGUE CHECK:', this.monitorSubgroup?.degree_data?.league);
          console.log('SUBGROUP ORDER CHECK:', this.monitorSubgroup?.subgroup_order);
          console.log('FULL DISPLAY STRING:', `${(this.monitorSubgroup?.degree_data?.annotation || this.monitorSubgroup?.degree_data?.league)}-${this.monitorSubgroup?.subgroup_order || '?'}`);
          console.log('Remaining Subgroups:', this.restSubgroups);
        } else {
          console.warn('No matching course date found for:', {
            dateBooking: this.dateBooking,
            hourStart: this.hourStart
          });
          // Set courseDateIndex to 0 as a fallback, or keep it as -1 to show '?'
          // this.courseDateIndex = 0; // Uncomment if you want to default to first date
        }

        this.spinnerService.hide();
      },
      error => {
        console.error('There was an error!', error);
        this.spinnerService.hide();
      }
    );
  }

  getBirthYears(date:string) {
    const birthDate = moment(date);
    return moment().diff(birthDate, 'years');
  }

  getCourseDateDisplay() {
    console.log('getCourseDateDisplay called with courseDateIndex:', this.courseDateIndex);
    if (this.courseDateIndex >= 0) {
      return `${this.courseDateIndex + 1}/${this.courseBookings?.course_dates?.length || 0}`;
    }
    return `?/${this.courseBookings?.course_dates?.length || 0}`;
  }

  getDateFormat(date:string) {
    return moment(date).format('DD-MM-YYYY');
  }

  getDegreeLabel(degree: any): string {
    return degree?.annotation || degree?.name || degree?.league || '';
  }

  isDateBeforeOrEqualToToday(dateString: string): boolean {
    const inputDate = moment(dateString).startOf('day');
    const today = moment().startOf('day');
    return inputDate.isSameOrBefore(today);
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
