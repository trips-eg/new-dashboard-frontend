import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { CouponsService } from 'src/app/shared/services/coupons.service';
import { RoomService } from 'src/app/shared/services/room.service';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { OutingService } from 'src/app/shared/services/outing.service';
import { HajjUmmrahService } from 'src/app/shared/services/hajj-ummrah.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-coupon-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule, SubHeaderComponent, TranslateModule],
  templateUrl: './coupon-settings.component.html',
  styleUrl: './coupon-settings.component.scss'
})
export class CouponSettingsComponent implements OnInit {
  fb = inject(FormBuilder);
  couponsService = inject(CouponsService);
  roomService = inject(RoomService);
  travelTripsService = inject(TravelTripsService);
  outingService = inject(OutingService);
  hajjUmmrahService = inject(HajjUmmrahService);
  toastr = inject(ToastrService);
  translate = inject(TranslateService);

  // Forms
  generalSettingsForm!: FormGroup;
  weekendForm!: FormGroup;
  weekendItemsForm!: FormGroup;
  birthdayForm!: FormGroup;
  birthdayItemsForm!: FormGroup;
  recoveryForm!: FormGroup;

  // Loading states for each panel/action
  loading = {
    general: false,
    weekend: false,
    weekendItems: false,
    birthday: false,
    birthdayItems: false,
    recovery: false
  };

  // Options lists
  roomsOptions$ = this.roomService
    .getAllRooms({ pageIndex: 1, pageSize: 1000 })
    .pipe(map((res) => res?.data?.data?.map((room: any) => ({ label: room.name, value: room.id })) || []));

  tripsOptions$ = this.travelTripsService
    .getAllTravels({ pageIndex: 1, pageSize: 1000, isPagingEnabled: false })
    .pipe(map((res) => res?.data?.data?.map((trip: any) => ({ label: trip.name, value: trip.id })) || []));

  outingsOptions$ = this.outingService
    .getAllOutings({ pageIndex: 1, pageSize: 1000 })
    .pipe(map((res) => res?.data?.data?.map((outing: any) => ({ label: outing.name, value: outing.id })) || []));

  hajjOptions$ = this.hajjUmmrahService
    .getAllManasik({ pageIndex: 1, pageSize: 1000 })
    .pipe(map((res) => res?.data?.data?.map((manasik: any) => ({ label: manasik.name, value: manasik.id })) || []));

  ngOnInit(): void {
    this.initForms();
    this.loadAllData();
  }

  initForms(): void {
    // General Settings Form
    this.generalSettingsForm = this.fb.group({
      settings: this.fb.array([])
    });

    // Weekend Settings Form
    this.weekendForm = this.fb.group({
      id: [null],
      value: [0, [Validators.required, Validators.min(0)]],
      stringValue: ['']
    });

    // Weekend Items Form
    this.weekendItemsForm = this.fb.group({
      isGeneral: [true],
      tripIds: [[]],
      roomIds: [[]],
      outingIds: [[]],
      hajjIds: [[]]
    });

    // Birthday Settings Form
    this.birthdayForm = this.fb.group({
      id: [null],
      value: [0, [Validators.required, Validators.min(0)]],
      stringValue: ['']
    });

    // Birthday Items Form
    this.birthdayItemsForm = this.fb.group({
      isGeneral: [true],
      tripIds: [[]],
      roomIds: [[]],
      outingIds: [[]],
      hajjIds: [[]]
    });

    // Recovery Settings Form
    this.recoveryForm = this.fb.group({
      id: [null],
      value: [0, [Validators.required, Validators.min(0)]],
      stringValue: ['']
    });
  }

  // Raw settings lists from API to preserve full schema when updating
  rawWeekendSettings: any[] = [];
  rawBirthdaySettings: any[] = [];
  rawRecoverySettings: any[] = [];

  get settingsArray(): FormArray {
    return this.generalSettingsForm.get('settings') as FormArray;
  }

  get hasOtherSettings(): boolean {
    return this.settingsArray.controls.some((item) => {
      const name = (item.get('nameEn')?.value || '').toLowerCase();
      return !name.includes('weekend') && !name.includes('birthday') && !name.includes('recovery');
    });
  }

  loadAllData(): void {
    this.loadGeneralSettings();
    this.loadWeekendSettings();
    this.loadWeekendItems();
    this.loadBirthdaySettings();
    this.loadBirthdayItems();
    this.loadRecoverySettings();
  }

