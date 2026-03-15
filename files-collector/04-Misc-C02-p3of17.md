# 04 – Misc (Part 3/17 of Misc)

> **Description:** Everything else that didn't fit the categories above. [Category: C02]
> **Generated:** 2026-03-02 20:16:48

---

## `src/app/app-config.ts`

```ts
export class BerryConfig {
  static isCollapse_menu: boolean = false;
  static font_family: string = 'Roboto'; // Roboto, poppins, inter
}

```

---

## `src/app/app-routing.module.ts`

```ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { DeletionComponent } from './shared/components/New folder/delation.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login', // Redirect to guest/signin by default
    pathMatch: 'full' // Ensure exact match for the empty path
  },
  {
    path: 'login',
    loadComponent: () => import('./demo/pages/authentication/login/login.component')
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./demo/pages/authentication/forgot-password/forgot-password.component').then((c) => c.ForgotPasswordComponent)
  },
  { path: 'data-deletion', component: DeletionComponent },

  {
    path: '',
    component: AdminComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/default',
        pathMatch: 'full'
      },
      {
        path: 'default',
        loadComponent: () => import('./demo/default/default.component').then((c) => c.DefaultComponent)
      },
      {
        path: 'scanner',
        loadComponent: () => import('./demo/pages/scanner-page/scanner-page.component').then((c) => c.ScannerPageComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./demo/pages/customers/customers.component').then((c) => c.CustomersComponent)
      },

      {
        path: 'vendors',
        loadComponent: () => import('./demo/pages/settings/vendors/vendors.component').then((m) => m.VendorsComponent)
      },
      {
        path: 'vendors-add-edit',
        loadComponent: () =>
          import('./demo/pages/settings/vendors/vendor-add-edit/vendor-add-edit.component').then((m) => m.VendorAddEditComponent)
      },
      {
        path: 'vendor-details/:id',
        loadComponent: () =>
          import('./demo/pages/settings/vendors/vendor-detail/vendor-detail.component').then((m) => m.VendorDetailComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./demo/pages/settings/users/users.component').then((m) => m.UsersComponent)
      },
      {
        path: 'customer-list',
        loadComponent: () => import('./demo/pages/customers/customers-list/customers-list.component').then((m) => m.CustomersListComponent)
      },
      {
        path: 'customer-details/:id',
        loadComponent: () =>
          import('./demo/pages/customers/customer-detail/customer-detail.component').then((m) => m.CustomerDetailComponent)
      },
      {
        path: 'customer-form',
        loadComponent: () => import('./demo/pages/customers/customers-form/customers-form.component').then((m) => m.CustomersFormComponent)
      },
      {
        path: 'hotels',
        loadComponent: () => import('./demo/pages/hotels/hotels.component').then((m) => m.HotelsComponent)
      },
      {
        path: 'hotel-details/:id',
        loadComponent: () => import('./demo/pages/hotels/hotel-details/hotel-details.component').then((m) => m.HotelDetailsComponent)
      },
      {
        path: 'hotels-form/:id',
        loadComponent: () => import('./demo/pages/hotels/hotels-form/hotels-form.component').then((m) => m.HotelsFormComponent)
      },
      {
        path: 'hotel-rooms',
        loadComponent: () => import('./demo/pages/hotels/rooms/rooms.component').then((m) => m.RoomsComponent)
      },
      {
        path: 'room-details/:id',
        loadComponent: () => import('./demo/pages/hotels/rooms/room-details/room-details.component').then((m) => m.RoomDetailsComponent)
      },
      {
        path: 'room-form',
        loadComponent: () => import('./demo/pages/hotels/rooms/add-edit-room/add-edit-room.component').then((m) => m.AddEditRoomComponent)
      },
      {
        path: 'room-form-imgs/:id',
        loadComponent: () =>
          import('./demo/pages/hotels/rooms/imgs-room-form/imgs-room-form.component').then((m) => m.ImgsRoomFormComponent)
      },
      {
        path: 'room-form/:id',
        loadComponent: () => import('./demo/pages/hotels/rooms/add-edit-room/add-edit-room.component').then((m) => m.AddEditRoomComponent)
      },

      {
        path: 'hotels-form',
        loadComponent: () => import('./demo/pages/hotels/hotels-form/hotels-form.component').then((m) => m.HotelsFormComponent)
      },
      {
        path: 'outing-category',
        loadComponent: () => import('./demo/pages/outing/outing-category/outing-category.component').then((m) => m.OutingCategoryComponent)
      },
      {
        path: 'outing-category-list',
        loadComponent: () =>
          import('./demo/pages/outing/outing-category/outing-category-list/outing-category-list.component').then(
            (m) => m.OutingCategoryListComponent
          )
      },
      {
        path: 'outing-features',
        loadComponent: () => import('./demo/pages/outing/outing-features/outing-features.component').then((m) => m.OutingFeaturesComponent)
      },
      {
        path: 'outing-branches',
        loadComponent: () => import('./demo/pages/outing/outing-branches/outing-branches.component').then((m) => m.OutingBranchesComponent)
      },
      {
        path: 'outing',
        loadComponent: () => import('./demo/pages/outing/outing.component').then((m) => m.OutingComponent)
      },
      {
        path: 'outing-form',
        loadComponent: () => import('./demo/pages/outing/outing-form/outing-form.component').then((m) => m.OutingFormComponent)
      },
      {
        path: 'outing-list',
        loadComponent: () => import('./demo/pages/outing/outing-list/outing-list.component').then((m) => m.OutingListComponent)
      },
      {
        path: 'outing-features',
        loadComponent: () => import('./demo/pages/outing/outing-features/outing-features.component').then((m) => m.OutingFeaturesComponent)
      },
      {
        path: 'outing-details/:id',
        loadComponent: () => import('./demo/pages/outing/outing-details/outing-details.component').then((m) => m.OutingDetailsComponent)
      },
      {
        path: 'all-reservations',
        loadComponent: () =>
          import('./demo/pages/reservations/all-reservations/all-reservations.component').then((m) => m.AllReservationsComponent)
      },
      {
        path: 'payment-info/:id',
        loadComponent: () => import('./shared/payment-info/payment-info.component').then((m) => m.PaymentInfoComponent)
      },
      {
        path: 'payment-info-ref/:paymentRef',
        loadComponent: () => import('./shared/payment-info/payment-info.component').then((m) => m.PaymentInfoComponent)
      },
      {
        path: 'hotel-room-reservation',
        loadComponent: () => import('./demo/pages/reservations/hotel/hotel-reservation.component').then((m) => m.HotelReservationComponent)
      },
      {
        path: 'hotel-reservation-step',
        loadComponent: () =>
          import('./demo/pages/reservations/hotel/reservation-form/reservation-form.component').then((m) => m.ReservationFormComponent)
      },
      // {
      //   path: 'room-reservation-step/:id',
      //   loadComponent: () =>
      //     import('./demo/pages/reservations/hotel/reservation-form/reservation-room-form/reservation-room-form.component').then(
      //       (m) => m.ReservationRoomFormComponent
      //     )
      // },
      {
        path: 'room-details-last-step/:id',
        loadComponent: () =>
          import('./demo/pages/reservations/hotel/hotel-details/room-details.component').then((m) => m.RoomDetailsComponent)
      },

      {
        path: 'ummrah',
        loadComponent: () => import('./demo/pages/ummrah/ummrah.component').then((m) => m.UmmrahComponent)
      },
      {
        path: 'hajj',
        loadComponent: () => import('./demo/pages/hajj/hajj.component').then((m) => m.HajjComponent)
      },
      {
        path: 'details-manasik/:id',
        loadComponent: () =>
          import('../app/shared/manasik/manasik-details/manasik-details.component').then((m) => m.ManasikDetailsComponent)
      },
      {
        path: 'manasik-form',
        loadComponent: () => import('../app/shared/manasik/manasik-form/manasik-form.component').then((m) => m.ManasikFormComponent)
      },
      {
        path: 'travels',
        loadComponent: () => import('./demo/pages/travels/travels.component').then((m) => m.TravelsComponent)
      },
      {
        path: 'travel-details/:id',
        loadComponent: () => import('./demo/pages/travels/travel-details/travel-details.component').then((m) => m.TravelDetailsComponent)
      },
      {
        path: 'travel-form/:id?',
        loadComponent: () => import('./demo/pages/travels/travels-form/travels-form.component').then((m) => m.TravelsFormComponent)
      },
      {
        path: 'travel-form',
        loadComponent: () => import('./demo/pages/travels/travels-form/travels-form.component').then((m) => m.TravelsFormComponent)
      },
      {
        path: 'travel-trip-reservations',
        loadComponent: () =>
          import('./demo/pages/reservations/travels/travels-reservation-list/travels-reservation-list.component').then(
            (m) => m.TravelsReservationListComponent
          )
      },
      {
        path: 'travel-trip-reservation-form',
        loadComponent: () =>
          import('./demo/pages/reservations/travels/travel-reservation-form/travel-reservation-form.component').then(
            (m) => m.TravelReservationFormComponent
          )
      },
      {
        path: 'travel-trip-reservation-details',
        loadComponent: () =>
          import('./demo/pages/reservations/travels/travels-reservation-details/travels-reservation-details.component').then(
            (m) => m.TravelsReservationDetailsComponent
          )
      },

      {
        path: 'reservation-details',
        loadComponent: () =>
          import('./demo/pages/reservations/overallReservation/reservation-details/reservation-details.component').then(
            (m) => m.ReservationDetailsComponent
          )
      },
      {
        path: 'roles',
        loadComponent: () => import('./demo/pages/settings/roles/roles.component').then((m) => m.RolesComponent)
      },
      {
        path: 'edit-permissions/:roleId/:roleName',
        loadComponent: () =>
          import('./demo/pages/settings/roles/edti-permissions-for-role/edti-permissions-for-role.component').then(
            (m) => m.EdtiPermissionsForRoleComponent
          )
      },

      {
        path: 'user-details/:id',
        loadComponent: () => import('./demo/pages/settings/users/user-details/user-details.component').then((m) => m.UserDetailsComponent)
      },
      {
        path: 'user-form/:id',
        loadComponent: () => import('./demo/pages/settings/users/users-form/users-form.component').then((m) => m.UsersFormComponent)
      },
      {
        path: 'user-form',
        loadComponent: () => import('./demo/pages/settings/users/users-form/users-form.component').then((m) => m.UsersFormComponent)
      },
      {
        path: 'countries',
        loadComponent: () => import('./demo/pages/settings/countries/countries.component').then((m) => m.CountriesComponent)
      },
      {
        path: 'nationalities',
        loadComponent: () => import('./demo/pages/settings/nationalities/nationalities.component').then((m) => m.NationalitiesComponent)
      },
      {
        path: 'cities',
        loadComponent: () => import('./demo/pages/settings/cities/cities.component').then((m) => m.CitiesComponent)
      },
      {
        path: 'room-types',
        loadComponent: () => import('./demo/pages/settings/room-tybe/room-tybe.component').then((m) => m.RoomTybeComponent)
      },
      {
        path: 'bed-types',
        loadComponent: () => import('./demo/pages/settings/bed-tybe/bed-tybe.component').then((m) => m.BedTybeComponent)
      },
      {
        path: 'room-features',
        loadComponent: () => import('./demo/pages/settings/room-features/room-features.component').then((m) => m.RoomFeaturesComponent)
      },
      {
        path: 'used-coupons',
        loadComponent: () => import('./demo/pages/settings/coupons/used-coupons/used-coupons.component').then((m) => m.UsedCouponsComponent)
      },
      {
        path: 'coupons',
        loadComponent: () => import('./demo/pages/settings/coupons/coupons.component').then((m) => m.CouponsComponent)
      },
      {
        path: 'add-coupon',
        loadComponent: () => import('./demo/pages/settings/coupons/coupons-form/coupons-form.component').then((m) => m.CouponsFormComponent)
      },
      {
        path: 'coupon-details/:id',
        loadComponent: () =>
          import('./demo/pages/settings/coupons/coupon-details/coupon-details.component').then((m) => m.CouponDetailsComponent)
      },
      {
        path: 'room-groups',
        loadComponent: () => import('./demo/pages/settings/room-groups/room-groups.component').then((m) => m.RoomGroupsComponent)
      },
      {
        path: 'room-groups-form',
        loadComponent: () =>
          import('./demo/pages/settings/room-groups/room-group-form/room-group-form.component').then((m) => m.RoomGroupFormComponent)
      },
      {
        path: 'room-groups-form/:id',
        loadComponent: () =>
          import('./demo/pages/settings/room-groups/room-group-form/room-group-form.component').then((m) => m.RoomGroupFormComponent)
      },
      {
        path: 'advertisings',
        loadComponent: () => import('./demo/pages/settings/advertisings/advertisings.component').then((m) => m.AdvertisingsComponent)
      },
      {
        path: 'advertisings-form',
        loadComponent: () =>
          import('./demo/pages/settings/advertisings/advertisings-form/advertisings-form.component').then(
            (m) => m.AdvertisingsFormComponent
          )
      },
      {
        path: 'advertisings-form/:id',
        loadComponent: () =>
          import('./demo/pages/settings/advertisings/advertisings-form/advertisings-form.component').then(
            (m) => m.AdvertisingsFormComponent
          )
      },
      {
        path: 'advertising-details',
        loadComponent: () =>
          import('./demo/pages/settings/advertisings/advertisings-details/advertisings-details.component').then(
            (m) => m.AdvertisingsDetailsComponent
          )
      },
      {
        path: 'Sales-Agencies',
        loadComponent: () => import('./demo/pages/settings/sales-agencies/sales-agencies.component').then((m) => m.SalesAgenciesComponent)
      },
      {
        path: 'Sales-Agencies-form',
        loadComponent: () =>
          import('./demo/pages/settings/sales-agencies/sales-agencies-form/sales-agencies-form.component').then(
            (m) => m.SalesAgenciesFormComponent
          )
      },
      {
        path: 'Sales-Agencies-form/:id',
        loadComponent: () =>
          import('./demo/pages/settings/sales-agencies/sales-agencies-form/sales-agencies-form.component').then(
            (m) => m.SalesAgenciesFormComponent
          )
      },
      {
        path: 'Sales-Agencies-details/:id',
        loadComponent: () =>
          import('./demo/pages/settings/sales-agencies/sales-agencies-details/sales-agencies-details.component').then(
            (m) => m.SalesAgenciesDetailsComponent
          )
      },
      {
        path: 'all-Vendor-Contracts',
        loadComponent: () => import('./demo/pages/vendor-contracts/vendor-contracts.component').then((m) => m.VendorContractsComponent)
      },

      {
        path: 'Vendor-Contract-details/:id',
        loadComponent: () =>
          import('./demo/pages/vendor-contracts/vendor-contracts-details/vendor-contracts-details.component').then(
            (m) => m.VendorContractsDetailsComponent
          )
      },
      {
        path: 'walletTransactions',
        loadComponent: () =>
          import('./demo/pages/transactions/wallet-transactions/wallet-transactions.component').then((m) => m.WalletTransactionsComponent)
      },
      {
        path: 'chargeTransaction',
        loadComponent: () =>
          import('./demo/pages/transactions/charge-transactions/charge-transactions.component').then((m) => m.ChargeTransactionsComponent)
      },
      {
        path: 'emails',
        loadComponent: () => import('./demo/pages/emails/emails.component').then((m) => m.EmailsComponent)
      },
      {
        path: 'email-details/:id',
        loadComponent: () => import('./demo/pages/emails/email-details/email-details.component').then((m) => m.EmailDetailsComponent)
      },
      {
        path: 'mobile-policy',
        loadComponent: () =>
          import('./demo/pages/settings/mobile-policies/mobile-policies.component').then((m) => m.MobilePoliciesComponent)
      },
      {
        path: 'financial-settings',
        loadComponent: () =>
          import('./demo/pages/settings/financial-settings/financial-settings.component').then((m) => m.FinancialSettingsComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./demo/pages/notifications/notifications.component').then((m) => m.NotificationsComponent)
      },
      {
        path: 'mobile-sidebar',
        loadComponent: () => import('./demo/pages/settings/mob-side-bar/mob-side-bar.component').then((m) => m.MobSideBarComponent)
      },
      {
        path: 'mobile-sidebar-form',
        loadComponent: () =>
          import('./demo/pages/settings/mob-side-bar/mob-side-bar-form/mob-side-bar-form.component').then((m) => m.MobSideBarFormComponent)
      },
      {
        path: 'mobile-sidebar-form/:id',
        loadComponent: () =>
          import('./demo/pages/settings/mob-side-bar/mob-side-bar-form/mob-side-bar-form.component').then((m) => m.MobSideBarFormComponent)
      },
      {
        path: 'mobile-sidebar-details/:id',
        loadComponent: () =>
          import('./demo/pages/settings/mob-side-bar/mob-side-bar-details/mob-side-bar-details.component').then(
            (m) => m.MobSideBarDetailsComponent
          )
      },

      // Reports Routes
      {
        path: 'reports/outing',
        loadComponent: () => import('./demo/pages/reports/outing-reports/outing-reports.component').then((m) => m.OutingReportsComponent)
      },
      {
        path: 'reports/travel',
        loadComponent: () => import('./demo/pages/reports/travel-reports/travel-reports.component').then((m) => m.TravelReportsComponent)
      },
      {
        path: 'reports/hotel',
        loadComponent: () => import('./demo/pages/reports/hotel-reports/hotel-reports.component').then((m) => m.HotelReportsComponent)
      },
      {
        path: 'reports/hajj',
        loadComponent: () => import('./demo/pages/reports/hajj-reports/hajj-reports.component').then((m) => m.HajjReportsComponent)
      },

      {
        path: 'unauthorized',
        loadComponent: () => import('./shared/components/acces dened/access').then((m) => m.Access)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

```

