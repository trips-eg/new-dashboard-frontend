import { Component, Input, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { KIT, StaffText } from '../ui/kit';
import { FilterDrawerComponent, LISTS } from '../ui/lists';
import { FilterCondition, FilterSchema, FiltersApi, PagedList } from '../core/query';
import { BookingStatus, ITEM_TYPES } from '../core/enums';
import { P, StaffSession } from '../core/session';
import { fmtNum } from '../core/format';
import { BookingRow, BookingsApi } from './bookings-api';
import { BOOKING_PARTS } from './booking-parts';

/** a-bookings and v-bookings: the same list; for a vendor the backend returns only their bookings. */
@Component({
  selector: 'ts-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...LISTS, ...BOOKING_PARTS],
  template: `
    <div class="ts-screen">
      <ts-appbar
        [title]="title || ((vendor ? 'APP.tabMyBookings' : 'APP.tabBookings') | translate)"
        [subtitle]="'APP.bookingsCount' | translate: { n: num(list.total) }"
        [back]="!!customerId || filters.length > 0"
      >
        <button type="button" class="ts-icon-btn" (click)="drawer.show()" [attr.aria-label]="'APP.bookingFilters' | translate">
          <i class="ti ti-adjustments-horizontal"></i>
          <span class="ts-icon-btn__badge" *ngIf="list.activeFilters">{{ list.activeFilters }}</span>
        </button>
        <a *ngIf="!vendor" class="ts-icon-btn" routerLink="/analytics/reports" [attr.aria-label]="'APP.reports' | translate"><i class="ti ti-download"></i></a>
        <a *ngIf="canCreate && !filters.length" class="ts-fab ts-fab--float" routerLink="/a/bookings/new"><i class="ti ti-plus"></i>{{ 'APP.newBooking' | translate }}</a>
      </ts-appbar>

      <div class="ts-listbar">
        <ts-search [hint]="schema?.searchPlaceholderAr || ('APP.bookingsSearchHint' | translate)" (changed)="list.setSearch($event)"></ts-search>
        <ts-chipbar [items]="moduleChips" [selected]="[list.filterValue('module') ?? '']" (tap)="setModule($event)"></ts-chipbar>
        <ts-segmented
          *ngIf="schema?.presets?.length"
          [items]="presets()"
          [selected]="list.query.preset ?? 'all'"
          (changed)="list.setPreset($event)"
        ></ts-segmented>
      </div>

      <ts-paged-list [list]="list" [groupDate]="groupDate" [emptyMessage]="'APP.noBookings' | translate" emptyIcon="ti ti-calendar" [grid]="true">
        <ng-template let-b>
          <ts-booking-card [b]="b" (open)="open(b)"></ts-booking-card>
        </ng-template>
      </ts-paged-list>
    </div>
    <ts-filter-drawer #drawer listKey="bookings" [title]="'APP.bookingFilters' | translate" [list]="$any(list)"></ts-filter-drawer>
  `
})
export class BookingsComponent implements OnInit, OnDestroy {
  private readonly api = inject(BookingsApi);
  private readonly filtersApi = inject(FiltersApi);
  private readonly session = inject(StaffSession);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly text = inject(StaffText);

  @Input() vendor = false;
  /** Set when shown inside a customer's file: only that customer's bookings. */
  @Input() customerId?: number;
  /** Opened from an analytics number: exactly the bookings behind it. */
  @Input() filters: FilterCondition[] = [];
  @Input() title?: string;
  @ViewChild('drawer') drawer!: FilterDrawerComponent;

  list!: PagedList<BookingRow>;
  schema: FilterSchema | null = null;
  num = fmtNum;
  groupDate = (b: BookingRow) => b.createDate;

  get canCreate(): boolean {
    return this.session.can(P.bookingCreate) && !this.vendor;
  }

  get moduleChips() {
    return [
      { key: '', label: this.text.tr('APP.all') },
      ...[1, 2, 3, 4].map((v) => {
        const t = ITEM_TYPES.find((x) => x.value === v)!;
        return { key: String(v), label: this.text.tr(t.plural), dot: t.color };
      })
    ];
  }

  ngOnInit(): void {
    this.vendor = this.vendor || !!this.route.snapshot.data['vendor'];
    // Opened from a number elsewhere (bookingsLink): the filters and title come as matrix params ;f=…;t=…
    const params = this.route.snapshot.paramMap;
    if (!this.filters.length && params.get('f')) {
      try {
        this.filters = JSON.parse(params.get('f')!);
      } catch {
        this.filters = [];
      }
      this.title = this.title ?? params.get('t') ?? undefined;
    }
    const filters: FilterCondition[] = [
      ...(this.customerId ? [{ field: 'customerId', op: 'eq' as const, values: [String(this.customerId)] }] : []),
      ...this.filters
    ];
    this.list = new PagedList<BookingRow>((q) => this.api.list(q), { preset: 'all', filters }, !this.customerId && !this.filters.length ? 'bookings' : undefined);
    this.filtersApi.schema('bookings').subscribe({ next: (s) => (this.schema = s), error: () => {} });
  }

  ngOnDestroy(): void {
    this.list?.destroy();
  }

  presets() {
    return (this.schema?.presets ?? []).map((p) => ({
      key: p.key,
      label: p.labelAr,
      count: p.key === (this.list.query.preset ?? 'all') ? this.list.total : null,
      alert: p.key === 'instaReview'
    }));
  }

  setModule(k: string): void {
    this.list.setFilter('module', k ? { field: 'module', op: 'eq', values: [k] } : null);
  }

  open(b: BookingRow): void {
    const base = this.vendor ? '/v/bookings' : '/a/bookings';
    this.router.navigate(!this.vendor && b.status === BookingStatus.instaPending ? [base, b.id, 'instapay'] : [base, b.id]);
  }
}
