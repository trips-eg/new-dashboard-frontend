import { Component, Input, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin, map } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { FilterDrawerComponent, LISTS } from '../ui/lists';
import { StaffDialogs } from '../ui/dialogs';
import { FilterSchema, FiltersApi, PagedList } from '../core/query';
import { ITEM_TYPES, ItemTypeInfo, Lifecycle, itemType, itemTypeByKey } from '../core/enums';
import { P, StaffSession } from '../core/session';
import { mediaUrl } from '../core/staff-http';
import { fmtNum } from '../core/format';
import { ProductRow, ProductsApi, rowPrice, rowSold } from './products-api';

/** a-services: the entry to the four modules with their counts, the approvals and the expiring products. */
@Component({
  selector: 'ts-services',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.tabProducts' | translate" [back]="false"></ts-appbar>
      <ts-loading *ngIf="loading"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ng-container *ngIf="!loading && !error">
        <a *ngIf="pending > 0" class="ts-list-card" routerLink="/a/products/approvals">
          <ts-icon-tile icon="ti ti-checklist" color="var(--ts-teal)" bg="var(--ts-outing-bg)" [size]="52"></ts-icon-tile>
          <div class="ts-card-row__main">
            <p class="ts-card-title">{{ 'APP.productsToReview' | translate }}</p>
            <p class="ts-muted">{{ 'APP.addedByVendors' | translate }}</p>
          </div>
          <strong class="ts-entry-count" style="color: var(--ts-teal)">{{ pending | ts }}</strong>
          <i class="ti ti-chevron-left ts-chev"></i>
        </a>
        <ng-container *ngFor="let t of modules">
          <a *ngIf="of(t.value) as s" class="ts-list-card" [routerLink]="['/a/products', t.listKey]">
            <ts-icon-tile [icon]="t.icon" [color]="t.color" [bg]="t.bg" [size]="52"></ts-icon-tile>
            <div class="ts-card-row__main">
              <p class="ts-card-title">{{ t.plural | translate }}</p>
              <p class="ts-muted">{{ 'APP.activeOf' | translate: { n: num(s.active) } }}</p>
            </div>
            <span *ngIf="s.expiringIn7Days > 0" class="ts-entry-count-box">
              <strong [style.color]="t.color">{{ s.expiringIn7Days | ts }}</strong>
              <small>{{ 'APP.lifeIn7' | translate }}</small>
            </span>
            <i class="ti ti-chevron-left ts-chev"></i>
          </a>
        </ng-container>
        <a *ngIf="canHotels" class="ts-list-card" routerLink="/a/products/hotels">
          <ts-icon-tile icon="ti ti-bed" color="var(--ts-hotel)" bg="var(--ts-hotel-bg)" [size]="52"></ts-icon-tile>
          <div class="ts-card-row__main">
            <p class="ts-card-title">{{ 'APP.hotels' | translate }}</p>
            <p class="ts-muted">{{ 'APP.hotelsHint' | translate }}</p>
          </div>
          <i class="ti ti-chevron-left ts-chev"></i>
        </a>
        <a *ngIf="expired > 0" class="ts-list-card" routerLink="/a/products/expiring" [queryParams]="{ type: 1, window: 'expired' }">
          <ts-icon-tile icon="ti ti-clock-off" color="var(--ts-danger-ink)" bg="var(--ts-danger-soft)" [size]="52"></ts-icon-tile>
          <div class="ts-card-row__main">
            <p class="ts-card-title">{{ 'APP.expiredStillVisible' | translate }}</p>
            <p class="ts-muted">{{ 'APP.expiredHint' | translate }}</p>
          </div>
          <strong class="ts-entry-count" style="color: var(--ts-danger-ink)">{{ expired | ts }}</strong>
          <i class="ti ti-chevron-left ts-chev"></i>
        </a>
      </ng-container>
    </div>
  `
})
export class ServicesComponent implements OnInit {
  private readonly api = inject(ProductsApi);
  private readonly session = inject(StaffSession);
  rows: any[] = [];
  pending = 0;
  loading = true;
  error: unknown = null;
  num = fmtNum;
  readonly modules = [1, 2, 4].map((v) => itemType(v));

  get canHotels(): boolean {
    return this.session.can(P.hotelView);
  }

  get expired(): number {
    return this.rows.reduce((a, r) => a + (r.expiredButVisible ?? 0), 0);
  }

  of(type: number): any {
    return this.rows.find((r) => r.itemType === type) ?? null;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.expirySummary().subscribe({
      next: (r) => {
        this.rows = r;
        this.loading = false;
      },
      error: (e) => {
        this.error = e;
        this.loading = false;
      }
    });
    this.api.approvals().subscribe({ next: (p) => (this.pending = p.itemsCount), error: () => (this.pending = 0) });
  }
}

/** _ProductCard: one product in a module list. */
@Component({
  selector: 'ts-product-card',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT],
  template: `
    <button type="button" class="ts-list-card" (click)="open()">
      <span class="ts-thumb" [style.background]="type.bg">
        <img *ngIf="img && !broken" [src]="img" alt="" (error)="broken = true" />
        <i *ngIf="!img || broken" [class]="type.icon" [style.color]="type.color" class="ts-thumb__icon"></i>
      </span>
      <span class="ts-card-row__main">
        <span class="ts-card-title ts-clamp2">{{ p.name }}</span>
        <span class="ts-muted" *ngIf="p.vendorName">{{ p.vendorName }}</span>
        <span class="ts-wrap" style="margin-top: 6px">
          <ng-container *ngIf="review; else life">
            <ts-pill [tone]="p.status === 'rejected' ? 'danger' : 'pending'">{{ (p.status === 'rejected' ? 'APP.rejected' : 'APP.pendingReview') | translate }}</ts-pill>
          </ng-container>
          <ng-template #life>
            <ts-pill [tone]="lifeTone">{{ lifeLabel | translate }}</ts-pill>
            <ts-pill [tone]="p.isActive ? 'ok' : 'cancelled'">{{ (p.isActive ? 'APP.active' : 'APP.inactive') | translate }}</ts-pill>
          </ng-template>
          <ts-pill *ngIf="p.isBlocked" tone="danger">{{ 'APP.blocked' | translate }}</ts-pill>
        </span>
      </span>
      <span class="ts-end-col">
        <strong *ngIf="price != null" class="ts-num">{{ price | ts }}</strong>
        <small *ngIf="sold != null" class="ts-muted">
          {{ p.capacity == null ? ('APP.soldN' | translate: { n: num(sold) }) : num(sold) + ' / ' + num(p.capacity) }}
        </small>
      </span>
    </button>
  `
})
export class ProductCardComponent {
  private readonly router = inject(Router);
  @Input({ required: true }) p!: ProductRow;
  @Input({ required: true }) listKey!: string;
  @Input() vendor = false;
  broken = false;
  num = fmtNum;

  get type(): ItemTypeInfo {
    return itemTypeByKey(this.listKey) ?? ITEM_TYPES[0];
  }

  get img(): string | null {
    return mediaUrl(this.p.imageUrl);
  }

  get review(): boolean {
    return this.p.status === 'pendingReview' || this.p.status === 'rejected';
  }

  get price(): number | null {
    return rowPrice(this.p);
  }

  get sold(): number | null {
    return rowSold(this.p);
  }

  get lifeTone() {
    return Lifecycle.tone(this.p.lifecycle);
  }

  get lifeLabel(): string {
    return Lifecycle.label(this.p.lifecycle);
  }

  open(): void {
    this.router.navigate([this.vendor ? '/v/products' : '/a/products', this.listKey, this.p.id]);
  }
}

/** a-trips / a-outings / a-manasik (and the tabs of v-products): the schema-driven list of one module. */
@Component({
  selector: 'ts-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...LISTS, ProductCardComponent],
  template: `
    <div class="ts-screen" [class.ts-embedded]="embedded">
      <ts-appbar *ngIf="!embedded" [title]="type.plural | translate" [subtitle]="'APP.productsCount' | translate: { n: num(list.total) }">
        <a class="ts-icon-btn" routerLink="/a/products/expiring" [queryParams]="{ type: type.value, window: 'in7Days' }" [title]="'APP.expiring' | translate">
          <i class="ti ti-clock"></i>
        </a>
        <a *ngIf="canCreate" class="ts-fab ts-fab--float" [routerLink]="formPath"><i class="ti ti-plus"></i>{{ newLabel | translate }}</a>
      </ts-appbar>
      <div class="ts-listbar">
        <div class="ts-spread">
          <ts-search class="ts-grow" [hint]="schema?.searchPlaceholderAr || ('APP.search' | translate)" (changed)="list.setSearch($event)"></ts-search>
          <button type="button" class="ts-icon-btn" style="position: relative" (click)="drawer.show()" [attr.aria-label]="'APP.productFilters' | translate">
            <i class="ti ti-adjustments-horizontal"></i>
            <span class="ts-icon-btn__badge" *ngIf="list.activeFilters">{{ list.activeFilters }}</span>
          </button>
          <a *ngIf="embedded && canCreate" class="ts-fab" [routerLink]="formPath"><i class="ti ti-plus"></i>{{ newLabel | translate }}</a>
        </div>
        <ts-segmented *ngIf="schema?.presets?.length" [items]="presets()" [selected]="list.query.preset ?? 'all'" (changed)="list.setPreset($event)"></ts-segmented>
      </div>
      <ts-paged-list [list]="list" [emptyMessage]="'APP.noProducts' | translate" [grid]="true">
        <ng-template let-p><ts-product-card [p]="p" [listKey]="listKey" [vendor]="vendor"></ts-product-card></ng-template>
      </ts-paged-list>
    </div>
    <ts-filter-drawer #drawer [listKey]="listKey" [title]="'APP.productFilters' | translate" [list]="$any(list)"></ts-filter-drawer>
  `
})
export class ProductListComponent implements OnInit, OnDestroy {
  private readonly api = inject(ProductsApi);
  private readonly filtersApi = inject(FiltersApi);
  private readonly session = inject(StaffSession);
  private readonly route = inject(ActivatedRoute);
  @Input() listKey = '';
  @Input() embedded = false;
  @Input() vendor = false;
  @ViewChild('drawer') drawer!: FilterDrawerComponent;
  list!: PagedList<ProductRow>;
  schema: FilterSchema | null = null;
  num = fmtNum;

  get type(): ItemTypeInfo {
    return itemTypeByKey(this.listKey) ?? ITEM_TYPES[0];
  }

  get canCreate(): boolean {
    const perm = this.type.value === 1 ? P.travelCreate : this.type.value === 2 ? P.outingsCreate : P.hajjCreate;
    return this.session.can(perm) && this.type.value !== 3;
  }

  get formPath(): string {
    return this.type.value === 4 ? '/form/hajj' : this.type.value === 2 ? '/form/outing' : '/form/trip';
  }

  get newLabel(): string {
    return this.type.value === 1 ? 'APP.newTrip' : this.type.value === 2 ? 'APP.newOuting' : 'APP.newPackage';
  }

  ngOnInit(): void {
    this.listKey = this.listKey || this.route.snapshot.params['type'];
    this.list = new PagedList<ProductRow>((q) => this.api.list(this.listKey, q), { preset: 'all' }, this.listKey);
    this.filtersApi.schema(this.listKey).subscribe({ next: (s) => (this.schema = s), error: () => {} });
  }

  ngOnDestroy(): void {
    this.list?.destroy();
  }

  presets() {
    return (this.schema?.presets ?? []).map((p) => ({ key: p.key, label: p.labelAr, count: p.key === (this.list.query.preset ?? 'all') ? this.list.total : null }));
  }
}

/** Vendor products waiting for review (a-trip-review list). */
@Component({
  selector: 'ts-approvals',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...LISTS],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.productsToReview' | translate" [subtitle]="'APP.addedByVendors' | translate"></ts-appbar>
      <ts-paged-list [list]="list" [emptyMessage]="'APP.nothingToReview' | translate" emptyIcon="ti ti-checklist">
        <ng-template let-r>
          <a class="ts-list-card" [routerLink]="['/a/products', type(r).listKey, r.itemId]" [queryParams]="{ review: 1 }">
            <ts-icon-tile [icon]="type(r).icon" [color]="type(r).color" [bg]="type(r).bg"></ts-icon-tile>
            <div class="ts-card-row__main">
              <p class="ts-card-title">{{ r.name || '#' + r.itemId }}</p>
              <p class="ts-muted">{{ r.vendorName || '' }} · {{ r.submittedAt | ts: 'date' }}</p>
            </div>
            <ts-pill tone="pending">{{ 'APP.pendingReview' | translate }}</ts-pill>
          </a>
        </ng-template>
      </ts-paged-list>
    </div>
  `
})
export class ApprovalsComponent implements OnDestroy {
  private readonly api = inject(ProductsApi);
  readonly list = new PagedList<any>(() => this.api.approvals().pipe(map((page) => ({ page }))));
  type = (r: any) => itemType(r.itemType);
  ngOnDestroy(): void {
    this.list.destroy();
  }
}

