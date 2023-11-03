import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { MenuService } from '../../services/menu.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  animations: [
    trigger('slideAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms cubic-bezier(0.73, 0, 0.27, 1)', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.73, 0, 0.27, 1)', style({ transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class MenuComponent  implements OnInit {
  @Output() close = new EventEmitter<void>();
  showMenu$ = this.menuService.showMenu$;

  constructor(public menuService: MenuService, private router: Router) { }

  ngOnInit() {}

  onClose() {
    this.close.emit();
  }

  goTo(...urls: string[]) {
    this.onClose();
    this.router.navigate(urls);
  }

}
