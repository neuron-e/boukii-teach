import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  showCalendar:boolean=true;
  showActivities:boolean=false;

  constructor(private router: Router) {}

  ngOnInit() {
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

}
