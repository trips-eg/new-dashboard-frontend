import { Component, ViewChild } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CouponsService } from 'src/app/shared/services/coupons.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CouponDetailsComponent } from '../coupon-details/coupon-details.component';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-used-coupons',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule],
  providers: [DialogService],
  templateUrl: './used-coupons.component.html',
  styleUrl: './used-coupons.component.scss'
})
export class UsedCouponsComponent {
  @ViewChild('dt') dt: Table;

  usedCoupons: any[] = [];
  totalRecords: number = 0;
  loading: boolean = false;
  ref: DynamicDialogRef | undefined;

  constructor(
    private couponsService: CouponsService,
    private dialogService: DialogService
  ) {}

  loadUsedCoupons(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload = TableRequestBuilder.build(event);

    this.couponsService.getUsedCoupons(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.usedCoupons = res.data.data;
          this.totalRecords = res.data.itemsCount;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
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
}
