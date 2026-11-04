import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, of } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { SheetComponent, StaffDialogs } from '../ui/dialogs';
import { ApiError, mediaUrl } from '../core/staff-http';
import { ITEM_TYPES, ItemTypeInfo, itemTypeByKey } from '../core/enums';
import { P, StaffSession } from '../core/session';
import { fmtCompact, fmtNum, fmtPct, fmtShortDate, latinDigits, parseAmount } from '../core/format';
import { ProductsApi } from './products-api';
import { CommissionSheetComponent } from './commission-sheet.component';
import { KpiTileComponent } from 'src/app/demo/pages/staff-analytics/staff-ui';

interface Action {
  icon: string;
  label: string;
  key: string;
  danger: boolean;
}

/** a-trip-details / a-outing-details / a-manasik-details / v-product. */
@Component({
  selector: 'ts-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, ...KIT, SheetComponent, CommissionSheetComponent, KpiTileComponent],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="d?.name || (type.label | translate)" [subtitle]="d ? (type.label | translate) : null">
        <button *ngIf="d && canEdit" type="button" class="btn btn-primary" (click)="act('edit')">
          <i class="ti ti-edit"></i>{{ (type.value === 4 ? 'APP.editRooms' : 'APP.editData') | translate }}
        </button>
      </ts-appbar>
      <ts-loading *ngIf="!d && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <div class="ts-two-cols" *ngIf="d">
        <div class="ts-stack">
          <section class="ts-section ts-section--flush">
            <div class="ts-product-hero" [style.background]="type.bg">
              <img *ngIf="image && !broken" [src]="image" alt="" (error)="broken = true" />
              <i *ngIf="!image || broken" [class]="type.icon" [style.color]="type.color"></i>
            </div>
            <div style="padding: 16px">
              <h2 class="ts-card-title" style="font-size: 20px">{{ d.name }}</h2>
              <p *ngIf="vendorName" style="margin: 2px 0 0; color: var(--ts-navy); font-size: 12px">{{ 'APP.vendor' | translate }}: {{ vendorName }}</p>
              <div class="ts-wrap" style="margin: 10px 0 6px">
                <ts-pill [tone]="d.isActive ? 'ok' : 'cancelled'">{{ (d.isActive ? 'APP.published' : 'APP.hidden') | translate }}</ts-pill>
                <ts-pill *ngIf="d.isBlocked" tone="danger">{{ 'APP.blocked' | translate }}</ts-pill>
                <ts-tag *ngIf="d.rating > 0" tone="gold">★ {{ d.rating.toFixed(1) }}</ts-tag>
              </div>
              <ts-info *ngIf="d.price != null" [label]="'APP.price' | translate" [value]="num(d.price) + ' ' + ('APP.egp' | translate)"></ts-info>
              <ts-info *ngIf="d.childPrice != null" [label]="'APP.childPrice' | translate" [value]="num(d.childPrice) + ' ' + ('APP.egp' | translate)"></ts-info>
              <ts-info *ngIf="d.capacity != null" [label]="'APP.capacity' | translate" [value]="num(d.remainingSeats) + ' / ' + num(d.capacity)"></ts-info>
              <ts-info *ngIf="d.location" [label]="'APP.place' | translate" [value]="d.location" [numeric]="false"></ts-info>
              <ts-info *ngIf="d.fromLocation" [label]="'APP.route' | translate" [value]="d.fromLocation + ' → ' + d.toLocation" [numeric]="false"></ts-info>
            </div>
          </section>

          <ts-card *ngIf="actions.length" [title]="'APP.manageProduct' | translate">
            <div class="ts-wrap">
              <button *ngFor="let a of actions" type="button" class="ts-action-chip" [class.is-danger]="a.danger" (click)="act(a.key)">
                <i [class]="a.icon"></i>{{ a.label | translate }}
              </button>
            </div>
          </ts-card>

          <ts-card *ngIf="(review || pending) && !vendor" [title]="'APP.reviewBeforePublish' | translate" [subtitle]="'APP.reviewBeforePublishHint' | translate">
            <div class="ts-wide-row">
              <button type="button" class="btn btn-outline-danger" (click)="decide(false)">{{ 'APP.reject' | translate }}</button>
              <button type="button" class="btn btn-primary" (click)="decide(true)">{{ 'APP.approveAndPublish' | translate }}</button>
            </div>
          </ts-card>
        </div>

        <div class="ts-stack">
          <ng-container *ngIf="stats">
            <div class="ts-kpi-grid">
              <ts-kpi [label]="'APP.bookings' | translate" [value]="num(stats.kpis?.bookings)"></ts-kpi>
              <ts-kpi [label]="'APP.revenue' | translate" [value]="compact(stats.kpis?.revenue)"></ts-kpi>
              <ts-kpi [label]="'APP.cancelRate' | translate" [value]="pct(stats.kpis?.cancelRatePct)"></ts-kpi>
              <ts-kpi [label]="'APP.occupancy' | translate" [value]="stats.kpis?.occupancyPct == null ? '—' : pct(stats.kpis.occupancyPct)"></ts-kpi>
            </div>
            <ts-card *ngIf="stats.gateToday as g">
              <div class="ts-spread">
                <strong class="ts-grow">{{ 'APP.gateToday' | translate }}</strong>
                <span class="ts-total">{{ g.scanned | ts }} / {{ g.sold | ts }}</span>
              </div>
            </ts-card>
          </ng-container>

          <ts-card *ngIf="dates.length" [title]="(type.value === 4 ? 'APP.groups' : 'APP.dates') | translate">
            <ts-info *ngFor="let x of dates.slice(0, 12)" [label]="x.startDate | ts: 'day'" [value]="x.endDate ? short(x.endDate) : null"></ts-info>
          </ts-card>

          <ts-card *ngIf="d.tickets?.length" [title]="(type.value === 4 ? 'APP.rooms' : 'APP.tickets') | translate">
            <div class="ts-row" *ngFor="let t of d.tickets" [class.is-link]="ticketCommission" (click)="ticketCommission && commission.show(5, t.id)">
              <span class="ts-row__label">{{ t.ticketType }}</span>
              <span class="ts-wrap">
                <ts-pill *ngIf="t.isActive === false" tone="cancelled">{{ 'APP.hidden' | translate }}</ts-pill>
                <ng-container *ngIf="type.value === 2">
                  <ts-tag *ngIf="t.itemPricingPolicy?.pricingModel === 1" tone="ok">{{ num(t.itemPricingPolicy.tripsCommissionValue) }}%</ts-tag>
                  <ts-tag *ngIf="t.itemPricingPolicy?.pricingModel === 2" tone="info">{{ num(t.itemPricingPolicy.tripsCommissionValue) }} {{ 'APP.egp' | translate }}</ts-tag>
                  <ts-tag *ngIf="t.itemPricingPolicy?.pricingModel === 3" tone="gold">{{ 'APP.committedPrice' | translate }}</ts-tag>
                  <ts-tag *ngIf="!t.itemPricingPolicy?.pricingModel" tone="cancelled">{{ 'APP.notConfigured' | translate }}</ts-tag>
                </ng-container>
                <strong class="ts-num">{{ t.price | ts }} {{ 'APP.egp' | translate }}</strong>
                <i *ngIf="ticketCommission" class="ti ti-edit ts-muted"></i>
              </span>
            </div>
          </ts-card>
        </div>
      </div>
    </div>

    <!-- foreign price -->
    <ts-sheet [open]="sheet === 'foreign'" (openChange)="sheet = null" [title]="'APP.foreignPrice' | translate">
      <p class="ts-muted">{{ 'APP.foreignPriceHint' | translate }}</p>
      <label class="ts-field" style="margin-top: 12px"><span>{{ 'APP.adultPrice' | translate }} ({{ 'APP.egp' | translate }})</span><input class="form-control" inputmode="decimal" [(ngModel)]="form.price" /></label>
      <label class="ts-field"><span>{{ 'APP.childPrice' | translate }} ({{ 'APP.egp' | translate }})</span><input class="form-control" inputmode="decimal" [(ngModel)]="form.child" /></label>
      <div sheet-foot class="ts-wide-row">
        <button *ngIf="form.exists" type="button" class="btn btn-outline-danger" (click)="removeForeign()">{{ 'APP.remove' | translate }}</button>
        <button type="button" class="btn btn-primary" (click)="saveForeign()">{{ 'APP.save' | translate }}</button>
      </div>
    </ts-sheet>

    <!-- booking rule -->
    <ts-sheet [open]="sheet === 'rule'" (openChange)="sheet = null" [title]="'APP.bookingRule' | translate">
      <label class="ts-field"><span>{{ 'APP.minPerBooking' | translate }}</span><input class="form-control" inputmode="numeric" [(ngModel)]="form.min" /></label>
      <label class="ts-field"><span>{{ 'APP.maxPerBooking' | translate }}</span><input class="form-control" inputmode="numeric" [placeholder]="'APP.optional' | translate" [(ngModel)]="form.max" /></label>
      <div sheet-foot class="ts-wide-row"><button type="button" class="btn btn-primary" (click)="saveRule()">{{ 'APP.save' | translate }}</button></div>
    </ts-sheet>

    <!-- gathering points -->
    <ts-sheet [open]="sheet === 'points'" (openChange)="sheet = null" [title]="'APP.gatheringPoints' | translate">
      <section class="ts-section" *ngFor="let p of points; let i = index" style="margin-bottom: 10px; padding: 12px">
        <label class="ts-field"><span>{{ 'APP.name' | translate }}</span><input class="form-control" [(ngModel)]="p.name" /></label>
        <label class="ts-field"><span>{{ 'APP.address' | translate }}</span><input class="form-control" [(ngModel)]="p.address" /></label>
        <label class="ts-field"><span>{{ 'APP.meetingTime' | translate }}</span><input class="form-control" placeholder="07:30" [(ngModel)]="p.meetingTime" /></label>
        <div class="ts-actions-bar"><button type="button" class="btn btn-link text-danger" (click)="points.splice(i, 1)">{{ 'APP.remove' | translate }}</button></div>
      </section>
      <button type="button" class="btn btn-secondary" (click)="points.push({ name: '', sortOrder: points.length, isActive: true })"><i class="ti ti-plus"></i>{{ 'APP.addPoint' | translate }}</button>
      <div sheet-foot class="ts-wide-row"><button type="button" class="btn btn-primary" (click)="savePoints()">{{ 'APP.save' | translate }}</button></div>
    </ts-sheet>

    <!-- hajj date seats -->
    <ts-sheet [open]="sheet === 'seats'" (openChange)="sheet = null" [title]="'APP.dateSeats' | translate">
      <label class="ts-field" *ngFor="let s of seats">
        <span>{{ short(s.startDate) }} · {{ 'APP.bookedN' | translate: { n: num(s.booked) } }}</span>
        <input class="form-control" inputmode="numeric" [placeholder]="'APP.unlimited' | translate" [(ngModel)]="s.value" />
      </label>
      <div sheet-foot class="ts-wide-row"><button type="button" class="btn btn-primary" (click)="saveSeats()">{{ 'APP.save' | translate }}</button></div>
    </ts-sheet>

    <!-- outing: pick the ticket whose commission to edit -->
    <ts-sheet [open]="sheet === 'tickets'" (openChange)="sheet = null" [title]="'APP.commissionPerTicket' | translate" [footer]="false">
      <p class="ts-muted">{{ 'APP.commissionPerTicketHint' | translate }}</p>
      <button type="button" class="ts-picker-row" *ngFor="let t of d?.tickets ?? []" (click)="sheet = null; commission.show(5, t.id)">
        <strong>{{ t.ticketType }}</strong><small class="ts-num">{{ t.price | ts }} {{ 'APP.egp' | translate }}</small>
      </button>
    </ts-sheet>

    <ts-commission-sheet #commission (saved)="load()"></ts-commission-sheet>
  `
})
export class ProductDetailsComponent implements OnInit {
  private readonly api = inject(ProductsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  @ViewChild('commission') commission!: CommissionSheetComponent;

  listKey = '';
  id = 0;
  review = false;
  vendor = false;
  d: any = null;
  stats: any = null;
  error: unknown = null;
  pending = false;
  broken = false;
  sheet: string | null = null;
  form: any = {};
  points: any[] = [];
  seats: any[] = [];
  num = fmtNum;
  compact = fmtCompact;
  pct = fmtPct;
  short = (v: unknown) => fmtShortDate(v as string);

  get type(): ItemTypeInfo {
    return itemTypeByKey(this.listKey) ?? ITEM_TYPES[0];
  }

  private get editPerm(): string {
    return this.type.value === 1 ? P.travelEdit : this.type.value === 2 ? P.outingsEdit : P.hajjEdit;
  }

  private get deletePerm(): string {
    return this.type.value === 1 ? P.travelDelete : this.type.value === 2 ? P.outingsDelete : P.hajjDelete;
  }

  get canEdit(): boolean {
    return this.session.can(this.editPerm);
  }

  get image(): string | null {
    const d = this.d;
    const images = d?.images ?? [];
    // || not ??: outings keep imageUrl as "" and their pictures in images[], so ?? stopped at the empty string
    return mediaUrl(d?.imageUrl || images[0]?.imageUrl || images[0]?.url || null);
  }

  get vendorName(): string | null {
    return this.d?.companyDto?.name ?? this.d?.vendor?.name ?? this.d?.vendorName ?? null;
  }

  get dates(): any[] {
    return (this.type.value === 1 ? this.d?.tripDates : this.d?.dates) ?? [];
  }

  /** Outing commission lives on each ticket (ItemType.OutingTicket = 5): shown and edited per ticket. */
  get ticketCommission(): boolean {
    return this.type.value === 2 && this.actions.some((a) => a.key === 'commission');
  }

  /** The product's actions, filtered by permission (the backend enforces each one). */
  get actions(): Action[] {
    const d = this.d;
    if (!d) return [];
    const s = this.session;
    const canEdit = s.can(this.editPerm);
    const admin = !s.isVendor;
    return [
      ...(canEdit ? [{ icon: d.isActive ? 'ti ti-eye-off' : 'ti ti-eye', label: d.isActive ? 'APP.hideFromCustomers' : 'APP.publish', key: 'active', danger: false }] : []),
      ...(canEdit ? [{ icon: 'ti ti-world', label: 'APP.foreignPrice', key: 'foreign', danger: false }] : []),
      ...(canEdit ? [{ icon: 'ti ti-users', label: 'APP.bookingRule', key: 'rule', danger: false }] : []),
      ...(canEdit ? [{ icon: 'ti ti-map-pin', label: 'APP.gatheringPoints', key: 'points', danger: false }] : []),
      ...(canEdit && this.type.value === 4 ? [{ icon: 'ti ti-armchair', label: 'APP.dateSeats', key: 'seats', danger: false }] : []),
      ...(canEdit && admin && s.can(P.financialEdit) ? [{ icon: 'ti ti-percentage', label: 'APP.commission', key: 'commission', danger: false }] : []),
      ...(canEdit && admin ? [{ icon: 'ti ti-ban', label: d.isBlocked ? 'APP.unblock' : 'APP.block', key: 'block', danger: false }] : []),
      ...(s.can(this.deletePerm) ? [{ icon: 'ti ti-trash', label: 'APP.deleteProduct', key: 'delete', danger: true }] : [])
    ];
  }

  ngOnInit(): void {
    const p = this.route.snapshot.params;
    this.listKey = p['type'];
    this.id = +p['id'];
    this.review = this.route.snapshot.queryParams['review'] === '1';
    this.vendor = !!this.route.snapshot.data['vendor'] || this.session.isVendor;
    this.load();
  }

  load(): void {
    this.error = null;
    this.api.details(this.type.value, this.id).subscribe({ next: (d) => (this.d = d), error: (e) => (this.error = e) });
    this.api.analytics(this.type.value, this.id).pipe(catchError(() => of(null))).subscribe((s) => (this.stats = s));
    if (!this.session.isVendor) {
      // ProductApprovalStatus 1 = pending; StaffItemType equals the item type for trips, outings and Hajj
      this.api
        .approvals()
        .pipe(catchError(() => of(null)))
        .subscribe((q) => (this.pending = !!q?.data.some((r: any) => r.itemType === this.type.value && r.itemId === this.id)));
    }
  }

  private run(action: () => any, done: string): void {
    action().subscribe({
      next: () => {
        this.text.showDone(this.text.tr(done));
        this.load();
      },
      error: (e: unknown) => this.text.showError(e)
    });
  }

  async act(key: string): Promise<void> {
    const d = this.d;
    switch (key) {
      case 'active':
        return this.run(() => this.api.setActive(this.type.value, this.id, !d.isActive), d.isActive ? 'APP.hiddenNow' : 'APP.publishedNow');
      case 'block':
        return this.run(() => this.api.toggleBlock(this.type.value, this.id), 'APP.saved');
      case 'delete':
        return this.remove();
      case 'foreign':
        this.api.foreignPrice(this.type.value, this.id).pipe(catchError(() => of(null))).subscribe((c) => {
          this.form = { exists: !!c, price: c ? fmtNum(c.price) : '', child: c?.childPrice == null ? '' : fmtNum(c.childPrice) };
          this.sheet = 'foreign';
        });
        return;
      case 'rule':
        this.api.bookingRule(this.type.value, this.id).pipe(catchError(() => of(null))).subscribe((c) => {
          this.form = { min: String(c?.minQuantity ?? 1), max: c?.maxQuantity == null ? '' : String(c.maxQuantity) };
          this.sheet = 'rule';
        });
        return;
      case 'points':
        this.api.gatheringPoints(this.type.value, this.id).pipe(catchError(() => of([]))).subscribe((pts) => {
          this.points = pts.map((p) => ({ ...p }));
          this.sheet = 'points';
        });
        return;
      case 'seats':
        this.api.dateSeats(this.id).subscribe({
          next: (r) => {
            this.seats = (r?.dates ?? []).map((x: any) => ({ ...x, value: x.seats == null ? '' : String(x.seats) }));
            this.sheet = 'seats';
          },
          error: (e) => this.text.showError(e)
        });
        return;
      case 'commission':
        // Outings: the backend charges commission per ticket type, so the commission is set per ticket
        if (this.type.value === 2) {
          if (!d.tickets?.length) return this.text.showError(this.text.tr('APP.noTicketsYet'));
          this.sheet = 'tickets';
        } else this.commission.show(this.type.value, this.id);
        return;
      case 'edit': {
        const path = this.type.value === 1 ? '/form/trip' : this.type.value === 2 ? '/form/outing' : '/form/hajj/rooms';
        this.router.navigate([path], { queryParams: { id: this.id } });
        return;
      }
    }
  }

  private async remove(): Promise<void> {
    const t = (k: string, p?: any) => this.text.tr(k, p);
    const typed = await this.dialogs.ask({ title: t('APP.deleteProduct'), label: t('APP.typeToDelete', { n: t('APP.deleteWord') }), lines: 1 });
    if (typed == null) return;
    this.api.delete(this.type.value, this.id, typed).subscribe({
      next: () => {
        this.text.showDone(t('APP.deleted'));
        this.location.back();
      },
      error: async (e: ApiError) => {
        if (e?.code === 'ITEM_HAS_ACTIVE_BOOKINGS') {
          const n = (e.data as any)?.activeBookings ?? 0;
          const hide = await this.dialogs.confirm({ title: t('APP.cannotDelete'), message: t('APP.hasActiveBookings', { n: fmtNum(n) }), confirm: t('APP.hideInstead') });
          if (hide) this.run(() => this.api.setActive(this.type.value, this.id, false), 'APP.hiddenNow');
        } else this.text.showError(e);
      }
    });
  }

  saveForeign(): void {
    const p = parseAmount(this.form.price);
    if (p == null) return;
    this.sheet = null;
    this.run(() => this.api.saveForeignPrice(this.type.value, this.id, p, parseAmount(this.form.child)), 'APP.saved');
  }

  removeForeign(): void {
    this.sheet = null;
    this.run(() => this.api.deleteForeignPrice(this.type.value, this.id), 'APP.saved');
  }

  saveRule(): void {
    const min = parseInt(latinDigits(String(this.form.min)), 10) || 1;
    const max = parseInt(latinDigits(String(this.form.max ?? '')), 10);
    this.sheet = null;
    this.run(() => this.api.saveBookingRule(this.type.value, this.id, min, isNaN(max) ? null : max), 'APP.saved');
  }

  savePoints(): void {
    const clean = this.points
      .filter((p) => (p.name ?? '').trim())
      .map((p, i) => ({ ...p, sortOrder: i, isActive: p.isActive ?? true }));
    this.sheet = null;
    this.run(() => this.api.saveGatheringPoints(this.type.value, this.id, clean), 'APP.saved');
  }

  saveSeats(): void {
    const dates = this.seats.map((s) => {
      const n = parseInt(latinDigits(String(s.value ?? '')), 10);
      return { hajjDateId: s.hajjDateId, seats: isNaN(n) ? null : n };
    });
    this.sheet = null;
    this.run(() => this.api.saveDateSeats(this.id, dates), 'APP.saved');
  }

  async decide(approve: boolean): Promise<void> {
    if (approve) return this.run(() => this.api.approve(this.type.value, this.id), 'APP.approved');
    const note = await this.dialogs.ask({ title: this.text.tr('APP.reject'), label: this.text.tr('APP.rejectReason') });
    if (note) this.run(() => this.api.reject(this.type.value, this.id, note), 'APP.rejectedDone');
  }
}
