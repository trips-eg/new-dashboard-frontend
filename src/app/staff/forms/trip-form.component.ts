import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, forkJoin, of } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { ChipBarComponent } from '../ui/lists';
import { SwitchRowComponent } from '../ui/controls';
import { StaffSession } from '../core/session';
import { FilterOption } from '../core/query';
import { fmtNum, parseDate } from '../core/format';
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

interface TripDateRow {
  id: number;
  start: Date | null;
  end: Date | null;
}

/**
 * f-trip-1 … f-trip-4. Everything is kept in this screen and sent in one request at the end: POST AddTravel (or PUT
 * UpdateTravel with Id), multipart TripRequest. Periodic and daily trips create one trip per date, so the answer is a
 * list of ids, and the program, gathering points, booking rule and foreign price are saved for each of them.
 * UpdateTravel replaces accommodation types, features and pricing periods, which the form edits with the price before
 * discount; Rating, IsRecommended and IsFake are mapped from the request too, so on edit it sends back what it loaded.
 */
@Component({
  selector: 'ts-trip-form',
  standalone: true,
  imports: [RichTextComponent, CommonModule, TranslateModule, ...KIT, ...FORM_KIT, ChipBarComponent, SwitchRowComponent],
  template: `
    <ts-loading *ngIf="loading"></ts-loading>
    <ts-error *ngIf="loadError" [error]="loadError" (retry)="load()"></ts-error>
    <ts-step-scaffold
      *ngIf="!loading && !loadError"
      [title]="(id ? 'APP.editTrip' : 'APP.newTrip') | translate"
      [steps]="steps"
      [current]="step"
      [busy]="busy"
      (back)="step = step - 1"
      (next)="next()"
      (jump)="jump($event)"
    >
      <!-- 1: data and place -->
      <ng-container *ngIf="step === 0">
        <ts-form-section [title]="'APP.stepDataPlace' | translate" icon="ti ti-map" kind="place">
          <ts-field [label]="'APP.tripName' | translate" [required]="true" [(value)]="f.name"></ts-field>
          <span class="ts-label">{{ 'APP.tripType' | translate }}</span>
          <ts-chipbar [wrap]="true" [items]="tripTypes" [selected]="[String(f.tripType)]" (tap)="f.tripType = +$event"></ts-chipbar>
          <p class="ts-muted" style="margin: 6px 0 10px">{{ (f.tripType === 1 ? 'APP.tripNormalHint' : f.tripType === 2 ? 'APP.tripPeriodicHint' : 'APP.tripDailyHint') | translate }}</p>
          <ts-switch-row [title]="'APP.outsideEgypt' | translate" [(value)]="f.external"></ts-switch-row>
          <ts-option-field [label]="'APP.country' | translate" source="countries" [(value)]="f.country"></ts-option-field>
          <ts-option-field [label]="'APP.city' | translate" source="cities" [(value)]="f.city"></ts-option-field>
          <div class="ts-two">
            <ts-field [label]="'APP.tripFromPlace' | translate" [hint]="'APP.tripFromHint' | translate" [required]="true" [(value)]="f.from"></ts-field>
            <ts-field [label]="'APP.tripToPlace' | translate" [hint]="'APP.tripToHint' | translate" [required]="true" [(value)]="f.to"></ts-field>
          </div>
          <ts-field [label]="'APP.mainMeetingPoint' | translate" [required]="true" [(value)]="f.address"></ts-field>
          <ts-option-field *ngIf="!vendor" [label]="'APP.vendor' | translate" source="vendors" [required]="true" [(value)]="f.vendor"></ts-option-field>
        </ts-form-section>
        <ts-form-section [title]="'APP.gatheringPoints' | translate" [subtitle]="'APP.morePoints' | translate" icon="ti ti-map-pin" kind="place">
          <ts-points-editor [(rows)]="points"></ts-points-editor>
        </ts-form-section>
      </ng-container>

      <!-- 2: prices and dates -->
      <ng-container *ngIf="step === 1">
        <ts-form-section [title]="'APP.prices' | translate" icon="ti ti-tag" kind="money">
          <div class="ts-two">
            <ts-field [label]="'APP.adultPrice' | translate" [number]="true" [suffix]="'APP.egp' | translate" [required]="true" [(value)]="f.price"></ts-field>
            <ts-field [label]="'APP.childPrice' | translate" [number]="true" [suffix]="'APP.egp' | translate" [(value)]="f.childPrice"></ts-field>
          </div>
          <ts-field [label]="'APP.priceBefore' | translate" [number]="true" [suffix]="'APP.egp' | translate" [hint]="'APP.priceBeforeHint' | translate" [(value)]="f.priceBefore"></ts-field>
          <div class="ts-two">
            <ts-field [label]="'APP.capacity' | translate" [number]="true" [required]="true" [(value)]="f.capacity"></ts-field>
            <ts-field [label]="'APP.numberOfDays' | translate" [number]="true" [required]="f.tripType === 2" [(value)]="f.days"></ts-field>
          </div>
        </ts-form-section>
        <ts-form-section [title]="'APP.dates' | translate" icon="ti ti-calendar" kind="schedule">
          <div class="ts-row-box" *ngFor="let d of dates; let i = index">
            <button type="button" class="ts-row-box__remove" (click)="dates.splice(i, 1)"><i class="ti ti-trash"></i></button>
            <div [class.ts-two]="f.tripType !== 3">
              <ts-date-field [label]="'APP.start' | translate" [required]="true" [(value)]="d.start"></ts-date-field>
              <ts-date-field *ngIf="f.tripType !== 3" [label]="'APP.end' | translate" [required]="true" [(value)]="d.end"></ts-date-field>
            </div>
          </div>
          <button type="button" class="btn btn-secondary" (click)="dates.push({ id: 0, start: null, end: null })"><i class="ti ti-plus"></i>{{ 'APP.addDate' | translate }}</button>
        </ts-form-section>
        <ts-form-section [title]="'APP.pricingPeriods' | translate" [subtitle]="'APP.pricingPeriodsHint' | translate" icon="ti ti-calendar-dollar" kind="money">
          <div class="ts-row-box" *ngFor="let p of periods; let i = index">
            <button type="button" class="ts-row-box__remove" (click)="periods.splice(i, 1)"><i class="ti ti-trash"></i></button>
            <div class="ts-two">
              <ts-date-field [label]="'APP.start' | translate" [required]="true" [(value)]="p.from"></ts-date-field>
              <ts-date-field [label]="'APP.end' | translate" [required]="true" [(value)]="p.to"></ts-date-field>
            </div>
            <ts-field [label]="'APP.pricePerPerson' | translate" [number]="true" [suffix]="'APP.egp' | translate" [required]="true" [(value)]="p.price"></ts-field>
          </div>
          <button type="button" class="btn btn-secondary" (click)="periods.push({ id: 0, from: null, to: null, price: '' })"><i class="ti ti-plus"></i>{{ 'APP.addPeriod' | translate }}</button>
        </ts-form-section>
        <ts-form-section [title]="'APP.childPricing' | translate" [subtitle]="'APP.childPricingHint' | translate" icon="ti ti-mood-kid" kind="money">
          <ts-child-policies [(rows)]="children"></ts-child-policies>
        </ts-form-section>
        <ts-form-section [title]="'APP.paymentAndRefund' | translate" icon="ti ti-wallet" kind="money">
          <ts-field [label]="'APP.depositRate' | translate" [number]="true" suffix="%" [hint]="'APP.optional' | translate" [(value)]="f.deposit"></ts-field>
          <ts-switch-row [title]="'APP.payOnArrival' | translate" [(value)]="f.payOnArrival"></ts-switch-row>
          <ts-switch-row [title]="'APP.refundable' | translate" [(value)]="f.refundable"></ts-switch-row>
          <ts-field *ngIf="f.refundable" [label]="'APP.refundDaysBefore' | translate" [number]="true" [(value)]="f.refundDays"></ts-field>
          <ts-field [label]="'APP.cancellationPolicy' | translate" [lines]="3" [(value)]="f.policy"></ts-field>
        </ts-form-section>
        <ts-rules-foreign [v]="rules"></ts-rules-foreign>
      </ng-container>

      <!-- 3: details and images -->
      <ng-container *ngIf="step === 2">
        <ts-form-section [title]="'APP.descriptions' | translate" icon="ti ti-align-right" kind="general">
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
        <ts-form-section [title]="'APP.moreOptions' | translate" icon="ti ti-adjustments" kind="general">
          <ts-switch-row [title]="'APP.priceIncludesVat' | translate" [(value)]="f.vat"></ts-switch-row>
          <ng-container *ngIf="!vendor">
            <ts-switch-row [title]="'APP.recommended' | translate" [(value)]="f.recommended"></ts-switch-row>
            <ts-switch-row [title]="'APP.fakeProduct' | translate" [subtitle]="'APP.fakeProductHint' | translate" [(value)]="f.fake"></ts-switch-row>
            <ts-switch-row [title]="'APP.publishNow' | translate" [(value)]="f.active"></ts-switch-row>
          </ng-container>
          <ts-field [label]="'APP.externalLink' | translate" hint="https://" [(value)]="f.link"></ts-field>
        </ts-form-section>
      </ng-container>

      <!-- 4: program -->
      <ts-form-section *ngIf="step === 3" [title]="'APP.stepProgram' | translate" [subtitle]="'APP.programHint' | translate" icon="ti ti-route" kind="schedule">
        <ts-program-editor [(rows)]="program"></ts-program-editor>
      </ts-form-section>
    </ts-step-scaffold>
  `
})
export class TripFormComponent implements OnInit {
  private readonly api = inject(FormsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  readonly String = String;
  byIndex = (i: number) => i;

  id: number | null = null;
  step = 0;
  busy = false;
  loading = false;
  loadError: unknown = null;

  f: any = {
    name: '',
    tripType: 1,
    external: false,
    country: null as Picked | null,
    city: null as Picked | null,
    vendor: null as Picked | null,
    from: '',
    to: '',
    address: '',
    price: '',
    childPrice: '',
    priceBefore: '',
    capacity: '',
    days: '',
    deposit: '',
    payOnArrival: false,
    refundable: false,
    refundDays: '',
    policy: '',
    link: '',
    vat: true,
    recommended: false,
    fake: false,
    active: true
  };
  rules = { min: '1', max: '', foreign: '', foreignChild: '' };
  points: any[] = [];
  dates: TripDateRow[] = [{ id: 0, start: null, end: null }];
  children: ChildPolicy[] = [];
  descriptions: string[] = [''];
  images: File[] = [];
  existingImages: string[] = [];
  private existingImageIds: number[] = [];
  private removedImageIds: number[] = [];
  program: ProgramStep[] = [];
  /** What the trip includes (TravelFeature) and its accommodation type, as the old dashboard sent them. */
  features: FilterOption[] | null = null;
  featureIds = new Set<number>();
  accommodations: FilterOption[] | null = null;
  accId: string | null = null;
  periods: { id: number; from: Date | null; to: Date | null; price: string }[] = [];
  private originalStepIds = new Set<number>();
  /** Loaded on edit and sent back unchanged (see the class comment). */
  private kept: Record<string, unknown> = {};

  get vendor(): boolean {
    return this.session.isVendor;
  }

  get steps(): string[] {
    return ['APP.stepDataPlace', 'APP.stepPricesDates', 'APP.stepDetailsImages', 'APP.stepProgram'].map((k) => this.text.tr(k));
  }

  readonly tripTypes = [
    { key: '1', label: this.text.tr('APP.tripNormal') },
    { key: '2', label: this.text.tr('APP.tripPeriodic') },
    { key: '3', label: this.text.tr('APP.tripDaily') }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.queryParams['id'];
    this.id = id ? +id : null;
    this.api.lookupGet('/api/TravelFeature/GetAll').subscribe({ next: (r) => (this.features = r), error: () => (this.features = []) });
    this.api.lookupGet('/api/AccommodationType/GetAllAccommodationTypes').subscribe({ next: (r) => (this.accommodations = r), error: () => (this.accommodations = []) });
    if (this.id) this.load();
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

  load(): void {
    this.loading = true;
    this.loadError = null;
    forkJoin([this.api.get('/api/Travels/GetTravelById/', this.id!), this.api.existingPoints(1, this.id!).pipe(catchError(() => of([])))]).subscribe({
      next: ([d, points]) => {
        const f = this.f;
        f.name = d.name ?? '';
        f.tripType = d.tripType ?? 1;
        f.external = !!d.isExternallTrip;
        if (d.countryId != null) f.country = { id: String(d.countryId), name: d.country?.name ?? `#${d.countryId}` };
        if (d.cityId != null) f.city = { id: String(d.cityId), name: d.city?.name ?? `#${d.cityId}` };
        f.vendor = { id: String(d.vendorId), name: d.companyDto?.name ?? `#${d.vendorId}` };
        f.from = d.fromLocation ?? '';
        f.to = d.toLocation ?? '';
        f.address = d.address ?? '';
        this.points = points;
        f.price = fmtNum(d.price);
        f.childPrice = d.childPrice == null ? '' : fmtNum(d.childPrice);
        f.capacity = String(d.capacity ?? '');
        f.days = String(d.numberOfDays ?? '');
        this.dates = (d.tripDates ?? []).map((x: any) => ({ id: x.id, start: parseDate(x.startDate), end: parseDate(x.endDate) }));
        if (!this.dates.length) this.dates = [{ id: 0, start: parseDate(d.startDate), end: parseDate(d.endDate) }];
        f.deposit = d.depositRate == null ? '' : fmtNum(d.depositRate);
        f.payOnArrival = !!d.isAllowPaymentUponArrival;
        f.refundable = !!d.isRefundable;
        f.refundDays = d.minimumDaysToRefund == null ? '' : String(d.minimumDaysToRefund);
        f.policy = d.cancellationPolicy ?? '';
        this.children = Array.isArray(d.childPricingPolicies) ? d.childPricingPolicies.map(childPolicyFrom) : [];
        this.descriptions = (d.descriptions ?? []).map((x: any) => x.description ?? '');
        if (!this.descriptions.length) this.descriptions = [''];
        const imgs = (d.images ?? []).filter((x: any) => x.imageUrl);
        this.existingImages = imgs.map((x: any) => x.imageUrl);
        this.existingImageIds = imgs.map((x: any) => x.id);
        f.link = d.externalLink ?? '';
        f.vat = !!d.isIncludeVate;
        f.recommended = !!d.isRecommended;
        f.fake = !!d.isFake;
        f.active = d.isActive ?? true;
        this.program = (d.segments ?? []).map(programStepFrom);
        this.originalStepIds = new Set(this.program.map((s) => s.id));
        f.priceBefore = d.priceBefore == null ? '' : fmtNum(d.priceBefore);
        this.featureIds = new Set((d.features ?? []).map((x: any) => x.id));
        const acc = (d.accommodationTypes ?? [])[0]?.id ?? d.accommodationTypeId;
        this.accId = acc == null ? null : String(acc);
        this.periods = (d.tripPricingPeriods ?? []).map((x: any) => ({
          id: x.id ?? 0,
          from: parseDate(x.fromDate),
          to: parseDate(x.toDate),
          price: x.pricePerPerson == null ? '' : fmtNum(x.pricePerPerson)
        }));
        this.kept = { Rating: d.rating ?? null, IsRecommended: !!d.isRecommended, IsFake: !!d.isFake };
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

  /** The checks of the current step, the same rules the backend applies (ValidateTripsType, child policies). */
  private validate(step = this.step): string | null {
    const f = this.f;
    switch (step) {
      case 0:
        if ([f.name, f.from, f.to, f.address].some((v) => !String(v).trim())) return 'APP.fillRequired';
        if (!this.vendor && !f.vendor) return 'APP.chooseVendor';
        return null;
      case 1:
        if (amountOf(f.price) == null || intOf(f.capacity) == null) return 'APP.fillRequired';
        if (!this.dates.length || this.dates.some((d) => !d.start)) return 'APP.datesRequired';
        if (f.tripType !== 3 && this.dates.some((d) => !d.end || d.end < d.start!)) return 'APP.endDateRequired';
        if (f.tripType === 2 && (intOf(f.days) ?? 0) <= 0) return 'APP.daysRequired';
        if (this.periods.some((p) => !p.from || !p.to || p.to < p.from || amountOf(p.price) == null)) return 'APP.periodInvalid';
        return childPolicyError(this.children);
      case 2:
        if (this.descriptions.every((d) => !d.trim())) return 'APP.descriptionRequired';
        if (!this.images.length && !this.existingImages.length) return 'APP.imageRequired';
        return null;
    }
    return null;
  }

  /** The steps bar jumps forward only through valid steps. */
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

  private body(): Record<string, unknown> {
    const f = this.f;
    const first = this.dates[0];
    const days = intOf(f.days) ?? (!first.end ? 1 : Math.round((first.end.getTime() - first.start!.getTime()) / 86400000) + 1);
    return {
      ...this.kept,
      ...(this.id ? { Id: this.id } : {}),
      Name: f.name.trim(),
      TripType: f.tripType,
      IsExternallTrip: f.external,
      CountryId: f.country?.id ?? null,
      CityId: f.city?.id ?? null,
      FromLocation: f.from.trim(),
      ToLocation: f.to.trim(),
      Address: f.address.trim(),
      ...(!this.vendor ? { VendorId: f.vendor?.id } : {}),
      Price: amountOf(f.price),
      ChildPrice: amountOf(f.childPrice),
      PriceBefore: amountOf(f.priceBefore),
      Features: [...this.featureIds],
      // TripRequest reads this list under the singular name ([FromForm(Name = "AccommodationTypeId")])
      AccommodationTypeId: this.accId ? [+this.accId] : [],
      TripPricingPeriods: jsonEach(
        this.periods.map((p) => ({ Id: p.id ?? 0, FromDate: p.from, ToDate: p.to, PricePerPerson: amountOf(p.price) }))
      ),
      Capacity: intOf(f.capacity),
      NumberOfDays: days,
      TripDates: jsonEach(this.dates.map((d) => ({ Id: d.id ?? 0, StartDate: d.start, EndDate: f.tripType === 3 ? null : d.end }))),
      depositRate: amountOf(f.deposit),
      IsAllowPaymentUponArrival: f.payOnArrival,
      IsRefundable: f.refundable,
      MinimumDaysToRefund: f.refundable ? intOf(f.refundDays) : null,
      CancellationPolicy: f.policy.trim(),
      ChildPricingPolicies: jsonEach(this.children.map(childPolicyJson)),
      Descriptions: jsonEach(this.descriptions.filter((d) => d.trim()).map((d) => ({ Description: d.trim() }))),
      ImagesFiles: this.images,
      IsIncludeVate: f.vat,
      ExternalLink: f.link.trim(),
      ...(!this.vendor ? { IsRecommended: f.recommended, IsFake: f.fake } : {}),
      IsActive: f.active
    };
  }

  next(): void {
    const error = this.validate();
    if (error) return this.text.showError(this.text.tr(error));
    if (this.step < 3) {
      this.step++;
      return;
    }
    this.busy = true;
    const done = (created: number[]) => this.followUps(created);
    if (!this.id) {
      this.api.postForm('/api/Travels/AddTravel/', this.body()).subscribe({
        next: (d) => done(((d as any[]) ?? []).map((x) => +x)),
        error: (e) => this.fail(e)
      });
    } else {
      this.api.postForm('/api/Travels/UpdateTravel/', this.body(), true).subscribe({
        // New trips the update made from extra dates come back as createdIds
        next: (d) => done(((d?.createdIds ?? []) as number[]).filter((x) => x !== this.id)),
        error: (e) => this.fail(e)
      });
    }
  }

  private async followUps(created: number[]): Promise<void> {
    const t = (k: string) => this.text.tr(k);
    const ids = [...(this.id ? [this.id] : []), ...created];
    const steps = this.program.filter((s) => s.title.trim());
    const kept = new Set(steps.map((s) => s.id));
    const removedSteps = [...this.originalStepIds].filter((s) => !kept.has(s));
    const r = this.rules;
    const failed = await runFollowUps([
      ...this.removedImageIds.map((imageId) => [t('APP.images'), () => this.api.deleteTripImage(imageId)] as [string, any]),
      // The edited trip keeps its step ids (UpdateProgramSteps updates by id and adds id 0)
      ...(this.id
        ? [
            ...removedSteps.map((stepId) => [t('APP.stepProgram'), () => this.api.deleteProgramStep(stepId)] as [string, any]),
            ...(steps.length ? [[t('APP.stepProgram'), () => this.api.updateTripProgram(this.id!, steps.map((s) => programStepJson(s, 0, true)))] as [string, any]] : [])
          ]
        : []),
      ...(created.length && steps.length
        ? [[t('APP.stepProgram'), () => this.api.postJson('/api/Travels/AddProgramStepsV3/', { tripIds: created, steps: steps.map((s) => programStepJson(s)) })] as [string, any]]
        : []),
      ...ids.flatMap((id) => [
        [t('APP.gatheringPoints'), () => this.api.gatheringPoints(1, id, cleanPoints(this.points))] as [string, any],
        [t('APP.bookingRule'), () => this.api.bookingRule(1, id, intOf(r.min) ?? 1, intOf(r.max))] as [string, any],
        ...(amountOf(r.foreign) != null ? [[t('APP.foreignPrice'), () => this.api.foreignPrice(1, id, amountOf(r.foreign)!, amountOf(r.foreignChild))] as [string, any]] : [])
      ])
    ]);
    this.busy = false;
    this.text.showDone(failed.length ? this.text.tr('APP.savedExcept', { n: [...new Set(failed)].join('، ') }) : t('APP.productSaved'));
    this.location.back();
  }

  private fail(e: unknown): void {
    this.busy = false;
    this.text.showError(e);
  }
}

export { formDate };
