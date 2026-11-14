import { ChangeDetectionStrategy, Component, EventEmitter, Injectable, Input, OnDestroy, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, Subject, Subscription, debounceTime, firstValueFrom, map, of, shareReplay, switchMap, catchError } from 'rxjs';
import { StaffHttp, mediaUrl } from '../core/staff-http';
import { FilterOption, FiltersApi, optionLabel } from '../core/query';
import { fmtNum, fmtShortDate, fmtTime, latinDigits, parseAmount, parseDate } from '../core/format';
import { ChipBarComponent } from '../ui/lists';
import { SheetComponent } from '../ui/dialogs';
import { StaffText, TagComponent } from '../ui/kit';

/** A date as ASP.NET binds it: local time, no offset (the backend stores the server's local time). */
export function formDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/**
 * A list read by the API's JsonModelBinder (TripRequest.TripDates, Descriptions, ChildPricingPolicies, TripPricingPeriods;
 * HajjRequest.Dates, Descriptions, ChildPricingPolicies): each item goes as JSON text under the same key, the way the
 * old dashboard sent it. Sent as `TripDates[0].StartDate` instead, the binder reads an empty list and the API refuses
 * the trip with "Invalid Data".
 */
export class JsonEach {
  constructor(readonly items: unknown[]) {}
}

export const jsonEach = (items: unknown[]) => new JsonEach(items);

/** Dates as formDate (local time, no offset) inside the JSON, as JSON.stringify would otherwise shift them to UTC. */
function jsonPlain(v: unknown): unknown {
  if (v instanceof Date) return formDate(v);
  if (Array.isArray(v)) return v.map(jsonPlain);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, jsonPlain(x)]));
  return v;
}

/**
 * Turns a nested object into the multipart keys ASP.NET's [FromForm] binder reads: `Descriptions[0].Description`,
 * `TripDates[1].StartDate`, `AccommodationTypeIds[0]`, and the same key repeated for a list of files (`ImagesFiles`)
 * or for each item of a JsonEach list.
 */
export function toForm(body: Record<string, unknown>): FormData {
  const form = new FormData();
  const walk = (key: string, v: unknown): void => {
    if (v === null || v === undefined) return;
    if (v instanceof JsonEach) v.items.forEach((x) => form.append(key, JSON.stringify(jsonPlain(x))));
    else if (v instanceof File) form.append(key, v, v.name);
    else if (v instanceof Date) form.append(key, formDate(v));
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x instanceof File ? key : `${key}[${i}]`, x));
    else if (typeof v === 'object') Object.entries(v as Record<string, unknown>).forEach(([k, x]) => walk(key ? `${key}.${k}` : k, x));
    else form.append(key, String(v));
  };
  walk('', body);
  return form;
}

export function intOf(s: string | number | null | undefined): number | null {
  const n = parseInt(latinDigits(String(s ?? '').trim()), 10);
  return isNaN(n) ? null : n;
}

export function amountOf(s: string | number | null | undefined): number | null {
  return parseAmount(s);
}

/** The calls the product forms make, apart from the products API. Form posts go with en-US. */
@Injectable({ providedIn: 'root' })
export class FormsApi {
  private readonly http = inject(StaffHttp);
  private readonly lookups = new Map<string, Observable<FilterOption[]>>();

  postForm(path: string, body: Record<string, unknown>, put = false): Observable<any> {
    return this.http.form(put ? 'PUT' : 'POST', path, toForm(body));
  }

  postJson(path: string, body: unknown, put = false): Observable<any> {
    return put ? this.http.putEn(path, body) : this.http.postEn(path, body);
  }

  get(path: string, id: number): Observable<any> {
    return this.http.get(path, { id });
  }

  /** The staff tables saved after the product exists: 1 trip, 2 outing, 4 Hajj, 5 outing ticket, 6 Hajj room. */
  gatheringPoints(type: number, id: number, points: any[]): Observable<unknown> {
    return this.http.put(`/api/staff/items/${type}/${id}/gathering-points`, { points });
  }

  bookingRule(type: number, id: number, min: number, max: number | null): Observable<unknown> {
    return this.http.put(`/api/staff/items/${type}/${id}/booking-rule`, { minQuantity: min, maxQuantity: max });
  }

  foreignPrice(type: number, id: number, price: number, child: number | null): Observable<unknown> {
    return this.http.put(`/api/staff/items/${type}/${id}/foreign-price`, { price, childPrice: child, isActive: true });
  }

  /** DELETE with the id in the query string, the way these controllers take it (`?id=`, or `?imageId=`). */
  delete(path: string, id: number, key = 'id'): Observable<unknown> {
    return this.http.delete(path, { [key]: id });
  }

  deleteRoom(id: number) {
    return this.delete('/api/HajjTickets/DeleteHajjTickets/', id);
  }

