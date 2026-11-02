import { Injectable, inject } from '@angular/core';
import { Observable, Subscription, map, of, shareReplay } from 'rxjs';
import { StaffHttp } from './staff-http';

/** The filter operators, sent as camelCase strings (FilterOperatorJsonConverter in C#). */
export type FilterOp =
  | 'eq'
  | 'neq'
  | 'in'
  | 'notIn'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'contains'
  | 'isTrue'
  | 'isFalse'
  | 'isNull'
  | 'notNull';

export interface FilterCondition {
  field: string;
  op: FilterOp;
  values: string[];
}

export interface SortSpec {
  field: string;
  dir: 'asc' | 'desc';
}

/** The body of every list endpoint (StaffQuery in C#). */
export interface StaffQuery {
  search?: string | null;
  preset?: string | null;
  savedFilterId?: number | null;
  filters: FilterCondition[];
  sort: SortSpec[];
  pageIndex: number;
  pageSize: number;
}

export function emptyQuery(init: Partial<StaffQuery> = {}): StaffQuery {
  return { filters: [], sort: [], pageIndex: 1, pageSize: 20, ...init };
}

export function queryJson(q: StaffQuery): Record<string, unknown> {
  return {
    ...(q.search && q.search.trim().length >= 2 ? { search: q.search.trim() } : {}),
    ...(q.preset ? { preset: q.preset } : {}),
    ...(q.savedFilterId ? { savedFilterId: q.savedFilterId } : {}),
    filters: q.filters,
    sort: q.sort,
    pageIndex: q.pageIndex,
    pageSize: q.pageSize
  };
}

/** Pagination<T> from the backend: itemsCount is the total after the filters (the number the screens show). */
export interface ApiPage<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  itemsCount: number;
  pagesCount: number;
  hasNextPage: boolean;
  data: T[];
}

export interface ListResult<T> {
  page: ApiPage<T>;
  summary?: any;
}

export function asPage<T>(d: any): ApiPage<T> {
  return {
    pageIndex: d?.pageIndex ?? 1,
    pageSize: d?.pageSize ?? 20,
    count: d?.count ?? 0,
    itemsCount: d?.itemsCount ?? d?.count ?? 0,
    pagesCount: d?.pagesCount ?? 0,
    hasNextPage: !!d?.hasNextPage,
    data: Array.isArray(d?.data) ? d.data : []
  };
}

// ---- filter schema (GET /api/staff/filters/{listKey}) ----

export interface FilterOption {
  value: string;
  labelAr: string;
  labelEn?: string | null;
}

export interface FilterField {
  key: string;
  labelAr: string;
  labelEn?: string | null;
  type: string;
  control: string;
  multi: boolean;
  facet: boolean;
  operators: string[];
  options: FilterOption[];
  optionsSource?: string | null;
  quickValues: string[];
}

export interface FilterSchema {
  listKey: string;
  searchPlaceholderAr?: string | null;
  fields: FilterField[];
  sort: { key: string; labelAr: string }[];
  presets: { key: string; labelAr: string }[];
}

export interface SavedFilter {
  id: number;
  name: string;
  query: StaffQuery;
  isMine: boolean;
}

export function optionLabel(o: { labelAr: string; labelEn?: string | null }, arabic: boolean): string {
  return arabic || !o.labelEn ? o.labelAr : o.labelEn;
}

/** StaffFiltersController: schema, options, facets, live count and saved filters. */
@Injectable({ providedIn: 'root' })
export class FiltersApi {
  private readonly http = inject(StaffHttp);
  private readonly schemas = new Map<string, Observable<FilterSchema>>();

  /** Fetched once per session per list (the schema does not change while the dashboard runs). */
  schema(listKey: string): Observable<FilterSchema> {
    let s = this.schemas.get(listKey);
    if (!s) {
      s = this.http.get<any>(`/api/staff/filters/${listKey}`).pipe(
        map((d) => ({
          listKey: d?.listKey ?? listKey,
          searchPlaceholderAr: d?.searchPlaceholderAr ?? null,
          fields: (d?.fields ?? []).map((f: any) => ({
            ...f,
            multi: !!f.multi,
            facet: !!f.facet,
            operators: f.operators ?? [],
            options: f.options ?? [],
            quickValues: f.quickValues ?? []
          })),
          sort: d?.sort ?? [],
          presets: d?.presets ?? []
        })),
        shareReplay(1)
      );
      this.schemas.set(listKey, s);
    }
    return s;
  }

  options(source: string, q?: string): Observable<FilterOption[]> {
    return this.http.get<FilterOption[]>(`/api/staff/filters/options/${source}`, { q: q || undefined, take: 30 }).pipe(map((d) => d ?? []));
  }

  facets(listKey: string, q: StaffQuery): Observable<Record<string, Record<string, number>>> {
    return this.http.post<any>(`/api/staff/filters/${listKey}/facets`, queryJson(q)).pipe(
      map((d) => {
        const out: Record<string, Record<string, number>> = {};
        for (const [k, list] of Object.entries(d?.facets ?? {})) {
          out[k] = {};
          for (const c of (list as any[]) ?? []) out[k][String(c.value)] = c.count;
        }
        return out;
      })
    );
  }

  count(listKey: string, q: StaffQuery): Observable<number> {
    return this.http.post<any>(`/api/staff/filters/${listKey}/count`, queryJson(q)).pipe(map((d) => d?.total ?? 0));
  }

