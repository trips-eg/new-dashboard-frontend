import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { Vendor } from 'src/app/shared/model/vendoreDto';
import { VendorService } from 'src/app/shared/services/vendor.service';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ToastrService } from 'ngx-toastr';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-vendors-list',
  standalone: true,
  imports: [SharedModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './vendors-list.component.html',
  styleUrl: './vendors-list.component.scss'
})
export class VendorsListComponent {
  @ViewChild('dt') dt!: Table;
  vendors: Vendor[] = [];
  searchedWord: string = '';
  totalRecords: number = 0;
  isLoading: boolean = false;
  lang: string = 'en';

  constructor(
    private vendorService: VendorService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private translate: TranslateService,
    private ToastrService: ToastrService
  ) {
    this.translate.onLangChange.subscribe((event) => {
      this.lang = event.lang;
    });
  }

  loadVendors(event: TableLazyLoadEvent): void {
    this.isLoading = true;
    const payload = TableRequestBuilder.build(event, this.searchedWord);

    this.vendorService.getAllVendors(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.vendors = res.data.data;
          this.totalRecords = res.data.itemsCount;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching vendors:', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.dt.reset();
  }

  view(selectedId: string) {
    this.router.navigate(['/vendor-details', selectedId]);
  }

  update(selectedId: string) {
    this.router.navigate(['/vendors-add-edit'], {
      queryParams: { id: selectedId, mode: 'edit' }
    });
  }

  delete(selectedId: string) {
    this.confirmationService.confirm({
      message: this.translate.instant('deleteVendorConfirmation'),
      header: this.translate.instant('confirmation'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.deleteVendor(selectedId);
      },
      reject: () => {}
    });
  }

  deleteVendor(vendorId: any) {
    this.vendorService.deleteVendor(vendorId).subscribe(
      (res) => {
        this.ToastrService.success(this.translate.instant('vendor Deleted Successfully'));
        this.dt.reset();
      },
      (error) => {
        console.error('Error deleting vendor:', error);
        this.ToastrService.error(this.translate.instant('Failed to Delete vendor'));
      }
    );
  }

  toggleVendorStatus(vendorId: number) {
    this.vendorService.toggleVendorStatus(vendorId).subscribe({
      next: (res) => {
        this.ToastrService.success(this.translate.instant('Vendor status updated successfully'));
      },
      error: (err) => {
        console.error('Error toggling vendor status:', err);
        this.ToastrService.error(this.translate.instant('Failed to update vendor status'));
        this.dt.reset();
      }
    });
  }
}
