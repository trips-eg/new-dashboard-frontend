import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { KIT, StaffText } from '../ui/kit';
import { LISTS } from '../ui/lists';
import { BookingStatus, PayMethod, Tone, itemType } from '../core/enums';
import { BookingCustomer, BookingDetails, BookingItem, BookingRow } from './bookings-api';
import { fmtNum } from '../core/format';

/** BookingCard: one booking in the list, as in the design. */
@Component({
  selector: 'ts-booking-card',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ...LISTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ts-ticket [borderColor]="waiting ? 'var(--ts-pend-line)' : null" (click)="open.emit()" (keydown.enter)="open.emit()">
      <div top>
        <div class="ts-card-row">
          <ts-avatar [name]="b.customer.name"></ts-avatar>
          <div class="ts-card-row__main">
            <div class="ts-wrap">
              <span class="ts-card-title">{{ b.customer.name }}</span>
              <ts-tag [tone]="b.customer.bookingsCount > 1 ? 'info' : 'neutral'">{{ customerHistory }}</ts-tag>
            </div>
            <p class="ts-card-sub">{{ subtitle }}</p>
          </div>
          <ts-pill [tone]="tone">{{ waiting ? ('APP.checkReceipt' | translate) : b.statusName }}</ts-pill>
        </div>
        <div class="ts-wrap" style="margin-top: 10px">
          <ts-tag [icon]="pay.icon" [tone]="pay.tone">{{ pay.label }}</ts-tag>
          <ts-tag *ngIf="item?.vendorName" icon="ti ti-building-store">{{ item?.vendorName }}</ts-tag>
          <ts-tag *ngIf="b.coupon?.code" icon="ti ti-tag" tone="ok">{{ b.coupon?.code }} −{{ b.couponDiscount | ts }}</ts-tag>
          <ts-tag *ngIf="b.paidFromBonus > 0" icon="ti ti-gift" tone="gold">{{ 'APP.bonus' | translate }} −{{ b.paidFromBonus | ts }}</ts-tag>
        </div>
      </div>
      <div bottom class="ts-spread">
        <ts-dot *ngIf="item" [color]="type.color">{{ type.label | translate }}</ts-dot>
        <span class="ts-grow ts-num ts-muted">#{{ b.reference }}</span>
        <span *ngIf="b.subtotal > b.netTotal" class="ts-strike ts-num">{{ b.subtotal | ts }}</span>
        <span class="ts-total">{{ b.netTotal | ts }}</span>
      </div>
    </ts-ticket>
  `
})
export class BookingCardComponent {
  @Input({ required: true }) b!: BookingRow;
  @Output() open = new EventEmitter<void>();
  num = fmtNum;

  get item(): BookingItem | undefined {
    return this.b.items?.[0];
  }

  get type() {
    return itemType(this.item?.itemType);
  }

  get waiting(): boolean {
    return this.b.status === BookingStatus.instaPending;
  }

  get tone(): Tone {
    return BookingStatus.tone(this.b.status);
  }

  /** The payment channel tag: InstaPay, wallet, or EasyKash with its method. */
  get pay(): { label: string; icon: string; tone: Tone } {
    if (this.b.payChannel === 'instapay') return { label: this.t('APP.payInstaPay'), icon: 'ti ti-receipt', tone: 'pending' };
    if (this.b.payChannel === 'wallet') return { label: this.t('APP.wallet'), icon: 'ti ti-wallet', tone: 'neutral' };
    const m = this.b.payMethod;
    return { label: `EasyKash${m == null ? '' : ' · ' + this.t(PayMethod.label(m))}`, icon: 'ti ti-credit-card', tone: 'info' };
  }

  /** BookingsCount counts this booking too: "first booking", or how many before it and how many of all were completed. */
  get customerHistory(): string {
    const c = this.b.customer;
    if ((c.bookingsCount ?? 0) <= 1) return this.t('APP.firstBooking');
    const before = this.t('APP.bookedBeforeN', { n: fmtNum(c.bookingsCount - 1) });
    return c.completedCount ? `${before} · ${this.t('APP.completedN', { n: fmtNum(c.completedCount) })}` : before;
  }

  /** The product, then what was booked: each ticket type with its quantity (an outing's tickets), else adults + children. */
  get subtitle(): string {
    const i = this.item;
    if (!i) return '';
    // The tickets the customer chose (several types per outing), else the reservation's one type × seats
    const tickets = (this.b.items ?? []).flatMap((x: any) =>
      x.tickets?.length ? x.tickets.map((k: any) => `${k.name} × ${fmtNum(k.count)}`) : x.ticketName ? [`${x.ticketName} × ${fmtNum(x.quantity ?? 1)}`] : []
    );
    const parts = tickets.length
      ? tickets.join(' · ')
      : [
          ...(i.adults > 0 ? [this.t('APP.adultsCount', { n: fmtNum(i.adults) })] : []),
          ...(i.childs > 0 ? [this.t('APP.childsCount', { n: fmtNum(i.childs) })] : [])
        ].join(' + ');
    return [i.name, parts].filter((s) => !!s).join(' · ');
  }

  private readonly text = inject(StaffText);
  private t = (key: string, params?: Record<string, unknown>) => this.text.tr(key, params);
}

/** CustomerCard: the customer with a call button and their booking counts. */
@Component({
  selector: 'ts-customer-card',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ts-card>
      <div class="ts-card-row" style="align-items: center">
        <ts-avatar [name]="customer.name" [size]="52"></ts-avatar>
        <div class="ts-card-row__main">
          <p class="ts-card-title">{{ customer.name }}</p>
          <p class="ts-muted ts-num" *ngIf="customer.phone" dir="ltr" style="text-align: start">{{ customer.phone }}</p>
          <p class="ts-muted" *ngIf="customer.email">{{ customer.email }}</p>
        </div>
        <a *ngIf="customer.phone" class="btn btn-secondary" [href]="'tel:' + customer.phone" [attr.aria-label]="'WEB.call' | translate"><i class="ti ti-phone"></i></a>
      </div>
      <div class="ts-three" style="margin-top: 12px">
        <div class="ts-count-box"><strong>{{ customer.bookingsCount | ts }}</strong><span>{{ 'APP.allTheirBookings' | translate }}</span></div>
        <div class="ts-count-box"><strong>{{ customer.completedCount | ts }}</strong><span>{{ 'APP.completed' | translate }}</span></div>
        <div class="ts-count-box"><strong>{{ customer.cancelledCount ?? 0 | ts }}</strong><span>{{ 'APP.cancelled' | translate }}</span></div>
      </div>
    </ts-card>
  `
})
export class CustomerCardComponent {
  @Input({ required: true }) customer!: BookingCustomer;
}

