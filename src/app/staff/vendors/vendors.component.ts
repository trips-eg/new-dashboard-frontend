import { Component, Injectable, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, catchError, firstValueFrom, forkJoin, map, of } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { FilterDrawerComponent, LISTS } from '../ui/lists';
import { SwitchRowComponent } from '../ui/controls';
import { StaffDialogs } from '../ui/dialogs';
import { StaffHttp } from '../core/staff-http';
import { ListResult, PagedList, StaffQuery, asPage, queryJson } from '../core/query';
import { P, StaffSession } from '../core/session';
import { fmtCompact, fmtNum, parseAmount } from '../core/format';
import { FORM_KIT, toForm } from '../forms/form-kit';
import { AccountRef, AccountSheetComponent, PasswordSheetComponent, splitName } from '../settings/account-sheets';
import { KpiTileComponent } from 'src/app/demo/pages/staff-analytics/staff-ui';
import { StaffAnalyticsService, presetRange } from 'src/app/demo/pages/staff-analytics/staff-analytics.service';

@Injectable({ providedIn: 'root' })
export class VendorsApi {
  private readonly http = inject(StaffHttp);

  list(q: StaffQuery): Observable<ListResult<any>> {
    return this.http.post<any>('/api/staff/lists/vendors', queryJson(q)).pipe(map((d) => ({ page: asPage<any>(d) })));
  }

  company(id: number): Observable<any> {
    return this.http.get('/api/Company/GetCompanyById/', { id });
  }

  remove(id: number): Observable<unknown> {
    return this.http.raw('DELETE', '/api/Company/DeleteCompany/', undefined, { id });
  }

  /** GET /api/Companies/BlockUnBlockCompany/?id= toggles the block. */
  toggleBlock(id: number): Observable<unknown> {
    return this.http.get('/api/Companies/BlockUnBlockCompany/', { id });
  }

  users(companyId: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/staff/vendors/${companyId}/users`).pipe(map((d) => d ?? []));
  }

  setActive(userId: number, active: boolean): Observable<any> {
    return this.http.put(`/api/staff/users/${userId}/active`, { isActive: active });
  }

  /** Roles of type Vendor (RoleType 2) for the new account. */
  vendorRoles(): Observable<any[]> {
    return this.http.raw<any>('GET', '/api/Users/GetAllRoles/').pipe(
      map((d) => (Array.isArray(d) ? d : (d?.data ?? [])).filter((r: any) => r.roleType === 2)),
      catchError(() => of([]))
    );
  }

  /** PUT /api/Company/UpdateCompany/ (multipart): every field of the request is copied onto the company, so SalesId is sent back as loaded. */
  update(company: Record<string, unknown>): Observable<unknown> {
    return this.http.form('PUT', '/api/Company/UpdateCompany/', toForm(company));
  }

  /** POST /api/staff/vendors (multipart): the company and its first login account in one request. */
  create(company: Record<string, unknown>, account: Record<string, unknown>): Observable<any> {
    const body: Record<string, unknown> = { ...company };
    Object.entries(account).forEach(([k, v]) => (body[`Account.${k}`] = v));
    return this.http.form('POST', '/api/staff/vendors', toForm(body));
  }
}

/** The saved papers of a company (CompanyDocumentDto: { id, url }), as image paths for [existing]. */
export function savedPapers(docs: unknown): string[] {
  return Array.isArray(docs) ? docs.map((d) => (d && typeof d === 'object' ? (d as { url?: unknown }).url : null)).filter((u): u is string => typeof u === 'string' && !!u.trim()) : [];
}

function statusOf(v: any): { label: string; tone: 'danger' | 'cancelled' | 'ok' } {
  return v.status === 'blocked'
    ? { label: 'APP.blocked', tone: 'danger' }
    : v.status === 'inactive'
      ? { label: 'APP.inactive', tone: 'cancelled' }
      : { label: 'APP.active', tone: 'ok' };
}

/** a-vendors. */
@Component({
  selector: 'ts-vendors',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...LISTS],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'APP.vendors' | translate" [subtitle]="'APP.vendorsCount' | translate: { n: num(list.total) }">
        <button type="button" class="ts-icon-btn" (click)="drawer.show()" [attr.aria-label]="'APP.vendorFilters' | translate">
          <i class="ti ti-adjustments-horizontal"></i>
          <span class="ts-icon-btn__badge" *ngIf="list.activeFilters">{{ list.activeFilters }}</span>
        </button>
        <a *ngIf="canCreate" class="ts-fab ts-fab--float" routerLink="/a/more/vendors/new"><i class="ti ti-plus"></i>{{ 'APP.newVendor' | translate }}</a>
      </ts-appbar>
      <div class="ts-listbar">
        <ts-search [hint]="'APP.search' | translate" (changed)="list.setSearch($event)"></ts-search>
      </div>
      <ts-paged-list [list]="list" emptyIcon="ti ti-building-store" [grid]="true">
        <ng-template let-v>
          <a class="ts-list-card" [routerLink]="['/a/more/vendors', v.id]">
            <ts-avatar [name]="v.name" bg="var(--ts-selected)" fg="var(--ts-main-ink, var(--ts-navy))"></ts-avatar>
            <span class="ts-card-row__main">
              <span class="ts-card-title">{{ v.name }}</span>
              <span class="ts-muted">{{ 'APP.productsAndUsers' | translate: { a: num(v.productsCount ?? 0), b: num(v.usersCount ?? 0) } }}</span>
            </span>
            <ts-pill [tone]="status(v).tone">{{ status(v).label | translate }}</ts-pill>
          </a>
        </ng-template>
      </ts-paged-list>
    </div>
    <ts-filter-drawer #drawer listKey="vendors" [title]="'APP.vendorFilters' | translate" [list]="$any(list)"></ts-filter-drawer>
  `
})
export class VendorsComponent implements OnDestroy {
  private readonly api = inject(VendorsApi);
  private readonly session = inject(StaffSession);
  @ViewChild('drawer') drawer!: FilterDrawerComponent;
  list = new PagedList<any>((q) => this.api.list(q), {}, 'vendors');
  num = fmtNum;
  status = statusOf;

