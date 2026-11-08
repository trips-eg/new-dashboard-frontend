import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { CouponsService } from 'src/app/shared/services/coupons.service';
import { HajjUmmrahService } from 'src/app/shared/services/hajj-ummrah.service';
import { OutingService } from 'src/app/shared/services/outing.service';
import { RoomService } from 'src/app/shared/services/room.service';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

/**
 * The welcome bonus rules (phase 5): whether the bonus pays for bookings, whether it can be used with a coupon on
 * the same booking, and the places it covers (all of them, or chosen ones like a coupon).
 */
@Component({
  selector: 'app-bonus-settings',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, PanelModule, InputSwitchModule, MultiSelectModule, ButtonModule],
  templateUrl: './bonus-settings.component.html'
})
export class BonusSettingsComponent implements OnInit {
  fb = inject(FormBuilder);
  CouponsService = inject(CouponsService);
  ToastrService = inject(ToastrService);
  TranslateService = inject(TranslateService);
  TravelTripsService = inject(TravelTripsService);
  RoomService = inject(RoomService);
  OutingService = inject(OutingService);
  HajjUmmrahService = inject(HajjUmmrahService);
  lang = this.TranslateService.currentLang;

  saving = false;
  form: FormGroup = this.fb.group({
    enabled: [true],
    allowWithCoupon: [false],
    isGeneral: [true],
    tripIds: [[]],
    roomIds: [[]],
    outingIds: [[]],
    hajjIds: [[]]
  });

  t(ar: string, en: string): string {
    return this.lang === 'ar' ? ar : en;
  }

  private options = (res: any) => (res?.data?.data ?? []).map((x: any) => ({ label: x.name, value: x.id }));
  tripsOptions$ = this.TravelTripsService.getAllTravels({ pageIndex: 1, pageSize: 1000, isPagingEnabled: false }).pipe(map(this.options));
  roomsOptions$ = this.RoomService.getAllRooms({ pageIndex: 1, pageSize: 1000 }).pipe(map(this.options));
  outingsOptions$ = this.OutingService.getAllOutings({ pageIndex: 1, pageSize: 1000 }).pipe(map(this.options));
  hajjOptions$ = this.HajjUmmrahService.getAllManasik({ pageIndex: 1, pageSize: 1000 }).pipe(map(this.options));

  get isGeneral(): boolean {
    return this.form.get('isGeneral')?.value === true;
  }

  get placesMissing(): boolean {
    const v = this.form.value;
    return !v.isGeneral && [v.tripIds, v.roomIds, v.outingIds, v.hajjIds].every((ids: number[]) => !ids?.length);
  }

  ngOnInit(): void {
    this.CouponsService.getBonusRules().subscribe((res) => {
      if (res?.data) this.form.patchValue(res.data);
    });
  }

  save(): void {
    if (this.placesMissing || this.saving) return;
    this.saving = true;
    this.CouponsService.updateBonusRules(this.form.value).subscribe({
      next: (res) => {
        this.saving = false;
        if (res?.data) this.form.patchValue(res.data);
        this.ToastrService.success(this.t('اتحفظت إعدادات الرصيد الترحيبي', 'Welcome bonus settings saved'));
      },
      error: (err) => {
        this.saving = false;
        this.ToastrService.error(err?.error?.message || this.t('ما اتحفظش، جرّب تاني', 'Not saved, try again'));
      }
    });
  }
}
