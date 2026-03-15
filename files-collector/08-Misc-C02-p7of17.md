# 08 – Misc (Part 7/17 of Misc)

> **Description:** Everything else that didn't fit the categories above. [Category: C02]
> **Generated:** 2026-03-02 20:16:48

---

## `src/app/demo/pages/settings/countries/countries-form/countries-form.component.html`

```html
<div class="product-form p-4 mb-4">
  <div class="form-field">
    <form [formGroup]="countriesForm" (ngSubmit)="onSubmit()">
      <h3 class="flex justify-content-between">
        {{ 'add country' | translate }}
        <!-- Always show "add" -->
        <span><p-inputSwitch formControlName="status" /></span>
      </h3>
      <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
        <div class="field col-md-12">
          <label for="">
            {{ 'country name' | translate }}
            <small *ngIf="countriesForm.invalid" class="text-danger">*</small>
          </label>
          <p-dropdown
            [options]="countries"
            formControlName="enName"
            [filter]="true"
            optionLabel="name"
            placeholder="اختر الدولة"
            appendTo="body"
          >
            <!-- العناصر -->
            <ng-template let-country pTemplate="item">
              <div class="flex align-items-center">
                <img [src]="country.flag" alt="{{ country.name }}" width="20" class="mr-2" />
                <span>{{ country.name }} ({{ country.dialCode }})</span>
              </div>
            </ng-template>

            <!-- العنصر المختار -->
            <ng-template let-country pTemplate="selectedItem">
              <div class="flex align-items-center">
                <img [src]="country.flag" alt="{{ country.name }}" width="20" class="mr-2" />
                <span>{{ country.name }} ({{ country.dialCode }})</span>
              </div>
            </ng-template>
          </p-dropdown>

          <!-- رسالة الخطأ إذا لم يتم اختيار دولة -->
          <small
            class="error"
            *ngIf="countriesForm.get('enName').errors && (countriesForm.get('enName').touched || countriesForm.get('enName').dirty)"
          >
            * country name is required
          </small>
        </div>
        <div class="field col-md-12">
          
          <div class="flex flex-column gap-2">
            <label for="username"> {{ 'country name in arabic' | translate }}</label>
            <input pInputText id="username" aria-describedby="username-help" formControlName="name" />
            <small id="username-help">enter country name in arabic</small>
          </div>

          <!-- رسالة الخطأ إذا لم يتم اختيار دولة -->
          <small
            class="error"
            *ngIf="countriesForm.get('name').errors && (countriesForm.get('name').touched || countriesForm.get('name').dirty)"
          >
            * country name is required
          </small>
        </div>
      </div>
    </form>
  </div>

  <!-- Buttons -->
  <div class="buttons mt-3 text-end">
    <p-button label="{{ 'Cancel' | translate }}" class="mx-1" severity="secondary" (onClick)="onCancel()"></p-button>
    <p-button label="{{ 'save' | translate }}" severity="success" icon="pi pi-save" (onClick)="onSubmit()"></p-button>
  </div>
</div>

```

---

## `src/app/demo/pages/settings/countries/countries-form/countries-form.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/countries/countries-form/countries-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountriesFormComponent } from './countries-form.component';

describe('CountriesFormComponent', () => {
  let component: CountriesFormComponent;
  let fixture: ComponentFixture<CountriesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountriesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountriesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/countries/countries-form/countries-form.component.ts`

```ts
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

```

---

## `src/app/demo/pages/settings/countries/countries-list/countries-list.component.html`

```html
<p-toast></p-toast>
<p-confirmDialog></p-confirmDialog>
<div class="card">
  <p-toolbar styleClass="mb-4">
    <ng-template pTemplate="right">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'search' | translate" />
      </span>
    </ng-template>
  </p-toolbar>
  <p-table
    #dt
    [value]="countries"
    [paginator]="true"
    [rows]="10"
    [rowsPerPageOptions]="[10, 20, 50]"
    [totalRecords]="totalRecords"
    [loading]="isLoading"
    [lazy]="true"
    (onLazyLoad)="loadCountries($event)"
    [responsiveLayout]="'scroll'"
    dataKey="id"
    [showCurrentPageReport]="true"
    [currentPageReportTemplate]="'showingEntries' | translate"
  >
    <ng-template pTemplate="header">
      <tr>
        <th pSortableColumn="Name">
          {{ 'Arabic Name' | translate }}
          <p-sortIcon field="Name"></p-sortIcon>
        </th>
        <th pSortableColumn="EnName">
          {{ 'English Name' | translate }}
          <p-sortIcon field="EnName"></p-sortIcon>
        </th>
        <th style="width: 35%" pSortableColumn="Status">
          {{ 'status' | translate }}
          <p-sortIcon field="Status"></p-sortIcon>
        </th>
      </tr>
      <tr>
        <th>
          <p-columnFilter type="text" field="Name" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="EnName" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <!-- Status filter could be added here if needed, but sticking to text filters for now or leaving empty -->
        </th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-country>
      <tr>
        <td>{{ country.name }}</td>
        <td>{{ country.enName }}</td>

        <td><p-inputSwitch [(ngModel)]="country.status" (onChange)="onStatusChange(country.id, country.status)" /></td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="3">
          <div class="flex flex-column align-items-center justify-content-center py-5">
            <i class="pi pi-inbox text-500 text-5xl mb-3"></i>
            <span class="text-700 font-medium text-lg">{{ 'No Data found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/settings/countries/countries-list/countries-list.component.scss`

```scss
// Table styling
:host ::ng-deep .p-datatable-table {
  width: 100%;
}

// Align table headings to left
:host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
  text-align: left !important;
}

// Compact filter row styling
:host ::ng-deep .p-datatable .p-datatable-thead > tr:nth-child(2) > th {
  padding: 0.25rem 0.5rem !important;
  background: #f8f9fa;
}

:host ::ng-deep .p-datatable .p-column-filter-row {
  padding: 0 !important;
}
:host ::ng-deep .p-datatable .p-column-filter-element {
  width: 100%;
}

:host ::ng-deep .p-datatable .p-column-filter-row .p-inputtext {
  padding: 0.35rem 0.5rem !important;
  font-size: 13px;
}

:host ::ng-deep .p-datatable .p-column-filter-row .p-column-filter-menu-button,
:host ::ng-deep .p-datatable .p-column-filter-row .p-column-filter-clear-button {
  width: 1.75rem !important;
  height: 1.75rem !important;
}

```

---

## `src/app/demo/pages/settings/countries/countries-list/countries-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountriesListComponent } from './countries-list.component';

describe('CountriesListComponent', () => {
  let component: CountriesListComponent;
  let fixture: ComponentFixture<CountriesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountriesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountriesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/countries/countries-list/countries-list.component.ts`

```ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Icountries } from 'src/app/shared/model/icountries';
import { CountriesService } from 'src/app/shared/services/countries.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-countries-list',
  standalone: true,
  imports: [SharedModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './countries-list.component.html',
  styleUrl: './countries-list.component.scss'
})
export class CountriesListComponent implements OnInit {
  @ViewChild('dt') dt: Table;

  searchTerm: string = '';
  countries: Icountries[] = [];
  totalRecords: number = 0;
  isLoading: boolean = false;
  ref: DynamicDialogRef | undefined;
  currentLang: string;

  constructor(
    private countriesService: CountriesService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentLang = this.translate.currentLang || 'en';
    this.translate.onLangChange.subscribe((lang) => {
      this.currentLang = lang.lang;
    });
  }

  loadCountries(event: TableLazyLoadEvent) {
    this.isLoading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this.countriesService.getAllCountries(payload).subscribe({
      next: (res) => {
        this.countries = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.countries = [];
        this.isLoading = false;
      }
    });
  }

  onSearch(event?: any) {
    this.dt.reset();
  }

  refresh() {
    this.dt.reset();
  }

  onStatusChange(id: number, status: boolean) {
    const payload = { id, status };
    this.countriesService.editStatus(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: status ? 'success' : 'error',
          summary: 'Updated',
          detail: status ? 'Status updated successfully' : 'Status deactivated successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update status'
        });
      }
    });
  }
}

```

---

## `src/app/demo/pages/settings/countries/countries.component.html`

```html
<p-toast></p-toast>
<div class="main">
  <sub-header
    [mainHeader]="'countries'"
    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  ></sub-header>


  <app-countries-list ></app-countries-list>
</div>

```

---

## `src/app/demo/pages/settings/countries/countries.component.scss`

```scss
.form-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.2 );
  z-index: 100;
}

.form-popout {
  position: relative;
  z-index: 101;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
  padding: 1.5rem;
  animation: elevate 0.2s ease;
  margin-bottom: 1.55rem;
}

@keyframes elevate {
  from {
    transform: scale(0.98);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

```

---

## `src/app/demo/pages/settings/countries/countries.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountriesComponent } from './countries.component';

describe('CountriesComponent', () => {
  let component: CountriesComponent;
  let fixture: ComponentFixture<CountriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/countries/countries.component.ts`

```ts
import { Component, ViewChild } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CountriesListComponent } from './countries-list/countries-list.component';
import { CountriesFormComponent } from './countries-form/countries-form.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-countries',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, CountriesListComponent],
  providers: [DialogService, MessageService],
  templateUrl: './countries.component.html',
  styleUrl: './countries.component.scss'
})
export class CountriesComponent {
  ref: DynamicDialogRef | undefined;

  @ViewChild(CountriesListComponent) countriesList!: CountriesListComponent;

  constructor(
    private dialogService: DialogService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  handleAction(event: { action: string }) {
    if (event.action === 'add') {
      this.openCountriesForm();
    }
  }

  openCountriesForm() {
    this.ref = this.dialogService.open(CountriesFormComponent, {
      header: this.translate.instant('countries'),
      width: '50vw',
      modal: true,
      closable: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((result) => {
      if (result) {
        // ✅ استدعاء الفانكشن المخصصة بدل ngOnInit
        this.countriesList.refresh();
        this.toastr.success(`${this.translate.instant('countries')} ${this.translate.instant('added_successfully')}`);
      }
    });
  }
}

```

---

## `src/app/demo/pages/settings/coupons/coupon-details/coupon-details.component.html`

```html
<div class="main-container">
  <!-- <sub-header [mainHeader]="'Coupon Details'" [mainSection]="'Settings'" [subSection]="'Coupons'"></sub-header> -->

  <div class="content-wrapper" *ngIf="coupon">
    <!-- Gradient Card -->
    <div class="coupon-card">
      <div class="card-top">
        <div class="discount-info">
          <i class="pi pi-tag icon"></i>
          <h3>{{ 'Save' | translate }} {{ coupon.discountAmount }} {{ '% on your purchases!' | translate }}</h3>
        </div>
      </div>

      <div class="dotted-line"></div>

      <div class="card-bottom">
        <div class="code-section">
          <span class="label">{{ 'Code' | translate }}:</span>
          <span class="code">{{ coupon.code }}</span>
        </div>
        <button class="copy-btn" (click)="copyCode(coupon.code)">
          <i class="pi pi-copy"></i>
          {{ 'Copy Code' | translate }}
        </button>
      </div>
    </div>

    <!-- Info Section -->
    <div class="info-card">
      <div class="info-group">
        <h4>
          <i class="fa fa-calendar"></i>
          {{ 'Validity Period' | translate }}
        </h4>
        <div class="date-row">
          <span>{{ 'From' | translate }}: {{ coupon.startDate | date: 'dd MMMM yyyy - h:mm a' }}</span>
        </div>
        <div class="date-row">
          <span>{{ 'To' | translate }}: {{ coupon.endDate | date: 'dd MMMM yyyy - h:mm a' }}</span>
        </div>
        <div class="status-row">
          <span class="status-badge" [ngClass]="{ expired: getRemainingDays(coupon.endDate) === 'Expired' }">
            ({{ getRemainingDays(coupon.endDate) }})
          </span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="info-group">
        <h4>
          <i class="fa fa-info-circle"></i>
          {{ 'Usage Terms' | translate }}
        </h4>
        <div class="condition-item">
          <i class="pi pi-user"></i>
          <span>{{ 'Maximum per user' | translate }}: {{ getUserLimitLabel(coupon.userLimit) }}.</span>
        </div>
        <div class="condition-item">
          <i class="pi pi-chart-bar"></i>
          <span>{{ 'Total usage count' | translate }}: {{ coupon.usageNumber }}</span>
        </div>
        <div class="condition-item">
          <i class="pi pi-globe"></i>
          <span>
            {{
              coupon.isGenral ? ('This coupon is general and applies to the store' | translate) : ('This coupon is private and applies to the items listed below' | translate)
            }}.
          </span>
        </div>
        <div class="condition-item" *ngIf="coupon.description">
          <i class="pi pi-info-circle"></i>
          <span>{{ coupon.description }}</span>
        </div>
      </div>

      <div class="divider" *ngIf="!coupon.isGenral"></div>

      <div class="info-group" *ngIf="!coupon.isGenral">
        <h4>
          <i class="pi pi-list"></i>
          {{ 'Items' | translate }}
        </h4>

        <!-- Trips -->
        <div class="items-category" *ngIf="coupon.trip?.length">
          <h5 class="category-title">{{ 'Trips' | translate }}</h5>
          <div class="item-grid">
            <span *ngFor="let item of coupon.trip" class="clickable-item" (click)="navigateTo('trip', item.id)">
              {{ item.name }}
            </span>
          </div>
        </div>

        <!-- Outings -->
        <div class="items-category" *ngIf="coupon.outing?.length">
          <h5 class="category-title">{{ 'Outings' | translate }}</h5>
          <div class="item-grid">
            <span *ngFor="let item of coupon.outing" class="clickable-item" (click)="navigateTo('outing', item.id)">
              {{ item.name }}
            </span>
          </div>
        </div>

        <!-- Rooms -->
        <div class="items-category" *ngIf="coupon.room?.length">
          <h5 class="category-title">{{ 'Rooms' | translate }}</h5>
          <div class="item-grid">
            <span *ngFor="let item of coupon.room" class="clickable-item" (click)="navigateTo('room', item.id)">
              {{ item.name }}
            </span>
          </div>
        </div>

        <!-- Hajj -->
        <div class="items-category" *ngIf="coupon.hajj?.length">
          <h5 class="category-title">{{ 'Hajj/Umrah' | translate }}</h5>
          <div class="item-grid">
            <span *ngFor="let item of coupon.hajj" class="clickable-item" (click)="navigateTo('hajj', item.id)">
              {{ item.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div *ngIf="!coupon" class="loading-state">
    <i class="pi pi-spin pi-spinner"></i>
    <p>{{ 'Loading coupon details...' | translate }}</p>
  </div>
</div>

```

---

## `src/app/demo/pages/settings/coupons/coupon-details/coupon-details.component.scss`

```scss
.main-container {
  // max-width: 600px;
  margin: 2rem auto;
  font-family: 'Tajawal', sans-serif;

  .header-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;

    .back-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #555;
      padding: 0.5rem;
      border-radius: 50%;
      transition: background 0.3s;

      &:hover {
        background: #f0f0f0;
      }
    }

    h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
    }
  }

  .content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .coupon-card {
    background: linear-gradient(135deg, #43a047, #66bb6a); // Green gradient
    // background: linear-gradient(135deg, #d4af37, #f1c40f); // Gold option
    border-radius: 16px;
    color: white;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    position: relative;

    .card-top {
      padding: 2rem;
      text-align: center;

      .discount-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;

        .icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          opacity: 0.9;
        }

        h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: bold;
        }
      }
    }

    .dotted-line {
      border-top: 2px dashed rgba(255, 255, 255, 0.5);
      position: relative;
      margin: 0 1rem;

      &::before,
      &::after {
        content: '';
        position: absolute;
        top: -10px;
        width: 20px;
        height: 20px;
        background: #f4f7fa; // Match page background
        border-radius: 50%;
      }

      &::before {
        left: -20px;
      }

      &::after {
        right: -20px;
      }
    }

    .card-bottom {
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .code-section {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.1rem;

        .label {
          opacity: 0.9;
        }

        .code {
          font-weight: bold;
          font-family: monospace;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
      }

      .copy-btn {
        background: white;
        color: #43a047;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: transform 0.2s;

        &:hover {
          transform: scale(1.05);
        }

        &:active {
          transform: scale(0.95);
        }
      }
    }
  }

  .info-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

    .info-group {
      h4 {
        font-size: 1.1rem;
        font-weight: bold;
        margin-bottom: 1rem;
        color: #333;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .date-row {
        margin-bottom: 0.5rem;
        color: #555;
        font-size: 0.95rem;
      }

      .status-row {
        margin-top: 0.5rem;
        font-size: 0.9rem;
        color: #777;

        .status-badge {
          &.expired {
            color: #e53935;
            font-weight: bold;
          }
        }
      }

      .condition-item {
        display: flex;
        align-items: flex-start;
        gap: 0.8rem;
        margin-bottom: 0.8rem;
        color: #555;
        font-size: 0.95rem;

        i {
          margin-top: 0.2rem;
          color: #43a047;
        }
      }

      .items-category {
        margin-top: 1rem;
        margin-bottom: 1.5rem;

        .category-title {
          font-size: 1rem;
          font-weight: 600;
          color: #555;
          margin-bottom: 0.8rem;
          padding-left: 0.5rem;
          border-left: 3px solid #43a047;
        }

        .item-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.8rem;

          .clickable-item {
            background: #f9f9f9;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            color: #333;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid #eee;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            display: flex;
            align-items: center;

            &:hover {
              background: #e8f5e9;
              color: #2e7d32;
              border-color: #a5d6a7;
              transform: translateY(-2px);
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }

            &::before {
              content: '\e943';
              font-family: 'primeicons';
              margin-right: 0.5rem;
              font-size: 0.8rem;
              color: #43a047;
            }
          }
        }
      }
    }

