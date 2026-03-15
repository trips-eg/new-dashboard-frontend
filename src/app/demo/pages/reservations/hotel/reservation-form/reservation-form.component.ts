import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SubHeaderComponent } from '../../../../../shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Ihotel } from 'src/app/shared/model/ihotel';
import { HotelService } from 'src/app/shared/services/hotel.service';

import { HotelFilterComponent } from '../../../../../shared/hotel-filter/hotel-filter.component';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, HotelFilterComponent],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.scss'
})
export class ReservationFormComponent implements OnInit {
  constructor(
    private Router: Router,
    private _HotelService: HotelService
  ) {}

  first = 0;
  rows = 12;
  totalRecords: number = 0;
  searchTerm: string = '';
  hotels: Ihotel[] = [];

  ngOnInit(): void {
    this.gettingAllHotels(this.first, this.rows);
  }

  pageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    const pageIndex = event.first / event.rows + 1;
    this.gettingAllHotels(pageIndex, this.rows, this.searchTerm);
  }

  onSearch() {
    this.first = 0;
    this.gettingAllHotels(this.first, this.rows, this.searchTerm);
  }

  gettingAllHotels(pageIndex: number, pageSize: number, search?: string) {
    this._HotelService.getAllHotels({ pageIndex, pageSize, search }).subscribe({
      next: (res) => {
        this.hotels = res.data.data;
        console.log(this.hotels);
        this.totalRecords = res.data.itemsCount;
      },
      error: (err) => {
        console.error('Error fetching hotels', err);
        this.hotels = [];
        this.totalRecords = 0;
      }
    });
  }

  goToRoomlReservationForm(id) {
    console.log('room-reservation-step');
    this.Router.navigate(['/room-reservation-step', id]);
  }

  getStarsArray(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }
  onFilterChanged(filter: any): void {
    console.log('Filter from child:', filter);
    this._HotelService.getAllHotels(filter).subscribe({
      next: (res) => {
        this.hotels = res.data.data;
        this.totalRecords = res.data.itemsCount;
        console.log(this.hotels);
      },
      error: (err) => {
        console.error('Error fetching hotels:', err);
      }
    });
  }
}
