import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendar-available',
  templateUrl: './calendar-available.page.html',
  styleUrls: ['./calendar-available.page.scss'],
})
export class CalendarAvailablePage implements OnInit {
  
  showMonthAvailable:boolean = true;
  showDayAvailable:boolean = false;
  today = new Date();
  currentMonth: number;
  currentYear: number;
  currentDay: number;
  selectedDate: Date;
  monthNames: string[] = [];
  weekdays: string[] = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
  weekdaysShort: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  weekdayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  days: any[] = [];
  hourStartDay: string = '07:00';
  hourEndDay: string = '18:00';
  hoursRange: string[] = [];
  
  firstDateSelected: any = null;
  secondDateSelected: any = null;
  firstDateSelectedFormat: any = null;
  secondDateSelectedFormat: any = null;
  
  showDayCalendar:boolean=false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.generateHoursRange();
    this.initializeMonthNames();
    this.selectedDate = new Date();
    this.currentMonth = this.selectedDate.getMonth();
    this.currentYear = this.selectedDate.getFullYear();
    this.currentDay = this.selectedDate.getDate();
    this.renderCalendar();
  }

  generateHoursRange(): void {
    const startTime = this.parseTime(this.hourStartDay);
    const endTime = this.parseTime(this.hourEndDay);
    let currentTime = new Date(startTime);

    while (currentTime <= endTime) {
      this.hoursRange.push(this.formatTime(currentTime));
      currentTime.setHours(currentTime.getHours() + 1);
    }
  }

  parseTime(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    return time;
  }

  formatTime(date: Date): string {
    return date.toTimeString().substring(0, 5);
  }

  initializeMonthNames() {
    this.monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  }

  previousMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.renderCalendar();
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.renderCalendar();
  }

  previousDay(): void {
    this.selectedDate.setDate(this.selectedDate.getDate() - 1);
    this.currentMonth = this.selectedDate.getMonth();
    this.currentYear = this.selectedDate.getFullYear();
    this.currentDay = this.selectedDate.getDate();
    this.renderCalendar();
  }
  
  nextDay(): void {
    this.selectedDate.setDate(this.selectedDate.getDate() + 1);
    this.currentMonth = this.selectedDate.getMonth();
    this.currentYear = this.selectedDate.getFullYear();
    this.currentDay = this.selectedDate.getDate();
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
      this.days.push({ number: null, active: false });
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    for(let i = 1; i <= daysInMonth; i++) {
      const spanDate = new Date(this.currentYear, this.currentMonth, i);
      spanDate.setHours(0, 0, 0, 0);
      const isPast = spanDate < currentDate;

      const isToday = i === currentDay && this.currentMonth === currentMonth && this.currentYear === currentYear;
      this.days.push({ 
        number: i, selected: false, past: isPast, today: isToday,
        activeSelected: false, activeRange: false
      });
    }

    let lastDayOfWeek = new Date(this.currentYear, this.currentMonth, daysInMonth).getDay();
    for (let k = lastDayOfWeek; k <= 6 && lastDayOfWeek !== 6; k++) {
      this.days.push({ number: null, selected: false });
    }

    // Reapply selected days
    this.applyRange();
  }

  getWeekdayName(date: Date): string {
    return this.weekdayNames[date.getDay()];
  }

  selectDate(day:any): void {
    if (day.past) {
      return;
    }

    const date = new Date(this.currentYear, this.currentMonth, day.number);

    if (!this.firstDateSelected || (this.secondDateSelected && this.firstDateSelected)) {
      this.resetSelection();
      this.firstDateSelected = date;
      this.firstDateSelectedFormat = this.formatDate(date);
      day.activeSelected = true;
    } else {
      if (date < this.firstDateSelected) {
        this.firstDateSelected = date;
        this.firstDateSelectedFormat = this.formatDate(date);
        this.resetSelection();
        day.activeSelected = true;
      } else {
        this.secondDateSelected = date;
        this.secondDateSelectedFormat = this.formatDate(date);
        this.applyRange();
      }
    }
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  applyRange(): void {
    if (!this.firstDateSelected || !this.secondDateSelected) {
      return;
    }

    this.days.forEach(day => {
      if (day.number !== null) {
        const date = new Date(this.currentYear, this.currentMonth, day.number);
        if (date >= this.firstDateSelected && date <= this.secondDateSelected) {
          day.activeRange = true;
        } else {
          day.activeRange = false;
        }
        if (date.getTime() === this.firstDateSelected.getTime() || date.getTime() === this.secondDateSelected.getTime()) {
          day.activeSelected = true;
        } else {
          day.activeSelected = false;
        }
      } else {
        day.activeSelected = false;
        day.activeRange = false;
      }
    });
  }

  resetSelection(): void {
    this.days.forEach(day => {
      day.activeSelected = false;
      day.activeRange = false;
    });
    this.firstDateSelected = null;
    this.secondDateSelected = null;
    this.firstDateSelectedFormat = null;
    this.secondDateSelectedFormat = null;
  }

  selectDay(day:any): void {
    if(day.number && !day.past) {
      this.selectedDate = new Date(this.currentYear, this.currentMonth, day.number);
      this.currentDay = day.number;
      this.showDayCalendar=false;
    }
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

}
