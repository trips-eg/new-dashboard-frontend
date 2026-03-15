import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { Ihotel } from 'src/app/shared/model/ihotel';
import { HotelService } from 'src/app/shared/services/hotel.service';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-hotels-list',
  standalone: true,
  imports: [SharedModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './hotels-list.component.html',
  styleUrls: ['./hotels-list.component.scss']
})
export class HotelsListComponent implements OnInit {
  @ViewChild('dt') dt: Table;
  totalRecords: number = 0;
  searchTerm: string = '';
  hotels: Ihotel[] = [];
  loading: boolean = false;

  constructor(
    private _HotelService: HotelService,
    private ConfirmationService: ConfirmationService,
    private ToastrService: ToastrService
  ) {}

  ngOnInit(): void {}

  loadHotels(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this._HotelService.getAllHotels(payload).subscribe({
      next: (res) => {
        this.hotels = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching hotels', err);
        this.hotels = [];
        this.totalRecords = 0;
        this.loading = false;
      }
    });
  }

  onSearch(event?: any) {
    this.dt.reset();
  }

  refresh() {
    this.dt.reset();
  }

  toggleHotelStatus(id: number, status: boolean) {
    const payLoad = {
      id: id,
      status: status
    };
    this._HotelService.updateHotelStatus(payLoad).subscribe({
      next: (res) => {
        this.ToastrService.success('Hotel status updated successfully');
        this.refresh();
      },
      error: (err) => {
        this.refresh();
        this.ToastrService.error('Error updating hotel status');
        // Log the error for debugging
        console.error('Error updating hotel status', err);
      }
    });
  }
  deleteHotel(id: number) {
    this.ConfirmationService.confirm({
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      message: 'Are you sure you want to delete this hotel?',
      accept: () => {
        this._HotelService.deleteHotel(id).subscribe({
          next: (res) => {
            this.refresh();
          },
          error: (err) => {
            console.error('Error deleting hotel', err);
          }
        });
      }
    });
  }
}