  loadGeneralSettings(): void {
    this.loading.general = true;
    this.couponsService.getAllSettings().subscribe({
      next: (res) => {
        const settings = res?.data || res || [];
        this.settingsArray.clear();
        
        // Filter out only the comma-separated ID list settings (e.g. "Trip IDs"),
        // which are visually managed using dropdown lists in other tabs,
        // while keeping all enabling toggles (like "Weekend Coupon Enabled") in the General Settings list.
        const filteredSettings = settings.filter((s: any) => {
          const type = (s.settingType || '').toLowerCase();
          const name = (s.nameEn || '').toLowerCase();
          return !type.includes('ids') && !name.includes('ids');
        });

        filteredSettings.forEach((s: any) => {
          this.settingsArray.push(
            this.fb.group({
              id: [s.id],
              value: [s.value, [Validators.required]],
              stringValue: [s.stringValue],
              nameEn: [s.nameEn || ''],
              nameAr: [s.nameAr || ''],
              settingType: [s.settingType || ''],
              settingTypeId: [s.settingTypeId || null]
            })
          );
        });
        this.loading.general = false;
      },
      error: (err) => {
        console.error('Error fetching general coupon settings:', err);
        this.toastr.error(this.translate.instant('Failed to load general settings'));
        this.loading.general = false;
      }
    });
  }

  private extractSettingData(list: any[], form: FormGroup): void {
    if (!list || list.length === 0) return;

    // Find setting with rate/percentage/discount
    const discountSetting =
      list.find((s: any) => {
        const name = (s.nameEn || s.settingType || '').toLowerCase();
        return name.includes('percentage') || name.includes('discount') || name.includes('rate') || (s.value !== null && s.value !== undefined && s.value > 0);
      }) || list[0];

    // Find setting with code/title
    const codeSetting =
      list.find((s: any) => {
        const name = (s.nameEn || s.settingType || '').toLowerCase();
        return name.includes('code') || name.includes('title') || name.includes('prefix') || (s.stringValue && s.stringValue.trim() !== '');
      }) || discountSetting;

    form.patchValue({
      id: discountSetting.id,
      value: discountSetting.value ?? 0,
      stringValue: codeSetting.stringValue || discountSetting.stringValue || ''
    });
  }

  private buildUpdatePayload(rawSettings: any[], formVal: any): any[] {
    if (rawSettings.length > 1) {
      return rawSettings.map((item: any) => {
        const name = (item.nameEn || item.settingType || '').toLowerCase();
        const isCode = name.includes('code') || name.includes('title') || name.includes('prefix');
        return {
          id: item.id,
          value: isCode ? item.value : formVal.value,
          stringValue: isCode ? formVal.stringValue : (item.stringValue || formVal.stringValue)
        };
      });
    } else if (rawSettings.length === 1) {
      return [
        {
          id: rawSettings[0].id,
          value: formVal.value,
          stringValue: formVal.stringValue
        }
      ];
    } else {
      return [
        {
          id: formVal.id || 0,
          value: formVal.value,
          stringValue: formVal.stringValue
        }
      ];
    }
  }

  loadWeekendSettings(): void {
    this.loading.weekend = true;
    this.couponsService.getWeekendSettings().subscribe({
      next: (res) => {
        const data = res?.data || res;
        this.rawWeekendSettings = Array.isArray(data) ? data : (data ? [data] : []);
        this.extractSettingData(this.rawWeekendSettings, this.weekendForm);
        this.loading.weekend = false;
      },
      error: (err) => {
        console.error('Error fetching weekend settings:', err);
        this.loading.weekend = false;
      }
    });
  }

  loadWeekendItems(): void {
    this.loading.weekendItems = true;
    this.couponsService.getWeekendItems().subscribe({
      next: (res) => {
        const data = res?.data || res;
        if (data) {
          this.weekendItemsForm.patchValue({
            isGeneral: data.isGeneral ?? true,
            tripIds: data.tripIds || [],
            roomIds: data.roomIds || [],
            outingIds: data.outingIds || [],
            hajjIds: data.hajjIds || []
          });
        }
        this.loading.weekendItems = false;
      },
      error: (err) => {
        console.error('Error fetching weekend items settings:', err);
        this.loading.weekendItems = false;
      }
    });
  }

  loadBirthdaySettings(): void {
    this.loading.birthday = true;
    this.couponsService.getBirthdaySettings().subscribe({
      next: (res) => {
        const data = res?.data || res;
        this.rawBirthdaySettings = Array.isArray(data) ? data : (data ? [data] : []);
        this.extractSettingData(this.rawBirthdaySettings, this.birthdayForm);
        this.loading.birthday = false;
      },
      error: (err) => {
        console.error('Error fetching birthday settings:', err);
        this.loading.birthday = false;
      }
    });
  }

