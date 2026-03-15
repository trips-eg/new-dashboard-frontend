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

  // Additional filter state
  isExternalTrip: boolean | null = null;

  travelType = [
    { label: 'All', value: null },
    { label: 'Internal', value: false },
    { label: 'External', value: true }
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

  isOldTravel(travel: Travel): boolean {
    if (!travel.startDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(travel.startDate);
    startDate.setHours(0, 0, 0, 0);
    return startDate < today;
  }

  loadTravels(event: TableLazyLoadEvent) {
    this.isLoading = true;
    const basePayload = TableRequestBuilder.build(event, this.searchedWord);

    const payload = {
      ...basePayload,
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

  onSearch(event?: any) {
    this.dt.reset();
  }

  onSelectType(event: any) {
    this.isExternalTrip = event.value;
    this.dt.reset();
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
