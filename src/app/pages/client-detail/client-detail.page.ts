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
  clientEvaluations: any[] = [];
  currentObservation: any = null;
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
      const data: any = await this.teachService
        .getData('teach/clients', this.clientId, {
          'with[]': ['main', 'sports', 'clientSports', 'clientSports.degree', 'clientSports.sport', 'observations'],
          school_id: this.monitorData?.active_school
        })
        .toPromise();

      const client = data.data;
      if (client) {
        const birthDate = moment(client.birth_date);
        client.birth_years = moment().diff(birthDate, 'years');

        this.buildClientSports(client);
        this.clientMonitor = client;

        const activeSport = this.clientMonitor.sports && this.clientMonitor.sports.length
          ? this.clientMonitor.sports.find((sport: any) => sport.selected) || this.clientMonitor.sports[0]
          : null;

        this.sportSelected = activeSport?.id ?? null;

        console.log('Available degrees:', this.degrees);
        console.log('Selected sport:', this.sportSelected);

        this.sportDegrees = this.degrees && this.degrees.length > 0 && this.sportSelected
          ? this.degrees.filter(degree => degree.sport_id === this.sportSelected)
          : [];

        console.log('Filtered sport degrees:', this.sportDegrees);

        this.filterObservationsBySchool();
        await this.getClientEvaluations();
        this.setSelectedLevel(this.clientMonitor?.degree_sport || this.sportDegrees[0]?.id || null);
      } else {
        this.goTo('clients');
      }
    } catch (error) {
      console.error('There was an error fetching clients!', error);
    }
  }

  private buildClientSports(client: any): void {
    const availableSports = Array.isArray(this.sports) ? this.sports : [];

    let sportsFromApi: any[] = [];
    if (Array.isArray(client?.sports) && client.sports.length) {
      sportsFromApi = client.sports;
    } else if (Array.isArray(client?.client_sports) && client.client_sports.length) {
      sportsFromApi = client.client_sports.map((entry: any) => {
        const sportInfo = entry.sport || availableSports.find(sport => sport.id === entry.sport_id) || {};
        const sportId = entry.sport_id ?? sportInfo.id ?? entry.id;

        return {
          ...sportInfo,
          ...entry,
          id: sportId,
          sport_id: sportId,
          pivot: {
            ...(entry.pivot || {}),
            degree_id: entry.pivot?.degree_id ?? entry.degree_id ?? null
          }
        };
      });
    }

    const enrichedSports = sportsFromApi.map((sport: any, index: number) => {
      const sportId = sport.id ?? sport.sport_id;
      const catalogSport = availableSports.find(item => item.id === sportId) || {};
      const pivotDegreeId = sport.pivot?.degree_id ?? sport.degree_id ?? null;

      return {
        ...catalogSport,
        ...sport,
        id: sportId,
        sport_id: sportId,
        name: sport.name ?? catalogSport.name,
        icon_selected: sport.icon_selected ?? catalogSport.icon_selected,
        icon_unselected: sport.icon_unselected ?? catalogSport.icon_unselected,
        selected: index === 0,
        pivot: {
          ...(sport.pivot || {}),
          degree_id: pivotDegreeId
        }
      };
    });

    client.sports = enrichedSports;
    client.degree_sport = enrichedSports[0]?.pivot?.degree_id ?? 0;
  }

  filterObservationsBySchool() {
    if (this.clientMonitor && this.clientMonitor.observations && this.monitorData) {
      // Buscar la observación de la escuela activa
      this.currentObservation = this.clientMonitor.observations.find(
        (obs: any) => obs.school_id === this.monitorData.active_school
      );

      if (!this.currentObservation) {
        // Si no existe, crear un objeto vacío
        this.currentObservation = {
          general: '',
          notes: '',
          historical: ''
        };
      }

      console.log('CLIENT DETAIL DEBUG: Current observation for school:', this.currentObservation);
    }
  }

  async getClientEvaluations() {
    try {
      const data: any = await this.teachService.getData('evaluations', null, { client_id: this.clientId }).toPromise();
      this.clientEvaluations = data.data;
      console.log('CLIENT DETAIL DEBUG: Loaded evaluations:', this.clientEvaluations);
      await this.loadEvaluationSummary();
    } catch (error) {
      console.error('CLIENT DETAIL DEBUG: Error loading evaluations:', error);
      this.clientEvaluations = [];
    }
  }

  getEvaluationsForCurrentSport() {
    if (!this.clientEvaluations || !this.sportSelected) {
      return [];
    }

    // Filtrar evaluaciones por el deporte seleccionado
    const sportDegreeIds = this.sportDegrees.map(d => d.id);
    return this.clientEvaluations
      .filter(evaluation => sportDegreeIds.includes(evaluation.degree_id) && evaluation.observations)
      .sort((a, b) => b.id - a.id); // Más recientes primero
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

  isPhone(value: string | null | undefined): boolean {
    if (!value) return false;
    const text = String(value);
    return /[0-9]/.test(text) && !text.includes('@');
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

  changeSport(index:any) {
    let newDegree = 0;
    const sport = this.clientMonitor?.sports ? this.clientMonitor.sports[index] : null;
    if(!sport){
      return;
    }

    this.clientMonitor.sports.forEach((item:any) => {
      item.selected = false;
    });

    sport.selected = true;

    if(sport.pivot?.degree_id){
      newDegree = sport.pivot.degree_id;
    }

    this.sportSelected = sport.id;
    this.clientMonitor.degree_sport = newDegree;
    this.sportDegrees = this.degrees && this.degrees.length > 0 ? this.degrees.filter(degree => degree.sport_id === sport.id) : [];
    console.log('Sport Degrees after change:', this.sportDegrees);
    this.setSelectedLevel(this.clientMonitor.degree_sport || this.sportDegrees[0]?.id || null);
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

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

  goToClientLevelSelected(): void {
    this.router.navigate(
      ['client-level', 'client', '1', '1', this.clientId, this.sportSelected],
      {
        queryParams: {
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
