import { Component, Injectable, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, catchError, firstValueFrom, forkJoin, map, of } from 'rxjs';
import { NgxScannerQrcodeComponent } from 'ngx-scanner-qrcode';
import { KIT, StaffText } from '../ui/kit';
import { LISTS } from '../ui/lists';
import { StaffDialogs } from '../ui/dialogs';
import { StaffHttp } from '../core/staff-http';
import { ListResult, PagedList, StaffQuery, asPage, emptyQuery, queryJson } from '../core/query';
import { P, StaffSession } from '../core/session';
import { dayGroup, fmtNum } from '../core/format';
import { BookingRow, BookingsApi } from '../bookings/bookings-api';
import { ProductsApi } from '../products/products-api';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { NavigationItem } from 'src/app/theme/layout/admin/navigation/navigation';
import { StaffAnalyticsService, presetRange } from 'src/app/demo/pages/staff-analytics/staff-analytics.service';
import { VendorCommsApi, VendorMessageRow } from '../vendor-comms/vendor-comms.component';

interface Entry {
  icon: string;
  label: string;
  color: string;
  bg: string;
  route: string;
  query?: Record<string, string>;
  perm?: string | null;
  count?: number | null;
}

interface Group {
  title: string;
  entries: Entry[];
}

/** The profile card, the groups of tiles, the old dashboard screens, then language and sign out (a-more / v-more). */
@Component({
  selector: 'ts-more-body',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT],
  template: `
    <a class="ts-list-card ts-profile-card" [routerLink]="profileLink">
      <ts-avatar [name]="session.username || '?'" [size]="52" bg="var(--ts-navy)" fg="#fff"></ts-avatar>
      <span class="ts-card-row__main">
        <span class="ts-card-title">{{ session.username }}</span>
        <span class="ts-muted">{{ session.roles.join(' · ') }}</span>
      </span>
      <i class="ti ti-chevron-left ts-chevron"></i>
    </a>
    <ng-container *ngFor="let g of groups">
      <ts-card *ngIf="g.entries.length" [title]="g.title | translate">
        <div class="ts-more-grid">
          <a *ngFor="let e of g.entries" class="ts-more-tile" [routerLink]="e.route" [queryParams]="e.query ?? null">
            <span class="ts-more-tile__icon" [style.background]="e.bg" [style.color]="e.color">
              <i [class]="e.icon"></i>
              <b *ngIf="e.count" class="ts-more-tile__badge">{{ e.count }}</b>
            </span>
            <span>{{ e.label | translate }}</span>
          </a>
        </div>
      </ts-card>
    </ng-container>
    <!-- The dashboard's screens from before this layout: all still here, one tap away -->
    <ts-card *ngIf="legacy.length" [title]="'WEB.oldScreens' | translate" icon="ti ti-archive">
      <div class="ts-legacy">
        <ng-container *ngFor="let item of legacy">
          <a *ngIf="item.url" class="ts-chip" [routerLink]="item.url"><i [class]="item.icon"></i>{{ item.title | translate }}</a>
          <div *ngIf="item.children?.length" class="ts-legacy__group">
            <small>{{ item.title | translate }}</small>
            <div class="ts-wrap">
              <ng-container *ngFor="let c of flat(item.children)">
                <a class="ts-chip" [routerLink]="c.url">{{ c.title | translate }}</a>
              </ng-container>
            </div>
          </div>
        </ng-container>
      </div>
    </ts-card>
    <ts-card [flush]="true">
      <button type="button" class="ts-menu-row" (click)="toggleLanguage()">
        <i class="ti ti-language"></i>
        <span class="ts-grow">{{ 'APP.language' | translate }}</span>
        <small class="ts-muted">{{ text.arabic ? 'العربية' : 'English' }}</small>
      </button>
      <button type="button" class="ts-menu-row ts-danger-ink" (click)="signOut()">
        <i class="ti ti-logout"></i>
        <span class="ts-grow">{{ 'APP.signOut' | translate }}</span>
      </button>
    </ts-card>
  `
})
export class MoreBodyComponent implements OnInit {
  readonly session = inject(StaffSession);
  readonly text = inject(StaffText);
  private readonly nav = inject(NavigationItem);
  private readonly config = inject(ConfigureService);
  private readonly translate = inject(TranslateService);
  private readonly dialogs = inject(StaffDialogs);
  private readonly document = inject(DOCUMENT);
  groups: Group[] = [];
  profileLink = '/a/more/profile';
  legacy: any[] = [];

