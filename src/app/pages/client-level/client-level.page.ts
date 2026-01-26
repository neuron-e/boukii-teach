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
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-client-level',
  templateUrl: './client-level.page.html',
  styleUrls: ['./client-level.page.scss'],
})
export class ClientLevelPage implements OnInit, OnDestroy {
  monitorData: any;
  private subscription: Subscription;

  showMultimedia:boolean = false;
  showView:boolean = false;
  completeLevel:boolean = false;

  degrees: any[] = [];
  sportDegrees: any[] = [];
  sports: any[] = [];
  goals: any[] = [];
  filteredGoals: any[] = [];

  typeRoute:any;
  bookingId:any;
  dateBooking:any;
  clientIdBooking:any;
  sportIdBooking:any;
  clientMonitor:any;
  sportEvaluation:any;

  clientLevel:any;
  alreadyCompleted:boolean=false;
  newLevel:any;
  currentLevelMain:any;
  observationsEvaluation:string;
  currentClientSport:any;
  clientEvaluations:any;
  clientDegreeEvaluation:any;
  allGoalScores:any[] = [];
  courseId: number | null = null;
  courseName: string | null = null;
  requestedLevelId: number | null = null;
  evaluationComments: any[] = [];
  commentsLoading = false;
  savingComment = false;
  newComment = '';
  historyEntries: any[] = [];
  historyLoading = false;
  showHistory = false;
  historyTab: 'history' | 'media' = 'history';

  allMultimedia:any[] = [];
  allMultimediaDelete:any[] = [];
  viewTypeSelected:string;
  viewFileSelected:string;

