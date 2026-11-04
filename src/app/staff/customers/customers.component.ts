import { Component, Injectable, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, catchError, firstValueFrom, forkJoin, map, of, switchMap } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { FilterDrawerComponent, LISTS } from '../ui/lists';
import { SwitchRowComponent } from '../ui/controls';
import { StaffDialogs } from '../ui/dialogs';
import { StaffHttp } from '../core/staff-http';
import { FilterCondition, FilterSchema, FiltersApi, ListResult, PagedList, asPage, emptyQuery, queryJson, StaffQuery } from '../core/query';
import { P, StaffSession } from '../core/session';
import { AdjustReason, itemType } from '../core/enums';
import { fmtCompact, fmtNum, fmtShortDate, fmtTime, parseAmount, parseDate, uuid } from '../core/format';
import { FORM_KIT } from '../forms/form-kit';
import { bookingsLink } from '../bookings/bookings-api';
import { BarsComponent, KpiTileComponent, ShareBarComponent } from 'src/app/demo/pages/staff-analytics/staff-ui';

/** Customers and wallets: StaffCustomersController + lists/customers + the existing user info. */
@Injectable({ providedIn: 'root' })
export class CustomersApi {
  private readonly http = inject(StaffHttp);

  list(q: StaffQuery): Observable<ListResult<any>> {
    return this.http.post<any>('/api/staff/lists/customers', queryJson(q)).pipe(map((d) => ({ page: asPage<any>(d) })));
  }

  /** The existing GET /api/Users/GetUserInfoById/?UserId= answers the user without the ApiResponse wrapper. */
  user(id: number): Observable<any> {
    return this.http.raw<any>('GET', '/api/Users/GetUserInfoById/', undefined, { UserId: id }).pipe(map((j) => (j?.data && typeof j.data === 'object' ? j.data : j)));
  }

  counts(id: number): Observable<any | null> {
    return this.http.post<any[]>('/api/staff/customers/booking-counts', { userIds: [id] }).pipe(map((d) => d?.[0] ?? null));
  }

  /** The customer's wallet by their id (null when they have none yet). */
  wallet(userId: number): Observable<any | null> {
    return this.http.get<any>(`/api/staff/customers/${userId}/wallet`).pipe(map((w) => w ?? null));
  }

  adjustments(userId: number): Observable<any[]> {
    return this.http.get<any>(`/api/staff/customers/${userId}/wallet-adjustments`).pipe(map((d) => asPage<any>(d).data));
  }

  /** POST /api/staff/wallet/adjust: positive adds, negative deducts. The backend refuses a deduction above the balance. */
  adjust(o: { userId: number; amount: number; reason: number; note: string | null; notify: boolean }, key: string): Observable<any> {
    return this.http.postIdempotent(
      '/api/staff/wallet/adjust',
      { userId: o.userId, amount: o.amount, reason: o.reason, note: o.note, notifyCustomer: o.notify },
      key
    );
  }

  /** { summary, page } (StaffWalletTransactionPageDto). */
  transactions(q: StaffQuery): Observable<ListResult<any>> {
    return this.http.post<any>('/api/staff/wallet-transactions', queryJson(q)).pipe(map((d) => ({ page: asPage<any>(d?.page), summary: d?.summary })));
  }

  analytics(id: number): Observable<any> {
    return this.http.get<any>(`/api/staff/customers/${id}/analytics`);
  }

  /** The customer's file: the user, then their counts, wallet and adjustments (each may fail on its own). */
  /** PUT /api/Customers/UpdateCustomerStatus/ (CustomerUpdateDto): IActive false blocks the customer, true lets them back in. */
  setActive(id: number, active: boolean): Observable<unknown> {
    return this.http.put('/api/Customers/UpdateCustomerStatus/', { id, iActive: active });
  }

  file(id: number): Observable<{ user: any; counts: any; wallet: any; adjustments: any[] }> {
    return this.user(id).pipe(
      switchMap((user) =>
        forkJoin({
          counts: this.counts(id).pipe(catchError(() => of(null))),
          wallet: this.wallet(id).pipe(catchError(() => of(null))),
          adjustments: this.adjustments(id).pipe(catchError(() => of([]))),
          // GetUserInfoById has no IActive; GetCustomerById has it (false = blocked)
          active: this.http.raw<any>('GET', '/api/Customers/GetCustomerById/', undefined, { id }).pipe(
            map((j) => (j?.data ?? j)?.iActive ?? null),
            catchError(() => of(null))
          )
        }).pipe(map(({ active, ...rest }) => ({ user: active == null ? user : { ...user, iActive: active }, ...rest })))
      )
    );
  }
}