  ngOnInit(): void {
    this.legacy = this.nav.legacyScreens();
  }

  /** The menu entries a collapse holds, its sub-collapses opened up. */
  flat(items: any[]): any[] {
    return items.flatMap((i) => (i.children?.length ? this.flat(i.children) : i.url ? [i] : []));
  }

  /** Items without the permission are not shown. */
  show(groups: Group[], profileLink: string): void {
    this.profileLink = profileLink;
    this.groups = groups.map((g) => ({ ...g, entries: g.entries.filter((e) => !e.perm || this.session.can(e.perm)) }));
  }

  toggleLanguage(): void {
    const lang = this.text.arabic ? 'en' : 'ar';
    localStorage.setItem('Language', lang);
    this.translate.use(lang);
    this.document.documentElement.lang = lang;
    this.document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  async signOut(): Promise<void> {
    const t = (k: string) => this.text.tr(k);
    if (await this.dialogs.confirm({ title: t('APP.signOut'), message: t('APP.signOutQ'), confirm: t('APP.signOut'), danger: true })) this.config.Logout();
  }
}

/** a-more: every admin area the user may open, grouped as in the design. */
@Component({
  selector: 'ts-admin-more',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, MoreBodyComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.tabMore' | translate" [back]="false"></ts-appbar>
      <ts-more-body #body></ts-more-body>
    </div>
  `
})
export class AdminMoreComponent implements OnInit {
  private readonly analytics = inject(StaffAnalyticsService);
  @ViewChild('body', { static: true }) body!: MoreBodyComponent;

  ngOnInit(): void {
    this.build(null);
    this.analytics
      .overview(presetRange('today'))
      .pipe(catchError(() => of(null)))
      .subscribe((o) => this.build(o?.today ?? null));
  }

  private build(t: any): void {
    const main = { color: 'var(--ts-navy)', bg: 'var(--ts-selected)' };
    const trip = { color: 'var(--ts-trip)', bg: 'var(--ts-trip-bg)' };
    const teal = { color: 'var(--ts-teal)', bg: 'var(--ts-outing-bg)' };
    const mkt = { color: 'var(--ts-marketing, #c2187a)', bg: 'var(--ts-marketing-bg, #fde7f3)' };
    const hajj = { color: 'var(--ts-hajj)', bg: 'var(--ts-hajj-bg)' };
    const nav = { color: 'var(--ts-ink-nav)', bg: 'var(--ts-hover)' };
    this.body.show(
      [
        {
          title: 'APP.groupPeople',
          entries: [
            { icon: 'ti ti-users', label: 'APP.customers', ...main, route: '/a/more/customers', perm: P.customersView },
            { icon: 'ti ti-building-store', label: 'APP.vendors', ...trip, route: '/a/more/vendors', perm: P.companyView },
            { icon: 'ti ti-brand-whatsapp', label: 'WEB.vendorComms', color: '#1E8E5A', bg: 'var(--ts-ok-bg)', route: '/a/more/vendor-comms', perm: P.companyView }
          ]
        },
        {
          title: 'APP.groupMoney',
          entries: [
            { icon: 'ti ti-wallet', label: 'APP.settlements', ...main, route: '/a/more/settlements', perm: P.companyWalletView, count: t?.settlementsDue },
            { icon: 'ti ti-arrows-exchange', label: 'APP.transactions', ...teal, route: '/a/more/transactions', perm: P.bookingView },
            { icon: 'ti ti-discount', label: 'APP.coupons', ...mkt, route: '/a/more/coupons', perm: P.couponsView },
            { icon: 'ti ti-cash-banknote', label: 'APP.walletMoves', ...teal, route: '/a/more/wallet-transactions', perm: P.walletView },
            { icon: 'ti ti-currency-dollar', label: 'APP.paymentAccounts', ...main, route: '/a/more/payment-accounts', perm: P.financialView }
          ]
        },
        {
          title: 'APP.groupSettings',
          entries: [
            { icon: 'ti ti-layout-grid', label: 'APP.lookups', ...main, route: '/a/more/lookups' },
            { icon: 'ti ti-file-description', label: 'APP.policies', ...nav, route: '/a/more/policies', perm: P.policyView },
            { icon: 'ti ti-heart-handshake', label: 'APP.contracts', ...trip, route: '/a/more/contracts', perm: P.vendorContractView },
            { icon: 'ti ti-lock', label: 'APP.users', ...nav, route: '/a/more/users', perm: P.usersView },
            { icon: 'ti ti-receipt', label: 'APP.financeSettings', ...hajj, route: '/a/more/finance-settings', perm: P.financialView },
            { icon: 'ti ti-percentage', label: 'APP.commissionPolicies', ...hajj, route: '/a/more/commission', perm: P.financialView },
            { icon: 'ti ti-gift', label: 'APP.autoCoupons', ...mkt, route: '/a/more/coupons/auto', perm: P.couponsView },
            { icon: 'ti ti-adjustments', label: 'APP.customTripSettings', ...mkt, route: '/a/more/custom-requests-settings', perm: P.customTripSettingView },
            { icon: 'ti ti-sparkles', label: 'Trip Star', ...trip, route: '/a/more/tripstars' },
            { icon: 'ti ti-layout-rows', label: 'APP.sidebars', ...trip, route: '/a/more/sidebars' }
          ]
        },
        {
          title: 'APP.groupMarketing',
          entries: [
            { icon: 'ti ti-heart-handshake', label: 'APP.customRequests', ...mkt, route: '/a/more/custom-requests', count: t?.customRequestsNoOffers },
            { icon: 'ti ti-star', label: 'APP.reviews', ...hajj, route: '/a/more/reviews', perm: P.customersView, count: t?.reviewsToReply },
            { icon: 'ti ti-bell', label: 'APP.notifications', ...teal, route: '/a/more/notifications', perm: P.notificationView },
            { icon: 'ti ti-mail', label: 'APP.emails', ...nav, route: '/a/more/emails', perm: P.emailView },
            { icon: 'ti ti-search', label: 'APP.search', ...main, route: '/a/more/search', perm: P.searchView },
            { icon: 'ti ti-world', label: 'WEB.siteVisits', ...teal, route: '/a/more/site-visits', perm: P.bookingView },
            { icon: 'ti ti-clock-hour-4', label: 'APP.expiring', ...trip, route: '/a/products/expiring', query: { type: '1', window: 'expired' }, count: t?.productsExpiredVisible }
          ]
        }
      ],
      '/a/more/profile'
    );
  }
}

/** v-more. */
@Component({
  selector: 'ts-vendor-more',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, MoreBodyComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.tabMore' | translate" [back]="false"></ts-appbar>
      <ts-more-body #body></ts-more-body>
    </div>
  `
})
export class VendorMoreComponent implements OnInit {
  private readonly session = inject(StaffSession);
  @ViewChild('body', { static: true }) body!: MoreBodyComponent;

