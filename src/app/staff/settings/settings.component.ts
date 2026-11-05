import { PasswordSheetComponent } from './account-sheets';
import { Component, Injectable, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { ChipBarComponent, LISTS } from '../ui/lists';
import { SwitchRowComponent } from '../ui/controls';
import { SheetComponent, StaffDialogs } from '../ui/dialogs';
import { ApiError, StaffHttp, mediaUrl } from '../core/staff-http';
import { ApiPage, ListResult, PagedList, asPage } from '../core/query';
import { P, StaffSession } from '../core/session';
import { fmtNum, parseAmount } from '../core/format';
import { FORM_KIT, Picked, intOf, toForm } from '../forms/form-kit';

/** Some existing endpoints wrap the answer in ApiResponse and some don't (Users, Roles); this reads both. */
function bodyOf(d: any, path: string): any {
  if (d && typeof d === 'object' && 'success' in d) {
    if (d.success === false) throw new ApiError(200, d.errorCode ?? null, d.message ?? null, d);
    return d.data;
  }
  return d;
}

/**
 * The existing admin endpoints behind the settings screens (Financial, Settings, CustomTripSetting, Coupons/Settings,
 * lookups, Policy, VendorContract, Users, Role, Permissions, TripStar, SideBars, Pricing, Coupons).
 */
@Injectable({ providedIn: 'root' })
export class SettingsApi {
  private readonly http = inject(StaffHttp);

  get(path: string, q?: Record<string, unknown>): Observable<any> {
    return this.http.raw<any>('GET', path, undefined, q as any).pipe(map((d) => bodyOf(d, path)));
  }

  post(path: string, body: unknown): Observable<any> {
    return this.http.raw<any>('POST', path, body).pipe(map((d) => bodyOf(d, path)));
  }

  /** Any write: JSON or FormData (sent with en-US so decimals bind); a 200 with success: false is an error. */
  send(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', path: string, data?: unknown, query?: Record<string, unknown>): Observable<any> {
    return this.http.raw<any>(method, path, data, query as any, true).pipe(map((d) => bodyOf(d, path)));
  }

  /** Key/value settings ({ id, nameAr, nameEn, value, stringValue? }), saved back as [{ id, value }]. */
  settings(path: string): Observable<any[]> {
    return this.get(path).pipe(map((d) => (Array.isArray(d) ? d : [])));
  }

  /** A page of an existing list endpoint (POST spec params, or GET with them in the query); a bare array is one page. */
  pageOf(path: string, o: { body?: Record<string, unknown>; get?: boolean; page?: number } = {}): Observable<ApiPage<any>> {
    const params = { pageIndex: o.page ?? 1, pageSize: 50, ...(o.body ?? {}) };
    return (o.get ? this.get(path, params) : this.post(path, params)).pipe(
      map((d) =>
        Array.isArray(d)
          ? { pageIndex: 1, pageSize: d.length, count: d.length, itemsCount: d.length, pagesCount: 1, hasNextPage: false, data: d }
          : asPage<any>(d)
      )
    );
  }

  list(path: string, o: { body?: Record<string, unknown>; get?: boolean; page?: number } = {}): Observable<ListResult<any>> {
    return this.pageOf(path, o).pipe(map((page) => ({ page })));
  }
}

// ---------------------------------------------------------------- key / value settings

interface KvSection {
  title: string;
  get: string;
  post: string;
}

const KV_SCREENS: Record<string, { title: string; sections: KvSection[] }> = {
  finance: {
    title: 'APP.financeSettings',
    sections: [
      { title: 'APP.financeSettings', get: '/api/Financial/GetAllFinancialSetting', post: '/api/Financial/UpdateFinancialSetting' },
      { title: 'APP.appSettings', get: '/api/Settings/UserSettings', post: '/api/Settings/UserSettings' }
    ]
  },
  autoCoupons: {
    title: 'APP.autoCoupons',
    sections: [
      { title: 'APP.weekendCoupon', get: '/api/Coupons/Settings/Weekend', post: '/api/Coupons/Settings/Weekend' },
      { title: 'APP.birthdayCoupon', get: '/api/Coupons/Settings/Birthday', post: '/api/Coupons/Settings/Birthday' },
      { title: 'APP.recoveryCoupon', get: '/api/Coupons/Settings/Recovery', post: '/api/Coupons/Settings/Recovery' }
    ]
  },
  customTrips: {
    title: 'APP.customTripSettings',
    sections: [{ title: 'APP.customTripSettings', get: '/api/CustomTripSetting/GetCustomTripSettings', post: '/api/CustomTripSetting/UpdateCustomTripSettings' }]
  }
};

/** a-finance-settings, a-custom-settings, a-coupon-settings: a list of named numbers saved together. */
@Component({
  selector: 'ts-kv-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ...FORM_KIT],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="screen.title | translate"></ts-appbar>
      <ts-loading *ngIf="!data && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ng-container *ngIf="data">
        <ts-card *ngFor="let s of screen.sections; let i = index" [title]="s.title | translate" icon="ti ti-adjustments">
          <p class="ts-muted" *ngIf="!data[i].length">{{ 'APP.nothingHereYet' | translate }}</p>
          <ts-field
            *ngFor="let x of data[i]"
            [label]="label(x)"
            [number]="true"
            [readonly]="!canEdit"
            [value]="edits[s.post]?.[x.id] ?? num(x.value)"
            (valueChange)="edit(s.post, x.id, $event)"
          ></ts-field>
        </ts-card>
        <div class="ts-sticky-foot" *ngIf="canEdit">
          <button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy" (click)="save()"><i *ngIf="busy" class="pi pi-spin pi-spinner"></i>{{ 'APP.save' | translate }}</button>
        </div>
      </ng-container>
    </div>
  `
})
export class KeyValueSettingsComponent implements OnInit {
  private readonly api = inject(SettingsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  num = fmtNum;
  screen = KV_SCREENS['finance'];
  data: any[][] | null = null;
  error: unknown = null;
  edits: Record<string, Record<number, string>> = {};
  busy = false;

  get canEdit(): boolean {
    return this.session.can(P.financialEdit) || this.session.can(P.couponsCreate);
  }

  ngOnInit(): void {
    this.screen = KV_SCREENS[this.route.snapshot.data['kv']] ?? KV_SCREENS['finance'];
    this.load();
  }

  async load(): Promise<void> {
    this.error = null;
    this.data = null;
    try {
      this.data = await Promise.all(this.screen.sections.map((s) => firstValueFrom(this.api.settings(s.get))));
    } catch (e) {
      this.error = e;
    }
  }

  label(x: any): string {
    return this.text.arabic ? x.nameAr || x.nameEn : x.nameEn || x.nameAr;
  }

  edit(post: string, id: number, v: string): void {
    (this.edits[post] ??= {})[id] = v;
  }

  async save(): Promise<void> {
    this.busy = true;
    try {
      for (let i = 0; i < this.screen.sections.length; i++) {
        const s = this.screen.sections[i];
        const edits = this.edits[s.post];
        if (!edits || !Object.keys(edits).length) continue;
        await firstValueFrom(
          this.api.send(
            'POST',
            s.post,
            this.data![i].map((x) => ({
              id: x.id,
              value: parseAmount(edits[x.id] ?? '') ?? x.value,
              ...(x.stringValue != null ? { stringValue: x.stringValue } : {})
            }))
          )
        );
      }
      this.edits = {};
      this.text.showDone(this.text.tr('APP.saved'));
      this.load();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }
}

// ---------------------------------------------------------------- lookups

/** A lookup list and its endpoints. To add one: its paths, title and icon here, and its fields in the edit sheet. */
interface LookupKind {
  key: string;
  title: string;
  icon: string;
  list: string;
  add: string;
  update: string;
  delete: string;
  /** [FromForm] (with an image) or [FromBody] JSON. */
  multipart: boolean;
  /** PUT {id, status}: turns a city or country on or off without sending the whole record. */
  status?: string;
  /** PATCH ?id=: flips a category between shown and hidden. */
  toggle?: string;
  /** The list endpoint is a GET with the spec params in the query. */
  getList?: boolean;
  imageField?: string;
}

export const LOOKUPS: LookupKind[] = [
  {
    key: 'hajj-categories', title: 'APP.hajjCategories', icon: 'ti ti-building-mosque', multipart: true,
    list: '/api/HajjCategories/GetAllHajjCategories', add: '/api/HajjCategories/AddHajjCategory/', update: '/api/HajjCategories/UpdateHajjCategory/',
    delete: '/api/HajjCategories/DeleteHajjCategory/', toggle: '/api/HajjCategories/ToggleStatus/'
  },
  {
    key: 'outing-categories', title: 'APP.outingCategories', icon: 'ti ti-category', multipart: true,
    list: '/api/OutingCategories/GetAllOutingCategories', add: '/api/OutingCategories/AddOutingCategory/', update: '/api/OutingCategories/UpdateOutingCategory/',
    delete: '/api/OutingCategories/DeleteOutingCategory/', toggle: '/api/OutingCategories/ToggleStatus/'
  },
  {
    key: 'outing-features', title: 'APP.outingFeatures', icon: 'ti ti-sparkles', multipart: true, imageField: 'Image',
    list: '/api/OutingFeature/GetAllOutingFeatures', add: '/api/OutingFeature/AddOutingFeature', update: '/api/OutingFeature/UpdateOutingFeature/',
    delete: '/api/OutingFeature/DeleteOutingFeature/'
  },
  {
    key: 'branches', title: 'APP.branches', icon: 'ti ti-building-store', multipart: false,
    list: '/api/Branshes/GetAllBranshes', add: '/api/Branshes/AddBransh/', update: '/api/Branshes/UpdateBransh/', delete: '/api/Branshes/DeleteBransh/'
  },
  {
    key: 'countries', title: 'APP.countries', icon: 'ti ti-world', multipart: false, status: '/api/Countries/UpdateCountryStatus/',
    list: '/api/Countries/GetAllCountries/', add: '/api/Countries/AddCountry/', update: '/api/Countries/UpdateCountry/', delete: '/api/Countries/DeleteCountry/'
  },
  {
    key: 'cities', title: 'APP.cities', icon: 'ti ti-building', multipart: false, status: '/api/Cities/UpdateCityStatus/',
    list: '/api/Cities/GetAllCities/', add: '/api/Cities/AddCity/', update: '/api/Cities/UpdateCity/', delete: '/api/Cities/DeleteCity/'
  },
  {
    key: 'nationalities', title: 'APP.nationalities', icon: 'ti ti-id-badge', multipart: false,
    list: '/api/Nationality/GetAllNationalitys/', add: '/api/Nationality/AddNationality/', update: '/api/Nationality/UpdateNationality/', delete: '/api/Nationality/DeleteNationality/'
  },
  {
    key: 'room-types', title: 'APP.roomTypes', icon: 'ti ti-bed', multipart: false,
    list: '/api/RoomTypes/GetAllRoomTypes/', add: '/api/RoomTypes/AddRoomType', update: '/api/RoomTypes/UpdateRoomType', delete: '/api/RoomTypes/DeleteRoomType'
  },
  {
    key: 'bed-types', title: 'APP.bedTypes', icon: 'ti ti-bed-flat', multipart: false,
    list: '/api/BedType/GetAllBedTypes/', add: '/api/BedType/AddBedType', update: '/api/BedType/UpdateBedType', delete: '/api/BedType/DeleteBedType'
  },
  {
    key: 'room-features', title: 'APP.roomFeatures', icon: 'ti ti-list-check', multipart: false,
    list: '/api/RoomFeature/GetAllRoomFeatures/', add: '/api/RoomFeature/AddRoomFeature', update: '/api/RoomFeature/UpdateRoomFeature', delete: '/api/RoomFeature/DeleteRoomFeature'
  },
  {
    key: 'sales-agencies', title: 'APP.salesAgencies', icon: 'ti ti-heart-handshake', multipart: true, getList: true, imageField: 'ImageLogo',
    list: '/api/SalesAgency/GetAllSalesAgencies', add: '/api/SalesAgency/AddSalesAgency', update: '/api/SalesAgency/UpdateSalesAgency', delete: '/api/SalesAgency/DeleteSalesAgency'
  }
];

/** a-lookups: every lookup list. */
@Component({
  selector: 'ts-lookups',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.lookups' | translate"></ts-appbar>
      <div class="ts-list-grid">
        <a class="ts-list-card" *ngFor="let k of kinds" [routerLink]="['/a/more/lookups', k.key]">
          <ts-icon-tile [icon]="k.icon"></ts-icon-tile>
          <span class="ts-card-row__main"><span class="ts-card-title">{{ k.title | translate }}</span></span>
          <i class="ti ti-chevron-left ts-chevron"></i>
        </a>
      </div>
    </div>
  `
})
export class LookupsComponent {
  readonly kinds = LOOKUPS;
}

/** l-hajj-cat / l-outing-cat / l-outing-feature / l-branch / countries / cities / …: one lookup list with add, edit, delete. */
@Component({
  selector: 'ts-lookup-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ...KIT, ...LISTS, ...FORM_KIT, SheetComponent, SwitchRowComponent],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="k.title | translate">
        <button type="button" class="ts-fab ts-fab--float" (click)="edit()"><i class="ti ti-plus"></i>{{ 'APP.add' | translate }}</button>
      </ts-appbar>
      <div class="ts-listbar">
        <ts-search [hint]="'APP.search' | translate" (changed)="list.setSearch($event)"></ts-search>
        <ts-chipbar *ngIf="isCategory" [items]="activeChips" [selected]="[activeKey]" (tap)="setActive($event)"></ts-chipbar>
        <div class="ts-progress-line" *ngIf="saving"><span></span></div>
      </div>
      <ts-paged-list [list]="list" [emptyIcon]="k.icon" [grid]="true">
        <ng-template let-x>
          <!-- Categories are shown to customers as image tiles, so their cards lead with the image -->
          <div *ngIf="isCategory; else row" class="ts-cover-card">
            <div class="ts-cover" (click)="edit(x)">
              <img *ngIf="img(x) as src; else noImg" [src]="src" alt="" />
              <ng-template #noImg><div class="ts-cover__empty"><i [class]="k.icon"></i><small>{{ 'APP.noImage' | translate }}</small></div></ng-template>
              <ts-pill *ngIf="x.isActive != null" class="ts-cover__start" [tone]="x.isActive ? 'ok' : 'neutral'">{{ (x.isActive ? 'APP.active' : 'APP.hidden') | translate }}</ts-pill>
              <span *ngIf="x.sequence != null" class="ts-cover__end">{{ 'APP.orderN' | translate: { n: x.sequence } }}</span>
            </div>
            <div class="ts-cover-card__body">
              <div class="ts-grow">
                <p class="ts-card-title">{{ titleOf(x) }}</p>
                <p class="ts-muted ts-clamp2" *ngIf="x.description?.trim()">{{ x.description }}</p>
              </div>
              <button type="button" class="ts-icon-btn" (click)="edit(x)" [title]="'APP.edit' | translate"><i class="ti ti-pencil"></i></button>
              <button type="button" class="ts-icon-btn ts-danger-ink" (click)="remove(x)" [title]="'APP.delete' | translate"><i class="ti ti-trash"></i></button>
            </div>
            <div class="ts-cover-card__foot">
              <button type="button" class="ts-icon-btn" [disabled]="saving || indexOf(x) <= 0" (click)="move(x, -1)" [title]="'APP.moveUp' | translate"><i class="ti ti-arrow-up"></i></button>
              <button type="button" class="ts-icon-btn" [disabled]="saving || indexOf(x) >= list.items.length - 1" (click)="move(x, 1)" [title]="'APP.moveDown' | translate"><i class="ti ti-arrow-down"></i></button>
              <span class="ts-grow"></span>
              <ng-container *ngIf="k.toggle && x.isActive != null">
                <small class="ts-muted">{{ (x.isActive ? 'APP.active' : 'APP.hidden') | translate }}</small>
                <label class="form-check form-switch ts-switch"><input class="form-check-input" type="checkbox" [checked]="x.isActive" (change)="toggle(x)" /></label>
              </ng-container>
            </div>
          </div>
          <ng-template #row>
            <div class="ts-list-card ts-list-card--top">
              <span class="ts-thumb ts-thumb--sm" (click)="edit(x)">
                <img *ngIf="img(x) as src; else ic" [src]="src" alt="" />
                <ng-template #ic><i [class]="k.icon" class="ts-thumb__icon" style="color: var(--ts-navy)"></i></ng-template>
              </span>
              <span class="ts-card-row__main" (click)="edit(x)" style="cursor: pointer">
                <span class="ts-card-title">{{ titleOf(x) }}</span>
                <span class="ts-muted" *ngIf="subtitleOf(x)">{{ subtitleOf(x) }}</span>
                <span class="ts-muted ts-clamp2" *ngIf="x.description?.trim()">{{ x.description }}</span>
                <span class="ts-wrap" style="margin-top: 6px">
                  <ts-pill *ngIf="activeOf(x) != null" [tone]="activeOf(x) ? 'ok' : 'neutral'">{{ (activeOf(x) ? 'APP.active' : 'APP.inactive') | translate }}</ts-pill>
                  <ts-pill *ngIf="x.module != null" tone="info">{{ (x.module === 2 ? 'APP.hotels' : 'APP.moduleTravel') | translate }}</ts-pill>
                  <ts-pill *ngIf="x.isInTravel === true">{{ 'APP.moduleTravel' | translate }}</ts-pill>
                  <ts-pill *ngIf="x.isInHotel === true">{{ 'APP.hotels' | translate }}</ts-pill>
                  <ts-pill *ngIf="isArray(x.cities)">{{ 'APP.citiesN' | translate: { n: x.cities.length } }}</ts-pill>
                  <ts-pill *ngIf="x.sequence != null">{{ 'APP.orderN' | translate: { n: x.sequence } }}</ts-pill>
                </span>
              </span>
              <span class="ts-end-col">
                <label *ngIf="k.status && activeOf(x) != null" class="form-check form-switch ts-switch">
                  <input class="form-check-input" type="checkbox" [checked]="activeOf(x)" (change)="setStatus(x, $any($event.target).checked)" />
                </label>
                <span class="ts-wrap">
                  <button type="button" class="ts-icon-btn" (click)="edit(x)" [title]="'APP.edit' | translate"><i class="ti ti-pencil"></i></button>
                  <button type="button" class="ts-icon-btn ts-danger-ink" (click)="remove(x)" [title]="'APP.delete' | translate"><i class="ti ti-trash"></i></button>
                </span>
              </span>
            </div>
          </ng-template>
        </ng-template>
      </ts-paged-list>
    </div>

    <ts-sheet [open]="sheetOpen" (openChange)="sheetOpen = false" [title]="(editing ? 'APP.edit' : 'APP.add') | translate">
      <ng-container *ngIf="k.key === 'nationalities'; else plainName">
        <ts-field [label]="'APP.nameArabic' | translate" [required]="true" [(value)]="f.nameAr"></ts-field>
        <ts-field [label]="'APP.nameEnglish' | translate" [required]="true" [(value)]="f.name"></ts-field>
      </ng-container>
      <ng-template #plainName>
        <ts-field [label]="(place ? 'APP.nameArabic' : 'APP.name') | translate" [required]="true" [(value)]="f.name"></ts-field>
      </ng-template>
      <ts-field *ngIf="place" [label]="'APP.nameEnglish' | translate" [(value)]="f.enName"></ts-field>
      <ts-field *ngIf="k.key === 'countries'" [label]="'APP.countryCode' | translate" hint="EG" [(value)]="f.code"></ts-field>
      <ts-option-field *ngIf="k.key === 'cities'" [label]="'APP.country' | translate" source="countries" [required]="true" [(value)]="f.country"></ts-option-field>
      <ng-container *ngIf="place">
        <p class="ts-label">{{ 'APP.module' | translate }}</p>
        <ts-chipbar [wrap]="true" [items]="moduleChips" [selected]="[String(f.module)]" (tap)="f.module = +$event"></ts-chipbar>
      </ng-container>
      <ng-container *ngIf="k.key === 'cities'">
        <ts-switch-row [title]="'APP.showInTravel' | translate" [(value)]="f.inTravel"></ts-switch-row>
        <ts-switch-row [title]="'APP.showInHotels' | translate" [(value)]="f.inHotel"></ts-switch-row>
      </ng-container>
      <ts-switch-row *ngIf="place" [title]="'APP.active' | translate" [(value)]="f.active"></ts-switch-row>
      <ts-field *ngIf="k.key === 'outing-categories' || k.key === 'branches' || agency" [label]="'APP.description' | translate" [lines]="2" [(value)]="f.description"></ts-field>
      <ts-field *ngIf="k.key === 'room-types'" [label]="'APP.maxOccupancy' | translate" [number]="true" [required]="true" [(value)]="f.occupancy"></ts-field>
      <ng-container *ngIf="agency">
        <ts-field [label]="'APP.email' | translate" type="email" [(value)]="f.email"></ts-field>
        <ts-field [label]="'APP.phone' | translate" type="tel" [(value)]="f.phone"></ts-field>
        <ts-field [label]="'APP.address' | translate" [(value)]="f.address"></ts-field>
        <ts-switch-row [title]="'APP.hotelCommission' | translate" [(value)]="f.hotelCommission"></ts-switch-row>
        <ts-field *ngIf="f.hotelCommission" [label]="'APP.hotelCommissionRate' | translate" [number]="true" suffix="%" [(value)]="f.hotelRate"></ts-field>
        <ts-switch-row [title]="'APP.travelCommission' | translate" [(value)]="f.travelCommission"></ts-switch-row>
        <ts-field *ngIf="f.travelCommission" [label]="'APP.travelCommissionRate' | translate" [number]="true" suffix="%" [(value)]="f.travelRate"></ts-field>
      </ng-container>
      <ts-field *ngIf="k.key === 'branches'" [label]="'APP.place' | translate" [(value)]="f.location"></ts-field>
      <ng-container *ngIf="isCategory">
        <ts-field [label]="'APP.order' | translate" [number]="true" [(value)]="f.sequence"></ts-field>
        <ts-switch-row [title]="'APP.active' | translate" [(value)]="f.active"></ts-switch-row>
      </ng-container>
      <div *ngIf="k.multipart && k.key !== 'branches'" class="ts-field">
        <span>{{ 'APP.image' | translate }}</span>
        <ts-images-field
          [files]="f.image ? [f.image] : []"
          (filesChange)="f.image = $event[0] ?? null"
          [existing]="!f.image && editing && img(editing) ? [img(editing)!] : []"
          [multiple]="false"
        ></ts-images-field>
      </div>
      <div sheet-foot>
        <button type="button" class="btn btn-primary ts-wide-btn" [disabled]="saving" (click)="save()">{{ 'APP.save' | translate }}</button>
      </div>
    </ts-sheet>
  `
})
export class LookupListComponent implements OnInit, OnDestroy {
  private readonly api = inject(SettingsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  readonly String = String;
  readonly isArray = Array.isArray;
  k: LookupKind = LOOKUPS[0];
  list!: PagedList<any>;
  /** Categories: null all, true shown, false hidden. */
  active: boolean | null = null;
  saving = false;
  sheetOpen = false;
  editing: any = null;
  f: any = {};
  activeChips = [
    { key: 'all', label: this.text.tr('APP.all') },
    { key: 'on', label: this.text.tr('APP.active'), dot: 'var(--ts-ok-fg)' },
    { key: 'off', label: this.text.tr('APP.hidden'), dot: 'var(--ts-ink-faint)' }
  ];
  moduleChips = [
    { key: '1', label: this.text.tr('APP.moduleTravel') },
    { key: '2', label: this.text.tr('APP.hotels') }
  ];

  get isCategory(): boolean {
    return this.k.key === 'hajj-categories' || this.k.key === 'outing-categories';
  }

  get place(): boolean {
    return this.k.key === 'countries' || this.k.key === 'cities';
  }

  get agency(): boolean {
    return this.k.key === 'sales-agencies';
  }

  get activeKey(): string {
    return this.active == null ? 'all' : this.active ? 'on' : 'off';
  }

  ngOnInit(): void {
    this.k = LOOKUPS.find((x) => x.key === this.route.snapshot.paramMap.get('kind')) ?? LOOKUPS[0];
    this.list = new PagedList<any>((q) =>
      this.api
        .list(this.k.list, {
          get: this.k.getList,
          page: q.pageIndex,
          body: { ...(q.search ? { search: q.search } : {}), ...(this.isCategory && this.active != null ? { isActive: this.active } : {}) }
        })
        .pipe(
          // Categories in the order customers see them; ties keep the server's order
          map((r) => (this.isCategory ? { page: { ...r.page, data: [...r.page.data].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0)) } } : r))
        )
    );
  }

  setActive(k: string): void {
    this.active = k === 'all' ? null : k === 'on';
    this.list.refresh();
  }

  img(x: any): string | null {
    return mediaUrl(x.imageUrl || x.image || x.logoUrl);
  }

  titleOf(x: any): string {
    return this.k.key === 'nationalities' ? x.nameAr || x.name : x.name;
  }

  activeOf(x: any): boolean | null {
    const v = this.k.status ? x.status : x.isActive;
    return typeof v === 'boolean' ? v : null;
  }

  subtitleOf(x: any): string {
    const t = (k: string, p?: Record<string, unknown>) => this.text.tr(k, p);
    return [
      this.k.key === 'nationalities' ? x.name : null,
      x.enName,
      x.countryName,
      x.countryCode,
      x.location,
      x.email,
      x.phone,
      x.maxOccupancy != null ? t('APP.upToGuests', { n: x.maxOccupancy }) : null,
      x.isHotelCommission === true ? `${t('APP.hotelCommission')} ${fmtNum(x.hotelCommissionRate)}%` : null,
      x.isTravelCommission === true ? `${t('APP.travelCommission')} ${fmtNum(x.travelCommissionRate)}%` : null
    ]
      .filter((s) => s != null && String(s).trim())
      .join(' · ');
  }

  indexOf(x: any): number {
    return this.list.items.findIndex((r) => r.id === x.id);
  }

  toggle(x: any): void {
    this.api.send('PATCH', this.k.toggle!, undefined, { id: x.id }).subscribe({ next: () => this.list.refresh(), error: (e) => this.text.showError(e) });
  }

  setStatus(x: any, on: boolean): void {
    this.api.send('PUT', this.k.status!, { id: x.id, status: on }).subscribe({ next: () => this.list.refresh(), error: (e) => this.text.showError(e) });
  }

  /**
   * Moves a category up or down. There is no reorder endpoint, so the loaded list is numbered 1…n in its new order
   * and only the categories whose Sequence changed are saved, with the same update the edit form sends.
   */
  async move(x: any, delta: number): Promise<void> {
    if (this.saving) return;
    const rows = [...this.list.items];
    const from = rows.findIndex((r) => r.id === x.id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= rows.length) return;
    rows.splice(to, 0, rows.splice(from, 1)[0]);
    this.saving = true;
    try {
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].sequence !== i + 1) await firstValueFrom(this.api.send('PUT', this.k.update, toForm(this.sequenceFields(rows[i], i + 1))));
      }
      this.list.refresh();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.saving = false;
    }
  }

  private sequenceFields(x: any, sequence: number): Record<string, unknown> {
    return {
      Id: x.id,
      Name: x.name,
      IsActive: x.isActive ?? true,
      Sequence: sequence,
      ...(this.k.key === 'outing-categories' ? { Description: x.description ?? '', Icon: x.icon ?? '', ImageUrl: x.imageUrl ?? '' } : {})
    };
  }

  edit(x: any = null): void {
    this.editing = x;
    this.f = {
      name: x?.name ?? '',
      description: x?.description ?? '',
      location: x?.location ?? '',
      sequence: String(x?.sequence ?? 0),
      enName: x?.enName ?? '',
      nameAr: x?.nameAr ?? '',
      code: x?.countryCode ?? '',
      occupancy: String(x?.maxOccupancy ?? 2),
      email: x?.email ?? '',
      phone: x?.phone ?? '',
      address: x?.address ?? '',
      hotelRate: x?.hotelCommissionRate != null ? fmtNum(x.hotelCommissionRate) : '',
      travelRate: x?.travelCommissionRate != null ? fmtNum(x.travelCommissionRate) : '',
      hotelCommission: !!x?.isHotelCommission,
      travelCommission: !!x?.isTravelCommission,
      active: (this.k.status ? x?.status : x?.isActive) ?? true,
      module: x?.module ?? 1,
      inTravel: x?.isInTravel ?? true,
      inHotel: !!x?.isInHotel,
      country: x?.countryId != null ? ({ id: String(x.countryId), name: x.countryName ?? '' } as Picked) : null,
      image: null as File | null
    };
    this.sheetOpen = true;
  }

  async save(): Promise<void> {
    const f = this.f;
    const k = this.k;
    if (!f.name.trim() || (k.key === 'cities' && !f.country)) return this.text.showError(this.text.tr('APP.fillRequired'));
    const fields: Record<string, unknown> = {
      ...(this.editing ? { Id: this.editing.id } : {}),
      Name: f.name.trim(),
      ...(k.key === 'outing-categories' || k.key === 'branches' || this.agency ? { Description: f.description.trim() } : {}),
      ...(k.key === 'room-types' ? { MaxOccupancy: intOf(f.occupancy) ?? 1 } : {}),
      ...(this.agency
        ? {
            Email: f.email.trim(),
            Phone: f.phone.trim(),
            Address: f.address.trim(),
            IsHotelCommission: f.hotelCommission,
            HotelCommissionRate: f.hotelCommission ? (parseAmount(f.hotelRate) ?? 0) : 0,
            IsTravelCommission: f.travelCommission,
            TravelCommissionRate: f.travelCommission ? (parseAmount(f.travelRate) ?? 0) : 0
          }
        : {}),
      ...(k.key === 'branches' ? { Location: f.location.trim() } : {}),
      ...(this.isCategory ? { IsActive: f.active, Sequence: intOf(f.sequence) ?? 0 } : {}),
      ...(k.key === 'outing-categories' ? { Icon: this.editing?.icon ?? '', ImageUrl: this.editing?.imageUrl ?? '' } : {}),
      ...(k.key === 'nationalities' ? { NameAr: f.nameAr.trim() } : {}),
      ...(this.place ? { EnName: f.enName.trim(), Status: f.active, Module: f.module } : {}),
      ...(k.key === 'countries' ? { CountryCode: f.code.trim().toUpperCase() } : {}),
      ...(k.key === 'cities' ? { CountryId: +f.country.id, IsInTravel: f.inTravel, IsInHotel: f.inHotel } : {})
    };
    let body: unknown;
    if (k.multipart) {
      body = toForm({ ...fields, ...(f.image ? { [k.imageField ?? 'UploadedImage']: f.image } : {}) });
    } else {
      body = Object.fromEntries(Object.entries(fields).map(([key, v]) => [key[0].toLowerCase() + key.slice(1), v]));
    }
    this.saving = true;
    try {
      await firstValueFrom(this.api.send(this.editing ? 'PUT' : 'POST', this.editing ? k.update : k.add, body));
      this.sheetOpen = false;
      this.list.refresh();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.saving = false;
    }
  }

  async remove(x: any): Promise<void> {
    const title = this.titleOf(x);
    const ok = await this.dialogs.confirm({ title: this.text.tr('APP.delete'), message: this.text.tr('APP.deleteItemQ', { n: title }), confirm: this.text.tr('APP.delete'), danger: true });
    if (!ok) return;
    this.api.send('DELETE', this.k.delete, undefined, { id: x.id }).subscribe({ next: () => this.list.removeWhere((y: any) => y.id === x.id), error: (e) => this.text.showError(e) });
  }

  ngOnDestroy(): void {
    this.list?.destroy();
  }
}

// ---------------------------------------------------------------- policies, contracts

/** a-policies: the app's policy text, Arabic and English. */
@Component({
  selector: 'ts-policies',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ...FORM_KIT, SheetComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.policies' | translate">
        <button type="button" class="ts-icon-btn" (click)="edit(null)" [title]="'APP.add' | translate"><i class="ti ti-plus"></i></button>
      </ts-appbar>
      <ts-loading *ngIf="!items && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ts-empty *ngIf="items && !items.length" [message]="'APP.nothingHereYet' | translate"></ts-empty>
      <button type="button" class="ts-list-card ts-policy" *ngFor="let p of items" (click)="edit(p)">
        <span class="ts-pre">{{ text.arabic ? p.policyPragraph : p.enPolicyPragraph || p.policyPragraph }}</span>
      </button>
    </div>
    <ts-sheet [open]="open" (openChange)="open = false" [title]="'APP.policy' | translate" [wide]="true">
      <ts-field label="العربي" [lines]="6" [(value)]="ar"></ts-field>
      <ts-field label="English" [lines]="6" [(value)]="en"></ts-field>
      <div sheet-foot><button type="button" class="btn btn-primary ts-wide-btn" (click)="save()">{{ 'APP.save' | translate }}</button></div>
    </ts-sheet>
  `
})
export class PoliciesComponent implements OnInit {
  private readonly api = inject(SettingsApi);
  readonly text = inject(StaffText);
  items: any[] | null = null;
  error: unknown = null;
  open = false;
  editing: any = null;
  ar = '';
  en = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.error = null;
    this.api.get('/api/Policy/GetPolicies/').subscribe({
      next: (d) => (this.items = Array.isArray(d) ? d : d && typeof d === 'object' ? [d] : []),
      error: (e) => (this.error = e)
    });
  }

  edit(p: any): void {
    this.editing = p;
    this.ar = p?.policyPragraph ?? '';
    this.en = p?.enPolicyPragraph ?? '';
    this.open = true;
  }

  save(): void {
    this.api.send('PUT', '/api/Policy/AddOrUpdatePolicy', { id: this.editing?.id ?? 0, policyPragraph: this.ar, enPolicyPragraph: this.en }).subscribe({
      next: () => {
        this.open = false;
        this.load();
      },
      error: (e) => this.text.showError(e)
    });
  }
}