  deleteOutingTicket(id: number) {
    return this.delete('/api/OutingTickets/DeleteOutingTickets/', id);
  }

  deleteTripImage(id: number) {
    return this.delete('/api/Travels/TravelsDeleteImage/', id, 'imageId');
  }

  deleteProgramStep(id: number) {
    return this.delete('/api/Travels/DeleteProgramStep/', id);
  }

  /** PUT UpdateProgramSteps/?tripId= with UpdateProgramStepDto[]: updates steps by id, adds those with id 0. */
  updateTripProgram(tripId: number, steps: unknown[]): Observable<unknown> {
    return this.http.putEn('/api/Travels/UpdateProgramSteps/', steps, { tripId });
  }

  /** PUT /api/Hajj/UpdateHajjProgramSteps/?tripId=: updates the package's steps by id, adds those with id 0. */
  updateHajjProgram(hajjId: number, steps: unknown[]): Observable<unknown> {
    return this.http.putEn('/api/Hajj/UpdateHajjProgramSteps/', steps, { tripId: hajjId });
  }

  deleteHajjProgramStep(id: number) {
    return this.delete('/api/Hajj/DeleteHajjProgramStep/', id);
  }

  dateSeats(hajjId: number, dates: unknown[]): Observable<unknown> {
    return this.http.put(`/api/staff/hajj/${hajjId}/date-seats`, { dates });
  }

  /** A small lookup table from an existing web list endpoint, read once as id + name (room types, bed types…). */
  lookup(path: string): Observable<FilterOption[]> {
    let o = this.lookups.get(path);
    if (!o) {
      o = this.http.post<any>(path, { pageIndex: 1, pageSize: 200 }).pipe(
        map((d) => (Array.isArray(d) ? d : (d?.data ?? [])).map((e: any) => ({ value: String(e.id), labelAr: e.name ?? '' }))),
        shareReplay(1)
      );
      this.lookups.set(path, o);
    }
    return o;
  }

  /** The same for the lists the API answers to a GET: TravelFeature/GetAll, AccommodationType/GetAllAccommodationTypes. */
  lookupGet(path: string): Observable<FilterOption[]> {
    let o = this.lookups.get('GET ' + path);
    if (!o) {
      o = this.http.get<any>(path).pipe(
        map((d) => (Array.isArray(d) ? d : (d?.data ?? [])).map((e: any) => ({ value: String(e.id), labelAr: (e.name ?? '').trim() }))),
        shareReplay(1)
      );
      this.lookups.set('GET ' + path, o);
    }
    return o;
  }

  existingPoints(type: number, id: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/staff/items/${type}/${id}/gathering-points`).pipe(map((d) => d ?? []));
  }
}

/** Runs the follow-up saves after a product is created; a failure in one does not stop the others. */
export async function runFollowUps(steps: [string, () => Observable<unknown>][]): Promise<string[]> {
  const failed: string[] = [];
  for (const [name, step] of steps) {
    try {
      await firstValueFrom(step());
    } catch {
      failed.push(name);
    }
  }
  return failed;
}

/** The frame of every multi-step form (MStep): the step header and bar, the content, Back / Next / Publish. */
@Component({
  selector: 'ts-step-scaffold',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <header class="ts-steps-head">
        <div class="ts-spread">
          <h1 class="ts-grow">{{ title }}</h1>
        </div>
        <div class="ts-spread" style="margin-top: 6px">
          <span class="ts-num ts-steps-count">{{ current + 1 }}/{{ steps.length }}</span>
          <strong class="ts-grow">{{ steps[current] }}</strong>
          <small class="ts-muted" *ngIf="current < steps.length - 1">{{ 'APP.next' | translate }}: {{ steps[current + 1] }}</small>
        </div>
        <div class="ts-steps-bar">
          <button type="button" *ngFor="let s of steps; let i = index" [class.is-done]="i <= current" [attr.aria-label]="s" (click)="jump.emit(i)"></button>
        </div>
      </header>
      <ng-content></ng-content>
      <div class="ts-sticky-foot ts-wide-row">
        <button *ngIf="current > 0" type="button" class="btn btn-secondary" [disabled]="busy" (click)="back.emit()">{{ 'APP.back' | translate }}</button>
        <button type="button" class="btn btn-primary" style="flex: 2" [disabled]="busy" (click)="next.emit()">
          <i *ngIf="busy" class="pi pi-spin pi-spinner"></i>
          {{ nextLabel || ((current === steps.length - 1 ? 'APP.publish' : 'APP.next') | translate) }}
        </button>
      </div>
    </div>
  `
})
export class StepScaffoldComponent {
  @Input() title = '';
  @Input() steps: string[] = [];
  @Input() current = 0;
  @Input() busy = false;
  @Input() nextLabel?: string | null;
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() jump = new EventEmitter<number>();
}

