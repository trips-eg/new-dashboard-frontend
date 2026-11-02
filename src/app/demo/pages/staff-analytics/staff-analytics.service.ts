import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

/** The date range of the analytics screens, like the chips at the top of the Staff app. */
export type RangeKey = 'today' | 'week' | 'month' | 'quarter' | 'last28';

export interface Range {
  key: RangeKey;
  from: Date;
  to: Date;
}

export interface Kpi {
  key: string;
  value: number;
  previous: number;
  changePct: number | null;
}

/** AnalyticsTodayDto: the admin "needs action" counts, or the vendor's own numbers. */
export interface Today {
  bookings: number;
  revenue: number;
  bookingsChangePct: number | null;
  instaPayPending: number | null;
  customRequestsOpen: number | null;
  customRequestsNoOffers: number | null;
  reviewsToReply: number | null;
  settlementsDue: number | null;
  settlementsDueAmount: number | null;
  settlementsOverdue60: number | null;
  settlementsOverdue60Amount: number | null;
  productsPendingReview: number | null;
  productsExpiredVisible: number | null;
  activeUsersToday: number | null;
  departingToday: number | null;
  scannedToday: number | null;
  remainingDue: number | null;
  rating: number | null;
  ratingsCount: number | null;
}

export interface Overview {
  kpis: Kpi[];
  today: Today;
  range: { from: string; to: string };
}

export interface SeriesPoint {
  period: string;
  label: string;
  bookings: number;
  revenue: number;
  tripsProfit: number;
}

export interface ModuleStat {
  module: number;
  label: string;
  bookings: number;
  revenue: number;
  tripsProfit: number;
  cancelRatePct: number;
  avgBookingValue: number;
  share: number;
}

export interface Ranked {
  itemType: number;
  itemId: number;
  name: string;
  vendorName: string | null;
  bookings: number;
  revenue: number;
  cancelRatePct: number;
  rating: number | null;
  alert: string | null;
}

export interface Departure {
  itemType: number;
  itemId: number;
  name: string;
  startTime: string | null;
  gatheringPoint: string | null;
  bookings: number;
  travellers: number;
  checkedIn: number | null;
}

export interface Subscription {
  reportKey: string;
  format: string;
  day: number;
  hour: number;
  isActive: boolean;
}

/** The modules in the order and colours of the Staff app (ItemType). */
export const MODULES: Record<number, { key: string; color: string; bg: string; icon: string }> = {
  1: { key: 'STAFF_UI.TRIPS', color: 'var(--ts-trip)', bg: 'var(--ts-trip-bg)', icon: 'ti ti-plane' },
  2: { key: 'STAFF_UI.OUTINGS', color: 'var(--ts-outing)', bg: 'var(--ts-outing-bg)', icon: 'ti ti-compass' },
  3: { key: 'STAFF_UI.HOTELS', color: 'var(--ts-hotel)', bg: 'var(--ts-hotel-bg)', icon: 'ti ti-building' },
  4: { key: 'STAFF_UI.HAJJ', color: 'var(--ts-hajj)', bg: 'var(--ts-hajj-bg)', icon: 'ti ti-moon' }
};

export function moduleOf(type: number) {
  return MODULES[type] ?? MODULES[1];
}

function dayOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function presetRange(key: RangeKey): Range {
  const today = dayOnly(new Date());
  switch (key) {
    case 'today':
      return { key, from: today, to: today };
    case 'week':
      return { key, from: addDays(today, -6), to: today };
    case 'month':
      return { key, from: new Date(today.getFullYear(), today.getMonth(), 1), to: today };
    case 'quarter':
      return { key, from: addDays(today, -89), to: today };
    default:
      return { key: 'last28', from: addDays(today, -27), to: today };
  }
}

/** yyyy-MM-dd in local time, as the API reads it. */
export function apiDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * The /api/staff analytics endpoints the TRIPS Staff app reads (StaffAnalyticsController and the search part of
 * StaffAdminController). All read only except the weekly email subscription. The backend scopes a vendor to the
 * company in the token, so no companyId is sent.
 */
@Injectable({ providedIn: 'root' })
export class StaffAnalyticsService {
  private readonly base = environment.apiUrl + 'staff/';

  /** The range picked on any analytics screen, kept for the others (analyticsRangeProvider in the app). */
  readonly range$ = new BehaviorSubject<Range>(presetRange('last28'));

  constructor(private http: HttpClient) {}

  private params(r: Range, extra: Record<string, string | number | boolean> = {}): HttpParams {
    let p = new HttpParams().set('from', apiDate(r.from)).set('to', apiDate(r.to));
    for (const [k, v] of Object.entries(extra)) p = p.set(k, String(v));
    return p;
  }

  private get<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http.get<{ data: T }>(this.base + path, { params }).pipe(map((res) => res.data));
  }

  overview(r: Range): Observable<Overview> {
    return this.get('analytics/overview', this.params(r));
  }

  series(r: Range, groupBy: 'day' | 'week' | 'month'): Observable<SeriesPoint[]> {
    return this.get<{ points: SeriesPoint[] }>('analytics/series', this.params(r, { groupBy })).pipe(map((d) => d?.points ?? []));
  }

  modules(r: Range): Observable<ModuleStat[]> {
    return this.get('analytics/modules', this.params(r));
  }

  ranking(r: Range, order: 'top' | 'bottom' = 'top', take = 5): Observable<Ranked[]> {
    return this.get('analytics/products/ranking', this.params(r, { order, take }));
  }

  engagement(r: Range): Observable<any> {
    return this.get('analytics/engagement', this.params(r));
  }

  funnel(r: Range): Observable<any> {
    return this.get('analytics/funnel', this.params(r));
  }

  patterns(r: Range): Observable<any> {
    return this.get('analytics/booking-patterns', this.params(r));
  }

  customTrips(r: Range): Observable<any> {
    return this.get('analytics/custom-trips', this.params(r));
  }

  vendorPerformance(companyId: number, r: Range): Observable<any> {
    return this.get(`analytics/vendors/${companyId}/performance`, this.params(r));
  }

  departuresToday(): Observable<Departure[]> {
    return this.get('analytics/departures/today');
  }

  search(tab: string, r: Range, page = 1): Observable<any> {
    return this.get('search/analytics', this.params(r, { tab, pageIndex: page, pageSize: 30 }));
  }

  demandGaps(r: Range): Observable<any[]> {
    return this.get('analytics/demand-gaps', this.params(r, { take: 10 }));
  }

  subscriptions(): Observable<Subscription[]> {
    return this.get('reports/subscriptions');
  }

  saveSubscription(key: string, body: { format: string; day: number; hour: number; isActive: boolean }): Observable<unknown> {
    return this.http.put(this.base + `reports/subscriptions/${key}`, body);
  }

  /** GET analytics/export: the xlsx or pdf the backend builds; errors come back as ApiResponse JSON. */
  export(report: string, format: 'xlsx' | 'pdf', r: Range): Observable<{ blob: Blob; fileName: string }> {
    return this.http
      .get(this.base + 'analytics/export', { params: this.params(r, { report, format }), responseType: 'blob', observe: 'response' })
      .pipe(
        map((res) => {
          const cd = res.headers.get('content-disposition') ?? '';
          const name = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd)?.[1];
          // Content-Disposition is not exposed to other origins, so the name falls back to the report and the range
          return { blob: res.body as Blob, fileName: name ? decodeURIComponent(name) : `trips-${report}-${apiDate(r.from)}_${apiDate(r.to)}.${format}` };
        })
      );
  }
}
