import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { ChipBarComponent } from '../ui/lists';
import { SwitchRowComponent } from '../ui/controls';
import { StaffDialogs } from '../ui/dialogs';
import { P, StaffSession } from '../core/session';
import { FilterOption } from '../core/query';
import { fmtNum, parseAmount, parseDate } from '../core/format';
import { FORM_KIT, FormsApi, Picked, amountOf, intOf } from './form-kit';

/** A price for a date range (CustomPrices in C#): replaces the night price between From and To. */
interface SeasonPrice {
  id: number;
  from: Date | null;
  to: Date | null;
  price: number | null;
}

/** The backend's rule for season prices (RoomServices.ValidateCustomPrices): From before To, and no overlaps. */
function seasonPriceError(rows: SeasonPrice[]): string | null {
  for (const r of rows) {
    if (!r.from || !r.to || r.price == null) return 'APP.fillRequired';
    if (!(r.from < r.to)) return 'APP.seasonDatesInvalid';
  }
  for (let i = 0; i < rows.length; i++)
    for (let j = i + 1; j < rows.length; j++) if (rows[i].from! < rows[j].to! && rows[j].from! < rows[i].to!) return 'APP.seasonOverlap';
  return null;
}

/**
 * a-room-form: one room type of a hotel. POST AddRoom or PUT UpdateRoom (multipart RoomRequest). The backend saves a
 * room under the signed-in vendor's company and refuses an account without one, so it is offered to vendors only.
 */
