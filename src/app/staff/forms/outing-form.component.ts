import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { ChipBarComponent } from '../ui/lists';
import { PillSwitchComponent, SwitchRowComponent } from '../ui/controls';
import { SheetComponent, StaffDialogs } from '../ui/dialogs';
import { StaffSession } from '../core/session';
import { FilterOption } from '../core/query';
import { fmtNum, parseAmount, parseDate } from '../core/format';
import { ProductsApi } from '../products/products-api';
import { ApiError } from '../core/staff-http';
import { FORM_KIT, FormsApi, Picked, amountOf, cleanPoints, formDate, intOf, runFollowUps } from './form-kit';

interface OutingTicket {
  id: number | null;
  type: string;
  description: string;
  price: number | null;
  quantity: number | null;
  discount: number | null;
  serial: boolean;
  active: boolean;
  foreign: number | null;
  min: number | null;
  max: number | null;
  /** Serial tickets: one code per ticket; the backend wants as many codes as AvailableQuantity. */
  codes: string[];
}

/** One weekly schedule (OutingScheduleRequest): days, validity, and time slots. */
interface ScheduleRow {
  days: number[];
  from: Date | null;
  to: Date | null;
  type: number;
  times: [string, string][];
}

const newTicket = (): OutingTicket => ({
  id: null,
  type: '',
  description: '',
  price: null,
  quantity: null,
  discount: null,
  serial: false,
  active: true,
  foreign: null,
  min: null,
  max: null,
  codes: []
});