export type SectionKind = 'general' | 'money' | 'media' | 'place' | 'schedule';

const SECTION_COLOR: Record<SectionKind, string> = {
  money: '#1E8E5A',
  media: 'var(--ts-blue)',
  place: 'var(--ts-teal)',
  schedule: 'var(--ts-accent)',
  general: 'var(--ts-navy)'
};

/** FormSection: an icon chip in the section's colour, a coloured edge on the start side, then the fields. */
@Component({
  selector: 'ts-form-section',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="ts-form-section" [style.border-inline-start-color]="color">
      <div class="ts-form-section__head">
        <span class="ts-form-section__chip" [style.color]="color" [style.background]="tint"><i [class]="icon"></i></span>
        <div class="ts-grow">
          <h2>{{ title }}</h2>
          <p *ngIf="subtitle">{{ subtitle }}</p>
        </div>
        <button *ngIf="action" type="button" class="btn btn-link" (click)="act.emit()">{{ action }}</button>
      </div>
      <ng-content></ng-content>
    </section>
  `
})
export class FormSectionComponent {
  @Input() title = '';
  @Input() subtitle?: string | null;
  @Input() icon = 'ti ti-notes';
  @Input() kind: SectionKind = 'general';
  @Input() action?: string | null;
  @Output() act = new EventEmitter<void>();
  get color(): string {
    return SECTION_COLOR[this.kind];
  }
  get tint(): string {
    return `color-mix(in srgb, ${this.color} 12%, transparent)`;
  }
}

/** A label + input, like TripsField (with the red star when required). */
@Component({
  selector: 'ts-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="ts-field">
      <span>{{ label }}<b *ngIf="required" class="req"> *</b></span>
      <div class="ts-input-wrap">
        <textarea *ngIf="lines > 1" class="form-control" [rows]="lines" [placeholder]="hint ?? ''" [ngModel]="value" (ngModelChange)="emit($event)" [readonly]="readonly"></textarea>
        <input
          *ngIf="lines <= 1"
          class="form-control"
          [type]="type"
          [attr.inputmode]="number ? 'decimal' : null"
          [placeholder]="hint ?? ''"
          [ngModel]="value"
          (ngModelChange)="emit($event)"
          [readonly]="readonly"
        />
        <span class="ts-suffix" *ngIf="suffix">{{ suffix }}</span>
      </div>
      <small class="err" *ngIf="error">{{ error }}</small>
    </label>
  `
})
export class FieldComponent {
  @Input() label = '';
  @Input() value: string | number | null | undefined = '';
  @Input() hint?: string | null;
  @Input() suffix?: string | null;
  @Input() error?: string | null;
  @Input() required = false;
  @Input() number = false;
  @Input() lines = 1;
  @Input() type = 'text';
  @Input() readonly = false;
  @Output() valueChange = new EventEmitter<string>();
  emit(v: string): void {
    this.value = v;
    this.valueChange.emit(v);
  }
}

/**
 * A description that keeps its layout: bold, lines and lists, kept as HTML (the customer app and site show HTML,
 * where a plain line break is just a space). Pasted formatted text keeps its bold and lines. A description saved
 * as plain text before opens with its lines as paragraphs.
 */
@Component({
  selector: 'ts-rich-text',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorModule],
  template: `
    <div class="ts-field ts-rich">
      <span>{{ label }}<b *ngIf="required" class="req"> *</b></span>
      <p-editor [ngModel]="html" (ngModelChange)="emit($event)" [style]="{ height: height + 'px' }">
        <ng-template pTemplate="header">
          <span class="ql-formats">
            <button type="button" class="ql-bold" aria-label="Bold"></button>
            <button type="button" class="ql-italic" aria-label="Italic"></button>
            <button type="button" class="ql-underline" aria-label="Underline"></button>
          </span>
          <span class="ql-formats">
            <button type="button" class="ql-list" value="ordered" aria-label="Numbered list"></button>
            <button type="button" class="ql-list" value="bullet" aria-label="Bulleted list"></button>
          </span>
          <span class="ql-formats"><button type="button" class="ql-clean" aria-label="Clear formatting"></button></span>
        </ng-template>
      </p-editor>
    </div>
  `,
  styles: [
    `
      .ts-rich ::ng-deep .ql-editor { direction: rtl; text-align: right; font-family: inherit; font-size: 15px; line-height: 1.8; }
      .ts-rich ::ng-deep .ql-editor li { padding-right: 1.5em; padding-left: 0; }
      .ts-rich ::ng-deep .p-editor-container .p-editor-toolbar { border-radius: 12px 12px 0 0; }
      .ts-rich ::ng-deep .p-editor-container .p-editor-content { border-radius: 0 0 12px 12px; }
    `
  ]
})
export class RichTextComponent {
  @Input() label = '';
  @Input() required = false;
  @Input() height = 180;
  @Output() valueChange = new EventEmitter<string>();
  html = '';
  @Input() set value(v: string | null | undefined) {
    const next = toRichHtml(v);
    if (next !== this.html) this.html = next;
  }
  emit(v: string | null): void {
    this.html = v ?? '';
    // an emptied editor leaves "<p><br></p>": that is no description
    this.valueChange.emit(isBlankHtml(this.html) ? '' : this.html);
  }
}

