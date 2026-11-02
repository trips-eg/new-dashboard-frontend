import { Component, EventEmitter, Injectable, Input, OnDestroy, OnInit, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { ChipBarComponent, FilterDrawerComponent, LISTS } from '../ui/lists';
import { SwitchRowComponent } from '../ui/controls';
import { SheetComponent, StaffDialogs } from '../ui/dialogs';
import { StaffHttp } from '../core/staff-http';
import { ListResult, PagedList, StaffQuery, asPage, queryJson } from '../core/query';
import { P, StaffSession } from '../core/session';
import { SettlementStatus, Tone, itemType } from '../core/enums';
import { fmtMoney2, fmtNum, fmtPct, parseAmount } from '../core/format';
import { FORM_KIT, toForm } from '../forms/form-kit';

@Injectable({ providedIn: 'root' })
export class MoneyApi {
  private readonly http = inject(StaffHttp);

  list(key: string, q: StaffQuery): Observable<ListResult<any>> {
    return this.http.post<any>(`/api/staff/lists/${key}`, queryJson(q)).pipe(map((d) => ({ page: asPage<any>(d) })));
  }

  paymentAccounts(): Observable<any> {
    return this.http.get('/api/staff/payment-accounts');
  }

  savePaymentAccounts(body: unknown): Observable<any> {
    return this.http.put('/api/staff/payment-accounts', body);
  }

  testEasyKash(): Observable<any> {
    return this.http.post('/api/staff/payment-accounts/easykash/test');
  }

  /** POST CallculateSattlements: what is still owed (totalAmount) and paid before (amountPaidBefore), with the date range. */
  calculate(module: number, reservationId: number): Observable<any> {
    return this.http.post('/api/CompaniesWallet/CallculateSattlements/', [{ moduleType: module, id: reservationId }]);
  }

  /** POST AddCompanyWallet (multipart CompanyWalletRequest), as the web's settlement form: amountIn owed now, amountOut paid. */
  settle(body: Record<string, unknown>): Observable<unknown> {
    return this.http.form('POST', '/api/CompaniesWallet/AddCompanyWallet/', toForm(body));
  }

  /** MarkVendorSettled: {reservationId, settledAmount}; the backend checks what is left in one UPDATE. */
  markSettled(path: string, reservationId: number, amount: number): Observable<any> {
    return this.http.post(path, { reservationId, settledAmount: amount });
  }
}

const round2 = (v: number) => Math.round(v * 100) / 100;
/** VendorSettlementService.Tolerance: amounts are stored rounded to 2 decimals. */
const TOLERANCE = 0.01;

/** Rooms are the only reservations still settled through the wallet form (ModuleType 2). */
function settleModuleOf(t: number): number | null {
  return t === 3 ? 2 : null;
}

/** Trips, outings and Hajj are settled one reservation at a time through the module's MarkVendorSettled. */
function markSettledPathOf(t: number): string | null {
  return t === 1 ? '/api/TripReservations/MarkVendorSettled' : t === 2 ? '/api/OutingBooking/MarkVendorSettled' : t === 4 ? '/api/HajjReservations/MarkVendorSettled' : null;
}

function settlePermissionOf(t: number): string {
  return t === 1 ? P.travelReservationEdit : t === 2 ? P.outingBookingEdit : t === 4 ? P.hajjReservationEdit : P.companyWalletCreate;
}

/** What the vendor is still owed: their share (vendorRemaining) minus what was paid (vendorSettled). */
export function remainingToSettle(row: any): number {
  return Math.max(0, round2((row.vendorRemaining ?? 0) - (row.vendorSettled ?? 0)));
}

/** a-transactions: payments, refunds and vendor settlements in one list. */
@Component({
  selector: 'ts-transactions',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ...LISTS],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'APP.transactions' | translate">
        <button type="button" class="ts-icon-btn" (click)="drawer.show()" [attr.aria-label]="'APP.moneyFilters' | translate">
          <i class="ti ti-adjustments-horizontal"></i>
          <span class="ts-icon-btn__badge" *ngIf="list.activeFilters">{{ list.activeFilters }}</span>
        </button>
      </ts-appbar>
      <div class="ts-listbar">
        <ts-search [hint]="'APP.search' | translate" (changed)="list.setSearch($event)"></ts-search>
      </div>
      <ts-paged-list [list]="list" [groupDate]="groupDate" emptyIcon="ti ti-receipt" [grid]="true">
        <ng-template let-t>
          <div class="ts-list-card">
            <ts-pill [tone]="kind(t).tone">{{ kind(t).label | translate }}</ts-pill>
            <span class="ts-card-row__main">
              <span class="ts-card-title">{{ t.customerName || t.vendorName || '—' }}</span>
              <span class="ts-muted">{{ describe(t) }}</span>
            </span>
            <strong class="ts-num ts-tone-{{ kind(t).tone }}" style="color: var(--tone-fg)">{{ kind(t).sign }}{{ t.amount | ts }}</strong>
          </div>
        </ng-template>
      </ts-paged-list>
    </div>
    <ts-filter-drawer #drawer listKey="transactions" [title]="'APP.moneyFilters' | translate" [list]="$any(list)"></ts-filter-drawer>
  `
})
export class TransactionsComponent implements OnDestroy {
  private readonly api = inject(MoneyApi);
  @ViewChild('drawer') drawer!: FilterDrawerComponent;
  list = new PagedList<any>((q) => this.api.list('transactions', q), {}, 'transactions');
  groupDate = (t: any) => t.date;

  kind(t: any): { label: string; tone: Tone; sign: string } {
    return t.kind === 1
      ? { label: 'APP.payment', tone: 'ok', sign: '+' }
      : t.kind === 2
        ? { label: 'APP.refund', tone: 'danger', sign: '−' }
        : { label: 'APP.settlement', tone: 'info', sign: '−' };
  }

  describe(t: any): string {
    return [t.bookingReference ? `#${t.bookingReference}` : '', t.method ?? ''].filter((s) => !!s).join(' · ');
  }

  ngOnDestroy(): void {
    this.list.destroy();
  }
}