---

## `src/app/app.component.html`

```html

<router-outlet>
  <app-spinner></app-spinner>
</router-outlet>

```

---

## `src/app/app.component.scss`

```scss

```

---

## `src/app/app.component.ts`

```ts
import { DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})




export class AppComponent {

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document,
    private router: Router
  ) {
    const currentLang = localStorage.getItem('Language') || 'en'; // Default to 'en'
    this.translate.use(currentLang);

    const activeLang = this.translate.currentLang;
    const dir = activeLang === 'ar' ? 'rtl' : 'ltr';

    this.document.documentElement.lang = activeLang;
    this.document.documentElement.dir = dir;
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent): void {
    const token = localStorage.getItem('token');
    const currentUrl = this.router.url;

    // Prevent back to login if already authenticated
    if (currentUrl === '/default') {
      this.router.navigate(['/default'], { replaceUrl: true });
    }
  }
}

// export class AppComponent {

//   constructor(private translate: TranslateService ,@Inject(DOCUMENT) private document: Document) {
//     const currentLang = localStorage.getItem('Language') || 'en'; // Default to 'en'
//     this.translate.use(currentLang);
//     let activeLang= this.translate.currentLang
//         // Update the direction
//         const dir = activeLang === 'ar' ? 'rtl' : 'ltr';
//         this.document.documentElement.lang = activeLang;
//         this.document.documentElement.dir = dir;


//   }

// }

```

---

## `src/app/app.module.ts`

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { NavigationItem } from './theme/layout/admin/navigation/navigation';
import { NavBarComponent } from './theme/layout/admin/nav-bar/nav-bar.component';
import { NavLeftComponent } from './theme/layout/admin/nav-bar/nav-left/nav-left.component';
import { NavRightComponent } from './theme/layout/admin/nav-bar/nav-right/nav-right.component';
import { NavigationComponent } from './theme/layout/admin/navigation/navigation.component';
import { NavLogoComponent } from './theme/layout/admin/nav-bar/nav-logo/nav-logo.component';
import { NavContentComponent } from './theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavGroupComponent } from './theme/layout/admin/navigation/nav-content/nav-group/nav-group.component';
import { NavCollapseComponent } from './theme/layout/admin/navigation/nav-content/nav-collapse/nav-collapse.component';
import { NavItemComponent } from './theme/layout/admin/navigation/nav-content/nav-item/nav-item.component';
import { SharedModule } from './theme/shared/shared.module';
import { ConfigurationComponent } from './theme/layout/admin/configuration/configuration.component';

import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpInterceptorInterceptor } from './shared/interceptors/http.interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';



export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    NavBarComponent,
    NavLeftComponent,
    NavRightComponent,
    NavigationComponent,
    NavLogoComponent,
    NavContentComponent,
    NavGroupComponent,
    NavItemComponent,
    NavCollapseComponent,
    ConfigurationComponent

  ],
  imports: [BrowserModule,  NgxSpinnerModule,AppRoutingModule, ToastrModule.forRoot({
    timeOut: 4000,
    positionClass: 'toast-top-right',

    preventDuplicates: true,
  }),SharedModule,HttpClientModule ,BrowserAnimationsModule,TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient],
    },
  })],
  providers: [NavigationItem,MessageService,ToastrService ,DialogService,{provide:HTTP_INTERCEPTORS , useClass:HttpInterceptorInterceptor , multi:true}],
  bootstrap: [AppComponent]
})
export class AppModule {}

```

---

## `src/app/demo/default/bajaj-chart/bajaj-chart.component.html`

```html
<apx-chart
  [series]="chartOptions.series"
  [chart]="chartOptions.chart"
  [dataLabels]="chartOptions.dataLabels"
  [plotOptions]="chartOptions.plotOptions"
  [responsive]="chartOptions.responsive"
  [colors]="chartOptions.colors"
  [tooltip]="chartOptions.tooltip"
  [stroke]="chartOptions.stroke"
></apx-chart>

```

---

## `src/app/demo/default/bajaj-chart/bajaj-chart.component.scss`

```scss

```

---

## `src/app/demo/default/bajaj-chart/bajaj-chart.component.ts`

```ts
// angular import
import { Component, ViewChild } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';

// third party
import {
  NgApexchartsModule,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexAxisChartSeries,
  ApexTooltip,
  ApexPlotOptions,
  ApexResponsive,
  ApexStroke
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  colors: string[];
  stroke: ApexStroke;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-bajaj-chart',
  standalone: true,
  imports: [SharedModule, NgApexchartsModule],
  templateUrl: './bajaj-chart.component.html',
  styleUrl: './bajaj-chart.component.scss'
})
export class BajajChartComponent {
  // public props
  @ViewChild('chart') chart!: ChartComponent;
  chartOptions!: Partial<ChartOptions>;

  // constructor
  constructor() {
    this.chartOptions = {
      chart: {
        type: 'area',
        height: 95,
        stacked: true,
        sparkline: {
          enabled: true
        },
        background: 'transparent'
      },
      stroke: {
        curve: 'smooth',
        width: 1
      },
      series: [
        {
          data: [0, 15, 10, 50, 30, 40, 25]
        }
      ],
      tooltip: {
        theme: 'light',
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: () => 'Ticket '
          }
        },
        marker: {
          show: false
        }
      },
      colors: ['#673ab7']
    };
  }
}

```

---

## `src/app/demo/default/bar-chart/bar-chart.component.html`

```html
<div class="card">
  <div class="card-body">
    <div class="row mb-3 align-items-center">
      <div class="col">
        <div class="text-sm">Total Growth</div>
        <h3 class="mt-2 f-w-600">$2,324.00</h3>
      </div>
      <div class="col-auto">
        <select class="form-select p-r-35" title="Select">
          <option>Today</option>
          <option selected>Month</option>
          <option>Year</option>
        </select>
      </div>
    </div>
    <apx-chart
      [series]="chartOptions.series"
      [chart]="chartOptions.chart"
      [dataLabels]="chartOptions.dataLabels"
      [plotOptions]="chartOptions.plotOptions"
      [responsive]="chartOptions.responsive"
      [xaxis]="chartOptions.xaxis"
      [colors]="chartOptions.colors"
      [tooltip]="chartOptions.tooltip"
    ></apx-chart>
  </div>
</div>

```

---

## `src/app/demo/default/bar-chart/bar-chart.component.scss`

```scss

```

---

## `src/app/demo/default/bar-chart/bar-chart.component.ts`

```ts
// angular import
import { Component, ViewChild } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';

// third party
import {
  NgApexchartsModule,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexYAxis,
  ApexTooltip,
  ApexPlotOptions,
  ApexResponsive
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  colors: string[];
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [NgApexchartsModule, SharedModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss'
})
export class BarChartComponent {
  // public props
  @ViewChild('chart') chart!: ChartComponent;
  chartOptions!: Partial<ChartOptions>;

  // Constructor
  constructor() {
    this.chartOptions = {
      series: [
        {
          name: 'Investment',
          data: [35, 125, 35, 35, 35, 80, 35, 20, 35, 45, 15, 75]
        },
        {
          name: 'Loss',
          data: [35, 15, 15, 35, 65, 40, 80, 25, 15, 85, 25, 75]
        },
        {
          name: 'Profit',
          data: [35, 145, 35, 35, 20, 105, 100, 10, 65, 45, 30, 10]
        },
        {
          name: 'Maintenance',
          data: [0, 0, 75, 0, 0, 115, 0, 0, 0, 0, 150, 0]
        }
      ],
      dataLabels: {
        enabled: false
      },
      chart: {
        type: 'bar',
        height: 480,
        stacked: true,
        toolbar: {
          show: true
        },
        background: 'transparent'
      },
      colors: ['#d3eafd', '#2196f3', '#673ab7', '#ede7f6'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -10,
              offsetY: 0
            }
          }
        }
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%'
        }
      },
      xaxis: {
        type: 'category',
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      tooltip: {
        theme: 'light'
      }
    };
  }
}

```

---

## `src/app/demo/default/chart-data-month/chart-data-month.component.html`

```html
<div class="row">
  <div class="col">
    <div class="avatar avatar-lg">
      <i class="text-white ti ti-credit-card"></i>
    </div>
  </div>
  <div class="col-auto">
    <div class="d-flex align-items-center gap-2 chart-income">
      <div class="btn btn-sm text-white" [ngClass]="this.btnActive === 'month' ? 'btn-primary' : ''" (click)="toggleActive('month')">
        Month
      </div>
      <div class="btn btn-sm text-white" [ngClass]="this.btnActive === 'year' ? 'btn-primary' : ''" (click)="toggleActive('year')">
        Year
      </div>
    </div>
  </div>
</div>
<div class="row">
  <div class="col-6">
    <span class="text-white d-block f-34 f-w-500 my-2">
      ${{ amount }}
      <i class="ti ti-circle-arrow-up-right opacity-50"></i>
    </span>
    <p class="mb-0 opacity-50">C/W Last Year</p>
  </div>
  <div class="col-6">
    <div id="chart text-dark">
      <apx-chart
        [series]="chartOptions.series"
        [chart]="chartOptions.chart"
        [dataLabels]="chartOptions.dataLabels"
        [yaxis]="chartOptions.yaxis"
        [colors]="chartOptions.colors"
        [stroke]="chartOptions.stroke"
        [tooltip]="chartOptions.tooltip"
      ></apx-chart>
    </div>
  </div>
</div>

```

---

## `src/app/demo/default/chart-data-month/chart-data-month.component.scss`

```scss
.chart-income {
  .active {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
    outline: 0px;
    border: 0px;
    margin: 0px;
    cursor: pointer;
    user-select: none;
    vertical-align: middle;
    appearance: none;
    text-decoration: none;
    text-transform: capitalize;
    font-family: Roboto, sans-serif;
    font-size: 0.8125rem;
    line-height: 1.75;
    min-width: 64px;
    padding: 4px 10px;
    transition:
      background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
      color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    background-color: rgb(33, 150, 243);
    box-shadow: none;
    font-weight: 500;
    border-radius: 4px;
    color: inherit;
  }
}

```

---

## `src/app/demo/default/chart-data-month/chart-data-month.component.ts`

```ts
// angular import
import { Component, OnInit, ViewChild } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';

// third party
import {
  NgApexchartsModule,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexAxisChartSeries,
  ApexStroke,
  ApexXAxis,
  ApexYAxis,
  ApexTheme,
  ApexTooltip
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  xaxis: ApexXAxis;
  colors: string[];
  stroke: ApexStroke;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  theme: ApexTheme;
};

@Component({
  selector: 'app-chart-data-month',
  standalone: true,
  imports: [SharedModule, NgApexchartsModule],
  templateUrl: './chart-data-month.component.html',
  styleUrl: './chart-data-month.component.scss'
})
export class ChartDataMonthComponent implements OnInit {
  // public props
  @ViewChild('chart') chart!: ChartComponent;
  chartOptions!: Partial<ChartOptions>;
  amount: number = 961;
  btnActive!: string;

  // life cycle event
  ngOnInit() {
    this.btnActive = 'year';
    this.chartOptions = {
      chart: {
        type: 'line',
        height: 90,
        sparkline: {
          enabled: true
        }
      },
      dataLabels: {
        enabled: false
      },
      colors: ['#FFF'],
      stroke: {
        curve: 'smooth',
        width: 3
      },
      series: [
        {
          name: 'series1',
          data: [35, 44, 9, 54, 45, 66, 41, 69]
        }
      ],
      yaxis: {
        min: 5,
        max: 95
      },
      tooltip: {
        theme: 'dark',
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        marker: {
          show: false
        }
      }
    };
  }

  // public method
  toggleActive(value: string) {
    this.btnActive = value;
    this.chartOptions.series = [
      {
        name: 'series1',
        data: value === 'month' ? [45, 66, 41, 89, 25, 44, 9, 54] : [35, 44, 9, 54, 45, 66, 41, 69]
      }
    ];
    this.amount = value === 'month' ? 108 : 961;
  }
}

```

---

## `src/app/demo/default/default.component.html`

```html

<!-- <div class="search-section p-grid">
  <div class="row">
    <div class="col-12 col-md-8 col-lg-8" style="z-index: 3;">
      <div class="welcome-text w-75">
        <h1 class="mb-3 ">{{'Hello' |translate}} {{username}}</h1>
        <h2>{{'How can we help you?' | translate}}</h2>
        <p>{{'Main Content in home' |translate}}</p>
        <section class="search-box mt-4 mb-5">
          <search-field></search-field>
        </section>
        <div>
          <h4>{{'Topics' | translate}}</h4>
        </div>

      </div>
    </div>

  </div>
</div>
<div class="topics">
  <div class="row">
    <div class="col-12 col-md-8 col-lg-8 row">
      <div class="col-6 col-md-3" *ngFor="let topic of topics">
        <div class="topic-card card">
          <div class="card-body px-3 py-2">
            <div class="my-2">
              <i class="text-info {{ topic.icon }} f-30" ></i>
            </div>
            <p class="text-main f-w-700" >{{ topic.name  |translate}}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-4 col-lg-4">
      <div class="news-card card">
        <div class="card-body bg-main rounded">
          <p-galleria [value]="newsItems" [showIndicators]="true" [showThumbnails]="false"
            [responsiveOptions]="responsiveOptions" [autoPlay]="true" [circular]="true">
            <ng-template pTemplate="item" let-news>
              <div class="text-left " style="height: 70%;">
                <h5 class="f-w-600">{{news.title}}</h5>
                <p class="f-15 mt-3">{{news.description}}</p>

              </div>

            </ng-template>
          </p-galleria>
        </div>
      </div>
    </div>




  </div>
</div> -->

<app-vendor-detail [CompanyId]="companyId"></app-vendor-detail>















<!-- ---------------previous----------------------------------- -->

<!-- <div class="row">

  <div class="col-xl-8 col-md-12">
    <app-card cardTitle="Recommended for you">
      <div class="row"></div>
    </app-card>
  </div>
  <div class="col-xl-4 col-md-12">
    <div class="card">
      <div class="card-body">
        <div class="row mb-3 align-items-center">
          <div class="col">
            <h4>Popular Stocks</h4>
          </div>
          <div class="col-auto"></div>
        </div>
        <div class="rounded bg-light-secondary overflow-hidden mb-3">
          <div class="px-3 pt-3">
            <div class="row mb-1 align-items-start">
              <div class="col">
                <h5 class="text-secondary mb-0">Bajaj Finery</h5>
                <small class="text-muted">10% Profit</small>
              </div>
              <div class="col-auto">
                <h4 class="mb-0">$1839.00</h4>
              </div>
            </div>
          </div>
          <app-bajaj-chart />
        </div>
        <ul class="list-group list-group-flush">
          @for (list of ListGroup; track list) {
            <li class="list-group-item px-0 {{ list.space }}">
              <div class="row align-items-start">
                <div class="col">
                  <h5 class="mb-0">{{ list.name }}</h5>
                  <small class="{{ list.color }}">{{ list.profit }}</small>
                </div>
                <div class="col-auto">
                  <h4 class="mb-0">
                    {{ list.invest }}
                    <span class="ms-2 align-top avatar avatar-xxs {{ list.bgColor }}">
                      <i class="{{ list.icon }} {{ list.color }}"></i>
                    </span>
                  </h4>
                </div>
              </div>
            </li>
          }
        </ul>
        <div class="text-center">
          <a href="javascript:" class="b-b-primary text-primary f-w-500">
            View all
            <i class="ti ti-chevron-right"></i>
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="col-xl-8 col-md-12">
    <app-card cardTitle="Hello Card">
      <p>
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
        ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt
        in culpa qui officia deserunt mollit anim id est laborum."
      </p>
    </app-card>
  </div>
  <div class="col-xl-4 col-md-12">
    <div class="card">
      <div class="card-body">
        <div class="row mb-3 align-items-center">
          <div class="col">
            <h4>Popular Stocks</h4>
          </div>
          <div class="col-auto"></div>
        </div>
        <div class="rounded bg-light-secondary overflow-hidden mb-3">
          <div class="px-3 pt-3">
            <div class="row mb-1 align-items-start">
              <div class="col">
                <h5 class="text-secondary mb-0">Bajaj Finery</h5>
                <small class="text-muted">10% Profit</small>
              </div>
              <div class="col-auto">
                <h4 class="mb-0">$1839.00</h4>
              </div>
            </div>
          </div>
          <app-bajaj-chart />
        </div>
        <ul class="list-group list-group-flush">
          @for (list of ListGroup; track list) {
            <li class="list-group-item px-0 {{ list.space }}">
              <div class="row align-items-start">
                <div class="col">
                  <h5 class="mb-0">{{ list.name }}</h5>
                  <small class="{{ list.color }}">{{ list.profit }}</small>
                </div>
                <div class="col-auto">
                  <h4 class="mb-0">
                    {{ list.invest }}
                    <span class="ms-2 align-top avatar avatar-xxs {{ list.bgColor }}">
                      <i class="{{ list.icon }} {{ list.color }}"></i>
                    </span>
                  </h4>
                </div>
              </div>
            </li>
          }
        </ul>
        <div class="text-center">
          <a href="javascript:" class="b-b-primary text-primary f-w-500">
            View all
            <i class="ti ti-chevron-right"></i>
          </a>
        </div>
      </div>
    </div>
  </div>
</div> -->

```

---

## `src/app/demo/default/default.component.scss`

```scss
.nav-tabs {
  border-bottom: none !important;
}
body.berry-dark .nav-tabs .nav-link,
body.berry-dark .tab-content {
  box-shadow: none !important;
  background: none !important;
}

