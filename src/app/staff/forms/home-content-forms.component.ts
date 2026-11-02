import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription, debounceTime, firstValueFrom } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { ChipBarComponent, ChipItem } from '../ui/lists';
import { SwitchRowComponent } from '../ui/controls';
import { SheetComponent, StaffDialogs } from '../ui/dialogs';
import { FiltersApi, emptyQuery } from '../core/query';
import { mediaUrl } from '../core/staff-http';
import { fmtNum } from '../core/format';
import { ProductRow, ProductsApi } from '../products/products-api';
import { FORM_KIT, FormsApi, intOf } from './form-kit';

/**
 * What a home card can point at. Rooms and vendors can't be searched from the trip-star checklist (there is no
 * staff list for rooms), so they are kept when already there and can be removed, but not added.
 */
export type CatalogKind = 'trip' | 'outing' | 'hajj' | 'room' | 'vendor';

/** One product (or vendor) inside a trip star or a sidebar. [rowId] is the saved row's id, when it has one. */
export interface CatalogItem {
  kind: CatalogKind;
  id: number;
  name: string;
  rowId?: number;
}

const KIND_LABEL: Record<CatalogKind, string> = {
  trip: 'APP.moduleTrip',
  outing: 'APP.moduleOuting',
  hajj: 'APP.hajjPackage',
  room: 'APP.room',
  vendor: 'APP.vendor'
};

const KIND_ICON: Record<CatalogKind, string> = {
  trip: 'ti ti-plane-departure',
  outing: 'ti ti-compass',
  hajj: 'ti ti-moon',
  room: 'ti ti-bed',
  vendor: 'ti ti-building-store'
};

const KIND_LIST: Partial<Record<CatalogKind, string>> = { trip: 'trips', outing: 'outings', hajj: 'hajj' };

const keyOf = (k: CatalogKind, id: number) => `${k}:${id}`;

/**
 * pickCatalogItems of the app: a searchable checklist of trips, outings, Hajj packages and vendors. Product rows
 * come from POST staff/lists/{listKey}; vendors from the 'vendors' options source. Emits everything ticked on "Done".
 */
@Component({
  selector: 'ts-catalog-picker',
  standalone: true,
  imports: [CommonModule, TranslateModule, SheetComponent, ChipBarComponent, ...KIT],
  template: `
    <ts-sheet [open]="open" (openChange)="close()" [wide]="true" [title]="'APP.chooseItems' | translate">
      <span sheet-action class="ts-muted">{{ 'APP.selectedN' | translate: { n: num(pickedList.length) } }}</span>
      <label class="ts-search">
        <i class="ti ti-search"></i>
        <input type="search" [placeholder]="'APP.search' | translate" (input)="search$.next($any($event.target).value)" />
      </label>
      <ts-chipbar *ngIf="kinds.length > 1" [items]="kindChips()" [selected]="[kind]" (tap)="setKind($any($event))"></ts-chipbar>
      <div class="ts-picker-tools">
        <button *ngIf="kind !== 'vendor'" type="button" class="ts-chip" [class.is-selected]="activeOnly" (click)="activeOnly = !activeOnly">
          {{ 'APP.activeOnly' | translate }}
        </button>
        <button type="button" class="btn btn-link" [disabled]="!visible().length" (click)="toggleVisible()">
          {{ (allVisiblePicked() ? 'APP.unselectShown' : 'APP.selectShown') | translate }}
        </button>
        <button type="button" class="btn btn-link" [disabled]="!pickedList.length" (click)="picked.clear()">{{ 'APP.clearAll' | translate }}</button>
      </div>
      <div class="ts-picked-chips" *ngIf="pickedList.length">
        <span class="ts-chip is-selected" *ngFor="let i of pickedList">
          <i [class]="icon(i.kind)"></i>{{ i.name }}
          <button type="button" (click)="toggle(i)" aria-label="×"><i class="ti ti-x"></i></button>
        </span>
      </div>
      <ts-error *ngIf="error" [error]="error" (retry)="load(true)"></ts-error>
      <div class="ts-picker-list">
        <button type="button" class="ts-picker-row ts-picker-row--check" *ngFor="let i of visible()" (click)="toggle(i)">
          <i class="ti" [class.ti-square-check-filled]="isPicked(i)" [class.ti-square]="!isPicked(i)"></i>
          <span class="ts-grow">
            <strong>{{ i.name }}</strong>
            <small *ngIf="rowsById.get(i.id) as r">
              {{ r.vendorName }}<ng-container *ngIf="!r.isActive"> · {{ 'APP.inactive' | translate }}</ng-container>
            </small>
          </span>
        </button>
        <ts-loading *ngIf="loading"></ts-loading>
        <ts-empty *ngIf="!loading && !error && !visible().length" icon="ti ti-search" [message]="'APP.noResults' | translate"></ts-empty>
        <button *ngIf="hasNext && !loading" type="button" class="btn btn-secondary ts-wide-btn" (click)="loadMore()">{{ 'WEB.loadMore' | translate }}</button>
      </div>
      <div sheet-foot>
        <button type="button" class="btn btn-primary ts-wide-btn" (click)="done()">
          <i class="ti ti-check"></i>{{ 'APP.doneSelectedN' | translate: { n: num(pickedList.length) } }}
        </button>
      </div>
    </ts-sheet>
  `
})
export class CatalogPickerComponent implements OnDestroy {
  private readonly products = inject(ProductsApi);
  private readonly filters = inject(FiltersApi);
  private readonly text = inject(StaffText);
  @Output() picked$ = new EventEmitter<CatalogItem[]>();
  num = fmtNum;