/** a-customers. */
@Component({
  selector: 'ts-customers',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...LISTS],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'APP.customers' | translate" [subtitle]="'APP.customersCount' | translate: { n: num(list.total) }">
        <button type="button" class="ts-icon-btn" (click)="drawer.show()" [attr.aria-label]="'APP.customerFilters' | translate">
          <i class="ti ti-adjustments-horizontal"></i>
          <span class="ts-icon-btn__badge" *ngIf="list.activeFilters">{{ list.activeFilters }}</span>
        </button>
      </ts-appbar>
      <div class="ts-listbar">
        <ts-search [hint]="schema?.searchPlaceholderAr || ('APP.search' | translate)" (changed)="list.setSearch($event)"></ts-search>
      </div>
      <ts-paged-list [list]="list" emptyIcon="ti ti-users" [grid]="true">
        <ng-template let-c>
          <a class="ts-list-card" [routerLink]="['/a/more/customers', c.id]">
            <ts-avatar [name]="c.name"></ts-avatar>
            <span class="ts-card-row__main">
              <span class="ts-card-title">{{ c.name }}</span>
              <span class="ts-muted ts-num">{{ c.phone || c.email || '—' }}</span>
              <ts-pill *ngIf="c.isActive != null" [tone]="c.isActive ? 'ok' : 'neutral'" style="margin-top: 4px">
                {{ (c.isActive ? 'APP.active' : 'APP.inactive') | translate }}
              </ts-pill>
            </span>
            <span class="ts-end-col">
              <small class="ts-muted">{{ 'APP.bookingsN' | translate: { n: num(c.bookingsCount ?? 0) } }}</small>
              <strong class="ts-num">{{ c.walletBalance | ts }} {{ 'APP.egp' | translate }}</strong>
            </span>
          </a>
        </ng-template>
      </ts-paged-list>
    </div>
    <ts-filter-drawer #drawer listKey="customers" [title]="'APP.customerFilters' | translate" [list]="$any(list)"></ts-filter-drawer>
  `
})
export class CustomersComponent implements OnInit, OnDestroy {
  private readonly api = inject(CustomersApi);
  private readonly filters = inject(FiltersApi);
  @ViewChild('drawer') drawer!: FilterDrawerComponent;
  list = new PagedList<any>((q) => this.api.list(q), {}, 'customers');
  schema: FilterSchema | null = null;
  num = fmtNum;

  ngOnInit(): void {
    this.filters.schema('customers').subscribe({ next: (s) => (this.schema = s), error: () => {} });
  }

  ngOnDestroy(): void {
    this.list.destroy();
  }
}

/** a-customer: profile, wallet with add / deduct, adjustments, their analytics and bookings. */
@Component({
  selector: 'ts-customer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, KpiTileComponent, BarsComponent, ShareBarComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.customerFile' | translate"></ts-appbar>
      <ts-loading *ngIf="loading"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ng-container *ngIf="f && !loading">
        <ts-card>
          <div class="ts-person">
            <ts-avatar [name]="name" [size]="56"></ts-avatar>
            <div class="ts-grow">
              <h2 class="ts-person__name">{{ name }}</h2>
              <p class="ts-muted" *ngIf="f.user.email">{{ f.user.email }}</p>
              <p class="ts-muted ts-num" *ngIf="phone">{{ phone }}</p>
            </div>
            <a *ngIf="f.wallet?.phone" class="ts-icon-btn ts-icon-btn--outline" [href]="'tel:' + f.wallet.phone" [title]="'WEB.call' | translate"><i class="ti ti-phone"></i></a>
          </div>
          <div class="ts-spread" style="margin-top: 12px">
            <ts-pill [tone]="blocked ? 'danger' : 'ok'">{{ (blocked ? 'APP.blocked' : 'APP.active') | translate }}</ts-pill>
            <button *ngIf="canBlock" type="button" class="btn" [class.btn-danger]="!blocked" [class.btn-secondary]="blocked" [disabled]="busy" (click)="toggleBlock()">
              <i class="ti ti-ban"></i>{{ (blocked ? 'APP.unblock' : 'APP.block') | translate }}
            </button>
          </div>
        </ts-card>

        <ts-card [title]="'APP.wallet' | translate" icon="ti ti-wallet">
          <div class="ts-two">
            <div class="ts-money-cell">
              <small>{{ 'APP.balance' | translate }}</small>
              <strong class="ts-num">{{ f.wallet?.currentBalance | ts }} {{ 'APP.egp' | translate }}</strong>
            </div>
            <div class="ts-money-cell">
              <small>{{ 'APP.bonus' | translate }}</small>
              <strong class="ts-num">{{ f.wallet?.bonusBalance | ts }} {{ 'APP.egp' | translate }}</strong>
              <small *ngIf="f.wallet?.bonusExpiryDate">{{ 'APP.until' | translate: { n: short(f.wallet.bonusExpiryDate) } }}</small>
            </div>
          </div>
          <div class="ts-two" *ngIf="canAdjust" style="margin-top: 12px">
            <a class="btn btn-secondary" [routerLink]="['/a/more/customers', id, 'wallet']" [queryParams]="{ mode: 'deduct' }"><i class="ti ti-minus"></i>{{ 'APP.deduct' | translate }}</a>
            <a class="btn btn-primary" [routerLink]="['/a/more/customers', id, 'wallet']" [queryParams]="{ mode: 'add' }"><i class="ti ti-plus"></i>{{ 'APP.add' | translate }}</a>
          </div>
        </ts-card>

        <ts-card *ngIf="f.adjustments.length" [title]="'APP.walletAdjustments' | translate" icon="ti ti-arrows-exchange">
          <ts-info *ngFor="let a of f.adjustments" [label]="a.reasonName + ' · ' + (a.date | ts: 'date') + (a.byName ? ' · ' + a.byName : '')">
            <span class="ts-num" [style.color]="a.amount >= 0 ? 'var(--ts-ok-fg)' : 'var(--ts-danger-ink)'">{{ a.amount >= 0 ? '+' : '−' }}{{ abs(a.amount) | ts }}</span>
          </ts-info>
        </ts-card>

        <!-- CustomerAnalyticsSection: every number opens the bookings it counts -->
        <ts-loading *ngIf="!a && !aError"></ts-loading>
        <ts-error *ngIf="aError" [error]="aError" (retry)="loadAnalytics()"></ts-error>
        <ng-container *ngIf="a">
          <ts-card *ngIf="!a.counts?.total" [title]="'APP.customerAnalytics' | translate" icon="ti ti-chart-dots">
            <ts-empty icon="ti ti-calendar-off" [message]="'APP.noBookingsYet' | translate"></ts-empty>
          </ts-card>
          <ng-container *ngIf="a.counts?.total">
            <ts-card
              [title]="'APP.customerAnalytics' | translate"
              [subtitle]="a.firstBookingAt ? ('APP.customerSince' | translate: { n: short(a.firstBookingAt) }) : null"
              icon="ti ti-chart-dots"
            >
              <div class="ts-kpi-grid">
                <ts-kpi
                  class="ts-kpi-hero"
                  tone="revenue"
                  icon="ti ti-cash"
                  [label]="'APP.totalPaid' | translate"
                  [value]="num(a.counts.paid) + ' ' + ('APP.egp' | translate)"
                  [footnote]="a.counts.avgPaid != null ? ('APP.avgBookingN' | translate: { n: num(a.counts.avgPaid) }) : null"
                  [link]="group('APP.totalPaid', 'completed')"
                ></ts-kpi>
                <ts-kpi tone="info" icon="ti ti-ticket" [label]="'APP.allTheirBookings' | translate" [value]="num(a.counts.total)" [link]="all()"></ts-kpi>
                <ts-kpi tone="success" icon="ti ti-circle-check" [label]="'APP.completed' | translate" [value]="num(a.counts.completed)" [link]="group('APP.completed', 'completed')"></ts-kpi>
                <ts-kpi tone="expense" icon="ti ti-circle-x" [label]="'APP.cancelled' | translate" [value]="num(a.counts.cancelled)" [link]="group('APP.cancelled', 'cancelled')"></ts-kpi>
                <ts-kpi tone="pending" icon="ti ti-hourglass" [label]="'APP.pending' | translate" [value]="num(a.counts.pending)" [link]="group('APP.pending', 'pending')"></ts-kpi>
                <ts-kpi tone="inactive" icon="ti ti-arrow-back-up" [label]="'APP.refunded' | translate" [value]="num(a.counts.refunded)" [link]="group('APP.refunded', 'refunded')"></ts-kpi>
                <ts-kpi icon="ti ti-calendar-event" [label]="'APP.lastBooking' | translate" [value]="short(a.lastBookingAt)" [footnote]="time(a.lastBookingAt)"></ts-kpi>
              </div>
            </ts-card>
            <ts-card [title]="'APP.bookingsOverTime' | translate" [subtitle]="'APP.last12Months' | translate" icon="ti ti-chart-bar" iconColor="var(--ts-blue)">
              <ts-bars [values]="monthValues()" [labels]="monthLabels()" color="var(--ts-blue)"></ts-bars>
            </ts-card>
            <ts-card *ngIf="modules().length" [title]="'APP.whatTheyBook' | translate" icon="ti ti-category" iconColor="var(--ts-teal)">
              <ts-share-bar [parts]="shareParts()"></ts-share-bar>
              <a class="ts-row is-link" *ngFor="let m of modules()" [routerLink]="moduleLink(m)">
                <span class="ts-row__label"><i class="ts-chip__dot" [style.background]="type(m).color"></i> {{ type(m).plural | translate }}</span>
                <strong class="ts-num">{{ m.count | ts }}</strong>
              </a>
              <ng-container *ngIf="a.topCategories?.length">
                <p class="ts-label" style="margin-top: 12px">{{ 'APP.topCategories' | translate }}</p>
                <div class="ts-wrap">
                  <ts-tag *ngFor="let c of a.topCategories" [tone]="c.key === 'hajj' ? 'gold' : 'info'" [icon]="c.key === 'hajj' ? 'ti ti-building-mosque' : 'ti ti-ticket'">
                    {{ c.name }} · {{ c.count | ts }}
                  </ts-tag>
                </div>
              </ng-container>
            </ts-card>
          </ng-container>
        </ng-container>

        <a class="btn btn-secondary ts-wide-btn" [routerLink]="all()"><i class="ti ti-calendar"></i>{{ 'APP.theirBookings' | translate }}</a>
      </ng-container>
    </div>
  `
})
export class CustomerComponent implements OnInit {
  private readonly api = inject(CustomersApi);
  private readonly dialogs = inject(StaffDialogs);
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  num = fmtNum;
  abs = Math.abs;
  short = (v: unknown) => fmtShortDate(v as any);
  time = (v: unknown) => fmtTime(v as any, this.text.arabic);

