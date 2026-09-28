import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CountdownTimerComponent } from '../shared/countdown-timer/countdown-timer.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CustomTripsService } from 'src/app/shared/services/custom-trips.service';
import { VendorService } from 'src/app/shared/services/vendor.service';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import {
  CustomTripTypeLabels,
  CustomTripRequestStatus,
  CustomTripRequestStatusLabels,
  CustomTripRequestStatusSeverity,
  OfferPaymentType,
  OfferPaymentTypeLabels,
  TagSeverity,
  enumDisplay,
  enumSeverity
} from 'src/app/shared/Enums/custom-trip';
import { IVendorTripRequestDetails, IVendorOption } from 'src/app/shared/model/icustom-trip';

function depositValidator(group: any): { [key: string]: any } | null {
  const paymentType = group.get('paymentType')?.value;
  const price = group.get('price')?.value;
  const deposit = group.get('depositAmount')?.value;
  if (paymentType === OfferPaymentType.Deposit && deposit != null && price != null) {
    if (Number(deposit) > Number(price)) {
      return { depositExceedsPrice: true };
    }
  }
  return null;
}

@Component({
  selector: 'app-vendor-request-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule, TranslateModule, CountdownTimerComponent],
  templateUrl: './vendor-request-dialog.component.html',
  styleUrl: './vendor-request-dialog.component.scss'
})
export class VendorRequestDialogComponent implements OnInit {
  fb = inject(FormBuilder);
  customTripsService = inject(CustomTripsService);
  vendorService = inject(VendorService);
  configService = inject(ConfigureService);
  toastr = inject(ToastrService);
  translate = inject(TranslateService);
  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);

  lang = this.translate.currentLang || 'en';
  isAdmin = !!this.config.data?.isAdmin;
  request?: IVendorTripRequestDetails;
  isLoading = true;
  isSubmitting = false;
  vendorOptions: IVendorOption[] = [];

  // Expose to template
  CustomTripRequestStatus = CustomTripRequestStatus;
  OfferPaymentType = OfferPaymentType;

  offerForm: FormGroup = this.fb.group(
    {
      vendorId: [null],
      price: [null, [Validators.required, Validators.min(1)]],
      paymentType: [OfferPaymentType.Deposit, [Validators.required]],
      depositAmount: [null],
      vendorNotes: ['']
    },
    { validators: depositValidator }
  );

  ngOnInit(): void {
    this.translate.onLangChange.subscribe(() => (this.lang = this.translate.currentLang));
    const requestId = this.config.data?.requestId;
    const passedRequest = this.config.data?.request;

    if (passedRequest) {
      this.request = passedRequest;
      this.isLoading = false;
      this.populateExistingOffer();
    } else if (requestId) {
      this.loadRequest(requestId);
    } else {
      this.isLoading = false;
    }

    if (this.isAdmin) {
      this.loadVendors();
    }

    this.offerForm.get('paymentType')!.valueChanges.subscribe((type) => {
      const depositControl = this.offerForm.get('depositAmount')!;
      if (type === OfferPaymentType.Deposit) {
        depositControl.setValidators([Validators.required, Validators.min(0.01)]);
      } else {
        depositControl.clearValidators();
        depositControl.reset();
      }
      depositControl.updateValueAndValidity();
    });
  }

  populateExistingOffer(): void {
    if (!this.isAdmin && this.hasMyOffer && this.request) {
      this.offerForm.patchValue({
        price: this.request.myOfferPrice,
        paymentType: this.request.myOfferPaymentType ?? OfferPaymentType.Deposit,
        depositAmount: this.request.myOfferDepositAmount
      });
    }
  }

  onTimerExpired(): void {
    if (this.request) {
      this.request.isAcceptingOffers = false;
      this.request.status = CustomTripRequestStatus.Expired;
    }
  }

  loadRequest(id: number): void {
    this.customTripsService.getRequestById(id).subscribe({
      next: (res) => {
        this.request = res?.data || res;
        this.isLoading = false;
        this.populateExistingOffer();
      },
      error: (err) => {
        console.error('Error loading trip request:', err);
        this.toastr.error(this.translate.instant('Failed to load request details'));
        this.isLoading = false;
      }
    });
  }

  loadVendors(): void {
    this.vendorService.getAllVendors({ pageIndex: 1, pageSize: 1000 }).subscribe({
      next: (res) => {
        const vendors = res?.data?.data || res?.data || [];
        this.vendorOptions = vendors.map((v: any) => ({ label: v.name || v.companyName || v.nameEn, value: v.id }));
      },
      error: (err) => {
        console.error('Error loading vendors:', err);
      }
    });
  }

  get canOffer(): boolean {
    if (!this.request) return false;
    return (
      this.request.status === CustomTripRequestStatus.ReceivingOffers ||
      this.request.isAcceptingOffers === true
    );
  }

  get hasMyOffer(): boolean {
    return this.request?.myOfferStatus !== undefined && this.request?.myOfferStatus !== null;
  }

  get offerPrice(): number {
    return Number(this.offerForm.get('price')?.value) || 0;
  }

  get depositAmountVal(): number {
    return Number(this.offerForm.get('depositAmount')?.value) || 0;
  }

  get isDeposit(): boolean {
    return this.offerForm.get('paymentType')?.value === OfferPaymentType.Deposit;
  }

  get remainingBalance(): number {
    if (!this.isDeposit) return 0;
    return Math.max(0, this.offerPrice - this.depositAmountVal);
  }

  get depositPercent(): number {
    if (!this.isDeposit || this.offerPrice <= 0) return 0;
    return Math.min(100, Math.round((this.depositAmountVal / this.offerPrice) * 100));
  }

  setPaymentType(type: OfferPaymentType): void {
    this.offerForm.get('paymentType')?.setValue(type);
  }

  applyDepositPercentage(percent: number): void {
    if (this.offerPrice > 0) {
      const calculated = Math.round((this.offerPrice * percent) / 100);
      this.offerForm.get('depositAmount')?.setValue(calculated);
      this.offerForm.get('depositAmount')?.markAsDirty();
      this.offerForm.get('depositAmount')?.markAsTouched();
    }
  }

  submitOffer(): void {
    if (!this.request) return;
    if (this.isAdmin && !this.offerForm.get('vendorId')?.value) {
      this.offerForm.get('vendorId')!.setValidators([Validators.required]);
      this.offerForm.get('vendorId')!.updateValueAndValidity();
    }
    if (this.offerForm.invalid) {
      this.offerForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const formValue = this.offerForm.value;
    const payload: any = {
      customTripRequestId: this.request.id,
      price: formValue.price,
      vendorNotes: formValue.vendorNotes || undefined,
      paymentType: formValue.paymentType
    };
    if (formValue.paymentType === OfferPaymentType.Deposit) {
      payload.depositAmount = formValue.depositAmount;
    }
    if (this.isAdmin) {
      payload.vendorId = formValue.vendorId;
    }

    this.customTripsService.submitOffer(payload).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('Offer submitted successfully'));
        this.ref.close(true);
      },
      error: (err) => {
        console.error('Error submitting offer:', err);
        this.toastr.error(err?.error?.message || this.translate.instant('Failed to submit offer'));
        this.isSubmitting = false;
      }
    });
  }

  // Template helpers
  tripTypeLabel(value: number): string {
    return enumDisplay(CustomTripTypeLabels, value, this.lang);
  }

  statusLabel(value: number): string {
    return enumDisplay(CustomTripRequestStatusLabels, value, this.lang);
  }

  statusSeverity(value: number): TagSeverity {
    return enumSeverity(CustomTripRequestStatusSeverity, value);
  }

  paymentTypeLabel(value: number): string {
    return enumDisplay(OfferPaymentTypeLabels, value, this.lang);
  }
}
