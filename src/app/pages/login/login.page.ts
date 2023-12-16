import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TeachService } from '../../services/teach.service';
import { MonitorDataService } from '../../services/monitor-data.service';
import { SharedDataService } from '../../services/shared-data.service';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../services/spinner.service';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(private router: Router, private teachService: TeachService, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private toastr: ToastrService, private spinnerService: SpinnerService, private translate: TranslateService) {}

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
        this.monitorDataService.fetchMonitorData(response.data.user.monitors[0].id);
        
        // Fetch data
        try {
          await firstValueFrom(this.sharedDataService.fetchDegrees(response.data.user.monitors[0].active_school));
          await firstValueFrom(this.sharedDataService.fetchSports(response.data.user.monitors[0].active_school));
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
