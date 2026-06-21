import { EnumsService } from 'src/app/shared/services/enums.service';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { map } from 'rxjs';
import { ICoupon } from 'src/app/shared/model/icoupon';
import { CouponsService } from 'src/app/shared/services/coupons.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CouponDetailsComponent } from '../coupon-details/coupon-details.component';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-coupons-list',
  standalone: true,
  imports: [SharedModule],
  providers: [ConfirmationService, DialogService],
  templateUrl: './coupons-list.component.html',
  styleUrl: './coupons-list.component.scss'
})
export class CouponsListComponent implements OnInit {
  CouponsService = inject(CouponsService);
  ConfirmationService = inject(ConfirmationService);
  toastr = inject(ToastrService);
  EnumsService = inject(EnumsService);
  TranslateService = inject(TranslateService);
  dialogService = inject(DialogService);
  ref: DynamicDialogRef | undefined;
  UserLimitOptions = [];

  @ViewChild('dt') dt: Table;

  lang = this.TranslateService.currentLang;

  totalRecords = 0;
  isLoading = false;
  searchTerm = '';
  coupons: ICoupon[] = [];

  getUserLimitOptions() {
    this.EnumsService.getUserLimit().subscribe({
      next: (res) => {
        this.UserLimitOptions = res;
      }
    });
  }

  returnValueOFuserLimit(val: number) {
    if (!this.UserLimitOptions.length) return val;
    const found = this.UserLimitOptions.find((opt) => opt.value === val);
    return found ? (this.lang === 'ar' ? found.nameAr : found.nameEn) : val;
  }

  getDiscountLabel(coupon: ICoupon): string {
    if (coupon.discountType === 3) {
      const buy = coupon.buyQuantity || 0;
      const get = coupon.getQuantity || 0;
      const max = coupon.maxFreeQuantity || 0;
      return this.lang === 'ar' 
        ? `اشتري ${buy} احصل على ${get} مجاناً (حد أقصى ${max})`
        : `Buy ${buy} Get ${get} Free (Max ${max})`;
    }
    if (coupon.discountDescription) {
      return coupon.discountDescription;
    }
    if (coupon.discountType === 2) {
      return `${coupon.discountAmount}%`;
    }
    return coupon.discountAmount?.toString() || '';
  }

  openCouponDetails(couponId: number) {
    this.ref = this.dialogService.open(CouponDetailsComponent, {
      header: 'Coupon Details',
      width: '50%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: {
        couponId: couponId
      }
    });
  }

  loadCoupons(event: TableLazyLoadEvent) {
    this.isLoading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this.CouponsService.getCoupons(payload).subscribe({
      next: (res) => {
        this.coupons = res.data.data || [];
        this.totalRecords = res.data.itemsCount || 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.coupons = [];
        this.isLoading = false;
      }
    });
  }

  ngOnInit(): void {
    this.getUserLimitOptions();
  }

  onSearch(event?: any) {
    this.dt.reset();
  }

  deleteCoupon(id: number) {
    this.ConfirmationService.confirm({
      message: 'Are you sure you want to delete this coupon?',
      header: 'Delete Confirmation',
      rejectButtonStyleClass: 'p-button-text',
      acceptButtonStyleClass: 'p-button-danger',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.CouponsService.deleteCoupon(id).subscribe({
          next: (res) => {
            this.toastr.success('Coupon deleted successfully');
            this.dt.reset();
          },
          error: (err) => {
            console.error(err);
          }
        });
      }
    });
  }
}
