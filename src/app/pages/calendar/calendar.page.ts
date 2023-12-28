import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { SharedDataService } from '../../services/shared-data.service';
import { TeachService } from '../../services/teach.service';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../services/spinner.service';
import { TranslateService } from '@ngx-translate/core';
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
  weekdays: string[] = [];
  weekdaysShort: string[] = [];
  weekdayNames: string[] = [];
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

  hourStartDay: string;
  hourEndDay: string;
  hoursRange: string[] = [];
  vacationDays:any[];

  bookingsCurrent: any[] = [];
  nwdsCurrent: any[] = [];
  degrees: any[] = [];
  sports: any[] = [];
  monthBoundaries:any;
  canRestart:boolean=false;

  constructor(private router: Router, private menuService: MenuService, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private teachService: TeachService, private toastr: ToastrService, private spinnerService: SpinnerService, private translate: TranslateService) {
    this.translate.onLangChange.subscribe(() => {
      this.loadWeekdays();
    });
  
    this.loadWeekdays();
  }

  async ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(async monitorData => {
      if (monitorData) {
        //console.log(monitorData);
        this.spinnerService.show();
        this.monitorData = monitorData;
        try {
          this.sports = await firstValueFrom(this.sharedDataService.fetchSports(this.monitorData.active_school));
        } catch (error) {
          console.error('Error fetching data:', error);
          this.toastr.error(this.translate.instant('toast.error_loading_data'));
        }
        await this.loadSeason();

        this.selectedDate = new Date();
        this.currentMonth = this.selectedDate.getMonth();
        this.currentYear = this.selectedDate.getFullYear();
        this.currentDay = this.selectedDate.getDate();
        const { firstDay, lastDay } = this.getMonthBoundaries(this.currentYear, this.currentMonth);
        await this.generateHoursRange();
        this.loadBookings(firstDay,lastDay);
      }
    });
  }

  async loadSeason() {
    this.spinnerService.show();

    const searchData = {
      numPage: 1,
      perPage: 1000,
      order: 'asc',
      orderColumn: 'id',
      school_id: this.monitorData.active_school,
      is_active: 1,
      exclude: '',
      user: null,
      filter: ''
    };

    try {
      const data:any = await this.teachService.getData('seasons', null, searchData).toPromise();

      let hour_start = '08:00';
      let hour_end = '18:00';
      if (data.data.length > 0) {
        this.vacationDays = JSON.parse(data.data[0].vacation_days);
        hour_start = data.data[0].hour_start ? data.data[0].hour_start.substring(0, 5) : '08:00';
        hour_end = data.data[0].hour_end ? data.data[0].hour_end.substring(0, 5) : '18:00';
      }
      this.hourStartDay = hour_start;
      this.hourEndDay = hour_end;

    } catch (error) {
        console.error('There was an error!', error);
    } finally {
        this.spinnerService.hide();
    }
  }

  loadWeekdays() {
    this.weekdays = [
      this.translate.instant('days_abbrev.monday'),
      this.translate.instant('days_abbrev.tuesday'),
      this.translate.instant('days_abbrev.wednesday'),
      this.translate.instant('days_abbrev.thursday'),
      this.translate.instant('days_abbrev.friday'),
      this.translate.instant('days_abbrev.saturday'),
      this.translate.instant('days_abbrev.sunday'),
    ];
    this.weekdaysShort = [
      this.translate.instant('days_abbrev_short.monday'),
      this.translate.instant('days_abbrev_short.tuesday'),
      this.translate.instant('days_abbrev_short.wednesday'),
      this.translate.instant('days_abbrev_short.thursday'),
      this.translate.instant('days_abbrev_short.friday'),
      this.translate.instant('days_abbrev_short.saturday'),
      this.translate.instant('days_abbrev_short.sunday'),
    ];
    this.weekdayNames = [
      this.translate.instant('days.sunday'),
      this.translate.instant('days.monday'),
      this.translate.instant('days.tuesday'),
      this.translate.instant('days.wednesday'),
      this.translate.instant('days.thursday'),
      this.translate.instant('days.friday'),
      this.translate.instant('days.saturday'),
    ];
    this.monthNames = [
      this.translate.instant('months.january'),
      this.translate.instant('months.february'),
      this.translate.instant('months.march'),
      this.translate.instant('months.april'),
      this.translate.instant('months.may'),
      this.translate.instant('months.june'),
      this.translate.instant('months.july'),
      this.translate.instant('months.august'),
      this.translate.instant('months.september'),
      this.translate.instant('months.october'),
      this.translate.instant('months.november'),
      this.translate.instant('months.december'),
    ];
  }

  //Reload tasks for block updates
  ionViewDidEnter() {
    this.restartTasksAgain();
  }

  getMonthBoundaries(year:any, month:any) {
    const firstDay = moment(new Date(year, month, 1)).format('YYYY-MM-DD');
    const lastDay = moment(new Date(year, month + 1, 0)).format('YYYY-MM-DD');
    return { firstDay: firstDay, lastDay: lastDay };
  }

  restartTasks() {
    const { firstDay, lastDay } = this.getMonthBoundaries(this.currentYear, this.currentMonth);
    this.loadBookings(firstDay,lastDay);
  }

  restartTasksRange(firstDay:string,lastDay:string) {
    this.loadBookings(firstDay,lastDay);
  }

  restartTasksAgain() {
    if(this.canRestart){
      if(this.showMonth){
        this.restartTasks();
      }
      else if(this.showWeek){
        const formattedWeekStart = moment(this.weekStart).format('YYYY-MM-DD');
        const formattedWeekEnd = moment(this.weekEnd).format('YYYY-MM-DD');
        this.restartTasksRange(formattedWeekStart,formattedWeekEnd);
      }
      else if(this.showDay){
        const formattedDay = moment(this.selectedDate).format('YYYY-MM-DD');
        this.restartTasksRange(formattedDay,formattedDay);
      }
    }
    else{
      this.canRestart = true;
    }
  }

  loadBookings(firstDay:string,lastDay:string) {
    this.spinnerService.show();
    const searchData:any = {
      date_start: firstDay, date_end: lastDay
    };
    if(this.monitorData.active_school){
      searchData.school_id = this.monitorData.active_school;
    }
    this.teachService.getData('teach/getAgenda', null, searchData).subscribe(
      (data:any) => {
        //console.log(data);
        this.processBookings(data.data.bookings, data.data.nwd);
      },
      error => {
        console.error('There was an error!', error);
        this.spinnerService.hide();
      }
    );
  }

  processBookings(bookings: any[], nwds: any[]) {
    const uniqueCourseGroups = new Map();
    this.bookingsCurrent = [];
    this.nwdsCurrent = nwds;
  
    bookings.forEach(booking => {
      if (booking.course) {
        let key = `${booking.course_id}-${booking.course_date_id}`;
        if(booking.course.course_type == 1){
          key = `${booking.course_id}-${booking.course_date_id}-${booking.course_subgroup_id}`;
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
  
   //console.log('Processed Bookings:', this.bookingsCurrent);


   let filteredNwds;
   if (this.monitorData.active_school) {
       filteredNwds = this.nwdsCurrent.filter(nwd => nwd.school_id === this.monitorData.active_school);
   } else {
       filteredNwds = this.nwdsCurrent;
   }

    this.tasksCalendar = [
      //BOOKINGS
      ...this.bookingsCurrent.map(booking => {
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
        
        const sport = this.sports.find(s => s.id === booking.course.sport_id);
    
        return {
          booking_id: booking.id,
          date: moment(booking.date).format('YYYY-MM-DD'),
          hour_start: booking.hour_start.substring(0, 5),
          hour_end: booking.hour_end.substring(0, 5),
          type: type,
          name: booking.course.name,
          sport_id: booking.course.sport_id,
          sport_name: sport ? sport.name : '',
          clients: booking.all_clients.length,
          max_participants: booking.course.max_participants,
          ...dateTotalAndIndex
        };
      }),
      //NWDS -> for active_school

      ...filteredNwds.map(nwd => {

        const hourTimesNwd = nwd.full_day ? {
            hour_start: this.hourStartDay,
            hour_end: this.hourEndDay
          } : {
          hour_start: nwd.start_time.substring(0, 5),
          hour_end: nwd.end_time.substring(0, 5)
        };

        return {
          school_id: nwd.school_id,
          block_id: nwd.id,
          date: moment(nwd.start_date).format('YYYY-MM-DD'),
          full_day: nwd.full_day,
          type: nwd.user_nwd_subtype_id == 1 ? 'block' : 'block_payed',
          color: nwd.user_nwd_subtype_id == 2 ? nwd.color : "#89add1",
          name: nwd.description,
          ...hourTimesNwd
        };
      })
    ];
    
    //console.log('Combined Tasks Calendar:', this.tasksCalendar);
    this.updateTasksWithStyles();
    this.spinnerService.hide();
  }  

  getPositionDate(courseDates: any[], courseDateId: string): number {
    const index = courseDates.findIndex(date => date.id === courseDateId);
    return index >= 0 ? index + 1 : 0;
  }

  getTaskStyle(task: any, weekStyle: boolean = false) {
    let baseStyle = weekStyle ? task.styleWeek : task.style;
  
    if (task.type === 'block' || task.type === 'block_payed') {
      return {
        ...baseStyle,
        'background': task.color
      };
    } else {
      return baseStyle;
    }
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
    this.currentMonth = this.selectedDate.getMonth();
    this.currentYear = this.selectedDate.getFullYear();
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
    this.spinnerService.show();
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
      //Format month/day 2 digits
      const monthStr = `${this.currentMonth + 1}`.padStart(2, '0');
      const dayStr = `${i}`.padStart(2, '0');
      const dateStr = `${this.currentYear}-${monthStr}-${dayStr}`;
      const isToday = i === currentDay && this.currentMonth === currentMonth && this.currentYear === currentYear;
      
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
    //Format month/day 2 digits
    const monthStrDay = `${this.currentMonth + 1}`.padStart(2, '0');
    const dayStrDay = `${this.currentDay}`.padStart(2, '0');
    const selectedDateStr = `${this.currentYear}-${monthStrDay}-${dayStrDay}`;
    this.filteredTasks = this.tasksCalendar.filter(task => task.date === selectedDateStr);
    // Filter tasks for week
    this.filteredTasksWeek = this.tasksCalendar.filter(task => {
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= this.weekStart && taskDate <= this.weekEnd;
    });
    this.spinnerService.hide();
  }

  selectDay(day:any): void {

    if(day.number) {
      this.selectedDate = new Date(this.currentYear, this.currentMonth, day.number);
      this.currentDay = day.number;
      this.calculateDayRange();
      this.showDay=true;this.showMonth=false;this.showWeek=false;

      // Filter tasks for day
      //Format month/day 2 digits
      const monthStrDay = `${this.currentMonth + 1}`.padStart(2, '0');
      const dayStrDay = `${this.currentDay}`.padStart(2, '0');
      const selectedDateStr = `${this.currentYear}-${monthStrDay}-${dayStrDay}`;
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
      //Check start time is inside hours range
      const firstTimeRange = this.parseTime(this.hourStartDay);
      const startTime = this.parseTime(task.hour_start);
      if (startTime < firstTimeRange) {
        startTime.setHours(firstTimeRange.getHours(), firstTimeRange.getMinutes(), 0, 0);
      }
      //Check end time is inside hours range
      const lastTimeRange = this.parseTime(this.hourEndDay);
      const endTime = this.parseTime(task.hour_end);
      if (endTime > lastTimeRange) {
        endTime.setHours(lastTimeRange.getHours(), lastTimeRange.getMinutes(), 0, 0);
      }
  
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

    this.renderCalendar()
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

  openAvailables(id_edit?: any, date?: string) {
    if(id_edit && date){
      this.goTo('calendar-available','day',date,id_edit);
    }
    else{
      if(this.showDay){
        this.goTo('calendar-available','day',moment(this.selectedDate).format('YYYY-MM-DD'));
      }
      else{
        this.goTo('calendar-available');
      }
    }
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

  ngOnDestroy() {
    if (this.subscription) {
        this.subscription.unsubscribe();
    }
  }

}