/**
 * a-settle-sheet: the dashboard's "Vendor Reservation Settlement" form. Pays a vendor what a reservation still owes
 * them, all of it or part, and emits (done) once the backend saved it so the list reloads.
 */
@Component({
  selector: 'ts-settle-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SheetComponent, ...KIT, ...FORM_KIT],
  template: `
    <ts-sheet [open]="!!row" (openChange)="close()" [wide]="true" [title]="'APP.vendorSettlement' | translate">
      <ng-container *ngIf="row">
        <ts-loading *ngIf="!fig && !error"></ts-loading>
        <ts-error *ngIf="error" [error]="error"></ts-error>
        <ng-container *ngIf="fig">
          <div class="ts-settle-head">
            <div class="ts-wrap">
              <ts-tag tone="info">{{ type().label | translate }}</ts-tag>
              <strong class="ts-num">#{{ row.reference }}</strong>
            </div>
            <div class="ts-wrap ts-muted" style="margin-top: 8px">
              <span><i class="ti ti-user"></i> {{ row.customerName || '—' }}</span>
              <span><i class="ti ti-building"></i> {{ row.vendorName || '—' }}</span>
            </div>
            <p class="ts-muted" *ngIf="row.itemName" style="margin: 6px 0 0">{{ row.itemName }}</p>
            <ts-pill style="margin-top: 10px; display: inline-block" [tone]="row.isBlocked ? 'danger' : statusTone(row.settlementStatus)">
              {{ (row.isBlocked ? 'APP.blocked' : statusLabel(row.settlementStatus)) | translate }}
            </ts-pill>
          </div>
          <div class="ts-settle-money">
            <div><small>{{ 'APP.totalEntitlement' | translate }}</small><strong class="ts-num">{{ m2(fig.owed + fig.paid) }} {{ 'APP.egp' | translate }}</strong></div>
            <div><small>{{ 'APP.alreadyPaid' | translate }}</small><strong class="ts-num" style="color: var(--ts-ok-fg)">{{ m2(fig.paid) }} {{ 'APP.egp' | translate }}</strong></div>
            <div><small>{{ 'APP.remainingToSettle' | translate }}</small><strong class="ts-num" style="color: var(--ts-pend-ink, #8a6100)">{{ m2(fig.owed) }} {{ 'APP.egp' | translate }}</strong></div>
          </div>
          <div class="ts-settle-progress">
            <div class="ts-wrap"><small class="ts-muted ts-grow">{{ 'APP.settlementProgress' | translate }}</small><small class="ts-num" style="color: var(--ts-ok-fg)">{{ pct(progress() * 100) }}</small></div>
            <div class="ts-meter"><span [style.width.%]="progress() * 100"></span></div>
          </div>
          <div class="ts-note ts-note--danger" *ngIf="refusal() as r"><i class="ti ti-info-circle"></i>{{ r }}</div>
          <ng-container *ngIf="!refusal()">
            <p class="ts-label">{{ 'APP.amountToSettle' | translate }}<b class="req"> *</b></p>
            <div class="ts-settle-picks">
              <button type="button" class="btn btn-outline-secondary" *ngFor="let p of [25, 50, 75]" [disabled]="busy" (click)="fill((fig.owed * p) / 100)">{{ p }}%</button>
              <button type="button" class="btn btn-primary ts-settle-full" [disabled]="busy" (click)="fill(fig.owed)"><i class="ti ti-bolt"></i>{{ 'APP.fullRemaining' | translate }}</button>
            </div>
            <ts-field [label]="''" [number]="true" [suffix]="'APP.egp' | translate" [error]="amountError" [(value)]="amount"></ts-field>
            <div class="ts-settle-after">
              <ts-info [label]="'APP.paidNow' | translate" [value]="valid() ? m2(entered()!) + ' ' + ('APP.egp' | translate) : null"></ts-info>
              <ts-info [label]="'APP.remainingAfter' | translate" [value]="valid() ? m2(left()) + ' ' + ('APP.egp' | translate) : null"></ts-info>
              <ts-info [label]="'APP.statusAfter' | translate">
                <ts-pill *ngIf="valid(); else dash" [tone]="statusTone(left() < tol ? 2 : 1)">{{ statusLabel(left() < tol ? 2 : 1) | translate }}</ts-pill>
                <ng-template #dash>—</ng-template>
              </ts-info>
            </div>
            <ng-container *ngIf="!markPath">
              <ts-field [label]="'APP.accountName' | translate" [hint]="'APP.optional' | translate" [(value)]="acc.name"></ts-field>
              <ts-field [label]="'APP.bankName' | translate" [hint]="'APP.optional' | translate" [(value)]="acc.bank"></ts-field>
              <ts-field [label]="'APP.accountNumber' | translate" [hint]="'APP.optional' | translate" [(value)]="acc.number"></ts-field>
              <label class="btn btn-secondary ts-wide-btn">
                <i class="ti ti-receipt"></i>{{ (receipt ? 'APP.receiptAttached' : 'APP.attachTransferReceipt') | translate }}
                <input type="file" accept="image/*,application/pdf" hidden (change)="receipt = $any($event.target).files?.[0] ?? null" />
              </label>
            </ng-container>
            <p class="ts-muted" *ngIf="markPath && type().value === 2" style="margin-top: 10px">{{ 'APP.outingSettleNote' | translate }}</p>
          </ng-container>
        </ng-container>
      </ng-container>
      <div sheet-foot class="ts-two">
        <button type="button" class="btn btn-secondary" [disabled]="busy" (click)="close()">{{ 'APP.cancel' | translate }}</button>
        <button type="button" class="btn btn-primary" [disabled]="busy || !fig || !!refusal()" (click)="submit()">
          <i *ngIf="busy" class="pi pi-spin pi-spinner"></i><i *ngIf="!busy" class="ti ti-check"></i>{{ 'APP.settleNow' | translate }}
        </button>
      </div>
    </ts-sheet>
  `
})
export class SettleSheetComponent {
  private readonly api = inject(MoneyApi);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  @Output() done = new EventEmitter<void>();
  readonly tol = TOLERANCE;
  m2 = fmtMoney2;
  pct = fmtPct;

