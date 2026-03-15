import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IroomTypies } from 'src/app/shared/model/iroom-typies';
import { RoomTybeService } from 'src/app/shared/services/room-tybe.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { RoomTybiesFormComponent } from '../room-tybies-form/room-tybies-form.component';
import { ToastrService } from 'ngx-toastr';

import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';
import { Table, TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'app-room-tybies-list',
  standalone: true,
  imports: [SharedModule],
  providers: [ConfirmationService, MessageService, DialogService],
  templateUrl: './room-tybies-list.component.html',
  styleUrl: './room-tybies-list.component.scss'
})
export class RoomTybiesListComponent implements OnInit {
  @ViewChild('dt') dt: Table;
  searchTerm: string = '';
  first = 0;
  rows = 10;
  totalRecords: number = 0;
  roomTybies: IroomTypies[] = [];
  ref: DynamicDialogRef | undefined;
  loading: boolean = true;

  constructor(
    private _RoomTybeService: RoomTybeService,
    private ConfirmationService: ConfirmationService,
    private MessageService: MessageService,
    private dialogService: DialogService,
    private ToastrService: ToastrService
  ) {}

  ngOnInit(): void {}

  loadRoomTybes(event: TableLazyLoadEvent) {
    this.loading = true;
    const filter = TableRequestBuilder.build(event, this.searchTerm);
    this._RoomTybeService.getAllRoomTybes(filter).subscribe({
      next: (res) => {
        this.roomTybies = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.loading = false;
        console.log(this.roomTybies);
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
      }
    });
  }
  handleEdit(id: number, name: string, maxOccupancy: number) {
    this.ref = this.dialogService.open(RoomTybiesFormComponent, {
      header: 'Edit Bed Type',
      width: '50vw',
      modal: true,
      closable: true,
      data: { id, name, maxOccupancy },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((data) => {
      if (data) {
        this.dt.reset();
        this.ToastrService.success('Room Type updated successfully', 'Success');
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
        this._RoomTybeService.deleteRoomTybe(id).subscribe({
          next: () => {
            this.dt.reset();
            this.ToastrService.success('Room Type deleted successfully', 'Success');
          },
          error: () => {
            this.ToastrService.error('Failed to delete Room Type', 'Error');
          }
        });
      }
    });
  }

  onSearch() {
    this.dt.reset();
  }
}
