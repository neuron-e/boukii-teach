import { Component, OnInit,OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { Subscription } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { TeachService } from '../../services/teach.service';
import * as moment from 'moment';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss'],
})
export class ClientsPage implements OnInit, OnDestroy {
  monitorData: any;
  private subscription: Subscription;

  showClients:boolean=true;
  showSchools:boolean=false;
  clientsMonitor:any[];

  constructor(private router: Router, private menuService: MenuService, private monitorDataService: MonitorDataService, private teachService: TeachService) {}

  ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(data => {
      if (data) {
        this.monitorData = data;

        this.teachService.getData('teach/clients').subscribe(
          (data:any) => {
            data.forEach((client:any) => {
              const birthDate = moment(client.birth_date);
              const age = moment().diff(birthDate, 'years');
              client.birth_years = age;
            });
            this.clientsMonitor = data;
            console.log(this.clientsMonitor);
          },
          error => {
            console.error('There was an error!', error);
          }
        );

      }
    });
  }

  toggleMenu() {
    this.menuService.toggleMenu();
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
