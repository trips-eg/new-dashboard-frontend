# 05 – Misc (Part 4/17 of Misc)

> **Description:** Everything else that didn't fit the categories above. [Category: C02]
> **Generated:** 2026-03-02 20:16:48

---

## `src/app/demo/pages/hotels/hotels-list/hotels-list.component.html`

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
    [value]="hotels"
    [paginator]="true"
    [rows]="10"
    [lazy]="true"
    [showCurrentPageReport]="true"
    [totalRecords]="totalRecords"
    (onLazyLoad)="loadHotels($event)"
    [currentPageReportTemplate]="'showingEntries' | translate"
    [rowsPerPageOptions]="[5, 10, 25, 50]"
    [loading]="loading"
    [rowHover]="true"
    styleClass="p-datatable-gridlines"
    responsiveLayout="scroll"
  >
    <ng-template pTemplate="header">
      <tr>
        <th pSortableColumn="name" style="width: 20%">
          {{ 'hotelName' | translate }}
          <p-sortIcon field="name"></p-sortIcon>
        </th>
        <th pSortableColumn="countryName" style="width: 20%">
          {{ 'country' | translate }}
          <p-sortIcon field="countryName"></p-sortIcon>
        </th>
        <th pSortableColumn="cityName" style="width: 20%">
          {{ 'city' | translate }}
          <p-sortIcon field="cityName"></p-sortIcon>
        </th>
        <th style="width: 20%" pSortableColumn="rating">
          {{ 'stars' | translate }}
          <p-sortIcon field="rating"></p-sortIcon>
        </th>
        <th style="width: 20%" pSortableColumn="status">
          {{ 'status' | translate }}
          <p-sortIcon field="status"></p-sortIcon>
        </th>
        <th style="width: 20%">{{ 'actions' | translate }}</th>
      </tr>
      <tr>
        <th>
          <p-columnFilter type="text" field="name" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="countryName" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="cityName" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="rating" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th></th>
        <th></th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-hotel>
      <tr>
        <td>{{ hotel.name }}</td>
        <td>{{ hotel.countryName }}</td>
        <td>{{ hotel.cityName }}</td>
        <td><p-rating [(ngModel)]="hotel.rating" [readonly]="true" [cancel]="false" /></td>
        <td>
          <p-inputSwitch [(ngModel)]="hotel.status" (onChange)="toggleHotelStatus(hotel.id, hotel.status)"></p-inputSwitch>
        </td>
        <td>
          <div class="flex gap-1 justify-content-center">
            <p-button
              icon="pi pi-eye"
              severity="info"
              [rounded]="true"
              [routerLink]="['/hotel-details', hotel.id]"
              [pTooltip]="'view' | translate"
              tooltipPosition="top"
              appendTo="body"
            ></p-button>
            <p-button
              icon="pi pi-pencil"
              severity="success"
              [rounded]="true"
              [routerLink]="['/hotels-form', hotel.id]"
              [pTooltip]="'edit' | translate"
              tooltipPosition="top"
              appendTo="body"
            ></p-button>
            <p-button
              icon="pi pi-trash"
              severity="danger"
              [rounded]="true"
              [pTooltip]="'delete' | translate"
              tooltipPosition="top"
              appendTo="body"
              (click)="deleteHotel(hotel.id)"
            ></p-button>
          </div>
        </td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="6">
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

## `src/app/demo/pages/hotels/hotels-list/hotels-list.component.scss`

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

## `src/app/demo/pages/hotels/hotels-list/hotels-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelsListComponent } from './hotels-list.component';

describe('HotelsListComponent', () => {
  let component: HotelsListComponent;
  let fixture: ComponentFixture<HotelsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/hotels/hotels-list/hotels-list.component.ts`

```ts
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

```

---

## `src/app/demo/pages/hotels/hotels.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'hotels'| translate"
    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  ></sub-header>
  <app-hotels-list></app-hotels-list>
</div>

```

---

## `src/app/demo/pages/hotels/hotels.component.scss`

```scss

```

---

## `src/app/demo/pages/hotels/hotels.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelsComponent } from './hotels.component';

describe('HotelsComponent', () => {
  let component: HotelsComponent;
  let fixture: ComponentFixture<HotelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/hotels/hotels.component.ts`

```ts
import { Component } from '@angular/core';
import { SubHeaderComponent } from '../../../shared/components/sub-header/sub-header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { HotelsListComponent } from './hotels-list/hotels-list.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [SubHeaderComponent, HotelsListComponent, SharedModule],
  templateUrl: './hotels.component.html',
  styleUrl: './hotels.component.scss'
})
export class HotelsComponent {
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToVendorForm();
        break;
    }
  }

  goToVendorForm() {
    console.log('goToVendorForm');
    this.router.navigate(['/hotels-form']);
  }
}

```

---

## `src/app/demo/pages/hotels/rooms/add-edit-room/add-edit-room.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="isEditing ? ('Edit Room' | translate) : ('Add Room' | translate)"
    [mainSection]="'Rooms' | translate"
    [subSection]="isEditing ? ('Edit' | translate) : ('Add' | translate)"
  ></sub-header>

  <div class="product-form shadow-3 p-4">
    <form [formGroup]="roomForm" (ngSubmit)="onSubmit()">
      <!-- Room Info Panel -->
      <p-panel header="{{ 'Room Info' | translate }}" toggleable styleClass="custom-panel mt-3">
        <div class="formgrid grid">
          <h3 class="flex justify-content-between">
            {{ 'Room Info' | translate }}
          </h3>
          <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
            <!-- Hotel Name -->
            <div class="field col-12 col-md-4">
              <label for="hotelName">
                {{ 'hotel name' | translate }}
              </label>
              <p-dropdown
                id="hotelName"
                [options]="hotels"
                formControlName="HotelId"
                optionLabel="name"
                optionValue="id"
                [filter]="true"
                (onFilter)="onHotelFilter($event)"
                placeholder="{{ '-- Select --' | translate }}"
                [showClear]="true"
                class="w-full"
                appendTo="body"
              ></p-dropdown>
              <div class="text-danger" *ngIf="shouldShowError('HotelId')">
                {{ 'Please select a hotel' | translate }}
              </div>
            </div>

            <!-- Room Name -->
            <div class="field col-12 col-md-4">
              <label for="roomName">
                {{ 'room name' | translate }}
              </label>
              <input type="text" pInputText id="roomName" formControlName="Name" />
              <div class="text-danger" *ngIf="shouldShowError('Name')">
                {{ 'Please enter a room name' | translate }}
              </div>
            </div>

            <!-- Boarding -->
            <div class="field col-12 col-md-4">
              <label for="boarding">{{ 'Boarding' | translate }}</label>
              <!-- <input type="text" pInputText id="boarding" formControlName="Boarding" /> -->
              <p-dropdown
                [options]="boardingTypes"
                formControlName="Boarding"
                placeholder="Select a boarding Types"
                [editable]="true"
                optionLabel="nameEn"
                optionValue="nameEn"
              />
              <div class="text-danger" *ngIf="shouldShowError('Boarding')">
                {{ 'Please enter boarding' | translate }}
              </div>
            </div>

            <!-- Room Features -->
            <div class="field col-12 col-md-4">
              <label for="features">
                {{ 'Room Features' | translate }}
              </label>
              <p-multiSelect
                id="features"
                [options]="roomFeaturies"
                optionLabel="name"
                optionValue="id"
                [filter]="true"
                (onFilter)="onHotelFilter($event)"
                placeholder="{{ 'Select Features' | translate }}"
                formControlName="Features"
                styleClass="w-100"
              ></p-multiSelect>
              <div *ngIf="shouldShowError('Features')" class="p-error mt-1">
                {{ 'Please select at least one feature' | translate }}
              </div>
            </div>

            <!-- Room Type -->
            <div class="field col-12 col-md-4">
              <label for="type">
                {{ 'Room Type' | translate }}
              </label>
              <p-dropdown
                id="type"
                [options]="roomTybies"
                formControlName="RoomTypeId"
                optionLabel="name"
                optionValue="id"
                [filter]="true"
                (onFilter)="onRoomTybeFilter($event)"
                placeholder="{{ '-- Select --' | translate }}"
                [showClear]="true"
                class="w-full"
              ></p-dropdown>
              <div class="text-danger" *ngIf="shouldShowError('RoomTypeId')">
                {{ 'Please select a room type' | translate }}
              </div>
            </div>

            <!-- Room Size -->
            <div class="field col-12 col-md-4 p-fluid">
              <label for="roomSize">{{ 'Room Size' | translate }}</label>
              <p-inputNumber
                mode="decimal"
                [showButtons]="true"
                buttonLayout="horizontal"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                decrementButtonClass="p-button-danger"
                incrementButtonClass="p-button-success"
                inputId="roomSize"
                id="roomSize"
                formControlName="Size"
                placeholder="{{ 'Room size' | translate }}"
                [min]="0"
                suffix="m²"
              />
              <div class="text-danger" *ngIf="shouldShowError('Size')">
                {{ 'Please enter room size' | translate }}
              </div>
            </div>

            <!-- Bed Type -->
            <div class="field col-12 col-md-6">
              <label for="bedType">
                {{ 'Bed Type' | translate }}
              </label>
              <p-dropdown
                id="bedType"
                [options]="bedTybies"
                formControlName="BedTypeId"
                optionLabel="name"
                optionValue="id"
                [filter]="true"
                (onFilter)="onbedFilter($event)"
                placeholder="{{ '-- Select --' | translate }}"
                [showClear]="true"
                class="w-full"
              ></p-dropdown>
              <div class="text-danger" *ngIf="shouldShowError('BedTypeId')">
                {{ 'Please select a bed type' | translate }}
              </div>
            </div>

            <!-- Bed Count -->
            <div class="field col-12 col-md-6">
              <label for="bedCount">
                {{ 'Bed count' | translate }}
              </label>
              <p-inputNumber
                mode="decimal"
                [showButtons]="true"
                buttonLayout="horizontal"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
                decrementButtonClass="p-button-danger"
                incrementButtonClass="p-button-success"
                inputId="bedCount"
                id="bedCount"
                formControlName="BedCount"
                placeholder="{{ 'Bed No.' | translate }}"
                [min]="1"
                [max]="100"
              />
              <div class="text-danger" *ngIf="shouldShowError('BedCount')">
                {{ 'Please enter bed count' | translate }}
              </div>
            </div>

            <!-- Available From -->
            <div class="field col-12 col-md-6">
              <label for="availableFrom">
                {{ 'Available From' | translate }}
              </label>
              <p-calendar
                id="availableFrom"
                showIcon="true"
                dateFormat="dd-mm-yy"
                formControlName="AvailableFrom"
                [iconDisplay]="'input'"
              />
              <div class="text-danger" *ngIf="shouldShowError('AvailableFrom')">
                {{ 'Please select available from date' | translate }}
              </div>
            </div>

            <!-- Available To -->
            <div class="field col-12 col-md-6">
              <label for="availableTo">
                {{ 'Available To' | translate }}
              </label>
              <p-calendar id="availableTo" formControlName="AvailableTo" showIcon="true" dateFormat="dd-mm-yy" [iconDisplay]="'input'" />
              <div class="text-danger" *ngIf="shouldShowError('AvailableTo')">
                {{ 'Please select available to date' | translate }}
              </div>
            </div>

            <!-- Description -->
            <div class="field col-12">
              <label for="Description">
                {{ 'Description' | translate }}
              </label>
              <p-editor id="Description" formControlName="Description" [style]="{ height: '150px' }"></p-editor>
              <div *ngIf="shouldShowError('Description')" class="text-danger">
                {{ 'Please provide a description' | translate }}
              </div>
            </div>
            <!-- Room Image -->
            <div class="field col-12">
              <label>{{ 'room imgs' | translate }}</label>
              <app-img-uploader
                [multiple]="true"
                (filesChanged)="onOtherImagesUpload($event)"
                [displayFiles]="displayFilesForUploader"
              ></app-img-uploader>
            </div>
          </div>
        </div>
      </p-panel>

      <!-- Pricing Panel -->
      <p-panel header="{{ 'Pricing' | translate }}" toggleable styleClass="custom-panel mt-3">
        <div class="formgrid grid">
          <h3 class="flex justify-content-between w-100">
            {{ 'pricing' | translate }}
            <span class="flex align-items-center gap-2">
              <label class="h6">{{ 'including vat' | translate }}</label>
              <p-inputSwitch formControlName="IsIncludeVate"></p-inputSwitch>
            </span>
          </h3>
          <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
            <!--base Price -->
            <div class="field col-12 col-md-4">
              <label for="price">
                {{ 'base Price' | translate }}
              </label>
              <input id="Price" formControlName="Price" type="number" pInputText />
              <div class="text-danger" *ngIf="shouldShowError('Price')">
                {{ 'Please enter a price' | translate }}
              </div>
            </div>
            <!--holiday Price -->
            <div class="field col-12 col-md-4">
              <label for="price">
                {{ 'holiday Price' | translate }}
              </label>
              <input id="price" formControlName="HolidayPrice" type="number" pInputText />
              <div class="text-danger" *ngIf="shouldShowError('HolidayPrice')">
                {{ 'Please enter a price' | translate }}
              </div>
            </div>
            <!--child Price -->
            <div class="field col-12 col-md-4">
              <label for="hotelStars">
                {{ 'child price' | translate }}
                <span class="p-error">*</span>
              </label>
              <input formControlName="ChildPrice" [min]="1" type="number" pInputText />
            </div>
            <!--Price Before -->
            <div class="field col-12 col-md-4">
              <label for="priceBefore">
                {{ 'Price Before' | translate }}
              </label>
              <input formControlName="PriceBefore" [min]="0" type="number" pInputText />
            </div>

            <!-- custom price -->
            <div formArrayName="CustomPrices" class="col-12">
              <div
                *ngFor="let priceGroup of customPrices.controls; let i = index"
                [formGroupName]="i"
                class="formgrid grid border p-3 mb-3"
              >
                <!-- Price -->
                <div class="field col-12 col-md-4">
                  <label for="price">{{ 'Custom Price' | translate }}</label>
                  <p-inputNumber id="price" formControlName="price" inputId="customPrice{{ i }}" />
                  <div class="text-danger" *ngIf="shouldShowError('customPrices', i, 'price')">
                    {{ 'Please enter a price' | translate }}
                  </div>
                </div>

                <!-- From -->
                <div class="field col-12 col-md-4">
                  <label for="availableFrom">{{ 'From' | translate }}</label>
                  <p-calendar formControlName="from" dateFormat="dd-mm-yy" showIcon="true" [iconDisplay]="'input'"></p-calendar>
                  <div class="text-danger" *ngIf="shouldShowError('customPrices', i, 'from')">
                    {{ 'Please select available from date' | translate }}
                  </div>
                </div>

                <!-- To -->
                <div class="field col-12 col-md-4">
                  <label for="availableTo">{{ 'To' | translate }}</label>
                  <p-calendar dateFormat="dd-mm-yy" formControlName="to" showIcon="true" [iconDisplay]="'input'"></p-calendar>
                  <div class="text-danger" *ngIf="shouldShowError('customPrices', i, 'to')">
                    {{ 'Please select available to date' | translate }}
                  </div>
                </div>

                <!-- Remove Button -->
                <div class="col-12 text-end mt-2">
                  <p-button
                    label="{{ 'Remove' | translate }}"
                    icon="pi pi-trash"
                    class="p-button-danger"
                    (onClick)="removeCustomPrice(i)"
                    *ngIf="customPrices.length > 1"
                  ></p-button>
                </div>
              </div>

              <!-- Add New Custom Price -->
              <div class="mt-3">
                <p-button label="{{ 'Add Custom Price' | translate }}" icon="pi pi-plus" class="" (onClick)="addCustomPrice()"></p-button>
              </div>
            </div>
          </div>
        </div>
      </p-panel>

      <!-- Policy Panel -->
      <p-panel header="{{ 'policies' | translate }}" toggleable styleClass="custom-panel mt-3 w-full">
        <!-- Refund Policy -->
        <h3 class="flex justify-content-between align-items-center">
          <span>{{ 'is refund enabled' | translate }}</span>
          <span><p-inputSwitch formControlName="IsRefundable" /></span>
        </h3>

        <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round" *ngIf="roomForm.get('IsRefundable')?.value">
          <div class="field col-12 col-md-6 mx-auto">
            <label for="MinimumDaysToRefund">
              {{ 'Minimum Days To Refund' | translate }}
            </label>
            <p-inputNumber
              mode="decimal"
              inputId="MinimumDaysToRefund"
              id="MinimumDaysToRefund"
              formControlName="MinimumDaysToRefund"
              [min]="1"
            />
            <div class="text-danger" *ngIf="shouldShowError('MinimumDaysToRefund')">
              {{ 'Please enter minimum days to refund' | translate }}
            </div>
          </div>
        </div>

        <!-- Payment Policy -->
        <h3 class="flex justify-content-between align-items-center mt-4">
          <span>{{ 'pay in hotel' | translate }}</span>
          <span><p-inputSwitch formControlName="IsAllowPaymentUponArrival" /></span>
        </h3>

        <div
          class="formgrid grid p-3 border-1 border-dashed surface-border border-round"
          *ngIf="roomForm.get('IsAllowPaymentUponArrival')?.value"
        >
          <div class="field col-12 col-md-6 mx-auto">
            <label for="depositRate">
              {{ 'depositRate' | translate }}
            </label>
            <p-inputNumber
              mode="decimal"
              inputId="depositRate"
              id="depositRate"
              formControlName="depositRate"
              [min]="0"
              [max]="100"
              suffix="%"
            />
            <div class="text-danger" *ngIf="shouldShowError('depositRate')">
              {{ 'Please enter deposit rate (0-100%)' | translate }}
            </div>
          </div>
        </div>

        <!-- Cancellation Policy -->
        <h3 class="flex justify-content-between mt-4">
          {{ 'Cancellation policies' | translate }}
        </h3>
        <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
          <div class="field col-12">
            <label for="cancellationPolicy">
              {{ 'Cancellation Policy' | translate }}
            </label>
            <p-editor id="cancellationPolicy" formControlName="CancellationPolicy" [style]="{ height: '150px' }"></p-editor>
            <div *ngIf="shouldShowError('CancellationPolicy')" class="text-danger">
              {{ 'Please provide cancellation policy' | translate }}
            </div>
          </div>
        </div>
      </p-panel>

      <!-- Action Buttons -->
      <div class="buttons mt-4 text-end">
        <p-button label="{{ 'Cancel' | translate }}" class="mx-1" severity="secondary" (onClick)="onCancel()"></p-button>
        <p-button label="{{ 'Save' | translate }}" severity="success" class="shadow" icon="pi pi-save" type="submit"></p-button>
      </div>

      <!-- Error Message -->
      <!-- <div *ngIf="roomForm.invalid && submitted" class="alert alert-danger mt-3 p-3 border border-danger">
        <strong>{{ 'Error' | translate }}:</strong>
        {{ 'Please fill out all required fields correctly' | translate }}
      </div> -->
    </form>
  </div>