  ngOnInit(): void {
    const entries: Entry[] = [
      ...(this.session.acceptsCustomTrips
        ? [{ icon: 'ti ti-heart-handshake', label: 'APP.customRequests', color: 'var(--ts-marketing, #c2187a)', bg: 'var(--ts-marketing-bg, #fde7f3)', route: '/v/more/requests' }]
        : []),
      { icon: 'ti ti-wallet', label: 'APP.mySettlements', color: 'var(--ts-navy)', bg: 'var(--ts-selected)', route: '/v/more/settlements' },
      { icon: 'ti ti-chart-bar', label: 'APP.myReports', color: 'var(--ts-teal)', bg: 'var(--ts-outing-bg)', route: '/v/more/analytics' },
      { icon: 'ti ti-star', label: 'APP.myProductReviews', color: 'var(--ts-hajj)', bg: 'var(--ts-hajj-bg)', route: '/v/more/reviews' },
      { icon: 'ti ti-bell', label: 'APP.notifications', color: 'var(--ts-teal)', bg: 'var(--ts-outing-bg)', route: '/v/notifications' },
      { icon: 'ti ti-history', label: 'APP.scanHistory', color: 'var(--ts-ink-nav)', bg: 'var(--ts-hover)', route: '/v/scanner/history', perm: P.scannerView }
    ];
    this.body.show([{ title: 'APP.myBusiness', entries }], '/v/more/profile');
  }
}

/** a-profile: the signed-in account as the sign-in answered it. */
@Component({
  selector: 'ts-profile',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.myAccount' | translate"></ts-appbar>
      <ts-card>
        <div style="display: flex; justify-content: center; margin-bottom: 12px">
          <ts-avatar [name]="s.username || '?'" [size]="72" bg="var(--ts-navy)" fg="#fff"></ts-avatar>
        </div>
        <ts-info [label]="'APP.username' | translate" [value]="s.username" [numeric]="false"></ts-info>
        <ts-info [label]="'APP.email' | translate" [value]="s.email" [numeric]="false"></ts-info>
        <ts-info [label]="'APP.phone' | translate" [value]="s.phone"></ts-info>
        <ts-info [label]="'APP.role' | translate" [value]="s.roles.join('، ')" [numeric]="false"></ts-info>
        <ts-info [label]="'APP.accountType' | translate" [value]="(s.isVendor ? 'APP.vendor' : 'APP.admin') | translate" [numeric]="false"></ts-info>
        <ts-info [label]="'APP.permissionsCount' | translate" [value]="s.permissions.length"></ts-info>
      </ts-card>
    </div>
  `
})
export class ProfileComponent {
  readonly s = inject(StaffSession);
}

// ---------------------------------------------------------------- scanner

/** The outing ticket check of the existing OutingBookingController, and the staff scan history list. */
@Injectable({ providedIn: 'root' })
export class ScannerApi {
  private readonly http = inject(StaffHttp);

  /** GET ScannerOutingBookingById/?id= → OutingBookingDto, or 404 with the reason. */
  check(id: number): Observable<any> {
    return this.http.get('/api/OutingBooking/ScannerOutingBookingById/', { id });
  }

  /** GET UseTicketSerialNumber?id= (a GET in the backend). */
  use(id: number): Observable<any> {
    return this.http.get('/api/OutingBooking/UseTicketSerialNumber', { id });
  }

  history(q: StaffQuery): Observable<ListResult<any>> {
    return this.http.post<any>('/api/staff/lists/scan-history', queryJson(q)).pipe(map((d) => ({ page: asPage<any>(d) })));
  }
}

/** The reservation id inside a ticket QR: a plain number as is, otherwise the last number in the text. */
export function parseTicketQr(raw: string): number | null {
  const t = raw.trim();
  if (/^\d+$/.test(t)) return +t;
  const m = t.match(/\d+/g);
  return m ? +m[m.length - 1] : null;
}

/** v-scanner: the camera (or a typed ticket number), then the ticket: valid → check in, refused → the reason. */
@Component({
  selector: 'ts-scanner',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, NgxScannerQrcodeComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.tabScanner' | translate" [navy]="true" [back]="false">
        <a class="ts-icon-btn" routerLink="/v/scanner/history" [title]="'APP.scanHistory' | translate"><i class="ti ti-history"></i></a>
      </ts-appbar>

      <ng-container *ngIf="!ticket && !refused">
        <div class="ts-scanner">
          <ngx-scanner-qrcode #scanner [config]="{ fps: 30, vibrate: 200, isBeep: false }" (event)="onScan($event)" (error)="cameraError = true"></ngx-scanner-qrcode>
          <div class="ts-scanner__frame"></div>
          <div class="ts-scanner__busy" *ngIf="busy"><i class="pi pi-spin pi-spinner"></i></div>
          <button *ngIf="!cameraOn" type="button" class="btn btn-primary ts-scanner__start" (click)="start()"><i class="ti ti-camera"></i>{{ 'APP.tabScanner' | translate }}</button>
        </div>
        <p class="ts-muted" *ngIf="cameraError" style="text-align: center">{{ 'APP.cameraUnavailable' | translate }}</p>
        <div class="ts-scanner__manual">
          <input class="form-control" inputmode="numeric" [placeholder]="'APP.ticketNumber' | translate" [value]="manual" (input)="manual = $any($event.target).value" (keyup.enter)="handle(manual)" />
          <button type="button" class="btn btn-primary" [disabled]="busy" (click)="handle(manual)">{{ 'APP.check' | translate }}</button>
        </div>
      </ng-container>

      <ng-container *ngIf="ticket">
        <div class="ts-note" [class.ts-note--danger]="ticket.isUsed" [class.ts-note--ok]="!ticket.isUsed">
          <i class="ti" [class.ti-circle-x-filled]="ticket.isUsed" [class.ti-circle-check-filled]="!ticket.isUsed" style="font-size: 36px"></i>
          <div>
            <strong>{{ (ticket.isUsed ? 'APP.ticketUsed' : 'APP.ticketValid') | translate }}</strong>
            <p>{{ (ticket.isUsed ? 'APP.ticketUsedHint' : 'APP.ticketValidHint') | translate }}</p>
          </div>
        </div>
        <ts-card>
          <ts-info [label]="'APP.ticketNumber' | translate" [value]="'#' + ticket.id"></ts-info>
          <ts-info [label]="'APP.quantity' | translate" [value]="num(ticket.quantity ?? ticket.numberOfSeats)"></ts-info>
          <ts-info [label]="'APP.date' | translate" [value]="ticket.outingDate | ts: 'day'"></ts-info>
          <ts-info *ngIf="ticket.startTime" [label]="'APP.time' | translate" [value]="ticket.startTime + (ticket.endTime ? ' – ' + ticket.endTime : '')"></ts-info>
        </ts-card>
        <div class="ts-two">
          <button type="button" class="btn btn-secondary" (click)="reset()"><i class="ti ti-qrcode"></i>{{ 'APP.scanAnother' | translate }}</button>
          <button *ngIf="!ticket.isUsed && canUse" type="button" class="btn btn-primary" [disabled]="busy" (click)="use()">
            <i *ngIf="busy" class="pi pi-spin pi-spinner"></i><i *ngIf="!busy" class="ti ti-login"></i>{{ 'APP.checkIn' | translate }}
          </button>
        </div>
      </ng-container>

      <ng-container *ngIf="refused">
        <div class="ts-note ts-note--danger ts-refused">
          <i class="ti ti-ban" style="font-size: 56px"></i>
          <strong>{{ 'APP.ticketRefused' | translate }}</strong>
          <p>{{ refused }}</p>
        </div>
        <button type="button" class="btn btn-primary ts-wide-btn" (click)="reset()"><i class="ti ti-qrcode"></i>{{ 'APP.scanAnother' | translate }}</button>
      </ng-container>
    </div>
  `
})
export class ScannerComponent implements OnDestroy {
  private readonly api = inject(ScannerApi);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  @ViewChild('scanner') scanner?: NgxScannerQrcodeComponent;
  num = fmtNum;
  manual = '';
  busy = false;
  cameraOn = false;
  cameraError = false;
  ticket: any = null;
  ticketId = 0;
  refused: string | null = null;
  private last = '';
  private lastAt = 0;