/** a-contracts: vendor contracts and their terms. */
@Component({
  selector: 'ts-contracts',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ...LISTS],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.contracts' | translate"></ts-appbar>
      <ts-paged-list [list]="list" emptyIcon="ti ti-file-text">
        <ng-template let-c>
          <ts-card [title]="c.name" [subtitle]="describe(c)" icon="ti ti-file-certificate">
            <button type="button" class="ts-term" *ngFor="let t of c.vendorContractDescriptions ?? []" (click)="editTerm(c, t)">• {{ t.description }}</button>
          </ts-card>
        </ng-template>
      </ts-paged-list>
    </div>
  `
})
export class ContractsComponent implements OnDestroy {
  private readonly api = inject(SettingsApi);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  list = new PagedList<any>((q) => this.api.list('/api/VendorContract/GetAllVendorContracts/', { get: true, page: q.pageIndex }));

  describe(c: any): string {
    return [c.specialty, c.phone, c.email].filter(Boolean).join(' · ');
  }

  async editTerm(c: any, t: any): Promise<void> {
    const v = await this.dialogs.ask({ title: c.name, label: this.text.tr('APP.contractTerm'), initial: t.description, lines: 5 });
    if (v == null) return;
    this.api.send('PUT', '/api/vendorContract/UpdateVendorContractDescription/', { id: t.id, vendorContractId: c.id, description: v }).subscribe({
      next: () => this.list.refresh(),
      error: (e) => this.text.showError(e)
    });
  }

  ngOnDestroy(): void {
    this.list.destroy();
  }
}

// ---------------------------------------------------------------- users and roles

/** a-users: staff accounts (admins), with a new account, edit and on/off. */
@Component({
  selector: 'ts-users',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...LISTS, ...FORM_KIT, SheetComponent, ChipBarComponent, PasswordSheetComponent],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'APP.users' | translate">
        <a class="ts-icon-btn" routerLink="/a/more/users/roles" [title]="'APP.roles' | translate"><i class="ti ti-shield-lock"></i></a>
        <button *ngIf="canCreate" type="button" class="ts-fab ts-fab--float" (click)="edit()"><i class="ti ti-plus"></i>{{ 'APP.newUser' | translate }}</button>
      </ts-appbar>
      <div class="ts-listbar">
        <ts-search [hint]="'APP.search' | translate" (changed)="list.setSearch($event)"></ts-search>
      </div>
      <ts-paged-list [list]="list" emptyIcon="ti ti-users" [grid]="true">
        <ng-template let-u>
          <div class="ts-list-card">
            <ts-avatar [name]="nameOf(u)"></ts-avatar>
            <span class="ts-card-row__main" [style.cursor]="canEdit ? 'pointer' : null" (click)="canEdit && edit(u)">
              <span class="ts-card-title">{{ nameOf(u) }}</span>
              <span class="ts-muted">{{ describe(u) }}</span>
              <ts-pill [tone]="u.iActive !== false ? 'ok' : 'neutral'" style="margin-top: 4px">{{ (u.iActive !== false ? 'APP.active' : 'APP.inactive') | translate }}</ts-pill>
            </span>
            <button *ngIf="canEdit" type="button" class="ts-icon-btn" [title]="'APP.changePassword' | translate" (click)="pwFor = { userId: u.id, name: nameOf(u) }">
              <i class="ti ti-key"></i>
            </button>
            <label *ngIf="canEdit" class="form-check form-switch ts-switch">
              <input class="form-check-input" type="checkbox" [checked]="u.iActive !== false" (change)="setActive(u, $any($event.target).checked)" />
            </label>
          </div>
        </ng-template>
      </ts-paged-list>
    </div>
    <ts-sheet [open]="open" (openChange)="open = false" [title]="(editing ? 'APP.editUser' : 'APP.newUser') | translate">
      <ts-field [label]="'APP.firstName' | translate" [required]="true" [(value)]="f.first"></ts-field>
      <ts-field [label]="'APP.lastName' | translate" [required]="true" [(value)]="f.last"></ts-field>
      <ts-field [label]="'APP.username' | translate" [required]="true" [(value)]="f.user"></ts-field>
      <ts-field [label]="'APP.email' | translate" type="email" [(value)]="f.email"></ts-field>
      <ts-field [label]="'APP.password' | translate" type="password" [required]="!editing" [hint]="editing ? ('APP.keepPasswordHint' | translate) : null" [(value)]="f.pass"></ts-field>
      <p class="ts-label">{{ 'APP.role' | translate }}</p>
      <ts-chipbar [wrap]="true" [items]="roleChips" [selected]="picked" (tap)="toggleRole($event)"></ts-chipbar>
      <ts-option-field *ngIf="!editing && needsVendor" [label]="'APP.vendor' | translate" source="vendors" [required]="true" [(value)]="vendor"></ts-option-field>
      <div sheet-foot><button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy" (click)="save()">{{ 'APP.save' | translate }}</button></div>
    </ts-sheet>
    <ts-password-sheet [open]="!!pwFor" [userId]="pwFor?.userId ?? null" [name]="pwFor?.name ?? ''" (openChange)="pwFor = null"></ts-password-sheet>
  `
})
export class UsersComponent implements OnDestroy {
  pwFor: { userId: number; name: string } | null = null;
  private readonly api = inject(SettingsApi);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  list = new PagedList<any>((q) => this.api.list('/api/Users/GetAllUsers/', { body: q.search ? { search: q.search } : {}, page: q.pageIndex }));
  open = false;
  editing: any = null;
  busy = false;
  f = { first: '', last: '', user: '', email: '', pass: '' };
  roleChips: { key: string; label: string }[] = [];
  picked: string[] = [];
  /** Role name → RoleType (1 admin, 2 vendor, 4 scanner). A vendor or scanner account belongs to a company. */
  private roleTypes = new Map<string, number>();
  vendor: Picked | null = null;

