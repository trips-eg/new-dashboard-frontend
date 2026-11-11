import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { KIT, StaffText } from '../ui/kit';
import { SwitchRowComponent } from '../ui/controls';
import { SheetComponent, StaffDialogs } from '../ui/dialogs';
import { StaffHttp } from '../core/staff-http';
import { P, StaffSession } from '../core/session';
import { FORM_KIT } from '../forms/form-kit';
import { Tone } from '../core/enums';

export interface AutoOccasion {
  id: string;
  name: string;
  date: string | Date;
  yearly: boolean;
  approx: boolean;
  leadDays: number;
}

export interface AutoNotifySettings {
  enabled: boolean;
  autoSend: boolean;
  maxPerWeek: number;
  sendHour: number;
  quietFrom: number;
  quietTo: number;
  occasions: AutoOccasion[];
  occasionsAreDefault: boolean;
  hasKey: boolean;
}

export interface AutoNotification {
  id: number;
  createdAt: string;
  kind: string;
  occasion?: string | null;
  itemType?: string | null;
  itemId?: number | null;
  itemName?: string | null;
  title: string;
  body: string;
  /** 1 draft, 2 sent, 3 rejected, 4 skipped, 5 going out */
  status: number;
  sentAt?: string | null;
  reach: number;
  note?: string | null;
}

const KIND_LABEL: Record<string, string> = {
  occasion: 'APP.anKindOccasion',
  seats: 'APP.anKindSeats',
  coupon: 'APP.anKindCoupon',
  weekend: 'APP.anKindWeekend',
  umrah: 'APP.anKindUmrah',
  discount: 'APP.anKindDiscount',
  new: 'APP.anKindNew',
  popular: 'APP.anKindPopular',
  rising: 'APP.anKindRising',
  promote: 'APP.anKindPromote'
};

/**
 * a-auto-notifications: the notifications the system writes by itself. The switch and the limits, the drafts waiting
 * for approval (edit, send or remove), the log of what went out, and the occasions it writes about.
 * Backend: api/staff/auto-notifications.
 */
