import { Component, EventEmitter, Injectable, Input, OnDestroy, OnInit, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, catchError, firstValueFrom, map, of } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { FilterDrawerComponent, LISTS } from '../ui/lists';
import { PillSwitchComponent } from '../ui/controls';
import { SheetComponent, StaffDialogs } from '../ui/dialogs';
import { StaffHttp } from '../core/staff-http';
import { ListResult, PagedList, StaffQuery, asPage, emptyQuery, queryJson } from '../core/query';
import { fmtNum, parseAmount } from '../core/format';
import { FORM_KIT, Picked } from '../forms/form-kit';

/** Custom trip requests: the staff search for admins, the existing VendorTripRequestController for vendors. */
@Injectable({ providedIn: 'root' })
export class RequestsApi {
  private readonly http = inject(StaffHttp);

  /** Closes the request; pending offers are rejected and the customer is told (status 7). */
  markUnavailable(id: number): Observable<unknown> {
    return this.http.post(`/api/VendorTripRequests/admin/${id}/mark-unavailable`);
  }

  adminSearch(q: StaffQuery): Observable<ListResult<any>> {
    return this.http.post<any>('/api/staff/custom-requests/search', queryJson(q)).pipe(map((d) => ({ page: asPage<any>(d) })));
  }

  vendorList(q: StaffQuery): Observable<ListResult<any>> {
    return this.http
      .post<any>('/api/VendorTripRequests', { pageIndex: q.pageIndex, pageSize: 20, ...(q.search ? { search: q.search } : {}) })
      .pipe(map((d) => ({ page: asPage<any>(d) })));
  }

  vendorRequest(id: number): Observable<any> {
    return this.http.get(`/api/VendorTripRequests/${id}`);
  }

  myOffers(q: StaffQuery): Observable<ListResult<any>> {
    return this.http.post<any>('/api/VendorTripRequests/my-submitted-offers', { pageIndex: q.pageIndex, pageSize: 20 }).pipe(map((d) => ({ page: asPage<any>(d) })));
  }

  /** PaymentType: 1 deposit, 2 full. An admin may pass vendorId to offer in that vendor's name. */
  sendOffer(o: { requestId: number; price: number; notes: string; paymentType: number; deposit: number | null; vendorId?: number | null }): Observable<any> {
    return this.http.post('/api/VendorTripRequests/Offers', {
      customTripRequestId: o.requestId,
      ...(o.vendorId != null ? { vendorId: o.vendorId } : {}),
      price: o.price,
      vendorNotes: o.notes,
      paymentType: o.paymentType,
      ...(o.deposit != null ? { depositAmount: o.deposit } : {})
    });
  }

  updateOffer(id: number, o: { price: number; notes: string; paymentType: number; deposit: number | null }): Observable<unknown> {
    return this.http.put(`/api/VendorTripRequests/Offers/${id}`, {
      price: o.price,
      vendorNotes: o.notes,
      paymentType: o.paymentType,
      ...(o.deposit != null ? { depositAmount: o.deposit } : {})
    });
  }

