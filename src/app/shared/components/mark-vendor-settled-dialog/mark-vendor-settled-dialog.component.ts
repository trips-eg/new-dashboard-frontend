import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ReservationsService } from '../../services/reservations.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

export interface MarkVendorSettledDialogData {
  reservation: any;
  moduleType: number; // 1: Travel, 2: Room, 3: Outing, 4: Manasik
  moduleName?: string;
  vendorName?: string;
}

@Component({
  selector: 'app-mark-vendor-settled-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './mark-vendor-settled-dialog.component.html',
  styleUrl: './mark-vendor-settled-dialog.component.scss'
})
export class MarkVendorSettledDialogComponent implements OnInit {
  settlementForm!: FormGroup;
  reservation: any;
  moduleType: number = 1;
  moduleName: string = '';
  vendorName: string = '';

  calculatedAmount: number = 0;
  alreadySettledAmount: number = 0;
  remainingAmount: number = 0;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig<MarkVendorSettledDialogData>,
    private reservationsService: ReservationsService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const data = this.config.data;
    if (!data || !data.reservation) {
      this.ref.close();
      return;
    }

    this.reservation = data.reservation;
    this.moduleType = data.moduleType || 1;
    this.moduleName = data.moduleName || this.getModuleNameByType(this.moduleType);
    this.vendorName = data.vendorName || this.reservation.companyDto?.name || this.reservation.vendorName || '';

    // Calculate baseline amounts
    this.calculatedAmount = Number(this.reservation.vendorCalculatedAmount ?? this.reservation.vendorProfitAfterCoupon ?? this.reservation.productPrice ?? 0);
    this.alreadySettledAmount = Number(this.reservation.vendorSettledAmount ?? 0);
    this.remainingAmount = Math.max(0, this.calculatedAmount - this.alreadySettledAmount);

    const defaultAmount = this.remainingAmount > 0 ? this.remainingAmount : this.calculatedAmount;

    this.settlementForm = this.fb.group({
      settledAmount: [
        defaultAmount,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ]
    });
  }

  get enteredAmount(): number {
    return Number(this.settlementForm?.get('settledAmount')?.value || 0);
  }

  get newTotalSettled(): number {
    return this.alreadySettledAmount + this.enteredAmount;
  }

  get remainingAfterAction(): number {
    return Math.max(0, this.calculatedAmount - this.newTotalSettled);
  }

  get isExceedingCalculated(): boolean {
    return this.newTotalSettled > this.calculatedAmount && this.calculatedAmount > 0;
  }

  get currentProgressPercent(): number {
    if (!this.calculatedAmount || this.calculatedAmount <= 0) return 0;
    return Math.min(100, Math.round((this.alreadySettledAmount / this.calculatedAmount) * 100));
  }

  get newProgressPercent(): number {
    if (!this.calculatedAmount || this.calculatedAmount <= 0) return 0;
    return Math.min(100, Math.round((this.newTotalSettled / this.calculatedAmount) * 100));
  }

  fillFullRemaining(): void {
    const amount = this.remainingAmount > 0 ? this.remainingAmount : this.calculatedAmount;
    this.settlementForm.patchValue({ settledAmount: Number(amount.toFixed(2)) });
    this.settlementForm.markAsDirty();
  }

  fillPercentage(fraction: number): void {
    const target = this.remainingAmount > 0 ? this.remainingAmount * fraction : this.calculatedAmount * fraction;
    this.settlementForm.patchValue({ settledAmount: Number(target.toFixed(2)) });
    this.settlementForm.markAsDirty();
  }

  getModuleNameByType(type: number): string {
    switch (type) {
      case 1:
        return 'Travel / Trip';
      case 2:
        return 'Hotel / Room';
      case 3:
        return 'Outing';
      case 4:
        return 'Manasik / Hajj';
      default:
        return 'Reservation';
    }
  }

  onSubmit(): void {
    if (this.settlementForm.invalid || this.isSubmitting) {
      this.settlementForm.markAllAsTouched();
      return;
    }

    const settledAmount = Number(this.settlementForm.value.settledAmount);
    const reservationId = this.reservation.id;

    if (!reservationId) {
      this.toastr.error('Invalid reservation ID', 'Error');
      return;
    }

    const payload = {
      reservationId: reservationId,
      settledAmount: settledAmount
    };

    this.isSubmitting = true;

    this.reservationsService.markVendorSettledByModule(this.moduleType, payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        const successMsg = this.translate.instant('settlementSuccess') || 'Vendor settlement recorded successfully';
        this.toastr.success(successMsg, this.translate.instant('success') || 'Success');
        this.ref.close({ success: true, settledAmount, res });
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error marking vendor settled:', err);
        const errorMsg = err?.error?.message || this.translate.instant('settlementError') || 'Failed to record vendor settlement';
        this.toastr.error(errorMsg, this.translate.instant('Error') || 'Error');
      }
    });
  }

  onCancel(): void {
    this.ref.close(null);
  }
}
