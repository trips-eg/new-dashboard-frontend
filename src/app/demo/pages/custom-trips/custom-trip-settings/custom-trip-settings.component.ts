import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { CustomTripsService } from 'src/app/shared/services/custom-trips.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { ICustomTripSetting } from 'src/app/shared/model/icustom-trip';

@Component({
  selector: 'app-custom-trip-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule, SubHeaderComponent, TranslateModule],
  templateUrl: './custom-trip-settings.component.html',
  styleUrl: './custom-trip-settings.component.scss'
})
export class CustomTripSettingsComponent implements OnInit {
  fb = inject(FormBuilder);
  customTripsService = inject(CustomTripsService);
  toastr = inject(ToastrService);
  translate = inject(TranslateService);
  router = inject(Router);
  configService = inject(ConfigureService);

  lang = this.translate.currentLang;

  settingsForm: FormGroup = this.fb.group({
    settings: this.fb.array([])
  });

  isLoading = false;
  isSaving = false;

  get settingsArray(): FormArray {
    return this.settingsForm.get('settings') as FormArray;
  }

  ngOnInit(): void {
    const roles = this.configService.userRoles();
    const isVendor = roles.some((role: string) => role.startsWith('Vendor.'));
    if (isVendor) {
      this.router.navigateByUrl('/unauthorized');
      return;
    }

    this.translate.onLangChange.subscribe(() => {
      this.lang = this.translate.currentLang;
    });
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.customTripsService.getSettings().subscribe({
      next: (res) => {
        const settings: ICustomTripSetting[] = res?.data || res || [];
        this.settingsArray.clear();
        settings.forEach((s) => {
          this.settingsArray.push(
            this.fb.group({
              id: [s.id],
              value: [s.value, [Validators.required, Validators.min(0)]],
              nameEn: [s.nameEn || ''],
              nameAr: [s.nameAr || '']
            })
          );
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching custom trip settings:', err);
        this.toastr.error(this.translate.instant('Failed to load settings'));
        this.isLoading = false;
      }
    });
  }

  settingName(group: AbstractControl): string {
    return this.lang === 'ar' ? group.get('nameAr')?.value : group.get('nameEn')?.value;
  }

  setDays(group: AbstractControl, days: number): void {
    group.get('value')?.setValue(days);
    group.get('value')?.markAsDirty();
    this.settingsForm.markAsDirty();
  }

  stepDays(group: AbstractControl, delta: number): void {
    const current = Number(group.get('value')?.value) || 0;
    const next = Math.max(1, current + delta);
    group.get('value')?.setValue(next);
    group.get('value')?.markAsDirty();
    this.settingsForm.markAsDirty();
  }

  get hasChanges(): boolean {
    return this.settingsForm.dirty;
  }

  save(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    const payload = this.settingsArray.value.map((g: any) => ({ id: g.id, value: g.value }));
    this.customTripsService.updateSettings(payload).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('Custom trip settings saved successfully'));
        this.isSaving = false;
        this.loadSettings();
      },
      error: (err) => {
        console.error('Error saving custom trip settings:', err);
        this.toastr.error(err?.error?.message || this.translate.instant('Failed to save settings'));
        this.isSaving = false;
      }
    });
  }
}