  open = false;
  kinds: CatalogKind[] = ['trip'];
  kind: CatalogKind = 'trip';
  activeOnly = false;
  readonly picked = new Map<string, CatalogItem>();
  rows: ProductRow[] = [];
  rowsById = new Map<number, ProductRow>();
  vendors: CatalogItem[] = [];
  loading = false;
  error: unknown = null;
  hasNext = false;
  private page = 1;
  private searchText = '';
  private req?: Subscription;
  readonly search$ = new Subject<string>();
  private sub = this.search$.pipe(debounceTime(300)).subscribe((q) => {
    this.searchText = q.trim();
    this.load(true);
  });

  get pickedList(): CatalogItem[] {
    return [...this.picked.values()];
  }

  /** Opens with [initial] ticked; items of kinds this checklist can't search are left to the caller. */
  show(kinds: CatalogKind[], initial: CatalogItem[]): void {
    this.kinds = kinds;
    this.kind = kinds[0];
    this.picked.clear();
    initial.forEach((i) => this.picked.set(keyOf(i.kind, i.id), i));
    this.searchText = '';
    this.activeOnly = false;
    this.open = true;
    this.load(true);
  }

  close(): void {
    this.open = false;
    this.req?.unsubscribe();
  }

  done(): void {
    this.picked$.emit(this.pickedList);
    this.close();
  }

  kindChips(): ChipItem[] {
    return this.kinds.map((k) => ({ key: k, label: this.text.tr(KIND_LABEL[k]), count: this.pickedList.filter((i) => i.kind === k).length || null }));
  }

  icon(k: CatalogKind): string {
    return KIND_ICON[k];
  }

  setKind(k: CatalogKind): void {
    this.kind = k;
    this.load(true);
  }

  load(reset = false): void {
    this.req?.unsubscribe();
    this.loading = true;
    this.error = null;
    if (reset) {
      this.page = 1;
      this.rows = [];
      this.rowsById.clear();
      this.vendors = [];
      this.hasNext = false;
    }
    if (this.kind === 'vendor') {
      this.req = this.filters.options('vendors', this.searchText).subscribe({
        next: (o) => {
          this.vendors = o.map((v) => ({ kind: 'vendor', id: +v.value, name: v.labelAr }));
          this.loading = false;
        },
        error: (e) => {
          this.error = e;
          this.loading = false;
        }
      });
      return;
    }
    const q = { ...emptyQuery(), search: this.searchText || undefined, pageIndex: this.page, pageSize: 30 };
    this.req = this.products.list(KIND_LIST[this.kind]!, q).subscribe({
      next: ({ page }) => {
        this.rows = [...this.rows, ...page.data];
        page.data.forEach((r) => this.rowsById.set(r.id, r));
        this.hasNext = page.hasNextPage;
        this.loading = false;
      },
      error: (e) => {
        this.error = e;
        this.loading = false;
      }
    });
  }

  loadMore(): void {
    this.page++;
    this.load();
  }

  visible(): CatalogItem[] {
    if (this.kind === 'vendor') return this.vendors;
    return this.rows.filter((r) => !this.activeOnly || r.isActive).map((r) => ({ kind: this.kind, id: r.id, name: r.name }));
  }

