import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-complete',
  templateUrl: './register-complete.page.html',
  styleUrls: ['./register-complete.page.scss'],
})
export class RegisterCompletePage implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

}
