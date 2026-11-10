import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastrService } from 'ngx-toastr';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { ReferralRow, ReferralService, ReferralSettings } from 'src/app/shared/services/referral.service';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

export const REFERRALS_EDIT_PERMISSION = 'Permissions.HomeContent.Edit';

/** "ادعُ صحابك" (app 1.0.51): the amounts and rules, and who invited whom. */
@Component({
  selector: 'app-referrals',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, InputSwitchModule, SubHeaderComponent],
  templateUrl: './referrals.component.html',
  styleUrl: './referrals.component.scss'
})
export class ReferralsComponent implements OnInit {
  settings: ReferralSettings | null = null;
  rows: ReferralRow[] = [];
  count = 0;
  rewarded = 0;
  paidOut = 0;
  pageIndex = 1;
  readonly pageSize = 20;
  loading = false;
  saving = false;
  canEdit = false;
  error: string | null = null;

  constructor(
    private referrals: ReferralService,
    private toastr: ToastrService,
    private configService: ConfigureService
  ) {}

  ngOnInit(): void {
    this.canEdit = (this.configService.userPermissions() || []).includes(REFERRALS_EDIT_PERMISSION);
    this.load();
  }

  load(page = this.pageIndex): void {
    this.loading = true;
    this.error = null;
    this.referrals.get(page, this.pageSize).subscribe({
      next: (data) => {
        this.settings = { ...data.settings };
        this.rows = data.rows ?? [];
        this.count = data.count ?? 0;
        this.rewarded = data.rewarded ?? 0;
        this.paidOut = data.paidOut ?? 0;
        this.pageIndex = page;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'مقدرناش نحمّل الدعوات، جرّب تاني';
      }
    });
  }

  get pages(): number {
    return Math.max(1, Math.ceil(this.count / this.pageSize));
  }

  get valid(): boolean {
    const s = this.settings;
    return (
      !!s &&
      s.inviterAmount >= 0 &&
      s.inviterAmount <= 5000 &&
      s.inviteeAmount >= 0 &&
      s.inviteeAmount <= 5000 &&
      (s.inviteeCreditType === 1 || s.inviteeCreditType === 2) &&
      s.minFirstBookingAmount >= 0 &&
      s.maxRewardsPerMonth >= 0 &&
      s.maxRewardsPerMonth <= 1000 &&
      s.applyWithinDays >= 1 &&
      s.applyWithinDays <= 90
    );
  }

  save(): void {
    if (!this.settings || !this.canEdit || !this.valid || this.saving) return;
    this.saving = true;
    this.referrals.saveSettings(this.settings).subscribe({
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
}