/** a-expiring: products past or near their last date, with "hide them all". */
@Component({
  selector: 'ts-expiring',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...LISTS],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.expiring' | translate">
        <button type="button" class="btn btn-outline-danger" (click)="hideAll()">{{ 'APP.hideAll' | translate }}</button>
      </ts-appbar>
      <div class="ts-listbar">
        <ts-chipbar [items]="typeChips" [selected]="[String(type)]" (tap)="type = +$event; list.refresh()"></ts-chipbar>
        <ts-chipbar [items]="windowChips" [selected]="[window]" (tap)="window = $event; list.refresh()"></ts-chipbar>
      </div>
      <ts-paged-list [list]="list" [emptyMessage]="'APP.nothingExpiring' | translate">
        <ng-template let-r>
          <a class="ts-list-card" [routerLink]="['/a/products', typeKey, r.itemId]">
            <div class="ts-card-row__main">
              <p class="ts-card-title">{{ r.name }}</p>
              <p class="ts-muted">{{ r.vendorName || '' }} · {{ 'APP.lastDate' | translate }}: {{ r.lastDate | ts: 'short' }}</p>
            </div>
            <ts-tag *ngIf="r.upcomingBookings > 0" tone="pending">{{ 'APP.bookingsN' | translate: { n: num(r.upcomingBookings) } }}</ts-tag>
            <ts-pill [tone]="r.isVisible ? 'danger' : 'cancelled'">{{ (r.isVisible ? 'APP.visible' : 'APP.hidden') | translate }}</ts-pill>
          </a>
        </ng-template>
      </ts-paged-list>
    </div>
  `
})
export class ExpiringComponent implements OnDestroy {
  private readonly api = inject(ProductsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  readonly String = String;
  num = fmtNum;
  type = +(this.route.snapshot.queryParams['type'] ?? 1);
  window: string = this.route.snapshot.queryParams['window'] ?? 'expired';
  readonly list = new PagedList<any>((q) => this.api.expiring(this.type, this.window, q.pageIndex).pipe(map((page) => ({ page }))));
  readonly typeChips = [1, 2, 4].map((v) => {
    const t = itemType(v);
    return { key: String(v), label: this.text.tr(t.plural), dot: t.color };
  });
  readonly windowChips = [
    { key: 'expired', label: this.text.tr('APP.lifeExpired') },
    { key: 'in7Days', label: this.text.tr('APP.lifeIn7') },
    { key: 'in30Days', label: this.text.tr('APP.lifeIn30') }
  ];

  get typeKey(): string {
    return itemType(this.type).listKey;
  }

  ngOnDestroy(): void {
    this.list.destroy();
  }

  async hideAll(): Promise<void> {
    const ids = this.list.items.filter((r) => r.isActive).map((r) => r.itemId);
    if (!ids.length) return;
    const ok = await this.dialogs.confirm({
      title: this.text.tr('APP.hideAll'),
      message: this.text.tr('APP.hideAllQ', { n: fmtNum(ids.length) }),
      confirm: this.text.tr('APP.hideAll'),
      danger: true
    });
    if (!ok) return;
    this.api.bulkDeactivate(this.type, ids).subscribe({
      next: (r) => {
        this.text.showDone(this.text.tr('APP.hiddenCount', { n: fmtNum((r?.deactivated ?? []).length) }));
        this.list.refresh();
      },
      error: (e) => this.text.showError(e)
    });
  }
}

/** a-hotels: the existing hotels endpoint (GetAllHotelsWeb). */
@Component({
  selector: 'ts-hotels',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...LISTS],
  template: `
    <div class="ts-screen ts-screen--narrow" [class.ts-embedded]="embedded">
      <ts-appbar *ngIf="!embedded" [title]="'APP.hotels' | translate"></ts-appbar>
      <ts-search [hint]="'APP.search' | translate" (changed)="list.setSearch($event)"></ts-search>
      <ts-paged-list [list]="list">
        <ng-template let-h>
          <a class="ts-list-card" [routerLink]="embedded ? ['/hotel', h.id] : ['/a/products/hotels', h.id]">
            <ts-icon-tile icon="ti ti-building" color="var(--ts-hotel)" bg="var(--ts-hotel-bg)"></ts-icon-tile>
            <div class="ts-card-row__main">
              <p class="ts-card-title">{{ h.name }}</p>
              <p class="ts-muted">{{ place(h) }}</p>
            </div>
            <strong *ngIf="h.minmumRoomPrice != null" class="ts-num">{{ h.minmumRoomPrice | ts }}</strong>
          </a>
        </ng-template>
      </ts-paged-list>
    </div>
  `
})
export class HotelsComponent implements OnDestroy {
  private readonly api = inject(ProductsApi);
  @Input() embedded = false;
  readonly list = new PagedList<any>((q) => this.api.hotels(q.search, q.pageIndex).pipe(map((page) => ({ page }))));
  place = (h: any) => [h.cityName, h.countryName].filter((x) => !!x).join(' · ');
  ngOnDestroy(): void {
    this.list.destroy();
  }
}

/**
 * The hotel and its room types. A vendor adds and edits room types (a-room-form); the backend saves rooms under the
 * vendor's company only, so an admin sees them read-only.
 */
@Component({
  selector: 'ts-hotel-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="h?.name || ('APP.hotel' | translate)">
        <a *ngIf="canAdd && h" class="ts-fab" routerLink="/form/room" [queryParams]="{ hotelId: id, hotel: h.name }"><i class="ti ti-plus"></i>{{ 'APP.addRoomType' | translate }}</a>
      </ts-appbar>
      <ts-loading *ngIf="!h && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error"></ts-error>
      <ng-container *ngIf="h">
        <ts-card>
          <h2 class="ts-card-title" style="font-size: 20px">{{ h.name }}</h2>
          <p class="ts-muted" *ngIf="h.address">{{ h.address }}</p>
          <ts-info [label]="'APP.place' | translate" [value]="place" [numeric]="false"></ts-info>
          <ts-info *ngIf="h.phone" [label]="'APP.phone' | translate" [value]="h.phone"></ts-info>
          <ts-info [label]="'APP.status' | translate" [value]="((h.status ?? true) ? 'APP.published' : 'APP.hidden') | translate" [numeric]="false"></ts-info>
        </ts-card>
        <ts-card [title]="'APP.rooms' | translate" [subtitle]="vendor ? null : ('APP.roomsVendorOnly' | translate)">
          <ng-container *ngFor="let r of h.rooms ?? []">
            <a *ngIf="canEdit; else plain" class="ts-row" routerLink="/form/room" [queryParams]="{ hotelId: id, hotel: h.name, id: r.id }">
              <span class="ts-row__label"><strong style="color: var(--ts-ink)">{{ r.name || r.roomName }}</strong><br /><small>{{ r.roomType }}</small></span>
              <span class="ts-row__value" *ngIf="r.price != null">{{ r.price | ts }} {{ 'APP.egp' | translate }}</span>
            </a>
            <ng-template #plain>
              <div class="ts-row">
                <span class="ts-row__label"><strong style="color: var(--ts-ink)">{{ r.name || r.roomName }}</strong><br /><small>{{ r.roomType }}</small></span>
                <span class="ts-row__value" *ngIf="r.price != null">{{ r.price | ts }} {{ 'APP.egp' | translate }}</span>
              </div>
            </ng-template>
          </ng-container>
        </ts-card>
      </ng-container>
    </div>
  `
})
export class HotelDetailsComponent implements OnInit {
  private readonly api = inject(ProductsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(StaffSession);
  id = 0;
  h: any = null;
  error: unknown = null;

  get vendor(): boolean {
    return this.session.isVendor;
  }

  get canAdd(): boolean {
    return this.vendor && this.session.can(P.roomsCreate);
  }

  get canEdit(): boolean {
    return this.vendor && this.session.can(P.roomsEdit);
  }

  get place(): string {
    return [this.h?.cityName, this.h?.countryName].filter((x) => !!x).join(' · ');
  }

  ngOnInit(): void {
    this.id = +this.route.snapshot.params['id'];
    this.api.hotel(this.id).subscribe({ next: (h) => (this.h = h), error: (e) => (this.error = e) });
  }
}

/** v-products: tabs for the modules the vendor sells (from the sign-in answer), each one the schema list. */
@Component({
  selector: 'ts-vendor-products',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ProductListComponent, HotelsComponent],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'APP.tabMyProducts' | translate" [back]="false"></ts-appbar>
      <div class="ts-segmented" role="tablist">
        <button type="button" role="tab" *ngFor="let t of types" [class.is-selected]="t.value === tab" (click)="tab = t.value">
          {{ (t.value === 3 ? 'APP.hotels' : t.plural) | translate }}
        </button>
      </div>
      <ng-container *ngFor="let t of types">
        <ts-hotels *ngIf="tab === t.value && t.value === 3" [embedded]="true"></ts-hotels>
        <ts-product-list *ngIf="tab === t.value && t.value !== 3" [listKey]="t.listKey" [embedded]="true" [vendor]="true"></ts-product-list>
      </ng-container>
    </div>
  `
})
export class VendorProductsComponent {
  private readonly session = inject(StaffSession);
  readonly types: ItemTypeInfo[] = (() => {
    const s = this.session;
    const list = [
      ...(s.travel ? [itemType(1)] : []),
      ...(s.outings ? [itemType(2)] : []),
      ...(s.hajj ? [itemType(4)] : []),
      // Hotels: the vendor picks a hotel and adds their room types to it
      ...(s.hotels && s.can(P.hotelView) ? [itemType(3)] : [])
    ];
    return list.length ? list : [itemType(1), itemType(2), itemType(4)];
  })();
  tab = this.types[0].value;
}
