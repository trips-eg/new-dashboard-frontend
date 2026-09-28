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
import { CountdownTimerComponent } from '../shared/countdown-timer/countdown-timer.component';
import {
  CustomTripTypeLabels,
  CustomTripRequestStatus,
  CustomTripRequestStatusLabels,
  CustomTripRequestStatusSeverity,
  VendorTripOfferStatusLabels,
  VendorTripOfferStatusSeverity,
  OfferPaymentTypeLabels,
  TagSeverity,
  enumDisplay,
  enumSeverity
} from 'src/app/shared/Enums/custom-trip';
import { IAdminCustomTripRequest, IAdminVendorOffer, IVendorTripRequestsQuery } from 'src/app/shared/model/icustom-trip';

@Component({
  selector: 'app-admin-trip-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, SubHeaderComponent, TranslateModule, CountdownTimerComponent],
  providers: [ConfirmationService, DialogService, MessageService],
  templateUrl: './admin-trip-requests.component.html',
  styleUrl: './admin-trip-requests.component.scss'
})
export class AdminTripRequestsComponent implements OnInit, OnDestroy {
  customTripsService = inject(CustomTripsService);
  dialogService = inject(DialogService);
  toastr = inject(ToastrService);
  translate = inject(TranslateService);
  router = inject(Router);
  configService = inject(ConfigureService);

  lang = this.translate.currentLang || 'en';
  ref: DynamicDialogRef | undefined;

  @ViewChild('dt') dt: Table;

  // Expose to template
  CustomTripRequestStatus = CustomTripRequestStatus;

  tripTypeOptions = Object.entries(CustomTripTypeLabels).map(([value, labels]) => ({
    label: labels.en,
    value: Number(value)
  }));

  requests: IAdminCustomTripRequest[] = [];
  totalRecords = 0;
  isLoading = false;
  destinationFilter = '';
  destinationSubject = new Subject<string>();
  tripTypeFilter: number | null = null;
  statusFilter: number | null = null;
  needsFlightFilter = false;
  needsVisaFilter = false;
  expandedRows: { [key: string]: boolean } = {};
  expandedOfferNotes: { [offerId: number]: boolean } = {};
  private searchSubscription?: Subscription;

  statusOptions = Object.entries(CustomTripRequestStatusLabels).map(([value, labels]) => ({
    label: labels.en,
    value: Number(value)
  }));

  get metrics() {
    const total = this.totalRecords || this.requests.length;
    const activeWindows = this.requests.filter(
      (r) => r.status === CustomTripRequestStatus.ReceivingOffers || r.isAcceptingOffers
    ).length;
    const totalOffers = this.requests.reduce(
      (sum, r) => sum + (r.offersCount || r.offers?.length || 0),
      0
    );
    const totalViews = this.requests.reduce((sum, r) => sum + (r.viewsCount || 0), 0);
    return { total, activeWindows, totalOffers, totalViews };
  }

  getCustomerInitials(name?: string): string {
    if (!name) return 'TR';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getWhatsAppUrl(phone?: string): string {
    if (!phone) return '';
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('00')) {
      clean = clean.substring(2);
    }
    if (clean.startsWith('0') && clean.length === 11) {
      clean = '20' + clean.substring(1);
    } else if (!clean.startsWith('20') && clean.length === 10) {
      clean = '20' + clean;
    }
    return `https://wa.me/${clean}`;
  }

  getLowestOffer(offers?: IAdminVendorOffer[]): number | null {
    if (!offers || offers.length === 0) return null;
    const prices = offers.map((o) => o.price).filter((p) => typeof p === 'number' && !isNaN(p));
    return prices.length > 0 ? Math.min(...prices) : null;
  }

  getHighestOffer(offers?: IAdminVendorOffer[]): number | null {
    if (!offers || offers.length === 0) return null;
    const prices = offers.map((o) => o.price).filter((p) => typeof p === 'number' && !isNaN(p));
    return prices.length > 0 ? Math.max(...prices) : null;
  }

  getAverageOffer(offers?: IAdminVendorOffer[]): number | null {
    if (!offers || offers.length === 0) return null;
    const prices = offers.map((o) => o.price).filter((p) => typeof p === 'number' && !isNaN(p));
    if (prices.length === 0) return null;
    const total = prices.reduce((sum, p) => sum + p, 0);
    return Math.round(total / prices.length);
  }

