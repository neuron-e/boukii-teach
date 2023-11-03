import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stations-list',
  templateUrl: './stations-list.page.html',
  styleUrls: ['./stations-list.page.scss'],
})
export class StationsListPage implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

}