.earning-card {
  .round {
    &.secondary-round {
      background: #4527a0;
    }
    &.primary-round {
      background: #1565c0;
    }
  }
}

.total-income-card {
  .avatar {
    background: #1565c0;
  }
}



.header {
  padding: 20px;

}

.search-section {
  padding: 55px;
  background:url(../../../assets/images/bg-login.jpg);
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-attachment: fixed;
  position: relative;
color: #fff;

}
.search-section::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 20px;
 left: 0;
 top: 0;
 background: #0b3c58d1;
 background: -webkit-linear-gradient(45deg, #0b3c58fa, #0b3c58bd); /* For Safari 5.1 to 6.0 */
 background: -o-linear-gradient(45deg, #0b3c58fa, #0b3c58bd); /* For Opera 11.1 to 12.0 */
 background: -moz-linear-gradient(45deg, #0b3c58fa, #0b3c58bd); /* For Firefox 3.6 to 15 */
 background: linear-gradient(45deg, #0b3c58fa, #0b3c58bd); /* Standard syntax */

}
.recommended,
.leave-request,
.next-event,
.benefits,
.news {
  margin-top: 20px;
}


.topics{
  padding: 55px;
    margin-top: -100px;
    z-index: 2;
}


.topic-card {
  cursor: pointer;

  i,
  p {
    transition: color 0.3s ease;
  }

  &:hover i,
  &:hover p,
  &:focus i,
  &:focus p {
    color: #007bff; // Bootstrap primary blue
  }
}
.news-card{
  margin-top: -200px;
  height: 300px;
  overflow: hidden;
  box-shadow: 1px 4px 7px #0f1c36;
}
h1{
  color:var(--thm-base)
}
.text-grey{
  color:  #7e838d;;


}
strong:hover{
  cursor: pointer;
}
.dir-p{
  margin-inline-start: 30px !important;
}

.bg-list{
  background-color: #f4f4f4;
  padding: 10px 5px 10px 20px !important;
  border-radius: 5px;
  margin-block-end: 5px;
}

```

---

## `src/app/demo/default/default.component.ts`

```ts
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

```

---

## `src/app/demo/pages/authentication/forgot-password/forgot-password.component.html`

```html
<div class="login-wrapper">
  <section class="grid mx-0">
    <div class="login-content">
      <div class="login-content__inner">
        <div class="logo-box mb-4">
          <img src="assets/images/logo_color.png" alt="App Logo" class="main-logo" />
        </div>

        <div class="mb-5">
          <p-stepper [(activeStep)]="activeStep" [linear]="false">
            <p-stepperPanel header="Email">
              <ng-template pTemplate="content" let-nextCallback="nextCallback" let-index="index">
                <div class="flex flex-column gap-2 mx-auto" style="min-height: 16rem; max-width: 24rem">
                  <h2 class="login-title mb-2">Forgot Password</h2>
                  <p class="login-subtitle mb-4">Enter your email to receive an OTP</p>

                  <form [formGroup]="emailForm" (ngSubmit)="sendOtp()">
                    <div class="input-group">
                      <label for="email">Email Address</label>
                      <input
                        type="text"
                        id="email"
                        formControlName="email"
                        pInputText
                        placeholder="Enter your email"
                        [ngClass]="{ 'p-invalid': emailForm.get('email')?.invalid && emailForm.get('email')?.touched }"
                      />
                      <small class="p-error" *ngIf="emailForm.get('email')?.invalid && emailForm.get('email')?.touched">
                        Valid email is required
                      </small>
                    </div>

                    <button type="submit" class="theme-btn" [disabled]="emailForm.invalid || loading">
                      <i class="btn-curve"></i>
                      <span class="btn-title">
                        <i *ngIf="loading" class="pi pi-spin pi-spinner mr-2"></i>
                        Send OTP
                      </span>
                    </button>
                    <div class="mt-3 text-center">
                      <a routerLink="/login" class="text-primary no-underline">Back to Login</a>
                    </div>
                  </form>
                </div>
              </ng-template>
            </p-stepperPanel>

            <p-stepperPanel header="OTP" >
              <ng-template pTemplate="content" let-prevCallback="prevCallback" let-nextCallback="nextCallback" let-index="index">
                <div class="flex flex-column gap-2 mx-auto" style="min-height: 16rem; max-width: 24rem">
                  <h2 class="login-title mb-2">Verify OTP</h2>
                  <p class="login-subtitle mb-4">Enter the code sent to your email</p>

                  <form [formGroup]="otpForm" (ngSubmit)="verifyOtp()">
                    <div class="flex flex-column align-items-center gap-3 mb-4">
                      <label class="font-bold">Enter OTP sent to {{ email }}</label>
                      <p-inputOtp formControlName="otp" [length]="6"></p-inputOtp>
                      <small class="p-error" *ngIf="otpForm.get('otp')?.invalid && otpForm.get('otp')?.touched">
                        OTP is required (6 digits)
                      </small>
                    </div>

                    <div class="flex gap-2">
                      <button type="button" class="theme-btn bg-gray-500 border-gray-500" (click)="activeStep = 0">
                        <i class="btn-curve"></i>
                        <span class="btn-title">Back</span>
                      </button>
                      <button type="submit" class="theme-btn" [disabled]="otpForm.invalid || loading">
                        <i class="btn-curve"></i>
                        <span class="btn-title">
                          <i *ngIf="loading" class="pi pi-spin pi-spinner mr-2"></i>
                          Verify OTP
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </ng-template>
            </p-stepperPanel>

            <p-stepperPanel header="New Password">
              <ng-template pTemplate="content" let-prevCallback="prevCallback" let-index="index">
                <div class="flex flex-column gap-2 align-items-center" style="min-height: 16rem; max-width: 24rem">
                  <h2 class="login-title mb-2">Reset Password</h2>

                  <form [formGroup]="passwordForm" (ngSubmit)="resetPassword()" class="w-full">
                    <div class="input-group mt-4 w-full">
                      <span class="p-float-label w-full">
                        <p-password
                          id="newPassword"
                          formControlName="newPassword"
                          [toggleMask]="true"
                          styleClass="w-full"
                          [style]="{ width: '100%' }"
                        ></p-password>
                        <label for="newPassword">New Password</label>
                      </span>
                    </div>
                    <div class="input-group mt-4 w-full">
                      <span class="p-float-label w-full">
                        <p-password
                          id="confirmPassword"
                          formControlName="confirmPassword"
                          [toggleMask]="true"
                          styleClass="w-full"
                          [style]="{ width: '100%' }"
                          [feedback]="false"
                        ></p-password>
                        <label for="confirmPassword">Confirm Password</label>
                      </span>
                      <small class="p-error mt-2 text-center" *ngIf="passwordForm.getError('mismatch') && passwordForm.touched">
                        Passwords do not match
                      </small>
                    </div>

                    <button type="submit" class="theme-btn" [disabled]="passwordForm.invalid || loading">
                      <i class="btn-curve"></i>
                      <span class="btn-title">
                        <i *ngIf="loading" class="pi pi-spin pi-spinner mr-2"></i>
                        Reset Password
                      </span>
                    </button>
                  </form>
                </div>
              </ng-template>
            </p-stepperPanel>
          </p-stepper>
        </div>
      </div>
    </div>
    <div class="login-bg image-bg">
      <img src="assets/images/tripsCover.jpg" alt="Login Background" />
    </div>
  </section>
</div>

```

---

## `src/app/demo/pages/authentication/forgot-password/forgot-password.component.scss`

```scss
.login-wrapper {
  height: 100vh;
  overflow: hidden;

  .grid {
    height: 100%;
  }

  .login-content {
    background: #fff;
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;

    @media (max-width: 991px) {
      width: 100%;
    }

    &__inner {
      width: 100%;
      max-width: 450px;
    }
  }

  .login-bg {
    width: 50%;
    height: 100%;
    position: relative;

    @media (max-width: 991px) {
      display: none;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .logo-box {
    text-align: center;
    .main-logo {
      max-width: 150px;
    }
  }

  .login-title {
    font-size: 24px;
    font-weight: 700;
    color: #333;
    margin-bottom: 10px;
    text-align: center;
  }

  .login-subtitle {
    font-size: 14px;
    color: #666;
    text-align: center;
    margin-bottom: 30px;
  }

  .input-group {
    margin-bottom: 20px;

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }

    input {
      width: 100%;
    }
  }

  .theme-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 6px;
    background: var(--primary-color, #007bff); // Use variable or fallback
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-curve {
      display: none; // Simplified
    }
  }
}

```

---

## `src/app/demo/pages/authentication/forgot-password/forgot-password.component.ts`

```ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from 'src/app/shared/services/account.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { InputOtpModule } from 'primeng/inputotp';
import { StepperModule } from 'primeng/stepper';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SharedModule, InputOtpModule, StepperModule, PasswordModule, InputTextModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  emailForm: FormGroup;
  otpForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  email = '';
  activeStep = 0;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private toast: ToastrService,
    private router: Router
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.passwordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: passwordMatchValidator }
    );
  }

  sendOtp() {
    if (this.emailForm.invalid) return;
    this.loading = true;
    this.email = this.emailForm.value.email;

    this.accountService.sendOtp(this.email).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success || res.status === 200) {
          // Adjust based on actual API response
          this.toast.success('OTP sent to your email');
          this.activeStep = 1;
        } else {
          this.toast.error(res.message || 'Failed to send OTP');
        }
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message || 'Failed to send OTP');
      }
    });
  }

  verifyOtp() {
    if (this.otpForm.invalid) return;
    this.loading = true;
    const model = {
      email: this.email,
      otp: this.otpForm.value.otp
    };

    this.accountService.verifyOtp(model).subscribe({
      next: (res: any) => {
        this.loading = false;
        // Assuming success if no error, but ideally check res.success
        this.toast.success('OTP verified');
        this.activeStep = 2;
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message || 'Invalid OTP');
      }
    });
  }

  resetPassword() {
    if (this.passwordForm.invalid) return;

    this.loading = true;
    const model = {
      email: this.email,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword
    };

    this.accountService.resetPassword(model).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.toast.success('Password reset successfully');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.message || 'Failed to reset password');
      }
    });
  }
}

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!newPassword || !confirmPassword) {
    return null;
  }

  return newPassword === confirmPassword ? null : { mismatch: true };
}

```

---

## `src/app/demo/pages/authentication/login/login.component.html`

```html
<div class="login-wrapper">
  <section class="grid mx-0">
    <div class="login-content">
      <div class="login-content__inner">
        <div class="logo-box">
          <img src="assets/images/logo_color.png" alt="App Logo" class="main-logo" />
        </div>

        <h2 class="login-title">{{ 'Welcome Back' | translate }}</h2>
        <p class="login-subtitle">{{ 'Sign in to continue' | translate }}</p>

        <form [formGroup]="signInForm" (ngSubmit)="onSubmit()">
          <div class="input-group">
            <label for="username">{{ 'user name' | translate }}</label>
            <input
              type="text"
              id="username"
              formControlName="username"
              placeholder="your username"
              [ngClass]="{
                'p-invalid': (signInForm.controls['username'].invalid && signInForm.controls['username'].touched) || showErrorMsg
              }"
              pInputText
            />
            <small *ngIf="signInForm.controls['username'].invalid && signInForm.controls['username'].touched" class="p-error">
              {{ 'username is required' | translate }}
            </small>
          </div>

          <div class="input-group">
            <label for="password">{{ 'Password' | translate }}</label>
            <div class="p-password">
              <input
                type="password"
                id="password"
                formControlName="password"
                placeholder="••••••••"
                [ngClass]="{
                  'p-invalid': (signInForm.controls['password'].invalid && signInForm.controls['password'].touched) || showErrorMsg
                }"
                pInputText
              />
              <i class="pi pi-eye password-toggle" (click)="togglePasswordVisibility()"></i>
            </div>
            <small *ngIf="signInForm.controls['password'].invalid && signInForm.controls['password'].touched" class="p-error">
              {{ 'Password is required' | translate }}
            </small>
          </div>

          <div class="remember-forgot">
            <!-- <div class="remember-me">
              <p-checkbox [binary]="true" formControlName="rememberMe"></p-checkbox>
              <label>{{ 'Remember me' | translate }}</label>
            </div> -->
            <a class="forgot-password" routerLink="/forgot-password">
              {{ 'Forgot Password?' | translate }}
            </a>
          </div>

          <strong class="p-error text-center d-block" *ngIf="showErrorMsg">
            {{ 'Invalid Username or Password' | translate }}
          </strong>

          <button type="submit" class="theme-btn" [disabled]="signInForm.invalid || isLoading">
            <i class="btn-curve"></i>
            <span class="btn-title">
              <i *ngIf="isLoading" class="pi pi-spin pi-spinner"></i>
              {{ 'Sign In' | translate }}
            </span>
          </button>

          <!-- <div class="social-login">
            <p>{{ 'Or sign in with' | translate }}</p>
            <div class="social-icons">
              <button type="button" class="social-btn google">
                <i class="pi pi-google"></i>
              </button>
              <button type="button" class="social-btn facebook">
                <i class="pi pi-facebook"></i>
              </button>
              <button type="button" class="social-btn twitter">
                <i class="pi pi-twitter"></i>
              </button>
            </div>
          </div> -->
        </form>

        <p class="signup-link">
          {{ "Don't have an account?" | translate }}
          <a routerLink="/register">{{ 'Sign Up' | translate }}</a>
        </p>

        <p class="copyright-text">© {{ currentYear }} {{ 'impact bussines sloutions All rights reserved' | translate }}</p>
      </div>
    </div>

    <div class="login-bg image-bg">
      <img src="assets/images/tripsCover.jpg" alt="Login Background" />
    </div>
  </section>
</div>

```

---

## `src/app/demo/pages/authentication/login/login.component.scss`

```scss
:host {
  display: block;
  height: 100%;

}

.page-wrapper {
  position: relative;
  margin: 0;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
  
}

.login-wrapper {
  position: relative;
  height: 100vh;
  display: flex;

  .grid {
    display: flex;
    width: 100%;
    height: 100%;
    margin: 0;
  }
}

.login-content {
  flex: 0 0 55%;
  max-width: 55%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0b3c58;
  // padding: 1rem;

  @media (max-width: 992px) {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

.login-content__inner {
  width: 100%;
  max-width: 500px;
  padding: 1rem;
  height: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .logo-box {
    text-align: center;
    margin-bottom: 1rem;

    .main-logo {
      height: 120px;
      width: auto;
    }
  }

  .login-title {
    color: #fff;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .login-subtitle {
    color: #b0c1c7;
    font-size: 1.1rem;
    text-align: center;
    margin-bottom: 2.5rem;
  }
}

.input-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    color: #b0c1c7;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .p-password {
    position: relative;

    .password-toggle {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #7a8c94;
      cursor: pointer;
      z-index: 10;
    }
  }

  input {
    width: 100%;
    border-radius: 8px !important;
    
    background-color: #284758;
    height: 55px;
    padding: 0 1.5rem;
    font-size: 1rem;
    color: #fff;
    border: 1px solid #2a5d78;
    transition: all 0.3s ease;

    &::placeholder {
      color: #7a8c94;
    }

    &:focus {
      border-color: #3bb4e6;
      box-shadow: 0 0 0 0.2rem rgba(59, 180, 230, 0.25);
      outline: none;
    }

    &.p-invalid {
      border-color: #e24c4c;
    }
  }

  small.p-error {
    display: block;
    margin-top: 0.5rem;
    color: #e24c4c;
    font-size: 0.85rem;
  }
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  .remember-me {
    display: flex;
    align-items: center;

    label {
      color: #b0c1c7;
      margin: 0 0 0 0.5rem;
      cursor: pointer;
    }
  }

  .forgot-password {
    color: #3bb4e6;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: color 0.3s ease;

    &:hover {
      color: #1da1f2;
      text-decoration: underline;
    }
  }
}

.theme-btn {
  position: relative;
  display: block;
  width: 100%;
  border: none;
  text-align: center;
  letter-spacing: 0.05em;
  background: #3bb4e6;
  color: #fff;
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  padding: 0;
  margin-top: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #2a9fd6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 180, 230, 0.3);
  }

  &:disabled {
    background: #7a8c94;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;

    .btn-curve {
      opacity: 0.1;
    }
  }

  .btn-curve {
    position: absolute;
    right: -15px;
    top: 0;
    width: 26px;
    height: 100%;
    background: #1a4d68;
    opacity: 0.3;
    z-index: 0;
    transform: skewX(-22deg);
    transition: all 0.5s ease;
  }

  .btn-title {
    position: relative;
    display: block;
    font-size: 1rem;
    line-height: 1.5;
    padding: 1.1rem 0;
    z-index: 1;

    i {
      margin-right: 0.5rem;
    }
  }
}

.social-login {
  margin: 2rem 0;
  text-align: center;

  p {
    color: #b0c1c7;
    position: relative;
    margin-bottom: 1.5rem;

    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 30%;
      height: 1px;
      background: #2a5d78;
    }

    &::before {
      left: 0;
    }

    &::after {
      right: 0;
    }
  }

  .social-icons {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .social-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    &.google {
      background: #db4437;
    }

    &.facebook {
      background: #4267b2;
    }

    &.twitter {
      background: #1da1f2;
    }
  }
}

.signup-link {
  text-align: center;
  color: #b0c1c7;
  font-size: 1rem;
  margin-top: 1rem;

  a {
    color: #3bb4e6;
    font-weight: 600;
    margin-left: 0.5rem;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: #1da1f2;
      text-decoration: underline;
    }
  }
}