  viewers(id: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/VendorTripRequests/admin/${id}/views`).pipe(map((d) => d ?? []));
  }

  analytics(): Observable<any> {
    return this.http.get('/api/VendorTripRequests/admin/analytics');
  }

  /** The admin row of one request (there is no admin details endpoint): searched by its number. */
  adminRow(id: number): Observable<any> {
    return this.adminSearch(emptyQuery({ search: String(id), pageSize: 50 })).pipe(
      map(({ page }) => {
        const row = page.data.find((r) => r.id === id);
        if (!row) throw new Error('404');
        return row;
      })
    );
  }
}

export interface OfferInput {
  price: number;
  paymentType: number;
  deposit: number | null;
  notes: string;
  vendorId: number | null;
}

/** showOfferSheet: the offer fields, new or edit; withVendor adds the vendor picker (an admin offering for a vendor). */
@Component({
  selector: 'ts-offer-sheet',
  standalone: true,
  imports: [CommonModule, TranslateModule, SheetComponent, PillSwitchComponent, ...FORM_KIT],
  template: `
    <ts-sheet [open]="open" (openChange)="open = false" [title]="title">
      <ts-option-field *ngIf="withVendor" [label]="'APP.vendor' | translate" source="vendors" [required]="true" [(value)]="vendor"></ts-option-field>
      <ts-field [label]="'APP.totalPrice' | translate" [number]="true" [suffix]="'APP.egp' | translate" [required]="true" [(value)]="price"></ts-field>
      <ts-pill-switch [items]="types" [selected]="type" (selectedChange)="type = $event"></ts-pill-switch>
      <ts-field *ngIf="type === '1'" [label]="'APP.depositAmount' | translate" [number]="true" [suffix]="'APP.egp' | translate" [(value)]="deposit" style="display: block; margin-top: 12px"></ts-field>
      <ts-field [label]="'APP.notesForCustomer' | translate" [lines]="4" [(value)]="notes" style="display: block; margin-top: 12px"></ts-field>
      <div sheet-foot>
        <button type="button" class="btn btn-primary ts-wide-btn" (click)="submit()">{{ (editing ? 'APP.saveChanges' : 'APP.send') | translate }}</button>
      </div>
    </ts-sheet>
  `
})
export class OfferSheetComponent {
  private readonly text = inject(StaffText);
  @Output() done = new EventEmitter<OfferInput>();
  open = false;
  editing = false;
  withVendor = false;
  title = '';
  price = '';
  deposit = '';
  notes = '';
  type = '2';
  vendor: Picked | null = null;
  types = [
    { key: '2', label: this.text.tr('APP.fullPayment') },
    { key: '1', label: this.text.tr('APP.deposit') }
  ];

  show(initial: any = null, withVendor = false): void {
    this.editing = !!initial;
    this.withVendor = withVendor;
    this.title = this.text.tr(initial ? 'APP.editOffer' : withVendor ? 'APP.offerForVendor' : 'APP.sendOffer');
    this.price = initial?.price != null ? fmtNum(initial.price) : '';
    this.deposit = initial?.depositAmount ? fmtNum(initial.depositAmount) : '';
    this.notes = initial?.vendorNotes ?? '';
    this.type = String(initial?.paymentType ?? 2);
    this.vendor = null;
    this.open = true;
  }

  submit(): void {
    const price = parseAmount(this.price.replace(/,/g, ''));
    if (price == null || (this.withVendor && !this.vendor)) return this.text.showError(this.text.tr('APP.fillRequired'));
    this.open = false;
    this.done.emit({
      price,
      paymentType: +this.type,
      deposit: this.type === '1' ? parseAmount(this.deposit.replace(/,/g, '')) : null,
      notes: this.notes.trim(),
      vendorId: this.vendor ? +this.vendor.id : null
    });
  }
}

/** a-custom-requests / v-requests. */
@Component({
  selector: 'ts-custom-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...LISTS],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'APP.customRequests' | translate" [subtitle]="'APP.requestsCount' | translate: { n: num(list.total) }">
        <a *ngIf="vendor" class="ts-icon-btn" routerLink="/v/more/offers" [title]="'APP.myOffers' | translate"><i class="ti ti-discount"></i></a>
        <button *ngIf="!vendor" type="button" class="ts-icon-btn" (click)="drawer.show()" [attr.aria-label]="'APP.requestFilters' | translate">
          <i class="ti ti-adjustments-horizontal"></i>
          <span class="ts-icon-btn__badge" *ngIf="list.activeFilters">{{ list.activeFilters }}</span>
        </button>
      </ts-appbar>
      <ts-card *ngIf="summary">
        <div class="ts-stat-row">
          <div><strong class="ts-num">{{ summary.totalRequests | ts }}</strong><small>{{ 'APP.allRequests' | translate }}</small></div>
          <div><strong class="ts-num" style="color: var(--ts-ok-fg)">{{ summary.answeredRequests | ts }}</strong><small>{{ 'APP.answered' | translate }}</small></div>
          <div><strong class="ts-num" style="color: var(--ts-pend-ink)">{{ summary.unansweredRequests | ts }}</strong><small>{{ 'APP.unanswered' | translate }}</small></div>
          <div><strong class="ts-num" style="color: var(--ts-ink-muted)">{{ summary.unavailableRequests | ts }}</strong><small>{{ 'APP.requestUnavailable' | translate }}</small></div>
        </div>
      </ts-card>
      <div class="ts-listbar">
        <ts-search [hint]="'APP.search' | translate" (changed)="list.setSearch($event)"></ts-search>
      </div>
      <ts-paged-list [list]="list" emptyIcon="ti ti-compass" [grid]="true">
        <ng-template let-r>
          <button type="button" class="ts-list-card ts-list-card--col" (click)="open(r)">
            <span class="ts-wrap ts-wrap--between">
              <strong class="ts-card-title ts-grow">{{ r.destination }}</strong>
              <ts-pill *ngIf="r.offersCount != null" [tone]="r.offersCount === 0 ? 'pending' : 'ok'">{{ 'APP.offersN' | translate: { n: num(r.offersCount) } }}</ts-pill>
              <ts-pill *ngIf="r.myOfferStatus != null" tone="info">{{ 'APP.offerSent' | translate }}</ts-pill>
            </span>
            <span class="ts-muted">{{ describe(r) }}</span>
            <span *ngIf="!vendor && r.customerName" class="ts-muted" style="color: var(--ts-accent)">{{ r.customerName }}</span>
          </button>
        </ng-template>
      </ts-paged-list>
    </div>
    <ts-filter-drawer #drawer listKey="custom-requests" [title]="'APP.requestFilters' | translate" [list]="$any(list)"></ts-filter-drawer>
  `
})
export class CustomRequestsComponent implements OnInit, OnDestroy {
  private readonly api = inject(RequestsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly text = inject(StaffText);
  @Input() vendor = false;
  @ViewChild('drawer') drawer!: FilterDrawerComponent;
  list!: PagedList<any>;
  summary: any = null;
  num = fmtNum;

  ngOnInit(): void {
    this.vendor = this.vendor || !!this.route.snapshot.data['vendor'];
    this.list = new PagedList<any>((q) => (this.vendor ? this.api.vendorList(q) : this.api.adminSearch(q)), {}, this.vendor ? undefined : 'custom-requests');
    if (!this.vendor) this.api.analytics().pipe(catchError(() => of(null))).subscribe((s) => (this.summary = s));
  }

  describe(r: any): string {
    const ar = this.text.arabic;
    const d = r.travelDate ? new Date(r.travelDate).toLocaleDateString(ar ? 'ar-EG-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
    return [
      d,
      this.text.tr('APP.daysN', { n: fmtNum(r.numberOfDays ?? 0) }),
      this.text.tr('APP.adultsCount', { n: fmtNum(r.numberOfAdults ?? 0) }),
      (r.numberOfChildren ?? 0) > 0 ? this.text.tr('APP.childsCount', { n: fmtNum(r.numberOfChildren) }) : null
    ]
      .filter(Boolean)
      .join(' · ');
  }

  open(r: any): void {
    if (this.vendor) this.router.navigate(['/v/more/requests', r.id]);
    // The admin row carries the offers; there is no admin details endpoint
    else this.router.navigate(['/a/more/custom-requests', r.id], { state: { row: r } });
  }

  ngOnDestroy(): void {
    this.list?.destroy();
  }
}

/** a-custom-request (admin, from the list row with its offers) / v-request (vendor, loaded and with "send offer"). */
@Component({
  selector: 'ts-custom-request',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, OfferSheetComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.customRequest' | translate"></ts-appbar>
      <ts-loading *ngIf="!r && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ng-container *ngIf="r">
        <ts-card [title]="r.destination" icon="ti ti-map-pin">
          <ts-info [label]="'APP.travelDate' | translate" [value]="r.travelDate | ts: 'day'"></ts-info>
          <ts-info [label]="'APP.duration' | translate" [value]="'APP.daysN' | translate: { n: num(r.numberOfDays) }"></ts-info>
          <ts-info [label]="'APP.travellers' | translate" [value]="travellers()"></ts-info>
          <ts-info *ngIf="r.hotelName" [label]="'APP.hotel' | translate" [value]="r.hotelName" [numeric]="false"></ts-info>
          <ts-info [label]="'APP.flight' | translate" [value]="(r.needsFlight ? 'APP.yes' : 'APP.no') | translate" [numeric]="false"></ts-info>
          <ts-info [label]="'APP.visa' | translate" [value]="(r.needsVisa ? 'APP.yes' : 'APP.no') | translate" [numeric]="false"></ts-info>
          <ts-info *ngIf="r.additionalNotes" [label]="'APP.notes' | translate" [value]="r.additionalNotes" [numeric]="false"></ts-info>
          <ts-info *ngIf="!vendor && r.customerName" [label]="'APP.customer' | translate" [value]="r.customerName + ' ' + (r.customerPhone || '')" [numeric]="false"></ts-info>
        </ts-card>
        <ts-tag *ngIf="!vendor && r.status === 7" tone="cancelled" style="display: inline-block; margin-bottom: 12px">{{ 'APP.requestUnavailable' | translate }}</ts-tag>
        <button *ngIf="!vendor && [1, 2, 3].includes(r.status)" type="button" class="btn btn-outline-danger ts-wide-btn" [disabled]="closing" (click)="markUnavailable()" style="margin-bottom: 12px">
          <i class="ti ti-ban"></i>{{ 'APP.markUnavailable' | translate }}
        </button>

        <ng-container *ngIf="!vendor">
          <ts-card [title]="'APP.vendorOffers' | translate" [subtitle]="'APP.offersN' | translate: { n: num(r.offers?.length ?? 0) }" icon="ti ti-discount">
            <button card-action *ngIf="r.isAcceptingOffers" type="button" class="btn btn-link" (click)="offerSheet.show(null, true)">{{ 'APP.offerForVendor' | translate }}</button>
            <ts-empty *ngIf="!r.offers?.length" icon="ti ti-hourglass" [message]="'APP.noOffersYet' | translate"></ts-empty>
            <!-- VendorTripOfferStatus 1 = pending: the only state the backend lets an admin edit -->
            <button type="button" class="ts-list-card" *ngFor="let o of r.offers ?? []" [disabled]="o.status !== 1" (click)="editing = o; offerSheet.show(o)">
              <ts-avatar [name]="o.vendorName" bg="var(--ts-selected)" fg="var(--ts-navy)"></ts-avatar>
              <span class="ts-card-row__main">
                <span class="ts-card-title">{{ o.vendorName }}</span>
                <span class="ts-muted ts-clamp2" *ngIf="o.vendorNotes">{{ o.vendorNotes }}</span>
              </span>
              <strong class="ts-num">{{ o.price | ts }} {{ 'APP.egp' | translate }}</strong>
            </button>
          </ts-card>
          <ts-card *ngIf="viewers.length" [title]="'APP.whoViewed' | translate" [subtitle]="'APP.vendorsN' | translate: { n: num(viewers.length) }" icon="ti ti-eye">
            <ts-info *ngFor="let v of viewers" [label]="v.vendorName">
              <ts-pill [tone]="v.hasSubmittedOffer ? 'ok' : 'cancelled'">{{ v.hasSubmittedOffer ? ('APP.offerSent' | translate) : (v.viewedDate | ts: 'short') }}</ts-pill>
            </ts-info>
          </ts-card>
        </ng-container>

        <ng-container *ngIf="vendor">
          <ts-card *ngIf="r.myOfferStatus != null">
            <ts-info [label]="'APP.yourOffer' | translate" [value]="num(r.myOfferPrice) + ' ' + ('APP.egp' | translate)"></ts-info>
          </ts-card>
          <button *ngIf="r.myOfferStatus == null && r.isAcceptingOffers" type="button" class="btn btn-primary ts-wide-btn" (click)="editing = null; offerSheet.show()">
            <i class="ti ti-send"></i>{{ 'APP.sendOffer' | translate }}
          </button>
          <ts-tag *ngIf="r.myOfferStatus == null && !r.isAcceptingOffers" tone="cancelled">{{ 'APP.offersClosed' | translate }}</ts-tag>
        </ng-container>
      </ng-container>
    </div>
    <ts-offer-sheet #offerSheet (done)="saveOffer($event)"></ts-offer-sheet>
  `
})
export class CustomRequestComponent implements OnInit {
  private readonly api = inject(RequestsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  @ViewChild('offerSheet') offerSheet!: OfferSheetComponent;
  num = fmtNum;
  id = 0;
  vendor = false;
  r: any = null;
  viewers: any[] = [];
  error: unknown = null;
  closing = false;
  editing: any = null;

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.vendor = !!this.route.snapshot.data['vendor'];
    const row = history.state?.row;
    if (!this.vendor && row?.id === this.id) {
      this.r = row;
      this.loadViewers();
    } else this.load();
  }

  load(): void {
    this.error = null;
    this.r = null;
    (this.vendor ? this.api.vendorRequest(this.id) : this.api.adminRow(this.id)).subscribe({ next: (r) => (this.r = r), error: (e) => (this.error = e) });
    if (!this.vendor) this.loadViewers();
  }

  private loadViewers(): void {
    this.api.viewers(this.id).pipe(catchError(() => of([]))).subscribe((v) => (this.viewers = v));
  }

  travellers(): string {
    const r = this.r;
    const adults = this.text.tr('APP.adultsCount', { n: fmtNum(r.numberOfAdults ?? 0) });
    return (r.numberOfChildren ?? 0) > 0 ? `${adults} + ${this.text.tr('APP.childsCount', { n: fmtNum(r.numberOfChildren) })}` : adults;
  }

  async markUnavailable(): Promise<void> {
    const ok = await this.dialogs.confirm({
      title: this.text.tr('APP.markUnavailable'),
      message: this.text.tr('APP.markUnavailableQ'),
      confirm: this.text.tr('APP.markUnavailable'),
      danger: true
    });
    if (!ok) return;
    this.closing = true;
    try {
      await firstValueFrom(this.api.markUnavailable(this.id));
      this.text.showDone(this.text.tr('APP.markedUnavailable'));
      this.load();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.closing = false;
    }
  }

  async saveOffer(input: OfferInput): Promise<void> {
    try {
      if (this.editing) {
        await firstValueFrom(this.api.updateOffer(this.editing.id, input));
        this.text.showDone(this.text.tr('APP.saved'));
      } else {
        await firstValueFrom(
          this.api.sendOffer({ requestId: this.id, price: input.price, notes: input.notes, paymentType: input.paymentType, deposit: input.deposit, vendorId: this.vendor ? null : input.vendorId })
        );
        this.text.showDone(this.text.tr('APP.offerSent'));
      }
      this.editing = null;
      this.load();
    } catch (e) {
      this.text.showError(e);
    }
  }
}

/** v-offers: the vendor's submitted offers. */
@Component({
  selector: 'ts-vendor-offers',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...LISTS],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'APP.myOffers' | translate"></ts-appbar>
      <ts-paged-list [list]="list" emptyIcon="ti ti-discount" [grid]="true">
        <ng-template let-r>
          <a class="ts-list-card" [routerLink]="['/v/more/requests', r.id]">
            <span class="ts-card-row__main">
              <span class="ts-card-title">{{ r.destination }}</span>
              <span class="ts-muted">{{ r.travelDate | ts: 'short' }}</span>
            </span>
            <strong class="ts-num">{{ r.myOfferPrice | ts }} {{ 'APP.egp' | translate }}</strong>
            <ts-pill [tone]="r.myOfferStatus === 2 ? 'ok' : r.myOfferStatus === 1 ? 'pending' : 'cancelled'">
              {{ (r.myOfferStatus === 2 ? 'APP.accepted' : r.myOfferStatus === 1 ? 'APP.pending' : 'APP.closed') | translate }}
            </ts-pill>
          </a>
        </ng-template>
      </ts-paged-list>
    </div>
  `
})
export class VendorOffersComponent implements OnDestroy {
  private readonly api = inject(RequestsApi);
  list = new PagedList<any>((q) => this.api.myOffers(q));

  ngOnDestroy(): void {
    this.list.destroy();
  }
}
