import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription, debounceTime, firstValueFrom } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { ChipBarComponent, LISTS } from '../ui/lists';
import { PillSwitchComponent, SearchPickerComponent, SwitchRowComponent } from '../ui/controls';
import { SheetComponent, StaffDialogs } from '../ui/dialogs';
import { StaffHttp, mediaUrl } from '../core/staff-http';
import { PagedList } from '../core/query';
import { P, StaffSession } from '../core/session';
import { apiDate, fmtNum, latinDigits, parseAmount } from '../core/format';
import { FORM_KIT, formDate } from '../forms/form-kit';
import { CatalogItem, CatalogItemsComponent } from '../forms/home-content-forms.component';
import { CommissionSheetComponent } from '../products/commission-sheet.component';
import { bookingsLink } from '../bookings/bookings-api';
import { BarsComponent, KpiTileComponent, RangeBarComponent } from 'src/app/demo/pages/staff-analytics/staff-ui';
import { Range, RangeKey, presetRange } from 'src/app/demo/pages/staff-analytics/staff-analytics.service';
import { SettingsApi } from './settings.component';

// ---------------------------------------------------------------- trip stars

/** a-tripstars: the "Trip Stars" carousel of the customer app: on/off, order, delete; open to edit or see its analytics. */
@Component({
  selector: 'ts-tripstars',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...LISTS],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'APP.tripStars' | translate" [subtitle]="'APP.tripStarsHint' | translate">
        <a *ngIf="canCreate" class="ts-fab ts-fab--float" routerLink="/form/tripstar"><i class="ti ti-plus"></i>{{ 'APP.newTripStar' | translate }}</a>
      </ts-appbar>
      <!-- Suggestions from the data: what to put on Trip Star next -->
      <section class="ts-reco" *ngIf="canCreate">
        <div class="ts-reco__head">
          <span class="ts-reco__icon"><i class="ti ti-bulb"></i></span>
          <div class="ts-grow">
            <h2>{{ 'APP.recoTitle' | translate }}</h2>
            <p>{{ 'APP.recoHint' | translate }}</p>
          </div>
          <ts-chipbar [items]="recoDays" [selected]="[String(days)]" (tap)="days = +$event; loadReco()"></ts-chipbar>
        </div>
        <ts-segmented [items]="recoTabs()" [selected]="tab" (changed)="tab = $any($event)"></ts-segmented>
        <ts-loading *ngIf="!reco && !recoError"></ts-loading>
        <ts-error *ngIf="recoError" [error]="recoError" (retry)="loadReco()"></ts-error>
        <ng-container *ngIf="reco">
          <p class="ts-muted ts-small" *ngIf="!list(tab).length">{{ 'APP.recoNone' | translate }}</p>
          <div class="ts-reco__grid">
            <article class="ts-reco-card" *ngFor="let r of list(tab)">
              <div class="ts-reco-card__img">
                <img *ngIf="mediaOf(r.imageUrl) as src; else noPic" [src]="src" alt="" loading="lazy" />
                <ng-template #noPic><i class="ti ti-photo-off"></i></ng-template>
                <ts-tag class="ts-reco-card__kind" tone="info">{{ kindLabel(r.type) | translate }}</ts-tag>
              </div>
              <div class="ts-reco-card__body">
                <strong class="ts-clamp2">{{ r.name }}</strong>
                <div class="ts-reco-card__stats">
                  <span *ngIf="r.price"><i class="ti ti-tag"></i>{{ num(r.price) }} {{ 'APP.egp' | translate }}</span>
                  <span><i class="ti ti-ticket"></i>{{ 'APP.recoBookings' | translate: { n: r.bookings } }}</span>
                  <span *ngIf="r.views"><i class="ti ti-eye"></i>{{ num(r.views) }}</span>
                </div>
                <p class="ts-reco-card__why"><i class="ti ti-info-circle"></i>{{ text.arabic ? r.reasonAr : r.reasonEn }}</p>
              </div>
              <button type="button" class="btn btn-primary ts-reco-card__add" [disabled]="adding === key(r)" (click)="addStar(r)">
                <i [class]="adding === key(r) ? 'pi pi-spin pi-spinner' : 'ti ti-star'"></i>{{ 'APP.addAsStar' | translate }}
              </button>
            </article>
          </div>
          <details class="ts-reco__rules"><summary>{{ 'APP.recoHow' | translate }}</summary><p>{{ reco.rulesAr }}</p></details>
        </ng-container>
      </section>

      <div class="ts-listbar">
        <ts-chipbar [items]="filters()" [selected]="[filter]" (tap)="filter = $any($event)"></ts-chipbar>
      </div>
      <ts-loading *ngIf="!stars && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ts-empty *ngIf="stars && !shown().length" [message]="'APP.nothingHereYet' | translate"></ts-empty>
      <div class="ts-list-grid ts-list-grid--cards">
        <div class="ts-cover-card" *ngFor="let s of shown(); let i = index">
          <a class="ts-cover" [routerLink]="'/form/tripstar'" [queryParams]="{ id: s.id }">
            <img *ngIf="img(s) as src; else noImg" [src]="src" alt="" />
            <ng-template #noImg><div class="ts-cover__empty ts-cover__empty--navy"><i class="ti ti-star-filled"></i></div></ng-template>
            <ts-pill class="ts-cover__end" [tone]="s.isActive && !expired(s) ? 'ok' : 'neutral'">
              {{ (s.isActive && !expired(s) ? 'APP.active' : expired(s) ? 'APP.lifeExpired' : 'APP.inactive') | translate }}
            </ts-pill>
          </a>
          <div class="ts-cover-card__body">
            <div class="ts-grow">
              <p class="ts-card-title">{{ title(s) }}</p>
              <p class="ts-muted ts-clamp2" *ngIf="description(s)">{{ description(s) }}</p>
              <div class="ts-wrap" style="margin-top: 6px">
                <ts-tag tone="info" icon="ti ti-package">{{ 'APP.itemsN' | translate: { n: num(s.items?.length ?? 0) } }}</ts-tag>
                <ts-tag tone="neutral" icon="ti ti-arrows-sort">{{ 'APP.orderN' | translate: { n: s.displayOrder } }}</ts-tag>
                <ts-tag *ngIf="s.expiryDate" [tone]="expired(s) ? 'danger' : 'pending'" icon="ti ti-calendar">{{ 'APP.until' | translate: { n: (s.expiryDate | ts: 'short') } }}</ts-tag>
              </div>
            </div>
          </div>
          <div class="ts-cover-card__foot">
            <a class="ts-icon-btn" [routerLink]="['/a/more/tripstars', s.id, 'analytics']" [state]="{ title: title(s), imageUrl: s.imageUrl }" [title]="'APP.analytics' | translate" style="color: var(--ts-blue)"><i class="ti ti-chart-dots"></i></a>
            <ng-container *ngIf="filter === 'all'">
              <button type="button" class="ts-icon-btn" [disabled]="i === 0 || busy" (click)="reorder(i, i - 1)" [title]="'APP.moveUp' | translate"><i class="ti ti-arrow-up"></i></button>
              <button type="button" class="ts-icon-btn" [disabled]="i === stars!.length - 1 || busy" (click)="reorder(i, i + 1)" [title]="'APP.moveDown' | translate"><i class="ti ti-arrow-down"></i></button>
            </ng-container>
            <span class="ts-grow"></span>
            <label class="ts-switch-line ts-switch-line--bare" [title]="(s.isActive ? 'APP.active' : 'APP.inactive') | translate"><input type="checkbox" role="switch" [checked]="s.isActive" (change)="toggle(s)" /></label>
            <button type="button" class="ts-icon-btn ts-danger-ink" (click)="remove(s)" [title]="'APP.delete' | translate"><i class="ti ti-trash"></i></button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TripStarsComponent implements OnInit {
  private readonly api = inject(SettingsApi);
  private readonly session = inject(StaffSession);
  private readonly dialogs = inject(StaffDialogs);
  num = fmtNum;
  stars: any[] | null = null;
  error: unknown = null;
  busy = false;
  readonly String = String;
  readonly text = inject(StaffText);
  /** all · active · inactive · expired */
  filter = 'all';
  days = 30;
  tab: 'highDemand' | 'lowPriceLowDemand' | 'other' = 'highDemand';
  reco: any = null;
  recoError: unknown = null;
  adding: string | null = null;
  readonly recoDays = [30, 90, 180].map((d) => ({ key: String(d), label: this.text.tr('APP.lastNDays', { n: d }) }));

  filters() {
    const all = this.stars ?? [];
    const n = (f: string) => all.filter((s) => this.matches(s, f)).length;
    return ['all', 'active', 'inactive', 'expired'].map((key) => ({ key, label: this.text.tr('APP.starFilter_' + key), count: n(key) }));
  }

  /** active: on and not past its date · inactive: switched off · expired: past its date. */
  matches(s: any, f: string): boolean {
    if (f === 'active') return s.isActive && !this.expired(s);
    if (f === 'inactive') return !s.isActive && !this.expired(s);
    if (f === 'expired') return this.expired(s);
    return true;
  }

  shown(): any[] {
    return (this.stars ?? []).filter((s) => this.matches(s, this.filter));
  }

  recoTabs() {
    return [
      { key: 'highDemand', label: this.text.tr('APP.recoHigh'), count: this.reco?.highDemand?.length ?? null },
      { key: 'lowPriceLowDemand', label: this.text.tr('APP.recoLow'), count: this.reco?.lowPriceLowDemand?.length ?? null },
      { key: 'other', label: this.text.tr('APP.recoOther'), count: this.reco?.other?.length ?? null }
    ];
  }

  list(tab: string): any[] {
    return this.reco?.[tab] ?? [];
  }

  key(r: any): string {
    return `${r.type}-${r.id}`;
  }

  kindLabel(type: number): string {
    return type === 1 ? 'APP.moduleTrip' : type === 2 ? 'APP.moduleOuting' : 'APP.moduleHajj';
  }

  mediaOf(p: string | null): string | null {
    return mediaUrl(p);
  }

  loadReco(): void {
    this.reco = null;
    this.recoError = null;
    this.api.get('/api/staff/trip-stars/suggestions', { days: this.days }).subscribe({ next: (d) => (this.reco = d), error: (e) => (this.recoError = e) });
  }

  /** "Add as Star": one card from the product's name and cover, then both lists refresh. */
  addStar(r: any): void {
    this.adding = this.key(r);
    this.api.post('/api/staff/trip-stars/from-product', { type: r.type, id: r.id }).subscribe({
      next: () => {
        this.adding = null;
        this.text.showDone(this.text.tr('APP.addedAsStar', { n: r.name }));
        for (const t of ['highDemand', 'lowPriceLowDemand', 'other']) this.reco[t] = (this.reco[t] ?? []).filter((x: any) => this.key(x) !== this.key(r));
        this.load();
      },
      error: (e) => {
        this.adding = null;
        this.text.showError(e);
      }
    });
  }

  get canCreate(): boolean {
    return this.session.can(P.adCreate);
  }

  ngOnInit(): void {
    this.load();
    if (this.canCreate) this.loadReco();
  }

  load(): void {
    this.error = null;
    this.api.pageOf('/api/TripStar/GetAllTripStars/', { get: true }).subscribe({
      next: (p) => (this.stars = [...p.data].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))),
      error: (e) => (this.error = e)
    });
  }

  img(s: any): string | null {
    return mediaUrl(s.imageUrl);
  }

  title(s: any): string {
    return this.text.arabic ? s.titleAr || s.title : s.title || s.titleAr;
  }

  description(s: any): string | null {
    const d = this.text.arabic ? s.descriptionAr || s.description : s.description;
    return d?.trim() ? d : null;
  }

  expired(s: any): boolean {
    return !!s.expiryDate && new Date(s.expiryDate) < new Date();
  }

  private run(o: Promise<unknown>): void {
    this.busy = true;
    o.then(() => this.load())
      .catch((e) => this.text.showError(e))
      .finally(() => (this.busy = false));
  }

  /** The whole order is sent each time (ReorderTripStars takes every card's displayOrder), as the dashboard does. */
  reorder(from: number, to: number): void {
    const stars = [...this.stars!];
    stars.splice(to, 0, stars.splice(from, 1)[0]);
    this.stars = stars;
    this.run(firstValueFrom(this.api.send('PUT', '/api/TripStar/ReorderTripStars/', stars.map((s, i) => ({ id: s.id, displayOrder: i + 1 })))));
  }

  toggle(s: any): void {
    this.run(firstValueFrom(this.api.send('PUT', `/api/TripStar/ToggleTripStarStatus/${s.id}`)));
  }

  async remove(s: any): Promise<void> {
    const ok = await this.dialogs.confirm({ title: this.text.tr('APP.delete'), message: this.text.tr('APP.deleteItemQ', { n: this.title(s) }), confirm: this.text.tr('APP.delete'), danger: true });
    if (ok) this.run(firstValueFrom(this.api.send('DELETE', `/api/TripStar/DeleteTripStar/${s.id}`)));
  }
}

