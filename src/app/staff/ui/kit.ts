import { ChangeDetectionStrategy, Component, EventEmitter, Injectable, Input, Output, Pipe, PipeTransform, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ApiError } from '../core/staff-http';
import { Tone } from '../core/enums';
import { fmtCompact, fmtDate, fmtDateTime, fmtDay, fmtMoney2, fmtNum, fmtPct, fmtShortDate, fmtTime, initials } from '../core/format';

// ---------------- text helpers ----------------

/** errorText of the app: the server's message, or a sentence for network, timeout, 403, 401, 404. */
@Injectable({ providedIn: 'root' })
export class StaffText {
  private readonly t = inject(TranslateService);
  private readonly toast = inject(ToastrService);

  get arabic(): boolean {
    return (this.t.currentLang ?? 'ar') !== 'en';
  }

  tr(key: string, params?: Record<string, unknown>): string {
    return this.t.instant(key, params);
  }

  /** What went wrong, then the details the team needs to follow it up: status, error code, the API path, the server's words. */
  error(e: unknown): string {
    if (typeof e === 'string') return e;
    if (e instanceof ApiError) {
      const message = this.errorMessage(e);
      const details = [
        e.status ? `HTTP ${e.status}` : null,
        e.code && e.code !== 'UNEXPECTED' ? e.code : null,
        e.path,
        e.detail && e.detail !== message ? e.detail : null
      ].filter(Boolean);
      return details.length ? `${message}\n${details.join(' · ')}` : message;
    }
    if (e instanceof Error && e.message) return `${this.tr('APP.errUnexpected')}\n${e.message}`;
    return this.tr('APP.errUnexpected');
  }

  private errorMessage(e: ApiError): string {
    if (e.message && e.message.trim()) return e.message;
    if (e.code === 'NETWORK') return this.tr('APP.errNetwork');
    if (e.code === 'TIMEOUT') return this.tr('APP.errTimeout');
    if (e.code === 'FORBIDDEN_SCOPE' || e.status === 403) return this.tr('APP.errForbidden');
    if (e.status === 401) return this.tr('APP.errSessionEnded');
    if (e.status === 404) return this.tr('APP.errNotOnServer', { path: e.path ?? '' });
    if (e.status === 504 || e.status === 502) return this.tr('APP.errGatewayTimeout');
    if (e.status && e.status >= 500) return this.tr('APP.errServer');
    return this.tr('APP.errUnexpected');
  }

  showError(e: unknown): void {
    this.toast.error(this.error(e));
  }

  showDone(message?: string): void {
    this.toast.success(message ?? this.tr('APP.saved'));
  }
}

/** Formats as pipes: n | ts: 'num' | 'money2' | 'compact' | 'pct' | 'signed' | 'day' | 'date' | 'short' | 'time' | 'datetime'. */
@Pipe({ name: 'ts', standalone: true, pure: false })
export class TsFormatPipe implements PipeTransform {
  private readonly text = inject(StaffText);
  transform(v: any, mode: string = 'num'): string {
    const ar = this.text.arabic;
    switch (mode) {
      case 'money2':
        return fmtMoney2(v);
      case 'compact':
        return fmtCompact(v);
      case 'pct':
        return fmtPct(v);
      case 'signed':
        return fmtPct(v, true);
      case 'day':
        return fmtDay(v, ar);
      case 'date':
        return fmtDate(v, ar);
      case 'short':
        return fmtShortDate(v);
      case 'time':
        return fmtTime(v, ar);
      case 'datetime':
        return fmtDateTime(v, ar);
      case 'initials':
        return initials(v);
      default:
        return fmtNum(v);
    }
  }
}

/** labelAr / labelEn by the screen's language. */
@Pipe({ name: 'arEn', standalone: true, pure: false })
export class ArEnPipe implements PipeTransform {
  private readonly text = inject(StaffText);
  transform(o: any, ar = 'labelAr', en = 'labelEn'): string {
    if (!o) return '';
    return this.text.arabic || !o[en] ? (o[ar] ?? '') : o[en];
  }
}

@Pipe({ name: 'errorText', standalone: true, pure: false })
export class ErrorTextPipe implements PipeTransform {
  private readonly text = inject(StaffText);
  transform(e: unknown): string {
    return this.text.error(e);
  }
}

// ---------------- pills and chips ----------------

/** StatusPill: the rounded status badge. */
@Component({
  selector: 'ts-pill',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="ts-pill ts-tone-{{ tone }}"><ng-content></ng-content></span>`
})
export class PillComponent {
  @Input() tone: Tone = 'neutral';
}

/** TagChip: a flat tinted label with an icon. */
@Component({
  selector: 'ts-tag',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="ts-tag ts-tone-{{ tone }}"><i *ngIf="icon" [class]="icon" aria-hidden="true"></i><span><ng-content></ng-content></span></span>`
})
export class TagComponent {
  @Input() tone: Tone = 'neutral';
  @Input() icon?: string;
}

