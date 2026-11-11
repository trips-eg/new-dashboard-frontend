import { Component, ElementRef, Injectable, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, Subscription, firstValueFrom, map } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { LISTS } from '../ui/lists';
import { SwitchRowComponent } from '../ui/controls';
import { SheetComponent } from '../ui/dialogs';
import { StaffHttp, mediaUrl } from '../core/staff-http';
import { ApiPage, asPage } from '../core/query';
import { P, StaffSession } from '../core/session';

// ---------------- API (backend: api/staff/support-chat, docs/mobile-api/21-support-chat.md) ----------------

export interface SupportItem {
  type: 'trip' | 'picnic' | 'religion' | string;
  id: number;
  name?: string | null;
  imageUrl?: string | null;
}

export interface SupportPerson {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  imageUrl?: string | null;
}

export interface SupportRow {
  id: number;
  status: 'open' | 'closed';
  customer: SupportPerson;
  assignedTo?: SupportPerson | null;
  lastMessagePreview?: string | null;
  lastMessageAt: string;
  lastMessageSender?: 'customer' | 'staff' | 'assistant' | 'system' | null;
  unreadCount: number;
  item?: SupportItem | null;
  /** 1.0.51: the AI assistant handed it to the team, and why. */
  needsHuman?: boolean;
  handoverReason?: string | null;
  createdAt?: string;
  closedAt?: string | null;
}

export interface SupportMessage {
  id: number;
  /** 1.0.51: 'assistant' is the AI assistant, 'system' a note ("سارة من فريق Trips معاك دلوقتي"). */
  sender: 'customer' | 'staff' | 'assistant' | 'system';
  senderName?: string | null;
  text?: string | null;
  imageUrl?: string | null;
  item?: SupportItem | null;
  createdAt: string;
  readAt?: string | null;
}

export interface SupportMessagesPage {
  conversationId: number | null;
  status: 'open' | 'closed' | null;
  messages: SupportMessage[];
  hasOlder: boolean;
}

export interface SupportCounts {
  unread: number;
  open: number;
  mine: number;
  needsHuman?: number;
}

/** 1.0.51: the chat's AI assistant. */
export interface SupportAiSettings {
  enabled: boolean;
  teamHours: string;
  /** How the app works, in the admin's words: the assistant answers "how do I…" questions from it. */
  guide: string;
  /** Read only: Trips' default guide (not changed yet). */
  guideIsDefault: boolean;
  /** Read only: the Anthropic key is on the server. */
  hasKey: boolean;
}

export type SupportTab = 'open' | 'human' | 'mine' | 'unassigned' | 'closed';

@Injectable({ providedIn: 'root' })
export class SupportChatApi {
  private readonly http = inject(StaffHttp);
  private readonly base = '/api/staff/support-chat';

  inbox(tab: SupportTab, q: string, pageIndex: number, pageSize = 20): Observable<ApiPage<SupportRow>> {
    const status = tab === 'closed' ? 'closed' : 'open';
    const assigned = tab === 'mine' || tab === 'unassigned' || tab === 'human' ? tab : null;
    return this.http.get<any>(`${this.base}/conversations`, { status, assigned, q, pageIndex, pageSize }).pipe(map((d) => asPage<SupportRow>(d)));
  }

  counts(): Observable<SupportCounts> {
    return this.http.get<SupportCounts>(`${this.base}/counts`);
  }

  conversation(id: number): Observable<SupportRow> {
    return this.http.get<SupportRow>(`${this.base}/conversations/${id}`);
  }

  messages(id: number, o: { beforeId?: number; afterId?: number; pageSize?: number } = {}): Observable<SupportMessagesPage> {
    return this.http.get<SupportMessagesPage>(`${this.base}/conversations/${id}/messages`, { pageSize: 30, ...o });
  }

  markRead(id: number): Observable<number> {
    return this.http.post<number>(`${this.base}/conversations/${id}/read`);
  }