/** Change in percent against the previous period; null when there was nothing before. */
function change(now: number, before: number): number | null {
  return before ? ((now - before) * 100) / before : null;
}

/**
 * The bookings of a Trip Star card's products: totals against the period before, the trend, and each product.
 * Every number opens its bookings (items + created in the range + status group).
 */
@Component({
  selector: 'ts-tripstar-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ChipBarComponent, KpiTileComponent, BarsComponent, RangeBarComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.tripStarAnalytics' | translate" [subtitle]="name"></ts-appbar>
      <div class="ts-cover ts-cover--hero">
        <img *ngIf="image; else noImg" [src]="image" alt="" />
        <ng-template #noImg><div class="ts-cover__empty ts-cover__empty--navy"><i class="ti ti-star-filled"></i></div></ng-template>
      </div>
      <ts-range-bar [keys]="rangeKeys" [selected]="range.key" (selectedChange)="setRange($event)"></ts-range-bar>
      <p class="ts-muted" style="margin: 4px 0 10px">{{ 'APP.tripStarProductsNote' | translate }}</p>
      <ts-loading *ngIf="!a && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ng-container *ngIf="a">
        <div class="ts-kpi-grid">
          <ts-kpi
            class="ts-kpi-hero"
            tone="revenue"
            icon="ti ti-cash"
            [label]="'APP.cardRevenue' | translate"
            [value]="num(a.current?.paid) + ' ' + ('APP.egp' | translate)"
            [delta]="change(a.current?.paid, a.previous?.paid)"
            [footnote]="a.current?.avgPaid != null ? ('APP.avgBookingN' | translate: { n: num(a.current.avgPaid) }) : ('APP.vsPrevious' | translate)"
            [link]="open('APP.cardRevenue', 'completed')"
          ></ts-kpi>
          <ts-kpi tone="info" icon="ti ti-ticket" [label]="'APP.bookings' | translate" [value]="num(a.current?.total)" [delta]="change(a.current?.total, a.previous?.total)" [link]="open('APP.bookings')"></ts-kpi>
          <ts-kpi tone="success" icon="ti ti-circle-check" [label]="'APP.completed' | translate" [value]="num(a.current?.completed)" [delta]="change(a.current?.completed, a.previous?.completed)" [link]="open('APP.completed', 'completed')"></ts-kpi>
          <ts-kpi tone="expense" icon="ti ti-circle-x" [label]="'APP.cancelled' | translate" [value]="num(a.current?.cancelled)" [delta]="change(a.current?.cancelled, a.previous?.cancelled)" [deltaUp]="false" [link]="open('APP.cancelled', 'cancelled')"></ts-kpi>
          <ts-kpi tone="pending" icon="ti ti-hourglass" [label]="'APP.pending' | translate" [value]="num(a.current?.pending)" [link]="open('APP.pending', 'pending')"></ts-kpi>
        </div>
        <ts-card [title]="'APP.bookingsOverTime' | translate" icon="ti ti-chart-bar" iconColor="var(--ts-blue)">
          <ts-bars [values]="monthValues()" [labels]="monthLabels()" color="var(--ts-blue)"></ts-bars>
        </ts-card>
        <ts-card [title]="'APP.perProduct' | translate" icon="ti ti-package" iconColor="var(--ts-teal)">
          <a class="ts-row is-link" *ngFor="let i of a.items ?? []" [routerLink]="productLink(i)">
            <span class="ts-row__label">
              <strong>{{ i.name }}</strong><br />
              <small class="ts-muted">{{ 'APP.bookingsN2' | translate: { n: num(i.bookings) } }}</small>
            </span>
            <strong class="ts-num" style="color: var(--ts-ok-fg)">{{ i.paid | ts }} {{ 'APP.egp' | translate }}</strong>
          </a>
        </ts-card>
      </ng-container>
    </div>
  `
})
export class TripStarAnalyticsComponent implements OnInit {
  private readonly http = inject(StaffHttp);
  private readonly route = inject(ActivatedRoute);
  private readonly text = inject(StaffText);
  num = fmtNum;
  change = (a?: number, b?: number) => change(a ?? 0, b ?? 0);
  id = 0;
  name = '';
  image: string | null = null;
  range: Range = presetRange('quarter');
  rangeKeys = (['week', 'month', 'quarter'] as RangeKey[]).map((k) => ({
    key: k,
    label: k === 'week' ? 'APP.last7Days' : k === 'month' ? 'APP.thisMonth' : 'APP.last90Days'
  }));
  a: any = null;
  error: unknown = null;

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.name = history.state?.title ?? '';
    this.image = mediaUrl(history.state?.imageUrl);
    this.load();
  }

  setRange(k: RangeKey): void {
    this.range = presetRange(k);
    this.load();
  }

  load(): void {
    this.a = null;
    this.error = null;
    this.http
      .get<any>(`/api/staff/trip-stars/${this.id}/analytics`, { from: apiDate(this.range.from), to: apiDate(this.range.to) })
      .subscribe({ next: (a) => (this.a = a), error: (e) => (this.error = e) });
  }

  private createdIn() {
    const from = this.a?.from ? apiDate(new Date(this.a.from)) : apiDate(this.range.from);
    const to = this.a?.to ? apiDate(new Date(this.a.to)) : apiDate(this.range.to);
    return { field: 'createDate', op: 'between', values: [from, to] };
  }

  private group(key: string) {
    return { field: 'status', op: 'in', values: ((this.a?.statusGroups?.[key] as unknown[]) ?? []).map(String) };
  }

  open(title: string, group?: string): any[] {
    const items = { field: 'items', op: 'in', values: (this.a?.items ?? []).map((i: any) => String(i.key)) };
    return bookingsLink(this.text.tr(title), [items, this.createdIn(), ...(group ? [this.group(group)] : [])]);
  }

  productLink(i: any): any[] {
    return bookingsLink(i.name, [{ field: 'items', op: 'in', values: [String(i.key)] }, this.createdIn()]);
  }

  monthValues(): number[] {
    return (this.a?.months ?? []).map((m: any) => m.bookings ?? 0);
  }

  monthLabels(): string[] {
    return (this.a?.months ?? []).map((m: any) => `${m.month}/${(m.year ?? 0) % 100}`);
  }
}

// ---------------------------------------------------------------- sidebars

/** a-sidebars: the strips of the customer app's home. */
@Component({
  selector: 'ts-sidebars',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...LISTS],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'APP.sidebars' | translate">
        <a class="ts-fab ts-fab--float" routerLink="/form/sidebar"><i class="ti ti-plus"></i>{{ 'APP.newSidebar' | translate }}</a>
      </ts-appbar>
      <ts-paged-list [list]="list" emptyIcon="ti ti-layout-rows" [grid]="true">
        <ng-template let-s>
          <div class="ts-list-card">
            <span class="ts-color-bar" [style.background]="s.color || 'var(--ts-line)'"></span>
            <a class="ts-card-row__main" routerLink="/form/sidebar" [queryParams]="{ id: s.id }" style="color: inherit; text-decoration: none">
              <span class="ts-card-title">{{ s.title }}</span>
              <span class="ts-muted">{{ 'APP.order' | translate }} {{ s.squence }} · {{ 'APP.itemsN' | translate: { n: num(s.sideBarItems?.length ?? 0) } }}</span>
            </a>
            <ts-pill [tone]="s.isActive ? 'ok' : 'neutral'">{{ (s.isActive ? 'APP.active' : 'APP.inactive') | translate }}</ts-pill>
            <button type="button" class="ts-icon-btn ts-danger-ink" (click)="remove(s)" [title]="'APP.delete' | translate"><i class="ti ti-trash"></i></button>
          </div>
        </ng-template>
      </ts-paged-list>
    </div>
  `
})
export class SidebarsComponent implements OnDestroy {
  private readonly api = inject(SettingsApi);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  num = fmtNum;
  list = new PagedList<any>((q) => this.api.list('/api/SideBars/GetAllSideBars', { page: q.pageIndex }));

