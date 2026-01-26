import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {

  showClients:boolean=true;
  showSchools:boolean=false;
  unreadCount$ = this.notificationService.unreadCount$;

  constructor(private router: Router, private menuService: MenuService, private notificationService: NotificationService) {}

  ngOnInit() {
  }

  toggleMenu() {
    this.menuService.toggleMenu();
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

}
