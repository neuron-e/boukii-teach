import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss'],
})
export class ClientsPage implements OnInit {

  showClients:boolean=true;
  showSchools:boolean=false;

  constructor(private router: Router, private menuService: MenuService) {}

  ngOnInit() {
  }

  toggleMenu() {
    this.menuService.toggleMenu();
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

}
