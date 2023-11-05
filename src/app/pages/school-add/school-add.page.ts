import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-school-add',
  templateUrl: './school-add.page.html',
  styleUrls: ['./school-add.page.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateY(0)'
      })),
      state('out', style({
        transform: 'translateY(100%)'
      })),
      transition('in => out', [
        animate('300ms ease-in-out')
      ]),
      transition('out => in', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class SchoolAddPage implements OnInit {

  showStation:boolean=false;
  moreState: string = 'out';

  constructor(private router: Router) {}

  ngOnInit() {
  }

  toggleMore() {
    this.moreState = this.moreState === 'out' ? 'in' : 'out';
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

}
