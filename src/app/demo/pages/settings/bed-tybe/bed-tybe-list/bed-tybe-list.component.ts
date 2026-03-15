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
