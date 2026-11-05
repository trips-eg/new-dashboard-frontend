import { Component, Injectable, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, firstValueFrom, forkJoin, map } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { ChipBarComponent, LISTS } from '../ui/lists';
import { PillSwitchComponent, SwitchRowComponent } from '../ui/controls';
import { SheetComponent, StaffDialogs } from '../ui/dialogs';
import { StaffHttp } from '../core/staff-http';
import { FilterSchema, FiltersApi, ListResult, PagedList, StaffQuery, asPage, queryJson } from '../core/query';
import { P, StaffSession } from '../core/session';
import { Tone, itemType } from '../core/enums';
import { apiDate, fmtCompact, fmtNum, fmtPct } from '../core/format';
import { FORM_KIT } from '../forms/form-kit';
import { BarsComponent, KpiTileComponent } from 'src/app/demo/pages/staff-analytics/staff-ui';
import { Range, RangeKey, presetRange } from 'src/app/demo/pages/staff-analytics/staff-analytics.service';

function rangeQuery(r: Range | null): Record<string, string> {
  return r ? { from: apiDate(r.from), to: apiDate(r.to) } : {};
}

@Injectable({ providedIn: 'root' })
export class MarketingApi {
  private readonly http = inject(StaffHttp);

  reviews(q: StaffQuery): Observable<ListResult<any>> {
    return this.http.post<any>('/api/staff/lists/reviews', queryJson(q)).pipe(map((d) => ({ page: asPage<any>(d) })));
  }

  reply(id: number, body: unknown): Observable<any> {
    return this.http.post(`/api/staff/reviews/${id}/reply`, body);
  }

  hide(id: number, hidden: boolean, reason: string | null): Observable<any> {
    return this.http.put(`/api/staff/reviews/${id}/hidden`, { hidden, reason });
  }

  /** GET /api/staff/coupons: each coupon with its paid uses and the open bookings holding it; preset = status filter. */
  coupons(q: StaffQuery): Observable<ListResult<any>> {
    return this.http
      .get<any>('/api/staff/coupons', { status: q.preset || 'all', pageIndex: q.pageIndex, pageSize: 20, ...(q.search ? { search: q.search } : {}) })
      .pipe(map((d) => ({ page: asPage<any>(d) })));
  }

  /** GET /api/staff/coupons/{id}/distribution: the notifications and emails saved when the coupon was sent. */
  couponDistribution(id: number): Observable<any> {
    return this.http.get(`/api/staff/coupons/${id}/distribution`);
  }

  /** POST /api/Coupons/GetAllUsedCoupons: who used which coupon and when (a vendor gets their own coupons only). */
  usedCoupons(q: StaffQuery): Observable<ListResult<any>> {
    return this.http
      .post<any>('/api/Coupons/GetAllUsedCoupons', { pageIndex: q.pageIndex, pageSize: 20, ...(q.search ? { search: q.search } : {}) })
      .pipe(map((d) => ({ page: asPage<any>(d) })));
  }

  deleteCoupon(id: number): Observable<unknown> {
    return this.http.delete('/api/Coupons/DeleteCoupons/', { id });
  }

  couponAnalytics(r: Range | null, groupBy: string): Observable<any> {
    return this.http.get('/api/staff/coupons/analytics', { ...rangeQuery(r), groupBy, type: 'all' });
  }

  search(tab: string, r: Range | null): Observable<any> {
    return this.http.get('/api/staff/search/analytics', { tab, ...rangeQuery(r), pageIndex: 1, pageSize: 30 });
  }

  /** The searches behind a number: one word, or all; zeroOnly for no results. Newest first. */
  searchRecords(r: Range | null, query: string | null, zeroOnly: boolean, page: number): Observable<ListResult<any>> {
    return this.http
      .get<any>('/api/staff/search/records', { query, zeroOnly, ...rangeQuery(r), pageIndex: page, pageSize: 30 })
      .pipe(map((d) => ({ page: asPage<any>(d) })));
  }

  pinned(): Observable<any[]> {
    return this.http.get<any[]>('/api/staff/search/pinned').pipe(map((d) => d ?? []));
  }

  savePinned(id: number | null, body: unknown): Observable<unknown> {
    return id == null ? this.http.post('/api/staff/search/pinned', body) : this.http.put(`/api/staff/search/pinned/${id}`, body);
  }

  deletePinned(id: number): Observable<unknown> {
    return this.http.delete(`/api/staff/search/pinned/${id}`);
  }