@Component({
  selector: 'ts-room-form',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ...FORM_KIT, ChipBarComponent, SwitchRowComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="(id ? 'APP.editRoomType' : 'APP.newRoomType') | translate" [subtitle]="hotelName">
        <button *ngIf="canDelete" type="button" class="ts-icon-btn" (click)="remove()" [title]="'APP.delete' | translate"><i class="ti ti-trash"></i></button>
      </ts-appbar>
      <ts-loading *ngIf="loading"></ts-loading>
      <ts-error *ngIf="loadError" [error]="loadError" (retry)="load()"></ts-error>
      <ng-container *ngIf="!loading && !loadError">
        <section class="ts-section">
          <ts-field [label]="'APP.roomTypeName' | translate" [required]="true" [(value)]="f.name"></ts-field>
          <ts-option-field [label]="'APP.roomCategory' | translate" source="/api/RoomTypes/GetAllRoomTypes/" [required]="true" [(value)]="f.roomType"></ts-option-field>
          <div class="ts-two">
            <ts-option-field [label]="'APP.bed' | translate" source="/api/BedType/GetAllBedTypes/" [required]="true" [(value)]="f.bedType"></ts-option-field>
            <ts-field [label]="'APP.bedCount' | translate" [number]="true" [(value)]="f.beds"></ts-field>
          </div>
          <div class="ts-two">
            <ts-field [label]="'APP.nightPrice' | translate" [number]="true" [suffix]="'APP.egp' | translate" [required]="true" [(value)]="f.price"></ts-field>
            <ts-field [label]="'APP.weekendPrice' | translate" [number]="true" [suffix]="'APP.egp' | translate" [hint]="'APP.optional' | translate" [(value)]="f.holiday"></ts-field>
          </div>
          <div class="ts-two">
            <ts-field [label]="'APP.childPrice' | translate" [number]="true" [suffix]="'APP.egp' | translate" [hint]="'APP.optional' | translate" [(value)]="f.child"></ts-field>
            <ts-field [label]="'APP.roomSize' | translate" [number]="true" suffix="m²" [hint]="'APP.optional' | translate" [(value)]="f.size"></ts-field>
          </div>
          <ts-field [label]="'APP.description' | translate" [lines]="3" [(value)]="f.description"></ts-field>
        </section>
        <ts-form-section [title]="'APP.meals' | translate" icon="ti ti-tools-kitchen-2">
          <!-- BordingType 0–5; the premium and ultra variants (6–10) are kept if the room already has one -->
          <ts-chipbar [wrap]="true" [items]="boardings()" [selected]="[String(f.boardingType)]" (tap)="f.boardingType = +$event"></ts-chipbar>
          <ts-field [label]="'APP.mealsNote' | translate" [hint]="'APP.optional' | translate" [(value)]="f.boarding" style="margin-top: 10px; display: block"></ts-field>
        </ts-form-section>
        <ts-form-section [title]="'APP.roomFeatures' | translate" icon="ti ti-list-check">
          <div class="ts-progress-line" *ngIf="!features"><span></span></div>
          <ts-chipbar *ngIf="features" [wrap]="true" [items]="featureChips()" [selected]="featureKeys()" (tap)="toggleFeature(+$event)"></ts-chipbar>
        </ts-form-section>
        <ts-form-section [title]="'APP.availability' | translate" icon="ti ti-calendar-check" kind="schedule">
          <div class="ts-two">
            <ts-date-field [label]="'APP.validFrom' | translate" [(value)]="f.from"></ts-date-field>
            <ts-date-field [label]="'APP.validTo' | translate" [(value)]="f.to"></ts-date-field>
          </div>
        </ts-form-section>
        <ts-form-section [title]="'APP.seasonPrices' | translate" [subtitle]="'APP.seasonPricesHint' | translate" icon="ti ti-calendar-month" kind="money">
          <div class="ts-row-box" *ngFor="let s of seasons; let i = index">
            <button type="button" class="ts-row-box__remove" (click)="seasons.splice(i, 1)"><i class="ti ti-trash"></i></button>
            <div class="ts-two">
              <ts-date-field [label]="'APP.validFrom' | translate" [(value)]="s.from"></ts-date-field>
              <ts-date-field [label]="'APP.validTo' | translate" [(value)]="s.to"></ts-date-field>
            </div>
            <ts-field [label]="'APP.nightPrice' | translate" [number]="true" [suffix]="'APP.egp' | translate" [value]="s.price == null ? '' : num(s.price)" (valueChange)="s.price = amount($event)"></ts-field>
          </div>
          <button type="button" class="btn btn-secondary" (click)="seasons.push({ id: 0, from: null, to: null, price: null })"><i class="ti ti-plus"></i>{{ 'APP.addSeason' | translate }}</button>
        </ts-form-section>
        <ts-form-section [title]="'APP.images' | translate" [subtitle]="'APP.imagesHint' | translate" icon="ti ti-photo" kind="media">
          <ts-images-field [(files)]="images" [existing]="existingImages" (removeExisting)="removeImage($event)"></ts-images-field>
        </ts-form-section>
        <ts-form-section [title]="'APP.paymentAndRefund' | translate" icon="ti ti-wallet" kind="money">
          <ts-switch-row [title]="'APP.refundable' | translate" [(value)]="f.refundable"></ts-switch-row>
          <ts-field *ngIf="f.refundable" [label]="'APP.refundDaysBefore' | translate" [number]="true" [(value)]="f.refundDays"></ts-field>
          <ts-field [label]="'APP.cancellationPolicy' | translate" [lines]="2" [(value)]="f.policy"></ts-field>
          <ts-switch-row [title]="'APP.payOnArrival' | translate" [(value)]="f.payOnArrival"></ts-switch-row>
          <ts-field [label]="'APP.depositRate' | translate" [number]="true" suffix="%" [hint]="'APP.optional' | translate" [(value)]="f.deposit"></ts-field>
          <ts-switch-row [title]="'APP.priceIncludesVat' | translate" [(value)]="f.vat"></ts-switch-row>
        </ts-form-section>
        <div class="ts-sticky-foot">
          <button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy" (click)="save()">
            <i *ngIf="busy" class="pi pi-spin pi-spinner"></i>{{ (id ? 'APP.saveChanges' : 'APP.save') | translate }}
          </button>
        </div>
      </ng-container>
    </div>
  `
})
export class RoomFormComponent implements OnInit {
  private readonly api = inject(FormsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  readonly String = String;
  num = fmtNum;
  amount = parseAmount;

  id: number | null = null;
  hotelId = 0;
  hotelName: string | null = null;
  loading = false;
  loadError: unknown = null;
  busy = false;
  features: FilterOption[] | null = null;
  featureIds = new Set<number>();
  seasons: SeasonPrice[] = [];
  images: File[] = [];
  existingImages: string[] = [];
  private existingImageIds: number[] = [];
  private removedImageIds: number[] = [];
  /** Loaded on edit and sent back unchanged: the mapping copies them from the request. */
  private kept: Record<string, unknown> = {};

  f: any = {
    name: '',
    description: '',
    boarding: '',
    price: '',
    holiday: '',
    child: '',
    size: '',
    beds: '1',
    deposit: '',
    refundDays: '',
    policy: '',
    roomType: null as Picked | null,
    bedType: null as Picked | null,
    boardingType: 0,
    from: null as Date | null,
    to: null as Date | null,
    refundable: false,
    payOnArrival: true,
    vat: true
  };

  get canDelete(): boolean {
    return !!this.id && this.session.can(P.roomsDelete);
  }

  ngOnInit(): void {
    const q = this.route.snapshot.queryParams;
    this.id = q['id'] ? +q['id'] : null;
    this.hotelId = +q['hotelId'];
    this.hotelName = q['hotel'] ?? null;
    this.api.lookup('/api/RoomFeature/GetAllRoomFeatures/').subscribe({ next: (r) => (this.features = r), error: () => (this.features = []) });
    if (this.id) this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = null;
    this.api.get('/api/Room/GetRoomById', this.id!).subscribe({
      next: (d) => {
        const f = this.f;
        f.name = d.name ?? '';
        f.description = d.description ?? '';
        f.boarding = d.boarding ?? '';
        f.boardingType = d.boardingType ?? 0;
        f.price = fmtNum(d.price);
        f.holiday = !d.holidayPrice ? '' : fmtNum(d.holidayPrice);
        f.child = !d.childPrice ? '' : fmtNum(d.childPrice);
        f.size = !d.size ? '' : String(d.size);
        f.beds = String(d.bedCount ?? 1);
        f.deposit = !d.depositRate ? '' : fmtNum(d.depositRate);
        f.refundable = !!d.isRefundable;
        f.refundDays = d.minimumDaysToRefund == null ? '' : String(d.minimumDaysToRefund);
        f.policy = d.cancellationPolicy ?? '';
        f.payOnArrival = d.isAllowPaymentUponArrival ?? true;
        f.vat = d.isIncludeVate ?? true;
        f.from = parseDate(d.availableFrom);
        f.to = parseDate(d.availableTo);
        if (d.roomTypeId > 0) f.roomType = { id: String(d.roomTypeId), name: d.roomType ?? '' };
        if (d.bedTypeId > 0) f.bedType = { id: String(d.bedTypeId), name: d.bedType ?? '' };
        this.featureIds = new Set((d.features ?? []).map((x: any) => x.id));
        this.seasons = (d.customPrice ?? []).map((c: any) => ({ id: c.id, from: parseDate(c.from), to: parseDate(c.to), price: c.price ?? null }));
        const imgs = (d.images ?? []).filter((x: any) => x.url);
        this.existingImages = imgs.map((x: any) => x.url);
        this.existingImageIds = imgs.map((x: any) => x.id);
        this.kept = { IsFake: !!d.isFake, PriceBefore: d.priceBefore ?? null };
        this.loading = false;
      },
      error: (e) => {
        this.loadError = e;
        this.loading = false;
      }
    });
  }

  boardings() {
    const keys = ['APP.boardNone', 'APP.boardBreakfast', 'APP.boardHalf', 'APP.boardFull', 'APP.boardSoftAll', 'APP.boardHardAll'];
    const items = keys.map((k, i) => ({ key: String(i), label: this.text.tr(k) }));
    if (this.f.boardingType >= keys.length) items.push({ key: String(this.f.boardingType), label: this.text.tr('APP.boardOther') });
    return items;
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

  removeImage(i: number): void {
    this.removedImageIds.push(this.existingImageIds[i]);
    this.existingImages = this.existingImages.filter((_, j) => j !== i);
    this.existingImageIds = this.existingImageIds.filter((_, j) => j !== i);
  }

  private validate(): string | null {
    const f = this.f;
    if (!f.name.trim() || amountOf(f.price) == null || !f.roomType || !f.bedType) return 'APP.fillRequired';
    if (f.from && f.to && f.to < f.from) return 'APP.endDateRequired';
    if (!this.images.length && !this.existingImages.length) return 'APP.imageRequired';
    return seasonPriceError(this.seasons);
  }

  async save(): Promise<void> {
    const error = this.validate();
    if (error) return this.text.showError(this.text.tr(error));
    const f = this.f;
    this.busy = true;
    const body: Record<string, unknown> = {
      ...this.kept,
      ...(this.id ? { Id: this.id } : {}),
      HotelId: this.hotelId,
      Name: f.name.trim(),
      Description: f.description.trim(),
      RoomTypeId: f.roomType.id,
      BedTypeId: f.bedType.id,
      BedCount: intOf(f.beds) ?? 1,
      Size: intOf(f.size) ?? 0,
      Price: amountOf(f.price),
      HolidayPrice: amountOf(f.holiday) ?? 0,
      ChildPrice: amountOf(f.child) ?? 0,
      BoardingType: f.boardingType,
      Boarding: f.boarding.trim(),
      AvailableFrom: f.from,
      AvailableTo: f.to,
      IsRefundable: f.refundable,
      MinimumDaysToRefund: f.refundable ? intOf(f.refundDays) : null,
      CancellationPolicy: f.policy.trim(),
      IsAllowPaymentUponArrival: f.payOnArrival,
      DepositRate: amountOf(f.deposit),
      IsIncludeVate: f.vat,
      Features: [...this.featureIds],
      CustomPrices: this.seasons.map((s) => ({ ...(this.id ? { Id: s.id } : {}), From: s.from, To: s.to, Price: s.price })),
      ImagesFiles: this.images,
      ...(this.id ? { RemovedImageIds: this.removedImageIds } : {})
    };
    try {
      await firstValueFrom(this.id ? this.api.postForm('/api/Room/UpdateRoom/', body, true) : this.api.postForm('/api/Room/AddRoom/', body));
      this.text.showDone(this.text.tr('APP.productSaved'));
      this.location.back();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }

  async remove(): Promise<void> {
    const ok = await this.dialogs.confirm({ title: this.text.tr('APP.deleteRoomQ'), message: this.f.name, confirm: this.text.tr('APP.delete'), danger: true });
    if (!ok) return;
    this.api.delete('/api/Room/DeleteRoom/', this.id!).subscribe({ next: () => this.location.back(), error: (e) => this.text.showError(e) });
  }
}
