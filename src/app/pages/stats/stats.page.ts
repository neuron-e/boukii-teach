import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
})
export class StatsPage implements OnInit {

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
        display: false,
      },
    },

  };

  lineChartType: ChartType = 'line';
  selectedYear = 'year';


  constructor(private router: Router) {}

  ngOnInit() {
  }

  updateChartData(): void {
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

}