  row: any = null;
  fig: { owed: number; paid: number; from?: string | null; to?: string | null } | null = null;
  error: unknown = null;
  markPath: string | null = null;
  module: number | null = null;
  amount = '';
  amountError: string | null = null;
  acc = { name: '', bank: '', number: '' };
  receipt: File | null = null;
  busy = false;

  show(row: any): void {
    this.row = row;
    this.fig = null;
    this.error = null;
    this.amount = '';
    this.amountError = null;
    this.acc = { name: '', bank: '', number: '' };
    this.receipt = null;
    this.module = settleModuleOf(row.itemType);
    this.markPath = markSettledPathOf(row.itemType);
    if (this.module != null) {
      this.api.calculate(this.module, row.reservationId).subscribe({
        next: (c) => (this.fig = { owed: c?.totalAmount ?? 0, paid: c?.amountPaidBefore ?? 0, from: c?.dateFrom, to: c?.dateTo }),
        error: (e) => (this.error = e)
      });
    } else {
      this.fig = { owed: remainingToSettle(row), paid: row.vendorSettled ?? 0 };
    }
  }

  close(): void {
    if (!this.busy) this.row = null;
  }

  type() {
    return itemType(this.row?.itemType);
  }

  statusTone(v: number): Tone {
    return SettlementStatus.tone(v);
  }