  saved(listKey: string): Observable<SavedFilter[]> {
    return this.http.get<any[]>(`/api/staff/filters/${listKey}/saved`).pipe(
      map((d) => (d ?? []).map((s) => ({ id: s.id, name: s.name, isMine: s.isMine ?? true, query: emptyQuery(s.query ?? {}) })))
    );
  }

  save(listKey: string, name: string, q: StaffQuery): Observable<unknown> {
    return this.http.post(`/api/staff/filters/${listKey}/saved`, {
      name,
      query: queryJson({ ...q, pageIndex: 1 }),
      isDefault: false,
      isShared: false
    });
  }

  deleteSaved(id: number): Observable<unknown> {
    return this.http.delete(`/api/staff/filters/saved/${id}`);
  }
}

export type PageFetcher<T> = (q: StaffQuery) => Observable<ListResult<T>>;

/**
 * The state of one paged list: search, presets, filters, sort, refresh and "load more" (PagedListController in the
 * app). The last filters are kept in localStorage per list (filters.<key>) like the app keeps them on the device.
 */
export class PagedList<T> {
  query: StaffQuery;
  items: T[] = [];
  total = 0;
  hasNext = false;
  loading = true;
  loadingMore = false;
  error: unknown = null;
  summary: any = null;

  private sub?: Subscription;
  private debounce?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly fetch: PageFetcher<T>,
    initial: Partial<StaffQuery> = {},
    private readonly storageKey?: string
  ) {
    this.query = emptyQuery(initial);
    if (storageKey) {
      try {
        const raw = localStorage.getItem(`filters.${storageKey}`);
        if (raw) {
          const saved = JSON.parse(raw);
          this.query = { ...this.query, filters: saved.filters ?? [], sort: saved.sort ?? this.query.sort, preset: saved.preset ?? this.query.preset };
        }
      } catch {
        // A broken saved query starts clean
      }
    }
    this.refresh();
  }

  private persist(): void {
    if (!this.storageKey) return;
    try {
      localStorage.setItem(`filters.${this.storageKey}`, JSON.stringify({ filters: this.query.filters, sort: this.query.sort, preset: this.query.preset }));
    } catch {
      // Storage may be unavailable (private mode)
    }
  }

  /** Back to page 1. A newer request replaces an older one, so a slow old answer never wins. */
  refresh(): void {
    this.sub?.unsubscribe();
    this.loading = this.items.length === 0;
    this.error = null;
    const q = { ...this.query, pageIndex: 1 };
    this.sub = this.fetch(q).subscribe({
      next: (r) => {
        this.items = [...r.page.data];
        this.total = r.page.itemsCount;
        this.hasNext = r.page.hasNextPage;
        this.summary = r.summary ?? null;
        this.query = q;
        this.loading = false;
      },
      error: (e) => {
        this.error = e;
        this.loading = false;
      }
    });
  }

  loadMore(): void {
    if (!this.hasNext || this.loadingMore || this.loading) return;
    this.loadingMore = true;
    const next = { ...this.query, pageIndex: this.query.pageIndex + 1 };
    this.sub = this.fetch(next).subscribe({
      next: (r) => {
        this.items = [...this.items, ...r.page.data];
        this.hasNext = r.page.hasNextPage;
        this.query = next;
        this.loadingMore = false;
      },
      error: () => (this.loadingMore = false)
    });
  }

  setSearch(text: string): void {
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => {
      const t = text.trim();
      if (t && t.length < 2) return;
      this.query = { ...this.query, search: t || null };
      this.items = [];
      this.refresh();
    }, 400);
  }

  setPreset(key: string | null): void {
    this.query = { ...this.query, preset: key };
    this.items = [];
    this.persist();
    this.refresh();
  }

  applyFilters(filters: FilterCondition[]): void {
    this.query = { ...this.query, filters, savedFilterId: null };
    this.items = [];
    this.persist();
    this.refresh();
  }

  /** Replaces one field's condition (quick chips above a list), keeping the others. */
  setFilter(field: string, condition: FilterCondition | null): void {
    this.applyFilters([...this.query.filters.filter((f) => f.field !== field), ...(condition ? [condition] : [])]);
  }

  filterValue(field: string): string | null {
    return this.query.filters.find((f) => f.field === field)?.values?.[0] ?? null;
  }

  setSort(sort: SortSpec): void {
    this.query = { ...this.query, sort: [sort] };
    this.persist();
    this.refresh();
  }

  replaceWhere(test: (t: T) => boolean, item: T): void {
    this.items = this.items.map((i) => (test(i) ? item : i));
  }

  removeWhere(test: (t: T) => boolean): void {
    this.items = this.items.filter((i) => !test(i));
    this.total = Math.max(0, this.total - 1);
  }

  get activeFilters(): number {
    return new Set(this.query.filters.map((f) => f.field)).size;
  }

  get filtered(): boolean {
    return this.query.filters.length > 0 || !!(this.query.search ?? '').trim();
  }

  destroy(): void {
    clearTimeout(this.debounce);
    this.sub?.unsubscribe();
  }
}

export const emptyResult = <T>(): Observable<ListResult<T>> =>
  of({ page: { pageIndex: 1, pageSize: 20, count: 0, itemsCount: 0, pagesCount: 0, hasNextPage: false, data: [] } });