  isPicked(i: CatalogItem): boolean {
    return this.picked.has(keyOf(i.kind, i.id));
  }

  toggle(i: CatalogItem): void {
    const k = keyOf(i.kind, i.id);
    this.picked.has(k) ? this.picked.delete(k) : this.picked.set(k, i);
  }

  allVisiblePicked(): boolean {
    const v = this.visible();
    return v.length > 0 && v.every((i) => this.isPicked(i));
  }

  toggleVisible(): void {
    const all = this.allVisiblePicked();
    this.visible().forEach((i) => (all ? this.picked.delete(keyOf(i.kind, i.id)) : this.picked.set(keyOf(i.kind, i.id), i)));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.req?.unsubscribe();
  }
}

/** CatalogItemsEditor: the ordered items of a card. Drag (or the arrows) to reorder, delete, and add through the picker. */
@Component({
  selector: 'ts-catalog-items',
  standalone: true,
  imports: [CommonModule, TranslateModule, CatalogPickerComponent],
  template: `
    <button type="button" class="btn btn-secondary ts-wide-btn" (click)="picker.show(kinds, searchable())">
      <i class="ti ti-list-check"></i>{{ items.length ? ('APP.editSelectionN' | translate: { n: num(items.length) }) : ('APP.chooseItems' | translate) }}
    </button>
    <p class="ts-muted" *ngIf="!items.length" style="margin: 8px 0 0">{{ 'APP.noItemsYet' | translate }}</p>
    <div class="ts-order-list">
      <div
        class="ts-order-row"
        *ngFor="let i of items; let n = index"
        draggable="true"
        (dragstart)="dragFrom = n"
        (dragover)="$event.preventDefault()"
        (drop)="drop(n)"
        [class.is-dragging]="dragFrom === n"
      >
        <i class="ti ti-grip-vertical ts-order-row__grip"></i>
        <span class="ts-grow">
          <strong>{{ i.name }}</strong>
          <small>{{ label(i.kind) | translate }}</small>
        </span>
        <button type="button" class="ts-icon-btn" [disabled]="n === 0" (click)="move(n, n - 1)" aria-label="↑"><i class="ti ti-arrow-up"></i></button>
        <button type="button" class="ts-icon-btn" [disabled]="n === items.length - 1" (click)="move(n, n + 1)" aria-label="↓"><i class="ti ti-arrow-down"></i></button>
        <button type="button" class="ts-icon-btn ts-danger-ink" (click)="remove(n)" [title]="'APP.delete' | translate"><i class="ti ti-trash"></i></button>
      </div>
    </div>
    <ts-catalog-picker #picker (picked$)="picked($event)"></ts-catalog-picker>
  `
})
export class CatalogItemsComponent {
  @Input() items: CatalogItem[] = [];
  @Input() kinds: CatalogKind[] = ['trip', 'outing', 'hajj'];
  @Output() itemsChange = new EventEmitter<CatalogItem[]>();
  num = fmtNum;
  dragFrom: number | null = null;

  label(k: CatalogKind): string {
    return KIND_LABEL[k];
  }

  searchable(): CatalogItem[] {
    return this.items.filter((i) => this.kinds.includes(i.kind));
  }

  /** Keeps the saved order (and row ids) of what stays ticked, adds the new ones at the end, keeps unsearchable kinds. */
  picked(list: CatalogItem[]): void {
    const pickedKeys = new Set(list.map((p) => keyOf(p.kind, p.id)));
    const kept = this.items.filter((i) => !this.kinds.includes(i.kind) || pickedKeys.has(keyOf(i.kind, i.id)));
    const keptKeys = new Set(kept.map((i) => keyOf(i.kind, i.id)));
    this.emit([...kept, ...list.filter((p) => !keptKeys.has(keyOf(p.kind, p.id)))]);
  }

  move(from: number, to: number): void {
    const next = [...this.items];
    next.splice(to, 0, next.splice(from, 1)[0]);
    this.emit(next);
  }

  drop(to: number): void {
    if (this.dragFrom != null && this.dragFrom !== to) this.move(this.dragFrom, to);
    this.dragFrom = null;
  }

  remove(n: number): void {
    this.emit(this.items.filter((_, j) => j !== n));
  }

