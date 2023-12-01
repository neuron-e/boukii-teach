import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { SharedDataService } from '../../services/shared-data.service';
import { TeachService } from '../../services/teach.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

@Component({
  selector: 'app-course-detail-level-update',
  templateUrl: './course-detail-level-update.page.html',
  styleUrls: ['./course-detail-level-update.page.scss'],
})
export class CourseDetailLevelUpdatePage implements OnInit, OnDestroy {
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

  allMultimedia:any[] = [];
  viewTypeSelected:string;
  viewFileSelected:string;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private teachService: TeachService, private toastr: ToastrService) {}

  async ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(async monitorData => {
      if (monitorData) {
        this.monitorData = monitorData;
        try {
          this.degrees = await firstValueFrom(this.sharedDataService.fetchDegrees(this.monitorData.active_school));
          this.sports = await firstValueFrom(this.sharedDataService.fetchSports(this.monitorData.active_school));
        } catch (error) {
          console.error('Error fetching data:', error);
          this.toastr.error("Erreur lors du chargement des données");
        }
  
        this.activatedRoute.params.subscribe( async params => {
          this.bookingId = +params['id'];
          this.dateBooking = params['date'];
          this.clientIdBooking = +params['client'];
          this.sportIdBooking = +params['sport'];
          if (this.bookingId && this.dateBooking && this.clientIdBooking && this.sportIdBooking) {
            await this.getClientEvaluations();
            this.getClient();
            this.getClientSports();
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
              this.newLevel = 0;
              this.currentLevelMain = this.sportDegrees[0];
            }
            else{
              this.clientLevel = index;
              this.newLevel = index;
              this.currentLevelMain = this.sportDegrees[index];
            }
          }
          else{
            this.newLevel = 0;
            this.currentLevelMain = this.sportDegrees[0];
          }
          this.getCurrentGoals();
          this.filterEvaluationDegree();
          console.log(this.clientMonitor);
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
      console.log(data);
      this.goals = data.data;
      //Insert from saved values
      this.goals.forEach(goal => {
        const matchingGoal = this.allGoalScores.find(g => g.degrees_school_sport_goals_id === goal.id);
      
        if (matchingGoal) {
          goal.score = matchingGoal.score;
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
        console.log(data);
  
        const filteredSports = data.data.filter((sport:any) => 
          sport.client_id === this.clientIdBooking && sport.sport_id === this.sportIdBooking);
  
        if (filteredSports.length === 0) {
          this.currentClientSport = null;
        } else if (filteredSports.length === 1) {
          this.currentClientSport = filteredSports[0];
        } else {
          this.currentClientSport = filteredSports.sort((a:any, b:any) => b.id - a.id)[0];
        }
  
        console.log('Current Client Sport:', this.currentClientSport);
      },
      error => {
        console.error('There was an error!', error);
      }
    );
  }  

  async getClientEvaluations() {
    try {
      // Filter by sport
      this.sportDegrees = this.degrees.filter(degree => degree.sport_id === this.sportIdBooking);
      this.sportEvaluation = this.sports.find(sport => sport.id === this.sportIdBooking);

      const data: any = await this.teachService.getData('evaluations', null, { client_id: this.clientIdBooking }).toPromise();
      console.log(data);
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
      console.log(this.allGoalScores);
  
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
        } else if (filteredEvaluations.length === 1) {
          this.clientDegreeEvaluation = filteredEvaluations[0];
          this.observationsEvaluation = this.clientDegreeEvaluation.observations;
        } else {
          this.clientDegreeEvaluation = filteredEvaluations.sort((a:any, b:any) => b.id - a.id)[0];
          this.observationsEvaluation = this.clientDegreeEvaluation.observations;
        }
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

  handleGoalsAndClientSport(evaluationId:any) {
    const goalPostPromises = this.filteredGoals.map(goal => {
        let dataGoal = {
            evaluation_id: evaluationId,
            degrees_school_sport_goals_id: goal.id,
            score: goal.score
        };

        if (goal.update_id) {
            return this.teachService.updateData('evaluation-fulfilled-goals', goal.update_id, dataGoal).toPromise();
        } else {
            return this.teachService.postData('evaluation-fulfilled-goals', dataGoal).toPromise();
        }
    });

    Promise.all(goalPostPromises).then(() => {
        //Assign level to client
        let nextLevel = this.currentLevelMain.id;
        if (this.allGoalsCompleted() && this.completeLevel) {
          if (this.sportDegrees[this.newLevel + 1] && this.sportDegrees[this.newLevel + 1].id) {
            nextLevel = this.sportDegrees[this.newLevel + 1].id;
          }
        }

        let dataClient = {
          client_id: this.clientIdBooking,
          sport_id: this.sportIdBooking,
          degree_id: nextLevel
        };

        //Check if a client-sport already exists
        if (this.currentClientSport) {
          this.teachService.updateData('client-sports', this.currentClientSport.id, dataClient).subscribe(
              response => {
                  console.log('Response:', response);
                  this.goTo('course-detail-level',this.bookingId,this.dateBooking,this.clientIdBooking,this.sportIdBooking);
              },
              error => {
                  console.error('Error:', error);
              }
          );
        } else {
          this.teachService.postData('client-sports', dataClient).subscribe(
              response => {
                  console.log('Response:', response);
                  this.goTo('course-detail-level',this.bookingId,this.dateBooking,this.clientIdBooking,this.sportIdBooking);
              },
              error => {
                  console.error('Error:', error);
              }
          );
        }
    }).catch(error => {
        console.error('Error in posting/updating goals:', error);
    });
}

  saveEvaluation() {

      const data = {
        client_id: this.clientIdBooking,
        degree_id: this.currentLevelMain.id,
        observations: this.observationsEvaluation
      };
      if (this.clientDegreeEvaluation) {
        this.teachService.updateData('evaluations', this.clientDegreeEvaluation.id, data).subscribe(response => {
            this.handleGoalsAndClientSport(this.clientDegreeEvaluation.id);
        }, error => {
            console.error('Error in updating evaluation:', error);
        });
    } else {
        this.teachService.postData('evaluations', data).subscribe(response => {
            this.handleGoalsAndClientSport(response.data.id);
        }, error => {
            console.error('Error in posting evaluation:', error);
        });
    }

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

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

  ngOnDestroy() {
    if (this.subscription) {
        this.subscription.unsubscribe();
    }
  }

}