  get canCreate(): boolean {
    return this.session.can(P.companyCreate) && this.session.can(P.usersCreate);
  }

  ngOnDestroy(): void {
    this.list.destroy();
  }
}

/** a-vendor: the company, its numbers against the average, and its accounts. */
@Component({
  selector: 'ts-vendor',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, KpiTileComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="c?.name || ('APP.vendor' | translate)">
        <a *ngIf="canEdit && c" class="ts-icon-btn" [routerLink]="['/a/more/vendors', id, 'edit']" [title]="'APP.edit' | translate"><i class="ti ti-pencil"></i></a>
      </ts-appbar>
      <ts-loading *ngIf="loading"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ng-container *ngIf="c && !loading">
        <ts-card>
          <div class="ts-person">
            <ts-avatar [name]="c.name" [size]="56" bg="var(--ts-selected)" fg="var(--ts-main-ink, var(--ts-navy))"></ts-avatar>
            <h2 class="ts-person__name ts-grow">{{ c.name }}</h2>
            <ts-pill [tone]="c.isBlocked ? 'danger' : 'ok'">{{ (c.isBlocked ? 'APP.blocked' : 'APP.active') | translate }}</ts-pill>
          </div>
          <div style="margin-top: 8px">
            <ts-info *ngIf="c.email" [label]="'APP.email' | translate" [value]="c.email" [numeric]="false"></ts-info>
            <ts-info *ngIf="c.phone" [label]="'APP.phone' | translate" [value]="c.phone"></ts-info>
            <ts-info [label]="'APP.commission' | translate" [value]="modules()" [numeric]="false"></ts-info>
            <ts-info [label]="'APP.customTrips' | translate" [value]="(c.isAcceptingCustomTrip ? 'APP.yes' : 'APP.no') | translate" [numeric]="false"></ts-info>
          </div>
        </ts-card>
        <ng-container *ngIf="perf?.kpis as k">
          <div class="ts-kpi-grid ts-kpi-grid--3">
            <ts-kpi icon="ti ti-ticket" [label]="'APP.bookings' | translate" [value]="num(k.bookings)" [delta]="k.bookingsChangePct ?? null"></ts-kpi>
            <ts-kpi icon="ti ti-cash" tone="revenue" [label]="'APP.sales' | translate" [value]="compact(k.sales)" [delta]="k.salesChangePct ?? null"></ts-kpi>
            <ts-kpi icon="ti ti-package" [label]="'APP.activeProducts' | translate" [value]="num(k.activeProducts)" link="/a/services"></ts-kpi>
            <ts-kpi
              icon="ti ti-star"
              [label]="'APP.rating' | translate"
              [value]="k.rating != null ? k.rating.toFixed(1) : '—'"
              [footnote]="'APP.ofRatings' | translate: { n: num(k.ratingsCount ?? 0) }"
            ></ts-kpi>
          </div>
          <ts-card [title]="'APP.vsAverage' | translate" icon="ti ti-scale">
            <ts-info *ngFor="let v of perf.vsAverage" [label]="v.label">
              <span class="ts-num">{{ v.value == null ? '—' : num(v.value) }}</span>
              <span class="ts-muted ts-num"> / {{ v.average == null ? '—' : num(v.average) }}</span>
              <i
                *ngIf="v.better != null"
                class="ti"
                [class.ti-arrow-up]="v.better"
                [class.ti-arrow-down]="!v.better"
                [style.color]="v.better ? 'var(--ts-ok-fg)' : 'var(--ts-danger-ink)'"
              ></i>
            </ts-info>
          </ts-card>
        </ng-container>
        <a class="btn btn-secondary ts-wide-btn" [routerLink]="['/a/more/vendors', id, 'users']"><i class="ti ti-users"></i>{{ 'APP.vendorTeam' | translate }}</a>
        <button *ngIf="canEdit" type="button" class="btn ts-wide-btn" [class.btn-outline-danger]="!c.isBlocked" [class.btn-secondary]="c.isBlocked" (click)="toggleBlock()" style="margin-top: 10px">
          <i class="ti ti-ban"></i>{{ (c.isBlocked ? 'APP.unblock' : 'APP.block') | translate }}
        </button>
        <button *ngIf="canDelete" type="button" class="btn btn-outline-danger ts-wide-btn" (click)="remove()" style="margin-top: 10px">
          <i class="ti ti-trash"></i>{{ 'APP.deleteVendor' | translate }}
        </button>
      </ng-container>
    </div>
  `
})
export class VendorComponent implements OnInit {
  private readonly api = inject(VendorsApi);
  private readonly router = inject(Router);
  private readonly analytics = inject(StaffAnalyticsService);
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  num = fmtNum;
  compact = fmtCompact;

  id = 0;
  c: any = null;
  perf: any = null;
  loading = false;
  error: unknown = null;

  get canEdit(): boolean {
    return this.session.can(P.companyEdit);
  }

  get canDelete(): boolean {
    return this.session.can(P.companyDelete);
  }

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  /** DELETE /api/Company/DeleteCompany/?id= marks the company deleted; its products and users are left as they are. */
  async remove(): Promise<void> {
    const ok = await this.dialogs.confirm({
      title: this.text.tr('APP.deleteVendor'),
      message: this.text.tr('APP.deleteVendorQ'),
      confirm: this.text.tr('APP.deleteVendor'),
      danger: true
    });
    if (!ok) return;
    this.api.remove(this.id).subscribe({
      next: () => {
        this.text.showDone(this.text.tr('APP.saved'));
        this.router.navigate(['/a/more/vendors'], { replaceUrl: true });
      },
      error: (e) => this.text.showError(e)
    });
  }

  load(): void {
    this.loading = true;
    this.error = null;
    forkJoin({
      c: this.api.company(this.id),
      perf: this.analytics.vendorPerformance(this.id, presetRange('last28')).pipe(catchError(() => of(null)))
    }).subscribe({
      next: (r) => {
        this.c = r.c;
        this.perf = r.perf;
        this.loading = false;
      },
      error: (e) => {
        this.error = e;
        this.loading = false;
      }
    });
  }

  modules(): string {
    const c = this.c;
    const parts = [
      c.isTravelCommission ? `${this.text.tr('APP.trips')} ${fmtNum(c.travelCommissionRate)}%` : null,
      c.isOutCommission ? `${this.text.tr('APP.outings')} ${fmtNum(c.outCommissionRate)}%` : null,
      c.isHajjCommission ? `${this.text.tr('APP.hajjUmrah')} ${fmtNum(c.hajjCommissionRate)}%` : null,
      c.isHotelCommission ? `${this.text.tr('APP.hotels')} ${fmtNum(c.hotelCommissionRate)}%` : null
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : '—';
  }

  async toggleBlock(): Promise<void> {
    const blocked = !!this.c.isBlocked;
    const ok = await this.dialogs.confirm({
      title: this.text.tr(blocked ? 'APP.unblock' : 'APP.block'),
      message: this.text.tr('APP.blockVendorQ'),
      confirm: this.text.tr('APP.yes'),
      danger: !blocked
    });
    if (!ok) return;
    this.api.toggleBlock(this.id).subscribe({ next: () => this.load(), error: (e) => this.text.showError(e) });
  }
}

const MODULE_KEYS = ['Travel', 'Out', 'Hajj', 'Hotel'] as const;
const MODULE_LABEL: Record<(typeof MODULE_KEYS)[number], string> = { Travel: 'APP.trips', Out: 'APP.outings', Hajj: 'APP.hajjUmrah', Hotel: 'APP.hotels' };

/** a-vendor-form: a new vendor with its first login account, or (with an id) the company's details and commissions. */
@Component({
  selector: 'ts-vendor-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ...KIT, ...FORM_KIT, SwitchRowComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar
        [title]="(id ? 'APP.editVendor' : 'APP.newVendor') | translate"
        [subtitle]="id ? f.name : ('APP.withLoginAccount' | translate)"
      ></ts-appbar>
      <ts-loading *ngIf="loading"></ts-loading>
      <ng-container *ngIf="!loading">
        <ts-tag *ngIf="error" tone="danger" style="display: block; margin-bottom: 12px">{{ error }}</ts-tag>
        <ts-form-section [title]="'APP.company' | translate" icon="ti ti-building">
          <ts-field [label]="'APP.name' | translate" [required]="true" [(value)]="f.name"></ts-field>
          <ts-field [label]="'APP.email' | translate" type="email" [(value)]="f.email"></ts-field>
          <ts-field [label]="'APP.phone' | translate" type="tel" [(value)]="f.phone"></ts-field>
          <ts-field [label]="'APP.address' | translate" [(value)]="f.address"></ts-field>
          <ts-field [label]="'APP.description' | translate" [lines]="3" [(value)]="f.description"></ts-field>
        </ts-form-section>
        <ts-form-section [title]="'APP.modulesAndCommission' | translate" icon="ti ti-percentage" kind="money">
          <ng-container *ngFor="let m of moduleKeys">
            <ts-switch-row [title]="moduleLabel[m] | translate" [(value)]="on[m]"></ts-switch-row>
            <ts-field *ngIf="on[m]" [label]="'APP.commissionRate' | translate" [number]="true" suffix="%" [(value)]="rates[m]"></ts-field>
          </ng-container>
          <ts-switch-row [title]="'APP.customTrips' | translate" [(value)]="customTrips"></ts-switch-row>
        </ts-form-section>
        <ts-form-section [title]="'APP.vendorPapers' | translate" [subtitle]="id ? ('APP.papersAddHint' | translate) : null" icon="ti ti-file-certificate" kind="media">
          <span class="ts-label">{{ 'APP.vendorLogo' | translate }}</span>
          <ts-images-field [(files)]="logo" [existing]="existingLogo" [multiple]="false"></ts-images-field>
          <span class="ts-label">{{ 'APP.taxCardLicence' | translate }}</span>
          <ts-images-field [(files)]="licence" [existing]="existingLicence" [cover]="false"></ts-images-field>
          <span class="ts-label">{{ 'APP.commercialRegister' | translate }}</span>
          <ts-images-field [(files)]="commercial" [existing]="existingCommercial" [cover]="false"></ts-images-field>
        </ts-form-section>
        <ts-form-section *ngIf="!id" [title]="'APP.loginAccount' | translate" icon="ti ti-user-key">
          <div class="ts-two">
            <ts-field [label]="'APP.firstName' | translate" [required]="true" [(value)]="a.first"></ts-field>
            <ts-field [label]="'APP.lastName' | translate" [(value)]="a.last"></ts-field>
          </div>
          <ts-field [label]="'APP.email' | translate" type="email" [required]="true" [(value)]="a.email"></ts-field>
          <ts-field [label]="'APP.username' | translate" [required]="true" [(value)]="a.user"></ts-field>
          <ts-field [label]="'APP.password' | translate" type="password" [required]="true" [(value)]="a.pass"></ts-field>
          <ts-field [label]="'APP.phone' | translate" type="tel" [(value)]="a.phone"></ts-field>
          <label class="ts-field">
            <span>{{ 'APP.role' | translate }}<b class="req"> *</b></span>
            <select class="form-select" [(ngModel)]="role">
              <option [ngValue]="null">{{ 'APP.choose' | translate }}</option>
              <option *ngFor="let r of roles" [ngValue]="r.name">{{ r.name }}</option>
            </select>
          </label>
        </ts-form-section>
        <div class="ts-sticky-foot">
          <button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy" (click)="save()">
            <i *ngIf="busy" class="pi pi-spin pi-spinner"></i>{{ (id ? 'APP.saveChanges' : 'APP.createVendor') | translate }}
          </button>
        </div>
      </ng-container>
    </div>
  `
})
export class VendorFormComponent implements OnInit {
  private readonly api = inject(VendorsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly text = inject(StaffText);
  readonly moduleKeys = MODULE_KEYS;
  readonly moduleLabel = MODULE_LABEL;

  id: number | null = null;
  loading = false;
  busy = false;
  error: string | null = null;
  f = { name: '', email: '', phone: '', address: '', description: '' };
  a = { first: '', last: '', email: '', user: '', pass: '', phone: '' };
  on: Record<string, boolean> = { Travel: false, Out: false, Hajj: false, Hotel: false };
  rates: Record<string, string> = { Travel: '', Out: '', Hajj: '', Hotel: '' };
  customTrips = true;
  role: string | null = null;
  roles: any[] = [];
  private salesId: number | null = null;
  /** CompanyCreateDto's ImageLogo, LicenceDocuments (tax card, licence) and CommercialDocuments, as the old form sent them. */
  logo: File[] = [];
  existingLogo: string[] = [];
  /** The papers saved when the vendor was added (GetCompanyById → licenceDocuments / commercialDocuments). */
  existingLicence: string[] = [];
  existingCommercial: string[] = [];
  licence: File[] = [];
  commercial: File[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.id = id ? +id : null;
    if (this.id) this.load();
    else this.api.vendorRoles().subscribe((r) => (this.roles = r));
  }

  async load(): Promise<void> {
    this.loading = true;
    try {
      const c = await firstValueFrom(this.api.company(this.id!));
      this.f = { name: c.name ?? '', email: c.email ?? '', phone: c.phone ?? '', address: c.address ?? '', description: c.description ?? '' };
      for (const m of MODULE_KEYS) {
        const key = m[0].toLowerCase() + m.slice(1);
        this.on[m] = !!c[`is${m}Commission`];
        this.rates[m] = c[`${key}CommissionRate`] == null ? '' : fmtNum(c[`${key}CommissionRate`]);
      }
      this.customTrips = c.isAcceptingCustomTrip ?? true;
      this.existingLogo = c.logoUrl ? [c.logoUrl] : [];
      this.existingLicence = savedPapers(c.licenceDocuments);
      this.existingCommercial = savedPapers(c.commercialDocuments);
      this.salesId = c.salesId ?? null;
    } catch (e) {
      this.error = this.text.error(e);
    } finally {
      this.loading = false;
    }
  }

  private commissions(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const m of MODULE_KEYS) {
      out[`Is${m}Commission`] = this.on[m];
      out[`${m}CommissionRate`] = parseAmount(this.rates[m]) ?? 0;
    }
    return out;
  }