  get canUse(): boolean {
    return this.session.can(P.scannerEdit);
  }

  start(): void {
    this.cameraError = false;
    try {
      this.scanner?.start();
      this.cameraOn = true;
    } catch {
      this.cameraError = true;
    }
  }

  private stop(): void {
    try {
      if (this.cameraOn) this.scanner?.stop();
    } catch {
      /* already stopped */
    }
    this.cameraOn = false;
  }

  onScan(e: any): void {
    const v = e?.[0]?.value;
    if (v) this.handle(String(v));
  }

  async handle(raw: string): Promise<void> {
    // The same code within 3 seconds is the camera seeing it twice
    if (this.busy || !raw.trim() || (raw === this.last && Date.now() - this.lastAt < 3000)) return;
    this.last = raw;
    this.lastAt = Date.now();
    const id = parseTicketQr(raw);
    if (id == null) return void (this.refused = this.text.tr('APP.qrNotATicket'));
    this.busy = true;
    try {
      this.ticket = await firstValueFrom(this.api.check(id));
      this.ticketId = id;
      this.stop();
    } catch (e) {
      this.refused = this.text.error(e);
      this.stop();
    } finally {
      this.busy = false;
    }
  }

  async use(): Promise<void> {
    this.busy = true;
    try {
      await firstValueFrom(this.api.use(this.ticketId));
      this.text.showDone(this.text.tr('APP.checkedInDone'));
      this.reset();
    } catch (e) {
      this.ticket = null;
      this.refused = this.text.error(e);
    } finally {
      this.busy = false;
    }
  }