  id = 0;
  f: { user: any; counts: any; wallet: any; adjustments: any[] } | null = null;
  a: any = null;
  loading = false;
  error: unknown = null;
  aError: unknown = null;

  get canAdjust(): boolean {
    return this.session.can(P.walletEdit);
  }

  get canBlock(): boolean {
    return this.session.can(P.customersEdit);
  }

  /** User.IActive: false means blocked (UpdateCustomerStatus). */
  get blocked(): boolean {
    return this.f?.user?.iActive === false || this.f?.user?.isActive === false;
  }

  busy = false;

  async toggleBlock(): Promise<void> {
    const block = !this.blocked;
    const ok = await this.dialogs.confirm({
      title: this.text.tr(block ? 'APP.block' : 'APP.unblock'),
      message: this.text.tr(block ? 'APP.blockCustomerQ' : 'APP.unblockCustomerQ'),
      confirm: this.text.tr(block ? 'APP.block' : 'APP.unblock')
    });
    if (!ok) return;
    this.busy = true;
    try {
      await firstValueFrom(this.api.setActive(this.id, !block));
      this.f!.user = { ...this.f!.user, iActive: !block, isActive: !block };
      this.text.showDone(this.text.tr('APP.saved'));
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }

  get name(): string {
    return `${this.f?.user?.firstName ?? ''} ${this.f?.user?.lastName ?? ''}`.trim();
  }

  get phone(): string {
    return `${this.f?.user?.phoneCode ?? ''}${this.f?.user?.phoneNumber ?? ''}`;
  }

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.load();
    this.loadAnalytics();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.file(this.id).subscribe({
      next: (f) => {
        this.f = f;
        this.loading = false;
      },
      error: (e) => {
        this.error = e;
        this.loading = false;
      }
    });
  }

