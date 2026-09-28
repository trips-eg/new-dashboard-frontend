import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ReservationsService } from 'src/app/shared/services/reservations.service';
import { VendorService } from 'src/app/shared/services/vendor.service';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { EnumsService } from 'src/app/shared/services/enums.service';
import { MarkVendorSettledDialogComponent } from 'src/app/shared/components/mark-vendor-settled-dialog/mark-vendor-settled-dialog.component';

import { environment } from 'src/environments/environment';
import { CompaniesWalletService } from 'src/app/shared/services/companies-wallet.service';
import { ImageModule } from 'primeng/image';

export interface SettlementLedgerItem {
  id: number;
  moduleType: number; // 1: Travel, 2: Room, 3: Outing, 4: Manasik
  moduleName: string;
  bookingRefernce?: string;
  bookingId?: number;
  itemName: string;
  customerName: string;
  vendorId?: number;
  vendorName?: string;
  reservationDate: string | Date;
  serviceDate?: string | Date;
  productPrice: number;
  tripsCommission: number;
  vendorCalculatedAmount: number;
  vendorSettledAmount: number;
  remainingToSettle: number;
  vendorSettlementStatus: number;
  bookingStatus?: number;
  allowedToSettlement: boolean;
  reservationOutingTickets?: any[];
  countDetails?: any;
  quantity?: number;
  rawItem: any;
}

@Component({
  selector: 'app-vendor-settlements',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, ImageModule],
  providers: [DialogService, ConfirmationService],
  templateUrl: './vendor-settlements.component.html',
  styleUrl: './vendor-settlements.component.scss'
})
export class VendorSettlementsComponent implements OnInit {
  @Input() companyId?: number;

  // View Navigation: 'dues' (Active Booking Settlements) vs 'history' (Wallet Payout Logs)
  activeViewMode: 'dues' | 'history' = 'dues';

  isLoading: boolean = false;
  activeSector: number = 1; // 1: Travel, 2: Room, 3: Outing, 4: Manasik
  selectedStatusFilter: number = -1; // -1: All, 0: Not Settled, 1: Partially, 2: Fully
  selectedAllowedFilter: string = 'all'; // 'all' | 'true' | 'false'
  selectedBookingStatus: number | null = null;
  searchQuery: string = '';
  selectedVendorId: number | null = null;
  vendorsList: any[] = [];

  // Booking statuses from /api/Enums/GetBookingStatus
  bookingStatuses: Array<{ value: number; nameEn: string; nameAr: string }> = [
    { value: 1, nameEn: 'Pending', nameAr: 'قيد الانتظار' },
    { value: 2, nameEn: 'Confirmed', nameAr: 'مؤكد' },
    { value: 3, nameEn: 'Cancelled', nameAr: 'أُلغي' },
    { value: 4, nameEn: 'Completed', nameAr: 'مكتمل' },
    { value: 5, nameEn: 'Refunded', nameAr: 'تم استرداده' },
    { value: 6, nameEn: 'InstaPending', nameAr: 'قيد الانتظار' },
    { value: 7, nameEn: 'InstaConfirmed', nameAr: 'مؤكد' },
    { value: 8, nameEn: 'InstaCancelled', nameAr: 'أُلغي' },
    { value: 9, nameEn: 'InstaCompleted', nameAr: 'مكتمل' },
    { value: 10, nameEn: 'InstaRefunded', nameAr: 'تم استرداده' }
  ];

  // Master Ledger Data
  ledgerItems: SettlementLedgerItem[] = [];
  filteredItems: SettlementLedgerItem[] = [];
  selectedItems: SettlementLedgerItem[] = [];

  // Financial Metrics
  totalEntitlement: number = 0;
  totalSettled: number = 0;
  totalOutstandingDue: number = 0;
  dueCount: number = 0;

  // Pagination for Active Ledger
  first: number = 0;
  rows: number = 10;
  totalRecords: number = 0;