    .divider {
      height: 1px;
      background: #eee;
      margin: 1.5rem 0;
    }
  }

  .loading-state {
    text-align: center;
    padding: 3rem;
    color: #777;

    i {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
  }
}

```

---

## `src/app/demo/pages/settings/coupons/coupon-details/coupon-details.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponDetailsComponent } from './coupon-details.component';

describe('CouponDetailsComponent', () => {
  let component: CouponDetailsComponent;
  let fixture: ComponentFixture<CouponDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CouponDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/coupons/coupon-details/coupon-details.component.ts`

```ts
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CouponsService } from 'src/app/shared/services/coupons.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { ToastrService } from 'ngx-toastr';
import { EnumsService } from 'src/app/shared/services/enums.service';
import { TranslateService } from '@ngx-translate/core';
import { IcouponDetails } from 'src/app/shared/model/icoupon-details';

@Component({
  selector: 'app-coupon-details',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './coupon-details.component.html',
  styleUrl: './coupon-details.component.scss'
})
export class CouponDetailsComponent {
  couponId: number;
  coupon: IcouponDetails;
  userLimitOptions: any[] = [];
  currentLang: string;

  constructor(
    private route: ActivatedRoute,
    private couponsService: CouponsService,
    private toastr: ToastrService,
    public config: DynamicDialogConfig,
    private enumsService: EnumsService,
    private translateService: TranslateService
  ) {
    this.currentLang = this.translateService.currentLang || 'en';
  }

  ngOnInit(): void {
    this.loadUserLimitOptions();

    // Check if data is coming from dialog
    if (this.config.data?.couponId) {
      this.couponId = this.config.data.couponId;
      this.getCouponDetails(this.couponId);
    } else {
      // Fallback to route params for standalone page navigation
      this.route.params.subscribe((params) => {
        this.couponId = +params['id'];
        if (this.couponId) {
          this.getCouponDetails(this.couponId);
        }
      });
    }
  }

  loadUserLimitOptions() {
    this.enumsService.getUserLimit().subscribe((options) => {
      this.userLimitOptions = options.map((opt: any) => ({
        label: this.currentLang === 'ar' ? opt.nameAr : opt.nameEn,
        value: opt.value
      }));
    });
  }

  getCouponDetails(id: number) {
    this.couponsService.getCouponById(id).subscribe((res) => {
      if (res.success) {
        this.coupon = res.data;
      }
    });
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.toastr.success('Code copied to clipboard');
    });
  }

  getRemainingDays(endDate: string): string {
    if (!endDate) return '';
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Expires today';
    } else {
      return `Remaining ${diffDays} days`;
    }
  }

  getUserLimitLabel(value: number): string {
    const option = this.userLimitOptions.find((opt) => opt.value === value);
    return option ? option.label : value.toString();
  }

  navigateTo(type: 'trip' | 'outing' | 'room' | 'hajj', id: number) {
    let route = '';
    switch (type) {
      case 'trip':
        route = `/travel-details/${id}`;
        break;
      case 'outing':
        route = `/outing-details/${id}`;
        break;
      case 'room':
        route = `/room-details-last-step/${id}`;
        break;
      case 'hajj':
        route = `/details-manasik/${id}`;
        break;
    }
    window.open(route, '_blank');
  }
}

```

---

## `src/app/demo/pages/settings/coupons/coupons-form/coupons-form.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="userlId ? ('Edit Coupon' | translate) : ('Add Coupon' | translate)"
    [mainSection]="'coupons' | translate"
    [subSection]="userlId ? ('Edit' | translate) : ('Add' | translate)"
  ></sub-header>

  <form [formGroup]="couponForm" (ngSubmit)="onSubmit()" class="product-form shadow-3 p-4">
    <p-panel header="{{ 'Coupon Info' | translate }}" toggleable styleClass="mt-3">
      <div class="formgrid grid">
        <!-- Code & Discount -->
        <div class="field col-12 col-md-6">
          <label for="code">
            {{ 'Coupon Code' | translate }}
          </label>
          <input id="code" type="text" formControlName="code" pInputText class="w-full" />
          <div class="text-danger" *ngIf="couponForm.get('code')?.invalid && couponForm.get('code')?.touched">
            <div *ngIf="couponForm.get('code')?.errors?.['required']">
              {{ 'This field is required' | translate }}
            </div>
          </div>
        </div>

        <div class="field col-12 col-md-6">
          <label for="discountAmount">
            {{ 'Discount rate' | translate }}
          </label>
          <p-inputNumber id="discountAmount" suffix="%" formControlName="discountAmount" class="w-full"></p-inputNumber>
          <div class="text-danger" *ngIf="couponForm.get('discountAmount')?.invalid && couponForm.get('discountAmount')?.touched">
            <div *ngIf="couponForm.get('discountAmount')?.errors?.['required']">
              {{ 'This field is required' | translate }}
            </div>
            <div *ngIf="couponForm.get('discountAmount')?.errors?.['min']">
              {{ 'Value must be greater than 0' | translate }}
            </div>
            <div *ngIf="couponForm.get('discountAmount')?.errors?.['max']">
              {{ 'Value must not be greater than 100' | translate }}
            </div>
          </div>
        </div>

        <!-- Usage Number & User Limit -->
        <div class="field col-12 col-md-6">
          <label for="usageNumber">
            {{ 'Usage Number' | translate }}
          </label>
          <p-inputNumber id="usageNumber" formControlName="usageNumber" class="w-full"></p-inputNumber>
          <div class="text-danger" *ngIf="couponForm.get('usageNumber')?.invalid && couponForm.get('usageNumber')?.touched">
            <div *ngIf="couponForm.get('usageNumber')?.errors?.['required']">
              {{ 'This field is required' | translate }}
            </div>
            <div *ngIf="couponForm.get('usageNumber')?.errors?.['min']">
              {{ 'Value must be greater than 0' | translate }}
            </div>
          </div>
        </div>

        <div class="field col-12 col-md-6">
          <label for="userLimit">
            {{ 'User Limit' | translate }}
          </label>
          <p-dropdown
            [options]="userLimitOptions$ | async"
            formControlName="userLimit"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            placeholder="{{ 'Select Limit' | translate }}"
          ></p-dropdown>
          <div class="text-danger" *ngIf="couponForm.get('userLimit')?.invalid && couponForm.get('userLimit')?.touched">
            <div *ngIf="couponForm.get('userLimit')?.errors?.['required']">
              {{ 'This field is required' | translate }}
            </div>
          </div>
        </div>

        <!-- Dates -->
        <div class="field col-12 col-md-6">
          <label for="startDate">
            {{ 'Start Date' | translate }}
          </label>
          <p-calendar
            inputId="startDate"
            formControlName="startDate"
            [showTime]="true"
            hourFormat="24"
            [iconDisplay]="'input'"
            [showIcon]="true"
            class="w-full"
          ></p-calendar>
          <div class="text-danger" *ngIf="couponForm.get('startDate')?.invalid && couponForm.get('startDate')?.touched">
            <div *ngIf="couponForm.get('startDate')?.errors?.['required']">
              {{ 'This field is required' | translate }}
            </div>
          </div>
        </div>

        <div class="field col-12 col-md-6">
          <label for="endDate">
            {{ 'End Date' | translate }}
          </label>
          <p-calendar
            inputId="endDate"
            formControlName="endDate"
            [showTime]="true"
            hourFormat="24"
            [iconDisplay]="'input'"
            [showIcon]="true"
            class="w-full"
          ></p-calendar>
          <div class="text-danger" *ngIf="couponForm.get('endDate')?.invalid && couponForm.get('endDate')?.touched">
            <div *ngIf="couponForm.get('endDate')?.errors?.['required']">
              {{ 'This field is required' | translate }}
            </div>
            <div *ngIf="couponForm.get('endDate')?.errors?.['dateRange']">
              {{ 'End date must be after start date' | translate }}
            </div>
          </div>
        </div>

        <!-- Is General (Fixed typo) -->
        <div class="field col-12">
          <h3 class="flex justify-content-between align-items-center">
            <span>{{ 'general' | translate }}</span>
            <p-inputSwitch formControlName="isGenral"></p-inputSwitch>
          </h3>
        </div>

        <!-- Trips & Rooms if isGenral (Fixed conditional validation) -->
        <div
          class="formgrid grid border-1 border-dashed surface-border border-round p-2 col-12 mb-3"
          *ngIf="!couponForm.get('isGenral')?.value"
        >
          <div class="field col-12">
            <span class="p-fluid">
              <label for="tripIds">
                {{ 'Select Trips' | translate }}
              </label>
              <p-multiSelect
                formControlName="tripIds"
                [options]="tripsOptions$ | async"
                display="comma"
                class="w-full"
                optionLabel="label"
                optionValue="value"
                placeholder="{{ 'Select Trips' | translate }}"
                [filter]="true"
              ></p-multiSelect>
            </span>
          </div>

          <div class="field col-12">
            <span class="p-fluid">
              <label for="roomIds">
                {{ 'Select Rooms' | translate }}
              </label>
              <p-multiSelect
                formControlName="roomIds"
                [options]="roomsOptions$ | async"
                display="comma"
                class="w-full"
                optionLabel="label"
                optionValue="value"
                placeholder="{{ 'Select Rooms' | translate }}"
                [filter]="true"
              ></p-multiSelect>
            </span>
          </div>

          <div class="field col-12">
            <span class="p-fluid">
              <label for="outingIds">
                {{ 'Select Outings' | translate }}
              </label>
              <p-multiSelect
                formControlName="outingIds"
                [options]="outingsOptions$ | async"
                display="comma"
                class="w-full"
                optionLabel="label"
                optionValue="value"
                placeholder="{{ 'Select Outings' | translate }}"
                [filter]="true"
              ></p-multiSelect>
            </span>
          </div>

          <div class="field col-12">
            <span class="p-fluid">
              <label for="hajjIds">
                {{ 'Select Hajj/Umrah' | translate }}
              </label>
              <p-multiSelect
                formControlName="hajjIds"
                [options]="hajjOptions$ | async"
                display="comma"
                class="w-full"
                optionLabel="label"
                optionValue="value"
                placeholder="{{ 'Select Hajj/Umrah' | translate }}"
                [filter]="true"
              ></p-multiSelect>
            </span>
          </div>
        </div>

        <!-- Description -->
        <div class="field col-12">
          <label for="description">{{ 'Description' | translate }}</label>
          <textarea id="description" formControlName="description" rows="3" pInputTextarea class="w-full"></textarea>
          <!-- Add validation if description is required -->
          <div class="text-danger" *ngIf="couponForm.get('description')?.invalid && couponForm.get('description')?.touched">
            <div *ngIf="couponForm.get('description')?.errors?.['required']">
              {{ 'This field is required' | translate }}
            </div>
            <div *ngIf="couponForm.get('description')?.errors?.['maxlength']">
              {{ 'Description is too long' | translate }}
            </div>
          </div>
        </div>
      </div>
    </p-panel>

    <div class="mt-4 text-end">
      <p-button label="{{ 'Cancel' | translate }}" class="mx-1" severity="secondary" (onClick)="onCancel()"></p-button>
      <p-button
        label="{{ 'Save Coupon' | translate }}"
        icon="pi pi-save"
        type="submit"
        class="shadow"
        severity="success"
        [disabled]="couponForm.invalid"
      ></p-button>
    </div>
  </form>
</div>

```

---

## `src/app/demo/pages/settings/coupons/coupons-form/coupons-form.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/coupons/coupons-form/coupons-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponsFormComponent } from './coupons-form.component';

describe('CouponsFormComponent', () => {
  let component: CouponsFormComponent;
  let fixture: ComponentFixture<CouponsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CouponsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/coupons/coupons-form/coupons-form.component.ts`

```ts
import { Component, Inject, inject, OnInit } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CouponsService } from 'src/app/shared/services/coupons.service';
import { EnumsService } from 'src/app/shared/services/enums.service';
import { TranslateService } from '@ngx-translate/core';
import { map, tap } from 'rxjs';
import { RoomService } from 'src/app/shared/services/room.service';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { OutingService } from 'src/app/shared/services/outing.service';
import { HajjUmmrahService } from 'src/app/shared/services/hajj-ummrah.service';

@Component({
  selector: 'app-coupons-form',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule],
  templateUrl: './coupons-form.component.html',
  styleUrl: './coupons-form.component.scss'
})
export class CouponsFormComponent implements OnInit {
  userlId: string;
  couponForm!: FormGroup;
  TranslateService = inject(TranslateService);
  RoomService = inject(RoomService);
  fb = inject(FormBuilder);
  CouponsService = inject(CouponsService);
  EnumsService = inject(EnumsService);
  TravelTripsService = inject(TravelTripsService);
  ToastrService = inject(ToastrService);
  Router = inject(Router);
  OutingService = inject(OutingService);
  HajjUmmrahService = inject(HajjUmmrahService);
  lang = this.TranslateService.currentLang;
  userLimitOptions$ = this.EnumsService.getUserLimit().pipe(
    map((options) =>
      options.map((opt) => ({
        label: this.lang === 'ar' ? opt.nameAr : opt.nameEn,
        value: opt.value
      }))
    )
  );

  createForm() {
    this.couponForm = this.fb.group({
      code: ['', Validators.required],
      description: [''],
      discountType: [2, Validators.required],
      discountAmount: [0, [Validators.required, Validators.min(1), Validators.max(100)]],
      usageNumber: [0, [Validators.required, Validators.min(1)]],
      startDate: [new Date().toISOString().slice(0, 16), Validators.required],
      endDate: [new Date().toISOString().slice(0, 16), Validators.required],
      isGenral: [true],
      userLimit: [2, [Validators.required, Validators.min(1)]],
      tripIds: [[]],
      roomIds: [[]],
      outingIds: [[]],
      hajjIds: [[]]
    });
  }
  ngOnInit(): void {
    this.createForm();
  }
  roomsOptions$ = this.RoomService.getAllRooms({ pageIndex: 1, pageSize: 1000 }).pipe(
    tap((res) => console.log('Rooms API Response:', res)),
    map((res) =>
      res?.data?.data?.map((room: any) => ({
        label: room.name,
        value: room.id
      }))
    )
  );

  tripsOptions$ = this.TravelTripsService.getAllTravels({
    pageIndex: 1,
    pageSize: 1000,
    isPagingEnabled: false
  }).pipe(
    map((res) =>
      res?.data?.data?.map((trip: any) => ({
        label: trip.name,
        value: trip.id
      }))
    )
  );

  outingsOptions$ = this.OutingService.getAllOutings({
    pageIndex: 1,
    pageSize: 1000
  }).pipe(
    map((res) =>
      res?.data?.data?.map((outing: any) => ({
        label: outing.name,
        value: outing.id
      }))
    )
  );

  hajjOptions$ = this.HajjUmmrahService.getAllManasik({
    pageIndex: 1,
    pageSize: 1000
  }).pipe(
    map((res) =>
      res?.data?.data?.map((manasik: any) => ({
        label: manasik.name,
        value: manasik.id
      }))
    )
  );

  onSubmit() {
    if (this.couponForm.invalid) {
      return;
    }

    // Trim all string values before submission
    const formValue = this.couponForm.value;
    const trimmedValue = {
      ...formValue,
      code: formValue.code?.trim() || '',
      description: formValue.description?.trim() || ''
    };

    console.log(trimmedValue);

    this.CouponsService.addCoupons(trimmedValue).subscribe({
      next: (res) => {
        this.ToastrService.success(this.TranslateService.instant('Coupon Added Successfully'));
        this.Router.navigate(['/coupons']);
      },
      error: (err) => {
        this.ToastrService.error(this.TranslateService.instant('Error Adding Coupon'));
        console.error(err);
      }
    });
  }
  onCancel() {
    this.Router.navigate(['/coupons']);
  }
}

