import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  showLogin:boolean = true;
  showPassword:boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

}
