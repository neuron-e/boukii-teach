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
  languages: any[] = [];

  selectedBooking:any;
  bookingId:any;
  dateBooking:any;
  clientIdBooking:any;
  sportIdBooking:any;
  clientMonitor:any;
  clientEvaluations: any[] = [];
  selectedLevelId: number | null = null;
  evaluationComments: any[] = [];
  evaluationHistory: any[] = [];
  commentsLoading = false;
  historyLoading = false;
  showAllComments = false;
  showAllHistory = false;
  readonly commentsPreviewLimit = 3;
  readonly historyPreviewLimit = 3;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private teachService: TeachService, private toastr: ToastrService, private spinnerService: SpinnerService, private translate: TranslateService) {}

  async ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(async monitorData => {
      if (monitorData) {
        this.monitorData = monitorData;
        try {
          this.degrees = await firstValueFrom(this.sharedDataService.fetchDegrees(this.monitorData.active_school));
          this.sports = await firstValueFrom(this.sharedDataService.fetchSports(this.monitorData.active_school));
          this.languages = await firstValueFrom(this.sharedDataService.fetchLanguages());
          console.log('Course-detail-level loaded degrees:', this.degrees.length);
        } catch (error) {
          console.error('Error fetching data:', error);
          this.toastr.error(this.translate.instant('toast.error_loading_data'));
          // Initialize with empty arrays to prevent undefined errors
          this.degrees = [];
          this.sports = [];
          this.languages = [];
        }
  
        this.activatedRoute.params.subscribe( async params => {
          this.bookingId = +params['id'];
          this.dateBooking = params['date'];
          this.clientIdBooking = +params['client'];
          this.sportIdBooking = +params['sport'];
          if (this.bookingId && this.dateBooking && this.clientIdBooking && this.sportIdBooking) {
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
    this.sportDegrees = this.degrees && this.degrees.length > 0 ? this.degrees.filter(degree => degree.sport_id === this.sportIdBooking) : [];
    console.log('Course-detail-level sportDegrees:', this.sportDegrees);
    const searchData:any = {
      date_start: this.dateBooking, date_end: this.dateBooking
    };
    if(this.monitorData.active_school){
      searchData.school_id = this.monitorData.active_school;
    }
    this.teachService.getData('teach/getAgenda', null, searchData).subscribe(
      (data:any) => {
        //console.log(data);
        this.processBookings(data.data.bookings);
      },
      error => {
        console.error('There was an error!', error);
        this.spinnerService.hide();
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
          key = `${booking.course_id}-${booking.course_subgroup_id}`;
        }
        else if(booking.course.course_type == 2){
          key = `${booking.course_id}-${booking.hour_start}-${booking.hour_end}`;
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

    this.spinnerService.hide();
    this.getClient();

    //console.log('Processed Bookings:', this.bookingsCurrent);
    //console.log('Selected Booking:', this.selectedBooking);
  }

  getClient() {
    this.spinnerService.show();
    this.teachService.getData(`teach/clients/${this.clientIdBooking}`).subscribe(
      (data:any) => {
        const client = data.data;
        if (client) {
          const birthDate = moment(client.birth_date);
          const age = moment().diff(birthDate, 'years');
          client.birth_years = age;

          let sport = client.sports.find((sport:any) => sport.id === this.sportIdBooking);

          this.spinnerService.hide();

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
          this.clientEvaluations = client.evaluations || [];
          this.setSelectedLevel(this.clientMonitor?.degree_sport || this.sportDegrees[0]?.id || null);
          //console.log(this.clientMonitor);
        } else {
          //Not a client of monitor
          this.goTo('clients');
        }
      },
      error => {
        console.error('There was an error fetching clients!', error);
        this.spinnerService.hide();
      }
    );
  }

  getBirthYears(date:string) {
    const birthDate = moment(date);
    return moment().diff(birthDate, 'years');
  }

  getEvaluationForSelectedLevel(): any {
    if (!this.selectedLevelId) return null;
    const evaluations = (this.clientEvaluations || [])
      .filter((evaluation: any) => evaluation.degree_id === this.selectedLevelId);
    if (!evaluations.length) return null;
    return evaluations.sort((a: any, b: any) => b.id - a.id)[0];
  }

  getVisibleComments(): any[] {
    if (this.showAllComments) return this.evaluationComments;
    return this.evaluationComments.slice(0, this.commentsPreviewLimit);
  }

  getVisibleHistory(): any[] {
    if (this.showAllHistory) return this.evaluationHistory;
    return this.evaluationHistory.slice(0, this.historyPreviewLimit);
  }

  toggleCommentsView(): void {
    this.showAllComments = !this.showAllComments;
  }

  toggleHistoryView(): void {
    this.showAllHistory = !this.showAllHistory;
  }

  getCommentAuthor(comment: any): string {
    const monitor = comment?.monitor;
    if (monitor) {
      const name = [monitor.first_name, monitor.last_name].filter(Boolean).join(' ').trim()
        || monitor.name
        || monitor.email
        || '';
      const roleLabel = this.translate.instant('history_role_monitor');
      if (name) return `${name} (${roleLabel})`;
    }
    return this.getUserDisplayLabel(comment?.user);
  }

  getHistoryUserLabel(entry: any): string {
    const monitor = entry?.monitor;
    if (monitor) {
      const name = [monitor.first_name, monitor.last_name].filter(Boolean).join(' ').trim()
        || monitor.name
        || monitor.email
        || '';
      const roleLabel = this.translate.instant('history_role_monitor');
      if (name) return `${name} (${roleLabel})`;
    }
    return this.getUserDisplayLabel(entry?.user);
  }

  getHistoryTitle(entry: any): string {
    switch (entry?.type) {
      case 'goal_created':
        return this.translate.instant('history_change_goal_created');
      case 'goal_updated':
        return this.translate.instant('history_change_goal_updated');
      case 'goal_deleted':
        return this.translate.instant('history_change_goal_deleted');
      case 'observation_updated':
        return this.translate.instant('history_change_observation_updated');
      case 'comment_added':
        return this.translate.instant('history_change_comment_added');
      case 'file_added':
        return this.translate.instant('history_change_file_added');
      case 'file_deleted':
        return this.translate.instant('history_change_file_deleted');
      default:
        return this.translate.instant('history_change_generic');
    }
  }

  getHistorySummary(entry: any): string {
    const payload = entry?.payload || {};
    if (payload.comment) {
      return payload.comment;
    }
    if (payload.file) {
      const fileName = payload.file.split('/').pop();
      return fileName || payload.file;
    }
    if (payload.new) {
      return payload.new;
    }
    if (payload.score !== undefined) {
      return `${this.translate.instant('history_change_status_label')}: ${this.getScoreLabel(payload.score)}`;
    }
    return '';
  }

  private getScoreLabel(score: number): string {
    if (score >= 10) return this.translate.instant('achieved');
    if (score >= 5) return this.translate.instant('to_improve');
    return this.translate.instant('not_started');
  }

  setSelectedLevel(levelId: number | null): void {
    this.selectedLevelId = levelId;
    this.showAllComments = false;
    this.showAllHistory = false;
    this.loadEvaluationSummary();
  }

  resetToCurrentLevel(): void {
    const currentLevelId = this.clientMonitor?.degree_sport || null;
    if (!currentLevelId) return;
    this.setSelectedLevel(currentLevelId);
  }

  onLevelSelected(levelId: number): void {
    this.setSelectedLevel(levelId);
  }

  getLevelNameById(levelId: number | null): string {
    if (!levelId) return '-';
    const level = this.sportDegrees.find(item => item.id === levelId);
    return level?.name || '-';
  }

  getPreviousLevelName(): string {
    if (!this.sportDegrees?.length || !this.selectedLevelId) return '-';
    const index = this.sportDegrees.findIndex(item => item.id === this.selectedLevelId);
    return index > 0 ? this.sportDegrees[index - 1]?.name || '-' : '-';
  }

  getNextLevelName(): string {
    if (!this.sportDegrees?.length || !this.selectedLevelId) return '-';
    const index = this.sportDegrees.findIndex(item => item.id === this.selectedLevelId);
    if (index >= 0 && this.sportDegrees[index + 1]) {
      return this.sportDegrees[index + 1]?.name || '-';
    }
    return '-';
  }

  goToPreviousLevel(): void {
    if (!this.sportDegrees?.length || !this.selectedLevelId) return;
    const index = this.sportDegrees.findIndex(item => item.id === this.selectedLevelId);
    if (index > 0) {
      this.setSelectedLevel(this.sportDegrees[index - 1]?.id || null);
    }
  }

  goToNextLevel(): void {
    if (!this.sportDegrees?.length || !this.selectedLevelId) return;
    const index = this.sportDegrees.findIndex(item => item.id === this.selectedLevelId);
    if (index >= 0 && this.sportDegrees[index + 1]) {
      this.setSelectedLevel(this.sportDegrees[index + 1]?.id || null);
    }
  }

  async loadEvaluationSummary(): Promise<void> {
    const evaluation = this.getEvaluationForSelectedLevel();
    if (!evaluation?.id) {
      this.evaluationComments = [];
      this.evaluationHistory = [];
      return;
    }

    await Promise.all([
      this.loadEvaluationComments(evaluation.id),
      this.loadEvaluationHistory(evaluation.id)
    ]);
  }

  async loadEvaluationComments(evaluationId: number): Promise<void> {
    if (!evaluationId || this.commentsLoading) return;
    this.commentsLoading = true;
    try {
      const response: any = await this.teachService
        .getData(`teach/evaluations/${evaluationId}/comments`, null, { limit: 200 })
        .toPromise();
      this.evaluationComments = response?.data || [];
    } catch (error) {
      console.error('Error loading evaluation comments:', error);
      this.evaluationComments = [];
    } finally {
      this.commentsLoading = false;
    }
  }

  async loadEvaluationHistory(evaluationId: number): Promise<void> {
    if (!evaluationId || this.historyLoading) return;
    this.historyLoading = true;
    try {
      const response: any = await this.teachService
        .getData(`teach/evaluations/${evaluationId}/history`, null, { limit: 200 })
        .toPromise();
      this.evaluationHistory = response?.data || [];
    } catch (error) {
      console.error('Error loading evaluation history:', error);
      this.evaluationHistory = [];
    } finally {
      this.historyLoading = false;
    }
  }

  private getUserDisplayLabel(user: any): string {
    if (!user) return this.translate.instant('history_change_system');
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
      || user.name
      || user.username
      || user.email
      || '';
    const roleLabel = this.getUserRoleLabel(user);
    if (name && roleLabel) return `${name} (${roleLabel})`;
    if (name) return name;
    if (roleLabel) return roleLabel;
    return this.translate.instant('history_change_system');
  }

  private getUserRoleLabel(user: any): string | null {
    const type = user?.type;
    if (type === 1 || type === 'admin') return this.translate.instant('history_role_admin');
    if (type === 3 || type === 'monitor') return this.translate.instant('history_role_monitor');
    return null;
  }

  isPhone(value: string | null | undefined): boolean {
    if (!value) return false;
    const text = String(value);
    return /[0-9]/.test(text) && !text.includes('@');
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

  goToClientLevelWithCourse(): void {
    this.router.navigate(
      ['client-level', 'course', this.bookingId, this.dateBooking, this.clientIdBooking, this.sportIdBooking],
      {
        queryParams: {
          courseId: this.selectedBooking?.course?.id ?? null,
          courseName: this.selectedBooking?.course?.name ?? null
        }
      }
    );
  }

  goToClientLevelSelected(): void {
    this.router.navigate(
      ['client-level', 'course', this.bookingId, this.dateBooking, this.clientIdBooking, this.sportIdBooking],
      {
        queryParams: {
          courseId: this.selectedBooking?.course?.id ?? null,
          courseName: this.selectedBooking?.course?.name ?? null,
          levelId: this.selectedLevelId ?? null
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
        this.subscription.unsubscribe();
    }
  }

}
