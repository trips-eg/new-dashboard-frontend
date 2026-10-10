import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomerFinancialSummaryComponent } from 'src/app/shared/components/customer-financial-summary/customer-financial-summary.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { CustomerAnalyticsService } from 'src/app/shared/services/customer-analytics.service';
import {
  CustomerAnalyticsData,
  AnalyticsType,
  AnalyticsCustomer,
  CustomersByTypeRequest
} from 'src/app/shared/model/customer-analytics.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BookingFinancialsDto } from 'src/app/shared/model/booking-financials.model';
import { environment } from 'src/environments/environment';

export interface SearchHistoryItem {
  id: number;
  query: string;
  language: string;
  resultCount: number;
  searchDate: string;
}

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
  imports: [SharedModule, RouterLink, TranslateModule, CustomerFinancialSummaryComponent],
  templateUrl: './customer-analytics.component.html',
  styleUrls: ['./customer-analytics.component.scss']
})
export class CustomerAnalyticsComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private configService = inject(ConfigureService);
  private analyticsService = inject(CustomerAnalyticsService);
  private translate = inject(TranslateService);

  filterForm!: FormGroup;
  isLoading = false;
  isVendor = false;
  analyticsData: CustomerAnalyticsData | null = null;
  appliedPeriod: { from: string; to: string } | null = null;
  analyticsError = '';
  dialogError = '';
  private analyticsSubscription?: Subscription;
  private dialogSubscription?: Subscription;
  datePreset: 'week' | 'month' | 'thisMonth' | 'custom' = 'week';
  readonly datePresets = ['week', 'month', 'thisMonth'] as const;

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
  dialogType: AnalyticsType = 'registered';
  dialogCustomers: AnalyticsCustomer[] = [];
  dialogLoading = false;
  dialogTotalRecords = 0;
  dialogPageIndex = 1;
  dialogPageSize = 10;
  dialogFirst = 0;
  dialogExpandedRows: Record<string, boolean> = {};

  get locale(): string {
    return this.translate.currentLang === 'ar' ? 'ar-EG' : 'en-US';
  }

  get dialogLabel(): string {
    return this.funnelSteps.find((step) => step.key === this.dialogType)?.label ?? 'Registered';
  }

  get filtersChanged(): boolean {
    if (!this.appliedPeriod || !this.filterForm?.valid) return false;
    return (
      this.formatDate(this.filterForm.value.fromDate) !== this.appliedPeriod.from ||
      this.formatDate(this.filterForm.value.toDate) !== this.appliedPeriod.to
    );
  }

  applyDatePreset(preset: 'week' | 'month' | 'thisMonth'): void {
    const to = new Date();
    const from = new Date(to);
    if (preset === 'thisMonth') {
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
    } else {
      from.setDate(from.getDate() - (preset === 'week' ? 7 : 30));
    }
    this.datePreset = preset;
    this.filterForm.patchValue({ fromDate: from, toDate: to });
    this.loadAnalytics();
  }

  financialAmount(customer: AnalyticsCustomer, key: keyof BookingFinancialsDto): number | null {
    const value = customer.financials?.[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  expandDialogPage(): void {
    this.dialogExpandedRows = Object.fromEntries(this.dialogCustomers.map((customer) => [customer.id, true]));
  }

  collapseDialogPage(): void {
    this.dialogExpandedRows = {};
  }

  ngOnInit(): void {
    this.checkUserRole();
    if (this.isVendor) return;
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
    if (this.isVendor) return;
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    const formValue = this.filterForm.value;
    if (formValue.fromDate > formValue.toDate) {
      this.analyticsError = 'CustomerFinancials.invalidPeriod';
      return;
    }

    const request = {
      from: this.formatDate(formValue.fromDate),
      to: this.formatDate(formValue.toDate)
    };

    this.analyticsSubscription?.unsubscribe();
    this.dialogSubscription?.unsubscribe();
    this.dialogVisible = false;
    this.isLoading = true;
    this.analyticsError = '';
    this.analyticsData = null;
    this.appliedPeriod = null;

    this.analyticsSubscription = this.analyticsService.getCustomerAnalytics(request).subscribe({
      next: (response: any) => {
        if (response?.success && response?.data) {
          this.analyticsData = response.data;
          this.appliedPeriod = request;
          this.buildFunnelSteps();
          this.registeredToBookedPct = response.data.registeredToBookedPercentage || 0;
          this.bookedToPaidPct = response.data.bookedToPaidPercentage || 0;
          this.bookingsLast7Days = response.data.bookingsLast7Days || 0;
          this.bookingsLast7DaysPaid = response.data.bookingsLast7DaysPaid || 0;
        } else {
          this.analyticsError = 'CustomerFinancials.analyticsError';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching analytics:', err);
        this.analyticsError = err.status === 401 ? 'CustomerFinancials.sessionExpired' : 'CustomerFinancials.analyticsError';
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
    this.datePreset = 'week';
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
    this.loadAnalytics();
  }

  ngOnDestroy(): void {
    this.analyticsSubscription?.unsubscribe();
    this.dialogSubscription?.unsubscribe();
  }

  // ─── Dialog Methods ────────────────────────────────────

  openCustomerDialog(step: FunnelStep): void {
    this.dialogType = step.key;
    this.dialogPageIndex = 1;
    this.dialogFirst = 0;
    this.dialogVisible = true;
    this.loadDialogCustomers();
  }

  loadDialogCustomers(): void {
    if (!this.appliedPeriod) return;
    this.dialogSubscription?.unsubscribe();
    this.dialogLoading = true;
    this.dialogError = '';
    this.dialogCustomers = [];
    this.dialogTotalRecords = 0;
    this.dialogExpandedRows = {};

    const request: CustomersByTypeRequest = {
      from: this.appliedPeriod.from,
      to: this.appliedPeriod.to,
      type: this.dialogType,
      pageIndex: this.dialogPageIndex,
      pageSize: this.dialogPageSize
    };

    this.dialogSubscription = this.analyticsService.getCustomersByAnalyticsType(request).subscribe({
      next: (response: any) => {
        if (response?.success && response?.data) {
          this.dialogCustomers = response.data.data || [];
          this.dialogTotalRecords = response.data.itemsCount || 0;
        } else {
          this.dialogError = 'CustomerFinancials.customersError';
        }
        this.dialogLoading = false;
      },
      error: (err) => {
        console.error('Error fetching customers:', err);
        this.dialogCustomers = [];
        this.dialogError = err.status === 401 ? 'CustomerFinancials.sessionExpired' : 'CustomerFinancials.customersError';
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

  hasSectors(customer: AnalyticsCustomer): boolean {
    return !!(
      (customer.trips && customer.trips.length > 0) ||
      (customer.outings && customer.outings.length > 0) ||
      (customer.hajj && customer.hajj.length > 0) ||
      (customer.rooms && customer.rooms.length > 0)
    );
  }

  hasDetails(customer: any): boolean {
    const history = this.getSearchHistory(customer);
    if (this.dialogType === 'searched') {
      return history.length > 0;
    }
    return this.hasSectors(customer);
  }

  getSearchHistory(customer: any): SearchHistoryItem[] {
    return customer.searchHistory || customer.searchHistories || [];
  }
}
