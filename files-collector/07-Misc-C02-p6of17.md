# 07 – Misc (Part 6/17 of Misc)

> **Description:** Everything else that didn't fit the categories above. [Category: C02]
> **Generated:** 2026-03-02 20:16:48

---

## `src/app/demo/pages/reports/travel-reports/travel-reports.component.html`

```html
<div class="reports-container">
  <sub-header [mainHeader]="'Travel Reports'"></sub-header>

  <!-- Filter Card -->
  <div class="filter-card card mb-4">
    <div class="card-body">
      <div class="filter-header mb-3">
        <h5 class="m-0">
          <i class="fas fa-filter me-2 text-primary"></i>
          {{ 'Filter Options' | translate }}
        </h5>
      </div>

      <form [formGroup]="filterForm" class="filter-form">
        <div class="grid">
          <div class="col-12 col-md-6 col-lg-3">
            <div class="field">
              <label for="fromDate" class="font-medium">
                {{ 'From Date' | translate }}
                <span class="text-danger">*</span>
              </label>
              <p-calendar
                id="fromDate"
                formControlName="fromDate"
                [showIcon]="true"
                [showButtonBar]="true"
                dateFormat="dd/mm/yy"
                [style]="{ width: '100%' }"
                [inputStyle]="{ width: '100%' }"
              ></p-calendar>
            </div>
          </div>

          <div class="col-12 col-md-6 col-lg-3">
            <div class="field">
              <label for="toDate" class="font-medium">{{ 'To Date' | translate }}</label>
              <p-calendar
                id="toDate"
                formControlName="toDate"
                [showIcon]="true"
                [showButtonBar]="true"
                dateFormat="dd/mm/yy"
                [style]="{ width: '100%' }"
                [inputStyle]="{ width: '100%' }"
              ></p-calendar>
            </div>
          </div>

          <div class="col-12 col-md-6 col-lg-3" *ngIf="!isVendor">
            <div class="field">
              <label for="companyId" class="font-medium">{{ 'Vendor' | translate }}</label>
              <p-dropdown
                id="companyId"
                formControlName="companyId"
                [options]="vendors"
                optionLabel="name"
                optionValue="id"
                [showClear]="true"
                [filter]="true"
                filterBy="name"
                [style]="{ width: '100%' }"
                placeholder="{{ 'Select Vendor' | translate }}"
              ></p-dropdown>
            </div>
          </div>

          <div class="col-12 col-md-6 col-lg-3">
            <div class="field">
              <label for="status" class="font-medium">{{ 'Status' | translate }}</label>
              <p-dropdown
                id="status"
                formControlName="status"
                [options]="statusOptions"
                optionLabel="label"
                optionValue="value"
                [showClear]="true"
                [style]="{ width: '100%' }"
                placeholder="{{ 'All Statuses' | translate }}"
              ></p-dropdown>
            </div>
          </div>
        </div>

        <div class="flex justify-content-end gap-2 mt-3">
          <button type="button" pButton class="p-button-outlined p-button-secondary" (click)="onReset()">
            <i class="fas fa-redo me-2"></i>
            {{ 'Reset' | translate }}
          </button>
          <button type="button" pButton class="p-button-primary" [loading]="isLoading" (click)="onSearch()">
            <i class="fas fa-search me-2"></i>
            {{ 'Search' | translate }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Summary Cards -->
  <div class="summary-cards grid mb-4" *ngIf="reportData.length > 0">
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card booking-card">
        <div class="card-content">
          <div class="icon-wrapper bg-primary-light">
            <i class="fas fa-ticket-alt text-primary"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Total Bookings' | translate }}</span>
            <span class="value">{{ summaryCards.totalBookings | number }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card revenue-card">
        <div class="card-content">
          <div class="icon-wrapper bg-success-light">
            <i class="fas fa-dollar-sign text-success"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Total Revenue' | translate }}</span>
            <span class="value">{{ summaryCards.totalRevenue | number: '1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card vendor-card">
        <div class="card-content">
          <div class="icon-wrapper bg-warning-light">
            <i class="fas fa-store text-warning"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Vendor Total' | translate }}</span>
            <span class="value">{{ summaryCards.vendorTotal | number: '1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card trips-card">
        <div class="card-content">
          <div class="icon-wrapper bg-info-light">
            <i class="fas fa-route text-info"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Trips Total' | translate }}</span>
            <span class="value">{{ summaryCards.tripsTotal | number: '1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Data Table -->
  <div class="data-table-card card">
    <div class="card-header flex justify-content-between align-items-center">
      <h5 class="m-0">
        <i class="fas fa-table me-2 text-primary"></i>
        {{ 'Travel Summary' | translate }}
      </h5>
      <button
        type="button"
        pButton
        class="p-button-success p-button-sm"
        [loading]="isExporting"
        (click)="exportToExcel()"
        *ngIf="reportData.length > 0"
      >
        <i class="fas fa-file-excel me-2"></i>
        {{ 'Export' | translate }}
      </button>
    </div>

    <div class="card-body p-0">
      <div class="loading-overlay" *ngIf="isLoading">
        <p-progressSpinner strokeWidth="4"></p-progressSpinner>
      </div>

      <div class="empty-state" *ngIf="!isLoading && reportData.length === 0">
        <div class="empty-content">
          <i class="fas fa-plane fa-4x text-muted mb-3"></i>
          <h5>{{ 'No Data Found' | translate }}</h5>
          <p class="text-muted">{{ 'Use the filters above to search for travel reports' | translate }}</p>
        </div>
      </div>

      <p-table
        [value]="reportData"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[10, 25, 50]"
        [showCurrentPageReport]="true"
        styleClass="p-datatable-striped p-datatable-gridlines"
        *ngIf="!isLoading && reportData.length > 0"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="travelName">
              {{ 'Travel Name' | translate }}
              <p-sortIcon field="travelName"></p-sortIcon>
            </th>
            <th pSortableColumn="vendorName">
              {{ 'Vendor' | translate }}
              <p-sortIcon field="vendorName"></p-sortIcon>
            </th>
            <th class="text-center">{{ 'Total Bookings' | translate }}</th>
            <th class="text-center">{{ 'Booking Status' | translate }}</th>
            <th class="text-end">{{ 'Revenue' | translate }}</th>
            <th class="text-end">{{ 'Vendor Total' | translate }}</th>
            <th class="text-end">{{ 'Trips Total' | translate }}</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-item>
          <tr>
            <td>
              <div class="travel-info">
                <span class="travel-name font-semibold">{{ item.tripName }}</span>
                <small class="text-muted">#{{ item.tripId }}</small>
              </div>
            </td>
            <td>{{ item.vendorName }}</td>
            <td class="text-center">
              <span class="badge badge-primary">{{ item.totalBookings }}</span>
            </td>
            <td>
              <div class="status-badges">
                <p-tag
                  *ngIf="item.pendingCount > 0"
                  severity="warning"
                  [value]="'Pending: ' + item.pendingCount"
                  [rounded]="true"
                  class="me-1 mb-1"
                ></p-tag>
                <p-tag
                  *ngIf="item.confirmedCount > 0"
                  severity="info"
                  [value]="'Confirmed: ' + item.confirmedCount"
                  [rounded]="true"
                  class="me-1 mb-1"
                ></p-tag>
                <p-tag
                  *ngIf="item.completedCount > 0"
                  severity="success"
                  [value]="'Completed: ' + item.completedCount"
                  [rounded]="true"
                  class="me-1 mb-1"
                ></p-tag>
                <p-tag
                  *ngIf="item.cancelledCount > 0"
                  severity="danger"
                  [value]="'Cancelled: ' + item.cancelledCount"
                  [rounded]="true"
                  class="me-1 mb-1"
                ></p-tag>
                <p-tag
                  *ngIf="item.refundedCount > 0"
                  severity="secondary"
                  [value]="'Refunded: ' + item.refundedCount"
                  [rounded]="true"
                  class="mb-1"
                ></p-tag>
              </div>
            </td>
            <td class="text-end font-semibold text-success">{{ item.clientPaid_Completed | number: '1.2-2' }}</td>
            <td class="text-end">{{ item.vendorProfit_Completed | number: '1.2-2' }}</td>
            <td class="text-end">{{ item.tripsProfit_Completed | number: '1.2-2' }}</td>
          </tr>
        </ng-template>

        <ng-template pTemplate="footer">
          <tr class="summary-row">
            <td colspan="2" class="font-bold text-end">{{ 'Totals:' | translate }}</td>
            <td class="text-center font-bold">{{ summaryCards.totalBookings | number }}</td>
            <td></td>
            <td class="text-end font-bold text-success">{{ summaryCards.totalRevenue | number: '1.2-2' }}</td>
            <td class="text-end font-bold">{{ summaryCards.vendorTotal | number: '1.2-2' }}</td>
            <td class="text-end font-bold">{{ summaryCards.tripsTotal | number: '1.2-2' }}</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  </div>
</div>

```

---

## `src/app/demo/pages/reports/travel-reports/travel-reports.component.scss`

```scss
@import '../outing-reports/outing-reports.component.scss';

```

---

## `src/app/demo/pages/reports/travel-reports/travel-reports.component.ts`

```ts
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { ReportsService } from 'src/app/shared/services/reports.service';
import { TravelSummaryItem, TravelSummaryRequest } from 'src/app/shared/model/reports.model';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { VendorService } from 'src/app/shared/services/vendor.service';

@Component({
  selector: 'app-travel-reports',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './travel-reports.component.html',
  styleUrls: ['./travel-reports.component.scss']
})
export class TravelReportsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reportsService = inject(ReportsService);
  private configureService = inject(ConfigureService);
  private vendorService = inject(VendorService);

  filterForm!: FormGroup;
  reportData: TravelSummaryItem[] = [];
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
      travelId: [null],
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

    const criteria: TravelSummaryRequest = {
      fromDate: this.formatDate(formValue.fromDate),
      toDate: formValue.toDate ? this.formatDate(formValue.toDate) : undefined,
      companyId: formValue.companyId || undefined,
      travelId: formValue.travelId || undefined,
      status: formValue.status !== null ? formValue.status : undefined
    };

    this.reportsService.getTravelSummary(criteria).subscribe({
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
      travelId: null,
      status: null
    });

    this.reportData = [];
    this.resetSummary();
  }

  private calculateSummary(): void {
    this.summaryCards = this.reportData.reduce(
      (acc, item) => ({
        totalBookings: acc.totalBookings + item.totalBookings,
        totalRevenue: acc.totalRevenue + item.clientPaid_Completed,
        vendorTotal: acc.vendorTotal + item.vendorProfit_Completed,
        tripsTotal: acc.tripsTotal + item.tripsProfit_Completed
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

```

---

## `src/app/demo/pages/reservations/all-reservations/all-reservations.component.html`

```html
<div class="main">
  <sub-header [mainHeader]="'all Reservations'"></sub-header>

  @if (!isVendor()) {
    <app-reservation-list></app-reservation-list>
  } @else {
    <p-panel header="{{ 'Reservation History' | translate }}" [toggleable]="true" class="mt-4">
      @if (!permissionsLoaded) {
        <div class="text-center py-5">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
          <p class="mt-3">{{ 'Loading permissions...' | translate }}</p>
        </div>
      } @else {
        <p-tabView>
          @if (hasTravelPermission) {
            <p-tabPanel [header]="'Travel' | translate">
              <ng-template pTemplate="content">
                <app-travel-booking-info
                  [totalRecords]="totalRecorsOfTravel"
                  [consumerTravelDetailReserved]="travelList"
                  (pageChange)="loadTravelData($event)"
                />
              </ng-template>
            </p-tabPanel>
          }

          @if (hasRoomPermission) {
            <p-tabPanel [header]="'Room' | translate">
              <ng-template pTemplate="content">
                <app-room-booking-info
                  [consumerRoomDetailReserved]="roomsList"
                  [totalRecords]="totalRecorsOfRooms"
                  (pageChange)="loadRoomData($event)"
                />
              </ng-template>
            </p-tabPanel>
          }

          @if (hasOutingPermission) {
            <p-tabPanel [header]="'outing' | translate">
              <ng-template pTemplate="content">
                <app-outing-booking-info
                  [consumerOutingDetailReserved]="outingsList"
                  [totalRecords]="totalRecorsOfOutings"
                  (pageChange)="loadOutingData($event)"
                />
              </ng-template>
            </p-tabPanel>
          }

          @if (hasManasikPermission) {
            <p-tabPanel [header]="'hajj-ummrah' | translate">
              <ng-template pTemplate="content">
                <app-manasik-booking-info
                  [consumerHajjDetailReserved]="manasikList"
                  [totalRecords]="totalRecorsOfManasik"
                  (pageChange)="loadManasikData($event)"
                />
              </ng-template>
            </p-tabPanel>
          }
        </p-tabView>
      }
    </p-panel>
  }
</div>

```

---

## `src/app/demo/pages/reservations/all-reservations/all-reservations.component.scss`

```scss

```

---

## `src/app/demo/pages/reservations/all-reservations/all-reservations.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllReservationsComponent } from './all-reservations.component';

