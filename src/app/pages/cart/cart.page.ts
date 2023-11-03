import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {

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

  monthNames: string[] = [];
  weekdays: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  currentMonth: number;
  currentYear: number;
  days: any[] = [];

  isCollective:boolean=true;
  isPrivate:boolean=false;
  activeDates: string[] = ['2023-10-20','2023-10-28','2023-10-29','2023-10-30','2023-11-4','2023-11-5','2023-11-6','2023-11-7','2023-11-18','2023-11-19','2023-11-20'];

  constructor(private router: Router) {}

  ngOnInit() {
    this.initializeMonthNames();
    this.currentMonth = new Date().getMonth();
    this.currentYear = new Date().getFullYear();
    this.renderCalendar();
  }

  initializeMonthNames() {
    this.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  }

  prevMonth() {
    if (this.currentYear > new Date().getFullYear() || (this.currentYear === new Date().getFullYear() && this.currentMonth > new Date().getMonth())) {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      this.renderCalendar();
    }
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.renderCalendar(); 
  }
  
  renderCalendar() {
    const startDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    
    this.days = [];
    //Start monday
    let adjustedStartDay = startDay - 1;
    if (adjustedStartDay < 0) adjustedStartDay = 6;

    for (let j = 0; j < adjustedStartDay; j++) {
      this.days.push({ number: '', active: false });
    }

    for(let i = 1; i <= daysInMonth; i++) {
      const spanDate = new Date(this.currentYear, this.currentMonth, i);
      const isPast = spanDate < new Date();
      const dateStr = `${this.currentYear}-${this.currentMonth + 1}-${i}`;
      const isActive = !isPast && this.activeDates.includes(dateStr);
      this.days.push({ number: i, active: isActive, selected: false, past: isPast });
    }

    let lastDayOfWeek = new Date(this.currentYear, this.currentMonth, daysInMonth).getDay();
    for (let k = lastDayOfWeek; k <= 6 && lastDayOfWeek !== 6; k++) {
      this.days.push({ number: '', active: false });
    }
  }

  selectDay(day:any) {
    if (day.active) {
      this.days.forEach(d => d.selected = false);
      day.selected = true;
      const formattedDate = `${this.currentYear}-${this.currentMonth + 1}-${day.number}`;
    }
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

}
