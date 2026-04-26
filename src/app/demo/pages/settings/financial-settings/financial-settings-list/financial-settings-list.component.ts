import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FinancialService } from 'src/app/shared/services/financial.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-financial-settings-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './financial-settings-list.component.html',
  styleUrl: './financial-settings-list.component.scss'
})
export class FinancialSettingsListComponent implements OnInit {
  // ── Financial Settings ──
  financialSettingsList: any[] = [];
  clonedRows: { [s: string]: any } = {};

  // ── User / Bonus Settings ──
  userSettingsList: any[] = [];
  clonedUserRows: { [s: string]: any } = {};

  // ── InstaPay Details ──
  instaPayDetails: any = null;

  constructor(
    private financialService: FinancialService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadFinancialSettings();
    this.loadUserSettings();
    this.loadInstaPayDetails();
  }

  // ── Financial Settings ──
  loadFinancialSettings(): void {
    this.financialService.getAllFinancialSettings().subscribe({
      next: (res) => {
        this.financialSettingsList = res.data;
      },
      error: () => {
        this.toastrService.error('Failed to load financial settings', 'Error');
      }
    });
  }

  onRowEditInit(product: any): void {
    this.clonedRows[product.id] = { ...product };
  }

  onRowEditSave(product: any): void {
    const payload = [{ id: product.id, value: product.value }];
    this.financialService.updateFinancialSetting(payload).subscribe({
      next: (res) => {
        delete this.clonedRows[product.id];
        this.toastrService.success(res.message, 'Success');
      },
      error: () => {
        this.toastrService.error('Update failed', 'Error');
        this.onRowEditCancel(product, this.financialSettingsList.indexOf(product));
      }
    });
  }

  onRowEditCancel(product: any, index: number): void {
    this.financialSettingsList[index] = this.clonedRows[product.id];
    delete this.clonedRows[product.id];
  }

  // ── User / Bonus Settings ──
  loadUserSettings(): void {
    this.financialService.getUserSettings().subscribe({
      next: (res) => {
        this.userSettingsList = res.data;
      },
      error: () => {
        this.toastrService.error('Failed to load user settings', 'Error');
      }
    });
  }

  onUserRowEditInit(setting: any): void {
    this.clonedUserRows[setting.id] = { ...setting };
  }

  onUserRowEditSave(setting: any): void {
    const payload = [{ id: setting.id, value: setting.value }];
    this.financialService.updateUserSettings(payload).subscribe({
      next: (res) => {
        delete this.clonedUserRows[setting.id];
        this.toastrService.success(res.message || 'Updated successfully', 'Success');
      },
      error: () => {
        this.toastrService.error('Update failed', 'Error');
        this.onUserRowEditCancel(setting, this.userSettingsList.indexOf(setting));
      }
    });
  }

  onUserRowEditCancel(setting: any, index: number): void {
    this.userSettingsList[index] = this.clonedUserRows[setting.id];
    delete this.clonedUserRows[setting.id];
  }

  // ── InstaPay Details ──
  loadInstaPayDetails(): void {
    this.financialService.getInstaPayDetails().subscribe({
      next: (res) => {
        this.instaPayDetails = res.data;
      },
      error: () => {
        this.toastrService.error('Failed to load InstaPay details', 'Error');
      }
    });
  }
}
