import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, FormControl } from '@angular/forms';
import { SubHeaderComponent } from '../../../../shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Stepper } from 'primeng/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { TranslateService } from '@ngx-translate/core';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';
import { ToastrService } from 'ngx-toastr';
import { CitiesService } from 'src/app/shared/services/cities.service';
import { CountriesService } from 'src/app/shared/services/countries.service';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-travels-form',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, ImgUploaderComponent],
  templateUrl: './travels-form.component.html',
  styleUrl: './travels-form.component.scss'
})
export class TravelsFormComponent implements OnInit {
  travelId: string | null = null;
  tripId: string | null = null;
  tripForm: FormGroup = this.fb.group({});
  oldImages = [];
  programTypeList: { label: string; value: any }[] = [];
  cityList: { label: string; value: any }[] = [];
  countryList: { label: string; value: any }[] = [];
  accommodationTypeList: { label: string; value: any }[] = [];
  displayAddAccommodationTypeDialog: boolean = false;
  accommodationTypeForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required]
  });
  isSavingAccommodationType: boolean = false;
  travelFeatureList: { label: string; value: any }[] = [];
  displayAddTravelFeatureDialog: boolean = false;
  travelFeatureForm: FormGroup = this.fb.group({
    name: ['', Validators.required]
  });
  isSavingTravelFeature: boolean = false;
  childPricingTypes = [
    { label: 'Percentage (%)', value: 1 },
    { label: 'Fixed Amount', value: 2 }
  ];
  travelForm: FormGroup = this.fb.group({});
  selectedImages: File[] = [];
  filterparams?: FilterMap = {};
  lang: string;
  mode: string = '';
  today: Date = new Date();
  minDate: Date | null = new Date();
  imgPaseUrl = environment.imgUrl;
  starRatings = [1, 2, 3, 4, 5];
  tripTybe = [
    {
      value: 1,
      nameEn: 'Normal',
      nameAr: 'عادية'
    },
    {
      value: 2,
      nameEn: 'Periodic',
      nameAr: ' قترة'
    },
    {
      value: 3,
      nameEn: 'dayuse',
      nameAr: 'يومية'
    }
  ];

  @ViewChild(Stepper) stepper!: Stepper;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private travelService: TravelTripsService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private toast: ToastrService,
    private cityService: CitiesService,
    private countryServ: CountriesService
  ) {
    this.lang = this.translate.currentLang;
  }
  getTooltipOfTripType(value: number): string {
    const lang = this.translate.currentLang;
    const tooltips = {
      1: {
        en: 'Normal trip: Predefined start and end dates, lasting a fixed number of days.',
        ar: 'رحلة عادية: ذات تاريخ بداية ونهاية محددين ومدة ثابتة.'
      },
      2: {
        en: 'Periodic trip: Bookable within a date range; travelers select their start date for a fixed duration.',
        ar: 'رحلة خلال فترة: متاحة للحجز في نطاق تواريخ محدد، ويختار المسافر تاريخ المغادرة بمدة ثابتة.'
      },
      3: {
        en: 'Day use: A single-day trip starting and ending on the same day.',
        ar: 'رحلة يومية: ليوم واحد فقط تبدأ وتنتهي في نفس اليوم.'
      }
    };

    return tooltips[value][lang] || '';
  }

  get selectedCountryName(): string {
    const countryId = this.travelForm.get('CountryId')?.value;
    if (!countryId) return '';
    const country = this.countryList.find(c => c.value === countryId);
    return country ? country.label : '';
  }

  get selectedCityName(): string {
    const cityId = this.travelForm.get('CityId')?.value;
    if (!cityId) return '';
    const city = this.cityList.find(c => c.value === cityId);
    return city ? city.label : '';
  }

  get selectedAccommodationName(): string {
    const accId = this.travelForm.get('AccommodationTypeId')?.value;
    if (!accId) return '';
    const acc = this.accommodationTypeList.find(a => a.value === accId);
    return acc ? acc.label : '';
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['id']) this.travelId = params['id'];
      if (params['mode']) this.mode = params['mode'];
    });

    this.getTravelForm();
    this.getProgramForm();
    this.getDropDownList();
    if (this.travelId) {
      this.minDate = null;
      this.getTravelById(this.travelId);
      this.travelForm.get('TripType')?.disable();
    }
    this.travelForm.get('IsExternallTrip')?.valueChanges.subscribe((isExternal) => {
      this.onTravelTypeChange(isExternal);
    });
    if (this.descriptions.length === 0) {
      this.addDescription();
    }
    this.validateNumOfDays();
    this.travelForm.get('NumberOfDays')?.valueChanges.subscribe(() => {
      this.updateEndDatesBasedOnDays();
    });
    this.travelForm.get('TripType')?.valueChanges.subscribe((type) => {
      this.tripDatesArray.controls.forEach((control) => {
        const group = control as FormGroup;
        const endDateControl = group.get('endDate');

        if (type === 1) {
          endDateControl?.disable({ emitEvent: false });
          this.updateEndDatesBasedOnDays();
        } else {
          endDateControl?.enable({ emitEvent: false });
        }
      });
    });
  }
  validateNumOfDays() {
    this.travelForm.get('TripType')?.valueChanges.subscribe((value) => {
      const daysControl = this.travelForm.get('NumberOfDays');

      if (value === 3) {
        daysControl?.setValue(1);
        daysControl?.disable({ emitEvent: false }); // يعطل الحقل بدون ما يولد حدث جديد
      } else {
        daysControl?.enable({ emitEvent: false }); // يعيد التفعيل لو اختار نوع تاني
      }
    });
  }
  // onStartDateChange(group) {
  //   const tripType = this.travelForm.get('TripType')?.value;
  //   const startDate = group.get('startDate')?.value;
  //   const days = +this.travelForm.get('NumberOfDays')?.value;

  //   const endDateControl = group.get('endDate');

  //   if (tripType === 1) {
  //     // 🔒 Disable endDate لأننا بنحسبها تلقائي
  //     endDateControl?.disable({ emitEvent: false });

  //     if (startDate && days && days > 0) {
  //       const start = new Date(startDate);
  //       const end = new Date(start);
  //       end.setDate(start.getDate() + (days - 1));

  //       endDateControl?.setValue(end, { emitEvent: false });
  //     } else {
  //       endDateControl?.reset({ emitEvent: false });
  //     }
  //   } else {
  //     // 🔓 ممكن المستخدم يعدّل عليها
  //     endDateControl?.enable({ emitEvent: false });
  //   }
  // }
  onStartDateChange(group: any) {
    // Use 'any' or the specific FormGroup/AbstractControl type
    const tripType = this.travelForm.get('TripType')?.value;
    const startDateControl = group.get('startDate'); // Get the start date control
    const startDate = startDateControl?.value;
    const days = +this.travelForm.get('NumberOfDays')?.value;

    const endDateControl = group.get('endDate');
    const minEndDateControl = group.get('minEndDate'); // Get the new control

    // 🆕 Update the minimum allowed End Date to be the selected Start Date
    if (minEndDateControl) {
      // Set the min date for endDate to be the selected startDate
      // This effectively locks out dates before the start date
      minEndDateControl.setValue(startDate, { emitEvent: false });
    }

    // Optional: If startDate is cleared, clear minEndDate as well
    if (!startDate && minEndDateControl) {
      minEndDateControl.reset({ emitEvent: false });
    }

    if (tripType === 1) {
      // ... (Your existing logic for TripType 1: auto-calculate end date)

      endDateControl?.disable({ emitEvent: false });

      if (startDate && days && days > 0) {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + (days - 1));

        endDateControl?.setValue(end, { emitEvent: false });
      } else {
        endDateControl?.reset({ emitEvent: false });
      }
    } else {
      // 🔓 ممكن المستخدم يعدّل عليها
      endDateControl?.enable({ emitEvent: false });

      // Optional: If the current endDate is before the new startDate, clear it
      if (startDate && endDateControl?.value && new Date(endDateControl.value) < new Date(startDate)) {
        endDateControl.reset({ emitEvent: false });
      }
    }
  }

  updateEndDatesBasedOnDays() {
    const tripType = this.travelForm.get('TripType')?.value;
    const days = +this.travelForm.get('NumberOfDays')?.value;

    this.tripDatesArray.controls.forEach((control) => {
      const group = control as FormGroup;
      const startDate = group.get('startDate')?.value;
      const endDateControl = group.get('endDate');

      if (tripType === 1) {
        endDateControl?.disable({ emitEvent: false });

        if (startDate && days && days > 0) {
          const start = new Date(startDate);
          const end = new Date(start);
          end.setDate(start.getDate() + (days - 1));
          endDateControl?.setValue(end, { emitEvent: false });
        } else {
          endDateControl?.reset({ emitEvent: false });
        }
      } else {
        endDateControl?.enable({ emitEvent: false });
      }
    });
  }

  // /////////---------------------------------- get All Dropdown lists ------------------------------////////////////////////////////
  getDropDownList() {
    this.filterparams.pageIndex = 1;
    this.filterparams.pageSize = 250; // Increase to load all countries
    this.getCitiesByCountryCode();
    this.getCountryList(this.filterparams);
    this.getProgramTypeList();
    this.getAccommodationTypeList();
    this.getTravelFeatures();
  }

  getCitiesByCountryId(event) {
    const criteria = {
      pageIndex: 1,
      pageSize: 100,
      countryId: event
    };

    this.cityService.getAllCities(criteria).subscribe((response) => {
      this.cityList = response.data.data.map((city: { name: string; id: any }) => ({
        label: city.name,
        value: city.id
      }));
    });
  }
  getCitiesByCountryCode() {
    const criteria = {
      pageIndex: 1,
      pageSize: 100,
      countryCode: 'eg'
    };
    this.cityService.getAllCities(criteria).subscribe((response) => {
      this.cityList = response.data.data.map((city: { name: string; id: any }) => ({
        label: city.name,
        value: city.id
      }));
    });
  }
  getCountryList(filter) {
    const criteria = {
      pageIndex: filter.pageIndex,
      pageSize: filter.pageSize,
      search: filter.Search || ''
    };
    this.countryServ.getAllCountries(criteria).subscribe((response) => {
      this.countryList = response.data.data.map((country: { name: string; id: any }) => ({
        label: country.name,
        value: country.id
      }));
    });
  }
  filterCountry(country) {
    this.filterparams.Search = country.filter;
    this.getCountryList(this.filterparams);
  }

  getProgramTypeList() {
    this.travelService.getProgramStepType().subscribe((response) => {
      this.programTypeList = response.map((type: any) => ({
        label: this.lang == 'ar' ? type.nameAr : type.nameEn,
        value: type.value
      }));
    });
  }

  getAccommodationTypeList() {
    this.travelService.getAllAccommodationTypes().subscribe((response) => {
      if (response && response.success && response.data) {
        const list = Array.isArray(response.data) ? response.data : (response.data.data || []);
        this.accommodationTypeList = list.map((type: any) => ({
          label: this.lang === 'ar' ? type.description || type.name : type.name || type.description,
          value: type.id
        }));
      } else if (Array.isArray(response)) {
        this.accommodationTypeList = response.map((type: any) => ({
          label: this.lang === 'ar' ? type.description || type.name : type.name || type.description,
          value: type.id
        }));
      }
    });
  }

  showAddAccommodationTypeDialog() {
    this.accommodationTypeForm.reset();
    this.displayAddAccommodationTypeDialog = true;
  }

  selectAccommodationType(value: any) {
    this.travelForm.get('AccommodationTypeId')?.setValue(value);
    this.travelForm.get('AccommodationTypeId')?.markAsTouched();
  }

  saveAccommodationType() {
    if (this.accommodationTypeForm.invalid) return;

    this.isSavingAccommodationType = true;
    this.travelService.addAccommodationType(this.accommodationTypeForm.value).subscribe({
      next: (response) => {
        this.isSavingAccommodationType = false;
        if (response.success) {
          this.toast.success('Accommodation Type added successfully');
          this.displayAddAccommodationTypeDialog = false;
          this.getAccommodationTypeList();
          if (response.data && response.data.id) {
            this.selectAccommodationType(response.data.id);
          }
        } else {
          this.toast.error(response.message || 'Failed to add accommodation type');
        }
      },
      error: (error) => {
        this.isSavingAccommodationType = false;
        this.toast.error(error.error?.message || 'Error occurred while saving');
      }
    });
  }

  getTravelFeatures() {
    this.travelService.getAllTravelFeatures().subscribe((response) => {
      if (response && response.success && response.data) {
        const list = Array.isArray(response.data) ? response.data : (response.data.data || []);
        this.travelFeatureList = list.map((feat: any) => ({
          label: feat.name,
          value: feat.id
        }));
      } else if (Array.isArray(response)) {
        this.travelFeatureList = response.map((feat: any) => ({
          label: feat.name,
          value: feat.id
        }));
      }
    });
  }

  showAddTravelFeatureDialog() {
    this.travelFeatureForm.reset();
    this.displayAddTravelFeatureDialog = true;
  }

  saveTravelFeature() {
    if (this.travelFeatureForm.invalid) return;

    this.isSavingTravelFeature = true;
    this.travelService.createTravelFeature(this.travelFeatureForm.value).subscribe({
      next: (response) => {
        this.isSavingTravelFeature = false;
        if (response.success) {
          this.toast.success('Travel Feature added successfully');
          this.displayAddTravelFeatureDialog = false;
          this.getTravelFeatures();
          if (response.data && response.data.id) {
            const currentFeatures = this.travelForm.get('Features')?.value || [];
            this.travelForm.get('Features')?.setValue([...currentFeatures, response.data.id]);
          }
        } else {
          this.toast.error(response.message || 'Failed to add travel feature');
        }
      },
      error: (error) => {
        this.isSavingTravelFeature = false;
        this.toast.error(error.error?.message || 'Error occurred while saving');
      }
    });
  }

  isTravelFeatureSelected(id: any): boolean {
    const currentFeatures = this.travelForm.get('Features')?.value || [];
    return currentFeatures.includes(id);
  }

  toggleTravelFeature(id: any): void {
    const control = this.travelForm.get('Features');
    const currentFeatures = control?.value || [];
    if (currentFeatures.includes(id)) {
      control?.setValue(currentFeatures.filter((item: any) => item !== id));
    } else {
      control?.setValue([...currentFeatures, id]);
    }
    control?.markAsTouched();
  }

  get childPricingPolicies(): FormArray {
    return this.travelForm.get('ChildPricingPolicies') as FormArray;
  }

  addChildPricingPolicy(): void {
    const policyGroup = this.fb.group({
      id: [0],
      minAge: [0, [Validators.required, Validators.min(0)]],
      maxAge: [0, [Validators.required, Validators.min(0)]],
      pricingType: [1, Validators.required],
      value: [0, [Validators.required, Validators.min(0)]]
    });
    this.childPricingPolicies.push(policyGroup);
  }

  removeChildPricingPolicy(index: number): void {
    this.childPricingPolicies.removeAt(index);
  }

  //////////////////----------------    get Travel by Id and bind All data in the forms --------------------//////////////////////////

  getTravelById(travelId) {
    this.travelService.getTravelById(travelId).subscribe(
      (response) => {
        if (response.success) {
          let travelData = response.data;

          console.log('TripType from API:', travelData.tripType); // للتأكد

          // تحديد TripType
          const tripType = travelData.tripType;

          // تحضير التواريخ بناءً على TripType
          let tripDates = null;
          let startDate = null;

          if (tripType === 1 || tripType === 2) {
            // Weekly or Monthly - محتاجين range
            if (travelData.startDate && travelData.endDate) {
              const dateGroup = this.fb.group({
                startDate: [new Date(travelData.startDate), Validators.required],
                endDate: [new Date(travelData.endDate), Validators.required]
              });
              this.tripDatesArray.push(dateGroup);
            }
          } else if (tripType === 3) {
            // Daily - محتاجين تاريخ واحد بس
            const dateGroup = this.fb.group({
              startDate: [new Date(travelData.startDate), Validators.required]
            });
            this.tripDatesArray.push(dateGroup);
          }

          // Bind travel data to travelForm
          this.travelForm.patchValue({
            VendorId: travelData.vendorId,
            IsExternallTrip: travelData.isExternallTrip,
            CountryId: travelData.countryId ?? '',
            CityId: travelData.cityId,
            FromLocation: travelData.fromLocation,
            ToLocation: travelData.toLocation,
            Address: travelData.address,
            ExternalLink: travelData.externalLink,
            Name: travelData.name,
            NumberOfDays: travelData.numberOfDays,
            Capacity: travelData.capacity,
            Price: travelData.price,
            ChildPrice: travelData.childPrice,
            PriceBefore: travelData.priceBefore || null, // Added PriceBefore field
            Rating: travelData.rating,
            TripType: tripType,
            StartDate: startDate,
            IsActive: travelData.isActive,
            IsRecommended: travelData.isRecommended,
            IsFake: travelData.isFake,
            CancellationPolicy: travelData.cancellationPolicy || '',
            IsRefundable: travelData.isRefundable || false,
            MinimumDaysToRefund: travelData.minimumDaysToRefund || 0,
            IsAllowPaymentUponArrival: travelData.isAllowPaymentUponArrival || false,
            IsIncludeVate: travelData.isIncludeVate || false,
            depositRate: travelData.depositRate || 100,
            AccommodationTypeId: (travelData.accommodationTypes && travelData.accommodationTypes.length > 0) ? travelData.accommodationTypes[0].id : travelData.accommodationTypeId,
            Features: travelData.features?.map((f: any) => f.id) || [],
            ImagesFiles: null
          });

          // Handle images
          if (travelData.images) {
            this.oldImages = travelData.images.map((img) => ({
              url: `${this.imgPaseUrl}${img.imageUrl}`,
              id: img.id
            }));
          }

          // Get cities
          if (travelData.countryId) {
            this.getCitiesByCountryId(travelData.countryId);
          }

          // Clear and populate descriptions
          this.descriptions.clear();
          if (travelData.descriptions && travelData.descriptions.length > 0) {
            travelData.descriptions.forEach((desc: { description: string }) => {
              this.descriptions.push(
                this.fb.group({
                  description: desc.description
                })
              );
            });
          }

          // Clear and populate child pricing policies
          this.childPricingPolicies.clear();
          if (travelData.childPricingPolicies && travelData.childPricingPolicies.length > 0) {
            travelData.childPricingPolicies.forEach((policy: any) => {
              this.childPricingPolicies.push(
                this.fb.group({
                  id: [policy.id || 0],
                  minAge: [policy.minAge, [Validators.required, Validators.min(0)]],
                  maxAge: [policy.maxAge, [Validators.required, Validators.min(0)]],
                  pricingType: [policy.pricingType, Validators.required],
                  value: [policy.value, [Validators.required, Validators.min(0)]]
                })
              );
            });
          }

          // Clear and populate trip pricing periods
          this.tripPricingPeriods.clear();
          if (travelData.tripPricingPeriods && travelData.tripPricingPeriods.length > 0) {
            travelData.tripPricingPeriods.forEach((period: any) => {
              this.tripPricingPeriods.push(this.createTripPricingPeriod(period));
            });
          }

          // Clear and populate steps
          this.steps.clear();
          this.getProgramStepsByTripId(travelId);
        }
      },
      (error) => {
        console.error('Error fetching travel data:', error);
      }
    );
  }

  getProgramStepsByTripId(travelId) {
    this.travelService.getProgramStepsByTripId(travelId).subscribe(
      (response) => {
        if (response.success) {
          let programSteps = response.data;

          // Clear and populate steps in tripForm
          this.steps.clear();
          programSteps.forEach((segment: any) => {
            const stepGroup = this.fb.group({
              id: segment.id,
              type: segment.type,
              title: segment.title,
              details: segment.details,
              time: segment.time,
              fromLocation: segment.fromLocation,
              toLocation: segment.toLocation,
              fromTime: segment.fromTime,
              toTime: segment.toTime,
              latitude: segment.latitude,
              longitude: segment.longitude,
              stepDescriptions: this.fb.array(
                segment.stepDescriptions.map((desc: { id: number; description: string }) =>
                  this.fb.group({
                    id: [desc.id],
                    description: [desc.description]
                  })
                )
              )
            });
            stepGroup.get('time').setValue(segment.time ? new Date(segment.time) : null);
            stepGroup.get('fromTime').setValue(segment.fromTime ? new Date(segment.fromTime) : null);
            stepGroup.get('toTime').setValue(segment.toTime ? new Date(segment.toTime) : null);

            this.steps.push(stepGroup);
          });
        }
      },
      (error) => {}
    );
  }

  private toDateOnlyString(date: any): string | null {
    if (!date) return null;
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return null;

    // ترجع التاريخ فقط: yyyy-mm-dd
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  ///////////////////////////// ----------------Travel --------------------------//////////////////////  //

  getTravelForm() {
    return (this.travelForm = this.fb.group({
      VendorId: [''],
      IsExternallTrip: [false, Validators.required],
      CountryId: [''],
      CityId: [null, Validators.required],
      FromLocation: ['', Validators.required],
      ToLocation: ['', Validators.required],
      Address: [''],
      ExternalLink: [''],
      Name: ['', Validators.required],
      Descriptions: this.fb.array([]),
      NumberOfDays: [1, Validators.required],
      Capacity: [1, Validators.required],
      Price: [0, Validators.required],
      ChildPrice: [0, Validators.required],
      PriceBefore: [null], // Added PriceBefore field
      Rating: [1, Validators.required],
      TripDates: this.fb.array([], Validators.required),
      IsActive: [true, Validators.required],
      IsRecommended: [false, Validators.required],
      IsFake: [false, Validators.required],
      ImagesFiles: [null],
      CancellationPolicy: ['', Validators.required],
      IsRefundable: [false, Validators.required],
      MinimumDaysToRefund: [0, Validators.required],
      IsAllowPaymentUponArrival: [false, Validators.required],
      depositRate: [100, Validators.required],
      IsIncludeVate: [false, Validators.required],
      TripType: [null, Validators.required],
      AccommodationTypeId: [null, Validators.required],
      Features: [[]],
      ChildPricingPolicies: this.fb.array([]),
      TripPricingPeriods: this.fb.array([])
    }));
  }

  get tripDatesArray() {
    return this.travelForm.get('TripDates') as FormArray;
  }

  addTripDate() {
    const group = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null],
      minEndDate: [null],
      maxEndDate: [null]
    });
    this.tripDatesArray.push(group);
  }

  removeTripDate(index: number) {
    this.tripDatesArray.removeAt(index);
  }

  get tripPricingPeriods(): FormArray {
    return this.travelForm.get('TripPricingPeriods') as FormArray;
  }

  createTripPricingPeriod(period?: any): FormGroup {
    return this.fb.group({
      id: [period?.id || 0],
      fromDate: [period?.fromDate ? new Date(period.fromDate) : null, Validators.required],
      toDate: [period?.toDate ? new Date(period.toDate) : null, Validators.required],
      pricePerPerson: [period?.pricePerPerson ?? 0, [Validators.required, Validators.min(0)]]
    });
  }

  addTripPricingPeriod(): void {
    this.tripPricingPeriods.push(this.createTripPricingPeriod());
  }

  removeTripPricingPeriod(index: number): void {
    this.tripPricingPeriods.removeAt(index);
  }

  private handleTripTypeChange() {
    this.travelForm.get('TripType')?.valueChanges.subscribe((type) => {
      this.updateValidators(type);
    });
  }

  private updateValidators(type: number) {
    const tripDatesArray = this.travelForm.get('TripDates') as FormArray;

    // تأكد دايمًا فيه عنصر واحد على الأقل
    // if (tripDatesArray.length === 0) {
    //   this.addTripDate();
    // }

    tripDatesArray.controls.forEach((control) => {
      const g = control as FormGroup;
      g.get('startDate')?.setValidators([Validators.required]);

      if (type === 1 || type === 2) {
        g.get('endDate')?.setValidators([Validators.required]);
      } else {
        g.get('endDate')?.clearValidators();
        g.get('endDate')?.setValue(null);
      }

      g.get('startDate')?.updateValueAndValidity();
      g.get('endDate')?.updateValueAndValidity();
    });
  }

  get descriptions(): FormArray {
    return this.travelForm.get('Descriptions') as FormArray;
  }

  addDescription(): void {
    const descriptionGroup = this.fb.group({
      description: ['', Validators.required]
    });
    this.descriptions.push(descriptionGroup);
  }

  removeDescription(index: number): void {
    this.descriptions.removeAt(index);
  }
  addTravel(nextCallback?: EventEmitter<void>) {
    if (this.travelForm.invalid) {
      this.updateValidators(this.travelForm.get('TripType')?.value);

      this.travelForm.markAllAsTouched();
      this.toast.error('Please fill all required fields', 'Error');
      return;
    }

    const formData = new FormData();
    const tripType = this.travelForm.get('TripType')?.value;

    // باقي الحقول
    Object.keys(this.travelForm.controls).forEach((key) => {
      if (key === 'TripDates') return;

      const value = this.travelForm.get(key)?.value;

      if (key === 'ImagesFiles' && this.selectedImages.length > 0) {
        this.selectedImages.forEach((file) => formData.append('ImagesFiles', file));
      } else if (key === 'Descriptions' && value?.length > 0) {
        value.forEach((desc: any) => formData.append('Descriptions', JSON.stringify(desc)));
      } else if (key === 'Features') {
        if (value && value.length > 0) {
          value.forEach((id: any) => formData.append('Features', id.toString()));
        }
      } else if (key === 'ChildPricingPolicies') {
        if (value && value.length > 0) {
          value.forEach((policy: any) => formData.append('ChildPricingPolicies', JSON.stringify(policy)));
        }
      } else if (key === 'TripPricingPeriods') {
        this.tripPricingPeriods.getRawValue().forEach((period: any) => {
          formData.append('TripPricingPeriods', JSON.stringify(this.formatTripPricingPeriod(period)));
        });
      } else {
        // ✅ معالجة القيم null أو undefined
        const safeValue = value === null || value === undefined ? '' : value;
        formData.append(key, safeValue);
      }
    });

    // ✅ TripDates الموحد (يدعم تايب 1 و 2)
    const tripDates = this.tripDatesArray.getRawValue(); // علشان يشمل disabled controls
    tripDates.forEach((range: any) => {
      const dateObj: any = {};

      if (range.startDate) {
        dateObj.startDate = this.toDateOnlyString(range.startDate);
      }

      if ((tripType === 1 || tripType === 2) && range.endDate) {
        dateObj.endDate = this.toDateOnlyString(range.endDate);
      }

      formData.append('TripDates', JSON.stringify(dateObj));
    });

    this.travelService.addTravel(formData).subscribe(
      (response) => {
        if (response.success) {
          this.toast.success('Travel added successfully', 'Success');
          this.tripId = response.data;
          if (nextCallback) nextCallback.emit();
        }
      },
      (error) => {
        this.toast.error('Error adding travel', 'Error');
        console.error('Error adding travel:', error);
      }
    );
  }

  updateTravel(nextCallback?: EventEmitter<void>) {
    if (this.travelForm.invalid) {
      this.updateValidators(this.travelForm.get('TripType')?.value);

      this.travelForm.markAllAsTouched();
      this.toast.error('Please fill all required fields', 'Error');
      return;
    }

    const formData = new FormData();
    formData.append('Id', this.travelId.toString());
    const tripType = this.travelForm.get('TripType')?.value;

    // باقي الحقول
    Object.keys(this.travelForm.controls).forEach((key) => {
      if (key === 'TripDates') return;

      const value = this.travelForm.get(key)?.value;

      if (key === 'ImagesFiles' && this.selectedImages.length > 0) {
        this.selectedImages.forEach((file) => formData.append('ImagesFiles', file));
      } else if (key === 'Descriptions' && value?.length > 0) {
        value.forEach((desc: any) => formData.append('Descriptions', JSON.stringify(desc)));
      } else if (key === 'Features') {
        if (value && value.length > 0) {
          value.forEach((id: any) => formData.append('Features', id.toString()));
        }
      } else if (key === 'ChildPricingPolicies') {
        if (value && value.length > 0) {
          value.forEach((policy: any) => formData.append('ChildPricingPolicies', JSON.stringify(policy)));
        }
      } else if (key === 'TripPricingPeriods') {
        this.tripPricingPeriods.getRawValue().forEach((period: any) => {
          formData.append('TripPricingPeriods', JSON.stringify(this.formatTripPricingPeriod(period)));
        });
      } else {
        // ✅ معالجة القيم null أو undefined
        const safeValue = value === null || value === undefined ? '' : value;
        formData.append(key, safeValue);
      }
    });

    // ✅ TripDates الموحد (يدعم تايب 1 و 2)
    const tripDates = this.tripDatesArray.getRawValue(); // علشان يشمل disabled controls
    tripDates.forEach((range: any) => {
      const dateObj: any = {};

      if (range.startDate) {
        dateObj.startDate = this.toDateOnlyString(range.startDate);
      }

      if ((tripType === 1 || tripType === 2) && range.endDate) {
        dateObj.endDate = this.toDateOnlyString(range.endDate);
      }

      formData.append('TripDates', JSON.stringify(dateObj));
    });

    this.travelService.updateTravel(formData).subscribe(
      (response) => {
        if (response.success) {
          this.toast.success('Travel updated successfully', 'Success');
          if (nextCallback) nextCallback.emit();
        }
      },
      (error) => {
        this.toast.error('Error updating travel', 'Error');
        console.error('Error updating travel:', error);
      }
    );
  }

  // addTravel(nextCallback?: EventEmitter<void>) {
  //   if (this.travelForm.invalid) {
  //     this.updateValidators(this.travelForm.get('TripType')?.value);

  //     this.travelForm.markAllAsTouched();
  //     this.toast.error('Please fill all required fields', 'Error');
  //     return;
  //   }

  //   const formData = new FormData();
  //   const tripType = this.travelForm.get('TripType')?.value;

  //   // باقي الحقول
  //   Object.keys(this.travelForm.controls).forEach((key) => {
  //     if (key === 'TripDates') return;

  //     const value = this.travelForm.get(key)?.value;
  //     if (key === 'ImagesFiles' && this.selectedImages.length > 0) {
  //       this.selectedImages.forEach((file) => formData.append('ImagesFiles', file));
  //     } else if (key === 'Descriptions' && value?.length > 0) {
  //       value.forEach((desc: any) => formData.append('Descriptions', JSON.stringify(desc)));
  //     } else {
  //       formData.append(key, value);
  //     }
  //   });

  //   // TripDates الموحد
  //   const tripDates = this.tripDatesArray.value;
  //   tripDates.forEach((range: any) => {
  //     const dateObj: any = {};
  //    if (range.startDate) dateObj.startDate =this.toDateOnlyString( range.startDate);
  //     if (range.endDate) dateObj.endDate =this.toDateOnlyString( range.endDate);
  //     formData.append('TripDates', JSON.stringify(dateObj));
  //   });

  //   this.travelService.addTravel(formData).subscribe((response) => {
  //     if (response.success) {
  //       this.toast.success('Travel added successfully', 'Success');
  //       this.tripId = response.data;
  //       if (nextCallback) nextCallback.emit();
  //     }
  //   });
  // }

  // updateTravel(nextCallback?: EventEmitter<void>) {
  //   if (this.travelForm.invalid) {
  //     this.updateValidators(this.travelForm.get('TripType')?.value);

  //     this.travelForm.markAllAsTouched();
  //     this.toast.error('Please fill all required fields', 'Error');
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append('Id', this.travelId.toString());

  //   Object.keys(this.travelForm.controls).forEach((key) => {
  //     if (key === 'TripDates') return;
  //     const value = this.travelForm.get(key)?.value;

  //     if (key === 'ImagesFiles' && this.selectedImages.length > 0) {
  //       this.selectedImages.forEach((file) => formData.append('ImagesFiles', file));
  //     } else if (key === 'Descriptions' && value?.length > 0) {
  //       value.forEach((desc: any) => formData.append('Descriptions', JSON.stringify(desc)));
  //     } else {
  //       formData.append(key, value);
  //     }
  //   });

  //   // TripDates الموحد
  //   this.tripDatesArray.value.forEach((range: any) => {
  //     const dateObj: any = {};
  //     if (range.startDate) dateObj.startDate =this.toDateOnlyString( range.startDate);
  //     if (range.endDate) dateObj.endDate =this.toDateOnlyString( range.endDate);
  //     formData.append('TripDates', JSON.stringify(dateObj));
  //   });

  //   this.travelService.updateTravel(formData).subscribe((response) => {
  //     if (response.success) {
  //       this.toast.success('Travel updated successfully', 'Success');
  //       if (nextCallback) nextCallback.emit();
  //     }
  //   });
  // }

  //new method to handle travel type change
  //new method to handle travel type change
  private formatTripPricingPeriod(period: any) {
    return {
      id: period.id || 0,
      fromDate: this.toIsoString(period.fromDate),
      toDate: this.toIsoString(period.toDate),
      pricePerPerson: period.pricePerPerson ?? 0
    };
  }

  private toIsoString(date: any): string | null {
    if (!date) return null;
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
  }

  onTravelTypeChange(isExternal: boolean) {
    if (isExternal) {
      // لو الرحلة خارجية -> بنسيب الكونتري زي ما هو ونفضي المدن
      this.travelForm.get('CountryId')?.setValidators([Validators.required]);
      this.travelForm.get('CityId')?.setValidators([Validators.required]);

      // نفضي ليست المدن لحد ما المستخدم يختار دولة
      this.cityList = [];
      this.travelForm.get('CityId')?.reset();
    } else {
      // لو الرحلة داخلية -> نفرغ الكونتري والسيتي ونجيب مدن مصر
      this.travelForm.get('CityId')?.reset();
      this.travelForm.get('CountryId')?.reset();

      // نشيل الفاليديشن من الكونتري
      this.travelForm.get('CountryId')?.clearValidators();
      this.travelForm.get('CountryId')?.setValue(null);
      this.travelForm.get('CityId')?.setValidators([Validators.required]);

      // نجيب مدن مصر مباشرة
      this.cityList = [];
      const egyptCriteria = {
        pageIndex: 1,
        pageSize: 100,
        countryCode: 'eg'
      };

      this.cityService.getAllCities(egyptCriteria).subscribe((response) => {
        this.cityList = response.data.data.map((city: { name: string; id: any }) => ({
          label: city.name,
          value: city.id
        }));
      });
    }

    // نعمل تحديث للفاليديشن
    this.travelForm.get('CountryId')?.updateValueAndValidity();
    this.travelForm.get('CityId')?.updateValueAndValidity();
  }

  onLogoFileSelect(event: any): void {
    this.selectedImages = Array.from(event);
    this.travelForm.patchValue({ ImagesFiles: this.selectedImages });
  }
  removeImageFromDB(id) {
    console.log(id);
    this.travelService.deleteTravelImage(id).subscribe(
      (response) => {
        if (response.success) {
          this.toast.success('Successfully Deleted');
        }
      },
      (error) => {}
    );
  }
  shouldShowError(controlName: string): boolean {
    const control = this.travelForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }
  ///////////////////////////// ---------------- Programs --------------------------//////////////////////  //

  isInvalid(controlName: string, stepIndex: number): boolean {
    const control = (this.steps.at(stepIndex) as FormGroup).get(controlName);
    return (control?.invalid && (control?.dirty || control?.touched)) || false;
  }

  getProgramForm(): FormGroup {
    return (this.tripForm = this.fb.group({
      tripIds: this.fb.array([]), // تبدأ فاضية، وهنضيف فيها بعد الريسبونس
      steps: this.fb.array([this.createStep()])
    }));
  }

  createStep(): FormGroup {
    return this.fb.group({
      id: [0],
      type: [1, Validators.required],
      title: [null, Validators.required],
      details: [''],
      time: [null],
      fromLocation: [null],
      toLocation: [null],
      fromTime: [null],
      toTime: [null],
      latitude: [null],
      longitude: [null],
      stepDescriptions: this.fb.array([])
    });
  }

  get steps(): FormArray {
    return this.tripForm.get('steps') as FormArray;
  }

  addStep(): void {
    this.steps.push(this.createStep());
  }

  removeStep(index: number, event): void {
    event.stopPropagation();
    this.steps.removeAt(index);
  }
  removeStepDB(index, dbIndex, event) {
  event.stopPropagation();
  this.travelService.deleteProgramStep(dbIndex).subscribe(
    (response) => {
      this.steps.removeAt(index);
    },
    (error) => {
      this.toast.error(error.error.message);
    }
  );
}

  getStepDescriptions(index: number): FormArray {
    return this.steps.at(index).get('stepDescriptions') as FormArray;
  }

  addDescriptionStep(stepIndex: number): void {
    this.getStepDescriptions(stepIndex).push(
      this.fb.group({
        id: [0],
        description: ['', Validators.required]
      })
    );
  }

  removeDescriptionStep(stepIndex: number, descIndex: number): void {
    this.getStepDescriptions(stepIndex).removeAt(descIndex);
  }

  dateRangeValidator(form: FormGroup) {
    const startDate = form.get('startDate')?.value;
    const endDate = form.get('endDate')?.value;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return { dateRange: true };
    }
    return null;
  }

  addProgramToTravel(nextCallback?: EventEmitter<void>) {
  if (this.tripForm.invalid) {
  this.steps.markAllAsTouched();
  return;  // ← إضافة return
}
const tripFormValue = this.tripForm.value;

    const formattedData = {
      tripIds: this.tripId,
      steps: tripFormValue.steps.map((step: any) => ({
        type: step.type,
        title: step.title,
        details: step.details,
        time: this.toDateOnlyString(step.time),
        fromLocation: step.fromLocation,
        toLocation: step.toLocation,
        fromTime: step.fromTime,
        toTime: step.toTime,
        latitude: step.latitude,
        longitude: step.longitude,
        stepDescriptions: step.stepDescriptions.map((desc: any) => ({
          description: desc.description
        }))
      }))
    };

    this.travelService.addProgramSteps(formattedData).subscribe(
      (response) => {
        if (response.success) {
          if (nextCallback) {
            nextCallback.emit();
          }
        }
      },
      (error) => {
        this.toast.error('error in adding program to travel', 'error');
      }
    );
  }

  updateProgramToTravel(nextCallback?: EventEmitter<void>) {
    if (this.tripForm.invalid) {
      this.steps.markAllAsTouched();
    }
    const tripFormValue = this.tripForm.value;

    const formattedData = tripFormValue.steps.map((step: any) => ({
      id: step.id ?? 0,
      type: step.type,
      title: step.title,
      details: step.details,
      time: this.toDateOnlyString(step.time),
      //fromLocation: step.fromLocation,
      //toLocation: step.toLocation,
      //fromTime: step.fromTime,
      //toTime: step.toTime,
      //latitude: step.latitude,
      //longitude: step.longitude,
      stepDescriptions: step.stepDescriptions.map((desc: any) => ({
        id: desc.id ?? 0,
        description: desc.description
      }))
    }));

    // لو مفيش ولا step ليه id > 0 يبقى Add
    const isNewProgram = !formattedData.some((step) => step.id && step.id > 0);

    if (isNewProgram) {
      this.travelService.addProgramSteps({ tripIds: [this.travelId], steps: formattedData }).subscribe(
        (response) => {
          if (response.success) {
            nextCallback?.emit();
          }
        },
        (error) => {
          this.toast.error('error in adding program to travel', 'error');
        }
      );
    } else {
      this.travelService.updateProgramSteps(this.travelId, formattedData).subscribe(
        (response) => {
          if (response.success) {
            nextCallback?.emit();
          }
        },
        (error) => {
          this.toast.error('error in adding program to travel', 'error');
        }
      );
    }
  }

  // /////////////////------------------ Discard changes and Go back ---------------/////////////////////

  onCancel(): void {
    this.travelForm.reset();
    this.tripForm.reset();
    this.router.navigate(['/travels']);
  }
}
