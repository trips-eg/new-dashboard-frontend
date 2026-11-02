import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RangeKey } from './staff-analytics.service';

// Number formats of the Staff app (core/utils/format.dart), with Latin digits in both languages.
const intFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const decFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });

export function fmtNum(v: number | null | undefined): string {
  if (v == null) return '—';
  return v % 1 === 0 ? intFmt.format(v) : decFmt.format(v);
}

/** 2,480,000 → 2.48M · 135,700 → 135.7K (KPI tiles). */
export function fmtCompact(v: number | null | undefined): string {
  if (v == null) return '—';
  const a = Math.abs(v);
  let s: string;
  if (a >= 1e6) s = `${decFmt.format(a / 1e6)}M`;
  else if (a >= 1e4) s = `${decFmt.format(Math.round((a / 1e3) * 10) / 10)}K`;
  else s = intFmt.format(a);
  return v < 0 ? `−${s}` : s;
}

export function fmtPct(v: number | null | undefined, signed = false): string {
  if (v == null) return '—';
  const s = decFmt.format(Math.abs(v));
  return signed ? `${v >= 0 ? '+' : '−'}${s}%` : `${s}%`;
}

@Pipe({ name: 'tsNum', standalone: true })
export class TsNumPipe implements PipeTransform {
  transform(v: number | null | undefined, mode: 'num' | 'compact' | 'pct' | 'signed' = 'num'): string {
    switch (mode) {
      case 'compact':
        return fmtCompact(v);
      case 'pct':
        return fmtPct(v);
      case 'signed':
        return fmtPct(v, true);
      default:
        return fmtNum(v);
    }
  }
}

/** A small line without axes (Sparkline in the app). */
@Component({
  selector: 'ts-sparkline',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg *ngIf="values.length > 1" class="ts-spark" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
      <polyline [attr.points]="points" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" />
    </svg>
  `
})
export class SparklineComponent {
  @Input() values: number[] = [];

  get points(): string {
    const max = Math.max(...this.values, 1);
    const min = Math.min(...this.values, 0);
    const span = max - min || 1;
    const step = 100 / (this.values.length - 1);
    return this.values.map((v, i) => `${(i * step).toFixed(2)},${(26 - ((v - min) / span) * 24).toFixed(2)}`).join(' ');
  }
}

export type Tone = 'neutral' | 'revenue' | 'success' | 'expense' | 'pending' | 'info' | 'inactive' | 'brand';

/** KpiTile of the app: an icon chip, the label, the number, and the change against the period before. */
@Component({
  selector: 'ts-kpi',
  standalone: true,
  imports: [CommonModule, RouterModule, TsNumPipe, SparklineComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a *ngIf="link; else plain" class="ts-kpi ts-tone-{{ tone }}" [routerLink]="link">
      <ng-container *ngTemplateOutlet="body"></ng-container>
    </a>
    <ng-template #plain>
      <div class="ts-kpi ts-tone-{{ tone }}"><ng-container *ngTemplateOutlet="body"></ng-container></div>
    </ng-template>
    <ng-template #body>
      <div class="ts-kpi__head">
        <span class="ts-kpi__icon" *ngIf="icon" aria-hidden="true"><i [class]="icon"></i></span>
        <span class="ts-kpi__label">{{ label }}</span>
        <i *ngIf="link" class="ti ti-chevron-right ts-kpi__go" aria-hidden="true"></i>
      </div>
      <div class="ts-kpi__value">{{ value }}</div>
      <div class="ts-kpi__foot">
        <span *ngIf="delta != null" class="ts-delta" [class.is-good]="(delta >= 0) === deltaUp" [class.is-bad]="(delta >= 0) !== deltaUp">
          {{ delta >= 0 ? '↑' : '↓' }} {{ (delta < 0 ? -delta : delta) | tsNum: 'pct' }}
        </span>
        <span *ngIf="footnote" class="ts-kpi__note">{{ footnote }}</span>
        <ts-sparkline *ngIf="spark?.length" [values]="spark"></ts-sparkline>
      </div>
    </ng-template>
  `
})
export class KpiTileComponent {
  @Input() label = '';
  @Input() value = '—';
  @Input() icon?: string;
  @Input() tone: Tone = 'neutral';
  @Input() delta: number | null = null;
  @Input() deltaUp = true;
  @Input() footnote?: string | null;
  @Input() link?: string | any[] | null;
  @Input() spark?: number[];
}

