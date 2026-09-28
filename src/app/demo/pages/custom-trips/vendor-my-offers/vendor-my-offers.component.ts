import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { CustomTripsService } from 'src/app/shared/services/custom-trips.service';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { VendorRequestDialogComponent } from '../vendor-request-dialog/vendor-request-dialog.component';
import {
  CustomTripTypeLabels,
  VendorTripOfferStatus,
  VendorTripOfferStatusLabels,
  VendorTripOfferStatusSeverity,
  OfferPaymentType,
  OfferPaymentTypeLabels,
  TagSeverity,
  enumDisplay,
  enumSeverity
} from 'src/app/shared/Enums/custom-trip';
import { IVendorTripRequest, IVendorTripRequestsQuery } from 'src/app/shared/model/icustom-trip';

@Component({
  selector: 'app-vendor-my-offers',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, SubHeaderComponent, TranslateModule],
  providers: [ConfirmationService, DialogService, MessageService],
  templateUrl: './vendor-my-offers.component.html',
  styleUrl: './vendor-my-offers.component.scss'
})
export class VendorMyOffersComponent implements OnInit, OnDestroy {
  customTripsService = inject(CustomTripsService);
  dialogService = inject(DialogService);
  toastr = inject(ToastrService);
  translate = inject(TranslateService);
  router = inject(Router);
  configService = inject(ConfigureService);

  lang = this.translate.currentLang || 'en';
  ref: DynamicDialogRef | undefined;

  @ViewChild('dt') dt: Table;

  VendorTripOfferStatus = VendorTripOfferStatus;

  tripTypeOptions = Object.entries(CustomTripTypeLabels).map(([value, labels]) => ({
    label: labels.en,
    value: Number(value)
  }));

  requests: IVendorTripRequest[] = [];
  totalRecords = 0;
  isLoading = false;
  destinationFilter = '';
  destinationSubject = new Subject<string>();
  tripTypeFilter: number | null = null;
  statusFilter: number | null = null;
  needsFlightFilter = false;
  needsVisaFilter = false;
  private searchSubscription?: Subscription;

  get metrics() {
    const total = this.totalRecords || this.requests.length;
    const pending = this.requests.filter(
      (r) => r.myOfferStatus === VendorTripOfferStatus.Pending
    ).length;
    const accepted = this.requests.filter(
      (r) =>
        r.myOfferStatus === VendorTripOfferStatus.Accepted ||
        r.myOfferStatus === VendorTripOfferStatus.Selected
    ).length;
    const totalVolume = this.requests.reduce((acc, r) => acc + (r.myOfferPrice || 0), 0);
    return { total, pending, accepted, totalVolume };
  }

