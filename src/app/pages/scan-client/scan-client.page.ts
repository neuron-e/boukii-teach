import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-scan-client',
  templateUrl: './scan-client.page.html',
  styleUrls: ['./scan-client.page.scss'],
})
export class ScanClientPage implements OnInit {

  starterLevel:any = {id:0,name:'Débutante',level:'STARTER LEAGUE',percentage:0,color:'#c8c8c8',objectives:["Je n'ai jamais fait de ski."]};
  dataLevels:any[] = [
    {id:1,name:'Prince Bleu',level:'BLUE LEAGUE',percentage:30,color:'#0057ff',inactive_color:'#80adff',objectives:["Virage chasse-neige sur piste bleue facile","Dérapage latéral","Skier des bosses et des sauts faciles avec les skis parallèles","Virage chasse-neige sur piste bleue facile"]},
    {id:2,name:'Roi Bleu',level:'BLUE LEAGUE',percentage:60,color:'#0057ff',inactive_color:'#80adff',objectives:["Virage chasse-neige sur piste bleue facile","Dérapage latéral","Skier des bosses et des sauts faciles avec les skis parallèles","Virage chasse-neige sur piste bleue facile"]},
    {id:3,name:'Star Bleu',level:'BLUE LEAGUE',percentage:100,color:'#0057ff',inactive_color:'#80adff',objectives:["Virage chasse-neige sur piste bleue facile","Dérapage latéral","Skier des bosses et des sauts faciles avec les skis parallèles","Virage chasse-neige sur piste bleue facile"]},
    {id:4,name:'Prince Red',level:'RED LEAGUE',percentage:30,color:'#e9484a',inactive_color:'#fba0a1',objectives:["Virage chasse-neige sur piste bleue facile","Dérapage latéral","Skier des bosses et des sauts faciles avec les skis parallèles","Virage chasse-neige sur piste bleue facile"]},
    {id:5,name:'Roi Red',level:'RED LEAGUE',percentage:60,color:'#e9484a',inactive_color:'#fba0a1',objectives:["Virage chasse-neige sur piste bleue facile","Dérapage latéral","Skier des bosses et des sauts faciles avec les skis parallèles","Virage chasse-neige sur piste bleue facile"]},
    {id:6,name:'Star Red',level:'RED LEAGUE',percentage:100,color:'#e9484a',inactive_color:'#fba0a1',objectives:["Virage chasse-neige sur piste bleue facile","Dérapage latéral","Skier des bosses et des sauts faciles avec les skis parallèles","Virage chasse-neige sur piste bleue facile"]},
    {id:7,name:'Prince Noir',level:'BLACK LEAGUE',percentage:30,color:'#373737',inactive_color:'#806f6f',objectives:["Virage chasse-neige sur piste bleue facile","Dérapage latéral","Skier des bosses et des sauts faciles avec les skis parallèles","Virage chasse-neige sur piste bleue facile"]},
    {id:8,name:'Roi Noir',level:'BLACK LEAGUE',percentage:60,color:'#373737',inactive_color:'#806f6f',objectives:["Virage chasse-neige sur piste bleue facile","Dérapage latéral","Skier des bosses et des sauts faciles avec les skis parallèles","Virage chasse-neige sur piste bleue facile"]},
    {id:9,name:'Star Noir',level:'BLACK LEAGUE',percentage:100,color:'#373737',inactive_color:'#806f6f',objectives:["Virage chasse-neige sur piste bleue facile","Dérapage latéral","Skier des bosses et des sauts faciles avec les skis parallèles","Virage chasse-neige sur piste bleue facile"]},
  ];
  allLevels: any[] = [this.starterLevel, ...this.dataLevels];

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
