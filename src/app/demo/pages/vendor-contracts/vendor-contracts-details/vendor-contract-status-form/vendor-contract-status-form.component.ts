import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-vendor-contract-status-form',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './vendor-contract-status-form.component.html',
  styleUrl: './vendor-contract-status-form.component.scss'
})
export class VendorContractStatusFormComponent implements OnInit {
  form: FormGroup;
  vendorStatuses = [
    { value: 1, nameEn: 'New Vendor', nameAr: 'جديد' },
    { value: 2, nameEn: 'Active', nameAr: 'نشط' },
    { value: 3, nameEn: 'Inactive', nameAr: 'غير نشط' },
    { value: 4, nameEn: 'Suspended', nameAr: 'موقوف' }
  ];
  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef
  ) {}
  submit() {
    if (this.form.valid) {
      this.ref.close(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
  ngOnInit(): void {
    this.form = this.fb.group({
      vendorStatus: [null, Validators.required],
      descriptions: ['', [Validators.required, Validators.minLength(3)]]
    });
  }
}