  reset(): void {
    this.ticket = null;
    this.refused = null;
    this.manual = '';
    this.last = '';
  }

  ngOnDestroy(): void {
    this.stop();
  }
}

/** v-scan-history. */
@Component({
  selector: 'ts-scan-history',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ...LISTS],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'APP.scanHistory' | translate"></ts-appbar>
      <div class="ts-listbar">
        <ts-search [hint]="'APP.search' | translate" (changed)="list.setSearch($event)"></ts-search>
      </div>
      <ts-paged-list [list]="list" [groupDate]="groupDate" emptyIcon="ti ti-qrcode" [grid]="true">
        <ng-template let-s>
          <div class="ts-list-card">
            <ts-icon-tile icon="ti ti-check" color="var(--ts-ok-fg)" bg="var(--ts-ok-bg)" [size]="40"></ts-icon-tile>
            <span class="ts-card-row__main">
              <span class="ts-card-title">{{ s.outingName }}</span>
              <span class="ts-muted">{{ s.customerName || '' }} · {{ s.ticketName || '' }} × {{ s.count | ts }}</span>
            </span>
            <small class="ts-muted ts-num">{{ s.usedAt | ts: 'time' }}</small>
          </div>
        </ng-template>
      </ts-paged-list>
    </div>
  `
})
export class ScanHistoryComponent implements OnDestroy {
  private readonly api = inject(ScannerApi);
  list = new PagedList<any>((q) => this.api.history(q));
  groupDate = (s: any) => s.usedAt;

  ngOnDestroy(): void {
    this.list.destroy();
  }
}

// ---------------------------------------------------------------- vendor notifications

interface VendorEvent {
  kind: 'booking' | 'approved' | 'returned' | 'confirmed';
  at: Date;
  title: string;
  detail?: string | null;
  route?: string | null;
  query?: Record<string, string>;
  /** Server notifications carry their own read time. */
  readAt?: string | null;
}

const SEEN_KEY = 'vendor_notifications_seen';

/**
 * v-notifications. There is no notifications endpoint for vendors, so this is a feed built from what the backend
 * already scopes to the vendor: their latest bookings and the review decisions on their products. "Read" is the
 * time the vendor last pressed ✓, kept in this browser.
 */
@Component({
  selector: 'ts-vendor-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.notifications' | translate" [subtitle]="unread() ? ('APP.newN' | translate: { n: num(unread()) }) : null">
        <button type="button" class="ts-icon-btn" (click)="markAllRead()" [title]="'APP.markAllRead' | translate"><i class="ti ti-checks"></i></button>
      </ts-appbar>
      <ts-loading *ngIf="!events && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ts-empty *ngIf="events && !events.length" icon="ti ti-bell" [message]="'APP.nothingHereYet' | translate"></ts-empty>
      <ng-container *ngFor="let g of groups()">
        <h3 class="ts-group-label">{{ g.label }}</h3>
        <ts-card [flush]="true">
          <a *ngFor="let e of g.rows" class="ts-event" [routerLink]="e.route" [queryParams]="e.query ?? null" [class.is-static]="!e.route">
            <ts-icon-tile [icon]="look(e).icon" [color]="look(e).color" bg="var(--ts-hover)" [size]="40"></ts-icon-tile>
            <span class="ts-grow">
              <strong>{{ look(e).headline | translate: { name: e.title } }}</strong>
              <small class="ts-muted" *ngIf="e.detail">{{ e.detail }}</small>
              <small class="ts-muted ts-num">{{ e.at | ts: 'time' }}</small>
            </span>
            <i *ngIf="isUnread(e)" class="ts-dot-new"></i>
          </a>
        </ts-card>
      </ng-container>
    </div>
  `
})
export class VendorNotificationsComponent implements OnInit {
  private readonly bookings = inject(BookingsApi);
  private readonly products = inject(ProductsApi);
  private readonly comms = inject(VendorCommsApi);
  private readonly text = inject(StaffText);
  num = fmtNum;
  events: VendorEvent[] | null = null;
  error: unknown = null;
  seen: number | null = null;