</div>

```

---

## `src/app/demo/pages/hotels/rooms/add-edit-room/add-edit-room.component.scss`

```scss






```

---

## `src/app/demo/pages/hotels/rooms/add-edit-room/add-edit-room.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditRoomComponent } from './add-edit-room.component';

describe('AddEditRoomComponent', () => {
  let component: AddEditRoomComponent;
  let fixture: ComponentFixture<AddEditRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditRoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/hotels/rooms/add-edit-room/add-edit-room.component.ts`

```ts
import { Component, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AccordionModule } from 'primeng/accordion';
import { MessageService } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';
import { IbedTybies } from 'src/app/shared/model/ibed-tybies';
import { Ihotel } from 'src/app/shared/model/ihotel';
import { IroomFeaturies } from 'src/app/shared/model/iroom-featuries';
import { IroomTypies } from 'src/app/shared/model/iroom-typies';
import { BedTybeService } from 'src/app/shared/services/bed-tybe.service';
import { EnumsService } from 'src/app/shared/services/enums.service';
import { HotelService } from 'src/app/shared/services/hotel.service';
import { RoomFeaturiesService } from 'src/app/shared/services/room-featuries.service';
import { RoomTybeService } from 'src/app/shared/services/room-tybe.service';
import { RoomService } from 'src/app/shared/services/room.service';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-add-edit-room',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, AccordionModule, PanelModule, ImgUploaderComponent],
  templateUrl: './add-edit-room.component.html',
  styleUrls: ['./add-edit-room.component.scss']
})
export class AddEditRoomComponent {
  roomForm: FormGroup;
  submitted = false;
  roomTybies: IroomTypies[] = [];
  hotels: Ihotel[] = [];
  bedTybies: IbedTybies[] = [];
  roomFeaturies: IroomFeaturies[] = [];
  isEditing = false;
  roomId: string | null = null;
  displayFilesForUploader: any[] = [];
  vendorId = this.ConfigureService.UserId();
  boardingTypes: any[] = [];

  first = 0;
  rows = 10;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private _HotelService: HotelService,
    private translate: TranslateService,
    private _RoomTybeService: RoomTybeService,
    private _RoomService: RoomService,
    private _BedTybeService: BedTybeService,
    private _RoomFeaturiesService: RoomFeaturiesService,
    private ToastrService: ToastrService,
    private ConfigureService: ConfigureService,
    private enums: EnumsService
  ) {}

  ngOnInit(): void {
    this.gettingAllHotels(this.first, this.rows);
    this.getingAllBedTybies(this.first, this.rows);
    this.gettingAllRoomTybes(this.first, this.rows);
    this.getingAllRoomFeaturies(this.first, this.rows);
    this.getBoardingTypes();
    console.log(this.vendorId);

    this.roomId = this.route.snapshot.paramMap.get('id');
    debugger;
    if (this.roomId) {
      this.isEditing = true;
      this.roomForm = this.buildEmptyForm(); // Build form after setting isEditing

      this.loadRoomData(this.roomId);
    } else {
      this.isEditing = false;
      this.roomForm = this.buildEmptyForm(); // Build form after setting isEditing
    }
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

  getBoardingTypes() {
    this.enums.getBoardingTypes().subscribe({
      next: (res: any) => {
        this.boardingTypes = res;
      },
      error: (err) => {
        console.error('Error fetching boarding types:', err);
      }
    });
  }

  buildEmptyForm(): FormGroup {
    const form = this.fb.group({
      Id: [this.vendorId],
      Description: ['', Validators.required],
      Size: [0, [Validators.required, Validators.min(1)]],
      BedCount: [0, [Validators.required, Validators.min(1)]],
      Price: [0, [Validators.required, Validators.min(1)]],
      ChildPrice: [0, Validators.required],
      HolidayPrice: [0],
      PriceBefore: [null], // Added PriceBefore field
      Name: ['', Validators.required],
      CancellationPolicy: ['', Validators.required],
      IsRefundable: [false],
      MinimumDaysToRefund: [0],
      IsAllowPaymentUponArrival: [false],
      depositRate: [100],
      AvailableFrom: ['', Validators.required],
      AvailableTo: ['', Validators.required],
      Boarding: ['', Validators.required],
      HotelId: [0, [Validators.required, Validators.min(1)]],
      RoomTypeId: [0, [Validators.required, Validators.min(1)]],
      BedTypeId: [0, [Validators.required, Validators.min(1)]],
      IsIncludeVate: [false, Validators.required],
      Features: [[], Validators.required],
      CustomPrices: this.fb.array([this.createCustomPriceGroup()])
    });

    this.setupConditionalValidation(form);
    return form;
  }

  otherImages: File[] = [];
  onOtherImagesUpload(files: File[]): void {
    this.otherImages = files || [];
  }

  setupConditionalValidation(form: FormGroup): void {
    // Refundable validation
    form.get('IsRefundable')?.valueChanges.subscribe((isRefundable) => {
      const minimumDaysControl = form.get('MinimumDaysToRefund');
      if (isRefundable) {
        minimumDaysControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        minimumDaysControl?.clearValidators();
        minimumDaysControl?.setValue(0);
      }
      minimumDaysControl?.updateValueAndValidity();
    });

    // Payment on arrival validation
    form.get('IsAllowPaymentUponArrival')?.valueChanges.subscribe((isAllowed) => {
      const depositRateControl = form.get('depositRate');
      if (isAllowed) {
        depositRateControl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      } else {
        depositRateControl?.clearValidators();
        depositRateControl?.setValue('');
      }
      depositRateControl?.updateValueAndValidity();
    });
  }

  createCustomPriceGroup(): FormGroup {
    return this.fb.group({
      id: [null], // مهم علشان لو بتعدل أو تبعت ID للباك
      from: [null],
      to: [null],
      price: [null]
    });
  }

  get customPrices(): FormArray {
    return this.roomForm.get('CustomPrices') as FormArray;
  }

  addCustomPrice(): void {
    this.customPrices.push(this.createCustomPriceGroup());
  }

  removeCustomPrice(index: number): void {
    this.customPrices.removeAt(index);
  }

  fillFormData(data: any): void {
    this.roomForm.patchValue({
      Id: data.id || 0,
      Name: data.name || '',
      Description: data.description || '',
      Size: data.size || 0,
      BedCount: data.bedCount || 0,
      Price: data.price || 0,
      HolidayPrice: data.holidayPrice || 0,
      ChildPrice: data.childPrice,
      PriceBefore: data.priceBefore || null, // Added PriceBefore field
      CancellationPolicy: data.cancellationPolicy || '',
      IsRefundable: data.isRefundable || false,
      MinimumDaysToRefund: data.minimumDaysToRefund || null,
      IsAllowPaymentUponArrival: data.isAllowPaymentUponArrival || false,
      depositRate: data.depositRate || 0,
      Boarding: data.boarding || '',
      AvailableFrom: data.availableFrom ? new Date(data.availableFrom) : null,
      AvailableTo: data.availableTo ? new Date(data.availableTo) : null,
      HotelId: data.hotelId || 0,
      RoomTypeId: data.roomTypeId || 0,
      BedTypeId: data.bedTypeId || 0,
      IsIncludeVate: data.isIncludeVate || false,
      Features: data.features ? data.features.map((f) => f.id) : []
    });

    // تعبئة الـ CustomPrices مع id
    if (data.customPrice && data.customPrice.length > 0) {
      this.customPrices.clear();
      data.customPrice.forEach((price: any) => {
        const priceGroup = this.createCustomPriceGroup();
        priceGroup.patchValue({
          id: price.id || null,
          from: price.from ? new Date(price.from) : null,
          to: price.to ? new Date(price.to) : null,
          price: price.price || 0
        });
        this.customPrices.push(priceGroup);
      });
    } else {
      this.customPrices.clear();
      this.customPrices.push(this.createCustomPriceGroup());
    }

    this.roomForm.get('IsRefundable')?.updateValueAndValidity({ emitEvent: true });
    this.roomForm.get('IsAllowPaymentUponArrival')?.updateValueAndValidity({ emitEvent: true });
  }

  loadRoomData(id: string): void {
    this._RoomService.getRoomById(id).subscribe({
      next: (res) => {
        const roomData = res?.data;
        if (roomData) {
          this.fillFormData(roomData);

          // Prepare images for the uploader component
          this.displayFilesForUploader = roomData.images;
          // .map((imageUrl: string) => ({
          //   imagePath: imageUrl,
          //   imageId: null // or any identifier if you have one
          // }));
        }
      },
      error: (error) => {
        this.ToastrService.error('error loading room data', 'error');
        this.router.navigate(['/hotel-rooms']);
      }
    });
  }

  getingAllBedTybies(pageIndex: number, pageSize: number, search?: string): void {
    this._BedTybeService.getAllBedTybies({ pageIndex, pageSize, search }).subscribe({
      next: (res: any) => {
        this.bedTybies = res.data.data;
      },
      error: (err) => {
        console.error('Get bed types error:', err);
      }
    });
  }

  gettingAllHotels(pageIndex: number, pageSize: number, search?: string): void {
    this._HotelService.getAllHotels({ pageIndex, pageSize, search }).subscribe({
      next: (res) => {
        this.hotels = res.data.data;
      },
      error: (err) => {
        console.error('Error fetching hotels:', err);
        this.hotels = [];
      }
    });
  }

  gettingAllRoomTybes(pageIndex: number, pageSize: number, search?: string): void {
    this._RoomTybeService.getAllRoomTybes({ pageIndex, pageSize, search }).subscribe({
      next: (res) => {
        this.roomTybies = res.data.data;
      },
      error: (err) => {
        console.error('Error fetching room types:', err);
      }
    });
  }

  getingAllRoomFeaturies(pageIndex: number, pageSize: number, search?: string): void {
    this._RoomFeaturiesService.getAllRoomFeaturies({ pageIndex, pageSize, search }).subscribe({
      next: (res: any) => {
        this.roomFeaturies = res.data.data;
      },
      error: (err) => {
        console.error('Get room features error:', err);
      }
    });
  }

  onRoomTybeFilter(event: any): void {
    const query = event.filter;
    this.gettingAllRoomTybes(this.first, this.rows, query);
  }

  onbedFilter(event: any): void {
    const query = event.filter;
    this.getingAllBedTybies(this.first, this.rows, query);
  }

  onHotelFilter(event: any): void {
    const query = event.filter;
    this.gettingAllHotels(this.first, this.rows, query);
  }

  onRoomFeaturiesFilter(event: any): void {
    const query = event.filter;
    this.getingAllRoomFeaturies(this.first, this.rows, query);
  }

  shouldShowError(controlPath: string, index?: number, controlName?: string): boolean {
    let control: AbstractControl | null;

    if (index !== undefined && controlName) {
      control = (this.roomForm.get(controlPath) as FormArray)?.at(index)?.get(controlName);
    } else {
      control = this.roomForm.get(controlPath);
    }

    if (!control) return false;

    // Special handling for conditional fields
    if (controlPath === 'MinimumDaysToRefund') {
      const isRefundable = this.roomForm.get('IsRefundable')?.value;
      return isRefundable && control.invalid && (control.dirty || control.touched || this.submitted);
    }

    if (controlPath === 'depositRate') {
      const isAllowed = this.roomForm.get('IsAllowPaymentUponArrival')?.value;
      return isAllowed && control.invalid && (control.dirty || control.touched || this.submitted);
    }

    return control.invalid && (control.dirty || control.touched || this.submitted);
  }

  onSubmit(): void {
    this.submitted = true;
    this.roomForm.markAllAsTouched();

    // if (this.roomForm.invalid) {
    //   console.log('Form is invalid:', this.roomForm.errors);
    //   return;
    // }
    // Add this debug code
    Object.keys(this.roomForm.controls).forEach((key) => {
      const control = this.roomForm.get(key);
      if (control?.invalid) {
        console.log('Invalid control:', key, control.errors);
      }
    });

    if (this.isEditing) {
      this.updateRoom();
    } else {
      this.createRoom();
    }
  }

  // Helper function to convert Date to ISO string or handle null/invalid dates
  private toISOString(date: any): string | null {
    if (!date) return null;
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
  }
  private buildRoomFormData(): FormData {
    const formData = new FormData();
    const formValue = this.roomForm.value;

    Object.keys(formValue).forEach((key) => {
      if (key !== 'CustomPrices' && key !== 'Features' && formValue[key] !== null && formValue[key] !== undefined) {
        if (key === 'AvailableFrom' || key === 'AvailableTo') {
          const isoDate = this.toDateOnlyString(formValue[key]);
          if (isoDate) {
            formData.append(key, isoDate);
          }
        } else {
          formData.append(key, formValue[key]);
        }
      } else if (key === 'Features' && Array.isArray(formValue.Features)) {
        formValue.Features.forEach((feature: any, index: number) => {
          formData.append(`Features[${index}]`, feature);
        });
      } else if (key === 'CustomPrices' && Array.isArray(formValue.CustomPrices)) {
        formValue.CustomPrices.forEach((PRICEPLAN: any) => {
          const fromIso = this.toDateOnlyString(PRICEPLAN.from);
          const toIso = this.toDateOnlyString(PRICEPLAN.to);

          if (fromIso && toIso) {
            const pricePlanData: any = {
              from: fromIso,
              to: toIso,
              price: PRICEPLAN.price
            };
            if (PRICEPLAN.id !== undefined && PRICEPLAN.id !== null) {
              pricePlanData.id = PRICEPLAN.id;
            }
            // Append as separate JSON object for each element
            formData.append('CustomPrices', JSON.stringify(pricePlanData));
          }
        });
      }
    });
    // imgs
    this.otherImages.forEach((file, index) => {
      formData.append('ImagesFiles', file, file.name);
    });
    return formData;
  }

  // createRoom(): void {
  //   debugger;
  //   this.submitted = true;

  //   // 1. Create FormData
  //   const formData = new FormData();
  //   const formValue = this.roomForm.value;

  //   // 2. Add text fields and convert dates to ISO
  //   Object.keys(formValue).forEach((key) => {
  //     if (key !== 'CustomPrices' && key !== 'Features' && formValue[key] !== null && formValue[key] !== undefined) {
  //       if (key === 'AvailableFrom' || key === 'AvailableTo') {
  //         const isoDate = this.toISOString(formValue[key]);
  //         if (isoDate) {
  //           formData.append(key, isoDate);
  //         }
  //       } else {
  //         formData.append(key, formValue[key]);
  //       }
  //     } else if (key === 'Features' && Array.isArray(formValue.Features)) {
  //       formValue.Features.forEach((feature: any, index: number) => {
  //         formData.append(`Features[${index}]`, feature);
  //       });
  //     } else {
  //       formValue.CustomPrices.forEach((PRICEPLAN: any, index: number) => {
  //         const fromIso = this.toISOString(PRICEPLAN.from);
  //         const toIso = this.toISOString(PRICEPLAN.to);
  //         if (fromIso && toIso) {
  //           const pricePlanData = {
  //             from: fromIso,
  //             to: toIso,
  //             price: PRICEPLAN.price
  //           };
  //           formData.append(`CustomPrices[${index}]`, JSON.stringify(pricePlanData));
  //         }
  //       });
  //     }
  //   });

  //   // 4. Add images as binary
  //   // this.otherImages.forEach((file, index) => {
  //   //   // formData.append(`ImagesFiles[${index}]`,file,file.name);

  //   //   formData.append('ImagesFiles', file, file.name);
  //   // });

  //   // 5. Send the data
  //   this._RoomService.addRoom(formData).subscribe({
  //     next: (response) => {
  //       this.router.navigate(['/hotel-rooms']);
  //       this.ToastrService.success('Created successfully');
  //     },
  //     error: (error) => {
  //       console.error('Error:', error);
  //       this.ToastrService.error('Error creating room');
  //     }
  //   });
  // }

  // updateRoom() {
  //   const model = this.roomForm.value;
  //   this._RoomService.updateRoom(model).subscribe({
  //     next: () => {
  //       this.ToastrService.success(this.translate.instant('Room updated successfully'));
  //       this.router.navigate(['/hotel-rooms']);
  //     },
  //     error: (error) => {
  //       console.error('Error updating room:', error);
  //       this.ToastrService.error(
  //         this.translate.instant('Error updating room: ') + (error.error?.message || error.message || 'Unknown error')
  //       );
  //     }
  //   });
  // }

  createRoom(): void {
    this.submitted = true;
    const formData = this.buildRoomFormData();

    this._RoomService.addRoom(formData).subscribe({
      next: () => {
        this.router.navigate(['/hotel-rooms']);
        this.ToastrService.success('Created successfully');
      },
      error: (error) => {
        console.error('Error:', error);
        this.ToastrService.error('Error creating room');
      }
    });
  }

  updateRoom(): void {
    const formData = this.buildRoomFormData();
    formData.append('id', this.roomId); // أو حسب الباك إند محتاج إيه لتحديد الغرفة

    this._RoomService.updateRoom(formData).subscribe({
      next: () => {
        this.ToastrService.success(this.translate.instant('Room updated successfully'));
        this.router.navigate(['/hotel-rooms']);
      },
      error: (error) => {
        console.error('Error updating room:', error);
        this.ToastrService.error(
          this.translate.instant('Error updating room: ') + (error.error?.message || error.message || 'Unknown error')
        );
      }
    });
  }

  onCancel(): void {
    if (this.roomForm.dirty) {
      if (confirm(this.translate.instant('Are you sure you want to discard changes?'))) {
        this.router.navigate(['/hotel-rooms']);
      }
    } else {
      this.router.navigate(['/hotel-rooms']);
    }
  }
}

