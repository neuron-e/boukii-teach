import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
})
export class StatsPage implements OnInit {
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [80,72,39,37,35,31],
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
    labels: ['JAN', 'FEB', 'MAR', 'AVR', 'MAI', 'JUI'],
  };

  public lineChartOptions: ChartConfiguration['options'] = {
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

  public lineChartType: ChartType = 'line';


  constructor(private router: Router) {}

  ngOnInit() {
  }

  goTo(...urls: string[]) {
    this.router.navigate(urls);
  }

}
