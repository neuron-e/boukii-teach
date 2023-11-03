import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-station',
  templateUrl: './station.page.html',
  styleUrls: ['./station.page.scss'],
})
export class StationPage implements OnInit {

  weatherWeek:any[] = [
    {day:'Lun',degrees:10,img:'assets/icon/weather_1.png'},
    {day:'Mar',degrees:9,img:'assets/icon/weather_1.png'},
    {day:'Mer',degrees:8,img:'assets/icon/weather_6.png'},
    {day:'Jeu',degrees:10,img:'assets/icon/weather_6.png'},
    {day:'Ven',degrees:12,img:'assets/icon/weather_1.png'},
    {day:'Sam',degrees:7,img:'assets/icon/weather_12.png'},
    {day:'Dim',degrees:10,img:'assets/icon/weather_1.png'},
  ];

  showStations:boolean = false;
  showSchools:boolean = true;
  showActivities:boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

}
