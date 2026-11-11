import { Component, Injectable, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, firstValueFrom, map } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { LISTS } from '../ui/lists';
import { SearchPickerComponent, SwitchRowComponent } from '../ui/controls';
import { SheetComponent, StaffDialogs } from '../ui/dialogs';
import { StaffHttp, mediaUrl } from '../core/staff-http';
import { FilterSchema, FiltersApi, ListResult, PagedList, StaffQuery, asPage, queryJson } from '../core/query';
import { P, StaffSession } from '../core/session';
import { fmtNum } from '../core/format';
import { FORM_KIT } from '../forms/form-kit';
import { CatalogItem, CatalogItemsComponent } from '../forms/home-content-forms.component';
import { KpiTileComponent } from 'src/app/demo/pages/staff-analytics/staff-ui';

@Injectable({ providedIn: 'root' })
export class MessagingApi {
  private readonly http = inject(StaffHttp);

  /** { summary, page } (StaffEmailPageDto). */
  emails(q: StaffQuery): Observable<ListResult<any>> {
    return this.http.post<any>('/api/staff/emails', queryJson(q)).pipe(map((d) => ({ page: asPage<any>(d?.page), summary: d?.summary })));
  }

  email(id: number): Observable<any> {
    return this.http.get(`/api/staff/emails/${id}`);
  }

  resend(id: number): Observable<any> {
    return this.http.post(`/api/staff/emails/${id}/resend`);
  }

  /** The existing POST /api/Notification/GetAllNotifications answers the Pagination itself (not wrapped). */
  notifications(q: StaffQuery): Observable<ListResult<any>> {
    return this.http.raw<any>('POST', '/api/Notification/GetAllNotifications', { pageIndex: q.pageIndex, pageSize: 20 }).pipe(map((d) => ({ page: asPage<any>(d) })));
  }

  notification(id: number): Observable<any> {
    return this.http.raw<any>('GET', '/api/Notification/GetNotification', undefined, { Id: id }).pipe(map((j) => (j?.data && typeof j.data === 'object' ? j.data : j)));
  }

  deleteNotification(id: number): Observable<unknown> {
    return this.http.raw('DELETE', '/api/Notification/DeleteNotification/', undefined, { Id: id });
  }

  /**
   * POST /api/Notification/SendNotification (multipart NotificationRequest), answered unwrapped. ItemType / ItemId:
   * the trip, outing or Hajj package the customer app opens when the notification is tapped.
   */
  send(o: { title: string; body: string; image: File | null; segments: Record<string, boolean>; item?: NotifyItem | null }): Observable<unknown> {
    const form = new FormData();
    form.append('title', o.title);
    form.append('body', o.body);
    Object.entries(o.segments).forEach(([k, v]) => form.append(k, String(v)));
    if (o.image) form.append('Image', o.image, o.image.name);
    if (o.item) {
      form.append('ItemType', o.item.itemType);
      form.append('ItemId', String(o.item.itemId));
    }
    return this.http.raw('POST', '/api/Notification/SendNotification', form);
  }

  /** Coupons by code or description, for "opens a coupon". */
  searchCoupons(q: string): Observable<any[]> {
    return this.http
      .get<any>('/api/staff/coupons', { status: 'all', pageIndex: 1, pageSize: 20, ...(q ? { search: q } : {}) })
      .pipe(map((d) => asPage<any>(d).data ?? []));
  }

  /** The home's active Trips Star cards, for "opens a Trips Star card". */
  searchStars(q: string): Observable<any[]> {
    return this.http
      .raw<any>('GET', '/api/TripStar/GetAllTripStars/', undefined, { pageIndex: 1, pageSize: 200, isPagingEnabled: false, IsActive: true })
      .pipe(
        map((res) => {
          const rows: any[] = res?.data?.data ?? [];
          const term = q.trim().toLowerCase();
          return term ? rows.filter((s) => `${s.titleAr ?? ''} ${s.title ?? ''}`.toLowerCase().includes(term)) : rows;
        })
      );
  }

