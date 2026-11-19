import { Component, Injectable, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, firstValueFrom } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { SheetComponent } from '../ui/dialogs';
import { StaffHttp, mediaUrl } from '../core/staff-http';
import { P, StaffSession } from '../core/session';
import { fmtDate, fmtNum, parseAmount } from '../core/format';
import { DateFieldComponent, FieldComponent, formDate } from '../forms/form-kit';
import { KpiTileComponent } from 'src/app/demo/pages/staff-analytics/staff-ui';

/** One subscription as GET /api/staff/subscriptions gives it (SubscriptionDto). */
export interface Sub {
  id: number;
  name: string;
  category: string;
  plan: string | null;
  cost: number | null;
  currency: string;
  billingCycle: string;
  nextRenewal: string | null;
  autoRenew: boolean;
  remindDaysBefore: number;
  paymentMethod: string | null;
  accountEmail: string | null;
  billingUrl: string | null;
  status: string;
  notes: string | null;
  daysLeft: number | null;
  state: 'ok' | 'soon' | 'overdue' | 'none';
  monthlyEgp: number | null;
  lastPaidOn: string | null;
  paidThisYearEgp: number;
}

export interface SubPayment {
  id: number;
  paidOn: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  amountEgp: number;
  periodFrom: string | null;
  periodTo: string | null;
  paidBy: string | null;
  receiptUrl: string | null;
  notes: string | null;
}

export interface SubsOverview {
  monthlyEgp: number;
  missingRate: number;
  dueSoon: number;
  overdue: number;
  spentThisMonthEgp: number;
  spentThisYearEgp: number;
  items: Sub[];
}

@Injectable({ providedIn: 'root' })
export class SubscriptionsApi {
  private readonly http = inject(StaffHttp);
  overview(): Observable<SubsOverview> {
    return this.http.get<SubsOverview>('/api/staff/subscriptions');
  }
  details(id: number): Observable<{ subscription: Sub; payments: SubPayment[] }> {
    return this.http.get(`/api/staff/subscriptions/${id}`);
  }
  save(id: number | null, body: unknown): Observable<Sub> {
    return id == null ? this.http.post<Sub>('/api/staff/subscriptions', body) : this.http.put<Sub>(`/api/staff/subscriptions/${id}`, body);
  }
  delete(id: number): Observable<unknown> {
    return this.http.delete(`/api/staff/subscriptions/${id}`);
  }
  /** Multipart with en-US for the numbers (messages still come in the screen's language). */
  addPayment(id: number, form: FormData): Observable<unknown> {
    return this.http.postEn(`/api/staff/subscriptions/${id}/payments`, form);
  }
  deletePayment(paymentId: number): Observable<unknown> {
    return this.http.delete(`/api/staff/subscriptions/payments/${paymentId}`);
  }
}

const CATEGORIES = ['server', 'sms', 'ai', 'cloud', 'stores', 'domain', 'payments', 'tools', 'other'];
const CYCLES = ['monthly', 'yearly', 'usage', 'prepaid', 'oneTime'];

/**
 * a-more-subscriptions (19 Nov 2026): the services Trips pays for (SMS, Claude, Google Cloud, Contabo…), the month's
 * cost in pounds, what renews soon or is overdue, and each one's payments with their invoices.
 */