describe('AllReservationsComponent', () => {
  let component: AllReservationsComponent;
  let fixture: ComponentFixture<AllReservationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllReservationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/reservations/all-reservations/all-reservations.component.ts`

```ts
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from '../../../../shared/components/sub-header/sub-header.component';
import { ReservationListComponent } from '../hotel/reservation-list/reservation-list.component';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { RoomBookingInfoComponent } from 'src/app/shared/tables-booking-info/room-booking-info/room-booking-info.component';
import { TravelBookingInfoComponent } from 'src/app/shared/tables-booking-info/travel-booking-info/travel-booking-info.component';
import { ReservationsService } from 'src/app/shared/services/reservations.service';
import { OutingBookingInfoComponent } from 'src/app/shared/tables-booking-info/outing-booking-info/outing-booking-info.component';
import { ManasikBookingInfoComponent } from 'src/app/shared/tables-booking-info/manasik-booking-info/manasik-booking-info.component';

@Component({
  selector: 'app-all-reservations',
  standalone: true,
  imports: [
    SharedModule,
    SubHeaderComponent,
    ReservationListComponent,
    RoomBookingInfoComponent,
    TravelBookingInfoComponent,
    OutingBookingInfoComponent,
    ManasikBookingInfoComponent
  ],
  templateUrl: './all-reservations.component.html',
  styleUrl: './all-reservations.component.scss'
})
export class AllReservationsComponent implements OnInit, OnDestroy {
  travelList = [];
  roomsList = [];
  outingsList: any[] = [];
  manasikList: any[] = [];
  totalRecorsOfTravel = 0;
  totalRecorsOfRooms = 0;
  totalRecorsOfOutings = 0;
  totalRecorsOfManasik = 0;

  _ReservationsService = inject(ReservationsService);

  // Vendor permissions
  hasTravelPermission = false;
  hasRoomPermission = false;
  hasOutingPermission = false;
  hasManasikPermission = false;

  // Flag to ensure permissions are loaded before rendering tabs
  permissionsLoaded = false;

  first: number = 0;
  rows: number = 10;
  search: string = '';
  isLoading = false;

  filter = {
    pageIndex: Math.floor(this.first / this.rows) + 1,
    pageSize: this.rows,
    search: this.search
  };

  constructor(
    private ConfigureService: ConfigureService,
    private cdr: ChangeDetectorRef
  ) {}

  isVendor(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }

  ngOnInit(): void {
    console.log('========== Component Initialized ==========');

    // CRITICAL: Reset ALL permissions to false first (to clear any cached state)
    this.hasTravelPermission = false;
    this.hasRoomPermission = false;
    this.hasOutingPermission = false;
    this.hasManasikPermission = false;
    this.permissionsLoaded = false;

    // Clear all data
    this.travelList = [];
    this.roomsList = [];
    this.outingsList = [];
    this.manasikList = [];
    this.totalRecorsOfTravel = 0;
    this.totalRecorsOfRooms = 0;
    this.totalRecorsOfOutings = 0;
    this.totalRecorsOfManasik = 0;

    // Force change detection to clear old tabs
    this.cdr.detectChanges();

    // Now set the correct permissions based on current user
    const user = this.ConfigureService.parsedUser;

    console.log('Current user:', user);

    this.hasTravelPermission = user.isTravelCommission === true;
    this.hasRoomPermission = user.isHotelCommission === true;
    this.hasOutingPermission = user.isOutCommission === true;
    this.hasManasikPermission = user.isHajjCommission === true;

    // Mark permissions as loaded
    this.permissionsLoaded = true;

    console.log('Permissions set:', {
      travel: this.hasTravelPermission,
      room: this.hasRoomPermission,
      outing: this.hasOutingPermission,
      manasik: this.hasManasikPermission
    });

    // Trigger change detection to update the view with correct permissions
    this.cdr.detectChanges();

    // Load data
    if (this.isVendor()) {
      this.loadAllData(this.filter);
    }
  }

  ngOnDestroy(): void {
    // Clean up on component destroy
    this.hasTravelPermission = false;
    this.hasRoomPermission = false;
    this.hasOutingPermission = false;
    this.hasManasikPermission = false;
    this.permissionsLoaded = false;
  }

  loadAllData(filter) {
    this.filter = filter;
    // this.isLoading = true; // Don't trigger global loading for background updates if possible, or handle it differently

    if (this.permissionsLoaded) {
      if (this.hasTravelPermission) this.loadTravelData(filter);
      if (this.hasRoomPermission) this.loadRoomData(filter);
      if (this.hasOutingPermission) this.loadOutingData(filter);
      if (this.hasManasikPermission) this.loadManasikData(filter);
    }
  }

  loadTravelData(filter: any) {
    if (!this.hasTravelPermission) return;
    this._ReservationsService
      .getTravelReservationForVendor(filter)
      .pipe(
        catchError((err) => {
          console.error('Travel error:', err);
          return of({ data: { data: [], itemsCount: 0 } });
        })
      )
      .subscribe((response: any) => {
        this.travelList = response.data?.data || [];
        this.totalRecorsOfTravel = response.data?.itemsCount || 0;
        this.cdr.detectChanges();
      });
  }

  loadRoomData(filter: any) {
    if (!this.hasRoomPermission) return;
    this._ReservationsService
      .getRoomReservationForVendor(filter)
      .pipe(
        catchError((err) => {
          console.error('Room error:', err);
          return of({ data: { data: [], itemsCount: 0 } });
        })
      )
      .subscribe((response: any) => {
        this.roomsList = response.data?.data || [];
        this.totalRecorsOfRooms = response.data?.itemsCount || 0;
        this.cdr.detectChanges();
      });
  }

  loadOutingData(filter: any) {
    if (!this.hasOutingPermission) return;
    this._ReservationsService
      .getOutingReservationForVendor(filter)
      .pipe(
        catchError((err) => {
          console.error('Outing error:', err);
          return of({ data: { data: [], itemsCount: 0 } });
        })
      )
      .subscribe((response: any) => {
        this.outingsList = response.data?.data ?? response.data ?? [];
        this.totalRecorsOfOutings = response.data?.itemsCount ?? (Array.isArray(response.data) ? response.data.length : 0);
        this.cdr.detectChanges();
      });
  }

  loadManasikData(filter: any) {
    if (!this.hasManasikPermission) return;
    this._ReservationsService
      .getManasikReservationForVendor(filter)
      .pipe(
        catchError((err) => {
          console.error('Manasik error:', err);
          return of({ data: { data: [], itemsCount: 0 } });
        })
      )
      .subscribe((response: any) => {
        this.manasikList = response.data?.data ?? response.data ?? [];
        this.totalRecorsOfManasik = response.data?.itemsCount ?? (Array.isArray(response.data) ? response.data.length : 0);
        this.cdr.detectChanges();
      });
  }

  // Helper method if needed to satisfy template calling a generic method
  // But we will change template to call specific ones.
  // getVendorReservationsData is deprecated in favor of specific calls
  getVendorReservationsData(filter) {
    this.loadAllData(filter);
  }
}

```

---

## `src/app/demo/pages/reservations/all-reservations/reservations-list/reservations-list.component.html`

```html
<p>reservations-list works!</p>

```

---

## `src/app/demo/pages/reservations/all-reservations/reservations-list/reservations-list.component.scss`

```scss

```

---

## `src/app/demo/pages/reservations/all-reservations/reservations-list/reservations-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationsListComponent } from './reservations-list.component';

describe('ReservationsListComponent', () => {
  let component: ReservationsListComponent;
  let fixture: ComponentFixture<ReservationsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/reservations/all-reservations/reservations-list/reservations-list.component.ts`

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-reservations-list',
  standalone: true,
  imports: [],
  templateUrl: './reservations-list.component.html',
  styleUrl: './reservations-list.component.scss'
})
export class ReservationsListComponent {

}

```

---

## `src/app/demo/pages/reservations/hotel/hotel-details/room-details.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'Room Details' | translate"
    [mainSection]="'Rooms Management' | translate"
    [subSection]="'Details' | translate"
  ></sub-header>

  <!-- Room Details Section -->
  <div class="border-1 border-solid surface-border border-round mb-4 p-4">
    <div class="grid">
      <!-- Room Images -->
      <div class="col-12 col-md-6">
        <p-galleria
          [value]="getRoomImages(room)"
          [autoPlay]="true"
          [circular]="true"
          [showItemNavigators]="true"
          [thumbnailsPosition]="'bottom'"
          [responsiveOptions]="responsiveOptions"
          [containerStyle]="{ 'max-width': '100%' }"
          [numVisible]="4"
        >
          <ng-template pTemplate="item" let-item>
            <img [src]="item" class="w-full h-20rem border-round" style="object-fit: cover; margin-bottom: 10px" />
          </ng-template>
          <ng-template pTemplate="thumbnail" let-item>
            <div class="grid grid-nogutter justify-content-center">
              <img [src]="item" class="w-7rem h-5rem border-round" style="object-fit: cover" />
            </div>
          </ng-template>
        </p-galleria>
      </div>

      <!-- Room Info -->
      <div class="col-12 col-md-6 pl-4">
        <h2 class="text-3xl mb-2">{{ room.name }}</h2>
        <h3 class="text-orange-500 text-2xl mb-3">{{ room.price  }}</h3>

        <div class="flex align-items-center gap-3 mb-4">
          <p-tag [value]="room.roomType" icon="pi pi-home" severity="info"></p-tag>
          <p-tag [value]="room.boarding" severity="info"><i class="fa-solid fa-utensils me-1"></i></p-tag>
          <p-tag [value]="room.bedType || 'N/A'" severity="success"><i class="fa-solid fa-bed me-1"></i></p-tag>
        </div>

        <p class="text-muted mb-3 line-height-3" [innerHTML]="room.description"></p>

        <p class="text-muted mb-2">
          <i class="pi pi-calendar mr-2"></i>
          {{ 'Availability' | translate }}: {{ room.availableFrom | date: 'mediumDate' }} -
          {{ room.availableTo | date: 'mediumDate' }}
        </p>
        <div class="border-top-1 surface-border pt-3" style="max-height: 180px; overflow: auto">
          <p class="text-muted" [innerHTML]="room.cancellationPolicy">
            <i class="fa-solid fa-stop"></i>
          </p>
        </div>
      </div>
    </div>
    <!-- Features Section -->
    <div class="mt-4 p-3 border-round surface-card">
      <h4 class="text-xl mb-3">{{ 'Room Features' | translate }}</h4>
      <div class="flex flex-wrap gap-2">
        <p-tag *ngFor="let feature of room.features" [value]="feature.name" icon="pi pi-tag" styleClass="mr-2"></p-tag>
      </div>
    </div>
  </div>

  <!-- Room Specifications -->
  <div class="p-card bg-light p-3 border-round">
    <div class="grid">
      <!-- Column 1 -->
      <div class="col-12 col-md-6">
        <div class="flex align-items-center justify-content-between py-3 border-bottom-1 surface-border">
          <strong class="text-900">{{ 'Room Size' | translate }}</strong>
          <p class="m-0">{{ room.size }} m²</p>
        </div>

        <div class="flex align-items-center justify-content-between py-3 border-bottom-1 surface-border">
          <strong class="text-900">{{ 'Bed Count' | translate }}</strong>
          <p class="m-0">{{ room.bedCount }}</p>
        </div>

        <div class="flex align-items-center justify-content-between py-3">
          <strong class="text-900">{{ 'Deposit Rate' | translate }}</strong>
          <p class="m-0">{{ room.depositRate | percent }}</p>
        </div>
      </div>

      <!-- Column 2 -->
      <div class="col-12 col-md-6">
        <div class="flex align-items-center justify-content-between py-3 border-bottom-1 surface-border">
          <strong class="text-900">{{ 'Payment on Arrival' | translate }}</strong>
          <p class="m-0">{{ room.isAllowPaymentUponArrival }}</p>
        </div>

        <div class="flex align-items-center justify-content-between py-3 border-bottom-1 surface-border">
          <strong class="text-900">{{ 'Boarding Type' | translate }}</strong>
          <p class="m-0">{{ room.boarding }}</p>
        </div>

        <div class="flex align-items-center justify-content-between py-3">
          <strong class="text-900">{{ 'Hotel' | translate }}</strong>
          <p class="m-0">{{ room.hotel }}</p>
        </div>
      </div>
    </div>
  </div>
</div>

```

---

## `src/app/demo/pages/reservations/hotel/hotel-details/room-details.component.scss`

```scss
// تنسيقات مخصصة للصور
.p-galleria-thumbnail-item {
  border-radius: 8px;
  overflow: hidden;
}

// تنسيقات التواريخ
.availability-dates {
  background-color: var(--surface-ground);
  padding: 0.5rem;
  border-radius: 6px;
}

// تنسيقات القوائم
.features-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

```

---

## `src/app/demo/pages/reservations/hotel/hotel-details/room-details.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomDetailsComponent } from './room-details.component';

describe('HotelDetailsComponent', () => {
  let component: RoomDetailsComponent;
  let fixture: ComponentFixture<RoomDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/reservations/hotel/hotel-details/room-details.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { RoomService } from 'src/app/shared/services/room.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-room-details',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './room-details.component.html',
  styleUrl: './room-details.component.scss'
})
export class RoomDetailsComponent implements OnInit {
  productStatus: boolean;
  room: any = {};
  roomId: any;
  imgs = [];
  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

  constructor(
    private RoomService: RoomService,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('id');
    console.log(this.roomId);
    this.gettingRoomById(this.roomId);
  }
  gettingRoomById(id) {
    this.RoomService.getRoomById(id).subscribe({
      next: (res) => {
        this.room = res.data;
        this.imgs = res.data.images.map((img) => environment.imgUrl + img.url);
        console.log(this.room);
      }
    });
  }


getRoomImages(room: any) {
  if (room.images?.length) {
    return room.images.map((img: any) => environment.imgUrl + img.url);
  } else if (room.groupImages?.length) {
    return room.groupImages.map((img: any) => environment.imgUrl + img.url);
  } else {
    return ['https://placehold.co/600x400?text=No+Image'];
  }
}


}

```

---

## `src/app/demo/pages/reservations/hotel/hotel-reservation.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'Hotel reservations'"

    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  ></sub-header>
  <app-reservation-list></app-reservation-list>
</div>

```

---

## `src/app/demo/pages/reservations/hotel/hotel-reservation.component.scss`

```scss

```

---

## `src/app/demo/pages/reservations/hotel/hotel-reservation.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelReservationComponent } from './hotel-reservation.component';

describe('HotelReservationComponent', () => {
  let component: HotelReservationComponent;
  let fixture: ComponentFixture<HotelReservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelReservationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/reservations/hotel/hotel-reservation.component.ts`

```ts
import { Component } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from '../../../../shared/components/sub-header/sub-header.component';
import { ReservationListComponent } from './reservation-list/reservation-list.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hotel-reservation',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, ReservationListComponent],
  templateUrl: './hotel-reservation.component.html',
  styleUrl: './hotel-reservation.component.scss'
})
export class HotelReservationComponent {
  constructor(private Router: Router) {}

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToHotelReservationForm();
        break;
    }
  }

  goToHotelReservationForm() {
    console.log('hotel-reservation-step');
    this.Router.navigate(['/hotel-reservation-step']);
  }
}

```

---

## `src/app/demo/pages/reservations/hotel/reservation-form/reservation-form.component.html`

```html
<div class="main">
  <sub-header [mainHeader]="'reservation'" [mainSection]="'reservations'" [subSection]="'reserve hotel'"></sub-header>

  <app-hotel-filter (filterChanged)="onFilterChanged($event)"></app-hotel-filter>

  <div class="container-fluid p-4">
    <div class="row g-4">
      <div class="col-12 col-md-3" *ngFor="let hotel of hotels">
        <div class="card h-100 shadow position-relative">
          <!-- تاج الحالة -->
          <span class="position-absolute top-0 end-0 mt-2 me-2 badge"
                [ngClass]="hotel.status ? 'bg-success' : 'bg-danger'">
            {{ hotel.status ? 'Open' : 'Closed' }}
          </span>

          <!-- الصورة -->
          <img [src]=" 'https://placehold.co/600x400?text=No+Image'"
               class="card-img-top object-fit-cover"
               alt="Hotel Image"
               style="height: 200px">

          <!-- محتوى الكارد -->
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <h2 class="h3 fw-bold mb-0">{{ hotel.name }}</h2>
              <div class="d-flex align-items-center text-warning">
                <i class="fas fa-star fa-xs me-1"></i>
                <span class="medium text-body-secondary">{{ hotel.rating }}</span>
              </div>
            </div>

            <div class="medium text-body-secondary mb-1">
              <i class="fas fa-map-marker-alt me-1"></i>
              {{ hotel.cityName }}, {{ hotel.countryName }}
            </div>

            <p class="card-text small mb-0">{{ hotel.description }}</p>
          </div>

          <div class="card-footer bg-white border-top-0 mt-1">
            <button class="btn btn-primary w-100"
                    (click)="goToRoomlReservationForm(hotel.id)">
              Show Rooms
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- PrimeNG Paginator -->
    <div class="d-flex justify-content-center mt-4">
      <p-paginator
        (onPageChange)="pageChange($event)"
        [first]="first"
        [rows]="rows"
        [totalRecords]="totalRecords"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        [rowsPerPageOptions]="[10, 20,50,100]"
        styleClass="p-paginator"
        [dropdownAppendTo]="'body'">
      </p-paginator>
    </div>
  </div>
</div>

```

---

## `src/app/demo/pages/reservations/hotel/reservation-form/reservation-form.component.scss`

```scss
/* card.component.css */
:host ::ng-deep .p-card {
  border-radius: 0.5rem;
  overflow: hidden;
}



```

---

## `src/app/demo/pages/reservations/hotel/reservation-form/reservation-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationFormComponent } from './reservation-form.component';

describe('ReservationFormComponent', () => {
  let component: ReservationFormComponent;
  let fixture: ComponentFixture<ReservationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/reservations/hotel/reservation-form/reservation-form.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SubHeaderComponent } from '../../../../../shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Ihotel } from 'src/app/shared/model/ihotel';
import { HotelService } from 'src/app/shared/services/hotel.service';

import { HotelFilterComponent } from '../../../../../shared/hotel-filter/hotel-filter.component';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, HotelFilterComponent],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.scss'
})
export class ReservationFormComponent implements OnInit {
  constructor(
    private Router: Router,
    private _HotelService: HotelService
  ) {}

  first = 0;
  rows = 12;
  totalRecords: number = 0;
  searchTerm: string = '';
  hotels: Ihotel[] = [];

  ngOnInit(): void {
    this.gettingAllHotels(this.first, this.rows);
  }

  pageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    const pageIndex = event.first / event.rows + 1;
    this.gettingAllHotels(pageIndex, this.rows, this.searchTerm);
  }

  onSearch() {
    this.first = 0;
    this.gettingAllHotels(this.first, this.rows, this.searchTerm);
  }

  gettingAllHotels(pageIndex: number, pageSize: number, search?: string) {
    this._HotelService.getAllHotels({ pageIndex, pageSize, search }).subscribe({
      next: (res) => {
        this.hotels = res.data.data;
        console.log(this.hotels);
        this.totalRecords = res.data.itemsCount;
      },
      error: (err) => {
        console.error('Error fetching hotels', err);
        this.hotels = [];
        this.totalRecords = 0;
      }
    });
  }

  goToRoomlReservationForm(id) {
    console.log('room-reservation-step');
    this.Router.navigate(['/room-reservation-step', id]);
  }

  getStarsArray(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }
  onFilterChanged(filter: any): void {
    console.log('Filter from child:', filter);
    this._HotelService.getAllHotels(filter).subscribe({
      next: (res) => {
        this.hotels = res.data.data;
        this.totalRecords = res.data.itemsCount;
        console.log(this.hotels);
      },
      error: (err) => {
        console.error('Error fetching hotels:', err);
      }
    });
  }
}