  /**
   * POST /api/Notification/Suggest: title and body ideas from the item picked and the day (the weekend, the month),
   * written by Claude when the server has an Anthropic key, else templates. Sends nothing.
   */
  suggest(o: { item?: NotifyItem | null; idea?: string }): Observable<{ title: string; body: string; source: string }[]> {
    return this.http.post<any[]>('/api/Notification/Suggest', {
      // ideas are written for the three listings only
      itemType: o.item && ['trip', 'picnic', 'religion'].includes(o.item.itemType) ? o.item.itemType : null,
      itemId: o.item && ['trip', 'picnic', 'religion'].includes(o.item.itemType) ? o.item.itemId : null,
      idea: o.idea?.trim() || null
    });
  }
}

/**
 * What a notification opens (NotificationItemLink.LinkTypes): "trip", "picnic" (outing), "religion" (Hajj / Umrah),
 * a "coupon", an "ad" (one of the home's Trips Star cards) or the "wallet" (no id).
 */
export interface NotifyItem {
  itemType: 'trip' | 'picnic' | 'religion' | 'coupon' | 'ad' | 'wallet';
  itemId: number;
}

/** The choices of "الإشعار يفتح على": none, the three listings (a catalog picker), a coupon, a Trips Star card, the wallet. */
export type NotifyTarget = 'none' | 'trip' | 'outing' | 'hajj' | 'coupon' | 'ad' | 'wallet';

const NOTIFY_ITEM_TYPE: Record<string, NotifyItem['itemType']> = { trip: 'trip', outing: 'picnic', hajj: 'religion' };