@Component({
  selector: 'ts-auto-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, ...KIT, ...FORM_KIT, SwitchRowComponent, SheetComponent],
  template: `
    <div class="ts-screen ts-screen--narrow">
      <ts-appbar [title]="'APP.autoNotify' | translate" [subtitle]="'APP.autoNotifyHint' | translate"></ts-appbar>
      <ts-loading *ngIf="loading"></ts-loading>
      <ts-error *ngIf="error" [error]="error" (retry)="load()"></ts-error>
      <ng-container *ngIf="s && !loading && !error">
        <ts-card [title]="'APP.anSettings' | translate" icon="ti ti-settings">
          <ts-switch-row [title]="'APP.anEnabled' | translate" [subtitle]="(s.hasKey ? 'APP.anEnabledHint' : 'APP.anNoKey') | translate" [value]="s.enabled" [disabled]="!canEdit" (valueChange)="s.enabled = $event"></ts-switch-row>
          <ts-switch-row [title]="'APP.anAutoSend' | translate" [subtitle]="(s.autoSend ? 'APP.anAutoSendOn' : 'APP.anAutoSendOff') | translate" [value]="s.autoSend" [disabled]="!canEdit" (valueChange)="s.autoSend = $event"></ts-switch-row>
          <div class="ts-two">
            <ts-field [label]="'APP.anMaxPerWeek' | translate" [number]="true" [hint]="'APP.anMaxPerWeekHint' | translate" [value]="'' + s.maxPerWeek" (valueChange)="s.maxPerWeek = +$event"></ts-field>
            <ts-field [label]="'APP.anSendHour' | translate" [number]="true" [hint]="'APP.anSendHourHint' | translate" [value]="'' + s.sendHour" (valueChange)="s.sendHour = +$event"></ts-field>
          </div>
          <div class="ts-two">
            <ts-field [label]="'APP.anQuietFrom' | translate" [number]="true" [value]="'' + s.quietFrom" (valueChange)="s.quietFrom = +$event"></ts-field>
            <ts-field [label]="'APP.anQuietTo' | translate" [number]="true" [value]="'' + s.quietTo" (valueChange)="s.quietTo = +$event"></ts-field>
          </div>
          <p class="ts-muted ts-small">{{ 'APP.anRules' | translate }}</p>
          <div class="ts-two" *ngIf="canEdit" style="margin-top: 10px">
            <button type="button" class="btn btn-secondary" (click)="openOccasions()" data-test="an-occasions"><i class="ti ti-calendar-event"></i>{{ 'APP.anOccasions' | translate }} ({{ s.occasions.length }})</button>
            <button type="button" class="btn btn-primary" [disabled]="busy" (click)="save()" data-test="an-save"><i *ngIf="busy" class="pi pi-spin pi-spinner"></i>{{ 'APP.save' | translate }}</button>
          </div>
        </ts-card>

        <button *ngIf="canEdit" type="button" class="btn btn-secondary ts-wide-btn" [disabled]="generating" (click)="generate()" data-test="an-generate" style="margin: 4px 0 12px">
          <i [class]="generating ? 'pi pi-spin pi-spinner' : 'ti ti-sparkles'"></i>{{ 'APP.anGenerate' | translate }}
        </button>

        <ts-card [title]="'APP.anDrafts' | translate" [subtitle]="'APP.anDraftsHint' | translate" icon="ti ti-pencil">
          <p class="ts-muted" *ngIf="!drafts.length">{{ 'APP.anNoDrafts' | translate }}</p>
          <div class="ts-list-card" *ngFor="let n of drafts" style="display: block; margin-bottom: 8px" [attr.data-test]="'an-draft-' + n.id">
            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 4px">
              <ts-tag tone="info">{{ kindLabel(n) | translate }}<ng-container *ngIf="n.occasion"> · {{ n.occasion }}</ng-container></ts-tag>
              <ts-tag *ngIf="n.itemName" tone="neutral" icon="ti ti-link">{{ n.itemName }}</ts-tag>
            </div>
            <strong class="ts-card-title">{{ n.title }}</strong>
            <p style="margin: 4px 0 8px">{{ n.body }}</p>
            <div class="ts-two" *ngIf="canEdit">
              <button type="button" class="btn btn-outline-danger" [disabled]="busy" (click)="reject(n)">{{ 'APP.anReject' | translate }}</button>
              <button type="button" class="btn btn-primary" [disabled]="busy" (click)="openApprove(n)" data-test="an-approve"><i class="ti ti-send"></i>{{ 'APP.anApprove' | translate }}</button>
            </div>
          </div>
        </ts-card>

        <ts-card [title]="'APP.anLog' | translate" icon="ti ti-history">
          <p class="ts-muted" *ngIf="!log.length">{{ 'APP.anNoLog' | translate }}</p>
          <div class="ts-list-card" *ngFor="let n of log" style="display: block; margin-bottom: 8px">
            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 4px">
              <ts-tag [tone]="statusTone(n)">{{ statusLabel(n) | translate }}</ts-tag>
              <ts-tag tone="neutral">{{ kindLabel(n) | translate }}<ng-container *ngIf="n.occasion"> · {{ n.occasion }}</ng-container></ts-tag>
              <ts-tag *ngIf="n.status === 2" tone="info" icon="ti ti-users">{{ 'APP.anReach' | translate: { n: n.reach } }}</ts-tag>
            </div>
            <strong class="ts-card-title" *ngIf="n.title">{{ n.title }}</strong>
            <p style="margin: 4px 0" *ngIf="n.body">{{ n.body }}</p>
            <small class="ts-muted">{{ (n.sentAt || n.createdAt) | date: 'd/M HH:mm' }}<ng-container *ngIf="n.status === 4 && n.note"> · {{ n.note }}</ng-container></small>
          </div>
        </ts-card>
      </ng-container>
    </div>

    <ts-sheet [open]="!!editing" (openChange)="editing = null" [title]="'APP.anApproveTitle' | translate">
      <ng-container *ngIf="editing">
        <p class="ts-muted ts-small">{{ 'APP.anApproveHint' | translate }}</p>
        <ts-field [label]="'APP.title' | translate" [required]="true" [(value)]="editTitle"></ts-field>
        <ts-field [label]="'APP.body' | translate" [lines]="3" [required]="true" [(value)]="editBody"></ts-field>
        <p class="ts-muted ts-small">{{ ('' + editTitle).length }} / 50 · {{ ('' + editBody).length }} / 140</p>
      </ng-container>
      <div sheet-foot><button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy" (click)="approve()"><i class="ti ti-send"></i>{{ 'APP.anSendNow' | translate }}</button></div>
    </ts-sheet>

    <ts-sheet [open]="occasionsOpen" (openChange)="occasionsOpen = false" [title]="'APP.anOccasions' | translate" [wide]="true">
      <p class="ts-muted ts-small">{{ 'APP.anOccasionsHint' | translate }}</p>
      <button type="button" class="btn btn-secondary ts-wide-btn" (click)="addOccasion()"><i class="ti ti-plus"></i>{{ 'APP.anAddOccasion' | translate }}</button>
      <div class="ts-list-card" *ngFor="let o of occasionDraft; let i = index" style="display: block; margin-top: 10px">
        <ts-field [label]="'APP.anOccasionName' | translate" [(value)]="o.name"></ts-field>
        <div class="ts-two">
          <ts-date-field [label]="'APP.date' | translate" [(value)]="o.dateValue"></ts-date-field>
          <ts-field [label]="'APP.anLeadDays' | translate" [number]="true" [value]="'' + o.leadDays" (valueChange)="o.leadDays = +$event"></ts-field>
        </div>
        <ts-switch-row [title]="'APP.anYearly' | translate" [subtitle]="'APP.anYearlyHint' | translate" [(value)]="o.yearly"></ts-switch-row>
        <ts-tag *ngIf="o.approx" tone="pending" icon="ti ti-alert-triangle">{{ 'APP.anApprox' | translate }}</ts-tag>
        <button type="button" class="btn btn-link text-danger" (click)="removeOccasion(i)"><i class="ti ti-trash"></i>{{ 'APP.delete' | translate }}</button>
      </div>
      <div sheet-foot class="ts-two">
        <button type="button" class="btn btn-outline-secondary" [disabled]="busy || s?.occasionsAreDefault" (click)="resetOccasions()">{{ 'APP.anResetOccasions' | translate }}</button>
        <button type="button" class="btn btn-primary" [disabled]="busy" (click)="saveOccasions()">{{ 'APP.save' | translate }}</button>
      </div>
    </ts-sheet>
  `
})
export class AutoNotificationsComponent implements OnInit {
  private readonly http = inject(StaffHttp);
  private readonly text = inject(StaffText);
  private readonly dialogs = inject(StaffDialogs);
  private readonly session = inject(StaffSession);