```

---

## `src/app/demo/pages/reservations/hotel/reservation-form/reservation-room-form/reservation-room-form.component.html`

```html
<!-- reservation-room-form.component.html -->
<div class="main">
  <sub-header [mainHeader]="'Available Rooms'" [mainSection]="'Available Hotels'" [subSection]="'Rooms'"></sub-header>

  <div class="container-fluid p-2">
    <div class="row g-4">
      <div *ngFor="let room of hotelRooms" class="col-12 col-md-4">
        <div class="card m-2">
          <!-- Header Image -->
          <img
            alt="Room image"
            [src]="room.images?.length ? room.images[0] : 'https://placehold.co/600x400?text=No+Image'"
            class="card-img-top"
            style="height: 200px; object-fit: cover"
          />

          <!-- Card Body -->
          <div class="card-body">
            <h5 class="card-title">{{ room.hotel }}</h5>

            <div class="row">
              <div class="col-12">
                <h3 class="fs-5 fw-bold mb-2">{{ room.name }}</h3>

                <div class="mb-3">
                  <p class="mb-2">
                    <i class="pi pi-home me-2"></i>
                    {{ room.roomType }} ({{ room.size }} m²)
                  </p>
                  <p class="mb-2">
                    <i class="fas fa-bed me-2"></i>
                    {{ room.bedCount }} Beds · {{ room.bedType || 'N/A' }}
                  </p>
                  <p class="mb-2">
                    <i class="pi pi-calendar me-2"></i>
                    {{ room.availableFrom | date: 'mediumDate' }} - {{ room.availableTo | date: 'mediumDate' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="card-footer">
            <!-- Price & Booking Section -->
            <div class="col-12 border-start ps-3">
              <div class="d-flex flex-column h-100 justify-content-between">
                <div>
                  <span class="fs-3 fw-bold text-primary">
                    {{ room.price }}
                  </span>
                  <small class="d-block text-muted mb-3">per night</small>
                </div>

                <div>
                  <button class="btn btn-primary w-100 mb-2"  (click)="bookRoom(room.id)">
                    <i class="pi pi-check me-2"></i>
                    Book Now
                  </button>

                  <small class="text-muted d-block">Includes: {{ room.boarding }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

```

---

## `src/app/demo/pages/reservations/hotel/reservation-form/reservation-room-form/reservation-room-form.component.scss`

```scss
:host ::ng-deep .p-card {
  height: 100%;
  display: flex;
  flex-direction: column;

  .p-card-body {
    flex-grow: 1;
  }

  .p-card-footer {
    margin-top: auto;
  }
}


```

---

## `src/app/demo/pages/reservations/hotel/reservation-form/reservation-room-form/reservation-room-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationRoomFormComponent } from './reservation-room-form.component';

describe('ReservationRoomFormComponent', () => {
  let component: ReservationRoomFormComponent;
  let fixture: ComponentFixture<ReservationRoomFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationRoomFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationRoomFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/reservations/hotel/reservation-form/reservation-room-form/reservation-room-form.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from '../../../../../../shared/components/sub-header/sub-header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from 'src/app/shared/services/room.service';

@Component({
  selector: 'app-reservation-room-form',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './reservation-room-form.component.html',
  styleUrl: './reservation-room-form.component.scss'
})
export class ReservationRoomFormComponent implements OnInit {
  hotelId: string = null;
  hotelRooms: any = [];
  constructor(
    private Router: Router,
    private route: ActivatedRoute,
    private RoomService: RoomService
  ) {}

  ngOnInit(): void {
    this.hotelId = this.route.snapshot.paramMap.get('id');
    console.log(this.hotelId);
    this.getRoomsByHotelId(this.hotelId);
  }

  getRoomsByHotelId(hotelId) {
    this.RoomService.getAllRooms({ HotelId: hotelId }).subscribe({
      next: (res) => {
        this.hotelRooms = res.data.data;
        console.log(this.hotelRooms);
      }
    });
  }

  bookRoom(room: any): void {
    console.log('Booking room:', room);
    this.Router.navigate(['/room-details-last-step', room]);
  }
}

```

---

## `src/app/demo/pages/reservations/hotel/reservation-list/reservation-list.component.html`

```html
<div class="card">
  <p-toolbar styleClass="mb-4">
    <ng-template pTemplate="left">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText type="text" [(ngModel)]="searchedWord" (input)="onSearch()" [placeholder]="'search' | translate" />
      </span>
    </ng-template>
  </p-toolbar>

  <p-table
    #dt
    [value]="bookings"
    dataKey="id"
    [paginator]="true"
    [rows]="10"
    [rowsPerPageOptions]="[10, 25, 50]"
    [totalRecords]="totalRecords"
    [loading]="isLoading"
    [lazy]="true"
    (onLazyLoad)="loadBookings($event)"
    [showCurrentPageReport]="true"
    [currentPageReportTemplate]="'showingEntries' | translate"
  >
    <ng-template pTemplate="header">
      <tr>
        <th style="width: 3rem"></th>
        <th pSortableColumn="Id" pFrozenColumn>
          {{ 'ID' | translate }}
          <p-sortIcon field="Id"></p-sortIcon>
        </th>
        <th pSortableColumn="User.Name">
          {{ 'Name' | translate }}
          <p-sortIcon field="User.Name"></p-sortIcon>
        </th>
        <th pSortableColumn="User.PhoneNumber">
          {{ 'Phone Number' | translate }}
          <p-sortIcon field="User.PhoneNumber"></p-sortIcon>
        </th>
        <th pSortableColumn="TotalPrice">
          {{ 'Total Pay' | translate }}
          <p-sortIcon field="TotalPrice"></p-sortIcon>
        </th>
        <th pSortableColumn="TotalTax">
          {{ 'Total Tax' | translate }}
          <p-sortIcon field="TotalTax"></p-sortIcon>
        </th>
        <th pSortableColumn="Sataus">
          {{ 'Status' | translate }}
          <p-sortIcon field="Sataus"></p-sortIcon>
        </th>
        <th pSortableColumn="BookingRefernce">
          {{ 'booking Refernce' | translate }}
          <p-sortIcon field="BookingRefernce"></p-sortIcon>
        </th>
        <th pSortableColumn="createdDate">
          {{ 'Date' | translate }}
          <p-sortIcon field="createdDate"></p-sortIcon>
        </th>
        <th>{{ 'Details' | translate }}</th>
      </tr>
      <tr>
        <th></th>
        <th>
          <p-columnFilter type="text" field="Id" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="User.FirstName" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="User.PhoneNumber" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="TotalPrice" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="TotalTax" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="Sataus" matchMode="equals" display="row" [showMenu]="false">
            <ng-template pTemplate="filter" let-value let-filter="filterCallback">
              <p-dropdown
                [ngModel]="value"
                [options]="paymentStatus"
                (onChange)="filter($event.value)"
                placeholder="Select Status"
                [showClear]="true"
                optionValue="value"
                appendTo="body"
              >
                <ng-template let-option pTemplate="item">
                  {{ lang === 'ar' ? option.nameAr : option.nameEn }}
                </ng-template>
                <ng-template let-selectedOption pTemplate="selectedItem">
                  {{ lang === 'ar' ? selectedOption.nameAr : selectedOption.nameEn }}
                </ng-template>
              </p-dropdown>
            </ng-template>
          </p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="BookingRefernce" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="date" field="createdDate" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th></th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-payment let-expanded="expanded">
      <tr>
        <td>
          <button
            type="button"
            pButton
            pRipple
            [pRowToggler]="payment"
            class="p-button-text p-button-rounded p-button-plain"
            [icon]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
            *ngIf="hasReservations(payment)"
          ></button>
        </td>
        <td>{{ payment.id }}</td>
        <td>
          <a [routerLink]="['/customer-details', payment.user?.id]" class="text-primary text-decoration-none fw-bold">
            {{ payment.user?.name }}
          </a>
        </td>
        <td>{{ payment.user?.phoneNumber }}</td>
        <td>{{ payment.totalPrice }}</td>
        <td>{{ payment.totalTax }}</td>
        <td>
          <span [class]="'status-badge ' + getStatusClass(payment.bookingStatus || payment.sataus)">
            {{ getStatusLabel(payment.bookingStatus || payment.sataus) }}
          </span>
        </td>
        <td class="font-bold">{{ payment.bookingRefernce }}</td>
        <td>{{ payment.bookingDate || payment.createdDate | date: 'dd MMM yyyy, h:mm a' }}</td>
        <td>
          <button
            pButton
            icon="pi pi-eye"
            class="p-button-rounded p-button-text p-button-info"
            (click)="goToInfo(payment.id)"
            [pTooltip]="'View Details' | translate"
            tooltipPosition="top"
          ></button>
        </td>
      </tr>
    </ng-template>

    <ng-template pTemplate="rowexpansion" let-payment>
      <tr>
        <td colspan="10">
          <div class="p-3">
            <div *ngIf="payment.tripReservations?.length" class="mb-3">
              <h5>{{ 'Trip Reservations' | translate }}</h5>
              <p-table [value]="payment.tripReservations" dataKey="id">
                <ng-template pTemplate="header">
                  <tr>
                    <th style="width: 25%">{{ 'Trip Name' | translate }}</th>
                    <th style="width: 25%">{{ 'Company' | translate }}</th>
                    <th style="width: 25%">{{ 'Count Details' | translate }}</th>
                    <th style="width: 25%">{{ 'Status' | translate }}</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-trip>
                  <tr>
                    <td>
                      <a [routerLink]="['/travel-details', trip.trip?.id]" class="text-primary text-decoration-none fw-bold">
                        {{ trip.trip?.name }}
                      </a>
                    </td>
                    <td>
                      <a [routerLink]="['/vendor-details', trip.companyDto?.id]" class="text-primary text-decoration-none">
                        {{ trip.companyDto?.name }}
                      </a>
                    </td>
                    <td>
                      <div class="flex gap-2 justify-content-center">
                        <span class="badge bg-primary text-white px-2 py-1 rounded">Adults: {{ trip.countDetails?.adults || 0 }}</span>
                        <span class="badge bg-info text-white px-2 py-1 rounded">Childs: {{ trip.countDetails?.childs || 0 }}</span>
                        <span class="badge bg-success text-white px-2 py-1 rounded font-bold">
                          Total: {{ trip.countDetails?.total || 0 }}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span [ngClass]="getStatusClass(trip.status)" class="status-badge">
                        {{ getStatusLabel(trip.status) }}
                      </span>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>

            <div *ngIf="payment.outingReservations?.length" class="mb-3">
              <h5>{{ 'Outing Reservations' | translate }}</h5>
              <p-table [value]="payment.outingReservations" dataKey="id">
                <ng-template pTemplate="header">
                  <tr>
                    <th>{{ 'Outing Name' | translate }}</th>
                    <th>{{ 'Company' | translate }}</th>
                    <th>{{ 'from' | translate }}</th>
                    <th>{{ 'to' | translate }}</th>
                    <th>{{ 'startTime' | translate }}</th>
                    <th>{{ 'endTime' | translate }}</th>
                    <th>{{ 'Count Details' | translate }}</th>
                    <th>{{ 'Status' | translate }}</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-outing>
                  <tr>
                    <td>
                      <a [routerLink]="['/outing-details', outing.outing?.id]" class="text-primary text-decoration-none fw-bold">
                        {{ outing.outing?.name }}
                      </a>
                    </td>
                    <td>
                      <a [routerLink]="['/vendor-details', outing.companyDto?.id]" class="text-primary text-decoration-none">
                        {{ outing.companyDto?.name }}
                      </a>
                    </td>
                    <td>{{ outing.from | date: 'mediumDate' }}</td>
                    <td>{{ outing.to | date: 'mediumDate' }}</td>
                    <td>{{ outing.startTime || '--' }}</td>
                    <td>{{ outing.endTime || '--' }}</td>
                    <td>
                      <div class="flex gap-2 justify-content-center">
                        <span class="badge bg-primary text-white px-2 py-1 rounded">Adults: {{ outing.countDetails?.adults || 0 }}</span>
                        <span class="badge bg-info text-white px-2 py-1 rounded">Childs: {{ outing.countDetails?.childs || 0 }}</span>
                        <span class="badge bg-success text-white px-2 py-1 rounded font-bold">
                          Total: {{ outing.countDetails?.total || 0 }}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span [ngClass]="getStatusClass(outing.status)" class="status-badge">
                        {{ getStatusLabel(outing.status) }}
                      </span>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>

            <div *ngIf="payment.roomBookings?.length" class="mb-3">
              <h5>{{ 'Room Bookings' | translate }}</h5>
              <p-table [value]="payment.roomBookings" dataKey="id">
                <ng-template pTemplate="header">
                  <tr>
                    <th style="width: 25%">{{ 'Hotel Name' | translate }}</th>
                    <th style="width: 25%">{{ 'Company' | translate }}</th>
                    <th style="width: 25%">{{ 'Count Details' | translate }}</th>
                    <th style="width: 25%">{{ 'Status' | translate }}</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-room>
                  <tr>
                    <td>
                      <a [routerLink]="['/room-details-last-step', room.roomId]" class="text-primary text-decoration-none fw-bold">
                        {{ room.hotel }} - {{ room.room }}
                      </a>
                    </td>
                    <td>
                      <a [routerLink]="['/vendor-details', room.companyDto?.id]" class="text-primary text-decoration-none">
                        {{ room.companyDto?.name }}
                      </a>
                    </td>
                    <td>
                      <div class="flex gap-2 justify-content-center">
                        <span class="badge bg-primary text-white px-2 py-1 rounded">Adults: {{ room.adults || 0 }}</span>
                        <span class="badge bg-info text-white px-2 py-1 rounded">Childs: {{ room.childs || 0 }}</span>
                        <span class="badge bg-success text-white px-2 py-1 rounded font-bold">
                          Total: {{ (room.adults || 0) + (room.childs || 0) }}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span [ngClass]="getStatusClass(room.status)" class="status-badge">
                        {{ getStatusLabel(room.status) }}
                      </span>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>

            <div *ngIf="payment.hajjReservations?.length" class="mb-3">
              <h5>{{ 'Hajj Reservations' | translate }}</h5>
              <p-table [value]="payment.hajjReservations" dataKey="id">
                <ng-template pTemplate="header">
                  <tr>
                    <th style="width: 25%">{{ 'Hajj Name' | translate }}</th>
                    <th style="width: 25%">{{ 'Company' | translate }}</th>
                    <th style="width: 25%">{{ 'Count Details' | translate }}</th>
                    <th style="width: 25%">{{ 'Status' | translate }}</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-hajj>
                  <tr>
                    <td>
                      <a [routerLink]="['/details-manasik', hajj.hajj?.id]" class="text-primary text-decoration-none fw-bold">
                        {{ hajj.hajj?.name }}
                      </a>
                    </td>
                    <td>
                      <a [routerLink]="['/vendor-details', hajj.companyDto?.id]" class="text-primary text-decoration-none">
                        {{ hajj.companyDto?.name }}
                      </a>
                    </td>
                    <td>
                      <div class="flex gap-2 justify-content-center">
                        <span class="badge bg-primary text-white px-2 py-1 rounded">Adults: {{ hajj.countDetails?.adults || 0 }}</span>
                        <span class="badge bg-info text-white px-2 py-1 rounded">Childs: {{ hajj.countDetails?.childs || 0 }}</span>
                        <span class="badge bg-success text-white px-2 py-1 rounded font-bold">
                          Total: {{ hajj.countDetails?.total || 0 }}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span [ngClass]="getStatusClass(hajj.status)" class="status-badge">
                        {{ getStatusLabel(hajj.status) }}
                      </span>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          </div>
        </td>
      </tr>
    </ng-template>

    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="10">
          <div class="flex flex-column align-items-center justify-content-center py-5">
            <i class="pi pi-inbox text-500 text-5xl mb-3"></i>
            <span class="text-700 font-medium text-lg">{{ 'No bookings found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/reservations/hotel/reservation-list/reservation-list.component.scss`

```scss
.no-wrap {
  white-space: nowrap; /* Prevents text from wrapping */
  overflow: hidden; /* Hides overflowed text */
  text-overflow: ellipsis; /* Adds ellipsis for truncated text */
  max-width: 150px; /* Adjust this value based on your design */
}

::ng-deep .p-splitbutton {
  border-radius: 1.5rem !important; // يخليه rounded
  font-size: 0.8rem !important; // يصغره
  height: 2.2rem !important; // تصغير الارتفاع لو حبيت
}

::ng-deep .p-splitbutton .p-button {
  padding: 0.3rem 0.6rem !important; // تصغير البادينج الداخلي
  min-width: unset !important;
}

::ng-deep .p-splitbutton .p-splitbutton-menubutton {
  padding: 0.3rem 0.5rem !important;
}
::ng-deep .p-menuitem {
  cursor: pointer;
  
}

::ng-deep .p-menuitem:hover {
  background-color: #e0e0e0 !important; // لون أغمق شوية عند hover
}

::ng-deep .p-menuitem-link:hover {
  background-color: #d0d0d0 !important; // لو عايز التأثير يظهر على اللينك كله
}
/* إخفاء الزر الافتراضي في SplitButton */
::ng-deep .no-default-button .p-splitbutton-defaultbutton {
  display: none !important;
}

/* تعديل المظهر ليكون أنيقًا */
::ng-deep .no-default-button .p-splitbutton-menubutton {
  border-top-left-radius: 6px !important;
  border-bottom-left-radius: 6px !important;
}

// للتأكد من أن المسافة تظهر بشكل صحيح
::ng-deep .p-menuitem-link {
  display: flex !important;
  align-items: center !important;
  gap: 0.75rem !important;
}
// Table styling
:host ::ng-deep .p-datatable-table {
  width: 100%;
}

// Align table headings to left
:host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
  text-align: left !important;
}

// Compact filter row styling
:host ::ng-deep .p-datatable .p-datatable-thead > tr:nth-child(2) > th {
  padding: 0.25rem 0.5rem !important;
  background: #f8f9fa;
}

:host ::ng-deep .p-datatable .p-column-filter-row {
  padding: 0 !important;
}
:host ::ng-deep .p-datatable .p-column-filter-element {
  width: 100%;
}

:host ::ng-deep .p-datatable .p-column-filter-row .p-inputtext {
  padding: 0.35rem 0.5rem !important;
  font-size: 13px;
}

:host ::ng-deep .p-datatable .p-column-filter-row .p-column-filter-menu-button,
:host ::ng-deep .p-datatable .p-column-filter-row .p-column-filter-clear-button {
  width: 1.75rem !important;
  height: 1.75rem !important;
}

// Hide increase/decrease spinner buttons on numeric filters
:host ::ng-deep .p-datatable .p-inputnumber-button-group {
  display: none !important;
}

:host ::ng-deep .p-datatable .p-inputnumber-buttons-stacked .p-inputnumber-input {
  border-radius: 6px !important;
}

```

---

## `src/app/demo/pages/reservations/hotel/reservation-list/reservation-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationListComponent } from './reservation-list.component';

describe('ReservationListComponent', () => {
  let component: ReservationListComponent;
  let fixture: ComponentFixture<ReservationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/reservations/hotel/reservation-list/reservation-list.component.ts`

```ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Ibookings } from 'src/app/shared/model/ibookings';
import { BookingService } from 'src/app/shared/services/booking.service';
import { EnumsService } from 'src/app/shared/services/enums.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';
import { Table, TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.scss'
})
export class ReservationListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  // ✅ Pagination & Filters
  totalRecords = 0;
  isLoading = false;

  // Search global
  searchedWord: string = '';

  // ✅ Data
  bookings: Ibookings[] = [];
  paymentStatus: any[] = [];
  lang: string = 'en';

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private enumsService: EnumsService,
    private translate: TranslateService,
    private route: ActivatedRoute
  ) {
    this.translate.onLangChange.subscribe((event) => {
      this.lang = event.lang;
    });
    this.lang = this.translate.currentLang;
  }

  ngOnInit(): void {
    // Initial load is handled by the table's lazy load event trigger
    this.loadPaymentStatus();
  }

  // ✅ Load bookings using Builder
  loadBookings(event: TableLazyLoadEvent): void {
    this.isLoading = true;
    const payload = TableRequestBuilder.build(event, this.searchedWord);

    this.bookingService.getAllBooking(payload).subscribe({
      next: (res) => {
        this.bookings = res?.data?.data || [];
        this.totalRecords = res?.data?.itemsCount || 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        this.isLoading = false;
      }
    });
  }

  // ✅ Search action (Global)
  onSearch(): void {
    this.dt.reset();
  }

  // ✅ Navigate to details
  goToInfo(id: number): void {
    this.router.navigate(['/payment-info', id]);
  }

  // ✅ Load payment statuses
  private loadPaymentStatus(): void {
    this.enumsService.getPaymentStatus().subscribe({
      next: (res) => {
        this.paymentStatus = res.map((s: any) => ({
          ...s,
          value: s.value.toString()
        }));
      }
    });
  }

  // ✅ CSS Class for status
  getStatusClass(value: number | string): string {
    const classes: any = {
      '1': 'status-pending',
      '2': 'status-confirmed',
      '3': 'status-cancelled',
      '4': 'status-completed',
      '5': 'status-refunded'
    };

    return classes[value.toString()] || 'status-unknown';
  }

  // ✅ Label for status
  getStatusLabel(value: number | string): string {
    const status = this.paymentStatus.find((s) => s.value == value);
    const lang = this.translate.currentLang;
    return status ? (lang === 'ar' ? status.nameAr : status.nameEn) : lang === 'ar' ? 'غير معروف' : 'Unknown';
  }

  // ✅ Check if booking has reservations
  hasReservations(booking: Ibookings): boolean {
    return (
      (booking.tripReservations && booking.tripReservations.length > 0) ||
      (booking.outingReservations && booking.outingReservations.length > 0) ||
      (booking.roomBookings && booking.roomBookings.length > 0) ||
      (booking.hajjReservations && booking.hajjReservations.length > 0)
    );
  }
}

```

---

## `src/app/demo/pages/reservations/overallReservation/overall-reservations/overall-reservations.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="' Reservations'"

  ></sub-header>

<div class="card">
  <p-toolbar styleClass="">
    <ng-template pTemplate="left">
      <span [class]="'p-input-icon-' + (lang === 'ar' ? 'left' : 'right')">
        <i class="pi pi-search"></i>
        <input pInputText type="text"  (input)="searchByName(searchedWord)" [(ngModel)]="searchedWord" placeholder="Search..." />
      </span>
    </ng-template>

  </p-toolbar>
  <!-- <app-table
  [data]="travels"
  [columns]="columns"
  [btnAction]="btnAction"
  [totalRecords]="totalRecords"
  [rows]="pageSize"
  [lazy]="true"
  (eventEmitters)="handleTableAction($event)"
  (onPageChange)="onPageChange($event)"
></app-table> -->

</div>

</div>

```

---

## `src/app/demo/pages/reservations/overallReservation/overall-reservations/overall-reservations.component.scss`

```scss

```

---

## `src/app/demo/pages/reservations/overallReservation/overall-reservations/overall-reservations.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverallReservationsComponent } from './overall-reservations.component';

describe('OverallReservationsComponent', () => {
  let component: OverallReservationsComponent;
  let fixture: ComponentFixture<OverallReservationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverallReservationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverallReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/reservations/overallReservation/overall-reservations/overall-reservations.component.ts`

```ts
import { Component } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-overall-reservations',
  standalone: true,
  imports: [SharedModule,SubHeaderComponent],
  templateUrl: './overall-reservations.component.html',
  styleUrl: './overall-reservations.component.scss'
})
export class OverallReservationsComponent {
  lang:string
  searchedWord:string
  constructor(){

  }
  searchByName(key){

  }

}

```

---

## `src/app/demo/pages/reservations/overallReservation/reservation-details/reservation-details.component.html`

```html
<div class="main">
<sub-header
  [mainHeader]="'Reservation Details'"
  [mainSection]="'Reservations'"
  [subSection]="'Reservation Details'"

></sub-header>
<p-card>
  <div class="grid mx-0">
    <!-- Order Information -->
    <div class="md:col-6">
      <p-panel [header]="'Reserve Information' |translate" class="">
        <div class="col-md-12 row">

         <div class="mb-2 d-flex justify-content-between" >
              <strong>{{ 'Reserve Type' | translate }}: </strong>
              <span class="ms-5">trips ,hotel</span>
            </div>
        <div class="mb-2 d-flex justify-content-between" >
              <strong>{{ 'Reserve Number' | translate }}: </strong>
              <span class="ms-5">ms-123</span>
            </div>
          <div class="mb-2 d-flex justify-content-between" >
              <strong>{{ 'Reserve Status' | translate }}: </strong>
              <span class="ms-5">
                pending
              </span>
            </div>

      <div class="mb-2 d-flex justify-content-between" >
              <strong>{{ 'Reserve Date' | translate }}: </strong>
              <span class="ms-5">
               20 Dec 5
              </span>
            </div>

        <div class="mb-2 d-flex justify-content-between" >
              <strong>{{ 'Commission Status' | translate }}: </strong>
              <span
                class="ms-5"

              >

                  {{ 'transfered' | translate }}


              </span>
            </div>
          </div>

      </p-panel>
    </div>

    <!-- Invoice -->
<div class="md:col-6">
    <p-panel header="{{ 'Invoice' | translate }}" class="">
      <div class="my-1">
        <!-- Subtotal -->
        <div class="mb-2 d-flex justify-content-between">
          <strong>{{ 'SUB TOTAL' | translate }}</strong>
          <span>
           100 $

          </span>
        </div>



        <!-- Total -->
        <div class="mb-2 d-flex justify-content-between">
          <strong>{{ 'TOTAL' | translate }}</strong>
          <span>
            120 $       </span>
        </div>

        <!-- Payment Fees -->
        <div class="mb-2 d-flex justify-content-between" >
          <strong>{{ 'Payment Fees' | translate }}</strong>
          <span>
            1.5$
                 </span>
        </div>

        <!-- Commission Value -->
        <div class="mb-2 d-flex justify-content-between" >
          <strong>{{ 'Commission Value' | translate }}</strong>
          <span>
            10%
                    </span>
        </div>

        <!-- Due Amount -->
        <div class="mb-2 d-flex justify-content-between" >
          <strong>{{ 'Due Amount' | translate }}</strong>
          <span>
           10 $
          </span>
        </div>

        <!-- Card Type -->
        <div class="mb-2 d-flex justify-content-between" >
          <strong>{{ 'Payment Type' | translate }}</strong>
          <span>Visa or  wallet</span>
        </div>


      </div>
    </p-panel>
</div>

    <!-- Customer Info  -->
    <div class="md:col-6">
      <p-panel [header]="'Customer Info' |translate">
        <div class="p-text-sm">
        <div class="mb-2 d-flex justify-content-between" >
            <strong>{{ 'Customer Name' | translate }}: </strong>
            <span class="ms-5">Ahmed</span>
          </div>
        <div class="mb-2 d-flex justify-content-between" >
            <strong>{{ 'Phone Number' | translate }}: </strong>
            <span class="ms-5">01133445566</span>
          </div>
        <div class="mb-2 d-flex justify-content-between" >
            <strong>{{ 'City' | translate }}: </strong>
            <span class="ms-5">cairo</span>
          </div>
        <div class="mb-2 d-flex justify-content-between" >
            <strong>{{ 'Email address' | translate }}: </strong>
            <span class="ms-5">example gmail.com</span>
          </div>

        </div>
      </p-panel>
    </div>


    <!-- Reservation History Table -->
    <div class="col-md-12 mt-4">
     <h4 class="mb-3 text-dark"><strong>{{ 'Reservation History' | translate }}</strong></h4>
      <p-table [value]="" responsiveLayout="scroll">
        <ng-template pTemplate="header">
          <tr>
            <th>{{ '#' | translate }}</th>
            <th>{{ 'Name' | translate }}</th>
            <th>{{ 'Price' | translate }}</th>
            <th>{{ 'Discount' | translate }}</th>
            <th>{{ 'totalCost' | translate }}</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row let-i="rowIndex">
          <tr>
            <td>{{ i + 1 }}</td>
            <td>{{ row.Name }}</td>

            <td>{{ row.price }}</td>
            <td>{{ row.discount }}</td>
            <td>{{ row.totalPrice }}</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  </div>
</p-card>
</div>

```

---

## `src/app/demo/pages/reservations/overallReservation/reservation-details/reservation-details.component.scss`

```scss

```

---

## `src/app/demo/pages/reservations/overallReservation/reservation-details/reservation-details.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationDetailsComponent } from './reservation-details.component';

describe('ReservationDetailsComponent', () => {
  let component: ReservationDetailsComponent;
  let fixture: ComponentFixture<ReservationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/reservations/overallReservation/reservation-details/reservation-details.component.ts`

```ts
import { Component } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-reservation-details',
  standalone: true,
  imports: [SharedModule,SubHeaderComponent],
  templateUrl: './reservation-details.component.html',
  styleUrl: './reservation-details.component.scss'
})
export class ReservationDetailsComponent {

}

```

---

## `src/app/demo/pages/reservations/travels/travel-reservation-form/travel-reservation-form.component.html`

```html
<div class="main">
  <sub-header [mainHeader]="'Travel Reservations'" [mainSection]="'Travel Reservations'" [subSection]="'Reserve Trip'"></sub-header>
  <app-search-dynamic [fields]="searchFields" (submitForm)="onSearchSubmit($event)" (clear)="onClearSearch()"></app-search-dynamic>
  <div class="grid">
    <div class="relative col-12 col-md-3" *ngFor="let trip of trips">
      <div class="absolute top-0 right-0">
        <!-- <p-tag [value]="trip.status ? 'Open' : 'Closed'" [severity]="trip.status ? 'success' : 'danger'"></p-tag> -->
      </div>

      <p-card class="w-full overflow-hidden shadow-4">
        <ng-template pTemplate="header">
          <img src="https://placehold.co/600x400?text=No+Image" alt="trip Image" class="w-full h-40 object-cover" />
        </ng-template>

        <div class="">
          <div class="flex justify-content-between align-items-center mb-1">
            <h2 class="text-lg font-semibold m-0">{{ trip.name }}</h2>
            <div class="flex align-items-center gap-1 text-yellow-500">
              <i class="pi pi-star-fill text-sm"></i>
              <span class="text-sm text-color">{{ trip.rating }}</span>
            </div>
          </div>

          <div class="text-sm text-gray-600 mb-2">
            <i class="pi pi-map-marker mr-1"></i>
            <!-- {{ trip.cityName }}, {{ trip.countryName }} -->
          </div>
          <!--
          <p class="text-sm mb-0">{{ trip.description }}</p> -->
        </div>

        <ng-template pTemplate="footer">
          <button class="btn w-full btn-primary" (onClick)="goToTripReservationForm()">
            {{ 'Show Details' | translate }}
          </button>
        </ng-template>
      </p-card>
    </div>
  </div>
  <p-paginator
    (onPageChange)="pageChange($event)"
    [first]="first"
    [rows]="rows"
    [totalRecords]="totalRecords"
    [showCurrentPageReport]="true"
    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
    [rowsPerPageOptions]="[10, 20, 50, 100]"
  />
</div>

```

---

## `src/app/demo/pages/reservations/travels/travel-reservation-form/travel-reservation-form.component.scss`

```scss

```

---

## `src/app/demo/pages/reservations/travels/travel-reservation-form/travel-reservation-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelReservationFormComponent } from './travel-reservation-form.component';

describe('TravelReservationFormComponent', () => {
  let component: TravelReservationFormComponent;
  let fixture: ComponentFixture<TravelReservationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelReservationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelReservationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/reservations/travels/travel-reservation-form/travel-reservation-form.component.ts`

```ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { SearchDynamicComponent } from 'src/app/shared/components/search-dynamic/search-dynamic.component';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { FilterTravelMap } from 'src/app/shared/mapping/filterMap';
import { Travel } from 'src/app/shared/model/travelDto';
import { LookupsService } from 'src/app/shared/services/lookups.service';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-travel-reservation-form',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, SearchDynamicComponent],
  templateUrl: './travel-reservation-form.component.html',
  styleUrl: './travel-reservation-form.component.scss',
  providers: [ConfirmationService]
})
export class TravelReservationFormComponent {
  first = 0;
  rows = 12;
  totalRecords: number = 0;
  searchTerm: string = '';
  trips: Travel[] = [];
  filter: FilterTravelMap = {};
  searchFields = [
    { key: 'IsExternalTrip', type: 'select', placeholder: 'Trip Type', options: [], filterable: false },
    { key: 'CountryId', type: 'select', placeholder: 'Country', options: [], filterable: true },
    { key: 'CityId', type: 'select', placeholder: 'City', options: [], filterable: true },
    { key: 'Rating', type: 'select', placeholder: 'Rating', options: [], filterable: false },
    { key: 'SeatsCount', type: 'input', placeholder: 'SeatsCount' },
    { key: 'NumberOfDays', type: 'input', placeholder: 'Days' },
    { key: 'FromLocation', type: 'input', placeholder: 'From Location' },
    { key: 'ToLocation', type: 'input', placeholder: 'To Location' },
    { key: 'FromDate', type: 'date', placeholder: 'Start Date' },
    { key: 'ToDate', type: 'date', placeholder: 'End Date' }
  ];
  constructor(
    private Router: Router,
    private tripservice: TravelTripsService,
    private listService: LookupsService
  ) {}

  ngOnInit() {
    this.filter.pageIndex = this.first + 1;
    this.filter.pageSize = this.rows;
    this.getAllOptions();
    this.getAllTrips(this.filter);
  }
  pageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    const pageIndex = event.first / event.rows + 1;
    this.getAllTrips(this.filter);
  }

  onSearch() {
    this.first = 0;
    this.getAllTrips(this.filter);
  }

  getAllTrips(filter) {
    this.tripservice.getAllTravels(filter).subscribe({
      next: (res) => {
        this.trips = res.data.data;
        console.log(this.trips);

        this.totalRecords = res.data.itemsCount;
      },
      error: (err) => {
        console.error('Error fetching trips', err);
        this.trips = [];
        this.totalRecords = 0;
      }
    });
  }

  goToTripReservationForm() {
    console.log('room-reservation-step');
    this.Router.navigate(['/room-reservation-step']);
  }

  getStarsArray(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }
  onFilterChanged(filter: any): void {
    this.tripservice.getAllTravels(filter).subscribe({
      next: (res) => {
        this.trips = res.data.data;
        this.totalRecords = res.totalRecords;
      },
      error: (err) => {
        console.error('Error fetching trips:', err);
      }
    });
  }
  onSearchSubmit(formData: any) {
    // this.thereIsAdvancedSearch = true;
    let formdata = { ...formData };
    // Initialize the filter array
    this.filter = {};
    this.getAllTrips(this.filter);
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onClearSearch() {
    this.filter.pageIndex = 1;
    this.getAllTrips(this.filter);
  }

  getAllOptions() {
    this.getCountryOptions();
    this.getCityOptions();
    this.getRatingOptions();
    this.getTripTypeOptions();
  }

  getCountryOptions(): void {
    const statusField = this.searchFields.find((field) => field.key === 'CountryId');
    if (statusField) {
      this.listService.getCountries().subscribe((options) => {
        statusField.options = options;
      });
    }
  }
  getCityOptions(): void {
    const statusField = this.searchFields.find((field) => field.key === 'CityId');
    if (statusField) {
      this.listService.getCities().subscribe((options) => {
        statusField.options = options;
      });
    }
  }
  getRatingOptions(): void {
    const statusField = this.searchFields.find((field) => field.key === 'Rating');
    if (statusField) {
      statusField.options = this.listService.getRating();
    }
  }
  getTripTypeOptions(): void {
    const statusField = this.searchFields.find((field) => field.key === 'IsExternalTrip');
    if (statusField) {
      statusField.options = this.listService.getTravelType();
    }
  }
}

```

---

## `src/app/demo/pages/reservations/travels/travels-reservation-add-edit/travels-reservation-add-edit.component.html`

```html
<p>travels-reservation-add-edit works!</p>

```

---

## `src/app/demo/pages/reservations/travels/travels-reservation-add-edit/travels-reservation-add-edit.component.scss`

```scss

```

---

## `src/app/demo/pages/reservations/travels/travels-reservation-add-edit/travels-reservation-add-edit.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelsReservationAddEditComponent } from './travels-reservation-add-edit.component';

