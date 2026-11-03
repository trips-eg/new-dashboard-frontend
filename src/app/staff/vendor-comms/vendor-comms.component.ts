import { Component, Injectable, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, Subject, debounceTime, firstValueFrom, map } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { ChipBarComponent } from '../ui/lists';
import { SwitchRowComponent } from '../ui/controls';
import { StaffHttp } from '../core/staff-http';
import { ApiPage, asPage } from '../core/query';
import { P, StaffSession } from '../core/session';
import { Tone } from '../core/enums';
import { fmtNum } from '../core/format';
import { FORM_KIT, Picked } from '../forms/form-kit';

export interface VendorGroupRow {
  companyId: number;
  vendorName: string;
  vendorPhone?: string | null;
  status: number;
  statusName: string;
  groupId?: string | null;
  inviteLink?: string | null;
  manualGroupLink?: string | null;
  participantsCount: number;
  isEnabled: boolean;
  connectedAt?: string | null;
  lastTestAt?: string | null;
  lastError?: string | null;
  failedMessages: number;
  /** WhatsApp messages waiting for an admin to send from the vendor's group by hand. */
  pendingMessages?: number;
  /** Without the Cloud API every group is linked and messaged by hand. */
  cloudConfigured?: boolean;
}

export interface VendorMessageRow {
  id: number;
  companyId: number;
  vendorName: string;
  bookingId?: number | null;
  bookingReference?: string | null;
  channel: number;
  channelName: string;
  status: number;
  statusName: string;
  message: string;
  attempts: number;
  createDate: string;
  sentAt?: string | null;
  lastError?: string | null;
  readAt?: string | null;
  groupLink?: string | null;
}

/** StaffVendorMessagingController: groups, the send log, resend and the manual fallback. */
@Injectable({ providedIn: 'root' })
export class VendorCommsApi {
  private readonly http = inject(StaffHttp);

  vendors(q?: string): Observable<VendorGroupRow[]> {
    return this.http.get<VendorGroupRow[]>('/api/staff/vendor-messaging/vendors', { q }).pipe(map((d) => d ?? []));
  }

  update(companyId: number, body: { manualGroupLink: string | null; isEnabled: boolean }): Observable<VendorGroupRow> {
    return this.http.put(`/api/staff/vendor-messaging/vendors/${companyId}`, body);
  }

  createGroup(companyId: number): Observable<VendorGroupRow> {
    return this.http.post(`/api/staff/vendor-messaging/vendors/${companyId}/group`);
  }

  refresh(companyId: number): Observable<VendorGroupRow> {
    return this.http.post(`/api/staff/vendor-messaging/vendors/${companyId}/refresh`);
  }

  test(companyId: number): Observable<VendorMessageRow> {
    return this.http.post(`/api/staff/vendor-messaging/vendors/${companyId}/test`);
  }

  log(q: Record<string, string | number | null | undefined>): Observable<ApiPage<VendorMessageRow>> {
    return this.http.get<any>('/api/staff/vendor-messaging/log', q).pipe(map((d) => asPage<VendorMessageRow>(d)));
  }

  resend(id: number): Observable<VendorMessageRow> {
    return this.http.post(`/api/staff/vendor-messaging/log/${id}/resend`);
  }

  sentByHand(id: number): Observable<VendorMessageRow> {
    return this.http.post(`/api/staff/vendor-messaging/log/${id}/sent-by-hand`);
  }

  myNotifications(page = 1): Observable<ApiPage<VendorMessageRow>> {
    return this.http.get<any>('/api/staff/vendor-messaging/my-notifications', { pageIndex: page, pageSize: 30 }).pipe(map((d) => asPage<VendorMessageRow>(d)));
  }

  markRead(id?: number): Observable<number> {
    return this.http.post('/api/staff/vendor-messaging/my-notifications/read', {}, { id });
  }
}

/** VendorWhatsAppStatus: 0 not set up, 1 creating, 2 waiting for the vendor, 3 connected, 4 failed. */
export function groupTone(status: number): Tone {
  return status === 3 ? 'ok' : status === 2 || status === 1 ? 'pending' : status === 4 ? 'danger' : 'neutral';
}

