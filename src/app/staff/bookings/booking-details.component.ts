import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { KIT, StaffText } from '../ui/kit';
import { BookingStatus } from '../core/enums';
import { P, StaffSession } from '../core/session';
import { StaffDialogs } from '../ui/dialogs';
import { mediaUrl } from '../core/staff-http';
import { BookingDetails, BookingsApi } from './bookings-api';
import { BOOKING_PARTS } from './booking-parts';

/** a-booking-details / v-booking. A vendor sees the same booking without the admin actions. */
@Component({
  selector: 'ts-booking-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...BOOKING_PARTS],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar
        [title]="b ? ('APP.booking' | translate) + ' #' + b.reference : ('APP.booking' | translate)"
        [subtitle]="b ? (b.createDate | ts: 'datetime') : null"
      >
        <button *ngIf="b && !vendor && canEdit && b.actions.canResendEmail" type="button" class="btn btn-secondary" [disabled]="busy" (click)="resend()">
          <i [class]="busy ? 'pi pi-spin pi-spinner' : 'ti ti-mail'"></i>{{ 'APP.resendEmail' | translate }}
        </button>
        <ng-container *ngIf="b && !vendor && canEdit">
          <a *ngIf="b.actions.canConfirmInstaPay" class="btn btn-primary" [routerLink]="['/a/bookings', b.id, 'instapay']">
            <i class="ti ti-receipt"></i>{{ 'APP.reviewReceipt' | translate }}
          </a>
          <button *ngIf="b.actions.canCancel" type="button" class="btn btn-outline-danger" [disabled]="busy" (click)="cancel()">
            <i class="ti ti-x"></i>{{ 'APP.cancelBooking' | translate }}
          </button>
          <button *ngIf="b.actions.canConfirmPending" type="button" class="btn btn-primary" [disabled]="busy" (click)="confirmPending()">
            <i [class]="busy ? 'pi pi-spin pi-spinner' : 'ti ti-check'"></i>{{ 'APP.bkConfirmPending' | translate }}
          </button>
        </ng-container>
      </ts-appbar>
      <ts-loading *ngIf="loading"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ng-container *ngIf="b && !loading">
        <section class="ts-section ts-tone-{{ tone }}" style="background: var(--tone-bg); border-color: var(--tone-line)">
          <div class="ts-spread">
            <i class="ts-status-dot" style="background: var(--tone-fg)"></i>
            <strong class="ts-grow" style="color: var(--tone-fg); font-size: 16px">{{ b.statusName }}</strong>
            <span class="ts-muted">{{ (b.payChannel === 'instapay' ? 'APP.payInstaPay' : 'APP.paidOnline') | translate }}</span>
          </div>
          <p *ngIf="note" style="margin: 8px 0 0; color: var(--tone-fg)">{{ note | translate }}</p>
        </section>
        <ts-customer-card [customer]="b.customer"></ts-customer-card>
        <ts-item-card *ngFor="let item of b.items" [item]="item"></ts-item-card>
        <ts-money-card [b]="b"></ts-money-card>
        <!-- The receipt stays on the booking after it's confirmed or cancelled; it used to show only while under review -->
        <ts-card *ngIf="proof && !vendor" [title]="'WEB.paymentReceipt' | translate" [subtitle]="'WEB.receiptStaysNote' | translate" icon="ti ti-receipt">
          <a [href]="proof" target="_blank" rel="noopener" class="ts-receipt ts-receipt--small">
            <img [src]="proof" [alt]="'WEB.paymentReceipt' | translate" />
          </a>
        </ts-card>
        <ts-card *ngIf="b.emails?.length" [title]="'APP.emails' | translate">
          <div class="ts-row" *ngFor="let e of b.emails">
            <span class="ts-row__label">{{ e.to || '—' }}</span>
            <span class="ts-muted">{{ e.date | ts: 'time' }}</span>
            <ts-pill [tone]="e.isSend ? 'ok' : 'danger'">{{ (e.isSend ? 'APP.sent' : 'APP.failed') | translate }}</ts-pill>
          </div>
        </ts-card>
      </ng-container>
    </div>
  `
})
export class BookingDetailsComponent implements OnInit {
  private readonly api = inject(BookingsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);

  vendor = false;
  b: BookingDetails | null = null;
  loading = true;
  error: unknown = null;
  busy = false;

  get canEdit(): boolean {
    return this.session.can(P.bookingEdit);
  }

  get tone() {
    return BookingStatus.tone(this.b?.status ?? 0);
  }

  get note(): string | null {
    if (this.b?.payChannel === 'easykash') return 'APP.easyKashAutoNote';
    // "Needs a team member to check the receipt" only while it waits for that check
    return this.b?.payChannel === 'instapay' && this.b.status === BookingStatus.instaPending ? 'APP.instaPayNote' : null;
  }

  get proof(): string | null {
    return mediaUrl(this.b?.paymentProofImageUrl);
  }

  ngOnInit(): void {
    this.vendor = !!this.route.snapshot.data['vendor'];
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.details(+this.route.snapshot.params['id']).subscribe({
      next: (b) => {
        this.b = b;
        this.loading = false;
      },
      error: (e) => {
        this.error = e;
        this.loading = false;
      }
    });
  }

  resend(): void {
    if (!this.b) return;
    this.busy = true;
    this.api.resendEmail(this.b.id).subscribe({
      next: () => {
        this.busy = false;
        this.text.showDone(this.text.tr('APP.emailResent'));
        this.load();
      },
      error: (e) => {
        this.busy = false;
        this.text.showError(e);
      }
    });
  }

  /** A pending card / cash booking the customer paid outside the app: completed as after a payment, then emailed. */
  async confirmPending(): Promise<void> {
    if (!this.b) return;
    const t = (k: string, p?: any) => this.text.tr(k, p);
    const ok = await this.dialogs.confirm({
      title: t('APP.bkConfirmPending'),
      message: t('APP.bkConfirmPendingQ', { n: this.b.reference }),
      confirm: t('APP.bkConfirmPending')
    });
    if (!ok) return;
    this.busy = true;
    this.api.confirmPending(this.b.id).subscribe({
      next: (r) => {
        this.busy = false;
        this.text.showDone(t(r?.emailSent === false ? 'APP.bkConfirmedNoEmail' : 'APP.bkConfirmed'));
        this.load();
      },
      error: (e) => {
        this.busy = false;
        this.text.showError(e);
      }
    });
  }

  /** Cancel: seats back; a paid booking's wallet / bonus part goes back to the wallet (a card payment is refunded apart). */
  async cancel(): Promise<void> {
    if (!this.b) return;
    const t = (k: string, p?: any) => this.text.tr(k, p);
    const ok = await this.dialogs.confirm({
      title: t('APP.cancelBooking'),
      message: t(this.b.actions.isPaid ? 'APP.bkCancelPaidQ' : 'APP.bkCancelQ', { n: this.b.reference }),
      confirm: t('APP.cancelBooking'),
      danger: true
    });
    if (!ok) return;
    this.busy = true;
    this.api.cancelBooking(this.b.id).subscribe({
      next: () => {
        this.busy = false;
        this.text.showDone(t('APP.bookingCancelled'));
        this.load();
      },
      error: (e) => {
        this.busy = false;
        this.text.showError(e);
      }
    });
  }
}

/**
 * a-booking-instapay: the receipt next to the expected amount and Trips' account; the employee compares them and
 * confirms or cancels. The screen shows, the backend decides.
 */
@Component({
  selector: 'ts-instapay-review',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ...BOOKING_PARTS],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'APP.reviewReceipt' | translate" [subtitle]="b ? '#' + b.reference : null">
        <ng-container *ngIf="b && canEdit">
          <button *ngIf="b.actions.canCancelInstaPay" type="button" class="btn btn-outline-danger" [disabled]="busy" (click)="act(false)">
            {{ 'APP.cancelBooking' | translate }}
          </button>
          <button *ngIf="b.actions.canConfirmInstaPay" type="button" class="btn btn-primary" [disabled]="busy" (click)="act(true)">
            <i *ngIf="busy" class="pi pi-spin pi-spinner"></i>{{ 'APP.confirmPayment' | translate }}
          </button>
        </ng-container>
      </ts-appbar>
      <ts-loading *ngIf="loading"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <div class="ts-two-cols" *ngIf="b && !loading">
        <div class="ts-stack">
          <ts-card>
            <ts-empty *ngIf="!proof" [message]="'APP.noReceipt' | translate" icon="ti ti-photo-off"></ts-empty>
            <a *ngIf="proof" [href]="proof" target="_blank" rel="noopener" class="ts-receipt">
              <img [src]="proof" [alt]="'APP.reviewReceipt' | translate" />
            </a>
          </ts-card>
        </div>
        <div class="ts-stack">
          <ts-card [title]="'APP.compareWithReceipt' | translate">
            <div class="ts-row">
              <span class="ts-row__label">{{ 'APP.expectedAmount' | translate }}</span>
              <strong class="ts-num" style="font-size: 18px">{{ b.instaPay?.expectedAmount | ts }} {{ 'APP.egp' | translate }}</strong>
            </div>
            <ts-info [label]="'APP.tripsAccount' | translate" [value]="b.instaPay?.accountNumber ?? null"></ts-info>
            <ts-info [label]="'APP.waiting' | translate" [value]="'APP.minutesCount' | translate: { n: (b.instaPay?.waitingMinutes ?? 0 | ts) }" [numeric]="false"></ts-info>
          </ts-card>
          <ts-customer-card [customer]="b.customer"></ts-customer-card>
          <ts-item-card *ngFor="let item of b.items" [item]="item"></ts-item-card>
          <ts-money-card [b]="b"></ts-money-card>
        </div>
      </div>
    </div>
  `
})
export class InstaPayReviewComponent implements OnInit {
  private readonly api = inject(BookingsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  private readonly location = inject(Location);

  b: BookingDetails | null = null;
  loading = true;
  error: unknown = null;
  busy = false;

  get canEdit(): boolean {
    return this.session.can(P.bookingEdit);
  }

  get proof(): string | null {
    return mediaUrl(this.b?.paymentProofImageUrl);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.details(+this.route.snapshot.params['id']).subscribe({
      next: (b) => {
        this.b = b;
        this.loading = false;
      },
      error: (e) => {
        this.error = e;
        this.loading = false;
      }
    });
  }

  async act(confirm: boolean): Promise<void> {
    const t = (k: string) => this.text.tr(k);
    const ok = await this.dialogs.confirm({
      title: t(confirm ? 'APP.confirmPayment' : 'APP.cancelBooking'),
      message: t(confirm ? 'APP.confirmPaymentQ' : 'APP.cancelBookingQ'),
      confirm: t(confirm ? 'APP.confirmPayment' : 'APP.cancelBooking'),
      danger: !confirm
    });
    if (!ok || !this.b) return;
    this.busy = true;
    (confirm ? this.api.confirmInstaPay(this.b.id) : this.api.cancelInstaPay(this.b.id)).subscribe({
      next: () => {
        this.busy = false;
        this.text.showDone(t(confirm ? 'APP.paymentConfirmed' : 'APP.bookingCancelled'));
        this.location.back();
      },
      error: (e) => {
        this.busy = false;
        this.text.showError(e);
      }
    });
  }
}