  statusLabel(v: number): string {
    return SettlementStatus.label(v);
  }

  progress(): number {
    const total = (this.fig?.owed ?? 0) + (this.fig?.paid ?? 0);
    return total <= 0 ? 1 : Math.min(1, Math.max(0, (this.fig?.paid ?? 0) / total));
  }

  entered(): number | null {
    return parseAmount(this.amount.replace(/,/g, ''));
  }

  valid(): boolean {
    const a = this.entered() ?? 0;
    return a > 0 && a <= (this.fig?.owed ?? 0) + TOLERANCE;
  }

  left(): number {
    return Math.max(0, round2((this.fig?.owed ?? 0) - (this.entered() ?? 0)));
  }

  fill(v: number): void {
    this.amount = round2(v).toFixed(2);
    this.amountError = null;
  }

  /** The checks VendorSettlementService makes, before the request: a reason not to send, or null. */
  refusal(): string | null {
    const r = this.row;
    const f = this.fig;
    if (!r || !f) return null;
    if (r.isBlocked) return this.text.tr('APP.settleBlocked');
    if (r.settlementStatus === SettlementStatus.full || f.owed < TOLERANCE) return this.text.tr('APP.nothingLeftToSettle');
    // A trip partly paid through the old wallet form would be offered the whole share again: refuse rather than pay twice
    if (r.itemType === 1 && r.settlementStatus === SettlementStatus.partial && (r.vendorSettled ?? 0) < TOLERANCE) return this.text.tr('APP.settleTripPaidByWallet');
    return null;
  }

  private validate(): string | null {
    const paid = this.entered();
    if (!this.amount.trim()) return this.text.tr('APP.fillRequired');
    if (paid == null || paid <= 0) return this.text.tr('APP.settleAmountInvalid');
    if (round2(paid) !== paid) return this.text.tr('APP.settleTwoDecimals');
    if (paid > this.fig!.owed + TOLERANCE) return this.text.tr('APP.settleMoreThanOwed', { n: fmtNum(this.fig!.owed) });
    return null;
  }