```

---

## `src/app/demo/pages/settings/coupons/coupons-list/coupons-list.component.html`

```html
<p-confirmDialog></p-confirmDialog>
<div class="card">
  <p-toolbar styleClass="mb-4">
    <ng-template pTemplate="right">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'search' | translate" />
      </span>
    </ng-template>
  </p-toolbar>
  <p-table
    #dt
    [value]="coupons"
    [paginator]="true"
    [rows]="10"
    [rowsPerPageOptions]="[10, 20, 50]"
    [totalRecords]="totalRecords"
    [loading]="isLoading"
    [lazy]="true"
    (onLazyLoad)="loadCoupons($event)"
    [responsiveLayout]="'scroll'"
    dataKey="id"
    [showCurrentPageReport]="true"
    [currentPageReportTemplate]="'showingEntries' | translate"
  >
    <ng-template pTemplate="header">
      <tr>
        <th pSortableColumn="Code">
          {{ 'coupon name' | translate }}
          <p-sortIcon field="Code"></p-sortIcon>
        </th>
        <th pSortableColumn="DiscountAmount">
          {{ 'discount Amount' | translate }}
          <p-sortIcon field="DiscountAmount"></p-sortIcon>
        </th>
        <th pSortableColumn="UsageNumber">
          {{ 'users count' | translate }}
          <p-sortIcon field="UsageNumber"></p-sortIcon>
        </th>
        <th pSortableColumn="StartDate">
          {{ 'start Date' | translate }}
          <p-sortIcon field="StartDate"></p-sortIcon>
        </th>
        <th pSortableColumn="EndDate">
          {{ 'end Date' | translate }}
          <p-sortIcon field="EndDate"></p-sortIcon>
        </th>
        <th pSortableColumn="UserLimit">
          {{ 'limit of usage' | translate }}
          <p-sortIcon field="UserLimit"></p-sortIcon>
        </th>
        <th>{{ 'actions' | translate }}</th>
      </tr>
      <tr>
        <th>
          <p-columnFilter type="text" field="Code" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="DiscountAmount" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="UsageNumber" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="date" field="StartDate" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="date" field="EndDate" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="UserLimit" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th></th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-coupon>
      <tr>
        <td>{{ coupon.code }}</td>
        <td>{{ coupon.discountAmount }}</td>
        <td>{{ coupon.usageNumber }}</td>
        <td>{{ coupon.startDate | date: 'medium' }}</td>
        <td>{{ coupon.endDate | date: 'medium' }}</td>
        <td>{{ returnValueOFuserLimit(coupon.userLimit) }}</td>
        <td>
          <div class="flex gap-1">
            <p-button
              icon="pi pi-eye"
              [rounded]="true"
              (click)="openCouponDetails(coupon.id)"
              pTooltip="View Details"
              tooltipPosition="top"
              severity="info"
            ></p-button>
            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" (click)="deleteCoupon(coupon.id)"></p-button>
          </div>
        </td>
      </tr>
    </ng-template>
    <!-- Empty Message -->
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="7">
          <div class="flex flex-column align-items-center justify-content-center py-5">
            <i class="pi pi-inbox text-500 text-5xl mb-3"></i>
            <span class="text-700 font-medium text-lg">{{ 'No Data found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/settings/coupons/coupons-list/coupons-list.component.scss`

```scss
// Table styling
:host ::ng-deep .p-datatable-table {
  width: 100%;
}

// Align table headings to left
:host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
  text-align: left !important;
}

// Compact filter row styling
:host ::ng-deep .p-datatable .p-datatable-thead > tr:nth-child(2) > th {
  padding: 0.25rem 0.5rem !important;
  background: #f8f9fa;
}

:host ::ng-deep .p-datatable .p-column-filter-row {
  padding: 0 !important;
}
:host ::ng-deep .p-datatable .p-column-filter-element {
  width: 100%;
}

:host ::ng-deep .p-datatable .p-column-filter-row .p-inputtext {
  padding: 0.35rem 0.5rem !important;
  font-size: 13px;
}

:host ::ng-deep .p-datatable .p-column-filter-row .p-column-filter-menu-button,
:host ::ng-deep .p-datatable .p-column-filter-row .p-column-filter-clear-button {
  width: 1.75rem !important;
  height: 1.75rem !important;
}

```

---

## `src/app/demo/pages/settings/coupons/coupons-list/coupons-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponsListComponent } from './coupons-list.component';

describe('CouponsListComponent', () => {
  let component: CouponsListComponent;
  let fixture: ComponentFixture<CouponsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CouponsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/coupons/coupons-list/coupons-list.component.ts`

```ts
import { EnumsService } from 'src/app/shared/services/enums.service';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { map } from 'rxjs';
import { ICoupon } from 'src/app/shared/model/icoupon';
import { CouponsService } from 'src/app/shared/services/coupons.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CouponDetailsComponent } from '../coupon-details/coupon-details.component';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-coupons-list',
  standalone: true,
  imports: [SharedModule],
  providers: [ConfirmationService, DialogService],
  templateUrl: './coupons-list.component.html',
  styleUrl: './coupons-list.component.scss'
})
export class CouponsListComponent implements OnInit {
  CouponsService = inject(CouponsService);
  ConfirmationService = inject(ConfirmationService);
  toastr = inject(ToastrService);
  EnumsService = inject(EnumsService);
  TranslateService = inject(TranslateService);
  dialogService = inject(DialogService);
  ref: DynamicDialogRef | undefined;
  UserLimitOptions = [];

  @ViewChild('dt') dt: Table;

  lang = this.TranslateService.currentLang;

  totalRecords = 0;
  isLoading = false;
  searchTerm = '';
  coupons: ICoupon[] = [];

  getUserLimitOptions() {
    this.EnumsService.getUserLimit().subscribe({
      next: (res) => {
        this.UserLimitOptions = res;
      }
    });
  }

  returnValueOFuserLimit(val: number) {
    if (!this.UserLimitOptions.length) return val;
    const found = this.UserLimitOptions.find((opt) => opt.value === val);
    return found ? (this.lang === 'ar' ? found.nameAr : found.nameEn) : val;
  }

  openCouponDetails(couponId: number) {
    this.ref = this.dialogService.open(CouponDetailsComponent, {
      header: 'Coupon Details',
      width: '50%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: {
        couponId: couponId
      }
    });
  }

  loadCoupons(event: TableLazyLoadEvent) {
    this.isLoading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this.CouponsService.getCoupons(payload).subscribe({
      next: (res) => {
        this.coupons = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.coupons = [];
        this.isLoading = false;
      }
    });
  }

  ngOnInit(): void {
    this.getUserLimitOptions();
  }

  onSearch(event?: any) {
    this.dt.reset();
  }

  deleteCoupon(id: number) {
    this.ConfirmationService.confirm({
      message: 'Are you sure you want to delete this coupon?',
      header: 'Delete Confirmation',
      rejectButtonStyleClass: 'p-button-text',
      acceptButtonStyleClass: 'p-button-danger',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.CouponsService.deleteCoupon(id).subscribe({
          next: (res) => {
            this.toastr.success('Coupon deleted successfully');
            this.dt.reset();
          },
          error: (err) => {
            console.error(err);
          }
        });
      }
    });
  }
}

```

---

## `src/app/demo/pages/settings/coupons/coupons.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'coupons'"
    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  ></sub-header>

  <app-coupons-list></app-coupons-list>
</div>

```

---

## `src/app/demo/pages/settings/coupons/coupons.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/coupons/coupons.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponsComponent } from './coupons.component';

describe('CouponsComponent', () => {
  let component: CouponsComponent;
  let fixture: ComponentFixture<CouponsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CouponsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/coupons/coupons.component.ts`

```ts
import { Component, inject } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CouponsListComponent } from './coupons-list/coupons-list.component';
import { Router } from '@angular/router';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, CouponsListComponent],
  templateUrl: './coupons.component.html',
  styleUrl: './coupons.component.scss'
})
export class CouponsComponent {
  Router = inject(Router);

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToCouponsForm();
        break;
    }
  }

  goToCouponsForm() {
    this.Router.navigate(['/add-coupon']);
  }
}

```

---

## `src/app/demo/pages/settings/coupons/used-coupons/used-coupons.component.html`

```html
<div class="main">
  <sub-header [mainHeader]="'used coupons'"></sub-header>
  <div class="card">
    <p-table
      #dt
      [value]="usedCoupons"
      [paginator]="true"
      [rows]="10"
      [rowsPerPageOptions]="[10, 20, 50]"
      [totalRecords]="totalRecords"
      [loading]="loading"
      [lazy]="true"
      (onLazyLoad)="loadUsedCoupons($event)"
      [responsiveLayout]="'scroll'"
      dataKey="id"
      [showCurrentPageReport]="true"
      [currentPageReportTemplate]="'showingEntries' | translate"
    >
      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="User.Name">
            User Name
            <p-sortIcon field="User.Name"></p-sortIcon>
          </th>
          <th pSortableColumn="User.Email">
            User Email
            <p-sortIcon field="User.Email"></p-sortIcon>
          </th>
          <th pSortableColumn="User.PhoneNumber">
            User Phone
            <p-sortIcon field="User.PhoneNumber"></p-sortIcon>
          </th>
          <th pSortableColumn="Coupons.Code">
            Coupon Code
            <p-sortIcon field="Coupons.Code"></p-sortIcon>
          </th>
          <th pSortableColumn="Coupons.DiscountAmount">
            Discount Amount
            <p-sortIcon field="Coupons.DiscountAmount"></p-sortIcon>
          </th>
          <th pSortableColumn="UsedDate">
            Used Date
            <p-sortIcon field="UsedDate"></p-sortIcon>
          </th>
        </tr>
        <tr>
          <th>
            <p-columnFilter type="text" field="User.Name" display="row" [showMenu]="false"></p-columnFilter>
          </th>
          <th>
            <p-columnFilter type="text" field="User.Email" display="row" [showMenu]="false"></p-columnFilter>
          </th>
          <th>
            <p-columnFilter type="text" field="User.PhoneNumber" display="row" [showMenu]="false"></p-columnFilter>
          </th>
          <th>
            <p-columnFilter type="text" field="Coupons.Code" display="row" [showMenu]="false"></p-columnFilter>
          </th>
          <th>
            <p-columnFilter type="text" field="Coupons.DiscountAmount" display="row" [showMenu]="false"></p-columnFilter>
          </th>
          <th>
            <p-columnFilter type="date" field="UsedDate" display="row" [showMenu]="false"></p-columnFilter>
          </th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-item>
        <tr>
          <td>{{ item.user?.name }}</td>
          <td>{{ item.user?.email }}</td>
          <td>{{ item.user?.phoneNumber }}</td>
          <td>
            <span
              class="text-primary fw-bold cursor-pointer text-decoration-underline"
              (click)="openCouponDetails(item.coupons?.id)"
              style="cursor: pointer; color: #007bff; text-decoration: underline"
            >
              {{ item.coupons?.code }}
            </span>
          </td>
          <td>{{ item.coupons?.discountAmount }}</td>
          <td>{{ item.usedDate | date: 'dd MMM yyyy' }}</td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="6" class="text-center">
            <div class="flex flex-column align-items-center justify-content-center py-5">
              <i class="pi pi-inbox text-500 text-5xl mb-3"></i>
              <span class="text-700 font-medium text-lg">{{ 'No Data found' | translate }}</span>
            </div>
          </td>
        </tr>
      </ng-template>
    </p-table>
  </div>
</div>

```

---

## `src/app/demo/pages/settings/coupons/used-coupons/used-coupons.component.scss`

```scss
// Table styling
:host ::ng-deep .p-datatable-table {
  width: 100%;
}

// Align table headings to left
:host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
  text-align: left !important;
}

// Compact filter row styling
:host ::ng-deep .p-datatable .p-datatable-thead > tr:nth-child(2) > th {
  padding: 0.25rem 0.5rem !important;
  background: #f8f9fa;
}

:host ::ng-deep .p-datatable .p-column-filter-row {
  padding: 0 !important;
}
:host ::ng-deep .p-datatable .p-column-filter-element {
  width: 100%;
}

:host ::ng-deep .p-datatable .p-column-filter-row .p-inputtext {
  padding: 0.35rem 0.5rem !important;
  font-size: 13px;
}

:host ::ng-deep .p-datatable .p-column-filter-row .p-column-filter-menu-button,
:host ::ng-deep .p-datatable .p-column-filter-row .p-column-filter-clear-button {
  width: 1.75rem !important;
  height: 1.75rem !important;
}

```

---

## `src/app/demo/pages/settings/coupons/used-coupons/used-coupons.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsedCouponsComponent } from './used-coupons.component';

describe('UsedCouponsComponent', () => {
  let component: UsedCouponsComponent;
  let fixture: ComponentFixture<UsedCouponsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsedCouponsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsedCouponsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/coupons/used-coupons/used-coupons.component.ts`

```ts
import { Component, ViewChild } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { CouponsService } from 'src/app/shared/services/coupons.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CouponDetailsComponent } from '../coupon-details/coupon-details.component';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-used-coupons',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule],
  providers: [DialogService],
  templateUrl: './used-coupons.component.html',
  styleUrl: './used-coupons.component.scss'
})
export class UsedCouponsComponent {
  @ViewChild('dt') dt: Table;

  usedCoupons: any[] = [];
  totalRecords: number = 0;
  loading: boolean = false;
  ref: DynamicDialogRef | undefined;

  constructor(
    private couponsService: CouponsService,
    private dialogService: DialogService
  ) {}

  loadUsedCoupons(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload = TableRequestBuilder.build(event);

    this.couponsService.getUsedCoupons(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.usedCoupons = res.data.data;
          this.totalRecords = res.data.itemsCount;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openCouponDetails(couponId: number) {
    this.ref = this.dialogService.open(CouponDetailsComponent, {
      header: 'Coupon Details',
      width: '50%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: {
        couponId: couponId
      }
    });
  }
}

```

---

## `src/app/demo/pages/settings/financial-settings/financial-settings-list/financial-settings-list.component.html`

```html
<div class="card">
  <p-table [value]="financialSettingsList" dataKey="id" editMode="row" [tableStyle]="{ 'min-width': '50rem' }">
    <ng-template pTemplate="header">
      <tr>
        <th style="width: 20%">ID</th>
        <th style="width: 20%">Type</th>
        <th style="width: 20%">Value</th>
        <th style="width: 20%"></th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-product let-editing="editing" let-ri="rowIndex">
      <tr [pEditableRow]="product">
        <td>{{ product.id }}</td>
        <td>{{ product.settingType }}</td>

        <td>
          <p-cellEditor>
            <ng-template pTemplate="input">
              <input type="number" pInputText mode="decimal" [(ngModel)]="product.value" />
            </ng-template>
            <ng-template pTemplate="output">{{ product.value }} </ng-template>
          </p-cellEditor>
        </td>

        <td>
          <div class="flex align-items-center justify-content-center gap-2">
            <!-- زرار Edit -->
            <button
              *ngIf="!editing"
              pButton
              pRipple
              type="button"
              pInitEditableRow
              icon="pi pi-pencil"
              (click)="onRowEditInit(product)"
              class="p-button-rounded p-button-text"
            ></button>

            <!-- زرار Save -->
            <button
              *ngIf="editing"
              pButton
              pRipple
              type="button"
              pSaveEditableRow
              icon="pi pi-check"
              (click)="onRowEditSave(product)"
              class="p-button-rounded p-button-text p-button-success mr-2"
            ></button>

            <!-- زرار Cancel -->
            <button
              *ngIf="editing"
              pButton
              pRipple
              type="button"
              pCancelEditableRow
              icon="pi pi-times"
              (click)="onRowEditCancel(product, ri)"
              class="p-button-rounded p-button-text p-button-danger"
            ></button>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/settings/financial-settings/financial-settings-list/financial-settings-list.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/financial-settings/financial-settings-list/financial-settings-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialSettingsListComponent } from './financial-settings-list.component';

describe('FinancialSettingsListComponent', () => {
  let component: FinancialSettingsListComponent;
  let fixture: ComponentFixture<FinancialSettingsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialSettingsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialSettingsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/financial-settings/financial-settings-list/financial-settings-list.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FinancialService } from 'src/app/shared/services/financial.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-financial-settings-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './financial-settings-list.component.html',
  styleUrl: './financial-settings-list.component.scss'
})
export class FinancialSettingsListComponent implements OnInit {
  financialSettingsList: any[] = [];
  clonedRows: { [s: string]: any } = {};

  constructor(
    private financialService: FinancialService,
    private ToastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.financialService.getAllFinancialSettings().subscribe({
      next: (res) => {
        this.financialSettingsList = res.data;
      }
    });
  }

  onRowEditInit(product: any) {
    this.clonedRows[product.id] = { ...product };
  }

