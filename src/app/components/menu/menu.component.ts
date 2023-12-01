import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { MenuService } from '../../services/menu.service';
import { MonitorDataService } from '../../services/monitor-data.service';
import { SharedDataService } from '../../services/shared-data.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../services/spinner.service';

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

  constructor(public menuService: MenuService, private router: Router, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private toastr: ToastrService, private spinnerService: SpinnerService) {}

  ngOnInit() {}

  onClose() {
    this.close.emit();
  }

  logout() {
    this.spinnerService.show();
    localStorage.removeItem('token');
    localStorage.removeItem('monitorId');
    this.monitorDataService.clearMonitorData();
    this.sharedDataService.clearDegreesData();
    this.sharedDataService.clearSportsData();
    this.sharedDataService.clearLanguagesData();
    this.spinnerService.hide();
    this.toastr.success('Déconnecté');
    this.goTo('start');
  }

  goTo(...urls: string[]) {
    this.onClose();
    this.router.navigate(urls);
  }

}