  // Wallet / Settlements History
  walletHistory: any[] = [];
  historyTotalRecords: number = 0;
  historyFirst: number = 0;
  historyRows: number = 10;
  historySearch: string = '';
  historyLoading: boolean = false;
  imgBaseUrl: string = environment.imgUrl;

  constructor(
    private reservationsService: ReservationsService,
    private vendorService: VendorService,
    private companiesWalletService: CompaniesWalletService,
    private configureService: ConfigureService,
    private enumsService: EnumsService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.companyId) {
      this.selectedVendorId = this.companyId;
    } else {
      this.loadVendorsList();
    }
    this.loadBookingStatuses();
    this.loadAllSettlements();
    this.loadWalletHistory();
  }

  loadBookingStatuses(): void {
    this.enumsService.getPaymentStatus().subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          this.bookingStatuses = res;
        } else if (res?.data && Array.isArray(res.data)) {
          this.bookingStatuses = res.data;
        }
      },
      error: (err) => console.error('Error loading booking statuses:', err)
    });
  }

  isVendorRole(): boolean {
    const roles = this.configureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }

  loadVendorsList(): void {
    this.vendorService.getAllVendors({ pageIndex: 1, pageSize: 500, search: '' }).subscribe({
      next: (res) => {
        this.vendorsList = res.data?.data || res.data || [];
      },
      error: (err) => console.error('Error loading vendors list:', err)
    });
  }

  get allowedFilterOptions(): Array<{ label: string; value: string }> {
    const isAr = this.translate.currentLang === 'ar';
    return [
      { label: isAr ? 'الكل (إمكانية التسوية)' : 'All Settlement Eligibility', value: 'all' },
      { label: isAr ? 'مسموح بالتسوية' : 'Allowed to Settle', value: 'true' },
      { label: isAr ? 'غير مسموح بالتسوية' : 'Not Allowed to Settle', value: 'false' }
    ];
  }

  get bookingStatusOptions(): Array<{ label: string; value: number | null }> {
    const isAr = this.translate.currentLang === 'ar';
    const list: Array<{ label: string; value: number | null }> = [
      { label: isAr ? 'جميع حالات الحجز' : 'All Booking Statuses', value: null }
    ];
    this.bookingStatuses.forEach((s) => {
      list.push({
        label: isAr ? (s.nameAr || s.nameEn) : (s.nameEn || s.nameAr),
        value: s.value
      });
    });
    return list;
  }

  loadAllSettlements(): void {
    this.isLoading = true;
    const vendorId = this.selectedVendorId || this.companyId || null;

    const backendFilters: any[] = [];
    if (this.selectedAllowedFilter === 'true' || this.selectedAllowedFilter === 'false') {
      backendFilters.push({
        column: 'allowedToSettlement',
        value: this.selectedAllowedFilter
      });
    }
    if (this.selectedBookingStatus !== null && this.selectedBookingStatus !== undefined) {
      backendFilters.push({
        column: 'status',
        value: String(this.selectedBookingStatus)
      });
    }

    const filter: any = {
      pageIndex: 1,
      pageSize: 1000,
      search: this.searchQuery,
      filters: backendFilters
    };

    if (vendorId) {
      filter.CompanyId = vendorId;
    }

    const items: SettlementLedgerItem[] = [];

    if (this.activeSector === 1) {
      // 1. Travels / Trips
      this.reservationsService.getTravelReservationForVendor(filter).subscribe({
        next: (res) => {
          const dataWrapper = res?.data ?? res;
          const list = dataWrapper?.data ?? (Array.isArray(dataWrapper) ? dataWrapper : []);
          const totalCount = dataWrapper?.itemsCount ?? dataWrapper?.count ?? list.length;
          list.forEach((r: any) => items.push(this.mapToLedgerItem(r, 1, 'Travel')));
          this.finishLoading(items, totalCount);
        },
        error: () => this.finishLoading(items, 0)
      });
      return;
    }

    if (this.activeSector === 2) {
      // 2. Rooms / Hotels
      this.reservationsService.getRoomReservationForVendor(filter).subscribe({
        next: (res) => {
          const dataWrapper = res?.data ?? res;
          const list = dataWrapper?.data ?? (Array.isArray(dataWrapper) ? dataWrapper : []);
          const totalCount = dataWrapper?.itemsCount ?? dataWrapper?.count ?? list.length;
          list.forEach((r: any) => items.push(this.mapToLedgerItem(r, 2, 'Room')));
          this.finishLoading(items, totalCount);
        },
        error: () => this.finishLoading(items, 0)
      });
      return;
    }

    if (this.activeSector === 3) {
      // 3. Outings
      this.reservationsService.getOutingReservationForVendor(filter).subscribe({
        next: (res) => {
          const dataWrapper = res?.data ?? res;
          const list = dataWrapper?.data ?? (Array.isArray(dataWrapper) ? dataWrapper : []);
          const totalCount = dataWrapper?.itemsCount ?? dataWrapper?.count ?? list.length;
          list.forEach((r: any) => items.push(this.mapToLedgerItem(r, 3, 'Outing')));
          this.finishLoading(items, totalCount);
        },
        error: () => this.finishLoading(items, 0)
      });
      return;
    }

    if (this.activeSector === 4) {
      // 4. Manasik / Umrah / Hajj
      this.reservationsService.getManasikReservationForVendor(filter).subscribe({
        next: (res) => {
          const dataWrapper = res?.data ?? res;
          const list = dataWrapper?.data ?? (Array.isArray(dataWrapper) ? dataWrapper : []);
          const totalCount = dataWrapper?.itemsCount ?? dataWrapper?.count ?? list.length;
          list.forEach((r: any) => items.push(this.mapToLedgerItem(r, 4, 'Manasik')));
          this.finishLoading(items, totalCount);
        },
        error: () => this.finishLoading(items, 0)
      });
      return;
    }
  }

  private finishLoading(items: SettlementLedgerItem[], backendTotalCount: number): void {
    this.ledgerItems = items;
    this.applyFilters(backendTotalCount);
    this.calculateMetrics();
    this.isLoading = false;
  }

  private mapToLedgerItem(r: any, moduleType: number, moduleName: string): SettlementLedgerItem {
    const calc = Number(r.vendorCalculatedAmount ?? r.vendorProfitAfterCoupon ?? r.productPrice ?? 0);
    const settled = Number(r.vendorSettledAmount ?? 0);
    const remaining = Math.max(0, calc - settled);
    const status = r.vendorSettlementStatus !== undefined ? r.vendorSettlementStatus : (r.isVendorSettled ? 2 : 0);

    let resolvedModuleName = moduleName;
    if (moduleType === 4) {
      const isUmrah = r.hajj?.manasikType === 2 || r.manasikType === 2 || r.manasikType === 'Umrah' || r.hajj?.isUmrah;
      resolvedModuleName = isUmrah ? 'Umrah' : (r.hajj?.manasikType === 1 ? 'Hajj' : 'Manasik / Umrah');
    }

    const vName =
      r.companyDto?.name ||
      r.company?.name ||
      r.vendor?.name ||
      r.vendorName ||
      r.trip?.companyDto?.name ||
      r.trip?.vendor?.name ||
      r.room?.companyDto?.name ||
      r.room?.vendor?.name ||
      r.outing?.vendorName ||
      r.outing?.companyDto?.name ||
      r.outing?.vendor?.name ||
      r.hajj?.companyDto?.name ||
      r.hajj?.vendor?.name ||
      '--';

    const vId =
      r.companyDto?.id ||
      r.companyId ||
      r.companyDtoId ||
      r.vendorId ||
      r.vendor?.id ||
      r.trip?.companyDto?.id ||
      r.trip?.vendorId ||
      r.room?.companyDto?.id ||
      r.room?.vendorId ||
      r.outing?.vendorId ||
      r.outing?.companyDto?.id ||
      r.outing?.vendor?.id ||
      r.hajj?.companyDto?.id ||
      r.hajj?.vendorId;

    return {
      id: r.id,
      moduleType,
      moduleName: resolvedModuleName,
      bookingRefernce: r.bookingRefernce || r.bookingId || `#${r.id}`,
      bookingId: r.bookingId || r.id,
      itemName: r.trip?.name || r.room || r.outing?.name || r.hajj?.name || '--',
      customerName: r.user?.name || r.userdto?.name || 'Customer',
      vendorId: vId,
      vendorName: vName,
      reservationDate: r.reservationDate || r.startDate,
      serviceDate: r.from || r.outingDate || r.startDate,
      productPrice: Number(r.productPrice ?? 0),
      tripsCommission: Number(r.tripsValue ?? 0),
      vendorCalculatedAmount: calc,
      vendorSettledAmount: settled,
      remainingToSettle: remaining,
      vendorSettlementStatus: status,
      bookingStatus: r.status !== undefined ? r.status : r.bookingStatus,
      allowedToSettlement: r.allowedToSettlement !== undefined ? Boolean(r.allowedToSettlement) : false,
      reservationOutingTickets: r.reservationOutingTickets || [],
      countDetails: r.countDetails,
      quantity: r.quantity || r.numberOfSeats,
      rawItem: r
    };
  }

  applyFilters(backendTotalCount?: number): void {
    let list = [...this.ledgerItems];

    // Status Filter (-1: All, 0: Due/Unsettled, 1: Partially, 2: Fully)
    if (this.selectedStatusFilter === 0) {
      list = list.filter((item) => item.vendorSettlementStatus !== 2 && item.remainingToSettle > 0);
    } else if (this.selectedStatusFilter === 1) {
      list = list.filter((item) => item.vendorSettlementStatus === 1);
    } else if (this.selectedStatusFilter === 2) {
      list = list.filter((item) => item.vendorSettlementStatus === 2);
    }

    // Booking Status Filter
    if (this.selectedBookingStatus !== null && this.selectedBookingStatus !== undefined) {
      list = list.filter((item) => item.bookingStatus === this.selectedBookingStatus);
    }

    // Allowed to Settlement Filter
    if (this.selectedAllowedFilter === 'true') {
      list = list.filter((item) => item.allowedToSettlement === true);
    } else if (this.selectedAllowedFilter === 'false') {
      list = list.filter((item) => item.allowedToSettlement === false);
    }

    this.totalRecords = list.length;
    this.filteredItems = list.slice(this.first, this.first + this.rows);
  }

  calculateMetrics(): void {
    let entitlement = 0;
    let settled = 0;
    let due = 0;
    let dueCount = 0;

    this.ledgerItems.forEach((item) => {
      // 1. Settlement Eligibility Filter Check
      let matchesAllowed = true;
      if (this.selectedAllowedFilter === 'true') {
        matchesAllowed = item.allowedToSettlement === true;
      } else if (this.selectedAllowedFilter === 'false') {
        matchesAllowed = item.allowedToSettlement === false;
      }

      // 2. Booking Status Filter Check
      let matchesBookingStatus = true;
      if (this.selectedBookingStatus !== null && this.selectedBookingStatus !== undefined) {
        matchesBookingStatus = item.bookingStatus === this.selectedBookingStatus;
      }

      if (matchesAllowed && matchesBookingStatus) {
        entitlement += item.vendorCalculatedAmount;
        settled += item.vendorSettledAmount;
        if (item.vendorSettlementStatus !== 2 && item.remainingToSettle > 0) {
          due += item.remainingToSettle;
          dueCount++;
        }
      }
    });

    this.totalEntitlement = entitlement;
    this.totalSettled = settled;
    this.totalOutstandingDue = due;
    this.dueCount = dueCount;
  }

  onLedgerLazyLoad(event: any): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? this.rows;
    this.applyFilters();
  }

  onSectorChange(sectorId: number): void {
    this.activeSector = sectorId;
    this.first = 0;
    this.loadAllSettlements();
  }

  onStatusFilterChange(status: number): void {
    this.selectedStatusFilter = status;
    this.first = 0;
    this.loadAllSettlements();
  }

  onAllowedFilterChange(): void {
    this.first = 0;
    this.loadAllSettlements();
  }

  onBookingStatusChange(): void {
    this.first = 0;
    this.loadAllSettlements();
  }

  onVendorChange(): void {
    this.first = 0;
    this.loadAllSettlements();
    this.historyFirst = 0;
    this.loadWalletHistory();
  }

  onSearch(): void {
    this.first = 0;
    this.loadAllSettlements();
  }

  get hasActiveFilters(): boolean {
    return (
      !!this.searchQuery ||
      this.selectedStatusFilter !== -1 ||
      this.selectedAllowedFilter !== 'all' ||
      this.selectedBookingStatus !== null ||
      (!this.companyId && this.selectedVendorId !== null)
    );
  }

  resetAllFilters(): void {
    this.searchQuery = '';
    this.selectedStatusFilter = -1;
    this.selectedAllowedFilter = 'all';
    this.selectedBookingStatus = null;
    if (!this.companyId) {
      this.selectedVendorId = null;
    }
    this.first = 0;
    this.loadAllSettlements();
  }

  openSingleSettlement(item: SettlementLedgerItem): void {
    const ref = this.dialogService.open(MarkVendorSettledDialogComponent, {
      header: this.translate.instant('settlementDialogHeader') || 'Vendor Reservation Settlement',
      width: '480px',
      data: {
        reservation: item.rawItem,
        moduleType: item.moduleType,
        moduleName: item.moduleName,
        vendorName: item.vendorName
      },
      closable: true,
      dismissableMask: true
    });

    ref.onClose.subscribe((result) => {
      if (result?.success) {
        this.loadAllSettlements();
        this.loadWalletHistory();
        this.selectedItems = [];
      }
    });
  }

  get selectedTotalPayout(): number {
    return this.selectedItems.reduce((acc, curr) => acc + curr.remainingToSettle, 0);
  }

  clearSelections(): void {
    this.selectedItems = [];
  }

  processBatchSettlement(): void {
    if (!this.selectedItems || this.selectedItems.length === 0) return;

    this.confirmationService.confirm({
      header: this.translate.instant('confirmBatchSettlement') || 'Confirm Batch Settlement',
      message: `Are you sure you want to settle ${this.selectedItems.length} reservations totaling ${this.selectedTotalPayout.toFixed(2)} EGP?`,
      icon: 'pi pi-wallet',
      accept: () => {
        this.isLoading = true;
        let completed = 0;
        const total = this.selectedItems.length;

        this.selectedItems.forEach((item) => {
          const payload = {
            reservationId: item.id,
            settledAmount: item.remainingToSettle > 0 ? item.remainingToSettle : item.vendorCalculatedAmount
          };

          this.reservationsService.markVendorSettledByModule(item.moduleType, payload).subscribe({
            next: () => {
              completed++;
              if (completed >= total) {
                this.toastr.success('Batch settlements completed successfully', 'Success');
                this.selectedItems = [];
                this.loadAllSettlements();
              }
            },
            error: (err) => {
              completed++;
              console.error('Error settling item #', item.id, err);
              if (completed >= total) {
                this.loadAllSettlements();
              }
            }
          });
        });
      }
    });
  }

  goToVendor(vendorId?: number): void {
    if (vendorId) {
      this.router.navigate(['/vendor-details', vendorId]);
    }
  }

  getVendorSettlementStatusLabel(status: number): string {
    switch (status) {
      case 1:
        return this.translate.instant('partiallySettled') || 'Partially Settled';
      case 2:
        return this.translate.instant('fullySettled') || 'Fully Settled';
      default:
        return this.translate.instant('notSettled') || 'Not Settled';
    }
  }

  getVendorSettlementStatusSeverity(status: number): 'success' | 'warning' | 'danger' {
    switch (status) {
      case 2:
        return 'success';
      case 1:
        return 'warning';
      default:
        return 'danger';
    }
  }

  getBookingStatusLabel(status?: number): string {
    if (status === undefined || status === null) return '--';
    const lang = this.translate.currentLang || 'ar';
    const found = this.bookingStatuses?.find((s) => s.value === status);
    if (found) {
      return lang === 'ar' ? (found.nameAr || found.nameEn) : (found.nameEn || found.nameAr);
    }
    switch (status) {
      case 1:
        return lang === 'ar' ? 'قيد الانتظار' : 'Pending';
      case 2:
        return lang === 'ar' ? 'مؤكد' : 'Confirmed';
      case 3:
        return lang === 'ar' ? 'أُلغي' : 'Cancelled';
      case 4:
        return lang === 'ar' ? 'مكتمل' : 'Completed';
      case 5:
        return lang === 'ar' ? 'تم استرداده' : 'Refunded';
      case 6:
        return lang === 'ar' ? 'قيد الانتظار' : 'InstaPending';
      case 7:
        return lang === 'ar' ? 'مؤكد' : 'InstaConfirmed';
      case 8:
        return lang === 'ar' ? 'أُلغي' : 'InstaCancelled';
      case 9:
        return lang === 'ar' ? 'مكتمل' : 'InstaCompleted';
      case 10:
        return lang === 'ar' ? 'تم استرداده' : 'InstaRefunded';
      default:
        return '--';
    }
  }

  getBookingStatusSeverity(status?: number): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    switch (status) {
      case 2: // Confirmed
      case 4: // Completed
      case 7: // InstaConfirmed
      case 9: // InstaCompleted
        return 'success';
      case 1: // Pending
      case 6: // InstaPending
        return 'warning';
      case 3: // Cancelled
      case 8: // InstaCancelled
        return 'danger';
      case 5: // Refunded
      case 10: // InstaRefunded
        return 'info';
      default:
        return 'secondary';
    }
  }

  switchViewMode(mode: 'dues' | 'history'): void {
    this.activeViewMode = mode;
    if (mode === 'history' && this.walletHistory.length === 0) {
      this.loadWalletHistory();
    }
  }

  loadWalletHistory(): void {
    this.historyLoading = true;
    const vendorId = this.selectedVendorId || this.companyId || null;

    const filter: any = {
      pageIndex: Math.floor(this.historyFirst / this.historyRows) + 1,
      pageSize: this.historyRows,
      search: this.historySearch
    };

    if (vendorId) {
      filter.CompanyId = vendorId;
    }

    this.companiesWalletService.getCompanyWallet(filter).subscribe({
      next: (res) => {
        this.historyLoading = false;
        const dataWrapper = res?.data ?? res;
        this.walletHistory = dataWrapper?.data ?? (Array.isArray(dataWrapper) ? dataWrapper : []);
        this.historyTotalRecords = dataWrapper?.itemsCount ?? dataWrapper?.count ?? this.walletHistory.length;
      },
      error: (err) => {
        this.historyLoading = false;
        console.error('Error loading wallet history:', err);
      }
    });
  }

  onHistoryLazyLoad(event: any): void {
    this.historyFirst = event.first ?? 0;
    this.historyRows = event.rows ?? this.historyRows;
    this.loadWalletHistory();
  }

  onHistorySearch(): void {
    this.historyFirst = 0;
    this.loadWalletHistory();
  }
}