.copyright-text {
  margin-top: 2rem;
  text-align: center;
  color: #7a8c94;
  font-size: 0.9rem;
}

.login-bg {
  background: #0b3c58;

  flex: 0 0 45%;
  max-width: 45%;
  height: 100%;
  position: relative;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 992px) {
    display: none;
  }

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 0 10px 10px 0;
  }
}


// Responsive adjustments
@media (max-width: 1200px) {
  .login-content {
    flex: 0 0 50%;
    max-width: 50%;
  }

  .login-bg {
    flex: 0 0 50%;
    max-width: 50%;
  }
}

@media (max-width: 992px) {
  .login-content {
    flex: 0 0 100%;
    max-width: 100%;
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .login-content__inner {
    padding: 1rem;

    .login-title {
      font-size: 1.8rem;
    }

    .login-subtitle {
      font-size: 1rem;
    }
  }

  .remember-forgot {
    flex-direction: column;
    align-items: flex-start;

    .forgot-password {
      margin-top: 0.5rem;
    }
  }
}

```

---

## `src/app/demo/pages/authentication/login/login.component.ts`

```ts
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from 'src/app/shared/services/account.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CarouselModule } from 'primeng/carousel';
import { NavigationItem } from 'src/app/theme/layout/admin/navigation/navigation';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    TranslateModule,
    SharedModule,
    ReactiveFormsModule,
    PasswordModule,
    CheckboxModule,
    InputTextModule,
    ProgressSpinnerModule,
    CarouselModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export default class LoginComponent {
  @ViewChild('signInNgForm') signInNgForm: NgForm;
  signInForm: FormGroup;
  showErrorMsg: boolean = false;
  isLoading: boolean = false;
  showPassword: boolean = false;
  currentYear: number = new Date().getFullYear();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private _loginService: AccountService,
    private toast: ToastrService,
    private navService: NavigationItem,
    private configService: ConfigureService
  ) {}

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
      // rememberMe: [false]
    });

    // Check for saved credentials
    const savedCredentials = localStorage.getItem('savedCredentials');
    if (savedCredentials) {
      const credentials = JSON.parse(savedCredentials);
      this.signInForm.patchValue({
        username: credentials.username,
        password: credentials.password,
        rememberMe: true
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    const passwordField = document.getElementById('password') as HTMLInputElement;
    passwordField.type = this.showPassword ? 'text' : 'password';
  }
  private isExactScanner(permissions: string[]): boolean {
    const scannerPermissions = ['Permissions.Scanner.View', 'Permissions.Scanner.Edit'];

    return permissions.length === scannerPermissions.length && scannerPermissions.every((p) => permissions.includes(p));
  }

  onSubmit() {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.showErrorMsg = false;

    if (this.signInForm.value.rememberMe) {
      localStorage.setItem(
        'savedCredentials',
        JSON.stringify({
          username: this.signInForm.value.username,
          password: this.signInForm.value.password
        })
      );
    } else {
      localStorage.removeItem('savedCredentials');
    }

    this._loginService.login(this.signInForm.value).subscribe(
      (response: any) => {
        if (response.success) {
          // حفظ بيانات اليوزر في ConfigureService
          this.configService.setUser(response.data);

          const permissions = response.data.permissions || [];
          const roles = response.data.roles || [];

          // Redirect حسب permission أو role
          if (this.isExactScanner(permissions)) {
            this.router.navigate(['/scanner'], { replaceUrl: true });
          } else {
            this.router.navigate(['/default'], { replaceUrl: true });
          }

          // Notifying components about user state
          this.configService.notifyUserStateChange();

          this.isLoading = false;
        } else {
          this.showErrorMsg = true;
          this.isLoading = false;
        }
      },
      (error) => {
        this.showErrorMsg = true;
        this.isLoading = false;
        this.toast.error('Login failed. Please try again.', 'Error');
      }
    );
  }
}

```

---

## `src/app/demo/pages/customers/customer-detail/customer-detail.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'Customer Details' | translate"
    [mainSection]="'Customers' | translate"
    [subSection]="'Details' | translate"
  ></sub-header>

  <div class="card">
    <!-- Hero Card -->
    <div class="card hero-card mb-4">
      <div class="card-body">
        <div class="row align-items-center">
          <!-- Customer Image -->
          <div class="col-12 col-md-auto text-center mb-3 mb-md-0">
            <div class="customer-avatar-wrapper">
              <img [src]="getAvatar(customer.imageUrl)" [alt]="customer.name" class="customer-avatar" referrerpolicy="no-referrer" />
            </div>
          </div>

          <!-- Customer Info -->
          <div class="col-12 col-md">
            <h2 class="customer-name mb-2">{{ customer.name || 'N/A' }}</h2>
            <p class="customer-username text-muted mb-3">
              <i class="pi pi-at me-2"></i>
              {{ customer.userName || 'N/A' }}
            </p>
            <div class="d-flex flex-wrap gap-2">
              <span class="badge" [ngClass]="customer.iActive ? 'bg-success' : 'bg-danger'">
                <i class="pi" [ngClass]="customer.iActive ? 'pi-check-circle' : 'pi-times-circle'"></i>
                {{ (customer.iActive ? 'Active' : 'Inactive') | translate }}
              </span>
              <!-- <span class="badge bg-info">
                <i class="pi pi-calendar me-1"></i>
                {{ 'Joined' | translate }}: {{ customer.createdDate | date:'mediumDate' }}
              </span> -->
            </div>
          </div>

          <!-- Wallet Balance -->
          <div class="col-12 col-md-auto mt-3 mt-md-0">
            <div class="wallet-balance-card">
              <div class="wallet-icon">
                <i class="pi pi-wallet"></i>
              </div>
              <div>
                <p class="wallet-label mb-1">{{ 'Wallet Balance' | translate }}</p>
                <h3 class="wallet-amount mb-0">{{ walletBalance | currency: 'EGP' }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Information Cards Grid -->
    <div class="row g-3 mb-4">
      <!-- Contact Information Card -->
      <div class="col-12 col-lg-6">
        <div class="card info-card h-100">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="pi pi-phone me-2"></i>
              {{ 'Contact Information' | translate }}
            </h5>
          </div>
          <div class="card-body">
            <div class="info-item">
              <div class="info-icon">
                <i class="pi pi-envelope"></i>
              </div>
              <div class="info-content">
                <label>{{ 'Email' | translate }}</label>
                <p>{{ customer.email || 'N/A' }}</p>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">
                <i class="pi pi-mobile"></i>
              </div>
              <div class="info-content">
                <label>{{ 'Phone Number' | translate }}</label>
                <p>{{ customer.phoneNumber || 'N/A' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Personal Information Card -->
      <div class="col-12 col-lg-6">
        <div class="card info-card h-100">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="pi pi-user me-2"></i>
              {{ 'Personal Information' | translate }}
            </h5>
          </div>
          <div class="card-body">
            <div class="info-item">
              <div class="info-icon">
                <i class="pi pi-users"></i>
              </div>
              <div class="info-content">
                <label>{{ 'Gender' | translate }}</label>
                <p>{{ customer.gender || 'N/A' }}</p>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">
                <i class="pi pi-id-card"></i>
              </div>
              <div class="info-content">
                <label>{{ 'Customer ID' | translate }}</label>
                <p>#{{ customer.id }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transactions Tabs -->
    <div class="card">
      <div class="card-body p-0">
        <p-tabView styleClass="custom-tabs">
          <!-- Wallet Transactions Tab -->
          <p-tabPanel [header]="'Wallet Transactions' | translate">
            <p-table
              [value]="transactions"
              [paginator]="true"
              [rows]="rows"
              [first]="first"
              [lazy]="true"
              [loading]="isLoadingTransactions"
              [totalRecords]="totalRecords"
              [showCurrentPageReport]="true"
              (onPage)="onPageChange($event)"
              [currentPageReportTemplate]="'showingEntries' | translate"
              [rowsPerPageOptions]="[10, 25, 50]"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>{{ 'Date' | translate }}</th>
                  <th>{{ 'Type' | translate }}</th>
                  <th>{{ 'Amount In' | translate }}</th>
                  <th>{{ 'Amount Out' | translate }}</th>
                  <th>{{ 'Balance' | translate }}</th>
                  <th>{{ 'Reference' | translate }}</th>
                </tr>
              </ng-template>

              <ng-template pTemplate="body" let-transaction>
                <tr>
                  <td>{{ transaction.transactionDate | date: 'short' }}</td>
                  <td>
                    <span
                      class="badge badge-sm"
                      [ngClass]="{
                        'bg-success': transaction.amountIn > 0,
                        'bg-danger': transaction.amountOut > 0
                      }"
                    >
                      {{ transaction.transactionTypeName }}
                    </span>
                  </td>
                  <td>
                    <span *ngIf="transaction.amountIn > 0" class="text-success fw-bold">+{{ transaction.amountIn | currency: 'EGP' }}</span>
                    <span *ngIf="transaction.amountIn === 0">-</span>
                  </td>
                  <td>
                    <span *ngIf="transaction.amountOut > 0" class="text-danger fw-bold">
                      -{{ transaction.amountOut | currency: 'EGP' }}
                    </span>
                    <span *ngIf="transaction.amountOut === 0">-</span>
                  </td>
                  <td>
                    <span class="fw-bold">
                      {{ transaction.balanceAfterTransaction | currency: 'EGP' }}
                    </span>
                  </td>
                  <td>
                    <span
                      *ngIf="transaction.bookingRefernce; else noRef"
                      class="text-primary fw-bold cursor-pointer text-decoration-underline"
                      (click)="navigateToPaymentInfo(transaction.bookingRefernce)"
                      role="button"
                      [title]="'View payment details' | translate"
                    >
                      {{ transaction.bookingRefernce }}
                    </span>
                    <ng-template #noRef>-</ng-template>
                  </td>
                </tr>
              </ng-template>

              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="6" class="text-center py-4">
                    <i class="pi pi-info-circle me-2"></i>
                    {{ 'No wallet transactions found' | translate }}
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </p-tabPanel>

          <!-- Charge Transactions Tab -->
          <p-tabPanel [header]="'Charge Transactions' | translate">
            <p-table
              [value]="chargeTransactions"
              [paginator]="true"
              [rows]="chargeRows"
              [first]="chargeFirst"
              [lazy]="true"
              [loading]="isLoadingChargeTransactions"
              [totalRecords]="chargeTotalRecords"
              [showCurrentPageReport]="true"
              (onPage)="onChargePageChange($event)"
              [currentPageReportTemplate]="'showingEntries' | translate"
              [rowsPerPageOptions]="[10, 25, 50]"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>{{ 'ID' | translate }}</th>
                  <th>{{ 'Reference' | translate }}</th>
                  <th>{{ 'Status' | translate }}</th>
                  <th>{{ 'Amount to Pay' | translate }}</th>
                  <th>{{ 'Client Payed' | translate }}</th>
                  <th>{{ 'Total Tax' | translate }}</th>
                  <th>{{ 'Opay Value' | translate }}</th>
                  <th>{{ 'Opay Rate' | translate }}</th>
                  <th>{{ 'Trips Expense' | translate }}</th>
                </tr>
              </ng-template>

              <ng-template pTemplate="body" let-transaction>
                <tr>
                  <td>{{ transaction.id }}</td>

                  <td>
                    <span class="font-monospace">{{ transaction.reference }}</span>
                  </td>
                  <td>
                    <span class="badge badge-sm" [ngClass]="getStatusBadgeClass(transaction.sataus)">
                      {{ getStatusText(transaction.sataus) | translate }}
                    </span>
                  </td>
                  <td>
                    <span class="fw-bold text-primary">
                      {{ transaction.amountToPay | currency: 'EGP' }}
                    </span>
                  </td>
                  <td>
                    <span
                      class="fw-bold"
                      [ngClass]="{
                        'text-success': transaction.clientPayed >= transaction.amountToPay,
                        'text-warning': transaction.clientPayed < transaction.amountToPay && transaction.clientPayed > 0,
                        'text-danger': transaction.clientPayed === 0
                      }"
                    >
                      {{ transaction.clientPayed | currency: 'EGP' }}
                    </span>
                  </td>
                  <td>{{ transaction.totalTax | currency: 'EGP' }}</td>
                  <td>{{ transaction.opayValue | currency: 'EGP' }}</td>
                  <td>
                    <span class="text-muted small">{{ transaction.opayRate }}% ({{ transaction.opayRateAmount | currency: 'EGP' }})</span>
                  </td>
                  <td>
                    <span class="text-muted small">
                      {{ transaction.tripsOperationExpenseRate }}% ({{ transaction.tripsOperationExpenseRateAmount | currency: 'EGP' }})
                    </span>
                  </td>
                </tr>
              </ng-template>

              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="9" class="text-center py-4">
                    <i class="pi pi-info-circle me-2"></i>
                    {{ 'No charge transactions found' | translate }}
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </p-tabPanel>

          <!-- Emails Tab -->
          <p-tabPanel [header]="'Emails' | translate">
            <app-email-list [userId]="customerId!" [showSearch]="false"></app-email-list>
          </p-tabPanel>
        </p-tabView>
      </div>
    </div>

    <!-- emails tab -->
  </div>
</div>

```

---

## `src/app/demo/pages/customers/customer-detail/customer-detail.component.scss`

```scss
// Hero Card Styling
// Hero Card Styling
.hero-card {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #495057;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  .card-body {
    padding: 2rem;
  }
}

.customer-avatar-wrapper {
  position: relative;
  display: inline-block;
}

.customer-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.customer-name {
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  color: #2c3e50;
}

.customer-username {
  font-size: 1.1rem;
  opacity: 0.8;
  color: #6c757d;

  .pi {
    opacity: 0.8;
  }
}

// Wallet Balance Card
.wallet-balance-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.wallet-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 152, 0, 0.15);
  color: #f57c00;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.wallet-label {
  font-size: 0.875rem;
  opacity: 0.8;
  margin: 0;
  color: #6c757d;
}

.wallet-amount {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: #2c3e50;
}

// Information Cards
.info-card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .card-header {
    background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    color: #495057;
    border-bottom: none;
    padding: 1rem 1.5rem;

    h5 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
    }
  }

  .card-body {
    padding: 1.5rem;
  }
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
}

.info-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ffb74d 0%, #ff9800 100%);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.info-content {
  flex: 1;

  label {
    display: block;
    font-size: 0.875rem;
    color: #6c757d;
    margin-bottom: 0.25rem;
    font-weight: 500;
  }

  p {
    margin: 0;
    font-size: 1rem;
    color: #212529;
    font-weight: 500;
  }
}

// Badges
.badge {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;

  .pi {
    font-size: 0.875rem;
    margin-right: 0.25rem;
  }

  &.badge-sm {
    padding: 0.35rem 0.75rem;
    font-size: 0.75rem;
  }
}

// Cursor pointer
.cursor-pointer {
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}

// Transaction Table Improvements
::ng-deep {
  .p-datatable {
    .p-datatable-header {
      background: #f8f9fa;
      border: none;
    }

   

    .p-datatable-tbody > tr {
      transition: background-color 0.2s;

      &:hover {
        background-color: #f8f9fa;
      }
    }
  }
}

// Responsive
@media (max-width: 767px) {
  .customer-name {
    font-size: 1.5rem;
  }

  .wallet-balance-card {
    margin-top: 1rem;
  }

  .info-item {
    flex-direction: column;
    gap: 0.5rem;
  }
}

```

---

## `src/app/demo/pages/customers/customer-detail/customer-detail.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDetailComponent } from './customer-detail.component';

describe('CustomerDetailComponent', () => {
  let component: CustomerDetailComponent;
  let fixture: ComponentFixture<CustomerDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/customers/customer-detail/customer-detail.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { Icustomer } from 'src/app/shared/model/icustomer';
import { CustomerService } from 'src/app/shared/services/customer.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { environment } from 'src/environments/environment';
import { TransactionsService } from 'src/app/shared/services/transactions.service';
import { Transaction, TransactionResponse } from 'src/app/shared/model/itransaction';
import { ChargeTransaction, ChargeTransactionResponse } from 'src/app/shared/model/icharge-transaction';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { EmailListComponent } from '../../emails/email-list/email-list.component';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, EmailListComponent],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss'
})
export class CustomerDetailComponent implements OnInit {
  customer: Icustomer = {} as Icustomer;
  customerId: number | null = null;
  baseUrl = environment.imgUrl;

  // Wallet Transactions
  walletBalance: number = 0;
  transactions: Transaction[] = [];
  first = 0;
  rows = 25;
  totalRecords = 0;
  isLoadingTransactions = false;

  // Charge Transactions
  chargeTransactions: ChargeTransaction[] = [];
  chargeFirst = 0;
  chargeRows = 25;
  chargeTotalRecords = 0;
  isLoadingChargeTransactions = false;

  constructor(
    private router: Router,
    private CustomerService: CustomerService,
    private route: ActivatedRoute,
    private transactionsService: TransactionsService
  ) {}
  ngOnInit(): void {
    this.getcustomerId();
  }

  getAvatar(url?: string): string {
    const fallback = `${this.baseUrl}/Default/avatar.png`;

    if (!url || url === 'NULL') return fallback;

    if (url.startsWith('http')) return url;

    return `${this.baseUrl}${url}`;
  }

  getcustomerId() {
    this.route.params.subscribe((params) => {
      this.customerId = params['id'] ? +params['id'] : null;
      if (this.customerId) {
        this.loadCustomerData();
      }
    });
  }

  loadCustomerData() {
    if (this.customerId) {
      this.getCustomerById(this.customerId);
      this.getCustomerTransactions();
      this.getChargeTransactions();
    }
  }

