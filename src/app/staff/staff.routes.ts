import { Routes } from '@angular/router';

/**
 * The screens of the TRIPS Staff app, at the same paths as in the app (/a/... for admins, /v/... for vendors).
 * They live inside the dashboard layout (sidebar and header) and load on first use.
 */
export const STAFF_ROUTES: Routes = [
  // ---- admin: bookings ----
  { path: 'a/home', redirectTo: '/default', pathMatch: 'full' },
  { path: 'a/bookings', loadComponent: () => import('./bookings/bookings.component').then((c) => c.BookingsComponent) },
  { path: 'a/bookings/new', loadComponent: () => import('./bookings/new-booking.component').then((c) => c.NewBookingComponent) },
  { path: 'a/bookings/:id', loadComponent: () => import('./bookings/booking-details.component').then((c) => c.BookingDetailsComponent) },
  { path: 'a/bookings/:id/instapay', loadComponent: () => import('./bookings/booking-details.component').then((c) => c.InstaPayReviewComponent) },

  // ---- admin: products ----
  { path: 'a/services', loadComponent: () => import('./products/product-lists.component').then((c) => c.ServicesComponent) },
  { path: 'a/products', redirectTo: '/a/services', pathMatch: 'full' },
  { path: 'a/products/approvals', loadComponent: () => import('./products/product-lists.component').then((c) => c.ApprovalsComponent) },
  { path: 'a/products/expiring', loadComponent: () => import('./products/product-lists.component').then((c) => c.ExpiringComponent) },
  { path: 'a/products/hotels', loadComponent: () => import('./products/product-lists.component').then((c) => c.HotelsComponent) },
  { path: 'a/products/hotels/:id', loadComponent: () => import('./products/product-lists.component').then((c) => c.HotelDetailsComponent) },
  { path: 'a/products/:type', loadComponent: () => import('./products/product-lists.component').then((c) => c.ProductListComponent) },
  { path: 'a/products/:type/:id', loadComponent: () => import('./products/product-details.component').then((c) => c.ProductDetailsComponent) },
  { path: 'hotel/:id', loadComponent: () => import('./products/product-lists.component').then((c) => c.HotelDetailsComponent) },

  // ---- vendor: bookings ----
  { path: 'v/home', redirectTo: '/default', pathMatch: 'full' },
  { path: 'v/bookings', loadComponent: () => import('./bookings/bookings.component').then((c) => c.BookingsComponent), data: { vendor: true } },
  { path: 'v/bookings/:id', loadComponent: () => import('./bookings/booking-details.component').then((c) => c.BookingDetailsComponent), data: { vendor: true } },

  // ---- vendor: products ----
  { path: 'v/products', loadComponent: () => import('./products/product-lists.component').then((c) => c.VendorProductsComponent) },
  { path: 'v/products/:type/:id', loadComponent: () => import('./products/product-details.component').then((c) => c.ProductDetailsComponent), data: { vendor: true } },

  // ---- product and home-content forms (the id of an edit comes as ?id=) ----
  { path: 'form/trip', loadComponent: () => import('./forms/trip-form.component').then((c) => c.TripFormComponent) },
  { path: 'form/outing', loadComponent: () => import('./forms/outing-form.component').then((c) => c.OutingFormComponent) },
  { path: 'form/hajj', loadComponent: () => import('./forms/hajj-form.component').then((c) => c.HajjFormComponent) },
  { path: 'form/hajj/rooms', loadComponent: () => import('./forms/hajj-form.component').then((c) => c.HajjRoomsComponent) },
  { path: 'form/room', loadComponent: () => import('./forms/room-form.component').then((c) => c.RoomFormComponent) },
  { path: 'form/tripstar', loadComponent: () => import('./forms/home-content-forms.component').then((c) => c.TripStarFormComponent) },
  { path: 'form/sidebar', loadComponent: () => import('./forms/home-content-forms.component').then((c) => c.SidebarFormComponent) },

  // ---- admin: more → customers, vendors, money ----
  { path: 'a/more/customers', loadComponent: () => import('./customers/customers.component').then((c) => c.CustomersComponent) },
  { path: 'a/more/customers/:id', loadComponent: () => import('./customers/customers.component').then((c) => c.CustomerComponent) },
  { path: 'a/more/customers/:id/wallet', loadComponent: () => import('./customers/customers.component').then((c) => c.WalletAdjustComponent) },
  { path: 'a/more/wallet-transactions', loadComponent: () => import('./customers/customers.component').then((c) => c.WalletTransactionsComponent) },
  { path: 'a/more/vendors', loadComponent: () => import('./vendors/vendors.component').then((c) => c.VendorsComponent) },
  { path: 'a/more/vendors/new', loadComponent: () => import('./vendors/vendors.component').then((c) => c.VendorFormComponent) },
  { path: 'a/more/vendors/:id', loadComponent: () => import('./vendors/vendors.component').then((c) => c.VendorComponent) },
  { path: 'a/more/vendors/:id/edit', loadComponent: () => import('./vendors/vendors.component').then((c) => c.VendorFormComponent) },
  { path: 'a/more/vendors/:id/users', loadComponent: () => import('./vendors/vendors.component').then((c) => c.VendorUsersComponent) },
  { path: 'a/more/transactions', loadComponent: () => import('./money/money.component').then((c) => c.TransactionsComponent) },
  { path: 'a/more/settlements', loadComponent: () => import('./money/money.component').then((c) => c.SettlementsComponent) },
  { path: 'a/more/payment-accounts', loadComponent: () => import('./money/money.component').then((c) => c.PaymentAccountsComponent) },
  { path: 'v/more/settlements', loadComponent: () => import('./money/money.component').then((c) => c.SettlementsComponent), data: { vendor: true } },

  // ---- admin: more → marketing, messaging, requests ----
  { path: 'a/more/reviews', loadComponent: () => import('./marketing/marketing.component').then((c) => c.ReviewsComponent) },
  { path: 'a/more/search', loadComponent: () => import('./marketing/marketing.component').then((c) => c.SearchHistoryComponent) },
  { path: 'a/more/search/records', loadComponent: () => import('./marketing/marketing.component').then((c) => c.SearchRecordsComponent) },
  { path: 'a/more/coupons', loadComponent: () => import('./marketing/marketing.component').then((c) => c.CouponsComponent) },
  { path: 'a/more/coupons/used', loadComponent: () => import('./marketing/marketing.component').then((c) => c.UsedCouponsComponent) },
  { path: 'a/more/coupons/analytics', loadComponent: () => import('./marketing/marketing.component').then((c) => c.CouponAnalyticsComponent) },
  { path: 'a/more/emails', loadComponent: () => import('./messaging/messaging.component').then((c) => c.EmailsComponent) },
  { path: 'a/more/emails/:id', loadComponent: () => import('./messaging/messaging.component').then((c) => c.EmailDetailsComponent) },
  { path: 'a/more/notifications', loadComponent: () => import('./messaging/messaging.component').then((c) => c.NotificationLogComponent) },
  { path: 'a/more/notifications/:id', loadComponent: () => import('./messaging/messaging.component').then((c) => c.NotificationDetailsComponent) },
  { path: 'a/more/notify', loadComponent: () => import('./messaging/messaging.component').then((c) => c.NotifyComponent) },
  { path: 'a/more/custom-requests', loadComponent: () => import('./requests/requests.component').then((c) => c.CustomRequestsComponent) },
  { path: 'a/more/custom-requests/:id', loadComponent: () => import('./requests/requests.component').then((c) => c.CustomRequestComponent) },
  { path: 'v/more/reviews', loadComponent: () => import('./marketing/marketing.component').then((c) => c.ReviewsComponent), data: { vendor: true } },
  { path: 'v/more/requests', loadComponent: () => import('./requests/requests.component').then((c) => c.CustomRequestsComponent), data: { vendor: true } },
  { path: 'v/more/requests/:id', loadComponent: () => import('./requests/requests.component').then((c) => c.CustomRequestComponent), data: { vendor: true } },
  { path: 'v/more/offers', loadComponent: () => import('./requests/requests.component').then((c) => c.VendorOffersComponent) },

  // ---- More, settings, profile ----
  { path: 'a/more', loadComponent: () => import('./more/more.component').then((c) => c.AdminMoreComponent) },
  { path: 'a/more/profile', loadComponent: () => import('./more/more.component').then((c) => c.ProfileComponent) },
  { path: 'a/more/finance-settings', loadComponent: () => import('./settings/settings.component').then((c) => c.KeyValueSettingsComponent), data: { kv: 'finance' } },
  { path: 'a/more/coupons/auto', loadComponent: () => import('./settings/settings.component').then((c) => c.KeyValueSettingsComponent), data: { kv: 'autoCoupons' } },
  { path: 'a/more/custom-requests-settings', loadComponent: () => import('./settings/settings.component').then((c) => c.KeyValueSettingsComponent), data: { kv: 'customTrips' } },
  { path: 'a/more/lookups', loadComponent: () => import('./settings/settings.component').then((c) => c.LookupsComponent) },
  { path: 'a/more/lookups/:kind', loadComponent: () => import('./settings/settings.component').then((c) => c.LookupListComponent) },
  { path: 'a/more/policies', loadComponent: () => import('./settings/settings.component').then((c) => c.PoliciesComponent) },
  { path: 'a/more/contracts', loadComponent: () => import('./settings/settings.component').then((c) => c.ContractsComponent) },
  { path: 'a/more/users', loadComponent: () => import('./settings/settings.component').then((c) => c.UsersComponent) },
  { path: 'a/more/users/roles', loadComponent: () => import('./settings/settings.component').then((c) => c.RolesComponent) },
  { path: 'a/more/users/roles/:id', loadComponent: () => import('./settings/settings.component').then((c) => c.RolePermissionsComponent) },
  { path: 'a/more/tripstars', loadComponent: () => import('./settings/content.component').then((c) => c.TripStarsComponent) },
  { path: 'a/more/tripstars/:id/analytics', loadComponent: () => import('./settings/content.component').then((c) => c.TripStarAnalyticsComponent) },
  { path: 'a/more/sidebars', loadComponent: () => import('./settings/content.component').then((c) => c.SidebarsComponent) },
  { path: 'a/more/site-visits', loadComponent: () => import('./site-visits/site-visits.component').then((c) => c.SiteVisitsComponent) },
  { path: 'a/more/vendor-comms', loadComponent: () => import('./vendor-comms/vendor-comms.component').then((c) => c.VendorCommsComponent) },
  { path: 'a/more/commission', loadComponent: () => import('./settings/content.component').then((c) => c.CommissionComponent) },
  { path: 'a/more/coupons/new', loadComponent: () => import('./settings/content.component').then((c) => c.CouponFormComponent) },

  // ---- vendor: scanner, notifications, More ----
  { path: 'v/scanner', loadComponent: () => import('./more/more.component').then((c) => c.ScannerComponent) },
  { path: 'v/scanner/history', loadComponent: () => import('./more/more.component').then((c) => c.ScanHistoryComponent) },
  { path: 'v/notifications', loadComponent: () => import('./more/more.component').then((c) => c.VendorNotificationsComponent) },
  { path: 'v/more', loadComponent: () => import('./more/more.component').then((c) => c.VendorMoreComponent) },
  { path: 'v/more/profile', loadComponent: () => import('./more/more.component').then((c) => c.ProfileComponent) },
  { path: 'v/more/analytics', redirectTo: '/analytics/overview', pathMatch: 'full' }
];
