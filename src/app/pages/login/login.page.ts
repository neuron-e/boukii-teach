import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { TeachService } from '../../services/teach.service';
import { MonitorDataService } from '../../services/monitor-data.service';
import { SharedDataService } from '../../services/shared-data.service';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../services/spinner.service';
import { TranslateService } from '@ngx-translate/core';
import { SchoolSelectorComponent } from '../../components/school-selector/school-selector.component';
import { MonitorRealtimeService } from '../../services/monitor-realtime.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  showLogin:boolean = true;
  showPassword:boolean = false;
  email:string;
  password:string;
  emailRecover:string;

  constructor(private router: Router, private teachService: TeachService, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private modalController: ModalController, private toastr: ToastrService, private spinnerService: SpinnerService, private translate: TranslateService, private monitorRealtimeService: MonitorRealtimeService) {}

  ngOnInit() {
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async onLogin(): Promise<void> {
    this.spinnerService.show();
    this.teachService.login(this.email, this.password).subscribe(
      async response => {
        this.toastr.success(this.translate.instant('toast.connected_correctly'));
        //console.log('Login successful', response);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('monitorId', response.data.user.monitors[0].id);
        this.monitorRealtimeService.connect(response.data.user.monitors[0].id);

        const monitor = response.data.user.monitors[0];
        let activeSchool = monitor.active_school;

        // Fetch monitor data with schools
        const monitorDataFull: any = await firstValueFrom(this.teachService.getData('monitors', monitor.id, {'with[]': 'schools'}));
        monitor.schools = monitorDataFull.data.schools;

        // Check if we need to select a school
        if (monitor.schools && monitor.schools.length > 0) {
          const savedSchool = this.monitorDataService.getActiveSchool();

          // Priority 1: Use saved school from localStorage if valid
          if (savedSchool && monitor.schools.some((s: any) => s.id === savedSchool)) {
            activeSchool = savedSchool;
          }
          // Priority 2: Use backend active_school if exists
          else if (activeSchool) {
            // Use backend active_school
          }
          // Priority 3: If multiple schools and no selection, show selector
          else if (monitor.schools.length > 1) {
            this.spinnerService.hide();
            const selectedSchool = await this.showSchoolSelector(monitor.schools, null);
            if (selectedSchool) {
              activeSchool = selectedSchool.id;
              localStorage.setItem('activeSchool', activeSchool.toString());
            } else {
              // User cancelled, use first school
              activeSchool = monitor.schools[0].id;
            }
            this.spinnerService.show();
          }
          // Priority 4: Only one school, use it
          else {
            activeSchool = monitor.schools[0].id;
          }

          // Update active school in backend if it changed or wasn't set
          if (activeSchool !== monitor.active_school) {
            try {
              await firstValueFrom(this.teachService.updateData('monitors', monitor.id, {
                active_school: activeSchool
              }));
            } catch (error) {
              console.error('Error updating active_school:', error);
            }
          }
        } else {
          console.error('Monitor has no schools!');
          this.toastr.error('No tiene escuelas asignadas');
          this.spinnerService.hide();
          return;
        }

        // Update monitor data with active school
        monitor.active_school = activeSchool;
        this.monitorDataService.setMonitorData(monitor);

        // Fetch data for active school
        try {
          await firstValueFrom(this.sharedDataService.fetchDegrees(activeSchool));
          await firstValueFrom(this.sharedDataService.fetchSports(activeSchool));
          await firstValueFrom(this.sharedDataService.fetchLanguages());
          await firstValueFrom(this.sharedDataService.fetchStations());
          await firstValueFrom(this.sharedDataService.fetchSchools());
        } catch (error) {
            console.error('Error fetching data:', error);
            this.toastr.error(this.translate.instant('toast.error_loading_data'));
        }

        this.spinnerService.hide();
        this.goTo('home');
        this.email='';
        this.password='';
      },
      error => {
        this.spinnerService.hide();
        console.error('Login failed', error);
        this.toastr.error(this.translate.instant('toast.identification_error'));
      }
    );
  }

  async showSchoolSelector(schools: any[], currentSchoolId: number | null): Promise<any> {
    const modal = await this.modalController.create({
      component: SchoolSelectorComponent,
      componentProps: {
        schools: schools,
        currentSchoolId: currentSchoolId
      },
      cssClass: 'school-selector-modal',
      backdropDismiss: false
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    return data?.school || null;
  }

  onRecover() {
    if (this.emailRecover) {
      this.spinnerService.show();
    
      const data = {
        email: this.emailRecover,
        type: 'monitor'
      };
    
      firstValueFrom(this.teachService.postData('forgot-password', data))
        .then(response => {
          //console.log('Recover successful:', response);
          this.spinnerService.hide();
          this.toastr.success(this.translate.instant('toast.recover_correctly'));
          this.emailRecover='';
          this.showLogin=true;
        })
        .catch(error => {
          console.error('Error during recover:', error);
          this.spinnerService.hide();
          this.toastr.error(this.translate.instant('toast.error'));
        });
    }
  }  

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

}