  async submit(): Promise<void> {
    if (this.busy || !this.fig) return;
    const refused = this.refusal();
    if (refused) return this.text.showError(refused);
    this.amountError = this.validate();
    if (this.amountError) return;
    const paid = this.entered()!;
    const ok = await this.dialogs.confirm({
      title: this.text.tr('APP.confirmSettle'),
      message: this.text.tr('APP.confirmSettleQ', { amount: fmtNum(paid), vendor: this.row.vendorName ?? '' }),
      confirm: this.text.tr('APP.settleNow')
    });
    if (!ok) return;
    this.busy = true;
    try {
      if (this.markPath) {
        await firstValueFrom(this.api.markSettled(this.markPath, this.row.reservationId, paid));
      } else {
        await firstValueFrom(
          this.api.settle({
            CompanyId: this.row.vendorId,
            amountIn: this.fig.owed,
            amountOut: paid,
            From: this.fig.from ? new Date(this.fig.from) : null,
            To: this.fig.to ? new Date(this.fig.to) : null,
            AccountName: this.acc.name.trim(),
            BankName: this.acc.bank.trim(),
            AccountNumber: this.acc.number.trim(),
            SattlementToPays: [{ ModuleType: this.module, Id: this.row.reservationId }],
            Image: this.receipt
          })
        );
      }
      this.text.showDone(this.text.tr('APP.settledDone'));
      this.busy = false;
      this.row = null;
      this.done.emit();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }
}

/** a-settlements / v-settlements: what each completed reservation owes the vendor. Settlements are manual. */
@Component({
  selector: 'ts-settlements',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ...LISTS, SettleSheetComponent],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="(vendor ? 'APP.mySettlements' : 'APP.settlements') | translate">
        <button type="button" class="ts-icon-btn" (click)="drawer.show()" [attr.aria-label]="'APP.moneyFilters' | translate">
          <i class="ti ti-adjustments-horizontal"></i>
          <span class="ts-icon-btn__badge" *ngIf="list.activeFilters">{{ list.activeFilters }}</span>
        </button>
      </ts-appbar>
      <div class="ts-navy-card">
        <small>{{ 'APP.remainingOnShown' | translate }}</small>
        <strong class="ts-num">{{ due() | ts }} {{ 'APP.egp' | translate }}</strong>
        <small>{{ (vendor ? 'APP.settlementsManualNote' : 'APP.tapToSettle') | translate }}</small>
      </div>
      <ts-paged-list [list]="list" emptyIcon="ti ti-cash" [grid]="true">
        <ng-template let-s>
          <button type="button" class="ts-list-card ts-list-card--col" [disabled]="!mayPay(s)" (click)="open(s)">
            <span class="ts-wrap ts-wrap--between">
              <span class="ts-card-title ts-grow">{{ s.itemName || '—' }}</span>
              <ts-pill [tone]="s.isBlocked ? 'danger' : statusTone(s.settlementStatus)">{{ (s.isBlocked ? 'APP.blocked' : statusLabel(s.settlementStatus)) | translate }}</ts-pill>
            </span>
            <span class="ts-muted">{{ vendor ? '' : (s.vendorName || '') + ' · ' }}#{{ s.reference }} · {{ s.travelDate | ts: 'short' }}</span>
            <span class="ts-wrap ts-wrap--between" style="margin-top: 8px">
              <span class="ts-module"><i class="ts-chip__dot" [style.background]="type(s).color"></i>{{ type(s).label | translate }}</span>
              <span><small class="ts-muted">{{ 'APP.remaining' | translate }}</small>&nbsp;<strong class="ts-num">{{ remaining(s) | ts }}</strong></span>
            </span>
          </button>
        </ng-template>
      </ts-paged-list>
    </div>
    <ts-filter-drawer #drawer listKey="settlements" [title]="'APP.moneyFilters' | translate" [list]="$any(list)"></ts-filter-drawer>
    <ts-settle-sheet #settle (done)="list.refresh()"></ts-settle-sheet>
  `
})
export class SettlementsComponent implements OnInit, OnDestroy {
  private readonly api = inject(MoneyApi);
  private readonly session = inject(StaffSession);
  private readonly route = inject(ActivatedRoute);
  private readonly text = inject(StaffText);
  @Input() vendor = false;
  @ViewChild('drawer') drawer!: FilterDrawerComponent;
  @ViewChild('settle') settle!: SettleSheetComponent;
  list = new PagedList<any>((q) => this.api.list('settlements', q), {}, 'settlements');
  remaining = remainingToSettle;

  ngOnInit(): void {
    this.vendor = this.vendor || !!this.route.snapshot.data['vendor'];
  }

  due(): number {
    return this.list.items.reduce((a, s) => a + remainingToSettle(s), 0);
  }

  type(s: any) {
    return itemType(s.itemType);
  }

  statusTone(v: number): Tone {
    return SettlementStatus.tone(v);
  }

  statusLabel(v: number): string {
    return SettlementStatus.label(v);
  }

  mayPay(s: any): boolean {
    return !this.vendor && this.session.can(settlePermissionOf(s.itemType)) && !s.isBlocked && remainingToSettle(s) > 0;
  }

  open(s: any): void {
    if (!this.mayPay(s)) return;
    if (settleModuleOf(s.itemType) == null && markSettledPathOf(s.itemType) == null) return this.text.showError(this.text.tr('APP.settleNotSupported'));
    this.settle.show(s);
  }

  ngOnDestroy(): void {
    this.list.destroy();
  }
}

/**
 * a-payment-accounts: InstaPay and EasyKash accounts. Secrets are never shown (last 4 characters only) and are only
 * sent when the employee types a new one. Saving is Financial.Edit only, enforced by the backend.
 */
@Component({
  selector: 'ts-payment-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ...KIT, ...FORM_KIT, ChipBarComponent, SwitchRowComponent, SheetComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.paymentAccounts' | translate" [subtitle]="'APP.paymentAccountsHint' | translate"></ts-appbar>
      <ts-loading *ngIf="!a && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ng-container *ngIf="a">
        <div class="ts-note" [class.ts-note--ok]="a.source === 'database'" [class.ts-note--pending]="a.source !== 'database'">
          <div>
            <strong>{{ (a.source === 'database' ? 'APP.accountsFromApp' : 'APP.accountsFromSettings') | translate }}</strong>
            <p *ngIf="!a.paymentAccountsFromDb">{{ 'APP.accountsFlagOff' | translate }}</p>
            <p *ngIf="!a.canStoreSecrets" class="ts-danger-ink">{{ 'APP.secretsLocked' | translate }}</p>
            <p *ngFor="let k of a.unreadableKeys ?? []" class="ts-danger-ink">⚠ {{ k }}</p>
          </div>
        </div>
        <ts-form-section title="InstaPay" icon="ti ti-building-bank" kind="money">
          <ts-field [label]="'APP.accountName' | translate" [readonly]="!canEdit" [(value)]="insta.name"></ts-field>
          <ts-field [label]="'APP.accountNumber' | translate" [readonly]="!canEdit" [(value)]="insta.number"></ts-field>
          <ts-field [label]="'APP.instaPayLink' | translate" hint="https://" [readonly]="!canEdit" [(value)]="insta.url"></ts-field>
        </ts-form-section>
        <ts-form-section
          title="EasyKash"
          [subtitle]="a.easyKash?.lastSuccessfulPaymentAt ? ('APP.lastPayment' | translate: { n: (a.easyKash.lastSuccessfulPaymentAt | ts: 'date') }) : null"
          icon="ti ti-credit-card"
          kind="money"
        >
          <div class="ts-secret" *ngFor="let s of secrets">
            <div class="ts-wrap ts-wrap--between">
              <strong class="ts-grow">{{ s.label }}</strong>
              <span class="ts-num">{{ s.last4 ? '•••• ' + s.last4 : '—' }}</span>
              <button *ngIf="canEdit && a.canStoreSecrets" type="button" class="btn btn-link" (click)="s.changing = !s.changing; s.value = ''">
                {{ (s.changing ? 'APP.cancel' : 'APP.change') | translate }}
              </button>
            </div>
            <!-- The new value is typed blind and never read back from the server -->
            <input *ngIf="s.changing" class="form-control" type="password" autocomplete="new-password" [placeholder]="'APP.newValue' | translate" [(ngModel)]="s.value" />
          </div>
          <ts-switch-row
            *ngIf="a.easyKash?.previousHmacValidUntil"
            [title]="'APP.revokeOldHmac' | translate"
            [subtitle]="'APP.oldHmacUntil' | translate: { n: (a.easyKash.previousHmacValidUntil | ts: 'date') }"
            [disabled]="!canEdit"
            [(value)]="revoke"
          ></ts-switch-row>
          <p class="ts-label">{{ 'APP.cashExpiry' | translate }}</p>
          <ts-chipbar [wrap]="true" [items]="expiryChips" [selected]="[String(expiry ?? '')]" (tap)="canEdit && (expiry = +$event)"></ts-chipbar>
          <ts-info label="Base URL" [value]="a.easyKash?.baseUrl" [numeric]="false"></ts-info>
        </ts-form-section>
        <ts-card *ngIf="a.history?.length" [title]="'APP.changeHistory' | translate" icon="ti ti-history">
          <ts-info *ngFor="let h of a.history" [label]="h.key + ' · ' + (h.byName || '')" [value]="h.date | ts: 'date'"></ts-info>
        </ts-card>
        <div class="ts-sticky-foot ts-two" *ngIf="canEdit">
          <button type="button" class="btn btn-secondary" (click)="test()">{{ 'APP.testEasyKash' | translate }}</button>
          <button type="button" class="btn btn-primary" [disabled]="busy" (click)="save()"><i *ngIf="busy" class="pi pi-spin pi-spinner"></i>{{ 'APP.save' | translate }}</button>
        </div>
      </ng-container>
    </div>
    <ts-sheet [open]="!!testResult" (openChange)="testResult = null" [title]="'APP.easyKashTest' | translate" [footer]="false">
      <ng-container *ngIf="testResult as r">
        <ts-tag tone="pending">{{ (r.providerTestSupported ? 'APP.supported' : 'APP.notSupported') | translate }}</ts-tag>
        <p style="margin-top: 8px">{{ r.message }}</p>
        <div class="ts-check-row" *ngFor="let c of r.checks ?? []">
          <i class="ti" [class.ti-circle-check-filled]="c.ok" [class.ti-circle-x-filled]="!c.ok" [style.color]="c.ok ? 'var(--ts-ok-fg)' : 'var(--ts-danger-ink)'"></i>
          {{ c.detail || c.name }}
        </div>
        <h3 class="ts-group-label">{{ 'APP.alternatives' | translate }}</h3>
        <p *ngFor="let x of r.alternatives ?? []">• {{ x }}</p>
      </ng-container>
    </ts-sheet>
  `
})
export class PaymentAccountsComponent implements OnInit {
  private readonly api = inject(MoneyApi);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  readonly String = String;

