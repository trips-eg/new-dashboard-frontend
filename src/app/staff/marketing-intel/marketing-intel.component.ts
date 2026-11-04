import { Component, Injectable, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { PillSwitchComponent } from '../ui/controls';
import { SheetComponent, StaffDialogs } from '../ui/dialogs';
import { ApiError, StaffHttp } from '../core/staff-http';
import { P, StaffSession } from '../core/session';
import { fmtCompact, fmtDate, fmtDateTime, fmtNum, fmtPct } from '../core/format';
import { FORM_KIT } from '../forms/form-kit';
import { KpiTileComponent } from 'src/app/demo/pages/staff-analytics/staff-ui';

/** MarketingProvider (backend enum, numbers). */
export const PROVIDERS: Record<number, string> = {
  1: 'Meta Ads',
  2: 'Facebook Page',
  3: 'Instagram',
  4: 'TikTok Ads',
  5: 'TikTok',
  6: 'YouTube',
  7: 'Google Ads',
  8: 'GA4',
  9: 'Search Console',
  10: 'Google Play',
  11: 'App Store',
  12: 'Adjust'
};
/** The platforms TRIPS can read today (the others are listed as "needs connecting"). */
export const SYNCED_PROVIDERS = [1, 2, 3, 4];

export enum ConnStatus {
  Pending = 0,
  Connected = 1,
  NeedsAttention = 2,
  Paused = 3
}
export enum TaskStatus {
  New = 0,
  NeedsApproval = 1,
  Approved = 2,
  InProgress = 3,
  Done = 4,
  Dismissed = 5
}

export interface MiConnection {
  id: number;
  provider: number;
  accountId: string;
  accountName: string | null;
  currency: string | null;
  status: ConnStatus;
  secretHint: string | null;
  secretExpiresAt: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
}
export interface MiSource {
  provider: number;
  name: string;
  connected: boolean;
  accounts: MiConnection[];
}
export interface MiTotals {
  provider: number;
  currency: string | null;
  spend: number;
  impressions: number;
  clicks: number;
  installs: number;
  costPerInstall: number | null;
  ctr: number | null;
  campaigns: number;
  lastSyncAt: string | null;
}
export interface MiCampaign {
  provider: number;
  accountId: string;
  campaignId: string;
  name: string | null;
  currency: string | null;
  spend: number;
  impressions: number;
  clicks: number;
  installs: number | null;
  costPerInstall: number | null;
  ctr: number | null;
  verdict: 'good' | 'mid' | 'bad' | 'none';
}
export interface MiAlert {
  level: 'danger' | 'warning' | 'info';
  title: string;
  detail: string;
  provider: number | null;
  campaignId: string | null;
}
export interface MiMetric {
  provider: number;
  accountId: string;
  accountName: string | null;
  metric: string;
  value: number;
  day: string;
  previousValue: number | null;
  previousDay: string | null;
  syncedAt: string;
}
export interface MiTask {
  id: number;
  title: string;
  reason: string | null;
  source: 'rule' | 'ai' | 'manual';
  provider: number | null;
  campaignId: string | null;
  ownerUserId: number | null;
  ownerName: string | null;
  requiresApproval: boolean;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  decidedByUserId: number | null;
  decidedAt: string | null;
}
export interface MiBookings {
  bookings: number;
  paid: number;
  paidTotal: number;
  attributed: number;
  attributedPaid: number;
  attributedPaidTotal: number;
  bySource: { source: string; campaign: string | null; bookings: number; paid: number; paidTotal: number }[];
}
export interface MiOverview {
  from: string;
  to: string;
  generatedAt: string;
  sources: MiSource[];
  totals: MiTotals[];
  campaigns: MiCampaign[];
  alerts: MiAlert[];
  social: MiMetric[];
  tasks: MiTask[];
  bookings: MiBookings;
}
export interface MiAnswer {
  answer: string;
  model: string;
  dataGeneratedAt: string;
  from: string;
  to: string;
}

/** /api/staff/marketing/... (admins; Financial.View to read, Financial.Edit to connect and approve). */
@Injectable({ providedIn: 'root' })
export class MarketingIntelApi {
  private readonly http = inject(StaffHttp);

  overview(from: string, to: string): Observable<MiOverview> {
    return this.http.get<MiOverview>('/api/staff/marketing/overview', { from, to });
  }
  ask(question: string, from: string, to: string): Observable<MiAnswer> {
    return this.http.post<MiAnswer>('/api/staff/marketing/ask', { question, from, to });
  }
  connections(): Observable<{ analystConfigured: boolean; connections: MiConnection[] }> {
    return this.http.get('/api/staff/marketing/connections');
  }
  connect(body: object): Observable<MiConnection> {
    return this.http.post<MiConnection>('/api/staff/marketing/connections', body);
  }
  updateConnection(id: number, body: object): Observable<MiConnection> {
    return this.http.put<MiConnection>(`/api/staff/marketing/connections/${id}`, body);
  }
  pause(id: number, paused: boolean): Observable<boolean> {
    return this.http.post<boolean>(`/api/staff/marketing/connections/${id}/pause`, {}, { paused });
  }
  disconnect(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`/api/staff/marketing/connections/${id}`);
  }
  sync(id: number): Observable<{ synced: number; failed: number; adRows: number; accountRows: number; tasksAdded: number }> {
    return this.http.post(`/api/staff/marketing/connections/${id}/sync`);
  }
  addTask(body: object): Observable<MiTask> {
    return this.http.post<MiTask>('/api/staff/marketing/tasks', body);
  }
  updateTask(id: number, body: object): Observable<MiTask> {
    return this.http.put<MiTask>(`/api/staff/marketing/tasks/${id}`, body);
  }
}

function isoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * a-more-marketing-intel: ad spend and installs per platform and campaign, social numbers, where bookings came from,
 * alerts, the AI analyst and its tasks. Every block says where its numbers come from and when they were read; a source
 * that isn't connected says so and shows no number. Nothing here changes a campaign, a budget or a post.
 */
@Component({
  selector: 'ts-marketing-intel',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ...KIT, ...FORM_KIT, KpiTileComponent, PillSwitchComponent, SheetComponent],
  template: `
    <div class="ts-screen">
      <ts-appbar [title]="'MI.title' | translate" [subtitle]="subtitle()"></ts-appbar>
      <div class="ts-note"><i class="ti ti-lock"></i>{{ 'MI.adminOnly' | translate }}</div>
      <ts-pill-switch [items]="ranges" [selected]="range" (selectedChange)="setRange($event)"></ts-pill-switch>
      <ts-loading *ngIf="!d && !error"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>

      <ng-container *ngIf="d">
        <!-- Sources -->
        <ts-card [title]="'MI.sources' | translate" icon="ti ti-plug-connected" [subtitle]="'MI.sourcesHint' | translate: { on: connectedCount(), all: d.sources.length }">
          <div class="mi-sources">
            <div class="mi-source" *ngFor="let s of d.sources" [class.mi-source--off]="!s.accounts.length">
              <div class="mi-source__head">
                <strong>{{ s.name }}</strong>
                <ts-pill [tone]="sourceTone(s)">{{ sourceState(s) | translate }}</ts-pill>
              </div>
              <span class="ts-muted mi-small" *ngFor="let a of s.accounts">
                {{ a.accountName || a.accountId }} · {{ a.lastSyncAt ? (('MI.lastSync' | translate) + ' ' + when(a.lastSyncAt)) : ('MI.neverSynced' | translate) }}
              </span>
              <span class="ts-muted mi-small" *ngIf="!s.accounts.length">{{ 'MI.notConnected' | translate }}</span>
            </div>
          </div>
        </ts-card>

        <!-- KPIs -->
        <div class="ts-kpi-grid ts-kpi-grid--3">
          <ts-kpi icon="ti ti-cash" tone="expense" [label]="('MI.spend' | translate) + ' · ' + mainCurrency()" [value]="num(round(spend()))" [footnote]="perProvider('spend')"></ts-kpi>
          <ts-kpi icon="ti ti-download" tone="revenue" [label]="'MI.installs' | translate" [value]="num(installs())" [footnote]="perProvider('installs')"></ts-kpi>
          <ts-kpi icon="ti ti-target-arrow" [label]="('MI.cpi' | translate) + ' · ' + mainCurrency()" [value]="cpi() == null ? '—' : num(cpi()!)" [footnote]="perProvider('cpi')"></ts-kpi>
          <ts-kpi icon="ti ti-eye" [label]="'MI.impressions' | translate" [value]="compact(impressions())"></ts-kpi>
          <ts-kpi icon="ti ti-ticket" [label]="'MI.attributedBookings' | translate"
            [value]="d.bookings.attributed ? num(d.bookings.attributed) : ('MI.needsSource' | translate)"
            [footnote]="'MI.bookingsOfAll' | translate: { n: num(d.bookings.bookings), paid: num(d.bookings.paid) }"></ts-kpi>
        </div>
        <p class="ts-muted mi-small mi-note" *ngIf="d.totals.length > 1">{{ 'MI.platformsCountDifferently' | translate }}</p>

        <div class="mi-grid">
          <!-- Campaigns -->
          <ts-card class="mi-wide" [title]="'MI.campaigns' | translate" icon="ti ti-speakerphone" [subtitle]="rangeText()">
            <ts-empty *ngIf="!d.campaigns.length" icon="ti ti-speakerphone" [message]="'MI.noCampaigns' | translate"></ts-empty>
            <div class="mi-table" *ngIf="d.campaigns.length">
              <div class="mi-row mi-row--head">
                <span>{{ 'MI.campaign' | translate }}</span><span>{{ 'MI.spend' | translate }}</span><span>{{ 'MI.installs' | translate }}</span>
                <span>{{ 'MI.cpiShort' | translate }}</span><span>CTR</span><span>{{ 'MI.verdict' | translate }}</span>
              </div>
              <div class="mi-row" *ngFor="let c of shownCampaigns()">
                <span class="mi-name"><bdi dir="ltr">{{ c.name || c.campaignId }}</bdi><small class="ts-muted">{{ provider(c.provider) }}</small></span>
                <span class="ts-num"><strong>{{ num(round(c.spend)) }}</strong><small class="ts-muted mi-cur">{{ c.currency }}</small></span>
                <span class="ts-num">{{ c.installs == null ? '—' : num(c.installs) }}</span>
                <span class="ts-num">{{ c.costPerInstall == null ? '—' : num(c.costPerInstall) }}</span>
                <span class="ts-num">{{ c.ctr == null ? '—' : pct(c.ctr * 100) }}</span>
                <span><ts-pill [tone]="verdictTone(c.verdict)">{{ ('MI.verdict_' + c.verdict) | translate }}</ts-pill></span>
              </div>
            </div>
            <button *ngIf="d.campaigns.length > 15" type="button" class="btn btn-link" (click)="allCampaigns = !allCampaigns">
              {{ (allCampaigns ? 'MI.showLess' : 'MI.showAll') | translate: { n: d.campaigns.length } }}
            </button>
            <p class="ts-muted mi-small">{{ 'MI.verdictRule' | translate }}</p>
          </ts-card>

          <!-- Analyst -->
          <ts-card [title]="'MI.analyst' | translate" icon="ti ti-sparkles" [subtitle]="'MI.analystHint' | translate">
            <div *ngIf="analystConfigured === false" class="ts-note ts-note--pending"><i class="ti ti-info-circle"></i>{{ 'MI.analystOff' | translate }}</div>
            <ts-field [label]="'MI.askLabel' | translate" [lines]="2" [hint]="'MI.askHint' | translate" [(value)]="question"></ts-field>
            <button type="button" class="btn btn-primary ts-wide-btn" [disabled]="asking || !question.trim()" (click)="ask()">
              <i class="ti ti-send"></i> {{ (asking ? 'MI.asking' : 'MI.ask') | translate }}
            </button>
            <div class="mi-answer" *ngIf="answer">
              <p>{{ answer.answer }}</p>
              <small class="ts-muted">{{ 'MI.answerSource' | translate: { from: day(answer.from), to: day(answer.to), at: when(answer.dataGeneratedAt) } }}</small>
            </div>
            <ts-error *ngIf="askError" [error]="askError"></ts-error>
            <p class="ts-muted mi-small">{{ 'MI.analystRule' | translate }}</p>
          </ts-card>

          <!-- Alerts -->
          <ts-card [title]="'MI.alerts' | translate" icon="ti ti-alert-triangle" iconColor="var(--ts-danger)" iconBg="var(--ts-danger-soft)">
            <ts-empty *ngIf="!d.alerts.length" icon="ti ti-circle-check" [message]="'MI.noAlerts' | translate"></ts-empty>
            <div class="mi-alert" *ngFor="let a of d.alerts" [ngClass]="'mi-alert--' + a.level">
              <strong><bdi>{{ a.title }}</bdi></strong>
              <span>{{ a.detail }}</span>
            </div>
          </ts-card>

          <!-- Tasks -->
          <ts-card class="mi-wide" [title]="'MI.tasks' | translate" icon="ti ti-checklist" [subtitle]="'MI.tasksHint' | translate">
            <button type="button" class="btn btn-outline-primary" (click)="openTask()"><i class="ti ti-plus"></i> {{ 'MI.addTask' | translate }}</button>
            <ts-empty *ngIf="!d.tasks.length" icon="ti ti-checklist" [message]="'MI.noTasks' | translate"></ts-empty>
            <div class="mi-task" *ngFor="let t of d.tasks">
              <div class="mi-task__main">
                <strong>{{ t.title }}</strong>
                <span class="ts-muted mi-small" *ngIf="t.reason">{{ t.reason }}</span>
                <span class="mi-small">
                  <ts-pill [tone]="taskTone(t.status)">{{ ('MI.task_' + t.status) | translate }}</ts-pill>
                  · {{ 'MI.owner' | translate }}: {{ t.ownerName || ('MI.noOwner' | translate) }}
                  · {{ ('MI.source_' + t.source) | translate }}
                </span>
              </div>
              <div class="mi-task__actions">
                <ng-container *ngIf="t.status === TaskStatus.NeedsApproval">
                  <button type="button" class="btn btn-sm btn-primary" [disabled]="!canEdit || busy" (click)="decide(t, TaskStatus.Approved)">{{ 'MI.approve' | translate }}</button>
                  <button type="button" class="btn btn-sm btn-outline-secondary" [disabled]="!canEdit || busy" (click)="decide(t, TaskStatus.Dismissed)">{{ 'MI.dismiss' | translate }}</button>
                </ng-container>
                <ng-container *ngIf="t.status !== TaskStatus.NeedsApproval">
                  <button type="button" class="btn btn-sm btn-outline-primary" *ngIf="t.status !== TaskStatus.InProgress" [disabled]="busy" (click)="decide(t, TaskStatus.InProgress)">{{ 'MI.start' | translate }}</button>
                  <button type="button" class="btn btn-sm btn-primary" [disabled]="busy" (click)="decide(t, TaskStatus.Done)">{{ 'MI.done' | translate }}</button>
                </ng-container>
                <button type="button" class="btn btn-sm btn-link" (click)="openTask(t)">{{ 'MI.owner' | translate }}</button>
              </div>
            </div>
            <p class="ts-muted mi-small" *ngIf="!canEdit">{{ 'MI.approveNeedsEdit' | translate }}</p>
          </ts-card>

          <!-- Social -->
          <ts-card [title]="'MI.social' | translate" icon="ti ti-brand-instagram">
            <ts-empty *ngIf="!d.social.length" icon="ti ti-users" [message]="'MI.noSocial' | translate"></ts-empty>
            <ts-info *ngFor="let m of d.social" [label]="provider(m.provider) + ' · ' + (m.accountName || m.accountId) + ' · ' + (('MI.metric_' + m.metric) | translate)"
              [value]="num(m.value) + change(m)"></ts-info>
          </ts-card>

          <!-- Bookings -->
          <ts-card [title]="'MI.bookings' | translate" icon="ti ti-ticket" [subtitle]="'MI.bookingsHint' | translate">
            <ts-info [label]="'MI.bookingsAll' | translate" [value]="num(d.bookings.bookings)"></ts-info>
            <ts-info [label]="'MI.bookingsPaid' | translate" [value]="num(d.bookings.paid) + ' · ' + money(d.bookings.paidTotal, 'EGP')"></ts-info>
            <ts-info [label]="'MI.bookingsAttributed' | translate" [value]="num(d.bookings.attributed)"></ts-info>
            <div *ngIf="!d.bookings.attributed" class="ts-note ts-note--pending"><i class="ti ti-info-circle"></i>{{ 'MI.noAttribution' | translate }}</div>
            <ts-info *ngFor="let s of d.bookings.bySource" [label]="s.source + (s.campaign ? ' · ' + s.campaign : '')"
              [value]="num(s.bookings) + ' · ' + ('MI.paidN' | translate: { n: num(s.paid) })"></ts-info>
          </ts-card>

          <!-- Connections -->
          <ts-card class="mi-wide" [title]="'MI.connections' | translate" icon="ti ti-key" [subtitle]="'MI.connectionsHint' | translate">
            <button type="button" class="btn btn-outline-primary" *ngIf="canEdit" (click)="openConnect()"><i class="ti ti-plus"></i> {{ 'MI.connect' | translate }}</button>
            <ts-empty *ngIf="!connections.length" icon="ti ti-plug" [message]="'MI.noConnections' | translate"></ts-empty>
            <div class="mi-task" *ngFor="let c of connections">
              <div class="mi-task__main">
                <strong>{{ provider(c.provider) }} · <bdi dir="ltr">{{ c.accountName || c.accountId }}</bdi></strong>
                <span class="mi-small"><ts-pill [tone]="connTone(c.status)">{{ ('MI.conn_' + c.status) | translate }}</ts-pill>
                  · {{ 'MI.tokenHint' | translate: { hint: c.secretHint || '••••' } }}
                  <ng-container *ngIf="c.lastSyncAt"> · {{ 'MI.lastSync' | translate }} {{ when(c.lastSyncAt) }}</ng-container></span>
                <span class="mi-small mi-err" *ngIf="c.lastError">{{ c.lastError }}</span>
              </div>
              <div class="mi-task__actions" *ngIf="canEdit">
                <button type="button" class="btn btn-sm btn-primary" [disabled]="busy || c.status === ConnStatus.Paused" (click)="syncNow(c)">{{ 'MI.syncNow' | translate }}</button>
                <button type="button" class="btn btn-sm btn-outline-secondary" [disabled]="busy" (click)="openConnect(c)">{{ 'MI.newToken' | translate }}</button>
                <button type="button" class="btn btn-sm btn-outline-secondary" [disabled]="busy" (click)="togglePause(c)">{{ (c.status === ConnStatus.Paused ? 'MI.resume' : 'MI.pause') | translate }}</button>
                <button type="button" class="btn btn-sm btn-outline-danger" [disabled]="busy" (click)="disconnect(c)">{{ 'MI.disconnect' | translate }}</button>
              </div>
            </div>
          </ts-card>
        </div>

        <p class="ts-muted mi-small mi-note">{{ 'MI.footer' | translate: { at: when(d.generatedAt) } }}</p>
      </ng-container>
    </div>

    <ts-sheet [open]="taskOpen" (openChange)="taskOpen = false" [title]="(task.id ? 'MI.editTask' : 'MI.addTask') | translate">
      <ts-field *ngIf="!task.id" [label]="'MI.taskTitle' | translate" [required]="true" [(value)]="task.title"></ts-field>
      <ts-field *ngIf="!task.id" [label]="'MI.taskReason' | translate" [lines]="2" [(value)]="task.reason"></ts-field>
      <ts-field [label]="'MI.owner' | translate" [hint]="'MI.ownerHint' | translate" [(value)]="task.ownerName"></ts-field>
      <ts-field [label]="'MI.dueDate' | translate" type="date" [(value)]="task.dueDate"></ts-field>
      <label *ngIf="!task.id" class="mi-check"><input type="checkbox" [(ngModel)]="task.requiresApproval" /> {{ 'MI.needsApproval' | translate }}</label>
      <div sheet-foot>
        <button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy || (!task.id && !task.title.trim())" (click)="saveTask()">{{ 'APP.save' | translate }}</button>
      </div>
    </ts-sheet>

    <ts-sheet [open]="connOpen" (openChange)="connOpen = false" [title]="(conn.id ? 'MI.newToken' : 'MI.connect') | translate">
      <label class="mi-label" *ngIf="!conn.id">{{ 'MI.platform' | translate }}
        <select class="form-select" [(ngModel)]="conn.provider">
          <option *ngFor="let p of syncable" [ngValue]="p">{{ provider(p) }}</option>
        </select>
      </label>
      <ts-field *ngIf="!conn.id" [label]="'MI.accountId' | translate" [required]="true" [hint]="accountHint()" [(value)]="conn.accountId"></ts-field>
      <ts-field [label]="'MI.accountName' | translate" [(value)]="conn.accountName"></ts-field>
      <ts-field *ngIf="!conn.id" [label]="'MI.currency' | translate" hint="EGP" [(value)]="conn.currency"></ts-field>
      <ts-field [label]="'MI.token' | translate" type="password" [required]="!conn.id" [hint]="'MI.tokenHelp' | translate" [(value)]="conn.token"></ts-field>
      <ts-field [label]="'MI.tokenExpires' | translate" type="date" [(value)]="conn.expires"></ts-field>
      <p class="ts-muted mi-small">{{ 'MI.tokenSafety' | translate }}</p>
      <div sheet-foot>
        <button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy || (!conn.id && (!conn.accountId.trim() || !conn.token.trim()))" (click)="saveConnection()">{{ 'APP.save' | translate }}</button>
      </div>
    </ts-sheet>
  `,
  styles: [
    `
      .mi-small { font-size: 12.5px; }
      .mi-note { margin: 4px 2px 12px; }
      .mi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; align-items: start; }
      .mi-wide { grid-column: 1 / -1; }
      .mi-sources { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 8px; }
      .mi-source { border: 1px solid var(--ts-line); border-radius: 12px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px; background: var(--ts-subtle, #fff9f0); }
      .mi-source--off { border-style: dashed; }
      .mi-source__head { display: flex; justify-content: space-between; gap: 6px; align-items: center; }
      .mi-table { display: grid; gap: 2px; font-size: 13.5px; overflow-x: auto; }
      .mi-row { display: grid; grid-template-columns: minmax(170px, 2.2fr) repeat(4, minmax(64px, 1fr)) minmax(80px, 1fr); gap: 8px; align-items: center; padding: 8px 4px; border-bottom: 1px solid var(--ts-line); min-width: 640px; }
      .mi-row--head { color: var(--ts-ink-faint); font-size: 12px; font-weight: 600; }
      .mi-name { display: flex; flex-direction: column; min-width: 0; }
      .mi-name bdi { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
      .mi-alert { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border-radius: 12px; margin-bottom: 8px; font-size: 13.5px; }
      .mi-alert--danger { background: var(--ts-danger-soft); border-inline-start: 3px solid var(--ts-danger); }
      .mi-alert--warning { background: var(--ts-pend-bg, #fff1c2); border-inline-start: 3px solid var(--ts-pend-dot, #f39a1e); }
      .mi-alert--info { background: var(--ts-done-bg, #e0eef9); border-inline-start: 3px solid var(--ts-done-fg, #2b5e91); }
      .mi-task { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--ts-line); }
      .mi-task__main { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1 1 260px; }
      .mi-task__actions { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
      .mi-answer { margin-top: 12px; padding: 12px; border-radius: 12px; background: var(--ts-selected); }
      .mi-answer p { white-space: pre-line; margin: 0 0 6px; }
      .mi-cur { margin-inline-start: 4px; }
      .mi-err { color: var(--ts-danger-ink, #b42318); }
      .mi-label { display: flex; flex-direction: column; gap: 4px; font-weight: 600; font-size: 13px; margin-bottom: 12px; }
      .mi-check { display: flex; gap: 8px; align-items: center; margin: 8px 0; }
    `
  ]
})
export class MarketingIntelComponent implements OnInit {
  private readonly api = inject(MarketingIntelApi);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  private readonly session = inject(StaffSession);