@Component({
  selector: 'ts-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ...KIT, SheetComponent, FieldComponent, DateFieldComponent, KpiTileComponent],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'SUB.title' | translate"></ts-appbar>
      <ts-loading *ngIf="!d && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ng-container *ngIf="d">
        <div class="ts-kpi-grid">
          <ts-kpi icon="ti ti-wallet" tone="revenue" [label]="'SUB.monthlyTotal' | translate" [value]="egp(d.monthlyEgp)"
            [footnote]="d.missingRate ? ('SUB.missingRate' | translate: { n: d.missingRate }) : ''"></ts-kpi>
          <ts-kpi icon="ti ti-clock" [label]="'SUB.dueSoon' | translate" [value]="num(d.dueSoon)"></ts-kpi>
          <ts-kpi icon="ti ti-alert-triangle" tone="expense" [label]="'SUB.overdue' | translate" [value]="num(d.overdue)"></ts-kpi>
          <ts-kpi icon="ti ti-receipt" [label]="'SUB.spentMonth' | translate" [value]="egp(d.spentThisMonthEgp)"
            [footnote]="'SUB.spentYear' | translate: { n: num(d.spentThisYearEgp) }"></ts-kpi>
        </div>
        <div class="ts-sub-bar">
          <select class="form-select ts-sub-filter" [(ngModel)]="cat">
            <option value="all">{{ 'SUB.all' | translate }} ({{ d.items.length }})</option>
            <option *ngFor="let c of categoriesIn()" [value]="c">{{ 'SUB.cat_' + c | translate }}</option>
          </select>
          <button *ngIf="canEdit" type="button" class="btn btn-primary" (click)="openEdit(null)"><i class="ti ti-plus"></i> {{ 'SUB.new' | translate }}</button>
        </div>
        <ts-empty *ngIf="!shown().length" icon="ti ti-receipt" [message]="'SUB.none' | translate"></ts-empty>
        <div class="ts-sub-grid">
          <button type="button" class="ts-sub-card" *ngFor="let s of shown()" (click)="open(s)">
            <div class="ts-sub-card__top">
              <strong>{{ s.name }}</strong>
              <span class="ts-sub-pill" [ngClass]="'is-' + pillTone(s)">{{ renewal(s) }}</span>
            </div>
            <small class="ts-muted">{{ line(s) }}</small>
            <span class="ts-sub-month">{{ s.monthlyEgp == null ? ('SUB.needsRate' | translate: { currency: s.currency }) : ('SUB.perMonth' | translate: { n: num(s.monthlyEgp) }) }}</span>
          </button>
        </div>
      </ng-container>
    </div>

    <!-- one subscription: details and payments -->
    <ts-sheet [open]="!!sel" (openChange)="sel = null" [title]="sel?.subscription?.name ?? ''" [wide]="true" [footer]="canEdit">
      <ng-container *ngIf="sel as x">
        <div class="ts-sub-details">
          <div><span>{{ 'SUB.category' | translate }}</span><b>{{ 'SUB.cat_' + x.subscription.category | translate }}</b></div>
          <div><span>{{ 'SUB.plan' | translate }}</span><b>{{ x.subscription.plan || '—' }}</b></div>
          <div><span>{{ 'SUB.cost' | translate }}</span><b>{{ money(x.subscription.cost, x.subscription.currency) }} · {{ 'SUB.cycle_' + x.subscription.billingCycle | translate }}</b></div>
          <div><span>{{ 'SUB.monthlyEgp' | translate }}</span><b>{{ x.subscription.monthlyEgp == null ? ('SUB.needsRate' | translate: { currency: x.subscription.currency }) : egp(x.subscription.monthlyEgp) }}</b></div>
          <div><span>{{ 'SUB.nextRenewal' | translate }}</span><b>{{ x.subscription.nextRenewal ? date(x.subscription.nextRenewal) : '—' }} · {{ renewal(x.subscription) }}</b></div>
          <div><span>{{ 'SUB.autoRenew' | translate }}</span><b>{{ (x.subscription.autoRenew ? 'APP.yes' : 'APP.no') | translate }}</b></div>
          <div><span>{{ 'SUB.paymentMethod' | translate }}</span><b>{{ x.subscription.paymentMethod || '—' }}</b></div>
          <div><span>{{ 'SUB.accountEmail' | translate }}</span><b>{{ x.subscription.accountEmail || '—' }}</b></div>
          <div *ngIf="x.subscription.billingUrl"><span>{{ 'SUB.billingUrl' | translate }}</span><b><a [href]="x.subscription.billingUrl" target="_blank" rel="noopener">{{ 'SUB.open' | translate }}</a></b></div>
          <div><span>{{ 'SUB.paidThisYear' | translate }}</span><b>{{ egp(x.subscription.paidThisYearEgp) }}</b></div>
          <div *ngIf="x.subscription.notes"><span>{{ 'APP.notes' | translate }}</span><b>{{ x.subscription.notes }}</b></div>
        </div>
        <h6 class="ts-sub-h">{{ 'SUB.payments' | translate }}</h6>
        <p *ngIf="!x.payments.length" class="ts-muted">{{ 'SUB.noPayments' | translate }}</p>
        <div class="ts-sub-pay" *ngFor="let p of x.payments">
          <div>
            <strong>{{ money(p.amount, p.currency) }} · {{ egp(p.amountEgp) }}</strong>
            <small class="ts-muted">{{ date(p.paidOn) }}<ng-container *ngIf="p.currency !== 'EGP'"> · {{ 'SUB.rateOf' | translate: { n: p.exchangeRate } }}</ng-container><ng-container *ngIf="p.periodFrom"> · {{ date(p.periodFrom) }} → {{ date(p.periodTo) }}</ng-container><ng-container *ngIf="p.paidBy"> · {{ p.paidBy }}</ng-container></small>
          </div>
          <a *ngIf="p.receiptUrl" class="ts-icon-btn" [href]="media(p.receiptUrl)" target="_blank" rel="noopener" [title]="'SUB.receipt' | translate"><i class="ti ti-paperclip"></i></a>
          <button *ngIf="canEdit" type="button" class="ts-icon-btn" (click)="deletePayment(p)"><i class="ti ti-trash"></i></button>
        </div>
      </ng-container>
      <div sheet-foot class="ts-sub-foot">
        <button type="button" class="btn btn-primary" (click)="openPayment()"><i class="ti ti-cash"></i> {{ 'SUB.addPayment' | translate }}</button>
        <button type="button" class="btn btn-outline-secondary" (click)="openEdit(sel!.subscription)"><i class="ti ti-pencil"></i> {{ 'APP.edit' | translate }}</button>
        <button type="button" class="btn btn-outline-danger" (click)="remove()"><i class="ti ti-trash"></i></button>
      </div>
    </ts-sheet>

    <!-- add or edit a subscription -->
    <ts-sheet [open]="!!f" (openChange)="f = null" [title]="(f?.id ? 'APP.edit' : 'SUB.new') | translate">
      <ng-container *ngIf="f">
        <ts-field name="Name" [label]="'SUB.name' | translate" [required]="true" hint="Contabo" [(value)]="f.name"></ts-field>
        <label class="ts-field"><span>{{ 'SUB.category' | translate }}</span>
          <select class="form-select" [(ngModel)]="f.category"><option *ngFor="let c of categories" [value]="c">{{ 'SUB.cat_' + c | translate }}</option></select>
        </label>
        <ts-field name="Plan" [label]="'SUB.plan' | translate" [hint]="'APP.optional' | translate" [(value)]="f.plan"></ts-field>
        <label class="ts-field"><span>{{ 'SUB.cycle' | translate }}</span>
          <select class="form-select" [(ngModel)]="f.billingCycle"><option *ngFor="let c of cycles" [value]="c">{{ 'SUB.cycle_' + c | translate }}</option></select>
        </label>
        <div class="ts-two">
          <ts-field name="Cost" [label]="'SUB.cost' | translate" [number]="true" [hint]="'APP.optional' | translate" [(value)]="f.cost"></ts-field>
          <ts-field name="Currency" [label]="'SUB.currency' | translate" hint="USD" [(value)]="f.currency"></ts-field>
        </div>
        <ts-date-field name="NextRenewal" [label]="'SUB.nextRenewal' | translate" [(value)]="f.nextRenewal"></ts-date-field>
        <label class="ts-check"><input type="checkbox" [(ngModel)]="f.autoRenew" /> {{ 'SUB.autoRenew' | translate }}</label>
        <ts-field name="RemindDaysBefore" [label]="'SUB.remind' | translate" [number]="true" [(value)]="f.remindDaysBefore"></ts-field>
        <ts-field name="PaymentMethod" [label]="'SUB.paymentMethod' | translate" [hint]="'SUB.paymentMethodHint' | translate" [(value)]="f.paymentMethod"></ts-field>
        <ts-field name="AccountEmail" [label]="'SUB.accountEmail' | translate" [(value)]="f.accountEmail"></ts-field>
        <ts-field name="BillingUrl" [label]="'SUB.billingUrl' | translate" hint="https://" [(value)]="f.billingUrl"></ts-field>
        <label class="ts-field"><span>{{ 'SUB.status' | translate }}</span>
          <select class="form-select" [(ngModel)]="f.status">
            <option value="active">{{ 'SUB.active' | translate }}</option>
            <option value="trial">{{ 'SUB.trial' | translate }}</option>
            <option value="cancelled">{{ 'SUB.cancelled' | translate }}</option>
          </select>
        </label>
        <ts-field name="Notes" [label]="'APP.notes' | translate" [lines]="3" [(value)]="f.notes"></ts-field>
        <p class="ts-muted mi-small">{{ 'SUB.noSecrets' | translate }}</p>
      </ng-container>
      <div sheet-foot><button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy" (click)="saveEdit()">{{ 'APP.save' | translate }}</button></div>
    </ts-sheet>

    <!-- record a payment -->
    <ts-sheet [open]="!!pay" (openChange)="pay = null" [title]="'SUB.addPayment' | translate">
      <ng-container *ngIf="pay">
        <ts-date-field name="PaidOn" [label]="'SUB.paidOn' | translate" [(value)]="pay.paidOn"></ts-date-field>
        <div class="ts-two">
          <ts-field name="Amount" [label]="'SUB.amount' | translate" [number]="true" [required]="true" [(value)]="pay.amount"></ts-field>
          <ts-field name="Currency" [label]="'SUB.currency' | translate" [(value)]="pay.currency"></ts-field>
        </div>
        <ts-field *ngIf="!payEgp()" name="ExchangeRate" [label]="'SUB.rate' | translate: { currency: pay.currency.toUpperCase() }" [number]="true" [required]="true" [(value)]="pay.rate"></ts-field>
        <p *ngIf="payInEgp() != null" class="ts-sub-egp">= {{ egp(payInEgp()) }}</p>
        <div class="ts-two">
          <ts-date-field name="PeriodFrom" [label]="'SUB.periodFrom' | translate" [(value)]="pay.from"></ts-date-field>
          <ts-date-field name="PeriodTo" [label]="'SUB.periodTo' | translate" [(value)]="pay.to"></ts-date-field>
        </div>
        <ts-field name="PaidBy" [label]="'SUB.paidBy' | translate" [(value)]="pay.paidBy"></ts-field>
        <ts-field name="Notes" [label]="'APP.notes' | translate" [(value)]="pay.notes"></ts-field>
        <label class="ts-field"><span>{{ 'SUB.attachReceipt' | translate }}</span>
          <input class="form-control" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" (change)="pay.file = $any($event.target).files?.[0] ?? null" />
        </label>
        <label *ngIf="canMove()" class="ts-check"><input type="checkbox" [(ngModel)]="pay.move" /> {{ 'SUB.moveRenewal' | translate }}</label>
      </ng-container>
      <div sheet-foot><button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy" (click)="savePayment()">{{ 'APP.save' | translate }}</button></div>
    </ts-sheet>
  `,
  styles: [
    `
      .ts-sub-bar { display: flex; gap: 8px; align-items: center; margin: 12px 0; flex-wrap: wrap; }
      .ts-sub-filter { max-width: 240px; }
      .ts-sub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }
      .ts-sub-card { text-align: start; border: 0; border-radius: 16px; background: var(--ts-surface, #fff); padding: 14px; display: flex; flex-direction: column; gap: 4px; box-shadow: 0 2px 10px rgba(58, 31, 16, 0.06); }
      .ts-sub-card__top { display: flex; justify-content: space-between; gap: 8px; align-items: center; }
      .ts-sub-month { font-size: 13px; font-weight: 600; }
      .ts-sub-pill { border-radius: 999px; padding: 2px 10px; font-size: 12px; white-space: nowrap; }
      .ts-sub-pill.is-danger { background: #fef3f2; color: #b42318; }
      .ts-sub-pill.is-pending { background: #fff1c2; color: #8a5300; }
      .ts-sub-pill.is-ok { background: #e3f2e2; color: #2e6b3f; }
      .ts-sub-pill.is-neutral { background: #f3eee8; color: #6b5242; }
      .ts-sub-details { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px 16px; }
      .ts-sub-details div { display: flex; flex-direction: column; }
      .ts-sub-details span { font-size: 12px; color: #7a6556; }
      .ts-sub-h { margin: 16px 0 6px; }
      .ts-sub-pay { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-top: 1px solid #efe2cf; }
      .ts-sub-pay > div { flex: 1; display: flex; flex-direction: column; }
      .ts-sub-foot { display: flex; gap: 8px; flex-wrap: wrap; }
      .ts-sub-egp { font-weight: 600; margin: -6px 0 10px; }
      .ts-check { display: flex; gap: 8px; align-items: center; margin: 4px 0 12px; }
    `
  ]
})
export class SubscriptionsComponent implements OnInit {
  private readonly api = inject(SubscriptionsApi);
  private readonly text = inject(StaffText);
  private readonly session = inject(StaffSession);
  readonly categories = CATEGORIES;
  readonly cycles = CYCLES;
  d: SubsOverview | null = null;
  error: unknown = null;
  cat = 'all';
  busy = false;
  sel: { subscription: Sub; payments: SubPayment[] } | null = null;
  f: any = null;
  pay: any = null;
  num = fmtNum;

  get canEdit(): boolean {
    return this.session.can(P.subscriptionsEdit);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.error = null;
    this.api.overview().subscribe({ next: (d) => (this.d = d), error: (e) => (this.error = e) });
  }

  categoriesIn(): string[] {
    return [...new Set((this.d?.items ?? []).map((s) => s.category))];
  }

  shown(): Sub[] {
    const items = this.d?.items ?? [];
    return this.cat === 'all' ? items : items.filter((s) => s.category === this.cat);
  }

  egp(v: number | null | undefined): string {
    return v == null ? '—' : `${fmtNum(v)} ${this.text.tr('APP.egp')}`;
  }

  money(v: number | null | undefined, currency: string): string {
    return v == null ? '—' : `${fmtNum(v)} ${currency}`;
  }

  date(v: string | null | undefined): string {
    return v ? fmtDate(v, this.text.arabic) : "—";
  }

  media(url: string): string | null {
    return mediaUrl(url);
  }

  pillTone(s: Sub): string {
    return s.state === 'overdue' ? 'danger' : s.state === 'soon' ? 'pending' : s.state === 'ok' ? 'ok' : 'neutral';
  }

  renewal(s: Sub): string {
    if (s.status === 'cancelled') return this.text.tr('SUB.cancelled');
    if (s.state === 'overdue') return this.text.tr('SUB.overdueBy', { n: -(s.daysLeft ?? 0) });
    if (s.state === 'soon') return s.daysLeft === 0 ? this.text.tr('SUB.renewsToday') : this.text.tr('SUB.renewsIn', { n: s.daysLeft });
    return s.nextRenewal ? this.text.tr('SUB.renewsOn', { date: fmtDate(s.nextRenewal, this.text.arabic) }) : this.text.tr('SUB.noDate');
  }

  line(s: Sub): string {
    const cycle = this.text.tr('SUB.cycle_' + s.billingCycle);
    return [this.text.tr('SUB.cat_' + s.category), s.plan, s.cost == null ? cycle : `${this.money(s.cost, s.currency)} · ${cycle}`].filter(Boolean).join(' · ');
  }

  async open(s: Sub): Promise<void> {
    try {
      this.sel = await firstValueFrom(this.api.details(s.id));
    } catch (e) {
      this.text.showError(e);
    }
  }

  openEdit(s: Sub | null): void {
    this.f = {
      id: s?.id ?? null,
      name: s?.name ?? '',
      category: s?.category ?? 'other',
      plan: s?.plan ?? '',
      cost: s?.cost == null ? '' : String(s.cost),
      currency: s?.currency ?? 'USD',
      billingCycle: s?.billingCycle ?? 'monthly',
      nextRenewal: s?.nextRenewal ? new Date(s.nextRenewal) : null,
      autoRenew: s?.autoRenew ?? false,
      remindDaysBefore: String(s?.remindDaysBefore ?? 7),
      paymentMethod: s?.paymentMethod ?? '',
      accountEmail: s?.accountEmail ?? '',
      billingUrl: s?.billingUrl ?? '',
      status: s?.status ?? 'active',
      notes: s?.notes ?? ''
    };
  }

  async saveEdit(): Promise<void> {
    const f = this.f;
    this.busy = true;
    try {
      await firstValueFrom(
        this.api.save(f.id, {
          ...f,
          cost: parseAmount(f.cost),
          currency: String(f.currency).trim().toUpperCase(),
          nextRenewal: f.nextRenewal ? formDate(f.nextRenewal) : null,
          remindDaysBefore: parseAmount(f.remindDaysBefore) ?? 7
        })
      );
      this.f = null;
      if (this.sel && f.id) await this.open(this.sel.subscription);
      this.load();
      this.text.showDone();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }

  async remove(): Promise<void> {
    const s = this.sel?.subscription;
    if (!s || !confirm(this.text.tr('SUB.deleteQ'))) return;
    try {
      await firstValueFrom(this.api.delete(s.id));
      this.sel = null;
      this.load();
    } catch (e) {
      this.text.showError(e);
    }
  }

  openPayment(): void {
    const s = this.sel!.subscription;
    this.pay = { paidOn: new Date(), amount: s.cost == null ? '' : String(s.cost), currency: s.currency, rate: '', from: null, to: null, paidBy: '', notes: '', file: null, move: this.canMove() };
  }

  canMove(): boolean {
    const s = this.sel?.subscription;
    return !!s?.nextRenewal && ['monthly', 'yearly'].includes(s.billingCycle);
  }

  payEgp(): boolean {
    return String(this.pay?.currency ?? '').trim().toUpperCase() === 'EGP';
  }

  payInEgp(): number | null {
    const amount = parseAmount(this.pay?.amount);
    const rate = this.payEgp() ? 1 : parseAmount(this.pay?.rate);
    return amount == null || rate == null ? null : Math.round(amount * rate * 100) / 100;
  }

  async savePayment(): Promise<void> {
    const p = this.pay;
    const s = this.sel!.subscription;
    const form = new FormData();
    const put = (k: string, v: unknown) => {
      if (v !== null && v !== undefined && v !== '') form.append(k, String(v));
    };
    put('PaidOn', formDate(p.paidOn ?? new Date()));
    put('Amount', parseAmount(p.amount));
    put('Currency', String(p.currency).trim().toUpperCase());
    put('ExchangeRate', this.payEgp() ? 1 : parseAmount(p.rate));
    put('PeriodFrom', p.from ? formDate(p.from) : null);
    put('PeriodTo', p.to ? formDate(p.to) : null);
    put('PaidBy', p.paidBy?.trim());
    put('Notes', p.notes?.trim());
    put('MoveRenewal', !!p.move);
    if (p.file) form.append('Receipt', p.file, p.file.name);
    this.busy = true;
    try {
      await firstValueFrom(this.api.addPayment(s.id, form));
      this.pay = null;
      await this.open(s);
      this.load();
      this.text.showDone();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }

  async deletePayment(p: SubPayment): Promise<void> {
    if (!confirm(this.text.tr('SUB.deletePaymentQ'))) return;
    try {
      await firstValueFrom(this.api.deletePayment(p.id));
      await this.open(this.sel!.subscription);
      this.load();
    } catch (e) {
      this.text.showError(e);
    }
  }
}