  preview(q: string): Observable<number> {
    return this.http.get<any>('/api/staff/search/preview', { q }).pipe(map((d) => d?.resultCount ?? 0));
  }
}

/** a-reviews / v-reviews. Admins reply, hide and send an apology coupon; vendors read. */
@Component({
  selector: 'ts-reviews',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ...LISTS, ...FORM_KIT, SheetComponent, SwitchRowComponent],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="(vendor ? 'APP.myProductReviews' : 'APP.reviews') | translate" [subtitle]="'APP.reviewsCount' | translate: { n: num(list.total) }"></ts-appbar>
      <div class="ts-listbar" *ngIf="schema?.presets?.length">
        <ts-segmented [items]="presets()" [selected]="list.query.preset ?? (hasAll() ? 'all' : '')" (changed)="list.setPreset($event || null)"></ts-segmented>
      </div>
      <ts-paged-list [list]="list" emptyIcon="ti ti-star" [grid]="true">
        <ng-template let-r>
          <ts-card>
            <ng-container *ngTemplateOutlet="body; context: { $implicit: r }"></ng-container>
            <div class="ts-review-reply" *ngIf="r.reply">{{ 'APP.tripsReply' | translate }}: {{ r.reply }}</div>
            <ts-tag *ngIf="r.isHidden" tone="danger" style="display: inline-block; margin-top: 8px">
              {{ 'APP.hidden' | translate }}{{ r.hiddenReason ? ' · ' + r.hiddenReason : '' }}
            </ts-tag>
            <div class="ts-wrap ts-wrap--between" *ngIf="canEdit" style="margin-top: 10px">
              <button type="button" class="btn btn-link" (click)="hide(r)">
                <i class="ti" [class.ti-eye]="r.isHidden" [class.ti-eye-off]="!r.isHidden"></i>{{ (r.isHidden ? 'APP.show' : 'APP.hide') | translate }}
              </button>
              <button type="button" class="btn btn-secondary" (click)="openReply(r)">{{ (r.replied ? 'APP.editReply' : 'APP.reply') | translate }}</button>
            </div>
          </ts-card>
        </ng-template>
      </ts-paged-list>
    </div>

    <ng-template #body let-r>
      <div class="ts-person">
        <ts-avatar [name]="r.customerName" [size]="36"></ts-avatar>
        <div class="ts-grow" style="min-width: 0">
          <p class="ts-card-title">{{ r.customerName }}</p>
          <p class="ts-muted ts-ellipsis">{{ r.itemName || '' }} · {{ r.date | ts: 'short' }}</p>
        </div>
        <span class="ts-stars" [class.is-low]="r.rating <= 2">{{ stars(r.rating) }}</span>
      </div>
      <p *ngIf="r.text" style="margin: 8px 0 0">{{ r.text }}</p>
      <span class="ts-module" style="margin-top: 6px"><i class="ts-chip__dot" [style.background]="type(r).color"></i>{{ type(r).label | translate }}</span>
    </ng-template>

    <ts-sheet [open]="!!replying" (openChange)="replying = null" [title]="'APP.replyToReview' | translate">
      <ng-container *ngIf="replying as r">
        <ng-container *ngTemplateOutlet="body; context: { $implicit: r }"></ng-container>
        <ts-field [label]="'APP.yourReply' | translate" [lines]="4" [(value)]="reply.text" style="display: block; margin-top: 12px"></ts-field>
        <ts-switch-row [title]="'APP.publishReply' | translate" [subtitle]="'APP.publishReplyHint' | translate" [(value)]="reply.publish"></ts-switch-row>
        <ts-switch-row [title]="'APP.emailVendor' | translate" [(value)]="reply.notify"></ts-switch-row>
        <ts-switch-row *ngIf="r.customerId != null" [title]="'APP.apologyCoupon' | translate" [subtitle]="'APP.apologyCouponHint' | translate" [(value)]="reply.coupon"></ts-switch-row>
      </ng-container>
      <div sheet-foot>
        <button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy" (click)="sendReply()">{{ 'APP.sendReply' | translate }}</button>
      </div>
    </ts-sheet>
  `
})
export class ReviewsComponent implements OnInit, OnDestroy {
  private readonly api = inject(MarketingApi);
  private readonly filters = inject(FiltersApi);
  private readonly session = inject(StaffSession);
  private readonly route = inject(ActivatedRoute);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  @Input() vendor = false;
  list = new PagedList<any>((q) => this.api.reviews(q));
  schema: FilterSchema | null = null;
  num = fmtNum;
  replying: any = null;
  reply = { text: '', publish: true, notify: false, coupon: false };
  busy = false;

  get canEdit(): boolean {
    return this.session.can(P.customersEdit) && !this.vendor;
  }

  ngOnInit(): void {
    this.vendor = this.vendor || !!this.route.snapshot.data['vendor'];
    this.filters.schema('reviews').subscribe({ next: (s) => (this.schema = s), error: () => {} });
  }

  hasAll(): boolean {
    return (this.schema?.presets ?? []).some((p) => p.key === 'all');
  }

  presets() {
    // The schema has its own "all" preset; add one only when it doesn't
    const presets = (this.schema?.presets ?? []).map((p) => ({ key: p.key, label: p.labelAr, alert: p.key === 'toReply' }));
    return presets.some((p) => p.key === 'all') ? presets : [{ key: '', label: this.text.tr('APP.all') }, ...presets];
  }

  type(r: any) {
    return itemType(r.itemType);
  }

  stars(n: number): string {
    const k = Math.max(0, Math.min(5, n ?? 0));
    return '★'.repeat(k) + '☆'.repeat(5 - k);
  }

  openReply(r: any): void {
    this.reply = { text: r.reply ?? '', publish: true, notify: false, coupon: false };
    this.replying = r;
  }

  async sendReply(): Promise<void> {
    const r = this.replying;
    this.busy = true;
    try {
      await firstValueFrom(this.api.reply(r.id, { text: this.reply.text, publish: this.reply.publish, notifyVendor: this.reply.notify, sendCoupon: this.reply.coupon }));
      this.text.showDone(this.text.tr('APP.replySent'));
      this.replying = null;
      this.list.refresh();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }

  async hide(r: any): Promise<void> {
    const hidden = !!r.isHidden;
    const reason = hidden ? '' : await this.dialogs.ask({ title: this.text.tr('APP.hideReview'), label: this.text.tr('APP.reason') });
    if (reason == null) return;
    this.api.hide(r.id, !hidden, reason || null).subscribe({ next: () => this.list.refresh(), error: (e) => this.text.showError(e) });
  }

  ngOnDestroy(): void {
    this.list.destroy();
  }
}

const RANGE_KEYS: { key: RangeKey; label: string }[] = [
  { key: 'today', label: 'APP.today' },
  { key: 'week', label: 'APP.last7Days' },
  { key: 'month', label: 'APP.thisMonth' },
  { key: 'last28', label: 'APP.last28Days' },
  { key: 'quarter', label: 'APP.last90Days' }
];

/**
 * The searches behind a search-history number: who searched (customer or guest), the word, the category, the
 * results and when. Opened as /a/more/search/records;title=…;query=…;zero=1;range=today.
 */
@Component({
  selector: 'ts-search-records',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...LISTS],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="title" [subtitle]="list.total ? ('APP.searchesN' | translate: { n: num(list.total) }) : null"></ts-appbar>
      <div class="ts-listbar">
        <ts-chipbar [items]="ranges" [selected]="[range.key]" (tap)="setRange($any($event))"></ts-chipbar>
      </div>
      <ts-paged-list [list]="list" [emptyMessage]="'APP.nothingHereYet' | translate" emptyIcon="ti ti-search" [grid]="true">
        <ng-template let-r>
          <a class="ts-list-card" [routerLink]="r.userId ? ['/a/more/customers', r.userId] : null" [class.is-static]="!r.userId">
            <ts-avatar *ngIf="r.userId; else guest" [name]="r.customerName || '?'"></ts-avatar>
            <ng-template #guest><ts-icon-tile icon="ti ti-user" [size]="40" color="var(--ts-canc-fg)" bg="var(--ts-canc-bg)"></ts-icon-tile></ng-template>
            <span class="ts-card-row__main">
              <span class="ts-card-title">{{ r.userId ? r.customerName || '#' + r.userId : ('APP.guestSearcher' | translate) }}</span>
              <span class="ts-muted ts-ellipsis"><i class="ti ti-search"></i> {{ r.query }}</span>
              <span class="ts-wrap" style="margin-top: 6px">
                <ts-pill [tone]="r.resultCount === 0 ? 'danger' : 'ok'">{{ r.resultCount === 0 ? ('APP.noResults' | translate) : ('APP.resultsN' | translate: { n: num(r.resultCount) }) }}</ts-pill>
                <ts-pill *ngIf="r.category" tone="info">{{ r.category }}</ts-pill>
              </span>
            </span>
            <span class="ts-end-col ts-muted ts-num">
              <small>{{ r.searchedAt | ts: 'short' }}</small>
              <small>{{ r.searchedAt | ts: 'time' }}</small>
            </span>
          </a>
        </ng-template>
      </ts-paged-list>
    </div>
  `
})
export class SearchRecordsComponent implements OnInit, OnDestroy {
  private readonly api = inject(MarketingApi);
  private readonly route = inject(ActivatedRoute);
  private readonly text = inject(StaffText);
  num = fmtNum;
  title = '';
  query: string | null = null;
  zeroOnly = false;
  range: Range = presetRange('last28');
  ranges = RANGE_KEYS.map((r) => ({ key: r.key, label: this.text.tr(r.label) }));
  list!: PagedList<any>;

