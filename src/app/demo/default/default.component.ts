// Angular Import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { BajajChartComponent } from './bajaj-chart/bajaj-chart.component';
import { ChartDataMonthComponent } from './chart-data-month/chart-data-month.component';
import { SearchFieldComponent } from 'src/app/shared/components/search-field/search-field.component';
import { TranslateModule } from '@ngx-translate/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { VendorDetailComponent } from './../pages/settings/vendors/vendor-detail/vendor-detail.component';

import { Router } from '@angular/router';

@Component({
  selector: 'app-default',
  standalone: true,
  imports: [CommonModule, SharedModule, SubHeaderComponent, SearchFieldComponent, TranslateModule, VendorDetailComponent],
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {
  username = '';
  companyId: any;

  profileCard = [
    {
      style: 'bg-primary-dark text-white',
      background: 'bg-primary',
      value: '$203k',
      text: 'Net Profit',
      color: 'text-white',
      value_color: 'text-white'
    },
    {
      background: 'bg-warning',
      avatar_background: 'bg-light-warning',
      value: '$550K',
      text: 'Total Revenue',
      color: 'text-warning'
    }
  ];

  news: any;

  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

  topics = [
    { icon: 'pi pi-address-book ', name: 'Total Customers' },
    { icon: 'pi pi-minus-circle', name: 'Total Reservations' },
    { icon: 'pi pi-wave-pulse', name: 'Total Sales' },
    { icon: 'pi pi-warehouse', name: 'Total Income' }
  ];

  recommendedItems = [{ title: 'Medical Insurance', description: 'Details about insurance' }];

  leaveRequests = [
    { name: 'User 1', date: '14 Dec 2024', balance: '4 days' }
    // ...
  ];

  events = [
    { date: '22 Dec', title: 'Tech Event', description: 'Tech talk and recruiting.' }
    // ...
  ];

  benefits = [
    { name: 'Costa', image: 'assets/costa.png' }
    // ...
  ];

  newsItems = [
    {
      title: 'Trips News',
      description: ' trips descriptions and instrauctions ...............................................................................',
      image: 'assets/news1.png'
    }
    // ...
  ];

  filter: any;
  ListGroup: any;
  constructor(
    private _configSer: ConfigureService,

    private router: Router
  ) {
    debugger;
    this.companyId = this._configSer.vendorId();
  }
  ngOnInit(): void {}

  navigateToTasks(): void {
    this.router.navigate(['/tasks']);
  }
}
