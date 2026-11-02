import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, Subscription, forkJoin, map } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { LISTS } from '../ui/lists';
import { CONTROLS } from '../ui/controls';
import { SheetComponent } from '../ui/dialogs';
import { StaffHttp, ApiError } from '../core/staff-http';
import { ITEM_TYPES, ItemTypeInfo, PayMethod, itemTypeByKey } from '../core/enums';
import { apiDate, fmtNum, fmtShortDate, parseDate } from '../core/format';
import { emptyQuery, queryJson } from '../core/query';
import { BookingsApi, checkoutType } from './bookings-api';

function uuid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
}

/**
 * a-booking-new: an employee books for a customer. The screen only collects choices; every amount (price, coupon,
 * bonus, fees, total) comes from POST /api/staff/bookings/quote, which runs the same checkout the customer app uses.
 */
@Component({
  selector: 'ts-new-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ...KIT, ...LISTS, ...CONTROLS, SheetComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.newBooking' | translate" [subtitle]="'APP.newBookingHint' | translate"></ts-appbar>

      <section class="ts-section">
        <div class="ts-step-head"><span>1</span><h2>{{ 'APP.customer' | translate }}</h2></div>
        <ts-pick-box [text]="customer?.name" [hint]="'APP.pickCustomer' | translate" [sub]="customer?.phone" (pick)="picker = 'customer'"></ts-pick-box>
      </section>

      <section class="ts-section">
        <div class="ts-step-head"><span>2</span><h2>{{ 'APP.product' | translate }}</h2></div>
        <ts-chipbar [items]="typeChips" [selected]="[type.listKey]" (tap)="setType($event)"></ts-chipbar>
        <div style="margin-top: 10px">
          <ts-pick-box [text]="product?.name" [hint]="'APP.pickProduct' | translate" [sub]="product?.vendorName" (pick)="picker = 'product'"></ts-pick-box>
        </div>
      </section>

      <section class="ts-section" *ngIf="details">
        <div class="ts-step-head"><span>3</span><h2>{{ 'APP.dateAndOptions' | translate }}</h2></div>
        <!-- trip -->
        <ng-container *ngIf="type.value === 1">
          <p class="ts-muted" *ngIf="!tripDates().length">{{ 'APP.noUpcomingDates' | translate }}</p>
          <ts-chipbar [wrap]="true" [items]="tripDates()" [selected]="[String(dateId ?? '')]" (tap)="dateId = +$event; requote()"></ts-chipbar>
        </ng-container>
        <!-- hajj -->
        <ng-container *ngIf="type.value === 4">
          <label class="ts-label">{{ 'APP.group' | translate }}</label>
          <ts-chipbar [wrap]="true" [items]="hajjDates()" [selected]="[String(dateId ?? '')]" (tap)="dateId = +$event; requote()"></ts-chipbar>
          <label class="ts-label">{{ 'APP.room' | translate }}</label>
          <ts-chipbar [wrap]="true" [items]="hajjTickets()" [selected]="[String(ticketId ?? '')]" (tap)="ticketId = +$event; requote()"></ts-chipbar>
        </ng-container>
        <!-- outing -->
        <ng-container *ngIf="type.value === 2">
          <p class="ts-muted" *ngIf="!scheduledOuting">
            {{ 'APP.outingRuns' | translate: { from: short(details.startDate), to: short(details.endDate) } }}
          </p>
          <ng-container *ngIf="scheduledOuting">
            <p class="ts-muted" *ngIf="!outingDays().length">{{ 'APP.noUpcomingDates' | translate }}</p>
            <ng-container *ngIf="outingDays().length">
              <label class="ts-label">{{ 'APP.pickDate' | translate }}</label>
              <ts-chipbar [wrap]="true" [items]="outingDays()" [selected]="[dayKey()]" (tap)="pickDay($event)"></ts-chipbar>
              <ng-container *ngIf="slotsNeeded">
                <label class="ts-label">{{ 'APP.time' | translate }}</label>
                <ts-chipbar [wrap]="true" [items]="slots()" [selected]="[String(slotId ?? '')]" (tap)="slotId = +$event; requote()"></ts-chipbar>
              </ng-container>
            </ng-container>
          </ng-container>
          <ts-stepper
            *ngFor="let t of outingTickets()"
            [label]="t.ticketType + ' · ' + num(t.price)"
            [value]="ticketCounts[t.id] ?? 0"
            (valueChange)="ticketCounts[t.id] = $event; requote()"
          ></ts-stepper>
        </ng-container>
      </section>

      <section class="ts-section">
        <div class="ts-step-head"><span>4</span><h2>{{ 'APP.travellers' | translate }}</h2></div>
        <ts-stepper [label]="'APP.adults' | translate" [value]="adults" [min]="1" (valueChange)="adults = $event; requote()"></ts-stepper>
        <ts-stepper [label]="'APP.children' | translate" [value]="childAges.length" (valueChange)="setChildren($event)"></ts-stepper>
        <!-- Children are priced by age (the child policy), so each child has an age -->
        <ts-stepper
          *ngFor="let a of childAges; let i = index; trackBy: byIndex"
          [label]="'APP.childAge' | translate: { n: i + 1 }"
          [value]="a"
          [min]="0"
          [max]="17"
          (valueChange)="childAges[i] = $event; requote()"
        ></ts-stepper>
      </section>

      <section class="ts-section" *ngIf="points.length">
        <div class="ts-step-head"><span>5</span><h2>{{ 'APP.gatheringPoint' | translate }}</h2></div>
        <ts-chipbar [wrap]="true" [items]="pointChips()" [selected]="[String(pointId ?? '')]" (tap)="pointId = +$event; requote()"></ts-chipbar>
      </section>

      <section class="ts-section">
        <div class="ts-step-head"><span>6</span><h2>{{ 'APP.coupon' | translate }}</h2></div>
        <label class="ts-field">
          <span>{{ 'APP.couponCode' | translate }}</span>
          <input class="form-control" [(ngModel)]="coupon" (ngModelChange)="requote()" />
        </label>
      </section>

      <section class="ts-section">
        <div class="ts-step-head"><span>7</span><h2>{{ 'APP.theBill' | translate }}</h2></div>
        <div class="ts-progress-line" *ngIf="quoting"><span></span></div>
        <p *ngIf="!quoting && quoteError" style="color: var(--ts-danger-ink)">{{ quoteErrorText() }}</p>
        <p *ngIf="!quoting && !quoteError && !summary" class="ts-muted">{{ 'APP.billAfterChoices' | translate }}</p>
        <ng-container *ngIf="!quoting && summary">
          <ts-tag *ngIf="quote?.isForeignPrice" tone="info">{{ 'APP.foreignPriceApplied' | translate }}</ts-tag>
          <div class="ts-money-row"><span>{{ 'APP.price' | translate }}</span><strong>{{ summary.price | ts }}</strong></div>
          <ng-container *ngIf="summary.coupon as c">
            <div class="ts-money-row" *ngIf="c.isValid">
              <span>{{ 'APP.coupon' | translate }} <ts-tag tone="ok">{{ c.code }}</ts-tag></span>
              <strong style="color: var(--ts-ok-fg)">− {{ c.discount | ts }}</strong>
            </div>
            <p *ngIf="!c.isValid" style="color: var(--ts-danger-ink)">{{ c.message || ('APP.couponInvalid' | translate) }}</p>
          </ng-container>
          <div class="ts-money-row" *ngIf="summary.fees > 0"><span>{{ 'APP.serviceFees' | translate }}</span><strong>{{ summary.fees | ts }}</strong></div>
          <div class="ts-money-row" *ngIf="summary.totalPaidFromBonus > 0">
            <span>{{ 'APP.paidFromBonus' | translate }}</span><strong style="color: var(--ts-ok-fg)">− {{ summary.totalPaidFromBonus | ts }}</strong>
          </div>
          <div class="ts-money-row" *ngIf="summary.amountOnArrival > 0">
            <span>{{ 'APP.onArrival' | translate }}</span><strong>{{ summary.amountOnArrival | ts }}</strong>
          </div>
          <div class="ts-money-row is-total">
            <span>{{ 'APP.total' | translate }}</span><strong>{{ summary.totalPaidAfterBonus | ts }} {{ 'APP.egp' | translate }}</strong>
          </div>
        </ng-container>
      </section>

      <section class="ts-section" *ngIf="summary">
        <div class="ts-step-head"><span>8</span><h2>{{ 'APP.payment' | translate }}</h2></div>
        <ts-pill-switch [items]="channels" [(selected)]="channel"></ts-pill-switch>
        <div style="margin-top: 12px">
          <ts-chipbar *ngIf="channel === 'easykash'" [wrap]="true" [items]="methodChips" [selected]="[String(payMethod)]" (tap)="payMethod = +$event"></ts-chipbar>
          <label *ngIf="channel === 'instapay'" class="ts-pick-box ts-file">
            <span class="ts-pick-box__text">
              <strong *ngIf="receipt">{{ receipt.name }}</strong>
              <span *ngIf="!receipt" class="ts-pick-box__hint">{{ 'APP.uploadReceipt' | translate }}</span>
            </span>
            <i class="ti ti-upload"></i>
            <input type="file" accept="image/*" (change)="receipt = $any($event.target).files?.[0] ?? null" />
          </label>
        </div>
      </section>

      <div class="ts-sticky-foot">
        <button type="button" class="btn btn-primary ts-wide-btn" [disabled]="!summary || quoting || paying" (click)="pay()">
          <i *ngIf="paying" class="pi pi-spin pi-spinner"></i>
          {{ summary ? ('APP.payAmount' | translate: { n: num(summary.totalPaidAfterBonus) }) : ('APP.chooseFirst' | translate) }}
        </button>
      </div>
    </div>

    <ts-sheet [open]="picker !== null" (openChange)="picker = null" [title]="(picker === 'customer' ? 'APP.customer' : type.label) | translate" [footer]="false">
      <ts-search-picker
        *ngIf="picker === 'customer'"
        [search]="searchCustomers"
        [subtitle]="phoneOf"
        (picked)="customer = $event; picker = null; requote()"
      ></ts-search-picker>
      <ts-search-picker *ngIf="picker === 'product'" [search]="searchProducts" [subtitle]="vendorOf" (picked)="setProduct($event)"></ts-search-picker>
    </ts-sheet>

    <ts-sheet [open]="!!paymentUrl" (openChange)="done()" [title]="'APP.paymentLinkReady' | translate">
      <p>{{ 'APP.paymentLinkHint' | translate }}</p>
      <p class="ts-link-box" dir="ltr">{{ paymentUrl }}</p>
      <div sheet-foot class="ts-wide-row">
        <button type="button" class="btn btn-secondary" (click)="copy()"><i class="ti ti-copy"></i>{{ 'APP.copy' | translate }}</button>
        <button type="button" class="btn btn-primary" (click)="done()">{{ 'APP.done' | translate }}</button>
      </div>
    </ts-sheet>

    <ts-sheet [open]="pending !== null" (openChange)="pending = null" [title]="'APP.pendingBookingTitle' | translate">
      <p>{{ pending?.message || ('APP.pendingBookingBody' | translate) }}</p>
      <div sheet-foot class="ts-wide-row">
        <button type="button" class="btn btn-secondary" (click)="bookAgain()">{{ 'APP.bookAgain' | translate }}</button>
        <button type="button" class="btn btn-primary" (click)="openPending()">{{ 'APP.openIt' | translate }}</button>
      </div>
    </ts-sheet>
  `
})
export class NewBookingComponent implements OnDestroy {
  private readonly api = inject(BookingsApi);
  private readonly http = inject(StaffHttp);
  private readonly router = inject(Router);
  private readonly text = inject(StaffText);

  readonly String = String;
  customer: any = null;
  type: ItemTypeInfo = ITEM_TYPES[0];
  product: any = null;
  details: any = null;
  dateId: number | null = null;
  ticketId: number | null = null;
  outingDate: Date | null = null;
  scheduleId: number | null = null;
  slotId: number | null = null;
  ticketCounts: Record<number, number> = {};
  adults = 1;
  childAges: number[] = [];
  points: any[] = [];
  pointId: number | null = null;
  coupon = '';
  newBooking = false;

  quote: any = null;
  quoteError: unknown = null;
  quoting = false;
  channel = 'easykash';
  payMethod = PayMethod.card;
  receipt: File | null = null;
  paying = false;
  picker: 'customer' | 'product' | null = null;
  paymentUrl: string | null = null;
  private createdId: number | null = null;
  pending: ApiError | null = null;

  /** Generated once when the screen opens and reused on every retry of "Pay". */
  private readonly idempotencyKey = uuid();
  private debounce?: ReturnType<typeof setTimeout>;
  private quoteSub?: Subscription;

  num = fmtNum;
  byIndex = (i: number) => i;
  phoneOf = (r: any) => r?.phone ?? '';
  vendorOf = (r: any) => r?.vendorName ?? '';

  readonly typeChips = [1, 2, 4].map((v) => {
    const t = ITEM_TYPES.find((x) => x.value === v)!;
    return { key: t.listKey, label: this.text.tr(t.plural), dot: t.color };
  });
  readonly channels = [
    { key: 'easykash', label: this.text.tr('APP.easyKashLink') },
    { key: 'instapay', label: this.text.tr('APP.payInstaPay') }
  ];
  readonly methodChips = PayMethod.easyKashMethods.map((m) => {
    const l = PayMethod.label(m);
    return { key: String(m), label: l.startsWith('APP.') ? this.text.tr(l) : l };
  });

  searchCustomers = (q: string) => this.api.searchUsers(q);
  searchProducts = (q: string): Observable<any[]> =>
    this.http
      .post<any>(`/api/staff/lists/${this.type.listKey}`, queryJson(emptyQuery({ search: q, preset: 'active', pageSize: 20 })))
      .pipe(map((d) => d?.data ?? []));

  get summary(): any {
    return this.quote?.summary ?? null;
  }

  /** OutingType 2 (Scheduled): the customer picks a day from a schedule; 1 (Normal) runs on its own dates. */
  get scheduledOuting(): boolean {
    return this.details?.outingType === 2;
  }

  get schedule(): any {
    return this.scheduleId == null ? null : (this.details?.outingSchedules ?? []).find((s: any) => s.id === this.scheduleId);
  }

  /** SchedualType 1 (Spacific) has fixed time slots and the checkout needs one; 2 (Interval) doesn't. */
  get slotsNeeded(): boolean {
    return this.schedule?.schedualType === 1;
  }

  private get ready(): boolean {
    if (!this.customer || !this.product) return false;
    switch (this.type.value) {
      case 1:
        return this.dateId != null;
      case 4:
        return this.dateId != null && this.ticketId != null;
      case 2:
        return (
          Object.values(this.ticketCounts).some((c) => c > 0) &&
          (!this.scheduledOuting || (this.scheduleId != null && (!this.slotsNeeded || this.slotId != null)))
        );
      default:
        return false;
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.debounce);
    this.quoteSub?.unsubscribe();
  }

  short(v: unknown): string {
    return fmtShortDate(v as string);
  }

  setType(key: string): void {
    this.type = itemTypeByKey(key) ?? ITEM_TYPES[0];
    this.product = this.details = null;
    this.quote = null;
  }

  setChildren(n: number): void {
    while (this.childAges.length < n) this.childAges.push(5);
    while (this.childAges.length > n) this.childAges.pop();
    this.requote();
  }

  setProduct(p: any): void {
    this.picker = null;
    this.product = p;
    this.details = null;
    this.dateId = this.ticketId = this.pointId = this.scheduleId = this.slotId = null;
    this.outingDate = null;
    this.ticketCounts = {};
    forkJoin([this.api.product(this.type.value, p.id), this.api.gatheringPoints(this.type.value, p.id)]).subscribe({
      next: ([d, pts]) => {
        this.details = d;
        this.points = pts;
      },
      error: (e) => this.text.showError(e)
    });
  }

  tripDates() {
    const now = Date.now();
    return (this.details?.tripDates ?? [])
      .filter((x: any) => (parseDate(x.startDate)?.getTime() ?? 0) > now)
      .map((x: any) => ({ key: String(x.id), label: fmtShortDate(x.startDate) }));
  }

  hajjDates() {
    return (this.details?.dates ?? []).map((x: any) => ({ key: String(x.id), label: fmtShortDate(x.startDate) }));
  }

  hajjTickets() {
    return (this.details?.tickets ?? [])
      .filter((t: any) => t.isActive !== false)
      .map((x: any) => ({ key: String(x.id), label: `${x.ticketType} · ${fmtNum(x.price)}` }));
  }

  outingTickets() {
    return (this.details?.tickets ?? []).filter((t: any) => t.isActive !== false);
  }

  outingDays() {
    const days: { key: string; label: string; schedule: number; date: Date }[] = [];
    for (const s of this.details?.outingSchedules ?? []) {
      for (const day of s.days ?? []) {
        const d = parseDate(String(day));
        if (d) days.push({ key: `${s.id}|${apiDate(d)}`, label: fmtShortDate(d), schedule: s.id, date: d });
      }
    }
    return days.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 60);
  }

  dayKey(): string {
    return this.scheduleId != null && this.outingDate ? `${this.scheduleId}|${apiDate(this.outingDate)}` : '';
  }

  pickDay(k: string): void {
    const x = this.outingDays().find((d) => d.key === k);
    if (!x) return;
    this.scheduleId = x.schedule;
    this.outingDate = x.date;
    this.slotId = null;
    this.requote();
  }

  slots() {
    return (this.schedule?.timeSlots ?? []).map((s: any) => ({ key: String(s.id), label: `${s.startTime} - ${s.endTime}` }));
  }

  pointChips() {
    return this.points.map((p) => ({ key: String(p.id), label: p.name }));
  }

  private summaryBody(): any {
    const outing =
      this.type.value === 2
        ? {
            tickets: Object.entries(this.ticketCounts)
              .filter(([, c]) => c > 0)
              .map(([id, c]) => ({ ticketTypeId: +id, count: c })),
            ...(this.scheduledOuting && this.outingDate ? { outingDate: apiDate(this.outingDate) } : {}),
            ...(this.scheduledOuting && this.scheduleId != null ? { scheduleId: this.scheduleId } : {}),
            ...(this.scheduledOuting && this.slotId != null ? { slotTimeId: this.slotId } : {})
          }
        : undefined;
    return {
      itemType: checkoutType(this.type.value),
      itemId: this.product?.id,
      travellers: { adults: this.adults, childs: this.childAges.length, childAges: this.childAges },
      ...(this.type.value === 1 ? { trip: { tripDateId: this.dateId } } : {}),
      ...(this.type.value === 4 ? { hajj: { ticketTypeId: this.ticketId, hajjDateId: this.dateId } } : {}),
      ...(outing ? { outing } : {}),
      ...(this.coupon.trim() ? { couponCode: this.coupon.trim() } : {}),
      newBooking: this.newBooking
    };
  }

  requote(): void {
    clearTimeout(this.debounce);
    if (!this.ready) {
      this.quote = null;
      return;
    }
    this.debounce = setTimeout(() => {
      this.quoting = true;
      this.quoteError = null;
      this.quoteSub?.unsubscribe();
      this.quoteSub = this.api
        .quote({ customerId: this.customer.id, ...(this.pointId != null ? { gatheringPointId: this.pointId } : {}), summary: this.summaryBody() })
        .subscribe({
          next: (q) => {
            this.quote = q;
            this.quoting = false;
          },
          error: (e: ApiError) => {
            this.quote = null;
            this.quoteError = e;
            this.quoting = false;
            if (e?.code === 'PENDING_BOOKING_EXISTS') this.pending = e;
          }
        });
    }, 500);
  }

  /** The checkout answers most wrong choices with the same text; its errorCode says which choice it was. */
  quoteErrorText(): string {
    const code = (this.quoteError as ApiError)?.code;
    const hint: Record<string, string> = {
      DATE_REQUIRED: 'APP.quoteDateRequired',
      INVALID_DATE: 'APP.quoteInvalidDate',
      INVALID_TRAVELLERS: 'APP.quoteInvalidTravellers',
      DUPLICATE_TICKET_TYPES: 'APP.quoteInvalidTickets',
      TICKET_NOT_FOR_ITEM: 'APP.quoteInvalidTickets'
    };
    return code && hint[code] ? this.text.tr(hint[code]) : this.text.error(this.quoteError);
  }

  bookAgain(): void {
    this.pending = null;
    this.newBooking = true;
    this.requote();
  }

  openPending(): void {
    const id = (this.pending?.data as any)?.bookingId;
    this.pending = null;
    if (id) this.router.navigate(['/a/bookings', id]);
  }

  pay(): void {
    const s = this.summary;
    if (!s) return;
    if (this.channel === 'instapay' && !this.receipt) {
      this.text.showError(this.text.tr('APP.receiptRequired'));
      return;
    }
    this.paying = true;
    this.api
      .pay({
        customerId: this.customer.id,
        bookingId: s.bookingId,
        channel: this.channel,
        payMethod: this.channel === 'easykash' ? this.payMethod : null,
        receipt: this.receipt,
        idempotencyKey: this.idempotencyKey
      })
      .subscribe({
        next: (r) => {
          this.paying = false;
          this.createdId = r?.bookingId ?? null;
          if (r?.paymentUrl) this.paymentUrl = r.paymentUrl;
          else {
            this.text.showDone(this.text.tr('APP.bookingCreated'));
            this.done();
          }
        },
        error: (e) => {
          this.paying = false;
          this.text.showError(e);
        }
      });
  }

  copy(): void {
    if (this.paymentUrl) navigator.clipboard?.writeText(this.paymentUrl);
    this.text.showDone(this.text.tr('WEB.copied'));
  }

  done(): void {
    this.paymentUrl = null;
    if (this.createdId) this.router.navigate(['/a/bookings', this.createdId]);
  }
}