  isLowestOffer(offer: IAdminVendorOffer, offers?: IAdminVendorOffer[]): boolean {
    if (!offers || offers.length < 2) return false;
    const lowest = this.getLowestOffer(offers);
    return offer.price === lowest;
  }

  toggleOfferNotes(offerId: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.expandedOfferNotes[offerId] = !this.expandedOfferNotes[offerId];
  }

  isOfferNotesExpanded(offerId: number): boolean {
    return !!this.expandedOfferNotes[offerId];
  }

  toggleAllRows(): void {
    if (Object.keys(this.expandedRows).length > 0) {
      this.expandedRows = {};
    } else {
      const newExpanded: { [key: string]: boolean } = {};
      this.requests.forEach((r) => {
        newExpanded[r.id.toString()] = true;
      });
      this.expandedRows = newExpanded;
    }
  }

  get hasExpandedRows(): boolean {
    return Object.keys(this.expandedRows).length > 0;
  }

  clearSearch(): void {
    this.destinationFilter = '';
    this.dt?.reset();
  }

  setStatusFilter(status: number | null): void {
    if (this.statusFilter !== status) {
      this.statusFilter = status;
      this.dt?.reset();
    }
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

  toggleFlightFilter(): void {
    this.needsFlightFilter = !this.needsFlightFilter;
    this.dt?.reset();
  }

  toggleVisaFilter(): void {
    this.needsVisaFilter = !this.needsVisaFilter;
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
    return enumDisplay(CustomTripRequestStatusLabels, status, this.lang);
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

  ngOnInit(): void {
    const roles = this.configService.userRoles();
    const isVendor = roles.some((role: string) => role.startsWith('Vendor.'));
    if (isVendor) {
      this.router.navigateByUrl('/unauthorized');
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
      this.statusOptions = Object.entries(CustomTripRequestStatusLabels).map(([value, labels]) => ({
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

  loadRequests(event: TableLazyLoadEvent): void {
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

    this.customTripsService.getAdminAllRequests(query).subscribe({
      next: (res) => {
        this.requests = res?.data?.data || [];
        this.totalRecords = res?.data?.count ?? res?.data?.itemsCount ?? 0;
        this.expandedRows = {};
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading admin trip requests:', err);
        this.requests = [];
        this.totalRecords = 0;
        this.isLoading = false;
        this.toastr.error(this.translate.instant('Failed to load trip requests'));
      }
    });
  }

  onFilterChange(): void {
    this.dt.reset();
  }

  openAdminOffer(request: IAdminCustomTripRequest, event: Event): void {
    event.stopPropagation();
    this.ref = this.dialogService.open(VendorRequestDialogComponent, {
      header: this.translate.instant('Submit Offer On Behalf Of Vendor'),
      width: '920px',
      style: { maxWidth: '96vw' },
      contentStyle: { overflow: 'auto', maxHeight: '88vh' },
      baseZIndex: 10000,
      data: { request, isAdmin: true }
    });

    this.ref.onClose.subscribe((submitted) => {
      if (submitted) {
        this.dt.reset();
      }
    });
  }

  // Template helpers — prefer the API-provided names, fall back to local maps
  tripTypeLabel(request: IAdminCustomTripRequest): string {
    if (request.tripTypeName) return request.tripTypeName;
    return enumDisplay(CustomTripTypeLabels, request.tripType, this.lang);
  }

  statusLabel(request: IAdminCustomTripRequest): string {
    if (request.statusName) return request.statusName;
    return enumDisplay(CustomTripRequestStatusLabels, request.status, this.lang);
  }

  statusSeverity(value: number): TagSeverity {
    return enumSeverity(CustomTripRequestStatusSeverity, value);
  }

  offerStatusLabel(status: number, statusName?: string): string {
    if (statusName) return statusName;
    return enumDisplay(VendorTripOfferStatusLabels, status, this.lang);
  }

  offerStatusSeverity(value: number): TagSeverity {
    return enumSeverity(VendorTripOfferStatusSeverity, value);
  }

  paymentTypeLabel(paymentType: number, paymentTypeName?: string): string {
    if (paymentTypeName) return paymentTypeName;
    return enumDisplay(OfferPaymentTypeLabels, paymentType, this.lang);
  }
}