  reply(id: number, text: string | null, file: File | null): Observable<SupportMessage> {
    const form = new FormData();
    if (text) form.append('text', text);
    if (file) form.append('file', file, file.name);
    return this.http.form<SupportMessage>('POST', `${this.base}/conversations/${id}/messages`, form);
  }

  close(id: number): Observable<SupportRow> {
    return this.http.post<SupportRow>(`${this.base}/conversations/${id}/close`);
  }

  assign(id: number, userId: number | null): Observable<SupportRow> {
    return this.http.post<SupportRow>(`${this.base}/conversations/${id}/assign`, { userId });
  }

  agents(): Observable<SupportPerson[]> {
    return this.http.get<SupportPerson[]>(`${this.base}/agents`);
  }

  aiSettings(): Observable<SupportAiSettings> {
    return this.http.get<SupportAiSettings>(`${this.base}/ai-settings`);
  }

  /** guide: undefined keeps the saved one, '' goes back to Trips' default. */
  saveAiSettings(s: { enabled: boolean; teamHours: string; guide?: string }): Observable<SupportAiSettings> {
    return this.http.put<SupportAiSettings>(`${this.base}/ai-settings`, s);
  }

  /** A suggested reply the agent can edit and send. */
  draft(id: number): Observable<string> {
    return this.http.post<string>(`${this.base}/conversations/${id}/ai-draft`);
  }
}

/** The product page of an item card: trip → trips, picnic → outings, religion → hajj. */
export function supportItemLink(item: SupportItem | null | undefined): any[] | null {
  if (!item) return null;
  const key = { trip: 'trips', picnic: 'outings', religion: 'hajj' }[item.type];
  return key ? ['/a/products', key, item.id] : null;
}

/** The label key of an item type. */
export function supportItemType(type: string | null | undefined): string {
  return type === 'picnic' ? 'SUPPORT.itemOuting' : type === 'religion' ? 'SUPPORT.itemUmrah' : 'SUPPORT.itemTrip';
}

// ---------------- the screen ----------------

/** How often the screen asks for news while it is visible. */
export const SUPPORT_POLL = { inboxMs: 15_000, messagesMs: 5_000 };

/**
 * الدعم / الشات: the inbox (unread first) and the open conversation side by side; on a phone width one at a time.
 * The backend has no socket: the open conversation polls for messages after the last one, the inbox every 15 s.
 * Permissions.SupportChat.View reads; .Reply answers, assigns and closes.
 */