  ngOnInit(): void {
    try {
      const v = localStorage.getItem(SEEN_KEY);
      this.seen = v ? +v : null;
    } catch {
      this.seen = null;
    }
    this.load();
  }

  load(): void {
    this.error = null;
    forkJoin({
      b: this.bookings.list(emptyQuery({ pageSize: 20 })).pipe(map((r) => r.page.data)),
      approved: this.products.approvals(2).pipe(map((p) => p.data), catchError(() => of([]))),
      returned: this.products.approvals(3).pipe(map((p) => p.data), catchError(() => of([]))),
      // The server's "new confirmed booking" notifications (sent with the vendor's WhatsApp message)
      confirmed: this.comms.myNotifications().pipe(map((p) => p.data), catchError(() => of([] as VendorMessageRow[])))
    }).subscribe({
      next: ({ b, approved, returned, confirmed }) => (this.events = this.build(b, approved, returned, confirmed)),
      error: (e) => (this.error = e)
    });
  }

  private build(bookings: BookingRow[], approved: any[], returned: any[], confirmed: VendorMessageRow[] = []): VendorEvent[] {
    const announced = new Set(confirmed.map((c) => c.bookingId));
    const out: VendorEvent[] = confirmed.map((c) => ({
      kind: 'confirmed' as const,
      at: new Date(c.createDate),
      title: c.bookingReference ? `#${c.bookingReference}` : '',
      detail: [c.bookingReference ? `#${c.bookingReference}` : '', ...c.message.split('\n').filter((l) => /👤|📍|🗓️|👥|👶/.test(l))]
        .filter(Boolean)
        .join(' · '),
      route: c.bookingId ? `/v/bookings/${c.bookingId}` : null,
      readAt: c.readAt
    }));
    out.push(...bookings
      .filter((b) => !announced.has(b.id))
      .filter((b) => b.createDate)
      .map((b) => ({
        kind: 'booking' as const,
        at: new Date(b.createDate),
        title: b.items[0]?.name ?? b.reference,
        detail: `${b.customer?.name ?? ''} · ${b.items.reduce((n, i) => n + (i.adults ?? 0) + (i.childs ?? 0), 0)}`,
        route: `/v/bookings/${b.id}`
      })));
    for (const [kind, rows] of [
      ['approved', approved],
      ['returned', returned]
    ] as const) {
      for (const r of rows) {
        // StaffItemType 1 trip, 2 outing; a Hajj package has no edit form
        const route = r.itemType === 1 ? '/form/trip' : r.itemType === 2 ? '/form/outing' : null;
        out.push({
          kind,
          at: new Date(r.reviewedAt ?? r.submittedAt ?? 0),
          title: r.name ?? `#${r.itemId}`,
          detail: r.note ?? null,
          route,
          query: route ? { id: String(r.itemId) } : undefined
        });
      }
    }
    return out.sort((a, b) => b.at.getTime() - a.at.getTime());
  }

