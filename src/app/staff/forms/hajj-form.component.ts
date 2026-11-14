import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { PillSwitchComponent, SwitchRowComponent } from '../ui/controls';
import { StaffSession } from '../core/session';
import { ProductsApi } from '../products/products-api';
import { FilterOption } from '../core/query';
import { ChipBarComponent } from '../ui/lists';
import { fmtNum, parseAmount, parseDate } from '../core/format';
import { RichTextComponent,
  ChildPolicy,
  FORM_KIT,
  FormsApi,
  Picked,
  ProgramStep,
  amountOf,
  childPolicyError,
  childPolicyFrom,
  childPolicyJson,
  cleanPoints,
  formDate,
  intOf,
  programStepFrom,
  programStepJson,
  runFollowUps,
  jsonEach
} from './form-kit';

/** A room type of a package (HajjTicketRequest), with its own foreign price and limits (staff tables, type 6). */
export interface HajjRoom {
  id: number | null;
  type: string;
  description: string;
  price: number | null;
  quantity: number | null;
  active: boolean;
  foreign: number | null;
  foreignChild: number | null;
  min: number | null;
  max: number | null;
}

const newRoom = (): HajjRoom => ({
  id: null,
  type: '',
  description: '',
  price: null,
  quantity: null,
  active: true,
  foreign: null,
  foreignChild: null,
  min: null,
  max: null
});

function roomJson(r: HajjRoom) {
  return {
    ...(r.id != null ? { Id: r.id } : {}),
    TicketType: r.type.trim(),
    Description: r.description.trim(),
    Price: r.price,
    AvailableQuantity: r.quantity,
    IsActive: r.active
  };
}

/** The JSON endpoints take camelCase ([FromBody]), not the form keys. */
function camel(j: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(j).map(([k, v]) => [k[0].toLowerCase() + k.slice(1), v instanceof Date ? formDate(v) : v]));
}

@Component({
  selector: 'ts-rooms-editor',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...FORM_KIT, SwitchRowComponent],
  template: `
    <div class="ts-row-box" *ngFor="let r of rows; let i = index">
      <button type="button" class="ts-row-box__remove" (click)="removeAt(i)"><i class="ti ti-trash"></i></button>
      <ts-field [label]="'APP.roomType' | translate" [hint]="'APP.roomTypeHint' | translate" [required]="true" [(value)]="r.type"></ts-field>
      <ts-field [label]="'APP.description' | translate" [(value)]="r.description"></ts-field>
      <div class="ts-two">
        <ts-field [label]="'APP.pricePerPerson' | translate" [number]="true" [suffix]="'APP.egp' | translate" [required]="true" [value]="r.price == null ? '' : num(r.price)" (valueChange)="r.price = amount($event)"></ts-field>
        <ts-field [label]="'APP.availableRooms' | translate" [number]="true" [required]="true" [value]="r.quantity ?? ''" (valueChange)="r.quantity = int($event)"></ts-field>
      </div>
      <div class="ts-two">
        <ts-field [label]="'APP.foreignPrice' | translate" [number]="true" [hint]="'APP.optional' | translate" [value]="r.foreign == null ? '' : num(r.foreign)" (valueChange)="r.foreign = amount($event)"></ts-field>
        <ts-field [label]="'APP.minPerBooking' | translate" [number]="true" [hint]="'APP.optional' | translate" [value]="r.min ?? ''" (valueChange)="r.min = int($event)"></ts-field>
      </div>
      <ts-switch-row [title]="'APP.availableForBooking' | translate" [(value)]="r.active"></ts-switch-row>
    </div>
    <button type="button" class="btn btn-secondary" (click)="add()"><i class="ti ti-plus"></i>{{ 'APP.addRoom' | translate }}</button>
  `
})
export class RoomsEditorComponent {
  @Input() rows: HajjRoom[] = [];
  @Output() rowsChange = new EventEmitter<HajjRoom[]>();
  num = fmtNum;
  amount = parseAmount;
  int = (v: string) => intOf(v);
  add(): void {
    this.rows = [...this.rows, newRoom()];
    this.rowsChange.emit(this.rows);
  }
  removeAt(i: number): void {
    this.rows = this.rows.filter((_, j) => j !== i);
    this.rowsChange.emit(this.rows);
  }
}

interface HajjGroup {
  /** The stored HajjDate when editing: kept by id, so its bookings and seats stay on it. */
  id?: number | null;
  start: Date | null;
  seats: number | null;
}

/**
 * f-hajj-1 … f-hajj-4: POST AddHajj (multipart HajjRequest, rooms and groups inside it). Then the program
 * (AddHajjProgramStepsV3), and with the new ids from GetHajjById: seats per group, gathering points, the package
 * rule and foreign price, and each room's foreign price and minimum.
 */
