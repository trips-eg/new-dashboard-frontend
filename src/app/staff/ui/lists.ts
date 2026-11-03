import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, debounceTime, Subject, switchMap, catchError, of } from 'rxjs';
import { FilterCondition, FilterField, FilterOption, FilterSchema, FiltersApi, PagedList, StaffQuery, optionLabel } from '../core/query';
import { apiDate, dayGroup, fmtDay, latinDigits, parseDate } from '../core/format';
import { EmptyComponent, ErrorComponent, LoadingComponent, StaffText, TsFormatPipe } from './kit';

/** SearchField. */
@Component({
  selector: 'ts-search',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="ts-search">
      <i class="ti ti-search" aria-hidden="true"></i>
      <input type="search" [placeholder]="hint" [attr.aria-label]="hint" [ngModel]="value" (ngModelChange)="changed.emit($event)" />
    </label>
  `
})
export class SearchComponent {
  @Input() hint = '';
  @Input() value = '';
  @Output() changed = new EventEmitter<string>();
}

export interface ChipItem {
  key: string;
  label: string;
  dot?: string | null;
  count?: number | null;
}

/** ChipBar. */
@Component({
  selector: 'ts-chipbar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ts-chips" [class.ts-chips--wrap]="wrap" role="group">
      <button
        type="button"
        class="ts-chip"
        *ngFor="let i of items"
        [class.is-selected]="selected.includes(i.key)"
        [attr.aria-pressed]="selected.includes(i.key)"
        (click)="tap.emit(i.key)"
      >
        <i *ngIf="i.dot" class="ts-chip__dot" [style.background]="i.dot" aria-hidden="true"></i>
        {{ i.label }}
        <span *ngIf="i.count != null" class="ts-chip__count">{{ i.count }}</span>
      </button>
    </div>
  `
})
export class ChipBarComponent {
  @Input() items: ChipItem[] = [];
  @Input() selected: string[] = [];
  @Input() wrap = false;
  @Output() tap = new EventEmitter<string>();
}