```

---

## `src/app/demo/pages/hotels/rooms/imgs-room-form/imgs-room-form.component.html`

```html
<div class="main">
  <sub-header [mainHeader]="'add room images' | translate"></sub-header>
  <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round mb-4">
    <div class="col-md-12 mb-3">
      <app-img-uploader
        [multiple]="true"
        (filesChanged)="onImagesUpload($event)"
        [displayFiles]="displayFilesForUploader"
        (removeImgFromDB)="onImageRemoved($event)"
      >
        >
      </app-img-uploader>
      <!-- Buttons -->
      <div class="buttons mt-3 text-end">
        <p-button label="{{ 'Cancel' | translate }}" class="mx-1" severity="secondary" icon="pi pi-times" (onClick)="oncansel()"></p-button>
        <p-button
          label="{{ 'Save' | translate }}"
          severity="success"
          class="shadow"
          icon="pi pi-save"
          type="submit"
          (onClick)="onSave()"
        ></p-button>
      </div>
    </div>
  </div>
</div>

```

---

## `src/app/demo/pages/hotels/rooms/imgs-room-form/imgs-room-form.component.scss`

```scss

```

---

## `src/app/demo/pages/hotels/rooms/imgs-room-form/imgs-room-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgsRoomFormComponent } from './imgs-room-form.component';

describe('ImgsRoomFormComponent', () => {
  let component: ImgsRoomFormComponent;
  let fixture: ComponentFixture<ImgsRoomFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImgsRoomFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImgsRoomFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/hotels/rooms/imgs-room-form/imgs-room-form.component.ts`

```ts
import { Component, input, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from '../../../../../shared/components/sub-header/sub-header.component';
import { ImgUploaderComponent } from '../../../../../shared/img-uploader/img-uploader.component';
import { RoomService } from 'src/app/shared/services/room.service';
import { ActivatedRoute, Router, RouterLinkActive } from '@angular/router';
import { co } from '@fullcalendar/core/internal-common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-imgs-room-form',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, ImgUploaderComponent],
  templateUrl: './imgs-room-form.component.html',
  styleUrl: './imgs-room-form.component.scss'
})
export class ImgsRoomFormComponent implements OnInit {
  newImages: File[] = [];
  roomId: number = null;
  displayFilesForUploader: any[] = [];
  @ViewChild(ImgUploaderComponent) imgUploader!: ImgUploaderComponent;

  constructor(
    private _RoomService: RoomService,
    private ActivatedRoute: ActivatedRoute,
    private ToastrService: ToastrService,
    private router: Router
  ) {}
  onImagesUpload(files: File[] | null): void {
    this.newImages = files || [];
  }
  getRoomImgsById(roomId) {
    this._RoomService.getAllRoomgetAllRoomImages({ roomId }).subscribe({
      next: (res) => {
        this.displayFilesForUploader = res.data.data;
      }
    });
  }
  onImageRemoved(index: number): void {
    this.displayFilesForUploader.splice(index, 1);
  }
  onSave() {
    if (this.newImages.length === 0 || !this.roomId) {
      return;
    }
    const formData = new FormData();
    this.newImages.forEach((file, idx) => {
      formData.append('imagesFiles', file);
    });
    formData.append('roomId', this.roomId.toString());

    this._RoomService.addRoomImage(formData).subscribe({
      next: (res) => {
        this.ToastrService.success('Images uploaded successfully');
        // Optionally, you can navigate to another page or reset the form
        this.router.navigate(['/hotel-rooms']);
      },
      error: (err) => {
        // handle error, e.g., show an error message
      }
    });
  }

  ngOnInit(): void {
    this.ActivatedRoute.params.subscribe((params) => {
      this.roomId = params['id'];
      console.log(this.roomId);
    });
    if (this.roomId) {
      this.getRoomImgsById(this.roomId);
    }
  }
  oncansel() {
    this.router.navigate(['/hotel-rooms']);
  }
}

```

---

## `src/app/demo/pages/hotels/rooms/room-details/room-details.component.html`

```html


<div class="main ">
<sub-header
  [mainHeader]="'Room Details' | translate"
  [mainSection]="'Rooms' | translate"
  [subSection]="'Details' | translate"
  [actionButtons]="[
    { label: 'Edit', action: 'edit', icon: 'pi pi-pen-to-square', class: 'btn-warning' }
  ]"
(actionClicked)="handleAction($event)">
</sub-header>

  <!-- Product Details Section -->
  <div class=" border-1 border-solid surface-border border-round mb-4 p-4">
    <div class="grid">
      <!-- Product Images -->
      <div class="col-6">
        <!-- <p-galleria
        [value]="images"
        [autoPlay]="true"
        [circular]="true"
        [showItemNavigators]="true"

        [thumbnailsPosition]="'bottom'"
        [responsiveOptions]="responsiveOptions"
        [containerStyle]="{ 'max-width': '640px' }"
        [numVisible]="5">
            <ng-template pTemplate="item" let-item>
                <img
                    [src]="item.itemImageSrc"
                    style="width: 100%; height: 280px; display: block;margin-bottom: 10px;
    border-radius: 15px;" />
            </ng-template>
            <ng-template pTemplate="thumbnail" let-item>
                <div class="grid grid-nogutter justify-content-center">
                    <img [src]="item.thumbnailImageSrc" width="70px" style="border-radius: 5px;" />
                </div>
            </ng-template>
    </p-galleria> -->
      </div>

      <!-- Product Info -->
      <div class="col-6">
        <h2 class="mb-2">{{ '3 Founding Day Abaya' }}</h2>
        <h3 class="text-orange-500 mb-3">$300.00</h3>
        <p class="text-muted mb-3">
          The Founding Day Abaya features a design inspired by the rich heritage of the Kingdom, with modern touches that reflect the spirit of the occasion and highlight your national identity.
        </p>
        <p class="text-muted">
          The Founding Day Abaya features a design inspired by the rich heritage of the Kingdom, with modern touches that reflect the spirit of the occasion and highlight your national identity.
        </p>
      </div>
    </div>
  </div>

  <!-- Product Details Table -->
  <div class="p-card bg-light p-3">
    <div class="grid">
      <div class="col-6">
        <div class="flex align-items-center justify-content-between">
        <strong>{{ 'Category' | translate }}</strong>
        <p>Abaya</p>
        </div>
      </div>
      <div class="col-6">
        <div class="flex align-items-center justify-content-between">
        <strong>{{ 'Stock' | translate }}</strong>
        <p>50</p>
        </div>
      </div>
      <div class="col-6">
        <div class="flex align-items-center justify-content-between">
        <strong>{{ 'Discount' | translate }}</strong>
        <p>5%</p>
        </div>
      </div>
      <div class="col-6">
        <div class="flex align-items-center justify-content-between">
        <strong>{{ 'Discount Started' | translate }}</strong>
        <p>01/03/2015</p>
        </div>
      </div>
      <div class="col-6">
        <div class="flex align-items-center justify-content-between">
        <strong>{{ 'Discount Ended' | translate }}</strong>
        <p>01/03/2015</p>
        </div>
      </div>
      <div class="col-6">
        <div class="flex align-items-center justify-content-between">
        <strong>{{ 'Product Status' | translate }}</strong>
        <p>
          <p-toggleButton
    [(ngModel)]="productStatus"
    onLabel="Disabled"
    offLabel="Enable"

    offIcon="pi pi-times"
    icon="pi pi-lock"
    offIcon="pi pi-lock-open"
    styleClass="w-9rem"
    />

        </p>
        </div>
      </div>
    </div>
  </div>
</div>

```

---

## `src/app/demo/pages/hotels/rooms/room-details/room-details.component.scss`

```scss

```

---

## `src/app/demo/pages/hotels/rooms/room-details/room-details.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomDetailsComponent } from './room-details.component';

describe('RoomDetailsComponent', () => {
  let component: RoomDetailsComponent;
  let fixture: ComponentFixture<RoomDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/hotels/rooms/room-details/room-details.component.ts`

```ts
import { Component } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-room-details',
  standalone: true,
  imports: [SharedModule,SubHeaderComponent],
  templateUrl: './room-details.component.html',
  styleUrl: './room-details.component.scss'
})
export class RoomDetailsComponent {
  productStatus:boolean
  handleAction(e){

  }
}

```

---

## `src/app/demo/pages/hotels/rooms/room-list/room-list.component.html`

```html
<p-toast></p-toast>
<p-confirmDialog></p-confirmDialog>

