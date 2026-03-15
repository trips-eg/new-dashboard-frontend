import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { ReportsService } from 'src/app/shared/services/reports.service';
import { OutingSummaryItem, OutingSummaryRequest } from 'src/app/shared/model/reports.model';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { VendorService } from 'src/app/shared/services/vendor.service';

@Component({
  selector: 'app-outing-reports',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './outing-reports.component.html',
  styleUrls: ['./outing-reports.component.scss']
})
export class OutingReportsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reportsService = inject(ReportsService);
  private configureService = inject(ConfigureService);
  private vendorService = inject(VendorService);

  filterForm!: FormGroup;
  reportData: OutingSummaryItem[] = [];
  isLoading = false;
  isExporting = false;
  vendors: any[] = [];
  outings: any[] = [];

  // Status options
  statusOptions = [
    { label: 'All', value: null },
    { label: 'Pending', value: 1 },
    { label: 'Confirmed', value: 2 },
    { label: 'Cancelled', value: 3 },
    { label: 'Completed', value: 4 },
    { label: 'Refunded', value: 5 }
  ];

  // Summary cards data
  summaryCards = {
    totalBookings: 0,
    totalRevenue: 0,
    usedTicketsCount: 0,
    unUsedTicketsCount: 0,
    tripsTotal_Completed: 0,
    vendorTotal_Completed: 0,
    clientPaidTotal_Completed: 0,
    tripsTotal_All: 0,
    vendorTotal_All: 0
  };

  // Check if user is vendor
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
      outingId: [null],
      status: [null]
    });
  }

  private checkUserRole(): void {
    const roles = this.configureService.userRoles();
    this.isVendor = roles.some((role: string) => role.startsWith('Vendor.'));

    if (this.isVendor) {
      // Auto-set vendor's company ID
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

  loadOutings(vendorId: number): void {
    // Load outings when vendor is selected (optional)
  }

  onSearch(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.filterForm.value;

    const criteria: OutingSummaryRequest = {
      fromDate: this.formatDate(formValue.fromDate),
      toDate: formValue.toDate ? this.formatDate(formValue.toDate) : undefined,
      companyId: formValue.companyId || undefined,
      outingId: formValue.outingId || undefined,
      status: formValue.status !== null ? formValue.status : undefined
    };

    this.reportsService.getOutingSummary(criteria).subscribe({
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
      outingId: null,
      status: null
    });

    this.reportData = [];
    this.resetSummary();
  }

  private calculateSummary(): void {
    this.summaryCards = this.reportData.reduce(
      (acc, item) => ({
        totalBookings: acc.totalBookings + item.totalBookings,
        totalRevenue: acc.totalRevenue + item.clientPaidTotal_Completed,
        usedTicketsCount: acc.usedTicketsCount + item.usedTicketsCount,
        unUsedTicketsCount: acc.unUsedTicketsCount + item.unUsedTicketsCount,
        tripsTotal_Completed: acc.tripsTotal_Completed + item.tripsTotal_Completed,
        vendorTotal_Completed: acc.vendorTotal_Completed + item.vendorTotal_Completed,
        clientPaidTotal_Completed: acc.clientPaidTotal_Completed + item.clientPaidTotal_Completed,
        tripsTotal_All: acc.tripsTotal_All + item.tripsTotal_All,
        vendorTotal_All: acc.vendorTotal_All + item.vendorTotal_All
      }),
      {
        totalBookings: 0,
        totalRevenue: 0,
        usedTicketsCount: 0,
        unUsedTicketsCount: 0,
        tripsTotal_Completed: 0,
        vendorTotal_Completed: 0,
        clientPaidTotal_Completed: 0,
        tripsTotal_All: 0,
        vendorTotal_All: 0
      }
    );
  }

  private resetSummary(): void {
    this.summaryCards = {
      totalBookings: 0,
      totalRevenue: 0,
      usedTicketsCount: 0,
      unUsedTicketsCount: 0,
      tripsTotal_Completed: 0,
      vendorTotal_Completed: 0,
      clientPaidTotal_Completed: 0,
      tripsTotal_All: 0,
      vendorTotal_All: 0
    };
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString();
  }

  exportToExcel(): void {
    this.isExporting = true;
    // Export logic can be added here
    setTimeout(() => {
      this.isExporting = false;
    }, 1000);
  }

  // Get severity for status tag
  getStatusSeverity(status: number): string {
    switch (status) {
      case 0:
        return 'warning'; // Pending
      case 1:
        return 'info'; // Confirmed
      case 2:
        return 'success'; // Completed
      case 3:
        return 'danger'; // Cancelled
      case 4:
        return 'secondary'; // Refunded
      default:
        return 'info';
    }
  }
}
