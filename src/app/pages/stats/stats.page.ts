import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { MonitorDataService } from '../../services/monitor-data.service';
import { SharedDataService } from '../../services/shared-data.service';
import { TeachService } from '../../services/teach.service';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../../services/spinner.service';
import * as moment from 'moment';
import 'moment/locale/fr';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
})
export class StatsPage implements OnInit, OnDestroy {

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [80,72,39,37,35,31,36,46,39,37,35,31],
        label: 'Heures',
        yAxisID: 'y',
        backgroundColor: 'rgba(51,153,255,0.4)',
        borderColor: 'rgba(51,153,255,1)',
        pointBackgroundColor: 'rgba(51,153,255,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(51,153,255,0.8)',
        fill: 'origin',
      },
    ],
    labels: ['JAN', 'FEB', 'MAR', 'AVR', 'MAI', 'JUI', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  };

  lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.3,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        position: 'left',
        min: 0,
        grid: {
          color: 'rgba(255,255,255,0.3)',
        },
        ticks: {
          color: '#c8c8c8',
        },
      },
      x: {
        ticks: {
          color: '#c8c8c8',
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
      },
    },

  };

  lineChartType: ChartType = 'line';
  selectedYear = 'year';

  monthsData:any[];
  reversedMonthsData:any[];
  totalCollectiveDurationFormatted:any;
  totalPrivateDurationFormatted:any;
  totalNwdDurationFormatted:any;
  totalPayedDurationFormatted:any;
  totalNotPayedDurationFormatted:any;

  currentStartIndex: number = 3;
  currentEndIndex: number = 0;

  hourStartDay: string = '08:00';
  hourEndDay: string = '18:00';

  constructor(private router: Router, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private teachService: TeachService, private toastr: ToastrService, private spinnerService: SpinnerService) {}
  monitorData: any;
  private subscription: Subscription;

  async ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(async data => {
      if (data) {
        this.spinnerService.show();
        this.monitorData = data;
        this.loadBookings();
        this.spinnerService.hide();
      }
    });
  }

  loadBookings() {
    // Initialize the months data
    const monthsDataB:any = this.initializeMonthsData();
    const oldestMonth = monthsDataB[0];
    
    // Format the start and end dates
    const date_start = moment(`${oldestMonth.year}-${oldestMonth.name}-01`, 'YYYY-MMM-DD').startOf('month').format('YYYY-MM-DD');
    const date_end = moment().format('YYYY-MM-DD');

    console.log(date_start);console.log(date_end);
    this.teachService.getData('teach/getAgenda', null, { date_start: date_start, date_end: date_end, school_id: this.monitorData.active_school }).subscribe(
      (data: any) => {
        console.log(data.data);
        const bookingsByDate:any = {};
        this.monthsData = this.initializeMonthsData();
        let collectiveCourses:any = { totalDuration: 0 };
        let privateCourses:any = { totalDuration: 0 };
        let blockPayed:any = { totalDuration: 0 };
        let blockNwd:any = { totalDuration: 0 };
        let blockNotPayed:any = { totalDuration: 0 };
    
        // Group bookings by date
        data.data.bookings.forEach((booking: any) => {
          const bookingMonthYear = moment(booking.date).format('MMM YYYY').toUpperCase();
          const monthData = this.monthsData.find((m:any) => `${m.name} ${m.year}` === bookingMonthYear);
  
          if (monthData) {
            const duration = this.calculateDuration(booking.hour_start, booking.hour_end);
            if (booking.course.course_type === 1) {
              monthData.collectiveCourses += duration;
            } else if (booking.course.course_type === 2) {
              monthData.privateCourses += duration;
            }
          }
        });
    
        // Group nwds by date
        data.data.nwd.forEach((nwd: any) => {
          const nwdMonthYear = moment(nwd.start_date).format('MMM YYYY').toUpperCase();
          const monthData = this.monthsData.find((m:any) => `${m.name} ${m.year}` === nwdMonthYear);
  
          if (monthData) {
            let duration;
            if(nwd.full_day){
              duration = this.calculateDuration(this.hourStartDay, this.hourEndDay);
            }
            else{
              duration = this.calculateDuration(nwd.start_time, nwd.end_time);
            } 
            if (nwd.user_nwd_subtype_id === 1) {
              monthData.blockNwd += duration;
            } else if (nwd.user_nwd_subtype_id === 2) {
              monthData.blockPayed += duration;
            } else if (nwd.user_nwd_subtype_id === 3) {
              monthData.blockNotPayed += duration;
            }
          }
        });
  
        // Convert total duration to hours and minutes
        collectiveCourses.totalDuration = this.formatDuration(collectiveCourses.totalDuration);
        privateCourses.totalDuration = this.formatDuration(privateCourses.totalDuration);
        blockNwd.totalDuration = this.formatDuration(blockNwd.totalDuration);
        blockPayed.totalDuration = this.formatDuration(blockPayed.totalDuration);
        blockNotPayed.totalDuration = this.formatDuration(blockNotPayed.totalDuration);
  
        // Convert monthly durations to hours and minutes
        Object.keys(this.monthsData).forEach((month:any) => {
          this.monthsData[month].collectiveCourses = this.formatDuration(this.monthsData[month].collectiveCourses);
          this.monthsData[month].privateCourses = this.formatDuration(this.monthsData[month].privateCourses);
          this.monthsData[month].blockNwd = this.formatDuration(this.monthsData[month].blockNwd);
          this.monthsData[month].blockPayed = this.formatDuration(this.monthsData[month].blockPayed);
          this.monthsData[month].blockNotPayed = this.formatDuration(this.monthsData[month].blockNotPayed);
        });
  
        console.log('Collective Courses:', collectiveCourses);
        console.log('Private Courses:', privateCourses);
        console.log('Nwd blocks:', blockNwd);
        console.log('Payed blocks:', blockPayed);
        console.log('Not Payed blocks:', blockNotPayed);
        console.log('Monthly Data:', this.monthsData);

        // Prepare chart data
        const collectiveCourseData = this.monthsData.map((m:any) => this.durationInHours(m.collectiveCourses));
        const privateCourseData = this.monthsData.map((m:any) => this.durationInHours(m.privateCourses));
        const blockNwdData = this.monthsData.map((m:any) => this.durationInHours(m.blockNwd));
        const blockPayedData = this.monthsData.map((m:any) => this.durationInHours(m.blockPayed));
        const blockNotPayedData = this.monthsData.map((m:any) => this.durationInHours(m.blockNotPayed));

        //TABLE
        let totalCollectiveDuration = 0;
        let totalPrivateDuration = 0;
        let totalNwdDuration = 0;
        let totalPayedDuration = 0;
        let totalNotPayedDuration = 0;

        this.monthsData.forEach(month => {
          totalCollectiveDuration += this.hoursToMinutes(this.durationInHours(month.collectiveCourses));
          totalPrivateDuration += this.hoursToMinutes(this.durationInHours(month.privateCourses));
          totalNwdDuration += this.hoursToMinutes(this.durationInHours(month.blockNwd));
          totalPayedDuration += this.hoursToMinutes(this.durationInHours(month.blockPayed));
          totalNotPayedDuration += this.hoursToMinutes(this.durationInHours(month.blockNotPayed));
        });

        // Convert the total durations from minutes to hours and minutes format
        this.totalCollectiveDurationFormatted = this.formatDuration(totalCollectiveDuration);
        this.totalPrivateDurationFormatted = this.formatDuration(totalPrivateDuration);
        this.totalNwdDurationFormatted = this.formatDuration(totalNwdDuration);
        this.totalPayedDurationFormatted = this.formatDuration(totalPayedDuration);
        this.totalNotPayedDurationFormatted = this.formatDuration(totalNotPayedDuration);
        console.log(this.totalCollectiveDurationFormatted);console.log(this.totalPrivateDurationFormatted);
        console.log(this.totalNwdDurationFormatted);console.log(this.totalPayedDurationFormatted);
        console.log(this.totalNotPayedDurationFormatted);

        this.reversedMonthsData = this.monthsData.slice().reverse();

        // Update chart
        this.updateChartData();
      },
      error => {
        this.spinnerService.hide();
        console.error('There was an error!', error);
      }
    );
  }

  hoursToMinutes(hoursDecimal: number) {
    return hoursDecimal * 60;
  }

  durationInHours(durationString: string) {
    const [hours, minutes] = durationString.split('h').map(part => parseInt(part, 10));
    return hours + minutes / 60; // Convert to decimal hours
  }

  changeMonths(count:number) {
    if(this.currentEndIndex + count >= 0 && this.currentStartIndex + count <= 24){
      this.currentStartIndex += count;
      this.currentEndIndex += count;

      this.updateChartData();
    }
  }

  updateChartData() {
    const startIndex = this.monthsData.length - this.currentStartIndex;
    const lastIndex = this.monthsData.length - this.currentEndIndex;
  
    // Data for collective courses
    const collectiveCourseData = this.monthsData.slice(startIndex, lastIndex).map(m => this.durationInHours(m.collectiveCourses));
  
    // Data for private courses
    const privateCourseData = this.monthsData.slice(startIndex, lastIndex).map(m => this.durationInHours(m.privateCourses));
  
    // Data for block payed
    const blockPayedData = this.monthsData.slice(startIndex, lastIndex).map(m => this.durationInHours(m.blockPayed));
    
    // Data for combined courses
    const combinedCourseData = this.monthsData.slice(startIndex, lastIndex).map(m => 
      this.durationInHours(m.collectiveCourses) + this.durationInHours(m.privateCourses) + this.durationInHours(m.blockPayed));

  
    // Update datasets in lineChartData
    this.lineChartData.datasets = [
      {
        data: collectiveCourseData,
        label: 'Cours collectifs',
        yAxisID: 'y',
        borderColor: 'rgba(252,196,47,1)'
      },
      {
        data: privateCourseData,
        label: 'Cours privés',
        yAxisID: 'y',
        borderColor: 'rgba(56,199,77,1)'
      },
      {
        data: blockPayedData,
        label: 'Blocs payé',
        yAxisID: 'y',
        borderColor: 'rgba(100,100,100,1)'
      },
      {
        data: combinedCourseData,
        label: 'Toute',
        yAxisID: 'y',
        borderColor: 'rgba(51,153,255,1)'
      }
    ];
    
    // Update labels with the months from monthsData
    this.lineChartData.labels = this.monthsData.slice(startIndex, lastIndex).map(m => m.name);
    
    // Update the chart
    if (this.chart) {
      this.chart.update();
    }
  }

  navigateToPreviousMonths() {
    if (this.currentStartIndex > 0) {
      this.currentStartIndex -= 3;
      this.currentEndIndex -= 3;
      this.updateChartData();
    }
  }
  
  navigateToNextMonths() {
    if (this.currentEndIndex < this.monthsData.length) {
      this.currentStartIndex += 3;
      this.currentEndIndex += 3;
      this.updateChartData();
    }
  }
  
  initializeMonthsData() {
    const monthsData = [];
    let currentMonth = moment();
    for (let i = 0; i < 24; i++) {
      const monthYear = currentMonth.format('MMM YYYY').toUpperCase();
      monthsData.unshift({ 
        name: monthYear.split(' ')[0], 
        year: monthYear.split(' ')[1],
        collectiveCourses: 0, 
        privateCourses: 0,
        blockNwd: 0,
        blockPayed: 0,
        blockNotPayed: 0
      });
      currentMonth.subtract(1, 'months');
    }
    return monthsData;
  }
  
  calculateDuration(start:any, end:any) {
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    return (endHours - startHours) * 60 + (endMinutes - startMinutes); // duration in minutes
  }
  
  formatDuration(duration:any) {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h${minutes}m`;
  }
  

  updateChartDataB(): void {
    if (this.selectedYear === 'all') {
      this.lineChartData = {
        ...this.lineChartData,
        datasets: [{
          ...this.lineChartData.datasets[0],
          data: [80,72,39,37,35,31,36,46,39,37,35,31,80,72,39,37,35,31,36,46,39,37,35,31],
        }],
        labels: ['JAN', 'FEB', 'MAR', 'AVR', 'MAI', 'JUI', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC','JAN', 'FEB', 'MAR', 'AVR', 'MAI', 'JUI', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
      };
    } else {
      this.lineChartData = {
        ...this.lineChartData,
        datasets: [{
          ...this.lineChartData.datasets[0],
          data: [80,72,39,37,35,31,36,46,39,37,35,31],
        }],
        labels: ['JAN', 'FEB', 'MAR', 'AVR', 'MAI', 'JUI', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
      };
    }

    if (this.chart) {
      this.chart.update();
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
