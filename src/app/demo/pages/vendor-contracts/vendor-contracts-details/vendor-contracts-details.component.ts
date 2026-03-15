import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ImageModule } from 'primeng/image'; // 👈 ده المهم
import { VendorContractsService } from 'src/app/shared/services/vendor-contracts.service';
import { environment } from 'src/environments/environment';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { VendorContractStatusFormComponent } from './vendor-contract-status-form/vendor-contract-status-form.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-vendor-contracts-details',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, ImageModule],
  providers: [DialogService],

  templateUrl: './vendor-contracts-details.component.html',
  styleUrl: './vendor-contracts-details.component.scss'
})
export class VendorContractsDetailsComponent implements OnInit {
  id = this.route.snapshot.params['id'];
  

  vendor: any = {};
  baseUrl = environment.imgUrl;
  ref!: DynamicDialogRef;

  getFullUrl(relativePath: string): string {
    return `${this.baseUrl}${relativePath}`;
  }

  vendorStatuses = [
    { value: 1, nameEn: 'New Vendor', nameAr: 'جديد' },
    { value: 2, nameEn: 'Active', nameAr: 'نشط' },
    { value: 3, nameEn: 'Inactive', nameAr: 'غير نشط' },
    { value: 4, nameEn: 'Suspended', nameAr: 'موقوف' }
  ];
  getStatusName(value: number): string {
  const status = this.vendorStatuses.find(s => s.value === value);
  if (!status) return 'Unknown';

  // لو بتستخدم ngx-translate أو language service
  return this.translate.currentLang === 'ar' ? status.nameAr : status.nameEn;
}
openStatusDialog() {
    this.ref = this.dialogService.open(VendorContractStatusFormComponent, {
      header: 'Update Vendor Contract Status',
      width: '500px'
    });

    this.ref.onClose.subscribe((formData) => {
      if (formData) {
        const payload = {
          id: this.vendor.id, // 👈 جاي من الـ details
          vendorStatus: formData.vendorStatus,
          descriptions: [formData.descriptions]
        };

        this.VendorContractsService.UpdateVendorContractStatus(payload).subscribe({
          next: (res) => {
            console.log('Updated ✅', res);
            this.loadVendorContractById();
            // هنا تعمل refresh للـ timeline أو تضيف description جديدة
          },
          error: (err) => console.error('Update failed ❌', err)
        });
      }
    });
  }
  ngOnInit(): void {
    if (this.id) {
      this.loadVendorContractById();
    }
  }
  loadVendorContractById() {
    this.VendorContractsService.getVendorContractById(this.id).subscribe({
      next: (res) => {
        console.log(res);
        this.vendor = res.data;
      }
    });
  }

  constructor(
    private Router: Router,
    private route: ActivatedRoute,
    private VendorContractsService: VendorContractsService,
    private dialogService: DialogService , 
    private translate: TranslateService
  ) {}
}