<div class="card">
  <p-toolbar styleClass="mb-4">
    <ng-template pTemplate="left">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>

        <input pInputText type="text" [(ngModel)]="searchTerm" (input)="onSearch()" [placeholder]="'search' | translate" />
      </span>
    </ng-template>
  </p-toolbar>

  <p-table
    #dt
    [value]="rooms"
    [paginator]="true"
    [rows]="10"
    [lazy]="true"
    (onLazyLoad)="loadRooms($event)"
    [totalRecords]="totalRecords"
    [loading]="loading"
    [showCurrentPageReport]="true"
    [tableStyle]="{ 'min-width': '50rem' }"
    [currentPageReportTemplate]="'showingEntries' | translate"
    [rowsPerPageOptions]="[10, 25, 50]"
    [globalFilterFields]="['name', 'id']"
  >
    <ng-template pTemplate="header">
      <tr>
        <th pSortableColumn="id">
          {{ '#ID' | translate }}
          <p-sortIcon field="id"></p-sortIcon>
        </th>
        <th pSortableColumn="name">
          {{ 'roomName' | translate }}
          <p-sortIcon field="name"></p-sortIcon>
        </th>
        <th pSortableColumn="hotel">{{ 'hotelName' | translate }}
          <p-sortIcon field="hotel"></p-sortIcon>
        </th>
        <th *ngIf="!isVendor()">{{ 'vendorName' | translate }}</th>
        <th pSortableColumn="availableFrom">
          {{ 'availableFrom' | translate }}
          <p-sortIcon field="availableFrom"></p-sortIcon>
        </th>
        <th pSortableColumn="availableTo">
          {{ 'availableTo' | translate }}
          <p-sortIcon field="availableTo"></p-sortIcon>
        </th>
        <th pSortableColumn="price">
          {{ 'roomPrice' | translate }}
          <p-sortIcon field="price"></p-sortIcon>
        </th>
        <th>{{ 'roomType' | translate }}</th>
        <th>{{ 'bedType' | translate }}</th>
        <th>{{ 'is block' | translate }}</th>
        <th>{{ 'actions' | translate }}</th>
      </tr>
      <tr>
        <th>
          <p-columnFilter type="numeric" field="id" display="row" [showMenu]="false" [showButtons]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="name" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th> 
          <p-columnFilter type="text" field="hotel.name" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th *ngIf="!isVendor()">
          <p-columnFilter type="text" field="company.name" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="date" field="availableFrom" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="date" field="availableTo" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="price" display="row" [showMenu]="false" [showButtons]="false"></p-columnFilter>
        </th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-room>
      <tr>
        <td class="no-wrap">{{ room.id }}</td>
        <td class="no-wrap">{{ room.name }}</td>
        <td class="no-wrap">{{ room.hotel }}</td>
        <td class="no-wrap" *ngIf="!isVendor()">
          <span class="cursor-pointer text-primary" (click)="goToCompany(room.companyDto.id)">
            {{ room.companyDto.name }}
          </span>
        </td>
        <td>{{ room.availableFrom | date: 'mediumDate' }}</td>
        <td>{{ room.availableTo | date: 'mediumDate' }}</td>
        <td>{{ room.price }}</td>
        <td class="no-wrap">{{ room.roomType }}</td>
        <td class="no-wrap">{{ room.bedType }}</td>
        <td>
          <p-inputSwitch [(ngModel)]="room.isBlocked" (onChange)="toggleBlockStatus(room.id)" [disabled]="isVendor()"></p-inputSwitch>
        </td>
        <td>
          <p-menu #menu [popup]="true" [model]="room.actions" appendTo="body"></p-menu>
          <button pButton type="button" icon="pi pi-ellipsis-v" class="p-button-text text-primary" (click)="menu.toggle($event)"></button>
        </td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="11">
          <div class="flex flex-column justify-content-center align-items-center py-5 w-full">
            <i class="pi pi-search" style="font-size: 3rem; color: var(--gray-400)"></i>
            <span class="mt-2 text-gray-500 font-medium">{{ 'No Data found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/hotels/rooms/room-list/room-list.component.scss`

```scss
.no-wrap {
  white-space: nowrap; /* Prevents text from wrapping */
  overflow: hidden; /* Hides overflowed text */
  text-overflow: ellipsis; /* Adds ellipsis for truncated text */
  max-width: 150px; /* Adjust this value based on your design */
}

::ng-deep .p-splitbutton {
  border-radius: 1.5rem !important; // يخليه rounded
  font-size: 0.8rem !important; // يصغره
  height: 2.2rem !important; // تصغير الارتفاع لو حبيت
}

::ng-deep .p-splitbutton .p-button {
  padding: 0.3rem 0.6rem !important; // تصغير البادينج الداخلي
  min-width: unset !important;
}

::ng-deep .p-splitbutton .p-splitbutton-menubutton {
  padding: 0.3rem 0.5rem !important;
}
::ng-deep .p-menuitem {
  cursor: pointer;
  
}

::ng-deep .p-menuitem:hover {
  background-color: #e0e0e0 !important; // لون أغمق شوية عند hover
}

::ng-deep .p-menuitem-link:hover {
  background-color: #d0d0d0 !important; // لو عايز التأثير يظهر على اللينك كله
}
/* إخفاء الزر الافتراضي في SplitButton */
::ng-deep .no-default-button .p-splitbutton-defaultbutton {
  display: none !important;
}

/* تعديل المظهر ليكون أنيقًا */
::ng-deep .no-default-button .p-splitbutton-menubutton {
  border-top-left-radius: 6px !important;
  border-bottom-left-radius: 6px !important;
}

// للتأكد من أن المسافة تظهر بشكل صحيح
::ng-deep .p-menuitem-link {
  display: flex !important;
  align-items: center !important;
  gap: 0.75rem !important;
}
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

// Hide increase/decrease spinner buttons on numeric filters
:host ::ng-deep .p-datatable .p-inputnumber-button-group {
  display: none !important;
}

:host ::ng-deep .p-datatable .p-inputnumber-buttons-stacked .p-inputnumber-input {
  border-radius: 6px !important;
}

```

---

## `src/app/demo/pages/hotels/rooms/room-list/room-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomListComponent } from './room-list.component';

describe('RoomListComponent', () => {
  let component: RoomListComponent;
  let fixture: ComponentFixture<RoomListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/hotels/rooms/room-list/room-list.component.ts`

```ts
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
// import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';
import { Table, TableLazyLoadEvent } from 'primeng/table';

import { Irooms } from 'src/app/shared/model/irooms';
import { RoomService } from 'src/app/shared/services/room.service';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [SharedModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.scss'
})
export class RoomListComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;

  rooms: Irooms[] = [];
  searchTerm: string = '';
  // first = 0;
  // rows = 10;
  @Input() CompanyId: any;
  @Input() companyId: any;
  loading: boolean = false;

  // filter: FilterMap = {};

  totalRecords: number = 0;
  constructor(
    private RoomService: RoomService,
    private router: Router,
    private _MessageService: MessageService,
    private ConfirmationService: ConfirmationService,
    private translate: TranslateService,
    private ConfigureService: ConfigureService,
    private toaster: ToastrService
  ) {}
  ngOnInit(): void {
    // Initial load handled by p-table lazy load
  }

  goToCompany(companyId: number) {
    this.router.navigate(['/vendor-details', companyId]);
  }

  toggleBlockStatus(id) {
    this.RoomService.toggleBlock(id).subscribe({
      next: () => {
        this.toaster.success(this.translate.instant('room block status changed successfully'));
      },
      error: (err) => {
        this.toaster.error(this.translate.instant('error in update room block status'));
        this.dt?.reset(); // Refresh table
      }
    });
  }
  onSearch() {
    this.dt?.reset();
  }

  loadRooms(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload: any = TableRequestBuilder.build(event, this.searchTerm);

    if (this.CompanyId || this.companyId) {
      payload.companyId = this.companyId || this.CompanyId;
    }

    this.RoomService.getAllRooms(payload).subscribe({
      next: (res) => {
        if (res?.success && res.data?.data) {
          this.rooms = res.data.data.map((room: Irooms) => ({
            ...room,
            actions: this.getRoomActions(room)
          }));
          this.totalRecords = res.data.itemsCount;
        } else {
          this.rooms = [];
          this.totalRecords = 0;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching rooms', err);
        this.rooms = [];
        this.totalRecords = 0;
        this.loading = false;
      }
    });
  }

  // Deprecated usage kept for reference or removed?
  // gettingAllRooms removal

  //////////////////////////////////////////
  isVendor(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }
  getRoomActions(room: any): MenuItem[] {
    const allActions: (MenuItem & { roles: string[] })[] = [
      {
        label: this.translate.instant('Images'),
        icon: 'pi pi-plus',
        roles: ['Vendor'], // مين يقدر يشوفه
        command: () => {
          this.router.navigate(['/room-form-imgs', room.id]);
        }
      },
      {
        label: this.translate.instant('Edit Room'),
        icon: 'pi pi-pencil',
        roles: ['Vendor'],
        command: () => {
          this.router.navigate(['/room-form', room.id]);
        }
      },
      {
        label: this.translate.instant('roomDetails'),
        icon: 'pi pi-info-circle',
        roles: ['Vendor', 'Admin'],
        command: () => {
          this.router.navigate(['/room-details-last-step', room.id]);
        }
      },
      {
        label: this.translate.instant('delete'),
        icon: 'pi pi-trash',
        roles: ['Vendor', 'Admin'],
        command: () => {
          this.confirmDelete(room.id);
        }
      }
    ];

    // نجيب الـ roles بتاعة اليوزر
    const roles = this.ConfigureService.userRoles();
    const isVendor = roles.some((r) => r.startsWith('Vendor.'));
    const isAdmin = roles.some((r) => r.startsWith('Admin.'));

    // فلترة حسب الدور
    return allActions.filter((action) => {
      if (isVendor && action.roles.includes('Vendor')) return true;
      if (isAdmin && action.roles.includes('Admin')) return true;
      return false;
    });
  }

  confirmDelete(roomId: any) {
    this.ConfirmationService.confirm({
      message: this.translate.instant('confirmDeleteRoom'),
      header: this.translate.instant('confirmation'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('yes'),
      rejectLabel: this.translate.instant('no'),
      accept: () => {
        this.deleteRoom(roomId);
      }
    });
  }

  deleteRoom(roomId: any) {
    this.RoomService.deleteRoom(roomId).subscribe({
      next: () => {
        this._MessageService.add({
          severity: 'success',
          summary: this.translate.instant('success'),
          detail: this.translate.instant('deleteRoomSuccess')
        });
        this.dt?.reset();
      },
      error: (error) => {
        this._MessageService.add({
          severity: 'error',
          summary: this.translate.instant('error'),
          detail: this.translate.instant('deleteRoomError')
        });
      }
    });
  }
}

```

---

## `src/app/demo/pages/hotels/rooms/rooms.component.html`

```html
<p-confirmDialog />
<p-toast></p-toast>
<div class="main">
  <sub-header
    [mainHeader]="'Rooms'"
    [actionButtons]="isVendor()?[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]:[]"
    (actionClicked)="handleAction($event)"
  ></sub-header>
  <app-room-list></app-room-list>
</div>

```

---

## `src/app/demo/pages/hotels/rooms/rooms.component.scss`

```scss

```

---

## `src/app/demo/pages/hotels/rooms/rooms.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomsComponent } from './rooms.component';

describe('RoomsComponent', () => {
  let component: RoomsComponent;
  let fixture: ComponentFixture<RoomsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/hotels/rooms/rooms.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { SubHeaderComponent } from '../../../../shared/components/sub-header/sub-header.component';
import { Router } from '@angular/router';
import { RoomListComponent } from './room-list/room-list.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ToastrService } from 'ngx-toastr';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [SubHeaderComponent, RoomListComponent, SharedModule],
  providers: [ConfirmationService],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit {
  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private ToastrService: ToastrService , 
    private ConfigureService:ConfigureService
  ) {}
  ngOnInit(): void {}
  handleAction(event) {
    switch (event.action) {
      case 'add':
        this.confirm1(event);
        break;
    }
  }

  addRoom() {
    this.router.navigate(['/room-form']);
  }
  addGroupOfRoom() {
    this.router.navigate(['/room-groups-form']);
  }

  confirm1(event: Event) {
    console.log(event);
    this.confirmationService.confirm({
      target: event.target as EventTarget,

      message: 'you want to add group or individual room ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'add individual room',
      acceptLabel: 'add group of rooms',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text',
      closeOnEscape: true,
      dismissableMask: true,
      accept: () => {
        this.ToastrService.info('you can add group of rooms now');
        this.addGroupOfRoom();
      },
      reject: (type?: any) => {
        console.log('Reject type:', type); // هتشوف القيمة هنا

        if (type === 1) {
          this.addRoom();
          this.ToastrService.info('you can add individual room now');
        }
      }
    });
  }
  isVendor(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }
}

```

---

## `src/app/demo/pages/notifications/notification-details/notification-details.component.html`

```html
<div class="notification-details-container p-3" *ngIf="notification">
  <div class="grid">
    <div class="col-12 mb-3">
      <label class="font-bold block mb-2">Title</label>
      <div class="text-lg">{{ notification.title }}</div>
    </div>

    <div class="col-12 mb-3">
      <label class="font-bold block mb-2">Message Body</label>
      <div class="surface-ground p-3 border-round text-700" style="white-space: pre-wrap">{{ notification.body }}</div>
    </div>

    <div class="col-12 md:col-6 mb-3">
      <label class="font-bold block mb-2">Recipient</label>
      <div class="flex align-items-center gap-2">
        <i class="pi pi-user text-primary"></i>
        <span>{{ notification.user?.name || notification.userId }}</span>
      </div>
    </div>

    <div class="col-12 md:col-6 mb-3">
      <label class="font-bold block mb-2">Status</label>
      <div
        [class]="'inline-block px-3 py-1 border-round ' + (notification.isRead ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')"
      >
        {{ notification.isRead ? 'Read' : 'Unread' }}
      </div>
    </div>

    <div class="col-12 mb-3" *ngIf="notification.imageUrl">
      <label class="font-bold block mb-2">Image</label>
      <img
        [src]="baseUrl+ notification.imageUrl"
        alt="Notification Image"
        class="w-full border-round shadow-2"
        style="max-height: 300px; object-fit: contain"
      />
    </div>

    <div class="col-12 flex justify-content-end mt-4">
      <button pButton type="button" label="Close" class="p-button-secondary" (click)="close()"></button>
    </div>
  </div>
</div>
<div *ngIf="!notification" class="p-3 text-center">No details available.</div>

```

---

## `src/app/demo/pages/notifications/notification-details/notification-details.component.scss`

```scss
.notification-details-container {
  overflow-y: auto;
  max-height: 80vh;
}

```

---

## `src/app/demo/pages/notifications/notification-details/notification-details.component.ts`

```ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { INotification } from 'src/app/shared/model/inotification';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ButtonModule } from 'primeng/button';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-notification-details',
  standalone: true,
  imports: [CommonModule, SharedModule, ButtonModule],
  templateUrl: './notification-details.component.html',
  styleUrl: './notification-details.component.scss'
})
export class NotificationDetailsComponent {
  notification: INotification | undefined;
  baseUrl: string = environment.imgUrl;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    if (this.config.data) {
      this.notification = this.config.data;
    }
  }

  close() {
    this.ref.close();
  }
}

```

---

## `src/app/demo/pages/notifications/notifications-form/notifications-form.component.html`

```html
<form [formGroup]="form" (ngSubmit)="save()" class="p-fluid grid pl-5 pr-5">
  <div class="field col-12">
    <label for="title">Title</label>
    <input pInputText id="title" formControlName="title" placeholder="Enter title" />
    <small class="p-error" *ngIf="form.get('title')?.touched && form.get('title')?.invalid">Title is required</small>
  </div>

  <div class="field col-12">
    <label for="body">Message Body</label>
    <textarea pInputTextarea id="body" formControlName="body" rows="3" placeholder="Enter message"></textarea>
    <small class="p-error" *ngIf="form.get('body')?.touched && form.get('body')?.invalid">Message body is required</small>
  </div>

  <div class="field col-12" *ngIf="mode === 'Add'">
    <label>User Type</label>
    <div class="flex gap-3 mt-2">
      <div class="flex align-items-center">
        <p-checkbox formControlName="LoginUser" [binary]="true" inputId="loginUser"></p-checkbox>
        <label for="loginUser" class="ml-2">Login User</label>
      </div>
      <div class="flex align-items-center">
        <p-checkbox formControlName="Anonymous" [binary]="true" inputId="anonymous"></p-checkbox>
        <label for="anonymous" class="ml-2">Anonymous</label>
      </div>
    </div>
  </div>

  <div class="field col-12" *ngIf="form.get('LoginUser')?.value === true || mode === 'Edit'">
    <label for="usersId">Select Users</label>
    <p-multiSelect
      *ngIf="mode === 'Add'"
      id="usersId"
      [options]="users"
      formControlName="usersId"
      optionLabel="name"
      optionValue="id"
      placeholder="Select Users"
      [filter]="true"
      display="chip"
      [showClear]="true"
      [virtualScroll]="true"
      [virtualScrollItemSize]="40"
      (onFilter)="onFilterUsers($event)"
      [loading]="usersLoading"
      scrollHeight="250px"
    ></p-multiSelect>

    <p-dropdown
      *ngIf="mode === 'Edit'"
      id="usersId"
      [options]="users"
      formControlName="usersId"
      optionLabel="name"
      optionValue="id"
      placeholder="Select User"
      [filter]="true"
      [showClear]="true"
      [virtualScroll]="true"
      [virtualScrollItemSize]="40"
      [lazy]="true"
      (onFilter)="onFilterUsers($event)"
      [loading]="usersLoading"
      scrollHeight="250px"
    ></p-dropdown>

    <small class="p-error" *ngIf="form.get('usersId')?.touched && form.get('usersId')?.invalid">At least one User ID is required</small>
  </div>

  <div class="field col-12">
    <label for="image">Image</label>
    <div class="">
      <app-img-uploader [multiple]="false" [displayFile]="displayFile" (filesChanged)="onFileSelect($event)"></app-img-uploader>
    </div>
  </div>

  <div class="col-12 flex justify-content-end gap-2 mt-3 mb-3">
    <button pButton type="button" label="Cancel" class="p-button-secondary p-button-text" (click)="close()"></button>
    <button pButton type="submit" label="Send Notification" [loading]="loading" [disabled]="form.invalid || loading"></button>
  </div>