  loadAnalytics(): void {
    this.aError = null;
    this.a = null;
    this.api.analytics(this.id).subscribe({ next: (a) => (this.a = a), error: (e) => (this.aError = e) });
  }

  private get customer(): FilterCondition {
    return { field: 'customerId', op: 'eq', values: [String(this.id)] };
  }

  all(): any[] {
    return bookingsLink(this.text.tr('APP.allTheirBookings'), [this.customer]);
  }

  /** The BookingStatus values of a status group (statusGroups: {"completed": [4, 9], …}) as a "status in" filter. */
  group(title: string, key: string): any[] {
    const values = ((this.a?.statusGroups?.[key] as unknown[]) ?? []).map(String);
    return bookingsLink(this.text.tr(title), [this.customer, { field: 'status', op: 'in', values }]);
  }

  monthValues(): number[] {
    return (this.a?.months ?? []).map((m: any) => m.bookings ?? 0);
  }

  monthLabels(): string[] {
    return (this.a?.months ?? []).map((m: any) => String(m.month));
  }

  modules(): any[] {
    return (this.a?.modules ?? []).filter((m: any) => m.count > 0);
  }

  type(m: any) {
    return itemType(parseInt(m.key, 10));
  }

  shareParts() {
    return this.modules().map((m) => ({ label: this.text.tr(this.type(m).plural), value: m.count, color: this.type(m).color }));
  }