  s: AutoNotifySettings | null = null;
  drafts: AutoNotification[] = [];
  log: AutoNotification[] = [];
  loading = false;
  error: unknown = null;
  busy = false;
  generating = false;
  editing: AutoNotification | null = null;
  editTitle = '';
  editBody = '';
  occasionsOpen = false;
  occasionDraft: (AutoOccasion & { dateValue: Date | null })[] = [];

  get canEdit(): boolean {
    return this.session.can(P.notificationCreate);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.http.get<AutoNotifySettings>('/api/staff/auto-notifications/settings').subscribe({
      next: (s) => {
        this.s = s;
        this.loading = false;
        this.reloadList();
      },
      error: (e) => {
        this.error = e;
        this.loading = false;
      }
    });
  }

  reloadList(): void {
    this.http.get<AutoNotification[]>('/api/staff/auto-notifications', { take: 60 }).subscribe({
      next: (rows) => {
        this.drafts = rows.filter((r) => r.status === 1);
        this.log = rows.filter((r) => r.status !== 1);
      },
      error: (e) => this.text.showError(e)
    });
  }

  kindLabel(n: AutoNotification): string {
    return KIND_LABEL[n.kind] ?? 'APP.anKindOccasion';
  }

  statusLabel(n: AutoNotification): string {
    return ({ 2: 'APP.anSent', 3: 'APP.anRejected', 4: 'APP.anSkipped', 5: 'APP.anGoingOut' } as Record<number, string>)[n.status] ?? 'APP.anSent';
  }

  statusTone(n: AutoNotification): Tone {
    return n.status === 2 ? 'ok' : n.status === 4 ? 'pending' : 'neutral';
  }

