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
import { FilterSchema, FiltersApi, ListResult, PagedList, StaffQuery, asPage, emptyQuery, queryJson } from '../core/query';
import { fmtNum, parseAmount } from '../core/format';
import { FORM_KIT, Picked } from '../forms/form-kit';
import { VendorCommsApi } from '../vendor-comms/vendor-comms.component';
import { OfferView, RequestView, hoursLeft, offerStatus, offerViews, requestView, whatsAppNumber } from './request-view';

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
          <div><strong class="ts-num" style="color: var(--ts-pend-ink)">{{ summary.unansweredRequests | ts }}</strong><small>{{ 'APP.unanswered' | translate }}</small></div>
          <div><strong class="ts-num" style="color: var(--ts-ok-fg)">{{ summary.answeredRequests | ts }}</strong><small>{{ 'APP.answered' | translate }}</small></div>
          <div><strong class="ts-num" style="color: var(--ts-ink-muted)">{{ summary.unavailableRequests | ts }}</strong><small>{{ 'APP.requestUnavailable' | translate }}</small></div>
        </div>
      </ts-card>
      <div class="ts-listbar">
        <ts-search [hint]="schema?.searchPlaceholderAr || ('APP.search' | translate)" (changed)="list.setSearch($event)"></ts-search>
        <ts-segmented *ngIf="!vendor && schema?.presets?.length" [items]="presets()" [selected]="list.query.preset ?? 'all'" (changed)="list.setPreset($event)"></ts-segmented>
      </div>
      <ts-paged-list [list]="list" emptyIcon="ti ti-compass" [grid]="true">
        <ng-template let-r>
          <button type="button" class="ts-list-card ts-list-card--col ts-rq-card" [style.--rq-edge]="vendor ? 'var(--ts-line)' : view(r).edge" (click)="open(r)">
            <span class="ts-wrap ts-wrap--between">
              <strong class="ts-card-title ts-grow">{{ r.destination }}</strong>
              <ts-pill *ngIf="!vendor" [tone]="view(r).tone">{{ view(r).label | translate }}</ts-pill>
              <ts-pill *ngIf="vendor && r.myOfferStatus != null" tone="info">{{ 'APP.offerSent' | translate }}</ts-pill>
            </span>
            <span class="ts-muted"><i class="ti ti-calendar-event"></i> {{ describe(r) }}</span>
            <span class="ts-wrap" *ngIf="hours(r) || (!vendor && (r.offersCount || r.viewsCount))">
              <ts-tag *ngIf="hours(r) as h" tone="danger" icon="ti ti-hourglass-high">{{ 'APP.rqHoursLeft' | translate: { n: num(h) } }}</ts-tag>
              <ng-container *ngIf="!vendor">
                <ts-tag *ngIf="chosen(r) as c; else offersTag" tone="ok" icon="ti ti-building-store">{{ c.vendorName }} · {{ c.price | ts }} {{ 'APP.egp' | translate }}</ts-tag>
                <ng-template #offersTag>
                  <ts-tag *ngIf="r.offersCount" tone="ok" icon="ti ti-discount">{{ 'APP.rqOffersFrom' | translate: { n: num(r.offersCount), price: num(lowest(r)) } }}</ts-tag>
                </ng-template>
                <ts-tag *ngIf="hasOdd(r)" tone="danger" icon="ti ti-alert-triangle">{{ 'APP.rqOddOffer' | translate }}</ts-tag>
                <ts-tag *ngIf="r.viewsCount" icon="ti ti-eye">{{ num(r.viewsCount) }}</ts-tag>
              </ng-container>
            </span>
            <span *ngIf="!vendor && r.customerName" class="ts-rq-customer"><i class="ti ti-user"></i> {{ r.customerName }}</span>
          </button>
        </ng-template>
      </ts-paged-list>
    </div>
    <ts-filter-drawer #drawer listKey="custom-requests" [title]="'APP.requestFilters' | translate" [list]="$any(list)"></ts-filter-drawer>
  `
})
export class CustomRequestsComponent implements OnInit, OnDestroy {
  private readonly api = inject(RequestsApi);
  private readonly filtersApi = inject(FiltersApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly text = inject(StaffText);
  @Input() vendor = false;
  @ViewChild('drawer') drawer!: FilterDrawerComponent;
  list!: PagedList<any>;
  summary: any = null;
  schema: FilterSchema | null = null;
  num = fmtNum;
  view = requestView;
  hours = hoursLeft;

  ngOnInit(): void {
    this.vendor = this.vendor || !!this.route.snapshot.data['vendor'];
    this.list = new PagedList<any>((q) => (this.vendor ? this.api.vendorList(q) : this.api.adminSearch(q)), {}, this.vendor ? undefined : 'custom-requests');
    if (!this.vendor) {
      this.api.analytics().pipe(catchError(() => of(null))).subscribe((s) => (this.summary = s));
      this.filtersApi.schema('custom-requests').subscribe({ next: (s) => (this.schema = s), error: () => {} });
    }
  }

  presets() {
    return (this.schema?.presets ?? []).map((p) => ({
      key: p.key,
      label: p.labelAr,
      count: p.key === (this.list.query.preset ?? 'all') ? this.list.total : null,
      alert: false
    }));
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

  lowest(r: any): number {
    return offerViews(r.offers, 0).find((o) => !o.odd)?.offer.price ?? 0;
  }

  hasOdd(r: any): boolean {
    return offerViews(r.offers, 0).some((o) => o.odd && o.offer.status === 1);
  }

  /** The offer the customer chose or booked (status 4 or 2). */
  chosen(r: any): any {
    return (r.offers ?? []).find((o: any) => o.status === 4 || o.status === 2) ?? null;
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

/**
 * a-custom-request (admin, from the list row with its offers) / v-request (vendor, loaded and with "send offer").
 * Where the request stands at the top, then the trip and the customer beside the offers (cheapest first, odd prices
 * flagged) and the vendors who saw it. Closing it as unavailable sits in its own red card.
 */
@Component({
  selector: 'ts-custom-request',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, OfferSheetComponent],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="('APP.customRequest' | translate) + ' #' + id">
        <button *ngIf="!vendor && r?.isAcceptingOffers" type="button" class="btn btn-primary btn-sm" (click)="editing = null; offerSheet.show(null, true)">
          <i class="ti ti-plus"></i>{{ 'APP.rqAddOffer' | translate }}
        </button>
      </ts-appbar>
      <ts-loading *ngIf="!r && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ng-container *ngIf="r">
        <!-- where it stands -->
        <section class="ts-section ts-rq-hero">
          <div class="ts-rq-hero__main">
            <div class="ts-wrap">
              <ts-pill [tone]="v().tone">{{ v().label | translate }}</ts-pill>
              <ts-tag tone="gold" icon="ti ti-map-2">{{ (r.tripType === 2 ? 'APP.rqOutsideEgypt' : 'APP.rqInsideEgypt') | translate }}</ts-tag>
              <ts-tag *ngIf="r.createdDate" icon="ti ti-calendar-plus">{{ 'APP.rqSubmittedAt' | translate }} {{ r.createdDate | ts: 'datetime' }}</ts-tag>
              <ts-tag *ngIf="!vendor && r.viewsCount" icon="ti ti-eye">{{ 'APP.rqVendorsSaw' | translate: { n: num(r.viewsCount) } }}</ts-tag>
            </div>
            <h2 class="ts-rq-hero__title">{{ r.destination }}</h2>
            <ol class="ts-rq-steps" [class.is-closed]="v().closed">
              <li *ngFor="let s of steps; let i = index" [class.is-done]="v().step > i + 1" [class.is-now]="v().step === i + 1">
                <span class="ts-rq-steps__dot"><i *ngIf="v().step > i + 1" class="ti ti-check"></i><ng-container *ngIf="v().step <= i + 1">{{ i + 1 }}</ng-container></span>
                <span class="ts-rq-steps__label">{{ s === 'APP.rqStepOffers' && offerCount() ? ('APP.rqStepOffersN' | translate: { n: num(offerCount()) }) : (s | translate) }}</span>
              </li>
            </ol>
          </div>
          <div class="ts-rq-window" *ngIf="!v().closed && r.offerWindowExpiresAt">
            <i class="ti" [class.ti-hourglass-high]="hours(r)" [class.ti-hourglass-empty]="!hours(r)"></i>
            <strong *ngIf="hours(r) as h">{{ 'APP.rqHoursLeft' | translate: { n: num(h) } }}</strong>
            <strong *ngIf="!hours(r)">{{ 'APP.rqWindowEnded' | translate }}</strong>
            <small>{{ r.offerWindowExpiresAt | ts: 'day' }}</small>
          </div>
        </section>

        <div class="ts-rq-cols">
          <!-- the trip and the customer -->
          <div class="ts-rq-stack">
            <ts-card [title]="'APP.rqTripDetails' | translate" [subtitle]="'APP.rqTripDetailsHint' | translate" icon="ti ti-route" iconColor="var(--ts-trip)" iconBg="var(--ts-trip-bg)">
              <div class="ts-rq-facts">
                <div class="ts-rq-fact"><i class="ti ti-calendar-event"></i><span><small>{{ 'APP.travelDate' | translate }}</small><strong>{{ r.travelDate | ts: 'day' }}</strong></span></div>
                <div class="ts-rq-fact"><i class="ti ti-clock"></i><span><small>{{ 'APP.duration' | translate }}</small><strong>{{ 'APP.daysN' | translate: { n: num(r.numberOfDays) } }}</strong></span></div>
                <div class="ts-rq-fact"><i class="ti ti-users"></i><span><small>{{ 'APP.travellers' | translate }}</small><strong>{{ travellers() }}</strong></span></div>
                <div class="ts-rq-fact" *ngIf="r.hotelName"><i class="ti ti-building"></i><span><small>{{ 'APP.hotel' | translate }}</small><strong>{{ r.hotelName }}</strong></span></div>
                <div class="ts-rq-fact"><i class="ti ti-plane"></i><span><small>{{ 'APP.flight' | translate }}</small><strong [class.ts-rq-no]="!r.needsFlight">{{ (r.needsFlight ? 'APP.rqNeeded' : 'APP.rqNotNeeded') | translate }}</strong></span></div>
                <div class="ts-rq-fact"><i class="ti ti-id"></i><span><small>{{ 'APP.visa' | translate }}</small><strong [class.ts-rq-no]="!r.needsVisa">{{ (r.needsVisa ? 'APP.rqNeeded' : 'APP.rqNotNeeded') | translate }}</strong></span></div>
                <div class="ts-rq-fact" *ngIf="r.nationalityNameAr || r.nationalityName"><i class="ti ti-flag"></i><span><small>{{ 'APP.nationality' | translate }}</small><strong>{{ r.nationalityNameAr || r.nationalityName }}</strong></span></div>
              </div>
              <ng-container *ngIf="r.childrenAges?.length">
                <p class="ts-rq-label">{{ 'APP.rqChildrenAges' | translate }}</p>
                <div class="ts-wrap"><span class="ts-rq-age ts-num" *ngFor="let a of r.childrenAges">{{ 'APP.rqAgeN' | translate: { n: a } }}</span></div>
              </ng-container>
              <ng-container *ngIf="r.additionalNotes">
                <p class="ts-rq-label">{{ 'APP.rqCustomerNotes' | translate }}</p>
                <div class="ts-rq-note">{{ r.additionalNotes }}</div>
              </ng-container>
            </ts-card>

            <ts-card *ngIf="!vendor && r.customerName" [title]="'APP.customer' | translate" [subtitle]="bookings != null ? ('APP.rqPastBookings' | translate: { n: num(bookings) }) : null" icon="ti ti-user">
              <div class="ts-person">
                <ts-avatar [name]="r.customerName" [size]="46"></ts-avatar>
                <div class="ts-grow">
                  <strong>{{ r.customerName }}</strong>
                  <p class="ts-muted ts-num" dir="ltr" style="margin: 0; text-align: end">{{ r.customerPhone }}</p>
                </div>
              </div>
              <div class="ts-wrap" style="margin-top: 12px">
                <a *ngIf="r.customerPhone" class="btn btn-secondary btn-sm" [href]="'tel:' + r.customerPhone"><i class="ti ti-phone"></i>{{ 'APP.call' | translate }}</a>
                <a *ngIf="wa(r.customerPhone) as n" class="btn btn-sm ts-btn-wa" [href]="'https://wa.me/' + n" target="_blank" rel="noopener"><i class="ti ti-brand-whatsapp"></i>WhatsApp</a>
                <a *ngIf="r.customerId" class="btn btn-link btn-sm" [routerLink]="['/a/more/customers', r.customerId]"><i class="ti ti-id-badge-2"></i>{{ 'APP.rqCustomerProfile' | translate }}</a>
              </div>
            </ts-card>

            <section *ngIf="!vendor && [1, 2, 3].includes(r.status)" class="ts-section ts-rq-danger">
              <div class="ts-section__head">
                <span class="ts-section__chip" style="background: var(--ts-danger-soft); color: var(--ts-danger-ink)"><i class="ti ti-ban"></i></span>
                <div class="ts-section__title"><h2>{{ 'APP.rqCloseTitle' | translate }}</h2><p>{{ 'APP.rqCloseHint' | translate }}</p></div>
              </div>
              <p class="ts-muted" style="margin: 0 0 12px; line-height: 1.7">{{ 'APP.markUnavailableQ' | translate }}</p>
              <button type="button" class="btn btn-outline-danger ts-wide-btn" [disabled]="closing" (click)="markUnavailable()"><i class="ti ti-ban"></i>{{ 'APP.rqMarkUnavailable' | translate }}</button>
            </section>
          </div>

          <!-- offers and vendors -->
          <div class="ts-rq-stack">
            <ts-card *ngIf="!vendor" [title]="('APP.vendorOffers' | translate) + ' (' + num(offerCount()) + ')'" [subtitle]="'APP.rqOffersHint' | translate" icon="ti ti-discount" iconColor="var(--ts-ok-fg)" iconBg="var(--ts-ok-bg)">
              <ts-empty *ngIf="!offerCount() && !r.isAcceptingOffers" icon="ti ti-hourglass" [message]="'APP.noOffersYet' | translate"></ts-empty>
              <div class="ts-rq-offers">
                <div *ngFor="let ov of offers()" class="ts-rq-offer" [class.is-best]="ov.best" [class.is-odd]="ov.odd">
                  <div class="ts-person">
                    <ts-avatar [name]="ov.offer.vendorName" [size]="42" bg="var(--ts-selected)" fg="var(--ts-navy)"></ts-avatar>
                    <div class="ts-grow">
                      <strong>{{ ov.offer.vendorName }}</strong>
                      <p class="ts-muted" style="margin: 0; font-size: 12.5px"><i class="ti ti-clock"></i> {{ ov.offer.createdDate | ts: 'datetime' }}</p>
                    </div>
                    <ts-pill [tone]="status(ov.offer.status).tone">{{ status(ov.offer.status).label | translate }}</ts-pill>
                  </div>
                  <div class="ts-wrap ts-wrap--between">
                    <span class="ts-rq-price ts-num">{{ ov.offer.price | ts }} <small>{{ 'APP.egp' | translate }}</small></span>
                    <ts-tag *ngIf="ov.best" tone="ok" icon="ti ti-trending-down">{{ 'APP.rqLowestPrice' | translate }}</ts-tag>
                    <ts-tag *ngIf="ov.overBest" ><span dir="ltr">+{{ ov.overBest | ts }}</span> {{ 'APP.rqOverLowest' | translate }}</ts-tag>
                    <ts-tag *ngIf="ov.odd" tone="danger" icon="ti ti-alert-triangle">{{ 'APP.rqOddPrice' | translate }}</ts-tag>
                  </div>
                  <div class="ts-wrap">
                    <ts-tag tone="info" icon="ti ti-credit-card">{{ (ov.offer.paymentType === 1 ? 'APP.deposit' : 'APP.fullPayment') | translate }}<ng-container *ngIf="ov.offer.paymentType === 1 && ov.offer.depositAmount"> · {{ ov.offer.depositAmount | ts }}</ng-container></ts-tag>
                    <ts-tag *ngIf="ov.perPerson">{{ 'APP.rqPerPerson' | translate: { n: num(ov.perPerson) } }}</ts-tag>
                  </div>
                  <div *ngIf="ov.odd" class="ts-note ts-note--danger" style="margin: 0"><i class="ti ti-info-circle"></i>{{ 'APP.rqOddPriceHint' | translate }}</div>
                  <div class="ts-rq-note" [class.is-empty]="!ov.offer.vendorNotes">{{ ov.offer.vendorNotes || ('APP.rqNoVendorNotes' | translate) }}</div>
                  <div class="ts-wrap">
                    <!-- VendorTripOfferStatus 1 = pending: the only state the backend lets an admin edit -->
                    <button *ngIf="ov.offer.status === 1" type="button" class="btn btn-secondary btn-sm" (click)="editing = ov.offer; offerSheet.show(ov.offer)"><i class="ti ti-edit"></i>{{ 'APP.editOffer' | translate }}</button>
                    <a *ngIf="vendorWa(ov.offer.vendorId) as n" class="btn btn-link btn-sm" [href]="'https://wa.me/' + n" target="_blank" rel="noopener"><i class="ti ti-brand-whatsapp"></i>{{ 'APP.rqContactVendor' | translate }}</a>
                  </div>
                </div>
                <button *ngIf="r.isAcceptingOffers" type="button" class="ts-rq-offer ts-rq-offer--add" (click)="editing = null; offerSheet.show(null, true)">
                  <i class="ti ti-plus"></i>
                  <strong>{{ 'APP.rqAddOffer' | translate }}</strong>
                  <small>{{ 'APP.rqAddOfferHint' | translate }}</small>
                </button>
              </div>
            </ts-card>

            <ts-card *ngIf="!vendor && viewers.length" [title]="'APP.whoViewed' | translate" [subtitle]="'APP.rqOfferedOfViewed' | translate: { a: num(offeredCount()), b: num(viewers.length) }" icon="ti ti-eye">
              <div class="ts-rq-progress"><i [style.width.%]="(offeredCount() / viewers.length) * 100"></i></div>
              <div class="ts-rq-viewer" *ngFor="let w of viewers">
                <ts-avatar [name]="w.vendorName" [size]="32" bg="var(--ts-selected)" fg="var(--ts-navy)"></ts-avatar>
                <span class="ts-grow">{{ w.vendorName }}</span>
                <ts-pill [tone]="w.hasSubmittedOffer ? 'ok' : 'cancelled'">{{ w.hasSubmittedOffer ? ('APP.offerSent' | translate) : ('APP.rqOnlySaw' | translate) + ' · ' + (w.viewedDate | ts: 'short') }}</ts-pill>
              </div>
            </ts-card>

            <ng-container *ngIf="vendor">
              <ts-card *ngIf="r.myOfferStatus != null" [title]="'APP.yourOffer' | translate" icon="ti ti-discount" iconColor="var(--ts-ok-fg)" iconBg="var(--ts-ok-bg)">
                <div class="ts-wrap ts-wrap--between">
                  <span class="ts-rq-price ts-num">{{ r.myOfferPrice | ts }} <small>{{ 'APP.egp' | translate }}</small></span>
                  <ts-pill [tone]="status(r.myOfferStatus).tone">{{ status(r.myOfferStatus).label | translate }}</ts-pill>
                </div>
              </ts-card>
              <button *ngIf="r.myOfferStatus == null && r.isAcceptingOffers" type="button" class="btn btn-primary ts-wide-btn" (click)="editing = null; offerSheet.show()">
                <i class="ti ti-send"></i>{{ 'APP.sendOffer' | translate }}
              </button>
              <ts-tag *ngIf="r.myOfferStatus == null && !r.isAcceptingOffers" tone="cancelled">{{ 'APP.offersClosed' | translate }}</ts-tag>
            </ng-container>
          </div>
        </div>
      </ng-container>
    </div>
    <ts-offer-sheet #offerSheet (done)="saveOffer($event)"></ts-offer-sheet>
  `
})
export class CustomRequestComponent implements OnInit {
  private readonly api = inject(RequestsApi);
  private readonly http = inject(StaffHttp);
  private readonly comms = inject(VendorCommsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  @ViewChild('offerSheet') offerSheet!: OfferSheetComponent;
  num = fmtNum;
  hours = hoursLeft;
  status = offerStatus;
  wa = whatsAppNumber;
  steps = ['APP.rqStepSubmitted', 'APP.rqStepOffers', 'APP.rqStepChoosing', 'APP.rqStepBooked'];
  id = 0;
  vendor = false;
  r: any = null;
  viewers: any[] = [];
  bookings: number | null = null;
  private vendorPhones = new Map<number, string>();
  error: unknown = null;
  closing = false;
  editing: any = null;

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.vendor = !!this.route.snapshot.data['vendor'];
    const row = history.state?.row;
    if (!this.vendor && row?.id === this.id) {
      this.r = row;
      this.loadExtras();
    } else this.load();
  }

