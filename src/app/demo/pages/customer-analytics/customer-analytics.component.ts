import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { CustomerAnalyticsService } from 'src/app/shared/services/customer-analytics.service';
import {
  CustomerAnalyticsData,
  AnalyticsType,
  AnalyticsCustomer,
  CustomersByTypeRequest
} from 'src/app/shared/model/customer-analytics.model';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

interface FunnelStep {
  key: AnalyticsType;
  label: string;
  icon: string;
  colorClass: string;
  count: number;
}

@Component({
  selector: 'app-customer-analytics',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, TranslateModule],
  templateUrl: './customer-analytics.component.html',
  styleUrls: ['./customer-analytics.component.scss']
})
export class CustomerAnalyticsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private configService = inject(ConfigureService);
  private analyticsService = inject(CustomerAnalyticsService);

  filterForm!: FormGroup;
  isLoading = false;
  isVendor = false;
  analyticsData: CustomerAnalyticsData | null = null;

  // Funnel steps
  funnelSteps: FunnelStep[] = [];

  // Conversion metrics
  registeredToBookedPct = 0;
  bookedToPaidPct = 0;

  // Last 7 days
  bookingsLast7Days = 0;
  bookingsLast7DaysPaid = 0;

  // Dialog state
  dialogVisible = false;
  dialogTitle = '';
  dialogType: AnalyticsType = 'registered';
  dialogCustomers: AnalyticsCustomer[] = [];
  dialogLoading = false;
  dialogTotalRecords = 0;
  dialogPageIndex = 1;
  dialogPageSize = 10;
  dialogFirst = 0;

  ngOnInit(): void {
    this.checkUserRole();
    this.initForm();
    this.loadAnalytics();
  }

  private checkUserRole(): void {
    const roles = this.configService.userRoles();
    this.isVendor = roles.some((role: string) => role.startsWith('Vendor.'));
    if (this.isVendor) {
      this.router.navigateByUrl('/unauthorized');
    }
  }

  private initForm(): void {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    this.filterForm = this.fb.group({
      fromDate: [sevenDaysAgo, Validators.required],
      toDate: [today, Validators.required]
    });
  }

  loadAnalytics(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.filterForm.value;

    const request = {
      from: this.formatDate(formValue.fromDate),
      to: this.formatDate(formValue.toDate)
    };

    this.analyticsService.getCustomerAnalytics(request).subscribe({
      next: (response: any) => {
        if (response?.success && response?.data) {
          this.analyticsData = response.data;
          this.buildFunnelSteps();
          this.registeredToBookedPct = response.data.registeredToBookedPercentage || 0;
          this.bookedToPaidPct = response.data.bookedToPaidPercentage || 0;
          this.bookingsLast7Days = response.data.bookingsLast7Days || 0;
          this.bookingsLast7DaysPaid = response.data.bookingsLast7DaysPaid || 0;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching analytics:', err);
        this.isLoading = false;
      }
    });
  }

  private buildFunnelSteps(): void {
    if (!this.analyticsData) return;

    this.funnelSteps = [
      {
        key: 'registered',
        label: 'Registered',
        icon: 'fas fa-user-plus',
        colorClass: 'step-registered',
        count: this.analyticsData.registeredCount
      },
      {
        key: 'loggedIn',
        label: 'Logged In',
        icon: 'fas fa-sign-in-alt',
        colorClass: 'step-loggedin',
        count: this.analyticsData.loggedInCount
      },
      {
        key: 'searched',
        label: 'Searched',
        icon: 'fas fa-search',
        colorClass: 'step-searched',
        count: this.analyticsData.searchedCount
      },
      /*
      {
        key: 'registered', // viewedTrip maps to registered type on backend, keeping for UI
        label: 'Viewed Trip',
        icon: 'fas fa-eye',
        colorClass: 'step-viewed',
        count: this.analyticsData.viewedTripCount
      },
      */
      {
        key: 'booked',
        label: 'Booked',
        icon: 'fas fa-calendar-check',
        colorClass: 'step-booked',
        count: this.analyticsData.bookedCount
      },
      {
        key: 'paid',
        label: 'Paid',
        icon: 'fas fa-credit-card',
        colorClass: 'step-paid',
        count: this.analyticsData.paidCount
      }
    ];
  }

  onReset(): void {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    this.filterForm.reset({
      fromDate: sevenDaysAgo,
      toDate: today
    });

    this.analyticsData = null;
    this.funnelSteps = [];
    this.registeredToBookedPct = 0;
    this.bookedToPaidPct = 0;
    this.bookingsLast7Days = 0;
    this.bookingsLast7DaysPaid = 0;
  }

  // ─── Dialog Methods ────────────────────────────────────

  openCustomerDialog(step: FunnelStep): void {
    this.dialogType = step.key;
    this.dialogTitle = step.label + ' Customers';
    this.dialogPageIndex = 1;
    this.dialogFirst = 0;
    this.dialogVisible = true;
    this.loadDialogCustomers();
  }

  loadDialogCustomers(): void {
    this.dialogLoading = true;
    const formValue = this.filterForm.value;

    const request: CustomersByTypeRequest = {
      from: this.formatDate(formValue.fromDate),
      to: this.formatDate(formValue.toDate),
      type: this.dialogType,
      pageIndex: this.dialogPageIndex,
      pageSize: this.dialogPageSize
    };

    this.analyticsService.getCustomersByAnalyticsType(request).subscribe({
      next: (response: any) => {
        if (response?.success && response?.data) {
          this.dialogCustomers = response.data.data || [];
          this.dialogTotalRecords = response.data.itemsCount || 0;
        }
        this.dialogLoading = false;
      },
      error: (err) => {
        console.error('Error fetching customers:', err);
        this.dialogCustomers = [];
        this.dialogLoading = false;
      }
    });
  }

  onDialogPageChange(event: any): void {
    this.dialogFirst = event.first;
    this.dialogPageIndex = Math.floor(event.first / event.rows) + 1;
    this.dialogPageSize = event.rows;
    this.loadDialogCustomers();
  }

  viewCustomerProfile(customerId: string): void {
    this.dialogVisible = false;
    this.router.navigate(['/customer-details', customerId]);
  }

  baseUrl = environment.imgUrl;

  getCustomerAvatar(customer: AnalyticsCustomer): string {
    if (!customer.imageUrl || customer.imageUrl.includes('Default/avatar') || customer.imageUrl === 'NULL') {
      return '';
    }
    
    const url = customer.imageUrl.trim();
    if (url.startsWith('http')) {
      return url;
    }
    
    const base = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
    return `${base}${url.startsWith('/') ? url.substring(1) : url}`;
  }

  getCustomerInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString();
  }

  // SVG circle helpers for conversion rings
  getCircleDashArray(percentage: number): string {
    const circumference = 2 * Math.PI * 54; // radius = 54
    const filled = (percentage / 100) * circumference;
    return `${filled} ${circumference}`;
  }

  hasSectors(customer: AnalyticsCustomer): boolean {
    return !!(
      (customer.trips && customer.trips.length > 0) ||
      (customer.outings && customer.outings.length > 0) ||
      (customer.hajj && customer.hajj.length > 0) ||
      (customer.rooms && customer.rooms.length > 0)
    );
  }
}