  moduleLink(m: any): any[] {
    return bookingsLink(this.text.tr(this.type(m).plural), [this.customer, { field: 'module', op: 'eq', values: [String(m.key)] }]);
  }
}

/** a-wallet-adjust: add to or deduct from a customer's wallet, with a reason, saved with the log. */
@Component({
  selector: 'ts-wallet-adjust',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ...LISTS, ...FORM_KIT, SwitchRowComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="(deduct ? 'APP.deductFromWallet' : 'APP.addToWallet') | translate" [subtitle]="name"></ts-appbar>
      <ts-card>
        <ts-info [label]="'APP.currentBalance' | translate">
          <strong class="ts-num">{{ balance | ts }} {{ 'APP.egp' | translate }}</strong>
        </ts-info>
      </ts-card>
      <ts-card>
        <ts-field [label]="'APP.amount' | translate" [number]="true" [suffix]="'APP.egp' | translate" [required]="true" [error]="error" [(value)]="amount"></ts-field>
        <p class="ts-label">{{ 'APP.reason' | translate }}</p>
        <ts-chipbar [wrap]="true" [items]="reasons" [selected]="[String(reason)]" (tap)="reason = +$event"></ts-chipbar>
        <ts-field [label]="'APP.note' | translate" [lines]="3" [hint]="'APP.optional' | translate" [(value)]="note" style="display: block; margin-top: 12px"></ts-field>
        <ts-switch-row [title]="'APP.notifyCustomer' | translate" [(value)]="notify"></ts-switch-row>
      </ts-card>
      <div class="ts-sticky-foot">
        <button type="button" class="btn ts-wide-btn" [class.btn-danger]="deduct" [class.btn-primary]="!deduct" [disabled]="busy" (click)="save()">
          <i *ngIf="busy" class="pi pi-spin pi-spinner"></i>{{ (deduct ? 'APP.deduct' : 'APP.add') | translate }}
        </button>
      </div>
    </div>
  `
})
export class WalletAdjustComponent implements OnInit {
  private readonly api = inject(CustomersApi);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly text = inject(StaffText);
  readonly String = String;

  userId = 0;
  deduct = false;
  balance: number | null = null;
  name = '';
  amount = '';
  note = '';
  reason: number = 1;
  notify = true;
  busy = false;
  error: string | null = null;
  reasons = AdjustReason.all.map((r) => ({ key: String(r), label: this.text.tr(AdjustReason.label(r)) }));
  /** One key per filled form: pressing again (or a retry) after a slow answer can't add the amount twice. */
  private key = uuid();

  ngOnInit(): void {
    this.userId = +this.route.snapshot.paramMap.get('id')!;
    this.deduct = this.route.snapshot.queryParamMap.get('mode') === 'deduct';
    this.api.file(this.userId).subscribe({
      next: (f) => {
        this.balance = f.wallet?.currentBalance ?? null;
        this.name = `${f.user?.firstName ?? ''} ${f.user?.lastName ?? ''}`.trim();
      },
      error: () => {}
    });
  }

  async save(): Promise<void> {
    const a = parseAmount(this.amount);
    if (a == null || a <= 0) return void (this.error = this.text.tr('APP.amountRequired'));
    if (this.deduct && this.balance != null && a > this.balance) return void (this.error = this.text.tr('APP.moreThanBalance'));
    this.busy = true;
    this.error = null;
    try {
      const r = await firstValueFrom(
        this.api.adjust({ userId: this.userId, amount: this.deduct ? -a : a, reason: this.reason, note: this.note.trim() || null, notify: this.notify }, this.key)
      );
      this.text.showDone(this.text.tr('APP.newBalance', { n: fmtNum(r?.balanceAfter) }));
      this.location.back();
    } catch (e) {
      this.error = this.text.error(e);
    } finally {
      this.busy = false;
    }
  }
}

/** a-wallet-txns: every wallet movement with the totals above, grouped by day. */
@Component({
  selector: 'ts-wallet-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...LISTS, KpiTileComponent],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'APP.walletMoves' | translate">
        <button type="button" class="ts-icon-btn" (click)="drawer.show()" [attr.aria-label]="'APP.walletFilters' | translate">
          <i class="ti ti-adjustments-horizontal"></i>
          <span class="ts-icon-btn__badge" *ngIf="list.activeFilters">{{ list.activeFilters }}</span>
        </button>
      </ts-appbar>
      <div class="ts-kpi-grid ts-kpi-grid--3" *ngIf="list.summary as s">
        <ts-kpi icon="ti ti-wallet" [label]="'APP.totalBalances' | translate" [value]="compact(s.totalBalance)"></ts-kpi>
        <ts-kpi icon="ti ti-gift" [label]="'APP.totalBonus' | translate" [value]="compact(s.totalBonus)"></ts-kpi>
        <ts-kpi icon="ti ti-shopping-cart" [label]="'APP.spentThisMonth' | translate" [value]="compact(s.spentThisMonth)"></ts-kpi>
      </div>
      <div class="ts-listbar">
        <ts-search [hint]="'APP.search' | translate" (changed)="list.setSearch($event)"></ts-search>
      </div>
      <ts-paged-list [list]="list" [groupDate]="groupDate" emptyIcon="ti ti-arrows-exchange" [grid]="true">
        <ng-template let-t>
          <a class="ts-list-card" [routerLink]="['/a/more/customers', t.userId]">
            <ts-icon-tile
              [icon]="t.amountIn > 0 ? 'ti ti-arrow-down-left' : 'ti ti-arrow-up-right'"
              [color]="t.amountIn > 0 ? 'var(--ts-ok-fg)' : 'var(--ts-danger-ink)'"
              [bg]="t.amountIn > 0 ? 'var(--ts-ok-bg)' : 'var(--ts-danger-soft)'"
              [size]="40"
            ></ts-icon-tile>
            <span class="ts-card-row__main">
              <span class="ts-card-title">{{ t.customerName }}</span>
              <span class="ts-muted">{{ describe(t) }}</span>
            </span>
            <strong class="ts-num" [style.color]="t.amountIn > 0 ? 'var(--ts-ok-fg)' : 'var(--ts-danger-ink)'">
              {{ t.amountIn > 0 ? '+' + num(t.amountIn) : '−' + num(t.amountOut) }}
            </strong>
          </a>
        </ng-template>
      </ts-paged-list>
    </div>
    <ts-filter-drawer #drawer listKey="wallet-transactions" [title]="'APP.walletFilters' | translate" [list]="$any(list)"></ts-filter-drawer>
  `
})
export class WalletTransactionsComponent implements OnDestroy {
  private readonly api = inject(CustomersApi);
  @ViewChild('drawer') drawer!: FilterDrawerComponent;
  list = new PagedList<any>((q) => this.api.transactions(q), {}, 'wallet-transactions');
  num = fmtNum;
  compact = fmtCompact;
  groupDate = (t: any) => t.date;

  describe(t: any): string {
    return [t.typeName, t.adjustment?.reasonName, t.bookingReference ? `#${t.bookingReference}` : null].filter(Boolean).join(' · ');
  }

  ngOnDestroy(): void {
    this.list.destroy();
  }
}
