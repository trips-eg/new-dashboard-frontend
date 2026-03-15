import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CouponsService } from 'src/app/shared/services/coupons.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { ToastrService } from 'ngx-toastr';
import { EnumsService } from 'src/app/shared/services/enums.service';
import { TranslateService } from '@ngx-translate/core';
import { IcouponDetails } from 'src/app/shared/model/icoupon-details';

@Component({
  selector: 'app-coupon-details',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './coupon-details.component.html',
  styleUrl: './coupon-details.component.scss'
})
export class CouponDetailsComponent {
  couponId: number;
  coupon: IcouponDetails;
  userLimitOptions: any[] = [];
  currentLang: string;

  constructor(
    private route: ActivatedRoute,
    private couponsService: CouponsService,
    private toastr: ToastrService,
    public config: DynamicDialogConfig,
    private enumsService: EnumsService,
    private translateService: TranslateService
  ) {
    this.currentLang = this.translateService.currentLang || 'en';
  }

  ngOnInit(): void {
    this.loadUserLimitOptions();

    // Check if data is coming from dialog
    if (this.config.data?.couponId) {
      this.couponId = this.config.data.couponId;
      this.getCouponDetails(this.couponId);
    } else {
      // Fallback to route params for standalone page navigation
      this.route.params.subscribe((params) => {
        this.couponId = +params['id'];
        if (this.couponId) {
          this.getCouponDetails(this.couponId);
        }
      });
    }
  }

  loadUserLimitOptions() {
    this.enumsService.getUserLimit().subscribe((options) => {
      this.userLimitOptions = options.map((opt: any) => ({
        label: this.currentLang === 'ar' ? opt.nameAr : opt.nameEn,
        value: opt.value
      }));
    });
  }

  getCouponDetails(id: number) {
    this.couponsService.getCouponById(id).subscribe((res) => {
      if (res.success) {
        this.coupon = res.data;
      }
    });
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.toastr.success('Code copied to clipboard');
    });
  }

  getRemainingDays(endDate: string): string {
    if (!endDate) return '';
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Expires today';
    } else {
      return `Remaining ${diffDays} days`;
    }
  }

  getUserLimitLabel(value: number): string {
    const option = this.userLimitOptions.find((opt) => opt.value === value);
    return option ? option.label : value.toString();
  }

  navigateTo(type: 'trip' | 'outing' | 'room' | 'hajj', id: number) {
    let route = '';
    switch (type) {
      case 'trip':
        route = `/travel-details/${id}`;
        break;
      case 'outing':
        route = `/outing-details/${id}`;
        break;
      case 'room':
        route = `/room-details-last-step/${id}`;
        break;
      case 'hajj':
        route = `/details-manasik/${id}`;
        break;
    }
    window.open(route, '_blank');
  }
}