  a: any = null;
  error: unknown = null;
  busy = false;
  insta = { name: '', number: '', url: '' };
  secrets: { key: string; label: string; last4: string | null; changing: boolean; value: string }[] = [];
  revoke = false;
  expiry: number | null = null;
  testResult: any = null;
  expiryChips = [3, 6, 12, 48].map((h) => ({ key: String(h), label: this.text.tr('APP.hoursN', { n: fmtNum(h) }) }));

  get canEdit(): boolean {
    return this.session.can(P.financialEdit);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.error = null;
    this.a = null;
    this.api.paymentAccounts().subscribe({
      next: (a) => {
        this.a = a;
        const i = a?.instaPay ?? {};
        this.insta = { name: i.accountName ?? '', number: i.accountNumber ?? '', url: i.instaPayUrl ?? '' };
        this.expiry = a?.easyKash?.cashExpiry ?? null;
        this.revoke = false;
        this.secrets = [
          { key: 'apiKey', label: 'API key', last4: a?.easyKash?.apiKeyLast4 ?? null, changing: false, value: '' },
          { key: 'hmacSecretKey', label: 'HMAC', last4: a?.easyKash?.hmacSecretLast4 ?? null, changing: false, value: '' }
        ];
      },
      error: (e) => (this.error = e)
    });
  }