  async remove(s: any): Promise<void> {
    const ok = await this.dialogs.confirm({ title: this.text.tr('APP.delete'), message: this.text.tr('APP.deleteItemQ', { n: s.title }), confirm: this.text.tr('APP.delete'), danger: true });
    if (!ok) return;
    this.api.send('DELETE', '/api/SideBars/DeleteSideBar/', undefined, { id: s.id }).subscribe({
      next: () => this.list.removeWhere((x: any) => x.id === s.id),
      error: (e) => this.text.showError(e)
    });
  }

  ngOnDestroy(): void {
    this.list.destroy();
  }
}

// ---------------------------------------------------------------- commission

/** One row of the commission list: a trip, a Hajj package, or one ticket of an outing (commission is per ticket). */
interface CommissionRow {
  itemType: number;
  itemId: number;
  name: string;
  sub?: string | null;
  vendor?: string | null;
  price: number;
  /** ItemPricingPolicyDto: pricingModel 1 percent, 2 fixed, 3 committed net price; null = not configured. */
  policy?: any;
}

const MODEL_COLOR: Record<string, string> = { '1': 'var(--ts-ok-fg)', '2': 'var(--ts-blue)', '3': 'var(--ts-hajj)', none: 'var(--ts-ink-faint)' };
const COMMISSION_PATHS: Record<string, string> = { trips: '/api/Travels/GetAllTravels', outings: '/api/Outings/GetAllOutings', hajj: '/api/Hajj/GetAllHajj' };

/**
 * a-commission: coverage per module, then every product with its commission, searchable, filterable by model,
 * sortable, and edited from its row (the same policy sheet as the product screen).
 */