  get needsVendor(): boolean {
    return this.picked.some((r) => (this.roleTypes.get(r) ?? 1) !== 1);
  }

  get canCreate(): boolean {
    return this.session.can(P.usersCreate);
  }

  get canEdit(): boolean {
    return this.session.can(P.usersEdit);
  }

  nameOf(u: any): string {
    const n = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    return n || u.username || u.userName || '';
  }

  describe(u: any): string {
    return [u.email ?? '', ...(u.roles ?? []).map((r: any) => r.name)].filter((s: string) => !!s).join(' · ');
  }

  /** New account (CreateUser) or edit (WepEditUser: an empty password keeps the current one; Roles replace the user's roles). */
  async edit(u: any = null): Promise<void> {
    this.editing = u;
    this.f = { first: u?.firstName ?? '', last: u?.lastName ?? '', user: u?.username ?? u?.userName ?? '', email: u?.email ?? '', pass: '' };
    this.picked = u ? (u.roles ?? []).map((r: any) => r.name).filter(Boolean) : [];
    this.vendor = null;
    try {
      const page = await firstValueFrom(this.api.pageOf('/api/Users/GetAllRoles/', { get: true }));
      // Every role, admin first: a vendor's or a scanner's account is made here too, with its company
      const roles = [...page.data].sort((a, b) => (a.roleType ?? 9) - (b.roleType ?? 9));
      this.roleTypes = new Map(roles.map((r) => [r.name, r.roleType]));
      this.roleChips = roles.map((r) => ({ key: r.name, label: r.name }));
    } catch {
      this.roleChips = [];
    }
    this.open = true;
  }

