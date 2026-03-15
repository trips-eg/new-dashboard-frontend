import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CountriesService } from '../services/countries.service';
import { CitiesService } from '../services/cities.service';
import { ToastrService } from 'ngx-toastr';
import { Ihotel } from '../model/ihotel';
import { HotelService } from '../services/hotel.service';

@Component({
  selector: 'app-hotel-filter',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './hotel-filter.component.html',
  styleUrl: './hotel-filter.component.scss'
})
export class HotelFilterComponent {
  @Output() filterChanged = new EventEmitter<any>();

  filterForm!: FormGroup;

  cities = []; // املاهم من API أو ثابت
  countries = [];
  Hotels: Ihotel[] = [];
  first: number = 0;
  rows: number = 9;

  constructor(
    private fb: FormBuilder,
    private HotelService: HotelService,
    private CountriesService: CountriesService,
    private CitiesService: CitiesService,
    private ToastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.gettingAllHotels(this.first, this.rows);

    this.setHotelFilterForm();
    // this.gettingAllCountries();
    this.onCountrySelect();
  }
  gettingAllHotels(pageIndex: number, pageSize: number, search?: string): void {
    this.HotelService.getAllHotels({ pageIndex, pageSize, search }).subscribe({
      next: (res) => {
        this.Hotels = res.data.data;
      },
      error: (err) => {
        console.error('Error fetching hotels:', err);
        this.Hotels = [];
      }
    });
  }
  onCountrySelect() {
    this.filterForm.get('countryId').valueChanges.subscribe((countryId) => {
      this.CitiesService.getAllCities({ pageIndex: 0, pageSize: 10, countryId: countryId }).subscribe(() => {
        this.cities = [];
        this.filterForm.get('CityId')?.reset();
        if (countryId) {
          this.CitiesService.getAllCities({ pageIndex: 0, pageSize: 10, countryId: countryId }).subscribe({
            next: (res) => {
              this.cities = res.data?.data || [];
            },
            error: (err) => {
              console.error('Error fetching cities', err);
              this.ToastrService.error('Failed to load cities');
            }
          });
        }
      });
    });
  }

  setHotelFilterForm() {
    this.filterForm = this.fb.group({
      travelersCount: [null],
      roomsCount: [null],
      cityId: [null],
      countryId: [null],
      HotelId: [null],
      checkIn: [null],
      checkOut: [null],
      search: [''],
      sort: ['']
    });
  }

  // gettingAllCountries() {
  //   this.CountriesService.getAllCountries({ pageIndex: 1, pageSize: 10 }).subscribe({
  //     next: (res) => {
  //       this.countries = res.data.data;
  //     }
  //   });
  // }

  onSubmit(): void {
    const formValue = this.filterForm.value;

    const filter = {
      ...formValue,
      checkIn: formValue.checkIn ? new Date(formValue.checkIn).toISOString() : undefined,
      checkOut: formValue.checkOut ? new Date(formValue.checkOut).toISOString() : undefined
    };

    this.filterChanged.emit(filter);
  }

  onReset(): void {
    this.filterForm.reset({
      pageIndex: 1,
      pageSize: 10
    });
    this.onSubmit();
  }
}
