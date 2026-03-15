import { Component, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OutingBranshesService } from 'src/app/shared/services/outing-branshes.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BranchesFormComponent } from '../branches-form/branches-form.component';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-branches-list',
  standalone: true,
  imports: [SharedModule],
  providers: [DialogService, ConfirmationService],
  templateUrl: './branches-list.component.html',
  styleUrl: './branches-list.component.scss'
})
export class BranchesListComponent {
  constructor(
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private toastrService: ToastrService,
    private outingBranshesService: OutingBranshesService
  ) {}

  @ViewChild('dt') dt: Table | undefined;

  branches: any[] = [];
  searchTerm: string = '';
  totalRecords: number = 0;
  loading: boolean = false;
  // first = 0;
  // rows = 10;
  ref: DynamicDialogRef | undefined;

  pageChange(event: any) {
    // Deprecated for loadBranches
  }

  onSearch() {
    this.dt?.reset();
  }

  refresh() {
    this.dt?.reset();
  }

  loadBranches(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this.outingBranshesService.getAllOutingBranches(payload).subscribe({
      next: (res: any) => {
        if (res?.success) {
          if (res.data?.data && Array.isArray(res.data.data)) {
            this.branches = res.data.data;
            this.totalRecords = res.data.itemsCount;
          } else if (Array.isArray(res.data)) {
            // Fallback for non-paginated arrays
            this.branches = res.data;
            this.totalRecords = res.data.length;
          } else {
            this.branches = [];
            this.totalRecords = 0;
          }
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading branches:', err);
        this.loading = false;
      }
    });
  }

  handleEdit(branch: any) {
    this.ref = this.dialogService.open(BranchesFormComponent, {
      header: 'Edit Branch',
      width: '50vw',
      modal: true,
      closable: true,
      data: branch, // Pass full branch object
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((data) => {
      if (data) {
        // Refresh the list with current pagination and search
        this.dt?.reset();
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
        this.outingBranshesService.deleteOutingBranches(id).subscribe({
          next: () => {
            // Adjust pagination if needed
            this.dt?.reset();
            this.toastrService.success('Deleted successfully', 'Success');
          },
          error: () => {
            this.toastrService.error('Failed to delete', 'Error');
          }
        });
      }
    });
  }
}