/** ItemCard: one reservation of the booking. */
@Component({
  selector: 'ts-item-card',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ts-card>
      <div class="ts-card-row" style="align-items: center; margin-bottom: 8px">
        <ts-icon-tile [icon]="type.icon" [color]="type.color" [bg]="type.bg" [size]="56"></ts-icon-tile>
        <div class="ts-card-row__main">
          <span style="font-size: 12px; font-weight: 600" [style.color]="type.color">{{ type.label | translate }}</span>
          <p class="ts-card-title">{{ item.name }}</p>
          <span *ngIf="item.vendorName" style="font-size: 12px; color: var(--ts-navy)">{{ 'APP.vendor' | translate }}: {{ item.vendorName }}</span>
        </div>
      </div>
      <ts-info [label]="'APP.dayAndTime' | translate" [value]="(item.travelDate ?? item.from) | ts: 'day'" [numeric]="false"></ts-info>
      <ts-info
        *ngIf="item.ticketName && !$any(item).tickets?.length"
        [label]="'APP.tickets' | translate"
        [value]="item.ticketName + (item.quantity == null ? '' : ' × ' + item.quantity)"
        [numeric]="false"
      ></ts-info>
      <ng-container *ngIf="$any(item).tickets?.length">
        <ts-info *ngFor="let k of $any(item).tickets; let first = first" [label]="first ? ('APP.tickets' | translate) : ''" [value]="k.name + ' × ' + k.count" [numeric]="false"></ts-info>
      </ng-container>
      <ts-info [label]="'APP.travellers' | translate" [value]="travellers" [numeric]="false"></ts-info>
      <ts-info *ngIf="item.gatheringPoint?.name" [label]="'APP.gatheringPoint' | translate" [value]="item.gatheringPoint?.name" [numeric]="false"></ts-info>
    </ts-card>
  `
})
export class ItemCardComponent {
  @Input({ required: true }) item!: BookingItem;
  private readonly text = inject(StaffText);
  private t = (key: string, params?: Record<string, unknown>) => this.text.tr(key, params);

  get type() {
    return itemType(this.item.itemType);
  }

  get travellers(): string {
    const i = this.item;
    const ages = i.childAges?.length ? ` (${i.childAges.join('، ')})` : '';
    return [
      ...(i.adults > 0 ? [this.t('APP.adultsCount', { n: fmtNum(i.adults) })] : []),
      ...(i.childs > 0 ? [this.t('APP.childsCount', { n: fmtNum(i.childs) }) + ages] : [])
    ].join(' + ');
  }
}

/** MoneyCard: the bill exactly as the backend computed it. */
@Component({
  selector: 'ts-money-card',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ts-card [title]="'APP.theBill' | translate">
      <div class="ts-money-row" *ngFor="let l of b.money.lines ?? []">
        <span>{{ l.label }}</span><strong>{{ l.amount | ts }}</strong>
      </div>
      <div class="ts-money-row" *ngIf="(b.money.fees ?? 0) > 0">
        <span>{{ 'APP.serviceFees' | translate }}</span><strong>{{ b.money.fees | ts }}</strong>
      </div>
      <div class="ts-money-row" *ngIf="b.money.coupon?.code">
        <span>{{ 'APP.coupon' | translate }} <ts-tag tone="ok">{{ b.money.coupon?.code }}</ts-tag></span>
        <strong style="color: var(--ts-ok-fg)">− {{ b.money.coupon?.discount ?? 0 | ts }}</strong>
      </div>
      <div class="ts-money-row" *ngIf="(b.money.paidFromBonus ?? 0) > 0">
        <span>{{ 'APP.paidFromBonus' | translate }}</span><strong style="color: var(--ts-ok-fg)">− {{ b.money.paidFromBonus | ts }}</strong>
      </div>
      <div class="ts-money-row">
        <span>{{ 'APP.fromWallet' | translate }}</span>
        <strong [style.color]="(b.money.paidFromWallet ?? 0) > 0 ? 'var(--ts-ok-fg)' : null">
          {{ (b.money.paidFromWallet ?? 0) > 0 ? '− ' : '' }}{{ b.money.paidFromWallet ?? 0 | ts }}
        </strong>
      </div>
      <div class="ts-money-row is-total">
        <span>{{ 'APP.totalAfterDiscounts' | translate }}</span>
        <strong>{{ b.money.netTotal ?? 0 | ts }} <small class="ts-muted">{{ 'APP.egp' | translate }}</small></strong>
      </div>
    </ts-card>
  `
})
export class MoneyCardComponent {
  @Input({ required: true }) b!: BookingDetails;
}

export const BOOKING_PARTS = [BookingCardComponent, CustomerCardComponent, ItemCardComponent, MoneyCardComponent] as const;