  private emit(v: CatalogItem[]): void {
    this.items = v;
    this.itemsChange.emit(v);
  }
}

/**
 * a-tripstar-editor: a "Trip Star" card of the customer app. POST /api/TripStar/AddTripStar/ or PUT UpdateTripStar/{id},
 * multipart TripStarCreateDto. The item lists (TripIds, OutingIds, HajjIds, RoomIds) are each one form field holding
 * a JSON array of {id, order}, and the update replaces all the card's items with what is sent.
 */
@Component({
  selector: 'ts-tripstar-form',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ...FORM_KIT, CatalogItemsComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="(id ? 'APP.editTripStar' : 'APP.newTripStar') | translate"></ts-appbar>
      <ts-loading *ngIf="loading"></ts-loading>
      <ts-error *ngIf="loadError" [error]="loadError" (retry)="load()"></ts-error>
      <ng-container *ngIf="!loading && !loadError">
        <p class="ts-label">{{ 'APP.customerSees' | translate }}</p>
        <label class="ts-star-preview" [style.background-image]="previewUrl ? 'url(' + previewUrl + ')' : null">
          <span class="ts-star-preview__badge">TRIP STAR</span>
          <span class="ts-grow"></span>
          <strong>{{ shownTitle() || ('APP.title' | translate) }}</strong>
          <small *ngIf="shownSubtitle()">{{ shownSubtitle() }}</small>
          <em>{{ 'APP.tapToChangeImage' | translate }}</em>
          <input type="file" accept="image/*" hidden (change)="pickImage($any($event.target).files)" />
        </label>
        <section class="ts-section">
          <ts-field [label]="'APP.titleAr' | translate" [required]="true" [(value)]="f.titleAr"></ts-field>
          <ts-field [label]="'APP.titleEn' | translate" [(value)]="f.title"></ts-field>
          <ts-field [label]="'APP.subtitleAr' | translate" [(value)]="f.descriptionAr"></ts-field>
          <ts-field [label]="'APP.subtitleEn' | translate" [(value)]="f.description"></ts-field>
          <ts-field [label]="'APP.linkUrl' | translate" [hint]="'APP.optional' | translate" [(value)]="f.link"></ts-field>
          <ts-date-field [label]="'APP.expiryDate' | translate" [(value)]="f.expiry"></ts-date-field>
        </section>
        <ts-form-section [title]="'APP.cardItems' | translate" [subtitle]="'APP.cardItemsHint' | translate" icon="ti ti-package">
          <ts-catalog-items [(items)]="items" [kinds]="['trip', 'outing', 'hajj']"></ts-catalog-items>
        </ts-form-section>
        <div class="ts-sticky-foot">
          <button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy" (click)="save()">
            <i *ngIf="busy" class="pi pi-spin pi-spinner"></i>{{ 'APP.save' | translate }}
          </button>
        </div>
      </ng-container>
    </div>
  `
})
export class TripStarFormComponent implements OnInit, OnDestroy {
  private readonly api = inject(FormsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly text = inject(StaffText);

  id: number | null = null;
  loading = false;
  loadError: unknown = null;
  busy = false;
  f = { title: '', titleAr: '', description: '', descriptionAr: '', link: '', expiry: null as Date | null, order: 0 };
  image: File | null = null;
  imageUrl: string | null = null;
  previewUrl: string | null = null;
  items: CatalogItem[] = [];

  ngOnInit(): void {
    this.id = intOf(this.route.snapshot.queryParamMap.get('id'));
    if (this.id) this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.loadError = null;
    try {
      const d = await firstValueFrom(this.api.get('/api/TripStar/GetTripStarById/', this.id!));
      this.f = {
        title: d.title ?? '',
        titleAr: d.titleAr ?? '',
        description: d.description ?? '',
        descriptionAr: d.descriptionAr ?? '',
        link: d.linkUrl ?? '',
        expiry: d.expiryDate ? new Date(d.expiryDate) : null,
        order: d.displayOrder ?? 0
      };
      this.imageUrl = d.imageUrl ?? null;
      this.previewUrl = mediaUrl(this.imageUrl);
      const rows = [...(d.items ?? [])].sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      this.items = rows.map((i: any) => ({
        kind: ({ 2: 'outing', 3: 'room', 4: 'hajj' } as Record<number, CatalogKind>)[i.entityType] ?? 'trip',
        id: i.entityId,
        name: i.title || `#${i.entityId}`,
        rowId: i.id
      }));
    } catch (e) {
      this.loadError = e;
    } finally {
      this.loading = false;
    }
  }

  shownTitle(): string {
    return (this.text.arabic ? this.f.titleAr : this.f.title).trim();
  }

  shownSubtitle(): string {
    return (this.text.arabic ? this.f.descriptionAr : this.f.description).trim();
  }

  pickImage(list: FileList | null): void {
    const file = list?.[0];
    if (!file) return;
    this.image = file;
    if (this.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = URL.createObjectURL(file);
  }

  /** `[{"id":12,"order":1}, …]` for one kind; the order is the position in the whole card. */
  private idsOf(kind: CatalogKind): string {
    return JSON.stringify(this.items.map((i, n) => ({ i, n })).filter(({ i }) => i.kind === kind).map(({ i, n }) => ({ id: i.id, order: n + 1 })));
  }

  async save(): Promise<void> {
    if (!this.f.title.trim() && !this.f.titleAr.trim()) return this.text.showError(this.text.tr('APP.fillRequired'));
    if (!this.items.length) return this.text.showError(this.text.tr('APP.itemsRequired'));
    this.busy = true;
    const body: Record<string, unknown> = {
      Title: this.f.title.trim(),
      TitleAr: this.f.titleAr.trim(),
      Description: this.f.description.trim(),
      DescriptionAr: this.f.descriptionAr.trim(),
      LinkUrl: this.f.link.trim(),
      DisplayOrder: this.f.order,
      ExpiryDate: this.f.expiry,
      Image: this.image,
      TripIds: this.idsOf('trip'),
      OutingIds: this.idsOf('outing'),
      HajjIds: this.idsOf('hajj'),
      RoomIds: this.idsOf('room')
    };
    try {
      await firstValueFrom(
        this.id ? this.api.postForm(`/api/TripStar/UpdateTripStar/${this.id}`, body, true) : this.api.postForm('/api/TripStar/AddTripStar/', body)
      );
      this.text.showDone(this.text.tr('APP.productSaved'));
      this.location.back();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }

  ngOnDestroy(): void {
    if (this.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(this.previewUrl);
  }
}

const SIDEBAR_COLORS = ['#E8590C', '#0B5C8A', '#0E7C80', '#8A6100', '#C2187A', '#344054'];
const SIDEBAR_TYPE: Record<CatalogKind, number> = { room: 1, outing: 2, hajj: 3, trip: 4, vendor: 5 };
const SIDEBAR_KEY: Record<CatalogKind, string> = { room: 'roomId', outing: 'outingId', hajj: 'hajjId', trip: 'tripId', vendor: 'companyId' };

/**
 * a-sidebar-form: a strip of the customer app's home. POST /api/SideBars/AddSideBar/ or PUT UpdateSideBar/ (JSON).
 * Items keep their row id so the update edits them in place; removed rows go in removedItemId.
 */
@Component({
  selector: 'ts-sidebar-form',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ...FORM_KIT, SwitchRowComponent, CatalogItemsComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar
        [title]="id ? f.title : ('APP.newSidebar' | translate)"
        [subtitle]="'APP.sidebarItemsN' | translate: { n: num(items.length) }"
      ></ts-appbar>
      <ts-loading *ngIf="loading"></ts-loading>
      <ts-error *ngIf="loadError" [error]="loadError" (retry)="load()"></ts-error>
      <ng-container *ngIf="!loading && !loadError">
        <ts-form-section [title]="'APP.sidebar' | translate" icon="ti ti-layout-rows">
          <ts-field [label]="'APP.shownTitle' | translate" [required]="true" [(value)]="f.title"></ts-field>
          <div class="ts-field">
            <span>{{ 'APP.color' | translate }}</span>
            <div class="ts-swatches">
              <button
                type="button"
                *ngFor="let c of colorChoices()"
                class="ts-swatch"
                [class.is-on]="f.color === c"
                [style.background]="c"
                (click)="f.color = c"
                [attr.aria-label]="c"
              ></button>
            </div>
          </div>
          <ts-field [label]="'APP.order' | translate" [number]="true" [required]="true" [(value)]="f.order"></ts-field>
          <ts-switch-row [title]="'APP.visible' | translate" [(value)]="f.active"></ts-switch-row>
        </ts-form-section>
        <ts-form-section [title]="'APP.addItem' | translate" [subtitle]="'APP.sidebarAddHint' | translate" icon="ti ti-circle-plus">
          <ts-catalog-items [(items)]="items" [kinds]="['trip', 'outing', 'hajj', 'vendor']"></ts-catalog-items>
        </ts-form-section>
        <button *ngIf="id" type="button" class="btn btn-outline-danger ts-wide-btn" (click)="remove()">
          <i class="ti ti-trash"></i>{{ 'APP.deleteSidebar' | translate }}
        </button>
        <div class="ts-sticky-foot">
          <button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy" (click)="save()">
            <i *ngIf="busy" class="pi pi-spin pi-spinner"></i><i *ngIf="!busy" class="ti ti-check"></i>{{ 'APP.save' | translate }}
          </button>
        </div>
      </ng-container>
    </div>
  `
})
export class SidebarFormComponent implements OnInit {
  private readonly api = inject(FormsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  num = fmtNum;

  id: number | null = null;
  loading = false;
  loadError: unknown = null;
  busy = false;
  f = { title: '', order: '1', color: SIDEBAR_COLORS[0], active: true };
  items: CatalogItem[] = [];
  private originalRowIds = new Set<number>();

  ngOnInit(): void {
    this.id = intOf(this.route.snapshot.queryParamMap.get('id'));
    if (this.id) this.load();
  }

  colorChoices(): string[] {
    return [...new Set([...SIDEBAR_COLORS, this.f.color])];
  }

  async load(): Promise<void> {
    this.loading = true;
    this.loadError = null;
    try {
      const d = await firstValueFrom(this.api.get('/api/SideBars/GetSideBarById/', this.id!));
      this.f = { title: d.title ?? '', order: String(d.squence ?? 1), color: d.color || SIDEBAR_COLORS[0], active: d.isActive ?? true };
      const rows = [...(d.sideBarItems ?? [])].sort((a: any, b: any) => (a.squence ?? 0) - (b.squence ?? 0));
      this.items = rows.map((r: any) => {
        const kind = ({ 1: 'room', 2: 'outing', 3: 'hajj', 5: 'vendor' } as Record<number, CatalogKind>)[r.sideBarItemType] ?? 'trip';
        const id = r[SIDEBAR_KEY[kind]] ?? 0;
        const nested = r[{ room: 'room', outing: 'outing', hajj: 'hajj', vendor: 'company', trip: 'trip' }[kind]];
        return { kind, id, name: nested?.name ?? `#${id}`, rowId: r.id };
      });
      this.originalRowIds = new Set(this.items.map((i) => i.rowId!).filter((x) => x != null));
    } catch (e) {
      this.loadError = e;
    } finally {
      this.loading = false;
    }
  }

  async save(): Promise<void> {
    const order = intOf(this.f.order);
    if (!this.f.title.trim() || order == null) return this.text.showError(this.text.tr('APP.fillRequired'));
    if (!this.items.length) return this.text.showError(this.text.tr('APP.itemsRequired'));
    this.busy = true;
    const kept = new Set(this.items.map((i) => i.rowId).filter((x) => x != null));
    const body = {
      ...(this.id ? { id: this.id } : {}),
      title: this.f.title.trim(),
      color: this.f.color,
      squence: order,
      isActive: this.f.active,
      sideBarItems: this.items.map((i, n) => ({
        ...(i.rowId != null ? { id: i.rowId } : {}),
        squence: n + 1,
        sideBarItemType: SIDEBAR_TYPE[i.kind],
        [SIDEBAR_KEY[i.kind]]: i.id
      })),
      ...(this.id ? { removedItemId: [...this.originalRowIds].filter((r) => !kept.has(r)) } : {})
    };
    try {
      await firstValueFrom(
        this.id ? this.api.postJson('/api/SideBars/UpdateSideBar/', body, true) : this.api.postJson('/api/SideBars/AddSideBar/', body)
      );
      this.text.showDone(this.text.tr('APP.productSaved'));
      this.location.back();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }

  async remove(): Promise<void> {
    const ok = await this.dialogs.confirm({ title: this.text.tr('APP.deleteSidebarQ'), message: this.f.title, confirm: this.text.tr('APP.delete'), danger: true });
    if (!ok) return;
    this.api.delete('/api/SideBars/DeleteSideBar/', this.id!).subscribe({ next: () => this.location.back(), error: (e) => this.text.showError(e) });
  }
}