  getCustomerById(id: number) {
    this.CustomerService.getCustomerById(id).subscribe({
      next: (res) => {
        console.log('Customer data:', res.data);
        this.customer = res.data;
        this.walletBalance = res.data.wallet.currentBalance || 0;
      },
      error: (err) => {
        console.error('Error fetching customer:', err);
      }
    });
  }

  getCustomerTransactions() {
    if (!this.customerId) return;

    this.isLoadingTransactions = true;
    const filterMap: FilterMap = {
      pageIndex: this.first / this.rows + 1,
      pageSize: this.rows,
      search: '',
      UserId: this.customerId
    };

    this.transactionsService.getTransactions(filterMap).subscribe({
      next: (res: TransactionResponse) => {
        this.transactions = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.isLoadingTransactions = false;
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
        this.isLoadingTransactions = false;
      }
    });
  }

  getChargeTransactions() {
    if (!this.customerId) return;

    this.isLoadingChargeTransactions = true;
    const filterMap: FilterMap = {
      pageIndex: this.chargeFirst / this.chargeRows + 1,
      pageSize: this.chargeRows,
      search: '',
      UserId: this.customerId
    };

    this.transactionsService.getWalletChargeTransaction(filterMap).subscribe({
      next: (res: ChargeTransactionResponse) => {
        this.chargeTransactions = res.data.data;
        this.chargeTotalRecords = res.data.itemsCount;
        this.isLoadingChargeTransactions = false;
      },
      error: (err) => {
        console.error('Error fetching charge transactions:', err);
        this.isLoadingChargeTransactions = false;
      }
    });
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.getCustomerTransactions();
  }

  onChargePageChange(event: any) {
    this.chargeFirst = event.first;
    this.chargeRows = event.rows;
    this.getChargeTransactions();
  }

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'edit':
        this.editProduct();
        break;
    }
  }

  editProduct() {
    this.router.navigate(['/customer-form'], { queryParams: { id: this.customerId } });
  }

  navigateToPaymentInfo(bookingReference: string | undefined) {
    if (bookingReference) {
      this.router.navigate(['/payment-info-ref', bookingReference]);
    }
  }

  // Helper methods for Charge Transactions
  getStatusBadgeClass(status: number): string {
    switch (status) {
      case 1:
        return 'bg-danger'; // Cancelled
      case 2:
        return 'bg-warning'; // Pending
      case 3:
        return 'bg-success'; // Success
      default:
        return 'bg-secondary';
    }
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1:
        return 'Cancelled';
      case 2:
        return 'Pending';
      case 3:
        return 'Success';
      default:
        return 'Unknown';
    }
  }
}

```

---

## `src/app/demo/pages/customers/customer-dialog/customer-dialog.component.html`

```html
<div class="customer-profile-container">
  <div class="card profile-card">
    <div class="card-body p-0">
      <!-- Header Section -->
      <div class="profile-header text-center p-4">
        <div class="profile-image-wrapper mb-3">
          <img
            [src]="getAvatar(data?.imageUrl)"
            alt="User Image"
            class="profile-image"
            referrerpolicy="no-referrer" 
          />
        </div>
        <h3 class="mb-1">{{ data?.name }}</h3>
        <p class="text-muted mb-2">{{ '@' + data?.userName }}</p>
        <span class="badge" [ngClass]="data?.iActive ? 'bg-success' : 'bg-danger'">
          {{ (data?.iActive ? 'Active' : 'Inactive') | translate }}
        </span>
      </div>

      <hr class="m-0" />

      <!-- Details Section -->
      <div class="profile-details p-4">
        <h5 class="mb-4 text-muted text-uppercase text-xs font-weight-bolder spacing-wide">
          {{ 'Contact Information' | translate }}
        </h5>

        <div class="row g-4">
          <!-- Email -->
          <div class="col-md-6">
            <div class="detail-item d-flex align-items-center">
              <div class="icon-box bg-light-primary text-primary me-3">
                <i class="pi pi-envelope"></i>
              </div>
              <div class="detail-content">
                <small class="text-muted d-block mb-1">{{ 'Email Address' | translate }}</small>
                <span class="fw-bold text-dark">{{ data?.email || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- Phone -->
          <div class="col-md-6">
            <div class="detail-item d-flex align-items-center">
              <div class="icon-box bg-light-info text-info me-3">
                <i class="pi pi-phone"></i>
              </div>
              <div class="detail-content">
                <small class="text-muted d-block mb-1">{{ 'Phone Number' | translate }}</small>
                <span class="fw-bold text-dark">{{ data?.phoneNumber || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- Nationality -->
          <div class="col-md-6">
            <div class="detail-item d-flex align-items-center">
              <div class="icon-box bg-light-warning text-warning me-3">
                <i class="pi pi-flag"></i>
              </div>
              <div class="detail-content">
                <small class="text-muted d-block mb-1">{{ 'Nationality' | translate }}</small>
                <span class="fw-bold text-dark">{{ data?.nationality || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- Device Token (Optional/Truncated) -->
          <!-- <div class="col-md-6" *ngIf="data?.deviceToken">
            <div class="detail-item d-flex align-items-center">
              <div class="icon-box bg-light-secondary text-secondary me-3">
                <i class="pi pi-mobile"></i>
              </div>
              <div class="detail-content">
                <small class="text-muted d-block mb-1">{{ 'Device Token' | translate }}</small>
                <span class="fw-bold text-dark text-truncate d-block" style="max-width: 200px" [pTooltip]="data?.deviceToken">
                  {{ data?.deviceToken }}
                </span>
              </div>
            </div>
          </div> -->

          <!-- ID -->
          <div class="col-md-6">
            <div class="detail-item d-flex align-items-center">
              <div class="icon-box bg-light-success text-success me-3">
                <i class="pi pi-id-card"></i>
              </div>
              <div class="detail-content">
                <small class="text-muted d-block mb-1">{{ 'Customer ID' | translate }}</small>
                <span class="fw-bold text-dark">#{{ data?.id }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

```

---

## `src/app/demo/pages/customers/customer-dialog/customer-dialog.component.scss`

```scss
.customer-profile-container {
  min-width: 500px;

  @media (max-width: 768px) {
    min-width: 100%;
  }
}

.profile-card {
  border: none;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  border-radius: 1rem;
  overflow: hidden;

  .profile-header {
    background: linear-gradient(to bottom, #f8f9fa, #ffffff);

    .profile-image-wrapper {
      position: relative;
      width: 120px;
      height: 120px;
      margin: 0 auto;

      .profile-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        border: 4px solid #fff;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }
    }

    h3 {
      font-weight: 700;
      color: #2c3e50;
    }

    .badge {
      padding: 0.5em 1em;
      border-radius: 20px;
      font-weight: 500;
      font-size: 0.85rem;
    }
  }

  .profile-details {
    .spacing-wide {
      letter-spacing: 1px;
      font-size: 0.75rem;
    }

    .icon-box {
      width: 45px;
      height: 45px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      transition: all 0.3s ease;

      &.bg-light-primary {
        background-color: rgba(13, 110, 253, 0.1);
      }
      &.bg-light-info {
        background-color: rgba(13, 202, 240, 0.1);
      }
      &.bg-light-warning {
        background-color: rgba(255, 193, 7, 0.1);
      }
      &.bg-light-secondary {
        background-color: rgba(108, 117, 125, 0.1);
      }
      &.bg-light-success {
        background-color: rgba(25, 135, 84, 0.1);
      }
    }

    .detail-item {
      padding: 10px;
      border-radius: 10px;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f8f9fa;

        .icon-box {
          transform: scale(1.05);
        }
      }
    }
  }
}

```

---

## `src/app/demo/pages/customers/customer-dialog/customer-dialog.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDialogComponent } from './customer-dialog.component';

describe('CustomerDialogComponent', () => {
  let component: CustomerDialogComponent;
  let fixture: ComponentFixture<CustomerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/customers/customer-dialog/customer-dialog.component.ts`

```ts
import { Component, Input } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { environment } from 'src/environments/environment';
export interface user {
  deviceToken: string
  imageUrl: string
  iActive: boolean
  id: number
  name: string
  email: string
  userName: string
  phoneNumber: string
  nationality: any
}

@Component({
  selector: 'app-customer-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './customer-dialog.component.html',
  styleUrl: './customer-dialog.component.scss'
})
export class CustomerDialogComponent {
  data: user;
  baseImgUrl = environment.imgUrl;
 constructor(public config: DynamicDialogConfig) {}


  ngOnInit() {
    this.data = this.config.data; 

  }

  getAvatar(url?: string): string {
    const fallback = `${this.baseImgUrl}/Default/avatar.png`;

    if (!url || url === 'NULL') return fallback;

    if (url.startsWith('http')) return url;

    return `${this.baseImgUrl}${url}`;
  }









}

```

---

## `src/app/demo/pages/customers/customers-form/customers-form.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="customerId ? ('Edit Customer' | translate) : ('Add Customer' | translate)"
    [mainSection]="'Customers' | translate"
    [subSection]="customerId ? ('Edit' | translate) : ('Add' | translate)"
  ></sub-header>

  <div class="product-form shadow-3 p-4">
    <!-- Discount Section -->

    <div class="formgrid grid">
      <div class="field col-12 col-md-6">
        <label for="lastname2">
          {{ 'Username' | translate }}
          <small class="text-danger">*</small>
        </label>
        <input
          id="lastname2"
          type="text"
          class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
        />
        <small class="error">{{ 'This field is required' | translate }}</small>
      </div>
      <div class="field col-12 col-md-6">
        <label for="lastname2">
          {{ 'Email' | translate }}
          <small class="text-danger">*</small>
        </label>
        <input
          id="lastname2"
          type="text"
          class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
        />
        <small class="error">{{ 'This field is required' | translate }}</small>
      </div>
      <div class="field col-12 col-md-6">
        <label for="lastname2">
          {{ 'Phone Number' | translate }}
          <small class="text-danger">*</small>
        </label>
        <input
          id="lastname2"
          type="text"
          class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"
        />
        <small class="error">{{ 'This field is required' | translate }}</small>
      </div>
      <div class="field col">
        <label for="password">
          {{ 'Password' | translate }}
          <small class="text-danger">*</small>
        </label>
        <p-password #passwordField id="password" class="w-full" [toggleMask]="true" />
        <!-- <input id="firstname2" type="text" class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full"> -->
        <small class="error">{{ 'This field is required' | translate }}</small>
      </div>
    </div>

    <!-- Buttons -->
    <div class="buttons mt-3 text-end">
      <p-button label="{{ 'Cancel' | translate }}" class="mx-1" severity="secondary"></p-button>
      <p-button label="{{ 'save' | translate }}" severity="success" icon="pi pi-save"></p-button>
    </div>
  </div>
</div>

```

---

## `src/app/demo/pages/customers/customers-form/customers-form.component.scss`

```scss

```

---

## `src/app/demo/pages/customers/customers-form/customers-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersFormComponent } from './customers-form.component';

describe('CustomersFormComponent', () => {
  let component: CustomersFormComponent;
  let fixture: ComponentFixture<CustomersFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomersFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/customers/customers-form/customers-form.component.ts`

```ts
import { Component } from '@angular/core';
import { SubHeaderComponent } from "../../../../shared/components/sub-header/sub-header.component";
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-customers-form',
  standalone: true,
  imports: [SubHeaderComponent,SharedModule],
  templateUrl: './customers-form.component.html',
  styleUrl: './customers-form.component.scss'
})
export class CustomersFormComponent {
  customerId:number | null = 5;

  constructor(private route :ActivatedRoute, private router: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {

      this.customerId = params['id'];


    });
  }
}

```

---

## `src/app/demo/pages/customers/customers-list/customers-list.component.html`

```html
<div class="card">
  <p-toolbar styleClass="mb-4">
    <ng-template pTemplate="left">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText type="text" [(ngModel)]="searchTerm" (input)="search()" [placeholder]="'search' | translate" />
      </span>
    </ng-template>
  </p-toolbar>
  <p-table
    #dt
    [value]="customers"
    [paginator]="true"
    [rows]="10"
    [lazy]="true"
    (onLazyLoad)="loadCustomers($event)"
    [totalRecords]="totalRecords"
    [loading]="loading"
    [showCurrentPageReport]="true"
    [rowsPerPageOptions]="[10, 25, 50]"
    [currentPageReportTemplate]="'showingEntries' | translate"
    [globalFilterFields]="['name', 'email', 'phoneNumber']"
  >
    <ng-template pTemplate="header">
      <tr>
        <th pSortableColumn="name">
          {{ 'name' | translate }}
          <p-sortIcon field="name"></p-sortIcon>
        </th>
        <th pSortableColumn="email">
          {{ 'email' | translate }}
          <p-sortIcon field="email"></p-sortIcon>
        </th>
        <th pSortableColumn="phoneNumber">
          {{ 'phoneNumber' | translate }}
          <p-sortIcon field="phoneNumber"></p-sortIcon>
        </th>
        <th pSortableColumn="iActive">
          {{ 'status' | translate }}
          <p-sortIcon field="iActive"></p-sortIcon>
        </th>
        <th pSortableColumn="wallet.currentBalance">{{ 'current balance' | translate }}
          <p-sortIcon field="wallet.currentBalance"></p-sortIcon>

        </th>
        <th>{{ 'actions' | translate }}</th>
      </tr>
      <tr>
        <th>
          <p-columnFilter type="text" field="FirstName" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="email" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="phoneNumber" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
        </th>
        <th>
          <p-columnFilter type="text" field="wallet.currentBalance" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th></th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-customer>
      <tr>
        <td>{{ customer.name }}</td>
        <td>{{ customer.email }}</td>
        <td>{{ customer.phoneNumber }}</td>
        <td>
          <p-inputSwitch [(ngModel)]="customer.iActive" (onChange)="toggleCustomerStatus(customer)"></p-inputSwitch>
        </td>
        <td>{{ customer.wallet?.currentBalance ? customer.wallet.currentBalance : '--' }}</td>
        <td>
          <div class="flex gap-1 justify-content-center">
            <p-button
              [title]="'view' | translate"
              icon="pi pi-eye"
              severity="info"
              [rounded]="true"
              [text]="true"
              [routerLink]="['/customer-details', customer.id]"
            ></p-button>
          </div>
        </td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="6">
          <div class="flex flex-column justify-content-center align-items-center py-5 w-full">
            <i class="pi pi-inbox" style="font-size: 3rem; color: var(--gray-400)"></i>
            <span class="mt-2 text-gray-500 font-medium">{{ 'No Data found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/customers/customers-list/customers-list.component.scss`

```scss
.no-wrap {
  white-space: nowrap; /* Prevents text from wrapping */
  overflow: hidden; /* Hides overflowed text */
  text-overflow: ellipsis; /* Adds ellipsis for truncated text */
  max-width: 150px; /* Adjust this value based on your design */
}

::ng-deep .p-splitbutton {
  border-radius: 1.5rem !important; // يخليه rounded
  font-size: 0.8rem !important; // يصغره
  height: 2.2rem !important; // تصغير الارتفاع لو حبيت
}

::ng-deep .p-splitbutton .p-button {
  padding: 0.3rem 0.6rem !important; // تصغير البادينج الداخلي
  min-width: unset !important;
}

::ng-deep .p-splitbutton .p-splitbutton-menubutton {
  padding: 0.3rem 0.5rem !important;
}
::ng-deep .p-menuitem {
  cursor: pointer;
  
}

::ng-deep .p-menuitem:hover {
  background-color: #e0e0e0 !important; // لون أغمق شوية عند hover
}

::ng-deep .p-menuitem-link:hover {
  background-color: #d0d0d0 !important; // لو عايز التأثير يظهر على اللينك كله
}
/* إخفاء الزر الافتراضي في SplitButton */
::ng-deep .no-default-button .p-splitbutton-defaultbutton {
  display: none !important;
}

/* تعديل المظهر ليكون أنيقًا */
::ng-deep .no-default-button .p-splitbutton-menubutton {
  border-top-left-radius: 6px !important;
  border-bottom-left-radius: 6px !important;
}

// للتأكد من أن المسافة تظهر بشكل صحيح
::ng-deep .p-menuitem-link {
  display: flex !important;
  align-items: center !important;
  gap: 0.75rem !important;
}
// Table styling
:host ::ng-deep .p-datatable-table {
  width: 100%;
}

// Align table headings to left
:host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
  text-align: left !important;
}

// Compact filter row styling
:host ::ng-deep .p-datatable .p-datatable-thead > tr:nth-child(2) > th {
  padding: 0.25rem 0.5rem !important;
  background: #f8f9fa;
}

:host ::ng-deep .p-datatable .p-column-filter-row {
  padding: 0 !important;
}
:host ::ng-deep .p-datatable .p-column-filter-element {
  width: 100%;
}

:host ::ng-deep .p-datatable .p-column-filter-row .p-inputtext {
  padding: 0.35rem 0.5rem !important;
  font-size: 13px;
}

:host ::ng-deep .p-datatable .p-column-filter-row .p-column-filter-menu-button,
:host ::ng-deep .p-datatable .p-column-filter-row .p-column-filter-clear-button {
  width: 1.75rem !important;
  height: 1.75rem !important;
}

// Hide increase/decrease spinner buttons on numeric filters
:host ::ng-deep .p-datatable .p-inputnumber-button-group {
  display: none !important;
}

:host ::ng-deep .p-datatable .p-inputnumber-buttons-stacked .p-inputnumber-input {
  border-radius: 6px !important;
}

```

---

## `src/app/demo/pages/customers/customers-list/customers-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersListComponent } from './customers-list.component';

describe('CustomersListComponent', () => {
  let component: CustomersListComponent;
  let fixture: ComponentFixture<CustomersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/customers/customers-list/customers-list.component.ts`

```ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CustomerService } from 'src/app/shared/services/customer.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';
import { Table, TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.scss'
})
export class CustomersListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  constructor(
    private CustomerService: CustomerService,
    private ToastrService: ToastrService
  ) {}
  customers: any[] = [];
  totalRecords = 0;
  loading: boolean = false;
  searchTerm: string = '';

  ngOnInit(): void {
    // Initial load is handled by the table's lazy load event
  }

  loadCustomers(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this.CustomerService.getAllCustomers(payload).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.customers = res.data.data;
          this.totalRecords = res.data.itemsCount;
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching customers:', err);
        this.loading = false;
      }
    });
  }

  // Helper for search to reset table
  search() {
    this.dt.reset();
  }

  toggleCustomerStatus(customer: any) {
    const updatedStatus = {
      id: customer.id,
      iActive: !customer.iActive
    };

    this.CustomerService.updateCustomerStatus(updatedStatus).subscribe({
      next: () => {
        this.ToastrService.success('Customer status updated successfully');
      },
      error: (err) => {
        this.ToastrService.error('Error updating customer status');
        console.error('Error updating customer status:', err);
      }
    });
  }
}

```

---

## `src/app/demo/pages/customers/customers.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'customers' | translate"
  ></sub-header>
  <app-customers-list></app-customers-list>
</div>

```

---

## `src/app/demo/pages/customers/customers.component.scss`

```scss

```

---

## `src/app/demo/pages/customers/customers.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersComponent } from './customers.component';

describe('CustomersComponent', () => {
  let component: CustomersComponent;
  let fixture: ComponentFixture<CustomersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/customers/customers.component.ts`

```ts
import { Component } from '@angular/core';
import { SubHeaderComponent } from "../../../shared/components/sub-header/sub-header.component";
import { CustomersListComponent } from "./customers-list/customers-list.component";
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [SubHeaderComponent, CustomersListComponent , SharedModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent {

}

```

---

## `src/app/demo/pages/emails/email-details/email-details.component.html`

```html
<div class="main">
  <p-confirmDialog></p-confirmDialog>

  <!-- Header with Back Button and Resend -->
  <sub-header [mainHeader]="'email details' | translate" [mainSection]="'emails' | translate" [subSection]="emailDetail?.name"></sub-header>

  <!-- Loading State -->
  <div *ngIf="loading" class="loading-container">
    <p-progressSpinner></p-progressSpinner>
  </div>

  <!-- Email Details -->
  <div *ngIf="!loading && emailDetail" class="email-container">
    <!-- Email Information - Simplified -->
    <div class="email-info-simple">
      <div class="email-title">
        <h3>{{ emailDetail.name }}</h3>
        <span class="email-address">{{ emailDetail.email }}</span>
      </div>
      <div class="info-badge-group">
        <span class="info-label">{{ 'purpose' | translate }}:</span>
        <p-tag
          icon="pi pi-tag"
          [value]="getPurposeName(emailDetail.purpose) | translate"
          [severity]="getPurposeSeverity(emailDetail.purpose)"
        ></p-tag>

        <span class="info-label">{{ 'status' | translate }}:</span>
        <p-tag
          [icon]="emailDetail.isSend ? 'pi pi-check-circle' : 'pi pi-times-circle'"
          [value]="emailDetail.isSend ? ('sent' | translate) : ('failed' | translate)"
          [severity]="emailDetail.isSend ? 'success' : 'danger'"
        ></p-tag>
      </div>
    </div>
    <!-- button of resend email -->
    <div class="details-header">
      <button
        pButton
        pRipple
        type="button"
        [label]="'resend_email' | translate"
        icon="pi pi-send"
        (click)="resendEmail()"
        class="p-button-primary"
      ></button>
    </div>

    <!-- Tabs for Content and Tracking -->
    <p-tabView styleClass="details-tabs">
      <!-- Email Content Tab -->
      <p-tabPanel [header]="'email_content' | translate">
        <div class="email-content-container">
          <iframe *ngIf="emailBlobUrl" class="email-iframe" [src]="emailBlobUrl" frameborder="0"></iframe>
          <p *ngIf="!emailBlobUrl" class="no-content">
            {{ 'no_email_content' | translate }}
          </p>
        </div>
      </p-tabPanel>

      <!-- Tracking History Tab -->
      <p-tabPanel [header]="'tracking_history' | translate">
        <div *ngIf="trackersLoading" class="loading-container">
          <p-progressSpinner></p-progressSpinner>
        </div>

        <div *ngIf="!trackersLoading && trackers.length === 0" class="empty-state">
          <i class="pi pi-info-circle" style="font-size: 3rem; color: #9ca3af"></i>
          <p>{{ 'no_tracking_history' | translate }}</p>
        </div>

        <p-timeline *ngIf="!trackersLoading && trackers.length > 0" [value]="trackers" align="left">
          <ng-template pTemplate="marker" let-tracker>
            <span class="tracker-marker" [ngClass]="getStatusClass(tracker)">
              <i [class]="getStatusIcon(tracker)"></i>
            </span>
          </ng-template>

          <ng-template pTemplate="content" let-tracker>
            <p-card styleClass="tracker-card mb-3">
              <div class="tracker-content">
                <div class="tracker-header">
                  <h4>{{ getStatusText(tracker) }}</h4>
                  <p-tag [value]="getStatusText(tracker)" [severity]="getStatusSeverity(tracker)"></p-tag>
                </div>
                <div class="tracker-meta">
                  <span>
                    <i class="pi pi-calendar"></i>
                    {{ tracker.dateCreated | date: 'medium' }}
                  </span>
                  <span *ngIf="tracker.fromEmail">
                    <i class="pi pi-envelope"></i>
                    {{ tracker.fromEmail }}
                  </span>
                  <span>
                    <i class="pi pi-send"></i>
                    {{ tracker.toEmail }}
                  </span>
                </div>
                <button
                  *ngIf="tracker.context"
                  pButton
                  [label]="'view_snapshot' | translate"
                  icon="pi pi-eye"
                  (click)="viewSnapshot(tracker)"
                  class="p-button-text p-button-sm view-snapshot-btn"
                ></button>
              </div>
            </p-card>
          </ng-template>
        </p-timeline>
      </p-tabPanel>
    </p-tabView>
  </div>
</div>

```

---

## `src/app/demo/pages/emails/email-details/email-details.component.scss`

```scss
.details-header {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.email-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

// Email Information - Simplified
.email-info-simple {
  background: #ffffff;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  border: 1px solid #e5e7eb;
  margin-bottom: 0.5rem;
}

.email-title {
  margin-bottom: 1rem;

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  .email-address {
    font-size: 0.9375rem;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    
  }
}

.info-badge-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

// Tabs
.details-tabs {
  ::ng-deep {
    .p-tabview-nav {
      background: #ffffff;
      border-bottom: 2px solid #e5e7eb;
    }

    .p-tabview-panels {
      background: #ffffff;
      padding: 1.5rem;
      border-radius: 0 0 8px 8px;
    }
  }
}

// Email Content
.email-content-container {
  min-height: 1200px;
}

.email-iframe {
  width: 100%;
  min-height: 1200px;
  height: calc(75vh - 200px);
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: #ffffff;
}

.no-content {
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
  font-style: italic;
}

// Empty State
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
  gap: 1rem;
}

// Timeline
::ng-deep {
  .p-timeline {
    .p-timeline-event-opposite {
      display: none;
    }

    .p-timeline-event-content {
      width: 100%;
    }
  }
}

.tracker-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  font-size: 1.25rem;

  &.status-success {
    background-color: #d1fae5;
    color: #047857;
  }

  &.status-warning {
    background-color: #fef3c7;
    color: #d97706;
  }

  &.status-danger {
    background-color: #fee2e2;
    color: #dc2626;
  }
}

.tracker-card {
  ::ng-deep .p-card-body {
    padding: 1rem;
  }
}

.tracker-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tracker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
  }
}

.tracker-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;

  span {
    display: flex;
    align-items: center;
    gap: 0.375rem;

    i {
      font-size: 0.875rem;
      color: #9ca3af;
    }
  }
}

.view-snapshot-btn {
  align-self: flex-start;
  margin-top: 0.5rem;
}

// Responsive
@media (max-width: 768px) {
  .email-info-grid {
    grid-template-columns: 1fr;
  }

  .details-header {
    justify-content: stretch;

    button {
      width: 100%;
    }
  }
}

```

---

## `src/app/demo/pages/emails/email-details/email-details.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailDetailsComponent } from './email-details.component';