@Component({
  selector: 'ts-hajj-form',
  standalone: true,
  imports: [RichTextComponent, CommonModule, TranslateModule, ...KIT, ...FORM_KIT, PillSwitchComponent, SwitchRowComponent, RoomsEditorComponent, ChipBarComponent],
  template: `
    <ts-step-scaffold [title]="(id ? 'APP.editPackage' : 'APP.newPackage') | translate" [nextLabel]="id && step === 3 ? ('APP.saveChanges' | translate) : ''" [steps]="steps" [current]="step" [busy]="busy" (back)="step = step - 1" (next)="next()" (jump)="jump($event)">
      <ts-loading *ngIf="loading"></ts-loading>
      <ts-error *ngIf="loadError" [error]="loadError" (retry)="load()"></ts-error>
      <!-- 1: data, groups, points -->
      <ng-container *ngIf="step === 0 && !loading">
        <ts-form-section [title]="'APP.stepDataPlace' | translate" icon="ti ti-map" kind="place">
          <ts-pill-switch [items]="kinds" [selected]="String(f.type)" (selectedChange)="f.type = +$event"></ts-pill-switch>
          <div style="height: 12px"></div>
          <ts-field [label]="'APP.packageName' | translate" [required]="true" [(value)]="f.name"></ts-field>
          <ts-option-field [label]="'APP.category' | translate" source="hajjcategories" [(value)]="f.category"></ts-option-field>
          <ts-option-field *ngIf="!vendor" [label]="'APP.vendor' | translate" source="vendors" [required]="true" [(value)]="f.vendor"></ts-option-field>
          <div class="ts-three">
            <ts-field [label]="'APP.numberOfDays' | translate" [number]="true" [required]="true" [(value)]="f.days"></ts-field>
            <ts-field [label]="'APP.daysInMakkah' | translate" [number]="true" [(value)]="f.makkah"></ts-field>
            <ts-field [label]="'APP.daysInMadinah' | translate" [number]="true" [(value)]="f.madinah"></ts-field>
          </div>
          <ts-field [label]="'APP.hotelInMakkah' | translate" [required]="true" [(value)]="f.resMakkah"></ts-field>
          <ts-field [label]="'APP.hotelInMadinah' | translate" [required]="true" [(value)]="f.resMadinah"></ts-field>
          <ts-field [label]="'APP.flightLine' | translate" [required]="true" [(value)]="f.flight"></ts-field>
          <ts-option-field [label]="'APP.country' | translate" source="countries" [(value)]="f.country"></ts-option-field>
          <ts-option-field [label]="'APP.city' | translate" source="cities" [(value)]="f.city"></ts-option-field>
          <div class="ts-two">
            <ts-field [label]="'APP.fromPlace' | translate" [required]="true" [(value)]="f.from"></ts-field>
            <ts-field [label]="'APP.toPlace' | translate" [required]="true" [(value)]="f.to"></ts-field>
          </div>
          <ts-field [label]="'APP.externalLink' | translate" hint="https://" [(value)]="f.link"></ts-field>
        </ts-form-section>
        <ts-form-section [title]="'APP.groups' | translate" [subtitle]="'APP.groupsHint' | translate" icon="ti ti-users-group" kind="schedule">
          <div class="ts-row-box" *ngFor="let g of groups; let i = index">
            <button type="button" class="ts-row-box__remove" (click)="groups.splice(i, 1)"><i class="ti ti-trash"></i></button>
            <div class="ts-two">
              <ts-date-field [label]="'APP.departure' | translate" [required]="true" [(value)]="g.start"></ts-date-field>
              <ts-field [label]="'APP.seats' | translate" [number]="true" [hint]="'APP.unlimited' | translate" [value]="g.seats ?? ''" (valueChange)="g.seats = int($event)"></ts-field>
            </div>
          </div>
          <button type="button" class="btn btn-secondary" (click)="groups.push({ start: null, seats: null })"><i class="ti ti-plus"></i>{{ 'APP.addGroup' | translate }}</button>
        </ts-form-section>
        <ts-form-section [title]="'APP.gatheringPoints' | translate" icon="ti ti-map-pin" kind="place">
          <ts-points-editor [(rows)]="points"></ts-points-editor>
        </ts-form-section>
      </ng-container>

      <!-- 2: prices and policies -->
      <ng-container *ngIf="step === 1">
        <ts-form-section [title]="'APP.prices' | translate" [subtitle]="'APP.hajjPriceHint' | translate" icon="ti ti-tag" kind="money">
          <div class="ts-two">
            <ts-field [label]="'APP.startingPrice' | translate" [number]="true" [suffix]="'APP.egp' | translate" [required]="true" [(value)]="f.price"></ts-field>
            <ts-field [label]="'APP.childPrice' | translate" [number]="true" [suffix]="'APP.egp' | translate" [(value)]="f.childPrice"></ts-field>
          </div>
          <ts-field [label]="'APP.priceBefore' | translate" [number]="true" [suffix]="'APP.egp' | translate" [hint]="'APP.priceBeforeHint' | translate" [(value)]="f.priceBefore"></ts-field>
          <ts-field [label]="'APP.capacity' | translate" [number]="true" [required]="true" [(value)]="f.capacity"></ts-field>
        </ts-form-section>
        <ts-form-section [title]="'APP.childPricing' | translate" [subtitle]="'APP.childPricingHint' | translate" icon="ti ti-mood-kid" kind="money">
          <ts-child-policies [(rows)]="children"></ts-child-policies>
        </ts-form-section>
        <ts-form-section [title]="'APP.paymentAndRefund' | translate" icon="ti ti-wallet" kind="money">
          <ts-pill-switch [items]="depositTypes" [selected]="String(f.depositType)" (selectedChange)="f.depositType = +$event"></ts-pill-switch>
          <div style="height: 10px"></div>
          <ts-field [label]="'APP.deposit' | translate" [number]="true" [suffix]="f.depositType === 1 ? '%' : ('APP.egp' | translate)" [hint]="'APP.optional' | translate" [(value)]="f.deposit"></ts-field>
          <ts-switch-row [title]="'APP.payOnArrival' | translate" [(value)]="f.payOnArrival"></ts-switch-row>
          <ts-switch-row [title]="'APP.refundable' | translate" [(value)]="f.refundable"></ts-switch-row>
          <ts-field *ngIf="f.refundable" [label]="'APP.refundDaysBefore' | translate" [number]="true" [(value)]="f.refundDays"></ts-field>
          <ts-field [label]="'APP.cancellationPolicy' | translate" [lines]="3" [(value)]="f.policy"></ts-field>
          <ts-switch-row [title]="'APP.priceIncludesVat' | translate" [(value)]="f.vat"></ts-switch-row>
          <ng-container *ngIf="!vendor">
            <ts-switch-row [title]="'APP.recommended' | translate" [(value)]="f.recommended"></ts-switch-row>
            <ts-switch-row [title]="'APP.publishNow' | translate" [(value)]="f.active"></ts-switch-row>
          </ng-container>
        </ts-form-section>
        <ts-rules-foreign [v]="rules" [title]="'APP.packageRules' | translate"></ts-rules-foreign>
        <ts-form-section [title]="'APP.descriptions' | translate" icon="ti ti-align-right">
          <div class="ts-row-box" *ngFor="let d of descriptions; let i = index; trackBy: byIndex">
            <button type="button" class="ts-row-box__remove" (click)="descriptions.splice(i, 1)"><i class="ti ti-trash"></i></button>
            <ts-rich-text [label]="'APP.paragraph' | translate" [height]="140" [value]="d" (valueChange)="descriptions[i] = $event"></ts-rich-text>
          </div>
          <button type="button" class="btn btn-secondary" (click)="descriptions.push('')"><i class="ti ti-plus"></i>{{ 'APP.addParagraph' | translate }}</button>
        </ts-form-section>
        <ts-form-section [title]="'APP.tripFeatures' | translate" [subtitle]="'APP.tripFeaturesHint' | translate" icon="ti ti-checklist" kind="general">
          <ts-chipbar *ngIf="features" [wrap]="true" [items]="chips(features)" [selected]="featureKeys()" (tap)="toggleFeature(+$event)"></ts-chipbar>
          <ts-new-feature *ngIf="features" [existing]="features" (created)="featureAdded($event)"></ts-new-feature>
          <span class="ts-label">{{ 'APP.accommodationType' | translate }}</span>
          <ts-chipbar *ngIf="accommodations" [wrap]="true" [items]="chips(accommodations)" [selected]="accId ? [accId] : []" (tap)="accId = accId === $event ? null : $event"></ts-chipbar>
        </ts-form-section>
        <ts-form-section [title]="'APP.images' | translate" [subtitle]="'APP.imagesHint' | translate" icon="ti ti-photo" kind="media">
          <ts-images-field [(files)]="images" [existing]="existingImages" (removeExisting)="removeImage($event)"></ts-images-field>
        </ts-form-section>
      </ng-container>

      <ts-form-section *ngIf="step === 2" [title]="'APP.stepProgram' | translate" [subtitle]="'APP.programHint' | translate" icon="ti ti-route" kind="schedule">
        <ts-program-editor [(rows)]="program"></ts-program-editor>
      </ts-form-section>

      <ts-form-section *ngIf="step === 3" [title]="'APP.stepRooms' | translate" [subtitle]="'APP.roomsHint' | translate" icon="ti ti-bed">
        <ts-rooms-editor [(rows)]="rooms"></ts-rooms-editor>
      </ts-form-section>
    </ts-step-scaffold>
  `
})
export class HajjFormComponent implements OnInit {
  private readonly api = inject(FormsApi);
  private readonly products = inject(ProductsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  readonly String = String;
  byIndex = (i: number) => i;
  int = (v: string) => intOf(v);

  step = 0;
  busy = false;
  /** Editing this package (?id=), else a new one. */
  id: number | null = null;
  loading = false;
  loadError: unknown = null;
  existingImages: string[] = [];
  private existingImageIds: number[] = [];
  private removedImageIds: number[] = [];
  private originalStepIds = new Set<number>();
  private originalRoomIds = new Set<number>();
  /** The rule and foreign price as loaded: saved again only when changed. */
  private rulesAtLoad = '';
  /** Fields the form doesn't show, sent back as they were (UpdateHajj maps every field). */
  private kept: Record<string, unknown> = {};
  f: any = {
    type: 2,
    name: '',
    days: '',
    makkah: '',
    madinah: '',
    resMakkah: '',
    resMadinah: '',
    from: '',
    to: '',
    flight: '',
    link: '',
    category: null as Picked | null,
    country: null as Picked | null,
    city: null as Picked | null,
    vendor: null as Picked | null,
    price: '',
    childPrice: '',
    priceBefore: '',
    capacity: '',
    deposit: '',
    refundDays: '',
    policy: '',
    depositType: 1,
    payOnArrival: false,
    refundable: false,
    vat: true,
    recommended: false,
    active: true
  };
  rules = { min: '1', max: '', foreign: '', foreignChild: '' };
  groups: HajjGroup[] = [{ start: null, seats: null }];
  points: any[] = [];
  children: ChildPolicy[] = [];
  descriptions: string[] = [''];
  images: File[] = [];
  program: ProgramStep[] = [];
  rooms: HajjRoom[] = [newRoom()];
  /** What the package includes (TravelFeature, as the old form) and its accommodation type. */
  features: FilterOption[] | null = null;
  featureIds = new Set<number>();
  accommodations: FilterOption[] | null = null;
  accId: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.queryParams['id'];
    this.id = id ? +id : null;
    if (this.id) this.load();
  }