  toggleRole(k: string): void {
    this.picked = this.picked.includes(k) ? this.picked.filter((x) => x !== k) : [...this.picked, k];
  }

  async save(): Promise<void> {
    const f = this.f;
    if (!f.first.trim() || !f.user.trim() || (!this.editing && !f.pass)) return this.text.showError(this.text.tr('APP.fillRequired'));
    if (!this.editing && this.needsVendor && !this.vendor) return this.text.showError(this.text.tr('APP.chooseVendor'));
    this.busy = true;
    try {
      if (this.editing) {
        await firstValueFrom(
          this.api.send(
            'PUT',
            '/api/Users/WepEditUser/',
            toForm({
              Id: this.editing.id,
              FirstName: f.first.trim(),
              LastName: f.last.trim(),
              Username: f.user.trim(),
              Email: f.email.trim(),
              ...(f.pass ? { Password: f.pass } : {}),
              IActive: this.editing.iActive ?? true,
              Roles: this.picked
            })
          )
        );
      } else {
        await firstValueFrom(
          this.api.send(
            'POST',
            '/api/Users/CreateUser/',
            toForm({
              FirstName: f.first.trim(),
              LastName: f.last.trim(),
              Username: f.user.trim(),
              Email: f.email.trim(),
              Password: f.pass,
              Gender: 1,
              Roles: this.picked,
              ...(this.needsVendor && this.vendor ? { CompanyId: +this.vendor.id } : {})
            })
          )
        );
      }
      this.text.showDone(this.text.tr('APP.saved'));
      this.open = false;
      this.list.refresh();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }

  setActive(u: any, v: boolean): void {
    this.api.send('PUT', `/api/staff/users/${u.id}/active`, { isActive: v }).subscribe({ next: () => this.list.refresh(), error: (e) => this.text.showError(e) });
  }

  ngOnDestroy(): void {
    this.list.destroy();
  }
}

/** a-roles: every role; a role opens its permissions. */
@Component({
  selector: 'ts-roles',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.roles' | translate"></ts-appbar>
      <ts-loading *ngIf="!roles && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error"></ts-error>
      <div class="ts-list-grid">
        <a class="ts-list-card" *ngFor="let r of roles" [routerLink]="['/a/more/users/roles', r.id]" [state]="{ name: r.name }">
          <span class="ts-card-row__main"><span class="ts-card-title">{{ r.name }}</span></span>
          <ts-pill [tone]="r.roleType === 2 ? 'info' : 'neutral'">{{ (r.roleType === 2 ? 'APP.vendor' : 'APP.admin') | translate }}</ts-pill>
        </a>
      </div>
    </div>
  `
})
export class RolesComponent implements OnInit {
  private readonly api = inject(SettingsApi);
  roles: any[] | null = null;
  error: unknown = null;

  ngOnInit(): void {
    this.api.pageOf('/api/Users/GetAllRoles/', { get: true }).subscribe({ next: (p) => (this.roles = p.data), error: (e) => (this.error = e) });
  }
}

/** A role's permissions as switches (Permissions/GetPermissionsForRole + AddPermissionsToRole). */
@Component({
  selector: 'ts-role-permissions',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, SwitchRowComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="name" [subtitle]="'APP.permissions' | translate"></ts-appbar>
      <ts-loading *ngIf="!claims && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error"></ts-error>
      <ts-card *ngIf="claims">
        <ts-switch-row *ngFor="let c of claims" [title]="label(c)" [disabled]="!canEdit" [(value)]="c.isSelected"></ts-switch-row>
      </ts-card>
      <div class="ts-sticky-foot" *ngIf="claims && canEdit">
        <button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy" (click)="save()"><i *ngIf="busy" class="pi pi-spin pi-spinner"></i>{{ 'APP.save' | translate }}</button>
      </div>
    </div>
  `
})
export class RolePermissionsComponent implements OnInit {
  private readonly api = inject(SettingsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  id = 0;
  name = '';
  claims: any[] | null = null;
  error: unknown = null;
  busy = false;

  get canEdit(): boolean {
    return this.session.can('Permissions.Roles.ManagePermissions');
  }

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.name = history.state?.name ?? '';
    this.api.get(`/api/Permissions/GetPermissionsForRole/${this.id}`).subscribe({
      next: (d) => (this.claims = (d?.roleCalims ?? []).map((c: any) => ({ ...c }))),
      error: (e) => (this.error = e)
    });
  }

  label(c: any): string {
    return String(c.displayValue ?? '').replace(/^Permissions\./, '');
  }

  save(): void {
    this.busy = true;
    this.api.send('POST', '/api/Permissions/AddPermissionsToRole/', { roleId: this.id, roleCalims: this.claims }).subscribe({
      next: () => {
        this.busy = false;
        this.text.showDone(this.text.tr('APP.saved'));
      },
      error: (e) => {
        this.busy = false;
        this.text.showError(e);
      }
    });
  }
}
