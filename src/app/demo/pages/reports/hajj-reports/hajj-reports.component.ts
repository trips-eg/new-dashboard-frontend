import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { ReportsService } from 'src/app/shared/services/reports.service';
import { HajjSummaryItem, HajjSummaryRequest } from 'src/app/shared/model/reports.model';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { VendorService } from 'src/app/shared/services/vendor.service';

@Component({
  selector: 'app-hajj-reports',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './hajj-reports.component.html',
  styleUrls: ['./hajj-reports.component.scss']
})
export class HajjReportsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reportsService = inject(ReportsService);
  private configureService = inject(ConfigureService);
  private vendorService = inject(VendorService);

  filterForm!: FormGroup;
  reportData: HajjSummaryItem[] = [];
  isLoading = false;
  isExporting = false;
  vendors: any[] = [];

  statusOptions = [
    { label: 'All', value: null },
    { label: 'Pending', value: 0 },
    { label: 'Confirmed', value: 1 },
    { label: 'Completed', value: 2 },
    { label: 'Cancelled', value: 3 },
    { label: 'Refunded', value: 4 }
  ];

  summaryCards = {
    totalBookings: 0,
    totalRevenue: 0,
    vendorTotal: 0,
    tripsTotal: 0
  };

  isVendor = false;

  ngOnInit(): void {
    this.initForm();
    this.checkUserRole();
    this.loadVendors();
  }

  private initForm(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.filterForm = this.fb.group({
      fromDate: [firstDayOfMonth, Validators.required],
      toDate: [today],
      companyId: [null],
      hajjId: [null],
      status: [null]
    });
  }

  private checkUserRole(): void {
    const roles = this.configureService.userRoles();
    this.isVendor = roles.some((role: string) => role.startsWith('Vendor.'));

    if (this.isVendor) {
      const user = this.configureService.parsedUser;
      if (user?.companyId) {
        this.filterForm.patchValue({ companyId: user.companyId });
      }
    }
  }

  private loadVendors(): void {
    if (!this.isVendor) {
      this.vendorService.getAllVendors({ isPagingEnabled: false }).subscribe({
        next: (response: any) => {
          this.vendors = response?.data?.data || response?.data || [];
        },
        error: (err) => console.error('Error loading vendors:', err)
      });
    }
  }

  onSearch(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.filterForm.value;

    const criteria: HajjSummaryRequest = {
      fromDate: this.formatDate(formValue.fromDate),
      toDate: formValue.toDate ? this.formatDate(formValue.toDate) : undefined,
      companyId: formValue.companyId || undefined,
      hajjId: formValue.hajjId || undefined,
      status: formValue.status !== null ? formValue.status : undefined
    };

    this.reportsService.getHajjSummary(criteria).subscribe({
      next: (response: any) => {
        this.reportData = response?.data || [];
        this.calculateSummary();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching report:', err);
        this.reportData = [];
        this.isLoading = false;
      }
    });
  }

  onReset(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.filterForm.reset({
      fromDate: firstDayOfMonth,
      toDate: today,
      companyId: null,
      hajjId: null,
      status: null
    });

    this.reportData = [];
    this.resetSummary();
  }

  private calculateSummary(): void {
    this.summaryCards = this.reportData.reduce(
      (acc, item) => ({
        totalBookings: acc.totalBookings + item.totalBookings,
        totalRevenue: acc.totalRevenue + item.pricePayedTotal,
        vendorTotal: acc.vendorTotal + item.vendorTotal,
        tripsTotal: acc.tripsTotal + item.tripsTotal
      }),
      { totalBookings: 0, totalRevenue: 0, vendorTotal: 0, tripsTotal: 0 }
    );
  }

  private resetSummary(): void {
    this.summaryCards = {
      totalBookings: 0,
      totalRevenue: 0,
      vendorTotal: 0,
      tripsTotal: 0
    };
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString();
  }

  exportToExcel(): void {
    this.isExporting = true;
    setTimeout(() => {
      this.isExporting = false;
    }, 1000);
  }
}