  onRowEditSave(product: any) {
    const payload = {
      id: product.id,
      value: product.value
    };

    this.financialService.updateFinancialSetting([payload]).subscribe({
      next: (res) => {
        delete this.clonedRows[product.id];
        console.log('Value updated successfully');
        this.ToastrService.success(res.message, 'success');
      },
      error: (err) => {
        this.ToastrService.error('Update failed', 'faild');

        this.onRowEditCancel(product, this.financialSettingsList.indexOf(product));
      }
    });
  }

  onRowEditCancel(product: any, index: number) {
    this.financialSettingsList[index] = this.clonedRows[product.id];
    delete this.clonedRows[product.id];
  }
}

```

---

## `src/app/demo/pages/settings/financial-settings/financial-settings.component.html`

```html
<div class="main">
  <sub-header [mainHeader]="'financial settings' | translate"></sub-header>

  <app-financial-settings-list></app-financial-settings-list>
</div>

```

---

## `src/app/demo/pages/settings/financial-settings/financial-settings.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/financial-settings/financial-settings.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialSettingsComponent } from './financial-settings.component';

describe('FinancialSettingsComponent', () => {
  let component: FinancialSettingsComponent;
  let fixture: ComponentFixture<FinancialSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/financial-settings/financial-settings.component.ts`

```ts
import { Component } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from "src/app/shared/components/sub-header/sub-header.component";
import { FinancialSettingsListComponent } from "./financial-settings-list/financial-settings-list.component";

@Component({
  selector: 'app-financial-settings',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, FinancialSettingsListComponent],
  templateUrl: './financial-settings.component.html',
  styleUrl: './financial-settings.component.scss'
})
export class FinancialSettingsComponent {

}

```

---

## `src/app/demo/pages/settings/mob-side-bar/mob-side-bar-details/mob-side-bar-details.component.html`

```html
<div class="main">
  <sub-header [mainHeader]="'Mobile Side Bar Details'" [mainSection]="'side bar list'" [subSection]="'side bar details'"></sub-header>

  <div class="grid" *ngIf="sideBarItemDetails; else loadingTpl">
    <!-- General Info Card -->
    <div class="col-12">
      <div class="card p-4 shadow-3 border-round-lg">
        <div class="flex align-items-center justify-content-between mb-4">
          <h4 class="m-0 text-primary font-bold">
            <i class="pi pi-info-circle mr-2"></i>
            {{ sideBarItemDetails.title }}
          </h4>
          <span [class]="'customer-badge status-' + (sideBarItemDetails.isActive ? 'qualified' : 'unqualified')">
            {{ sideBarItemDetails.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <div class="grid">
          <div class="col-12 col-md-4">
            <div class="info-box p-3 border-round-md bg-primary-50 text-center">
              <i class="pi pi-sort-alt text-primary text-2xl mb-2"></i>
              <div class="text-500 font-medium mb-1">Sequence</div>
              <div class="text-900 font-bold text-2xl">{{ sideBarItemDetails.squence }}</div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="info-box p-3 border-round-md bg-purple-50 text-center">
              <i class="pi pi-palette text-purple-500 text-2xl mb-2"></i>
              <div class="text-500 font-medium mb-1">Color Theme</div>
              <div class="flex align-items-center justify-content-center gap-2 mt-2">
                <div [style.background]="sideBarItemDetails.color" class="w-3rem h-3rem border-circle shadow-2"></div>
                <code class="text-sm">{{ sideBarItemDetails.color }}</code>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="info-box p-3 border-round-md bg-blue-50 text-center">
              <i class="pi pi-list text-blue-500 text-2xl mb-2"></i>
              <div class="text-500 font-medium mb-1">Total Items</div>
              <div class="text-900 font-bold text-2xl">{{ sideBarItemDetails.sideBarItems?.length || 0 }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar Items Carousel -->
    <div class="col-12">
      <div class="card p-4 shadow-3 border-round-lg">
        <div class="flex align-items-center justify-content-between mb-4">
          <h4 class="m-0 text-primary font-bold">
            <i class="pi pi-th-large mr-2"></i>
            Sidebar Items
          </h4>
          <span class="text-500">Swipe to browse</span>
        </div>

        <p-carousel
          *ngIf="sideBarItemDetails.sideBarItems?.length > 0; else noItems"
          [value]="sideBarItemDetails.sideBarItems"
          [numVisible]="3"
          [numScroll]="1"
          [responsiveOptions]="responsiveOptions"
          [circular]="true"
          [autoplayInterval]="0"
        >
          <ng-template pTemplate="item" let-item>
            <div class="p-3">
              <div class="item-card border-1 surface-border border-round-lg p-4 shadow-2 hover:shadow-4 transition-duration-300">
                <!-- Item Header -->
                <div class="flex align-items-center justify-content-between mb-3">
                  <span
                    class="item-type-badge px-3 py-2 border-round-md font-semibold text-sm"
                    [ngClass]="getItemTypeClass(item.sideBarItemType)"
                  >
                    <i [class]="getItemTypeIcon(item.sideBarItemType)" class="mr-2"></i>
                    {{ SideBarItemType[item.sideBarItemType] }}
                  </span>
                  <span class="text-500 text-sm">#{{ item.squence }}</span>
                </div>

                <!-- Item Image -->
                <div
                  class="item-image mb-3 border-round-md overflow-hidden"
                  style="height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                >
                  <img
                    *ngIf="getItemImage(item)"
                    [src]="getItemImage(item)"
                    [alt]="getItemName(item)"
                    class="w-full h-full object-fit-cover"
                  />
                  <div *ngIf="!getItemImage(item)" class="flex align-items-center justify-content-center h-full">
                    <i [class]="getItemTypeIcon(item.sideBarItemType)" class="text-white" style="font-size: 4rem; opacity: 0.5"></i>
                  </div>
                </div>

                <!-- Item Details -->
                <h5 class="mt-0 mb-2 text-900 font-bold line-height-3">{{ getItemName(item) }}</h5>

                <div class="item-meta">
                  <div class="flex align-items-center gap-2 mb-2 text-600">
                    <i class="pi pi-tag text-sm"></i>
                    <span class="text-sm">ID: {{ item.outing?.id || item.hajj?.id || item.trip?.id || item.room?.id }}</span>
                  </div>

                  <!-- Type-specific info -->
                  <div *ngIf="item.outing" class="text-sm text-600">
                    <div class="flex align-items-center gap-2 mb-1">
                      <i class="pi pi-map-marker"></i>
                      <span>{{ item.outing.location || 'N/A' }}</span>
                    </div>
                    <div class="flex align-items-center gap-2">
                      <i class="pi pi-star-fill text-yellow-500"></i>
                      <span>{{ item.outing.rating || 0 }} / 5</span>
                    </div>
                  </div>

                  <div *ngIf="item.hajj" class="text-sm text-600">
                    <div class="flex align-items-center gap-2 mb-1">
                      <i class="pi pi-calendar"></i>
                      <span>{{ item.hajj.numberOfDays }} Days</span>
                    </div>
                    <div class="flex align-items-center gap-2">
                      <i class="pi pi-star-fill text-yellow-500"></i>
                      <span>{{ item.hajj.rating || 0 }} / 5</span>
                    </div>
                  </div>

                  <div *ngIf="item.trip" class="text-sm text-600">
                    <div class="flex align-items-center gap-2 mb-1">
                      <i class="pi pi-calendar"></i>
                      <span>{{ item.trip.numberOfDays }} Days</span>
                    </div>
                  </div>

                  <div *ngIf="item.room" class="text-sm text-600">
                    <div class="flex align-items-center gap-2 mb-1">
                      <i class="pi pi-home"></i>
                      <span>{{ item.room.boarding || 'Hotel Room' }}</span>
                    </div>
                    <div class="flex align-items-center gap-2">
                      <i class="pi pi-users"></i>
                      <span>{{ item.room.bedCount }} Beds</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ng-template>
        </p-carousel>

        <ng-template #noItems>
          <div class="text-center p-5">
            <i class="pi pi-inbox text-400" style="font-size: 4rem"></i>
            <p class="text-600 mt-3">No items found for this sidebar.</p>
          </div>
        </ng-template>
      </div>
    </div>
  </div>

  <ng-template #loadingTpl>
    <div class="flex align-items-center justify-content-center h-20rem">
      <p-progressSpinner></p-progressSpinner>
    </div>
  </ng-template>
</div>

```

---

## `src/app/demo/pages/settings/mob-side-bar/mob-side-bar-details/mob-side-bar-details.component.scss`

```scss
.item-card {
  transition: all 0.3s ease;
  min-height: 420px;
}

.item-card:hover {
  transform: translateY(-5px);
}

.item-type-badge {
  display: inline-flex;
  align-items: center;
}

.item-image {
  position: relative;
  overflow: hidden;
}

.item-image img {
  transition: transform 0.3s ease;
}

.item-card:hover .item-image img {
  transform: scale(1.05);
}

.info-box {
  transition: all 0.3s ease;
}

.info-box:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

::ng-deep .p-carousel-indicators {
  padding: 1rem;
}

::ng-deep .p-carousel-indicator button {
  width: 2rem;
  height: 0.5rem;
  border-radius: 0.25rem;
}

```

---

## `src/app/demo/pages/settings/mob-side-bar/mob-side-bar-details/mob-side-bar-details.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobSideBarDetailsComponent } from './mob-side-bar-details.component';

describe('MobSideBarDetailsComponent', () => {
  let component: MobSideBarDetailsComponent;
  let fixture: ComponentFixture<MobSideBarDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobSideBarDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobSideBarDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/mob-side-bar/mob-side-bar-details/mob-side-bar-details.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { ISideBar, SideBarItem } from 'src/app/shared/model/iside-bar';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MobSideBarService, SideBarItemType } from 'src/app/shared/services/mob-side-bar.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-mob-side-bar-details',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule],
  templateUrl: './mob-side-bar-details.component.html',
  styleUrl: './mob-side-bar-details.component.scss'
})
export class MobSideBarDetailsComponent implements OnInit {
  sideBarItemDetails: ISideBar | null = null;
  loading = false;
  SideBarItemType = SideBarItemType;
  baseImageUrl = environment.imgUrl;

  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '1024px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private mobSideBarService: MobSideBarService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.getSideBarDetails(+params['id']);
      }
    });
  }

  getSideBarDetails(id: number) {
    this.loading = true;
    this.mobSideBarService.getMobileSideBarById(id).subscribe({
      next: (res) => {
        this.sideBarItemDetails = res.data || res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching details', err);
        this.loading = false;
      }
    });
  }

  getItemName(item: SideBarItem): string {
    if (item.outing) return item.outing.name;
    if (item.hajj) return item.hajj.name;
    if (item.trip) return item.trip.name || item.trip.title;
    if (item.room) return item.room.name;
    return 'Unknown Item';
  }

  getItemTypeClass(type: number): string {
    switch (type) {
      case SideBarItemType.Room:
        return 'bg-blue-100 text-blue-700';
      case SideBarItemType.Outing:
        return 'bg-green-100 text-green-700';
      case SideBarItemType.Hajj:
        return 'bg-purple-100 text-purple-700';
      case SideBarItemType.Trip:
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getItemTypeIcon(type: number): string {
    switch (type) {
      case SideBarItemType.Room:
        return 'pi pi-home';
      case SideBarItemType.Outing:
        return 'pi pi-compass';
      case SideBarItemType.Hajj:
        return 'pi pi-building';
      case SideBarItemType.Trip:
        return 'pi pi-globe';
      default:
        return 'pi pi-tag';
    }
  }

  getItemImage(item: SideBarItem): string | null {
    if (item.outing?.images?.[0]) return this.baseImageUrl + item.outing.images[0].imageUrl || item.outing.images[0];
    if (item.hajj?.images?.[0]) return this.baseImageUrl + item.hajj.images[0].imageUrl || item.hajj.images[0];
    if (item.trip?.images?.[0]) return this.baseImageUrl + item.trip.images[0].imageUrl || item.trip.images[0];
    if (item.room?.images?.[0]) return this.baseImageUrl + item.room.images[0].imageUrl || item.room.images[0];
    return null;
  }
}

```

---

## `src/app/demo/pages/settings/mob-side-bar/mob-side-bar-form/mob-side-bar-form.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="isEditMode ? ('Edit Sidebar' | translate) : ('Create Sidebar' | translate)"
    [mainSection]="'Settings' | translate"
    [subSection]="isEditMode ? ('Edit' | translate) : ('Create' | translate)"
  ></sub-header>

  <div class="card p-4">
    <form [formGroup]="sideBarForm" (ngSubmit)="onSave()">
      <!-- Sidebar Info Section -->
      <h3 class="flex justify-content-between align-items-center">
        {{ 'Sidebar Info' | translate }}
        <span class="flex align-items-center gap-2">
          <label for="isActive">{{ 'Is Active' | translate }}</label>
          <p-inputSwitch formControlName="isActive" inputId="isActive"></p-inputSwitch>
        </span>
      </h3>

      <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round mb-4">
        <div class="field col-12 col-md-6">
          <label for="title">{{ 'Title' | translate }}</label>
          <input pInputText id="title" formControlName="title" class="w-full" />
          <small class="p-error" *ngIf="sideBarForm.get('title')?.dirty && sideBarForm.get('title')?.invalid">
            {{ 'Title is required' | translate }}
          </small>
        </div>

        <div class="field col-12 col-md-6">
          <label for="squence">{{ 'Sequence' | translate }}</label>
          <p-inputNumber id="squence" formControlName="squence" styleClass="w-full" class="w-full"></p-inputNumber>
        </div>

        <div class="field col-12 col-md-6">
          <label class="block mb-2">{{ 'Color' | translate }}</label>
          <div class="flex align-items-center gap-2">
            <p-colorPicker formControlName="color"></p-colorPicker>
            <span>{{ sideBarForm.get('color')?.value }}</span>
          </div>
        </div>
      </div>

      <!-- Items Management Section -->
      <h3>{{ 'Items Management' | translate }}</h3>
      <div class="card mt-3" style="min-height: 500px">
        <p-splitter [style]="{ height: '100%' }">
          <!-- Left Pane: Available Items -->
          <ng-template pTemplate>
            <div class="col-12 h-full flex flex-column overflow-auto">
              <h5 class="mb-3 p-3">{{ 'Available Items' | translate }}</h5>

              <p-tabView (onChange)="onTabChange($event)" class="flex-1">
                <p-tabPanel header="Room">
                  <ng-container *ngTemplateOutlet="itemsGrid; context: { $implicit: SideBarItemType.Room }"></ng-container>
                </p-tabPanel>
                <p-tabPanel header="Outing">
                  <ng-container *ngTemplateOutlet="itemsGrid; context: { $implicit: SideBarItemType.Outing }"></ng-container>
                </p-tabPanel>
                <p-tabPanel header="Hajj">
                  <ng-container *ngTemplateOutlet="itemsGrid; context: { $implicit: SideBarItemType.Hajj }"></ng-container>
                </p-tabPanel>
                <p-tabPanel header="Trip">
                  <ng-container *ngTemplateOutlet="itemsGrid; context: { $implicit: SideBarItemType.Trip }"></ng-container>
                </p-tabPanel>
              </p-tabView>
            </div>
          </ng-template>

          <!-- Right Pane: Selected Items -->
          <ng-template pTemplate>
            <div class="col-12 h-full overflow-auto">
              <h5 class="mb-3 p-3 flex align-items-center justify-content-between">
                <span>{{ 'Selected Items' | translate }}</span>
                <p-tag [value]="selectedItems.length.toString()" [rounded]="true" severity="info"></p-tag>
              </h5>

              <div class="flex flex-column gap-2 px-3 pb-3">
                <div
                  *ngFor="let item of selectedItems; let i = index"
                  class="selected-card"
                  [ngClass]="{
                    'selected-card--room': item.sideBarItemType === SideBarItemType.Room,
                    'selected-card--outing': item.sideBarItemType === SideBarItemType.Outing,
                    'selected-card--hajj': item.sideBarItemType === SideBarItemType.Hajj,
                    'selected-card--trip': item.sideBarItemType === SideBarItemType.Trip
                  }"
                >
                  <!-- Top Row: Order + Name + Type + Delete -->
                  <div class="flex align-items-center justify-content-between">
                    <div class="flex align-items-center gap-2 flex-1" style="min-width: 0">
                      <span class="selected-card__order">{{ i + 1 }}</span>
                      <span class="selected-card__name">{{ getItemName(item) }}</span>
                      <p-tag
                        [value]="SideBarItemType[item.sideBarItemType]"
                        [severity]="
                          item.sideBarItemType === SideBarItemType.Room
                            ? 'info'
                            : item.sideBarItemType === SideBarItemType.Outing
                              ? 'success'
                              : item.sideBarItemType === SideBarItemType.Hajj
                                ? 'warning'
                                : 'danger'
                        "
                        [rounded]="true"
                        styleClass="text-xs"
                      ></p-tag>
                    </div>
                    <p-button
                      icon="pi pi-trash"
                      severity="danger"
                      [text]="true"
                      [rounded]="true"
                      size="small"
                      (onClick)="removeItem(i)"
                      pTooltip="{{ 'Remove' | translate }}"
                      tooltipPosition="left"
                    ></p-button>
                  </div>

                  <!-- Details Row (from _displayItem) -->
                  <div class="selected-card__details" *ngIf="item['_displayItem'] as d">
                    <!-- Description -->
                    <div class="selected-card__desc" *ngIf="d.description">
                      {{ d.description.length > 60 ? (d.description | slice: 0 : 60) + '...' : d.description }}
                    </div>

                    <!-- Meta: Price + Vendor + Location -->
                    <div class="selected-card__meta">
                      <span class="selected-card__price" *ngIf="getItemPrice(d) !== 'N/A'">
                        <i class="pi pi-wallet"></i>
                        {{ getItemPrice(d) }}
                      </span>
                      <span class="selected-card__vendor" *ngIf="getVendorName(d)">
                        <i class="pi pi-building"></i>
                        {{ getVendorName(d) }}
                      </span>
                      <span class="selected-card__location" *ngIf="d.location">
                        <i class="pi pi-map-marker"></i>
                        {{ d.location }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Empty State -->
                <div class="selected-card__empty" *ngIf="selectedItems.length === 0">
                  <i class="pi pi-arrow-left" style="font-size: 2rem; color: var(--text-color-secondary)"></i>
                  <p class="text-500 m-0 mt-2">{{ 'No items selected. Select items from the left.' | translate }}</p>
                </div>
              </div>
            </div>
          </ng-template>
        </p-splitter>
      </div>

      <div class="flex justify-content-end gap-2 mt-5">
        <p-button label="{{ 'Back' | translate }}" severity="secondary" (onClick)="onBack()"></p-button>
        <p-button label="{{ 'Save' | translate }}" type="submit" [loading]="saving"></p-button>
      </div>
    </form>
  </div>
</div>

<ng-template #itemsGrid let-type>
  <div class="flex flex-column h-full">
    <!-- Search Bar -->
    <div class="px-3 mb-3">
      <span class="p-input-icon-left w-full">
        <i class="pi pi-search"></i>
        <input
          type="text"
          pInputText
          [value]="sectorStates[type].filter.Search"
          placeholder="{{ 'Search items...' | translate }}"
          (input)="onSearch($event, type)"
          class="w-full"
        />
      </span>
    </div>

    <!-- Items List -->
    <div class="flex flex-column gap-3 px-3" *ngIf="!sectorStates[type].loading; else loadingTemplate">
      <div
        *ngFor="let item of sectorStates[type].items"
        class="item-card"
        [ngClass]="{
          'item-card--room': type === SideBarItemType.Room,
          'item-card--outing': type === SideBarItemType.Outing,
          'item-card--hajj': type === SideBarItemType.Hajj,
          'item-card--trip': type === SideBarItemType.Trip
        }"
      >
        <!-- Card Header: Name + Price -->
        <div class="flex justify-content-between align-items-start mb-2">
          <div class="flex align-items-center gap-2">
            <span class="item-card__name">{{ item.name || item.title || 'Item #' + item.id }}</span>
            <p-tag
              [value]="SideBarItemType[type]"
              [severity]="
                type === SideBarItemType.Room
                  ? 'info'
                  : type === SideBarItemType.Outing
                    ? 'success'
                    : type === SideBarItemType.Hajj
                      ? 'warning'
                      : 'danger'
              "
              [rounded]="true"
              styleClass="text-xs"
            ></p-tag>
          </div>
          <span class="item-card__price" *ngIf="getItemPrice(item) !== 'N/A'">
            {{ getItemPrice(item) }}
          </span>
          <span class="item-card__price item-card__price--na" *ngIf="getItemPrice(item) === 'N/A'">N/A</span>
        </div>

        <!-- Description -->
        <div class="item-card__desc" *ngIf="item.description">
          {{ item.description.length > 80 ? (item.description | slice: 0 : 80) + '...' : item.description }}
        </div>

        <!-- Location -->
        <div class="item-card__meta" *ngIf="item.location">
          <i class="pi pi-map-marker"></i>
          {{ item.location }}
        </div>

        <!-- Outing Tickets Section -->
        <div class="item-card__tickets" *ngIf="item.tickets?.length > 0">
          <div class="item-card__tickets-toggle" (click)="item._showTickets = !item._showTickets">
            <i class="pi" [ngClass]="item._showTickets ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
            <span>{{ 'Tickets' | translate }} ({{ item.tickets.length }})</span>
          </div>

          <div class="item-card__tickets-list" *ngIf="item._showTickets">
            <div
              *ngFor="let ticket of item.tickets"
              class="item-card__ticket"
              [ngClass]="{ 'item-card__ticket--inactive': !ticket.isActive }"
            >
              <div class="item-card__ticket-info">
                <span class="item-card__ticket-type">{{ ticket.ticketType }}</span>
                <p-tag *ngIf="!ticket.isActive" value="Inactive" severity="danger" [rounded]="true" styleClass="text-xs"></p-tag>
              </div>
              <div class="item-card__ticket-details">
                <span class="item-card__ticket-price">{{ ticket.price | number }}</span>
                <span class="item-card__ticket-qty" *ngIf="ticket.availableQuantity">
                  <i class="pi pi-ticket"></i>
                  {{ ticket.availableQuantity }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer: Vendor + Add Button -->
        <div class="flex justify-content-between align-items-center mt-2">
          <div class="flex align-items-center gap-2">
            <span class="item-card__vendor" *ngIf="getVendorName(item)">
              <i class="pi pi-building"></i>
              {{ getVendorName(item) }}
            </span>
            <span class="item-card__id">#{{ item.id }}</span>
          </div>
          <p-button
            icon="pi pi-plus"
            (onClick)="addItem(item)"
            size="small"
            [rounded]="true"
            [outlined]="true"
            pTooltip="{{ 'Add' | translate }}"
            tooltipPosition="left"
          ></p-button>
        </div>
      </div>

      <!-- Empty State -->
      <div class="text-center py-5 surface-100 border-round" *ngIf="sectorStates[type].items.length === 0">
        <i class="pi pi-inbox text-4xl text-400 mb-3" style="display: block"></i>
        <p class="text-500 m-0">{{ 'No items found' | translate }}</p>
      </div>

      <!-- Paginator -->
      <div class="mt-3">
        <p-paginator
          [rows]="sectorStates[type].filter.pageSize"
          [totalRecords]="sectorStates[type].totalRecords"
          [first]="(sectorStates[type].filter.pageIndex - 1) * sectorStates[type].filter.pageSize"
          (onPageChange)="onPageChange($event, type)"
        ></p-paginator>
      </div>
    </div>
  </div>
</ng-template>

<ng-template #loadingTemplate>
  <div class="grid">
    <div class="col-12 md:col-6" *ngFor="let i of [1, 2, 3, 4]">
      <p-skeleton height="100px" styleClass="mb-2"></p-skeleton>
    </div>
  </div>
</ng-template>

```

---

## `src/app/demo/pages/settings/mob-side-bar/mob-side-bar-form/mob-side-bar-form.component.scss`

```scss
// =============================================
// Available Item Card — Horizontal List Style
// =============================================

.item-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-left: 4px solid var(--primary-color);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  transition:
    box-shadow 0.2s ease,
    transform 0.15s ease;
  cursor: default;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  // Accent colors per type
  &--room {
    border-left-color: #3b82f6; // blue
  }
  &--outing {
    border-left-color: #22c55e; // green
  }
  &--hajj {
    border-left-color: #f59e0b; // amber
  }
  &--trip {
    border-left-color: #ef4444; // red
  }

  // Card Name
  &__name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color);
    line-height: 1.4;
  }

  // Price Badge
  &__price {
    font-size: 0.9rem;
    font-weight: 700;
    color: #16a34a;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 20px;
    padding: 0.2rem 0.75rem;
    white-space: nowrap;
    flex-shrink: 0;

    &--na {
      color: var(--text-color-secondary);
      background: var(--surface-100);
      border-color: var(--surface-border);
      font-weight: 500;
      font-size: 0.8rem;
    }
  }

  // Description
  &__desc {
    font-size: 0.85rem;
    color: var(--text-color-secondary);
    line-height: 1.5;
    margin-bottom: 0.25rem;
  }

  // Vendor
  &__vendor {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
    display: flex;
    align-items: center;
    gap: 0.35rem;

    i {
      font-size: 0.75rem;
    }
  }

  // ID
  &__id {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    opacity: 0.7;
  }

  // Location / Meta
  &__meta {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: 0.35rem;

    i {
      font-size: 0.75rem;
      color: var(--primary-color);
    }
  }

  // =============================================
  // Tickets Section
  // =============================================
  &__tickets {
    margin-top: 0.75rem;
    border-top: 1px dashed var(--surface-border);
    padding-top: 0.5rem;
  }

  &__tickets-toggle {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--primary-color);
    cursor: pointer;
    padding: 0.25rem 0;
    user-select: none;
    transition: color 0.15s ease;

    &:hover {
      color: var(--primary-600, #4338ca);
    }

    i {
      font-size: 0.7rem;
      transition: transform 0.2s ease;
    }
  }

  &__tickets-list {
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  &__ticket {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--surface-50, #f8fafc);
    border: 1px solid var(--surface-200, #e2e8f0);
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    transition: background 0.15s ease;

    &:hover {
      background: var(--surface-100, #f1f5f9);
    }

    &--inactive {
      opacity: 0.55;
    }
  }

  &__ticket-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
  }

  &__ticket-type {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__ticket-details {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  &__ticket-price {
    font-size: 0.85rem;
    font-weight: 700;
    color: #16a34a;
  }

  &__ticket-qty {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    display: flex;
    align-items: center;
    gap: 0.25rem;

    i {
      font-size: 0.7rem;
    }
  }
}

// =============================================
// Selected Item Card
// =============================================

.selected-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-left: 4px solid var(--primary-color);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  // Accent colors per type
  &--room {
    border-left-color: #3b82f6;
  }
  &--outing {
    border-left-color: #22c55e;
  }
  &--hajj {
    border-left-color: #f59e0b;
  }
  &--trip {
    border-left-color: #ef4444;
  }

  &__order {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    background: var(--surface-200);
    color: var(--text-color);
    font-size: 0.75rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  &__name {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__details {
    margin-top: 0.4rem;
    padding-top: 0.4rem;
    border-top: 1px dashed var(--surface-border);
  }

  &__desc {
    font-size: 0.78rem;
    color: var(--text-color-secondary);
    line-height: 1.4;
    margin-bottom: 0.35rem;
  }

  &__meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  &__price,
  &__vendor,
  &__location {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    display: flex;
    align-items: center;
    gap: 0.25rem;

    i {
      font-size: 0.7rem;
    }
  }

  &__price {
    color: #16a34a;
    font-weight: 600;
  }

  // Empty state
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    background: var(--surface-50);
    border: 2px dashed var(--surface-border);
    border-radius: 12px;
    text-align: center;
  }
}

```

---

## `src/app/demo/pages/settings/mob-side-bar/mob-side-bar-form/mob-side-bar-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobSideBarFormComponent } from './mob-side-bar-form.component';

describe('MobSideBarFormComponent', () => {
  let component: MobSideBarFormComponent;
  let fixture: ComponentFixture<MobSideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobSideBarFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobSideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/mob-side-bar/mob-side-bar-form/mob-side-bar-form.component.ts`

```ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MobSideBarService, MobSideBarItem, SideBarItemType } from 'src/app/shared/services/mob-side-bar.service';
import { OutingService } from 'src/app/shared/services/outing.service';
import { HajjUmmrahService } from 'src/app/shared/services/hajj-ummrah.service';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { RoomService } from 'src/app/shared/services/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterMap, FilterTravelMap } from 'src/app/shared/mapping/filterMap';
import { MessageService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';

interface SectorState {
  items: any[];
  totalRecords: number;
  loading: boolean;
  filter: FilterMap;
}

@Component({
  selector: 'app-mob-side-bar-form',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, ReactiveFormsModule],
  templateUrl: './mob-side-bar-form.component.html',
  styleUrl: './mob-side-bar-form.component.scss'
})
export class MobSideBarFormComponent implements OnInit {
  isEditMode = false;
  sideBarForm: FormGroup;
  sideBarId: number;

  // Enums for Template
  SideBarItemType = SideBarItemType;

  // State Management for each Sector
  sectorStates: { [key: number]: SectorState } = {
    [SideBarItemType.Room]: { items: [], totalRecords: 0, loading: false, filter: { pageIndex: 1, pageSize: 6, Search: '' } },
    [SideBarItemType.Outing]: { items: [], totalRecords: 0, loading: false, filter: { pageIndex: 1, pageSize: 6, Search: '' } },
    [SideBarItemType.Hajj]: { items: [], totalRecords: 0, loading: false, filter: { pageIndex: 1, pageSize: 6, Search: '' } },
    [SideBarItemType.Trip]: { items: [], totalRecords: 0, loading: false, filter: { pageIndex: 1, pageSize: 6, Search: '' } }
  };

  selectedItems: MobSideBarItem[] = [];
  selectedType: SideBarItemType = SideBarItemType.Room; // Default to match first tab
  saving = false;

  constructor(
    private fb: FormBuilder,
    private mobSideBarService: MobSideBarService,
    private outingService: OutingService,
    private hajjService: HajjUmmrahService,
    private tripService: TravelTripsService,
    private roomService: RoomService,
    private router: Router,
    private route: ActivatedRoute,
    private toaster: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.sideBarId = +params['id'];
        this.loadSideBarData();
      }
    });
    // Load initial available items for the default tab (Room)
    this.loadAvailableItems(SideBarItemType.Room);
  }

  initializeForm() {
    this.sideBarForm = this.fb.group({
      title: ['', Validators.required],
      color: ['#e3cccd', Validators.required],
      squence: [0, Validators.required],
      isActive: [true]
    });
  }

  loadSideBarData() {
    this.mobSideBarService.getMobileSideBarById(this.sideBarId).subscribe((res) => {
      const data = res.data || [];
      if (data) {
        this.sideBarForm.patchValue({
          title: data.title,
          color: data.color,
          squence: data.squence,
          isActive: data.isActive
        });
        // Map selected items and populate _displayItem from nested objects
        this.selectedItems = (data.sideBarItems || []).map((item: any) => {
          const displayItem = item.outing || item.room || item.trip || item.hajj || null;
          if (displayItem) {
            item._displayItem = displayItem;
          }
          return item;
        });
        this.removedItems = []; // Reset removed items on load
      }
    });
  }

  onTabChange(event: any) {
    let newType: SideBarItemType;
    switch (event.index) {
      case 0:
        newType = SideBarItemType.Room;
        break;
      case 1:
        newType = SideBarItemType.Outing;
        break;
      case 2:
        newType = SideBarItemType.Hajj;
        break;
      case 3:
        newType = SideBarItemType.Trip;
        break;
      default:
        newType = SideBarItemType.Room;
    }

    this.selectedType = newType;
    // Load data if empty (or always refresh if preferred? Let's load if empty to act as cache)
    if (this.sectorStates[newType].items.length === 0) {
      this.loadAvailableItems(newType);
    }
  }

  onSearch(event: any, type: SideBarItemType) {
    this.sectorStates[type].filter.Search = event.target.value;
    this.sectorStates[type].filter.pageIndex = 1;
    this.loadAvailableItems(type);
  }

  onPageChange(event: any, type: SideBarItemType) {
    this.sectorStates[type].filter.pageIndex = event.page + 1;
    this.loadAvailableItems(type);
  }

  loadAvailableItems(type: SideBarItemType) {
    const state = this.sectorStates[type];
    state.loading = true;

    const onSuccess = (res: any) => {
      state.items = res.data?.data || res.data || res.items || [];
      // Updated to include multiple checks for total count, prioritizing itemsCount as requested
      state.totalRecords = res.data?.itemsCount || res.itemsCount || res.data?.totalCount || res.totalCount || res.count || 0;
      state.loading = false;
      this.cdr.detectChanges();
    };

    const onError = () => {
      state.loading = false;
      this.cdr.detectChanges();
    };

    switch (type) {
      case SideBarItemType.Outing:
        this.outingService.getAllOutings(state.filter).subscribe({ next: onSuccess, error: onError });
        break;
      case SideBarItemType.Hajj:
        this.hajjService.getAllManasik(state.filter).subscribe({ next: onSuccess, error: onError });
        break;
      case SideBarItemType.Trip:
        const tripFilter: FilterTravelMap = { ...state.filter };
        this.tripService.getAllTravels(tripFilter).subscribe({ next: onSuccess, error: onError });
        break;
      case SideBarItemType.Room:
        this.roomService.getAllRooms(state.filter).subscribe({ next: onSuccess, error: onError });
        break;
    }
  }

  getVendorName(item: any): string {
    return item.vendor?.name || item.companyDto?.name || '';
  }

  getItemPrice(item: any): string {
    // Direct price field (Room, Trip)
    const price = item.price ?? item.priceBefore ?? null;
    if (price !== null && price !== undefined && price > 0) {
      return price.toLocaleString();
    }
    // Outing tickets — show the lowest ticket price
    if (item.tickets?.length > 0) {
      const prices = item.tickets.filter((t: any) => t.price > 0).map((t: any) => t.price);
      if (prices.length > 0) {
        const min = Math.min(...prices);
        return 'From ' + min.toLocaleString();
      }
    }
    return 'N/A';
  }

  addItem(item: any) {
    // Check if checks already exists
    const exists = this.selectedItems.some(
      (existing) =>
        (existing.outingId === item.id && this.selectedType === SideBarItemType.Outing) ||
        (existing.hajjId === item.id && this.selectedType === SideBarItemType.Hajj) ||
        (existing.tripId === item.id && this.selectedType === SideBarItemType.Trip) ||
        (existing.roomId === item.id && this.selectedType === SideBarItemType.Room)
    );

    if (exists) {
      this.toaster.warning('Item already added', 'Warning');
      return;
    }

    const newItem: MobSideBarItem = {
      squence: this.selectedItems.length + 1,
      sideBarItemType: this.selectedType,
      outingId: this.selectedType === SideBarItemType.Outing ? item.id : 0,
      hajjId: this.selectedType === SideBarItemType.Hajj ? item.id : 0,
      tripId: this.selectedType === SideBarItemType.Trip ? item.id : 0,
      roomId: this.selectedType === SideBarItemType.Room ? item.id : 0
    };

    // Store a reference to the original item for display purposes (name, etc)
    // We'll attach it as a dynamic property _displayItem
    (newItem as any)._displayItem = item;

    this.selectedItems.push(newItem);
  }

  removedItems: number[] = [];

  removeItem(index: number) {
    const item = this.selectedItems[index];
    if (item.id) {
      this.removedItems.push(item.id);
    }
    this.selectedItems.splice(index, 1);
    // Reorder sequences
    this.selectedItems.forEach((item, idx) => (item.squence = idx + 1));
  }

  // Helper to get display name from selected item
  getItemName(item: MobSideBarItem): string {
    // First check _displayItem (set when adding or from loadSideBarData mapping)
    if ((item as any)._displayItem) {
      return (item as any)._displayItem.name || (item as any)._displayItem.title || 'Unknown';
    }
    // Fallback: check nested objects directly on the item
    const nested = (item as any).outing || (item as any).room || (item as any).trip || (item as any).hajj;
    if (nested) {
      return nested.name || nested.title || 'Unknown';
    }
    return `Item #${item.id}`;
  }

  onSave() {
    console.log('onSave called');
    if (this.sideBarForm.invalid) {
      console.error('Form is invalid', this.sideBarForm.errors);
      Object.keys(this.sideBarForm.controls).forEach((key) => {
        const control = this.sideBarForm.get(key);
        if (control?.invalid) {
          console.error(`Control ${key} is invalid`, control.errors);
        }
      });
      return;
    }

    this.saving = true;
    const formValue = this.sideBarForm.value;

    // Construct payload
    const payload: any = {
      ...formValue,
      removedItemId: this.removedItems || [],
      sideBarItems: this.selectedItems.map((item) => {
        const itemPayload: any = {
          squence: item.squence,
          sideBarItemType: item.sideBarItemType
        };

        // Conditionally add the relevant ID based on type
        switch (item.sideBarItemType) {
          case SideBarItemType.Outing:
            itemPayload.outingId = item.outingId;
            break;
          case SideBarItemType.Hajj:
            itemPayload.hajjId = item.hajjId;
            break;
          case SideBarItemType.Trip:
            itemPayload.tripId = item.tripId;
            break;
          case SideBarItemType.Room:
            itemPayload.roomId = item.roomId;
            break;
        }

        // Only include ID if it exists (for edit mode updates of existing items)
        if (item.id) {
          itemPayload.id = item.id;
        }
        return itemPayload;
      })
    };

    if (this.isEditMode) {
      payload.id = this.sideBarId;
    }

    console.log('Payload:', payload);

    if (this.isEditMode) {
      this.mobSideBarService.updateMobileSideBar(this.sideBarId, payload).subscribe({
        next: () => {
          console.log('Update success');
          this.saving = false;
          this.toaster.success('Sidebar updated successfully', 'Success');
          this.router.navigate(['/mobile-sidebar'], { relativeTo: this.route });
        },

        error: (err) => {
          console.error('Update error', err);
          this.saving = false;
          this.toaster.error('Failed to update sidebar', 'Error');
        }
      });
    } else {
      this.mobSideBarService.addMobileSideBar(payload).subscribe({
        next: () => {
          console.log('Add success');
          this.saving = false;
          this.toaster.success('Sidebar created successfully', 'Success');
          this.router.navigate(['/mobile-sidebar'], { relativeTo: this.route });
        },
        error: (err) => {
          console.error('Add error', err);
          this.saving = false;
          this.toaster.error('Failed to create sidebar', 'Error');
        }
      });
    }
  }

  onBack() {
    this.router.navigate(['/mobile-sidebar'], { relativeTo: this.route });
  }
}

