import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastrService } from 'ngx-toastr';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { AppRatingAdmin, AppRatingRow, AppRatingService, AppRatingSettings } from 'src/app/shared/services/app-rating.service';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

export const APP_RATING_EDIT_PERMISSION = 'Permissions.HomeContent.Edit';

/** The customer app's rating popup (app 1.0.51): when it shows, and what customers rated. */
@Component({
  selector: 'app-app-rating',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, InputSwitchModule, SubHeaderComponent],
  templateUrl: './app-rating.component.html',
  styleUrl: './app-rating.component.scss'
})
export class AppRatingComponent implements OnInit {
  settings: AppRatingSettings | null = null;
  summary: AppRatingAdmin['summary'] | null = null;
  rows: AppRatingRow[] = [];
  total = 0;
  pageIndex = 1;
  readonly pageSize = 20;
  stars: number | null = null;
  loading = false;
  saving = false;
  canEdit = false;
  error: string | null = null;
  readonly starFilters = [null, 5, 4, 3, 2, 1];

  constructor(
    private ratings: AppRatingService,
    private toastr: ToastrService,
    private configService: ConfigureService
  ) {}

  ngOnInit(): void {
    this.canEdit = (this.configService.userPermissions() || []).includes(APP_RATING_EDIT_PERMISSION);
    this.load();
  }

  load(page = this.pageIndex): void {
    this.loading = true;
    this.error = null;
    this.ratings.get(page, this.pageSize, this.stars).subscribe({
      next: (data) => {
        this.settings = { ...data.settings };
        this.summary = data.summary;
        this.rows = data.ratings?.data ?? [];
        this.total = data.ratings?.itemsCount ?? data.ratings?.count ?? 0;
        this.pageIndex = page;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'مقدرناش نحمّل التقييمات، جرّب تاني';
      }
    });
  }

  filter(stars: number | null): void {
    this.stars = stars;
    this.load(1);
  }

  get pages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  get valid(): boolean {
    const s = this.settings;
    return !!s && s.daysAfterInstall >= 0 && s.daysAfterInstall <= 365 && s.snoozeDays >= 1 && s.snoozeDays <= 365
      && s.storeMinStars >= 1 && s.storeMinStars <= 5;
  }

  save(): void {
    if (!this.settings || !this.canEdit || !this.valid || this.saving) return;
    this.saving = true;
    this.ratings.saveSettings(this.settings).subscribe({
      next: (saved) => {
        this.settings = { ...saved };
        this.saving = false;
        this.toastr.success('اتحفظت الإعدادات');
      },
      error: (err) => {
        this.saving = false;
        this.toastr.error(err?.error?.message || 'مقدرناش نحفظ، جرّب تاني');
      }
    });
  }

  get roundedAverage(): number {
    return Math.round(this.summary?.average ?? 0);
  }

  starsText(n: number): string {
    return '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n));
  }

  percent(n: number): number {
    return this.summary && this.summary.count ? Math.round((n / this.summary.count) * 100) : 0;
  }
}
