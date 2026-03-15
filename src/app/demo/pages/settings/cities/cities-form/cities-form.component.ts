import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from 'src/app/shared/services/countries.service';
import { City, Country, State } from 'country-state-city';
import { Icountries } from 'src/app/shared/model/icountries';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ButtonModule } from 'primeng/button';
import { CitiesService } from 'src/app/shared/services/cities.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cities-form',
  standalone: true,
  imports: [SharedModule, DropdownModule, InputSwitchModule, ButtonModule, ToastModule],
  providers: [DialogService, ConfirmationService, MessageService],
  templateUrl: './cities-form.component.html',
  styleUrls: ['./cities-form.component.scss']
})
export class CitiesFormComponent implements OnInit {
  citiesForm: FormGroup;
  countries: Icountries[] = [];
  cities: any[] = [];
  selectedCountry: Icountries | null = null;
  searchQuery: string = '';

  // @Output() cancelForm = new EventEmitter<boolean>();

  constructor(
    private fb: FormBuilder,
    private _CountriesService: CountriesService,
    private _CitiesService: CitiesService,
    public ref: DynamicDialogRef,
    private MessageService: MessageService,
    private ToastrService: ToastrService
  ) {}

  ngOnInit() {
    this.citiesFormGroup();
    this.getAllCountries();
    this.watchCountryChanges();
  }

  citiesFormGroup() {
    this.citiesForm = this.fb.group({
      countryId: ['', Validators.required],
      city: ['', Validators.required],
      name: ['', Validators.required],
      status: [true],
      isInTravel: [true],
      isInHotel: [true],
      module: [0]
    });
  }

  getAllCountries(search: string = '') {
    // استخدام getAllCountries مع search لجلب الدول
    this._CountriesService.getAllCountries({ pageIndex: 1, pageSize: 10, search }).subscribe({
      next: (res) => {
        if (res && res.data && res.data.data) {
          this.countries = res.data.data;
          this.addIsoToCountries();
        } else {
          console.error('Invalid API response structure');
          this.countries = [];
        }
      },
      error: (err) => {
        console.error('Error fetching countries:', err);
        this.countries = [];
      }
    });
  }

  addIsoToCountries() {
    const libraryCountries = Country.getAllCountries();

    this.countries = this.countries.map((country) => {
      const matchedCountry = libraryCountries.find((libCountry) => libCountry.name.toLowerCase() === country.name.toLowerCase());

      if (matchedCountry) {
        return { ...country, isoCode: matchedCountry.isoCode };
      } else {
        console.warn(`No matching country found in library for: ${country.name} (countryCode: ${country.countryCode})`);
        return { ...country, isoCode: null };
      }
    });

    console.log('Countries with isoCode:', this.countries);
  }

  allCities: any[] = []; // تخزين كل المدن المؤقتة

  watchCountryChanges() {
    this.citiesForm.get('countryId')?.valueChanges.subscribe((countryId) => {
      this.selectedCountry = this.countries.find((country) => country.id === countryId) || null;
      this.citiesForm.get('city')?.reset();
      this.cities = [];

      if (this.selectedCountry?.countryCode) {
        console.log('Selected Country =:', this.selectedCountry);
        // this.allCities = City.getCitiesOfCountry(this.selectedCountry.countryCode) || [];
        this.allCities = this.getMergedCities(this.selectedCountry.countryCode) || [];

        this.cities = this.allCities.slice(0, 100); // عرض أول 100 مدينة

        console.log('Cities for selected country:', this.allCities);
      } else {
        this.allCities = [];
      }
    });
  }

  getMergedCities(countryIso: string) {
    // 1️⃣ نجيب المدن
    const cities = City.getCitiesOfCountry(countryIso) || [];

    // 2️⃣ نجيب الولايات
    const states = State.getStatesOfCountry(countryIso) || [];

    // 3️⃣ نحول الولايات لصيغة المدن
    const stateAsCities = states.map((state) => ({
      name: state.name,
      stateCode: state.isoCode,
      countryCode: state.countryCode,
      latitude: state.latitude,
      longitude: state.longitude,
      isState: true // 🔹 عشان نعرف دي ولاية أصلاً لو احتجناها بعدين
    }));

    // 4️⃣ ندمج الكل مع بعض
    const merged = [...cities, ...stateAsCities];

    // 5️⃣ نزيل أي تكرار بالاسم (لو إسطنبول موجودة في الاثنين)
    const uniqueMerged = merged.filter(
      (value, index, self) => index === self.findIndex((v) => v.name.toLowerCase() === value.name.toLowerCase())
    );

    // ✅ نرتبهم أبجديًا لتحسين تجربة المستخدم
    uniqueMerged.sort((a, b) => a.name.localeCompare(b.name));

    return uniqueMerged;
  }

  onCityFilter(event: any) {
    const query = (event.filter || '').toLowerCase();
    if (!this.allCities.length) return;

    if (query) {
      this.cities = this.allCities.filter((city) => city.name.toLowerCase().includes(query)).slice(0, 100);
    } else {
      this.cities = this.allCities.slice(0, 100);
    }
  }

  // حدث البحث من p-dropdown للدول
  onCountryFilter(event: any) {
    const query = event.filter || '';
    // تأخير البحث لتقليل طلبات الـ API
    setTimeout(() => this.getAllCountries(query), 300);
  }

  onSubmit() {
    if (this.citiesForm.valid) {
      const formValue = this.citiesForm.value;
      const payload = {
        countryId: formValue.countryId,
        enName: formValue.city, // هنا city عبارة عن string
        name: formValue.name,
        status: formValue.status,
        isInTravel: formValue.isInTravel,
        isInHotel: formValue.isInHotel,
        module: formValue.module
      };
      console.log('Form Submitted!', payload);
      this._CitiesService.setCity(payload).subscribe({
        next: (res) => {
          this.ToastrService.success('City added successfully!', 'Success');
          console.log('City added successfully:', res);
          this.citiesForm.reset({
            status: true,
            isInTravel: true,
            isInHotel: true,
            module: 1
          });
          this.ref.close(true); // Close the dialog and emit true to parent component
        },
        error: (err) => {
          this.ToastrService.error('Error adding city', 'Error', {
            timeOut: 3000,
            progressBar: true,
            closeButton: true
          });
          console.error('Error adding city:', err);
        }
      });
    } else {
      console.log('Form is invalid');
      this.markFormAsTouched();
    }
  }

  onCancel() {
    this.ref.close();
  }

  private markFormAsTouched() {
    Object.values(this.citiesForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }
}