describe('TravelsReservationAddEditComponent', () => {
  let component: TravelsReservationAddEditComponent;
  let fixture: ComponentFixture<TravelsReservationAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelsReservationAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelsReservationAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/reservations/travels/travels-reservation-add-edit/travels-reservation-add-edit.component.ts`

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-travels-reservation-add-edit',
  standalone: true,
  imports: [],
  templateUrl: './travels-reservation-add-edit.component.html',
  styleUrl: './travels-reservation-add-edit.component.scss'
})
export class TravelsReservationAddEditComponent {

}

```

---

## `src/app/demo/pages/reservations/travels/travels-reservation-details/travels-reservation-details.component.html`

```html
<p>travels-reservation-details works!</p>

```

---

## `src/app/demo/pages/reservations/travels/travels-reservation-details/travels-reservation-details.component.scss`

```scss

```

---

## `src/app/demo/pages/reservations/travels/travels-reservation-details/travels-reservation-details.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelsReservationDetailsComponent } from './travels-reservation-details.component';

describe('TravelsReservationDetailsComponent', () => {
  let component: TravelsReservationDetailsComponent;
  let fixture: ComponentFixture<TravelsReservationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelsReservationDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelsReservationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/reservations/travels/travels-reservation-details/travels-reservation-details.component.ts`

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-travels-reservation-details',
  standalone: true,
  imports: [],
  templateUrl: './travels-reservation-details.component.html',
  styleUrl: './travels-reservation-details.component.scss'
})
export class TravelsReservationDetailsComponent {

}

```

---

## `src/app/demo/pages/reservations/travels/travels-reservation-list/travels-reservation-list.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'Travel Reservations'"
    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  ></sub-header>
 <p-toast></p-toast>
<p-confirmDialog></p-confirmDialog>
<div class="card">
  <p-toolbar styleClass="">
    <ng-template pTemplate="left">
      <span [class]="'p-input-icon-' + (lang === 'ar' ? 'left' : 'right')">
        <i class="pi pi-search"></i>
        <input pInputText type="text"  (input)="searchByName(searchedWord)" [(ngModel)]="searchedWord" placeholder="Search..." />
      </span>
    </ng-template>
    <ng-template pTemplate="right">
        <p-dropdown
        id="type"
        [options]="travelType"
        optionLabel="{{ 'label' | translate }}"
       optionValue="value"
        placeholder="{{ '-- Select travel type --' | translate }}"
        [showClear]="true"
        class="w-full"
        (onChange)="onSelectType($event)"
      ></p-dropdown>

    </ng-template>
  </p-toolbar>
  <app-table
  [data]="travels"
  [columns]="columns"
  [btnAction]="btnAction"
  [totalRecords]="totalRecords"
  [rows]="pageSize"
  [lazy]="true"
  (eventEmitters)="handleTableAction($event)"
  (onPageChange)="onPageChange($event)"
></app-table>

</div>

</div>


```

---

## `src/app/demo/pages/reservations/travels/travels-reservation-list/travels-reservation-list.component.scss`

```scss

```

---

## `src/app/demo/pages/reservations/travels/travels-reservation-list/travels-reservation-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelsReservationListComponent } from './travels-reservation-list.component';

describe('TravelsReservationListComponent', () => {
  let component: TravelsReservationListComponent;
  let fixture: ComponentFixture<TravelsReservationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelsReservationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelsReservationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/reservations/travels/travels-reservation-list/travels-reservation-list.component.ts`

```ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { FilterTravelMap } from 'src/app/shared/mapping/filterMap';
import { Travel } from 'src/app/shared/model/travelDto';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-travels-reservation-list',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './travels-reservation-list.component.html',
  styleUrl: './travels-reservation-list.component.scss',
  providers: [ConfirmationService]
})
export class TravelsReservationListComponent {
  searchedWord: string;
  filter: FilterTravelMap = {};
  totalSize: number = 0;
  totalSizePercent: number = 0;
  totalRecords: number = 10;
  pagination: any;
  lang: string;
  pageIndex = 1;
  length: number;
  pageSize = 10;
  travels: Travel[] = [];
  travelType = [
    {
      label: 'All',
      value: null
    },
    {
      label: 'Internal',
      value: false
    },
    {
      label: 'External',
      value: true
    }
  ];
  columns = [
    { header: 'Name', field: 'name', isData: true, isCrudAction: false, width: 150 },
    { header: 'Country', field: 'country.name', isData: true, isCrudAction: false, width: 150 },
    { header: 'City', field: 'city.name', isData: true, isCrudAction: false, width: 150 },
    // { header: 'From Location', field: 'fromLocation', isData: true, isCrudAction: false, width:150 },
    // { header: 'To Location', field: 'toLocation', isData: true, isCrudAction: false, width:150 },
    { header: 'Days', field: 'numberOfDays', isData: true, isCrudAction: false, width: 150 },
    { header: 'Seats', field: 'capacity', isData: true, isCrudAction: false, width: 150 },
    { header: 'Remaining Seats', field: 'remainingSeats', isData: true, isCrudAction: false, width: 150 },

    { header: 'Start Date', field: 'startDate', isDate: true, width: 150 },
    { header: 'End Date', field: 'endDate', isDate: true, width: 150 },
    { header: 'Price', field: 'price', isData: true, isPrice: true, width: 150 },
    // { header: 'Status', field: 'isActive', isData: false, isStatus: true, mapping: 'AttendanceStatus', width: 150 },
    { header: 'Action', field: 'action', isData: false, isCrudAction: true, width: 150 }
  ];

  btnAction = [
    {
      name: 'View Details',
      styleClass: 'info',
      icon: 'pi pi-eye'
    },
    {
      name: 'Update',
      styleClass: 'success',
      icon: 'pi pi-pencil'
    },
    {
      name: 'Cancel',
      styleClass: 'danger',
      icon: 'pi pi-block'
    }
  ];

  constructor(
    private router: Router,
    private translate: TranslateService,
    private travelServ: TravelTripsService,
    private toast: ToastrService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.translate.onLangChange.subscribe((event) => {
      this.lang = event.lang;
    });
  }
  ngOnInit() {
    this.filter.pageIndex = this.pageIndex;
    this.filter.pageSize = this.pageSize;
    this.getAllTravels(this.filter);
  }

  getAllTravels(filter) {
    this.travelServ.getAllTripReservation(filter).subscribe(
      (response) => {
        if (response.success) {
          this.travels = response.data.data;
          this.totalRecords = response.data.count;
        }
      },
      (error) => {}
    );
  }

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToTravelForm();
        break;
    }
  }

  goToTravelForm() {
    console.log('work travels form ....');
    this.router.navigate(['/travel-trip-reservation-form']);
  }

  onPageChange(event: any): void {
    // this.isLoading = true; // Set loading true when data is being fetched
    let pageIndex = event.pageIndex;
    this.filter.pageIndex = pageIndex + 1;
    let pageSize = event.pageSize;
    this.filter.pageSize = pageSize;
    if (this.filter) {
      this.getAllTravels(this.filter); // Include search criteria and offset
    } else {
      this.getAllTravels(this.filter); // Include offset
    }
  }

  searchByName(searchedKey) {
    if (!searchedKey) return;
    this.filter.Search = searchedKey;
    this.filter.pageIndex = 1;
    this.getAllTravels(this.filter);
  }
  onSelectType(event: any) {
    const selectedValue = event.value; // Access the selected option value directly
    this.filter.IsExternalTrip = selectedValue;
    this.filter.pageIndex = 1;
    this.getAllTravels(this.filter);
  }

  handleTableAction(event: { action: string; payload: any }) {
    const { action, payload } = event;

    switch (action) {
      case 'View Details':
        this.view(payload);
        break;
      case 'Update':
        this.update(payload);
        break;
      case 'Delete':
        this.delete(payload);
        break;

      default:
        console.warn('Unhandled action:', action);
    }
  }

  view(event: any) {
    const selectedId = event.name;
    // Navigate to the details page with the selected ID
    this.router.navigate(['/travel-details', selectedId]);
  }
  update(event: any) {
    const selectedId = event.id;
    // Navigate to the details page with the selected ID
    this.router.navigate(['/travel-form'], { queryParams: { id: selectedId, mode: 'edit' } });
  }
  delete(event: any) {
    const selectedId = event.id;
    // Show confirmation message before deleting
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this trip?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.deleteTravel(selectedId);
      },
      reject: () => {}
    });
  }

  deleteTravel(travelId) {
    this.travelServ.deleteTravel(travelId).subscribe(
      (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Delete',
            detail: 'Successfully Deleted'
          });

          this.getAllTravels(this.filter);
        }
      },
      (error) => {}
    );
  }
}

