import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputSwitchModule } from 'primeng/inputswitch';
import { Observable, Subscription, catchError, forkJoin, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { Kpi, Range, RangeKey, StaffAnalyticsService, Subscription as ReportSubscription, moduleOf, presetRange } from '../staff-analytics.service';
import { STAFF_UI, fmtCompact, fmtNum, fmtPct } from '../staff-ui';

export type AnalyticsView = 'growth' | 'sales' | 'custom' | 'reports';

/** Where a number leads (kpiTarget in the app): the dashboard list of the records behind it. */
const ADMIN_TARGET: Record<string, string> = {
  bookings: '/all-reservations',
  cancelRatePct: '/all-reservations',
  revenue: '/walletTransactions',
  tripsProfit: '/walletTransactions',
  avgBookingValue: '/walletTransactions',
  newCustomers: '/customers',
  repeatCustomersPct: '/customers',
  users: '/customers'
};

const KPI_ICON: Record<string, string> = {
  bookings: 'ti ti-ticket',
  revenue: 'ti ti-cash',
  tripsProfit: 'ti ti-trending-up',
  cancelRatePct: 'ti ti-circle-x',
  newCustomers: 'ti ti-user-plus',
  repeatCustomersPct: 'ti ti-repeat',
  avgBookingValue: 'ti ti-calculator'
};

const KPI_TONE: Record<string, string> = {
  revenue: 'revenue',
  tripsProfit: 'success',
  cancelRatePct: 'expense',
  bookings: 'info',
  newCustomers: 'info',
  repeatCustomersPct: 'info'
};

const KPI_LABEL: Record<string, string> = {
  bookings: 'STAFF_UI.BOOKINGS',
  revenue: 'STAFF_UI.REVENUE',
  tripsProfit: 'STAFF_UI.TRIPS_PROFIT',
  cancelRatePct: 'STAFF_UI.CANCEL_RATE',
  newCustomers: 'STAFF_UI.NEW_CUSTOMERS',
  repeatCustomersPct: 'STAFF_UI.REPEAT_CUSTOMERS',
  avgBookingValue: 'STAFF_UI.AVG_BOOKING_VALUE'
};

const STEP_LABEL: Record<string, string> = {
  registered: 'STAFF_UI.STEP_REGISTERED',
  searched: 'STAFF_UI.STEP_SEARCHED',
  viewed: 'STAFF_UI.STEP_VIEWED',
  started: 'STAFF_UI.STEP_STARTED',
  paid: 'STAFF_UI.STEP_PAID'
};

/**
 * The analytics screens of the TRIPS Staff app: growth (a-analytics), search and sales (a-analytics-search),
 * custom trips (a-custom-analytics), reports (a-reports), and the vendor's own numbers (v-analytics).
 * The screen comes from the route data; the range is shared by all of them.
 */
@Component({
  selector: 'app-staff-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, InputSwitchModule, ...STAFF_UI],
  templateUrl: './staff-analytics.component.html'
})
export class StaffAnalyticsComponent implements OnInit {
  private readonly api = inject(StaffAnalyticsService);
  private readonly config = inject(ConfigureService);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastrService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isVendor = this.config.userRoles().some((r: string) => r.startsWith('Vendor.'));
  readonly canCoupons = this.config.userPermissions().includes('Permissions.Coupons.Create');
  readonly companyId: number | null = this.config.vendorId();

  view: AnalyticsView = 'growth';
  range: Range = this.api.range$.value;
  loading = true;
  failed = false;
  data: any = null;

  subscription: ReportSubscription | null = null;
  busyExport: string | null = null;
  readonly days = ['STAFF_UI.SUN', 'STAFF_UI.MON', 'STAFF_UI.TUE', 'STAFF_UI.WED', 'STAFF_UI.THU', 'STAFF_UI.FRI', 'STAFF_UI.SAT'];
  readonly hours = [7, 9, 12, 18];

  private request?: Subscription;
  readonly moduleOf = moduleOf;
  readonly fmtNum = fmtNum;
  readonly fmtCompact = fmtCompact;
  readonly fmtPct = fmtPct;

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((d) => {
      this.view = (d['view'] as AnalyticsView) ?? 'growth';
      this.load();
    });
  }

  /** Search, sales and custom trips are admin screens (the backend refuses vendors with 403). */
  get adminOnly(): boolean {
    return this.isVendor && (this.view === 'sales' || this.view === 'custom');
  }

  get reports(): { key: string; label: string }[] {
    return [
      { key: 'overview', label: 'STAFF_UI.REPORT_OVERVIEW' },
      { key: 'series', label: 'STAFF_UI.REPORT_SERIES' },
      { key: 'modules', label: 'STAFF_UI.REPORT_MODULES' },
      { key: 'weekly-summary', label: 'STAFF_UI.WEEKLY_SUMMARY' },
      ...(!this.isVendor && this.canCoupons ? [{ key: 'coupons', label: 'STAFF_UI.COUPONS' }] : []),
      ...(!this.isVendor ? [{ key: 'search', label: 'STAFF_UI.SEARCH' }] : [])
    ];
  }

  setRange(key: RangeKey): void {
    this.range = presetRange(key);
    this.api.range$.next(this.range);
    this.load();
  }

  load(): void {
    this.request?.unsubscribe();
    this.data = null;
    this.failed = false;
    if (this.adminOnly) {
      this.loading = false;
      return;
    }
    this.loading = true;
    const r = this.range;
    let source: Observable<any>;
    switch (this.view) {
      case 'sales':
        source = forkJoin({
          modules: this.api.modules(r),
          search: this.api.search('top', r),
          gaps: this.api.demandGaps(r),
          top: this.api.ranking(r, 'top', 5),
          bottom: this.api.ranking(r, 'bottom', 5)
        });
        break;
      case 'custom':
        source = this.api.customTrips(r);
        break;
      case 'reports':
        source = this.api.subscriptions().pipe(catchError(() => of([])));
        break;
      default:
        source = this.isVendor
          ? forkJoin({
              overview: this.api.overview(r),
              series: this.api.series(r, 'week'),
              performance: this.companyId ? this.api.vendorPerformance(this.companyId, r).pipe(catchError(() => of(null))) : of(null),
              top: this.api.ranking(r, 'top', 5)
            })
          : forkJoin({
              overview: this.api.overview(r),
              series: this.api.series(r, 'day'),
              engagement: this.api.engagement(r),
              funnel: this.api.funnel(r),
              patterns: this.api.patterns(r)
            });
    }
    this.request = source.subscribe({
      next: (d) => {
        if (this.view === 'reports') this.subscription = (d as ReportSubscription[])?.[0] ?? null;
        else this.data = d;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.failed = true;
      }
    });
  }

  // ---- KPI helpers ----
  kpis(): Kpi[] {
    const all: Kpi[] = this.data?.overview?.kpis ?? [];
    return this.isVendor ? all.filter((k) => ['bookings', 'revenue', 'cancelRatePct', 'avgBookingValue'].includes(k.key)) : all;
  }

  kpiLabel(k: Kpi): string {
    return KPI_LABEL[k.key] ?? k.key;
  }

  kpiIcon(k: Kpi): string {
    return KPI_ICON[k.key] ?? 'ti ti-chart-line';
  }

  kpiTone(k: Kpi): any {
    return KPI_TONE[k.key] ?? 'neutral';
  }

  kpiValue(k: Kpi): string {
    return k.key.endsWith('Pct') ? fmtPct(k.value) : fmtCompact(k.value);
  }

  kpiLink(k: Kpi): string | null {
    return this.isVendor ? (k.key === 'bookings' || k.key === 'cancelRatePct' ? '/all-reservations' : null) : (ADMIN_TARGET[k.key] ?? null);
  }

  // ---- chart helpers ----
  values(list: any[] | undefined, field: string): number[] {
    return (list ?? []).map((x) => Number(x?.[field]) || 0);
  }

  labels(list: any[] | undefined, field: string, lastPart = false): string[] {
    return (list ?? []).map((x) => {
      const v = String(x?.[field] ?? '');
      return lastPart ? v.split('-').pop() ?? v : v;
    });
  }

  stepLabel(key: string): string {
    return STEP_LABEL[key] ?? key;
  }

  firstStep(): number {
    return Math.max(this.data?.funnel?.steps?.[0]?.count ?? 1, 1);
  }

  maxCount(list: any[] | undefined, field: string): number {
    return Math.max(...(list ?? []).map((x) => Number(x?.[field]) || 0), 1);
  }

  shareParts() {
    return (this.data?.modules ?? []).map((m: any) => ({ label: moduleOf(m.module).key, value: m.revenue, color: moduleOf(m.module).color }));
  }

  // ---- reports ----
  export(report: string, format: 'xlsx' | 'pdf'): void {
    this.busyExport = `${report}.${format}`;
    this.api.export(report, format, this.range).subscribe({
      next: ({ blob, fileName }) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        this.busyExport = null;
      },
      error: () => {
        this.busyExport = null;
        this.toast.error('', this.translate.instant('STAFF_UI.EXPORT_FAILED'));
      }
    });
  }

  saveSubscription(change: Partial<ReportSubscription>): void {
    const s = this.subscription;
    if (!s) return;
    const next = { ...s, ...change };
    this.api.saveSubscription(s.reportKey, { format: next.format, day: next.day, hour: next.hour, isActive: next.isActive }).subscribe({
      next: () => (this.subscription = next),
      error: () => this.toast.error('', this.translate.instant('STAFF_UI.SAVE_FAILED'))
    });
  }
}
