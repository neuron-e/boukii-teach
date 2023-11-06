import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendar-available',
  templateUrl: './calendar-available.page.html',
  styleUrls: ['./calendar-available.page.scss'],
})
export class CalendarAvailablePage implements OnInit {
  
  showMonthAvailable:boolean = true;
  showDayAvailable:boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

}
