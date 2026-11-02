import { ChangeDetectionStrategy, Component, EventEmitter, Injectable, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

/**
 * showTripsSheet of the app: a panel with a title, a close button, scrolling content and a footer of buttons.
 * Centred on wide screens, a bottom sheet on phones.
 */
@Component({
  selector: 'ts-sheet',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <ng-container *ngIf="open">
      <div class="ts-sheet-backdrop" (click)="dismiss()"></div>
      <div class="ts-sheet" [class.ts-sheet--wide]="wide" role="dialog" aria-modal="true" [attr.aria-label]="title">
        <header class="ts-sheet__head">
          <h2>{{ title }}</h2>
          <ng-content select="[sheet-action]"></ng-content>
          <button type="button" class="ts-icon-btn" (click)="dismiss()" [attr.aria-label]="'APP.cancel' | translate"><i class="ti ti-x"></i></button>
        </header>
        <div class="ts-sheet__body"><ng-content></ng-content></div>
        <footer class="ts-sheet__foot" *ngIf="footer"><ng-content select="[sheet-foot]"></ng-content></footer>
      </div>
    </ng-container>
  `
})
export class SheetComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() footer = true;
  @Input() wide = false;
  @Output() openChange = new EventEmitter<boolean>();
  dismiss(): void {
    this.open = false;
    this.openChange.emit(false);
  }
}

interface ConfirmRequest {
  kind: 'confirm';
  title: string;
  message: string;
  confirm: string;
  danger: boolean;
  resolve: (ok: boolean) => void;
}

interface AskRequest {
  kind: 'ask';
  title: string;
  label: string;
  value: string;
  required: boolean;
  lines: number;
  number: boolean;
  resolve: (v: string | null) => void;
}

/** showConfirm / askText of the app, as promises; drawn by <ts-dialog-host> in the layout. */
@Injectable({ providedIn: 'root' })
export class StaffDialogs {
  current: ConfirmRequest | AskRequest | null = null;

  confirm(o: { title: string; message: string; confirm: string; danger?: boolean }): Promise<boolean> {
    return new Promise((resolve) => (this.current = { kind: 'confirm', danger: false, ...o, resolve }));
  }

  ask(o: { title: string; label: string; initial?: string; required?: boolean; lines?: number; number?: boolean }): Promise<string | null> {
    return new Promise(
      (resolve) =>
        (this.current = {
          kind: 'ask',
          title: o.title,
          label: o.label,
          value: o.initial ?? '',
          required: o.required ?? true,
          lines: o.lines ?? 3,
          number: o.number ?? false,
          resolve
        })
    );
  }

  close(result: any): void {
    const c = this.current;
    this.current = null;
    (c?.resolve as ((v: unknown) => void) | undefined)?.(result);
  }
}

@Component({
  selector: 'ts-dialog-host',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <ng-container *ngIf="d.current as c">
      <div class="ts-sheet-backdrop" (click)="d.close(c.kind === 'confirm' ? false : null)"></div>
      <div class="ts-dialog" role="alertdialog" aria-modal="true" [attr.aria-label]="c.title">
        <h2>{{ c.title }}</h2>
        <ng-container *ngIf="c.kind === 'confirm'">
          <p>{{ $any(c).message }}</p>
          <div class="ts-dialog__actions">
            <button type="button" class="btn btn-secondary" (click)="d.close(false)">{{ 'APP.cancel' | translate }}</button>
            <button type="button" class="btn" [class.btn-danger]="$any(c).danger" [class.btn-primary]="!$any(c).danger" (click)="d.close(true)">
              {{ $any(c).confirm }}
            </button>
          </div>
        </ng-container>
        <ng-container *ngIf="c.kind === 'ask'">
          <label class="ts-field">
            <span>{{ $any(c).label }}</span>
            <textarea *ngIf="$any(c).lines > 1" class="form-control" [rows]="$any(c).lines" [(ngModel)]="$any(c).value"></textarea>
            <input *ngIf="$any(c).lines <= 1" class="form-control" [attr.inputmode]="$any(c).number ? 'decimal' : null" [(ngModel)]="$any(c).value" />
          </label>
          <div class="ts-dialog__actions">
            <button type="button" class="btn btn-secondary" (click)="d.close(null)">{{ 'APP.cancel' | translate }}</button>
            <button type="button" class="btn btn-primary" [disabled]="$any(c).required && !$any(c).value?.trim()" (click)="d.close($any(c).value.trim())">
              {{ 'APP.save' | translate }}
            </button>
          </div>
        </ng-container>
      </div>
    </ng-container>
  `
})
export class DialogHostComponent {
  readonly d = inject(StaffDialogs);
}

export const DIALOGS = [SheetComponent] as const;
