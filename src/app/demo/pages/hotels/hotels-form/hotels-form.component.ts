import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from '../../../../shared/components/sub-header/sub-header.component';
import { ImgUploaderComponent } from '../../../../shared/img-uploader/img-uploader.component';
import { CountriesService } from 'src/app/shared/services/countries.service';
import { CitiesService } from 'src/app/shared/services/cities.service';
import { HotelService } from 'src/app/shared/services/hotel.service';

interface Country {
  id: number;
  name: string;
}

interface City {
  id: number;
  countryId: number;
  name: string;
}

@Component({
  selector: 'app-hotel-form',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, ImgUploaderComponent],
  providers: [HotelService],
  templateUrl: './hotels-form.component.html',
  styleUrls: ['./hotels-form.component.scss']
})
export class HotelsFormComponent implements OnInit {
  hotelForm: FormGroup;
  hotelId: string | null = null;
  submitted = false;
  isLoading = false;

  newImages: File[] = [];
  existingImages: { id: number; url: string }[] = [];
  showImageError = false;

  countries: Country[] = [];
  cities: City[] = [];
  starRatings = [1, 2, 3, 4, 5];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private toastrService: ToastrService,
    private countriesService: CountriesService,
    private citiesService: CitiesService,
    private hotelService: HotelService
  ) {}

  ngOnInit(): void {
    this.hotelId = this.route.snapshot.paramMap.get('id');
    console.log('Hotel ID:', this.hotelId); // Debug
    this.initializeForm();

    this.getAllCountries(0, 10);
    if (this.hotelId) {
      this.loadHotelData(this.hotelId);
    }

    this.hotelForm.get('CountryId')?.valueChanges.subscribe((countryId) => {
      this.cities = [];
      this.hotelForm.get('CityId')?.reset();
      if (countryId) {
        this.citiesService.getAllCities({ pageIndex: 0, pageSize: 10, countryId: countryId }).subscribe({
          next: (res) => {
            this.cities = res.data?.data || [];
          },
          error: (err) => {
            console.error('Error fetching cities', err);
            this.toastrService.error(this.translate.instant('Failed to load cities'));
          }
        });
      }
    });
  }
  private initializeForm(): void {
    this.hotelForm = this.fb.group({
      CountryId: [null, Validators.required], // camelCase (matches API)
      CityId: [null, Validators.required], // camelCase (matches API)
      Name: ['', [Validators.required]],
      Description: ['', [Validators.required]],
      ShortDescription: ['', [Validators.required, Validators.maxLength(70)]],
      Rating: [null, [Validators.required]],
      Phone: ['', [Validators.required]],
      Address: ['', [Validators.required]],
      Status: [true],
      AllowPets: [false, Validators.required],
      IsRecommended: [false, Validators.required],
      MaxChildAge: [null, [Validators.required]],
      MinAdultAge: [null, [Validators.required]],
      ReserveNumberFake: [null, [Validators.required, Validators.pattern('^[0-9]+$')]]
    });
  }

  onCountryFilter(event: any) {
    this.getAllCountries(0, 10, event.filter);
  }

  getAllCountries(pageIndex: number, pageSize: number, search?: string) {
    this.countriesService.getAllCountries({ pageIndex, pageSize, search }).subscribe({
      next: (res) => {
        this.countries = res.data?.data || [];
      },
      error: (err) => {
        console.error('Error fetching countries', err);
        this.toastrService.error(this.translate.instant('Failed to load countries'));
      }
    });
  }

  loadHotelData(id): void {
    this.isLoading = true;
    this.hotelService.getHotelById(id).subscribe({
      next: (response) => {
        const hotel = response.data;
        this.existingImages = hotel.images || [];
        console.log('Hotel Data:', hotel); // Debug

        // Patch basic values (match API camelCase)
        this.hotelForm.patchValue({
          CountryId: hotel.countryId,
          CityId: hotel.cityId,
          Name: hotel.name,
          Description: hotel.description,
          ShortDescription: hotel.shortDescription,
          Rating: Number(hotel.rating),
          Phone: hotel.phone,
          Address: hotel.address,
          IsRecommended: hotel.isRecommended,
          IsFake: hotel.isFake,
          Status: hotel.status,
          AllowPets: hotel.allowPets,
          MaxChildAge: hotel.maxChildAge,
          MinAdultAge: hotel.minAdultAge,
          ReserveNumberFake: hotel.reserveNumberFake
        });

        // Load cities for the selected country
        // if (hotel.countryId) {
        //   this.citiesService.getAllCities(0, 10, null, hotel.countryId).subscribe({
        //     next: (res) => {
        //       console.log('Cities Data:', res.data); // Debug
        //       this.cities = res.data?.data || [];
        //       // Re-select city after cities load
        //       this.hotelForm.patchValue({ cityId: hotel.cityId });
        //     },
        //     error: (err) => {
        //       console.error('Error loading cities:', err);
        //     }
        //   });
        // }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading hotel:', error);
        this.toastrService.error('Failed to load hotel data');
        this.isLoading = false;
      }
    });
  }

  shouldShowError(controlName: string): boolean {
    const control = this.hotelForm.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  onImagesUpload(files: File[] | null): void {
    this.newImages = files || [];
    this.showImageError = false;
  }

  onImageRemoved(index: number): void {
    this.existingImages.splice(index, 1);
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.newImages.length === 0 && this.existingImages.length === 0) {
      this.showImageError = true;
    }

    if (this.hotelForm.invalid || this.showImageError) {
      this.markAllAsTouched();
      return;
    }

    this.saveHotel();
  }

  private markAllAsTouched(): void {
    Object.values(this.hotelForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  private saveHotel(): void {
    this.isLoading = true;
    const formData = new FormData();

    Object.keys(this.hotelForm.value).forEach((key) => {
      const value = this.hotelForm.value[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    if (this.newImages.length > 0) {
      this.newImages.forEach((file) => {
        formData.append('uploadedImages', file);
      });
    }

    if (this.existingImages.length > 0) {
      const existingImageIds = this.existingImages.map((img) => img.id);

      existingImageIds.forEach((id) => {
        formData.append('ExistingImages', id.toString());
      });
    }

    if (this.hotelId) {
      formData.append('Id', this.hotelId);
      this.hotelService.updateHotel(formData).subscribe({
        next: () => {
          this.toastrService.success(this.translate.instant('Hotel updated successfully'));
          this.router.navigate(['/hotels']);
        },
        error: (error) => {
          console.error('Error updating hotel', error);
          this.toastrService.error(this.translate.instant('Failed to update hotel'));
          this.isLoading = false;
        }
      });
    } else {
      this.hotelService.addHotel(formData).subscribe({
        next: () => {
          this.toastrService.success(this.translate.instant('Hotel created successfully'));
          this.router.navigate(['/hotels']);
        },
        error: (error) => {
          console.error('Error creating hotel', error);
          this.toastrService.error(this.translate.instant('Failed to create hotel'));
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    if (this.hotelForm.dirty || this.newImages.length > 0 || this.existingImages.length !== (this.existingImages.length || 0)) {
      if (confirm(this.translate.instant('Are you sure you want to discard changes?'))) {
        this.router.navigate(['/hotels']);
      }
    } else {
      this.router.navigate(['/hotels']);
    }
  }
}