/** Segmented: underline tabs with counts (the presets of a list). */
@Component({
  selector: 'ts-segmented',
  standalone: true,
  imports: [CommonModule, TsFormatPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ts-segmented" role="tablist">
      <button
        type="button"
        role="tab"
        *ngFor="let i of items"
        [class.is-selected]="i.key === selected"
        [attr.aria-selected]="i.key === selected"
        (click)="changed.emit(i.key)"
      >
        {{ i.label }}
        <span *ngIf="i.count != null" class="ts-segmented__count" [class.is-alert]="i.alert">{{ i.count | ts }}</span>
      </button>
    </div>
  `
})
export class SegmentedComponent {
  @Input() items: { key: string; label: string; count?: number | null; alert?: boolean }[] = [];
  @Input() selected = '';
  @Output() changed = new EventEmitter<string>();
}

/** TicketCard: the booking card with the dashed tear line and the two notches. */
@Component({
  selector: 'ts-ticket',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ts-ticket" [class.is-link]="clickable" [style.border-color]="borderColor" [attr.tabindex]="clickable ? 0 : null" [attr.role]="clickable ? 'link' : null">
      <div class="ts-ticket__top"><ng-content select="[top]"></ng-content></div>
      <div class="ts-ticket__tear" aria-hidden="true"><i [style.border-color]="borderColor"></i><span></span><i [style.border-color]="borderColor"></i></div>
      <div class="ts-ticket__bottom"><ng-content select="[bottom]"></ng-content></div>
    </div>
  `
})
export class TicketComponent {
  @Input() clickable = true;
  @Input() borderColor?: string | null;
}

/**
 * PagedListView: the rows of a PagedList, grouped by day when [groupDate] is set, with loading / empty /
 * empty-because-filtered / error states, and the next page loading as the end comes into view.
 */
@Component({
  selector: 'ts-paged-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, LoadingComponent, EmptyComponent, ErrorComponent],
  template: `
    <ts-loading *ngIf="list.loading && !list.items.length"></ts-loading>
    <ts-error *ngIf="list.error && !list.items.length" [error]="list.error" (retry)="list.refresh()"></ts-error>
    <ng-container *ngIf="!list.loading && !list.error && !list.items.length">
      <ts-empty
        *ngIf="list.filtered"
        [message]="'APP.noResultsForFilters' | translate"
        icon="ti ti-filter-off"
        [action]="'APP.clearFilters' | translate"
        (act)="list.applyFilters([]); list.setSearch('')"
      ></ts-empty>
      <ts-empty *ngIf="!list.filtered" [message]="emptyMessage || ('APP.nothingHereYet' | translate)" [icon]="emptyIcon"></ts-empty>
    </ng-container>
    <div class="ts-list" [class.ts-list--grid]="grid" *ngIf="list.items.length">
      <ng-container *ngFor="let item of list.items; let i = index; trackBy: track">
        <h3 class="ts-group-label" *ngIf="groupDate && groupLabel(i) as g">{{ g }}</h3>
        <ng-container *ngTemplateOutlet="row; context: { $implicit: item, index: i }"></ng-container>
      </ng-container>
    </div>
    <div #sentinel class="ts-list__more">
      <i *ngIf="list.loadingMore" class="pi pi-spin pi-spinner" aria-hidden="true"></i>
      <button *ngIf="list.hasNext && !list.loadingMore" type="button" class="btn btn-secondary" (click)="list.loadMore()">
        {{ 'WEB.loadMore' | translate }}
      </button>
    </div>
  `
})
export class PagedListComponent<T> implements AfterViewInit, OnDestroy {
  private readonly text = inject(StaffText);
  @Input({ required: true }) list!: PagedList<T>;
  @Input() groupDate?: (item: T) => unknown;
  @Input() emptyMessage?: string | null;
  @Input() emptyIcon = 'ti ti-inbox';
  @Input() grid = false;
  @ContentChild(TemplateRef) row!: TemplateRef<unknown>;
  @ViewChild('sentinel') sentinel?: ElementRef<HTMLElement>;
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined' || !this.sentinel) return;
    this.observer = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && this.list.loadMore(), { rootMargin: '400px' });
    this.observer.observe(this.sentinel.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  track = (i: number, item: any) => item?.id ?? i;

  private label(item: T): string | null {
    const d = parseDate(this.groupDate?.(item) as string) ?? (this.groupDate?.(item) instanceof Date ? (this.groupDate?.(item) as Date) : null);
    if (!d) return null;
    const ar = this.text.arabic;
    const g = dayGroup(d);
    if (g === 'today') return `${this.text.tr('APP.today')} · ${fmtDay(d, ar)}`;
    if (g === 'yesterday') return this.text.tr('APP.yesterday');
    return fmtDay(d, ar);
  }

  /** The day heading before row i, when it starts a new day. */
  groupLabel(i: number): string | null {
    const g = this.label(this.list.items[i]);
    if (!g) return null;
    return i === 0 || this.label(this.list.items[i - 1]) !== g ? g : null;
  }
}

/**
 * The filter sheet of a list, drawn from GET /api/staff/filters/{listKey} (no list has a hand-written filter
 * screen): chips, switches, ranges, date ranges with quick values, text, and selects (local or remote options),
 * with facet counts and the live total on the apply button. A drawer from the inline-end side on the web.
 */
@Component({
  selector: 'ts-filter-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, TsFormatPipe, ChipBarComponent, LoadingComponent],
  template: `
    <div class="ts-drawer-backdrop" *ngIf="open" (click)="close()"></div>
    <aside class="ts-drawer" *ngIf="open" role="dialog" aria-modal="true" [attr.aria-label]="title">
      <header class="ts-drawer__head">
        <h2>{{ title }}</h2>
        <button type="button" class="btn btn-link text-danger" (click)="clearAll()">{{ 'APP.clearAll' | translate }}</button>
        <button type="button" class="ts-icon-btn" (click)="close()" [attr.aria-label]="'APP.cancel' | translate"><i class="ti ti-x"></i></button>
      </header>
      <div class="ts-drawer__body">
        <ts-loading *ngIf="!schema"></ts-loading>
        <ng-container *ngIf="schema">
          <ng-container *ngFor="let f of fields()">
            <!-- switch -->
            <div class="ts-switch-line" *ngIf="f.control === 'switch'">
              <span>{{ label(f) }}</span>
              <input type="checkbox" class="form-check-input" role="switch" [checked]="draft[f.key]?.op === 'isTrue'" (change)="setSwitch(f, $any($event.target).checked)" />
            </div>
            <div class="ts-filter-field" *ngIf="f.control !== 'switch'">
              <h3>{{ label(f) }}</h3>
              <!-- chips -->
              <ts-chipbar
                *ngIf="f.control === 'chips'"
                [wrap]="true"
                [items]="chipItems(f)"
                [selected]="draft[f.key]?.values ?? []"
                (tap)="toggleChip(f, $event)"
              ></ts-chipbar>
              <!-- range -->
              <div class="ts-two" *ngIf="f.control === 'range'">
                <label class="ts-prefixed"
                  ><span>{{ 'APP.from' | translate }}</span
                  ><input class="form-control" inputmode="decimal" [ngModel]="rangeValue(f, 0)" (ngModelChange)="setRange(f, $event, null)"
                /></label>
                <label class="ts-prefixed"
                  ><span>{{ 'APP.to' | translate }}</span
                  ><input class="form-control" inputmode="decimal" [ngModel]="rangeValue(f, 1)" (ngModelChange)="setRange(f, null, $event)"
                /></label>
              </div>
              <!-- date range -->
              <ng-container *ngIf="f.control === 'dateRange'">
                <ts-chipbar
                  *ngIf="f.quickValues.length"
                  [wrap]="true"
                  [items]="quickItems(f)"
                  [selected]="draft[f.key]?.op === 'eq' ? (draft[f.key]?.values ?? []) : []"
                  (tap)="toggleQuick(f, $event)"
                ></ts-chipbar>
                <div class="ts-two">
                  <label class="ts-prefixed"
                    ><span>{{ 'APP.from' | translate }}</span
                    ><input type="date" class="form-control" [ngModel]="dateValue(f, 0)" (ngModelChange)="setDate(f, $event, 0)"
                  /></label>
                  <label class="ts-prefixed"
                    ><span>{{ 'APP.to' | translate }}</span
                    ><input type="date" class="form-control" [ngModel]="dateValue(f, 1)" (ngModelChange)="setDate(f, $event, 1)"
                  /></label>
                </div>
              </ng-container>
              <!-- text -->
              <input
                *ngIf="f.control === 'text'"
                class="form-control"
                [placeholder]="label(f)"
                [ngModel]="draft[f.key]?.values?.[0] ?? ''"
                (ngModelChange)="setText(f, $event)"
              />
              <!-- selects -->
              <ng-container *ngIf="isSelect(f)">
                <input
                  *ngIf="remote(f)"
                  class="form-control ts-mb-8"
                  type="search"
                  [placeholder]="'APP.search' | translate"
                  (input)="searchOptions(f, $any($event.target).value)"
                />
                <div class="ts-options">
                  <label class="ts-option" *ngFor="let o of options(f)">
                    <input type="checkbox" class="form-check-input" [checked]="isPicked(f, o)" (change)="pick(f, o, $any($event.target).checked)" />
                    <span>{{ optLabel(o) }}</span>
                    <small *ngIf="facets[f.key]?.[o.value] != null">{{ facets[f.key][o.value] | ts }}</small>
                  </label>
                  <p class="ts-muted" *ngIf="!options(f).length">{{ 'APP.nothingHereYet' | translate }}</p>
                </div>
              </ng-container>
            </div>
          </ng-container>
        </ng-container>
      </div>
      <footer class="ts-drawer__foot">
        <button type="button" class="btn btn-secondary" (click)="close()">{{ 'APP.cancel' | translate }}</button>
        <button type="button" class="btn btn-primary" (click)="apply()">
          {{ count == null ? ('APP.showResults' | translate) : ('APP.showCount' | translate: { n: (count | ts) }) }}
        </button>
      </footer>
    </aside>
  `
})
export class FilterDrawerComponent implements OnInit, OnDestroy {
  private readonly api = inject(FiltersApi);
  private readonly text = inject(StaffText);

  @Input({ required: true }) listKey!: string;
  @Input() title = '';
  @Input({ required: true }) list!: PagedList<unknown>;
  open = false;
  schema: FilterSchema | null = null;
  draft: Record<string, FilterCondition> = {};
  facets: Record<string, Record<string, number>> = {};
  count: number | null = null;
  private remoteOptions: Record<string, FilterOption[]> = {};
  private picked: Record<string, FilterOption> = {};
  private recount$ = new Subject<StaffQuery>();
  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.subs.push(
      this.recount$
        .pipe(
          debounceTime(300),
          switchMap((q) => this.api.count(this.listKey, q).pipe(catchError(() => of(null))))
        )
        .subscribe((n) => (this.count = n))
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  show(): void {
    this.draft = {};
    for (const f of this.list.query.filters) this.draft[f.field] = { ...f, values: [...f.values] };
    this.open = true;
    this.count = null;
    this.subs.push(this.api.schema(this.listKey).subscribe((s) => (this.schema = s)));
    this.subs.push(this.api.facets(this.listKey, this.query()).subscribe({ next: (f) => (this.facets = f), error: () => {} }));
    this.recount();
  }

  close(): void {
    this.open = false;
  }

  apply(): void {
    this.list.applyFilters(Object.values(this.draft));
    this.open = false;
  }

  clearAll(): void {
    this.draft = {};
    this.recount();
  }

  private query(): StaffQuery {
    return { ...this.list.query, filters: Object.values(this.draft), pageIndex: 1 };
  }

  private recount(): void {
    this.recount$.next(this.query());
  }

  private set(field: string, c: FilterCondition | null): void {
    if (c) this.draft[field] = c;
    else delete this.draft[field];
    this.recount();
  }

  label(f: FilterField): string {
    return optionLabel(f, this.text.arabic);
  }

  optLabel(o: FilterOption): string {
    return optionLabel(o, this.text.arabic);
  }

  /** A choice field with no options and no remote source can't be picked from (e.g. "items"), so it isn't shown. */
  fields(): FilterField[] {
    return (this.schema?.fields ?? []).filter(
      (f) => !(['chips', 'select', 'multiSelect', 'remoteSelect'].includes(f.control) && !f.options.length && !f.optionsSource)
    );
  }

  chipItems(f: FilterField) {
    return f.options.map((o) => ({ key: o.value, label: this.optLabel(o), count: this.facets[f.key]?.[o.value] ?? null }));
  }

  toggleChip(f: FilterField, v: string): void {
    const next = new Set(this.draft[f.key]?.values ?? []);
    if (f.multi) next.has(v) ? next.delete(v) : next.add(v);
    else if (next.has(v)) next.clear();
    else {
      next.clear();
      next.add(v);
    }
    this.set(f.key, next.size ? { field: f.key, op: f.multi || next.size > 1 ? 'in' : 'eq', values: [...next] } : null);
  }

  setSwitch(f: FilterField, on: boolean): void {
    this.set(f.key, on ? { field: f.key, op: 'isTrue', values: [] } : null);
  }

  rangeValue(f: FilterField, i: 0 | 1): string {
    const c = this.draft[f.key];
    if (!c) return '';
    if (c.op === 'between') return c.values[i] ?? '';
    if (c.op === 'gte') return i === 0 ? c.values[0] : '';
    if (c.op === 'lte') return i === 1 ? c.values[0] : '';
    return '';
  }

  setRange(f: FilterField, a: string | null, b: string | null): void {
    const from = a !== null ? a : this.rangeValue(f, 0);
    const to = b !== null ? b : this.rangeValue(f, 1);
    const x = from ? latinDigits(from) : null;
    const y = to ? latinDigits(to) : null;
    this.set(
      f.key,
      x && y ? { field: f.key, op: 'between', values: [x, y] } : x ? { field: f.key, op: 'gte', values: [x] } : y ? { field: f.key, op: 'lte', values: [y] } : null
    );
  }

  quickItems(f: FilterField) {
    const keys: Record<string, string> = {
      today: 'APP.today',
      yesterday: 'APP.yesterday',
      tomorrow: 'APP.tomorrow',
      last7d: 'APP.last7Days',
      last30d: 'APP.last30Days',
      next7d: 'APP.next7Days',
      next30d: 'APP.next30Days',
      thisWeek: 'APP.thisWeek',
      thisMonth: 'APP.thisMonth',
      lastMonth: 'APP.lastMonth'
    };
    return f.quickValues.map((q) => ({ key: q, label: keys[q] ? this.text.tr(keys[q]) : q }));
  }

  toggleQuick(f: FilterField, v: string): void {
    const c = this.draft[f.key];
    this.set(f.key, c?.op === 'eq' && c.values[0] === v ? null : { field: f.key, op: 'eq', values: [v] });
  }

  dateValue(f: FilterField, i: 0 | 1): string {
    const c = this.draft[f.key];
    return c?.op === 'between' ? (c.values[i] ?? '') : '';
  }

  setDate(f: FilterField, value: string, i: 0 | 1): void {
    if (!value) return;
    const other = this.dateValue(f, i === 0 ? 1 : 0) || value;
    let [a, b] = i === 0 ? [value, other] : [other, value];
    if (a > b) [a, b] = [b, a];
    this.set(f.key, { field: f.key, op: 'between', values: [a, b] });
  }

  setText(f: FilterField, v: string): void {
    this.set(f.key, v.trim() ? { field: f.key, op: 'contains', values: [v.trim()] } : null);
  }

  isSelect(f: FilterField): boolean {
    return !['chips', 'switch', 'range', 'dateRange', 'text'].includes(f.control);
  }

  remote(f: FilterField): boolean {
    return !!f.optionsSource && !f.options.length;
  }

  options(f: FilterField): FilterOption[] {
    if (!this.remote(f)) return f.options;
    if (!this.remoteOptions[f.key]) {
      this.remoteOptions[f.key] = [];
      this.searchOptions(f, '');
    }
    const shown = this.remoteOptions[f.key];
    // Keep the picked ones visible while searching
    const extra = (this.draft[f.key]?.values ?? []).filter((v) => !shown.some((o) => o.value === v)).map((v) => this.picked[v] ?? { value: v, labelAr: v });
    return [...extra, ...shown];
  }

  searchOptions(f: FilterField, q: string): void {
    this.api.options(f.optionsSource!, q).subscribe({ next: (o) => (this.remoteOptions[f.key] = o), error: () => {} });
  }

  isPicked(f: FilterField, o: FilterOption): boolean {
    return (this.draft[f.key]?.values ?? []).includes(o.value);
  }

  pick(f: FilterField, o: FilterOption, on: boolean): void {
    const multi = f.multi || f.control === 'multiSelect';
    let values = [...(this.draft[f.key]?.values ?? [])];
    if (!multi) values = [];
    if (on) {
      values.push(o.value);
      this.picked[o.value] = o;
    } else values = values.filter((v) => v !== o.value);
    this.set(f.key, values.length ? { field: f.key, op: values.length > 1 || multi ? 'in' : 'eq', values } : null);
  }
}

export { apiDate };

export const LISTS = [SearchComponent, ChipBarComponent, SegmentedComponent, TicketComponent, PagedListComponent, FilterDrawerComponent] as const;
