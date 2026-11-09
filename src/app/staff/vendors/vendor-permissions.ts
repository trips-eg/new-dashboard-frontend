import { Component, Injectable, Input, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, map } from 'rxjs';
import { KIT, StaffText } from '../ui/kit';
import { SwitchRowComponent } from '../ui/controls';
import { StaffHttp } from '../core/staff-http';
import { P, StaffSession } from '../core/session';

/** The parts of the vendor app an admin can turn on or off for one vendor. */
export type VendorFeatureKey = 'bookings' | 'products' | 'settlements' | 'scanner' | 'reviews';

/** 'role': the value comes from the vendor's role; 'override': an admin set it for this vendor. */
export interface VendorFeature {
  key: VendorFeatureKey;
  on: boolean;
  source: 'role' | 'override';
}

export interface VendorPermissions {
  companyId: number;
  features: VendorFeature[];
}

/** The order of the switches on the card, and the label of each one. */
export const VENDOR_FEATURES: { key: VendorFeatureKey; label: string; icon: string }[] = [
  { key: 'bookings', label: 'APP.vpBookings', icon: 'ti ti-ticket' },
  { key: 'products', label: 'APP.vpProducts', icon: 'ti ti-package' },
  { key: 'settlements', label: 'APP.vpSettlements', icon: 'ti ti-cash' },
  { key: 'scanner', label: 'APP.vpScanner', icon: 'ti ti-scan' },
  { key: 'reviews', label: 'APP.vpReviews', icon: 'ti ti-star' }
];

/** GET|PUT /api/staff/vendors/{companyId}/permissions: admins with Permissions.Company.Edit only (a vendor gets 403). */
@Injectable({ providedIn: 'root' })
export class VendorPermissionsApi {
  private readonly http = inject(StaffHttp);

  get(companyId: number): Observable<VendorPermissions> {
    return this.http.get<VendorPermissions>(`/api/staff/vendors/${companyId}/permissions`).pipe(map(normalize));
  }

  /** Sends only the changed switches; the answer is the vendor's full set after the change. */
  save(companyId: number, features: { key: VendorFeatureKey; on: boolean }[]): Observable<VendorPermissions> {
    return this.http.put<VendorPermissions>(`/api/staff/vendors/${companyId}/permissions`, { features }).pipe(map(normalize));
  }
}

function normalize(d: VendorPermissions | null | undefined): VendorPermissions {
  return { companyId: d?.companyId ?? 0, features: Array.isArray(d?.features) ? d!.features : [] };
}

/** a-vendor: «صلاحيات المورد», one switch per part of the vendor app, saved as soon as it is flipped. */
@Component({
  selector: 'ts-vendor-permissions',
  standalone: true,
  imports: [CommonModule, TranslateModule, ...KIT, SwitchRowComponent],
  template: `
    <ts-card *ngIf="canEdit" [title]="'APP.vendorPermissions' | translate" [subtitle]="'APP.vendorPermissionsHint' | translate" icon="ti ti-lock-access">
      <ts-loading *ngIf="loading"></ts-loading>
      <ts-error *ngIf="error && !loading" [error]="error" (retry)="load()"></ts-error>
      <ng-container *ngIf="!loading && !error">
        <ts-switch-row
          *ngFor="let f of rows"
          [title]="f.label | translate"
          [subtitle]="(f.source === 'override' ? 'APP.vpCustom' : 'APP.vpFromRole') | translate"
          [value]="f.on"
          [disabled]="saving === f.key"
          (valueChange)="set(f.key, $event)"
        ></ts-switch-row>
      </ng-container>
      <p class="ts-muted" style="margin: 10px 0 0; font-size: 12.5px"><i class="ti ti-info-circle" aria-hidden="true"></i> {{ 'APP.vpSyncHint' | translate }}</p>
    </ts-card>
  `
})
export class VendorPermissionsComponent implements OnChanges {
  private readonly api = inject(VendorPermissionsApi);
  private readonly session = inject(StaffSession);
  private readonly text = inject(StaffText);

  @Input({ required: true }) companyId!: number;

  features: VendorFeature[] = [];
  loading = false;
  error: unknown = null;
  /** The key being saved; its switch stays off-limits until the server answers. */
  saving: VendorFeatureKey | null = null;

  get canEdit(): boolean {
    return this.session.can(P.companyEdit);
  }

  /** The known features the server sent, in the card's order (a key the dashboard doesn't know yet is not shown). */
  get rows(): (VendorFeature & { label: string })[] {
    return VENDOR_FEATURES.map((d) => {
      const f = this.features.find((x) => x.key === d.key);
      return f ? { ...f, label: d.label } : null;
    }).filter((x): x is VendorFeature & { label: string } => x != null);
  }

  ngOnChanges(): void {
    if (this.companyId && this.canEdit) this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.get(this.companyId).subscribe({
      next: (p) => {
        this.features = p.features;
        this.loading = false;
      },
      error: (e) => {
        this.error = e;
        this.loading = false;
      }
    });
  }

  set(key: VendorFeatureKey, on: boolean): void {
    if (this.saving) return;
    const before = this.features;
    // Show the new value right away; put the old one back if the server refuses
    this.features = this.features.map((f) => (f.key === key ? { ...f, on } : f));
    this.saving = key;
    this.api.save(this.companyId, [{ key, on }]).subscribe({
      next: (p) => {
        this.features = p.features.length ? p.features : this.features;
        this.saving = null;
        const label = this.text.tr(VENDOR_FEATURES.find((d) => d.key === key)!.label);
        this.text.showDone(this.text.tr(on ? 'APP.vpTurnedOn' : 'APP.vpTurnedOff', { name: label }));
      },
      error: (e) => {
        this.features = before;
        this.saving = null;
        this.text.showError(e);
      }
    });
  }
}