```

---

## `src/app/demo/pages/scanner-page/scanner-page.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'QR Code Scanner'"
    [actionButtons]="[{ label: 'Scan New Code', action: 'add', icon: 'pi pi-camera', class: 'btn-primary' }]"
    (actionClicked)="showDialog()"
  />
  <p-toast></p-toast>
  <p-confirmDialog></p-confirmDialog>

  <!-- Manual Entry Section -->
  <div class="card mb-3 p-3">
    <div class="row">
      <div class="col-md-6 offset-md-3">
        <div class="p-inputgroup">
          <input
            #bookingInput
            type="text"
            pInputText
            placeholder="Enter Booking ID manually..."
            [(ngModel)]="manualBookingId"
            (keydown.enter)="onManualSubmit()"
            autofocus
          />
          <button
            type="button"
            pButton
            label="Validate"
            icon="pi pi-check"
            [raised]="true"
            severity="primary"
            (click)="onManualSubmit()"
          ></button>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading Overlay -->
  <div *ngIf="isLoading" class="loading-overlay">
    <i class="pi pi-spin pi-spinner" style="font-size: 3rem"></i>
    <p>Loading ticket details...</p>
  </div>

  <!-- History Table -->
  <div class="history-table">
    <p-table [value]="scannedCodes" [tableStyle]="{ 'min-width': '50rem' }" styleClass="p-datatable-striped">
      <ng-template pTemplate="header">
        <tr>
          <th>Booking ID</th>
          <th>Scanned Time</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-code>
        <tr>
          <td>{{ code.code }}</td>
          <td>{{ code.timestamp | date: 'medium' }}</td>
          <td>
            <span *ngIf="code.ticketData" class="badge bg-success">Loaded</span>
            <span *ngIf="!code.ticketData" class="badge bg-warning">No Data</span>
          </td>
          <td>
            <button
              pButton
              icon="pi pi-eye"
              class="p-button-rounded p-button-text"
              (click)="viewTicketDetails(code)"
              [disabled]="!code.ticketData"
              pTooltip="View Details"
            ></button>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="4" class="text-center p-4">No scanned codes found</td>
        </tr>
      </ng-template>
    </p-table>
  </div>

  <!-- Scanner Dialog -->
  <p-dialog
    header="Scan QR Code"
    [(visible)]="visible"
    [modal]="true"
    [style]="{ width: '400px', maxWidth: '90vw' }"
    (onHide)="closeDialog()"
  >
    <div class="scanner-wrapper d-flex justify-content-center">
      <ngx-scanner-qrcode
        #scanner
        class="scanner-box"
        [config]="{
          fps: 30,
          vibrate: 200,
          isBeep: true
        }"
        (event)="onScanSuccess($event)"
        (error)="onScanError($event)"
      ></ngx-scanner-qrcode>
    </div>

    <ng-template pTemplate="footer">
      <button pButton label="Close" icon="pi pi-times" class="p-button-text" (click)="closeDialog()"></button>
    </ng-template>
  </p-dialog>

  <!-- Ticket Details Dialog -->
  <p-dialog
    header="Ticket Details"
    [(visible)]="showTicketDialog"
    [modal]="true"
    [style]="{ width: '600px', maxWidth: '95vw' }"
    (onHide)="closeTicketDialog()"
  >
    <div *ngIf="selectedTicket" class="ticket-details">
      <!-- Ticket Information Card -->
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title mb-3">
            <i class="pi pi-ticket me-2"></i>
            {{ selectedTicket.ticketType }}
          </h5>

          <div class="ticket-info">
            <!-- Description -->
            <div class="info-row mb-3">
              <label class="fw-bold">Description:</label>
              <p class="mb-0">{{ selectedTicket.description }}</p>
            </div>

            <!-- Status -->
            <div class="row mb-3">
              <div class="col-md-12">
                <div class="info-item">
                  <i
                    class="pi pi-check-circle me-2"
                    [class.text-success]="selectedTicket.isActive"
                    [class.text-danger]="!selectedTicket.isActive"
                  ></i>
                  <label class="fw-bold">Status:</label>
                  <span class="ms-2 badge" [class.bg-success]="selectedTicket.isActive" [class.bg-danger]="!selectedTicket.isActive">
                    {{ selectedTicket.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Serial Numbers Section -->
            <div class="serial-numbers-section" *ngIf="selectedTicket.outingTicketSerialNumbers?.length > 0">
              <hr class="my-3" />
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0">
                  <i class="pi pi-qrcode me-2"></i>
                  Entry Tickets (Serial Numbers)
                  <span class="badge bg-primary ms-2">{{ selectedTicket.outingTicketSerialNumbers.length }} Total</span>
                </h6>
                <button
                  *ngIf="getUnusedSerialNumbers(selectedTicket).length > 0"
                  pButton
                  label="Mark as Used"
                  icon="pi pi-check-circle"
                  class="p-button-sm p-button-success"
                  (click)="markAllSerialsAsUsed()"
                ></button>
              </div>

              <p class="text-muted mb-3">
                <i class="pi pi-info-circle me-2"></i>
                Each serial number represents one entry ticket. Mark tickets as used when entry is granted.
              </p>

              <!-- Serial Numbers Table -->
              <p-table
                [value]="selectedTicket.outingTicketSerialNumbers"
                styleClass="p-datatable-sm"
                [tableStyle]="{ 'min-width': '100%' }"
              >
                <ng-template pTemplate="header">
                  <tr>
                    <th style="width: 70%">Serial Number</th>
                    <th style="width: 30%">Status</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-serial>
                  <tr>
                    <td>
                      <span class="serial-number-text">{{ serial.serialNumber }}</span>
                    </td>
                    <td>
                      <span class="badge" [class.bg-success]="!serial.isUsed" [class.bg-danger]="serial.isUsed">
                        <i class="pi me-1" [class.pi-check]="!serial.isUsed" [class.pi-times]="serial.isUsed"></i>
                        {{ serial.isUsed ? 'Used' : 'Available' }}
                      </span>
                    </td>
                  </tr>
                </ng-template>
              </p-table>

              <!-- Summary -->
              <div class="alert alert-info mt-3 d-flex justify-content-between align-items-center">
                <div>
                  <i class="pi pi-info-circle me-2"></i>
                  <strong>Summary:</strong>
                </div>
                <div>
                  <span class="badge bg-success me-2">
                    <i class="pi pi-check me-1"></i>
                    {{ getUnusedSerialNumbers(selectedTicket).length }} Available
                  </span>
                  <span class="badge bg-danger">
                    <i class="pi pi-times me-1"></i>
                    {{ getUsedSerialNumbers(selectedTicket).length }} Used
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="!selectedTicket" class="alert alert-warning">
      <i class="pi pi-exclamation-triangle me-2"></i>
      No ticket data available
    </div>

    <ng-template pTemplate="footer">
      <button pButton label="Close" icon="pi pi-times" class="p-button-text" (click)="closeTicketDialog()"></button>
    </ng-template>
  </p-dialog>
</div>

```

---

## `src/app/demo/pages/scanner-page/scanner-page.component.scss`

```scss
.title {
  font-weight: bold;
  color: #333;
}

.scanner-wrapper {
  overflow: hidden;
  border-radius: 8px;

  ::ng-deep ngx-scanner-qrcode {
    max-width: 100%;
  }
}

.history-table {
  margin-top: 20px;
}

// Loading overlay
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  color: white;

  p {
    margin-top: 1rem;
    font-size: 1.1rem;
  }
}

// Ticket Details Dialog
.ticket-details {
  .card {
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .card-title {
      color: #495057;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;

      i {
        color: #007bff;
      }
    }
  }

  .info-row {
    label {
      display: block;
      color: #6c757d;
      margin-bottom: 0.5rem;
    }

    p {
      color: #212529;
      white-space: pre-line;
    }
  }

  .info-item {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;

    label {
      margin: 0;
      color: #6c757d;
    }

    span {
      color: #212529;
      font-weight: 500;
    }

    i {
      font-size: 1.2rem;
    }
  }

  .serial-numbers-section {
    h6 {
      color: #495057;

      i {
        color: #6610f2;
      }
    }

    .serial-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;

      .badge {
        font-size: 0.85rem;
        padding: 0.5rem 0.75rem;
        font-weight: 500;
      }
    }
  }

  .alert {
    display: flex;
    align-items: center;
    border-radius: 6px;

    i {
      font-size: 1.2rem;
    }
  }
}