/** HTML as is; plain text (older descriptions) as paragraphs, its line breaks kept. */
export function toRichHtml(v: string | null | undefined): string {
  const s = (v ?? '').trim();
  if (!s) return '';
  if (/<\/?(p|br|b|strong|i|em|u|ul|ol|li|div|span|h[1-6])\b/i.test(s)) return s;
  const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return s
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => (line.trim() ? `<p>${esc(line)}</p>` : '<p><br></p>'))
    .join('');
}

export function isBlankHtml(html: string): boolean {
  return !html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export interface Picked {
  id: string;
  name: string;
}

/**
 * OptionField: picks one option. `source` is a staff options source (GET /api/staff/filters/options/{source}:
 * vendors, countries, cities, Hajj and outing categories) or a lookup path (`/api/RoomTypes/GetAllRoomTypes/`).
 */
@Component({
  selector: 'ts-option-field',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SheetComponent],
  template: `
    <div class="ts-field">
      <span>{{ label }}<b *ngIf="required" class="req"> *</b></span>
      <button type="button" class="ts-pick-box" (click)="openPicker()">
        <span class="ts-pick-box__text">
          <strong *ngIf="value?.name; else none">{{ value?.name }}</strong>
          <ng-template #none><span class="ts-pick-box__hint">{{ 'APP.choose' | translate }}</span></ng-template>
        </span>
        <i class="ti ti-chevron-down"></i>
      </button>
    </div>
    <ts-sheet [open]="open" (openChange)="open = false" [title]="label" [footer]="false">
      <label class="ts-search">
        <i class="ti ti-search"></i>
        <input type="search" [placeholder]="'APP.search' | translate" (input)="q$.next($any($event.target).value)" />
      </label>
      <div class="ts-picker-list">
        <button type="button" class="ts-picker-row" *ngFor="let o of rows" (click)="pick(o)">
          <strong>{{ labelOf(o) }}</strong>
        </button>
      </div>
    </ts-sheet>
  `
})
export class OptionFieldComponent implements OnDestroy {
  private readonly filters = inject(FiltersApi);
  private readonly forms = inject(FormsApi);
  private readonly text = inject(StaffText);
  @Input() label = '';
  @Input({ required: true }) source!: string;
  @Input() value: Picked | null = null;
  @Input() required = false;
  @Output() valueChange = new EventEmitter<Picked | null>();
  open = false;
  rows: FilterOption[] = [];
  readonly q$ = new Subject<string>();
  private sub = this.q$
    .pipe(
      debounceTime(300),
      switchMap((q) =>
        (this.source.startsWith('/')
          ? this.forms.lookup(this.source).pipe(map((all) => all.filter((o) => o.labelAr.toLowerCase().includes(q.trim().toLowerCase()))))
          : this.filters.options(this.source, q)
        ).pipe(catchError(() => of([])))
      )
    )
    .subscribe((r) => (this.rows = r));

  labelOf(o: FilterOption): string {
    return optionLabel(o, this.text.arabic);
  }

  openPicker(): void {
    this.open = true;
    this.q$.next('');
  }

