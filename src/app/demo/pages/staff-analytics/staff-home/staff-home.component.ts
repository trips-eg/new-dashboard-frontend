import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, forkJoin } from 'rxjs';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import {
  Departure,
  ModuleStat,
  Overview,
  Ranked,
  RangeKey,
  SeriesPoint,
  StaffAnalyticsService,
  moduleOf,
  presetRange
} from '../staff-analytics.service';
import { STAFF_UI, fmtCompact, fmtNum } from '../staff-ui';

interface AdminHome {
  overview: Overview;
  monthly: SeriesPoint[];
  modules: ModuleStat[];
  top: Ranked[];
  daily: SeriesPoint[];
}

interface VendorHome {
  today: Overview;
  month: Overview;
  departures: Departure[];
}

/**
 * The home of the TRIPS Staff app on the web: the admin's a-home (today, what needs action, charts) or the
 * vendor's MobileVendorHome (who leaves today and the vendor's own numbers). Same /api/staff/analytics calls.
 */
@Component({
  selector: 'app-staff-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...STAFF_UI],
  templateUrl: './staff-home.component.html'
})
export class StaffHomeComponent implements OnInit {
  private readonly api = inject(StaffAnalyticsService);
  private readonly config = inject(ConfigureService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isVendor = this.config.userRoles().some((r: string) => r.startsWith('Vendor.'));
  readonly canScan = this.config.userPermissions().includes('Permissions.Scanner.View');
  readonly companyId = this.config.vendorId();
  readonly username = this.config.UserName() ?? '';

  period: RangeKey = 'month';
  loading = true;
  failed = false;
  admin?: AdminHome;
  vendor?: VendorHome;
  today = '';

  private request?: Subscription;
  readonly moduleOf = moduleOf;
  readonly fmtNum = fmtNum;
  readonly fmtCompact = fmtCompact;

  ngOnInit(): void {
    this.setToday();
    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.setToday());
    this.load();
  }

  setPeriod(p: RangeKey): void {
    if (p === this.period) return;
    this.period = p;
    this.load();
  }

  load(): void {
    this.request?.unsubscribe();
    this.loading = true;
    this.failed = false;
    if (this.isVendor) {
      this.request = forkJoin({
        today: this.api.overview(presetRange('today')),
        month: this.api.overview(presetRange('month')),
        departures: this.api.departuresToday()
      }).subscribe({ next: (d) => this.done(() => (this.vendor = d)), error: () => this.fail() });
      return;
    }
    const now = new Date();
    const range = presetRange(this.period);
    const year = { key: range.key, from: new Date(now.getFullYear() - 1, now.getMonth(), 1), to: now };
    const twoWeeks = { key: range.key, from: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13), to: now };
    this.request = forkJoin({
      overview: this.api.overview(range),
      monthly: this.api.series(year, 'month'),
      modules: this.api.modules(range),
      top: this.api.ranking(range, 'top', 5),
      daily: this.api.series(twoWeeks, 'day')
    }).subscribe({ next: (d) => this.done(() => (this.admin = d)), error: () => this.fail() });
  }

  private done(apply: () => void): void {
    apply();
    this.loading = false;
  }

  private fail(): void {
    this.loading = false;
    this.failed = true;
  }

  private setToday(): void {
    const ar = this.translate.currentLang === 'ar';
    this.today = new Intl.DateTimeFormat(ar ? 'ar-EG-u-nu-latn' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  }

  kpi(o: Overview | undefined, key: string) {
    return o?.kpis?.find((k) => k.key === key);
  }

  spark(points: SeriesPoint[] | undefined, field: 'bookings' | 'revenue'): number[] {
    return (points ?? []).map((p) => p[field]);
  }

  labels(points: SeriesPoint[] | undefined): string[] {
    return (points ?? []).map((p) => p.label);
  }

  get travellers(): number {
    return (this.vendor?.departures ?? []).reduce((a, d) => a + (d.travellers || 0), 0);
  }

  get shareParts() {
    return (this.admin?.modules ?? []).map((m) => ({ label: moduleOf(m.module).key, value: m.revenue, color: moduleOf(m.module).color }));
  }
}