</form>

```

---

## `src/app/demo/pages/notifications/notifications-form/notifications-form.component.scss`

```scss

```

---

## `src/app/demo/pages/notifications/notifications-form/notifications-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsFormComponent } from './notifications-form.component';

describe('NotificationsFormComponent', () => {
  let component: NotificationsFormComponent;
  let fixture: ComponentFixture<NotificationsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/notifications/notifications-form/notifications-form.component.ts`

```ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MessageService } from 'primeng/api';
import { ChipsModule } from 'primeng/chips';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CustomerService } from 'src/app/shared/services/customer.service';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';

import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-notifications-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    ChipsModule,
    InputTextareaModule,
    ImgUploaderComponent,
    DropdownModule,
    MultiSelectModule,
    RadioButtonModule,
    CheckboxModule
  ],
  providers: [MessageService],
  templateUrl: './notifications-form.component.html',
  styleUrl: './notifications-form.component.scss'
})
export class NotificationsFormComponent {
  mode: string = 'Add';
  displayFile: any;
  form: FormGroup;
  loading: boolean = false;
  users: any[] = [];
  selectedFile: File | null = null;

  // Lazy loading properties
  usersLoading: boolean = false;
  totalUsers: number = 0;
  pageSize: number = 20;
  currentPage: number = 1;
  searchTerm: string = '';
  hasMoreUsers: boolean = true;

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private notificationsService: NotificationsService,
    private messageService: MessageService,
    private customerService: CustomerService
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      body: ['', Validators.required],
      LoginUser: [true],
      Anonymous: [false],
      usersId: [[]],
      image: [null]
    });

    this.loadUsers();
  }

  loadUsers(page: number = 1, search: string = '', append: boolean = false) {
    this.usersLoading = true;
    const filterMap = new FilterMap();
    filterMap.pageIndex = page;
    filterMap.pageSize = this.pageSize;
    if (search) {
      filterMap.search = search;
    }

    this.customerService.getAllCustomers(filterMap).subscribe({
      next: (res: any) => {
        const newUsers = res.data.data || [];
        this.totalUsers = res.data.itemCount || 0;

        if (append) {
          this.users = [...this.users, ...newUsers];
        } else {
          this.users = newUsers;
        }

        this.currentPage = page;
        this.usersLoading = false;

        // Check if there are more users to load
        this.hasMoreUsers = this.users.length < this.totalUsers;

        if (this.config.data) {
          this.mode = 'Edit';
          this.form.patchValue({
            title: this.config.data.title,
            body: this.config.data.body
          });

          if (this.config.data.userId) {
            const exists = this.users.find((u) => u.id === this.config.data.userId);
            if (!exists && this.config.data.user) {
              this.users = [...this.users, { id: this.config.data.userId, name: this.config.data.user.name }];
            }

            this.form.patchValue({ usersId: this.config.data.userId });
            this.form.get('usersId')?.disable();
          }

          if (this.config.data.imageUrl) {
            this.displayFile = this.config.data.imageUrl;
          }
        }
      },
      error: () => {
        this.usersLoading = false;
      }
    });
  }



  onScrollToEnd() {
    // Called when user scrolls to the end of the dropdown
    if (this.hasMoreUsers && !this.usersLoading) {
      const nextPage = this.currentPage + 1;
      this.loadUsers(nextPage, this.searchTerm, true);
    }
  }

  onFilterUsers(event: any) {
    const filter = event.filter || '';
    this.searchTerm = filter;
    this.currentPage = 1;
    this.hasMoreUsers = true; // Reset when filtering
    this.loadUsers(1, filter, false);
  }

  onFileSelect(files: File[]) {
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    } else {
      this.selectedFile = null;
    }
  }

  onUserTypeChange(isLoginUser: boolean) {
    this.form.patchValue({
      LoginUser: isLoginUser,
      Anonymous: !isLoginUser
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData = new FormData();
    formData.append('title', this.form.get('title')?.value);
    formData.append('body', this.form.get('body')?.value);

    // Send LoginUser and Anonymous flags
    const loginUser = this.form.get('LoginUser')?.value;
    const anonymous = this.form.get('Anonymous')?.value;
    formData.append('LoginUser', loginUser ? 'true' : 'false');
    formData.append('Anonymous', anonymous ? 'true' : 'false');

    // Append Image
    if (this.selectedFile) {
      formData.append('Image', this.selectedFile);
    }

    const usersIdValue = this.form.get('usersId')?.value;

    if (this.mode === 'Edit' && this.config.data?.id) {
      // Edit mode: Send Id only, no UserId
      formData.append('Id', this.config.data.id);

      this.notificationsService.updateNotification(formData).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Notification updated successfully' });
          this.loading = false;
          this.ref.close(true);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update notification' });
          this.loading = false;
        }
      });
    } else {
      // Add mode: Only send UsersId if LoginUser is true
      if (loginUser && Array.isArray(usersIdValue)) {
        usersIdValue.forEach((id: number) => {
          formData.append('UsersId', id.toString());
        });
      }

      this.notificationsService.addNotification(formData).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Notification sent successfully' });
          this.loading = false;
          this.ref.close(true);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to send notification' });
          this.loading = false;
        }
      });
    }
  }

  close() {
    this.ref.close();
  }
}

```

---

## `src/app/demo/pages/notifications/notifications-list/notifications-list.component.html`

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
    [value]="notifications"
    [lazy]="true"
    (onLazyLoad)="loadNotifications($event)"
    [paginator]="true"
    [rows]="10"
    [rowsPerPageOptions]="[10, 20, 50]"
    [totalRecords]="totalRecords"
    [loading]="loading"
    [rowHover]="true"
    [showCurrentPageReport]="true"
    [currentPageReportTemplate]="'showingEntries' | translate"
    responsiveLayout="scroll"
  >
    <ng-template pTemplate="header">
      <tr>
        <th pSortableColumn="Title">
          Title
          <p-sortIcon field="Title"></p-sortIcon>
        </th>
        <th pSortableColumn="Body">
          Message
          <p-sortIcon field="Body"></p-sortIcon>
        </th>
        <th pSortableColumn="User">
          User
          <p-sortIcon field="User"></p-sortIcon>
        </th>
        <th>Actions</th>
      </tr>
      <tr>
        <th>
          <p-columnFilter type="text" field="Title" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th></th>
        <th>
          <p-columnFilter type="text" field="User" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th></th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-notification>
      <tr>
        <td>{{ notification.title }}</td>
        <td>{{ notification.body }}</td>
        <td>
          <a
            href="javascript:void(0)"
            (click)="navigateToCustomer(notification.userId)"
            class="text-primary font-bold no-underline hover:underline"
          >
            {{ notification.user?.name || notification.userId || 'Anonymous' }}
          </a>
        </td>
        <td>
          <div class="flex gap-1 justify-content-center">
            <p-button
              [rounded]="true"
              icon="pi pi-eye"
              severity="info"
              (onClick)="view(notification)"
              [pTooltip]="'view' | translate"
              tooltipPosition="top"
            ></p-button>
            <p-button
              [rounded]="true"
              icon="pi pi-pencil"
              severity="success"
              (onClick)="edit(notification)"
              [pTooltip]="'edit' | translate"
              tooltipPosition="top"
            ></p-button>
            <p-button
              [rounded]="true"
              icon="pi pi-trash"
              severity="danger"
              (onClick)="deleteConfirm(notification)"
              [pTooltip]="'delete' | translate"
              tooltipPosition="top"
            ></p-button>
          </div>
        </td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="4">
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

## `src/app/demo/pages/notifications/notifications-list/notifications-list.component.scss`

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

## `src/app/demo/pages/notifications/notifications-list/notifications-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsListComponent } from './notifications-list.component';

describe('NotificationsListComponent', () => {
  let component: NotificationsListComponent;
  let fixture: ComponentFixture<NotificationsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/notifications/notifications-list/notifications-list.component.ts`

```ts
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RouterModule, Router } from '@angular/router';
import { INotification } from 'src/app/shared/model/inotification';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { NotificationsFormComponent } from '../notifications-form/notifications-form.component';
import { NotificationDetailsComponent } from '../notification-details/notification-details.component';
import { ToastrService } from 'ngx-toastr';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, TableModule, InputTextModule, ButtonModule, RouterModule, ConfirmDialogModule, SharedModule],
  providers: [ConfirmationService, DialogService],
  templateUrl: './notifications-list.component.html',
  styleUrl: './notifications-list.component.scss'
})
export class NotificationsListComponent {
  @ViewChild('dt') dt: Table;
  notifications: INotification[] = [];
  totalRecords: number = 0;
  loading: boolean = false;
  searchTerm: string = '';

  constructor(
    private notificationsService: NotificationsService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private toastService: ToastrService
  ) {}

  loadNotifications(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this.notificationsService.getAllNotifications(payload).subscribe({
      next: (res: any) => {
        if (res.data && Array.isArray(res.data)) {
          // Structure: { data: [], itemsCount: number }
          this.notifications = res.data;
          this.totalRecords = res.itemsCount;
        } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
          // Structure: { data: { data: [], itemsCount: number }, ... }
          this.notifications = res.data.data;
          this.totalRecords = res.data.itemsCount;
        } else {
          this.notifications = [];
          this.totalRecords = 0;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  refresh() {
    this.dt.reset();
  }

  onSearch(event?: any) {
    this.dt.reset();
  }

  navigateToCustomer(userId: number) {
    if (userId) {
      this.router.navigate(['/customer-details', userId]);
    }
  }

  deleteConfirm(notification: INotification) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this notification?',
      header: 'Delete Notification',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger m-2',
      rejectButtonStyleClass: 'p-button-secondary m-2',
      accept: () => {
        this.deleteNotification(notification.id);
      }
    });
  }

  deleteNotification(id: number) {
    this.notificationsService.deleteNotification(id).subscribe({
      next: () => {
        this.toastService.success('Notification deleted successfully');
        this.refresh();
      },
      error: () => {
        this.toastService.error('Notification deleted failed');
      }
    });
  }

  edit(notification: INotification) {
    const ref = this.dialogService.open(NotificationsFormComponent, {
      header: 'Edit Notification',
      width: '50%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: notification
    });

    ref.onClose.subscribe((res) => {
      if (res) {
        this.refresh();
      }
    });
  }

  view(notification: INotification) {
    this.dialogService.open(NotificationDetailsComponent, {
      header: 'Notification Details',
      width: '50%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: notification
    });
  }
}

```

---

## `src/app/demo/pages/notifications/notifications.component.html`

```html
<div class="main">
  <sub-header
  [mainHeader]="'Notifications'| translate"
   [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  />
  <app-notifications-list></app-notifications-list>
</div>
```

---

## `src/app/demo/pages/notifications/notifications.component.scss`

```scss

```

---

## `src/app/demo/pages/notifications/notifications.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsComponent } from './notifications.component';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/notifications/notifications.component.ts`

```ts
import { Component, ViewChild } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { Router } from '@angular/router';
import { NotificationsListComponent } from './notifications-list/notifications-list.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NotificationsFormComponent } from './notifications-form/notifications-form.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, NotificationsListComponent],
  providers: [DialogService],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent {
  ref: DynamicDialogRef | undefined;
  @ViewChild(NotificationsListComponent) notificationsList!: NotificationsListComponent;

  constructor(
    private router: Router,
    public dialogService: DialogService
  ) {}

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToNotificationForm();
        break;
    }
  }

  goToNotificationForm() {
    this.ref = this.dialogService.open(NotificationsFormComponent, {
      header: 'Send Notification',
      width: '50%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true
    });

    this.ref.onClose.subscribe((res) => {
      if (res) {
        this.notificationsList.loadNotifications({
          first: 0,
          rows: this.notificationsList.dt.rows,
          sortField: 'id',
          sortOrder: 1
        });
      }
    });
  }
}

```

---

## `src/app/demo/pages/outing/outing-branches/branches-form/branches-form.component.html`

```html
<div class="product-form p-4 mb-4">
  <div class="form-field">
    <form [formGroup]="branchesForm" (ngSubmit)="onSubmit()">
      <h3 class="flex justify-content-between">
        {{ config.data ? ('Edit Branch' | translate) : ('Add Branch' | translate) }}
      </h3>

      <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
        <!-- Name -->
        <div class="field col-md-12">
          <div class="flex flex-column gap-2">
            <label for="name">{{ 'Branch Name' | translate }}</label>
            <input
              pInputText
              id="name"
              formControlName="name"
              [ngClass]="{ 'ng-invalid ng-dirty': nameCtrl?.invalid && (nameCtrl?.touched || nameCtrl?.dirty) }"
            />
          </div>
          <small class="p-error" *ngIf="nameCtrl?.hasError('required') && (nameCtrl?.touched || nameCtrl?.dirty)">
            {{ 'Name is required' | translate }}
          </small>
          <small class="p-error" *ngIf="nameCtrl?.hasError('minlength')">
            {{ 'Name must be at least 3 characters' | translate }}
          </small>
        </div>

        <!-- Description -->
        <div class="field col-md-12">
          <div class="flex flex-column gap-2">
            <label for="desc">{{ 'Description' | translate }}</label>
            <textarea
              pInputTextarea
              id="desc"
              formControlName="description"
              [ngClass]="{ 'ng-invalid ng-dirty': descCtrl?.invalid && (descCtrl?.touched || descCtrl?.dirty) }"
            ></textarea>
          </div>
          <small class="p-error" *ngIf="descCtrl?.hasError('required') && (descCtrl?.touched || descCtrl?.dirty)">
            {{ 'Description is required' | translate }}
          </small>
        </div>
      </div>

      <!-- Buttons -->
      <div class="buttons mt-3 text-end">
        <p-button label="{{ 'Cancel' | translate }}" class="mx-1" severity="secondary" (onClick)="onCancel()"></p-button>

        <p-button
          label="{{ 'Save' | translate }}"
          severity="success"
          icon="pi pi-save"
          type="submit"
          [disabled]="branchesForm.invalid"
        ></p-button>
      </div>
    </form>
  </div>
</div>

```

---

## `src/app/demo/pages/outing/outing-branches/branches-form/branches-form.component.scss`

```scss

```

---

## `src/app/demo/pages/outing/outing-branches/branches-form/branches-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchesFormComponent } from './branches-form.component';