  load(): void {
    this.error = null;
    this.r = null;
    (this.vendor ? this.api.vendorRequest(this.id) : this.api.adminRow(this.id)).subscribe({
      next: (r) => {
        this.r = r;
        if (!this.vendor) this.loadExtras();
      },
      error: (e) => (this.error = e)
    });
  }

  /** Who viewed it, the customer's past bookings and the vendors' phones (for "contact the vendor"); each is optional. */
  private loadExtras(): void {
    this.api.viewers(this.id).pipe(catchError(() => of([]))).subscribe((v) => (this.viewers = v));
    if (this.r?.customerId)
      this.http
        .post<any[]>('/api/staff/customers/booking-counts', { userIds: [this.r.customerId] })
        .pipe(catchError(() => of([])))
        .subscribe((d) => (this.bookings = d?.[0]?.total ?? null));
    if (this.r?.offers?.length)
      this.comms
        .vendors()
        .pipe(catchError(() => of([])))
        .subscribe((rows) => (this.vendorPhones = new Map(rows.filter((x) => x.vendorPhone).map((x) => [x.companyId, x.vendorPhone!]))));
  }

  v(): RequestView {
    return requestView(this.r);
  }

  offerCount(): number {
    return this.r?.offers?.length ?? this.r?.offersCount ?? 0;
  }

  offers(): OfferView[] {
    return offerViews(this.r?.offers, (this.r?.numberOfAdults ?? 0) + (this.r?.numberOfChildren ?? 0));
  }

  offeredCount(): number {
    return this.viewers.filter((w) => w.hasSubmittedOffer).length;
  }

  vendorWa(vendorId: number): string | null {
    return whatsAppNumber(this.vendorPhones.get(vendorId));
  }

  travellers(): string {
    const r = this.r;
    const adults = this.text.tr('APP.adultsCount', { n: fmtNum(r.numberOfAdults ?? 0) });
    return (r.numberOfChildren ?? 0) > 0 ? `${adults} · ${this.text.tr('APP.childsCount', { n: fmtNum(r.numberOfChildren) })}` : adults;
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