```

---

## `src/app/demo/pages/settings/mob-side-bar/mob-side-bar-list/mob-side-bar-list.component.html`

```html
<p-toast></p-toast>
<p-confirmDialog></p-confirmDialog>

<div class="card">
  <!-- Sidebar Type Selector -->
  <div class="flex justify-content-center mb-3">
    <p-selectButton
      [options]="sidebarTypeOptions"
      [(ngModel)]="sidebarType"
      (onChange)="onSidebarTypeChange()"
      optionLabel="label"
      optionValue="value"
    ></p-selectButton>
  </div>

  <p-toolbar styleClass="mb-4">
    <ng-template pTemplate="right">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText type="text" [(ngModel)]="search" (ngModelChange)="onSearch()" placeholder="{{ 'Search...' | translate }}" />
      </span>
    </ng-template>
  </p-toolbar>

  <p-table
    #dt
    [value]="sideBars"
    [rows]="10"
    [paginator]="true"
    [totalRecords]="totalRecords"
    [lazy]="true"
    (onLazyLoad)="loadSideBars($event)"
    [rowHover]="true"
    styleClass="p-datatable-gridlines"
    [loading]="loading"
    [rowsPerPageOptions]="[10, 20, 30]"
    responsiveLayout="scroll"
    [showCurrentPageReport]="true"
    [currentPageReportTemplate]="'showingEntries' | translate"
  >
    <ng-template pTemplate="header">
      <tr>
        <th pSortableColumn="id">
          {{ 'ID' | translate }}
          <p-sortIcon field="id"></p-sortIcon>
        </th>
        <th pSortableColumn="Title">
          {{ 'Title' | translate }}
          <p-sortIcon field="Title"></p-sortIcon>
        </th>
        <th pSortableColumn="squence">
          {{ 'Sequence' | translate }}
          <p-sortIcon field="squence"></p-sortIcon>
        </th>
        <th pSortableColumn="color">
          {{ 'Color' | translate }}
          <p-sortIcon field="color"></p-sortIcon>
        </th>
        <th pSortableColumn="isActive">
          {{ 'Status' | translate }}
          <p-sortIcon field="isActive"></p-sortIcon>
        </th>
        <th>{{ 'Actions' | translate }}</th>
      </tr>
      <tr>
        <th>
          <p-columnFilter type="text" field="id" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="Title" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="squence" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="color" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th></th>
        <th></th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-sidebar>
      <tr>
        <td>{{ sidebar.id }}</td>
        <td>{{ sidebar.title }}</td>
        <td>{{ sidebar.squence }}</td>
        <td>
          <div class="flex align-items-center justify-content-center gap-2">
            <div [style.background-color]="sidebar.color" class="w-2rem h-2rem border-circle border-1 border-300"></div>
            <span>{{ sidebar.color }}</span>
          </div>
        </td>
        <td>
          <span [class]="'product-badge status-' + (sidebar.isActive ? 'instock' : 'outofstock')">
            {{ (sidebar.isActive ? 'Active' : 'Inactive') | translate }}
          </span>
        </td>
        <td>
          <div class="flex gap-1 justify-content-center">
            <button
              pButton
              pRipple
              icon="pi pi-pencil"
              severity="success"
              class="p-button-rounded mr-2"
              (click)="edit(sidebar)"
              pTooltip="{{ 'Edit' | translate }}"
            ></button>
            <button
              pButton
              pRipple
              icon="pi pi-eye"
              severity="info"
              class="p-button-rounded mr-2"
              pTooltip="{{ 'View' | translate }}"
              (click)="view(sidebar.id)"
            ></button>
            <button
              pButton
              pRipple
              icon="pi pi-trash"
              severity="danger"
              class="p-button-rounded"
              (click)="delete(sidebar.id)"
              pTooltip="{{ 'Delete' | translate }}"
            ></button>
          </div>
        </td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="6" class="text-center p-4">
          <div class="flex flex-column align-items-center">
            <i class="pi pi-inbox text-500 text-3xl mb-3"></i>
            <span>{{ 'No Records Found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

<!-- Coupon Sidebar Edit Dialog -->
<p-dialog
  header="{{ 'Edit Coupon Sidebar' | translate }}"
  [(visible)]="couponDialogVisible"
  [modal]="true"
  [style]="{ width: '450px' }"
  [closable]="true"
  (onHide)="closeCouponDialog()"
>
  <form [formGroup]="couponForm">
    <div class="formgrid grid">
      <div class="field col-12">
        <label for="couponTitle">{{ 'Title' | translate }}</label>
        <input pInputText id="couponTitle" formControlName="title" class="w-full" />
        <small class="p-error" *ngIf="couponForm.get('title')?.dirty && couponForm.get('title')?.invalid">
          {{ 'Title is required' | translate }}
        </small>
      </div>

      <div class="field col-12">
        <label for="couponSquence">{{ 'Sequence' | translate }}</label>
        <p-inputNumber id="couponSquence" formControlName="squence" styleClass="w-full" class="w-full"></p-inputNumber>
      </div>

      <div class="field col-12">
        <label class="block mb-2">{{ 'Color' | translate }}</label>
        <div class="flex align-items-center gap-2">
          <p-colorPicker formControlName="color" appendTo="body"></p-colorPicker>
          <span>{{ couponForm.get('color')?.value }}</span>
        </div>
      </div>

      <div class="field col-12">
        <div class="flex align-items-center gap-2">
          <p-inputSwitch formControlName="isActive" inputId="couponIsActive"></p-inputSwitch>
          <label for="couponIsActive">{{ 'Is Active' | translate }}</label>
        </div>
      </div>
    </div>
  </form>

  <ng-template pTemplate="footer">
    <p-button label="{{ 'Cancel' | translate }}" severity="secondary" (onClick)="closeCouponDialog()"></p-button>
    <p-button
      label="{{ 'Save' | translate }}"
      (onClick)="saveCouponSidebar()"
      [loading]="savingCoupon"
      [disabled]="couponForm.invalid"
    ></p-button>
  </ng-template>
</p-dialog>

```

---

## `src/app/demo/pages/settings/mob-side-bar/mob-side-bar-list/mob-side-bar-list.component.scss`

```scss
// Table styling
:host ::ng-deep .p-datatable-table {
  width: 100%;
}

// Align table headings to left
:host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
  text-align: left !important;
}

// Compact filter row styling
:host ::ng-deep .p-datatable .p-datatable-thead > tr:nth-child(2) > th {
  padding: 0.25rem 0.5rem !important;
  background: #f8f9fa;
}

:host ::ng-deep .p-datatable .p-column-filter-row {
  padding: 0 !important;
}
:host ::ng-deep .p-datatable .p-column-filter-element {
  width: 100%;
}

:host ::ng-deep .p-datatable .p-column-filter-row .p-inputtext {
  padding: 0.35rem 0.5rem !important;
  font-size: 13px;
}

:host ::ng-deep .p-datatable .p-column-filter-row .p-column-filter-menu-button,
:host ::ng-deep .p-datatable .p-column-filter-row .p-column-filter-clear-button {
  width: 1.75rem !important;
  height: 1.75rem !important;
}

```

---

## `src/app/demo/pages/settings/mob-side-bar/mob-side-bar-list/mob-side-bar-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobSideBarListComponent } from './mob-side-bar-list.component';