@Component({
  selector: 'ts-commission',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ChipBarComponent, PillSwitchComponent, CommissionSheetComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.commissionPolicies' | translate"></ts-appbar>
      <ng-container *ngIf="stats">
        <!-- How the commission is charged: per ticket for outings, per seat otherwise; add-ons go to the vendor in full -->
        <div class="ts-navy-card ts-basis">
          <strong><i class="ti ti-calculator" style="color: var(--ts-accent)"></i> {{ 'APP.commissionBasis' | translate }}</strong>
          <span><i class="ti ti-ticket"></i>{{ 'APP.commissionBasisOutings' | translate }}</span>
          <span><i class="ti ti-armchair"></i>{{ 'APP.commissionBasisSeats' | translate }}</span>
          <span><i class="ti ti-circle-plus"></i>{{ 'APP.commissionBasisAddOns' | translate }}</span>
        </div>
        <p class="ts-label">{{ 'APP.commissionCoverage' | translate }}</p>
        <div class="ts-coverage">
          <button type="button" *ngFor="let c of coverage()" [class.is-selected]="tab === c.tab" [style.--c]="c.color" (click)="setTab(c.tab)">
            <i [class]="c.icon"></i>
            <small>{{ c.label | translate }}</small>
            <strong class="ts-num">{{ num(c.done) }}/{{ num(c.total) }}</strong>
            <span class="ts-meter"><span [style.width.%]="c.total ? (c.done * 100) / c.total : 0" [style.background]="c.color"></span></span>
          </button>
        </div>
      </ng-container>
      <ts-pill-switch [items]="tabs" [selected]="tab" (selectedChange)="setTab($event)"></ts-pill-switch>
      <label class="ts-search" style="margin-top: 10px">
        <i class="ti ti-search"></i>
        <input type="search" [placeholder]="'APP.searchProductOrVendor' | translate" (input)="search$.next($any($event.target).value)" />
      </label>
      <ts-chipbar [items]="modelChips" [selected]="[model]" (tap)="model = $event"></ts-chipbar>
      <ts-chipbar [items]="sortChips" [selected]="[sort]" (tap)="sort = $event"></ts-chipbar>
      <ts-error *ngIf="error" [error]="error" (retry)="fetch(true)"></ts-error>
      <ts-empty *ngIf="!error && !loading && !visible().length" icon="ti ti-percentage" [message]="'APP.nothingHereYet' | translate"></ts-empty>
      <button type="button" class="ts-commission-row" *ngFor="let r of visible()" [style.--c]="color(r)" (click)="sheet.show(r.itemType, r.itemId)">
        <div class="ts-wrap ts-wrap--between" style="align-items: flex-start">
          <i [class]="r.itemType === 5 ? 'ti ti-ticket' : 'ti ti-package'" style="color: var(--c); font-size: 20px"></i>
          <div class="ts-grow" style="min-width: 0">
            <p class="ts-card-title">{{ r.name }}</p>
            <p *ngIf="r.itemType === 5 && r.sub" class="ts-muted" style="color: var(--c); font-weight: 700">{{ 'APP.ticket' | translate }}: {{ r.sub }}</p>
            <p class="ts-muted">#{{ r.itemId }}{{ r.vendor ? ' · ' + r.vendor : '' }}</p>
          </div>
          <ng-container [ngSwitch]="modelOf(r)">
            <ts-tag *ngSwitchCase="1" tone="ok" icon="ti ti-percentage">{{ num(r.policy.tripsCommissionValue) }}% {{ 'APP.rate' | translate }}</ts-tag>
            <ts-tag *ngSwitchCase="2" tone="done" icon="ti ti-cash">{{ num(r.policy.tripsCommissionValue) }} {{ 'APP.egp' | translate }} {{ 'APP.fixed' | translate }}</ts-tag>
            <ts-tag *ngSwitchCase="3" tone="gold" icon="ti ti-heart-handshake">{{ 'APP.committedPrice' | translate }}</ts-tag>
            <ts-tag *ngSwitchDefault tone="cancelled" icon="ti ti-help">{{ 'APP.notConfigured' | translate }}</ts-tag>
          </ng-container>
        </div>
        <div class="ts-figures">
          <div><small>{{ (r.itemType === 5 ? 'APP.pricePerTicket' : 'APP.pricePerSeat') | translate }}</small><strong class="ts-num">{{ num(r.price) }} {{ 'APP.egp' | translate }}</strong></div>
          <div><small>{{ 'APP.vendorNet' | translate }}</small><strong class="ts-num">{{ profit(r) == null ? '—' : num(r.price - profit(r)!) + ' ' + ('APP.egp' | translate) }}</strong></div>
          <div>
            <small>{{ (r.itemType === 5 ? 'APP.commissionPerTicket' : 'APP.commissionPerSeat') | translate }}</small>
            <strong class="ts-num" [style.color]="profit(r) == null ? null : profit(r)! >= 0 ? 'var(--ts-ok-fg)' : 'var(--ts-danger-ink)'">
              {{ profit(r) == null ? '—' : (profit(r)! >= 0 ? '+' : '') + num(profit(r)) + ' ' + ('APP.egp' | translate) }}
            </strong>
          </div>
        </div>
      </button>
      <ts-loading *ngIf="loading"></ts-loading>
      <button *ngIf="!loading && hasNext" type="button" class="btn btn-secondary ts-wide-btn" (click)="page = page + 1; fetch()">{{ 'WEB.loadMore' | translate }}</button>
    </div>
    <ts-commission-sheet #sheet (saved)="fetch(true)"></ts-commission-sheet>
  `
})
export class CommissionComponent implements OnInit, OnDestroy {
  private readonly api = inject(SettingsApi);
  private readonly text = inject(StaffText);
  @ViewChild('sheet') sheet!: CommissionSheetComponent;
  num = fmtNum;
  stats: any = null;
  tab = 'trips';
  model = 'all';
  sort = 'new';
  page = 1;
  loading = false;
  hasNext = false;
  error: unknown = null;
  rows: CommissionRow[] = [];
  private searchText = '';
  private req?: Subscription;
  readonly search$ = new Subject<string>();
  private sub = this.search$.pipe(debounceTime(300)).subscribe((v) => {
    this.searchText = v.trim();
    this.fetch(true);
  });
  tabs = [
    { key: 'trips', label: this.text.tr('APP.trips') },
    { key: 'outings', label: this.text.tr('APP.outings') },
    { key: 'hajj', label: this.text.tr('APP.moduleHajj') }
  ];
  modelChips = [
    { key: 'all', label: this.text.tr('APP.allModels') },
    { key: 'percent', label: this.text.tr('APP.percentage'), dot: MODEL_COLOR['1'] },
    { key: 'fixed', label: this.text.tr('APP.fixedAmount'), dot: MODEL_COLOR['2'] },
    { key: 'net', label: this.text.tr('APP.committedPrice'), dot: MODEL_COLOR['3'] },
    { key: 'none', label: this.text.tr('APP.notConfigured'), dot: MODEL_COLOR['none'] }
  ];
  sortChips = [
    { key: 'new', label: this.text.tr('APP.sortNewest') },
    { key: 'priceUp', label: this.text.tr('APP.sortPriceUp') },
    { key: 'priceDown', label: this.text.tr('APP.sortPriceDown') },
    { key: 'profit', label: this.text.tr('APP.sortProfit') }
  ];

  ngOnInit(): void {
    this.api.get('/api/Pricing/GetPricingPolicyStatistics').subscribe({ next: (s) => (this.stats = s ?? null), error: () => {} });
    this.fetch(true);
  }

  coverage() {
    const s = this.stats ?? {};
    const cell = (label: string, key: string, tab: string, icon: string, color: string) => {
      const done = s[`${key}WithPricingPolicy`] ?? 0;
      return { label, tab, icon, color, done, total: done + (s[`${key}WithoutPricingPolicy`] ?? 0) };
    };
    return [
      cell('APP.trips', 'trips', 'trips', 'ti ti-bus', 'var(--ts-trip)'),
      // Outing commission is per ticket: count tickets when the backend sends them (older servers: outings)
      'outingTicketsWithPricingPolicy' in s
        ? cell('APP.outingTickets', 'outingTickets', 'outings', 'ti ti-ticket', 'var(--ts-outing)')
        : cell('APP.outings', 'outings', 'outings', 'ti ti-compass', 'var(--ts-outing)'),
      cell('APP.moduleHajj', 'hajj', 'hajj', 'ti ti-building-mosque', 'var(--ts-hajj)')
    ];
  }

  setTab(t: string): void {
    this.tab = t;
    this.fetch(true);
  }

  fetch(reset = false): void {
    if (reset) {
      this.page = 1;
      this.rows = [];
    }
    this.req?.unsubscribe();
    this.loading = true;
    this.error = null;
    const tab = this.tab;
    this.req = this.api.pageOf(COMMISSION_PATHS[tab], { body: this.searchText ? { search: this.searchText } : {}, page: this.page }).subscribe({
      next: (page) => {
        const rows: CommissionRow[] = [];
        for (const d of page.data) {
          const vendor = d.companyDto?.name ?? d.vendor?.name ?? d.vendorName ?? null;
          if (tab === 'outings') {
            for (const tk of d.tickets ?? []) {
              rows.push({ itemType: 5, itemId: tk.id, name: d.name, sub: tk.ticketType, vendor, price: tk.price ?? 0, policy: tk.itemPricingPolicy });
            }
          } else {
            rows.push({ itemType: tab === 'trips' ? 1 : 4, itemId: d.id, name: d.name, vendor, price: d.price ?? 0, policy: d.itemPricingPolicy });
          }
        }
        this.rows = [...this.rows, ...rows];
        this.hasNext = page.hasNextPage;
        this.loading = false;
      },
      error: (e) => {
        this.error = e;
        this.loading = false;
      }
    });
  }

  modelOf(r: CommissionRow): number | null {
    return r.policy?.pricingModel ?? null;
  }

  profit(r: CommissionRow): number | null {
    return r.policy?.profitLoss ?? null;
  }

  color(r: CommissionRow): string {
    return MODEL_COLOR[String(this.modelOf(r) ?? 'none')] ?? MODEL_COLOR['none'];
  }

  /** The model filter and the sort apply to the rows loaded so far (the list endpoints sort by date only). */
  visible(): CommissionRow[] {
    const want: Record<string, number | null> = { percent: 1, fixed: 2, net: 3, none: null };
    const rows = this.rows.filter((r) => this.model === 'all' || this.modelOf(r) === want[this.model]);
    if (this.sort === 'priceUp') rows.sort((a, b) => a.price - b.price);
    else if (this.sort === 'priceDown') rows.sort((a, b) => b.price - a.price);
    else if (this.sort === 'profit') rows.sort((a, b) => (this.profit(b) ?? -1e12) - (this.profit(a) ?? -1e12));
    return rows;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.req?.unsubscribe();
  }
}

// ---------------------------------------------------------------- coupon form

/** One check of the coupon form: the field it is about, why, and whether it stops the save. */
interface CouponIssue {
  field: string;
  message: string;
  error?: boolean;
}

const COUPON_SEGMENTS: [string, string][] = [
  ['loginUser', 'APP.segSignedIn'],
  ['anonymous', 'APP.segGuests'],
  ['loggedInZeroBookings', 'APP.segNoBookings'],
  ['completedBookings', 'APP.segTopCompleted'],
  ['cancelledBookings', 'APP.segTopCancelled']
];

/** a-coupon-form + a-coupon-target: a general coupon, who gets it, and how many customers that reaches. */
@Component({
  selector: 'ts-coupon-form',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...FORM_KIT, PillSwitchComponent, SwitchRowComponent, CatalogItemsComponent, SearchPickerComponent, SheetComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="(editId ? 'APP.cpEdit' : 'APP.newCoupon') | translate" [subtitle]="editId ? f.code : null"></ts-appbar>
      <ts-loading *ngIf="loading"></ts-loading>
      <ts-error *ngIf="loadError" [error]="loadError" (retry)="load()"></ts-error>
      <ng-container *ngIf="!loading && !loadError">
      <div class="ts-note ts-note--pending" *ngIf="editId && used">
        <i class="ti ti-alert-triangle"></i>{{ 'APP.cpEditUsedNote' | translate: { n: num(used) } }}
      </div>
      <ng-container *ngIf="showIssues">
        <div class="ts-note ts-note--ok" *ngIf="!issues().length"><i class="ti ti-circle-check" style="color: var(--ts-ok-fg)"></i>{{ 'APP.couponAllGood' | translate }}</div>
        <div class="ts-note" *ngIf="issues().length" [class.ts-note--danger]="hasError()" [class.ts-note--pending]="!hasError()">
          <div>
            <p *ngFor="let i of issues()" class="ts-issue" [class.is-error]="i.error">
              <i class="ti" [class.ti-alert-circle]="i.error" [class.ti-alert-triangle]="!i.error"></i>
              <b>{{ i.field }}:</b> {{ i.message }}
            </p>
          </div>
        </div>
      </ng-container>
      <ts-form-section [title]="'APP.couponAppliesTo' | translate" [subtitle]="items.length ? ('APP.itemsN' | translate: { n: num(items.length) }) : ('APP.allProducts' | translate)" icon="ti ti-package">
        <!-- Hajj and Umrah packages are both in the Hajj list -->
        <ts-catalog-items [(items)]="items" [kinds]="['trip', 'outing', 'hajj']"></ts-catalog-items>
      </ts-form-section>
      <ts-form-section [title]="'APP.discountAndDates' | translate" icon="ti ti-discount" kind="money">
        <ts-field [label]="'APP.couponCode' | translate" [required]="true" [readonly]="!!editId" [hint]="editId ? ('APP.cpCodeFixed' | translate) : null" [(value)]="f.code"></ts-field>
        <ts-field [label]="'APP.description' | translate" [(value)]="f.desc"></ts-field>
        <ts-field [label]="'APP.couponWarningMessage' | translate" [hint]="'APP.couponWarningHint' | translate" [lines]="2" [(value)]="f.warning"></ts-field>
        <p class="ts-muted">{{ 'APP.couponWarningExplain' | translate }}</p>
        <ts-pill-switch [items]="types" [selected]="f.type" (selectedChange)="f.type = $event"></ts-pill-switch>
        <p class="ts-muted ts-small" *ngIf="isCashback" style="margin-top: 8px">{{ 'APP.cpCashbackExplain' | translate }}</p>
        <ng-container *ngIf="isBuyGet; else amountField">
          <p class="ts-muted ts-small" style="margin: 8px 0">{{ 'APP.cpBuyGetExplain' | translate }}</p>
          <div class="ts-two">
            <ts-field [label]="'APP.cpBuyQuantity' | translate" [number]="true" [required]="true" [(value)]="f.buy"></ts-field>
            <ts-field [label]="'APP.cpGetQuantity' | translate" [number]="true" [required]="true" [(value)]="f.get"></ts-field>
          </div>
          <ts-field [label]="'APP.cpMaxFree' | translate" [hint]="'APP.cpMaxFreeHint' | translate" [number]="true" [(value)]="f.maxFree"></ts-field>
          <p class="ts-muted ts-small" *ngIf="buyGetLine()">{{ buyGetLine() }}</p>
        </ng-container>
        <ng-template #amountField>
          <ts-field [label]="(isCashback ? 'APP.cpCashbackAmount' : 'APP.discount') | translate" [number]="true" [suffix]="isPercent ? '%' : ('APP.egp' | translate)" [required]="true" [(value)]="f.amount" style="display: block; margin-top: 12px"></ts-field>
        </ng-template>
        <ts-field *ngIf="f.type === '5'" [label]="'APP.cpMaxCashback' | translate" [hint]="'APP.cpMaxCashbackHint' | translate" [number]="true" [suffix]="'APP.egp' | translate" [(value)]="f.maxCashback"></ts-field>
        <ts-field [label]="'APP.usesAllowed' | translate" [number]="true" [(value)]="f.uses"></ts-field>
        <div class="ts-two">
          <ts-date-field [label]="'APP.from' | translate" [(value)]="f.from"></ts-date-field>
          <ts-date-field [label]="'APP.to' | translate" [(value)]="f.to"></ts-date-field>
        </div>
      </ts-form-section>
      <ts-form-section *ngIf="editId" [title]="'APP.whoGetsIt' | translate" icon="ti ti-users-group">
        <p class="ts-muted">{{ 'APP.cpAudienceFixed' | translate: { n: num(sentTo) } }}</p>
        <a *ngIf="sentTo" class="btn btn-secondary ts-wide-btn" [routerLink]="['/a/more/coupons', editId, 'recipients']">
          <i class="ti ti-users"></i>{{ 'APP.cpRecipients' | translate }}
        </a>
      </ts-form-section>
      <ts-form-section *ngIf="!editId" [title]="'APP.whoGetsIt' | translate" icon="ti ti-users-group">
        <ts-pill-switch [items]="audienceModes" [selected]="specific ? 'some' : 'groups'" (selectedChange)="setSpecific($event === 'some')"></ts-pill-switch>
        <ng-container *ngIf="specific">
          <p class="ts-muted ts-small" style="margin: 8px 0">{{ 'APP.cpSpecificExplain' | translate }}</p>
          <div class="ts-chips" *ngIf="customers.length">
            <span class="ts-chip" *ngFor="let c of customers">
              {{ c.name }}<small class="ts-muted" *ngIf="c.phone"> · {{ c.phone }}</small>
              <button type="button" class="ts-icon-btn" (click)="removeCustomer(c.id)" [attr.aria-label]="'APP.delete' | translate"><i class="ti ti-x"></i></button>
            </span>
          </div>
          <button type="button" class="btn btn-secondary ts-wide-btn" (click)="customerPicker = true" data-test="cp-add-customer">
            <i class="ti ti-user-plus"></i>{{ 'APP.cpAddCustomer' | translate }}
          </button>
        </ng-container>
        <ng-container *ngIf="!specific">
        <ts-switch-row *ngFor="let s of segments" [title]="s[1] | translate" [value]="seg[s[0]]" (valueChange)="seg[s[0]] = $event; audienceChanged()"></ts-switch-row>
        </ng-container>
        <ts-switch-row [title]="'APP.sendAsNotification' | translate" [(value)]="f.notify"></ts-switch-row>
        <ts-switch-row [title]="'APP.sendAsEmail' | translate" [(value)]="f.email"></ts-switch-row>
        <button type="button" class="btn btn-secondary ts-wide-btn" [disabled]="reachBusy" (click)="countReach()" style="margin-top: 8px">
          <i [class]="reachBusy ? 'pi pi-spin pi-spinner' : 'ti ti-users'"></i>{{ 'APP.countReach' | translate }}
        </button>
        <div class="ts-reach" *ngIf="reach" aria-live="polite">
          <div class="ts-reach__total">
            <span class="ts-reach__num ts-num">{{ num(reach.customers) }}</span>
            <span>{{ 'APP.cpReachCustomers' | translate }}</span>
          </div>
          <div class="ts-reach__chips">
            <ts-tag tone="info" icon="ti ti-bell-ringing">{{ 'APP.cpReachPush' | translate: { n: num(reach.withPush) } }}</ts-tag>
            <ts-tag tone="info" icon="ti ti-mail">{{ 'APP.cpReachEmail' | translate: { n: num(reach.withEmail) } }}</ts-tag>
            <ts-tag *ngIf="reach.visitorDevices" tone="neutral" icon="ti ti-device-mobile">{{ 'APP.cpReachVisitors' | translate: { n: num(reach.visitorDevices) } }}</ts-tag>
          </div>
          <ul class="ts-reach__groups" *ngIf="reach.groups.length">
            <li *ngFor="let g of reach.groups"><span>{{ 'APP.cpGroup_' + g.key | translate }}</span><b class="ts-num">{{ num(g.count) }}</b></li>
          </ul>
          <p class="ts-muted ts-small" *ngIf="!reach.groups.length">{{ 'APP.couponNoAudience' | translate }}</p>
          <p class="ts-muted ts-small" *ngIf="reach.groups.length && !reach.customers && !reach.visitorDevices">{{ 'APP.cpReachNone' | translate }}</p>
          <p class="ts-muted ts-small" *ngIf="reach.visitorDevices && !f.notify">{{ 'APP.cpReachVisitorsPushOnly' | translate }}</p>
        </div>
      </ts-form-section>
      <div class="ts-sticky-foot">
        <button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy" (click)="save()"><i *ngIf="busy" class="pi pi-spin pi-spinner"></i>{{ 'APP.save' | translate }}</button>
      </div>
      </ng-container>
      <ts-sheet [open]="customerPicker" (openChange)="customerPicker = false" [title]="'APP.cpAddCustomer' | translate" [footer]="false">
        <ts-search-picker *ngIf="customerPicker" [search]="searchCustomers" [title]="customerTitle" [subtitle]="customerSubtitle" (picked)="addCustomer($event)"></ts-search-picker>
      </ts-sheet>
    </div>
  `
})
export class CouponFormComponent implements OnInit {
  private readonly api = inject(SettingsApi);
  private readonly location = inject(Location);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(StaffHttp);
  num = fmtNum;
  readonly segments = COUPON_SEGMENTS;
  /** DiscountType: 2 percent · 1 fixed · 4 cashback amount · 5 cashback percent (nothing off now; the wallet gets it once paid) · 3 buy X get X. */
  types = [
    { key: '2', label: this.text.tr('APP.percentage') },
    { key: '1', label: this.text.tr('APP.fixedAmount') },
    { key: '5', label: this.text.tr('APP.cpCashbackPercent') },
    { key: '4', label: this.text.tr('APP.cpCashbackValue') },
    { key: '3', label: this.text.tr('APP.buyXGetX') }
  ];
  readonly audienceModes = [
    { key: 'groups', label: this.text.tr('APP.cpAudienceGroups') },
    { key: 'some', label: this.text.tr('APP.cpAudienceSome') }
  ];
  /** Specific customers instead of the groups. */
  specific = false;
  customers: { id: number; name: string; phone?: string }[] = [];
  customerPicker = false;
  searchCustomers = (q: string) => this.http.get<any[]>('/api/staff/users/search', { q, take: 20 });
  customerTitle = (r: any) => r?.name ?? r?.fullName ?? `#${r?.id}`;
  customerSubtitle = (r: any) => r?.phone ?? r?.phoneNumber ?? '';
  /** The coupon being edited (route a/more/coupons/:id/edit); null for a new one. */
  readonly editId: number | null = Number(this.route.snapshot.paramMap.get('id')) || null;
  loading = false;
  loadError: unknown = null;
  /** Paid uses so far: editing the discount changes it for the next customers only. */
  used = 0;
  sentTo = 0;
  /** Rooms a coupon made in the old screens applies to: kept on save (this form has no room picker). */
  private roomIds: number[] = [];
  /** Kept as loaded: the edit doesn't change them. */
  private kept: Record<string, unknown> = {};