  isUnread(e: VendorEvent): boolean {
    if (e.readAt) return false;
    return this.seen == null || e.at.getTime() > this.seen;
  }

  unread(): number {
    return (this.events ?? []).filter((e) => this.isUnread(e)).length;
  }

  markAllRead(): void {
    this.comms.markRead().subscribe({ error: () => {} });
    this.seen = Date.now();
    try {
      localStorage.setItem(SEEN_KEY, String(this.seen));
    } catch {
      /* private window */
    }
  }

  groups(): { label: string; rows: VendorEvent[] }[] {
    const out: { label: string; rows: VendorEvent[] }[] = [];
    for (const e of this.events ?? []) {
      const g = dayGroup(e.at);
      const label =
        g === 'today' ? this.text.tr('APP.today') : g === 'yesterday' ? this.text.tr('APP.yesterday') : e.at.toLocaleDateString(this.text.arabic ? 'ar-EG-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      const last = out[out.length - 1];
      if (last?.label === label) last.rows.push(e);
      else out.push({ label, rows: [e] });
    }
    return out;
  }

  look(e: VendorEvent): { icon: string; color: string; headline: string } {
    if (e.kind === 'confirmed') return { icon: 'ti ti-circle-check', color: 'var(--ts-ok-fg)', headline: 'WEB.newConfirmedBooking' };
    return e.kind === 'booking'
      ? { icon: 'ti ti-calendar-event', color: 'var(--ts-amber, #f59f00)', headline: 'APP.eventNewBooking' }
      : e.kind === 'approved'
        ? { icon: 'ti ti-check', color: 'var(--ts-ok-fg)', headline: 'APP.eventApproved' }
        : { icon: 'ti ti-pencil', color: 'var(--ts-danger-ink)', headline: 'APP.eventReturned' };
  }
}