// Serial Number Text in Table
.serial-number-text {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #495057;
  font-size: 0.95rem;
}

```

---

## `src/app/demo/pages/scanner-page/scanner-page.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScannerPageComponent } from './scanner-page.component';

describe('ScannerPageComponent', () => {
  let component: ScannerPageComponent;
  let fixture: ComponentFixture<ScannerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScannerPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScannerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/scanner-page/scanner-page.component.ts`

```ts
import { Component, ViewChild, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { NgxScannerQrcodeComponent } from 'ngx-scanner-qrcode';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { OutingService } from 'src/app/shared/services/outing.service';

@Component({
  selector: 'app-scanner-page',
  standalone: true,
  imports: [
    CommonModule,
    NgxScannerQrcodeComponent,
    SharedModule,
    DialogModule,
    TableModule,
    ButtonModule,
    ToastModule,
    TooltipModule,
    ConfirmDialogModule,
    SubHeaderComponent
  ],
  templateUrl: './scanner-page.component.html',
  styleUrl: './scanner-page.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class ScannerPageComponent implements OnInit, AfterViewInit {
  @ViewChild('scanner', { static: false }) scanner!: NgxScannerQrcodeComponent;
  @ViewChild('bookingInput') bookingInput!: ElementRef;

  scannedCodes: { code: string; timestamp: Date; ticketData?: any }[] = [];
  visible: boolean = false;
  isScanning: boolean = false;
  isLoading: boolean = false;
  selectedTicket: any = null;
  showTicketDialog: boolean = false;
  currentBookingId: number | null = null;

  constructor(
    private messageService: MessageService,
    private outingService: OutingService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.checkSecureContext();
  }

  ngAfterViewInit() {
    if (this.bookingInput) {
      setTimeout(() => {
        this.bookingInput.nativeElement.focus();
      }, 500);
    }
  }

  private checkSecureContext() {
    const isSecureContext = window.isSecureContext;
    // window.isSecureContext is the standard way to check.
    // However, older browsers might not have it.
    // The fallback check is protocol https or localhost.
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isHttps = window.location.protocol === 'https:';

    // We can rely on isSecureContext if available, otherwise manual check
    const safe = isSecureContext !== undefined ? isSecureContext : isHttps || isLocalhost;

    if (!safe) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Insecure Connection',
        detail:
          'Camera access requires a secure HTTPS connection. The scanner may not work on this server unless you configure SSL (HTTPS).',
        life: 10000,
        sticky: true
      });
    }
  }

  manualBookingId: string = '';

  onScanSuccess(event: any) {
    const value = event?.[0]?.value;
    if (value) {
      console.log('QR Code:', value);

      // Close scanner dialog first
      this.closeDialog();

      // Parse the ID from the QR code (assuming value is the ID)
      const bookingId = parseInt(value, 10);

      if (isNaN(bookingId)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid QR Code',
          detail: 'The scanned code does not contain a valid booking ID'
        });
        return;
      }

      this.processBookingId(bookingId);
    }
  }

  onManualSubmit() {
    if (!this.manualBookingId) {
      return;
    }

    const bookingId = parseInt(this.manualBookingId, 10);

    if (isNaN(bookingId)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid ID',
        detail: 'Please enter a valid numeric Booking ID'
      });
      return;
    }

    this.processBookingId(bookingId);
    this.manualBookingId = ''; // Clear input after successful submission intent
  }

  private processBookingId(bookingId: number) {
    this.currentBookingId = bookingId;
    this.isLoading = true;

    this.outingService.getOutingBookingById(bookingId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.selectedTicket = response.data.tecket;
        console.log('Booking Data:', response);

        // Add to history with ticket data
        this.scannedCodes.unshift({
          code: bookingId.toString(),
          timestamp: new Date(),
          ticketData: response.data.tecket
        });

        // Show ticket details
        this.selectedTicket = response.data.tecket;
        this.showTicketDialog = true;

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Ticket details loaded successfully'
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching booking:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load ticket details'
        });
      }
    });
  }

  onScanError(error: any) {
    console.error('Scan Error:', error);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Scan failed' });
  }

  showDialog() {
    this.visible = true;
    // Delay start slightly to ensure dialog is rendered?
    // Usually scanner needs to be visible to start correct?
    // NgxScannerQrcodeComponent handles its own lifecycle often, but let's wait for view init
    setTimeout(() => {
      this.startScanning();
    }, 1);
  }

  closeDialog() {
    this.visible = false;
    this.stopScanning();
  }

  startScanning() {
    this.isScanning = true;
    this.scanner.start();
  }

  stopScanning() {
    this.isScanning = false;
    this.scanner.stop();
  }

  viewTicketDetails(code: any) {
    if (code.ticketData) {
      this.selectedTicket = code.ticketData;
      this.currentBookingId = parseInt(code.code, 10);
      this.showTicketDialog = true;
    }
  }

  closeTicketDialog() {
    this.showTicketDialog = false;
    this.selectedTicket = null;
  }

  getUsedSerialNumbers(ticket: any): string[] {
    if (!ticket?.outingTicketSerialNumbers) return [];
    return ticket.outingTicketSerialNumbers.filter((sn: any) => sn.isUsed).map((sn: any) => sn.serialNumber);
  }

  getUnusedSerialNumbers(ticket: any): string[] {
    if (!ticket?.outingTicketSerialNumbers) return [];
    return ticket.outingTicketSerialNumbers.filter((sn: any) => !sn.isUsed).map((sn: any) => sn.serialNumber);
  }

  markSerialAsUsed(serialNumber: string) {
    this.confirmationService.confirm({
      message: `Are you sure you want to mark serial number "${serialNumber}" as used? This action grants entry and cannot be undone.`,
      header: 'Confirm Entry Grant',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // TODO: Here you will call the API to update the serial number status
        // For now, we'll update it locally
        if (this.selectedTicket?.outingTicketSerialNumbers) {
          const serial = this.selectedTicket.outingTicketSerialNumbers.find((sn: any) => sn.serialNumber === serialNumber);
          if (serial) {
            serial.isUsed = true;

            // Also update in the scanned codes history
            const historyItem = this.scannedCodes.find((item) =>
              item.ticketData?.outingTicketSerialNumbers?.some((sn: any) => sn.serialNumber === serialNumber)
            );
            if (historyItem?.ticketData?.outingTicketSerialNumbers) {
              const historySerial = historyItem.ticketData.outingTicketSerialNumbers.find((sn: any) => sn.serialNumber === serialNumber);
              if (historySerial) {
                historySerial.isUsed = true;
              }
            }

            this.messageService.add({
              severity: 'success',
              summary: 'Entry Granted',
              detail: `Serial number "${serialNumber}" marked as used. Entry granted.`
            });
          }
        }
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Action cancelled. Serial number remains available.'
        });
      }
    });
  }

  markAllSerialsAsUsed() {
    if (!this.currentBookingId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No booking ID available'
      });
      return;
    }

    const availableCount = this.getUnusedSerialNumbers(this.selectedTicket).length;

    if (availableCount === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'No Available Tickets',
        detail: 'All serial numbers are already marked as used.'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to mark ALL ${availableCount} available serial number(s) as used? This will grant entry for all and cannot be undone.`,
      header: 'Confirm Mark All as Used',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.isLoading = true;
        this.outingService.useTicketSerialNumber(this.currentBookingId!).subscribe({
          next: (response) => {
            this.isLoading = false;

            // Update all serial numbers to used in the selected ticket
            if (this.selectedTicket?.outingTicketSerialNumbers) {
              this.selectedTicket.outingTicketSerialNumbers.forEach((sn: any) => {
                sn.isUsed = true;
              });
            }

            // Update in scan history
            const historyItem = this.scannedCodes.find((item) => item.code === this.currentBookingId?.toString());
            if (historyItem?.ticketData?.outingTicketSerialNumbers) {
              historyItem.ticketData.outingTicketSerialNumbers.forEach((sn: any) => {
                sn.isUsed = true;
              });
            }

            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `All ${availableCount} serial number(s) marked as used successfully`
            });
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error marking all serials as used:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to mark serial numbers as used. Please try again.'
            });
          }
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Action cancelled. Serial numbers remain unchanged.'
        });
      }
    });
  }
}

```

---

## `src/app/demo/pages/settings/advertisings/advertisings-details/advertisings-details.component.html`

```html
<p>advertisings-details works!</p>

```

---

## `src/app/demo/pages/settings/advertisings/advertisings-details/advertisings-details.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/advertisings/advertisings-details/advertisings-details.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvertisingsDetailsComponent } from './advertisings-details.component';

describe('AdvertisingsDetailsComponent', () => {
  let component: AdvertisingsDetailsComponent;
  let fixture: ComponentFixture<AdvertisingsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvertisingsDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvertisingsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/advertisings/advertisings-details/advertisings-details.component.ts`

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-advertisings-details',
  standalone: true,
  imports: [],
  templateUrl: './advertisings-details.component.html',
  styleUrl: './advertisings-details.component.scss'
})
export class AdvertisingsDetailsComponent {

}

```

---

## `src/app/demo/pages/settings/advertisings/advertisings-form/advertisings-form.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="id ? ('Edit Ad' | translate) : ('Add Ad' | translate)"
    [mainSection]="'Ads' | translate"
    [subSection]="id ? ('Edit' | translate) : ('Add' | translate)"
  ></sub-header>

  <div class="product-form shadow-3 p-4">
    <form class="form-field" [formGroup]="addsForm" (ngSubmit)="submit()">
      <h3 class="flex justify-content-between mb-3">
        {{ 'Ad Information' | translate }}
      </h3>

      <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round mb-4">
        <!-- Title -->
        <div class="field col-12 col-md-6">
          <label for="Title">{{ 'Title (EN)' | translate }}</label>
          <input pInputText id="Title" formControlName="Title" />
        </div>

        <!-- TitleAr -->
        <div class="field col-12 col-md-6">
          <label for="TitleAr">{{ 'Title (AR)' | translate }}</label>
          <input pInputText id="TitleAr" formControlName="TitleAr" />
        </div>

        <!-- Description -->
        <!-- Description EN -->
        <div class="field col-12">
          <label for="Description">{{ 'Description (EN)' | translate }}</label>
          <textarea pInputTextarea autoResize="true" rows="3" id="Description" class="w-full" formControlName="Description"></textarea>
        </div>

        <!-- Description AR -->
        <div class="field col-12">
          <label for="DescriptionAr">{{ 'Description (AR)' | translate }}</label>
          <textarea pInputTextarea autoResize="true" rows="3" id="DescriptionAr" class="w-full" formControlName="DescriptionAr"></textarea>
        </div>

        <!-- LinkUrl -->
        <div class="field col-12 col-md-6">
          <label for="LinkUrl">{{ 'Link URL' | translate }}</label>
          <input pInputText id="LinkUrl" formControlName="LinkUrl" />
        </div>

        <!-- ExpiryDate -->
        <div class="field col-12 col-md-6">
          <label for="ExpiryDate">{{ 'Expiry Date' | translate }}</label>
          <p-calendar
            
            [iconDisplay]="'input'"
            id="ExpiryDate"
            formControlName="ExpiryDate"
            [showTime]="true"
            dateFormat="yy-mm-dd"
            [showIcon]="true"
          ></p-calendar>
        </div>
      </div>

      <!-- Image uploader placeholder -->
      <h3 class="mt-5 mb-3">{{ 'Ad Image' | translate }}</h3>

      <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round mb-4">
        <div class="col-md-12 mb-3">
          <app-img-uploader [multiple]="false" [displayFile]="oldImage" (filesChanged)="onLogoFileSelect($event)"></app-img-uploader>
        </div>
      </div>

      <!-- Buttons -->
      <div class="buttons mt-3 text-end">
        <p-button label="{{ 'Cancel' | translate }}" type="button" class="mx-1 shadow" severity="secondary"></p-button>

        <p-button type="submit" label="{{ 'Save' | translate }}" severity="success" class="shadow" icon="pi pi-save"></p-button>
      </div>
    </form>
  </div>
</div>
<p-toast></p-toast>

```

---

## `src/app/demo/pages/settings/advertisings/advertisings-form/advertisings-form.component.scss`

```scss
input.ng-invalid.ng-touched,
textarea.ng-invalid.ng-touched,
p-calendar.ng-invalid.ng-touched .p-inputtext,
p-dropdown.ng-invalid.ng-touched .p-dropdown-label {
  border: 1px solid #dc3545 !important;
  box-shadow: 0 0 0 0.05rem rgba(220, 53, 69, 0.25) !important;
}

```

---

## `src/app/demo/pages/settings/advertisings/advertisings-form/advertisings-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvertisingsFormComponent } from './advertisings-form.component';

describe('AdvertisingsFormComponent', () => {
  let component: AdvertisingsFormComponent;
  let fixture: ComponentFixture<AdvertisingsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvertisingsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvertisingsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/advertisings/advertisings-form/advertisings-form.component.ts`

```ts
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';

import { AdvertisingsService } from 'src/app/shared/services/advertisings.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-advertisings-form',
  standalone: true,
  imports: [SharedModule, ImgUploaderComponent, SubHeaderComponent],
  templateUrl: './advertisings-form.component.html',
  styleUrl: './advertisings-form.component.scss'
})
export class AdvertisingsFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private _AdvertisingsService = inject(AdvertisingsService);
  private _ToastrService = inject(ToastrService);
  private _Router = inject(Router);
  private _ActivatedRoute = inject(ActivatedRoute);
  id = this._ActivatedRoute.snapshot.params['id'];
  paseUrl = environment.imgUrl;
  addsForm!: FormGroup;
  selectedImage: File | null = null;
  oldImage = '';

  ngOnInit(): void {
    this.buildAddsForm();
    if (this.id) {
      this.getAdById();
    }
    console.log(this.id);
  }

  getAdById() {
    this._AdvertisingsService.getAddById(this.id).subscribe({
      next: (res) => {
        const data = res.data;
        this.oldImage = res.data.imageUrl;

        this.addsForm.patchValue({
          Id: data.id,
          Title: data.title,
          TitleAr: data.titleAr,
          Description: data.description,
          DescriptionAr: data.descriptionAr,
          LinkUrl: data.linkUrl,
          ExpiryDate: data.expiryDate ? new Date(data.expiryDate) : null
        });
      }
    });
  }

  buildAddsForm() {
    this.addsForm = this.formBuilder.group({
      Id: [null],
      Title: ['', Validators.required],
      TitleAr: ['', Validators.required],
      Description: ['', Validators.required],
      DescriptionAr: ['', Validators.required],
      LinkUrl: [''],
      ExpiryDate: ['', Validators.required],
      Image: [null] // هنحط فيها الملف
    });
  }

  onLogoFileSelect(event: any): void {
    this.selectedImage = event[0];
  }

  buildFormData(): FormData {
    const v = this.addsForm.value;
    const fd = new FormData();
    fd.append('Id', v.Id ?? '');
    fd.append('Title', v.Title ?? '');
    fd.append('TitleAr', v.TitleAr ?? '');
    fd.append('Description', v.Description ?? '');
    fd.append('DescriptionAr', v.DescriptionAr ?? '');
    fd.append('LinkUrl', v.LinkUrl ?? '');

    if (v.ExpiryDate) {
      const isoDate = new Date(v.ExpiryDate).toISOString();
      fd.append('ExpiryDate', isoDate);
    } else {
      fd.append('ExpiryDate', '');
    }

    // ✅ إضافة الصورة لو موجودة
    if (this.selectedImage) {
      fd.append('Image', this.selectedImage, this.selectedImage.name);
    }

    return fd;
  }

  onDelete(id) {
    this._AdvertisingsService.deleteAdvertising(id).subscribe({
      next: (res) => {}
    });
  }

  submit() {
    if (this.addsForm.invalid) {

      this.addsForm.markAllAsTouched();
      return;
    }
    const formData = this.buildFormData();

    if (this.id) {
      // ✅ Update mode
      this._AdvertisingsService.updateAdd(formData).subscribe({
        next: (res) => {
          this._ToastrService.success(res.message, 'Updated');
          this._Router.navigate(['/advertisings']);
        }
      });
    } else {
      // ✅ Create mode
      this._AdvertisingsService.setAdvertising(formData).subscribe({
        next: (res) => {
          this._ToastrService.success(res.message, 'Created');
          this._Router.navigate(['/advertisings']);
        }
      });
    }
  }
}

```

---

## `src/app/demo/pages/settings/advertisings/advertisings-list/advertisings-list.component.html`

```html
<p-confirmDialog></p-confirmDialog>
<div class="card">
  <p-toolbar>
    <ng-template pTemplate="right">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText type="text" [(ngModel)]="search" (input)="onSearch()" [placeholder]="'search' | translate" />
      </span>
    </ng-template>
  </p-toolbar>
  <p-table
    #dt
    [value]="addsData"
    [paginator]="true"
    [rows]="rows"
    [first]="first"
    [lazy]="true"
    (onLazyLoad)="onPageChange($event)"
    [totalRecords]="totalRecords"
    [rowsPerPageOptions]="[5, 10]"
    [showCurrentPageReport]="true"
    [globalFilterFields]="['country.name']"
    [currentPageReportTemplate]="'showingEntries' | translate"
  >
    <ng-template pTemplate="header">
      <tr>
        <th>{{ 'image' | translate }}</th>
        <th>{{ 'title' | translate }}</th>
        <th>{{ 'created Date' | translate }}</th>
        <th>{{ 'expiry Date' | translate }}</th>
        <th>{{ 'description' | translate }}</th>
        <th></th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-add>
      <tr>
        <td><img [src]="add.imageUrl ? baseUrl + add.imageUrl : 'https://placehold.co/600x400?text=No+Image'" alt="add image" /></td>
        <td>{{ add.title }}</td>
        <td>{{ add.createdDate | date: 'medium' }}</td>
        <td>{{ add.expiryDate | date: 'medium' }}</td>
        <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
          {{ add.description }}
        </td>
        <td>
          <div class="flex gap-1 justify-content-center">
            <p-button [raised]="true" icon="pi pi-pencil" severity="success" [rounded]="true" [routerLink]="['/advertisings-form', add.id]"></p-button>
            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" (click)="onDelete(add.id)"></p-button>
          </div>
        </td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="4">
          <div class="d-flex justify-content-center align-items-center py-3 w-100">
            <i class="pi pi-info-circle" style="font-size: 1rem; color: gray"></i>
            <span class="ms-2" style="color: gray">{{ 'No Data found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/settings/advertisings/advertisings-list/advertisings-list.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/advertisings/advertisings-list/advertisings-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvertisingsListComponent } from './advertisings-list.component';

describe('AdvertisingsListComponent', () => {
  let component: AdvertisingsListComponent;
  let fixture: ComponentFixture<AdvertisingsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvertisingsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvertisingsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/advertisings/advertisings-list/advertisings-list.component.ts`

```ts
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { AdvertisingsService } from 'src/app/shared/services/advertisings.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-advertisings-list',
  standalone: true,
  imports: [SharedModule],
  providers: [ConfirmationService],
  templateUrl: './advertisings-list.component.html',
  styleUrl: './advertisings-list.component.scss'
})
export class AdvertisingsListComponent implements OnInit {
  _AdvertisingsService = inject(AdvertisingsService);
  toastrService = inject(ToastrService);
  confirmationService = inject(ConfirmationService);
  private Router = inject(Router);

  first: number = 0;
  rows: number = 10;
  search: string;
  addsData: any[] = [];
  totalRecords = 0;
  baseUrl = environment.imgUrl;

  onDelete(id) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        this._AdvertisingsService.deleteAdvertising(id).subscribe({
          next: (res) => {
            this.toastrService.success('deleted sussesfuly', 'deleted');
            this.getAllAdvertisings();
          }
        });
      },
      reject: () => {
      }
    });
  }
  onEdit(id){
    this.Router.navigate(['\advertisings-form', id])
  }
  private buildFilter(): FilterMap {
    return {
      pageIndex: this.first / this.rows + 1,
      pageSize: this.rows,
      search: this.search
    };
  }
  ngOnInit(): void {}
  getAllAdvertisings() {
    this._AdvertisingsService.getAllAdvertisings(this.buildFilter()).subscribe({
      next: (res) => {
        debugger;
        this.addsData = res.data.data;
        this.totalRecords = res.data.itemsCount;
      }
    });
  }
  onSearch() {
    this.first = 0;
    this.getAllAdvertisings();
  }
  onPageChange(event) {
    this.first = event.first;
    this.rows = event.rows;
    this.getAllAdvertisings();
  }

 
}

