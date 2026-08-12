import { Component, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { HajjCategoryService } from 'src/app/shared/services/hajj-category.service';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { HajjCategoryFormComponent } from '../hajj-category-form/hajj-category-form.component';
import { HajjCategoryDetailsComponent } from '../hajj-category-details/hajj-category-details.component';

@Component({
  selector: 'app-hajj-category-list',
  standalone: true,
  imports: [SharedModule],
  providers: [DialogService, ConfirmationService],
  templateUrl: './hajj-category-list.component.html',
  styleUrl: './hajj-category-list.component.scss'
})
export class HajjCategoryListComponent {
  @ViewChild('dt') dt!: Table;
  baseUrl = environment.imgUrl;
  categories: any[] = [];
  searchTerm = '';
  selectedStatus: boolean | null = null;
  statusOptions = [
    { label: 'active', value: true },
    { label: 'inactive', value: false }
  ];
  totalRecords = 0;
  loading = false;
  ref: DynamicDialogRef | undefined;

  constructor(
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private toastrService: ToastrService,
    private hajjCategoryService: HajjCategoryService,
    private translate: TranslateService
  ) {}

  getImageUrl(category: any): string {
    const imageUrl = category?.imageUrl || category?.uploadedImage || category?.imagePath;
    return imageUrl ? this.baseUrl + imageUrl : 'https://placehold.co/600x400?text=No+Image';
  }

  loadCategories(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    if (this.selectedStatus !== null && this.selectedStatus !== undefined) {
      payload.filters.push({
        column: 'isActive',
        value: this.selectedStatus
      });
    }

    this.hajjCategoryService.getAllHajjCategories(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.categories = res.data?.data || [];
          this.totalRecords = res.data?.itemsCount || 0;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading hajj categories:', err);
        this.loading = false;
      }
    });
  }

  refresh() {
    this.dt.reset();
  }

  onSearch() {
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

  handleEdit(category: any) {
    this.ref = this.dialogService.open(HajjCategoryFormComponent, {
      header: this.translate.instant('edit hajj category'),
      width: '50vw',
      modal: true,
      closable: true,
      data: { id: category.id },
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
    this.ref = this.dialogService.open(HajjCategoryDetailsComponent, {
      header: this.translate.instant('hajj category details'),
      width: '45vw',
      modal: true,
      closable: true,
      data: { id },
      breakpoints: {
        '960px': '70vw',
        '640px': '90vw'
      }
    });
  }

  toggleStatus(id: number) {
    this.hajjCategoryService.toggleStatus(id).subscribe({
      next: () => {
        this.toastrService.success('Status updated successfully', 'Success');
      },
      error: (err) => {
        this.dt.reset();
        this.toastrService.error('Failed to update status', 'Error');
        console.error('Failed to toggle hajj category status:', err);
      }
    });
  }

  handleDelete(id: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this item?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised mx-2',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.hajjCategoryService.deleteHajjCategory(id).subscribe({
          next: () => {
            this.toastrService.success('Deleted successfully', 'Success');
            this.dt.reset();
          },
          error: () => {
            this.toastrService.error('Failed to delete', 'Error');
          }
        });
      }
    });
  }
}