  async save(extra: Partial<AutoNotifySettings> & { resetOccasions?: boolean } = {}): Promise<void> {
    if (!this.s || this.busy) return;
    const s = this.s;
    // turning on sending by itself is the one change worth a second look
    if (extra.occasions === undefined && !extra.resetOccasions && s.enabled && s.autoSend && !(await this.dialogs.confirm({
      title: this.text.tr('APP.anAutoSend'),
      message: this.text.tr('APP.anAutoSendQ', { n: s.maxPerWeek }),
      confirm: this.text.tr('APP.save')
    }))) return;
    this.busy = true;
    this.http.put<AutoNotifySettings>('/api/staff/auto-notifications/settings', {
      enabled: s.enabled, autoSend: s.autoSend, maxPerWeek: s.maxPerWeek, sendHour: s.sendHour, quietFrom: s.quietFrom, quietTo: s.quietTo, ...extra
    }).subscribe({
      next: (r) => {
        this.s = r;
        this.busy = false;
        this.text.showDone(this.text.tr(r.enabled && !r.hasKey ? 'APP.anSavedNoKey' : 'APP.anSaved'));
      },
      error: (e) => {
        this.busy = false;
        this.text.showError(e);
      }
    });
  }

  generate(): void {
    if (this.generating) return;
    this.generating = true;
    this.http.post<AutoNotification>('/api/staff/auto-notifications/generate').subscribe({
      next: () => {
        this.generating = false;
        this.text.showDone(this.text.tr('APP.anGenerated'));
        this.reloadList();
      },
      error: (e) => {
        this.generating = false;
        this.text.showError(e);
        this.reloadList();
      }
    });
  }

  openApprove(n: AutoNotification): void {
    this.editing = n;
    this.editTitle = n.title;
    this.editBody = n.body;
  }

  approve(): void {
    const n = this.editing;
    if (!n || this.busy) return;
    this.busy = true;
    this.http.post<AutoNotification>(`/api/staff/auto-notifications/${n.id}/approve`, { title: this.editTitle.trim(), body: this.editBody.trim() }).subscribe({
      next: () => {
        this.busy = false;
        this.editing = null;
        this.text.showDone(this.text.tr('APP.anSentNow'));
        this.reloadList();
      },
      error: (e) => {
        this.busy = false;
        this.text.showError(e);
      }
    });
  }

  async reject(n: AutoNotification): Promise<void> {
    if (this.busy) return;
    if (!(await this.dialogs.confirm({ title: this.text.tr('APP.anReject'), message: this.text.tr('APP.anRejectQ'), confirm: this.text.tr('APP.anReject'), danger: true }))) return;
    this.busy = true;
    this.http.post<AutoNotification>(`/api/staff/auto-notifications/${n.id}/reject`).subscribe({
      next: () => {
        this.busy = false;
        this.reloadList();
      },
      error: (e) => {
        this.busy = false;
        this.text.showError(e);
      }
    });
  }

  // ---- the occasions it writes about

  openOccasions(): void {
    if (!this.s) return;
    this.occasionDraft = this.s.occasions.map((o) => ({ ...o, dateValue: this.occasionDate(o) }));
    this.occasionsOpen = true;
  }

  /** A yearly occasion shows its next date. */
  private occasionDate(o: AutoOccasion): Date {
    const d = new Date(o.date);
    if (!o.yearly) return d;
    const now = new Date();
    const next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
    if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) next.setFullYear(next.getFullYear() + 1);
    return next;
  }

  addOccasion(): void {
    this.occasionDraft = [{ id: '', name: '', date: new Date(), yearly: false, approx: false, leadDays: 5, dateValue: new Date() }, ...this.occasionDraft];
  }

  removeOccasion(i: number): void {
    this.occasionDraft = this.occasionDraft.filter((_, k) => k !== i);
  }

  async saveOccasions(): Promise<void> {
    const rows = this.occasionDraft.filter((o) => o.name.trim());
    if (rows.some((o) => !o.dateValue)) return this.text.showError(this.text.tr('APP.fillRequired'));
    const pad = (n: number) => String(n).padStart(2, '0');
    const occasions = rows.map((o) => ({
      id: o.id, name: o.name.trim(), yearly: o.yearly, approx: o.approx, leadDays: o.leadDays,
      date: `${o.dateValue!.getFullYear()}-${pad(o.dateValue!.getMonth() + 1)}-${pad(o.dateValue!.getDate())}`
    }));
    await this.save({ occasions: occasions as any });
    this.occasionsOpen = false;
  }

  async resetOccasions(): Promise<void> {
    if (!(await this.dialogs.confirm({ title: this.text.tr('APP.anResetOccasions'), message: this.text.tr('APP.anResetOccasionsQ'), confirm: this.text.tr('APP.anResetOccasions'), danger: true }))) return;
    await this.save({ resetOccasions: true });
    this.occasionsOpen = false;
  }
}
