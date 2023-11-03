import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent  implements OnInit {

  @Input() section: string;

  constructor(private router: Router) {}

  ngOnInit() {}

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

}