  ngOnInit(): void {
    const p = this.route.snapshot.paramMap;
    this.title = p.get('title') ?? this.text.tr('APP.searchHistory');
    this.query = p.get('query');
    this.zeroOnly = p.get('zero') === '1';
    this.range = presetRange((p.get('range') as RangeKey) ?? 'last28');
    this.list = new PagedList<any>((q) => this.api.searchRecords(this.range, this.query, this.zeroOnly, q.pageIndex));
  }

  setRange(k: RangeKey): void {
    this.range = presetRange(k);
    this.list.refresh();
  }

  ngOnDestroy(): void {
    this.list?.destroy();
  }
}

/** a-search-history + a-search-pin: what customers search for, words without results, and the pinned "most searched". */
@Component({
  selector: 'ts-search-history',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...FORM_KIT, KpiTileComponent, PillSwitchComponent, SheetComponent, SwitchRowComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.searchHistory' | translate">
        <button *ngIf="canEdit" type="button" class="ts-icon-btn" (click)="openPin()" [title]="'APP.pinWord' | translate"><i class="ti ti-pin"></i></button>
      </ts-appbar>
      <ts-loading *ngIf="!s && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ng-container *ngIf="s">
        <!-- Each number opens the searches it is made of -->
        <div class="ts-kpi-grid ts-kpi-grid--3">
          <ts-kpi
            icon="ti ti-search"
            [label]="'APP.searchesToday' | translate"
            [value]="num(s.kpis?.searchesToday)"
            [link]="records('APP.searchesToday', { range: 'today' })"
          ></ts-kpi>
          <ts-kpi
            icon="ti ti-mood-empty"
            tone="expense"
            [label]="'APP.zeroResults' | translate"
            [value]="pct(s.kpis?.zeroResultPct)"
            [footnote]="'APP.searchesN' | translate: { n: num(s.kpis?.zeroResultCountInRange) }"
            [link]="records('APP.zeroResults', { zero: '1' })"
          ></ts-kpi>
        </div>
        <ts-tag *ngIf="s.source === 'history'" tone="pending" style="display: block; margin-bottom: 10px">{{ 'APP.searchHistorySourceNote' | translate }}</ts-tag>
        <ts-card *ngIf="pinned.length" [title]="'APP.pinnedWords' | translate" [subtitle]="'APP.pinnedHint' | translate" icon="ti ti-pin">
          <div class="ts-wrap">
            <button type="button" class="ts-chip" *ngFor="let p of pinned" [disabled]="!canEdit" (click)="openPin(p)">
              <i class="ti ti-pin" [style.color]="p.isActive ? 'var(--ts-accent)' : 'var(--ts-ink-faint)'"></i>{{ label(p) }}
            </button>
          </div>
        </ts-card>
        <ts-pill-switch [items]="tabs" [selected]="tab" (selectedChange)="tab = $event; load()"></ts-pill-switch>
        <div class="ts-rank-list">
          <div class="ts-list-card" *ngFor="let r of words()">
            <a class="ts-rank-row" [routerLink]="['/a/more/search/records', { title: r.query, query: r.query }]">
              <span class="ts-rank-badge">{{ r.rank }}</span>
              <strong class="ts-grow">{{ r.query }}</strong>
              <strong class="ts-num">{{ r.count | ts }}</strong>
              <ts-pill *ngIf="r.trendPct != null" [tone]="r.trendPct >= 0 ? 'ok' : 'danger'">{{ signed(r.trendPct) }}</ts-pill>
            </a>
            <i *ngIf="r.isPinned" class="ti ti-pin-filled" style="color: var(--ts-accent); padding: 0 10px"></i>
            <button *ngIf="!r.isPinned && canEdit" type="button" class="ts-icon-btn" [title]="'APP.pinWord' | translate" (click)="openPin(null, r.query)"><i class="ti ti-pin"></i></button>
          </div>
          <ts-empty *ngIf="!words().length" icon="ti ti-search" [message]="'APP.nothingHereYet' | translate"></ts-empty>
        </div>
      </ng-container>
    </div>

    <ts-sheet [open]="pinOpen" (openChange)="pinOpen = false" [title]="(editing ? 'APP.editPinned' : 'APP.pinWord') | translate">
      <ts-field [label]="'APP.searchWord' | translate" [required]="true" [(value)]="pin.query"></ts-field>
      <button type="button" class="btn btn-link" (click)="previewPin()">
        {{ previewCount == null ? ('APP.previewResults' | translate) : ('APP.resultsN' | translate: { n: num(previewCount) }) }}
      </button>
      <ts-field [label]="'APP.labelAr' | translate" [required]="true" [(value)]="pin.labelAr"></ts-field>
      <ts-field [label]="'APP.labelEn' | translate" [(value)]="pin.labelEn"></ts-field>
      <ts-switch-row [title]="'APP.active' | translate" [(value)]="pin.isActive"></ts-switch-row>
      <div sheet-foot class="ts-two">
        <button *ngIf="editing" type="button" class="btn btn-outline-danger" (click)="deletePin()">{{ 'APP.delete' | translate }}</button>
        <button type="button" class="btn btn-primary" (click)="savePin()">{{ 'APP.save' | translate }}</button>
      </div>
    </ts-sheet>
  `
})
export class SearchHistoryComponent implements OnInit {
  private readonly api = inject(MarketingApi);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  num = fmtNum;
  pct = (v: number | null | undefined) => fmtPct(v);
  signed = (v: number) => fmtPct(v, true);

  tab = 'top';
  tabs = [
    { key: 'top', label: this.text.tr('APP.mostSearched') },
    { key: 'zero', label: this.text.tr('APP.zeroResults') },
    { key: 'recent', label: this.text.tr('APP.recent') }
  ];
  s: any = null;
  pinned: any[] = [];
  error: unknown = null;
  pinOpen = false;
  editing: any = null;
  pin = { query: '', labelAr: '', labelEn: '', isActive: true };
  previewCount: number | null = null;

  get canEdit(): boolean {
    return this.session.can(P.searchEdit);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.error = null;
    forkJoin({ s: this.api.search(this.tab, null), pinned: this.api.pinned() }).subscribe({
      next: (r) => {
        this.s = r.s;
        this.pinned = r.pinned;
      },
      error: (e) => (this.error = e)
    });
  }

  /**
   * The customer app saves a search on every keystroke, so "ال", "الا", "العين الس" show up as searches of their own.
   * The list keeps whole words: at least 3 letters, and not just the start of a longer word in the same list.
   */
  words(): any[] {
    const rows: any[] = this.s?.rows?.data ?? [];
    const queries = rows.map((r) => String(r.query ?? '').trim());
    return rows.filter((r, i) => {
      const q = queries[i];
      if ([...q.replace(/\s+/g, '')].length < 3) return false;
      return !queries.some((other, j) => j !== i && other.length > q.length && other.startsWith(q));
    });
  }

  /** The records screen reads its title and filters as matrix params (;title=…;zero=1), which a routerLink array carries. */
  records(title: string, extra: Record<string, string>): any[] {
    return ['/a/more/search/records', { title: this.text.tr(title), ...extra }];
  }

  label(p: any): string {
    return this.text.arabic ? p.labelAr : p.labelEn || p.labelAr;
  }

  openPin(existing: any = null, query?: string): void {
    this.editing = existing;
    this.pin = {
      query: existing?.query ?? query ?? '',
      labelAr: existing?.labelAr ?? query ?? '',
      labelEn: existing?.labelEn ?? '',
      isActive: existing?.isActive ?? true
    };
    this.previewCount = null;
    this.pinOpen = true;
  }

  previewPin(): void {
    this.api.preview(this.pin.query).subscribe({ next: (n) => (this.previewCount = n), error: () => (this.previewCount = -1) });
  }

  async savePin(): Promise<void> {
    if (!this.pin.query.trim() || !this.pin.labelAr.trim()) return this.text.showError(this.text.tr('APP.fillRequired'));
    try {
      await firstValueFrom(
        this.api.savePinned(this.editing?.id ?? null, {
          query: this.pin.query.trim(),
          labelAr: this.pin.labelAr.trim(),
          labelEn: this.pin.labelEn.trim() || null,
          isActive: this.pin.isActive
        })
      );
      this.pinOpen = false;
      this.load();
    } catch (e) {
      this.text.showError(e);
    }
  }

  deletePin(): void {
    this.api.deletePinned(this.editing.id).subscribe({
      next: () => {
        this.pinOpen = false;
        this.load();
      },
      error: (e) => this.text.showError(e)
    });
  }
}

/** a-coupons: coupons with their real uses, filtered by status; a tap shows what was sent and to how many. */
@Component({
  selector: 'ts-coupons',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...LISTS, SheetComponent],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'APP.coupons' | translate">
        <a class="ts-icon-btn" routerLink="/a/more/coupons/used" [title]="'APP.usedCoupons' | translate"><i class="ti ti-receipt"></i></a>
        <a class="ts-icon-btn" routerLink="/a/more/coupons/analytics" [title]="'APP.couponAnalytics' | translate"><i class="ti ti-chart-bar"></i></a>
        <a *ngIf="canCreate" class="ts-fab ts-fab--float" routerLink="/a/more/coupons/new"><i class="ti ti-plus"></i>{{ 'APP.newCoupon' | translate }}</a>
      </ts-appbar>
      <div class="ts-listbar">
        <ts-search [hint]="'APP.cpSearch' | translate" (changed)="list.setSearch($event)"></ts-search>
        <ts-chipbar [items]="statuses" [selected]="[list.query.preset || 'all']" (tap)="list.setPreset($event === 'all' ? null : $event)"></ts-chipbar>
      </div>
      <ts-paged-list [list]="list" emptyIcon="ti ti-discount" [grid]="true">
        <ng-template let-c>
          <div class="ts-list-card ts-coupon-card is-link" role="button" tabindex="0" (click)="open(c)" (keydown.enter)="open(c)">
            <ts-icon-tile icon="ti ti-discount" color="var(--ts-marketing, #c2187a)" bg="var(--ts-marketing-bg, #fde7f3)"></ts-icon-tile>
            <span class="ts-card-row__main">
              <strong class="ts-card-title ts-num">{{ c.code }}</strong>
              <span class="ts-muted">{{ discount(c) }} · <span class="ts-num">{{ c.startDate | ts: 'short' }} – {{ c.endDate | ts: 'short' }}</span></span>
              <span class="ts-coupon-usage">
                <ts-tag [tone]="c.usedCount ? 'ok' : 'neutral'" icon="ti ti-ticket">{{ 'APP.cpUses' | translate: { n: c.usedCount, m: c.usageNumber } }}</ts-tag>
                <ts-tag *ngIf="c.reservedCount" tone="pending" icon="ti ti-hourglass">{{ 'APP.cpReserved' | translate: { n: c.reservedCount } }}</ts-tag>
              </span>
            </span>
            <ts-pill [tone]="tone(c.status)">{{ 'APP.cpStatus_' + c.status | translate }}</ts-pill>
            <button *ngIf="canDelete" type="button" class="ts-icon-btn ts-danger-ink" (click)="$event.stopPropagation(); remove(c)" [title]="'APP.delete' | translate"><i class="ti ti-trash"></i></button>
          </div>
        </ng-template>
      </ts-paged-list>
    </div>

    <ts-sheet [open]="!!picked" (openChange)="picked = null" [title]="picked?.code ?? ''" [footer]="false">
      <ng-container *ngIf="picked">
        <div class="ts-kv-grid">
          <div><small class="ts-muted">{{ 'APP.discount' | translate }}</small><b>{{ discount(picked) }}</b></div>
          <div><small class="ts-muted">{{ 'APP.cpStatus' | translate }}</small><b>{{ 'APP.cpStatus_' + picked.status | translate }}</b></div>
          <div><small class="ts-muted">{{ 'APP.cpUsedPaid' | translate }}</small><b class="ts-num">{{ picked.usedCount }} / {{ picked.usageNumber }}</b></div>
          <div><small class="ts-muted">{{ 'APP.cpHeld' | translate }}</small><b class="ts-num">{{ picked.reservedCount }}</b></div>
        </div>
        <h4 class="ts-sheet-sub"><i class="ti ti-send"></i>{{ 'APP.cpDistribution' | translate }}</h4>
        <ts-loading *ngIf="!dist && !distError"></ts-loading>
        <ts-error *ngIf="distError" [error]="distError" (retry)="loadDist()"></ts-error>
        <ng-container *ngIf="dist">
          <p class="ts-muted" *ngIf="!dist.notification.used && !dist.email.used">{{ 'APP.cpNotSent' | translate }}</p>
          <div class="ts-channel" *ngFor="let ch of channels(dist)">
            <span class="ts-channel__icon" [class.is-off]="!ch.d.used"><i [class]="ch.icon"></i></span>
            <span class="ts-card-row__main">
              <strong>{{ ch.label | translate }}</strong>
              <span class="ts-muted" *ngIf="ch.d.used">
                {{ 'APP.cpChannelCustomers' | translate: { n: ch.d.customers } }}
                <ng-container *ngIf="ch.d.sent != null"> · {{ 'APP.cpDelivered' | translate: { n: ch.d.sent } }}</ng-container>
                <ng-container *ngIf="ch.d.failed"> · <span class="ts-danger-ink">{{ 'APP.cpFailed' | translate: { n: ch.d.failed } }}</span></ng-container>
              </span>
              <small class="ts-muted ts-num" *ngIf="ch.d.used && ch.d.last">{{ ch.d.last | ts: 'short' }} {{ ch.d.last | ts: 'time' }}</small>
            </span>
            <ts-pill [tone]="ch.d.used ? 'ok' : 'neutral'">{{ (ch.d.used ? 'APP.cpSent' : 'APP.cpNotUsed') | translate }}</ts-pill>
          </div>
          <p class="ts-muted ts-small" *ngIf="dist.notification.used || dist.email.used">{{ 'APP.cpDistTotal' | translate: { n: dist.customers } }}</p>
        </ng-container>
      </ng-container>
    </ts-sheet>
  `
})
export class CouponsComponent implements OnDestroy {
  private readonly api = inject(MarketingApi);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  list = new PagedList<any>((q) => this.api.coupons(q));
  picked: any = null;
  dist: any = null;
  distError: unknown = null;