describe('EmailDetailsComponent', () => {
  let component: EmailDetailsComponent;
  let fixture: ComponentFixture<EmailDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/emails/email-details/email-details.component.ts`

```ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { EmailsService } from 'src/app/shared/services/emails.service';
import { EmailDetail } from 'src/app/shared/model/iemail-detail';
import { EmailTracker } from 'src/app/shared/model/iemails-trackers';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { ToastrService } from 'ngx-toastr';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { EmailPreviewDialogComponent } from '../email-preview-dialog/email-preview-dialog.component';

@Component({
  selector: 'app-email-details',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  providers: [DialogService, ConfirmationService],
  templateUrl: './email-details.component.html',
  styleUrl: './email-details.component.scss'
})
export class EmailDetailsComponent implements OnInit, OnDestroy {
  emailId!: number;
  emailDetail: EmailDetail | null = null;
  trackers: EmailTracker[] = [];
  loading: boolean = false;
  trackersLoading: boolean = false;
  emailBlobUrl: SafeResourceUrl | null = null;
  private blobUrl: string | null = null;
  ref: DynamicDialogRef | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private emailsService: EmailsService,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.emailId = +this.route.snapshot.paramMap.get('id')!;
    this.loadEmailDetail();
    this.loadTrackers();
  }

  loadEmailDetail(): void {
    this.loading = true;
    this.emailsService.GetSendEmailLogByIdAsync(this.emailId).subscribe({
      next: (response) => {
        if (response.success) {
          this.emailDetail = response.data;
          // Create blob URL for email content
          if (this.emailDetail?.handlebars || this.emailDetail?.context) {
            const htmlContent = this.emailDetail.handlebars || this.emailDetail.context;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            this.blobUrl = URL.createObjectURL(blob);
            this.emailBlobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl);
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading email details:', error);
        this.toastr.error('Failed to load email details');
        this.loading = false;
      }
    });
  }

  loadTrackers(): void {
    this.trackersLoading = true;
    const filter: FilterMap = {
      LogId: this.emailId,
      pageIndex: 1,
      pageSize: 100
    };

    this.emailsService.getAllEmailsTrackers(filter).subscribe({
      next: (response) => {
        if (response.success) {
          this.trackers = response.data.data;
        }
        this.trackersLoading = false;
      },
      error: (error) => {
        console.error('Error loading trackers:', error);
        this.toastr.error('Failed to load tracking history');
        this.trackersLoading = false;
      }
    });
  }

  getStatusText(tracker: EmailTracker): string {
    if (tracker.isSend) return 'Sent';
    if (tracker.isExpired) return 'Expired';
    return 'Failed';
  }

  getStatusSeverity(tracker: EmailTracker): 'success' | 'warning' | 'danger' {
    if (tracker.isSend) return 'success';
    if (tracker.isExpired) return 'warning';
    return 'danger';
  }

  getStatusIcon(tracker: EmailTracker): string {
    if (tracker.isSend) return 'pi pi-check-circle';
    if (tracker.isExpired) return 'pi pi-exclamation-triangle';
    return 'pi pi-times-circle';
  }

  getStatusClass(tracker: EmailTracker): string {
    if (tracker.isSend) return 'status-success';
    if (tracker.isExpired) return 'status-warning';
    return 'status-danger';
  }

  getPurposeName(purpose: number): string {
    const purposes: { [key: number]: string } = {
      0: 'invalid',
      1: 'registration',
      2: 'forgot_password',
      3: 'promotion',
      4: 'reservation_email'
    };
    return purposes[purpose] || 'unknown';
  }

  getPurposeSeverity(purpose: number): 'success' | 'warning' | 'info' | 'danger' | 'secondary' {
    const severities: { [key: number]: 'success' | 'warning' | 'info' | 'danger' | 'secondary' } = {
      0: 'danger', // Invalid
      1: 'success', // Registration
      2: 'warning', // Forgot Password
      3: 'info', // Promotion
      4: 'secondary' // Reservation
    };
    return severities[purpose] || 'info';
  }

  viewSnapshot(tracker: EmailTracker): void {
    this.ref = this.dialogService.open(EmailPreviewDialogComponent, {
      header: 'Tracker Snapshot',
      width: '70%',
      height: '85vh',
      contentStyle: { overflow: 'auto', padding: '0' },
      baseZIndex: 10000,
      maximizable: true,
      data: {
        name: `Tracker #${tracker.id}`,
        email: tracker.toEmail,
        purpose: tracker.purpose,
        purposeName: this.getPurposeName(tracker.purpose),
        handlebars: tracker.context
      }
    });
  }

  resendEmail(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to resend this email?',
      header: 'Confirm Resend',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-success m-2',
      rejectButtonStyleClass: 'p-button-danger m-2',
      accept: () => {
        this.emailsService.sendEmail(this.emailId).subscribe({
          next: (response) => {
            if (response.success) {
              this.toastr.success('Email resent successfully!');
              // Reload email details and trackers to update status
              this.loadEmailDetail();
              this.loadTrackers();
            } else {
              this.toastr.error('Failed to resend email');
            }
          },
          error: (error) => {
            console.error('Error resending email:', error);
            this.toastr.error('Failed to resend email');
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/emails']);
  }

  ngOnDestroy(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
    }
  }
}

```

---

## `src/app/demo/pages/emails/email-list/email-list.component.html`

```html
<div class="card">
  <p-toolbar *ngIf="showSearch" styleClass="">
    <ng-template pTemplate="left">
      <span class="p-input-icon-left">
        <input pInputText type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'search' | translate" />
      </span>
    </ng-template>
  </p-toolbar>

  <p-table
    #dt
    [value]="emails"
    [loading]="loading"
    [paginator]="true"
    [rows]="10"
    [totalRecords]="totalRecords"
    [lazy]="true"
    (onLazyLoad)="loadEmails($event)"
    [showCurrentPageReport]="true"
    [currentPageReportTemplate]="'showingEntries' | translate"
    [rowsPerPageOptions]="[10, 25, 50]"
    styleClass="p-datatable-gridlines"
    [tableStyle]="{ 'min-width': '50rem' }"
  >
    <ng-template pTemplate="header">
      <tr>
        <th pSortableColumn="id" style="width: 80px">
          {{ 'id' | translate }}
          <p-sortIcon field="id"></p-sortIcon>
        </th>
        <th pSortableColumn="name">
          {{ 'name' | translate }}
          <p-sortIcon field="name"></p-sortIcon>
        </th>
        <th pSortableColumn="email">
          {{ 'email' | translate }}
          <p-sortIcon field="email"></p-sortIcon>
        </th>
        <th pSortableColumn="purpose">
          {{ 'purpose' | translate }}
          <p-sortIcon field="purpose"></p-sortIcon>
        </th>
        <th style="width: 200px">{{ 'content' | translate }}</th>
        <th pSortableColumn="isSend" style="width: 100px; text-align: center">
          {{ 'status' | translate }}
          <p-sortIcon field="isSend"></p-sortIcon>
        </th>
        <th pSortableColumn="createdDate" style="width: 150px; text-align: center">
          {{ 'createdDate' | translate }}
          <p-sortIcon field="createdDate"></p-sortIcon>
        </th>
        <th style="width: 120px; text-align: center">{{ 'actions' | translate }}</th>
      </tr>
      <tr>
        <th>
          <p-columnFilter type="text" field="id" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="name" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="email" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="purpose" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th></th>
        <th>
          <p-columnFilter type="boolean" field="isSend" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="date" field="createdDate" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th></th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-email>
      <tr>
        <td>{{ email.id }}</td>
        <td>{{ email.name }}</td>
        <td>{{ email.email }}</td>

        <td>
          <p-tag [value]="getPurposeName(email.purpose) | translate" [severity]="getPurposeSeverity(email.purpose)"></p-tag>
        </td>
        <td>
          <span [title]="email.handlebars" class="template-preview clickable" (click)="showEmailPreview(email)">
            {{ 'click to preview' | translate }}
          </span>
        </td>
        <td style="text-align: center">
          <i
            [class]="email.isSend ? 'pi pi-check-circle text-success' : 'pi pi-times-circle text-danger'"
            [title]="email.isSend ? 'Sent' : 'Not Sent'"
            style="font-size: 1.2rem"
          ></i>
        </td>
        <td style="text-align: center">
          {{ email.createdDate | date: 'dd/MM/yyyy' }}
        </td>
        <td style="text-align: center">
          <button
            pButton
            pRipple
            type="button"
            severity="info"
            [raised]="true"
            [rounded]="true"
            icon="pi pi-eye"
            (click)="viewEmailDetails(email.id)"
            [pTooltip]="'view details' | translate"
            tooltipPosition="top"
          ></button>
        </td>
      </tr>
    </ng-template>

    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="8" style="text-align: center">
          {{ 'no_data_found' | translate }}
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/emails/email-list/email-list.component.scss`

```scss
.search-container {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.template-preview {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  cursor: help;

  &.clickable {
    cursor: pointer;
    color: #0066cc;
    text-decoration: underline;

    &:hover {
      color: #004499;
    }
  }
}

.text-success {
  color: #22c55e;
}

.text-danger {
  color: #ef4444;
}

::ng-deep {
  .p-datatable {
    .p-datatable-thead > tr > th {
      background-color: #f8f9fa;
      font-weight: 600;
    }

    .p-datatable-tbody > tr {
      &:hover {
        background-color: #f1f5f9;
      }
    }
  }
}

```

---

## `src/app/demo/pages/emails/email-list/email-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailListComponent } from './email-list.component';

describe('EmailListComponent', () => {
  let component: EmailListComponent;
  let fixture: ComponentFixture<EmailListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/emails/email-list/email-list.component.ts`

```ts
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { EmailsService } from 'src/app/shared/services/emails.service';
import { Daum } from 'src/app/shared/model/iemails';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EmailPreviewDialogComponent } from '../email-preview-dialog/email-preview-dialog.component';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-email-list',
  standalone: true,
  imports: [SharedModule],
  providers: [DialogService],
  templateUrl: './email-list.component.html',
  styleUrl: './email-list.component.scss'
})
export class EmailListComponent implements OnInit {
  @Input() userId?: number; // Optional userId filter for customer details page
  @Input() showSearch: boolean = true; // Show/hide search bar
  @ViewChild('dt') dt: Table;

  emails: Daum[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  searchTerm: string = '';
  ref: DynamicDialogRef | undefined;

  constructor(
    private emailsService: EmailsService,
    private router: Router,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {}

  loadEmails(event: TableLazyLoadEvent): void {
    this.loading = true;
    const payload: any = TableRequestBuilder.build(event, this.searchTerm);

    if (this.userId) {
      payload.UserId = this.userId;
    }

    this.emailsService.getAllEmails(payload).subscribe({
      next: (response) => {
        if (response.success) {
          this.emails = response.data.data;
          this.totalRecords = response.data.itemsCount;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching emails:', error);
        this.loading = false;
      }
    });
  }

  onSearch(event?: any): void {
    this.dt.reset();
  }

  refresh() {
    this.dt.reset();
  }

  showEmailPreview(email: Daum): void {
    this.ref = this.dialogService.open(EmailPreviewDialogComponent, {
      header: 'Email Preview',
      width: '70%',
      height: '85vh',
      contentStyle: { overflow: 'auto', padding: '0' },
      baseZIndex: 10000,
      maximizable: true,
      data: {
        name: email.name,
        email: email.email,
        purpose: email.purpose,
        purposeName: this.getPurposeName(email.purpose),
        template: email.template,
        handlebars: email.handlebars
      }
    });
  }

  viewEmailDetails(emailId: number): void {
    this.router.navigate(['/email-details', emailId]);
  }

  getPurposeName(purpose: number): string {
    const purposes: { [key: number]: string } = {
      0: 'invalid',
      1: 'registration',
      2: 'forgot_password',
      3: 'promotion',
      4: 'reservation_email'
    };
    return purposes[purpose] || 'unknown';
  }

  getPurposeSeverity(purpose: number): 'success' | 'warning' | 'info' | 'danger' | 'secondary' {
    const severities: { [key: number]: 'success' | 'warning' | 'info' | 'danger' | 'secondary' } = {
      0: 'danger', // Invalid
      1: 'success', // Registration
      2: 'warning', // Forgot Password
      3: 'info', // Promotion
      4: 'secondary' // Reservation
    };
    return severities[purpose] || 'info';
  }
}

```

---

## `src/app/demo/pages/emails/email-preview-dialog/email-preview-dialog.component.html`

```html
<div class="email-preview-container">
  <div class="email-header">
    <h3>{{ emailData?.name }}</h3>
    <div class="email-meta">
      <span>
        <strong>{{ 'email' | translate }}:</strong>
        {{ emailData?.email }}
      </span>
      <span>
        <strong>{{ 'purpose' | translate }}:</strong>
        {{ emailData?.purposeName }}
      </span>
    </div>
  </div>

  <div class="email-content">
    <h4>{{ 'email' | translate }} {{ 'preview' | translate }}</h4>
    <iframe *ngIf="emailBlobUrl" class="email-iframe" [src]="emailBlobUrl" frameborder="0"></iframe>
  </div>

  <div class="dialog-footer">
    <button pButton type="button" [label]="'close' | translate" icon="pi pi-times" (click)="close()" class="p-button-text"></button>
  </div>
</div>

```

---

## `src/app/demo/pages/emails/email-preview-dialog/email-preview-dialog.component.scss`

```scss
.email-preview-container {
  padding: 1rem;
}

.email-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;

  h3 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }

  .email-meta {
    display: flex;
    gap: 1.5rem;
    font-size: 0.9rem;
    color: #666;

    span {
      strong {
        margin-right: 0.25rem;
      }
    }
  }
}

.email-content {
  margin-bottom: 1.5rem;

  h4 {
    margin: 0 0 0.75rem 0;
    color: #555;
    font-size: 1rem;
  }
}

.email-iframe {
  width: 100%;
  min-height: 500px;
  height: calc(85vh - 200px);
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: #ffffff;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

```

---

## `src/app/demo/pages/emails/email-preview-dialog/email-preview-dialog.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailPreviewDialogComponent } from './email-preview-dialog.component';

describe('EmailPreviewDialogComponent', () => {
  let component: EmailPreviewDialogComponent;
  let fixture: ComponentFixture<EmailPreviewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailPreviewDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailPreviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/emails/email-preview-dialog/email-preview-dialog.component.ts`

```ts
import { Component, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-email-preview-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './email-preview-dialog.component.html',
  styleUrl: './email-preview-dialog.component.scss'
})
export class EmailPreviewDialogComponent implements OnDestroy {
  emailData: any;
  emailBlobUrl: SafeResourceUrl | null = null;
  private blobUrl: string | null = null;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private sanitizer: DomSanitizer
  ) {
    this.emailData = this.config.data;
    if (this.emailData?.handlebars) {
      // Create a blob URL for the HTML content
      const blob = new Blob([this.emailData.handlebars], { type: 'text/html' });
      this.blobUrl = URL.createObjectURL(blob);
      this.emailBlobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl);
    }
  }

  close() {
    this.ref.close();
  }

  ngOnDestroy() {
    // Clean up the blob URL when component is destroyed
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
    }
  }
}

```

---

## `src/app/demo/pages/emails/emails.component.html`

```html
<div class="main">
  <sub-header [mainHeader]="'emails' | translate" />
  <app-email-list/>
</div>

```

---

## `src/app/demo/pages/emails/emails.component.scss`

```scss

```

---

## `src/app/demo/pages/emails/emails.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailsComponent } from './emails.component';

describe('EmailsComponent', () => {
  let component: EmailsComponent;
  let fixture: ComponentFixture<EmailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/emails/emails.component.ts`

```ts
import { Component } from '@angular/core';
import { SubHeaderComponent } from "src/app/shared/components/sub-header/sub-header.component";
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { EmailListComponent } from "./email-list/email-list.component";

@Component({
  selector: 'app-emails',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, EmailListComponent],
  templateUrl: './emails.component.html',
  styleUrl: './emails.component.scss'
})
export class EmailsComponent {

}

```

---

## `src/app/demo/pages/hajj/hajj-details/hajj-details.component.html`

```html
<p>hajj-details works!</p>

```

---

## `src/app/demo/pages/hajj/hajj-details/hajj-details.component.scss`

```scss

```

---

## `src/app/demo/pages/hajj/hajj-details/hajj-details.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HajjDetailsComponent } from './hajj-details.component';

describe('HajjDetailsComponent', () => {
  let component: HajjDetailsComponent;
  let fixture: ComponentFixture<HajjDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HajjDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HajjDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/hajj/hajj-details/hajj-details.component.ts`

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-hajj-details',
  standalone: true,
  imports: [],
  templateUrl: './hajj-details.component.html',
  styleUrl: './hajj-details.component.scss'
})
export class HajjDetailsComponent {

}

```

---

## `src/app/demo/pages/hajj/hajj-form/hajj-form.component.html`

```html
<p>hajj-form works!</p>

```

---

## `src/app/demo/pages/hajj/hajj-form/hajj-form.component.scss`

```scss

```

---

## `src/app/demo/pages/hajj/hajj-form/hajj-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HajjFormComponent } from './hajj-form.component';

describe('HajjFormComponent', () => {
  let component: HajjFormComponent;
  let fixture: ComponentFixture<HajjFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HajjFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HajjFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/hajj/hajj-form/hajj-form.component.ts`

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-hajj-form',
  standalone: true,
  imports: [],
  templateUrl: './hajj-form.component.html',
  styleUrl: './hajj-form.component.scss'
})
export class HajjFormComponent {

}

```

---

## `src/app/demo/pages/hajj/hajj-list/hajj-list.component.html`

```html
<p>hajj-list works!</p>

```

---

## `src/app/demo/pages/hajj/hajj-list/hajj-list.component.scss`

```scss

```

---

## `src/app/demo/pages/hajj/hajj-list/hajj-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HajjListComponent } from './hajj-list.component';

describe('HajjListComponent', () => {
  let component: HajjListComponent;
  let fixture: ComponentFixture<HajjListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HajjListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HajjListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/hajj/hajj-list/hajj-list.component.ts`

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-hajj-list',
  standalone: true,
  imports: [],
  templateUrl: './hajj-list.component.html',
  styleUrl: './hajj-list.component.scss'
})
export class HajjListComponent {

}

```

---

## `src/app/demo/pages/hajj/hajj.component.html`

```html
<app-manasik [type]="type"></app-manasik>

```

---

## `src/app/demo/pages/hajj/hajj.component.scss`

```scss

```

---

## `src/app/demo/pages/hajj/hajj.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HajjComponent } from './hajj.component';

describe('HajjComponent', () => {
  let component: HajjComponent;
  let fixture: ComponentFixture<HajjComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HajjComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HajjComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/hajj/hajj.component.ts`

```ts
import { Component } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { OutingListComponent } from '../outing/outing-list/outing-list.component';
import { Router } from '@angular/router';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { HajjListComponent } from './hajj-list/hajj-list.component';
import { ManasikComponent } from 'src/app/shared/manasik/manasik.component';
import { ManasikType } from 'src/app/shared/Enums/manasikType';

@Component({
  selector: 'app-hajj',
  standalone: true,
  imports: [ManasikComponent],
  templateUrl: './hajj.component.html',
  styleUrl: './hajj.component.scss'
})
export class HajjComponent {
  type: ManasikType = ManasikType.Hajj;
}

```

---

## `src/app/demo/pages/hotels/hotel-details/hotel-details.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'Hotel Details' | translate"
    [mainSection]="'Hotels Management' | translate"
    [subSection]="'Details' | translate"
  ></sub-header>

  <div class="border-1 border-solid surface-border border-round mb-4 p-4 shadow-3">
    <div class="grid">
      <div class="col-12 col-md-6">
        <!-- [value]="hotelGalleryImages.length ? hotelGalleryImages : ['https://placehold.co/600x400?text=No+Image']" -->
        <p-galleria
          [value]="hotel.images.length ? imgs : ['https://placehold.co/600x400?text=No+Image']"
          [autoPlay]="true"
          [circular]="true"
          [showItemNavigators]="true"
          [thumbnailsPosition]="'bottom'"
          [responsiveOptions]="responsiveOptions"
          [containerStyle]="{ 'max-width': '100%' }"
          [numVisible]="4"
        >
          <ng-template pTemplate="item" let-item>
            <img [src]="item" class="w-full h-20rem border-round" style="object-fit: cover; margin-bottom: 10px" />
          </ng-template>
          <ng-template pTemplate="thumbnail" let-item>
            <div class="grid grid-nogutter justify-content-center">
              <img [src]="item" class="w-7rem h-5rem border-round" style="object-fit: cover" />
            </div>
          </ng-template>
        </p-galleria>
      </div>

      <div class="col-12 col-md-6 pl-4">
        <h2 class="text-3xl mb-2">{{ hotel.name }}</h2>
        <div class="medium text-body-secondary mb-1">
          <i class="fas fa-map-marker-alt me-1"></i>
          {{ hotel.cityName }}, {{ hotel.countryName }}
        </div>
        <div class="flex align-items-center gap-3 mb-4">
          <p-rating [(ngModel)]="hotel.rating" [readonly]="true" [cancel]="false"></p-rating>
          <span class="text-muted text-lg">({{ hotel.rating }} / 5)</span>
        </div>

        <p class="text-muted mb-3 line-height-3" [innerHTML]="hotel.description"></p>

        <p class="text-muted mb-2">
          <i class="pi pi-phone mr-2"></i>
          {{ 'Phone' | translate }}: {{ hotel.phone }}
        </p>
        <p class="text-muted mb-2">
          <i class="fa-solid fa-map-location-dot mr-2"></i>
          {{ 'Address' | translate }}: {{ hotel.address }}
        </p>
      </div>
    </div>
  </div>

  ---

  <div class="shadow-3 bg-light p-3 border-round mt-4">
    <h3 class="text-xl mb-3">{{ 'Available Rooms' | translate }}</h3>
    <div class="grid">
      <div class="col-12 col-md-4" *ngFor="let room of hotel.rooms">
        <p-card styleClass="p-card-shadow mb-3">
          <ng-template pTemplate="header">
            <!-- <img
              [src]="room.images.length ? room.images[0] : 'https://placehold.co/600x400?text=No+Spacefic+Images'"
              alt="{{ room.name }}"
              class="w-full h-15rem object-fit-cover border-round-top"
            /> -->
            <p-galleria
              [value]="getRoomImages(room)"
              [autoPlay]="true"
              [circular]="true"
              [showItemNavigators]="true"
              [thumbnailsPosition]="'bottom'"
              [responsiveOptions]="responsiveOptions"
              [containerStyle]="{ 'max-width': '100%' }"
              [numVisible]="4"
            >
              <ng-template pTemplate="item" let-item>
                <img [src]="item" class="w-full h-20rem border-round" style="object-fit: cover; margin-bottom: 10px" />
              </ng-template>
            </p-galleria>
          </ng-template>
          <ng-template pTemplate="title">
            <div class="flex flex-wrap align-items-center justify-content-between mb-2">
              <h4 class="mb-0 text-truncate" style="flex-grow: 2">{{ room.name }}</h4>

              <div class="flex align-items-center gap-3 text-sm">
                <span>
                  <i class="pi pi-bed mr-1"></i>
                  {{ room.bedCount }} {{ 'Beds' | translate }}
                </span>
                <span>
                  <i class="pi pi-arrows-alt mr-1"></i>
                  {{ room.size }} m²
                </span>
              </div>
            </div>

            <span class="text-orange-500 text-lg">{{ room.price  }}</span>
          </ng-template>
          <ng-template pTemplate="subtitle">
            <div class="flex align-items-center gap-2 mb-2">
              <p-tag [value]="room.roomType" icon="pi pi-home" severity="info" class="mr-1"></p-tag>
              <p-tag [value]="room.bedType || 'N/A'" icon="fa-solid fa-bed" severity="success"></p-tag>
            </div>
          </ng-template>
          <!-- <ng-template pTemplate="content">
            <p class="text-muted text-sm line-height-2 overflow-hidden text-overflow-ellipsis white-space-nowrap" style="max-height: 40px">
              {{ room.description }}
            </p>
          </ng-template> -->
          <ng-template pTemplate="footer">
            <button
              pButton
              label="{{ 'View Details' | translate }}"
              icon="pi pi-info-circle"
              class="btn btn-primary w-100"
              (click)="goToRoomlReservationForm(room.id)"
            ></button>
          </ng-template>
        </p-card>
      </div>
    </div>
  </div>
</div>

```

---

## `src/app/demo/pages/hotels/hotel-details/hotel-details.component.scss`

```scss

```

---

## `src/app/demo/pages/hotels/hotel-details/hotel-details.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelDetailsComponent } from './hotel-details.component';

describe('HotelDetailsComponent', () => {
  let component: HotelDetailsComponent;
  let fixture: ComponentFixture<HotelDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/hotels/hotel-details/hotel-details.component.ts`

```ts
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { HotelService } from 'src/app/shared/services/hotel.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-hotel-details',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './hotel-details.component.html',
  styleUrl: './hotel-details.component.scss'
})
export class HotelDetailsComponent {
  hotel: any = {}; // Replace 'any' with your Hotel interface
  rooms: any[] = []; // Replace 'any' with your Room interface
  hotelGalleryImages: string[] = [];
  imgs;
  roomImgs

  responsiveOptions = [
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

  constructor(
    private route: ActivatedRoute,
    private hotelService: HotelService,
    private Router: Router,
    private ToastrService: ToastrService
  ) {}
  goToRoomlReservationForm(id) {
    console.log('room-reservation-step');
    this.Router.navigate(['/room-details-last-step', id]);
  }
  ngOnInit(): void {
    // Get the hotel ID from the route parameters
    this.route.params.subscribe((params) => {
      const hotelId = +params['id']; // '+' converts string to number
      this.getHotelDetails(hotelId); // Fetch hotel details using the service
    });
  }
getRoomImages(room: any) {
  if (room.images?.length) {
    return room.images.map((img: any) => environment.imgUrl + img.url);
  } else if (room.groupImages?.length) {
    return room.groupImages.map((img: any) => environment.imgUrl + img.url);
  } else {
    return ['https://placehold.co/600x400?text=No+Image'];
  }
}

  private getHotelDetails(hotelId: number): void {
    this.hotelService.getHotelById(hotelId).subscribe({
      next: (res) => {
        this.hotel = res.data;
        this.rooms = res.data.rooms || []; //  rooms is an array
        this.imgs = res.data.images.map((img) => environment.imgUrl + img.url);
        //this.roomImgs = res.data.rooms.images.map((img) => environment.imgUrl + img.url);
      },
      error: (error) => {
        console.error('Error fetching hotel details:', error);
        this.ToastrService.error('Failed to load hotel details', 'Error');
      }
    });
  }
  
}

```

---

## `src/app/demo/pages/hotels/hotels-form/hotels-form.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="hotelId ? ('Edit Hotel' | translate) : ('Add Hotel' | translate)"
    [mainSection]="'Hotels' | translate"
    [subSection]="hotelId ? ('Edit' | translate) : ('Add' | translate)"
  ></sub-header>

  <div *ngIf="!isLoading" class="product-form shadow-3 p-4">
    <form class="form-field" [formGroup]="hotelForm" (ngSubmit)="onSubmit()">
      <!-- Hotel Info Section -->
      <h3 class="flex justify-content-between">
        {{ 'Hotel Info' | translate }}
        <span><p-inputSwitch formControlName="Status" /></span>
      </h3>

      <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
        <div class="field col-12 col-md-6">
          <label for="hotelName">{{ 'Hotel Name' | translate }}</label>
          <input type="text" pInputText id="hotelName" formControlName="Name" placeholder="{{ 'Hotel name' | translate }}" />
          <div class="text-danger" *ngIf="shouldShowError('Name')">
            <span *ngIf="hotelForm.get('Name')?.errors?.['required']">
              {{ 'Hotel name is required' | translate }}
            </span>
            <span *ngIf="hotelForm.get('Name')?.errors?.['maxlength']">
              {{ 'Hotel name cannot exceed 100 characters' | translate }}
            </span>
          </div>
        </div>
        <div class="field col-12 col-md-6">
          <label for="hotelStars">{{ 'Star Rating' | translate }}</label>
          <p-dropdown
            id="hotelStars"
            formControlName="Rating"
            [options]="starRatings"
            placeholder="{{ 'Select rating' | translate }}"
            class="w-full"
          ></p-dropdown>
          <div class="text-danger" *ngIf="shouldShowError('Rating')">
            {{ 'Please select star rating' | translate }}
          </div>
        </div>

        <div class="field col-12 col-md-6">
          <label for="hotelCountry">{{ 'Country' | translate }}</label>
          <p-dropdown
            id="hotelCountry"
            [options]="countries"
            formControlName="CountryId"
            optionLabel="name"
            optionValue="id"
            [filter]="true"
            (onFilter)="onCountryFilter($event)"
            placeholder="{{ 'Select country' | translate }}"
            [showClear]="true"
            class="w-full"
          ></p-dropdown>
          <div class="text-danger" *ngIf="shouldShowError('CountryId')">
            {{ 'Please select a country' | translate }}
          </div>
        </div>
        <div class="field col-12 col-md-6">
          <label for="hotelCity">{{ 'City' | translate }}</label>
          <p-dropdown
            id="hotelCity"
            [options]="cities"
            formControlName="CityId"
            optionLabel="name"
            optionValue="id"
            placeholder="{{ 'Select city' | translate }}"
            [showClear]="true"
            class="w-full"
          ></p-dropdown>
          <div class="text-danger" *ngIf="shouldShowError('CityId')">
            {{ 'Please select a city' | translate }}
          </div>
        </div>

        <div class="field col-12 col-md-6">
          <label for="hotelPhone">{{ 'Phone' | translate }}</label>
          <input type="text" pInputText id="hotelPhone" formControlName="Phone" placeholder="{{ 'Phone number' | translate }}" />
          <div class="text-danger" *ngIf="shouldShowError('Phone')">
            <span *ngIf="hotelForm.get('Phone')?.errors?.['required']">
              {{ 'Phone number is required' | translate }}
            </span>
            <span *ngIf="hotelForm.get('Phone')?.errors?.['pattern']">
              {{ 'Phone number must be 10-15 digits, optionally starting with +' | translate }}
            </span>
          </div>
        </div>

        <div class="field col-12 col-md-6">
          <label for="hotelAddress">{{ 'Address' | translate }}</label>
          <input type="text" pInputText id="hotelAddress" formControlName="Address" placeholder="{{ 'Hotel address' | translate }}" />
          <div class="text-danger" *ngIf="shouldShowError('Address')">
            <span *ngIf="hotelForm.get('Address')?.errors?.['required']">
              {{ 'Address is required' | translate }}
            </span>
            <span *ngIf="hotelForm.get('Address')?.errors?.['maxlength']">
              {{ 'Address cannot exceed 200 characters' | translate }}
            </span>
          </div>
        </div>
      </div>

      <!-- Other Info Section -->
      <div class="form-field mt-4">
        <h3>{{ 'Other Info' | translate }}</h3>

        <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
          <!-- Description -->
          <div class="field col-12">
            <label for="hotelDescription">{{ 'Description' | translate }}</label>
            <p-editor formControlName="Description" [style]="{ height: '150px' }"></p-editor>
            <div class="text-danger" *ngIf="shouldShowError('Description')">
              <span *ngIf="hotelForm.get('Description')?.errors?.['required']">
                {{ 'Description is required' | translate }}
              </span>
              <span *ngIf="hotelForm.get('Description')?.errors?.['maxlength']">
                {{ 'Description cannot exceed 500 characters' | translate }}
              </span>
            </div>
          </div>
          <div class="field col-12">
            <label for="ShortDescription">{{ 'ShortDescription' | translate }}</label>
            <textarea rows="5" formControlName="ShortDescription" class="w-full"></textarea>
            <div class="text-danger" *ngIf="shouldShowError('ShortDescription')">
              <span *ngIf="hotelForm.get('ShortDescription')?.errors?.['required']">
                {{ 'ShortDescription is required' | translate }}
              </span>
              <span *ngIf="hotelForm.get('ShortDescription')?.errors?.['maxlength']">
                {{ 'ShortDescription cannot exceed 70 characters' | translate }}
              </span>
            </div>
          </div>
          <!-- Policies Section -->
          <div class="field mt-4 col-12">
            <label>{{ 'Policies' | translate }}</label>

            <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
              <!-- Allow Pets Switch -->
              <div class="field col-12 col-md-2 d-flex flex-column align-items-center">
                <label class="font-medium d-block mb-2 text-center">
                  {{ 'Allow Pets' | translate }}
                </label>
                <p-inputSwitch formControlName="AllowPets" />
                <!-- <div class="text-danger text-center mt-2" *ngIf="shouldShowError('AllowPets')">
                  {{ 'Please specify if pets are allowed' | translate }}
                </div> -->
              </div>
              <!-- is recomended -->

              <div class="field col-12 col-md-2 d-flex flex-column align-items-center">
                <label class="font-medium d-block mb-2 text-center">
                  {{ 'is recomended' | translate }}
                </label>
                <p-inputSwitch formControlName="IsRecommended" />
                <!-- <div class="text-danger text-center mt-2" *ngIf="shouldShowError('IsRecommended')">
                  {{ 'Please specify if pets are allowed' | translate }}
                </div> -->
              </div>
              <!-- <div class="field col-12 col-md-2 d-flex flex-column align-items-center">
                <label class="font-medium d-block mb-2 text-center">
                  {{ 'Is Fake' | translate }}
                </label>
                    <p-inputSwitch formControlName="IsFake" />
                <div class="text-danger text-center mt-2" *ngIf="shouldShowError('IsRecommended')">
                  {{ 'Please specify if pets are allowed' | translate }}
                </div>
              </div> -->

              <!-- Max Child Age Input -->
              <div class="field col-12 col-md-2">
                <label for="MaxChildAge">{{ 'Max Child Age' | translate }}</label>
                <p-inputNumber inputId="MaxChildAge" formControlName="MaxChildAge" mode="decimal" class="w-full" />
                <!-- <div class="text-danger" *ngIf="shouldShowError('MaxChildAge')">
                  {{ 'Please enter valid max child age' | translate }}
                </div> -->
                <div class="text-danger" *ngIf="shouldShowError('MaxChildAge') && hotelForm.get('MaxChildAge')?.value === null">
                  {{ 'Please fill max child age' | translate }}
                </div>
              </div>

              <!-- Min Adult Age Input -->
              <div class="field col-12 col-md-2">
                <label for="MinAdultAge">{{ 'Min Adult Age' | translate }}</label>
                <p-inputNumber inputId="MinAdultAge" formControlName="MinAdultAge" mode="decimal" class="w-full" />
                <!-- <div class="text-danger" *ngIf="shouldShowError('MinAdultAge')">
                  {{ 'Please enter valid min adult age' | translate }}
                </div> -->
                <div class="text-danger" *ngIf="shouldShowError('MinAdultAge') && hotelForm.get('MinAdultAge')?.value === null">
                  {{ 'Please fill min adult age' | translate }}
                </div>
              </div>
              <!-- Reserve Number Fake -->
              <div class="field col-12 col-md-2">
                <label for="ReserveNumberFake">{{ 'numper of reservations' | translate }}</label>
                <p-inputNumber inputId="MinAdultAge" formControlName="ReserveNumberFake" mode="decimal" [min]="18" class="w-full" />

                <div class="text-danger" *ngIf="shouldShowError('ReserveNumberFake') && hotelForm.get('ReserveNumberFake')?.value === null">
                  {{ 'Please fill numper of reservations' | translate }}
                </div>
              </div>
            </div>
          </div>

          <!-- Image Uploaders -->
          <div class="field col-12">
            <div class="formgrid grid">
              <div class="field col-12 md:col-6">
                <label>{{ 'Images' | translate }}</label>
                <app-img-uploader
                  [multiple]="true"
                  [displayFiles]="existingImages"
                  (filesChanged)="onImagesUpload($event)"
                  (removeImgFromDB)="onImageRemoved($event)"
                ></app-img-uploader>
                <div class="text-danger" *ngIf="showImageError && submitted">
                  {{ 'At least one image is required' | translate }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Error -->
      <div *ngIf="hotelForm.invalid && submitted" class="alert alert-danger mt-3">
        {{ 'Please fill out all required fields correctly' | translate }}
      </div>

      <!-- Buttons -->
      <div class="buttons mt-3 text-end">
        <p-button label="{{ 'Cancel' | translate }}" class="mx-1" severity="secondary" (onClick)="onCancel()"></p-button>
        <p-button label="{{ 'Save' | translate }}" severity="success" icon="pi pi-save" type="submit" [disabled]="isLoading"></p-button>
      </div>
    </form>
  </div>
</div>

```

---

## `src/app/demo/pages/hotels/hotels-form/hotels-form.component.scss`

```scss

```

---

## `src/app/demo/pages/hotels/hotels-form/hotels-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelsFormComponent } from './hotels-form.component';

describe('HotelsFormComponent', () => {
  let component: HotelsFormComponent;
  let fixture: ComponentFixture<HotelsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/hotels/hotels-form/hotels-form.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from '../../../../shared/components/sub-header/sub-header.component';
import { ImgUploaderComponent } from '../../../../shared/img-uploader/img-uploader.component';
import { CountriesService } from 'src/app/shared/services/countries.service';
import { CitiesService } from 'src/app/shared/services/cities.service';
import { HotelService } from 'src/app/shared/services/hotel.service';

interface Country {
  id: number;
  name: string;
}

interface City {
  id: number;
  countryId: number;
  name: string;
}

@Component({
  selector: 'app-hotel-form',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, ImgUploaderComponent],
  providers: [HotelService],
  templateUrl: './hotels-form.component.html',
  styleUrls: ['./hotels-form.component.scss']
})
export class HotelsFormComponent implements OnInit {
  hotelForm: FormGroup;
  hotelId: string | null = null;
  submitted = false;
  isLoading = false;

  newImages: File[] = [];
  existingImages: { id: number; url: string }[] = [];
  showImageError = false;

  countries: Country[] = [];
  cities: City[] = [];
  starRatings = [1, 2, 3, 4, 5];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private toastrService: ToastrService,
    private countriesService: CountriesService,
    private citiesService: CitiesService,
    private hotelService: HotelService
  ) {}

  ngOnInit(): void {
    this.hotelId = this.route.snapshot.paramMap.get('id');
    console.log('Hotel ID:', this.hotelId); // Debug
    this.initializeForm();

    this.getAllCountries(0, 10);
    if (this.hotelId) {
      this.loadHotelData(this.hotelId);
    }

    this.hotelForm.get('CountryId')?.valueChanges.subscribe((countryId) => {
      this.cities = [];
      this.hotelForm.get('CityId')?.reset();
      if (countryId) {
        this.citiesService.getAllCities({ pageIndex: 0, pageSize: 10, countryId: countryId }).subscribe({
          next: (res) => {
            this.cities = res.data?.data || [];
          },
          error: (err) => {
            console.error('Error fetching cities', err);
            this.toastrService.error(this.translate.instant('Failed to load cities'));
          }
        });
      }
    });
  }
  private initializeForm(): void {
    this.hotelForm = this.fb.group({
      CountryId: [null, Validators.required], // camelCase (matches API)
      CityId: [null, Validators.required], // camelCase (matches API)
      Name: ['', [Validators.required]],
      Description: ['', [Validators.required]],
      ShortDescription: ['', [Validators.required, Validators.maxLength(70)]],
      Rating: [null, [Validators.required]],
      Phone: ['', [Validators.required]],
      Address: ['', [Validators.required]],
      Status: [true],
      AllowPets: [false, Validators.required],
      IsRecommended: [false, Validators.required],
      MaxChildAge: [null, [Validators.required]],
      MinAdultAge: [null, [Validators.required]],
      ReserveNumberFake: [null, [Validators.required, Validators.pattern('^[0-9]+$')]]
    });
  }

  onCountryFilter(event: any) {
    this.getAllCountries(0, 10, event.filter);
  }

  getAllCountries(pageIndex: number, pageSize: number, search?: string) {
    this.countriesService.getAllCountries({ pageIndex, pageSize, search }).subscribe({
      next: (res) => {
        this.countries = res.data?.data || [];
      },
      error: (err) => {
        console.error('Error fetching countries', err);
        this.toastrService.error(this.translate.instant('Failed to load countries'));
      }
    });
  }

  loadHotelData(id): void {
    this.isLoading = true;
    this.hotelService.getHotelById(id).subscribe({
      next: (response) => {
        const hotel = response.data;
        this.existingImages = hotel.images || [];
        console.log('Hotel Data:', hotel); // Debug

        // Patch basic values (match API camelCase)
        this.hotelForm.patchValue({
          CountryId: hotel.countryId,
          CityId: hotel.cityId,
          Name: hotel.name,
          Description: hotel.description,
          ShortDescription: hotel.shortDescription,
          Rating: Number(hotel.rating),
          Phone: hotel.phone,
          Address: hotel.address,
          IsRecommended: hotel.isRecommended,
          IsFake: hotel.isFake,
          Status: hotel.status,
          AllowPets: hotel.allowPets,
          MaxChildAge: hotel.maxChildAge,
          MinAdultAge: hotel.minAdultAge,
          ReserveNumberFake: hotel.reserveNumberFake
        });

        // Load cities for the selected country
        // if (hotel.countryId) {
        //   this.citiesService.getAllCities(0, 10, null, hotel.countryId).subscribe({
        //     next: (res) => {
        //       console.log('Cities Data:', res.data); // Debug
        //       this.cities = res.data?.data || [];
        //       // Re-select city after cities load
        //       this.hotelForm.patchValue({ cityId: hotel.cityId });
        //     },
        //     error: (err) => {
        //       console.error('Error loading cities:', err);
        //     }
        //   });
        // }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading hotel:', error);
        this.toastrService.error('Failed to load hotel data');
        this.isLoading = false;
      }
    });
  }

  shouldShowError(controlName: string): boolean {
    const control = this.hotelForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  onImagesUpload(files: File[] | null): void {
    this.newImages = files || [];
    this.showImageError = false;
  }

  onImageRemoved(index: number): void {
    this.existingImages.splice(index, 1);
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.newImages.length === 0 && this.existingImages.length === 0) {
      this.showImageError = true;
    }

    if (this.hotelForm.invalid || this.showImageError) {
      this.markAllAsTouched();
      return;
    }

    this.saveHotel();
  }

  private markAllAsTouched(): void {
    Object.values(this.hotelForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  private saveHotel(): void {
    this.isLoading = true;
    const formData = new FormData();

    Object.keys(this.hotelForm.value).forEach((key) => {
      const value = this.hotelForm.value[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    if (this.newImages.length > 0) {
      this.newImages.forEach((file) => {
        formData.append('uploadedImages', file);
      });
    }

    if (this.existingImages.length > 0) {
      const existingImageIds = this.existingImages.map((img) => img.id);

      existingImageIds.forEach((id) => {
        formData.append('ExistingImages', id.toString());
      });
    }

    if (this.hotelId) {
      formData.append('Id', this.hotelId);
      this.hotelService.updateHotel(formData).subscribe({
        next: () => {
          this.toastrService.success(this.translate.instant('Hotel updated successfully'));
          this.router.navigate(['/hotels']);
        },
        error: (error) => {
          console.error('Error updating hotel', error);
          this.toastrService.error(this.translate.instant('Failed to update hotel'));
          this.isLoading = false;
        }
      });
    } else {
      this.hotelService.addHotel(formData).subscribe({
        next: () => {
          this.toastrService.success(this.translate.instant('Hotel created successfully'));
          this.router.navigate(['/hotels']);
        },
        error: (error) => {
          console.error('Error creating hotel', error);
          this.toastrService.error(this.translate.instant('Failed to create hotel'));
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    if (this.hotelForm.dirty || this.newImages.length > 0 || this.existingImages.length !== (this.existingImages.length || 0)) {
      if (confirm(this.translate.instant('Are you sure you want to discard changes?'))) {
        this.router.navigate(['/hotels']);
      }
    } else {
      this.router.navigate(['/hotels']);
    }
  }
}

```

---