```

---

## `src/app/demo/pages/settings/advertisings/advertisings.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'advertisings'| translate"
    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  ></sub-header>
  <app-advertisings-list></app-advertisings-list>
</div>

```

---

## `src/app/demo/pages/settings/advertisings/advertisings.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/advertisings/advertisings.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvertisingsComponent } from './advertisings.component';

describe('AdvertisingsComponent', () => {
  let component: AdvertisingsComponent;
  let fixture: ComponentFixture<AdvertisingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvertisingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvertisingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/advertisings/advertisings.component.ts`

```ts
import { Component, inject } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from "src/app/shared/components/sub-header/sub-header.component";
import { Router } from '@angular/router';
import { AdvertisingsListComponent } from "./advertisings-list/advertisings-list.component";

@Component({
  selector: 'app-advertisings',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, AdvertisingsListComponent],
  templateUrl: './advertisings.component.html',
  styleUrl: './advertisings.component.scss'
})
export class AdvertisingsComponent {
   router= inject(Router)
 handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToVendorForm();
        break;
    }
  }

  goToVendorForm() {
    console.log('goToVendorForm');
    this.router.navigate(['/advertisings-form']);
  }
}

```

---

## `src/app/demo/pages/settings/bed-tybe/bed-tybe-form/bed-tybe-form.component.html`

```html
<div class="product-form p-4 mb-4">
  <p-toast></p-toast> <!-- Add toast for success/error messages -->

  <div class="form-field">
    <form [formGroup]="bedTybeForm" (ngSubmit)="onSubmit()">
      <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
        <div class="field col">
          <label for="name">
            {{ 'bed tybe' | translate }}
            <small *ngIf="bedTybeForm.get('name')?.invalid && (bedTybeForm.get('name')?.touched || bedTybeForm.get('name')?.dirty)" class="text-danger">*</small>
          </label>

          <input type="text" pInputText id="name" formControlName="name" />

          <!-- Error message for required field -->
          <small class="error" *ngIf="bedTybeForm.get('name')?.hasError('required') && (bedTybeForm.get('name')?.touched || bedTybeForm.get('name')?.dirty)">
            * {{ 'required' | translate }}
          </small>
        </div>
      </div>

      <!-- Buttons -->
      <div class="buttons mt-3 text-end">
        <p-button
          label="{{ 'Cancel' | translate }}"
          class="mx-1"
          severity="secondary"
          (onClick)="onCancel()"
          [disabled]="isLoading"
        ></p-button>
        <p-button
          type="submit"
          label="{{ 'save' | translate }}"
          severity="success"
          icon="pi pi-save"
          [disabled]="bedTybeForm.invalid || isLoading"
          [loading]="isLoading"
        ></p-button>
      </div>
    </form>
  </div>
</div>

```

---

## `src/app/demo/pages/settings/bed-tybe/bed-tybe-form/bed-tybe-form.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/bed-tybe/bed-tybe-form/bed-tybe-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedTybeFormComponent } from './bed-tybe-form.component';

describe('BedTybeFormComponent', () => {
  let component: BedTybeFormComponent;
  let fixture: ComponentFixture<BedTybeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedTybeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedTybeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/bed-tybe/bed-tybe-form/bed-tybe-form.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BedTybeService } from 'src/app/shared/services/bed-tybe.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MessageService } from 'primeng/api'; // For toast messages

@Component({
  selector: 'app-bed-tybe-form',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './bed-tybe-form.component.html',
  styleUrl: './bed-tybe-form.component.scss',
  providers: [MessageService] // Provide MessageService for toast
})
export class BedTybeFormComponent implements OnInit {
  bedTybeForm: FormGroup;
  isLoading = false; // Track loading state

  constructor(
    private fb: FormBuilder,
    private bedTybeService: BedTybeService, // Renamed for consistency
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef, // Inject DynamicDialogRef
    private messageService: MessageService // For toast notifications
  ) {}

  ngOnInit(): void {
    this.createBTForm();
    if (this.config.data) {
      console.log('Received data:', this.config.data);
      this.handleEdit();
    }
  }

  createBTForm() {
    this.bedTybeForm = this.fb.group({
      name: ['', Validators.required] // Add validation if required
    });
  }

  handleEdit() {
    if (this.config.data) {
      this.bedTybeForm.patchValue({
        name: this.config.data.name || ''
      });
      console.log('Editing bed type:', this.config.data.name);
    }
  }

  onSubmit() {
    if (this.bedTybeForm.valid) {
      this.isLoading = true; // Show loading state
      if (this.config.data && this.config.data.id) {
        // Update operation
        this.bedTybeService.updateBedTybe(this.config.data.id, this.bedTybeForm.get('name').value).subscribe({
          next: (res) => {
            this.isLoading = false;

            this.ref.close(res); // Close dialog and pass data
          },
          error: (err) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update bed type'
            });
            console.error('Update error:', err);
          }
        });
      } else {
        // Create operation
        this.bedTybeService.sendBedTybe(this.bedTybeForm.value).subscribe({
          next: (res) => {
            this.isLoading = false;

            this.ref.close(this.bedTybeForm.value); // Close dialog and pass data
          },
          error: (err) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create bed type'
            });
            console.error('Create error:', err);
          }
        });
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Form',
        detail: 'Please fill in all required fields'
      });
      console.log('Form is invalid');
    }
  }

  onCancel() {
    this.ref.close(); // Close dialog without data
  }
}

```

---

## `src/app/demo/pages/settings/bed-tybe/bed-tybe-list/bed-tybe-list.component.html`

```html
<p-confirmDialog></p-confirmDialog>
<div class="card">
  <p-toolbar styleClass="mb-4">
    <ng-template pTemplate="right">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'search' | translate" />
      </span>
    </ng-template>
  </p-toolbar>
  <p-table
    #dt
    [value]="bedTybies"
    [paginator]="true"
    [rows]="10"
    [rowsPerPageOptions]="[10, 20, 50]"
    [totalRecords]="totalRecords"
    [loading]="isLoading"
    [lazy]="true"
    (onLazyLoad)="loadBedTybies($event)"
    [responsiveLayout]="'scroll'"
    dataKey="id"
    [showCurrentPageReport]="true"
    [currentPageReportTemplate]="'showingEntries' | translate"
  >
    <ng-template pTemplate="header">
      <tr>
        <th pSortableColumn="Name">
          {{ 'bed tybe' | translate }}
          <p-sortIcon field="Name"></p-sortIcon>
        </th>
        <th style="width: 35%">{{ 'action' | translate }}</th>
      </tr>
      <tr>
        <th>
          <p-columnFilter type="text" field="Name" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th></th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-bedTybe>
      <tr>
        <td>{{ bedTybe.name }}</td>

        <td>
          <div class="flex gap-1 justify-content-center">
            <p-button
              [raised]="true"
              icon="pi pi-pencil"
              severity="success"
              [rounded]="true"
              (onClick)="handleEdit(bedTybe.id, bedTybe.name)"
              [pTooltip]="'edit' | translate"
              tooltipPosition="top"
            ></p-button>
            <p-button
              icon="pi pi-trash"
              severity="danger"
              [rounded]="true"
              (onClick)="handleDelete(bedTybe.id)"
              [pTooltip]="'delete' | translate"
              tooltipPosition="top"
            ></p-button>
          </div>
        </td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="2">
          <div class="flex flex-column align-items-center justify-content-center py-5">
            <i class="pi pi-inbox text-500 text-5xl mb-3"></i>
            <span class="text-700 font-medium text-lg">{{ 'No Data found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/settings/bed-tybe/bed-tybe-list/bed-tybe-list.component.scss`

```scss
// Table styling
:host ::ng-deep .p-datatable-table {
  width: 100%;
}

// Align table headings to left
:host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
  text-align: left !important;
}

// Compact filter row styling
:host ::ng-deep .p-datatable .p-datatable-thead > tr:nth-child(2) > th {
  padding: 0.25rem 0.5rem !important;
  background: #f8f9fa;
}

:host ::ng-deep .p-datatable .p-column-filter-row {
  padding: 0 !important;
}
:host ::ng-deep .p-datatable .p-column-filter-element {
  width: 100%;
}

:host ::ng-deep .p-datatable .p-column-filter-row .p-inputtext {
  padding: 0.35rem 0.5rem !important;
  font-size: 13px;
}

:host ::ng-deep .p-datatable .p-column-filter-row .p-column-filter-menu-button,
:host ::ng-deep .p-datatable .p-column-filter-row .p-column-filter-clear-button {
  width: 1.75rem !important;
  height: 1.75rem !important;
}

```

---

## `src/app/demo/pages/settings/bed-tybe/bed-tybe-list/bed-tybe-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedTybeListComponent } from './bed-tybe-list.component';

describe('BedTybeListComponent', () => {
  let component: BedTybeListComponent;
  let fixture: ComponentFixture<BedTybeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedTybeListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedTybeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/bed-tybe/bed-tybe-list/bed-tybe-list.component.ts`

```ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IbedTybies } from 'src/app/shared/model/ibed-tybies';
import { BedTybeService } from 'src/app/shared/services/bed-tybe.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BedTybeFormComponent } from '../bed-tybe-form/bed-tybe-form.component';
import { ToastrService } from 'ngx-toastr';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-bed-tybe-list',
  standalone: true,
  imports: [SharedModule],
  providers: [ConfirmationService, MessageService, DialogService],
  templateUrl: './bed-tybe-list.component.html',
  styleUrl: './bed-tybe-list.component.scss'
})
export class BedTybeListComponent implements OnInit {
  @ViewChild('dt') dt: Table;

  searchTerm: string = '';
  ref: DynamicDialogRef | undefined;

  bedTybies: IbedTybies[] = [];
  totalRecords: number = 0;
  isLoading: boolean = false;

  constructor(
    private _BedTybeService: BedTybeService,
    private ConfirmationService: ConfirmationService,
    private MessageService: MessageService,
    private dialogService: DialogService,
    private ToastrService: ToastrService
  ) {}

  ngOnInit(): void {}

  loadBedTybies(event: TableLazyLoadEvent) {
    this.isLoading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this._BedTybeService.getAllBedTybies(payload).subscribe({
      next: (res: any) => {
        this.bedTybies = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Get bed types error:', err);
        this.MessageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load bed types'
        });
        this.isLoading = false;
      }
    });
  }

  onSearch(event?: any) {
    this.dt.reset();
  }

  refresh() {
    this.dt.reset();
  }

  handleDelete(id: number) {
    this.ConfirmationService.confirm({
      message: 'Are you sure you want to delete this item?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised mx-2',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this._BedTybeService.deleteBedTybe(id).subscribe({
          next: () => {
            this.refresh();
            this.ToastrService.error('Bed type deleted successfully', 'Success');
          },
          error: () => {
            this.ToastrService.error('Failed to delete bed type', 'Error');
          }
        });
      }
    });
  }

  handleEdit(id: number, name: string) {
    this.ref = this.dialogService.open(BedTybeFormComponent, {
      header: 'Edit Bed Type',
      width: '50vw',
      modal: true,
      closable: true,
      data: { id, name },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((data) => {
      if (data) {
        this.refresh();
        this.ToastrService.success('Bed type updated successfully', 'Success');
      }
    });
  }

  // handleAdd() {
  //   this.ref = this.dialogService.open(BedTybeFormComponent, {
  //     header: 'Add Bed Type',
  //     width: '50vw',
  //     modal: true,
  //     closable: true,

  //     breakpoints: {
  //       '960px': '75vw',
  //       '640px': '90vw'
  //     }
  //   });

  //   this.ref.onClose.subscribe((data) => {
  //     if (data) {
  //       // Refresh the list with current pagination and search
  //       const pageIndex = this.first / this.rows + 1;
  //       this.getingAllBedTybies(pageIndex, this.rows, this.searchTerm);
  //       this.MessageService.add({
  //         severity: 'success',
  //         summary: 'Success',
  //         detail: 'Bed type created successfully'
  //       });
  //     }
  //   });
  // }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}

```

---

## `src/app/demo/pages/settings/bed-tybe/bed-tybe.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'bed tybe' | translate"
    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  ></sub-header>

<app-bed-tybe-list></app-bed-tybe-list>

</div>

```

---

## `src/app/demo/pages/settings/bed-tybe/bed-tybe.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/bed-tybe/bed-tybe.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BedTybeComponent } from './bed-tybe.component';

describe('BedTybeComponent', () => {
  let component: BedTybeComponent;
  let fixture: ComponentFixture<BedTybeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedTybeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BedTybeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/bed-tybe/bed-tybe.component.ts`

```ts
import { Component, ViewChild } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BedTybeFormComponent } from './bed-tybe-form/bed-tybe-form.component';
import { MessageService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { BedTybeListComponent } from './bed-tybe-list/bed-tybe-list.component';

@Component({
  selector: 'app-bed-tybe',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, BedTybeListComponent],
  providers: [DialogService, MessageService],
  templateUrl: './bed-tybe.component.html',
  styleUrl: './bed-tybe.component.scss'
})
export class BedTybeComponent {
  ref: DynamicDialogRef | undefined;
  @ViewChild(BedTybeListComponent) bedTybeListComponent!: BedTybeListComponent;
  constructor(
    private dialogService: DialogService,
    private translate: TranslateService,
    private ToastrService: ToastrService
  ) {}
  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToBedTybeForm();
        break;
    }
  }

  goToBedTybeForm() {
    console.log('goToBedForm');
    this.ref = this.dialogService.open(BedTybeFormComponent, {
      header: this.translate.instant('bed tybe'),
      width: '50vw',
      modal: true,
      closable: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });
    this.ref.onClose.subscribe((data) => {
      if (data) {
        this.bedTybeListComponent.refresh();
        this.ToastrService.success('Bed Type Created Successfully', 'Success');
      }
    });
  }
}