  readonly statuses = ['all', 'active', 'inactive', 'upcoming', 'expired', 'used', 'unused'].map((key) => ({
    key,
    label: this.text.tr('APP.cpFilter_' + key)
  }));

  get canCreate(): boolean {
    return this.session.can(P.couponsCreate);
  }

  get canDelete(): boolean {
    return this.session.can(P.couponsDelete);
  }

  tone(status: string): Tone {
    return status === 'active' ? 'ok' : status === 'upcoming' ? 'info' : status === 'usedUp' ? 'pending' : 'cancelled';
  }

  discount(c: any): string {
    return c.discountType === 2
      ? fmtPct(c.discountAmount)
      : c.discountType === 3
        ? this.text.tr('APP.buyXGetX')
        : `${fmtNum(c.discountAmount)} ${this.text.tr('APP.egp')}`;
  }

  channels(d: any): { icon: string; label: string; d: any }[] {
    return [
      { icon: 'ti ti-bell-ringing', label: 'APP.cpByNotification', d: d.notification },
      { icon: 'ti ti-mail', label: 'APP.cpByEmail', d: d.email }
    ];
  }

  open(c: any): void {
    this.picked = c;
    this.loadDist();
  }

  loadDist(): void {
    this.dist = null;
    this.distError = null;
    const id = this.picked?.id;
    this.api.couponDistribution(id).subscribe({
      next: (d) => {
        if (this.picked?.id === id) this.dist = d;
      },
      error: (e) => (this.distError = e)
    });
  }