/** a-emails: the email log, failures first, with resend. */
@Component({
  selector: 'ts-emails',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...LISTS, KpiTileComponent],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'APP.emails' | translate" [subtitle]="'APP.emailsHint' | translate"></ts-appbar>
      <div class="ts-kpi-grid ts-kpi-grid--3" *ngIf="list.summary as s">
        <ts-kpi icon="ti ti-mail-check" tone="success" [label]="'APP.sentToday' | translate" [value]="num(s.sentToday)"></ts-kpi>
        <ts-kpi icon="ti ti-mail-x" tone="expense" [label]="'APP.failed' | translate" [value]="num(s.failed)"></ts-kpi>
      </div>
      <div class="ts-listbar">
        <ts-search [hint]="'APP.search' | translate" (changed)="list.setSearch($event)"></ts-search>
        <ts-segmented *ngIf="schema?.presets?.length" [items]="presets()" [selected]="list.query.preset ?? (hasAll() ? 'all' : '')" (changed)="list.setPreset($event || null)"></ts-segmented>
      </div>
      <ts-paged-list [list]="list" [groupDate]="groupDate" emptyIcon="ti ti-mail" [grid]="true">
        <ng-template let-e>
          <a class="ts-list-card" [routerLink]="['/a/more/emails', e.logId]">
            <ts-icon-tile
              [icon]="e.status !== 'sent' ? 'ti ti-mail-exclamation' : 'ti ti-mail-check'"
              [color]="e.status !== 'sent' ? 'var(--ts-danger-ink)' : 'var(--ts-ok-fg)'"
              [bg]="e.status !== 'sent' ? 'var(--ts-danger-soft)' : 'var(--ts-ok-bg)'"
              [size]="40"
            ></ts-icon-tile>
            <span class="ts-card-row__main">
              <span class="ts-card-title">{{ e.purposeName }}</span>
              <span class="ts-muted ts-ellipsis">{{ e.to || '' }} · {{ e.createdAt | ts: 'time' }}</span>
            </span>
            <ts-pill [tone]="e.status !== 'sent' ? 'danger' : 'ok'">{{ (e.status !== 'sent' ? 'APP.failed' : 'APP.sent') | translate }}</ts-pill>
          </a>
        </ng-template>
      </ts-paged-list>
    </div>
  `
})
export class EmailsComponent implements OnInit, OnDestroy {
  private readonly api = inject(MessagingApi);
  private readonly filters = inject(FiltersApi);
  private readonly text = inject(StaffText);
  list = new PagedList<any>((q) => this.api.emails(q));
  schema: FilterSchema | null = null;
  num = fmtNum;
  groupDate = (e: any) => e.createdAt;

  ngOnInit(): void {
    this.filters.schema('emails').subscribe({ next: (s) => (this.schema = s), error: () => {} });
  }

  hasAll(): boolean {
    return (this.schema?.presets ?? []).some((p) => p.key === 'all');
  }

  presets() {
    // The schema has its own "all" preset; add one only when it doesn't
    const presets = (this.schema?.presets ?? []).map((p) => ({ key: p.key, label: p.labelAr }));
    return presets.some((p) => p.key === 'all') ? presets : [{ key: '', label: this.text.tr('APP.all') }, ...presets];
  }

  ngOnDestroy(): void {
    this.list.destroy();
  }
}

/** a-email-detail: the email, its attempts and resend, and the stored HTML as the customer sees it. */
@Component({
  selector: 'ts-email-details',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, SheetComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.email' | translate"></ts-appbar>
      <ts-loading *ngIf="!e && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ng-container *ngIf="e">
        <ts-card [title]="e.purposeName" icon="ti ti-mail">
          <ts-info [label]="'APP.to' | translate" [value]="e.to" [numeric]="false"></ts-info>
          <ts-info *ngIf="e.customerName" [label]="'APP.customer' | translate" [value]="e.customerName" [numeric]="false"></ts-info>
          <ts-info [label]="'APP.date' | translate" [value]="e.createdAt | ts: 'datetime'"></ts-info>
          <ts-info [label]="'APP.status' | translate" [value]="e.status" [numeric]="false"></ts-info>
        </ts-card>
        <ts-card [title]="'APP.attempts' | translate" icon="ti ti-repeat">
          <ts-info *ngFor="let a of e.attempts ?? []" [label]="a.at | ts: 'datetime'">
            <ts-pill [tone]="a.isSend ? 'ok' : 'danger'">{{ (a.isSend ? 'APP.sent' : 'APP.failed') | translate }}</ts-pill>
          </ts-info>
        </ts-card>
        <ts-card *ngIf="e.html?.trim()" [title]="'APP.previewEmail' | translate" icon="ti ti-eye">
          <!-- The stored HTML in a sandboxed frame: its own CSS and images, no scripts, no navigation -->
          <iframe class="ts-email-frame" sandbox="" [attr.srcdoc]="e.html" title="email"></iframe>
        </ts-card>
        <button *ngIf="canResend" type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy" (click)="resend()">
          <i *ngIf="busy" class="pi pi-spin pi-spinner"></i><i *ngIf="!busy" class="ti ti-send"></i>{{ 'APP.resend' | translate }}
        </button>
      </ng-container>
    </div>
  `
})
export class EmailDetailsComponent implements OnInit {
  private readonly api = inject(MessagingApi);
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  id = 0;
  e: any = null;
  error: unknown = null;
  busy = false;

  get canResend(): boolean {
    return this.session.can(P.emailEdit);
  }

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load(): void {
    this.error = null;
    this.api.email(this.id).subscribe({ next: (e) => (this.e = e), error: (err) => (this.error = err) });
  }

  async resend(): Promise<void> {
    this.busy = true;
    try {
      const r = await firstValueFrom(this.api.resend(this.id));
      if (r?.isSend) this.text.showDone(this.text.tr('APP.emailResent'));
      else this.text.showError(r?.error || this.text.tr('APP.failed'));
      this.load();
    } catch (err) {
      this.text.showError(err);
    } finally {
      this.busy = false;
    }
  }
}

