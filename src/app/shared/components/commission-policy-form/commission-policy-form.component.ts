import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PricingService, PricingModel, CommissionItemType, CommissionPolicy } from 'src/app/shared/services/pricing.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-commission-policy-form',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './commission-policy-form.component.html',
  styleUrl: './commission-policy-form.component.scss'
})
export class CommissionPolicyFormComponent implements OnInit, OnChanges {
  @Input() itemId!: number;
  @Input() itemType!: number; // 2 = Outing, 3 = Hajj, 4 = Travel
  @Input() basePrice: number = 0; // For live calculation helper
  @Input() isDialogMode: boolean = false; // Hide inner cancel/save buttons if controlled by parent stepper
  @Output() onSaveSuccess = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  policyForm!: FormGroup;
  isLoading: boolean = false;
  isSaving: boolean = false;

  pricingModels = [
    { label: 'Percentage (%)', value: PricingModel.Percentage },
    { label: 'Fixed Amount', value: PricingModel.FixedAmount },
    { label: 'Company Net Price (Committed Price)', value: PricingModel.CommittedPrice }
  ];

  PricingModel = PricingModel;

  constructor(
    private fb: FormBuilder,
    private pricingService: PricingService,
    private toastr: ToastrService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    if (this.itemId && this.itemType) {
      this.loadPolicy();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['itemId'] || changes['itemType']) && this.itemId && this.itemType) {
      this.loadPolicy();
    }
  }

  initForm(): void {
    this.policyForm = this.fb.group({
      pricingModel: [PricingModel.Percentage, [Validators.required]],
      tripsCommissionValue: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      companyNetPrice: [0, [Validators.min(0)]]
    });

    // Dynamic validation changes based on pricingModel
    this.policyForm.get('pricingModel')?.valueChanges.subscribe((model) => {
      this.updateValidators(model);
    });
  }

  updateValidators(model: PricingModel): void {
    const commissionValCtrl = this.policyForm.get('tripsCommissionValue');
    const netPriceCtrl = this.policyForm.get('companyNetPrice');
    const base = Number(this.basePrice) || 0;

    if (model === PricingModel.Percentage) {
      commissionValCtrl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      netPriceCtrl?.clearValidators();
    } else if (model === PricingModel.FixedAmount) {
      commissionValCtrl?.setValidators([Validators.required, Validators.min(0)]);
      netPriceCtrl?.clearValidators();
    } else if (model === PricingModel.CommittedPrice) {
      netPriceCtrl?.setValidators([Validators.required, Validators.min(0), Validators.max(base)]);
      commissionValCtrl?.clearValidators();
    }

    commissionValCtrl?.updateValueAndValidity();
    netPriceCtrl?.updateValueAndValidity();
  }

  loadPolicy(): void {
    this.isLoading = true;
    this.pricingService.getCommissionPolicy(this.itemId, this.itemType).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.policyForm.patchValue({
            pricingModel: res.data.pricingModel || PricingModel.Percentage,
            tripsCommissionValue: res.data.tripsCommissionValue || 0,
            companyNetPrice: res.data.companyNetPrice || 0
          });
          this.updateValidators(res.data.pricingModel || PricingModel.Percentage);
        } else {
          // No policy found, set defaults
          this.policyForm.patchValue({
            pricingModel: PricingModel.Percentage,
            tripsCommissionValue: 0,
            companyNetPrice: 0
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching commission policy:', err);
        this.isLoading = false;
        // set default values
        this.policyForm.patchValue({
          pricingModel: PricingModel.Percentage,
          tripsCommissionValue: 0,
          companyNetPrice: 0
        });
      }
    });
  }

  // Live calculator helpers
  get currentModel(): PricingModel {
    return this.policyForm.get('pricingModel')?.value;
  }

  selectPricingModel(model: PricingModel): void {
    this.policyForm.get('pricingModel')?.setValue(model);
  }

  get calculatedCommission(): number {
    const model = this.currentModel;
    const value = this.policyForm.get('tripsCommissionValue')?.value || 0;
    const netPrice = this.policyForm.get('companyNetPrice')?.value || 0;
    const base = Number(this.basePrice) || 0;

    if (model === PricingModel.Percentage) {
      return (base * value) / 100;
    } else if (model === PricingModel.FixedAmount) {
      return value;
    } else if (model === PricingModel.CommittedPrice) {
      return base > netPrice ? base - netPrice : 0;
    }
    return 0;
  }

  get calculatedNetPrice(): number {
    const model = this.currentModel;
    const value = this.policyForm.get('tripsCommissionValue')?.value || 0;
    const base = Number(this.basePrice) || 0;

    if (model === PricingModel.Percentage) {
      return Math.max(0, base - (base * value) / 100);
    } else if (model === PricingModel.FixedAmount) {
      return Math.max(0, base - value);
    } else if (model === PricingModel.CommittedPrice) {
      const netPrice = this.policyForm.get('companyNetPrice')?.value || 0;
      return netPrice;
    }
    return base;
  }

  get calculatedSellingPrice(): number {
    const model = this.currentModel;
    const base = Number(this.basePrice) || 0;

    if (model === PricingModel.CommittedPrice) {
      return base;
    }
    return base;
  }

  submitForm(): void {
    if (this.policyForm.invalid) {
      this.policyForm.markAllAsTouched();
      this.toastr.error('Please fix invalid fields before saving', 'Form Invalid');
      return;
    }

    this.isSaving = true;
    const formVal = this.policyForm.value;
    const payload: CommissionPolicy = {
      itemId: this.itemId,
      itemType: this.itemType,
      pricingModel: formVal.pricingModel,
      tripsCommissionValue: formVal.pricingModel === PricingModel.CommittedPrice ? 0 : formVal.tripsCommissionValue,
      companyNetPrice: formVal.pricingModel === PricingModel.CommittedPrice ? formVal.companyNetPrice : 0
    };

    this.pricingService.saveCommissionPolicy(payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res.success) {
          this.toastr.success(res.message || 'Commission policy saved successfully', 'Success');
          this.onSaveSuccess.emit(res.data);
        } else {
          this.toastr.error(res.message || 'Failed to save commission policy', 'Error');
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.toastr.error(err.error?.message || 'Error occurred while saving commission policy', 'Error');
        console.error('Error saving commission policy:', err);
      }
    });
  }

  cancel(): void {
    this.onCancel.emit();
  }
}
