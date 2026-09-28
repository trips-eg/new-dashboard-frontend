import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Travel } from 'src/app/shared/model/travelDto';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-travels-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './travels-list.component.html',
  styleUrl: './travels-list.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class TravelsListComponent {
  @ViewChild('dt') dt!: Table;
  @Input() CompanyId: any;

  travels: Travel[] = [];
  totalRecords: number = 0;
  isLoading: boolean = false;
  searchedWord: string = '';
  lang: string;

  // Enhanced filter state
  isExternalTrip: boolean | null = null;
  selectedTripType: number | null = null;
  selectedStatus: boolean | null = null;

  scopeOptions = [
    { label: 'All Scopes', value: null },
    { label: 'Internal Trips', value: false },
    { label: 'External Trips', value: true }
  ];

  tripTypeOptions = [
    { label: 'All Types', value: null },
    { label: 'Normal Trip', value: 1 },
    { label: 'Periodic Trip', value: 2 },
    { label: 'Day Use Trip', value: 3 }
  ];

  statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  constructor(
    private router: Router,
    private translate: TranslateService,
    private travelServ: TravelTripsService,
    private toast: ToastrService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private ConfigureService: ConfigureService
  ) {
    this.translate.onLangChange.subscribe((event) => {
      this.lang = event.lang;
    });
    this.lang = this.translate.currentLang;
  }

  isVendor(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }

  // ✅ NEW: Admin check — Admin can edit any trip across all vendors
  isAdmin(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Admin') || role.startsWith('SuperAdmin'));
  }

  canCreate(): boolean {
    return this.isVendor() || this.isAdmin();
  }

  isValidDate(dateString?: string): boolean {
    if (!dateString || dateString.startsWith('0001-01-01')) return false;
    const d = new Date(dateString);
    return !isNaN(d.getTime()) && d.getFullYear() > 2000;
  }

  isMultiDateTrip(travel: any): boolean {
    if (travel.tripDates && travel.tripDates.length > 0) return true;
    return !!(travel.startDate && travel.startDate.startsWith('0001-01-01'));
  }

  getTripTypeBadge(type?: number): { label: string; severity: 'info' | 'warning' | 'success' | 'secondary'; icon: string } {
    switch (type) {
      case 1:
        return { label: 'Normal', severity: 'info', icon: 'pi pi-calendar' };
      case 2:
        return { label: 'Periodic', severity: 'warning', icon: 'pi pi-clock' };
      case 3:
        return { label: 'Day Use', severity: 'success', icon: 'pi pi-sun' };
      default:
        return { label: 'Normal', severity: 'secondary', icon: 'pi pi-tag' };
    }
  }

  isOldTravel(travel: Travel): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (travel.tripDates && travel.tripDates.length > 0) {
      const hasUpcoming = travel.tripDates.some((td: any) => {
        const targetDate = td.endDate ? new Date(td.endDate) : new Date(td.startDate);
        targetDate.setHours(0, 0, 0, 0);
        return targetDate >= today;
      });
      return !hasUpcoming;
    }

    if (!this.isValidDate(travel.startDate)) return false;
    const startDate = new Date(travel.startDate);
    startDate.setHours(0, 0, 0, 0);
    return startDate < today;
  }

  getDatesTooltip(tripDates: any[]): string {
    if (!tripDates || !tripDates.length) return '';
    return tripDates
      .map((td, index) => {
        const start = new Date(td.startDate).toLocaleDateString();
        const end = td.endDate ? new Date(td.endDate).toLocaleDateString() : '';
        return end ? `#${index + 1}: ${start} ➔ ${end}` : `#${index + 1}: ${start}`;
      })
      .join('\n');
  }

  createTravel() {
    this.router.navigate(['/travel-form']);
  }

  loadTravels(event: TableLazyLoadEvent) {
    this.isLoading = true;
    const basePayload = TableRequestBuilder.build(event, this.searchedWord);

    const customFilters = [...(basePayload.filters || [])];

    if (this.selectedTripType !== null && this.selectedTripType !== undefined) {
      customFilters.push({ column: 'tripType', value: this.selectedTripType });
    }

    if (this.selectedStatus !== null && this.selectedStatus !== undefined) {
      customFilters.push({ column: 'isActive', value: this.selectedStatus });
    }

    const payload = {
      ...basePayload,
      filters: customFilters,
      CompanyId: this.CompanyId,
      IsExternalTrip: this.isExternalTrip
    };

    this.travelServ.getAllTravels(payload).subscribe({
      next: (response) => {
        if (response.success) {
          this.travels = response.data.data || [];
          this.totalRecords = response.data.itemsCount || 0;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading travels:', err);
      }
    });
  }

  hasActiveFilters(): boolean {
    return !!(
      (this.searchedWord && this.searchedWord.trim().length > 0) ||
      this.isExternalTrip !== null ||
      this.selectedTripType !== null ||
      this.selectedStatus !== null
    );
  }

  getActiveFilterCount(): number {
    let count = 0;
    if (this.searchedWord && this.searchedWord.trim().length > 0) count++;
    if (this.isExternalTrip !== null) count++;
    if (this.selectedTripType !== null) count++;
    if (this.selectedStatus !== null) count++;
    return count;
  }

  onSearch(event?: any) {
    if (this.dt) this.dt.reset();
  }

  clearSearch() {
    this.searchedWord = '';
    if (this.dt) this.dt.reset();
  }

  onFilterChange() {
    if (this.dt) this.dt.reset();
  }

  resetFilters() {
    this.searchedWord = '';
    this.isExternalTrip = null;
    this.selectedTripType = null;
    this.selectedStatus = null;
    if (this.dt) this.dt.reset();
  }

  goToCompany(companyId: number) {
    this.router.navigate(['/vendor-details', companyId]);
  }

  toggleTravelStatus(id: number, status: boolean) {
    this.travelServ.updateTravelStatus(id, status).subscribe({
      next: (res) => {
        this.toast.success('travel status updated successfully');
      },
      error: (err) => {
        this.dt.reset();
        this.toast.error('Error updating travel status');
        console.error('Error updating  status', err);
      }
    });
  }

  toggleBlockStatus(id) {
    this.travelServ.toggleBlock(id).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('room block status changed successfully'));
      },
      error: (err) => {
        this.toast.error(this.translate.instant('error in update  block status'));
        this.dt.reset();
      }
    });
  }

  // Actions
  view(id: any) {
    this.router.navigate(['/travel-details', id]);
  }

  update(id: any) {
    this.router.navigate(['/travel-form'], { queryParams: { id: id, mode: 'edit' } });
  }

  delete(id: any) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete this trip?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.deleteTravel(id);
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
          this.dt.reset();
        }
      },
      (error) => {}
    );
  }
}
