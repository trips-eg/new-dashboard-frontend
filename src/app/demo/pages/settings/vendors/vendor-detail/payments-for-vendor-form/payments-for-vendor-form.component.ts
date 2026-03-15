import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';
import { CompaniesWalletService } from 'src/app/shared/services/companies-wallet.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-payments-for-vendor-form',
  standalone: true,
  imports: [ImgUploaderComponent, SharedModule],
  templateUrl: './payments-for-vendor-form.component.html',
  styleUrl: './payments-for-vendor-form.component.scss'
})
export class PaymentsForVendorFormComponent {
  bankAccountForm!: FormGroup;
  oldImage: string | null = null;
  selectedFile: File | null = null;
  alertMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private CompaniesWalletService: CompaniesWalletService, // ✨ Inject service
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private ToastrService: ToastrService
  ) {}

  ngOnInit(): void {
    const vendorId = this.config.data.vendorId;
    const payMentData = this.config.data.calcData;
    if (payMentData.amountPaidBefore && payMentData.amountPaidBefore > 0) {
      this.alertMessage = `The selected items have already been paid: ${payMentData.amountPaidBefore} ; you should pay ${payMentData.totalAmount}`;
    }
    this.bankAccountForm = this.fb.group({
      companyId: [vendorId, Validators.required],
      userId: [null],
      accountNumber: ['', Validators.required],
      accountName: ['', Validators.required],
      bankName: ['', Validators.required],
      amountIn: [payMentData.totalAmount, [Validators.required]],
      amountOut: [0, [Validators.required, Validators.max(payMentData.totalAmount)]],
      totalAmount: [0],
      createdDate: ['', Validators.required],
      from: [payMentData.dateFrom ?new Date(payMentData.dateFrom) : null],
      to: [payMentData.dateTo ?new Date(payMentData.dateTo) : null ],
      image: [null],
      SattlementToPays: [payMentData.sattlements]
    });
    this.bankAccountForm.get('amountIn')?.disable();

    if ((payMentData.sattlements?.length ?? 0) > 1) {
      this.bankAccountForm.patchValue({
        amountOut: payMentData.totalAmount
      });
      this.bankAccountForm.get('amountOut')?.disable();
      this.bankAccountForm.get('amountIn')?.disable();
    }
  }

  onLogoFileSelect(files: File[]) {
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      this.bankAccountForm.patchValue({ image: this.selectedFile });
    }
  }

  onSubmit() {
    if (this.bankAccountForm.valid) {
      const formData = new FormData();

      Object.keys(this.bankAccountForm.controls).forEach((key) => {
        let value = this.bankAccountForm.get(key)?.value;

        if (value !== null && value !== undefined && key !== 'image') {
          // تحويل التواريخ
          if ((key === 'createdDate' || key === 'from' || key === 'to') && value instanceof Date) {
            value = value.toISOString();
          }

          // ✨ Handle SattlementToPays
          if (key === 'SattlementToPays' && Array.isArray(value)) {
            value.forEach((item: any) => {
              formData.append('SattlementToPays', JSON.stringify(item));
            });
            return; // نخلي الـ loop تعدي للـ key التالي بدون append للقيمة الأصلية
          }

          formData.append(key, value);
        }
      });

      // إضافة الصورة لو موجودة
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      // إرسال الفورم
      this.CompaniesWalletService.setPayMentToVendor(formData).subscribe({
        next: (res) => {
          this.ref.close(res);
          this.ToastrService.success('data saved', 'success');
        },
        error: (err) => this.ToastrService.error('error in saving data', 'error')
      });
    }
  }
}
