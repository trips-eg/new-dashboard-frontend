import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IroomFeaturies } from 'src/app/shared/model/iroom-featuries';
import { RoomFeaturiesService } from 'src/app/shared/services/room-featuries.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { RoomFeaturesFormComponent } from '../room-features-form/room-features-form.component';
import { ToastrService } from 'ngx-toastr';

import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';
import { Table, TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'app-room-features-list',
  standalone: true,
  imports: [SharedModule],
  providers: [ConfirmationService, MessageService, DialogService],
  templateUrl: './room-features-list.component.html',
  styleUrl: './room-features-list.component.scss'
})
export class RoomFeaturesListComponent implements OnInit {
  @ViewChild('dt') dt: Table;
  searchTerm: string = '';
  first = 0;
  rows = 10;
  ref: DynamicDialogRef | undefined;

  roomFeaturies: IroomFeaturies[] = [];
  totalRecords: number = 0;
  loading: boolean = true;

  constructor(
    private _RoomFeaturiesService: RoomFeaturiesService,
    private ConfirmationService: ConfirmationService,
    private MessageService: MessageService,
    private dialogService: DialogService,
    private ToastrService: ToastrService
  ) {}

  ngOnInit(): void {}

  loadRoomFeatures(event: TableLazyLoadEvent) {
    this.loading = true;
    const filter = TableRequestBuilder.build(event, this.searchTerm);
    this._RoomFeaturiesService.getAllRoomFeaturies(filter).subscribe({
      next: (res: any) => {
        this.roomFeaturies = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.loading = false;
        console.log('roomFeaturies:', this.roomFeaturies);
      },
      error: (err) => {
        this.loading = false;
        console.log('Get room features error:', err);
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
        this._RoomFeaturiesService.deleteRoomFeature(id).subscribe({
          next: () => {
            this.dt.reset();
            this.ToastrService.success('Room Feature deleted successfully', 'Success');
          },
          error: () => {
            this.ToastrService.error('Failed to delete room feature', 'Error');
          }
        });
      }
    });
  }

  handleEdit(id: number, name: string) {
    this.ref = this.dialogService.open(RoomFeaturesFormComponent, {
      header: 'Edit room feature',
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
        this.dt.reset();
        this.ToastrService.success('Room Feature updated successfully', 'Success');
      }
    });
  }

  // handleAdd() {
  //   this.ref = this.dialogService.open(RoomFeaturesFormComponent, {
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
  //       this.getingAllRoomFeaturies(pageIndex, this.rows, this.searchTerm);
  //       this.MessageService.add({
  //         severity: 'success',
  //         summary: 'Success',
  //         detail: 'Bed type created successfully'
  //       });
  //     }
  //   });
  // }

  onSearch() {
    this.dt.reset();
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
