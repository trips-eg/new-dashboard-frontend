import { Component, EventEmitter, Injectable, Input, OnChanges, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, firstValueFrom } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { SheetComponent } from '../ui/dialogs';
import { StaffHttp } from '../core/staff-http';
import { FORM_KIT } from '../forms/form-kit';

/** An account as the edit sheet takes it (a vendor's team member or a staff user). */
export interface AccountRef {
  userId: number;
  firstName: string;
  lastName: string;
  username: string;
  email?: string | null;
  phone?: string | null;
}

/** The staff account calls: admins edit any account's details and password; everyone changes their own password. */
@Injectable({ providedIn: 'root' })
export class AccountsApi {
  private readonly http = inject(StaffHttp);

  /** PUT /api/staff/users/{id}: name, username, email and phone (roles and company stay). Admins with Users.Edit. */
  update(a: AccountRef): Observable<unknown> {
    return this.http.put(`/api/staff/users/${a.userId}`, {
      firstName: a.firstName.trim(),
      lastName: a.lastName.trim(),
      username: a.username.trim(),
      email: a.email?.trim() || null,
      phone: a.phone?.trim() || null
    });
  }

  /** PUT /api/staff/users/{id}/password: the account's sessions are signed out; nothing is emailed. */
  setPassword(userId: number, newPassword: string): Observable<{ userId: number; revokedSessions: number }> {
    return this.http.put(`/api/staff/users/${userId}/password`, { newPassword });
  }

  /** PUT /api/staff/me/password with the current password. */
  changeOwn(currentPassword: string, newPassword: string): Observable<unknown> {
    return this.http.put('/api/staff/me/password', { currentPassword, newPassword });
  }
}

/** Splits a full name into first and last at the first space. */
export function splitName(name: string | null | undefined): { firstName: string; lastName: string } {
  const n = (name ?? '').trim();
  const i = n.indexOf(' ');
  return i < 0 ? { firstName: n, lastName: '' } : { firstName: n.slice(0, i), lastName: n.slice(i + 1).trim() };
}

/**
 * The password sheet. With a userId an admin sets that account's password; with `own` the signed-in user changes
 * theirs and types the current one first. The new password is typed twice.
 */
@Component({
  selector: 'ts-password-sheet',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ...FORM_KIT, SheetComponent],
  template: `
    <ts-sheet [open]="open" (openChange)="close()" [title]="(own ? 'APP.changeMyPassword' : 'APP.changePassword') | translate">
      <p class="ts-muted" *ngIf="!own && name" style="margin-top: 0">{{ 'APP.passwordFor' | translate: { n: name } }}</p>
      <ts-field *ngIf="own" [label]="'APP.currentPassword' | translate" type="password" [required]="true" [(value)]="current"></ts-field>
      <ts-field [label]="'APP.newPassword' | translate" type="password" [required]="true" [hint]="'APP.passwordRuleHint' | translate" [(value)]="next"></ts-field>
      <ts-field [label]="'APP.confirmPassword' | translate" type="password" [required]="true" [(value)]="again"></ts-field>
      <p class="ts-muted" *ngIf="!own" style="font-size: 12.5px"><i class="ti ti-logout"></i> {{ 'APP.passwordSignsOut' | translate }}</p>
      <div sheet-foot><button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy" (click)="save()">{{ 'APP.save' | translate }}</button></div>
    </ts-sheet>
  `
})
export class PasswordSheetComponent implements OnChanges {
  private readonly api = inject(AccountsApi);
  private readonly text = inject(StaffText);
  @Input() open = false;
  @Input() userId: number | null = null;
  @Input() name = '';
  @Input() own = false;
  @Output() openChange = new EventEmitter<boolean>();
  current = '';
  next = '';
  again = '';
  busy = false;

  ngOnChanges(): void {
    if (this.open) this.current = this.next = this.again = '';
  }

  close(): void {
    this.current = this.next = this.again = '';
    this.openChange.emit(false);
  }

  async save(): Promise<void> {
    const tr = (k: string, p?: Record<string, unknown>) => this.text.tr(k, p);
    if (this.own && !this.current) return this.text.showError(tr('APP.fillRequired'));
    if (this.next.length < 8) return this.text.showError(tr('APP.passwordRuleHint'));
    if (this.next !== this.again) return this.text.showError(tr('APP.passwordsDontMatch'));
    this.busy = true;
    try {
      if (this.own) {
        await firstValueFrom(this.api.changeOwn(this.current, this.next));
        this.text.showDone(tr('APP.passwordChanged'));
      } else {
        const r = await firstValueFrom(this.api.setPassword(this.userId!, this.next));
        this.text.showDone(tr('APP.passwordSetN', { n: r?.revokedSessions ?? 0 }));
      }
      this.close();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }
}

/** The account details sheet: name, username, email and phone of any account (admins with Users.Edit). */
@Component({
  selector: 'ts-account-sheet',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, ...FORM_KIT, SheetComponent],
  template: `
    <ts-sheet [open]="open" (openChange)="openChange.emit(false)" [title]="'APP.editAccount' | translate">
      <ng-container *ngIf="f">
        <ts-field [label]="'APP.firstName' | translate" [required]="true" [(value)]="f.firstName"></ts-field>
        <ts-field [label]="'APP.lastName' | translate" [(value)]="f.lastName"></ts-field>
        <ts-field [label]="'APP.username' | translate" [required]="true" [(value)]="f.username"></ts-field>
        <ts-field [label]="'APP.email' | translate" type="email" [(value)]="f.email"></ts-field>
        <ts-field [label]="'APP.phone' | translate" type="tel" [(value)]="f.phone"></ts-field>
      </ng-container>
      <div sheet-foot><button type="button" class="btn btn-primary ts-wide-btn" [disabled]="busy" (click)="save()">{{ 'APP.save' | translate }}</button></div>
    </ts-sheet>
  `
})
export class AccountSheetComponent implements OnChanges {
  private readonly api = inject(AccountsApi);
  private readonly text = inject(StaffText);
  @Input() open = false;
  @Input() account: AccountRef | null = null;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();
  f: AccountRef | null = null;
  busy = false;

  ngOnChanges(): void {
    if (this.open && this.account) this.f = { ...this.account, email: this.account.email ?? '', phone: this.account.phone ?? '' };
  }

  async save(): Promise<void> {
    const f = this.f!;
    if (!f.firstName.trim() || !f.username.trim()) return this.text.showError(this.text.tr('APP.fillRequired'));
    this.busy = true;
    try {
      await firstValueFrom(this.api.update(f));
      this.text.showDone(this.text.tr('APP.saved'));
      this.openChange.emit(false);
      this.saved.emit();
    } catch (e) {
      this.text.showError(e);
    } finally {
      this.busy = false;
    }
  }
}
