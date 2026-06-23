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
        path: 'customer-analytics',
        loadComponent: () =>
          import('./demo/pages/customer-analytics/customer-analytics.component').then((c) => c.CustomerAnalyticsComponent)
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
        path: 'coupon-settings',
        loadComponent: () =>
          import('./demo/pages/settings/coupons/coupon-settings/coupon-settings.component').then((m) => m.CouponSettingsComponent)
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