  get isPercent(): boolean {
    return this.f.type === '2' || this.f.type === '5';
  }

  get isCashback(): boolean {
    return this.f.type === '4' || this.f.type === '5';
  }

  get isBuyGet(): boolean {
    return this.f.type === '3';
  }

  /** "احجز 3 وواحد علينا (لحد 2 مجاني)": what the offer says, as the customer will read it. */
  buyGetLine(): string {
    const b = parseInt(latinDigits(this.f.buy), 10) || 0;
    const g = parseInt(latinDigits(this.f.get), 10) || 0;
    if (b < 1 || g < 1) return '';
    const max = parseInt(latinDigits(this.f.maxFree), 10) || 0;
    return this.text.tr(max > 0 ? 'APP.cpBuyGetLineMax' : 'APP.cpBuyGetLine', { b, g, m: max });
  }

  setSpecific(on: boolean): void {
    this.specific = on;
    this.reach = null;
    if (on) Object.keys(this.seg).forEach((k) => (this.seg[k] = false));
    else this.seg['loginUser'] = true;
  }

  addCustomer(r: any): void {
    if (!r?.id || this.customers.some((c) => c.id === r.id)) return;
    this.customers = [...this.customers, { id: r.id, name: this.customerTitle(r), phone: this.customerSubtitle(r) }];
    this.customerPicker = false;
    this.audienceChanged();
  }