describe('MobSideBarListComponent', () => {
  let component: MobSideBarListComponent;
  let fixture: ComponentFixture<MobSideBarListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobSideBarListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobSideBarListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/mob-side-bar/mob-side-bar-list/mob-side-bar-list.component.ts`

```ts
import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MobSideBarService, MobSideBar } from 'src/app/shared/services/mob-side-bar.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-mob-side-bar-list',
  standalone: true,
  imports: [SharedModule, SelectButtonModule, DialogModule, ReactiveFormsModule],
  templateUrl: './mob-side-bar-list.component.html',
  styleUrl: './mob-side-bar-list.component.scss',
  providers: [MessageService, ConfirmationService],
  encapsulation: ViewEncapsulation.None
})
export class MobSideBarListComponent implements OnInit {
  @ViewChild('dt') dt: Table;

  sideBars: MobSideBar[] = [];
  totalRecords: number = 0;
  search: string = '';
  loading: boolean = false;

  // Sidebar type selection
  sidebarType: string = 'sidebar';
  sidebarTypeOptions = [
    { label: 'Sidebar', value: 'sidebar' },
    { label: 'Coupon Sidebar', value: 'couponSidebar' }
  ];

  // Coupon Sidebar Edit Dialog
  couponDialogVisible: boolean = false;
  couponForm: FormGroup;
  editingCouponId: number | null = null;
  savingCoupon: boolean = false;

  constructor(
    private mobSideBarService: MobSideBarService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.initCouponForm();
  }

  initCouponForm() {
    this.couponForm = this.fb.group({
      title: ['', Validators.required],
      color: ['#e3cccd'],
      squence: [0],
      isActive: [true]
    });
  }

  ngOnInit(): void {}

  loadSideBars(event: TableLazyLoadEvent) {
    this.loading = true;

    if (this.sidebarType === 'sidebar') {
      const payload = TableRequestBuilder.build(event, this.search);
      this.mobSideBarService.getAllMobileSideBar(payload).subscribe({
        next: (res: any) => {
          this.sideBars = res.data.data;
          this.totalRecords = res.data.itemsCount;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data' });
        }
      });
    } else {
      // Coupon Sidebar (GET / All)
      this.mobSideBarService.getCouponSideBar().subscribe({
        next: (res: any) => {
          // Coupon sidebar returns array directly or single object
          this.sideBars = Array.isArray(res.data) ? res.data : [res.data];
          this.totalRecords = this.sideBars.length;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data' });
        }
      });
    }
  }

  onSidebarTypeChange() {
    this.search = '';
    this.dt.reset();
  }

  onSearch(event?: any) {
    this.dt.reset();
  }

  refresh() {
    this.dt.reset();
  }

  add() {
    this.router.navigate(['/settings/mob-side-bar/add']);
  }

  edit(sidebar: MobSideBar) {
    if (this.sidebarType === 'couponSidebar') {
      // Open dialog for coupon sidebar
      this.editingCouponId = sidebar.id!;
      this.couponForm.patchValue({
        title: sidebar.title,
        color: sidebar.color,
        squence: sidebar.squence,
        isActive: sidebar.isActive
      });
      this.couponDialogVisible = true;
    } else {
      // Navigate to form page for regular sidebar
      this.router.navigate([`mobile-sidebar-form/${sidebar.id}`]);
    }
  }

  saveCouponSidebar() {
    if (this.couponForm.invalid || !this.editingCouponId) {
      return;
    }

    this.savingCoupon = true;
    const payload: MobSideBar = {
      ...this.couponForm.value
    };

    this.mobSideBarService.editCouponSideBar(this.editingCouponId, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Coupon sidebar updated successfully' });
        this.savingCoupon = false;
        this.couponDialogVisible = false;
        this.refresh();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update coupon sidebar' });
        this.savingCoupon = false;
      }
    });
  }

  closeCouponDialog() {
    this.couponDialogVisible = false;
    this.editingCouponId = null;
    this.couponForm.reset({
      title: '',
      color: '#e3cccd',
      squence: 0,
      isActive: true
    });
  }

  view(id: number) {
    this.router.navigate([`mobile-sidebar-details/${id}`]);
  }

  delete(id: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this sidebar?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.mobSideBarService.deleteMobileSideBar(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Sidebar deleted successfully' });
            this.refresh();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete sidebar' });
          }
        });
      }
    });
  }
}

```

---

## `src/app/demo/pages/settings/mob-side-bar/mob-side-bar.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'mobile-sidebar'"
    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  ></sub-header>


  <app-mob-side-bar-list></app-mob-side-bar-list>