/** a-notify-log: notifications sent to customers (existing endpoint). */
@Component({
  selector: 'ts-notification-log',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ...KIT, ...LISTS],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'APP.sentNotifications' | translate">
        <a *ngIf="canSend" class="ts-fab ts-fab--float" routerLink="/a/more/notify"><i class="ti ti-send"></i>{{ 'APP.newNotification' | translate }}</a>
      </ts-appbar>
      <ts-paged-list [list]="list" emptyIcon="ti ti-bell" [grid]="true">
        <ng-template let-n>
          <!-- The log answers one row per send (sentDate, read / total) with no id; a row with an id opens its details -->
          <a class="ts-list-card" [routerLink]="n.id ? ['/a/more/notifications', n.id] : null" [class.is-static]="!n.id">
            <ts-icon-tile icon="ti ti-bell" color="var(--ts-teal)" bg="var(--ts-outing-bg)" [size]="40"></ts-icon-tile>
            <span class="ts-card-row__main">
              <span class="ts-card-title">{{ n.title }}</span>
              <span class="ts-muted ts-clamp2">{{ n.body }}</span>
              <span class="ts-muted ts-num" *ngIf="n.sentDate">{{ n.sentDate | ts: 'datetime' }}</span>
              <!-- Who it reached: signed-in customers and visitors' devices, and how many opened it -->
              <span class="ts-notif-reach" *ngIf="n.totalUsers != null">
                <ts-tag tone="info" icon="ti ti-users">{{ 'APP.notifReached' | translate: { n: (n.totalUsers | ts) } }}</ts-tag>
                <ts-tag *ngIf="n.signedInUsers != null" tone="neutral" icon="ti ti-user-check">{{ 'APP.notifSignedIn' | translate: { n: (n.signedInUsers | ts) } }}</ts-tag>
                <ts-tag *ngIf="n.visitors" tone="neutral" icon="ti ti-device-mobile">{{ 'APP.notifVisitors' | translate: { n: (n.visitors | ts) } }}</ts-tag>
                <ts-tag tone="ok" icon="ti ti-checks">{{ 'APP.notifRead' | translate: { n: (n.readCount ?? 0 | ts), p: readPct(n) } }}</ts-tag>
              </span>
            </span>
            <i *ngIf="n.isRead" class="ti ti-checks" style="color: var(--ts-teal)"></i>
          </a>
        </ng-template>
      </ts-paged-list>
    </div>
  `
})
export class NotificationLogComponent implements OnDestroy {
  /** Opened, in percent of who got it. */
  readPct(n: any): string {
    return n.totalUsers ? String(Math.round(((n.readCount ?? 0) * 100) / n.totalUsers)) : '0';
  }

  private readonly api = inject(MessagingApi);
  private readonly session = inject(StaffSession);
  list = new PagedList<any>((q) => this.api.notifications(q));

  get canSend(): boolean {
    return this.session.can(P.notificationCreate);
  }

  ngOnDestroy(): void {
    this.list.destroy();
  }
}

@Component({
  selector: 'ts-notification-details',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.notification' | translate">
        <button *ngIf="canDelete" type="button" class="ts-icon-btn" (click)="remove()" [title]="'APP.delete' | translate"><i class="ti ti-trash"></i></button>
      </ts-appbar>
      <ts-loading *ngIf="!n && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ts-card *ngIf="n">
        <img *ngIf="img()" class="ts-notif-img" [src]="img()" alt="" />
        <h2 class="ts-person__name" style="margin-top: 10px">{{ n.title }}</h2>
        <p style="margin: 6px 0 0">{{ n.body }}</p>
        <ts-info [label]="'APP.status' | translate" [value]="(n.isRead ? 'APP.read' : 'APP.notRead') | translate" [numeric]="false"></ts-info>
      </ts-card>
    </div>
  `
})
export class NotificationDetailsComponent implements OnInit {
  private readonly api = inject(MessagingApi);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  id = 0;
  n: any = null;
  error: unknown = null;

