import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

/**
 * The dashboard's screens from before the TRIPS Staff layout stay in the code, but the dashboard no longer
 * opens them: each old address that has a new screen sends the user there (admins and vendors each to their own).
 * The old components are untouched; delete an entry here to open an old screen again.
 */
type Target = string | { admin: string; vendor: string };

const MOVED: Record<string, Target> = {
  customers: '/a/more/customers',
  'customer-list': '/a/more/customers',
  'customer-details/:id': '/a/more/customers/:id',
  vendors: '/a/more/vendors',
  'vendors-add-edit': '/a/more/vendors/new',
  'vendor-details/:id': '/a/more/vendors/:id',
  'vendor-settlements': { admin: '/a/more/settlements', vendor: '/v/more/settlements' },
  'all-reservations': { admin: '/a/bookings', vendor: '/v/bookings' },
  hotels: { admin: '/a/products/hotels', vendor: '/v/products' },
  'hotel-details/:id': { admin: '/a/products/hotels/:id', vendor: '/v/products/hotels/:id' },
  travels: { admin: '/a/products/trips', vendor: '/v/products' },
  'travel-details/:id': { admin: '/a/products/trips/:id', vendor: '/v/products/trips/:id' },
  outing: { admin: '/a/products/outings', vendor: '/v/products' },
  'outing-list': { admin: '/a/products/outings', vendor: '/v/products' },
  'outing-details/:id': { admin: '/a/products/outings/:id', vendor: '/v/products/outings/:id' },
  hajj: { admin: '/a/products/hajj', vendor: '/v/products' },
  ummrah: { admin: '/a/products/hajj', vendor: '/v/products' },
  'details-manasik/:id': { admin: '/a/products/hajj/:id', vendor: '/v/products/hajj/:id' },
  reviews: { admin: '/a/more/reviews', vendor: '/v/more/reviews' },
  coupons: '/a/more/coupons',
  'used-coupons': '/a/more/coupons/used',
  'add-coupon': '/a/more/coupons/new',
  'coupon-settings': '/a/more/coupons/auto',
  emails: '/a/more/emails',
  'email-details/:id': '/a/more/emails/:id',
  notifications: { admin: '/a/more/notifications', vendor: '/v/notifications' },
  scanner: '/v/scanner',
  'trip-stars': '/a/more/tripstars',
  walletTransactions: '/a/more/wallet-transactions',
  chargeTransaction: '/a/more/transactions',
  users: '/a/more/users',
  roles: '/a/more/users/roles',
  countries: '/a/more/lookups/countries',
  cities: '/a/more/lookups/cities',
  nationalities: '/a/more/lookups/nationalities',
  'room-types': '/a/more/lookups/room-types',
  'bed-types': '/a/more/lookups/bed-types',
  'room-features': '/a/more/lookups/room-features',
  'hajj-category': '/a/more/lookups/hajj-categories',
  'outing-category': '/a/more/lookups/outing-categories',
  'outing-category-list': '/a/more/lookups/outing-categories',
  'outing-features': '/a/more/lookups/outing-features',
  'outing-branches': '/a/more/lookups/branches',
  'Sales-Agencies': '/a/more/lookups/sales-agencies',
  'mobile-policy': '/a/more/policies',
  'financial-settings': '/a/more/finance-settings',
  'commission-policies': '/a/more/commission',
  'mobile-sidebar': '/a/more/sidebars',
  'all-Vendor-Contracts': '/a/more/contracts',
  'admin-custom-trip-requests': '/a/more/custom-requests',
  'custom-trip-requests': { admin: '/a/more/custom-requests', vendor: '/v/more/requests' },
  'custom-trip-my-offers': '/v/more/offers',
  'custom-trip-settings': '/a/more/custom-requests-settings',
  'reports/outing': '/analytics/reports',
  'reports/travel': '/analytics/reports',
  'reports/hotel': '/analytics/reports',
  'reports/hajj': '/analytics/reports'
};

const toNewScreen: CanActivateFn = (route) => {
  const config = inject(ConfigureService);
  const isVendor = (config.userRoles() ?? []).some((r: string) => r.startsWith('Vendor.'));
  const target = MOVED[route.routeConfig?.path ?? ''];
  let url = typeof target === 'string' ? target : isVendor ? target.vendor : target.admin;
  for (const [k, v] of Object.entries(route.params)) url = url.replace(`:${k}`, encodeURIComponent(v));
  return inject(Router).parseUrl(url);
};

/** Routes placed before the old ones, so each old address opens its new screen. */
export const LEGACY_REDIRECTS: Routes = Object.keys(MOVED).map((path) => ({ path, canActivate: [toNewScreen], children: [] }));