/** The range chips at the top of every analytics screen. */
@Component({
  selector: 'ts-range-bar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ts-chips" role="group" [attr.aria-label]="'STAFF_UI.PERIOD' | translate">
      <button
        type="button"
        *ngFor="let k of keys"
        class="ts-chip"
        [class.is-selected]="k.key === selected"
        [attr.aria-pressed]="k.key === selected"
        (click)="selectedChange.emit(k.key)"
      >
        {{ k.label | translate }}
      </button>
    </div>
  `
})
export class RangeBarComponent {
  @Input() selected: RangeKey = 'last28';
  @Input() keys: { key: RangeKey; label: string }[] = [
    { key: 'last28', label: 'STAFF_UI.LAST_28_DAYS' },
    { key: 'week', label: 'STAFF_UI.LAST_7_DAYS' },
    { key: 'month', label: 'STAFF_UI.THIS_MONTH' },
    { key: 'quarter', label: 'STAFF_UI.LAST_3_MONTHS' }
  ];
  @Output() selectedChange = new EventEmitter<RangeKey>();
}

/** A line with a soft area and month/day labels (TrendChart in the app). */
@Component({
  selector: 'ts-trend-chart',
  standalone: true,
  imports: [CommonModule, TsNumPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ts-trend" *ngIf="values.length; else empty">
      <svg viewBox="0 0 600 180" preserveAspectRatio="none" role="img" [attr.aria-label]="ariaLabel">
        <line *ngFor="let g of grid" x1="0" x2="600" [attr.y1]="g" [attr.y2]="g" class="ts-trend__grid" />
        <path [attr.d]="areaPath" class="ts-trend__area" />
        <path [attr.d]="linePath" class="ts-trend__line" vector-effect="non-scaling-stroke" />
      </svg>
      <div class="ts-trend__max">{{ max | tsNum }}</div>
      <div class="ts-trend__labels">
        <span *ngFor="let l of shownLabels">{{ l }}</span>
      </div>
    </div>
    <ng-template #empty><p class="ts-empty-note">—</p></ng-template>
  `
})
export class TrendChartComponent {
  @Input() values: number[] = [];
  @Input() labels: string[] = [];
  @Input() ariaLabel = '';
  readonly grid = [45, 90, 135];

  get max(): number {
    return Math.max(...this.values, 0);
  }

  private xy(): [number, number][] {
    const max = Math.max(this.max, 1);
    const n = this.values.length;
    const step = n > 1 ? 600 / (n - 1) : 0;
    return this.values.map((v, i) => [n > 1 ? i * step : 300, 172 - (v / max) * 160]);
  }

  get linePath(): string {
    return this.xy()
      .map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(' ');
  }

  get areaPath(): string {
    const pts = this.xy();
    if (!pts.length) return '';
    return `${this.linePath} L${pts[pts.length - 1][0].toFixed(1)},180 L${pts[0][0].toFixed(1)},180 Z`;
  }

  /** At most six labels so they never overlap. */
  get shownLabels(): string[] {
    const n = this.labels.length;
    if (n <= 6) return this.labels;
    const every = Math.ceil(n / 6);
    return this.labels.filter((_, i) => i % every === 0 || i === n - 1);
  }
}

/** Vertical bars with a label under each (Bars in the app). */
@Component({
  selector: 'ts-bars',
  standalone: true,
  imports: [CommonModule, TsNumPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ts-bars" *ngIf="values.length; else empty">
      <div class="ts-bars__col" *ngFor="let v of values; let i = index" [title]="(labels[i] || '') + ': ' + (v | tsNum)">
        <span class="ts-bars__val">{{ v | tsNum: 'compact' }}</span>
        <span class="ts-bars__bar" [style.height.%]="pct(v)" [style.background]="color"></span>
        <span class="ts-bars__label">{{ labels[i] }}</span>
      </div>
    </div>
    <ng-template #empty><p class="ts-empty-note">—</p></ng-template>
  `
})
export class BarsComponent {
  @Input() values: number[] = [];
  @Input() labels: string[] = [];
  @Input() color = 'var(--ts-navy)';

  pct(v: number): number {
    const max = Math.max(...this.values, 1);
    return Math.max((v / max) * 100, v > 0 ? 3 : 0);
  }
}

/** One bar split by share, with a legend (ShareBar in the app). */
@Component({
  selector: 'ts-share-bar',
  standalone: true,
  imports: [CommonModule, TranslateModule, TsNumPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ts-share" *ngIf="total > 0; else empty">
      <div class="ts-share__bar">
        <span *ngFor="let p of parts" [style.flex-grow]="p.value" [style.background]="p.color" [title]="(p.label | translate) + ': ' + (p.value | tsNum)"></span>
      </div>
      <ul class="ts-share__legend">
        <li *ngFor="let p of parts">
          <i [style.background]="p.color" aria-hidden="true"></i>
          <span>{{ p.label | translate }}</span>
          <strong>{{ (p.value / total) * 100 | tsNum: 'pct' }}</strong>
        </li>
      </ul>
    </div>
    <ng-template #empty><p class="ts-empty-note">{{ 'STAFF_UI.NOTHING_YET' | translate }}</p></ng-template>
  `
})
export class ShareBarComponent {
  @Input() parts: { label: string; value: number; color: string }[] = [];

  get total(): number {
    return this.parts.reduce((a, p) => a + (p.value || 0), 0);
  }
}

/** A thin progress line (ProgressLine in the app). */
@Component({
  selector: 'ts-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="ts-progress"><span [style.width.%]="width" [style.background]="color"></span></span>`
})
export class ProgressLineComponent {
  @Input() value = 0;
  @Input() color = 'var(--ts-accent)';

  get width(): number {
    return Math.max(0, Math.min(1, this.value || 0)) * 100;
  }
}

export const STAFF_UI = [
  TsNumPipe,
  KpiTileComponent,
  RangeBarComponent,
  SparklineComponent,
  TrendChartComponent,
  BarsComponent,
  ShareBarComponent,
  ProgressLineComponent
] as const;
