import { Component, Inject, inject, OnInit } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CouponsService } from 'src/app/shared/services/coupons.service';
import { EnumsService } from 'src/app/shared/services/enums.service';
import { TranslateService } from '@ngx-translate/core';
import { map, tap } from 'rxjs';
import { RoomService } from 'src/app/shared/services/room.service';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { OutingService } from 'src/app/shared/services/outing.service';
import { HajjUmmrahService } from 'src/app/shared/services/hajj-ummrah.service';

@Component({
  selector: 'app-coupons-form',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule],
  templateUrl: './coupons-form.component.html',
  styleUrl: './coupons-form.component.scss'
})
export class CouponsFormComponent implements OnInit {
  userlId: string;
  couponForm!: FormGroup;
  TranslateService = inject(TranslateService);
  RoomService = inject(RoomService);
  fb = inject(FormBuilder);
  CouponsService = inject(CouponsService);
  EnumsService = inject(EnumsService);
  TravelTripsService = inject(TravelTripsService);
  ToastrService = inject(ToastrService);
  Router = inject(Router);
  OutingService = inject(OutingService);
  HajjUmmrahService = inject(HajjUmmrahService);
  lang = this.TranslateService.currentLang;

  // خيارات نوع الخصم
  discountTypeOptions = [
    { label: 'Fixed Amount', labelAr: 'مبلغ ثابت', value: 1 },
    { label: 'Percentage', labelAr: 'نسبة مئوية', value: 2 },
    { label: 'Buy X Get X', labelAr: 'اشتري X واحصل على X', value: 3 }
  ];

  get discountTypeOptionsTranslated() {
    return this.discountTypeOptions.map(opt => ({
      label: this.lang === 'ar' ? opt.labelAr : opt.label,
      value: opt.value
    }));
  }

  // هل النوع المختار هو Buy X Get X
  get isBuyXGetX(): boolean {
    return this.couponForm?.get('discountType')?.value === 3;
  }

  userLimitOptions$ = this.EnumsService.getUserLimit().pipe(
    map((options) =>
      options.map((opt) => ({
        label: this.lang === 'ar' ? opt.nameAr : opt.nameEn,
        value: opt.value
      }))
    )
  );

  createForm() {
    this.couponForm = this.fb.group({
      code: ['', Validators.required],
      description: [''],
      discountType: [2, Validators.required],
      discountAmount: [0, [Validators.required, Validators.min(1), Validators.max(100)]],
      usageNumber: [0, [Validators.required, Validators.min(1)]],
      startDate: [new Date().toISOString().slice(0, 16), Validators.required],
      endDate: [new Date().toISOString().slice(0, 16), Validators.required],
      isGenral: [true],
      userLimit: [2, [Validators.required, Validators.min(1)]],
      tripIds: [[]],
      roomIds: [[]],
      outingIds: [[]],
      hajjIds: [[]],
      // حقول Buy X Get X الجديدة
      buyQuantity: [null],
      getQuantity: [null],
      maxFreeQuantity: [null]
    });

    // عند تغيير نوع الخصم نحدث الـ validation ديناميكياً
    this.couponForm.get('discountType')?.valueChanges.subscribe(val => {
      this.updateValidationByType(val);
    });
  }

  updateValidationByType(discountType: number) {
    const discountAmount = this.couponForm.get('discountAmount');
    const buyQuantity = this.couponForm.get('buyQuantity');
    const getQuantity = this.couponForm.get('getQuantity');
    const maxFreeQuantity = this.couponForm.get('maxFreeQuantity');

    if (discountType === 3) {
      // Buy X Get X — discountAmount غير مطلوب، الـ 3 fields مطلوبة
      discountAmount?.clearValidators();
      discountAmount?.setValue(0);
      buyQuantity?.setValidators([Validators.required, Validators.min(1)]);
      getQuantity?.setValidators([Validators.required, Validators.min(1)]);
      maxFreeQuantity?.setValidators([Validators.required, Validators.min(1)]);
    } else {
      // Percentage أو Fixed — discountAmount مطلوب، الـ 3 fields تُصفَّر
      discountAmount?.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
      buyQuantity?.clearValidators();
      getQuantity?.clearValidators();
      maxFreeQuantity?.clearValidators();
      buyQuantity?.setValue(null);
      getQuantity?.setValue(null);
      maxFreeQuantity?.setValue(null);
    }

    discountAmount?.updateValueAndValidity();
    buyQuantity?.updateValueAndValidity();
    getQuantity?.updateValueAndValidity();
    maxFreeQuantity?.updateValueAndValidity();
  }

  ngOnInit(): void {
    this.createForm();
  }

  roomsOptions$ = this.RoomService.getAllRooms({ pageIndex: 1, pageSize: 1000 }).pipe(
    tap((res) => console.log('Rooms API Response:', res)),
    map((res) =>
      res?.data?.data?.map((room: any) => ({
        label: room.name,
        value: room.id
      }))
    )
  );

  tripsOptions$ = this.TravelTripsService.getAllTravels({
    pageIndex: 1,
    pageSize: 1000,
    isPagingEnabled: false
  }).pipe(
    map((res) =>
      res?.data?.data?.map((trip: any) => ({
        label: trip.name,
        value: trip.id
      }))
    )
  );

  outingsOptions$ = this.OutingService.getAllOutings({
    pageIndex: 1,
    pageSize: 1000
  }).pipe(
    map((res) =>
      res?.data?.data?.map((outing: any) => ({
        label: outing.name,
        value: outing.id
      }))
    )
  );

  hajjOptions$ = this.HajjUmmrahService.getAllManasik({
    pageIndex: 1,
    pageSize: 1000
  }).pipe(
    map((res) =>
      res?.data?.data?.map((manasik: any) => ({
        label: manasik.name,
        value: manasik.id
      }))
    )
  );

  onSubmit() {
    if (this.couponForm.invalid) {
      return;
    }

    const formValue = this.couponForm.value;
    const trimmedValue = {
      ...formValue,
      code: formValue.code?.trim() || '',
      description: formValue.description?.trim() || '',
			buyQuantity: formValue.buyQuantity ?? 0,
			getQuantity: formValue.getQuantity ?? 0,
			maxFreeQuantity: formValue.maxFreeQuantity ?? 0
    };

    console.log(trimmedValue);

    this.CouponsService.addCoupons(trimmedValue).subscribe({
      next: (res) => {
        this.ToastrService.success(this.TranslateService.instant('Coupon Added Successfully'));
        this.Router.navigate(['/coupons']);
      },
      error: (err) => {
        this.ToastrService.error(this.TranslateService.instant('Error Adding Coupon'));
        console.error(err);
      }
    });
  }

  onCancel() {
    this.Router.navigate(['/coupons']);
  }
}