  removeCustomer(id: number): void {
    this.customers = this.customers.filter((c) => c.id !== id);
    this.audienceChanged();
  }

  ngOnInit(): void {
    if (this.editId) this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = null;
    this.api.get(`/api/staff/coupons/${this.editId}`).subscribe({
      next: (c: any) => {
        this.f = {
          ...this.f,
          code: c.code ?? '',
          desc: c.description ?? '',
          warning: c.warningMessage ?? '',
          amount: c.discountAmount != null ? String(c.discountAmount) : '',
          uses: String(c.usageNumber ?? 1),
          type: String(c.discountType ?? 2),
          from: c.startDate ? new Date(c.startDate) : null,
          to: c.endDate ? new Date(c.endDate) : null
        };
        this.f.buy = String(c.buyQuantity ?? 0);
        this.f.get = String(c.getQuantity ?? 0);
        this.f.maxFree = String(c.maxFreeQuantity ?? 0);
        this.f.maxCashback = c.maxCashback ? String(c.maxCashback) : '';
        const all: any[] = c.items ?? [];
        this.items = all.filter((i) => i.kind !== 'room').map((i) => ({ kind: i.kind, id: i.id, name: i.name ?? `#${i.id}` }));
        this.roomIds = all.filter((i) => i.kind === 'room').map((i) => i.id);
        this.used = c.usedCount ?? 0;
        this.sentTo = c.sent?.customers ?? 0;
        this.kept = { userLimit: c.userLimit };
        this.loading = false;
      },
      error: (e) => {
        this.loadError = e;
        this.loading = false;
      }
    });
  }
  f = {
    code: `TRIPS${Date.now() % 100000}`,
    desc: '',
    warning: '',
    amount: '',
    uses: '100',
    type: '2',
    from: new Date() as Date | null,
    to: new Date(Date.now() + 30 * 864e5) as Date | null,
    buy: '2',
    get: '1',
    maxFree: '',
    maxCashback: '',
    notify: true,
    email: false
  };
  seg: Record<string, boolean> = { loginUser: true, anonymous: false, loggedInZeroBookings: false, completedBookings: false, cancelledBookings: false };
  /** The products the coupon applies to; none means every product (scope General). */
  items: CatalogItem[] = [];
  /** The issues show once the first save was tried, then follow every change. */
  showIssues = false;
  busy = false;
  reach: { groups: { key: string; count: number }[]; customers: number; withPush: number; withEmail: number; visitorDevices: number } | null = null;
  reachBusy = false;
  private reachTimer: any;