```

---

## `src/app/demo/pages/settings/cities/cities-form/cities-form.component.html`

```html
<div class="p-4 mb-4">
  <form [formGroup]="citiesForm" (ngSubmit)="onSubmit()">
    <h3 class="flex justify-content-between">
      {{ 'Add City' | translate }}
      <span><p-inputSwitch formControlName="status" /></span>
    </h3>
    <div class="grid p-3">
      <!-- قائمة الدول (بحث في الـ Backend) -->
      <div class="col-12 md:col-6">
        <label for="countryId">
          {{ 'Country Name' | translate }}
          <small *ngIf="citiesForm.get('countryId')?.touched && citiesForm.get('countryId')?.invalid" class="p-error">*</small>
        </label>
        <p-dropdown
          formControlName="countryId"
          [options]="countries"
          optionLabel="enName"
          optionValue="id"
          placeholder="{{ 'Select a Country' | translate }}"
          [filter]="true"
          filterPlaceholder="{{ 'Search Countries' | translate }}"
          (onFilter)="onCountryFilter($event)"
          [showClear]="true"
          styleClass="w-full"
          appendTo="body"
        ></p-dropdown>
        <small *ngIf="citiesForm.get('countryId')?.touched && citiesForm.get('countryId')?.invalid" class="p-error">
          {{ 'Country is required' | translate }}
        </small>
      </div>
      <!-- قائمة المدن (بحث Client-side) -->
      <div class="col-12 md:col-6">
        <label for="city">
          {{ 'City Name' | translate }}
          <small *ngIf="citiesForm.get('city')?.touched && citiesForm.get('city')?.invalid" class="p-error">*</small>
        </label>
        <p-dropdown
          formControlName="city"
          [options]="cities"
          optionLabel="name"
          optionValue="name"
          placeholder="{{ 'Select a City' | translate }}"
          [filter]="true"
          [lazy]="true"
          (onFilter)="onCityFilter($event)"
          filterPlaceholder="{{ 'Search Cities' | translate }}"
          [disabled]="!cities.length || !selectedCountry?.isoCode"
          [showClear]="true"
          styleClass="w-full"
          appendTo="body"
        ></p-dropdown>
        <small *ngIf="citiesForm.get('city')?.touched && citiesForm.get('city')?.invalid" class="p-error">
          {{ 'City is required' | translate }}
        </small>
        <small *ngIf="!cities.length && selectedCountry && !selectedCountry.isoCode" class="p-text-warning">
          {{ 'This country is not supported for city selection' | translate }}
        </small>
        <small *ngIf="!cities.length && selectedCountry && selectedCountry.isoCode" class="p-text-warning">
          {{ 'No cities available for this country' | translate }}
        </small>
      </div>
      <div class="field col-md-12">
       <div class="flex flex-column gap-2">
            <label for="username"> {{ 'city name in arabic' | translate }}</label>
            <input pInputText id="username" aria-describedby="username-help" formControlName="name" />
            <small id="username-help">{{'enter city name in arabic'|translate}}</small>
          </div>
       
      
      </div>
    </div>
    <div class="mt-3 text-end">
      <p-button label="{{ 'Cancel' | translate }}" class="mx-1" severity="secondary" (onClick)="onCancel()"></p-button>
      <p-button label="{{ 'Save' | translate }}" severity="success" icon="pi pi-save" type="submit"></p-button>
    </div>
  </form>
</div>

```

---

## `src/app/demo/pages/settings/cities/cities-form/cities-form.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/cities/cities-form/cities-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitiesFormComponent } from './cities-form.component';

describe('CitiesFormComponent', () => {
  let component: CitiesFormComponent;
  let fixture: ComponentFixture<CitiesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitiesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitiesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/cities/cities-form/cities-form.component.ts`

```ts
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from 'src/app/shared/services/countries.service';
import { City, Country, State } from 'country-state-city';
import { Icountries } from 'src/app/shared/model/icountries';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ButtonModule } from 'primeng/button';
import { CitiesService } from 'src/app/shared/services/cities.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cities-form',
  standalone: true,
  imports: [SharedModule, DropdownModule, InputSwitchModule, ButtonModule, ToastModule],
  providers: [DialogService, ConfirmationService, MessageService],
  templateUrl: './cities-form.component.html',
  styleUrls: ['./cities-form.component.scss']
})
export class CitiesFormComponent implements OnInit {
  citiesForm: FormGroup;
  countries: Icountries[] = [];
  cities: any[] = [];
  selectedCountry: Icountries | null = null;
  searchQuery: string = '';

  // @Output() cancelForm = new EventEmitter<boolean>();

  constructor(
    private fb: FormBuilder,
    private _CountriesService: CountriesService,
    private _CitiesService: CitiesService,
    public ref: DynamicDialogRef,
    private MessageService: MessageService,
    private ToastrService: ToastrService
  ) {}

  ngOnInit() {
    this.citiesFormGroup();
    this.getAllCountries();
    this.watchCountryChanges();
  }

  citiesFormGroup() {
    this.citiesForm = this.fb.group({
      countryId: ['', Validators.required],
      city: ['', Validators.required],
      name: ['', Validators.required],
      status: [true],
      isInTravel: [true],
      isInHotel: [true],
      module: [0]
    });
  }

  getAllCountries(search: string = '') {
    // استخدام getAllCountries مع search لجلب الدول
    this._CountriesService.getAllCountries({ pageIndex: 1, pageSize: 10, search }).subscribe({
      next: (res) => {
        if (res && res.data && res.data.data) {
          this.countries = res.data.data;
          this.addIsoToCountries();
        } else {
          console.error('Invalid API response structure');
          this.countries = [];
        }
      },
      error: (err) => {
        console.error('Error fetching countries:', err);
        this.countries = [];
      }
    });
  }

  addIsoToCountries() {
    const libraryCountries = Country.getAllCountries();

    this.countries = this.countries.map((country) => {
      const matchedCountry = libraryCountries.find((libCountry) => libCountry.name.toLowerCase() === country.name.toLowerCase());

      if (matchedCountry) {
        return { ...country, isoCode: matchedCountry.isoCode };
      } else {
        console.warn(`No matching country found in library for: ${country.name} (countryCode: ${country.countryCode})`);
        return { ...country, isoCode: null };
      }
    });

    console.log('Countries with isoCode:', this.countries);
  }

  allCities: any[] = []; // تخزين كل المدن المؤقتة

  watchCountryChanges() {
    this.citiesForm.get('countryId')?.valueChanges.subscribe((countryId) => {
      this.selectedCountry = this.countries.find((country) => country.id === countryId) || null;
      this.citiesForm.get('city')?.reset();
      this.cities = [];

      if (this.selectedCountry?.countryCode) {
        console.log('Selected Country =:', this.selectedCountry);
        // this.allCities = City.getCitiesOfCountry(this.selectedCountry.countryCode) || [];
        this.allCities = this.getMergedCities(this.selectedCountry.countryCode) || [];

        this.cities = this.allCities.slice(0, 100); // عرض أول 100 مدينة

        console.log('Cities for selected country:', this.allCities);
      } else {
        this.allCities = [];
      }
    });
  }

  getMergedCities(countryIso: string) {
    // 1️⃣ نجيب المدن
    const cities = City.getCitiesOfCountry(countryIso) || [];

    // 2️⃣ نجيب الولايات
    const states = State.getStatesOfCountry(countryIso) || [];

    // 3️⃣ نحول الولايات لصيغة المدن
    const stateAsCities = states.map((state) => ({
      name: state.name,
      stateCode: state.isoCode,
      countryCode: state.countryCode,
      latitude: state.latitude,
      longitude: state.longitude,
      isState: true // 🔹 عشان نعرف دي ولاية أصلاً لو احتجناها بعدين
    }));

    // 4️⃣ ندمج الكل مع بعض
    const merged = [...cities, ...stateAsCities];

    // 5️⃣ نزيل أي تكرار بالاسم (لو إسطنبول موجودة في الاثنين)
    const uniqueMerged = merged.filter(
      (value, index, self) => index === self.findIndex((v) => v.name.toLowerCase() === value.name.toLowerCase())
    );

    // ✅ نرتبهم أبجديًا لتحسين تجربة المستخدم
    uniqueMerged.sort((a, b) => a.name.localeCompare(b.name));

    return uniqueMerged;
  }

  onCityFilter(event: any) {
    const query = (event.filter || '').toLowerCase();
    if (!this.allCities.length) return;

    if (query) {
      this.cities = this.allCities.filter((city) => city.name.toLowerCase().includes(query)).slice(0, 100);
    } else {
      this.cities = this.allCities.slice(0, 100);
    }
  }

  // حدث البحث من p-dropdown للدول
  onCountryFilter(event: any) {
    const query = event.filter || '';
    // تأخير البحث لتقليل طلبات الـ API
    setTimeout(() => this.getAllCountries(query), 300);
  }

  onSubmit() {
    if (this.citiesForm.valid) {
      const formValue = this.citiesForm.value;
      const payload = {
        countryId: formValue.countryId,
        enName: formValue.city, // هنا city عبارة عن string
        name: formValue.name,
        status: formValue.status,
        isInTravel: formValue.isInTravel,
        isInHotel: formValue.isInHotel,
        module: formValue.module
      };
      console.log('Form Submitted!', payload);
      this._CitiesService.setCity(payload).subscribe({
        next: (res) => {
          this.ToastrService.success('City added successfully!', 'Success');
          console.log('City added successfully:', res);
          this.citiesForm.reset({
            status: true,
            isInTravel: true,
            isInHotel: true,
            module: 1
          });
          this.ref.close(true); // Close the dialog and emit true to parent component
        },
        error: (err) => {
          this.ToastrService.error('Error adding city', 'Error', {
            timeOut: 3000,
            progressBar: true,
            closeButton: true
          });
          console.error('Error adding city:', err);
        }
      });
    } else {
      console.log('Form is invalid');
      this.markFormAsTouched();
    }
  }

  onCancel() {
    this.ref.close();
  }

  private markFormAsTouched() {
    Object.values(this.citiesForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }
}

```

---

## `src/app/demo/pages/settings/cities/cities-list/cities-list.component.html`

```html
<div class="card">
  <p-toolbar styleClass="mb-4">
    <ng-template pTemplate="right">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'search' | translate" />
      </span>
    </ng-template>
  </p-toolbar>
  <p-table
    #dt
    [value]="cities"
    [paginator]="true"
    [rows]="10"
    [rowsPerPageOptions]="[10, 20, 50]"
    [totalRecords]="totalRecords"
    [loading]="isLoading"
    [lazy]="true"
    (onLazyLoad)="loadCities($event)"
    [responsiveLayout]="'scroll'"
    dataKey="id"
    [showCurrentPageReport]="true"
    [currentPageReportTemplate]="'showingEntries' | translate"
  >
    <ng-template pTemplate="header">
      <tr>
        <th pSortableColumn="Name">
          {{ 'city name' | translate }}
          <p-sortIcon field="Name"></p-sortIcon>
        </th>
        <th pSortableColumn="Country.Name">
          {{ 'country name' | translate }}
          <p-sortIcon field="Country.Name"></p-sortIcon>
        </th>
        <th style="width: 25%" pSortableColumn="Status">
          {{ 'status' | translate }}
          <p-sortIcon field="Status"></p-sortIcon>
        </th>
      </tr>
      <tr>
        <th>
          <p-columnFilter type="text" field="Name" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="Country.Name" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <!-- Status filter -->
        </th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-city>
      <tr>
        <td>{{ currentLang === 'ar' ? city.name : city.enName }}</td>
        <td>{{ currentLang === 'ar' ? city.countryName : city.countryName }}</td>

        <td><p-inputSwitch [(ngModel)]="city.status" (onChange)="onStatusChange(city.id, city.status)" /></td>
      </tr>
    </ng-template>
    <!-- Empty Message -->
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="3">
          <div class="flex flex-column align-items-center justify-content-center py-5">
            <i class="pi pi-inbox text-500 text-5xl mb-3"></i>
            <span class="text-700 font-medium text-lg">{{ 'No Data found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/settings/cities/cities-list/cities-list.component.scss`

```scss
// Table styling
:host ::ng-deep .p-datatable-table {
  width: 100%;
}

// Align table headings to left
:host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
  text-align: left !important;
}

// Compact filter row styling
:host ::ng-deep .p-datatable .p-datatable-thead > tr:nth-child(2) > th {
  padding: 0.25rem 0.5rem !important;
  background: #f8f9fa;
}

:host ::ng-deep .p-datatable .p-column-filter-row {
  padding: 0 !important;
}
:host ::ng-deep .p-datatable .p-column-filter-element {
  width: 100%;
}

:host ::ng-deep .p-datatable .p-column-filter-row .p-inputtext {
  padding: 0.35rem 0.5rem !important;
  font-size: 13px;
}

:host ::ng-deep .p-datatable .p-column-filter-row .p-column-filter-menu-button,
:host ::ng-deep .p-datatable .p-column-filter-row .p-column-filter-clear-button {
  width: 1.75rem !important;
  height: 1.75rem !important;
}

```

---

## `src/app/demo/pages/settings/cities/cities-list/cities-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitiesListComponent } from './cities-list.component';

describe('CitiesListComponent', () => {
  let component: CitiesListComponent;
  let fixture: ComponentFixture<CitiesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitiesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/cities/cities-list/cities-list.component.ts`

```ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { Icities } from 'src/app/shared/model/Icities';
import { CitiesService } from 'src/app/shared/services/cities.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-cities-list',
  standalone: true,
  imports: [SharedModule],
  providers: [ConfirmationService, MessageService, DialogService],
  templateUrl: './cities-list.component.html',
  styleUrl: './cities-list.component.scss'
})
export class CitiesListComponent implements OnInit {
  @ViewChild('dt') dt: Table;

  searchTerm: string = '';
  cities: Icities[] = [];
  totalRecords: number = 0;
  isLoading: boolean = false;
  ref: DynamicDialogRef | undefined;
  currentLang: string;

  constructor(
    private _CitiesService: CitiesService,
    private ToastrService: ToastrService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentLang = this.translate.currentLang || 'en';
    this.translate.onLangChange.subscribe((lang) => {
      this.currentLang = lang.lang;
    });
  }

  loadCities(event: TableLazyLoadEvent) {
    this.isLoading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this._CitiesService.getAllCities(payload).subscribe({
      next: (res) => {
        this.cities = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.cities = [];
        this.isLoading = false;
      }
    });
  }

  onSearch(event?: any) {
    this.dt.reset();
  }

  refresh() {
    this.dt.reset();
  }

  onStatusChange(id: number, status: boolean) {
    const payload = { id, status };
    this._CitiesService.editStatus(payload).subscribe({
      next: () => {
        if (status === true) {
          this.ToastrService.success('Status updated successfully', 'Updated', {
            timeOut: 3000,
            progressBar: true,
            progressAnimation: 'increasing',
            closeButton: true,
            positionClass: 'toast-top-right'
          });
        } else {
          this.ToastrService.error('Status deactivated successfully', 'Updated', {
            timeOut: 3000,
            progressBar: true,
            progressAnimation: 'increasing',
            closeButton: true,
            positionClass: 'toast-top-right'
          });
        }
      },
      error: () => {}
    });
  }
}

```

---

## `src/app/demo/pages/settings/cities/cities.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'cities'"
    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  ></sub-header>



  <app-cities-list></app-cities-list>
</div>

```

---

## `src/app/demo/pages/settings/cities/cities.component.scss`

```scss
.form-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.2 );
  z-index: 100;
}

.form-popout {
  position: relative;
  z-index: 101;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
  padding: 1.5rem;
  animation: elevate 0.2s ease;
  margin-bottom: 1.55rem;
}

@keyframes elevate {
  from {
    transform: scale(0.98);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

```

---

## `src/app/demo/pages/settings/cities/cities.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitiesComponent } from './cities.component';

describe('CitiesComponent', () => {
  let component: CitiesComponent;
  let fixture: ComponentFixture<CitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/cities/cities.component.ts`

```ts
import { Component, ViewChild } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CitiesFormComponent } from './cities-form/cities-form.component';
import { CitiesListComponent } from './cities-list/cities-list.component';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [SharedModule, CitiesListComponent, SubHeaderComponent],
  templateUrl: './cities.component.html',
  styleUrl: './cities.component.scss',
  providers: [DialogService]
})
export class CitiesComponent {
  isFormVisible: boolean = false;
  ref: DynamicDialogRef | undefined;
  @ViewChild(CitiesListComponent) citiesListComponent: CitiesListComponent | undefined;
  handleCitiesEdit(event: boolean) {
    this.isFormVisible = event;
  }
  constructor(
    public dialogService: DialogService,
    private translate: TranslateService,
    private ToastrService: ToastrService
  ) {}

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToCitiesForm();
        break;
    }
  }

  goToCitiesForm() {
    console.log('goToVendorForm');
    this.isFormVisible = true;

    this.ref = this.dialogService.open(CitiesFormComponent, {
      header: this.translate.instant('cities'),
      width: '50vw',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });
    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.citiesListComponent?.refresh();
      }
    });
  }
}

```

---

