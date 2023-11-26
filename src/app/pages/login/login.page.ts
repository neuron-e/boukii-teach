import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TeachService } from '../../services/teach.service';
import { MonitorDataService } from '../../services/monitor-data.service';

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

  constructor(private router: Router, private teachService: TeachService, private monitorDataService: MonitorDataService) {}

  ngOnInit() {
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    this.teachService.login(this.email, this.password).subscribe(
      response => {
        console.log('Login successful', response);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('monitorId', response.data.user.monitors[0].id);
        this.monitorDataService.setMonitorData(response.data.user);
        this.goTo('home');
        this.email='';
        this.password='';
      },
      error => {
        console.error('Login failed', error);
      }
    );
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

}