  async save(): Promise<void> {
    const v = (s: string) => s.trim();
    if (!v(this.f.name)) return void (this.error = this.text.tr('APP.fillRequired'));
    if (!this.id && (!v(this.a.first) || !v(this.a.user) || !this.a.pass || !v(this.a.email) || !this.role)) {
      return void (this.error = this.text.tr('APP.fillRequired'));
    }
    this.busy = true;
    this.error = null;
    const company = {
      Name: v(this.f.name),
      Email: v(this.f.email),
      Phone: v(this.f.phone),
      Address: v(this.f.address),
      Description: v(this.f.description),
      IsAcceptingCustomTrip: this.customTrips,
      ...this.commissions(),
      ImageLogo: this.logo[0],
      LicenceDocuments: this.licence,
      CommercialDocuments: this.commercial
    };
    try {
      if (this.id) {
        await firstValueFrom(this.api.update({ Id: this.id, ...company, SalesId: this.salesId }));
        this.text.showDone(this.text.tr('APP.saved'));
        this.location.back();
      } else {
        const created = await firstValueFrom(
          this.api.create(
            { ...company, IsActive: true },
            {
              FirstName: v(this.a.first),
              LastName: v(this.a.last),
              Email: v(this.a.email),
              Username: v(this.a.user),
              Password: this.a.pass,
              PhoneNumber: v(this.a.phone),
              Role: this.role
            }
          )
        );
        this.text.showDone(this.text.tr('APP.vendorCreated'));
        this.router.navigate(['/a/more/vendors', created?.companyId], { replaceUrl: true });
      }
    } catch (e) {
      this.error = this.text.error(e);
    } finally {
      this.busy = false;
    }
  }
}

