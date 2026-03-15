import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { SearchDynamicComponent } from 'src/app/shared/components/search-dynamic/search-dynamic.component';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { FilterTravelMap } from 'src/app/shared/mapping/filterMap';
import { Travel } from 'src/app/shared/model/travelDto';
import { LookupsService } from 'src/app/shared/services/lookups.service';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-travel-reservation-form',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, SearchDynamicComponent],
  templateUrl: './travel-reservation-form.component.html',
  styleUrl: './travel-reservation-form.component.scss',
  providers: [ConfirmationService]
})
export class TravelReservationFormComponent {
  first = 0;
  rows = 12;
  totalRecords: number = 0;
  searchTerm: string = '';
  trips: Travel[] = [];
  filter: FilterTravelMap = {};
  searchFields = [
    { key: 'IsExternalTrip', type: 'select', placeholder: 'Trip Type', options: [], filterable: false },
    { key: 'CountryId', type: 'select', placeholder: 'Country', options: [], filterable: true },
    { key: 'CityId', type: 'select', placeholder: 'City', options: [], filterable: true },
    { key: 'Rating', type: 'select', placeholder: 'Rating', options: [], filterable: false },
    { key: 'SeatsCount', type: 'input', placeholder: 'SeatsCount' },
    { key: 'NumberOfDays', type: 'input', placeholder: 'Days' },
    { key: 'FromLocation', type: 'input', placeholder: 'From Location' },
    { key: 'ToLocation', type: 'input', placeholder: 'To Location' },
    { key: 'FromDate', type: 'date', placeholder: 'Start Date' },
    { key: 'ToDate', type: 'date', placeholder: 'End Date' }
  ];
  constructor(
    private Router: Router,
    private tripservice: TravelTripsService,
    private listService: LookupsService
  ) {}

  ngOnInit() {
    this.filter.pageIndex = this.first + 1;
    this.filter.pageSize = this.rows;
    this.getAllOptions();
    this.getAllTrips(this.filter);
  }
  pageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    const pageIndex = event.first / event.rows + 1;
    this.getAllTrips(this.filter);
  }

  onSearch() {
    this.first = 0;
    this.getAllTrips(this.filter);
  }

  getAllTrips(filter) {
    this.tripservice.getAllTravels(filter).subscribe({
      next: (res) => {
        this.trips = res.data.data;
        console.log(this.trips);

        this.totalRecords = res.data.itemsCount;
      },
      error: (err) => {
        console.error('Error fetching trips', err);
        this.trips = [];
        this.totalRecords = 0;
      }
    });
  }

  goToTripReservationForm() {
    console.log('room-reservation-step');
    this.Router.navigate(['/room-reservation-step']);
  }

  getStarsArray(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }
  onFilterChanged(filter: any): void {
    this.tripservice.getAllTravels(filter).subscribe({
      next: (res) => {
        this.trips = res.data.data;
        this.totalRecords = res.totalRecords;
      },
      error: (err) => {
        console.error('Error fetching trips:', err);
      }
    });
  }
  onSearchSubmit(formData: any) {
    // this.thereIsAdvancedSearch = true;
    let formdata = { ...formData };
    // Initialize the filter array
    this.filter = {};
    this.getAllTrips(this.filter);
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onClearSearch() {
    this.filter.pageIndex = 1;
    this.getAllTrips(this.filter);
  }

  getAllOptions() {
    this.getCountryOptions();
    this.getCityOptions();
    this.getRatingOptions();
    this.getTripTypeOptions();
  }

  getCountryOptions(): void {
    const statusField = this.searchFields.find((field) => field.key === 'CountryId');
    if (statusField) {
      this.listService.getCountries().subscribe((options) => {
        statusField.options = options;
      });
    }
  }
  getCityOptions(): void {
    const statusField = this.searchFields.find((field) => field.key === 'CityId');
    if (statusField) {
      this.listService.getCities().subscribe((options) => {
        statusField.options = options;
      });
    }
  }
  getRatingOptions(): void {
    const statusField = this.searchFields.find((field) => field.key === 'Rating');
    if (statusField) {
      statusField.options = this.listService.getRating();
    }
  }
  getTripTypeOptions(): void {
    const statusField = this.searchFields.find((field) => field.key === 'IsExternalTrip');
    if (statusField) {
      statusField.options = this.listService.getTravelType();
    }
  }
}