/** VendorMessageStatus: 0 waiting, 1 sent, 2 failed, 3 skipped. */
export function messageTone(status: number): Tone {
  return status === 1 ? 'ok' : status === 2 ? 'danger' : status === 3 ? 'cancelled' : 'pending';
}

/**
 * a-vendor-comms: each vendor's WhatsApp group (created by Trips' number through the Cloud API, the vendor joins with
 * its invite link) and the log of booking messages, with resend and the manual fallback: open WhatsApp with the message
 * copied, then record it as sent by hand.
 */
@Component({
  selector: 'ts-vendor-comms',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, ...KIT, ...FORM_KIT, ChipBarComponent, SwitchRowComponent],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'WEB.vendorComms' | translate" [subtitle]="'WEB.vendorCommsHint' | translate"></ts-appbar>
      <div class="ts-listbar">
        <ts-chipbar [items]="tabs" [selected]="[tab]" (tap)="setTab($event)"></ts-chipbar>
      </div>

      <!-- Groups -->
      <ng-container *ngIf="tab === 'groups'">
        <div class="ts-note" [class.ts-note--pending]="cloud"><i class="ti ti-info-circle"></i>{{ (cloud ? 'WEB.notConfiguredNote' : 'WEB.manualModeNote') | translate }}</div>
        <label class="ts-search">
          <i class="ti ti-search"></i>
          <input type="search" [placeholder]="'APP.search' | translate" (input)="search$.next($any($event.target).value)" />
        </label>
        <ts-loading *ngIf="!vendors && !error"></ts-loading>
        <ts-error *ngIf="error" [error]="error" (retry)="loadVendors()"></ts-error>
        <div class="ts-list-grid ts-list-grid--cards">
          <ts-card *ngFor="let v of vendors">
            <div class="ts-person">
              <ts-avatar [name]="v.vendorName" bg="var(--ts-selected)" fg="var(--ts-navy)"></ts-avatar>
              <div class="ts-grow" style="min-width: 0">
                <p class="ts-card-title">{{ v.vendorName }}</p>
                <p class="ts-muted ts-num" *ngIf="v.vendorPhone">{{ v.vendorPhone }}</p>
              </div>
              <ts-pill *ngIf="cloud" [tone]="groupTone(v.status)">{{ v.statusName }}</ts-pill>
              <ts-pill *ngIf="!cloud" [tone]="v.manualGroupLink ? 'ok' : 'pending'">{{ (v.manualGroupLink ? 'WEB.linkSaved' : 'WEB.noLinkYet') | translate }}</ts-pill>
            </div>
            <div class="ts-wrap" style="margin-top: 8px">
              <ts-tag *ngIf="v.participantsCount" tone="info" icon="ti ti-users">{{ 'WEB.members' | translate: { n: num(v.participantsCount) } }}</ts-tag>
              <ts-tag *ngIf="v.failedMessages" tone="danger" icon="ti ti-alert-triangle">{{ 'WEB.failedN' | translate: { n: num(v.failedMessages) } }}</ts-tag>
              <button *ngIf="v.pendingMessages" type="button" class="ts-tag ts-tone-pending" style="border: 0; cursor: pointer" (click)="showPending(v)">
                <i class="ti ti-send"></i><span>{{ 'WEB.waitingToSendN' | translate: { n: num(v.pendingMessages) } }}</span>
              </button>
            </div>
            <p class="ts-danger-ink ts-clamp2" *ngIf="v.lastError" style="margin: 6px 0 0; font-size: 12px">{{ v.lastError }}</p>

            <div class="ts-field" *ngIf="v.inviteLink" style="margin-top: 10px">
              <span>{{ 'WEB.inviteLink' | translate }}</span>
              <div class="ts-copy-row">
                <code class="ts-ellipsis">{{ v.inviteLink }}</code>
                <button type="button" class="ts-icon-btn" (click)="copy(v.inviteLink)" [title]="'WEB.copied' | translate"><i class="ti ti-copy"></i></button>
              </div>
              <small class="ts-muted">{{ 'WEB.inviteLinkHint' | translate }}</small>
            </div>

            <ng-container *ngIf="canEdit">
              <ts-field
                [label]="'WEB.manualGroupLink' | translate"
                hint="https://chat.whatsapp.com/…"
                [value]="edits[v.companyId]?.link ?? v.manualGroupLink ?? ''"
                (valueChange)="editOf(v).link = $event"
                style="display: block; margin-top: 10px"
              ></ts-field>
              <small class="ts-muted">{{ 'WEB.manualGroupLinkHint' | translate }}</small>
              <ts-switch-row [title]="'WEB.messagesOn' | translate" [value]="edits[v.companyId]?.on ?? v.isEnabled" (valueChange)="editOf(v).on = $event"></ts-switch-row>
              <div class="ts-wrap" style="margin-top: 8px">
                <button *ngIf="edits[v.companyId]" type="button" class="btn btn-primary btn-sm" [disabled]="busy === v.companyId" (click)="save(v)">{{ 'APP.save' | translate }}</button>
                <a *ngIf="!cloud && v.manualGroupLink" class="btn btn-sm ts-btn-wa" [href]="v.manualGroupLink" target="_blank" rel="noopener"><i class="ti ti-brand-whatsapp"></i>{{ 'WEB.openGroup' | translate }}</a>
                <button *ngIf="cloud && !v.groupId" type="button" class="btn btn-secondary btn-sm" [disabled]="busy === v.companyId" (click)="createGroup(v)">
                  <i class="ti ti-brand-whatsapp"></i>{{ 'WEB.createGroup' | translate }}
                </button>
                <button *ngIf="cloud && v.groupId" type="button" class="btn btn-secondary btn-sm" [disabled]="busy === v.companyId" (click)="refresh(v)"><i class="ti ti-refresh"></i>{{ 'WEB.refreshGroup' | translate }}</button>
                <button *ngIf="cloud && v.groupId" type="button" class="btn btn-secondary btn-sm" [disabled]="busy === v.companyId" (click)="test(v)"><i class="ti ti-send"></i>{{ 'WEB.sendTest' | translate }}</button>
              </div>
            </ng-container>
          </ts-card>
        </div>
      </ng-container>

      <!-- Send log -->
      <ng-container *ngIf="tab === 'log'">
        <div class="ts-log-filters">
          <ts-option-field [label]="'APP.vendor' | translate" source="vendors" [value]="vendor" (valueChange)="vendor = $event; reloadLog()"></ts-option-field>
          <ts-date-field [label]="'APP.from' | translate" [value]="from" (valueChange)="from = $event; reloadLog()"></ts-date-field>
          <ts-date-field [label]="'APP.to' | translate" [value]="to" (valueChange)="to = $event; reloadLog()"></ts-date-field>
        </div>
        <ts-chipbar [items]="statusChips" [selected]="[status]" (tap)="status = $event; reloadLog()"></ts-chipbar>
        <ts-chipbar [items]="channelChips" [selected]="[channel]" (tap)="channel = $event; reloadLog()"></ts-chipbar>
        <label class="ts-search" style="margin-top: 8px">
          <i class="ti ti-search"></i>
          <input type="search" [placeholder]="'APP.search' | translate" (input)="logSearch$.next($any($event.target).value)" />
        </label>
        <button *ngIf="vendor || from || to || status || channel || logSearch" type="button" class="btn btn-link" (click)="clearFilters()">{{ 'APP.clearAll' | translate }}</button>
        <ts-error *ngIf="logError" [error]="logError" (retry)="reloadLog()"></ts-error>
        <div class="ts-list-grid ts-list-grid--cards" style="margin-top: 10px">
          <ts-card *ngFor="let m of rows">
            <div class="ts-wrap ts-wrap--between">
              <strong class="ts-grow">{{ m.vendorName }}</strong>
              <ts-pill [tone]="messageTone(m.status)">{{ m.statusName }}</ts-pill>
            </div>
            <p class="ts-muted" style="margin: 4px 0">
              <a *ngIf="m.bookingId" [routerLink]="['/a/bookings', m.bookingId]">#{{ m.bookingReference }}</a>
              · {{ m.channelName }} · {{ m.createDate | ts: 'datetime' }}
              <ng-container *ngIf="m.attempts > 1"> · {{ 'WEB.attempts' | translate: { n: m.attempts } }}</ng-container>
            </p>
            <p class="ts-danger-ink" *ngIf="m.lastError && m.status !== 1" style="font-size: 12px; margin: 0 0 6px">{{ m.lastError }}</p>
            <pre class="ts-message">{{ m.message }}</pre>
            <div class="ts-wrap" *ngIf="canEdit && m.status !== 1 && m.channel !== 2">
              <button *ngIf="cloud" type="button" class="btn btn-secondary btn-sm" [disabled]="busyLog === m.id" (click)="resend(m)"><i class="ti ti-refresh"></i>{{ 'WEB.resend' | translate }}</button>
              <button type="button" class="btn btn-success btn-sm" (click)="openWhatsApp(m)"><i class="ti ti-brand-whatsapp"></i>{{ 'WEB.openWhatsApp' | translate }}</button>
              <button type="button" class="btn btn-link btn-sm" [disabled]="busyLog === m.id" (click)="sentByHand(m)"><i class="ti ti-check"></i>{{ 'WEB.markSentByHand' | translate }}</button>
            </div>
          </ts-card>
        </div>
        <ts-loading *ngIf="logLoading"></ts-loading>
        <ts-empty *ngIf="!logLoading && !rows.length && !logError" icon="ti ti-brand-whatsapp" [message]="'APP.nothingHereYet' | translate"></ts-empty>
        <button *ngIf="hasNext && !logLoading" type="button" class="btn btn-secondary ts-wide-btn" (click)="loadLog(page + 1)">{{ 'WEB.loadMore' | translate }}</button>
      </ng-container>
    </div>
  `
})
export class VendorCommsComponent implements OnInit, OnDestroy {
  private readonly api = inject(VendorCommsApi);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);
  num = fmtNum;
  groupTone = groupTone;
  messageTone = messageTone;

  tab = 'groups';
  tabs = [
    { key: 'groups', label: this.text.tr('WEB.groups') },
    { key: 'log', label: this.text.tr('WEB.sendLog') }
  ];

  vendors: VendorGroupRow[] | null = null;
  error: unknown = null;
  busy: number | null = null;
  edits: Record<number, { link?: string; on?: boolean }> = {};
  readonly search$ = new Subject<string>();
  private searchSub = this.search$.pipe(debounceTime(300)).subscribe((q) => this.loadVendors(q));

  rows: VendorMessageRow[] = [];
  page = 1;
  hasNext = false;
  logLoading = false;
  logError: unknown = null;
  busyLog: number | null = null;
  vendor: Picked | null = null;
  from: Date | null = null;
  to: Date | null = null;
  status = '';
  channel = '';
  logSearch = '';
  readonly logSearch$ = new Subject<string>();
  private logSearchSub = this.logSearch$.pipe(debounceTime(300)).subscribe((q) => {
    this.logSearch = q.trim();
    this.reloadLog();
  });
  statusChips = [
    { key: '', label: this.text.tr('APP.all') },
    { key: '1', label: this.text.tr('APP.sent') },
    { key: '2', label: this.text.tr('APP.failed') },
    { key: '3', label: this.text.tr('WEB.skipped') },
    { key: '0', label: this.text.tr('WEB.waitingToSend') }
  ];
  channelChips = [
    { key: '', label: this.text.tr('WEB.channel') },
    { key: '1', label: 'WhatsApp' },
    { key: '2', label: this.text.tr('WEB.bookingNotifications') },
    { key: '3', label: this.text.tr('WEB.markSentByHand') }
  ];

  get canEdit(): boolean {
    return this.session.can(P.companyEdit);
  }

  /** Whether the server has the WhatsApp Cloud API; without it (the setup decided 2026-11-03) groups are linked by hand. */
  get cloud(): boolean {
    return !!this.vendors?.[0]?.cloudConfigured;
  }

  /** The vendor's messages waiting to be sent by hand, in the send log. */
  showPending(v: VendorGroupRow): void {
    this.vendor = { id: String(v.companyId), name: v.vendorName } as Picked;
    this.status = '0';
    this.channel = '';
    this.tab = 'log';
    this.reloadLog();
  }

  ngOnInit(): void {
    this.loadVendors();
  }

  setTab(t: string): void {
    this.tab = t;
    if (t === 'log' && !this.rows.length) this.reloadLog();
  }

  loadVendors(q?: string): void {
    this.error = null;
    this.api.vendors(q).subscribe({ next: (v) => (this.vendors = v), error: (e) => (this.error = e) });
  }

  editOf(v: VendorGroupRow) {
    return (this.edits[v.companyId] ??= {});
  }

  private replace(row: VendorGroupRow): void {
    this.vendors = (this.vendors ?? []).map((v) => (v.companyId === row.companyId ? row : v));
  }

  private async run(v: VendorGroupRow, call: Observable<any>, done?: string): Promise<void> {
    this.busy = v.companyId;
    try {
      const r = await firstValueFrom(call);
      if (r && 'companyId' in r && 'statusName' in r && 'participantsCount' in r) this.replace(r as VendorGroupRow);
      this.text.showDone(done ?? this.text.tr('APP.saved'));
    } catch (e) {
      this.text.showError(e);
      this.loadVendors();
    } finally {
      this.busy = null;
    }
  }

  async save(v: VendorGroupRow): Promise<void> {
    const e = this.edits[v.companyId] ?? {};
    await this.run(v, this.api.update(v.companyId, { manualGroupLink: (e.link ?? v.manualGroupLink ?? '').trim() || null, isEnabled: e.on ?? v.isEnabled }));
    delete this.edits[v.companyId];
  }

  createGroup(v: VendorGroupRow): void {
    this.run(v, this.api.createGroup(v.companyId));
  }

  refresh(v: VendorGroupRow): void {
    this.run(v, this.api.refresh(v.companyId));
  }

  test(v: VendorGroupRow): void {
    this.run(v, this.api.test(v.companyId));
  }

  copy(textToCopy: string): void {
    navigator.clipboard?.writeText(textToCopy).then(() => this.text.showDone(this.text.tr('WEB.copied')));
  }

  clearFilters(): void {
    this.vendor = null;
    this.from = this.to = null;
    this.status = this.channel = this.logSearch = '';
    this.reloadLog();
  }

  reloadLog(): void {
    this.rows = [];
    this.loadLog(1);
  }

  loadLog(page: number): void {
    this.logLoading = true;
    this.logError = null;
    const day = (d: Date | null) => (d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : null);
    this.api
      .log({
        companyId: this.vendor ? +this.vendor.id : null,
        status: this.status === '' ? null : +this.status,
        channel: this.channel === '' ? null : +this.channel,
        from: day(this.from),
        to: day(this.to),
        search: this.logSearch || null,
        pageIndex: page,
        pageSize: 20
      })
      .subscribe({
        next: (p) => {
          this.rows = page === 1 ? p.data : [...this.rows, ...p.data];
          this.page = page;
          this.hasNext = p.hasNextPage;
          this.logLoading = false;
        },
        error: (e) => {
          this.logError = e;
          this.logLoading = false;
        }
      });
  }

  private replaceRow(row: VendorMessageRow): void {
    this.rows = this.rows.map((r) => (r.id === row.id ? row : r));
  }

  async resend(m: VendorMessageRow): Promise<void> {
    this.busyLog = m.id;
    try {
      this.replaceRow(await firstValueFrom(this.api.resend(m.id)));
      this.text.showDone(this.text.tr('APP.sent'));
    } catch (e) {
      this.text.showError(e);
      this.reloadLog();
    } finally {
      this.busyLog = null;
    }
  }

  /** The fallback: the message goes to the clipboard and WhatsApp opens the group (or a chat picker without a link). */
  openWhatsApp(m: VendorMessageRow): void {
    navigator.clipboard?.writeText(m.message).then(() => this.text.showDone(this.text.tr('WEB.messageCopied')));
    const url = m.groupLink || `https://wa.me/?text=${encodeURIComponent(m.message)}`;
    window.open(url, '_blank', 'noopener');
  }

  async sentByHand(m: VendorMessageRow): Promise<void> {
    this.busyLog = m.id;
    try {
      this.replaceRow(await firstValueFrom(this.api.sentByHand(m.id)));
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busyLog = null;
    }
  }

  ngOnDestroy(): void {
    this.searchSub.unsubscribe();
    this.logSearchSub.unsubscribe();
  }
}