  async save(): Promise<void> {
    const i = this.a.instaPay ?? {};
    const changed = (v: string, old: string | null | undefined) => (v.trim() === (old ?? '') ? null : v.trim());
    const easyKash: Record<string, unknown> = { revokePreviousHmac: this.revoke };
    for (const s of this.secrets) if (s.changing && s.value.trim()) easyKash[s.key] = s.value.trim();
    if (this.expiry !== (this.a.easyKash?.cashExpiry ?? null)) easyKash['cashExpiry'] = this.expiry;
    const body = {
      instaPay: {
        accountName: changed(this.insta.name, i.accountName),
        accountNumber: changed(this.insta.number, i.accountNumber),
        instaPayUrl: changed(this.insta.url, i.instaPayUrl)
      },
      easyKash
    };
    const ok = await this.dialogs.confirm({ title: this.text.tr('APP.savePaymentAccounts'), message: this.text.tr('APP.savePaymentAccountsQ'), confirm: this.text.tr('APP.save') });
    if (!ok) return;
    this.busy = true;
    try {
      const r = await firstValueFrom(this.api.savePaymentAccounts(body));
      const warnings: string[] = r?.warnings ?? [];
      this.text.showDone(warnings.length ? warnings.join('\n') : this.text.tr('APP.saved'));
      this.load();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }

  test(): void {
    this.api.testEasyKash().subscribe({ next: (r) => (this.testResult = r), error: (e) => this.text.showError(e) });
  }
}