  hasConfirmedCompletedEdit = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private teachService: TeachService, private toastr: ToastrService, private spinnerService: SpinnerService, private translate: TranslateService, private alertController: AlertController) {}

  async ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      const courseId = params['courseId'];
      this.courseId = courseId ? Number(courseId) : null;
      this.courseName = params['courseName'] || null;
      const levelId = params['levelId'];
      this.requestedLevelId = levelId ? Number(levelId) : null;
    });

    this.subscription = this.monitorDataService.getMonitorData().subscribe(async monitorData => {
      if (monitorData) {
        this.monitorData = monitorData;
        try {
          this.degrees = await firstValueFrom(this.sharedDataService.fetchDegrees(this.monitorData.active_school));
          this.sports = await firstValueFrom(this.sharedDataService.fetchSports(this.monitorData.active_school));
          console.log('Client-level loaded degrees:', this.degrees.length);
        } catch (error) {
          console.error('Error fetching data:', error);
          this.toastr.error(this.translate.instant('toast.error_loading_data'));
          // Initialize with empty arrays to prevent undefined errors
          this.degrees = [];
          this.sports = [];
        }
  
        this.activatedRoute.params.subscribe( async params => {
          this.typeRoute = params['type'];
          this.bookingId = +params['id'];
          this.dateBooking = params['date'];
          this.clientIdBooking = +params['client'];
          this.sportIdBooking = +params['sport'];
          if (this.typeRoute && this.bookingId && this.dateBooking && this.clientIdBooking && this.sportIdBooking) {
            this.spinnerService.show();
            await this.getClientEvaluations();
            this.getClient();
            this.getClientSports();
            this.spinnerService.hide();
          } else {
            this.goTo('home');
          }
        });
      }
    });
  }

  getClient() {
    this.teachService.getData(`teach/clients/${this.clientIdBooking}`).subscribe(
      (data:any) => {
        const client = data.data;
        if (client) {
          const birthDate = moment(client.birth_date);
          const age = moment().diff(birthDate, 'years');
          client.birth_years = age;

          let sport = client.sports.find((sport:any) => sport.id === this.sportIdBooking);
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

          if(this.clientMonitor.degree_sport){
            let index = this.sportDegrees.findIndex(obj => obj.id === this.clientMonitor.degree_sport);
            if (index === -1) {
              this.clientLevel = 0;
            }
            else{
              this.clientLevel = index;
            }
          }
          else{
            this.clientLevel = 0;
          }
          const requestedIndex = this.requestedLevelId
            ? this.sportDegrees.findIndex(obj => obj.id === this.requestedLevelId)
            : -1;
          const targetIndex = requestedIndex >= 0 ? requestedIndex : this.clientLevel || 0;
          this.newLevel = targetIndex;
          this.currentLevelMain = this.sportDegrees[targetIndex] || this.sportDegrees[0];
          this.alreadyCompleted = this.clientLevel > this.newLevel;
          this.getCurrentGoals();
          this.filterEvaluationDegree();
          //console.log(this.clientMonitor);
        } else {
          //Not a client of monitor
          this.goTo('clients');
        }
      },
      error => {
        console.error('There was an error fetching clients!', error);
      }
    );
  }

  async getGoals() {
    try {
      const data: any = await this.teachService.getData('degrees-school-sport-goals').toPromise();
      //console.log(data);
      this.goals = data.data;
      //Insert from saved values
      this.goals.forEach(goal => {
        const matchingGoal = this.allGoalScores.find(g => g.degrees_school_sport_goals_id === goal.id);
      
        if (matchingGoal) {
          goal.score = this.normalizeGoalScore(matchingGoal.score);
          goal.update_id = matchingGoal.id;
        } else {
          goal.score = 0;
          goal.update_id = 0;
        }
      });
    } catch (error) {
      console.error('There was an error!', error);
    }
  }

  async getClientSports() {
    this.teachService.getData('client-sports', null, { client_id: this.clientIdBooking }).subscribe(
      (data: any) => {
        //console.log(data);
  
        const filteredSports = data.data.filter((sport:any) => 
          sport.client_id === this.clientIdBooking && sport.sport_id === this.sportIdBooking);
  
        if (filteredSports.length === 0) {
          this.currentClientSport = null;
        } else if (filteredSports.length === 1) {
          this.currentClientSport = filteredSports[0];
        } else {
          this.currentClientSport = filteredSports.sort((a:any, b:any) => b.id - a.id)[0];
        }
  
        //console.log('Current Client Sport:', this.currentClientSport);
      },
      error => {
        console.error('There was an error!', error);
      }
    );
  }  

  async getClientEvaluations() {
    try {
      // Filter by sport
      this.sportDegrees = this.degrees && this.degrees.length > 0 ? this.degrees.filter(degree => degree.sport_id === this.sportIdBooking) : [];
      console.log('Client-level sportDegrees:', this.sportDegrees);
      this.sportEvaluation = this.sports.find(sport => sport.id === this.sportIdBooking);
      
      const data: any = await this.teachService.getData('evaluations', null, { client_id: this.clientIdBooking }).toPromise();
      //console.log(data);
      this.clientEvaluations = data.data;
  
      const requests = this.clientEvaluations.map((evaluation:any) => 
        this.teachService.getData('evaluation-fulfilled-goals', null, { evaluation_id: evaluation.id }).toPromise()
      );
      
      const responses = await Promise.all(requests);
      let allGoalScores:any[] = [];
      responses.forEach(response => {
        allGoalScores.push(...response.data);
      });
      
      let uniqueGoalScoresMap:any = {};
      allGoalScores.forEach(goal => {
        if (!uniqueGoalScoresMap[goal.degrees_school_sport_goals_id] || uniqueGoalScoresMap[goal.degrees_school_sport_goals_id].id < goal.id) {
          uniqueGoalScoresMap[goal.degrees_school_sport_goals_id] = goal;
        }
      });
      this.allGoalScores = Object.values(uniqueGoalScoresMap);
      //console.log(this.allGoalScores);
  
      await this.getGoals();
    } catch (error) {
      console.error('There was an error!', error);
    }
  }  

  filterEvaluationDegree() {
    const filteredEvaluations = this.clientEvaluations.filter((evaluation:any) => 
        evaluation.degree_id === this.currentLevelMain.id);
  
        if (filteredEvaluations.length === 0) {
          this.clientDegreeEvaluation = null;
          this.observationsEvaluation = '';
          this.allMultimedia = [];
        } else if (filteredEvaluations.length === 1) {
          this.clientDegreeEvaluation = filteredEvaluations[0];
          this.observationsEvaluation = this.clientDegreeEvaluation.observations;
          this.allMultimedia = this.clientDegreeEvaluation.files;
        } else {
          this.clientDegreeEvaluation = filteredEvaluations.sort((a:any, b:any) => b.id - a.id)[0];
          this.observationsEvaluation = this.clientDegreeEvaluation.observations;
          this.allMultimedia = this.clientDegreeEvaluation.files;
        }

        this.loadEvaluationActivity();
  }

  getBirthYears(date:string) {
    const birthDate = moment(date);
    return moment().diff(birthDate, 'years');
  }

  onCurrentLevelChange(newLevel: number) {
    if(this.clientLevel > newLevel) {
      this.alreadyCompleted = true;
    }
    else{
      this.alreadyCompleted = false;
    }
    this.newLevel = newLevel;
    this.currentLevelMain = this.sportDegrees[newLevel];
    this.hasConfirmedCompletedEdit = false;

    this.filterEvaluationDegree();
    this.getCurrentGoals();
  }

  getCurrentGoals() {
    const filteredGoals = this.goals.filter(goal => goal.degree_id === this.currentLevelMain.id);
    this.filteredGoals = filteredGoals.sort((a, b) => a.id - b.id);
  }

  countGoalsCompleted() {
    return this.filteredGoals.filter(goal => goal.score === 10).length;
  }

  allGoalsCompleted() {
    return this.filteredGoals.every(goal => goal.score === 10);
  }

  getGoalsProgressPercent(): number {
    if (!this.filteredGoals.length) {
      return 0;
    }
    const completed = this.filteredGoals.filter(goal => this.normalizeGoalScore(goal.score) === 10).length;
    return Math.round((completed / this.filteredGoals.length) * 100);
  }

  getGoalsNotStartedCount(): number {
    return this.filteredGoals.filter(goal => (goal.score || 0) === 0).length;
  }

  getMediaCounts(): { images: number; videos: number } {
    const files = Array.isArray(this.allMultimedia) ? this.allMultimedia : [];
    let images = 0;
    let videos = 0;
    files.forEach(file => {
      if (file?.type === 'image') images += 1;
      if (file?.type === 'video') videos += 1;
    });
    return { images, videos };
  }

  async setGoalScore(goal: any, score: number): Promise<void> {
    if (!goal) return;
    const canEdit = await this.confirmEditCompletedLevel();
    if (!canEdit) return;
    goal.score = score;
  }

  getGoalStatusLabel(score: number): string {
    return this.normalizeGoalScore(score) >= 10
      ? this.translate.instant('achieved')
      : this.translate.instant('to_improve');
  }

  getGoalStatusClass(score: number): string {
    return this.normalizeGoalScore(score) >= 10 ? 'goal-status--done' : 'goal-status--partial';
  }

  getProgressBarClass(): string {
    const progress = this.getGoalsProgressPercent();
    if (progress >= 100) return 'progress--complete';
    if (progress > 0) return 'progress--partial';
    return 'progress--empty';
  }

  resetToCurrentLevel(): void {
    if (typeof this.clientLevel !== 'number') return;
    this.onCurrentLevelChange(this.clientLevel);
  }

  getLevelNameById(levelId: number | null): string {
    if (!levelId) return '-';
    const level = this.sportDegrees.find(item => item.id === levelId);
    return level?.name || '-';
  }

  getPreviousLevelName(): string {
    if (!this.sportDegrees?.length || typeof this.newLevel !== 'number') return '-';
    return this.sportDegrees[this.newLevel - 1]?.name || '-';
  }

  getNextLevelName(): string {
    if (!this.sportDegrees?.length || typeof this.newLevel !== 'number') return '-';
    return this.sportDegrees[this.newLevel + 1]?.name || '-';
  }

  goToPreviousLevel(): void {
    if (!this.sportDegrees?.length || typeof this.newLevel !== 'number') return;
    const previous = this.newLevel - 1;
    if (previous >= 0) {
      this.onCurrentLevelChange(previous);
    }
  }

  goToNextLevel(): void {
    if (!this.sportDegrees?.length || typeof this.newLevel !== 'number') return;
    const next = this.newLevel + 1;
    if (this.sportDegrees[next]) {
      this.onCurrentLevelChange(next);
    }
  }
  

  handleGoalsAndClientSport(evaluationId:any) {
    const goalPostPromises = this.filteredGoals.map(goal => {
        let dataGoal = {
            evaluation_id: evaluationId,
            degrees_school_sport_goals_id: goal.id,
            score: goal.score,
            ...this.buildCourseContextPayload()
        };

        if (goal.update_id) {
            return this.teachService.updateData('evaluation-fulfilled-goals', goal.update_id, dataGoal).toPromise();
        } else {
            return this.teachService.postData('evaluation-fulfilled-goals', dataGoal).toPromise();
        }
    });

    // First, handle all goals
    Promise.all(goalPostPromises)
        .then(() => {
            // Then, process allMultimedia
            return this.processAllMultimedia(evaluationId);
        })
        .then(() => {
            // After that, process allMultimediaDelete
            return this.processAllMultimediaDelete();
        })
        .then(() => {
            // Finally, handle client-sports after all the above are done
            return this.assignLevelToClient(evaluationId);
        })
        .catch(error => {
            console.error('Error in processing:', error);
            this.spinnerService.hide();
        });
  }

  processAllMultimedia(evaluationId:any) {
    if (this.allMultimedia && this.allMultimedia.length > 0) {
        const multimediaPromises = this.allMultimedia.map(multimedia => {
            if (!multimedia.id) {
                let dataMultimedia = {
                    evaluation_id: evaluationId,
                    name: '',
                    type: multimedia.type,
                    file: multimedia.file,
                    ...this.buildCourseContextPayload()
                };
                return this.teachService.postData('evaluation-files', dataMultimedia).toPromise();
            } else {
                return Promise.resolve(null); // Resolve to null for existing items
            }
        });
        return Promise.all(multimediaPromises);
    } else {
        return Promise.resolve([]); // Resolve to an empty array
    }
  }

  processAllMultimediaDelete() {
      if (this.allMultimediaDelete && this.allMultimediaDelete.length > 0) {
          const deletePromises = this.allMultimediaDelete.map(multimedia => {
              return this.teachService.deleteData('evaluation-files', multimedia.id, this.buildCourseContextPayload()).toPromise();
          });
          return Promise.all(deletePromises);
      } else {
          return Promise.resolve([]);
      }
  }

  assignLevelToClient(evaluationId:any) {
    let nextLevel = this.currentLevelMain.id;
    if (this.allGoalsCompleted()) {
        if (this.sportDegrees[this.newLevel + 1] && this.sportDegrees[this.newLevel + 1].id) {
            nextLevel = this.sportDegrees[this.newLevel + 1].id;
        }
    }

    let dataClient = {
        client_id: this.clientIdBooking,
        sport_id: this.sportIdBooking,
        degree_id: nextLevel,
        school_id: this.monitorData.active_school
    };

    console.log('EVALUATION DEBUG: Assigning level to client', {
        currentLevel: this.currentLevelMain.id,
        nextLevel: nextLevel,
        allGoalsCompleted: this.allGoalsCompleted(),
        completeLevel: this.completeLevel
    });

    // Check if a client-sport already exists
    if (this.currentClientSport) {
        return this.teachService.updateData('client-sports', this.currentClientSport.id, dataClient).subscribe(
            response => {
                console.log('EVALUATION DEBUG: Client-sport updated successfully', response);
                // Actualizar el degree_sport del cliente en memoria para que se refleje en la ruleta
                this.clientMonitor.degree_sport = nextLevel;
                this.spinnerService.hide();
                this.toastr.success(this.translate.instant('toast.evaluation_registered'));
                this.goBackType();
            },
            error => {
                console.error('EVALUATION DEBUG: Error updating client-sport:', error);
                this.toastr.error(this.translate.instant('toast.error'));
                this.spinnerService.hide();
            }
        );
    } else {
        return this.teachService.postData('client-sports', dataClient).subscribe(
            response => {
                console.log('EVALUATION DEBUG: Client-sport created successfully', response);
                // Actualizar el degree_sport del cliente en memoria para que se refleje en la ruleta
                this.clientMonitor.degree_sport = nextLevel;
                this.currentClientSport = response.data; // Guardar la referencia para futuras actualizaciones
                this.spinnerService.hide();
                this.toastr.success(this.translate.instant('toast.evaluation_registered'));
                this.goBackType();
            },
            error => {
                console.error('EVALUATION DEBUG: Error creating client-sport:', error);
                this.toastr.error(this.translate.instant('toast.error'));
                this.spinnerService.hide();
            }
        );
    }
  }

  saveEvaluation() {

    this.spinnerService.show();
      if (this.allGoalsCompleted()) {
        this.completeLevel = true;
      }
      const data = {
        client_id: this.clientIdBooking,
        degree_id: this.currentLevelMain.id,
        observations: this.observationsEvaluation,
        ...this.buildCourseContextPayload()
      };
      if (this.clientDegreeEvaluation) {
        this.teachService.updateData('evaluations', this.clientDegreeEvaluation.id, data).subscribe(response => {
            this.handleGoalsAndClientSport(this.clientDegreeEvaluation.id);
        }, error => {
            console.error('Error in updating evaluation:', error);
            this.spinnerService.hide();
        });
    } else {
        this.teachService.postData('evaluations', data).subscribe(response => {
            this.handleGoalsAndClientSport(response.data.id);
        }, error => {
            console.error('Error in posting evaluation:', error);
            this.spinnerService.hide();
        });
    }

  }

  private buildCourseContextPayload(): any {
    const payload: any = {};
    if (this.courseId) {
      payload.course_id = this.courseId;
    }
    if (this.courseName) {
      payload.course_name = this.courseName;
    }
    return payload;
  }

  private async ensureEvaluation(): Promise<any> {
    if (this.clientDegreeEvaluation?.id) {
      return this.clientDegreeEvaluation;
    }

    const payload = {
      client_id: this.clientIdBooking,
      degree_id: this.currentLevelMain?.id,
      observations: this.observationsEvaluation || '',
      ...this.buildCourseContextPayload()
    };

    const response: any = await this.teachService.postData('evaluations', payload).toPromise();
    this.clientDegreeEvaluation = response.data;
    if (Array.isArray(this.clientEvaluations)) {
      this.clientEvaluations.push(this.clientDegreeEvaluation);
    } else {
      this.clientEvaluations = [this.clientDegreeEvaluation];
    }
    return this.clientDegreeEvaluation;
  }

  private async loadEvaluationActivity(): Promise<void> {
    if (!this.clientDegreeEvaluation?.id) {
      this.evaluationComments = [];
      this.historyEntries = [];
      return;
    }
    await Promise.all([
      this.loadEvaluationComments(this.clientDegreeEvaluation.id),
      this.loadEvaluationHistory(this.clientDegreeEvaluation.id)
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
        .getData(`teach/evaluations/${evaluationId}/history`, null, { limit: 500 })
        .toPromise();
      this.historyEntries = response?.data || [];
    } catch (error) {
      console.error('Error loading evaluation history:', error);
      this.historyEntries = [];
    } finally {
      this.historyLoading = false;
    }
  }

  async addComment(): Promise<void> {
    const text = this.newComment.trim();
    if (!text || this.savingComment) return;
    this.savingComment = true;
    try {
      const evaluation = await this.ensureEvaluation();
      await this.teachService
        .postData(`teach/evaluations/${evaluation.id}/comments`, {
          comment: text,
          ...this.buildCourseContextPayload()
        })
        .toPromise();
      this.newComment = '';
      await this.loadEvaluationComments(evaluation.id);
      await this.loadEvaluationHistory(evaluation.id);
    } catch (error) {
      console.error('Error saving evaluation comment:', error);
    } finally {
      this.savingComment = false;
    }
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

  getHistoryDetails(entry: any): Array<{ label: string; value: string }> {
    const payload = entry?.payload || {};
    const details: Array<{ label: string; value: string }> = [];
    const goalName = this.getGoalName(payload.goal_id);
    if (entry?.type?.startsWith('goal_')) {
      details.push({
        label: this.translate.instant('history_change_goal_label'),
        value: goalName || '-'
      });
      const previousScore = payload.previous_score ?? payload.score ?? 0;
      const nextScore = payload.score ?? previousScore;
      details.push({
        label: this.translate.instant('history_change_status_label'),
        value: entry.type === 'goal_updated'
          ? `${this.getGoalStatusLabel(previousScore)} -> ${this.getGoalStatusLabel(nextScore)}`
          : this.getGoalStatusLabel(nextScore)
      });
    } else if (entry?.type === 'observation_updated') {
      details.push({
        label: this.translate.instant('history_change_previous_label'),
        value: this.formatHistoryValue(payload.previous)
      });
      details.push({
        label: this.translate.instant('history_change_new_label'),
        value: this.formatHistoryValue(payload.new)
      });
    } else if (entry?.type === 'comment_added') {
      details.push({
        label: this.translate.instant('history_change_comment_label'),
        value: this.formatHistoryValue(payload.comment)
      });
    } else if (entry?.type === 'file_added' || entry?.type === 'file_deleted') {
      details.push({
        label: this.translate.instant('history_change_file_label'),
        value: this.getHistoryFileLabel(payload)
      });
    }

    if (payload.course_name) {
      details.push({
        label: this.translate.instant('history_change_course_label'),
        value: payload.course_name
      });
    }

    return details;
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

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
    if (this.showHistory) {
      this.historyTab = 'history';
    }
  }

  closeHistory(): void {
    this.showHistory = false;
  }

  private formatHistoryValue(value: any): string {
    const text = (value ?? '').toString().trim();
    if (!text) return '-';
    if (text.length <= 160) return text;
    return `${text.slice(0, 157)}...`;
  }

  private getHistoryFileLabel(payload: any): string {
    const fileType = payload?.file_type || '';
    const file = payload?.file || '';
    if (file) {
      const fileName = file.split('/').pop();
      if (fileType) {
        return `${fileType} - ${fileName}`;
      }
      return fileName || file;
    }
    return fileType || '-';
  }

  private getGoalName(goalId: number): string {
    const goal = (this.goals || []).find(item => item.id === goalId);
    return goal?.name || '';
  }

  private normalizeGoalScore(score: number): number {
    return Number(score) >= 10 ? 10 : 0;
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

  private async confirmEditCompletedLevel(): Promise<boolean> {
    if (!this.allGoalsCompleted() || this.hasConfirmedCompletedEdit) return true;
    const alert = await this.alertController.create({
      header: this.translate.instant('evaluation_completed_edit_title'),
      message: this.translate.instant('evaluation_completed_edit_message'),
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel'
        },
        {
          text: this.translate.instant('confirm'),
          role: 'confirm'
        }
      ]
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
      this.hasConfirmedCompletedEdit = true;
      return true;
    }
    return false;
  }

  addMultimedia(fileData: { base64: string, isVideo: boolean }): void {
    if(fileData.base64) {
      const newFile = {
        type: fileData.isVideo ? 'video' : 'image',
        file: fileData.base64
      }
      this.allMultimedia.push(newFile);
    }
  }

  deleteMultimedia(index:number) {
    if(this.allMultimedia[index]){
      if(this.allMultimedia[index].id){
        this.allMultimediaDelete.push(this.allMultimedia[index]);
      }
      this.allMultimedia.splice(index, 1);
    }
  }

  viewMultimedia(type:string,file:string) {
    if(type && file){
      this.viewTypeSelected = type;
      this.viewFileSelected = file;
      this.toggleView();
    }
  }

  toggleMultimedia(): void {
    this.showMultimedia = !this.showMultimedia;
  }

  toggleView(): void {
    this.showView = !this.showView;
  }

  goBackType() {
    if(this.typeRoute == 'course'){
      this.goTo('course-detail-level',this.bookingId,this.dateBooking,this.clientIdBooking,this.sportIdBooking);
    }
    else{
      this.goTo('client-detail',this.clientIdBooking);
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