  async remove(c: any): Promise<void> {
    const ok = await this.dialogs.confirm({
      title: this.text.tr('APP.deleteCoupon'),
      message: this.text.tr('APP.deleteCouponQ', { n: c.code }),
      confirm: this.text.tr('APP.delete'),
      danger: true
    });
    if (!ok) return;
    this.api.deleteCoupon(c.id).subscribe({ next: () => this.list.removeWhere((x: any) => x.id === c.id), error: (e) => this.text.showError(e) });
  }

  ngOnDestroy(): void {
    this.list.destroy();
  }
}

/** The dashboard's "Used coupons": each use of a coupon, newest first, with the customer (name only) and the date. */
@Component({
  selector: 'ts-used-coupons',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...LISTS],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'APP.usedCoupons' | translate"></ts-appbar>
      <div class="ts-listbar">
        <ts-search [hint]="'APP.search' | translate" (changed)="list.setSearch($event)"></ts-search>
      </div>
      <ts-paged-list [list]="list" emptyIcon="ti ti-receipt" [grid]="true">
        <ng-template let-u>
          <a class="ts-list-card" [routerLink]="u.user?.id ? ['/a/more/customers', u.user.id] : null">
            <ts-icon-tile icon="ti ti-discount"></ts-icon-tile>
            <span class="ts-card-row__main">
              <strong class="ts-card-title ts-num">{{ u.coupons?.code }}</strong>
              <span class="ts-muted">{{ u.user?.name || '—' }}</span>
              <ts-tag tone="info" style="margin-top: 4px">
                {{ u.coupons?.discountType === 2 ? num(u.coupons?.discountAmount) + '%' : num(u.coupons?.discountAmount) + ' ' + ('APP.egp' | translate) }}
              </ts-tag>
            </span>
            <span class="ts-end-col ts-muted ts-num">
              <small>{{ u.usedDate | ts: 'short' }}</small>
              <small>{{ u.usedDate | ts: 'time' }}</small>
            </span>
          </a>
        </ng-template>
      </ts-paged-list>
    </div>
  `
})
export class UsedCouponsComponent implements OnDestroy {
  private readonly api = inject(MarketingApi);
  list = new PagedList<any>((q) => this.api.usedCoupons(q));
  num = fmtNum;

  ngOnDestroy(): void {
    this.list.destroy();
  }
}

/** a-coupon-analytics. */
@Component({
  selector: 'ts-coupon-analytics',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, KpiTileComponent, BarsComponent, PillSwitchComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.couponAnalytics' | translate"></ts-appbar>
      <ts-loading *ngIf="!d && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ng-container *ngIf="d">
        <div class="ts-kpi-grid ts-kpi-grid--3">
          <ts-kpi icon="ti ti-ticket" [label]="'APP.bookingsWithCoupon' | translate" [value]="num(d.kpis?.bookingsWithCoupon)" [footnote]="pct(d.kpis?.bookingsWithCouponShare)" link="/a/bookings"></ts-kpi>
          <ts-kpi icon="ti ti-cash" tone="revenue" [label]="'APP.salesWithCoupon' | translate" [value]="compact(d.kpis?.salesWithCoupon)" [delta]="d.kpis?.salesChangePct ?? null"></ts-kpi>
          <ts-kpi icon="ti ti-discount" tone="expense" [label]="'APP.totalDiscount' | translate" [value]="compact(d.kpis?.totalDiscount)" [footnote]="pct(d.kpis?.discountShareOfSales)"></ts-kpi>
          <ts-kpi icon="ti ti-calculator" [label]="'APP.avgDiscount' | translate" [value]="num(d.kpis?.avgDiscount)"></ts-kpi>
        </div>
        <ts-card [title]="'APP.usesOverTime' | translate" icon="ti ti-chart-bar">
          <ts-pill-switch [items]="groups" [selected]="group" (selectedChange)="group = $event; load()"></ts-pill-switch>
          <ts-bars [values]="usesValues()" [labels]="usesLabels()" color="var(--ts-marketing, #c2187a)" style="display: block; margin-top: 12px"></ts-bars>
        </ts-card>
        <ts-card [title]="'APP.byType' | translate" icon="ti ti-category">
          <ts-info *ngFor="let t of d.byType ?? []" [label]="t.label + ' · ' + ('APP.usesN' | translate: { n: num(t.uses) })" [value]="num(t.discount) + ' ' + ('APP.egp' | translate)"></ts-info>
        </ts-card>
        <ts-card [title]="'APP.topCoupons' | translate" icon="ti ti-trophy">
          <ts-info *ngFor="let t of d.top ?? []" [label]="t.code + ' · ' + ('APP.usesN' | translate: { n: num(t.uses) })" [value]="num(t.sales) + ' ' + ('APP.egp' | translate)"></ts-info>
        </ts-card>
      </ng-container>
    </div>
  `
})
export class CouponAnalyticsComponent implements OnInit {
  private readonly api = inject(MarketingApi);
  private readonly text = inject(StaffText);
  num = fmtNum;
  compact = fmtCompact;
  pct = (v: number | null | undefined) => fmtPct(v);
  group = 'week';
  groups = [
    { key: 'day', label: this.text.tr('APP.day') },
    { key: 'week', label: this.text.tr('APP.week') },
    { key: 'month', label: this.text.tr('APP.month') }
  ];
  d: any = null;
  error: unknown = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.error = null;
    this.api.couponAnalytics(null, this.group).subscribe({ next: (d) => (this.d = d), error: (e) => (this.error = e) });
  }

  usesValues(): number[] {
    return (this.d?.series ?? []).map((s: any) => s.uses ?? 0);
  }

  usesLabels(): string[] {
    return (this.d?.series ?? []).map((s: any) => String(s.period ?? '').split('-').pop());
  }
}