describe('BranchesFormComponent', () => {
  let component: BranchesFormComponent;
  let fixture: ComponentFixture<BranchesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/outing/outing-branches/branches-form/branches-form.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OutingBranshesService } from 'src/app/shared/services/outing-branshes.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-branches-form',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './branches-form.component.html',
  styleUrl: './branches-form.component.scss'
})
export class BranchesFormComponent implements OnInit {
  branchesForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private outingBranshesService: OutingBranshesService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    // Populate data if edit mode
    if (this.config.data) {
      this.branchesForm.patchValue({
        name: this.config.data.name,
        description: this.config.data.description
      });
    }
  }

  initializeForm() {
    this.branchesForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]]
    });
  }

  onCancel() {
    this.ref.close();
  }

  onSubmit() {
    // Mark all controls touched and validate
    this.branchesForm.markAllAsTouched();

    if (this.branchesForm.invalid) {
      return;
    }

    const payload = this.branchesForm.value;

    // Add id if in edit mode
    if (this.config?.data?.id) {
      // Typically update endpoints need ID in body or URL
      const updatePayload = { ...payload, id: this.config.data.id };
      this.updateBranch(updatePayload);
    } else {
      this.createBranch(payload);
    }
  }

  private createBranch(data: any) {
    this.outingBranshesService.addOutingBranches(data).subscribe({
      next: (res) => {
        if (res?.success) {
          this.toaster.success('Created successfully', 'Success');
          this.ref.close(res);
        } else {
          this.toaster.error('Failed to create', 'Error');
        }
      },
      error: (err) => {
        this.toaster.error('Create error', 'Error');
        console.error('Create error:', err);
      }
    });
  }

  private updateBranch(data: any) {
    this.outingBranshesService.updateOutingBranches(data).subscribe({
      next: (res) => {
        if (res?.success) {
          this.toaster.success('Updated successfully', 'Success');
          this.ref.close(res);
        } else {
          this.toaster.error('Failed to update', 'Error');
        }
      },
      error: (err) => {
        this.toaster.error('Update error', 'Error');
        console.error('Update error:', err);
      }
    });
  }

  // Helpers for template readability
  get nameCtrl() {
    return this.branchesForm.get('name');
  }

  get descCtrl() {
    return this.branchesForm.get('description');
  }
}

```

---

## `src/app/demo/pages/outing/outing-branches/branches-list/branches-list.component.html`

```html
<p-confirmDialog></p-confirmDialog>
<div class="card">
  <p-toolbar styleClass="mb-4">
    <ng-template pTemplate="right">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText type="text" [(ngModel)]="searchTerm" (input)="onSearch()" [placeholder]="'search' | translate" />
      </span>
    </ng-template>
  </p-toolbar>

  <p-table
    #dt
    [value]="branches"
    [paginator]="true"
    [rows]="10"
    [lazy]="true"
    (onLazyLoad)="loadBranches($event)"
    [totalRecords]="totalRecords"
    [loading]="loading"
    [rowsPerPageOptions]="[5, 10, 20, 50]"
    [showCurrentPageReport]="true"
    [currentPageReportTemplate]="'showingEntries' | translate"
    [globalFilterFields]="['name', 'description']"
  >
    <ng-template pTemplate="header">
      <tr>
        <th style="min-width: 200px" pSortableColumn="name">
          {{ 'Branch Name' | translate }}
          <p-sortIcon field="name"></p-sortIcon>
        </th>
        <th style="min-width: 300px" pSortableColumn="description">
          {{ 'Description' | translate }}
          <p-sortIcon field="description"></p-sortIcon>
        </th>
        <th style="min-width: 300px" pSortableColumn="description">
          {{ 'location' | translate }}
          <p-sortIcon field="description"></p-sortIcon>
        </th>

        <th style="min-width: 150px">{{ 'Action' | translate }}</th>
      </tr>
      <tr>
        <th>
          <p-columnFilter type="text" field="name" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="description" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="location" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th></th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-branch>
      <tr>
        <td>{{ branch.name }}</td>
        <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis" [title]="branch.description">
          {{ branch.description || 'N/A' }}
        </td>
        <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis" [title]="branch.location">
          {{ branch.location || 'N/A' }}
        </td>
        <td>
          <div class="flex gap-1 justify-content-center">
            <p-button [raised]="true" icon="pi pi-pencil" severity="success" [rounded]="true" (onClick)="handleEdit(branch)"></p-button>
            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" (onClick)="handleDelete(branch.id)"></p-button>
          </div>
        </td>
      </tr>
    </ng-template>

    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="3">
          <div class="flex flex-column justify-content-center align-items-center py-5 w-full">
            <i class="pi pi-search" style="font-size: 3rem; color: var(--gray-400)"></i>
            <span class="mt-2 text-gray-500 font-medium">{{ 'No Data found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/outing/outing-branches/branches-list/branches-list.component.scss`

```scss

```

---

## `src/app/demo/pages/outing/outing-branches/branches-list/branches-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchesListComponent } from './branches-list.component';

describe('BranchesListComponent', () => {
  let component: BranchesListComponent;
  let fixture: ComponentFixture<BranchesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/outing/outing-branches/branches-list/branches-list.component.ts`

```ts
import { Component, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OutingBranshesService } from 'src/app/shared/services/outing-branshes.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BranchesFormComponent } from '../branches-form/branches-form.component';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-branches-list',
  standalone: true,
  imports: [SharedModule],
  providers: [DialogService, ConfirmationService],
  templateUrl: './branches-list.component.html',
  styleUrl: './branches-list.component.scss'
})
export class BranchesListComponent {
  constructor(
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private toastrService: ToastrService,
    private outingBranshesService: OutingBranshesService
  ) {}

  @ViewChild('dt') dt: Table | undefined;

  branches: any[] = [];
  searchTerm: string = '';
  totalRecords: number = 0;
  loading: boolean = false;
  // first = 0;
  // rows = 10;
  ref: DynamicDialogRef | undefined;

  pageChange(event: any) {
    // Deprecated for loadBranches
  }

  onSearch() {
    this.dt?.reset();
  }

  refresh() {
    this.dt?.reset();
  }

  loadBranches(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this.outingBranshesService.getAllOutingBranches(payload).subscribe({
      next: (res: any) => {
        if (res?.success) {
          if (res.data?.data && Array.isArray(res.data.data)) {
            this.branches = res.data.data;
            this.totalRecords = res.data.itemsCount;
          } else if (Array.isArray(res.data)) {
            // Fallback for non-paginated arrays
            this.branches = res.data;
            this.totalRecords = res.data.length;
          } else {
            this.branches = [];
            this.totalRecords = 0;
          }
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading branches:', err);
        this.loading = false;
      }
    });
  }

  handleEdit(branch: any) {
    this.ref = this.dialogService.open(BranchesFormComponent, {
      header: 'Edit Branch',
      width: '50vw',
      modal: true,
      closable: true,
      data: branch, // Pass full branch object
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((data) => {
      if (data) {
        // Refresh the list with current pagination and search
        this.dt?.reset();
      }
    });
  }

  handleDelete(id: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this item?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-raised mx-2',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.outingBranshesService.deleteOutingBranches(id).subscribe({
          next: () => {
            // Adjust pagination if needed
            this.dt?.reset();
            this.toastrService.success('Deleted successfully', 'Success');
          },
          error: () => {
            this.toastrService.error('Failed to delete', 'Error');
          }
        });
      }
    });
  }
}

```

---

## `src/app/demo/pages/outing/outing-branches/outing-branches.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'Branches'"
    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  ></sub-header>
  <app-branches-list></app-branches-list>
</div>

```

---

## `src/app/demo/pages/outing/outing-branches/outing-branches.component.scss`

```scss

```

---

## `src/app/demo/pages/outing/outing-branches/outing-branches.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingBranchesComponent } from './outing-branches.component';

describe('OutingBranchesComponent', () => {
  let component: OutingBranchesComponent;
  let fixture: ComponentFixture<OutingBranchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingBranchesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingBranchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/outing/outing-branches/outing-branches.component.ts`

```ts
import { Component, ViewChild } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TranslateService } from '@ngx-translate/core';
import { BranchesListComponent } from './branches-list/branches-list.component';
import { BranchesFormComponent } from './branches-form/branches-form.component';

@Component({
  selector: 'app-outing-branches',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, BranchesListComponent],
  providers: [ConfirmationService, DialogService],
  templateUrl: './outing-branches.component.html',
  styleUrl: './outing-branches.component.scss'
})
export class OutingBranchesComponent {
  constructor(
    public dialogService: DialogService,
    private translate: TranslateService
  ) {}

  ref: DynamicDialogRef | undefined;
  @ViewChild(BranchesListComponent) branchesListComponent: BranchesListComponent | undefined;

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToBranchesForm();
        break;
    }
  }

  goToBranchesForm() {
    this.ref = this.dialogService.open(BranchesFormComponent, {
      header: this.translate.instant('Add Branch'),
      width: '50vw',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.branchesListComponent?.refresh();
      }
    });
  }
}

