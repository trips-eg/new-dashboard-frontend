import { Component, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OutingCategoryServiseService } from 'src/app/shared/services/outing-category-servise.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { OutingCategoryformComponent } from '../outing-categoryform/outing-categoryform.component';
import { OutingCategoryDetailsComponent } from '../outing-category-details/outing-category-details.component';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-outing-category-list',
  standalone: true,
  imports: [SharedModule],
  providers: [DialogService, ConfirmationService],

  templateUrl: './outing-category-list.component.html',
  styleUrl: './outing-category-list.component.scss'
})
export class OutingCategoryListComponent {
  @ViewChild('dt') dt!: Table;
  baseUrl = environment.imgUrl;

  getImageUrl(imageUrl: string): string {
    return imageUrl 
      ? this.baseUrl + imageUrl 
      : 'https://placehold.co/600x400?text=No+Image';
  }

  constructor(
    private dialogService: DialogService,
    private ConfirmationService: ConfirmationService,
    private ToastrService: ToastrService,
    private OutingCategoryService: OutingCategoryServiseService,
    private translate: TranslateService
  ) {}
  pageChange(event: any) {
    // Deprecated in favor of onLazyLoad
  }
  onSearch() {
    this.dt.reset();
  }

  categories: any[] = []; // Fixed typo from 'catigoreys'
  searchTerm: string = '';
  selectedStatus: boolean | null = null;
  statusOptions = [
    { label: 'active', value: true },
    { label: 'inactive', value: false }
  ];

  totalRecords: number = 0;
  loading: boolean = false;
  // first = 0; // Handled by Table
  // rows = 10; // Handled by Table
  ref: DynamicDialogRef | undefined;

  loadCategories(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    if (this.selectedStatus !== null && this.selectedStatus !== undefined) {
      payload.filters.push({
        column: 'isActive',
        value: this.selectedStatus
      });
    }

    this.OutingCategoryService.getAlloutingCategoty(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.categories = res.data.data;
          this.totalRecords = res.data.itemsCount;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('error:', err);
        this.loading = false;
      }
    });
  }

  refresh() {
    this.dt.reset();
  }

  onStatusFilter() {
    this.dt.reset();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.dt.reset();
  }

  handleEdit(name: string, description: string, id: number, imageUrl: string, isActive: boolean, sequence: number) {
    this.ref = this.dialogService.open(OutingCategoryformComponent, {
      header: this.translate.instant('edit outing category'),
      width: '50vw',
      modal: true,
      closable: true,
      data: { id, name, description, imageUrl, isActive, sequence },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((data) => {
      if (data) {
        this.dt.reset();
      }
    });
  }

  handleViewDetails(id: number) {
    this.ref = this.dialogService.open(OutingCategoryDetailsComponent, {
      header: this.translate.instant('outing category details'),
      width: '60vw',
      modal: true,
      closable: true,
      data: { id },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });
  }

  toggleStatus(id: number) {
    this.OutingCategoryService.toggleStatus(id).subscribe({
      next: (res: any) => {
        this.ToastrService.success('Status updated successfully', 'Success');
      },
      error: (err: any) => {
        this.dt.reset();
        this.ToastrService.error('Failed to update status', 'Error');
        console.error('Failed to toggle status:', err);
      }
    });
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
        this.OutingCategoryService.deleteOutingCategory(id).subscribe({
          next: () => {
            this.ToastrService.success(' deleted successfully', 'Success');
            this.dt.reset();
          },
          error: () => {
            this.ToastrService.error('Failed to delete ', 'Error');
          }
        });
      }
    });
  }
}