  /** Fills the form from GetHajjById, the gathering points, the seats per date, the rule and the foreign price. */
  load(): void {
    const id = this.id!;
    this.loading = true;
    this.loadError = null;
    forkJoin([
      this.api.get('/api/Hajj/GetHajjById/', id),
      this.api.existingPoints(4, id).pipe(catchError(() => of([]))),
      this.products.dateSeats(id).pipe(catchError(() => of(null))),
      this.products.bookingRule(4, id).pipe(catchError(() => of(null))),
      this.products.foreignPrice(4, id).pipe(catchError(() => of(null)))
    ]).subscribe({
      next: ([d, points, seats, rule, foreign]) => {
        const f = this.f;
        const num = (v: any) => (v == null ? '' : fmtNum(v));
        f.type = d.type ?? 2;
        f.name = d.name ?? '';
        f.days = String(d.numberOfDays ?? '');
        f.makkah = String(d.daysInMakkah ?? '');
        f.madinah = String(d.daysInMadinah ?? '');
        f.resMakkah = d.residenceInMakkah ?? '';
        f.resMadinah = d.residenceInMadinah ?? '';
        f.flight = d.flightLine ?? '';
        f.from = d.fromLocation ?? '';
        f.to = d.toLocation ?? '';
        f.link = d.externalLink ?? '';
        if (d.hajjCategoryId != null) f.category = { id: String(d.hajjCategoryId), name: d.category?.name ?? `#${d.hajjCategoryId}` };
        if (d.countryId != null) f.country = { id: String(d.countryId), name: d.country?.name ?? `#${d.countryId}` };
        if (d.cityId != null) f.city = { id: String(d.cityId), name: d.city?.name ?? `#${d.cityId}` };
        f.vendor = { id: String(d.vendorId), name: d.companyDto?.name ?? `#${d.vendorId}` };
        f.price = num(d.price);
        f.childPrice = num(d.childPrice);
        f.priceBefore = num(d.priceBefore);
        f.capacity = String(d.capacity ?? '');
        f.depositType = d.depositType ?? 1;
        f.deposit = d.depositRate ? fmtNum(d.depositRate) : '';
        f.payOnArrival = !!d.isAllowPaymentUponArrival;
        f.refundable = !!d.isRefundable;
        f.refundDays = d.minimumDaysToRefund ? String(d.minimumDaysToRefund) : '';
        f.policy = d.cancellationPolicy ?? '';
        f.vat = !!d.isIncludeVate;
        f.recommended = !!d.isRecommended;
        f.active = d.isActive ?? true;
        const seatsOf = new Map<number, number | null>(((seats?.dates ?? []) as any[]).map((x) => [x.hajjDateId ?? x.id, x.seats ?? null]));
        this.groups = ((d.dates ?? []) as any[])
          .map((x) => ({ id: x.id, start: parseDate(x.startDate), seats: seatsOf.get(x.id) ?? null }))
          .sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));
        if (!this.groups.length) this.groups = [{ id: null, start: parseDate(d.startDate), seats: null }];
        this.points = points ?? [];
        this.children = Array.isArray(d.childPricingPolicies) ? d.childPricingPolicies.map(childPolicyFrom) : [];
        this.descriptions = ((d.descriptions ?? []) as any[]).map((x) => x.description ?? '');
        if (!this.descriptions.length) this.descriptions = [''];
        const imgs = ((d.images ?? []) as any[]).filter((x) => x.imageUrl);
        this.existingImages = imgs.map((x) => x.imageUrl);
        this.existingImageIds = imgs.map((x) => x.id);
        this.featureIds = new Set(((d.features ?? []) as any[]).map((x) => x.id));
        const acc = (d.accommodationTypes ?? [])[0]?.id;
        this.accId = acc == null ? null : String(acc);
        this.program = (d.segments ?? []).map(programStepFrom);
        this.originalStepIds = new Set(this.program.map((s) => s.id).filter((x): x is number => x != null));
        const rooms: any[] = d.tickets ?? [];
        this.originalRoomIds = new Set(rooms.map((x) => x.id));
        this.rooms = rooms.map((x) => ({
          ...newRoom(),
          id: x.id,
          type: x.ticketType ?? '',
          description: x.description ?? '',
          price: x.price ?? null,
          quantity: x.availableQuantity ?? null,
          active: x.isActive ?? true
        }));
        if (!this.rooms.length) this.rooms = [newRoom()];
        this.rules = {
          min: String(rule?.minQuantity ?? 1),
          max: rule?.maxQuantity == null ? '' : String(rule.maxQuantity),
          foreign: foreign?.price == null ? '' : fmtNum(foreign.price),
          foreignChild: foreign?.childPrice == null ? '' : fmtNum(foreign.childPrice)
        };
        this.rulesAtLoad = JSON.stringify(this.rules);
        this.kept = { Rating: d.rating ?? 0, IsFake: !!d.isFake, ...(this.vendor ? { IsRecommended: !!d.isRecommended } : {}) };
        this.loading = false;
      },
      error: (e) => {
        this.loadError = e;
        this.loading = false;
      }
    });
  }

  removeImage(i: number): void {
    this.removedImageIds.push(this.existingImageIds[i]);
    this.existingImages = this.existingImages.filter((_, j) => j !== i);
    this.existingImageIds = this.existingImageIds.filter((_, j) => j !== i);
  }

  constructor() {
    this.api.lookupGet('/api/TravelFeature/GetAll').subscribe({ next: (r) => (this.features = r), error: () => (this.features = []) });
    this.api.lookupGet('/api/AccommodationType/GetAllAccommodationTypes').subscribe({ next: (r) => (this.accommodations = r), error: () => (this.accommodations = []) });
  }

  chips(options: FilterOption[]) {
    return options.map((o) => ({ key: o.value, label: o.labelAr }));
  }

  featureKeys(): string[] {
    return [...this.featureIds].map(String);
  }

  /** A feature made (or found) from the form: in the list once, and selected. */
  featureAdded(o: { value: string; labelAr: string }): void {
    if (this.features && !this.features.some((x) => String(x.value) === o.value)) this.features = [...this.features, o as FilterOption];
    this.featureIds = new Set([...this.featureIds, +o.value]);
  }

  toggleFeature(id: number): void {
    this.featureIds.has(id) ? this.featureIds.delete(id) : this.featureIds.add(id);
    this.featureIds = new Set(this.featureIds);
  }

  readonly kinds = [
    { key: '2', label: this.text.tr('APP.umrah') },
    { key: '1', label: this.text.tr('APP.hajj') }
  ];
  readonly depositTypes = [
    { key: '1', label: this.text.tr('APP.percentage') },
    { key: '2', label: this.text.tr('APP.fixedAmount') }
  ];

  get vendor(): boolean {
    return this.session.isVendor;
  }

  get steps(): string[] {
    return ['APP.stepDataPlace', 'APP.stepPricesPolicies', 'APP.stepProgram', 'APP.stepRooms'].map((k) => this.text.tr(k));
  }

  private validate(step = this.step): string | null {
    const f = this.f;
    switch (step) {
      case 0: {
        if ([f.name, f.resMakkah, f.resMadinah, f.from, f.to, f.flight].some((v) => !String(v).trim())) return 'APP.fillRequired';
        if (!intOf(f.days) || intOf(f.days)! <= 0) return 'APP.daysRequired';
        if (!this.groups.length || this.groups.some((g) => !g.start)) return 'APP.datesRequired';
        const days = this.groups.map((g) => new Date(g.start!.getFullYear(), g.start!.getMonth(), g.start!.getDate()).getTime());
        if (new Set(days).size !== days.length) return 'APP.duplicateDates';
        if (!this.vendor && !f.vendor) return 'APP.chooseVendor';
        return null;
      }
      case 1: {
        if (amountOf(f.price) == null || intOf(f.capacity) == null) return 'APP.fillRequired';
        const dep = amountOf(f.deposit);
        if (dep != null && (dep < 0 || (f.depositType === 1 && dep > 100))) return 'APP.depositInvalid';
        if (this.descriptions.every((d) => !d.trim())) return 'APP.descriptionRequired';
        if (!this.images.length && !this.existingImages.length) return 'APP.imageRequired';
        return childPolicyError(this.children);
      }
      case 3:
        if (!this.rooms.length || this.rooms.some((r) => !r.type.trim() || r.price == null || r.quantity == null)) return 'APP.roomsRequired';
    }
    return null;
  }

  jump(i: number): void {
    for (let s = this.step; s < i; s++) {
      const e = this.validate(s);
      if (e) {
        this.step = s;
        return this.text.showError(this.text.tr(e));
      }
    }
    this.step = i;
  }

  async next(): Promise<void> {
    const error = this.validate();
    if (error) return this.text.showError(this.text.tr(error));
    if (this.step < 3) {
      this.step++;
      return;
    }
    if (this.id) return this.saveEdit();
    this.busy = true;
    const f = this.f;
    const tr = (k: string) => this.text.tr(k);
    try {
      const days = intOf(f.days)!;
      const starts = this.groups.map((g) => g.start!).sort((a, b) => a.getTime() - b.getTime());
      const end = new Date(starts[0]);
      end.setDate(end.getDate() + days);
      const id = +(await firstValueFrom(
        this.api.postForm('/api/Hajj/AddHajj/', {
          Type: f.type,
          Name: f.name.trim(),
          HajjCategoryId: f.category?.id ?? null,
          StartDate: starts[0],
          EndDate: end,
          Dates: jsonEach(starts.map((s) => ({ StartDate: s }))),
          NumberOfDays: days,
          DaysInMakkah: intOf(f.makkah) ?? 0,
          DaysInMadinah: intOf(f.madinah) ?? 0,
          ResidenceInMakkah: f.resMakkah.trim(),
          ResidenceInMadinah: f.resMadinah.trim(),
          CountryId: f.country?.id ?? null,
          CityId: f.city?.id ?? null,
          FromLocation: f.from.trim(),
          ToLocation: f.to.trim(),
          FlightLine: f.flight.trim(),
          ExternalLink: f.link.trim(),
          ...(!this.vendor ? { VendorId: f.vendor?.id, IsRecommended: f.recommended } : {}),
          Price: amountOf(f.price),
          ChildPrice: amountOf(f.childPrice),
          PriceBefore: amountOf(f.priceBefore),
          Features: [...this.featureIds],
          // HajjRequest reads this list under the singular name ([FromForm(Name = "AccommodationTypeId")])
          AccommodationTypeId: this.accId ? [+this.accId] : [],
          Capacity: intOf(f.capacity),
          DepositType: amountOf(f.deposit) == null ? null : f.depositType,
          depositRate: amountOf(f.deposit),
          IsAllowPaymentUponArrival: f.payOnArrival,
          IsRefundable: f.refundable,
          MinimumDaysToRefund: f.refundable ? intOf(f.refundDays) : null,
          CancellationPolicy: f.policy.trim(),
          IsIncludeVate: f.vat,
          IsActive: f.active,
          ChildPricingPolicies: jsonEach(this.children.map(childPolicyJson)),
          Descriptions: jsonEach(this.descriptions.filter((d) => d.trim()).map((d) => ({ Description: d.trim() }))),
          ImagesFiles: this.images,
          Tickets: this.rooms.map(roomJson)
        })
      ));
      // The new groups and rooms have ids now; match them back to what was typed
      const saved = await firstValueFrom(this.api.get('/api/Hajj/GetHajjById/', id).pipe(catchError(() => of({} as any))));
      const savedDates: any[] = saved?.dates ?? [];
      const savedRooms: any[] = saved?.tickets ?? [];
      const sameDay = (a: Date | null, b: Date | null) => !!a && !!b && a.toDateString() === b.toDateString();
      const r = this.rules;
      const steps = this.program.filter((s) => s.title.trim());
      const failed = await runFollowUps([
        ...(steps.length
          ? [[tr('APP.stepProgram'), () => this.api.postJson('/api/Hajj/AddHajjProgramStepsV3/', { tripIds: [id], steps: steps.map((s) => camel(programStepJson(s, id, true))) })] as [string, any]]
          : []),
        [tr('APP.gatheringPoints'), () => this.api.gatheringPoints(4, id, cleanPoints(this.points))],
        [tr('APP.bookingRule'), () => this.api.bookingRule(4, id, intOf(r.min) ?? 1, intOf(r.max))],
        ...(amountOf(r.foreign) != null ? [[tr('APP.foreignPrice'), () => this.api.foreignPrice(4, id, amountOf(r.foreign)!, amountOf(r.foreignChild))] as [string, any]] : []),
        ...(this.groups.some((g) => g.seats != null)
          ? [
              [
                tr('APP.dateSeats'),
                () =>
                  this.api.dateSeats(
                    id,
                    this.groups.flatMap((g) => savedDates.filter((d) => sameDay(parseDate(d.startDate), g.start)).map((d) => ({ hajjDateId: d.id, seats: g.seats })))
                  )
              ] as [string, any]
            ]
          : []),
        ...this.rooms.flatMap((room) =>
          savedRooms
            .filter((s) => s.ticketType === room.type.trim())
            .slice(0, 1)
            .flatMap((s) => [
              ...(room.foreign != null ? [[tr('APP.foreignPrice'), () => this.api.foreignPrice(6, s.id, room.foreign!, room.foreignChild)] as [string, any]] : []),
              ...(room.min != null || room.max != null ? [[tr('APP.bookingRule'), () => this.api.bookingRule(6, s.id, room.min ?? 1, room.max)] as [string, any]] : [])
            ])
        )
      ]);
      this.text.showDone(failed.length ? this.text.tr('APP.savedExcept', { n: [...new Set(failed)].join('، ') }) : tr('APP.productSaved'));
      this.location.back();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }

  /**
   * Saves an edited package: PUT UpdateHajj with every field (dates keep their ids, so bookings and seats stay on
   * them; removed images by id), then the rooms by id (UpdateListHajjTicket, removed rooms deleted), the program by
   * id, gathering points, seats per date, and the rule and foreign price when they changed.
   */
  private async saveEdit(): Promise<void> {
    const id = this.id!;
    const f = this.f;
    const tr = (k: string) => this.text.tr(k);
    const rooms = this.rooms;
    if (!rooms.length || rooms.some((r) => !r.type.trim() || r.price == null || r.quantity == null)) return this.text.showError(tr('APP.roomsRequired'));
    this.busy = true;
    try {
      const days = intOf(f.days)!;
      const groups = [...this.groups].sort((a, b) => a.start!.getTime() - b.start!.getTime());
      const end = new Date(groups[0].start!);
      end.setDate(end.getDate() + days);
      await firstValueFrom(
        this.api.postForm(
          '/api/Hajj/UpdateHajj/',
          {
            Id: id,
            ...this.kept,
            Type: f.type,
            Name: f.name.trim(),
            HajjCategoryId: f.category?.id ?? null,
            StartDate: groups[0].start,
            EndDate: end,
            Dates: jsonEach(groups.map((g) => ({ ...(g.id ? { Id: g.id } : {}), StartDate: g.start }))),
            NumberOfDays: days,
            DaysInMakkah: intOf(f.makkah) ?? 0,
            DaysInMadinah: intOf(f.madinah) ?? 0,
            ResidenceInMakkah: f.resMakkah.trim(),
            ResidenceInMadinah: f.resMadinah.trim(),
            CountryId: f.country?.id ?? null,
            CityId: f.city?.id ?? null,
            FromLocation: f.from.trim(),
            ToLocation: f.to.trim(),
            FlightLine: f.flight.trim(),
            ExternalLink: f.link.trim(),
            ...(!this.vendor ? { VendorId: f.vendor?.id, IsRecommended: f.recommended } : {}),
            Price: amountOf(f.price),
            ChildPrice: amountOf(f.childPrice),
            PriceBefore: amountOf(f.priceBefore),
            Features: [...this.featureIds],
            AccommodationTypeId: this.accId ? [+this.accId] : [],
            Capacity: intOf(f.capacity),
            DepositType: amountOf(f.deposit) == null ? null : f.depositType,
            depositRate: amountOf(f.deposit),
            IsAllowPaymentUponArrival: f.payOnArrival,
            IsRefundable: f.refundable,
            MinimumDaysToRefund: f.refundable ? intOf(f.refundDays) : null,
            CancellationPolicy: f.policy.trim(),
            IsIncludeVate: f.vat,
            IsActive: f.active,
            ChildPricingPolicies: jsonEach(this.children.map(childPolicyJson)),
            Descriptions: jsonEach(this.descriptions.filter((d) => d.trim()).map((d) => ({ Description: d.trim() }))),
            ImagesFiles: this.images,
            DeletedImageIds: this.removedImageIds
          },
          true
        )
      );

      // Rooms by id: removed ones are deleted (the backend refuses a booked room), the rest updated or added
      const keptRooms = new Set(rooms.filter((r) => r.id != null).map((r) => r.id!));
      for (const removed of [...this.originalRoomIds].filter((x) => !keptRooms.has(x))) await firstValueFrom(this.api.deleteRoom(removed));
      await firstValueFrom(this.api.postJson('/api/HajjTickets/UpdateListHajjTicket/', { hajjId: id, tickets: rooms.map((r) => camel(roomJson(r))) }, true));

      const saved = await firstValueFrom(this.api.get('/api/Hajj/GetHajjById/', id).pipe(catchError(() => of({} as any))));
      const savedDates: any[] = saved?.dates ?? [];
      const savedRooms: any[] = saved?.tickets ?? [];
      const sameDay = (a: Date | null, b: Date | null) => !!a && !!b && a.toDateString() === b.toDateString();
      const steps = this.program.filter((s) => s.title.trim());
      const removedSteps = [...this.originalStepIds].filter((x) => !steps.some((s) => s.id === x));
      const r = this.rules;
      const rulesChanged = JSON.stringify(r) !== this.rulesAtLoad;
      const failed = await runFollowUps([
        ...removedSteps.map((stepId) => [tr('APP.stepProgram'), () => this.api.deleteHajjProgramStep(stepId)] as [string, any]),
        ...(steps.length
          ? [[tr('APP.stepProgram'), () => this.api.updateHajjProgram(id, steps.map((s) => camel(programStepJson(s, id, true))))] as [string, any]]
          : []),
        [tr('APP.gatheringPoints'), () => this.api.gatheringPoints(4, id, cleanPoints(this.points))],
        ...(rulesChanged ? [[tr('APP.bookingRule'), () => this.api.bookingRule(4, id, intOf(r.min) ?? 1, intOf(r.max))] as [string, any]] : []),
        ...(rulesChanged && amountOf(r.foreign) != null ? [[tr('APP.foreignPrice'), () => this.api.foreignPrice(4, id, amountOf(r.foreign)!, amountOf(r.foreignChild))] as [string, any]] : []),
        [
          tr('APP.dateSeats'),
          () =>
            this.api.dateSeats(
              id,
              this.groups.flatMap((g) => savedDates.filter((d) => (g.id ? d.id === g.id : sameDay(parseDate(d.startDate), g.start))).map((d) => ({ hajjDateId: d.id, seats: g.seats })))
            )
        ] as [string, any],
        ...rooms.flatMap((room) =>
          savedRooms
            .filter((x) => (room.id ? x.id === room.id : x.ticketType === room.type.trim()))
            .slice(0, 1)
            .flatMap((x) => [
              ...(room.foreign != null ? [[tr('APP.foreignPrice'), () => this.api.foreignPrice(6, x.id, room.foreign!, room.foreignChild)] as [string, any]] : []),
              ...(room.min != null || room.max != null ? [[tr('APP.bookingRule'), () => this.api.bookingRule(6, x.id, room.min ?? 1, room.max)] as [string, any]] : [])
            ])
        )
      ]);
      this.text.showDone(failed.length ? this.text.tr('APP.savedExcept', { n: [...new Set(failed)].join('، ') }) : tr('APP.saved'));
      this.location.back();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }
}

/**
 * Editing an existing package's rooms (PUT UpdateListHajjTicket keeps each room's id, so booked rooms stay the same
 * rows). The package itself is not re-sent: UpdateHajj also maps the rooms and would replace them with new rows.
 */
@Component({
  selector: 'ts-hajj-rooms',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, RoomsEditorComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.stepRooms' | translate"></ts-appbar>
      <ts-error *ngIf="error" [error]="error"></ts-error>
      <ts-loading *ngIf="!rooms && !error"></ts-loading>
      <ng-container *ngIf="rooms">
        <section class="ts-section"><ts-rooms-editor [(rows)]="rooms"></ts-rooms-editor></section>
        <div class="ts-sticky-foot">
          <button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy" (click)="save()">
            <i *ngIf="busy" class="pi pi-spin pi-spinner"></i>{{ 'APP.save' | translate }}
          </button>
        </div>
      </ng-container>
    </div>
  `
})
export class HajjRoomsComponent implements OnInit {
  private readonly api = inject(FormsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly text = inject(StaffText);
  hajjId = 0;
  rooms: HajjRoom[] | null = null;
  private originalIds = new Set<number>();
  error: unknown = null;
  busy = false;

  ngOnInit(): void {
    this.hajjId = +this.route.snapshot.queryParams['id'];
    this.api.get('/api/Hajj/GetHajjById/', this.hajjId).subscribe({
      next: (d) => {
        const t: any[] = d?.tickets ?? [];
        this.originalIds = new Set(t.map((x) => x.id));
        this.rooms = t.map((x) => ({
          ...newRoom(),
          id: x.id,
          type: x.ticketType ?? '',
          description: x.description ?? '',
          price: x.price ?? null,
          quantity: x.availableQuantity ?? null,
          active: x.isActive ?? true
        }));
      },
      error: (e) => (this.error = e)
    });
  }

  async save(): Promise<void> {
    const rooms = this.rooms!;
    const tr = (k: string) => this.text.tr(k);
    if (rooms.some((r) => !r.type.trim() || r.price == null || r.quantity == null)) return this.text.showError(tr('APP.roomsRequired'));
    this.busy = true;
    try {
      // Rooms removed in the editor are deleted; the backend refuses a room that is booked
      const kept = new Set(rooms.filter((r) => r.id != null).map((r) => r.id!));
      for (const removed of [...this.originalIds].filter((x) => !kept.has(x))) await firstValueFrom(this.api.deleteRoom(removed));
      await firstValueFrom(this.api.postJson('/api/HajjTickets/UpdateListHajjTicket/', { hajjId: this.hajjId, tickets: rooms.map((r) => camel(roomJson(r))) }, true));
      const saved: any[] = (await firstValueFrom(this.api.get('/api/Hajj/GetHajjById/', this.hajjId)))?.tickets ?? [];
      const failed = await runFollowUps(
        rooms.flatMap((room) =>
          saved
            .filter((s) => s.ticketType === room.type.trim())
            .slice(0, 1)
            .flatMap((s) => [
              ...(room.foreign != null ? [[tr('APP.foreignPrice'), () => this.api.foreignPrice(6, s.id, room.foreign!, room.foreignChild)] as [string, any]] : []),
              ...(room.min != null || room.max != null ? [[tr('APP.bookingRule'), () => this.api.bookingRule(6, s.id, room.min ?? 1, room.max)] as [string, any]] : [])
            ])
        )
      );
      this.text.showDone(failed.length ? this.text.tr('APP.savedExcept', { n: [...new Set(failed)].join('، ') }) : tr('APP.saved'));
      this.location.back();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }
}