  get canDelete(): boolean {
    return this.session.can(P.notificationDelete);
  }

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load(): void {
    this.error = null;
    this.api.notification(this.id).subscribe({ next: (n) => (this.n = n), error: (e) => (this.error = e) });
  }

  img(): string | null {
    return mediaUrl(this.n?.imageUrl);
  }

  async remove(): Promise<void> {
    const ok = await this.dialogs.confirm({ title: this.text.tr('APP.delete'), message: this.text.tr('APP.deleteNotificationQ'), confirm: this.text.tr('APP.delete'), danger: true });
    if (!ok) return;
    this.api.deleteNotification(this.id).subscribe({ next: () => this.location.back(), error: (e) => this.text.showError(e) });
  }
}

const SEGMENTS: [string, string][] = [
  ['LoginUser', 'APP.segSignedIn'],
  ['Anonymous', 'APP.segGuests'],
  ['LoggedInZeroBookings', 'APP.segNoBookings'],
  ['HighestCompletedBookings', 'APP.segTopCompleted'],
  ['HighestCancelledBookings', 'APP.segTopCancelled']
];

/** a-notify: compose and send a push notification to customer segments. */
@Component({
  selector: 'ts-notify',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ...FORM_KIT, SwitchRowComponent, CatalogItemsComponent, SearchPickerComponent, SheetComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.sendNotification' | translate"></ts-appbar>
      <ts-card [title]="'APP.ntItem' | translate" [subtitle]="'APP.ntItemHint' | translate" icon="ti ti-link">
        <div class="ts-stack" data-test="nt-target">
          <button type="button" *ngFor="let t of targets" class="ts-list-card is-link" [class.is-selected]="target === t.key" (click)="setTarget(t.key)" style="text-align: start; width: 100%" [attr.data-test]="'nt-target-' + t.key">
            <span class="ts-card-row__main">
              <strong class="ts-card-title">{{ t.label | translate }}</strong>
              <span class="ts-muted ts-small" *ngIf="t.hint">{{ t.hint | translate }}</span>
            </span>
            <i class="ti" [class.ti-circle-check]="target === t.key" [class.ti-circle]="target !== t.key"></i>
          </button>
        </div>
        <ts-catalog-items *ngIf="target === 'trip' || target === 'outing' || target === 'hajj'" [items]="item ? [item] : []" (itemsChange)="pickItem($event)" [kinds]="[$any(target)]"></ts-catalog-items>
        <div *ngIf="target === 'coupon' || target === 'ad'" style="margin-top: 10px">
          <button type="button" class="btn btn-secondary ts-wide-btn" (click)="pickerOpen = true" data-test="nt-pick">
            <i class="ti" [class.ti-discount-2]="target === 'coupon'" [class.ti-stars]="target === 'ad'"></i>
            {{ picked ? picked.name : (target === 'coupon' ? 'APP.ntPickCoupon' : 'APP.ntPickStar') | translate }}
          </button>
        </div>
        <p class="ts-muted ts-small" *ngIf="target === 'wallet'" style="margin-top: 8px">{{ 'APP.ntWalletNote' | translate }}</p>
        <p class="ts-muted ts-small" *ngIf="target === 'none'" style="margin-top: 8px">{{ 'APP.ntNoneNote' | translate }}</p>
      </ts-card>
      <ts-sheet [open]="pickerOpen" (openChange)="pickerOpen = false" [title]="(target === 'coupon' ? 'APP.ntPickCoupon' : 'APP.ntPickStar') | translate" [footer]="false">
        <ts-search-picker *ngIf="pickerOpen" [search]="target === 'coupon' ? searchCoupons : searchStars" [title]="pickerTitle" [subtitle]="pickerSubtitle" (picked)="pickRow($event)"></ts-search-picker>
      </ts-sheet>
      <ts-card [title]="'APP.ntSuggest' | translate" [subtitle]="'APP.ntSuggestHint' | translate" icon="ti ti-sparkles">
        <ts-field [label]="'APP.ntIdea' | translate" [hint]="'APP.ntIdeaHint' | translate" [(value)]="idea"></ts-field>
        <button type="button" class="btn btn-secondary ts-wide-btn" [disabled]="suggesting" (click)="suggest()" style="margin-top: 8px">
          <i [class]="suggesting ? 'pi pi-spin pi-spinner' : 'ti ti-sparkles'"></i>{{ 'APP.ntSuggestBtn' | translate }}
        </button>
        <div class="ts-stack" style="margin-top: 10px" *ngIf="ideas.length">
          <button type="button" class="ts-list-card is-link" *ngFor="let s of ideas" (click)="useIdea(s)" style="text-align: start; width: 100%">
            <span class="ts-card-row__main">
              <strong class="ts-card-title">{{ s.title }}</strong>
              <span class="ts-muted">{{ s.body }}</span>
            </span>
            <ts-tag [tone]="s.source === 'ai' ? 'info' : 'neutral'" [icon]="s.source === 'ai' ? 'ti ti-sparkles' : 'ti ti-template'">
              {{ (s.source === 'ai' ? 'APP.ntByAi' : 'APP.ntTemplate') | translate }}
            </ts-tag>
          </button>
          <p class="ts-muted ts-small">{{ 'APP.ntUseHint' | translate }}</p>
        </div>
      </ts-card>
      <ts-card>
        <ts-field [label]="'APP.title' | translate" [required]="true" [(value)]="title"></ts-field>
        <ts-field [label]="'APP.body' | translate" [lines]="4" [required]="true" [(value)]="body"></ts-field>
        <div class="ts-field">
          <span>{{ 'APP.image' | translate }} <small class="ts-muted">({{ 'APP.optional' | translate }})</small></span>
          <ts-images-field [files]="image ? [image] : []" (filesChange)="image = $event[0] ?? null" [multiple]="false" shape="wide" [maxMb]="2"></ts-images-field>
        </div>
      </ts-card>
      <ts-card [title]="'APP.sendTo' | translate" icon="ti ti-users-group">
        <ts-switch-row *ngFor="let s of segments" [title]="s[1] | translate" [(value)]="on[s[0]]"></ts-switch-row>
      </ts-card>
      <!-- How it looks on the phone, drawn locally -->
      <div class="ts-notif-preview">
        <ts-icon-tile icon="ti ti-plane-departure" color="#fff" bg="var(--ts-amber, #f59f00)" [size]="40"></ts-icon-tile>
        <div class="ts-grow" style="min-width: 0">
          <strong>{{ title || ('APP.title' | translate) }}</strong>
          <p class="ts-muted ts-clamp2">{{ body || ('APP.body' | translate) }}</p>
        </div>
      </div>
      <div class="ts-sticky-foot">
        <button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy" (click)="send()">
          <i *ngIf="busy" class="pi pi-spin pi-spinner"></i><i *ngIf="!busy" class="ti ti-send"></i>{{ 'APP.send' | translate }}
        </button>
      </div>
    </div>
  `
})
export class NotifyComponent {
  private readonly api = inject(MessagingApi);
  private readonly location = inject(Location);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  readonly segments = SEGMENTS;
  title = '';
  body = '';
  image: File | null = null;
  on: Record<string, boolean> = { LoginUser: true, Anonymous: false, LoggedInZeroBookings: false, HighestCompletedBookings: false, HighestCancelledBookings: false };
  busy = false;
  /** The one product the notification opens (the picker allows several: the last one picked wins). */
  item: CatalogItem | null = null;
  idea = '';
  ideas: { title: string; body: string; source: string }[] = [];
  suggesting = false;

  readonly targets: { key: NotifyTarget; label: string; hint?: string }[] = [
    { key: 'none', label: 'APP.ntTargetNone', hint: 'APP.ntTargetNoneHint' },
    { key: 'trip', label: 'APP.ntTargetTrip' },
    { key: 'outing', label: 'APP.ntTargetOuting' },
    { key: 'hajj', label: 'APP.ntTargetHajj' },
    { key: 'coupon', label: 'APP.ntTargetCoupon', hint: 'APP.ntTargetCouponHint' },
    { key: 'ad', label: 'APP.ntTargetAd', hint: 'APP.ntTargetAdHint' },
    { key: 'wallet', label: 'APP.ntTargetWallet', hint: 'APP.ntTargetWalletHint' }
  ];
  target: NotifyTarget = 'none';
  pickerOpen = false;
  /** The coupon or Trips Star card picked. */
  picked: { id: number; name: string } | null = null;
  searchCoupons = (q: string) => this.api.searchCoupons(q);
  searchStars = (q: string) => this.api.searchStars(q);
  pickerTitle = (r: any) => (this.target === 'coupon' ? r.code : r.titleAr || r.title || `#${r.id}`);
  pickerSubtitle = (r: any) => (this.target === 'coupon' ? r.description ?? '' : '');

  setTarget(t: NotifyTarget): void {
    if (this.target === t) return;
    this.target = t;
    this.item = null;
    this.picked = null;
    this.ideas = [];
  }

  pickRow(r: any): void {
    this.picked = { id: r.id, name: this.pickerTitle(r) };
    this.pickerOpen = false;
  }

  /** What the app opens: null for a general notification. */
  private get link(): NotifyItem | null {
    switch (this.target) {
      case 'wallet':
        return { itemType: 'wallet', itemId: 0 };
      case 'coupon':
      case 'ad':
        return this.picked ? { itemType: this.target, itemId: this.picked.id } : null;
      case 'none':
        return null;
      default: {
        const type = this.item ? NOTIFY_ITEM_TYPE[this.item.kind] : undefined;
        return this.item && type ? { itemType: type, itemId: this.item.id } : null;
      }
    }
  }

  /** The name the confirmation shows. */
  private get linkName(): string {
    return this.target === 'wallet' ? this.text.tr('APP.ntTargetWallet') : this.item?.name ?? this.picked?.name ?? '';
  }

  pickItem(items: CatalogItem[]): void {
    const next = items.find((i) => !this.item || i.kind !== this.item.kind || i.id !== this.item.id) ?? items[items.length - 1] ?? null;
    this.item = next;
    this.ideas = [];
  }

  suggest(): void {
    this.suggesting = true;
    this.api.suggest({ item: this.link, idea: this.idea }).subscribe({
      next: (list) => {
        this.ideas = list ?? [];
        this.suggesting = false;
        if (!this.ideas.length) this.text.showError(this.text.tr('APP.ntNoIdeas'));
      },
      error: (e) => {
        this.suggesting = false;
        this.text.showError(e);
      }
    });
  }

  useIdea(s: { title: string; body: string }): void {
    this.title = s.title;
    this.body = s.body;
  }

  async send(): Promise<void> {
    if (!this.title.trim() || !this.body.trim()) return this.text.showError(this.text.tr('APP.fillRequired'));
    // a target was chosen but nothing picked: it would go out as a general notification
    if (!['none', 'wallet'].includes(this.target) && !this.link) return this.text.showError(this.text.tr('APP.ntPickFirst'));
    const ok = await this.dialogs.confirm({
      title: this.text.tr('APP.sendNotification'),
      message: this.link ? this.text.tr('APP.ntSendWithItemQ', { n: this.linkName }) : this.text.tr('APP.sendNotificationQ'),
      confirm: this.text.tr('APP.send')
    });
    if (!ok) return;
    this.busy = true;
    try {
      await firstValueFrom(this.api.send({ title: this.title.trim(), body: this.body.trim(), image: this.image, segments: this.on, item: this.link }));
      this.text.showDone(this.text.tr('APP.notificationSent'));
      this.location.back();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }
}
