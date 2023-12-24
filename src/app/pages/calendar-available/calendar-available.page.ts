import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { TeachService } from '../../services/teach.service';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../services/spinner.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar-available',
  templateUrl: './calendar-available.page.html',
  styleUrls: ['./calendar-available.page.scss'],
})
export class CalendarAvailablePage implements OnInit, OnDestroy {
  monitorData: any;
  private subscription: Subscription;
  
  showMonthAvailable:boolean = true;
  showDayAvailable:boolean = false;
  today = new Date();
  currentMonth: number;
  currentYear: number;
  currentDay: number;
  selectedDate: Date;
  monthNames: string[] = [];
  weekdays: string[] = [];
  weekdaysShort: string[] = [];
  weekdayNames: string[] = [];
  days: any[] = [];
  hourStartDay: string = '08:00';
  hourEndDay: string = '18:00';
  hoursRange: string[] = [];
  
  firstDateSelected: any = null;
  secondDateSelected: any = null;
  firstDateSelectedFormat: any = null;
  secondDateSelectedFormat: any = null;
  
  showDayCalendar:boolean=false;

  allHoursMonth:boolean=false;
  startTimeMonth:string;
  endTimeMonth:string;
  nameBlockMonth:string;
  allHoursDay:boolean=false;
  startTimeDay:string;
  endTimeDay:string;
  nameBlockDay:string;
  divideDay:boolean=false;
  startTimeDivision:string;
  endTimeDivision:string;

