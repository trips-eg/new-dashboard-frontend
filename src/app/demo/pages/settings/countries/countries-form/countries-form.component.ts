import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CountriesService } from 'src/app/shared/services/countries.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Country } from 'country-state-city';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-countries-form',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, DropdownModule],
  providers: [DialogService],
  templateUrl: './countries-form.component.html',
  styleUrl: './countries-form.component.scss'
})
export class CountriesFormComponent implements OnInit {
  countriesForm: FormGroup;
  rawCountries;
  countries;

  constructor(
    private fb: FormBuilder,
    private _CountriesService: CountriesService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit() {
    this.countriesFormGroup();
    this.rawCountries = Country.getAllCountries();
    console.log(this.rawCountries);
    this.countries = Country.getAllCountries().map((c) => ({
      name: c.name,
      isoCode: c.isoCode,
      flag: `https://flagcdn.com/w40/${c.isoCode.toLowerCase()}.png`,
      dialCode: c.phonecode.startsWith('+') ? c.phonecode : `+${c.phonecode}`
    }));
  }

  countriesFormGroup() {
    this.countriesForm = this.fb.group({
      name: [null, [Validators.required]],
      enName: [null, [Validators.required]],
      status: [true, [Validators.required]]
    });
  }

  onSubmit() {
    const selected = this.countriesForm.value.enName;
    const selectedAr = this.countriesForm.value.name;
    const status = this.countriesForm.value.status;

    if (this.countriesForm.invalid) {
      this.countriesForm.markAllAsTouched();
      
      return;
    }

    const payload = {
      enName: selected.name,
      name: selectedAr,
      countryCode: selected.isoCode,
      status: status,
      module: 0
    };

    this._CountriesService.setCountry(payload).subscribe({
      next: (res) => {
        console.log('Creation successful', res);

        this.ref.close({
          success: true,
          message: 'Country created successfully!'
        });
      },
      error: (err) => {
        console.error('Creation failed:', err);
        // إرجاع نتيجة فشل مع الرسالة
        this.ref.close({
          success: false,
          message: 'Failed to create country.'
        });
      }
    });
  }

  onCancel() {
    this.ref.close();
  }
}