  ngOnInit(): void {
    const roles = this.configService.userRoles();
    const isVendor = roles.some((role: string) => role.startsWith('Vendor.'));
    if (!isVendor) {
      this.router.navigateByUrl('/admin-custom-trip-requests');
      return;
    }

    this.searchSubscription = this.destinationSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.dt?.reset();
      });

    this.translate.onLangChange.subscribe(() => {
      this.lang = this.translate.currentLang;
      this.tripTypeOptions = Object.entries(CustomTripTypeLabels).map(([value, labels]) => ({
        label: this.lang === 'ar' ? labels.ar : labels.en,
        value: Number(value)
      }));
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  onDestinationChange(value: string): void {
    this.destinationSubject.next(value);
  }

  clearSearch(): void {
    this.destinationFilter = '';
    this.dt?.reset();
  }

  clearTripType(): void {
    this.tripTypeFilter = null;
    this.dt?.reset();
  }

  clearStatus(): void {
    this.statusFilter = null;
    this.dt?.reset();
  }

  clearFlight(): void {
    this.needsFlightFilter = false;
    this.dt?.reset();
  }

  clearVisa(): void {
    this.needsVisaFilter = false;
    this.dt?.reset();
  }

  setQuickFilter(mode: 'all' | 'pending' | 'accepted' | 'rejected' | 'flight' | 'visa'): void {
    if (mode === 'all') {
      this.statusFilter = null;
      this.needsFlightFilter = false;
      this.needsVisaFilter = false;
    } else if (mode === 'pending') {
      this.statusFilter = VendorTripOfferStatus.Pending;
      this.needsFlightFilter = false;
      this.needsVisaFilter = false;
    } else if (mode === 'accepted') {
      this.statusFilter = VendorTripOfferStatus.Accepted;
      this.needsFlightFilter = false;
      this.needsVisaFilter = false;
    } else if (mode === 'rejected') {
      this.statusFilter = VendorTripOfferStatus.Rejected;
      this.needsFlightFilter = false;
      this.needsVisaFilter = false;
    } else if (mode === 'flight') {
      this.needsFlightFilter = true;
      this.statusFilter = null;
      this.needsVisaFilter = false;
    } else if (mode === 'visa') {
      this.needsVisaFilter = true;
      this.statusFilter = null;
      this.needsFlightFilter = false;
    }
    this.dt?.reset();
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.destinationFilter?.trim() ||
      this.tripTypeFilter !== null ||
      this.statusFilter !== null ||
      this.needsFlightFilter ||
      this.needsVisaFilter
    );
  }

  getTripTypeLabel(type: number): string {
    const found = this.tripTypeOptions.find((o) => o.value === type);
    return found ? found.label : String(type);
  }

  getStatusLabel(status: number): string {
    return enumDisplay(VendorTripOfferStatusLabels, status, this.lang);
  }

  resetFilters(): void {
    this.destinationFilter = '';
    this.tripTypeFilter = null;
    this.statusFilter = null;
    this.needsFlightFilter = false;
    this.needsVisaFilter = false;
    this.dt?.reset();
  }

  refresh(): void {
    this.dt?.reset();
  }

  navigateToAvailable(): void {
    this.router.navigateByUrl('/vendor-custom-trip-requests');
  }

  loadOffers(event: TableLazyLoadEvent): void {
    this.isLoading = true;
    const pageSize = event.rows || 10;
    const pageIndex = Math.floor((event.first || 0) / pageSize) + 1;

    const query: IVendorTripRequestsQuery = {
      pageIndex,
      pageSize,
      sortColumn: event.sortField ? String(event.sortField) : undefined,
      sortDirection: event.sortOrder === 1 ? 'asc' : event.sortOrder === -1 ? 'desc' : undefined,
      filters: []
    };

    if (this.destinationFilter?.trim()) {
      query.destination = this.destinationFilter.trim();
      query.search = this.destinationFilter.trim();
    }
    if (this.tripTypeFilter !== null && this.tripTypeFilter !== undefined) {
      query.tripType = this.tripTypeFilter;
    }

    // Real backend column filters
    if (this.statusFilter !== null && this.statusFilter !== undefined) {
      query.filters!.push({ column: 'status', value: String(this.statusFilter) });
    }
    if (this.needsFlightFilter) {
      query.filters!.push({ column: 'needsFlight', value: 'true' });
    }
    if (this.needsVisaFilter) {
      query.filters!.push({ column: 'needsVisa', value: 'true' });
    }

    this.customTripsService.getMySubmittedOffers(query).subscribe({
      next: (res) => {
        this.requests = res?.data?.data || [];
        this.totalRecords = res?.data?.count ?? res?.data?.itemsCount ?? 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading my offers:', err);
        this.requests = [];
        this.totalRecords = 0;
        this.isLoading = false;
        this.toastr.error(this.translate.instant('Failed to load your offers'));
      }
    });
  }

  onFilterChange(): void {
    this.dt.reset();
  }

  openRequest(request: IVendorTripRequest): void {
    this.ref = this.dialogService.open(VendorRequestDialogComponent, {
      header: this.translate.instant('Trip Request Details'),
      width: '920px',
      style: { maxWidth: '96vw' },
      contentStyle: { overflow: 'auto', maxHeight: '88vh' },
      baseZIndex: 10000,
      data: { requestId: request.id, isAdmin: false }
    });

    this.ref.onClose.subscribe((submitted) => {
      if (submitted) {
        this.dt.reset();
      }
    });
  }

  // Template helpers
  tripTypeLabel(value: number): string {
    return enumDisplay(CustomTripTypeLabels, value, this.lang);
  }

  offerStatusLabel(value: number | undefined | null): string {
    return enumDisplay(VendorTripOfferStatusLabels, value ?? undefined, this.lang);
  }

  offerStatusSeverity(value: number | undefined | null): TagSeverity {
    return enumSeverity(VendorTripOfferStatusSeverity, value ?? undefined);
  }

  paymentTypeLabel(value: number | undefined | null): string {
    return enumDisplay(OfferPaymentTypeLabels, value ?? undefined, this.lang);
  }
}
