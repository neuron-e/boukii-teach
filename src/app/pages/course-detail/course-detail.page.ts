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
  selector: 'app-course-detail',
  templateUrl: './course-detail.page.html',
  styleUrls: ['./course-detail.page.scss'],
})
export class CourseDetailPage implements OnInit, OnDestroy {
  monitorData: any;
  private subscription: Subscription;

  currentDateFull:string;
  bookingsCurrent: any[] = [];
  courseBookings:any;
  degrees: any[] = [];
  sports: any[] = [];
  languages: any[] = [];

  selectedBooking:any;
  bookingId:any;
  bookingIdFull:any;
  isSubgroup:boolean;
  dateBooking:any;
  // Asistencia inline
  private bookingUserByClient: Map<number, any> = new Map();

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private teachService: TeachService, private toastr: ToastrService, private spinnerService: SpinnerService, private translate: TranslateService) {
    this.translate.onLangChange.subscribe(lang => {
      if (this.dateBooking) {
        this.updateDate(this.dateBooking, lang.lang);
      }
    });
  }

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
          if (params['id'].startsWith('s-')) {
            this.bookingIdFull = params['id'];
            this.bookingId = +params['id'].substring(2);
            this.isSubgroup = true;
          } else {
            this.bookingIdFull = params['id'];
            this.bookingId = +params['id'];
            this.isSubgroup = false;
          }
          this.dateBooking = params['date'];
          if (this.bookingIdFull && this.bookingId && this.dateBooking) {
            this.spinnerService.show();
            this.updateDate(this.dateBooking, this.translate.currentLang);
            this.loadBookings();
            //this.loadCourses();
          } else {
            this.goTo('home');
          }
        });
      }
    });
  }

  updateDate(date: string, lang: string) {
    moment.locale(lang);
    this.currentDateFull = moment(date).format('D MMMM YYYY');
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

  loadCourses() {
    this.teachService.getData('teach/courses', '15').subscribe(
      (data:any) => {
        //console.log(data);
        this.courseBookings = data.data;
        //console.log(this.courseBookings);
        this.spinnerService.hide();
      },
      error => {
        console.error('There was an error!', error);
        this.spinnerService.hide();
      }
    );
  }

  loadBookings() {
    const searchData:any = {
      date_start: this.dateBooking, date_end: this.dateBooking
    };
    if(this.monitorData.active_school){
      searchData.school_id = this.monitorData.active_school;
    }
    this.teachService.getData('teach/getAgenda', null, searchData).subscribe(
      (data:any) => {
        //console.log(data);
        this.processBookings(data.data.bookings,data.data.subgroups);
      },
      error => {
        console.error('There was an error!', error);
        this.spinnerService.hide();
      }
    );
  }

  processBookings(bookings: any[], subgroups: any[]) {
    const uniqueCourseGroups = new Map();
    this.bookingsCurrent = [];
  
    bookings.forEach(booking => {
      if (booking.course) {
        let key = `${booking.course_id}`;
        if(booking.course.course_type == 1){
          key = `${booking.course_id}-${booking.course_subgroup_id}`;
        }
        else if(booking.course.course_type == 2){
          key = `${booking.course_id}-${booking.hour_start}-${booking.hour_end}`;
        }
        if (!uniqueCourseGroups.has(key)) {
          //insert booking in client
          const clientWithBooking = {
            ...booking.client,
            booking_client: booking.booking,
            degree_sport: this.getClientLevel(booking.client.sports,booking.course.sport_id)
          };

          const course_sport = this.sports.find(s => s.id === booking.course.sport_id);
          const sport_degrees = this.degrees.filter(degree => degree.sport_id === booking.course.sport_id);
          let degree_sport = this.degrees.find(degree => degree.id === booking.degree_id);
          degree_sport = degree_sport ? degree_sport : this.degrees[0];

          uniqueCourseGroups.set(key, {
            ...booking,
            all_clients: [clientWithBooking],
            selected_detail: !this.isSubgroup ? booking.id === this.bookingId : false,
            course_sport: course_sport,
            sport_degrees: sport_degrees,
            degree_sport: degree_sport,
            is_subgroup:false
          });
          this.bookingsCurrent.push(uniqueCourseGroups.get(key));
        } else {
          //insert booking in client
          const clientWithBooking = {
            ...booking.client,
            booking_client: booking.booking,
            degree_sport: this.getClientLevel(booking.client.sports,booking.course.sport_id)
          };

          uniqueCourseGroups.get(key).all_clients.push(clientWithBooking);
          
          if (!this.isSubgroup && booking.id === this.bookingId) {
            uniqueCourseGroups.get(key).selected_detail = true;
          }
        }
      }
    });

    subgroups.forEach(subgroup => {
      if (subgroup.course) {

        const course_sport = this.sports.find(s => s.id === subgroup.course.sport_id);
        const sport_degrees = this.degrees.filter(degree => degree.sport_id === subgroup.course.sport_id);
        let degree_sport = this.degrees.find(degree => degree.id === subgroup.degree_id);
        degree_sport = degree_sport ? degree_sport : this.degrees[0];


        const dateTotalAndIndex = subgroup.course.course_type === 2 ? { date_total: 0, date_index: 0 } : {
          date_total: subgroup.course.course_dates.length,
          date_index: this.getPositionDate(subgroup.course.course_dates, subgroup.course_date_id)
        };

        if(dateTotalAndIndex.date_index > 0){
          const subgroupObject = {
            ...subgroup,
            course_subgroup_id: subgroup.id,
            hour_start: subgroup.course.course_dates[dateTotalAndIndex.date_index - 1].hour_start,
            hour_end: subgroup.course.course_dates[dateTotalAndIndex.date_index - 1].hour_end,
            client: null,
            client_id: null,
            all_clients: [],
            selected_detail: this.isSubgroup ? subgroup.id === this.bookingId : false,
            course_sport: course_sport,
            sport_degrees: sport_degrees,
            degree_sport: degree_sport,
            is_subgroup:true
          };
          this.bookingsCurrent.push(subgroupObject);
        }
      }
    });

    this.bookingsCurrent.sort((a, b) => {
      const hourStartA = a.hour_start;
      const hourStartB = b.hour_start;
      if (hourStartA < hourStartB) return -1;
      if (hourStartA > hourStartB) return 1;
      return 0;
    });
    
  
    this.selectedBooking = this.bookingsCurrent.find(booking => booking.selected_detail === true);
    // Cargar asistencia para el curso/fecha seleccionada
    if (this.selectedBooking && this.selectedBooking.course_id) {
      this.loadAttendance(this.selectedBooking.course_id);
    }

    this.spinnerService.hide();
    //console.log('Processed Bookings:', this.bookingsCurrent);
    //console.log('Selected Booking:', this.selectedBooking);
  }

  selectBooking(booking:any) {
    if(booking.is_subgroup){
      this.bookingId = booking.id;
      this.bookingIdFull = 's-'+booking.id;
    }
    else{
      this.bookingId = booking.id;
      this.bookingIdFull = booking.id;
    }
    this.selectedBooking = booking;
    if (this.selectedBooking && this.selectedBooking.course_id) {
      this.loadAttendance(this.selectedBooking.course_id);
    }
  }

  getClientLevel(sports: any[], sport_id: number): number {
    const foundObject = sports.find(obj => obj.id === sport_id);
    return foundObject ? foundObject.pivot.degree_id : 0;
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

  formatDate(date:string) {
    return moment(date).format('DD-MM-YYYY');
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

  // ===== Asistencia inline =====
  private isGroupSelected(): boolean {
    return !!(this.selectedBooking && this.selectedBooking.course && this.selectedBooking.course.course_type === 1);
  }

  isDateBeforeOrEqualToToday(dateString: string): boolean {
    // Los monitores pueden marcar asistencia durante el día del curso
    // independientemente de la hora
    const inputDate = moment(dateString).startOf('day');
    const today = moment().startOf('day');
    return inputDate.isSameOrBefore(today);
  }

  // Método mejorado para permitir asistencia durante el horario del curso
  canMarkAttendance(): boolean {
    if (!this.selectedBooking || !this.dateBooking) {
      return false;
    }

    const courseDate = moment(this.dateBooking).startOf('day');
    const today = moment().startOf('day');

    // Permitir marcar asistencia el día del curso o después
    return courseDate.isSameOrBefore(today);
  }

  private loadAttendance(courseId: number) {
    // Resetea el mapa
    this.bookingUserByClient.clear();

    this.teachService.getData<any>('teach/courses', courseId).subscribe({
      next: (resp) => {
        const data = resp?.data;
        const bookingUsers: any[] = Array.isArray(data?.booking_users) ? data.booking_users : [];
        const monitorId = this.monitorData?.id;
        const isGroup = this.isGroupSelected();
        const courseDateId = this.selectedBooking?.course_date_id;
        const hourStart = this.selectedBooking?.hour_start;
        const hourEnd = this.selectedBooking?.hour_end;

        bookingUsers.forEach((bu: any) => {
          if (bu?.monitor_id !== monitorId) return;
          let matches = false;
          if (isGroup) {
            matches = bu?.course_date_id === courseDateId;
          } else {
            // Privado: misma fecha y franja
            const sameDay = bu?.date && moment(bu.date).isSame(this.dateBooking, 'day');
            matches = sameDay && bu?.hour_start === hourStart && bu?.hour_end === hourEnd;
          }
          if (matches && bu?.client_id) {
            this.bookingUserByClient.set(bu.client_id, bu);
          }
        });
      },
      error: () => {
        // Silencioso; no bloquea la pantalla principal
      },
    });
  }

  isAttended(clientId: number): boolean {
    const bu = this.bookingUserByClient.get(clientId);
    if (!bu) return false;
    const a = (bu.attended === true || bu.attended === 1);
    const b = (bu.attendance === true || bu.attendance === 1);
    return !!(a || b);
  }

  onToggle(clientId: number, checked: boolean, event?: Event) {
    if (event) { event.stopPropagation(); }

    const bu = this.bookingUserByClient.get(clientId);
    if (!bu) return;

    const payload: any = { ...bu, attended: checked, attendance: checked };
    ['client','created_at','deleted_at','updated_at'].forEach((k) => { if (k in payload) delete (payload as any)[k]; });

    this.spinnerService.show();
    this.teachService.updateData('booking-users', bu.id, payload).subscribe({
      next: () => {
        // Actualiza cache local
        this.bookingUserByClient.set(clientId, { ...bu, attended: checked });
        this.spinnerService.hide();
        this.toastr.success(this.translate.instant('toast.registered_correctly'));
      },
      error: () => {
        this.spinnerService.hide();
        this.toastr.error(this.translate.instant('toast.error'));
      }
    });
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
