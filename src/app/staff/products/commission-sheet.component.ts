import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SheetComponent } from '../ui/dialogs';
import { PillSwitchComponent } from '../ui/controls';
import { StaffText } from '../ui/kit';
import { fmtNum, parseAmount } from '../core/format';
import { ProductsApi } from './products-api';

/**
 * editCommission of the app: an item's commission policy (percent, fixed amount, or committed net price).
 * Outing tickets are item type 5 (ItemType.OutingTicket): the backend charges outings per ticket.
 */
@Component({
  selector: 'ts-commission-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, SheetComponent, PillSwitchComponent],
  template: `
    <ts-sheet [open]="open" (openChange)="close()" [title]="'APP.commission' | translate">
      <ts-pill-switch [items]="models" [selected]="String(model)" (selectedChange)="model = +$event"></ts-pill-switch>
      <label class="ts-field" style="margin-top: 12px">
        <span>{{ 'APP.commission' | translate }} ({{ model === 1 ? '%' : ('APP.egp' | translate) }})</span>
        <input class="form-control" inputmode="decimal" [(ngModel)]="value" />
      </label>
      <label class="ts-field" *ngIf="model === 3">
        <span>{{ 'APP.vendorNetPrice' | translate }} ({{ 'APP.egp' | translate }})</span>
        <input class="form-control" inputmode="decimal" [(ngModel)]="net" />
      </label>
      <p class="ts-muted">{{ 'APP.commissionAppliesHint' | translate }}</p>
      <div sheet-foot class="ts-wide-row">
        <button type="button" class="btn btn-primary" [disabled]="busy" (click)="save()">{{ 'APP.save' | translate }}</button>
      </div>
    </ts-sheet>
  `
})
export class CommissionSheetComponent {
  private readonly api = inject(ProductsApi);
  private readonly text = inject(StaffText);
  @Output() saved = new EventEmitter<void>();
  readonly String = String;
  open = false;
  busy = false;
  model = 1;
  value = '';
  net = '';
  private itemType = 0;
  private itemId = 0;

  readonly models = [
    { key: '1', label: this.text.tr('APP.percentage') },
    { key: '2', label: this.text.tr('APP.fixedAmount') },
    { key: '3', label: this.text.tr('APP.committedPrice') }
  ];

  show(itemType: number, itemId: number): void {
    this.itemType = itemType;
    this.itemId = itemId;
    this.model = 1;
    this.value = this.net = '';
    this.api.commission(itemType, itemId).subscribe({
      next: (c) => {
        this.model = c?.pricingModel ?? 1;
        this.value = c?.tripsCommissionValue == null ? '' : fmtNum(c.tripsCommissionValue);
        this.net = c?.companyNetPrice == null ? '' : fmtNum(c.companyNetPrice);
        this.open = true;
      },
      error: () => (this.open = true)
    });
  }

  close(): void {
    this.open = false;
  }

  save(): void {
    this.busy = true;
    this.api
      .saveCommission({
        itemId: this.itemId,
        itemType: this.itemType,
        pricingModel: this.model,
        tripsCommissionValue: parseAmount(this.value) ?? 0,
        companyNetPrice: parseAmount(this.net)
      })
      .subscribe({
        next: () => {
          this.busy = false;
          this.open = false;
          this.text.showDone();
          this.saved.emit();
        },
        error: (e) => {
          this.busy = false;
          this.text.showError(e);
        }
      });
  }
}