  private idsOf(kind: string): number[] {
    return this.items.filter((i) => i.kind === kind).map((i) => i.id);
  }

  private body(): Record<string, unknown> {
    const f = this.f;
    return {
      code: f.code.trim(),
      description: f.desc.trim(),
      // Shown by the cart when the coupon is valid but nothing in the cart is covered; empty → the backend's default
      warningMessage: f.warning.trim() || null,
      discountType: +f.type,
      discountAmount: this.isBuyGet ? 0 : parseAmount(f.amount) ?? 0,
      usageNumber: parseInt(latinDigits(f.uses), 10) || 1,
      startDate: f.from ? formDate(f.from) : undefined,
      endDate: f.to ? formDate(f.to) : undefined,
      // CouponScope: 2 General, 3 AppliedOnSpecificItems
      scope: this.items.length || this.roomIds.length ? 3 : 2,
      tripIds: this.idsOf('trip'),
      // The update replaces the products with the ones sent: rooms from the old screens go back as they were
      roomIds: this.roomIds,
      outingIds: this.idsOf('outing'),
      hajjIds: this.idsOf('hajj'),
      usersId: this.editId ? [] : this.customers.map((c) => c.id),
      // Coupons.BuyQuantity / GetQuantity / MaxFreeQuantity are NOT NULL (default 0) while the API model has them
      // nullable, so leaving them out makes the insert fail ("unexpected error"); 0 means "not a buy X get Y offer"
      buyQuantity: this.isBuyGet ? parseInt(latinDigits(f.buy), 10) || 0 : 0,
      getQuantity: this.isBuyGet ? parseInt(latinDigits(f.get), 10) || 0 : 0,
      maxFreeQuantity: this.isBuyGet ? parseInt(latinDigits(f.maxFree), 10) || 0 : 0,
      maxCashback: f.type === '5' ? parseAmount(f.maxCashback) ?? 0 : 0,
      // Editing never sends the coupon again: no audience, no channels
      ...(this.editId ? { ...this.kept, sendViaNotification: false, sendViaEmail: false } : { ...this.seg, sendViaNotification: f.notify, sendViaEmail: f.email })
    };
  }

  /**
   * What is wrong or worth a second look before saving. Errors block the save; warnings ask for a confirmation.
   * They follow how the backend uses the coupon, so nothing here is a rule the backend doesn't have.
   */
  issues(): CouponIssue[] {
    const t = (k: string) => this.text.tr(k);
    const f = this.f;
    const amount = parseAmount(f.amount);
    const uses = parseInt(latinDigits(f.uses), 10);
    const out: CouponIssue[] = [];
    if (!f.code.trim()) out.push({ field: t('APP.couponCode'), message: t('APP.couponCodeRequired'), error: true });
    if (f.code.trim().includes(' ')) out.push({ field: t('APP.couponCode'), message: t('APP.couponCodeSpaces'), error: true });
    if (this.isBuyGet) {
      const b = parseInt(latinDigits(f.buy), 10) || 0;
      const g = parseInt(latinDigits(f.get), 10) || 0;
      if (b < 1 || g < 1) out.push({ field: t('APP.buyXGetX'), message: t('APP.cpBuyGetRequired'), error: true });
    } else if (amount == null || amount <= 0) out.push({ field: t('APP.discount'), message: t('APP.couponDiscountRequired'), error: true });
    if (!this.editId && this.specific && !this.customers.length) out.push({ field: t('APP.whoGetsIt'), message: t('APP.cpNoCustomers'), error: true });
    // Percent: basePrice × amount / 100, so more than 100% would take more than the price
    if (this.isPercent && amount != null && amount > 100) out.push({ field: t('APP.discount'), message: t('APP.couponPercentOver100'), error: true });
    if (f.type === '2' && amount === 100) out.push({ field: t('APP.discount'), message: t('APP.couponPercentFree') });
    if (this.editId && uses < this.used) out.push({ field: t('APP.usesAllowed'), message: this.text.tr('APP.cpUsesBelowUsed', { n: this.used }), error: true });
    if (isNaN(uses) || uses < 1) out.push({ field: t('APP.usesAllowed'), message: t('APP.couponUsesRequired'), error: true });
    if (f.from && f.to && f.to < f.from) out.push({ field: t('APP.to'), message: t('APP.couponEndBeforeStart'), error: true });
    if (f.to && f.to < new Date()) out.push({ field: t('APP.to'), message: t('APP.couponAlreadyEnded') });
    if (!this.items.length && !this.roomIds.length) out.push({ field: t('APP.couponAppliesTo'), message: t('APP.couponAppliesToAll') });
    if (!this.editId && !this.specific && (f.notify || f.email) && !Object.values(this.seg).some((v) => v)) out.push({ field: t('APP.whoGetsIt'), message: t('APP.couponNoAudience') });
    return out;
  }