```

---

## `src/app/demo/pages/outing/outing-category/outing-category-list/outing-category-list.component.html`

```html
<p-confirmDialog></p-confirmDialog>
<div class="card">
  <p-toolbar styleClass="mb-4">
    <ng-template pTemplate="right">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText type="text" [(ngModel)]="searchTerm" (input)="onSearch()" [placeholder]="'search' | translate" />
      </span>
    </ng-template>
  </p-toolbar>
  <p-table
    #dt
    [value]="categories"
    [paginator]="true"
    [rows]="10"
    [lazy]="true"
    (onLazyLoad)="loadCategories($event)"
    [totalRecords]="totalRecords"
    [loading]="loading"
    [rowsPerPageOptions]="[5, 10, 20, 50]"
    [showCurrentPageReport]="true"
    [currentPageReportTemplate]="'showingEntries' | translate"
    [globalFilterFields]="['name', 'description']"
  >
    <ng-template pTemplate="header">
      <tr>
        <th style="min-width: 200px" pSortableColumn="name">
          {{ 'category name' | translate }}
          <p-sortIcon field="name"></p-sortIcon>
        </th>
        <th style="min-width: 300px" pSortableColumn="description">
          {{ 'category description' | translate }}
          <p-sortIcon field="description"></p-sortIcon>
        </th>
        <th style="min-width: 150px">{{ 'action' | translate }}</th>
      </tr>
      <tr>
        <th>
          <p-columnFilter type="text" field="name" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="description" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th></th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-category>
      <tr>
        <td>{{ category.name }}</td>
        <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis" [title]="category.description">
          {{ category.description }}
        </td>

        <td>
          <div class="flex gap-1 justify-content-center">
            <p-button
              [raised]="true"
              icon="pi pi-pencil"
              severity="success"
              [rounded]="true"
              (onClick)="handleEdit(category.name, category.description, category.id, category.imageUrl)"
              pTooltip="{{ 'edit' | translate }}"
              tooltipPosition="top"
            ></p-button>
            <p-button
              icon="pi pi-trash"
              severity="danger"
              [rounded]="true"
              (onClick)="handleDelete(category.id)"
              pTooltip="{{ 'delete' | translate }}"
              tooltipPosition="top"
            ></p-button>
          </div>
        </td>
      </tr>
    </ng-template>

    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="3">
          <div class="flex flex-column justify-content-center align-items-center py-5 w-full">
            <i class="pi pi-search" style="font-size: 3rem; color: var(--gray-400)"></i>
            <span class="mt-2 text-gray-500 font-medium">{{ 'No Data found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/outing/outing-category/outing-category-list/outing-category-list.component.scss`

```scss

```

---

## `src/app/demo/pages/outing/outing-category/outing-category-list/outing-category-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingCategoryListComponent } from './outing-category-list.component';

describe('OutingCategoryListComponent', () => {
  let component: OutingCategoryListComponent;
  let fixture: ComponentFixture<OutingCategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingCategoryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/outing/outing-category/outing-category-list/outing-category-list.component.ts`

```ts
import { Component, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OutingCategoryServiseService } from 'src/app/shared/services/outing-category-servise.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { OutingCategoryformComponent } from '../outing-categoryform/outing-categoryform.component';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-outing-category-list',
  standalone: true,
  imports: [SharedModule],
  providers: [DialogService, ConfirmationService],

  templateUrl: './outing-category-list.component.html',
  styleUrl: './outing-category-list.component.scss'
})
export class OutingCategoryListComponent {
  @ViewChild('dt') dt!: Table;
  constructor(
    private dialogService: DialogService,
    private ConfirmationService: ConfirmationService,
    private ToastrService: ToastrService,
    private OutingCategoryService: OutingCategoryServiseService
  ) {}
  pageChange(event: any) {
    // Deprecated in favor of onLazyLoad
  }
  onSearch() {
    this.dt.reset();
  }

  categories: any[] = []; // Fixed typo from 'catigoreys'
  searchTerm: string = '';

  totalRecords: number = 0;
  loading: boolean = false;
  // first = 0; // Handled by Table
  // rows = 10; // Handled by Table
  ref: DynamicDialogRef | undefined;

  loadCategories(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this.OutingCategoryService.getAlloutingCategoty(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.categories = res.data.data;
          this.totalRecords = res.data.itemsCount;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('error:', err);
        this.loading = false;
      }
    });
  }

  refresh() {
    this.dt.reset();
  }

  handleEdit(name: string, description: string, id: number, imageUrl) {
    this.ref = this.dialogService.open(OutingCategoryformComponent, {
      header: 'nationality',
      width: '50vw',
      modal: true,
      closable: true,
      data: { id, name, description, imageUrl },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((data) => {
      if (data) {
        this.dt.reset();
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
        this.OutingCategoryService.deleteOutingCategory(id).subscribe({
          next: () => {
            this.ToastrService.success(' deleted successfully', 'Success');
            this.dt.reset();
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

## `src/app/demo/pages/outing/outing-category/outing-category.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'categories'"
    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  ></sub-header>
  <app-outing-category-list></app-outing-category-list>
</div>

```

---

## `src/app/demo/pages/outing/outing-category/outing-category.component.scss`

```scss

```

---

## `src/app/demo/pages/outing/outing-category/outing-category.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingCategoryComponent } from './outing-category.component';

describe('OutingCategoryComponent', () => {
  let component: OutingCategoryComponent;
  let fixture: ComponentFixture<OutingCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/outing/outing-category/outing-category.component.ts`

```ts
import { Component, ViewChild } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { OutingCategoryListComponent } from './outing-category-list/outing-category-list.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TranslateService } from '@ngx-translate/core';
import { OutingCategoryformComponent } from './outing-categoryform/outing-categoryform.component';

@Component({
  selector: 'app-outing-category',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, OutingCategoryListComponent],
  providers: [ConfirmationService, DialogService],
  templateUrl: './outing-category.component.html',
  styleUrl: './outing-category.component.scss'
})
export class OutingCategoryComponent {
  constructor(
    private ConfigureService: ConfigureService,
    public dialogService: DialogService,
    private translate: TranslateService
  ) {}
  isFormVisible: boolean = false;
  ref: DynamicDialogRef | undefined;
  @ViewChild(OutingCategoryListComponent) OutingCategoryListComponent: OutingCategoryListComponent | undefined;

  isVendor(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }
  handleCitiesEdit(event: boolean) {
    this.isFormVisible = event;
  }

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToOutingCategoryform();
        break;
    }
  }
  goToOutingCategoryform() {
    console.log('goToVendorForm');
    this.isFormVisible = true;

    this.ref = this.dialogService.open(OutingCategoryformComponent, {
      header: this.translate.instant('outing category'),
      width: '50vw',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });
    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.OutingCategoryListComponent?.refresh();
      }
    });
  }
}

```

---

## `src/app/demo/pages/outing/outing-category/outing-categoryform/outing-categoryform.component.html`

```html
<div class="product-form p-4 mb-4">
  <div class="form-field">
    <form [formGroup]="OutingCategoryform" (ngSubmit)="onSubmit()">
      <h3 class="flex justify-content-between">
        {{ config.data ? ('edit outing category' | translate) : ('add outing category' | translate) }}
      </h3>

      <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">

        <!-- Name -->
        <div class="field col-md-12">
          <div class="flex flex-column gap-2">
            <label for="name">{{ 'outing category name' | translate }}</label>
            <input
              pInputText
              id="name"
              formControlName="Name"
              [ngClass]="{'ng-invalid ng-dirty': nameCtrl?.invalid && (nameCtrl?.touched || nameCtrl?.dirty)}"
            />
            <small>{{ 'enter outing category name' | translate }}</small>
          </div>
          <small class="error" *ngIf="nameCtrl?.hasError('required') && (nameCtrl?.touched || nameCtrl?.dirty)">
            * required
          </small>
          <small class="error" *ngIf="nameCtrl?.hasError('minlength')">
            * must be at least 3 characters
          </small>
        </div>

        <!-- Description -->
        <div class="field col-md-12">
          <div class="flex flex-column gap-2">
            <label for="desc">{{ 'Description' | translate }}</label>
            <textarea
              pInputTextarea
              id="desc"
              formControlName="Description"
              [ngClass]="{'ng-invalid ng-dirty': descCtrl?.invalid && (descCtrl?.touched || descCtrl?.dirty)}"
            ></textarea>
            <small>{{ 'enter Description' | translate }}</small>
          </div>
          <small class="error" *ngIf="descCtrl?.hasError('required') && (descCtrl?.touched || descCtrl?.dirty)">
            * required
          </small>
          <small class="error" *ngIf="descCtrl?.hasError('minlength')">
            * must be at least 5 characters
          </small>
        </div>

        <!-- Image -->
        <div class="field col-md-12">
          <div class="flex flex-column gap-2">
            <label>{{ 'bg image' | translate }}</label>
            <app-img-uploader
            [multiple]="false"
              [displayFiles]="existingImages"
              (filesChanged)="onImagesUpload($event)"
            ></app-img-uploader>
            <small>{{ 'enter background image' | translate }}</small>
          </div>
          <small class="error" *ngIf="showImageError">
            * required
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
        ></p-button>

        <p-button
          label="{{ 'save' | translate }}"
          severity="success"
          icon="pi pi-save"
          type="submit"
        ></p-button>
      </div>
    </form>
  </div>
</div>

```

---

## `src/app/demo/pages/outing/outing-category/outing-categoryform/outing-categoryform.component.scss`

```scss

```

---

## `src/app/demo/pages/outing/outing-category/outing-categoryform/outing-categoryform.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingCategoryformComponent } from './outing-categoryform.component';

describe('OutingCategoryformComponent', () => {
  let component: OutingCategoryformComponent;
  let fixture: ComponentFixture<OutingCategoryformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingCategoryformComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingCategoryformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/outing/outing-category/outing-categoryform/outing-categoryform.component.ts`

```ts
import { OutingCategoryServiseService } from './../../../../../shared/services/outing-category-servise.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';

@Component({
  selector: 'app-outing-categoryform',
  standalone: true,
  imports: [SharedModule, ImgUploaderComponent],
  templateUrl: './outing-categoryform.component.html',
  styleUrl: './outing-categoryform.component.scss'
})
export class OutingCategoryformComponent {
  OutingCategoryform: FormGroup;
  newImages: File[] = [];
  existingImages: { id: number; url: string }[] = [];
  showImageError = false;
  

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private OutingCategoryServise: OutingCategoryServiseService,
    private toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    // Populate data if edit mode
    if (this.config.data) {
      this.OutingCategoryform.patchValue({
        Name: this.config.data.name,
        Description: this.config.data.description
      });

      if (this.config.data.imageUrl) {
        this.existingImages = [{ id: 0, url: this.config.data.imageUrl }];
      }
    }
  }

  initializeForm() {
    this.OutingCategoryform = this.fb.group({
      Name: ['', [Validators.required, Validators.minLength(3)]],
      Description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]] ,
      IsActive: [true]
    });
  }

  onImagesUpload(files: File[] | null): void {
    this.newImages = files || [];
    this.showImageError = false;
  }

  onCancel() {
    this.ref.close();
  }

onSubmit() {
  // Mark all controls touched and validate
  this.OutingCategoryform.markAllAsTouched();
  this.OutingCategoryform.updateValueAndValidity();

  // Validate image
  this.showImageError = this.newImages.length === 0 && this.existingImages.length === 0;

  // Stop submission if any invalid
  if (this.OutingCategoryform.invalid || this.showImageError) {
    return;
  }

  // Prepare FormData
  const formData = new FormData();
  formData.append('Name', this.OutingCategoryform.get('Name')?.value);
  formData.append('Description', this.OutingCategoryform.get('Description')?.value);
  formData.append('IsActive', this.OutingCategoryform.get('IsActive')?.value);

  if (this.newImages.length > 0) {
    formData.append('UploadedImage', this.newImages[0]);
  }

  // Add id if in edit mode (backend expects it in body)
  if (this.config?.data?.id) {
    formData.append('id', this.config.data.id.toString());
    this.updateOutingCategory(formData);
  } else {
    this.createOutingCategory(formData);
  }
}



  private createOutingCategory(formData: FormData) {
    this.OutingCategoryServise.setOutingCategory(formData).subscribe({
      next: (res) => {
        this.toaster.success('Created successfully', 'Success');
        this.ref.close(res);
      },
      error: (err) => {
        this.toaster.error('Create error', 'Error');
        console.error('Create error:', err);
      }
    });
  }

  private updateOutingCategory(formData: FormData) {
  this.OutingCategoryServise.updateOutingCategory(formData).subscribe({
    next: (res) => {
      this.toaster.success('Updated successfully', 'Success');
      this.ref.close(res);
    },
    error: (err) => {
      this.toaster.error('Update error', 'Error');
      console.error('Update error:', err);
    }
  });
}


  // Helpers for template readability
  get nameCtrl() {
    return this.OutingCategoryform.get('Name');
  }

  get descCtrl() {
    return this.OutingCategoryform.get('Description');
  }
}

```

---

## `src/app/demo/pages/outing/outing-details/outing-details.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'outing details' | translate"
    [mainSection]="'outing Management' | translate"
    [subSection]="'Details' | translate"
  ></sub-header>

  <div class="border-1 border-solid surface-border border-round mb-4 p-4 shadow-3" *ngIf="outing; else loading">
    <div class="grid">
      <div class="col-12 col-md-6">
        <p-galleria
          [value]="imgs"
          [autoPlay]="false"
          [circular]="true"
          [showItemNavigators]="true"
          [thumbnailsPosition]="'bottom'"
          [responsiveOptions]="responsiveOptions"
          [containerStyle]="{ 'max-width': '100%' }"
          [numVisible]="4"
        >
          <ng-template pTemplate="item" let-item>
            <img
              [src]="item"
              class="w-full h-20rem border-round"
              style="object-fit: cover; margin-bottom: 10px"
              (error)="onImageError($event)"
              [alt]="outing?.name"
            />
          </ng-template>

          <ng-template pTemplate="thumbnail" let-item>
            <div class="grid grid-nogutter justify-content-center">
              <img
                [src]="item"
                class="w-7rem h-5rem border-round"
                style="object-fit: cover"
                (error)="onImageError($event)"
                [alt]="outing?.name"
              />
            </div>
          </ng-template>
        </p-galleria>
      </div>

      <div class="col-12 col-md-6 pl-4">
        <h2 class="text-3xl mb-2">{{ outing.name }}</h2>

        <div class="medium text-body-secondary mb-1">
          <i class="fas fa-map-marker-alt me-1"></i>
          {{ outing.location || 'N/A' }}
        </div>

        <div class="flex align-items-center gap-3 mb-4" *ngIf="outing.rating !== undefined">
          <p-rating [(ngModel)]="outing.rating" [readonly]="true" [cancel]="false"></p-rating>
          <span class="text-muted text-lg">({{ outing.rating }} / 5)</span>
        </div>

        <p class="text-muted mb-2">
          <i class="fas fa-tag mr-2"></i>
          {{ 'Price Range' | translate }}: {{ outing.miniPrice || 0 }} - {{ outing.maxPrice || 0 }}
        </p>

        <p class="text-muted mb-2">
          <i class="fas fa-calendar-alt mr-2"></i>
          {{ outing.startDate | date }} - {{ outing.endDate | date }}
        </p>

        <!-- <p class="text-muted mb-2">
          <i class="fas fa-users mr-2"></i>
          {{ 'Capacity' | translate }}: {{ outing.capacity || 0 }} ({{ outing.remainingSeats || 0 }} remaining)
        </p> -->

        <p class="text-muted mb-2">
          <i class="fas fa-info-circle mr-2"></i>
          {{ outing.description || '-' }}
        </p>
      </div>
    </div>

    <div class="shadow-3 bg-light p-3 border-round mt-4" *ngIf="outing.programs?.length">
      <h3 class="text-xl mb-3">{{ 'programs' | translate }}</h3>
      <p-timeline [value]="outing.programs" layout="vertical" align="right" class="customized-timeline">
        <ng-template pTemplate="content" let-program>
          <div [attr.dir]="currentLang === 'ar' ? 'rtl' : 'ltr'" class="p-3 border-1 surface-border surface-card border-round shadow-1">
            <h4 class="text-primary mb-1">{{ program.title }}</h4>
            <p class="mb-1">
              <strong>{{ 'Details' | translate }}:</strong>
              {{ program.details }}
            </p>
            <p class="mb-1">
              <i class="fas fa-calendar-alt mr-1"></i>
              {{ 'time' | translate }}: {{ program.time | date: 'short' }}
            </p>
            <div *ngIf="program.stepDescriptions?.length">
              <strong class="block mb-1">{{ 'Steps' | translate }}:</strong>
              <ul class="ml-3">
                <li *ngFor="let step of program.stepDescriptions">{{ step.description }}</li>
              </ul>
            </div>
          </div>
        </ng-template>

        <ng-template pTemplate="opposite" let-program>
          <small class="text-muted">{{ program.time | date: 'mediumDate' }}</small>
        </ng-template>
      </p-timeline>
    </div>

    <div class="grid mt-4">
      <div class="col-12 md:col-6">
        <h3 class="text-xl mb-2">{{ 'Tickets' | translate }}</h3>
        <p-table [value]="outing.tickets || []">
          <ng-template pTemplate="header">
            <tr>
              <th>{{ 'Type' | translate }}</th>
              <th>{{ 'Price' | translate }}</th>
              <th>{{ 'Available' | translate }}</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-t>
            <tr>
              <td>{{ t.ticketType }}</td>
              <td>{{ t.price }}</td>
              <td>{{ t.availableQuantity }}</td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <div class="col-12 md:col-6">
        <h3 class="text-xl mb-2">{{ 'Add-ons' | translate }}</h3>
        <p-table [value]="outing.addOns || []">
          <ng-template pTemplate="header">
            <tr>
              <th>{{ 'Name' | translate }}</th>
              <th>{{ 'Price' | translate }}</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-a>
            <tr>
              <td>{{ a.name }}</td>
              <td>{{ a.price }}</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <div class="grid mt-4" *ngIf="outing.branshes?.length">
      <div class="col-12">
        <h3 class="text-xl mb-2">{{ 'Branches' | translate }}</h3>
        <p-table [value]="outing.branshes">
          <ng-template pTemplate="header">
            <tr>
              <th>{{ 'ID' | translate }}</th>
              <th>{{ 'Name' | translate }}</th>
              <th>{{ 'Description' | translate }}</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-branch>
            <tr>
              <td>{{ branch.id }}</td>
              <td>{{ branch.name }}</td>
              <td>{{ branch.description }}</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <div class="grid mt-4" *ngIf="outing.outingSchedules?.length">
      <div class="col-12">
        <h3 class="text-xl mb-3">{{ 'Outing Schedules' | translate }}</h3>
        <p-accordion [activeIndex]="0">
          <p-accordionTab
            *ngFor="let schedule of outing.outingSchedules; let i = index"
            [header]="'Schedule ' + (i + 1) + ' - ' + getDayOfWeekName(schedule.dayOfWeek)"
          >
            <div class="grid">
              <div class="col-12 md:col-6">
                <div class="p-2 border-1 surface-border border-round">
                  <h4 class="text-primary mb-2">
                    <i class="fas fa-info-circle mr-2"></i>
                    {{ 'Schedule Information' | translate }}
                  </h4>

                  <div class="mb-2">
                    <strong>
                      <i class="fas fa-calendar-day mr-1"></i>
                      {{ 'Day' | translate }}:
                    </strong>
                    <span class="ml-2">{{ getDayOfWeekName(schedule.dayOfWeek) }}</span>
                  </div>

                  <div class="mb-2">
                    <strong>
                      <i class="fas fa-clock mr-1"></i>
                      {{ 'Time' | translate }}:
                    </strong>
                    <div class="ml-4" *ngFor="let time of schedule.times">
                      {{ formatTime(time.startTime) }} - {{ formatTime(time.endTime) }}
                    </div>
                  </div>

                  <div class="mb-2">
                    <strong>
                      <i class="fas fa-calendar-check mr-1"></i>
                      {{ 'Valid Period' | translate }}:
                    </strong>
                    <span class="ml-2">{{ schedule.validFrom | date: 'mediumDate' }} - {{ schedule.validTo | date: 'mediumDate' }}</span>
                  </div>

                  <div>
                    <strong>
                      <i class="fas fa-hashtag mr-1"></i>
                      {{ 'Total Days' | translate }}:
                    </strong>
                    <span class="ml-2">{{ schedule.days?.length || 0 }} {{ 'days' | translate }}</span>
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-6 mx-auto">
                <div class="p-2 border-1 surface-border border-round">
                  <h4 class="text-primary mb-2">
                    <i class="fas fa-calendar-alt mr-2"></i>
                    {{ 'Scheduled Days Calendar' | translate }}
                  </h4>
                  <p-calendar
                    [ngModel]="scheduledDates[i]"
                    [inline]="true"
                    [showWeek]="true"
                    styleClass="readonly-calendar"
                    selectionMode="multiple"
                    [numberOfMonths]="1"
                    [minDate]="schedule.validFrom"
                    [maxDate]="schedule.validTo"
                    dateFormat="yy-mm-dd"
                  ></p-calendar>
                  <div class="mt-2 p-2 bg-blue-50 border-round">
                    <small class="text-muted">
                      <i class="fas fa-info-circle mr-1"></i>
                      {{ 'Highlighted dates show all scheduled occurrences' | translate }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </p-accordionTab>
        </p-accordion>
      </div>
    </div>

    <div class="grid mt-4" *ngIf="outing.offers?.length">
      <div class="col-12">
        <h3 class="text-xl mb-3">{{ 'Offers' | translate }}</h3>
        <p-table [value]="outing.offers">
          <ng-template pTemplate="header">
            <tr>
              <th>{{ 'Title' | translate }}</th>
              <th>{{ 'Discount %' | translate }}</th>
              <th>{{ 'Discount Amount' | translate }}</th>
              <th>{{ 'Valid' | translate }}</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-o>
            <tr>
              <td>{{ o.title }}</td>
              <td>{{ o.discountPercentage }}</td>
              <td>{{ o.discountAmount }}</td>
              <td>{{ o.validFrom | date: 'mediumDate' }} - {{ o.validTo | date: 'mediumDate' }}</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  </div>

  <ng-template #loading>
    <div class="card p-4">
      <p>{{ 'Loading...' | translate }}</p>
    </div>
  </ng-template>
</div>

```

---

## `src/app/demo/pages/outing/outing-details/outing-details.component.scss`

```scss
:host ::ng-deep .readonly-calendar {
  .p-datepicker {
    table {
      pointer-events: none;
    }
    // Ensure header remains clickable
    .p-datepicker-header {
      pointer-events: auto;
    }
  }
}

```

---

## `src/app/demo/pages/outing/outing-details/outing-details.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingDetailsComponent } from './outing-details.component';

describe('OutingDetailsComponent', () => {
  let component: OutingDetailsComponent;
  let fixture: ComponentFixture<OutingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/outing/outing-details/outing-details.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { OutingService } from 'src/app/shared/services/outing.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-outing-details',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule],
  templateUrl: './outing-details.component.html',
  styleUrls: ['./outing-details.component.scss']
})
export class OutingDetailsComponent implements OnInit {
  outing: any = null;
  outingId: number | null = null;
  imgBaseUrl: string = environment.imgUrl || '';
  imgs: string[] = []; // used by Galleria (same name as travel example)
  currentLang: string;
  scheduledDates: Date[][] = []; // Store dates for each schedule

  responsiveOptions = [
    { breakpoint: '1024px', numVisible: 4 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 1 }
  ];

  constructor(
    private route: ActivatedRoute,
    private outingService: OutingService,
    private translateService: TranslateService
  ) {
    this.currentLang = this.translateService.currentLang || 'en';
    // Ensure no trailing slash
    this.imgBaseUrl = this.imgBaseUrl.replace(/\/$/, '');
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.outingId = +params['id'];
      this.getOutingDetails();
    });
  }

  getOutingDetails() {
    if (!this.outingId) return;

    this.outingService.getOutingById(this.outingId).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.outing = res.data;
          this.buildImages();
          this.processScheduleDates();
        } else {
          console.error('Failed to load outing or invalid response:', res);
        }
      },
      error: (err) => {
        console.error('Error loading outing details:', err);
      }
    });
  }

  private buildImages() {
    if (!this.outing?.images?.length) {
      this.imgs = [];
      return;
    }

    this.imgs = this.outing.images.map((img: any) => {
      const path = (img.url || img.path || img.imageUrl || '').toString();
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      return `${this.imgBaseUrl}/${cleanPath}`;
    });

    console.log('Final image URLs:', this.imgs);
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/no-image.png'; // ضع صورة افتراضية في assets
  }

  private processScheduleDates() {
    if (!this.outing?.outingSchedules?.length) {
      this.scheduledDates = [];
      return;
    }

    // Process dates and convert validFrom/validTo to Date objects
    this.outing.outingSchedules.forEach((schedule: any) => {
      // Convert validFrom and validTo to Date objects
      if (schedule.validFrom && typeof schedule.validFrom === 'string') {
        schedule.validFrom = new Date(schedule.validFrom);
      }
      if (schedule.validTo && typeof schedule.validTo === 'string') {
        schedule.validTo = new Date(schedule.validTo);
      }
    });

    this.scheduledDates = this.outing.outingSchedules.map((schedule: any) => {
      if (!schedule.days?.length) return [];
      return schedule.days.map((day: string) => new Date(day));
    });
  }

  getDayOfWeekName(dayNumber: number): string {
    // API uses 1-based index: 1=Saturday, 2=Sunday, 3=Monday, etc.
    const days = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday' ,'Saturday'];
    return days[dayNumber] || 'N/A';
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return 'N/A';

    // If it's in ISO format (contains 'Z' or 'T'), extract just the time part
    if (timeStr.includes('Z') || timeStr.includes('T')) {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    // If it's already in HH:mm format, return as is
    return timeStr;
  }
}