/** a-vendor-user: the vendor's accounts; turning one off also signs it out everywhere. */
@Component({
  selector: 'ts-vendor-users',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, SwitchRowComponent, AccountSheetComponent, PasswordSheetComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.vendorTeam' | translate"></ts-appbar>
      <ts-loading *ngIf="!users && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ts-empty *ngIf="users && !users.length" icon="ti ti-users" [message]="'APP.nothingHereYet' | translate"></ts-empty>
      <ts-card *ngFor="let u of users">
        <div class="ts-person">
          <ts-avatar [name]="u.name"></ts-avatar>
          <div class="ts-grow">
            <p class="ts-card-title">{{ u.name }}</p>
            <p class="ts-muted">{{ describe(u) }}</p>
            <p class="ts-muted">{{ u.lastLoginAt ? ('APP.lastSignIn' | translate: { n: (u.lastLoginAt | ts: 'date') }) : ('APP.neverSignedIn' | translate) }}</p>
          </div>
          <label class="form-check form-switch ts-switch">
            <input class="form-check-input" type="checkbox" [checked]="u.isActive" [disabled]="!canEdit" (change)="setActive(u, $any($event.target).checked)" />
          </label>
        </div>
        <div class="ts-wrap" *ngIf="canEdit" style="margin-top: 10px">
          <button type="button" class="btn btn-secondary btn-sm" (click)="editAccount(u)"><i class="ti ti-edit"></i> {{ 'APP.editAccount' | translate }}</button>
          <button type="button" class="btn btn-secondary btn-sm" (click)="password(u)"><i class="ti ti-key"></i> {{ 'APP.changePassword' | translate }}</button>
        </div>
        <p class="ts-muted ts-num" *ngIf="u.username || u.phone" style="margin: 8px 0 0; font-size: 12.5px">
          {{ u.username }}<ng-container *ngIf="u.phone"> · <span dir="ltr">{{ u.phone }}</span></ng-container>
        </p>
      </ts-card>
    </div>
    <ts-account-sheet [open]="!!account" [account]="account" (openChange)="account = null" (saved)="load()"></ts-account-sheet>
    <ts-password-sheet [open]="!!pwFor" [userId]="pwFor?.userId ?? null" [name]="pwFor?.name ?? ''" (openChange)="pwFor = null"></ts-password-sheet>
  `
})
export class VendorUsersComponent implements OnInit {
  private readonly api = inject(VendorsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  companyId = 0;
  users: any[] | null = null;
  error: unknown = null;
  account: AccountRef | null = null;
  pwFor: { userId: number; name: string } | null = null;

  get canEdit(): boolean {
    return this.session.can(P.usersEdit);
  }

  editAccount(u: any): void {
    this.account = { userId: u.userId, ...splitName(u.name), username: u.username ?? '', email: u.email, phone: u.phone };
  }

  password(u: any): void {
    this.pwFor = { userId: u.userId, name: u.name };
  }

  ngOnInit(): void {
    this.companyId = +this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load(): void {
    this.error = null;
    this.users = null;
    this.api.users(this.companyId).subscribe({ next: (u) => (this.users = u), error: (e) => (this.error = e) });
  }

  describe(u: any): string {
    return [...(u.roles ?? []), u.email ?? ''].filter((s: string) => !!s).join(' · ');
  }

  setActive(u: any, v: boolean): void {
    this.api.setActive(u.userId, v).subscribe({
      next: (r) => {
        this.text.showDone(v ? this.text.tr('APP.accountOn') : this.text.tr('APP.accountOff', { n: fmtNum(r?.revokedSessions ?? 0) }));
        this.load();
      },
      error: (e) => {
        this.text.showError(e);
        this.load();
      }
    });
  }
}