  pick(o: FilterOption): void {
    this.value = { id: o.value, name: this.labelOf(o) };
    this.valueChange.emit(this.value);
    this.open = false;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

/** DateField: a date (and optional time) picker, as a native input. Emits a Date or null. */
@Component({
  selector: 'ts-date-field',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="ts-field">
      <span>{{ label }}<b *ngIf="required" class="req"> *</b></span>
      <input class="form-control" [type]="withTime ? 'datetime-local' : 'date'" [value]="inputValue" (change)="changed($any($event.target).value)" />
    </label>
  `
})
export class DateFieldComponent {
  @Input() label = '';
  @Input() value: Date | null | undefined = null;
  @Input() withTime = false;
  @Input() required = false;
  @Output() valueChange = new EventEmitter<Date | null>();

  get inputValue(): string {
    const d = this.value;
    if (!d) return '';
    const p = (n: number) => String(n).padStart(2, '0');
    const day = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    return this.withTime ? `${day}T${p(d.getHours())}:${p(d.getMinutes())}` : day;
  }

  changed(v: string): void {
    if (!v) return this.valueChange.emit(null);
    const d = this.withTime ? new Date(v) : (() => {
      const [y, m, dd] = v.split('-').map(Number);
      return new Date(y, m - 1, dd);
    })();
    this.value = d;
    this.valueChange.emit(d);
  }
}

/**
 * ImagesField: the one image uploader of the forms. Picked photos (new files) and the ones already saved, the first
 * one the cover; a tile per image with a preview, replace and remove; drop files on it or pick them; the formats
 * and size are checked before anything is sent. [multiple]="false" keeps one image (a logo, a banner).
 */
@Component({
  selector: 'ts-images-field',
  standalone: true,
  imports: [CommonModule, TranslateModule, TagComponent],
  template: `
    <div
      class="ts-images"
      [class.ts-images--wide]="shape === 'wide'"
      [class.ts-images--single]="!multiple"
      [class.is-dragging]="dragging"
      (dragover)="$event.preventDefault(); dragging = true"
      (dragleave)="dragging = false"
      (drop)="$event.preventDefault(); dragging = false; add($event.dataTransfer?.files ?? null)"
    >
      <div class="ts-images__tile" *ngFor="let e of existing; let i = index">
        <img [src]="url(e)" alt="" loading="lazy" />
        <ts-tag *ngIf="i === 0 && multiple && cover" tone="info" class="ts-images__cover">{{ 'APP.cover' | translate }}</ts-tag>
        <div class="ts-images__actions">
          <button *ngIf="removeExisting.observed" type="button" class="ts-images__btn ts-images__btn--danger" (click)="removeExisting.emit(i)" [attr.aria-label]="'APP.removeImage' | translate" [title]="'APP.removeImage' | translate">
            <i class="ti ti-trash"></i>
          </button>
        </div>
      </div>
      <div class="ts-images__tile" *ngFor="let f of files; let i = index">
        <img [src]="preview(f)" alt="" />
        <ts-tag *ngIf="multiple && cover && !existing.length && i === 0" tone="info" class="ts-images__cover">{{ 'APP.cover' | translate }}</ts-tag>
        <ts-tag tone="ok" class="ts-images__new">{{ 'APP.newImage' | translate }}</ts-tag>
        <div class="ts-images__actions">
          <label class="ts-images__btn" [title]="'APP.replaceImage' | translate">
            <i class="ti ti-replace"></i>
            <input type="file" [accept]="accept" (change)="replace(i, $any($event.target).files); $any($event.target).value = ''" />
          </label>
          <button type="button" class="ts-images__btn ts-images__btn--danger" (click)="remove(i)" [attr.aria-label]="'APP.removeImage' | translate" [title]="'APP.removeImage' | translate">
            <i class="ti ti-trash"></i>
          </button>
        </div>
      </div>
      <label class="ts-images__add" *ngIf="multiple || (!files.length && !existing.length)">
        <span class="ts-images__add-icon"><i class="ti ti-cloud-upload"></i></span>
        <strong>{{ (multiple ? 'APP.addImages' : 'APP.addImage') | translate }}</strong>
        <small>{{ 'APP.dropOrPick' | translate }}</small>
        <input type="file" [accept]="accept" [multiple]="multiple" (change)="add($any($event.target).files); $any($event.target).value = ''" />
      </label>
    </div>
    <p class="ts-images__hint">
      <i class="ti ti-info-circle"></i>
      {{ 'APP.imageFormats' | translate: { mb: maxMb } }}<ng-container *ngIf="size"> · {{ 'APP.imageSize' | translate: { s: size } }}</ng-container>
    </p>
    <p class="ts-images__error" *ngIf="error" role="alert"><i class="ti ti-alert-circle"></i>{{ error }}</p>
  `
})
export class ImagesFieldComponent implements OnDestroy {
  private readonly text = inject(StaffText);
  @Input() files: File[] = [];
  @Input() existing: string[] = [];
  @Input() multiple = true;
  /** The first picture is the cover (products, banners); off for papers like a tax card. */
  @Input() cover = true;
  /** square tiles (products) or wide (banners). */
  @Input() shape: 'square' | 'wide' = 'square';
  /** The suggested size, e.g. "1200×600". */
  @Input() size: string | null = null;
  @Input() maxMb = 5;
  @Output() filesChange = new EventEmitter<File[]>();
  /** Removes a saved image by its index in [existing]; not bound when the backend cannot delete one. */
  @Output() removeExisting = new EventEmitter<number>();
  readonly accept = 'image/png,image/jpeg,image/webp';
  dragging = false;
  error = '';
  private previews = new Map<File, string>();

  url(p: string): string {
    return mediaUrl(p) ?? '';
  }

  preview(f: File): string {
    let u = this.previews.get(f);
    if (!u) {
      u = URL.createObjectURL(f);
      this.previews.set(f, u);
    }
    return u;
  }

  /** The files that pass: PNG, JPG or WebP, up to maxMb each; the rest are named in the error. */
  private accepted(list: FileList | null): File[] {
    this.error = '';
    const all = Array.from(list ?? []);
    const ok = all.filter((f) => /^image\/(png|jpe?g|webp)$/.test(f.type) && f.size <= this.maxMb * 1024 * 1024);
    const bad = all.filter((f) => !ok.includes(f));
    if (bad.length) this.error = this.text.tr('APP.imageRejected', { n: bad.map((f) => f.name).join('، '), mb: this.maxMb });
    return ok;
  }

  add(list: FileList | null): void {
    const ok = this.accepted(list);
    if (!ok.length) return;
    this.files = this.multiple ? [...this.files, ...ok] : [ok[0]];
    this.filesChange.emit(this.files);
  }

  replace(i: number, list: FileList | null): void {
    const ok = this.accepted(list);
    if (!ok.length) return;
    this.files = this.files.map((f, j) => (j === i ? ok[0] : f));
    this.filesChange.emit(this.files);
  }

  remove(i: number): void {
    this.files = this.files.filter((_, j) => j !== i);
    this.filesChange.emit(this.files);
  }

  ngOnDestroy(): void {
    this.previews.forEach((u) => URL.revokeObjectURL(u));
  }
}

/** ChildPolicy (ChildPricingPolicyDto): an age range and Free (1) / Fixed amount (2) / Percentage (3). */
export interface ChildPolicy {
  minAge: number;
  maxAge: number;
  type: number;
  value: number | null;
}

export function childPolicyJson(p: ChildPolicy) {
  return { MinAge: p.minAge, MaxAge: p.maxAge, PricingType: p.type, Value: p.type === 1 ? null : p.value };
}

export function childPolicyFrom(j: any): ChildPolicy {
  return { minAge: j?.minAge ?? 0, maxAge: j?.maxAge ?? 0, type: j?.pricingType ?? 1, value: j?.value ?? null };
}

/** The same overlap rule as ChildPricingHelper in C#, so the employee sees it before sending. */
export function childPolicyError(ps: ChildPolicy[]): string | null {
  for (const p of ps) if (p.minAge < 0 || p.maxAge < p.minAge) return 'APP.childAgesInvalid';
  for (let i = 0; i < ps.length; i++)
    for (let j = i + 1; j < ps.length; j++) if (ps[i].minAge < ps[j].maxAge && ps[j].minAge < ps[i].maxAge) return 'APP.childAgesOverlap';
  return null;
}

@Component({
  selector: 'ts-child-policies',
  standalone: true,
  imports: [CommonModule, TranslateModule, FieldComponent, ChipBarComponent],
  template: `
    <div class="ts-row-box" *ngFor="let p of rows; let i = index; trackBy: byIndex">
      <button type="button" class="ts-row-box__remove" (click)="removeAt(i)" [attr.aria-label]="'APP.remove' | translate"><i class="ti ti-trash"></i></button>
      <div class="ts-two">
        <ts-field [label]="'APP.fromAge' | translate" [number]="true" [value]="p.minAge" (valueChange)="p.minAge = int($event); emit()"></ts-field>
        <ts-field [label]="'APP.toAge' | translate" [number]="true" [value]="p.maxAge" (valueChange)="p.maxAge = int($event); emit()"></ts-field>
      </div>
      <ts-chipbar [wrap]="true" [items]="types" [selected]="[String(p.type)]" (tap)="p.type = +$event; emit()"></ts-chipbar>
      <ts-field
        *ngIf="p.type !== 1"
        [label]="(p.type === 3 ? 'APP.percentOfAdult' : 'APP.price') | translate"
        [number]="true"
        [suffix]="p.type === 3 ? '%' : ('APP.egp' | translate)"
        [value]="p.value == null ? '' : num(p.value)"
        (valueChange)="p.value = amount($event); emit()"
        style="margin-top: 10px; display: block"
      ></ts-field>
    </div>
    <button type="button" class="btn btn-secondary" (click)="add()"><i class="ti ti-plus"></i>{{ 'APP.addAgeRange' | translate }}</button>
  `
})
export class ChildPoliciesComponent {
  private readonly text = inject(StaffText);
  @Input() rows: ChildPolicy[] = [];
  @Output() rowsChange = new EventEmitter<ChildPolicy[]>();
  readonly String = String;
  num = fmtNum;
  byIndex = (i: number) => i;
  readonly types = [
    { key: '1', label: this.text.tr('APP.free') },
    { key: '2', label: this.text.tr('APP.fixedAmount') },
    { key: '3', label: this.text.tr('APP.percentage') }
  ];
  int(v: string): number {
    return intOf(v) ?? 0;
  }
  amount(v: string): number | null {
    return amountOf(v);
  }
  emit(): void {
    this.rowsChange.emit(this.rows);
  }
  add(): void {
    const last = this.rows[this.rows.length - 1];
    this.rows = [...this.rows, { minAge: last ? last.maxAge : 0, maxAge: last ? last.maxAge + 6 : 5, type: 1, value: null }];
    this.emit();
  }
  removeAt(i: number): void {
    this.rows = this.rows.filter((_, j) => j !== i);
    this.emit();
  }
}

/** ProgramStep (CreateProgramStepDto): type, title, time, details. */
export interface ProgramStep {
  id: number;
  type: number;
  title: string;
  details: string;
  time: Date | null;
}

export function programStepFrom(j: any): ProgramStep {
  return { id: j?.id ?? 0, type: j?.type ?? 3, title: j?.title ?? '', details: j?.details ?? '', time: parseDate(j?.time) };
}

export function programStepJson(s: ProgramStep, tripId = 0, withId = false) {
  return { ...(withId ? { Id: s.id } : {}), Type: s.type, Title: s.title, Details: s.details, Time: s.time ? formDate(s.time) : null, TripId: tripId, StepDescriptions: [] };
}

@Component({
  selector: 'ts-program-editor',
  standalone: true,
  imports: [CommonModule, TranslateModule, FieldComponent, DateFieldComponent, ChipBarComponent],
  template: `
    <div class="ts-row-box" *ngFor="let s of rows; let i = index; trackBy: byIndex">
      <button type="button" class="ts-row-box__remove" (click)="removeAt(i)" [attr.aria-label]="'APP.remove' | translate"><i class="ti ti-trash"></i></button>
      <ts-chipbar [wrap]="true" [items]="types" [selected]="[String(s.type)]" (tap)="s.type = +$event; emit()"></ts-chipbar>
      <ts-field [label]="'APP.title' | translate" [value]="s.title" (valueChange)="s.title = $event; emit()" style="margin-top: 10px; display: block"></ts-field>
      <ts-date-field [label]="'APP.time' | translate" [withTime]="true" [value]="s.time" (valueChange)="s.time = $event; emit()"></ts-date-field>
      <ts-field [label]="'APP.details' | translate" [lines]="2" [value]="s.details" (valueChange)="s.details = $event; emit()"></ts-field>
    </div>
    <button type="button" class="btn btn-secondary" (click)="add()"><i class="ti ti-plus"></i>{{ 'APP.addStep' | translate }}</button>
  `
})
export class ProgramEditorComponent {
  private readonly text = inject(StaffText);
  @Input() rows: ProgramStep[] = [];
  @Output() rowsChange = new EventEmitter<ProgramStep[]>();
  @Output() removed = new EventEmitter<ProgramStep>();
  readonly String = String;
  byIndex = (i: number) => i;
  readonly types = [
    { key: '1', label: this.text.tr('APP.stepTransport') },
    { key: '2', label: this.text.tr('APP.stepAccommodation') },
    { key: '3', label: this.text.tr('APP.stepActivity') }
  ];
  emit(): void {
    this.rowsChange.emit(this.rows);
  }
  add(): void {
    this.rows = [...this.rows, { id: 0, type: 3, title: '', details: '', time: null }];
    this.emit();
  }
  removeAt(i: number): void {
    this.removed.emit(this.rows[i]);
    this.rows = this.rows.filter((_, j) => j !== i);
    this.emit();
  }
}

/** Gathering points edited inside a form (saved to the staff table after the product is created). */
@Component({
  selector: 'ts-points-editor',
  standalone: true,
  imports: [CommonModule, TranslateModule, FieldComponent],
  template: `
    <div class="ts-row-box" *ngFor="let p of rows; let i = index; trackBy: byIndex">
      <button type="button" class="ts-row-box__remove" (click)="removeAt(i)" [attr.aria-label]="'APP.remove' | translate"><i class="ti ti-trash"></i></button>
      <ts-field [label]="'APP.name' | translate" [value]="p.name" (valueChange)="p.name = $event; emit()"></ts-field>
      <ts-field [label]="'APP.address' | translate" [value]="p.address" (valueChange)="p.address = $event; emit()"></ts-field>
      <ts-field [label]="'APP.meetingTime' | translate" hint="07:30" [value]="p.meetingTime" (valueChange)="p.meetingTime = $event; emit()"></ts-field>
    </div>
    <button type="button" class="btn btn-secondary" (click)="add()"><i class="ti ti-plus"></i>{{ 'APP.addPoint' | translate }}</button>
  `
})
export class PointsEditorComponent {
  @Input() rows: any[] = [];
  @Output() rowsChange = new EventEmitter<any[]>();
  byIndex = (i: number) => i;
  emit(): void {
    this.rowsChange.emit(this.rows);
  }
  add(): void {
    this.rows = [...this.rows, { name: '', isActive: true }];
    this.emit();
  }
  removeAt(i: number): void {
    this.rows = this.rows.filter((_, j) => j !== i);
    this.emit();
  }
}

/** Clean list for the gathering-points endpoint (empty names dropped, order kept). */
export function cleanPoints(rows: any[]): any[] {
  return rows.filter((p) => (p?.name ?? '').trim()).map((p, i) => ({ ...p, sortOrder: i, isActive: p.isActive ?? true }));
}

/** The minimum / maximum and foreign price fields shared by the three forms. */
@Component({
  selector: 'ts-rules-foreign',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormSectionComponent, FieldComponent],
  template: `
    <ts-form-section [title]="title || ('APP.rulesAndForeign' | translate)" icon="ti ti-adjustments">
      <div class="ts-two">
        <ts-field [label]="'APP.minPerBooking' | translate" [number]="true" [value]="v.min" (valueChange)="v.min = $event"></ts-field>
        <ts-field [label]="'APP.maxPerBooking' | translate" [number]="true" [hint]="'APP.optional' | translate" [value]="v.max" (valueChange)="v.max = $event"></ts-field>
      </div>
      <p class="ts-muted" style="margin-bottom: 8px">{{ 'APP.foreignPriceHint' | translate }}</p>
      <div class="ts-two">
        <ts-field [label]="'APP.adultPrice' | translate" [number]="true" [suffix]="'APP.egp' | translate" [hint]="'APP.optional' | translate" [value]="v.foreign" (valueChange)="v.foreign = $event"></ts-field>
        <ts-field [label]="'APP.childPrice' | translate" [number]="true" [suffix]="'APP.egp' | translate" [hint]="'APP.optional' | translate" [value]="v.foreignChild" (valueChange)="v.foreignChild = $event"></ts-field>
      </div>
    </ts-form-section>
  `
})
export class RulesForeignComponent {
  /** { min, max, foreign, foreignChild } as typed strings; the form reads them on save. */
  @Input({ required: true }) v!: { min: string; max: string; foreign: string; foreignChild: string };
  @Input() title?: string | null;
}

export function shortDate(v: unknown): string {
  return fmtShortDate(v as string);
}

export function timeOf(d: Date | null, ar: boolean): string {
  return fmtTime(d, ar);
}

/**
 * "+ New feature" under the features chips: POST /api/TravelFeature/Create, then the parent adds it to its list and
 * selects it. The backend answers an existing name with that feature (no duplicates), so it is selected instead.
 */
@Component({
  selector: 'ts-new-feature',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="ts-new-option">
      <input class="form-control" [placeholder]="'APP.newFeatureHint' | translate" [value]="name" (input)="name = $any($event.target).value" (keydown.enter)="$event.preventDefault(); add()" maxlength="100" />
      <button type="button" class="btn btn-secondary" [disabled]="busy || !name.trim()" (click)="add()">
        <i [class]="busy ? 'pi pi-spin pi-spinner' : 'ti ti-plus'"></i>{{ 'APP.addFeature' | translate }}
      </button>
    </div>
  `
})
export class NewFeatureComponent {
  private readonly http = inject(StaffHttp);
  private readonly text = inject(StaffText);
  /** Names already in the list, to pick the existing one without a call. */
  @Input() existing: { value: string; labelAr: string }[] = [];
  @Output() created = new EventEmitter<{ value: string; labelAr: string }>();
  name = '';
  busy = false;

  add(): void {
    const name = this.name.trim().replace(/\s+/g, ' ');
    if (!name || this.busy) return;
    const same = this.existing.find((o) => o.labelAr.trim().replace(/\s+/g, ' ').toLowerCase() === name.toLowerCase());
    if (same) {
      this.created.emit(same);
      this.name = '';
      return this.text.showDone(this.text.tr('APP.featureExists'));
    }
    this.busy = true;
    this.http.postEn<any>('/api/TravelFeature/Create', { name }).subscribe({
      next: (d) => {
        this.busy = false;
        if (d?.id == null) return;
        this.created.emit({ value: String(d.id), labelAr: d.name ?? name });
        this.name = '';
      },
      error: (e) => {
        this.busy = false;
        this.text.showError(e);
      }
    });
  }
}

export const FORM_KIT = [
  NewFeatureComponent,
  StepScaffoldComponent,
  FormSectionComponent,
  FieldComponent,
  OptionFieldComponent,
  DateFieldComponent,
  ImagesFieldComponent,
  ChildPoliciesComponent,
  ProgramEditorComponent,
  PointsEditorComponent,
  RulesForeignComponent
] as const;