</div>
```

---

## `src/app/demo/pages/settings/mob-side-bar/mob-side-bar.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/mob-side-bar/mob-side-bar.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobSideBarComponent } from './mob-side-bar.component';

describe('MobSideBarComponent', () => {
  let component: MobSideBarComponent;
  let fixture: ComponentFixture<MobSideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobSideBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/mob-side-bar/mob-side-bar.component.ts`

```ts
import { Component } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { MobSideBarListComponent } from './mob-side-bar-list/mob-side-bar-list.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-mob-side-bar',
  standalone: true,
  imports: [SubHeaderComponent, MobSideBarListComponent],
  templateUrl: './mob-side-bar.component.html',
  styleUrl: './mob-side-bar.component.scss'
})
export class MobSideBarComponent {
  constructor(private router: Router) {}
  handleAction(actionevent: { action: string }) {
    if (actionevent.action === 'add') {
      this.router.navigate(['/mobile-sidebar-form']);
    }
  }
}

```

---

## `src/app/demo/pages/settings/mobile-policies/mobile-policies.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'Mobile Policies' | translate"
  ></sub-header>
  <app-policy-form></app-policy-form>
</div>
```

---

## `src/app/demo/pages/settings/mobile-policies/mobile-policies.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/mobile-policies/mobile-policies.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobilePoliciesComponent } from './mobile-policies.component';

describe('MobilePoliciesComponent', () => {
  let component: MobilePoliciesComponent;
  let fixture: ComponentFixture<MobilePoliciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobilePoliciesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobilePoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/mobile-policies/mobile-policies.component.ts`

```ts
import { Component } from '@angular/core';
import { SubHeaderComponent } from "src/app/shared/components/sub-header/sub-header.component";
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PolicyFormComponent } from "./policy-form/policy-form.component";

@Component({
  selector: 'app-mobile-policies',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, PolicyFormComponent],
  templateUrl: './mobile-policies.component.html',
  styleUrl: './mobile-policies.component.scss'
})
export class MobilePoliciesComponent {

}

```

---

## `src/app/demo/pages/settings/mobile-policies/policy-form/policy-form.component.html`

```html
<form [formGroup]="policiesForm" >
<div class="formgrid grid p-3 border-1 border-dashed surface-border border-round gap-3">
  <div class="field col">
    <label for="policyPragraph">
      {{ 'policy Pragraph' | translate }}
    </label>
    <p-editor
      id="Description1"
      formControlName="policyPragraph"
      [readonly]="!isEditMode"
      [style]="{ height: '350px' }">
    </p-editor>
  </div>
  <div class="field col">
    <label for="enPolicyPragraph">
      {{ 'enPolicy Pragraph' | translate }}
    </label>
    <p-editor
      id="enPolicyPragraph"
      formControlName="enPolicyPragraph"
      [readonly]="!isEditMode"
      [style]="{ height: '350px' }">
    </p-editor>
  </div>
</div>

<div class="buttons mt-3 text-end">
  <ng-container *ngIf="!isEditMode">
<p-button 
  label="{{ 'Edit' | translate }}" 
  icon="fa fa-edit" 
  [iconPos]="translateService.currentLang === 'ar' ? 'right' : 'left'" 
  class="p-button-rounded p-button-outlined p-button-sm" 
  (onClick)="onEdit()">
</p-button>
  </ng-container>

  <ng-container *ngIf="isEditMode">
    <p-button label="{{ 'Cancel' | translate }}" class="mx-1" severity="secondary" (onClick)="onCancel()"></p-button>
    <p-button label="{{ 'Save' | translate }}" severity="success" icon="pi pi-save" type="submit" (onClick)="onSave()"></p-button>
  </ng-container>
</div>
</form>
```

---

## `src/app/demo/pages/settings/mobile-policies/policy-form/policy-form.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/mobile-policies/policy-form/policy-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyFormComponent } from './policy-form.component';

describe('PolicyFormComponent', () => {
  let component: PolicyFormComponent;
  let fixture: ComponentFixture<PolicyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/mobile-policies/policy-form/policy-form.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PoliciesService } from 'src/app/shared/services/policies.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-policy-form',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './policy-form.component.html',
  styleUrl: './policy-form.component.scss'
})
export class PolicyFormComponent implements OnInit {
  isEditMode = false;
  policiesForm: FormGroup;

  constructor(
    private policiesService: PoliciesService,
    private fb: FormBuilder,
    private ToastrService: ToastrService,
    public translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initPolicyForm();
    this.getPolicies();
  }
  getDirection(): 'rtl' | 'ltr' {
    return this.translateService.currentLang === 'ar' ? 'rtl' : 'ltr';
  }
  initPolicyForm() {
    this.policiesForm = this.fb.group({
      id: [''],
      policyPragraph: [null],
      enPolicyPragraph: [null]
    });
  }

  onEdit() {
    this.isEditMode = true;
    this.ToastrService.info('You can now edit the policy', 'Edit Mode');
  }

  onCancel() {
    this.isEditMode = false;
    this.ToastrService.warning('Edit cancelled', 'Cancelled');
    this.getPolicies();
  }

  onSave() {
    this.isEditMode = false;
    console.log(this.policiesForm.value);
    this.policiesService.updatePolicies(this.policiesForm.value).subscribe({
      next: (res) => {
        this.ToastrService.success('Policy updated successfully', 'Success');
      }
    });
  }

  fillFormWithData(data: any) {
    this.policiesForm.patchValue({
      id: data.id,
      policyPragraph: data.policyPragraph,
      enPolicyPragraph: data.enPolicyPragraph
    });
  }

  getPolicies() {
    this.policiesService.getPolicies().subscribe({
      next: (res) => {
        if (res?.data) {
          this.fillFormWithData(res.data);
        }
      }
    });
  }
}

```

---

## `src/app/demo/pages/settings/nationalities/nationalities-form/nationalities-form.component.html`

```html
<div class="product-form p-4 mb-4">
  <div class="form-field">
    <form [formGroup]="nationalitiesForm" (ngSubmit)="onSubmit()">
      <h3 class="flex justify-content-between">
{{ config.data ? ('edit nationality' | translate) : ('add nationality' | translate) }}
        <!-- Always show "add" -->
      </h3>
      <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
        <div class="field col-md-12">
          <div class="flex flex-column gap-2">
            <label for="">
              {{ 'nationality in arabic' | translate }}
            </label>
            <input pInputText id="username" aria-describedby="username-help" formControlName="nameAr" />
            <small id="username-help">{{'enter nationality in arabic'|translate}}</small>
          </div>
          <!-- رسالة الخطأ إذا لم يتم اختيار دولة -->
          <small
            class="error"
            *ngIf="
              nationalitiesForm.get('nameAr').errors && (nationalitiesForm.get('nameAr').touched || nationalitiesForm.get('nameAr').dirty)
            "
          >
            * required
          </small>
        </div>
        <div class="field col-md-12">
          <div class="flex flex-column gap-2">
            <label for="username">{{ 'nationality in english' | translate }}</label>
            <input pInputText id="username" aria-describedby="username-help" formControlName="name" />
            <small id="username-help">{{'enter nationality in english'|translate}}</small>
          </div>

          <!-- رسالة الخطأ إذا لم يتم اختيار دولة -->
          <small
            class="error"
            *ngIf="nationalitiesForm.get('name').errors && (nationalitiesForm.get('name').touched || nationalitiesForm.get('name').dirty)"
          >
            * required
          </small>
        </div>
      </div>
    </form>
  </div>

  <!-- Buttons -->
  <div class="buttons mt-3 text-end">
    <p-button label="{{ 'Cancel' | translate }}" class="mx-1" severity="secondary" (onClick)="onCancel()"></p-button>
    <p-button label="{{ 'save' | translate }}" severity="success" icon="pi pi-save" (onClick)="onSubmit()"></p-button>
  </div>
</div>

```

---

## `src/app/demo/pages/settings/nationalities/nationalities-form/nationalities-form.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/nationalities/nationalities-form/nationalities-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NationalitiesFormComponent } from './nationalities-form.component';

describe('NationalitiesFormComponent', () => {
  let component: NationalitiesFormComponent;
  let fixture: ComponentFixture<NationalitiesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NationalitiesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NationalitiesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/nationalities/nationalities-form/nationalities-form.component.ts`

```ts
import { NationalitiesService } from './../../../../../shared/services/nationalities.service';
import { co } from '@fullcalendar/core/internal-common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nationalities-form',
  standalone: true,
  imports: [SharedModule],
  providers: [DialogService],
  templateUrl: './nationalities-form.component.html',
  styleUrl: './nationalities-form.component.scss'
})
export class NationalitiesFormComponent implements OnInit {
  nationalitiesForm: FormGroup;
  
  nationalitiesFormGroup() {
    this.nationalitiesForm = this.fb.group({
      name: [null, [Validators.required]],
      nameAr: [null, [Validators.required]]
    });
  }

  onSubmit() {
    if (this.nationalitiesForm.valid) {
      const payload = this.nationalitiesForm.value;

      // Check if update or create
      if (this.config?.data && this.config.data.id) {
        // Update operation
        this.NationalitiesService.updateNationality(this.config.data.id, payload).subscribe({
          next: (res) => {
            this.toaster.success('Updated successfully' , 'Success');
            this.ref.close(res); // Pass updated data
          },
          error: (err) => {
            this.toaster.error('Update error' , 'Error');
            this.ref.close();

            console.error('Update error:', err);
          }
        });
      } else {
        // Create operation
        this.NationalitiesService.setNationalities(payload).subscribe({
          next: (res) => {
            this.toaster.success('Created successfully' , 'Success');
            this.ref.close(payload); // Pass created data
          },
          error: (err) => {
            this.toaster.error('Create error' , 'Error');
            this.ref.close();

            console.error('Create error:', err);
          }
        });
      }
    } else {
      this.nationalitiesForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.ref.close();
  }
  handleEdit() {
    if (this.config.data) {
      this.nationalitiesForm.patchValue({
        name: this.config.data.name || '',
        nameAr: this.config.data.nameAr || ''
      });
      console.log('Editing bed type:', this.config.data.name);
    }
  }
  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private NationalitiesService: NationalitiesService , 
    private toaster:ToastrService
  ) {}
  ngOnInit(): void {
    this.nationalitiesFormGroup();
    if (this.config.data) {
      console.log('Received data:', this.config.data);
      this.handleEdit();
    }
  }
}

```

---

## `src/app/demo/pages/settings/nationalities/nationalities-list/nationalities-list.component.html`

```html
<p-confirmDialog></p-confirmDialog>
<div class="card">
  <p-toolbar styleClass="mb-4">
    <ng-template pTemplate="right">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" [placeholder]="'search' | translate" />
      </span>
    </ng-template>
  </p-toolbar>
  <p-table
    #dt
    [value]="nationalities"
    [paginator]="true"
    [rows]="10"
    [rowsPerPageOptions]="[10, 20, 50]"
    [totalRecords]="totalRecords"
    [loading]="isLoading"
    [lazy]="true"
    (onLazyLoad)="loadNationalities($event)"
    [responsiveLayout]="'scroll'"
    dataKey="id"
    [showCurrentPageReport]="true"
    [currentPageReportTemplate]="'showingEntries' | translate"
  >
    <ng-template pTemplate="header">
      <tr>
        <th pSortableColumn="Name">
          {{ 'nationality' | translate }}
          <p-sortIcon field="Name"></p-sortIcon>
        </th>
        <th pSortableColumn="NameAr">
          {{ 'nationality in arabic' | translate }}
          <p-sortIcon field="NameAr"></p-sortIcon>
        </th>
        <th style="width: 35%">{{ 'action' | translate }}</th>
      </tr>
      <tr>
        <th>
          <p-columnFilter type="text" field="Name" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="NameAr" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th></th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-nationality>
      <tr>
        <td>{{ nationality.name }}</td>
        <td>{{ nationality.nameAr }}</td>

        <td>
          <div class="flex gap-1 justify-content-center">
            <p-button
              [raised]="true"
              icon="pi pi-pencil"
              severity="success"
              [rounded]="true"
              (onClick)="handleEdit(nationality.name, nationality.nameAr, nationality.id)"
              [pTooltip]="'edit' | translate"
              tooltipPosition="top"
            ></p-button>
            <p-button
              icon="pi pi-trash"
              severity="danger"
              [rounded]="true"
              (onClick)="handleDelete(nationality.id)"
              [pTooltip]="'delete' | translate"
              tooltipPosition="top"
            ></p-button>
          </div>
        </td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="3">
          <div class="flex flex-column align-items-center justify-content-center py-5">
            <i class="pi pi-inbox text-500 text-5xl mb-3"></i>
            <span class="text-700 font-medium text-lg">{{ 'No Data found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/settings/nationalities/nationalities-list/nationalities-list.component.scss`

```scss
// Table styling
:host ::ng-deep .p-datatable-table {
  width: 100%;
}

// Align table headings to left
:host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
  text-align: left !important;
}

// Compact filter row styling
:host ::ng-deep .p-datatable .p-datatable-thead > tr:nth-child(2) > th {
  padding: 0.25rem 0.5rem !important;
  background: #f8f9fa;
}

:host ::ng-deep .p-datatable .p-column-filter-row {
  padding: 0 !important;
}
:host ::ng-deep .p-datatable .p-column-filter-element {
  width: 100%;
}

:host ::ng-deep .p-datatable .p-column-filter-row .p-inputtext {
  padding: 0.35rem 0.5rem !important;
  font-size: 13px;
}

:host ::ng-deep .p-datatable .p-column-filter-row .p-column-filter-menu-button,
:host ::ng-deep .p-datatable .p-column-filter-row .p-column-filter-clear-button {
  width: 1.75rem !important;
  height: 1.75rem !important;
}

```

---

## `src/app/demo/pages/settings/nationalities/nationalities-list/nationalities-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NationalitiesListComponent } from './nationalities-list.component';

describe('NationalitiesListComponent', () => {
  let component: NationalitiesListComponent;
  let fixture: ComponentFixture<NationalitiesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NationalitiesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NationalitiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/nationalities/nationalities-list/nationalities-list.component.ts`

```ts
import { ConfirmationService } from 'primeng/api';
import { NationalitiesService } from './../../../../../shared/services/nationalities.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ToastrService } from 'ngx-toastr';
import { NationalitiesFormComponent } from '../nationalities-form/nationalities-form.component';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-nationalities-list',
  standalone: true,
  imports: [SharedModule],
  providers: [DialogService, ConfirmationService],
  templateUrl: './nationalities-list.component.html',
  styleUrl: './nationalities-list.component.scss'
})
export class NationalitiesListComponent implements OnInit {
  @ViewChild('dt') dt: Table;

  constructor(
    private NationalitiesService: NationalitiesService,
    private dialogService: DialogService,
    private ConfirmationService: ConfirmationService,
    private ToastrService: ToastrService
  ) {}

  nationalities: any[] = [];
  searchTerm: string = '';
  totalRecords: number = 0;
  isLoading: boolean = false;
  ref: DynamicDialogRef | undefined;

  ngOnInit(): void {}

  loadNationalities(event: TableLazyLoadEvent) {
    this.isLoading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this.NationalitiesService.getAllNationalities(payload).subscribe({
      next: (res: any) => {
        this.nationalities = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('  error:', err);
        this.nationalities = [];
        this.isLoading = false;
      }
    });
  }

  onSearch(event?: any) {
    this.dt.reset();
  }

  refresh() {
    this.dt.reset();
  }

  handleEdit(name: string, nameAr: string, id: number) {
    this.ref = this.dialogService.open(NationalitiesFormComponent, {
      header: 'nationality',
      width: '50vw',
      modal: true,
      closable: true,
      data: { id, name, nameAr },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((data) => {
      if (data) {
        this.refresh();
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
        this.NationalitiesService.deleteNationality(id).subscribe({
          next: () => {
            this.refresh();
            this.ToastrService.success(' deleted successfully', 'Success');
          },
          error: () => {
            this.ToastrService.error('Failed to delete ', 'Error');
          }
        });
      }
    });
  }
}

```

---

## `src/app/demo/pages/settings/nationalities/nationalities.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'nationalities'"
    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  ></sub-header>



  <app-nationalities-list></app-nationalities-list>
</div>

```

---

## `src/app/demo/pages/settings/nationalities/nationalities.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/nationalities/nationalities.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NationalitiesComponent } from './nationalities.component';

describe('NationalitiesComponent', () => {
  let component: NationalitiesComponent;
  let fixture: ComponentFixture<NationalitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NationalitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NationalitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/nationalities/nationalities.component.ts`

```ts
import { Component, ViewChild } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { NationalitiesListComponent } from './nationalities-list/nationalities-list.component';
import { TranslateService } from '@ngx-translate/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NationalitiesFormComponent } from './nationalities-form/nationalities-form.component';

@Component({
  selector: 'app-nationalities',
  standalone: true,
  imports: [SubHeaderComponent, NationalitiesListComponent],
  providers: [DialogService],
  templateUrl: './nationalities.component.html',
  styleUrl: './nationalities.component.scss'
})
export class NationalitiesComponent {
  isFormVisible: boolean = false;
  ref: DynamicDialogRef | undefined;
  @ViewChild(NationalitiesListComponent) NationalitiesListComponent: NationalitiesListComponent | undefined;

  handleCitiesEdit(event: boolean) {
    this.isFormVisible = event;
  }

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToNationalitiesForm();
        break;
    }
  }
  goToNationalitiesForm() {
    console.log('goToVendorForm');
    this.isFormVisible = true;

    this.ref = this.dialogService.open(NationalitiesFormComponent, {
      header: this.translate.instant('nationality'),
      width: '50vw',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });
    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.NationalitiesListComponent?.refresh();
      }
    });
  }
  constructor(
    public dialogService: DialogService,
    private translate: TranslateService
  ) {}
}