  typeVisual:string;
  dateVisual:string;
  idEditBlock:any;
  editBlock:any;

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private monitorDataService: MonitorDataService, private teachService: TeachService, private toastr: ToastrService, private spinnerService: SpinnerService, private translate: TranslateService) {
    this.translate.onLangChange.subscribe(() => {
      this.loadWeekdays();
    });
  
    this.loadWeekdays();
  }

  async ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(async monitorData => {
      if (monitorData) {
        this.monitorData = monitorData;
  
        this.activatedRoute.params.subscribe( async params => {
          this.spinnerService.show();

          this.typeVisual = params['type'];
          this.dateVisual = params['date'];
          this.idEditBlock = +params['id_edit'];

          if(this.dateVisual) {
            this.selectedDate = new Date(this.dateVisual);
          }
          else {
            this.selectedDate = new Date();
          }

          if(this.typeVisual){
            if(this.typeVisual == 'day') {
              this.showMonthAvailable=false;
              this.showDayAvailable=true;
            }
            else {
              this.showMonthAvailable=true;
              this.showDayAvailable=false;
            }
          }

          if(this.idEditBlock){
            this.getEditBlock();
          }

            await this.generateHoursRange();
            this.initializeMonthNames();
            this.currentMonth = this.selectedDate.getMonth();
            this.currentYear = this.selectedDate.getFullYear();
            this.currentDay = this.selectedDate.getDate();
            this.renderCalendar();
          
        });
      }
    });
  }

  loadWeekdays() {
    this.weekdays = [
      this.translate.instant('days_abbrev.sunday'),
      this.translate.instant('days_abbrev.monday'),
      this.translate.instant('days_abbrev.tuesday'),
      this.translate.instant('days_abbrev.wednesday'),
      this.translate.instant('days_abbrev.thursday'),
      this.translate.instant('days_abbrev.friday'),
      this.translate.instant('days_abbrev.saturday'),
    ];
    this.weekdaysShort = [
      this.translate.instant('days_abbrev_short.sunday'),
      this.translate.instant('days_abbrev_short.monday'),
      this.translate.instant('days_abbrev_short.tuesday'),
      this.translate.instant('days_abbrev_short.wednesday'),
      this.translate.instant('days_abbrev_short.thursday'),
      this.translate.instant('days_abbrev_short.friday'),
      this.translate.instant('days_abbrev_short.saturday'),
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

  getEditBlock() {
    this.teachService.getData('monitor-nwds', this.idEditBlock).subscribe(
      (data:any) => {
        //console.log(data);
        this.editBlock = data.data;
        this.allHoursDay = this.editBlock.full_day;
        if(this.editBlock.start_time){
          this.startTimeDay = this.editBlock.start_time.substring(0, 5);
        }
        if(this.editBlock.end_time){
          this.endTimeDay = this.editBlock.end_time.substring(0, 5);
        }
        this.nameBlockDay = this.editBlock.description;
        this.allHoursDay = this.editBlock.full_day;
      },
      error => {
        console.error('There was an error!', error);
        this.idEditBlock = null;
      }
    );
  }

  async generateHoursRange() {
    const startTime = this.parseTime(this.hourStartDay);
    const endTime = this.parseTime(this.hourEndDay);
    let currentTime = new Date(startTime);

    while (currentTime <= endTime) {
      this.hoursRange.push(this.formatTime(currentTime));
      currentTime = new Date(currentTime.getTime() + 15 * 60000);
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

  onStartTimeMonthChange() {
    const filteredEndHours = this.filteredEndHoursMonth;
  
    if (!filteredEndHours.includes(this.endTimeMonth)) {
      this.endTimeMonth = filteredEndHours[0] || '';
    }
  }

  get filteredEndHoursMonth() {
    const startIndex = this.hoursRange.indexOf(this.startTimeMonth);
    return this.hoursRange.slice(startIndex + 1);
  }

  onStartTimeDayChange() {
    const filteredEndHours = this.filteredEndHoursDay;
  
    if (!filteredEndHours.includes(this.endTimeDay)) {
      this.endTimeDay = filteredEndHours[0] || '';
    }
  }

  get filteredEndHoursDay() {
    const startIndex = this.hoursRange.indexOf(this.startTimeDay);
    return this.hoursRange.slice(startIndex + 1);
  }

  onStartTimeDivisionChange() {
    const filteredEndHours = this.filteredEndHoursDivision;
    if (!filteredEndHours.includes(this.endTimeDivision)) {
      this.endTimeDivision = filteredEndHours[0] || '';
    }
  }  

  get filteredStartHoursDivision() {
    const startIndex = this.allHoursDay ? this.hoursRange.indexOf(this.hourStartDay) : this.hoursRange.indexOf(this.startTimeDay);
    const endIndex = this.allHoursDay ? this.hoursRange.indexOf(this.hourEndDay) : this.hoursRange.indexOf(this.endTimeDay);
    return this.hoursRange.slice(startIndex + 1, endIndex - 1);
  }
  
  get filteredEndHoursDivision() {
    const defaultStartIndex = this.calculateDefaultStartTimeDivisionIndex();
    const startIndex = this.startTimeDivision ? this.hoursRange.indexOf(this.startTimeDivision) : defaultStartIndex;
    const endIndex = this.allHoursDay ? this.hoursRange.indexOf(this.hourEndDay) : this.hoursRange.indexOf(this.endTimeDay);
    return this.hoursRange.slice(startIndex + 1, endIndex);
  }
  
  calculateDefaultStartTimeDivisionIndex() {
    const blockStartTimeIndex = this.allHoursDay ? this.hoursRange.indexOf(this.hourStartDay) : this.hoursRange.indexOf(this.startTimeDay);
    return blockStartTimeIndex + 1;
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
    this.spinnerService.show();
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

    this.spinnerService.hide();
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
      //console.log(date);
      this.firstDateSelectedFormat = this.formatDate(date);
      day.activeSelected = true;
    } else {
      if (date < this.firstDateSelected) {
        this.resetSelection();
        this.firstDateSelected = date;
        this.firstDateSelectedFormat = this.formatDate(date);
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
  
  isButtonMonthEnabled() {
    return this.nameBlockMonth && this.firstDateSelected && this.secondDateSelected && (this.allHoursMonth || (this.startTimeMonth && this.endTimeMonth));
  }  

  isButtonDayEnabled() {
    if (this.divideDay) {
      return this.nameBlockDay && this.selectedDate && this.startTimeDivision && this.endTimeDivision && (this.allHoursDay || (this.startTimeDay && this.endTimeDay));
    } else {
      return this.nameBlockDay && this.selectedDate && (this.allHoursDay || (this.startTimeDay && this.endTimeDay));
    }
  }

  saveBlockDay() {
    const formattedDayDate = moment(this.selectedDate).format('YYYY-MM-DD');
    this.spinnerService.show();

    if(this.idEditBlock) {
      const commonData = {
        monitor_id: this.monitorData.id,
        school_id: this.monitorData.active_school,
        station_id: this.monitorData.active_station,
        description: this.nameBlockDay,
        color: '#89add1',
        user_nwd_subtype_id: 1,
      };
      let firstBlockData:any = { ...commonData, start_date: formattedDayDate, end_date: formattedDayDate };
      let secondBlockData:any;

      // Calculate time moments
      firstBlockData.start_time = this.allHoursDay ? `${this.hourStartDay}:00` : `${this.startTimeDay}:00`;
      firstBlockData.end_time = this.divideDay ? `${this.startTimeDivision}:00` : (this.allHoursDay ? `${this.hourEndDay}:00` : `${this.endTimeDay}:00`);
      firstBlockData.full_day = this.allHoursDay && !this.divideDay;
  
      // Function update first block -> CALL LATER
      const updateFirstBlock = () => {
        this.teachService.updateData('monitor-nwds', this.idEditBlock, firstBlockData).subscribe(
            response => {
                if (this.divideDay) {
                    createSecondBlock();
                } else {
                    finalizeUpdate();
                }
            },
            error => {
                handleErrorUpdatingBlock(error);
            }
        );
      };

      const createSecondBlock = () => {
          secondBlockData = { ...commonData, start_date: formattedDayDate, end_date: formattedDayDate, start_time: `${this.endTimeDivision}:00`, end_time: `${this.endTimeDay}:00`, full_day: false };
          this.teachService.postData('monitor-nwds', secondBlockData).subscribe(
              secondResponse => {
                  finalizeUpdate();
              },
              error => {
                  handleErrorCreatingBlock(error);
              }
          );
      };

      const finalizeUpdate = () => {
          this.spinnerService.hide();
          this.toastr.success(this.translate.instant('toast.registered_correctly'));
          this.goTo('calendar');
      };

      const handleErrorUpdatingBlock = (error:any) => {
          this.spinnerService.hide();
          showErrorToast(error);
      };

      const handleErrorCreatingBlock = (error:any) => {
          this.spinnerService.hide();
          showErrorToast(error);
      };

      const showErrorToast = (error:any) => {
          if(error.error.message == "El monitor está ocupado durante ese tiempo y no se puede crear el MonitorNwd"){
              this.toastr.error(this.translate.instant('toast.overlap_detected'));
          } else {
              this.toastr.error(this.translate.instant('toast.error')); 
          }
      };

      // Start Update Process
      updateFirstBlock();

    }
    else{
      const dataDay = {
        monitor_id: this.monitorData.id,
        school_id: this.monitorData.active_school,
        station_id: this.monitorData.active_station,
        start_date: formattedDayDate,
        end_date: formattedDayDate,
        start_time: this.allHoursDay ? `${this.hourStartDay}:00` : `${this.startTimeDay}:00`,
        end_time: this.allHoursDay ? `${this.hourEndDay}:00` : `${this.endTimeDay}:00`,
        full_day: this.allHoursDay,
        description: this.nameBlockDay,
        color: '#89add1',
        user_nwd_subtype_id: 1,
      };
      
          this.teachService.postData('monitor-nwds', dataDay).subscribe(
            response => {
                //console.log('Response:', response);
                this.spinnerService.hide();
                this.toastr.success(this.translate.instant('toast.registered_correctly'));
                this.goTo('calendar');
            },
            error => {
                console.error('Error:', error.error);
                this.spinnerService.hide();
                if(error.error.message == "El monitor está ocupado durante ese tiempo y no se puede crear el MonitorNwd"){
                  this.toastr.error(this.translate.instant('toast.overlap_detected'));
                }
                else{
                  this.toastr.error(this.translate.instant('toast.error')); 
                }
            }
          );

    }
  }

  saveBlockMonth() {
    const startDate = moment(this.firstDateSelected);
    const endDate = moment(this.secondDateSelected);
    const datesToCheck:any[] = [];
    const overlapDates:any[] = [];
    const createRequests:any[] = [];

    this.spinnerService.show();

    // Prepare dates to check
    for (let date = moment(startDate); date.diff(endDate, 'days') <= 0; date.add(1, 'days')) {
        datesToCheck.push(moment(date));
    }

    // Check for overlaps and create blocks
    Promise.all(datesToCheck.map(async date => {
        const formattedDate = date.format('YYYY-MM-DD');

                const dataDay = {
                    monitor_id: this.monitorData.id,
                    school_id: this.monitorData.active_school,
                    station_id: this.monitorData.active_station,
                    start_date: formattedDate,
                    end_date: formattedDate,
                    start_time: this.allHoursMonth ? `${this.hourStartDay}:00` : `${this.startTimeMonth}:00`,
                    end_time: this.allHoursMonth ? `${this.hourEndDay}:00` : `${this.endTimeMonth}:00`,
                    full_day: this.allHoursMonth,
                    description: this.nameBlockMonth,
                    color: '#89add1',
                    user_nwd_subtype_id: 1,
                };
                return new Promise(resolve => {
                  this.teachService.postData('monitor-nwds', dataDay).subscribe(
                      response => {
                          //console.log('Data posted successfully:', response);
                          resolve({ success: true, data: response });
                      },
                      error => {
                          console.error('Error posting data:', error);
                          const formattedDateNice = moment(formattedDate).format('DD-MM-YYYY');
                          overlapDates.push(formattedDateNice);
                          resolve({ success: false, error: error });
                      }
                  );
                });

    })).then(responses => {
        this.spinnerService.hide();

        const successfulResponses = responses.filter((response:any) => response.success);
        if (successfulResponses.length > 0) {
          if (overlapDates.length > 0) {
            this.toastr.success(this.translate.instant('toast.some_registered_correctly'));
            this.toastr.error(`${this.translate.instant('toast.overlap_dates')} : ${overlapDates.join(', ')}`);
          }
          else{
            this.toastr.success(this.translate.instant('toast.registered_correctly'));
          }
        }
        else{
          this.toastr.error(this.translate.instant('toast.overlap_detected'));
        }

        this.goTo('calendar');
    }).catch(error => {
        console.error('An error occurred:', error);
        this.spinnerService.hide();
        this.toastr.error(this.translate.instant('toast.error'));
    });
  }

  deleteBlockDay() {
    if (this.idEditBlock) {
        const isConfirmed = confirm('Êtes-vous sûr de vouloir supprimer le blocage?');
        if (isConfirmed) {
          this.spinnerService.show();
            this.teachService.deleteData('monitor-nwds', this.idEditBlock).subscribe(
                response => {
                    //console.log('Response:', response);
                    this.spinnerService.hide();
                    this.toastr.success(this.translate.instant('toast.deleted_correctly'));
                    this.goTo('calendar');
                },
                error => {
                    console.error('Error:', error);
                    this.spinnerService.hide();
                    this.toastr.error(this.translate.instant('toast.error'));
                }
            );
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
