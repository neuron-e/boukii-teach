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
import { NotificationService } from '../../services/notification.service';
import * as moment from 'moment';
import { MOCK_COUNTRIES } from '../../mocks/countries-data';
import { MOCK_PROVINCES } from '../../mocks/province-data';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss'],
})
export class ClientsPage implements OnInit, OnDestroy {
  monitorData: any;
  private subscription: Subscription;

  searchTerm: string = '';
  filteredClients: any[];

  showClients:boolean=true;
  showSchools:boolean=false;
  clientsMonitor:any[];
  languages: any[] = [];
  unreadCount$ = this.notificationService.unreadCount$;

  constructor(private router: Router, private menuService: MenuService, private monitorDataService: MonitorDataService, private sharedDataService: SharedDataService, private teachService: TeachService, private toastr: ToastrService, private spinnerService: SpinnerService, private translate: TranslateService, private notificationService: NotificationService) {}

  async ngOnInit() {
    this.subscription = this.monitorDataService.getMonitorData().subscribe(async data => {
      if (data) {
        this.spinnerService.show();
        this.monitorData = data;
        try {
          this.languages = await firstValueFrom(this.sharedDataService.fetchLanguages());
        } catch (error) {
          console.error('Error fetching data:', error);
          this.toastr.error(this.translate.instant('toast.error_loading_data'));
        }

        this.teachService.getData('teach/clients').subscribe(
          (data:any) => {
            data.forEach((client:any) => {
              const birthDate = moment(client.birth_date);
              const age = moment().diff(birthDate, 'years');
              client.birth_years = age;
            });
            this.clientsMonitor = data;
            this.filteredClients = data;
            //console.log(this.clientsMonitor);
            this.spinnerService.hide();
          },
          error => {
            this.spinnerService.hide();
            console.error('There was an error!', error);
          }
        );

      }
    });
  }

  getLanguageById(languageId: number): string {
    const language = this.languages.find(c => c.id === languageId);
    return language ? language.code.toUpperCase() : '';
  }

  getCountryById(countryId: number): string {
    const country = MOCK_COUNTRIES.find(c => c.id === countryId);
    return country ? country.iso : 'Aucun';
  }

  getProvinceById(provinceId: number): string {
    const province = MOCK_PROVINCES.find(c => c.id === provinceId);
    return province ? province.name : 'Aucune';
  }

  searchClients() {
    if (!this.searchTerm) {
      this.filteredClients = this.clientsMonitor;
    } else {
      const normalizedSearchTerm = this.normalizeString(this.searchTerm);
      this.filteredClients = this.clientsMonitor.filter(client => 
        this.normalizeString(client.first_name).includes(normalizedSearchTerm) ||
        this.normalizeString(client.last_name).includes(normalizedSearchTerm)
      );
    }
  }

  normalizeString(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  toggleMenu() {
    this.menuService.toggleMenu();
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
