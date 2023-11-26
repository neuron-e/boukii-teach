import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { Subscription } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { TeachService } from '../../services/teach.service';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit, OnDestroy {
  monitorData: any;
  private subscription: Subscription;
  
  showMonth:boolean = true;
  showWeek:boolean = false;
  showDay:boolean = false;
  
  today = new Date();
  currentMonth: number;
  currentYear: number;

  currentDay: number;
  selectedDate: Date;
  weekStart: Date;
  weekEnd: Date;

  monthNames: string[] = [];
  weekdays: string[] = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
  weekdaysShort: string[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  weekdayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  days: any[] = [];

  filteredTasks: any[];
  filteredTasksWeek: any[] = [];
  tasksCalendar: any[] = [];
  /*tasksCalendar: any[] = [
    {date:'2023-11-5',hour_start:'09:30',hour_end:'11:00',type:'collective',name:'Name',sport_id:1,clients:5,max_participants:6,date_index:3,date_total:6},
    {date:'2023-11-5',hour_start:'11:30',hour_end:'13:30',type:'private'},
    {date:'2023-11-6',hour_start:'07:00',hour_end:'09:00',type:'block'},
    {date:'2023-11-6',hour_start:'09:00',hour_end:'11:00',type:'collective'},
    {date:'2023-11-6',hour_start:'12:00',hour_end:'13:00',type:'other'},
    {date:'2023-11-7',hour_start:'11:00',hour_end:'12:00',type:'private'},
    {date:'2023-11-8',hour_start:'09:00',hour_end:'11:00',type:'collective'},
    {date:'2023-11-8',hour_start:'13:00',hour_end:'16:00',type:'block'},
    {date:'2023-11-10',hour_start:'08:00',hour_end:'10:00',type:'block'},
    {date:'2023-11-10',hour_start:'10:00',hour_end:'11:00',type:'private'},
    {date:'2023-11-10',hour_start:'11:00',hour_end:'13:00',type:'block_payed'},
    {date:'2023-11-10',hour_start:'13:00',hour_end:'14:00',type:'collective'},
    {date:'2023-11-10',hour_start:'14:00',hour_end:'15:00',type:'other'},
    {date:'2023-11-11',hour_start:'09:00',hour_end:'11:00',type:'block'},
  ];*/

  hourStartDay: string = '07:00';
  hourEndDay: string = '18:00';
  hoursRange: string[] = [];

  bookingsCurrent: any[] = [];
  degrees: any[] = [];
  sports: any[] = [];
  monthBoundaries:any;

  constructor(private router: Router, private menuService: MenuService, private monitorDataService: MonitorDataService, private teachService: TeachService) {}

  async ngOnInit() {
    this.selectedDate = new Date();
    this.currentMonth = this.selectedDate.getMonth();
    this.currentYear = this.selectedDate.getFullYear();
    this.currentDay = this.selectedDate.getDate();
    const { firstDay, lastDay } = this.getMonthBoundaries(this.currentYear, this.currentMonth);
    this.initializeMonthNames();
    await this.generateHoursRange();
    await this.loadBookings(firstDay,lastDay);
  }

  getMonthBoundaries(year:any, month:any) {
    const firstDay = new Date(year, month, 1);
    const formattedFirstDay = firstDay.toISOString().split('T')[0];
  
    const lastDay = new Date(year, month + 1, 0);
    const formattedLastDay = lastDay.toISOString().split('T')[0];
  
    return { firstDay: formattedFirstDay, lastDay: formattedLastDay };
  }

  restInitialization() {
    this.renderCalendar();
  }

  async restartTasks() {
    const { firstDay, lastDay } = this.getMonthBoundaries(this.currentYear, this.currentMonth);
    await this.loadBookings(firstDay,lastDay);
  }

  async restartTasksRange(firstDay:string,lastDay:string) {
    await this.loadBookings(firstDay,lastDay);
  }

  async loadBookings(firstDay:string,lastDay:string) {
    this.teachService.getData('teach/getAgenda', null, { date_start: firstDay, date_end: lastDay }).subscribe(
      async (data:any) => {
        console.log(data);
        await this.processBookings(data.data.bookings);
      },
      error => {
        console.error('There was an error!', error);
      }
    );
  }

  async processBookings(bookings: any[]) {
    const uniqueCourseGroups = new Map();
    this.bookingsCurrent = [];
  
    bookings.forEach(booking => {
      if (booking.course) {
        let key = `${booking.course_id}-${booking.course_date_id}`;
        if(booking.course.course_type == 1){
          key = `${booking.course_id}-${booking.course_date_id}-${booking.course_group_id}`;
        }
        if (!uniqueCourseGroups.has(key)) {
          uniqueCourseGroups.set(key, {
            ...booking,
            all_clients: [booking.client]
          });
          this.bookingsCurrent.push(uniqueCourseGroups.get(key));
        } else {
          uniqueCourseGroups.get(key).all_clients.push(booking.client);
        }
      }
    });
  
    console.log('Processed Bookings:', this.bookingsCurrent);

    this.tasksCalendar = this.bookingsCurrent.map(booking => {
      let type;
      switch(booking.course.course_type) {
        case 1:
          type = 'collective';
          break;
        case 2:
          type = 'private';
          break;
        default:
          type = 'unknown';
      }
  
      const dateTotalAndIndex = booking.course.course_type === 2 ? { date_total: 0, date_index: 0 } : {
        date_total: booking.course.course_dates.length,
        date_index: this.getPositionDate(booking.course.course_dates, booking.course_date_id)
      };
  
      return {
        booking_id: booking.id,
        date: moment(booking.date).format('YYYY-MM-D'),
        hour_start: booking.hour_start.substring(0, 5),
        hour_end: booking.hour_end.substring(0, 5),
        type: type,
        name: booking.course.name,
        sport_id: booking.course.sport_id,
        clients: booking.all_clients.length,
        max_participants: booking.course.max_participants,
        ...dateTotalAndIndex
      };
    });
  
    console.log('Tasks Calendar:', this.tasksCalendar);
    await this.updateTasksWithStyles();
  }  

  getPositionDate(courseDates: any[], courseDateId: string): number {
    const index = courseDates.findIndex(date => date.id === courseDateId);
    return index >= 0 ? index + 1 : 0;
  }

  getDegrees() {
    this.teachService.getData('degrees').subscribe(
      (data:any) => {
        console.log(data);
        this.degrees = data.data;
      },
      error => {
        console.error('There was an error!', error);
      }
    );
  }

  getSports() {
    this.teachService.getData('sports').subscribe(
      (data:any) => {
        console.log(data);
        this.sports = data.data;
      },
      error => {
        console.error('There was an error!', error);
      }
    );
  }

  toggleMenu() {
    this.menuService.toggleMenu();
  }

  async generateHoursRange() {
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
    let momentDate = moment(this.selectedDate);
    momentDate.subtract(1, 'months');
    this.selectedDate = momentDate.toDate();
    this.currentDay = this.selectedDate.getDate();

    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.restartTasks();
  }

  nextMonth(): void {
    let momentDate = moment(this.selectedDate);
    momentDate.add(1, 'months');
    this.selectedDate = momentDate.toDate();
    this.currentDay = this.selectedDate.getDate();

    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.restartTasks();
  }

  calculateMonthRange() {
    this.restartTasks();
  }

  previousDay(): void {
    this.selectedDate.setDate(this.selectedDate.getDate() - 1);
    this.currentMonth = this.selectedDate.getMonth();
    this.currentYear = this.selectedDate.getFullYear();
    this.currentDay = this.selectedDate.getDate();

    const formattedDay = moment(this.selectedDate).format('YYYY-MM-DD');
    this.restartTasksRange(formattedDay,formattedDay);
  }
  
  nextDay(): void {
    this.selectedDate.setDate(this.selectedDate.getDate() + 1);
    this.currentMonth = this.selectedDate.getMonth();
    this.currentYear = this.selectedDate.getFullYear();
    this.currentDay = this.selectedDate.getDate();

    const formattedDay = moment(this.selectedDate).format('YYYY-MM-DD');
    this.restartTasksRange(formattedDay,formattedDay);
  }

  calculateDayRange() {
    const formattedDay = moment(this.selectedDate).format('YYYY-MM-DD');
    this.restartTasksRange(formattedDay,formattedDay);
  }

  previousWeek(): void {
    this.selectedDate.setDate(this.selectedDate.getDate() - 7);
    this.currentDay = this.selectedDate.getDate();
    this.calculateWeekRange();
  }
  
  nextWeek(): void {
    this.selectedDate.setDate(this.selectedDate.getDate() + 7);
    this.currentDay = this.selectedDate.getDate();
    this.calculateWeekRange();
  }

  calculateWeekRange() {
    const dayOfWeek = this.selectedDate.getDay();
    //start monday
    const startOffset = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
  
    this.weekStart = new Date(this.selectedDate);
    this.weekStart.setDate(this.selectedDate.getDate() - startOffset);
    this.weekStart.setHours(0, 0, 0, 0);
  
    this.weekEnd = new Date(this.weekStart);
    this.weekEnd.setDate(this.weekStart.getDate() + 6);
    this.weekEnd.setHours(0, 0, 0, 0);
  
    this.currentMonth = this.weekEnd.getMonth();
    this.currentYear = this.weekEnd.getFullYear();

    const formattedWeekStart = moment(this.weekStart).format('YYYY-MM-DD');
    const formattedWeekEnd = moment(this.weekEnd).format('YYYY-MM-DD');
    this.restartTasksRange(formattedWeekStart,formattedWeekEnd);
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

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    for(let i = 1; i <= daysInMonth; i++) {
      const spanDate = new Date(this.currentYear, this.currentMonth, i);
      spanDate.setHours(0, 0, 0, 0);
      
      const isPast = spanDate < currentDate;
      const dateStr = `${this.currentYear}-${this.currentMonth + 1}-${i}`;
      const isToday = i === currentDay && this.currentMonth === currentMonth && this.currentYear === currentYear;
      const isActive = this.tasksCalendar.some(task => task.date === dateStr && task.type !== 'block');
      
      const taskTypes = this.tasksCalendar.reduce((accumulator, task) => {
        if (task.date === dateStr) {
          accumulator.isPrivate = accumulator.isPrivate || task.type === 'private';
          accumulator.isCollective = accumulator.isCollective || task.type === 'collective';
          accumulator.isOther = accumulator.isOther || task.type === 'other';
          accumulator.isBlock = accumulator.isBlock || task.type === 'block';
          accumulator.isBlockPayed = accumulator.isBlockPayed || task.type === 'block_payed';
        }
        return accumulator;
      }, { isPrivate: false, isCollective: false, isOther: false, isBlock: false, isBlockPayed: false });
            
      this.days.push({ 
        number: i, selected: false, past: isPast, today: isToday,
        private: taskTypes.isPrivate, collective: taskTypes.isCollective, other: taskTypes.isOther, 
        block: taskTypes.isBlock, blockPayed: taskTypes.isBlockPayed
      });
    }

    let lastDayOfWeek = new Date(this.currentYear, this.currentMonth, daysInMonth).getDay();
    for (let k = lastDayOfWeek; k <= 6 && lastDayOfWeek !== 6; k++) {
      this.days.push({ number: '', active: false, selected: false, today: false });
    }

    // Filter tasks for day
    const selectedDateStr = `${this.currentYear}-${this.currentMonth + 1}-${this.currentDay}`;
    this.filteredTasks = this.tasksCalendar.filter(task => task.date === selectedDateStr);
    // Filter tasks for week
    this.filteredTasksWeek = this.tasksCalendar.filter(task => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= this.weekStart && taskDate <= this.weekEnd;
    });
  }

  selectDay(day:any): void {
    if(day.number) {
      this.selectedDate = new Date(this.currentYear, this.currentMonth, day.number);
      this.currentDay = day.number;
      this.calculateDayRange();
      this.showDay=true;this.showMonth=false;this.showWeek=false;

      // Filter tasks for day
      const selectedDateStr = `${this.currentYear}-${this.currentMonth + 1}-${this.currentDay}`;
      this.filteredTasks = this.tasksCalendar.filter(task => task.date === selectedDateStr);
    }
  }

  getWeekdayName(date: Date): string {
    return this.weekdayNames[date.getDay()];
  }

  getWeekRangeDisplay(): string {
    const endMonth = this.monthNames[this.weekEnd.getMonth()];
    const startDay = this.weekStart.getDate();
    const endDay = this.weekEnd.getDate();
    const year = this.weekEnd.getFullYear();
    return `${startDay}-${endDay} ${endMonth} ${year}`;
  }

  async updateTasksWithStyles() {
    const hourHeight = 54;
    const hourSeparator = 3; 
    const totalHourHeight = hourHeight + hourSeparator;
    const startHourOffset = 11;

    const leftValues:any = {
      '0': '85.5%',
      '1': '0%',
      '2': '14.25%',
      '3': '28.5%',
      '4': '42.75%',
      '5': '57%',
      '6': '71.25%'
    };
  
    this.tasksCalendar = this.tasksCalendar.map(task => {
      const dayOfWeek = this.getDayOfWeek(task.date);
      const startTime = this.parseTime(task.hour_start);
      const endTime = this.parseTime(task.hour_end);
  
      //calculate top
      const startHour = startTime.getHours() - parseInt(this.hourStartDay.split(':')[0], 10);
      const startMinutes = startTime.getMinutes();
      const top = startHourOffset + (startHour * totalHourHeight) + (startMinutes / 60) * hourHeight;
  
      //calculate height
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = (durationMs % (1000 * 60 * 60)) / (1000 * 60);
      let height = 0;
      if(durationHours <= 1){
        height = (hourHeight * durationHours) + (totalHourHeight * durationMinutes / 60);
      }
      else{
        height = hourHeight + (totalHourHeight * (durationHours - 1) ) + (totalHourHeight * durationMinutes / 60);
      }

      // Left from day of week
      const left = leftValues[dayOfWeek.toString()];
  
      return {
        ...task,
        style: {
          top: `${top}px`,
          height: `${height}px`
        },
        styleWeek: {
          top: `${top}px`,
          height: `${height}px`,
          left: left
        }
      };
    });

    this.restInitialization()
  }

  getDayOfWeek(dateStr: string): number {
    const date = new Date(dateStr);
    return date.getDay();
  }

  getIconForTaskType(type: string): any {
    switch (type) {
      case 'collective':
        return 'assets/icon/course-collective-icon.png';
      case 'private':
        return 'assets/icon/course-private-icon.png';
      case 'other':
        return 'assets/icon/course-other-icon.png';
    }
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