@Component({
  selector: 'ts-support-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, ...KIT, ...LISTS, SwitchRowComponent, SheetComponent],
  styleUrls: ['./support-chat.component.scss'],
  template: `
    <div class="ts-screen sc-screen" [class.sc-has-open]="openId">
      <ts-appbar [title]="'SUPPORT.title' | translate" [subtitle]="'SUPPORT.subtitle' | translate" [back]="false"></ts-appbar>

      <div class="sc-layout">
        <!-- inbox -->
        <section class="sc-inbox" [attr.aria-label]="'SUPPORT.inbox' | translate">
          <div *ngIf="ai" class="sc-ai" data-test="sc-ai">
            <ts-switch-row
              [title]="'SUPPORT.aiTitle' | translate"
              [subtitle]="(ai.hasKey ? 'SUPPORT.aiSub' : 'SUPPORT.aiNoKey') | translate"
              [value]="ai.enabled"
              [disabled]="!canReply || aiSaving"
              (valueChange)="saveAi($event)"
            ></ts-switch-row>
            <label *ngIf="canReply" class="sc-ai__hours">
              <span>{{ 'SUPPORT.teamHours' | translate }}</span>
              <input type="text" maxlength="60" [ngModel]="ai.teamHours" (change)="saveAi(ai.enabled, $any($event.target).value)" />
            </label>
            <button *ngIf="canReply" type="button" class="sc-ai__guide" (click)="openGuide()" data-test="sc-ai-guide">
              <i class="ti ti-book-2"></i>
              <span>{{ 'SUPPORT.aiGuide' | translate }}</span>
              <small>{{ (ai.guideIsDefault ? 'SUPPORT.aiGuideDefault' : 'SUPPORT.aiGuideEdited') | translate }}</small>
            </button>
          </div>
          <ts-segmented [items]="tabs" [selected]="tab" (changed)="setTab($any($event))"></ts-segmented>
          <ts-search [hint]="'SUPPORT.searchHint' | translate" [value]="q" (changed)="search($event)"></ts-search>

          <ts-loading *ngIf="inboxLoading && !rows.length"></ts-loading>
          <ts-error *ngIf="inboxError && !rows.length" [error]="inboxError" (retry)="reloadInbox()"></ts-error>
          <ts-empty *ngIf="!inboxLoading && !inboxError && !rows.length" icon="ti ti-messages" [message]="'SUPPORT.empty' | translate"></ts-empty>

          <ul class="sc-rows">
            <li *ngFor="let r of rows; trackBy: byId">
              <button type="button" class="sc-row" [class.is-selected]="r.id === openId" [class.is-unread]="r.unreadCount > 0" (click)="open(r.id)" [attr.data-test]="'sc-row-' + r.id">
                <ts-avatar [name]="r.customer.name" [size]="40"></ts-avatar>
                <span class="sc-row__body">
                  <span class="sc-row__top">
                    <strong class="sc-row__name">{{ r.customer.name || r.customer.phone }}</strong>
                    <time class="sc-row__time">{{ r.lastMessageAt | ts: 'datetime' }}</time>
                  </span>
                  <span class="sc-row__preview">
                    <span *ngIf="r.lastMessageSender === 'staff'" class="sc-row__you">{{ 'SUPPORT.you' | translate }}: </span>
                    <span *ngIf="r.lastMessageSender === 'assistant'" class="sc-row__ai">✨ {{ 'SUPPORT.assistant' | translate }}: </span>{{ r.lastMessagePreview || '—' }}
                  </span>
                  <span class="sc-row__meta">
                    <ts-tag *ngIf="r.needsHuman" tone="danger" icon="ti ti-user-exclamation">{{ 'SUPPORT.needsHuman' | translate }}{{ r.handoverReason ? ' · ' + r.handoverReason : '' }}</ts-tag>
                    <ts-tag *ngIf="r.item" tone="info" icon="ti ti-link">{{ supportItemType(r.item.type) | translate }}: {{ r.item.name || '#' + r.item.id }}</ts-tag>
                    <ts-tag *ngIf="r.assignedTo" tone="neutral" icon="ti ti-user">{{ r.assignedTo.name }}</ts-tag>
                  </span>
                </span>
                <span *ngIf="r.unreadCount > 0" class="sc-row__badge" [attr.aria-label]="'SUPPORT.unreadN' | translate: { n: r.unreadCount }">{{ r.unreadCount }}</span>
              </button>
            </li>
          </ul>
          <button *ngIf="hasMore" type="button" class="btn btn-secondary sc-more" [disabled]="inboxLoading" (click)="loadMore()">{{ 'SUPPORT.loadMore' | translate }}</button>
        </section>

        <!-- conversation -->
        <section class="sc-chat" *ngIf="openId; else pickOne" [attr.aria-label]="'SUPPORT.conversation' | translate">
          <header class="sc-chat__head" *ngIf="current as c">
            <button type="button" class="sc-back" (click)="closePane()" [attr.aria-label]="'APP.back' | translate"><i class="ti ti-arrow-right" aria-hidden="true"></i></button>
            <ts-avatar [name]="c.customer.name" [size]="44"></ts-avatar>
            <div class="sc-chat__who">
              <strong>{{ c.customer.name }}</strong>
              <span dir="ltr">{{ c.customer.phone }}</span>
              <span *ngIf="c.customer.email" dir="ltr">{{ c.customer.email }}</span>
            </div>
            <div class="sc-chat__actions">
              <ts-pill [tone]="c.status === 'closed' ? 'neutral' : 'ok'">{{ (c.status === 'closed' ? 'SUPPORT.closed' : 'SUPPORT.open') | translate }}</ts-pill>
              <label *ngIf="canReply" class="sc-assign">
                <span>{{ 'SUPPORT.assignedTo' | translate }}</span>
                <select [ngModel]="c.assignedTo?.id ?? null" (ngModelChange)="assign($event)" data-test="sc-assign">
                  <option [ngValue]="null">{{ 'SUPPORT.nobody' | translate }}</option>
                  <option *ngFor="let a of agents" [ngValue]="a.id">{{ a.name }}</option>
                </select>
              </label>
              <button *ngIf="canReply && c.status !== 'closed'" type="button" class="btn btn-secondary" [disabled]="busy" (click)="close()" data-test="sc-close">
                <i class="ti ti-check" aria-hidden="true"></i>{{ 'SUPPORT.close' | translate }}
              </button>
            </div>
          </header>

          <div class="sc-messages" #scroller (scroll)="onScroll()">
            <button *ngIf="hasOlder" type="button" class="btn btn-link sc-older" [disabled]="olderLoading" (click)="loadOlder()">{{ 'SUPPORT.older' | translate }}</button>
            <ts-loading *ngIf="messagesLoading && !messages.length"></ts-loading>
            <ts-error *ngIf="messagesError && !messages.length" [error]="messagesError" (retry)="open(openId!)"></ts-error>
            <ng-container *ngFor="let m of messages; trackBy: byId">
            <p *ngIf="m.sender === 'system'" class="sc-note" [attr.data-test]="'sc-msg-' + m.id">{{ m.text }}</p>
            <div *ngIf="m.sender !== 'system'" class="sc-msg" [class.sc-msg--staff]="m.sender === 'staff' || m.sender === 'assistant'" [class.sc-msg--ai]="m.sender === 'assistant'" [attr.data-test]="'sc-msg-' + m.id">
              <div class="sc-bubble">
                <small *ngIf="m.sender === 'assistant'" class="sc-ai-who">✨ {{ 'SUPPORT.assistant' | translate }}</small>
                <a *ngIf="m.item as it" class="sc-item" [routerLink]="supportItemLink(it)">
                  <img *ngIf="mediaUrl(it.imageUrl) as src" [src]="src" alt="" loading="lazy" />
                  <span>
                    <small>{{ supportItemType(it.type) | translate }}</small>
                    <strong>{{ it.name || '#' + it.id }}</strong>
                  </span>
                </a>
                <a *ngIf="mediaUrl(m.imageUrl) as src" class="sc-photo" [href]="src" target="_blank" rel="noopener">
                  <img [src]="src" [alt]="'SUPPORT.photo' | translate" loading="lazy" />
                </a>
                <p *ngIf="m.text" class="sc-text">{{ m.text }}</p>
                <span class="sc-meta">
                  <span *ngIf="m.sender === 'staff' && m.senderName">{{ m.senderName }} · </span>{{ m.createdAt | ts: 'time' }}
                  <i *ngIf="m.sender === 'staff'" class="ti" [class.ti-checks]="m.readAt" [class.ti-check]="!m.readAt" [title]="(m.readAt ? 'SUPPORT.seen' : 'SUPPORT.sent') | translate"></i>
                </span>
              </div>
            </div>
            </ng-container>
          </div>

          <form *ngIf="canReply; else readOnly" class="sc-composer" (ngSubmit)="send()">
            <div *ngIf="file" class="sc-file">
              <i class="ti ti-photo" aria-hidden="true"></i><span>{{ file.name }}</span>
              <button type="button" class="btn btn-link" (click)="file = null" [attr.aria-label]="'SUPPORT.removePhoto' | translate"><i class="ti ti-x" aria-hidden="true"></i></button>
            </div>
            <div class="sc-composer__row">
              <label class="sc-attach" [title]="'SUPPORT.attach' | translate">
                <i class="ti ti-paperclip" aria-hidden="true"></i>
                <input type="file" accept="image/jpeg,image/png,image/webp" (change)="pick($event)" [attr.aria-label]="'SUPPORT.attach' | translate" />
              </label>
              <textarea
                name="text"
                rows="2"
                [(ngModel)]="text"
                [placeholder]="'SUPPORT.replyHint' | translate"
                [attr.aria-label]="'SUPPORT.replyHint' | translate"
                maxlength="2000"
                (keydown.enter)="enter($any($event))"
                data-test="sc-text"
              ></textarea>
              <button *ngIf="ai?.hasKey" type="button" class="btn btn-secondary sc-draft" [disabled]="busy || drafting" (click)="suggest()" data-test="sc-draft" [title]="'SUPPORT.draftHint' | translate">
                <i class="ti ti-sparkles" aria-hidden="true"></i>{{ (drafting ? 'SUPPORT.drafting' : 'SUPPORT.draft') | translate }}
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="busy || (!text.trim() && !file)" data-test="sc-send">
                <i class="ti ti-send" aria-hidden="true"></i>{{ 'SUPPORT.send' | translate }}
              </button>
            </div>
          </form>
          <ng-template #readOnly><p class="sc-readonly">{{ 'SUPPORT.readOnly' | translate }}</p></ng-template>
        </section>
        <ng-template #pickOne>
          <section class="sc-chat sc-chat--empty"><ts-empty icon="ti ti-message-circle" [message]="'SUPPORT.pick' | translate"></ts-empty></section>
        </ng-template>
      </div>
    </div>
    <ts-sheet [open]="guideOpen" (openChange)="guideOpen = false" [title]="'SUPPORT.aiGuideTitle' | translate" [wide]="true">
      <p class="ts-muted sc-guide__hint">{{ 'SUPPORT.aiGuideHint' | translate }}</p>
      <textarea class="sc-guide__text" dir="rtl" rows="18" [maxLength]="guideMax" [(ngModel)]="guideText" data-test="sc-ai-guide-text"></textarea>
      <small class="ts-muted">{{ guideText.length }} / {{ guideMax }}</small>
      <div sheet-foot class="ts-two">
        <button type="button" class="btn btn-outline-secondary" [disabled]="aiSaving || ai?.guideIsDefault" (click)="saveGuide('')">{{ 'SUPPORT.aiGuideReset' | translate }}</button>
        <button type="button" class="btn btn-primary" [disabled]="aiSaving" (click)="saveGuide(guideText)">{{ 'APP.save' | translate }}</button>
      </div>
    </ts-sheet>
  `
})
export class SupportChatComponent implements OnInit, OnDestroy {
  private readonly api = inject(SupportChatApi);
  private readonly session = inject(StaffSession);
  private readonly text$ = inject(StaffText);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @ViewChild('scroller') scroller?: ElementRef<HTMLElement>;