  hasError(): boolean {
    return this.issues().some((i) => i.error);
  }

  /**
   * POST /api/staff/coupons/reach: the customers the chosen groups reach now, counted with the rules the send uses
   * (a customer in two groups counts once). The old GetTargetedCategories only named the groups, so nothing showed.
   */
  countReach(): void {
    this.reachBusy = true;
    const audience = { usersId: this.customers.map((c) => c.id), ...this.seg };
    this.api.post('/api/staff/coupons/reach', audience).subscribe({
      next: (d) => {
        this.reach = d;
        this.reachBusy = false;
      },
      error: (e) => {
        this.reachBusy = false;
        this.reach = null;
        this.text.showError(e);
      }
    });
  }

  /** Once counted, the number follows the audience switches. */
  audienceChanged(): void {
    if (!this.reach) return;
    clearTimeout(this.reachTimer);
    this.reachTimer = setTimeout(() => this.countReach(), 400);
  }

  async save(): Promise<void> {
    this.showIssues = true;
    const issues = this.issues();
    if (issues.some((i) => i.error)) return this.text.showError(this.text.tr('APP.couponFixErrors'));
    const warnings = issues.filter((i) => !i.error);
    if (
      warnings.length &&
      !(await this.dialogs.confirm({
        title: this.text.tr('APP.couponCheckTitle'),
        message: warnings.map((w) => `• ${w.field}: ${w.message}`).join('\n'),
        confirm: this.text.tr('APP.saveAnyway')
      }))
    ) {
      return;
    }
    this.busy = true;
    try {
      if (this.editId) {
        await firstValueFrom(this.api.send('PUT', `/api/staff/coupons/${this.editId}`, this.body()));
        this.text.showDone(this.text.tr('APP.cpSaved'));
      } else {
        await firstValueFrom(this.api.send('POST', '/api/Coupons/AddCoupons/', this.body()));
        this.text.showDone(this.text.tr('APP.couponCreated'));
      }
      this.location.back();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }
}

// ---------------------------------------------------------------- bonus rules

/** Where the old screens read a product's name by id (the booking screens use the same calls). */
const BONUS_NAME_PATH: Record<'trip' | 'outing' | 'hajj', string> = {
  trip: '/api/Travels/GetTravelById/',
  outing: '/api/Outings/GetOutingById/',
  hajj: '/api/Hajj/GetHajjById/'
};

/**
 * a-bonus-rules: the welcome bonus rules (GET / POST /api/Coupons/Settings/Bonus, the same rows the old "Bonus
 * settings" screen saves): on/off, whether it can be used on a booking that has a coupon, and the places it covers.
 */
@Component({
  selector: 'ts-bonus-rules',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ...FORM_KIT, SwitchRowComponent, CatalogItemsComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.bonusRules' | translate" [subtitle]="'APP.bonusRulesHint' | translate"></ts-appbar>
      <ts-loading *ngIf="loading"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ng-container *ngIf="!loading && !error">
        <ts-form-section [title]="'APP.bonusUse' | translate" icon="ti ti-gift">
          <ts-switch-row [title]="'APP.bonusEnabled' | translate" [subtitle]="'APP.bonusEnabledHint' | translate" [(value)]="r.enabled"></ts-switch-row>
          <ts-switch-row [title]="'APP.bonusWithCoupon' | translate" [subtitle]="(r.allowWithCoupon ? 'APP.bonusWithCouponOn' : 'APP.bonusWithCouponOff') | translate"
            [disabled]="!r.enabled" [(value)]="r.allowWithCoupon"></ts-switch-row>
        </ts-form-section>
        <ts-form-section [title]="'APP.bonusPlaces' | translate" [subtitle]="r.isGeneral ? ('APP.allProducts' | translate) : ('APP.itemsN' | translate: { n: num(items.length + roomIds.length) })" icon="ti ti-map-pin">
          <ts-switch-row [title]="'APP.bonusAllPlaces' | translate" [disabled]="!r.enabled" [(value)]="r.isGeneral"></ts-switch-row>
          <ng-container *ngIf="!r.isGeneral">
            <ts-catalog-items [(items)]="items" [kinds]="['trip', 'outing', 'hajj']"></ts-catalog-items>
            <p class="ts-muted ts-small" *ngIf="roomIds.length">{{ 'APP.bonusRoomsKept' | translate: { n: num(roomIds.length) } }}</p>
          </ng-container>
        </ts-form-section>
        <div class="ts-sticky-foot">
          <button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy || !canEdit" (click)="save()">
            <i *ngIf="busy" class="pi pi-spin pi-spinner"></i>{{ 'APP.save' | translate }}
          </button>
        </div>
      </ng-container>
    </div>
  `
})
export class BonusRulesComponent implements OnInit {
  private readonly api = inject(SettingsApi);
  private readonly text = inject(StaffText);
  private readonly session = inject(StaffSession);
  num = fmtNum;
  loading = true;
  error: unknown = null;
  busy = false;
  r = { enabled: true, allowWithCoupon: false, isGeneral: true };
  items: CatalogItem[] = [];
  /** Rooms chosen in the old screen: kept as they are (this screen has no room picker). */
  roomIds: number[] = [];

  get canEdit(): boolean {
    return this.session.can(P.couponsEdit);
  }

  ngOnInit(): void {
    this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const d: any = await firstValueFrom(this.api.get('/api/Coupons/Settings/Bonus'));
      this.r = { enabled: d?.enabled ?? true, allowWithCoupon: d?.allowWithCoupon ?? false, isGeneral: d?.isGeneral ?? true };
      this.roomIds = d?.roomIds ?? [];
      this.items = await this.named([
        ...(d?.tripIds ?? []).map((id: number) => ({ kind: 'trip' as const, id })),
        ...(d?.outingIds ?? []).map((id: number) => ({ kind: 'outing' as const, id })),
        ...(d?.hajjIds ?? []).map((id: number) => ({ kind: 'hajj' as const, id }))
      ]);
    } catch (e) {
      this.error = e;
    } finally {
      this.loading = false;
    }
  }

  /** The saved ids carry no names: each is read once (a deleted product keeps its number). */
  private async named(refs: { kind: 'trip' | 'outing' | 'hajj'; id: number }[]): Promise<CatalogItem[]> {
    return Promise.all(
      refs.map(async (x) => {
        try {
          const d: any = await firstValueFrom(this.api.get(BONUS_NAME_PATH[x.kind], { id: x.id }));
          return { kind: x.kind, id: x.id, name: d?.name ?? d?.nameAr ?? `#${x.id}` };
        } catch {
          return { kind: x.kind, id: x.id, name: `#${x.id}` };
        }
      })
    );
  }

  private idsOf(kind: string): number[] {
    return this.items.filter((i) => i.kind === kind).map((i) => i.id);
  }

  async save(): Promise<void> {
    if (!this.r.isGeneral && !this.items.length && !this.roomIds.length) return this.text.showError(this.text.tr('APP.bonusPickPlace'));
    this.busy = true;
    try {
      await firstValueFrom(
        this.api.send('POST', '/api/Coupons/Settings/Bonus', {
          ...this.r,
          tripIds: this.idsOf('trip'),
          roomIds: this.roomIds,
          outingIds: this.idsOf('outing'),
          hajjIds: this.idsOf('hajj')
        })
      );
      this.text.showDone(this.text.tr('APP.saved'));
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }
}