  readonly TaskStatus = TaskStatus;
  readonly ConnStatus = ConnStatus;
  readonly syncable = SYNCED_PROVIDERS;
  readonly canEdit = this.session.can(P.financialEdit);

  num = fmtNum;
  compact = fmtCompact;
  pct = (v: number | null | undefined) => fmtPct(v);
  round = (v: number) => Math.round(v);

  d: MiOverview | null = null;
  error: unknown = null;
  connections: MiConnection[] = [];
  analystConfigured: boolean | null = null;
  range = '30';
  ranges = [
    { key: '7', label: this.text.tr('MI.days', { n: 7 }) },
    { key: '30', label: this.text.tr('MI.days', { n: 30 }) },
    { key: '90', label: this.text.tr('MI.days', { n: 90 }) }
  ];
  allCampaigns = false;

  question = '';
  asking = false;
  answer: MiAnswer | null = null;
  askError: unknown = null;

  busy = false;
  taskOpen = false;
  task = { id: 0, title: '', reason: '', ownerName: '', dueDate: '', requiresApproval: false };
  connOpen = false;
  conn = { id: 0, provider: 1, accountId: '', accountName: '', currency: 'EGP', token: '', expires: '' };

  ngOnInit(): void {
    this.load();
  }

  private days(): { from: string; to: string } {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - (Number(this.range) - 1));
    return { from: isoDay(from), to: isoDay(to) };
  }

  setRange(key: string): void {
    this.range = key;
    this.load();
  }

  load(): void {
    this.error = null;
    this.d = null;
    const { from, to } = this.days();
    this.api.overview(from, to).subscribe({ next: (d) => (this.d = d), error: (e) => (this.error = e) });
    this.api.connections().subscribe({
      next: (c) => {
        this.connections = c.connections;
        this.analystConfigured = c.analystConfigured;
      },
      error: () => (this.connections = [])
    });
  }

  subtitle(): string {
    return this.d ? this.rangeText() : '';
  }

  rangeText(): string {
    return this.d ? this.text.tr('MI.range', { from: fmtDate(this.d.from, this.text.arabic), to: fmtDate(this.d.to, this.text.arabic) }) : '';
  }

  day(v: string): string {
    return fmtDate(v, this.text.arabic);
  }

  when(v: string | null): string {
    return v ? fmtDateTime(v, this.text.arabic) : '—';
  }

  provider(p: number | null): string {
    return p == null ? '' : (PROVIDERS[p] ?? String(p));
  }

  connectedCount(): number {
    return this.d?.sources.filter((s) => s.connected).length ?? 0;
  }

  sourceState(s: MiSource): string {
    if (!s.accounts.length) return 'MI.stateMissing';
    if (s.accounts.some((a) => a.status === ConnStatus.NeedsAttention)) return 'MI.stateAttention';
    if (s.connected) return 'MI.stateOn';
    return 'MI.statePending';
  }

  sourceTone(s: MiSource): 'ok' | 'danger' | 'pending' | 'neutral' {
    const k = this.sourceState(s);
    return k === 'MI.stateOn' ? 'ok' : k === 'MI.stateAttention' ? 'danger' : k === 'MI.statePending' ? 'pending' : 'neutral';
  }

  /** The currency with most spend: the KPI tiles add up that currency only. */
  mainCurrency(): string {
    const by = new Map<string, number>();
    for (const t of this.d?.totals ?? []) by.set(t.currency ?? '', (by.get(t.currency ?? '') ?? 0) + t.spend);
    return [...by.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'EGP';
  }

  private main(): MiTotals[] {
    const c = this.mainCurrency();
    return (this.d?.totals ?? []).filter((t) => (t.currency || 'EGP') === c);
  }

  spend(): number {
    return this.main().reduce((s, t) => s + t.spend, 0);
  }

  installs(): number {
    return this.main().reduce((s, t) => s + t.installs, 0);
  }

  impressions(): number {
    return (this.d?.totals ?? []).reduce((s, t) => s + t.impressions, 0);
  }

  cpi(): number | null {
    const i = this.installs();
    return i > 0 ? Math.round((this.spend() / i) * 100) / 100 : null;
  }

  money(v: number, currency: string | null): string {
    return `${fmtNum(Math.round(v * 100) / 100)} ${currency ?? ''}`.trim();
  }

  perProvider(kind: 'spend' | 'installs' | 'cpi'): string {
    return (this.d?.totals ?? [])
      .map((t) => {
        const v = kind === 'spend' ? fmtNum(Math.round(t.spend)) : kind === 'installs' ? fmtNum(t.installs) : t.costPerInstall == null ? '—' : fmtNum(t.costPerInstall);
        return `${this.provider(t.provider)} ${v}`;
      })
      .join(' · ');
  }

  shownCampaigns(): MiCampaign[] {
    return this.allCampaigns ? (this.d?.campaigns ?? []) : (this.d?.campaigns ?? []).slice(0, 15);
  }

  verdictTone(v: string): 'ok' | 'pending' | 'danger' | 'neutral' {
    return v === 'good' ? 'ok' : v === 'mid' ? 'pending' : v === 'bad' ? 'danger' : 'neutral';
  }

  taskTone(s: TaskStatus): 'ok' | 'pending' | 'danger' | 'neutral' | 'info' {
    return s === TaskStatus.NeedsApproval ? 'pending' : s === TaskStatus.Done || s === TaskStatus.Approved ? 'ok' : s === TaskStatus.Dismissed ? 'neutral' : 'info';
  }

  connTone(s: ConnStatus): 'ok' | 'pending' | 'danger' | 'neutral' {
    return s === ConnStatus.Connected ? 'ok' : s === ConnStatus.NeedsAttention ? 'danger' : s === ConnStatus.Paused ? 'neutral' : 'pending';
  }

  change(m: MiMetric): string {
    if (m.previousValue == null) return '';
    const diff = m.value - m.previousValue;
    return ` (${diff >= 0 ? '+' : '−'}${fmtNum(Math.abs(diff))})`;
  }

  accountHint(): string {
    return this.text.tr(`MI.accountHint_${this.conn.provider}`);
  }

  ask(): void {
    const q = this.question.trim();
    if (!q) return;
    this.asking = true;
    this.askError = null;
    this.answer = null;
    const { from, to } = this.days();
    this.api.ask(q, from, to).subscribe({
      next: (a) => {
        this.answer = a;
        this.asking = false;
      },
      error: (e) => {
        this.asking = false;
        this.askError = e instanceof ApiError && e.code === 'AI_NOT_CONFIGURED' ? this.text.tr('MI.analystOff') : e;
      }
    });
  }

  async decide(t: MiTask, status: TaskStatus): Promise<void> {
    if (status === TaskStatus.Approved || status === TaskStatus.Dismissed) {
      const ok = await this.dialogs.confirm({
        title: t.title,
        message: this.text.tr(status === TaskStatus.Approved ? 'MI.approveQ' : 'MI.dismissQ'),
        confirm: this.text.tr(status === TaskStatus.Approved ? 'MI.approve' : 'MI.dismiss')
      });
      if (!ok) return;
    }
    this.run(this.api.updateTask(t.id, { status }));
  }

  openTask(t?: MiTask): void {
    this.task = t
      ? { id: t.id, title: t.title, reason: t.reason ?? '', ownerName: t.ownerName ?? '', dueDate: t.dueDate?.slice(0, 10) ?? '', requiresApproval: t.requiresApproval }
      : { id: 0, title: '', reason: '', ownerName: '', dueDate: '', requiresApproval: false };
    this.taskOpen = true;
  }

  saveTask(): void {
    const body: Record<string, unknown> = { ownerName: this.task.ownerName.trim(), dueDate: this.task.dueDate || null };
    if (!this.task.id) Object.assign(body, { title: this.task.title.trim(), reason: this.task.reason.trim() || null, requiresApproval: this.task.requiresApproval });
    this.run(this.task.id ? this.api.updateTask(this.task.id, body) : this.api.addTask(body), () => (this.taskOpen = false));
  }

  openConnect(c?: MiConnection): void {
    this.conn = c
      ? { id: c.id, provider: c.provider, accountId: c.accountId, accountName: c.accountName ?? '', currency: c.currency ?? 'EGP', token: '', expires: c.secretExpiresAt?.slice(0, 10) ?? '' }
      : { id: 0, provider: 1, accountId: '', accountName: '', currency: 'EGP', token: '', expires: '' };
    this.connOpen = true;
  }

  saveConnection(): void {
    const body = {
      provider: Number(this.conn.provider),
      accountId: this.conn.accountId.trim(),
      accountName: this.conn.accountName.trim() || null,
      currency: this.conn.currency.trim() || null,
      token: this.conn.token.trim() || null,
      tokenExpiresAt: this.conn.expires || null
    };
    const done = () => {
      this.connOpen = false;
      this.conn.token = '';
    };
    this.run(this.conn.id ? this.api.updateConnection(this.conn.id, body) : this.api.connect(body), done);
  }

  syncNow(c: MiConnection): void {
    this.busy = true;
    this.api.sync(c.id).subscribe({
      next: (r) => {
        this.busy = false;
        this.text.showDone(this.text.tr(r.failed ? 'MI.syncFailed' : 'MI.syncDone', { rows: r.adRows + r.accountRows }));
        this.load();
      },
      error: (e) => {
        this.busy = false;
        this.text.showError(e);
      }
    });
  }

  togglePause(c: MiConnection): void {
    this.run(this.api.pause(c.id, c.status !== ConnStatus.Paused));
  }

  async disconnect(c: MiConnection): Promise<void> {
    const ok = await this.dialogs.confirm({
      title: `${this.provider(c.provider)} · ${c.accountName || c.accountId}`,
      message: this.text.tr('MI.disconnectQ'),
      confirm: this.text.tr('MI.disconnect'),
      danger: true
    });
    if (ok) this.run(this.api.disconnect(c.id));
  }

  private run(call: Observable<unknown>, after?: () => void): void {
    this.busy = true;
    call.subscribe({
      next: () => {
        this.busy = false;
        after?.();
        this.text.showDone(this.text.tr('APP.saved'));
        this.load();
      },
      error: (e) => {
        this.busy = false;
        this.text.showError(e);
      }
    });
  }
}