  readonly mediaUrl = mediaUrl;
  readonly supportItemLink = supportItemLink;
  readonly supportItemType = supportItemType;

  tab: SupportTab = 'open';
  q = '';
  rows: SupportRow[] = [];
  pageIndex = 1;
  hasMore = false;
  counts: SupportCounts | null = null;
  inboxLoading = false;
  inboxError: unknown = null;

  openId: number | null = null;
  current: SupportRow | null = null;
  messages: SupportMessage[] = [];
  hasOlder = false;
  messagesLoading = false;
  olderLoading = false;
  messagesError: unknown = null;
  agents: { id: number; name: string }[] = [];

  text = '';
  file: File | null = null;
  busy = false;

  /** 1.0.51: the AI assistant's settings; null until loaded (or not allowed). */
  ai: SupportAiSettings | null = null;
  aiSaving = false;
  drafting = false;
  guideOpen = false;
  guideText = '';
  readonly guideMax = 8000;

  private atBottom = true;
  private searchTimer: any;
  private timers: any[] = [];
  private subs: Subscription[] = [];
  private polling = false;

  get canReply(): boolean {
    return this.session.can(P.supportChatReply);
  }

  get tabs() {
    const c = this.counts;
    return [
      { key: 'open', label: this.text$.tr('SUPPORT.tabOpen'), count: c?.open ?? null, alert: !!c?.unread },
      { key: 'human', label: this.text$.tr('SUPPORT.tabHuman'), count: c?.needsHuman ?? null, alert: !!c?.needsHuman },
      { key: 'mine', label: this.text$.tr('SUPPORT.tabMine'), count: c?.mine ?? null },
      { key: 'unassigned', label: this.text$.tr('SUPPORT.tabUnassigned') },
      { key: 'closed', label: this.text$.tr('SUPPORT.tabClosed') }
    ];
  }

