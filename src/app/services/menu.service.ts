import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private showMenu = new BehaviorSubject<boolean>(false);
  showMenu$ = this.showMenu.asObservable();

  constructor() { }

  toggleMenu() {
    this.showMenu.next(!this.showMenu.value);
  }
}