```

---

## `src/app/demo/pages/settings/permissions/permissions.component.html`

```html
<p>permissions works!</p>

```

---

## `src/app/demo/pages/settings/permissions/permissions.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/permissions/permissions.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionsComponent } from './permissions.component';

describe('PermissionsComponent', () => {
  let component: PermissionsComponent;
  let fixture: ComponentFixture<PermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/permissions/permissions.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss'
})
export class PermissionsComponent {


}

```

---

## `src/app/demo/pages/settings/roles/edti-permissions-for-role/edti-permissions-for-role.component.html`

```html
<div class="main">
  <sub-header [mainHeader]="translatedHeader" [mainSection]="'Roles'" [subSection]="'Permissions'"></sub-header>
  <div class="card">
    <p-table [value]="permissionsForRole" [tableStyle]="{ 'min-width': '40rem' }">
      <ng-template pTemplate="header">
        <tr>
          <th>{{ 'Permission' | translate }}</th>
          <th>{{ 'Allowed' | translate }}</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-permission>
        <tr>
          <td>{{ permission.displayValue }}</td>
          <td>
            <p-inputSwitch [ngModel]="permission.isSelected" (onChange)="onPermissionToggle(permission)"></p-inputSwitch>
          </td>
        </tr>
      </ng-template>
    </p-table>
  </div>
</div>

```

---

## `src/app/demo/pages/settings/roles/edti-permissions-for-role/edti-permissions-for-role.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/roles/edti-permissions-for-role/edti-permissions-for-role.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdtiPermissionsForRoleComponent } from './edti-permissions-for-role.component';

describe('EdtiPermissionsForRoleComponent', () => {
  let component: EdtiPermissionsForRoleComponent;
  let fixture: ComponentFixture<EdtiPermissionsForRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdtiPermissionsForRoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdtiPermissionsForRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/roles/edti-permissions-for-role/edti-permissions-for-role.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PermissionsService } from 'src/app/shared/services/permissions.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';

@Component({
  selector: 'app-edti-permissions-for-role',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './edti-permissions-for-role.component.html',
  styleUrl: './edti-permissions-for-role.component.scss'
})
export class EdtiPermissionsForRoleComponent implements OnInit {
  roleId: number = 0;
  roleName: string = '';
  translatedHeader: string = '';

  permissionsForRole: any[] = [];
  constructor(
    private ActivatedRoute: ActivatedRoute,
    private PermissionsService: PermissionsService,
    private ToastrService: ToastrService,
    private translate: TranslateService
  ) {}
  updateTranslatedHeader() {
    this.translatedHeader = this.translate.instant('Edit Permissions for Role:', { role: this.roleName });
  }
  fetchingparams() {
    console.log('Fetching params from route');
    this.ActivatedRoute.params.subscribe((params) => {
      console.log('Route params:', params);
      this.roleId = +params['roleId'];
      this.roleName = params['roleName'];

      console.log('Role ID from route:', this.roleId);
      console.log('Role Name from route:', this.roleName);
    });
  }
  ngOnInit(): void {
    this.updateTranslatedHeader();
    console.log('ngOnInit triggered');
    this.fetchingparams();
    if (this.roleId) {
      console.log('Fetching permissions for role ID:', this.roleId);
      this.GetPermissionsForRole(this.roleId);
    } else {
      console.error('No role ID provided in route params');
    }
    this.translate.onLangChange.subscribe(() => {
      this.updateTranslatedHeader();
    });
  }

  GetPermissionsForRole(roleId) {
    console.log('Fetching permissions for role ID:', roleId);
    this.PermissionsService.getAllPermissionsForRole(roleId).subscribe({
      next: (res) => {
        this.permissionsForRole = res.roleCalims;
        console.log('Permissions fetched successfully:', res);
        // Handle the response as needed
      },
      error: (error) => {
        console.error('Error fetching permissions:', error);
        // Handle the error as needed
      }
    });
  }

  onPermissionToggle(permission: any) {
    const payload = {
      roleId: this.roleId,
      roleCalims: [
        {
          displayValue: permission.displayValue,
          isSelected: !permission.isSelected // toggled value
        }
      ]
    };

    this.PermissionsService.addPermissionToRole(payload).subscribe({
      next: () => {
        this.ToastrService.success('Permission updated successfully');
        permission.isSelected = !permission.isSelected; // update UI
      },
      error: () => {
        this.ToastrService.error('you are not allowed to update this permission');
        this.GetPermissionsForRole(this.roleId);
        console.error('Error updating permission');
      }
    });
  }
}

```

---

## `src/app/demo/pages/settings/roles/roles-form/roles-form.component.html`

```html
<form [formGroup]="roleForm" (ngSubmit)="onSubmit()" class="p-fluid p-formgrid grid mb-4">
  <div class="field col-12 md:col-6">
    <label for="name">{{ 'Name' | translate }}</label>
    <input pInputText id="name" formControlName="name" [placeholder]="'Enter role name' | translate" />
    <small *ngIf="getControl('name')?.invalid && getControl('name')?.touched" class="p-error">
      {{ 'Name is required' | translate }}
    </small>
  </div>

  <div class="field col-12 md:col-6">
    <label for="roleType">{{ 'Role Type' | translate }}</label>
    <p-dropdown
      id="roleType"
      formControlName="roleType"
      [options]="roleTypes"
      [placeholder]="'Select Role' | translate"
      optionLabel="label"
      optionValue="value"
      appendTo="body">
    </p-dropdown>
    <small *ngIf="getControl('roleType')?.invalid && getControl('roleType')?.touched" class="p-error">
      {{ 'Role Type is required' | translate }}
    </small>
  </div>

</form>
<div class="buttons mb-3 text-end">
  <p-button label="{{ 'Cancel' | translate }}" class="mx-1" severity="secondary" (onClick)="onCancel()"></p-button>
  <p-button label="{{ 'save' | translate }}" severity="success" icon="pi pi-save" (onClick)="onSubmit()"></p-button>
</div>

```

---

## `src/app/demo/pages/settings/roles/roles-form/roles-form.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/roles/roles-form/roles-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesFormComponent } from './roles-form.component';

describe('RolesFormComponent', () => {
  let component: RolesFormComponent;
  let fixture: ComponentFixture<RolesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/roles/roles-form/roles-form.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { RolesService } from 'src/app/shared/services/roles.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-roles-form',
  standalone: true,
  imports: [SharedModule],
  providers: [ToastrService],
  templateUrl: './roles-form.component.html',
  styleUrl: './roles-form.component.scss'
})
export class RolesFormComponent implements OnInit {
  roleForm!: FormGroup;
  roleTypes = [
    { label: 'Admin', value: 1 },
    { label: 'vendor', value: 2 },
    { label: 'User', value: 3 } ,
    {label:'Security',value:4}
  ];
  constructor(
    private fb: FormBuilder,
    private RolesService: RolesService,
    private toaster:ToastrService,
    public ref: DynamicDialogRef
  ) {}

  ngOnInit(): void {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      roleType: [null, Validators.required]
    });
  }
onSubmit(): void {
  if (this.roleForm.valid) {
    const formValue = this.roleForm.value;

    const formData = new FormData();
    formData.append('name', formValue.name);
    formData.append('roleType', formValue.roleType);

    this.RolesService.addRole(formData).subscribe({
      next: (res) => {
        this.toaster.success('Role added successfully');
        this.ref.close(res);
      },
      error: (err) => {
        this.toaster.error('Failed to add role');
      }
    });
  } else {
    this.roleForm.markAllAsTouched();
  }
}

  getControl(controlName: string) {
    return this.roleForm.get(controlName);
  }
  onCancel() {
    this.ref.close();
  }
}

```

---

## `src/app/demo/pages/settings/roles/roles-list/roles-list.component.html`

```html
<p-confirmDialog></p-confirmDialog>

<div class="card">
  <p-table [value]="roles" [tableStyle]="{ 'min-width': '50rem' }">
    <ng-template pTemplate="header">
      <tr>
        <th>{{ 'Id' | translate }}</th>
        <th>{{ 'role Name' | translate }}</th>
        <th>{{ 'permissions' | translate }}</th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-roles>
      <tr>
        <td>{{ roles.id }}</td>
        <td>{{ roles.name }}</td>
        <td>
          <!-- <p-button
            [raised]="true"
            icon="pi pi-trash"
            severity="danger"
            [rounded]="true"
            class="mx-2"
            (onClick)="deleteRole(roles.id)"
          ></p-button>
          <p-button [raised]="true" icon="pi pi-pencil" severity="success" [rounded]="true" class="mx-2"></p-button> -->
          <p-button
          [pTooltip]="'view permissions' | translate"
            icon="pi pi-eye"
            severity="info"
            [rounded]="true"
            class="mx-2"
            (onClick)="navigateToPermissions(roles.id, roles.name)"
          ></p-button>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/settings/roles/roles-list/roles-list.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/roles/roles-list/roles-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesListComponent } from './roles-list.component';

describe('RolesListComponent', () => {
  let component: RolesListComponent;
  let fixture: ComponentFixture<RolesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/roles/roles-list/roles-list.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Iroles } from 'src/app/shared/model/iroles';
import { RolesService } from 'src/app/shared/services/roles.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [SharedModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.scss'
})
export class RolesListComponent implements OnInit {
  constructor(
    private RolesService: RolesService,
    private confirmationService: ConfirmationService,
    private toaster: ToastrService,
    private router: Router
  ) {}
  roles: Iroles[] = [];
  ngOnInit(): void {
    this.gettingAllRoles();
  }
  gettingAllRoles() {
    this.RolesService.getAllRoles().subscribe({
      next: (res) => {
        this.roles = res.data;
      },
      error: (error) => {
        console.error('Error fetching roles:', error);
      }
    });
  }
  confirmDelete(roleId: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this role?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => this.deleteRole(roleId)
    });
  }

  deleteRole(roleId: number) {
    this.RolesService.deleteRole(roleId).subscribe({
      next: () => {
        this.toaster.success('Role deleted successfully');
        this.gettingAllRoles();
      },
      error: () => this.toaster.error('Failed to delete role')
    });
  }
  navigateToPermissions(roleId: number , roleName): void {
    this.router.navigate(['/edit-permissions', roleId , roleName] );
  }
}

```

---

## `src/app/demo/pages/settings/roles/roles.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'roles'"
    [actionButtons]="!isVendor()?[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]:[]"
    (actionClicked)="handleAction($event)"
  ></sub-header>
  <app-roles-list></app-roles-list>
</div>

```

---

## `src/app/demo/pages/settings/roles/roles.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/roles/roles.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesComponent } from './roles.component';

describe('RolesComponent', () => {
  let component: RolesComponent;
  let fixture: ComponentFixture<RolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/roles/roles.component.ts`

```ts
import { Component, ViewChild } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { Router } from '@angular/router';
import { RolesListComponent } from './roles-list/roles-list.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RolesFormComponent } from './roles-form/roles-form.component';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, RolesListComponent],
  providers: [DialogService],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent {
  ref: DynamicDialogRef;
  @ViewChild(RolesListComponent) rolesListComponent!: RolesListComponent;

  constructor(
    private router: Router,
    private dialogService: DialogService ,
    private ConfigureService: ConfigureService
  ) {}
  // This method opens the dialog for adding a new role but doesnt work noe
  //add this in sub header {    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
  //  (actionClicked)="handleAction($event)"}
  openRoleFormDialog() {
    this.ref = this.dialogService.open(RolesFormComponent, {
      header: 'Add Role',
      width: '40%',
      closable: true,
      dismissableMask: true
    });

    this.ref.onClose.subscribe((data) => {
      if (data) {
        console.log('Dialog returned data:', data);
        this.rolesListComponent.gettingAllRoles();
      }
    });
  }
  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.openRoleFormDialog();
        break;
    }
  }
  isVendor(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }
}

```

---

## `src/app/demo/pages/settings/room-features/room-features-form/room-features-form.component.html`

```html
<div class="product-form p-4 mb-4">
  <p-toast></p-toast> <!-- Add toast for success/error messages -->

  <div class="form-field">
    <form [formGroup]="roomFeatureForm" (ngSubmit)="onSubmit()">
      <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
        <div class="field col">
          <label for="name">
            {{ 'room feature' | translate }}
            <small *ngIf="roomFeatureForm.get('name')?.invalid && (roomFeatureForm.get('name')?.touched || roomFeatureForm.get('name')?.dirty)" class="text-danger">*</small>
          </label>

          <input type="text" pInputText id="name" formControlName="name" />

          <!-- Error message for required field -->
          <small class="error" *ngIf="roomFeatureForm.get('name')?.hasError('required') && (roomFeatureForm.get('name')?.touched || roomFeatureForm.get('name')?.dirty)">
            * {{ 'required' | translate }}
          </small>
        </div>
      </div>

      <!-- Buttons -->
      <div class="buttons mt-3 text-end">
        <p-button
          label="{{ 'Cancel' | translate }}"
          class="mx-1"
          severity="secondary"
          (onClick)="onCancel()"
          [disabled]="isLoading"
        ></p-button>
        <p-button
          type="submit"
          label="{{ 'save' | translate }}"
          severity="success"
          icon="pi pi-save"
          [disabled]="roomFeatureForm.invalid || isLoading"
          [loading]="isLoading"
        ></p-button>
      </div>
    </form>
  </div>
</div>

```

---

## `src/app/demo/pages/settings/room-features/room-features-form/room-features-form.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/room-features/room-features-form/room-features-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomFeaturesFormComponent } from './room-features-form.component';

describe('RoomFeaturesFormComponent', () => {
  let component: RoomFeaturesFormComponent;
  let fixture: ComponentFixture<RoomFeaturesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomFeaturesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomFeaturesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/room-features/room-features-form/room-features-form.component.ts`

```ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RoomFeaturiesService } from 'src/app/shared/services/room-featuries.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-room-features-form',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './room-features-form.component.html',
  styleUrl: './room-features-form.component.scss',
  providers: [MessageService] // Provide MessageService for toast
})
export class RoomFeaturesFormComponent {
  roomFeatureForm: FormGroup;
  isLoading = false; // Track loading state

  constructor(
    private fb: FormBuilder,
    private RoomFeaturiesService: RoomFeaturiesService, // Renamed for consistency
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef, // Inject DynamicDialogRef
    private messageService: MessageService // For toast notifications
  ) {}

  ngOnInit(): void {
    this.createRFForm();
    if (this.config.data) {
      console.log('Received data:', this.config.data);
      this.handleEdit();
    }
  }

  createRFForm() {
    this.roomFeatureForm = this.fb.group({
      name: ['', Validators.required] // Add validation if required
    });
  }

  handleEdit() {
    if (this.config.data) {
      this.roomFeatureForm.patchValue({
        name: this.config.data.name || ''
      });
      console.log('Editing  type:', this.config.data.name);
    }
  }

  onSubmit() {
    if (this.roomFeatureForm.valid) {
      this.isLoading = true; // Show loading state
      if (this.config.data && this.config.data.id) {
        // Update operation
        this.RoomFeaturiesService.updateRoomFeature(this.config.data.id, this.roomFeatureForm.get('name').value).subscribe({
          next: (res) => {
            this.isLoading = false;

            this.ref.close(res); // Close dialog and pass data
          },
          error: (err) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update bed type'
            });
            console.error('Update error:', err);
          }
        });
      } else {
        // Create operation
        this.RoomFeaturiesService.sendRoomFeature(this.roomFeatureForm.value).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Bed type created successfully'
            });
            this.ref.close(this.roomFeatureForm.value); // Close dialog and pass data
          },
          error: (err) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create bed type'
            });
            console.error('Create error:', err);
          }
        });
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Form',
        detail: 'Please fill in all required fields'
      });
      console.log('Form is invalid');
    }
  }

  onCancel() {
    this.ref.close(); // Close dialog without data
  }
}

```

---

