import { Component, Injectable, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { PillSwitchComponent } from '../ui/controls';
import { StaffHttp } from '../core/staff-http';
import { fmtDate, fmtNum, fmtPct } from '../core/format';
import { BarsComponent, KpiTileComponent, ShareBarComponent } from 'src/app/demo/pages/staff-analytics/staff-ui';

/** One period of GET /api/staff/analytics/site-visits (SiteVisitsPeriodDto). */
export interface SiteVisitsPeriod {
  from: string;
  to: string;
  visitors: number;
  pageViews: number;
  newVisitors: number;
  changePct: number | null;
}

export interface SiteVisitsReport {
  countingSince: string | null;
  today: SiteVisitsPeriod;
  yesterday: SiteVisitsPeriod;
  weekToDate: SiteVisitsPeriod;
  lastWeekSameDays: SiteVisitsPeriod;
  monthToDate: SiteVisitsPeriod;
  lastMonthSameDays: SiteVisitsPeriod;
  days: SiteVisitsPeriod[];
  weeks: SiteVisitsPeriod[];
  months: SiteVisitsPeriod[];
  devices: { key: string; visitors: number; pct: number }[];
  sources: { key: string; visitors: number; pct: number }[];
}

@Injectable({ providedIn: 'root' })
export class SiteVisitsApi {
  private readonly http = inject(StaffHttp);

  report(): Observable<SiteVisitsReport> {
    return this.http.get<SiteVisitsReport>('/api/staff/analytics/site-visits');
  }
}

type Grain = 'days' | 'weeks' | 'months';

/** a-more-site-visits: visitors of trips.eg per day, week and month, each against the same days before. */
@Component({
  selector: 'ts-site-visits',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, KpiTileComponent, BarsComponent, ShareBarComponent, PillSwitchComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'WEB.siteVisits' | translate" [subtitle]="since()"></ts-appbar>
      <ts-loading *ngIf="!d && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ng-container *ngIf="d">
        <div *ngIf="!d.countingSince" class="ts-note ts-note--pending"><i class="ti ti-info-circle"></i>{{ 'WEB.svNotYet' | translate }}</div>
        <div class="ts-kpi-grid ts-kpi-grid--3">
          <ts-kpi icon="ti ti-eye" [label]="'WEB.svToday' | translate" [value]="num(d.today.visitors)" [delta]="d.today.changePct"
            [footnote]="'WEB.svBefore' | translate: { what: ('WEB.svYesterday' | translate), n: num(d.yesterday.visitors) }"></ts-kpi>
          <ts-kpi icon="ti ti-calendar-week" tone="revenue" [label]="'WEB.svThisWeek' | translate" [value]="num(d.weekToDate.visitors)" [delta]="d.weekToDate.changePct"
            [footnote]="'WEB.svBefore' | translate: { what: ('WEB.svLastWeekSameDays' | translate), n: num(d.lastWeekSameDays.visitors) }"></ts-kpi>
          <ts-kpi icon="ti ti-calendar-month" tone="expense" [label]="'WEB.svThisMonth' | translate" [value]="num(d.monthToDate.visitors)" [delta]="d.monthToDate.changePct"
            [footnote]="'WEB.svBefore' | translate: { what: ('WEB.svLastMonthSameDays' | translate), n: num(d.lastMonthSameDays.visitors) }"></ts-kpi>
          <ts-kpi icon="ti ti-user-plus" [label]="'WEB.svNewThisMonth' | translate" [value]="num(d.monthToDate.newVisitors)"
            [footnote]="'WEB.svPagesN' | translate: { n: num(d.monthToDate.pageViews) }"></ts-kpi>
        </div>

        <ts-card [title]="'WEB.svVisitors' | translate" icon="ti ti-chart-bar">
          <ts-pill-switch [items]="grains" [selected]="grain" (selectedChange)="grain = $any($event)"></ts-pill-switch>
          <ts-bars [values]="values()" [labels]="labels()" color="var(--ts-navy)" style="display: block; margin-top: 12px"></ts-bars>
          <p class="ts-muted" style="margin: 8px 0 0; font-size: 12.5px">{{ 'WEB.svDistinctNote' | translate }}</p>
        </ts-card>

        <ts-card [title]="'WEB.svCompare' | translate" icon="ti ti-arrows-diff">
          <div class="ts-sv-table">
            <div class="ts-sv-row ts-sv-row--head">
              <span>{{ (grain === 'days' ? 'APP.day' : grain === 'weeks' ? 'APP.week' : 'APP.month') | translate }}</span>
              <span>{{ 'WEB.svVisitors' | translate }}</span>
              <span>{{ 'WEB.svNew' | translate }}</span>
              <span>{{ 'WEB.svPages' | translate }}</span>
              <span>{{ 'WEB.svChange' | translate }}</span>
            </div>
            <div class="ts-sv-row" *ngFor="let p of rows()">
              <span>{{ periodLabel(p) }}</span>
              <span class="ts-num"><strong>{{ num(p.visitors) }}</strong></span>
              <span class="ts-num">{{ num(p.newVisitors) }}</span>
              <span class="ts-num">{{ num(p.pageViews) }}</span>
              <span class="ts-num" [class.ts-up]="(p.changePct ?? 0) > 0" [class.ts-down]="(p.changePct ?? 0) < 0">{{ change(p.changePct) }}</span>
            </div>
          </div>
        </ts-card>

        <ts-card [title]="'WEB.svDevices' | translate" icon="ti ti-devices">
          <ts-share-bar [parts]="deviceParts()"></ts-share-bar>
        </ts-card>

        <ts-card [title]="'WEB.svSources' | translate" icon="ti ti-route">
          <ts-empty *ngIf="!d.sources.length" icon="ti ti-route" [message]="'WEB.svNoData' | translate"></ts-empty>
          <ts-info *ngFor="let s of d.sources" [label]="sourceLabel(s.key)" [value]="num(s.visitors) + ' · ' + pct(s.pct)"></ts-info>
        </ts-card>
      </ng-container>
    </div>
  `,
  styles: [
    `
      .ts-sv-table {
        display: grid;
        gap: 2px;
        font-size: 13.5px;
      }
      .ts-sv-row {
        display: grid;
        grid-template-columns: minmax(96px, 1.6fr) repeat(4, minmax(48px, 1fr));
        gap: 8px;
        align-items: center;
        padding: 8px 4px;
        border-bottom: 1px solid var(--ts-line);
      }
      .ts-sv-row--head {
        color: var(--ts-ink-faint);
        font-size: 12px;
        font-weight: 600;
      }
      .ts-up {
        color: var(--ts-ok, #1e8e5a);
      }
      .ts-down {
        color: var(--ts-danger, #c0362c);
      }
    `
  ]
})
export class SiteVisitsComponent implements OnInit {
  private readonly api = inject(SiteVisitsApi);
  private readonly text = inject(StaffText);
  num = fmtNum;
  pct = (v: number | null | undefined) => fmtPct(v);
  d: SiteVisitsReport | null = null;
  error: unknown = null;
  grain: Grain = 'days';
  /** A getter: read when the field was created, the labels came out as keys before the translations had loaded. */
  get grains() {
    return [
      { key: 'days', label: this.text.tr('WEB.svDaily') },
      { key: 'weeks', label: this.text.tr('WEB.svWeekly') },
      { key: 'months', label: this.text.tr('WEB.svMonthly') }
    ];
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.error = null;
    this.api.report().subscribe({ next: (d) => (this.d = d), error: (e) => (this.error = e) });
  }

  since(): string {
    return this.d?.countingSince ? this.text.tr('WEB.svCountingSince', { date: fmtDate(this.d.countingSince, this.text.arabic) }) : '';
  }

  private series(): SiteVisitsPeriod[] {
    return this.d ? this.d[this.grain] : [];
  }

  values(): number[] {
    return this.series().map((p) => p.visitors);
  }

  labels(): string[] {
    return this.series().map((p) => this.shortLabel(p));
  }

  /** Newest first, for the comparison table. */
  rows(): SiteVisitsPeriod[] {
    return [...this.series()].reverse();
  }

  private shortLabel(p: SiteVisitsPeriod): string {
    const [y, m, d] = p.from.split('-').map(Number);
    if (this.grain === 'months') return new Intl.DateTimeFormat(this.text.arabic ? 'ar-EG' : 'en-GB', { month: 'short' }).format(new Date(y, m - 1, 1));
    // 30 bars leave room for the day only; the month shows on the 1st
    if (this.grain === 'days') return d === 1 ? `${d}/${m}` : `${d}`;
    return `${d}/${m}`;
  }

  periodLabel(p: SiteVisitsPeriod): string {
    const [y, m] = p.from.split('-').map(Number);
    if (this.grain === 'months')
      return new Intl.DateTimeFormat(this.text.arabic ? 'ar-EG' : 'en-GB', { month: 'long', year: 'numeric' }).format(new Date(y, m - 1, 1));
    if (this.grain === 'weeks') return `${p.from.split('-').slice(1).reverse().map(Number).join('/')} – ${p.to.split('-').slice(1).reverse().map(Number).join('/')}`;
    return fmtDate(p.from, this.text.arabic);
  }

  change(v: number | null): string {
    return fmtPct(v, true);
  }

  deviceParts(): { label: string; value: number; color: string }[] {
    const colors: Record<string, string> = { phone: 'var(--ts-navy)', tablet: 'var(--ts-teal)', desktop: 'var(--ts-hajj)' };
    return (this.d?.devices ?? []).map((x) => ({ label: `WEB.svDevice_${x.key}`, value: x.visitors, color: colors[x.key] ?? 'var(--ts-ink-faint)' }));
  }

  sourceLabel(key: string): string {
    const known = ['direct', 'google', 'facebook', 'instagram', 'tiktok', 'whatsapp', 'youtube', 'bing', 'twitter', 'snapchat'];
    return known.includes(key) ? this.text.tr(`WEB.svSource_${key}`) : key;
  }
}
