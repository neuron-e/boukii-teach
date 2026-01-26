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
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

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

  constructor(private router: Router, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private teachService: TeachService, private toastr: ToastrService, private spinnerService: SpinnerService, private translate: TranslateService) {}
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
    const date_start = moment(`${oldestMonth.year}-${oldestMonth.name}-01`, 'YYYY-MMM-DD').startOf('month').format('YYYY-MM-DD');
    const date_end = moment().format('YYYY-MM-DD');

    const searchData:any = {
      start_date: date_start,
      end_date: date_end
    };
    if(this.monitorData.active_school){
      searchData.school_id = this.monitorData.active_school;
    }

    this.teachService.getData('teach/statistics/monitors/daily', null, searchData).subscribe(
      (data: any) => {
        this.monthsData = this.initializeMonthsData();
        let totalCollectiveDuration = 0;
        let totalPrivateDuration = 0;
        let totalPayedDuration = 0;

        data.data.forEach((daily: any) => {
          const monthKey = moment(daily.date).format('MMM YYYY').toUpperCase();
          const monthData = this.monthsData.find((m:any) => `${m.name} ${m.year}` === monthKey);
          if (!monthData) {
            return;
          }

          const collectiveMinutes = this.parseDurationToMinutes(daily.hours_collective);
          const privateMinutes = this.parseDurationToMinutes(daily.hours_private);
          const paidMinutes = this.parseDurationToMinutes(daily.hours_nwd_payed);

          monthData.collectiveCourses += collectiveMinutes;
          monthData.privateCourses += privateMinutes;
          monthData.blockPayed += paidMinutes;

          totalCollectiveDuration += collectiveMinutes;
          totalPrivateDuration += privateMinutes;
          totalPayedDuration += paidMinutes;
        });

        Object.keys(this.monthsData).forEach((month:any) => {
          this.monthsData[month].collectiveCourses = this.formatDuration(this.monthsData[month].collectiveCourses);
          this.monthsData[month].privateCourses = this.formatDuration(this.monthsData[month].privateCourses);
          this.monthsData[month].blockPayed = this.formatDuration(this.monthsData[month].blockPayed);
        });

        this.totalCollectiveDurationFormatted = this.formatDuration(totalCollectiveDuration);
        this.totalPrivateDurationFormatted = this.formatDuration(totalPrivateDuration);
        this.totalPayedDurationFormatted = this.formatDuration(totalPayedDuration);
        this.totalNwdDurationFormatted = this.formatDuration(0);
        this.totalNotPayedDurationFormatted = this.formatDuration(0);

        this.reversedMonthsData = this.monthsData.slice().reverse();
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
        label: this.translate.instant('collective_courses'),
        yAxisID: 'y',
        borderColor: 'rgba(252,196,47,1)'
      },
      {
        data: privateCourseData,
        label: this.translate.instant('private_courses'),
        yAxisID: 'y',
        borderColor: 'rgba(56,199,77,1)'
      },
      {
        data: blockPayedData,
        label: this.translate.instant('paid_blocks'),
        yAxisID: 'y',
        borderColor: 'rgba(100,100,100,1)'
      },
      {
        data: combinedCourseData,
        label: this.translate.instant('total'),
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

  parseDurationToMinutes(duration: string): number {
    if (!duration) {
      return 0;
    }
    const match = duration.match(/(\d+)\s*h\s*(\d+)\s*m/i);
    if (!match) {
      return 0;
    }
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return 0;
    }
    return (hours * 60) + minutes;
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