```

---

## `src/app/demo/pages/outing/outing-features/outing-features-form/outing-features-form.component.html`

```html
<div class="product-form p-4 mb-4">
  <div class="form-field">
    <form [formGroup]="featureForm" (ngSubmit)="onSubmit()">
      <h3 class="flex justify-content-between">
        {{ config.data ? ('edit outing feature' | translate) : ('add outing feature' | translate) }}
      </h3>

      <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
        <!-- Name -->
        <div class="field col-md-12">
          <div class="flex flex-column gap-2">
            <label for="name">{{ 'outing feature name' | translate }}</label>
            <input
              pInputText
              id="name"
              formControlName="name"
              [ngClass]="{ 'ng-invalid ng-dirty': nameCtrl?.invalid && (nameCtrl?.touched || nameCtrl?.dirty) }"
            />
            <small>{{ 'enter outing feature name' | translate }}</small>
          </div>
          <small class="error" *ngIf="nameCtrl?.hasError('required') && (nameCtrl?.touched || nameCtrl?.dirty)">* required</small>
          <small class="error" *ngIf="nameCtrl?.hasError('minlength')">* must be at least 3 characters</small>
        </div>

        <!-- Image -->
        <div class="field col-md-12">
          <div class="flex flex-column gap-2">
            <label>{{ 'feature image' | translate }}</label>
            <app-img-uploader
              [multiple]="false"
              [displayFiles]="existingImage ? [{ url: existingImage }] : []"
              (filesChanged)="onImageSelected($event)"
            ></app-img-uploader>
            <small>{{ 'enter feature image' | translate }}</small>
          </div>
          <small class="error" *ngIf="showImageError">* required</small>
        </div>
      </div>

      <!-- Buttons -->
      <div class="buttons mt-3 text-end">
        <p-button label="{{ 'Cancel' | translate }}" class="mx-1" severity="secondary" (onClick)="ref.close()"></p-button>

        <p-button label="{{ 'save' | translate }}" severity="success" icon="pi pi-save" type="submit"></p-button>
      </div>
    </form>
  </div>
</div>

```

---

## `src/app/demo/pages/outing/outing-features/outing-features-form/outing-features-form.component.scss`

```scss

```

---

## `src/app/demo/pages/outing/outing-features/outing-features-form/outing-features-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingFeaturesFormComponent } from './outing-features-form.component';

describe('OutingFeaturesFormComponent', () => {
  let component: OutingFeaturesFormComponent;
  let fixture: ComponentFixture<OutingFeaturesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingFeaturesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingFeaturesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/outing/outing-features/outing-features-form/outing-features-form.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastrService } from 'ngx-toastr';
import { OutingFeaturesService } from 'src/app/shared/services/outing-features.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-outing-features-form',
  standalone: true,
  imports: [CommonModule, SharedModule, ReactiveFormsModule, ImgUploaderComponent, ButtonModule],
  templateUrl: './outing-features-form.component.html',
  styleUrl: './outing-features-form.component.scss'
})
export class OutingFeaturesFormComponent implements OnInit {
  featureForm: FormGroup;
  selectedImage: File | null = null;
  existingImage: string | null = null;
  showImageError = false;

  constructor(
    private fb: FormBuilder,
    private outingFeaturesService: OutingFeaturesService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.initForm();
    if (this.config.data?.id) {
      this.patchFormWithExistingData();
    }
  }

  get nameCtrl() {
    return this.featureForm.get('name');
  }

  private initForm() {
    this.featureForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  private patchFormWithExistingData() {
    const featureData = this.config.data;
    this.featureForm.patchValue({
      name: featureData.name
    });
    if (featureData.image) {
      this.existingImage = featureData.image;
    }
  }

  onImageSelected(files: File[]) {
    if (files && files.length > 0) {
      this.selectedImage = files[0];
      this.showImageError = false;
    }
  }

  onSubmit() {
    if (this.featureForm.invalid || (!this.selectedImage && !this.existingImage)) {
      this.showImageError = !this.selectedImage && !this.existingImage;
      this.featureForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('name', this.nameCtrl?.value);

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    if (this.config.data?.id) {
      formData.append('id', this.config.data.id.toString());
      this.updateFeature(formData);
    } else {
      this.createFeature(formData);
    }
  }

  private createFeature(formData: FormData) {
    this.outingFeaturesService.addOutingFeature(formData).subscribe({
      next: () => {
        this.toastr.success('Feature created successfully');
        this.ref.close(true);
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error creating feature');
      }
    });
  }

  private updateFeature(formData: FormData) {
    this.outingFeaturesService.updateOutingFeature(formData).subscribe({
      next: () => {
        this.toastr.success('Feature updated successfully');
        this.ref.close(true);
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error updating feature');
      }
    });
  }
}

```

---

## `src/app/demo/pages/outing/outing-features/outing-features-list/outing-features-list.component.html`

```html
<p-confirmDialog></p-confirmDialog>
<div class="card">
  <p-toolbar styleClass="mb-4">
    <ng-template pTemplate="right">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText type="text" (input)="onSearch()" [(ngModel)]="searchTerm" [placeholder]="'search' | translate" />
      </span>
    </ng-template>
  </p-toolbar>

  <p-table
    #dt
    [value]="features"
    [paginator]="true"
    [rows]="10"
    [lazy]="true"
    (onLazyLoad)="loadFeatures($event)"
    [totalRecords]="totalRecords"
    [loading]="loading"
    [rowsPerPageOptions]="[5, 10, 20, 50]"
    [showCurrentPageReport]="true"
    [currentPageReportTemplate]="'showingEntries' | translate"
    [globalFilterFields]="['name']"
  >
    <ng-template pTemplate="header">
      <tr>
        <th style="min-width: 200px" pSortableColumn="name">
          {{ 'feature name' | translate }}
          <p-sortIcon field="name"></p-sortIcon>
        </th>
        <th style="width: 40%">{{ 'image' | translate }}</th>
        <th style="min-width: 150px">{{ 'action' | translate }}</th>
      </tr>
      <tr>
        <th>
          <p-columnFilter type="text" field="name" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th></th>
        <th></th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-feature>
      <tr>
        <td>{{ feature.name }}</td>
        <td>
          <img
            *ngIf="feature.imageUrl"
            [src]="baasicImageUrl + feature.imageUrl"
            alt="img"
            style="height: 40px; width: 60px; object-fit: cover; border-radius: 4px"
          />
        </td>
        <td>
          <div class="flex gap-1 justify-content-center">
            <p-button [raised]="true" icon="pi pi-pencil" severity="success" [rounded]="true" (onClick)="handleEdit(feature)"></p-button>
            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" (onClick)="handleDelete(feature.id)"></p-button>
          </div>
        </td>
      </tr>
    </ng-template>

    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="3">
          <div class="flex flex-column justify-content-center align-items-center py-5 w-full">
            <i class="pi pi-search" style="font-size: 3rem; color: var(--gray-400)"></i>
            <span class="mt-2 text-gray-500 font-medium">{{ 'No Data found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/outing/outing-features/outing-features-list/outing-features-list.component.scss`

```scss

```

---

## `src/app/demo/pages/outing/outing-features/outing-features-list/outing-features-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingFeaturesListComponent } from './outing-features-list.component';

describe('OutingFeaturesListComponent', () => {
  let component: OutingFeaturesListComponent;
  let fixture: ComponentFixture<OutingFeaturesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingFeaturesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingFeaturesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/outing/outing-features/outing-features-list/outing-features-list.component.ts`

```ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { OutingFeaturesService } from 'src/app/shared/services/outing-features.service';
import { OutingFeaturesFormComponent } from '../outing-features-form/outing-features-form.component';
import { environment } from 'src/environments/environment';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';
import { Table, TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'app-outing-features-list',
  standalone: true,
  imports: [SharedModule],
  providers: [DialogService, ConfirmationService],
  templateUrl: './outing-features-list.component.html',
  styleUrl: './outing-features-list.component.scss'
})
export class OutingFeaturesListComponent implements OnInit {
  baasicImageUrl: string = environment.imgUrl;
  @ViewChild('dt') dt!: Table;

  features: any[] = [];
  searchTerm: string = '';
  totalRecords: number = 0;
  loading: boolean = false;
  // first = 0;
  // rows = 10;
  ref: DynamicDialogRef | undefined;
  // filter: FilterMap = {};

  constructor(
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private toastr: ToastrService,
    private outingFeaturesService: OutingFeaturesService
  ) {}

  ngOnInit(): void {
    // Initial load handled by p-table lazy load
  }

  loadFeatures(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    this.outingFeaturesService.getAllOutingFeatures(payload).subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.features = res.data.data || res.data;
          this.totalRecords = res.data.itemsCount || this.features.length;
        } else if (Array.isArray(res)) {
          this.features = res;
          this.totalRecords = res.length;
        } else {
          this.features = res?.data || [];
          this.totalRecords = this.features.length;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching outing features', err);
        this.loading = false;
      }
    });
  }

  refresh() {
    this.dt.reset();
  }
  onSearch() {
    this.dt.reset();
  }

  pageChange(event: any) {
    // Deprecated for loadFeatures
  }

  searchByName(searchedKey: string) {
    // Deprecated for onSearch
  }

  handleEdit(item: any) {
    this.ref = this.dialogService.open(OutingFeaturesFormComponent, {
      header: 'Edit Outing Feature',
      width: '50vw',
      modal: true,
      closable: true,
      data: { id: item.id, name: item.name, image: item.imageUrl },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((data) => {
      if (data) {
        this.dt.reset();
      }
    });
  }

  handleDelete(id: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this item?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.outingFeaturesService.deleteOutingFeature(id).subscribe({
          next: () => {
            this.dt.reset();
            this.toastr.success('Deleted successfully', 'Success');
          },
          error: () => {
            this.toastr.error('Failed to delete', 'Error');
          }
        });
      }
    });
  }
}

```

---

## `src/app/demo/pages/outing/outing-features/outing-features.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'outing features' | translate"
    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus' ,class: 'btn-primary'}]"
    (actionClicked)="handleAction($event)"
  ></sub-header>

  <app-outing-features-list></app-outing-features-list>
</div>

```

---

## `src/app/demo/pages/outing/outing-features/outing-features.component.scss`

```scss

```

---

## `src/app/demo/pages/outing/outing-features/outing-features.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingFeaturesComponent } from './outing-features.component';

describe('OutingFeaturesComponent', () => {
  let component: OutingFeaturesComponent;
  let fixture: ComponentFixture<OutingFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingFeaturesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/outing/outing-features/outing-features.component.ts`

```ts
import { Component, ViewChild } from '@angular/core';
import { OutingFeaturesListComponent } from './outing-features-list/outing-features-list.component';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OutingFeaturesFormComponent } from './outing-features-form/outing-features-form.component';
import { TranslateService } from '@ngx-translate/core';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';

@Component({
  selector: 'app-outing-features',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, OutingFeaturesListComponent],
  providers: [DialogService],
  templateUrl: './outing-features.component.html',
  styleUrl: './outing-features.component.scss'
})
export class OutingFeaturesComponent {
  filter = {
    pageIndex: 1,
    pageSize: 10,
    search: ''
  };
  ref: DynamicDialogRef | undefined;
  @ViewChild(OutingFeaturesListComponent)
  outingFeaturesListComponent!: OutingFeaturesListComponent;

  constructor(
    private configureService: ConfigureService,
    public dialogService: DialogService,
    private translate: TranslateService
  ) {}

  isVendor(): boolean {
    const roles = this.configureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.openAddFeatureDialog();
        break;
    }
  }

  openAddFeatureDialog() {
    this.ref = this.dialogService.open(OutingFeaturesFormComponent, {
      header: this.translate.instant('outing features'),
      width: '50vw',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((result) => {
      if (result) {
        // refresh list if available
        this.outingFeaturesListComponent?.refresh();
      }
    });
  }
}

```

---