/** OutingTicketRequest ([FromBody], camelCase). */
function ticketJson(t: OutingTicket) {
  return {
    ...(t.id != null ? { id: t.id } : {}),
    ticketType: t.type.trim(),
    description: t.description.trim(),
    price: t.price,
    availableQuantity: t.serial && t.id == null ? t.codes.length : t.quantity,
    discountPercentage: t.discount,
    hasSerialNumber: t.serial,
    isActive: t.active,
    excelData: t.serial && t.id == null ? t.codes.map((c) => ({ ticketCode: c })) : []
  };
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * f-outing-1 … f-outing-6. The outing is created at the end of step 2 (POST AddOutingOnly, hidden), and each later
 * step saves to its own controller: add-ons, offers, tickets, schedules. Step 6 checks everything and publishes.
 * Opened with an id, step 2 updates (PUT UpdateOuting) and the tickets are updated by id.
 */
@Component({
  selector: 'ts-outing-form',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ...FORM_KIT, ChipBarComponent, PillSwitchComponent, SwitchRowComponent, SheetComponent],
  template: `
    <ts-loading *ngIf="loading"></ts-loading>
    <ts-error *ngIf="loadError" [error]="loadError" (retry)="load()"></ts-error>
    <ts-step-scaffold
      *ngIf="!loading && !loadError"
      [title]="(editing ? 'APP.editOuting' : 'APP.newOuting') | translate"
      [steps]="steps"
      [current]="step"
      [busy]="busy"
      [nextLabel]="nextLabel"
      (back)="step = step - 1"
      (next)="next()"
      (jump)="jump($event)"
    >
      <!-- 1: data -->
      <ng-container *ngIf="step === 0">
        <ts-form-section [title]="'APP.stepData' | translate" icon="ti ti-info-circle">
          <ts-field [label]="'APP.outingName' | translate" [required]="true" [(value)]="f.name"></ts-field>
          <ts-option-field [label]="'APP.category' | translate" source="outingcategories" [(value)]="f.category"></ts-option-field>
          <ts-option-field *ngIf="!vendor" [label]="'APP.vendor' | translate" source="vendors" [required]="true" [(value)]="f.vendor"></ts-option-field>
          <ts-field [label]="'APP.description' | translate" [lines]="4" [required]="true" [(value)]="f.description"></ts-field>
          <ts-field [label]="'APP.targetAudience' | translate" [hint]="'APP.targetAudienceHint' | translate" [required]="true" [(value)]="f.audience"></ts-field>
          <ts-field [label]="'APP.place' | translate" [required]="true" [(value)]="f.location"></ts-field>
          <ts-field [label]="'APP.externalLink' | translate" hint="https://" [(value)]="f.link"></ts-field>
        </ts-form-section>
        <ts-form-section [title]="'APP.gatheringPoints' | translate" [subtitle]="'APP.morePoints' | translate" icon="ti ti-map-pin" kind="place">
          <ts-points-editor [(rows)]="points"></ts-points-editor>
        </ts-form-section>
      </ng-container>

      <!-- 2: prices and policies -->
      <ng-container *ngIf="step === 1">
        <ts-form-section [title]="'APP.priceDisplay' | translate" icon="ti ti-tag" kind="money">
          <ts-field [label]="'APP.savingsRatio' | translate" [number]="true" suffix="%" [hint]="'APP.optional' | translate" [(value)]="f.savings"></ts-field>
          <ts-field [label]="'APP.priceBefore' | translate" [number]="true" [suffix]="'APP.egp' | translate" [hint]="'APP.priceBeforeHint' | translate" [(value)]="f.priceBefore"></ts-field>
        </ts-form-section>
        <ts-form-section [title]="'APP.paymentAndRefund' | translate" icon="ti ti-wallet" kind="money">
          <ts-field [label]="'APP.depositRate' | translate" [number]="true" suffix="%" [hint]="'APP.optional' | translate" [(value)]="f.deposit"></ts-field>
          <ts-switch-row [title]="'APP.refundable' | translate" [(value)]="f.refundable"></ts-switch-row>
          <ts-field *ngIf="f.refundable" [label]="'APP.refundDaysBefore' | translate" [number]="true" [(value)]="f.refundDays"></ts-field>
          <ts-field [label]="'APP.cancellationPolicy' | translate" [lines]="3" [(value)]="f.policy"></ts-field>
        </ts-form-section>
        <ts-form-section [title]="'APP.outingRules' | translate" [subtitle]="'APP.outingForeignHint' | translate" icon="ti ti-list-check">
          <div class="ts-two">
            <ts-field [label]="'APP.minPerBooking' | translate" [number]="true" [(value)]="f.min"></ts-field>
            <ts-field [label]="'APP.maxPerBooking' | translate" [number]="true" [hint]="'APP.optional' | translate" [(value)]="f.max"></ts-field>
          </div>
        </ts-form-section>
        <ts-form-section [title]="'APP.outingFeatures' | translate" icon="ti ti-star">
          <div class="ts-progress-line" *ngIf="!features"><span></span></div>
          <ts-chipbar *ngIf="features" [wrap]="true" [items]="featureChips()" [selected]="featureKeys()" (tap)="toggleFeature(+$event)"></ts-chipbar>
        </ts-form-section>
        <ts-form-section [title]="'APP.images' | translate" [subtitle]="'APP.imagesHint' | translate" icon="ti ti-photo" kind="media">
          <ts-images-field [(files)]="images" [existing]="existingImages" (removeExisting)="removeImage($event)"></ts-images-field>
        </ts-form-section>
      </ng-container>

      <!-- 3: add-ons and offers -->
      <ng-container *ngIf="step === 2">
        <ts-form-section [title]="'APP.addOns' | translate" [subtitle]="'APP.addOnsHint' | translate" icon="ti ti-square-plus" kind="money">
          <div class="ts-saved-row" *ngFor="let a of savedAddOns">
            <i class="ti ti-circle-check"></i>
            <span class="ts-grow"><strong>{{ a.name }}</strong><small>{{ num(a.price) }} {{ 'APP.egp' | translate }}</small></span>
            <button type="button" class="ts-icon-btn" (click)="deleteSaved('/api/OutingAddOns/DeleteOutingAddOns/', a, a.name)"><i class="ti ti-trash"></i></button>
          </div>
          <div class="ts-row-box" *ngFor="let a of addOns; let i = index">
            <button type="button" class="ts-row-box__remove" (click)="addOns.splice(i, 1)"><i class="ti ti-trash"></i></button>
            <ts-field [label]="'APP.name' | translate" [(value)]="a.name"></ts-field>
            <ts-field [label]="'APP.description' | translate" [(value)]="a.description"></ts-field>
            <ts-field [label]="'APP.price' | translate" [number]="true" [suffix]="'APP.egp' | translate" [(value)]="a.price"></ts-field>
          </div>
          <button type="button" class="btn btn-secondary" (click)="addOns.push({ name: '', description: '', price: '' })"><i class="ti ti-plus"></i>{{ 'APP.addAddOn' | translate }}</button>
        </ts-form-section>
        <ts-form-section [title]="'APP.offers' | translate" [subtitle]="'APP.offersHint' | translate" icon="ti ti-speakerphone" kind="money">
          <div class="ts-saved-row" *ngFor="let o of savedOffers">
            <i class="ti ti-circle-check"></i>
            <span class="ts-grow"><strong>{{ o.title }}</strong><small>{{ o.description }}</small></span>
            <button type="button" class="ts-icon-btn" (click)="deleteSaved('/api/OutingOffers/DeleteOutingOffers/', o, o.title)"><i class="ti ti-trash"></i></button>
          </div>
          <div class="ts-row-box" *ngFor="let o of offers; let i = index">
            <button type="button" class="ts-row-box__remove" (click)="offers.splice(i, 1)"><i class="ti ti-trash"></i></button>
            <ts-field [label]="'APP.title' | translate" [(value)]="o.title"></ts-field>
            <ts-field [label]="'APP.description' | translate" [lines]="2" [(value)]="o.description"></ts-field>
          </div>
          <button type="button" class="btn btn-secondary" (click)="offers.push({ title: '', description: '' })"><i class="ti ti-plus"></i>{{ 'APP.addOffer' | translate }}</button>
        </ts-form-section>
      </ng-container>

      <!-- 4: tickets -->
      <ts-form-section
        *ngIf="step === 3"
        [title]="'APP.stepTickets' | translate"
        [subtitle]="'APP.ticketsHint' | translate"
        icon="ti ti-ticket"
        kind="money"
        [action]="'APP.ticketPreview' | translate"
        (act)="preview = true"
      >
        <div class="ts-row-box" *ngFor="let t of tickets; let i = index">
          <button type="button" class="ts-row-box__remove" (click)="tickets.splice(i, 1)"><i class="ti ti-trash"></i></button>
          <ts-field [label]="'APP.ticketName' | translate" [hint]="'APP.ticketNameHint' | translate" [required]="true" [(value)]="t.type"></ts-field>
          <ts-field [label]="'APP.description' | translate" [(value)]="t.description"></ts-field>
          <div class="ts-two">
            <ts-field [label]="'APP.price' | translate" [number]="true" [suffix]="'APP.egp' | translate" [required]="true" [value]="t.price == null ? '' : num(t.price)" (valueChange)="t.price = amount($event)"></ts-field>
            <!-- Serial tickets: the count is the number of codes (and can't change after saving) -->
            <ts-info *ngIf="t.serial" [label]="'APP.availableQuantity' | translate" [value]="num(t.id == null ? t.codes.length : (t.quantity ?? 0))"></ts-info>
            <ts-field *ngIf="!t.serial" [label]="'APP.availableQuantity' | translate" [number]="true" [required]="true" [value]="t.quantity ?? ''" (valueChange)="t.quantity = int($event)"></ts-field>
          </div>
          <div class="ts-two">
            <ts-field [label]="'APP.discountPercent' | translate" [number]="true" suffix="%" [value]="t.discount == null ? '' : num(t.discount)" (valueChange)="t.discount = amount($event)"></ts-field>
            <ts-field [label]="'APP.foreignPrice' | translate" [number]="true" [hint]="'APP.optional' | translate" [value]="t.foreign == null ? '' : num(t.foreign)" (valueChange)="t.foreign = amount($event)"></ts-field>
          </div>
          <div class="ts-two">
            <ts-field [label]="'APP.minPerBooking' | translate" [number]="true" [hint]="'APP.optional' | translate" [value]="t.min ?? ''" (valueChange)="t.min = int($event)"></ts-field>
            <ts-field [label]="'APP.maxPerBooking' | translate" [number]="true" [hint]="'APP.optional' | translate" [value]="t.max ?? ''" (valueChange)="t.max = int($event)"></ts-field>
          </div>
          <ts-switch-row
            [title]="'APP.serialNumbers' | translate"
            [subtitle]="(t.id == null ? 'APP.serialNumbersHint' : 'APP.serialFixedHint') | translate"
            [value]="t.serial"
            [disabled]="t.id != null"
            (valueChange)="t.serial = $event"
          ></ts-switch-row>
          <ts-field
            *ngIf="t.serial && t.id == null"
            [label]="'APP.ticketCodes' | translate"
            [hint]="'APP.ticketCodesHint' | translate"
            [lines]="4"
            [value]="t.codes.join('\\n')"
            (valueChange)="t.codes = codes($event)"
          ></ts-field>
          <ts-switch-row [title]="'APP.availableForBooking' | translate" [(value)]="t.active"></ts-switch-row>
        </div>
        <button type="button" class="btn btn-secondary" (click)="tickets.push(newTicket())"><i class="ti ti-plus"></i>{{ 'APP.addTicket' | translate }}</button>
      </ts-form-section>

      <!-- 5: schedules -->
      <ts-form-section
        *ngIf="step === 4"
        [title]="'APP.stepSchedules' | translate"
        [subtitle]="savedSchedules.length ? ('APP.savedSchedulesN' | translate: { n: num(savedSchedules.length) }) : ('APP.schedulesHint' | translate)"
        icon="ti ti-calendar-repeat"
        kind="schedule"
      >
        <!-- Saved: one row per weekday (OutingScheduleDto), deleted one by one -->
        <div class="ts-saved-row" *ngFor="let s of savedSchedules">
          <i class="ti ti-circle-check"></i>
          <span class="ts-grow"><strong>{{ days[s.dayOfWeek % 7] }}</strong><small class="ts-num">{{ slotsOf(s) }}</small></span>
          <button type="button" class="ts-icon-btn" (click)="deleteSaved('/api/OutingSchedules/DeleteOutingSchedules/', s, days[s.dayOfWeek % 7])"><i class="ti ti-trash"></i></button>
        </div>
        <div class="ts-row-box" *ngFor="let s of schedules; let i = index">
          <button type="button" class="ts-row-box__remove" (click)="schedules.splice(i, 1)"><i class="ti ti-trash"></i></button>
          <ts-chipbar [wrap]="true" [items]="dayChips" [selected]="dayKeys(s)" (tap)="toggleDay(s, +$event)"></ts-chipbar>
          <div class="ts-two" style="margin-top: 10px">
            <ts-date-field [label]="'APP.validFrom' | translate" [(value)]="s.from"></ts-date-field>
            <ts-date-field [label]="'APP.validTo' | translate" [(value)]="s.to"></ts-date-field>
          </div>
          <ts-pill-switch [items]="scheduleTypes" [selected]="String(s.type)" (selectedChange)="s.type = +$event"></ts-pill-switch>
          <div class="ts-time-row" *ngFor="let x of s.times; let j = index">
            <ts-field [label]="'APP.start' | translate" hint="09:00" [value]="x[0]" (valueChange)="x[0] = $event"></ts-field>
            <ts-field [label]="'APP.end' | translate" hint="12:00" [value]="x[1]" (valueChange)="x[1] = $event"></ts-field>
            <button type="button" class="ts-icon-btn" (click)="s.times.splice(j, 1)"><i class="ti ti-circle-minus"></i></button>
          </div>
          <button type="button" class="btn btn-link" (click)="s.times.push(['09:00', '12:00'])"><i class="ti ti-plus"></i>{{ 'APP.addTime' | translate }}</button>
        </div>
        <button type="button" class="btn btn-secondary" (click)="schedules.push({ days: [], from: null, to: null, type: 1, times: [['09:00', '12:00']] })">
          <i class="ti ti-plus"></i>{{ 'APP.addSchedule' | translate }}
        </button>
      </ts-form-section>

      <!-- 6: review -->
      <ts-form-section
        *ngIf="step === 5"
        [title]="'APP.stepReview' | translate"
        [subtitle]="(active ? 'APP.alreadyPublished' : 'APP.reviewThenPublish') | translate"
        icon="ti ti-checklist"
      >
        <div class="ts-check" *ngFor="let c of checks()">
          <i [class]="c.ok ? 'ti ti-circle-check' : 'ti ti-alert-circle'" [style.color]="c.ok ? 'var(--ts-ok-fg)' : 'var(--ts-pend-ink)'"></i>
          <span class="ts-grow">{{ c.label | translate }}</span>
          <ts-pill *ngIf="!c.ok" tone="pending">{{ 'APP.missing' | translate }}</ts-pill>
        </div>
        <button type="button" class="btn btn-secondary" style="margin-top: 8px" (click)="preview = true"><i class="ti ti-ticket"></i>{{ 'APP.ticketPreview' | translate }}</button>
      </ts-form-section>
    </ts-step-scaffold>

    <!-- f-outing-ticket: how the ticket looks in the customer app (the QR is a sample) -->
    <ts-sheet [open]="preview" (openChange)="preview = false" [title]="'APP.ticketPreview' | translate" [footer]="false">
      <p class="ts-muted">{{ 'APP.ticketPreviewHint' | translate }}</p>
      <div class="ts-ticket-preview">
        <h3>{{ f.name || ('APP.outingName' | translate) }}</h3>
        <p style="color: var(--ts-teal)">{{ tickets[0]?.type || ('APP.ticketName' | translate) }}</p>
        <i class="ti ti-qrcode"></i>
        <small class="ts-num">#0001</small>
        <ts-info [label]="'APP.quantity' | translate" value="2"></ts-info>
        <ts-info *ngIf="tickets[0]?.price != null" [label]="'APP.price' | translate" [value]="num(tickets[0].price) + ' ' + ('APP.egp' | translate)"></ts-info>
      </div>
    </ts-sheet>
  `
})
export class OutingFormComponent implements OnInit {
  private readonly api = inject(FormsApi);
  private readonly products = inject(ProductsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  readonly String = String;
  readonly newTicket = newTicket;
  num = fmtNum;
  amount = parseAmount;
  int = (v: string) => intOf(v);

  editing = false;
  outingId: number | null = null;
  step = 0;
  busy = false;
  loading = false;
  loadError: unknown = null;
  active = false;
  preview = false;

  f: any = {
    name: '',
    description: '',
    audience: '',
    location: '',
    link: '',
    category: null as Picked | null,
    vendor: null as Picked | null,
    savings: '',
    priceBefore: '',
    deposit: '',
    refundable: false,
    refundDays: '',
    policy: '',
    min: '1',
    max: ''
  };
  points: any[] = [];
  images: File[] = [];
  existingImages: string[] = [];
  private existingImageIds: number[] = [];
  private removedImageIds: number[] = [];
  /** Feature ids picked now and the ones loaded: UpdateOuting adds new Features and removes DeletedFeatureIds. */
  featureIds = new Set<number>();
  private savedFeatureIds = new Set<number>();
  features: FilterOption[] | null = null;
  addOns: any[] = [];
  offers: any[] = [];
  savedAddOns: any[] = [];
  savedOffers: any[] = [];
  savedSchedules: any[] = [];
  tickets: OutingTicket[] = [newTicket()];
  private originalTicketIds = new Set<number>();
  schedules: ScheduleRow[] = [];
  /** UpdateOuting maps Rating, IsBlocked and ImageUrl and replaces the branches with Branshes: sent back as loaded. */
  private kept: Record<string, unknown> = { Rating: 0, IsBlocked: false, ImageUrl: '' };

  readonly days = ['APP.sun', 'APP.mon', 'APP.tue', 'APP.wed', 'APP.thu', 'APP.fri', 'APP.sat'].map((k) => this.text.tr(k));
  readonly dayChips = this.days.map((d, i) => ({ key: String(i), label: d }));
  readonly scheduleTypes = [
    { key: '1', label: this.text.tr('APP.fixedTimes') },
    { key: '2', label: this.text.tr('APP.openInterval') }
  ];

  get vendor(): boolean {
    return this.session.isVendor;
  }

  get steps(): string[] {
    return ['APP.stepData', 'APP.stepPricesPolicies', 'APP.stepAddOns', 'APP.stepTickets', 'APP.stepSchedules', 'APP.stepReview'].map((k) => this.text.tr(k));
  }

  get nextLabel(): string | null {
    if (this.step === 1) return this.text.tr(this.outingId == null ? 'APP.saveAndContinue' : 'APP.updateAndContinue');
    if (this.step === 5) return this.text.tr(this.active ? 'APP.done' : 'APP.publish');
    return null;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.queryParams['id'];
    this.outingId = id ? +id : null;
    this.editing = !!this.outingId;
    this.api.lookup('/api/OutingFeature/GetAllOutingFeatures').subscribe({ next: (r) => (this.features = r), error: () => (this.features = []) });
    if (this.outingId) this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = null;
    this.api.get('/api/Outings/GetOutingById/', this.outingId!).subscribe({
      next: (d) => {
        const f = this.f;
        f.name = d.name ?? '';
        f.description = d.description ?? '';
        f.audience = d.targetAudience ?? '';
        f.location = d.location ?? '';
        f.link = d.externalLink ?? '';
        if (d.outingCategoryId != null) f.category = { id: String(d.outingCategoryId), name: d.outingCategoryName ?? '' };
        if (d.vendorId != null) f.vendor = { id: String(d.vendorId), name: d.vendorName ?? '' };
        f.savings = d.savingsRatio == null ? '' : fmtNum(d.savingsRatio);
        f.priceBefore = d.priceBefore == null ? '' : fmtNum(d.priceBefore);
        f.deposit = d.depositRate == null ? '' : fmtNum(d.depositRate);
        f.refundable = !!d.isRefundable;
        f.refundDays = d.minimumDaysToRefund == null ? '' : String(d.minimumDaysToRefund);
        f.policy = d.cancellationPolicy ?? '';
        this.applyImages(d);
        this.active = !!d.isActive;
        this.savedFeatureIds = new Set((d.features ?? []).map((x: any) => x.id));
        this.featureIds = new Set(this.savedFeatureIds);
        this.kept = { Rating: d.rating ?? 0, IsBlocked: !!d.isBlocked, ImageUrl: d.imageUrl ?? '', Branshes: (d.branshes ?? []).map((b: any) => b.id) };
        this.applySaved(d);
        this.tickets = (d.tickets ?? []).map((t: any) => ({
          ...newTicket(),
          id: t.id,
          type: t.ticketType ?? '',
          description: t.description ?? '',
          price: t.price ?? null,
          quantity: t.availableQuantity ?? null,
          discount: t.discountPercentage ?? null,
          serial: !!t.hasSerialNumber,
          active: t.isActive ?? true
        }));
        this.originalTicketIds = new Set(this.tickets.map((t) => t.id!));
        if (!this.tickets.length) this.tickets = [newTicket()];
        this.api.existingPoints(2, this.outingId!).pipe(catchError(() => of([]))).subscribe((p) => (this.points = p));
        this.loading = false;
      },
      error: (e) => {
        this.loadError = e;
        this.loading = false;
      }
    });
  }

  private applyImages(d: any): void {
    const imgs = (d.images ?? []).filter((x: any) => x.url);
    this.existingImages = imgs.map((x: any) => x.url);
    this.existingImageIds = imgs.map((x: any) => x.id);
  }

  /** The rows already on the server, each with its id so it can be deleted. */
  private applySaved(d: any): void {
    this.savedAddOns = d.addOns ?? [];
    this.savedOffers = d.offers ?? [];
    this.savedSchedules = d.outingSchedules ?? [];
  }

  private async reloadSaved(): Promise<void> {
    this.applySaved(await firstValueFrom(this.api.get('/api/Outings/GetOutingById/', this.outingId!)));
  }

  async deleteSaved(path: string, row: any, label: string): Promise<void> {
    const t = (k: string) => this.text.tr(k);
    if (!(await this.dialogs.confirm({ title: t('APP.delete'), message: label, confirm: t('APP.delete'), danger: true }))) return;
    try {
      await firstValueFrom(this.api.delete(path, row.id));
      await this.reloadSaved();
    } catch (e) {
      this.text.showError(e);
    }
  }

  removeImage(i: number): void {
    this.removedImageIds.push(this.existingImageIds[i]);
    this.existingImages = this.existingImages.filter((_, j) => j !== i);
    this.existingImageIds = this.existingImageIds.filter((_, j) => j !== i);
  }

  featureChips() {
    return (this.features ?? []).map((o) => ({ key: o.value, label: o.labelAr }));
  }

  featureKeys(): string[] {
    return [...this.featureIds].map(String);
  }

  toggleFeature(id: number): void {
    this.featureIds.has(id) ? this.featureIds.delete(id) : this.featureIds.add(id);
    this.featureIds = new Set(this.featureIds);
  }

  dayKeys(s: ScheduleRow): string[] {
    return s.days.map(String);
  }

  toggleDay(s: ScheduleRow, d: number): void {
    s.days = s.days.includes(d) ? s.days.filter((x) => x !== d) : [...s.days, d];
  }

  slotsOf(s: any): string {
    return (s.timeSlots ?? []).map((x: any) => `${x.startTime}–${x.endTime}`).join('  ');
  }

  codes(v: string): string[] {
    return v
      .split(/[\n,]/)
      .map((c) => c.trim())
      .filter((c) => !!c);
  }

  checks() {
    return [
      { label: 'APP.stepData', ok: !!this.f.name.trim() },
      { label: 'APP.images', ok: this.images.length > 0 || this.existingImages.length > 0 },
      { label: 'APP.stepTickets', ok: this.tickets.some((t) => t.id != null) },
      { label: 'APP.stepSchedules', ok: this.savedSchedules.length > 0 },
      { label: 'APP.gatheringPoints', ok: this.points.some((p) => (p.name ?? '').trim()) }
    ];
  }

  private validate(step = this.step): string | null {
    const f = this.f;
    if (step === 0 && [f.name, f.description, f.audience, f.location].some((v) => !String(v).trim())) return 'APP.fillRequired';
    if (step === 0 && !this.vendor && !f.vendor) return 'APP.chooseVendor';
    if (step === 1 && !this.images.length && !this.existingImages.length) return 'APP.imageRequired';
    // AddOutingOnly binds Features as a required int[]: a new outing without one is refused
    if (step === 1 && this.outingId == null && !this.featureIds.size) return 'APP.featuresRequired';
    if (step === 3 && (!this.tickets.length || this.tickets.some((t) => !t.type.trim() || t.price == null))) return 'APP.ticketsRequired';
    if (step === 3 && this.tickets.some((t) => (t.serial && t.id == null ? !t.codes.length : t.quantity == null))) return 'APP.ticketsRequired';
    if (step === 4 && this.schedules.some((s) => !s.days.length || !s.times.length || !s.from || !s.to)) return 'APP.scheduleDaysRequired';
    if (step === 4 && this.schedules.some((s) => s.times.some((x) => !TIME.test(x[0]) || !TIME.test(x[1]) || x[0] >= x[1]))) return 'APP.scheduleTimesInvalid';
    return null;
  }

  /** Every step saves its own part, so the bar only jumps back, or forward one step through Next. */
  jump(i: number): void {
    if (i < this.step) this.step = i;
    else if (i === this.step + 1) this.next();
  }

  /** Saves what the current step owns, then moves on. Each save is idempotent for its step. */
  async next(): Promise<void> {
    const error = this.validate();
    if (error) return this.text.showError(this.text.tr(error));
    this.busy = true;
    try {
      switch (this.step) {
        case 1:
          await this.saveOuting();
          break;
        case 2:
          await this.saveAddOnsAndOffers();
          break;
        case 3:
          await this.saveTickets();
          break;
        case 4:
          await this.saveSchedules();
          break;
        case 5: {
          const missing = !this.tickets.some((t) => t.id != null) || !this.savedSchedules.length;
          if (!this.active && missing) {
            const ok = await this.dialogs.confirm({
              title: this.text.tr('APP.publish'),
              message: this.text.tr('APP.publishIncompleteQ'),
              confirm: this.text.tr('APP.publish')
            });
            if (!ok) return;
          }
          let done = 'APP.productSaved';
          if (!this.active) {
            try {
              await firstValueFrom(this.products.setActive(2, this.outingId!, true));
            } catch (e) {
              // A vendor's new or changed outing waits for the admins: everything is saved, it only isn't live yet
              if (!(e instanceof ApiError && e.code === 'FORBIDDEN_SCOPE')) throw e;
              done = 'APP.savedPendingApproval';
            }
          }
          this.text.showDone(this.text.tr(done));
          this.location.back();
          return;
        }
      }
      this.step++;
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }

  private async saveOuting(): Promise<void> {
    const f = this.f;
    const body: Record<string, unknown> = {
      ...this.kept,
      ...(this.outingId != null ? { Id: this.outingId } : {}),
      Name: f.name.trim(),
      Description: f.description.trim(),
      TargetAudience: f.audience.trim(),
      Location: f.location.trim(),
      OutingCategoryId: f.category?.id ?? null,
      ...(!this.vendor ? { VendorId: f.vendor?.id } : {}),
      ExternalLink: f.link.trim(),
      // Created hidden: it is published from the review step once tickets and schedules exist
      IsActive: this.outingId == null ? false : this.active,
      SavingsRatio: amountOf(f.savings),
      PriceBefore: amountOf(f.priceBefore),
      depositRate: amountOf(f.deposit),
      IsRefundable: f.refundable,
      MinimumDaysToRefund: f.refundable ? intOf(f.refundDays) : null,
      CancellationPolicy: f.policy.trim(),
      UploadedImages: this.images,
      Features: [...this.featureIds],
      ...(this.outingId != null ? { DeletedImageIds: this.removedImageIds, DeletedFeatureIds: [...this.savedFeatureIds].filter((x) => !this.featureIds.has(x)) } : {})
    };
    if (this.outingId == null) {
      this.outingId = +(await firstValueFrom(this.api.postForm('/api/Outings/AddOutingOnly/', body)));
    } else {
      await firstValueFrom(this.api.postForm('/api/Outings/UpdateOuting/', body, true));
      this.removedImageIds = [];
    }
    this.savedFeatureIds = new Set(this.featureIds);
    // The new images are on the server now: a retry of this step must not upload them again
    this.images = [];
    const saved = await firstValueFrom(this.api.get('/api/Outings/GetOutingById/', this.outingId!));
    this.applyImages(saved);
    this.kept = { ...this.kept, ImageUrl: saved.imageUrl ?? '', Branshes: (saved.branshes ?? []).map((b: any) => b.id) };
    const id = this.outingId!;
    const t = (k: string) => this.text.tr(k);
    const failed = await runFollowUps([
      [t('APP.gatheringPoints'), () => this.api.gatheringPoints(2, id, cleanPoints(this.points))],
      [t('APP.bookingRule'), () => this.api.bookingRule(2, id, intOf(f.min) ?? 1, intOf(f.max))]
    ]);
    if (failed.length) this.text.showError(this.text.tr('APP.savedExcept', { n: failed.join('، ') }));
  }

  /** Each part leaves the form as soon as it is saved, so pressing Next again sends only what is still unsaved. */
  private async saveAddOnsAndOffers(): Promise<void> {
    const id = this.outingId!;
    const newAddOns = this.addOns.filter((a) => (a.name ?? '').trim());
    const newOffers = this.offers.filter((o) => (o.title ?? '').trim());
    if (newAddOns.length) {
      await firstValueFrom(
        this.api.postJson('/api/OutingAddOns/AddOutingAddOns/', {
          outingId: id,
          addOns: newAddOns.map((a) => ({ name: a.name.trim(), description: (a.description ?? '').trim(), price: parseAmount(a.price), outingId: id }))
        })
      );
      this.addOns = [];
    }
    for (const o of newOffers) {
      await firstValueFrom(this.api.postJson('/api/OutingOffers/AddOutingOffers', { title: o.title.trim(), description: (o.description ?? '').trim(), outingId: id }));
      this.offers = this.offers.filter((x) => x !== o);
    }
    this.offers = [];
    if (newAddOns.length || newOffers.length) await this.reloadSaved();
  }

  /** Each call updates the state as soon as it succeeds, so a retry after a failure repeats nothing. */
  private async saveTickets(): Promise<void> {
    const id = this.outingId!;
    const kept = new Set(this.tickets.filter((t) => t.id != null).map((t) => t.id!));
    for (const removed of [...this.originalTicketIds].filter((x) => !kept.has(x))) {
      await firstValueFrom(this.api.deleteOutingTicket(removed));
      this.originalTicketIds.delete(removed);
    }
    const existing = this.tickets.filter((t) => t.id != null);
    if (existing.length) {
      await firstValueFrom(this.api.postJson('/api/OutingTickets/UpdateListOutingTicket/', { outingId: id, tickets: existing.map(ticketJson) }, true));
    }
    const added = this.tickets.filter((t) => t.id == null);
    if (added.length) {
      const ids = ((await firstValueFrom(this.api.postJson('/api/OutingTickets/AddOutingTickets', { outingId: id, tickets: added.map(ticketJson) }))) ?? []) as number[];
      let i = 0;
      // A new ticket takes the id AddOutingTickets returned (same order)
      this.tickets = this.tickets.map((t) => (t.id == null && i < ids.length ? { ...t, id: +ids[i++], quantity: t.serial ? t.codes.length : t.quantity } : t));
      this.originalTicketIds = new Set(this.tickets.filter((t) => t.id != null).map((t) => t.id!));
    }
    // Per-ticket foreign price and limits (StaffItemType 5)
    const tr = (k: string) => this.text.tr(k);
    const failed = await runFollowUps(
      this.tickets
        .filter((t) => t.id != null)
        .flatMap((t) => [
          ...(t.foreign != null ? [[tr('APP.foreignPrice'), () => this.api.foreignPrice(5, t.id!, t.foreign!, null)] as [string, any]] : []),
          ...(t.min != null || t.max != null ? [[tr('APP.bookingRule'), () => this.api.bookingRule(5, t.id!, t.min ?? 1, t.max)] as [string, any]] : [])
        ])
    );
    if (failed.length) this.text.showError(this.text.tr('APP.savedExcept', { n: [...new Set(failed)].join('، ') }));
  }

  private async saveSchedules(): Promise<void> {
    if (!this.schedules.length) return;
    const id = this.outingId!;
    await firstValueFrom(
      this.api.postJson('/api/OutingSchedules/AddOutingSchedules', {
        outingId: id,
        schedules: this.schedules.map((s) => ({
          outingId: id,
          dayOfWeek: [...s.days].sort(),
          validFrom: s.from ? formDate(s.from) : null,
          validTo: s.to ? formDate(s.to) : null,
          schedualType: s.type,
          times: s.times.map((t) => ({ startTime: t[0], endTime: t[1] }))
        }))
      })
    );
    this.schedules = [];
    await this.reloadSaved();
  }
}

export { parseDate };