  ngOnInit(): void {
    this.subs.push(
      this.route.queryParamMap.subscribe((p) => {
        const id = Number(p.get('c'));
        if (id > 0 && id !== this.openId) this.load(id);
        if (!(id > 0)) this.reset();
      })
    );
    this.reloadInbox();
    if (this.canReply) this.api.agents().subscribe({ next: (a) => (this.agents = a ?? []), error: () => (this.agents = []) });
    this.api.aiSettings().subscribe({ next: (s) => (this.ai = s), error: () => (this.ai = null) });
    this.timers.push(setInterval(() => this.visible() && this.refreshInbox(), SUPPORT_POLL.inboxMs));
    this.timers.push(setInterval(() => this.visible() && this.poll(), SUPPORT_POLL.messagesMs));
  }

  ngOnDestroy(): void {
    this.timers.forEach((t) => clearInterval(t));
    this.subs.forEach((s) => s.unsubscribe());
    clearTimeout(this.searchTimer);
  }

  byId(_: number, x: { id: number }): number {
    return x.id;
  }

  private visible(): boolean {
    return typeof document === 'undefined' || document.visibilityState !== 'hidden';
  }

  // ---------------- inbox ----------------

  setTab(tab: SupportTab): void {
    if (tab === this.tab) return;
    this.tab = tab;
    this.reloadInbox();
  }