  loadBirthdayItems(): void {
    this.loading.birthdayItems = true;
    this.couponsService.getBirthdayItems().subscribe({
      next: (res) => {
        const data = res?.data || res;
        if (data) {
          this.birthdayItemsForm.patchValue({
            isGeneral: data.isGeneral ?? true,
            tripIds: data.tripIds || [],
            roomIds: data.roomIds || [],
            outingIds: data.outingIds || [],
            hajjIds: data.hajjIds || []
          });
        }
        this.loading.birthdayItems = false;
      },
      error: (err) => {
        console.error('Error fetching birthday items settings:', err);
        this.loading.birthdayItems = false;
      }
    });
  }

  loadRecoverySettings(): void {
    this.loading.recovery = true;
    this.couponsService.getRecoverySettings().subscribe({
      next: (res) => {
        const data = res?.data || res;
        this.rawRecoverySettings = Array.isArray(data) ? data : (data ? [data] : []);
        this.extractSettingData(this.rawRecoverySettings, this.recoveryForm);
        this.loading.recovery = false;
      },
      error: (err) => {
        console.error('Error fetching recovery settings:', err);
        this.loading.recovery = false;
      }
    });
  }

  // Submit Methods
  submitGeneralSettings(): void {
    if (this.generalSettingsForm.invalid) return;
    this.loading.general = true;
    const data = this.settingsArray.value;
    this.couponsService.updateSettings(data).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('General settings saved successfully'));
        this.loadGeneralSettings();
        this.loading.general = false;
      },
      error: (err) => {
        console.error('Error saving general settings:', err);
        this.toastr.error(this.translate.instant('Failed to save general settings'));
        this.loading.general = false;
      }
    });
  }

  submitWeekendSettings(): void {
    if (this.weekendForm.invalid) return;
    this.loading.weekend = true;
    const payload = this.buildUpdatePayload(this.rawWeekendSettings, this.weekendForm.value);
    this.couponsService.updateWeekendSettings(payload).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('Weekend coupon settings saved successfully'));
        this.loadWeekendSettings();
        this.loading.weekend = false;
      },
      error: (err) => {
        console.error('Error saving weekend settings:', err);
        this.toastr.error(this.translate.instant('Failed to save weekend settings'));
        this.loading.weekend = false;
      }
    });
  }

  submitWeekendItems(): void {
    if (this.weekendItemsForm.invalid) return;
    this.loading.weekendItems = true;
    const body = this.weekendItemsForm.value;
    this.couponsService.updateWeekendItems(body).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('Weekend eligible items updated successfully'));
        this.loadWeekendItems();
        this.loading.weekendItems = false;
      },
      error: (err) => {
        console.error('Error updating weekend eligible items:', err);
        this.toastr.error(this.translate.instant('Failed to update weekend eligible items'));
        this.loading.weekendItems = false;
      }
    });
  }

  submitBirthdaySettings(): void {
    if (this.birthdayForm.invalid) return;
    this.loading.birthday = true;
    const payload = this.buildUpdatePayload(this.rawBirthdaySettings, this.birthdayForm.value);
    this.couponsService.updateBirthdaySettings(payload).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('Birthday coupon settings saved successfully'));
        this.loadBirthdaySettings();
        this.loading.birthday = false;
      },
      error: (err) => {
        console.error('Error saving birthday settings:', err);
        this.toastr.error(this.translate.instant('Failed to save birthday settings'));
        this.loading.birthday = false;
      }
    });
  }

  submitBirthdayItems(): void {
    if (this.birthdayItemsForm.invalid) return;
    this.loading.birthdayItems = true;
    const body = this.birthdayItemsForm.value;
    this.couponsService.updateBirthdayItems(body).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('Birthday eligible items updated successfully'));
        this.loadBirthdayItems();
        this.loading.birthdayItems = false;
      },
      error: (err) => {
        console.error('Error updating birthday eligible items:', err);
        this.toastr.error(this.translate.instant('Failed to update birthday eligible items'));
        this.loading.birthdayItems = false;
      }
    });
  }

  submitRecoverySettings(): void {
    if (this.recoveryForm.invalid) return;
    this.loading.recovery = true;
    const payload = this.buildUpdatePayload(this.rawRecoverySettings, this.recoveryForm.value);
    this.couponsService.updateRecoverySettings(payload).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('Recovery coupon settings saved successfully'));
        this.loadRecoverySettings();
        this.loading.recovery = false;
      },
      error: (err) => {
        console.error('Error saving recovery settings:', err);
        this.toastr.error(this.translate.instant('Failed to save recovery settings'));
        this.loading.recovery = false;
      }
    });
  }

  // Helper getters to get item counts
  getWeekendCount(key: string): number {
    return this.weekendItemsForm?.get(key)?.value?.length || 0;
  }

  getBirthdayCount(key: string): number {
    return this.birthdayItemsForm?.get(key)?.value?.length || 0;
  }
}