/** ModuleDot: a dot in a module's colour followed by its name. */
@Component({
  selector: 'ts-dot',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="ts-dot"><i [style.background]="color"></i><span><ng-content></ng-content></span></span>`
})
export class DotComponent {
  @Input() color = 'var(--ts-navy)';
}

/** AvatarInitials. */
@Component({
  selector: 'ts-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="ts-avatar" [style.width.px]="size" [style.height.px]="size" [style.font-size.px]="size * 0.38" [style.background]="bg" [style.color]="fg">{{ letter }}</span>`
})
export class AvatarComponent {
  @Input() name: string | null | undefined = '';
  @Input() size = 40;
  @Input() bg = 'var(--ts-avatar-bg)';
  @Input() fg = 'var(--ts-avatar-ink)';
  get letter(): string {
    return initials(this.name);
  }
}

/** IconTile: an icon on a tinted square. */
@Component({
  selector: 'ts-icon-tile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="ts-icon-tile" [style.width.px]="size" [style.height.px]="size" [style.background]="bg" [style.color]="color"><i [class]="icon" [style.font-size.px]="size * 0.5" aria-hidden="true"></i></span>`
})
export class IconTileComponent {
  @Input() icon = 'ti ti-file';
  @Input() size = 44;
  @Input() color = 'var(--ts-navy)';
  @Input() bg = 'var(--ts-selected)';
}

// ---------------- screen chrome ----------------

/** TripsAppBar: the title (and subtitle) of a screen, a back button, and up to a few actions. */
@Component({
  selector: 'ts-appbar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="ts-appbar" [class.ts-appbar--navy]="navy">
      <button *ngIf="back" type="button" class="ts-appbar__back" (click)="goBack()" [attr.aria-label]="'APP.back' | translate">
        <i class="ti ti-arrow-right" aria-hidden="true"></i>
      </button>
      <div class="ts-appbar__title">
        <h1>{{ title }}</h1>
        <p *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="ts-appbar__actions"><ng-content></ng-content></div>
    </header>
  `
})
export class AppBarComponent {
  private readonly location = inject(Location);
  @Input() title = '';
  @Input() subtitle?: string | null;
  @Input() back = true;
  @Input() navy = false;
  goBack(): void {
    this.location.back();
  }
}

/** SectionCard + SectionHeader. */
@Component({
  selector: 'ts-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="ts-section" [class.ts-section--flush]="flush">
      <div class="ts-section__head" *ngIf="title">
        <span class="ts-section__chip" *ngIf="icon" aria-hidden="true" [style.background]="iconBg" [style.color]="iconColor"><i [class]="icon"></i></span>
        <div class="ts-section__title">
          <h2>{{ title }}</h2>
          <p *ngIf="subtitle">{{ subtitle }}</p>
        </div>
        <ng-content select="[card-action]"></ng-content>
      </div>
      <ng-content></ng-content>
    </section>
  `
})
export class CardComponent {
  @Input() title?: string | null;
  @Input() subtitle?: string | null;
  @Input() icon?: string;
  @Input() iconColor = 'var(--ts-navy)';
  @Input() iconBg = 'var(--ts-selected)';
  @Input() flush = false;
}

/** InfoRow: a label and a value on one line. */
@Component({
  selector: 'ts-info',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ts-row">
      <span class="ts-row__label">{{ label }}</span>
      <span class="ts-row__value" [class.ts-row__value--text]="!numeric" [style.color]="color">
        <ng-container *ngIf="value !== undefined; else slot">{{ value === null || value === '' ? '—' : value }}</ng-container>
        <ng-template #slot><ng-content></ng-content></ng-template>
      </span>
    </div>
  `
})
export class InfoRowComponent {
  @Input() label = '';
  @Input() value?: string | number | null;
  @Input() numeric = true;
  @Input() color?: string;
}

/** GroupLabel: the small heading between groups of rows. */
@Component({
  selector: 'ts-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h3 class="ts-group-label"><ng-content></ng-content></h3>`
})
export class GroupLabelComponent {}

// ---------------- states ----------------

@Component({
  selector: 'ts-loading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="ts-loading" role="status" aria-live="polite"><i class="pi pi-spin pi-spinner" aria-hidden="true"></i></div>`
})
export class LoadingComponent {}

@Component({
  selector: 'ts-empty',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ts-empty">
      <i [class]="icon" aria-hidden="true"></i>
      <span>{{ message }}</span>
      <button *ngIf="action" type="button" class="btn btn-secondary" (click)="act.emit()">{{ action }}</button>
    </div>
  `
})
export class EmptyComponent {
  @Input() message = '';
  @Input() icon = 'ti ti-inbox';
  @Input() action?: string | null;
  @Output() act = new EventEmitter<void>();
}

@Component({
  selector: 'ts-error',
  standalone: true,
  imports: [CommonModule, TranslateModule, ErrorTextPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ts-error" role="alert">
      <i class="ti ti-alert-triangle" aria-hidden="true"></i>
      <span>{{ error | errorText }}</span>
      <button *ngIf="retry.observed" type="button" class="btn btn-secondary" (click)="retry.emit()">
        <i class="ti ti-refresh" aria-hidden="true"></i>{{ 'APP.retry' | translate }}
      </button>
    </div>
  `
})
export class ErrorComponent {
  @Input() error: unknown;
  @Output() retry = new EventEmitter<void>();
}

export const KIT = [
  TsFormatPipe,
  ArEnPipe,
  ErrorTextPipe,
  PillComponent,
  TagComponent,
  DotComponent,
  AvatarComponent,
  IconTileComponent,
  AppBarComponent,
  CardComponent,
  InfoRowComponent,
  GroupLabelComponent,
  LoadingComponent,
  EmptyComponent,
  ErrorComponent
] as const;