  search(q: string): void {
    this.q = q;
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.reloadInbox(), 350);
  }

  reloadInbox(): void {
    this.pageIndex = 1;
    this.fetchInbox(true);
  }

  loadMore(): void {
    this.pageIndex++;
    this.fetchInbox(false);
  }

  /** The polling refresh: the pages already shown, in place, without a spinner. */
  private refreshInbox(): void {
    this.api.counts().subscribe({ next: (c) => (this.counts = c), error: () => {} });
    this.api.inbox(this.tab, this.q, 1, Math.max(20, this.rows.length)).subscribe({
      next: (page) => {
        this.rows = page.data;
        this.hasMore = page.hasNextPage;
      },
      error: () => {}
    });
  }

  private fetchInbox(replace: boolean): void {
    this.inboxLoading = true;
    this.inboxError = null;
    this.api.counts().subscribe({ next: (c) => (this.counts = c), error: () => {} });
    this.api.inbox(this.tab, this.q, this.pageIndex).subscribe({
      next: (page) => {
        const seen = new Set(this.rows.map((r) => r.id));
        this.rows = replace ? page.data : [...this.rows, ...page.data.filter((r) => !seen.has(r.id))];
        this.hasMore = page.hasNextPage;
        this.inboxLoading = false;
      },
      error: (e) => {
        this.inboxError = e;
        this.inboxLoading = false;
      }
    });
  }

  // ---------------- conversation ----------------

  open(id: number): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { c: id } });
  }

  closePane(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  private reset(): void {
    this.openId = null;
    this.current = null;
    this.messages = [];
    this.hasOlder = false;
    this.text = '';
    this.file = null;
  }

  private load(id: number): void {
    this.reset();
    this.openId = id;
    this.messagesLoading = true;
    this.messagesError = null;
    this.api.conversation(id).subscribe({ next: (c) => this.openId === id && (this.current = c), error: (e) => (this.messagesError = e) });
    this.api.messages(id).subscribe({
      next: (page) => {
        if (this.openId !== id) return;
        this.messages = page.messages;
        this.hasOlder = page.hasOlder;
        this.messagesLoading = false;
        this.scrollToEnd();
        this.read(id);
      },
      error: (e) => {
        this.messagesError = e;
        this.messagesLoading = false;
      }
    });
  }

  /** Staff saw the customer's messages: the row's badge goes. */
  private read(id: number): void {
    const row = this.rows.find((r) => r.id === id);
    const unread = row?.unreadCount ?? this.current?.unreadCount ?? 0;
    if (!unread && !this.messages.some((m) => m.sender === 'customer' && !m.readAt)) return;
    this.api.markRead(id).subscribe({
      next: () => {
        if (row) row.unreadCount = 0;
        if (this.current) this.current.unreadCount = 0;
        if (this.counts && unread) this.counts = { ...this.counts, unread: Math.max(0, this.counts.unread - 1) };
      },
      error: () => {}
    });
  }

  /** New messages after the last one shown, and the read ticks of ours. */
  private async poll(): Promise<void> {
    const id = this.openId;
    if (!id || this.polling || this.messagesLoading) return;
    this.polling = true;
    try {
      const last = this.messages[this.messages.length - 1]?.id;
      const page = await firstValueFrom(this.api.messages(id, last ? { afterId: last, pageSize: 50 } : {}));
      if (this.openId !== id) return;
      const known = new Set(this.messages.map((m) => m.id));
      const fresh = page.messages.filter((m) => !known.has(m.id));
      if (fresh.length) {
        this.messages = [...this.messages, ...fresh];
        if (this.atBottom) this.scrollToEnd();
        if (fresh.some((m) => m.sender === 'customer')) {
          this.api.markRead(id).subscribe({ error: () => {} });
        }
      }
      // The customer's read state of our messages, and the conversation's status
      const c = await firstValueFrom(this.api.conversation(id));
      if (this.openId === id) this.current = c;
      if (this.messages.some((m) => m.sender === 'staff' && !m.readAt)) {
        const tail = await firstValueFrom(this.api.messages(id, { pageSize: Math.min(50, this.messages.length) }));
        const readAt = new Map(tail.messages.map((m) => [m.id, m.readAt]));
        this.messages = this.messages.map((m) => (readAt.get(m.id) && !m.readAt ? { ...m, readAt: readAt.get(m.id) } : m));
      }
    } catch {
      // the next tick tries again
    } finally {
      this.polling = false;
    }
  }

  loadOlder(): void {
    const id = this.openId;
    const first = this.messages[0]?.id;
    if (!id || !first) return;
    this.olderLoading = true;
    const el = this.scroller?.nativeElement;
    const before = el ? el.scrollHeight - el.scrollTop : 0;
    this.api.messages(id, { beforeId: first }).subscribe({
      next: (page) => {
        this.messages = [...page.messages, ...this.messages];
        this.hasOlder = page.hasOlder;
        this.olderLoading = false;
        // keep the message that was at the top in place
        setTimeout(() => el && (el.scrollTop = el.scrollHeight - before));
      },
      error: (e) => {
        this.olderLoading = false;
        this.text$.showError(e);
      }
    });
  }

  onScroll(): void {
    const el = this.scroller?.nativeElement;
    if (el) this.atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  private scrollToEnd(): void {
    setTimeout(() => {
      const el = this.scroller?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
      this.atBottom = true;
    });
  }

  // ---------------- reply, assign, close ----------------

  pick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    input.value = '';
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      this.text$.showError(this.text$.tr('SUPPORT.photoTooBig'));
      return;
    }
    this.file = f;
  }

  /** Enter sends, Shift+Enter is a new line. */
  enter(event: KeyboardEvent): void {
    if (event.shiftKey || event.isComposing) return;
    event.preventDefault();
    this.send();
  }

  send(): void {
    const id = this.openId;
    const text = this.text.trim();
    if (!id || this.busy || (!text && !this.file)) return;
    this.busy = true;
    this.api.reply(id, text || null, this.file).subscribe({
      next: (m) => {
        if (this.openId === id && !this.messages.some((x) => x.id === m.id)) this.messages = [...this.messages, m];
        this.text = '';
        this.file = null;
        this.busy = false;
        this.scrollToEnd();
        this.api.conversation(id).subscribe({ next: (c) => (this.current = c), error: () => {} });
        this.refreshInbox();
      },
      error: (e) => {
        this.busy = false;
        this.text$.showError(e);
      }
    });
  }

  /** Switches the AI assistant on or off, or changes the team's hours. */
  saveAi(enabled: boolean, teamHours?: string): void {
    if (!this.ai || this.aiSaving) return;
    const hours = (teamHours ?? this.ai.teamHours).trim();
    if (!hours) return;
    this.aiSaving = true;
    this.api.saveAiSettings({ enabled, teamHours: hours }).subscribe({
      next: (s) => {
        this.ai = s;
        this.aiSaving = false;
        this.text$.showDone(this.text$.tr(s.enabled && !s.hasKey ? 'SUPPORT.aiSavedNoKey' : 'SUPPORT.aiSaved'));
      },
      error: (e) => {
        this.aiSaving = false;
        this.text$.showError(e);
      }
    });
  }

  /** The app guide the assistant answers "how do I…" questions from. */
  openGuide(): void {
    if (!this.ai) return;
    this.guideText = this.ai.guide ?? '';
    this.guideOpen = true;
  }

  /** Saves the guide; '' goes back to Trips' default one. */
  saveGuide(guide: string): void {
    if (!this.ai || this.aiSaving) return;
    this.aiSaving = true;
    this.api.saveAiSettings({ enabled: this.ai.enabled, teamHours: this.ai.teamHours, guide }).subscribe({
      next: (s) => {
        this.ai = s;
        this.aiSaving = false;
        this.guideText = s.guide;
        if (guide !== '') this.guideOpen = false;
        this.text$.showDone(this.text$.tr('SUPPORT.aiGuideSaved'));
      },
      error: (e) => {
        this.aiSaving = false;
        this.text$.showError(e);
      }
    });
  }

  /** Fills the reply box with the assistant's suggestion; the agent reads it and sends it (or not). */
  suggest(): void {
    const id = this.openId;
    if (!id || this.drafting) return;
    this.drafting = true;
    this.api.draft(id).subscribe({
      next: (d) => {
        if (this.openId === id && d) this.text = d;
        this.drafting = false;
      },
      error: (e) => {
        this.drafting = false;
        this.text$.showError(e);
      }
    });
  }

  assign(userId: number | null): void {
    const id = this.openId;
    if (!id) return;
    this.busy = true;
    this.api.assign(id, userId).subscribe({
      next: (c) => {
        this.current = c;
        this.busy = false;
        this.text$.showDone(this.text$.tr('SUPPORT.assigned'));
        this.refreshInbox();
      },
      error: (e) => {
        this.busy = false;
        this.text$.showError(e);
      }
    });
  }

  close(): void {
    const id = this.openId;
    if (!id) return;
    this.busy = true;
    this.api.close(id).subscribe({
      next: (c) => {
        this.current = c;
        this.busy = false;
        this.text$.showDone(this.text$.tr('SUPPORT.closedDone'));
        this.refreshInbox();
      },
      error: (e) => {
        this.busy = false;
        this.text$.showError(e);
      }
    });
  }
}
