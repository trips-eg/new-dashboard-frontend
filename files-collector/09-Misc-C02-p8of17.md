# 09 – Misc (Part 8/17 of Misc)

> **Description:** Everything else that didn't fit the categories above. [Category: C02]
> **Generated:** 2026-03-02 20:16:48

---

## `src/app/demo/pages/settings/room-features/room-features-list/room-features-list.component.html`

```html
<p-toast></p-toast>
<p-confirmDialog></p-confirmDialog>
<div class="card">
  <p-toolbar>
    <ng-template pTemplate="right">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText type="text" [(ngModel)]="searchTerm" (input)="onSearch()" [placeholder]="'search' | translate" />
      </span>
    </ng-template>
  </p-toolbar>
  <p-table
    #dt
    [value]="roomFeaturies"
    [paginator]="true"
    [rows]="rows"
    [lazy]="true"
    (onLazyLoad)="loadRoomFeatures($event)"
    [totalRecords]="totalRecords"
    [rowsPerPageOptions]="[5, 10]"
    [showCurrentPageReport]="true"
    [loading]="loading"
    [currentPageReportTemplate]="'showingEntries' | translate"
  >
    <ng-template pTemplate="header">
      <tr>
        <th style="width: 35%" pSortableColumn="name">
          {{ 'room features' | translate }}
          <p-sortIcon field="name"></p-sortIcon>
        </th>
        <th style="width: 35%">{{ 'action' | translate }}</th>
        <!-- <th style="width: 30%">Action</th> -->
      </tr>
      <tr>
        <th>
          <input
            pInputText
            type="text"
            (input)="dt.filter($any($event.target).value, 'name', 'contains')"
            [placeholder]="'Search by Name' | translate"
          />
        </th>
        <th></th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-roomFeature>
      <tr>
        <td>{{ roomFeature.name }}</td>

        <td>
          <div class="flex gap-1 justify-content-center">
            <p-button
              [raised]="true"
              icon="pi pi-pencil"
              severity="success"
              [rounded]="true"
              (onClick)="handleEdit(roomFeature.id, roomFeature.name)"
            ></p-button>
            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" (onClick)="handleDelete(roomFeature.id)"></p-button>
          </div>
        </td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="6">
          <div class="d-flex justify-content-center align-items-center py-3 w-100">
            <i class="pi pi-info-circle" style="font-size: 1rem; color: gray"></i>
            <span class="ms-2" style="color: gray">{{ 'No Data found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/settings/room-features/room-features-list/room-features-list.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/room-features/room-features-list/room-features-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomFeaturesListComponent } from './room-features-list.component';

describe('RoomFeaturesListComponent', () => {
  let component: RoomFeaturesListComponent;
  let fixture: ComponentFixture<RoomFeaturesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomFeaturesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomFeaturesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/room-features/room-features-list/room-features-list.component.ts`

```ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IroomFeaturies } from 'src/app/shared/model/iroom-featuries';
import { RoomFeaturiesService } from 'src/app/shared/services/room-featuries.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { RoomFeaturesFormComponent } from '../room-features-form/room-features-form.component';
import { ToastrService } from 'ngx-toastr';

import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';
import { Table, TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'app-room-features-list',
  standalone: true,
  imports: [SharedModule],
  providers: [ConfirmationService, MessageService, DialogService],
  templateUrl: './room-features-list.component.html',
  styleUrl: './room-features-list.component.scss'
})
export class RoomFeaturesListComponent implements OnInit {
  @ViewChild('dt') dt: Table;
  searchTerm: string = '';
  first = 0;
  rows = 10;
  ref: DynamicDialogRef | undefined;

  roomFeaturies: IroomFeaturies[] = [];
  totalRecords: number = 0;
  loading: boolean = true;

  constructor(
    private _RoomFeaturiesService: RoomFeaturiesService,
    private ConfirmationService: ConfirmationService,
    private MessageService: MessageService,
    private dialogService: DialogService,
    private ToastrService: ToastrService
  ) {}

  ngOnInit(): void {}

  loadRoomFeatures(event: TableLazyLoadEvent) {
    this.loading = true;
    const filter = TableRequestBuilder.build(event, this.searchTerm);
    this._RoomFeaturiesService.getAllRoomFeaturies(filter).subscribe({
      next: (res: any) => {
        this.roomFeaturies = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.loading = false;
        console.log('roomFeaturies:', this.roomFeaturies);
      },
      error: (err) => {
        this.loading = false;
        console.log('Get room features error:', err);
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
        this._RoomFeaturiesService.deleteRoomFeature(id).subscribe({
          next: () => {
            this.dt.reset();
            this.ToastrService.success('Room Feature deleted successfully', 'Success');
          },
          error: () => {
            this.ToastrService.error('Failed to delete room feature', 'Error');
          }
        });
      }
    });
  }

  handleEdit(id: number, name: string) {
    this.ref = this.dialogService.open(RoomFeaturesFormComponent, {
      header: 'Edit room feature',
      width: '50vw',
      modal: true,
      closable: true,
      data: { id, name },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((data) => {
      if (data) {
        this.dt.reset();
        this.ToastrService.success('Room Feature updated successfully', 'Success');
      }
    });
  }

  // handleAdd() {
  //   this.ref = this.dialogService.open(RoomFeaturesFormComponent, {
  //     header: 'Add Bed Type',
  //     width: '50vw',
  //     modal: true,
  //     closable: true,

  //     breakpoints: {
  //       '960px': '75vw',
  //       '640px': '90vw'
  //     }
  //   });

  //   this.ref.onClose.subscribe((data) => {
  //     if (data) {
  //       // Refresh the list with current pagination and search
  //       const pageIndex = this.first / this.rows + 1;
  //       this.getingAllRoomFeaturies(pageIndex, this.rows, this.searchTerm);
  //       this.MessageService.add({
  //         severity: 'success',
  //         summary: 'Success',
  //         detail: 'Bed type created successfully'
  //       });
  //     }
  //   });
  // }

  onSearch() {
    this.dt.reset();
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}

```

---

## `src/app/demo/pages/settings/room-features/room-features.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'room features' "
    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  ></sub-header>
<app-room-features-list></app-room-features-list>
</div>

```

---

## `src/app/demo/pages/settings/room-features/room-features.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/room-features/room-features.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomFeaturesComponent } from './room-features.component';

describe('RoomFeaturesComponent', () => {
  let component: RoomFeaturesComponent;
  let fixture: ComponentFixture<RoomFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomFeaturesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/room-features/room-features.component.ts`

```ts
import { Component, ViewChild } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { RoomFeaturesListComponent } from './room-features-list/room-features-list.component';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { RoomFeaturesFormComponent } from './room-features-form/room-features-form.component';
import { MessageService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-room-features',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, RoomFeaturesListComponent],
  providers: [DialogService, MessageService],
  templateUrl: './room-features.component.html',
  styleUrl: './room-features.component.scss'
})
export class RoomFeaturesComponent {
  ref: DynamicDialogRef | undefined;
  @ViewChild(RoomFeaturesListComponent) roomFeaturesListComponent!: RoomFeaturesListComponent;
  constructor(
    private dialogService: DialogService,
    private translate: TranslateService,
    private ToastrService: ToastrService
  ) {}
  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToRoomFeatureForm();
        break;
    }
  }
  goToRoomFeatureForm() {
    console.log('goToroomFeatureForm');
    this.ref = this.dialogService.open(RoomFeaturesFormComponent, {
      header: this.translate.instant('Room Feature'),
      width: '50vw',
      modal: true,
      closable: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });
    this.ref.onClose.subscribe((data) => {
      if (data) {
        this.roomFeaturesListComponent.ngOnInit();
        this.ToastrService.success('Room Feature Added Successfully', 'Success');
      }
    });
  }
}

```

---

## `src/app/demo/pages/settings/room-groups/room-group-form/room-group-form.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="isEditing ? ('Edit group' | translate) : ('Add group' | translate)"
    [mainSection]="'groups' | translate"
    [subSection]="isEditing ? ('Edit' | translate) : ('Add' | translate)"
  ></sub-header>

  <div class="product-form shadow-3 p-4">
    <form [formGroup]="roomForm" (ngSubmit)="onSubmit()">
      <!-- Room Group Panel -->
      <p-panel header="{{ 'Room group' | translate }}" toggleable styleClass="mt-3">
        <div class="formgrid grid">
          <!-- Group Name -->
          <div class="field col-12 col-md-6" [ngClass]="{ 'w-100': isEditing }">
            <label for="groubName">{{ 'group name' | translate }}</label>
            <input type="text" pInputText id="groubName" formControlName="GroupName" />
            <div class="text-danger" *ngIf="shouldShowError('GroupName')">
              {{ 'Please enter a group name' | translate }}
            </div>
          </div>

          <!-- Room Count -->
          <div class="field col-12 col-md-6" *ngIf="!isEditing">
            <label for="roomCount">{{ 'Room Count' | translate }}</label>
            <p-inputNumber
              mode="decimal"
              [showButtons]="true"
              buttonLayout="horizontal"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              decrementButtonClass="p-button-danger"
              incrementButtonClass="p-button-success"
              inputId="roomCount"
              id="roomCount"
              formControlName="RoomsCount"
              [min]="1"
            ></p-inputNumber>
            <div class="text-danger" *ngIf="shouldShowError('CountRoomCreated')">
              {{ 'Please enter room count' | translate }}
            </div>
          </div>

          <!-- Room Images -->
          <div class="field col-12">
            <label>{{ 'group imgs' | translate }}</label>
            <app-img-uploader
              [multiple]="true"
              (filesChanged)="onOtherImagesUpload($event)"
              [displayFiles]="displayFilesForUploader"
            ></app-img-uploader>
          </div>
        </div>
      </p-panel>

      <!-- Room Info Panel -->
      <p-panel header="{{ 'Room Info' | translate }}" toggleable styleClass="custom-panel mt-3" *ngIf="!isEditing">
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
                formControlName="AvailableFrom"
                [showTime]="true"
                hourFormat="12"
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
              <p-calendar
                id="availableTo"
                formControlName="AvailableTo"
                [showTime]="true"
                hourFormat="12"
                showIcon="true"
                [iconDisplay]="'input'"
              />
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
          </div>
        </div>
      </p-panel>

      <!-- Pricing Panel -->
      <p-panel header="{{ 'Pricing' | translate }}" toggleable styleClass="custom-panel mt-3" *ngIf="!isEditing">
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
                  <p-calendar formControlName="from" showIcon="true" hourFormat="12" [iconDisplay]="'input'" />
                  <div class="text-danger" *ngIf="shouldShowError('customPrices', i, 'from')">
                    {{ 'Please select available from date' | translate }}
                  </div>
                </div>

                <!-- To -->
                <div class="field col-12 col-md-4">
                  <label for="availableTo">{{ 'To' | translate }}</label>
                  <p-calendar formControlName="to" showIcon="true" hourFormat="12" [iconDisplay]="'input'" />
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
      <p-panel header="{{ 'policies' | translate }}" toggleable styleClass="custom-panel mt-3" *ngIf="!isEditing">
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
      <!-- <div *ngIf="roomForm.invalid" class="alert alert-danger mt-3 p-3 border border-danger">
        <strong>{{ 'Error' | translate }}:</strong>
        {{ 'Please fill out all required fields correctly' | translate }}
      </div> -->
    </form>
  </div>
</div>

```

---

## `src/app/demo/pages/settings/room-groups/room-group-form/room-group-form.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/room-groups/room-group-form/room-group-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomGroupFormComponent } from './room-group-form.component';

describe('RoomGroupFormComponent', () => {
  let component: RoomGroupFormComponent;
  let fixture: ComponentFixture<RoomGroupFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomGroupFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomGroupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/room-groups/room-group-form/room-group-form.component.ts`

```ts
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MessageService } from 'primeng/api';
import { IbedTybies } from 'src/app/shared/model/ibed-tybies';
import { Ihotel } from 'src/app/shared/model/ihotel';
import { IroomFeaturies } from 'src/app/shared/model/iroom-featuries';
import { IroomTypies } from 'src/app/shared/model/iroom-typies';
import { BedTybeService } from 'src/app/shared/services/bed-tybe.service';
import { HotelService } from 'src/app/shared/services/hotel.service';
import { RoomFeaturiesService } from 'src/app/shared/services/room-featuries.service';
import { RoomTybeService } from 'src/app/shared/services/room-tybe.service';
import { RoomService } from 'src/app/shared/services/room.service';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { RoomGroupsService } from 'src/app/shared/services/room-groups.service';
import { EnumsService } from 'src/app/shared/services/enums.service';

@Component({
  selector: 'app-room-group-form',
  standalone: true,
  imports: [SharedModule, ImgUploaderComponent, SubHeaderComponent],
  templateUrl: './room-group-form.component.html',
  styleUrl: './room-group-form.component.scss'
})
export class RoomGroupFormComponent {
  roomForm: FormGroup;
  submitted = false;
  roomTybies: IroomTypies[] = [];
  hotels: Ihotel[] = [];
  bedTybies: IbedTybies[] = [];
  roomFeaturies: IroomFeaturies[] = [];
  isEditing = false;
  roomId: number | null = null;
  displayFilesForUploader: any[] = [];
  vendorId = this.ConfigureService.UserId();
  boardingTypes: any[] = [];
  first = 0;
  rows = 10;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private _MessageService: MessageService,
    private _HotelService: HotelService,
    private translate: TranslateService,
    private _RoomTybeService: RoomTybeService,
    private _RoomGroupsService: RoomGroupsService,
    private _BedTybeService: BedTybeService,
    private _RoomFeaturiesService: RoomFeaturiesService,
    private ToastrService: ToastrService,
    private ConfigureService: ConfigureService,
    private enums: EnumsService
  ) {}
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
  ngOnInit(): void {
    console.log(this.vendorId);
    this.getBoardingTypes();
    const idParam = this.route.snapshot.paramMap.get('id');
    this.roomId = idParam ? Number(idParam) : null;

    if (this.roomId) {
      this.isEditing = true;
      this.roomForm = this.buildEditForm(); // Build form after setting isEditing

      this.loadGroupData(this.roomId);
    } else {
      this.gettingAllHotels(this.first, this.rows);
      this.getingAllBedTybies(this.first, this.rows);
      this.gettingAllRoomTybes(this.first, this.rows);
      this.getingAllRoomFeaturies(this.first, this.rows);
      this.isEditing = false;
      this.roomForm = this.buildEmptyForm(); // Build form after setting isEditing
    }
  }

  buildEditForm(): FormGroup {
    const form = this.fb.group({
      Id: [this.roomId],
      GroupName: ['', Validators.required]
    });
    return form;
  }

  buildEmptyForm(): FormGroup {
    const form = this.fb.group({
      Id: [this.vendorId],
      GroupName: ['', this.isEditing ? null : Validators.required],
      RoomsCount: [0, this.isEditing ? null : [Validators.required, Validators.min(1)]],
      Status: [true, Validators.required],
      Description: ['', Validators.required],
      Size: [0, [Validators.required, Validators.min(1)]],
      BedCount: [0, [Validators.required, Validators.min(1)]],
      Price: [0, [Validators.required, Validators.min(1)]],
      ChildPrice: [0, Validators.required],

      HolidayPrice: [0],
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

  // fillFormData(data: any): void {
  //   // Map JSON data to form controls
  //   this.roomForm.patchValue({
  //     Id: data.id || 0,
  //     Name: data.name || '',
  //     Description: data.description || '',
  //     Size: data.size || 0,
  //     BedCount: data.bedCount || 0,
  //     Price: data.price || 0,
  //     HolidayPrice: data.holidayPrice || 0, // Default to 0 if not provided
  //     CancellationPolicy: data.cancellationPolicy || '',
  //     IsRefundable: data.isRefundable || false,
  //     MinimumDaysToRefund: data.minimumDaysToRefund || null,
  //     IsAllowPaymentUponArrival: data.isAllowPaymentUponArrival || false,
  //     depositRate: data.depositRate || 0,
  //     Boarding: data.boarding || '',
  //     AvailableFrom: data.availableFrom ? new Date(data.availableFrom) : null,
  //     AvailableTo: data.availableTo ? new Date(data.availableTo) : null,
  //     HotelId: data.hotelId || 0,
  //     RoomTypeId: data.roomTypeId || 0,
  //     BedTypeId: data.bedTypeId || 0,
  //     CountRoomCreated: data.countRoomCreated || 1, // Default to 1 if not provided
  // Features: data.features ? data.features.map(f => f.id) : []
  //   });

  //   // Handle CustomPrices
  //   if (data.customPrices && data.customPrices.length > 0) {
  //     this.customPrices.clear();
  //     data.customPrices.forEach((price: any) => {
  //       const priceGroup = this.createCustomPriceGroup();
  //       priceGroup.patchValue({
  //         from: price.from ? new Date(price.from) : null,
  //         to: price.to ? new Date(price.to) : null,
  //         price: price.price || 0
  //       });
  //       this.customPrices.push(priceGroup);
  //     });
  //   } else {
  //     // Ensure at least one empty custom price group exists
  //     this.customPrices.clear();
  //     this.customPrices.push(this.createCustomPriceGroup());
  //   }

  //   // Trigger conditional validators
  //   this.roomForm.get('IsRefundable')?.updateValueAndValidity({ emitEvent: true });
  //   this.roomForm.get('IsAllowPaymentUponArrival')?.updateValueAndValidity({ emitEvent: true });
  // }

  loadGroupData(id: number): void {
    this._RoomGroupsService.getRoomTypeById(id).subscribe({
      next: (res) => {
        const roomData = res?.data;
        if (roomData) {
          this.roomForm.patchValue({
            GroupName: roomData.groupName
          });
          // Prepare images for the uploader component
          this.displayFilesForUploader = roomData.groupImages;
          // .map((image) => ({
          //   imagePath: image.url,
          //   imageId: image.id // or any identifier if you have one
          // }));
        }
      },
      error: (error) => {
        this._MessageService.add({
          severity: 'error',
          summary: this.translate.instant('Error'),
          detail: this.translate.instant('Failed to load room data: ' + (error.message || 'Unknown error'))
        });
        this.router.navigate(['/room-groups']);
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
      this.createGroupOfRooms();
    }
  }

  // Helper function to convert Date to ISO string or handle null/invalid dates
  private toISOString(date: any): string | null {
    if (!date) return null;
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
  }

  createGroupOfRooms(): void {
    debugger;
    this.submitted = true;

    // 1. Create FormData
    const formData = new FormData();
    const formValue = this.roomForm.value;

    // 2. Add text fields and convert dates to ISO
    Object.keys(formValue).forEach((key) => {
      if (key !== 'CustomPrices' && key !== 'Features' && formValue[key] !== null && formValue[key] !== undefined) {
        if (key === 'AvailableFrom' || key === 'AvailableTo') {
          const isoDate = this.toISOString(formValue[key]);
          if (isoDate) {
            formData.append(key, isoDate);
          }
        } else {
          formData.append(key, formValue[key]);
        }
      } else if (key === 'Features' && Array.isArray(formValue.Features)) {
        formValue.Features.forEach((feature: any, index: number) => {
          formData.append(`Features`, feature);
        });
      } else if (key === 'CustomPrices' && Array.isArray(formValue.CustomPrices)) {
        formValue.CustomPrices.forEach((PRICEPLAN: any) => {
          const fromIso = this.toISOString(PRICEPLAN.from);
          const toIso = this.toISOString(PRICEPLAN.to);

          if (fromIso && toIso) {
            const pricePlanData: any = {
              from: fromIso,
              to: toIso,
              price: PRICEPLAN.price
            };

            formData.append('CustomPrices', JSON.stringify(pricePlanData));
          }
        });
      }
    });
    //   if (key !== 'CustomPrices' && formValue[key] !== null && formValue[key] !== undefined && key !== 'Features') {
    //     if (key === 'AvailableFrom' || key === 'AvailableTo') {
    //       const isoDate = this.toISOString(formValue[key]);
    //       if (isoDate) {
    //         formData.append(key, isoDate);
    //       }
    //     } else {
    //       formData.append(key, formValue[key]);

    //     }
    //   } else {
    //     formValue.CustomPrices.forEach((PRICEPLAN: any, index: number) => {
    //       const fromIso = this.toISOString(PRICEPLAN.from);
    //       const toIso = this.toISOString(PRICEPLAN.to);
    //       if (fromIso && toIso) {
    //         const pricePlanData = {
    //           from: fromIso,
    //           to: toIso,
    //           price: PRICEPLAN.price
    //         };
    //         formData.append(`CustomPrices[${index}]`, JSON.stringify(pricePlanData));
    //       }
    //     });
    //   }
    // });

    // 4. Add images as binary
    this.otherImages.forEach((file, index) => {
      // formData.append(`ImagesFiles[${index}]`,file,file.name);

      formData.append('ImagesFiles', file, file.name);
    });

    // 5. Send the data
    this._RoomGroupsService.setGroupOfRooms(formData).subscribe({
      next: (response) => {
        this.router.navigate(['/room-groups']);
        this.ToastrService.success(`${response.message} Created successfully`);
      },
      error: (error) => {
        console.error('Error:', error);
        this.ToastrService.error('Error creating room');
      }
    });
  }

  updateRoom() {
    const model = this.roomForm.value;
    const formData = new FormData();

    // إضافة باقي حقول الفورم
    Object.keys(model).forEach((key) => {
      if (key !== 'groupImages' && model[key] !== null && model[key] !== undefined) {
        formData.append(key, model[key]);
      }
    });

    // إرسال الصور
    this.otherImages.forEach((file, index) => {
      // formData.append(`ImagesFiles[${index}]`,file,file.name);

      formData.append('UploadedImages', file, file.name);
    });

    this._RoomGroupsService.updateRoomGroup(formData).subscribe({
      next: () => {
        this.ToastrService.success(this.translate.instant('Room updated successfully'));
        this.router.navigate(['/room-groups']);
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
        this.router.navigate(['/room-groups']);
      }
    } else {
      this.router.navigate(['/room-groups']);
    }
  }
}

```

---

## `src/app/demo/pages/settings/room-groups/room-group-list/room-group-list.component.html`

```html
<div class="card">
  <p-toolbar>
    <ng-template pTemplate="right">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText type="text" [(ngModel)]="search" (input)="onSearch()" [placeholder]="'search' | translate" />
      </span>
    </ng-template>
  </p-toolbar>
  <p-table
    [value]="roomGroups"
    [paginator]="true"
    [lazy]="true"
    [rows]="rowsPerPage"
    [first]="first"
    [totalRecords]="totalRecords"
    [tableStyle]="{ 'min-width': '50rem' }"
    [rowsPerPageOptions]="[5, 10, 20]"
    (onLazyLoad)="pageChange($event)"
    [currentPageReportTemplate]="'showingEntries' | translate"
    [showCurrentPageReport]="true"
  >
    <ng-template pTemplate="header">
      <tr>
        <th >{{'group Name' | translate}}</th>
        <th style="width: 10%;">{{'roomsCount' | translate}}</th>
        <th >{{'Company'|translate}}</th>
        <th >{{'hotel'|translate}}</th>
        <th style="width: 10%;">{{'Actions'|translate}}</th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-group>
      <tr>
        <td>{{ group.groupName }}</td>
        <td>{{ group.roomsCount }}</td>
        <td>vendor</td>
        <td>hotel</td>
        <td>
           <p-button
              [raised]="true"
              icon="pi pi-pencil"
              severity="success"
              [rounded]="true"
              (click)="editRoomGroup(group.id)"
              pTooltip="{{ 'edit' | translate }}"
              tooltipPosition="top"
              appendTo="body"
            ></p-button>
        </td>

      </tr>
    </ng-template>
    <!-- Empty Message -->
      <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="4">
          <div class="d-flex justify-content-center align-items-center py-3 w-100">
            <i class="pi pi-info-circle" style="font-size: 1rem; color: gray"></i>
            <span class="ms-2" style="color: gray">{{ 'No Data found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/settings/room-groups/room-group-list/room-group-list.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/room-groups/room-group-list/room-group-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomGroupListComponent } from './room-group-list.component';

describe('RoomGroupListComponent', () => {
  let component: RoomGroupListComponent;
  let fixture: ComponentFixture<RoomGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomGroupListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/room-groups/room-group-list/room-group-list.component.ts`

```ts
import { RoomGroupsService } from 'src/app/shared/services/room-groups.service';
import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room-group-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './room-group-list.component.html',
  styleUrl: './room-group-list.component.scss'
})
export class RoomGroupListComponent implements OnInit {
  roomGroups: any[] = [];
  totalRecords: number = 0;
  rowsPerPage: number = 10;
  first: number = 0;
  search: string = '';
  filterMap = {
    pageIndex: this.first / this.rowsPerPage + 1,
    pageSize: this.rowsPerPage,
    search: this.search
  };

  constructor(
    private RoomGroupsService: RoomGroupsService,
    private Router: Router
  ) {}

  ngOnInit(): void {
    this.loadRoomGroups(this.filterMap);
  }
  pageChange(event: any) {
    this.filterMap = {
      pageIndex: event.first / event.rows + 1,
      pageSize: event.rows,
      search: this.search
    };
    this.first = event.first;
    this.rowsPerPage = event.rows;
    this.loadRoomGroups(this.filterMap);
  }
  onSearch() {
    // Reset to first page
    this.filterMap = {
      pageIndex: this.first / this.rowsPerPage + 1,
      pageSize: this.rowsPerPage,
      search: this.search
    };
    this.first = 0;
    this.loadRoomGroups(this.filterMap);
  }
  loadRoomGroups(FilterMap: FilterMap): void {
    // const filterMap = {
    //   pageIndex: this.first / this.rowsPerPage + 1,
    //   pageSize: this.rowsPerPage,
    //   search: this.search
    // };
    this.RoomGroupsService.getAllRoomGroups(this.filterMap).subscribe(
      (res) => {
        console.log('Room Groups:', res);
        this.totalRecords = res.data.itemsCount;
        this.roomGroups = res.data.data;
        console.log('Room Groups List:', this.roomGroups);
      },
      (error) => {
        console.error('Error fetching room groups', error);
      }
    );
  }

  editRoomGroup(id) {
    this.Router.navigate(['/room-groups-form', id]);
  }
}

```

---

## `src/app/demo/pages/settings/room-groups/room-groups.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'room groups'"
    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  ></sub-header>

  <app-room-group-list></app-room-group-list>
</div>

```

---

## `src/app/demo/pages/settings/room-groups/room-groups.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/room-groups/room-groups.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomGroupsComponent } from './room-groups.component';

describe('RoomGroupsComponent', () => {
  let component: RoomGroupsComponent;
  let fixture: ComponentFixture<RoomGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomGroupsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/room-groups/room-groups.component.ts`

```ts
import { Component, inject } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { RoomGroupListComponent } from './room-group-list/room-group-list.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room-groups',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, RoomGroupListComponent],
  templateUrl: './room-groups.component.html',
  styleUrl: './room-groups.component.scss'
})
export class RoomGroupsComponent {
  router = inject(Router);

  handleAction(event: { action: string }) {
    console.log('action.....', event);
    switch (event.action) {
      case 'add':
        this.goToroomGroupsForm();
        break;
    }
  }

  goToroomGroupsForm() {
    this.router.navigate(['/room-groups-form']);
  }
}

```

---

## `src/app/demo/pages/settings/room-tybe/room-tybe.component.html`

```html
<p-toast></p-toast>
<div class="main">
  <sub-header
    [mainHeader]="'room tybe' | translate"
    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  ></sub-header>
<app-room-tybies-list></app-room-tybies-list>
</div>

```

---

## `src/app/demo/pages/settings/room-tybe/room-tybe.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/room-tybe/room-tybe.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomTybeComponent } from './room-tybe.component';

describe('RoomTybeComponent', () => {
  let component: RoomTybeComponent;
  let fixture: ComponentFixture<RoomTybeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomTybeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomTybeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/room-tybe/room-tybe.component.ts`

```ts
import { Component, ViewChild } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BedTybeFormComponent } from '../bed-tybe/bed-tybe-form/bed-tybe-form.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RoomTybiesFormComponent } from './room-tybies-form/room-tybies-form.component';
import { RoomTybiesListComponent } from './room-tybies-list/room-tybies-list.component';
import { MessageService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-room-tybe',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, RoomTybiesListComponent],
  providers: [DialogService, MessageService],
  templateUrl: './room-tybe.component.html',
  styleUrl: './room-tybe.component.scss'
})
export class RoomTybeComponent {
  ref: DynamicDialogRef | undefined;
  @ViewChild(RoomTybiesListComponent) roomTybiesListComponent!: RoomTybiesListComponent;
  constructor(
    private dialogService: DialogService,
    private translate: TranslateService,
    private ToastrService: ToastrService
  ) {}
  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToRoomTybeForm();
        break;
    }
  }
  goToRoomTybeForm() {
    console.log('goToroomTybeForm');
    this.ref = this.dialogService.open(RoomTybiesFormComponent, {
      header: this.translate.instant('room tybe'),
      width: '50vw',
      modal: true,
      closable: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });
    this.ref.onClose.subscribe((data) => {
      if (data) {
        this.roomTybiesListComponent.ngOnInit();
        this.ToastrService.success('Room Tybe Added Successfully', 'Success');
      }
    });
  }
}

```

---

## `src/app/demo/pages/settings/room-tybe/room-tybies-form/room-tybies-form.component.html`

```html
<div class="product-form p-4 mb-4">

  <div class="form-field">
    <form [formGroup]="roomTybeForm" (ngSubmit)="onSubmit()">
      <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
        <div class="field col-12 col-md-6">
          <label for="name">
            {{ 'room tybe' | translate }}
            <small *ngIf="roomTybeForm.get('name')?.invalid && (roomTybeForm.get('name')?.touched || roomTybeForm.get('name')?.dirty)" class="text-danger">*</small>
          </label>

          <input type="text" pInputText id="name" formControlName="name" />

          <!-- Error message for required field -->
          <small class="error" *ngIf="roomTybeForm.get('name')?.hasError('required') && (roomTybeForm.get('name')?.touched || roomTybeForm.get('name')?.dirty)">
            * {{ 'required' | translate }}
          </small>
        </div>
        <div class="field col-12 col-md-6">
          <label for="maxOccupancy">
            {{ 'max Occupancy' | translate }}
            <small *ngIf="roomTybeForm.get('maxOccupancy')?.invalid && (roomTybeForm.get('maxOccupancy')?.touched || roomTybeForm.get('maxOccupancy')?.dirty)" class="text-danger">*</small>
          </label>

          <input type="number" pInputText id="maxOccupancy" formControlName="maxOccupancy" />

          <!-- Error message for required field -->
          <small class="error" *ngIf="roomTybeForm.get('maxOccupancy')?.hasError('required') && (roomTybeForm.get('maxOccupancy')?.touched || roomTybeForm.get('maxOccupancy')?.dirty)">
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
          [disabled]="roomTybeForm.invalid || isLoading"
          [loading]="isLoading"
        ></p-button>
      </div>
    </form>
  </div>
</div>

```

---

## `src/app/demo/pages/settings/room-tybe/room-tybies-form/room-tybies-form.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/room-tybe/room-tybies-form/room-tybies-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomTybiesFormComponent } from './room-tybies-form.component';

describe('RoomTybiesFormComponent', () => {
  let component: RoomTybiesFormComponent;
  let fixture: ComponentFixture<RoomTybiesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomTybiesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomTybiesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/room-tybe/room-tybies-form/room-tybies-form.component.ts`

```ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RoomTybeService } from 'src/app/shared/services/room-tybe.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-room-tybies-form',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './room-tybies-form.component.html',
  styleUrl: './room-tybies-form.component.scss'
})
export class RoomTybiesFormComponent {
  roomTybeForm: FormGroup;
  isLoading = false; // Track loading state

  constructor(
    private fb: FormBuilder,
    private RoomTybeService: RoomTybeService, // Renamed for consistency
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef, // Inject DynamicDialogRef
    private messageService: MessageService, // For toast notifications
    private ToastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.createRTForm();
    if (this.config.data) {
      console.log(this.config);
      this.handleEdit();
    }
  }

  createRTForm() {
    this.roomTybeForm = this.fb.group({
      name: [null, Validators.required], // Add validation if required
      maxOccupancy: [1, [Validators.required, Validators.min(1)]]
    });
  }

  handleEdit() {
    if (this.config.data) {
      this.roomTybeForm.patchValue({
        name: this.config.data.name || '',
        maxOccupancy: this.config.data.maxOccupancy || 1
      });
      console.log('Editing room type:', this.config.data);
    }
  }

  onSubmit() {
    if (this.roomTybeForm.valid) {
      this.isLoading = true; // Show loading state
      if (this.config.data && this.config.data.id) {
        // Update operation
        this.RoomTybeService.updateRoomTybe({
          id: this.config.data.id,
          name: this.roomTybeForm.value.name,
          maxOccupancy: this.roomTybeForm.value.maxOccupancy
        }).subscribe({
          next: (res) => {
            this.isLoading = false;
            this.ref.close(res); // Close dialog and pass data
          },
          error: (err) => {
            this.isLoading = false;
            this.ToastrService.error('Failed to update room type', 'Error');
          }
        });
      } else {
        // Create operation
        this.RoomTybeService.setRoomTybe(this.roomTybeForm.value).subscribe({
          next: (res) => {
            this.isLoading = false;

            this.ref.close(this.roomTybeForm.value); // Close dialog and pass data
          },
          error: (err) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create room type'
            });
            console.error('Create error:', err);
          }
        });
      }
    } else {
      this.ToastrService.error('Form is invalid', 'Error');
      console.log('Form is invalid');
    }
  }

  onCancel() {
    this.ref.close(); // Close dialog without data
  }
}

```

---

## `src/app/demo/pages/settings/room-tybe/room-tybies-list/room-tybies-list.component.html`

```html
<p-toast></p-toast>
<p-confirmDialog></p-confirmDialog>
<div class="card">
  <p-toolbar>
    <ng-template pTemplate="right">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText type="text" [(ngModel)]="searchTerm" (input)="onSearch()" [placeholder]="'search' | translate" />
      </span>
    </ng-template>
  </p-toolbar>
  <p-table
    #dt
    [value]="roomTybies"
    [paginator]="true"
    [rows]="rows"
    [lazy]="true"
    (onLazyLoad)="loadRoomTybes($event)"
    [totalRecords]="totalRecords"
    [rowsPerPageOptions]="[5, 10]"
    [showCurrentPageReport]="true"
    [loading]="loading"
    [currentPageReportTemplate]="'showingEntries' | translate"
  >
    <ng-template pTemplate="header">
      <tr>
        <th style="width: 35%" pSortableColumn="name">
          {{ 'room tybe' | translate }}
          <p-sortIcon field="name"></p-sortIcon>
        </th>

        <th style="width: 35%" pSortableColumn="maxOccupancy">
          {{ 'maxOccupancy' | translate }}
          <p-sortIcon field="maxOccupancy"></p-sortIcon>
        </th>
        <th style="width: 35%">{{ 'action' | translate }}</th>
        <!-- <th style="width: 30%">Action</th> -->
      </tr>
      <tr>
        <th>
          <input
            pInputText
            type="text"
            (input)="dt.filter($any($event.target).value, 'name', 'contains')"
            [placeholder]="'Search by Name' | translate"
          />
        </th>
        <th>
          <input
            pInputText
            type="text"
            (input)="dt.filter($any($event.target).value, 'maxOccupancy', 'contains')"
            [placeholder]="'Search by maxOccupancy' | translate"
          />
        </th>
        <th></th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-roomTybe>
      <tr>
        <td>{{ roomTybe.name }}</td>
        <td>{{ roomTybe.maxOccupancy }}</td>

        <td>
          <div class="flex gap-1 justify-content-center">
            <p-button
              [raised]="true"
              icon="pi pi-pencil"
              severity="success"
              [rounded]="true"
              (onClick)="handleEdit(roomTybe.id, roomTybe.name, roomTybe.maxOccupancy)"
            ></p-button>
            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" (onClick)="handleDelete(roomTybe.id)"></p-button>
          </div>
        </td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="6">
          <div class="d-flex justify-content-center align-items-center py-3 w-100">
            <i class="pi pi-info-circle" style="font-size: 1rem; color: gray"></i>
            <span class="ms-2" style="color: gray">{{ 'No Data found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/settings/room-tybe/room-tybies-list/room-tybies-list.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/room-tybe/room-tybies-list/room-tybies-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomTybiesListComponent } from './room-tybies-list.component';

describe('RoomTybiesListComponent', () => {
  let component: RoomTybiesListComponent;
  let fixture: ComponentFixture<RoomTybiesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomTybiesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomTybiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/room-tybe/room-tybies-list/room-tybies-list.component.ts`

```ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IroomTypies } from 'src/app/shared/model/iroom-typies';
import { RoomTybeService } from 'src/app/shared/services/room-tybe.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { RoomTybiesFormComponent } from '../room-tybies-form/room-tybies-form.component';
import { ToastrService } from 'ngx-toastr';

import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';
import { Table, TableLazyLoadEvent } from 'primeng/table';

@Component({
  selector: 'app-room-tybies-list',
  standalone: true,
  imports: [SharedModule],
  providers: [ConfirmationService, MessageService, DialogService],
  templateUrl: './room-tybies-list.component.html',
  styleUrl: './room-tybies-list.component.scss'
})
export class RoomTybiesListComponent implements OnInit {
  @ViewChild('dt') dt: Table;
  searchTerm: string = '';
  first = 0;
  rows = 10;
  totalRecords: number = 0;
  roomTybies: IroomTypies[] = [];
  ref: DynamicDialogRef | undefined;
  loading: boolean = true;

  constructor(
    private _RoomTybeService: RoomTybeService,
    private ConfirmationService: ConfirmationService,
    private MessageService: MessageService,
    private dialogService: DialogService,
    private ToastrService: ToastrService
  ) {}

  ngOnInit(): void {}

  loadRoomTybes(event: TableLazyLoadEvent) {
    this.loading = true;
    const filter = TableRequestBuilder.build(event, this.searchTerm);
    this._RoomTybeService.getAllRoomTybes(filter).subscribe({
      next: (res) => {
        this.roomTybies = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.loading = false;
        console.log(this.roomTybies);
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
      }
    });
  }
  handleEdit(id: number, name: string, maxOccupancy: number) {
    this.ref = this.dialogService.open(RoomTybiesFormComponent, {
      header: 'Edit Bed Type',
      width: '50vw',
      modal: true,
      closable: true,
      data: { id, name, maxOccupancy },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw'
      }
    });

    this.ref.onClose.subscribe((data) => {
      if (data) {
        this.dt.reset();
        this.ToastrService.success('Room Type updated successfully', 'Success');
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
        this._RoomTybeService.deleteRoomTybe(id).subscribe({
          next: () => {
            this.dt.reset();
            this.ToastrService.success('Room Type deleted successfully', 'Success');
          },
          error: () => {
            this.ToastrService.error('Failed to delete Room Type', 'Error');
          }
        });
      }
    });
  }

  onSearch() {
    this.dt.reset();
  }
}

```

---

## `src/app/demo/pages/settings/sales-agencies/sales-agencies-details/sales-agencies-details.component.html`

```html
<p>sales-agencies-details works!</p>

```

---

## `src/app/demo/pages/settings/sales-agencies/sales-agencies-details/sales-agencies-details.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/sales-agencies/sales-agencies-details/sales-agencies-details.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAgenciesDetailsComponent } from './sales-agencies-details.component';

describe('SalesAgenciesDetailsComponent', () => {
  let component: SalesAgenciesDetailsComponent;
  let fixture: ComponentFixture<SalesAgenciesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAgenciesDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesAgenciesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/sales-agencies/sales-agencies-details/sales-agencies-details.component.ts`

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-sales-agencies-details',
  standalone: true,
  imports: [],
  templateUrl: './sales-agencies-details.component.html',
  styleUrl: './sales-agencies-details.component.scss'
})
export class SalesAgenciesDetailsComponent {

}

```

---

## `src/app/demo/pages/settings/sales-agencies/sales-agencies-form/sales-agencies-form.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="id ? ('Edit Sales Agency' | translate) : ('Add Sales Agency' | translate)"
    [mainSection]="'Agencies' | translate"
    [subSection]="id ? ('Edit' | translate) : ('Add' | translate)"
  ></sub-header>

  <div class="product-form shadow-3 p-4">
    <form class="form-field" [formGroup]="salesAgencyForm" (ngSubmit)="submit()">
      <h3 class="flex justify-content-between mb-3">
        {{ 'Agency Information' | translate }}
      </h3>

      <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round mb-4">
        <!-- Name -->
        <div class="field col-12 col-md-6">
          <label for="Name">{{ 'Agency Name' | translate }}</label>
          <input pInputText id="Name" formControlName="Name" />
        </div>

        <!-- Phone -->
        <div class="field col-12 col-md-6">
          <label for="Phone">{{ 'Phone' | translate }}</label>
          <input pInputText id="Phone" formControlName="Phone" />
        </div>

        <!-- Email -->
        <div class="field col-12 col-md-6">
          <label for="Email">{{ 'Email' | translate }}</label>
          <input pInputText id="Email" formControlName="Email" />
        </div>

        <!-- Address -->
        <div class="field col-12 col-md-6">
          <label for="Address">{{ 'Address' | translate }}</label>
          <input pInputText id="Address" formControlName="Address" />
        </div>

        <!-- Travel Commission -->
        <div class="field col-12 col-md-12">
          <div class="flex align-items-center mb-2">
            <p-inputSwitch formControlName="IsTravelCommission" inputId="IsTravelCommission"></p-inputSwitch>
            <label for="IsTravelCommission" class="ml-2">{{ 'Has Travel Commission' | translate }}</label>
          </div>

          <!-- يظهر فقط لو السويتش true -->
          <div class="mt-2" *ngIf="salesAgencyForm.get('IsTravelCommission')?.value">
            <label for="TravelCommissionRate">{{ 'Travel Commission Rate (%)' | translate }}</label>
            <input pInputText type="number" id="TravelCommissionRate" formControlName="TravelCommissionRate" />
          </div>
        </div>

        <!-- Hotel Commission -->
        <div class="field col-12 col-md-12">
          <div class="flex align-items-center mb-2">
            <p-inputSwitch formControlName="IsHotelCommission" inputId="IsHotelCommission"></p-inputSwitch>
            <label for="IsHotelCommission" class="ml-2">{{ 'Has Hotel Commission' | translate }}</label>
          </div>

          <!-- يظهر فقط لو السويتش true -->
          <div class="mt-2" *ngIf="salesAgencyForm.get('IsHotelCommission')?.value">
            <label for="HotelCommissionRate">{{ 'Hotel Commission Rate (%)' | translate }}</label>
            <input pInputText type="number" id="HotelCommissionRate" formControlName="HotelCommissionRate" />
          </div>
        </div>
        <!-- Description -->
        <div class="field col-12">
          <label for="Description">{{ 'Description' | translate }}</label>
          <textarea pInputTextarea autoResize="true" rows="2" id="Description" class="w-full" formControlName="Description"></textarea>
        </div>
      </div>

      <!-- Logo uploader -->
      <h3 class="mt-5 mb-3">{{ 'Agency Logo' | translate }}</h3>
      <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round mb-4">
        <div class="col-md-12 mb-3">
          <app-img-uploader [multiple]="false" [displayFile]="oldImage" (filesChanged)="onLogoFileSelect($event)"></app-img-uploader>
        </div>
      </div>

      <!-- Buttons -->
      <div class="buttons mt-3 text-end">
        <p-button label="{{ 'Cancel' | translate }}" type="button" class="mx-1 shadow" severity="secondary"></p-button>

        <p-button
          [disabled]="!salesAgencyForm.valid"
          type="submit"
          label="{{ 'Save' | translate }}"
          severity="success"
          class="shadow"
          icon="pi pi-save"
        ></p-button>
      </div>
    </form>
  </div>
</div>
<p-toast></p-toast>

```

---

## `src/app/demo/pages/settings/sales-agencies/sales-agencies-form/sales-agencies-form.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/sales-agencies/sales-agencies-form/sales-agencies-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAgenciesFormComponent } from './sales-agencies-form.component';

describe('SalesAgenciesFormComponent', () => {
  let component: SalesAgenciesFormComponent;
  let fixture: ComponentFixture<SalesAgenciesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAgenciesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesAgenciesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/sales-agencies/sales-agencies-form/sales-agencies-form.component.ts`

```ts
import { Component } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SalesAganciesService } from 'src/app/shared/services/sales-agancies.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-sales-agencies-form',
  standalone: true,
  imports: [SharedModule, ImgUploaderComponent, SubHeaderComponent],
  templateUrl: './sales-agencies-form.component.html',
  styleUrl: './sales-agencies-form.component.scss'
})
export class SalesAgenciesFormComponent {
  salesAgencyForm!: FormGroup;
  oldImage: any = null; // عشان لو بتعدل وعاوز تعرض الصورة القديمة
  selectedLogoFile!: File;
  id = this.route.snapshot.params['id'];

  constructor(
    private fb: FormBuilder,
    private SalesAganciesService: SalesAganciesService,
    private ToastrService: ToastrService,
    private route: ActivatedRoute,
    private Router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (this.id) {
      this.loadAgency(this.id);
    }
  }

  initForm() {
    this.salesAgencyForm = this.fb.group({
      Name: ['', Validators.required],
      Phone: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Address: ['', Validators.required],
      Description: [''],

      IsTravelCommission: [false, Validators.required],
      TravelCommissionRate: [0],

      IsHotelCommission: [false, Validators.required],
      HotelCommissionRate: [0]
    });
  }

  loadAgency(id) {
    this.SalesAganciesService.getSalesAgancyById(id).subscribe({
      next: (res) => {
        const agency = res.data; // حسب الـ API عندك

        this.salesAgencyForm.patchValue({
          Name: agency.name,
          Phone: agency.phone,
          Email: agency.email,
          Address: agency.address,
          Description: agency.description ,
          IsTravelCommission: agency.isTravelCommission,
          TravelCommissionRate: agency.travelCommissionRate,
          IsHotelCommission: agency.isHotelCommission,
          HotelCommissionRate: agency.hotelCommissionRate
        });

        // لو عندك صورة قديمة
        if (agency.logoUrl) {
          this.oldImage = agency.logoUrl;
        }
      }
    });
  }

  // لما المستخدم يرفع صورة
  onLogoFileSelect(files: File[]) {
    if (files && files.length > 0) {
      this.selectedLogoFile = files[0]; // أول صورة
      console.log('Selected file:', this.selectedLogoFile);
    } else {
      this.selectedLogoFile = null;
    }
  }

  submit() {
    if (this.salesAgencyForm.invalid) {
      this.salesAgencyForm.markAllAsTouched();
      return;
    }

    const formValues = this.salesAgencyForm.value;
    const formData = new FormData();

    formData.append('Name', formValues.Name);
    formData.append('Phone', formValues.Phone);
    formData.append('Email', formValues.Email);
    formData.append('Address', formValues.Address);
    formData.append('Description', formValues.Description);
    formData.append('IsTravelCommission', formValues.IsTravelCommission ? 'true' : 'false');
    formData.append('TravelCommissionRate', formValues.TravelCommissionRate.toString());
    formData.append('IsHotelCommission', formValues.IsHotelCommission ? 'true' : 'false');
    formData.append('HotelCommissionRate', formValues.HotelCommissionRate.toString());

    if (this.selectedLogoFile) {
      formData.append('ImageLogo', this.selectedLogoFile, this.selectedLogoFile.name);
    }

    if (this.id) {
      // Update
      formData.append('Id', this.id.toString());
      this.SalesAganciesService.updateSalesAgancy(formData).subscribe({
        next: (res) => {
          this.ToastrService.success(res.message, 'Updated');
          this.Router.navigate(['/Sales-Agencies']);
        }
      });
    } else {
      // Add
      this.SalesAganciesService.setSalesAgancy(formData).subscribe({
        next: (res) => {
          this.ToastrService.success(res.message, 'Added');
          this.Router.navigate(['/Sales-Agencies']);
        }
      });
    }
  }
}

```

---

## `src/app/demo/pages/settings/sales-agencies/sales-agencies-list/sales-agencies-list.component.html`

```html
<!-- sales-agencies-list.component.html -->
<div class="card">
  <p-toolbar>
    <ng-template pTemplate="right">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText type="text" [(ngModel)]="filterMap.Search" (input)="onSearch()" placeholder="{{ 'search' | translate }}" />
      </span>
    </ng-template>
  </p-toolbar>

  <p-table
    [value]="salesAgencies"
    [paginator]="true"
    [rows]="filterMap.pageSize"
    [totalRecords]="totalRecords"
    [lazy]="true"
    (onLazyLoad)="onPageChange($event)"
    [loading]="loading"
    [rowsPerPageOptions]="[10, 20, 50]"
    [first]="(filterMap.pageIndex - 1) * filterMap.pageSize"
    [showCurrentPageReport]="true"
    [currentPageReportTemplate]="'showingEntries' | translate"
  >
    <ng-template pTemplate="header">
      <tr>
        <th>{{ 'image' | translate }}</th>
        <th>{{ 'name' | translate }}</th>
        <th>{{ 'email' | translate }}</th>
        <th>{{ 'phone' | translate }}</th>
        <th>{{ 'address' | translate }}</th>
        <th></th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-agency>
      <tr>
        <td><img [src]="getLogoUrl(agency)" [alt]="'add image' | translate" /></td>
        <td>{{ agency.name }}</td>
        <td>{{ agency.email }}</td>
        <td>{{ agency.phone }}</td>
        <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ agency.address }}</td>
        <td>
          <div class="flex gap-1 justify-content-center">
            <p-button
              [raised]="true"
              icon="pi pi-pencil"
              severity="success"
              [rounded]="true"
              [routerLink]="['/Sales-Agencies-form', agency.id]"
            ></p-button>
            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" (click)="onDelete(agency.id)"></p-button>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>
<p-confirmDialog></p-confirmDialog>

```

---

## `src/app/demo/pages/settings/sales-agencies/sales-agencies-list/sales-agencies-list.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/sales-agencies/sales-agencies-list/sales-agencies-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAgenciesListComponent } from './sales-agencies-list.component';

describe('SalesAgenciesListComponent', () => {
  let component: SalesAgenciesListComponent;
  let fixture: ComponentFixture<SalesAgenciesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAgenciesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesAgenciesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/sales-agencies/sales-agencies-list/sales-agencies-list.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { SalesAganciesService } from 'src/app/shared/services/sales-agancies.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sales-agencies-list',
  standalone: true,
  imports: [SharedModule],
  providers: [ConfirmationService],

  templateUrl: './sales-agencies-list.component.html',
  styleUrls: ['./sales-agencies-list.component.scss']
})
export class SalesAgenciesListComponent implements OnInit {
  salesAgencies: any[] = []; // هنا بنخزن الداتا الراجعة من الـ API
  totalRecords = 0; // بنستخدمها في الـ paginator
  loading = false; // للـ spinner
  baseUrl = environment.imgUrl

  // هنا بنحتفظ بالفلترة الحالية (Single Source of Truth)
  filterMap: FilterMap = {
    pageIndex: 1,
    pageSize: 10,
    sort: '',
    Search: ''
  };
getLogoUrl(agency: any): string {
  return agency.logoUrl 
    ? this.baseUrl + agency.logoUrl 
    : 'https://placehold.co/600x400?text=No+Image';
}
  constructor(
    private salesAganciesService: SalesAganciesService,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService , 
    private ConfirmationService:ConfirmationService
  ) {}

  ngOnInit(): void {
    // ✅ بنقرأ الـ query params من الـ URL عشان نقدر نحتفظ بالـ state
    this.route.queryParams.subscribe((params) => {
      this.filterMap.pageIndex = +params['pageIndex'] || 1;
      this.filterMap.pageSize = +params['pageSize'] || 10;
      this.filterMap.Search = params['Search'] || '';
      this.filterMap.sort = params['sort'] || '';

      this.loadSalesAgancies();
    });
  }

  // ✅ ميثود عامة للـ API call
  loadSalesAgancies(): void {
    this.loading = true;
    this.salesAganciesService.getSalesAgancies(this.filterMap).subscribe({
      next: (res: any) => {
        this.salesAgencies = res.data.data || [];
        this.totalRecords = res.data.itemsCount || 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // ✅ البحث
  onSearch(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...this.filterMap,
        pageIndex: 1, // نرجع لأول صفحة لما نعمل بحث جديد
        Search: this.filterMap.Search
      },
      queryParamsHandling: 'merge'
    });
  }

  // ✅ الـ Pagination
  onPageChange(event: any): void {
    const pageIndex = event.first / event.rows + 1;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ...this.filterMap,
        pageIndex,
        pageSize: event.rows
      },
      queryParamsHandling: 'merge'
    });
  }
  onDelete(id) {
    this.ConfirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        this.salesAganciesService.deleteSalesAgancy(id).subscribe({
          next: (res) => {
            this.toastrService.success('deleted sussesfuly', 'deleted');
            this.loadSalesAgancies();
          }
        });
      },
      reject: () => {}
    });
  }
}

```

---

## `src/app/demo/pages/settings/sales-agencies/sales-agencies.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'Sales Agencies' | translate"
    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  ></sub-header>
<app-sales-agencies-list></app-sales-agencies-list>
</div>
```

---

## `src/app/demo/pages/settings/sales-agencies/sales-agencies.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/sales-agencies/sales-agencies.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAgenciesComponent } from './sales-agencies.component';

describe('SalesAgenciesComponent', () => {
  let component: SalesAgenciesComponent;
  let fixture: ComponentFixture<SalesAgenciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAgenciesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesAgenciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/sales-agencies/sales-agencies.component.ts`

```ts
import { Component } from '@angular/core';
import { SubHeaderComponent } from "src/app/shared/components/sub-header/sub-header.component";
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SalesAgenciesListComponent } from "./sales-agencies-list/sales-agencies-list.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-sales-agencies',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, SalesAgenciesListComponent],
  templateUrl: './sales-agencies.component.html',
  styleUrl: './sales-agencies.component.scss'
})
export class SalesAgenciesComponent {
  constructor(private Router:Router){}
  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToSalesAganciesForm();
        break;
    }
  }
  goToSalesAganciesForm(){
    this.Router.navigate(['/Sales-Agencies-form'])
  }
}

```

---

## `src/app/demo/pages/settings/users/user-details/user-details.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'User Details' | translate"
    [mainSection]="'Users' | translate"
    [subSection]="'Details' | translate"
   >
  </sub-header>

  <div class="p-card bg-light p-3">
    <div class="row">
      <div class="col-12 col-md-6">
        <div class="flex align-items-center gap-5">
          <strong>{{ 'Username' | translate }}</strong>
          <p>{{ user.username || 'N/A' }}</p>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="flex align-items-center gap-5">
          <strong>{{ 'Name' | translate }}</strong>
          <p>{{ user.firstName || 'N/A' }}</p>
        </div>
      </div>
      <div class="col-12 col-md-6">
        <div class="flex align-items-center gap-5">
          <strong>{{ 'Email' | translate }}</strong>
          <p>{{ user.email || 'N/A' }}</p>
        </div>
      </div>
      <div class="col-12 col-md-6">
        <div class="flex align-items-center gap-5">
          <strong>{{ 'Phone Number' | translate }}</strong>
          <p>{{ user.phoneNumber || 'N/A' }}</p>
        </div>
      </div>
      <div class="col-12 col-md-6">
        <div class="flex align-items-center gap-5">
          <strong>{{ 'Role' | translate }}</strong>
          <p>
            <span *ngFor="let role of user.roles">
              {{ role.name }}
            </span>
            <span *ngIf="!user.roles || user.roles.length === 0">N/A</span>
          </p>
        </div>
      </div>
      <!-- <div class="col-12 col-md-6">
        <div class="flex align-items-center gap-5">
          <strong>{{ 'Status' | translate }}</strong>
          <p>
            <p-inputSwitch [ngModel]="true" [disabled]="true" /> 
          </p>
        </div>
      </div> -->
    </div>
  </div>
</div>

```

---

## `src/app/demo/pages/settings/users/user-details/user-details.component.scss`

```scss
p{
  margin-bottom: 0 !important;

}
strong{
  width: 25%;
}

```

---

## `src/app/demo/pages/settings/users/user-details/user-details.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDetailsComponent } from './user-details.component';

describe('UserDetailsComponent', () => {
  let component: UserDetailsComponent;
  let fixture: ComponentFixture<UserDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/users/user-details/user-details.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { UseriesService } from 'src/app/shared/services/useries.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss'
})
export class UserDetailsComponent implements OnInit {
  userId: string = '';
  user: any = {};
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private UseriesService: UseriesService
  ) {}

  ngOnInit(): void {
    this.fetchParams();
  }
  fetchParams() {
    this.route.params.subscribe((params) => {
      this.userId = params['id'];
      if (this.userId) {
        this.getUserById(this.userId);
      }
    });
  }
  getUserById(id: string) {
    this.UseriesService.getUserById(id).subscribe({
      next: (res) => {
        this.user = res.data;
        console.log('User fetched successfully:', this.user);
      },
      error: (err) => {
        console.error('Error fetching user:', err);
      }
    });
  }
  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'edit':
        this.editUser(this.userId);
        break;
    }
  }
  editUser(id) {
    this.router.navigate(['/user-form', id]);
  }
}

```

---

## `src/app/demo/pages/settings/users/users-form/users-form.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="userlId ? ('Edit user' | translate) : ('Add user' | translate)"
    [mainSection]="'users' | translate"
    [subSection]="userlId ? ('Edit' | translate) : ('Add' | translate)"
  ></sub-header>

  <form [formGroup]="form" (ngSubmit)="onSubmit()" class="product-form shadow-3 p-4">
    <!-- User Info -->
    <div class="form-field">
      <h3 class="flex justify-content-between">
        {{ 'User Info' | translate }}
        <!-- <span><p-inputSwitch /></span> -->
      </h3>
      <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
        <div class="field col">
          <label for="username">
            {{ 'Username' | translate }}
          </label>
          <input pInputText id="username" [readonly]="isEditMode" formControlName="Username" type="text" />
          <small class="error" *ngIf="form.get('Username')?.invalid && form.get('Username')?.touched">
            * {{ 'this field is required' | translate }}
          </small>
          <small class="error" *ngIf="form.get('Username')?.hasError('hasSpaces')">
            * {{ 'Username cannot contain spaces' | translate }}
          </small>
        </div>

        <div class="field col" *ngIf="!isEditMode">
          <label for="password">
            {{ 'Password' | translate }}
          </label>
          <p-password id="password" formControlName="Password" class="w-full" [toggleMask]="true" />
          <small class="error" *ngIf="form.get('Password')?.invalid && form.get('Password')?.touched">
            * {{ 'this field is required' | translate }}
          </small>
        </div>
      </div>
    </div>

    <!-- Other Info -->
    <div class="form-field mt-4">
      <h3>{{ 'Other Info.' | translate }}</h3>
      <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
        <div class="field col-12 col-md-2">
          <label for="name">
            {{ 'Name' | translate }}
          </label>
          <input pInputText id="name" formControlName="FirstName" type="text" />
          <small class="error" *ngIf="form.get('FirstName')?.invalid && form.get('FirstName')?.touched">
            * {{ 'this field is required' | translate }}
          </small>
        </div>
        <div class="field col-12 col-md-2">
          <label for="lastName">
            {{ 'last Name' | translate }}
          </label>
          <input pInputText id="lastName" formControlName="LastName" type="text" />
          <small class="error" *ngIf="form.get('LastName')?.invalid && form.get('LastName')?.touched">
            * {{ 'this field is required' | translate }}
          </small>
        </div>

        <div class="field col-12 col-md-4">
          <label for="email">
            {{ 'Email' | translate }}
          </label>
          <input pInputText id="email" formControlName="Email" type="text" />
          <small class="error" *ngIf="form.get('Email')?.invalid && form.get('Email')?.touched">
            * {{ 'valid email required' | translate }}
          </small>
        </div>

        <div class="field col-12 col-md-2">
          <label for="phone">
            {{ 'Phone Number' | translate }}
          </label>
          <input pInputText id="phone" formControlName="PhoneNumber" type="text" />
          <small class="error" *ngIf="form.get('PhoneNumber')?.invalid && form.get('PhoneNumber')?.touched">
            * {{ 'this field is required' | translate }}
          </small>
        </div>
        <div class="field col-12 col-md-2">
          <label for="gender">
            {{ 'Gender' | translate }}
          </label>
          <p-dropdown
            id="gender"
            formControlName="Gender"
            [options]="genderOptions"
            optionLabel="label"
            optionValue="value"
            [showClear]="true"
            class="w-full"
          ></p-dropdown>
          <small class="error text-danger" *ngIf="form.get('Gender')?.invalid && form.get('Gender')?.touched">
            * {{ 'this field is required' | translate }}
          </small>
        </div>

        <div class="field" [ngClass]="selectedRole?.roleType === 2 ? 'col-12 col-md-6' : 'col-12'">
          <label>
            {{ 'Role' | translate }}
          </label>
          <p-dropdown
            formControlName="Roles"
            [options]="roles"
            optionLabel="name"
            [showClear]="true"
            class="w-full"
            (onChange)="onRoleChange($event.value)"
          ></p-dropdown>
          <small class="error text-danger" *ngIf="form.get('Roles')?.invalid && form.get('Roles')?.touched">
            * {{ 'this field is required' | translate }}
          </small>
        </div>

        <div *ngIf="selectedRole?.roleType === 2" class="field col-12 col-md-6">
          <label for="CompanyId">{{ 'Vendor' | translate }}</label>
          <p-dropdown
            formControlName="CompanyId"
            [options]="vendors"
            optionLabel="name"
            optionValue="id"
            [filter]="true"
            [virtualScroll]="true"
            [lazy]="true"
            [virtualScrollItemSize]="35"
            (onFilter)="onVendorSearch($event)"
            [loading]="loadingVendors"
            class="w-full"
          ></p-dropdown>
        </div>

        <div class="field col-md-12 mb-3">
          <label class="">
            {{ 'user image' | translate }}
          </label>
          <app-img-uploader
            [multiple]="false"
            [displayFile]="oldImage ? oldImage : null"
            (filesChanged)="onUserFileSelect($event)"
          ></app-img-uploader>
          <p class="text-danger mt-1" *ngIf="showUserImgMessage">* {{ 'user img is required' | translate }}</p>
        </div>
      </div>
    </div>

    <!-- Buttons -->
    <div class="buttons mt-3 text-end">
      <p-button type="submit" [label]="'save' | translate" severity="success" icon="pi pi-save"></p-button>
      <p-button [label]="'Cancel' | translate" class="mx-1" severity="secondary" (onClick)="onCansel()"></p-button>
    </div>
  </form>
</div>

```

---

## `src/app/demo/pages/settings/users/users-form/users-form.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/users/users-form/users-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersFormComponent } from './users-form.component';

describe('UsersFormComponent', () => {
  let component: UsersFormComponent;
  let fixture: ComponentFixture<UsersFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/users/users-form/users-form.component.ts`

```ts
import { Component, OnInit, signal, WritableSignal, computed, effect } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { RoleService } from 'src/app/shared/services/role.service';
import { VendorService } from 'src/app/shared/services/vendor.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from '../../../../../shared/components/sub-header/sub-header.component';
import { UseriesService } from 'src/app/shared/services/useries.service';
import { ImgUploaderComponent } from '../../../../../shared/img-uploader/img-uploader.component';
import { DropdownModule } from 'primeng/dropdown';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-users-form',
  standalone: true,
  templateUrl: './users-form.component.html',
  styleUrl: './users-form.component.scss',
  imports: [SharedModule, SubHeaderComponent, ImgUploaderComponent, DropdownModule]
})
export class UsersFormComponent implements OnInit {
  form: FormGroup;
  userlId: string;
  roles: any[] = [];
  vendors: any[] = [];
  vendorPage = 0;
  vendorSize = 20;
  loadingVendors = false;
  userFile: File | null = null;
  oldImage = '';
  showUserImgMessage = false;
  isEditMode = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private roleService: RoleService,
    private vendorService: VendorService,
    private UseriesService: UseriesService,
    private Router: Router,
    private ToastrService: ToastrService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.userlId = params['id'];
    });
  }

  // ngOnInit(): void {
  //   this.initForm();
  //   this.gettingAllRoles();

  //   this.form.get('Roles')?.valueChanges.subscribe((selectedRole) => {
  //     console.log('Selected Role:', selectedRole);
  //     this.selectedRole = selectedRole;
  //     if (selectedRole.roleType === 2) {
  //       this.form.get('CompanyId')?.setValidators(Validators.required);
  //     } else {
  //       this.form.get('CompanyId')?.reset();
  //       this.form.get('CompanyId')?.clearValidators();
  //     }
  //     this.form.get('CompanyId')?.updateValueAndValidity();
  //   });
  // }
  ngOnInit(): void {
    this.initForm();
    this.gettingAllRoles();

    if (this.userlId) {
      this.isEditMode = true;
      this.getUserDetails(+this.userlId);
    }

    this.form.get('Roles')?.valueChanges.subscribe((selectedRole) => {
      this.selectedRole = selectedRole;
      if (selectedRole.roleType === 2) {
        this.form.get('CompanyId')?.setValidators(Validators.required);
      } else {
        this.form.get('CompanyId')?.reset();
        this.form.get('CompanyId')?.clearValidators();
      }
      this.form.get('CompanyId')?.updateValueAndValidity();
    });
  }
  getUserDetails(id: number): void {
    this.form.get('Password')?.clearValidators();
    this.UseriesService.getUserById(id.toString()).subscribe({
      next: (res) => {
        const user = res.data;

        this.selectedRole = user.roles?.[0];

        if (this.selectedRole?.roleType === 2) {
          this.gettingAllVendors();
          this.form.get('CompanyId')?.setValidators(Validators.required);
          this.form.get('CompanyId')?.updateValueAndValidity();
        }

        this.form.patchValue({
          Username: user.username,
          FirstName: user.firstName,
          LastName: user.lastName,
          Email: user.email,
          PhoneNumber: user.phoneNumber,
          Roles: this.selectedRole,
          CompanyId: user.companyId || null,
          Gender: user.gender || null
        });

        if (user.imageUrl) {
          this.oldImage = user.imageUrl;
        }
      },
      error: (err) => {
        console.error('Error fetching user by ID:', err);
      }
    });
  }

  genderOptions = [
    { label: 'Male', value: 1 },
    { label: 'Female', value: 2 }
  ];
  noSpacesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const hasSpace = /\s/.test(control.value);
      return hasSpace ? { hasSpaces: true } : null;
    };
  }
  initForm() {
    this.form = this.fb.group({
      Username: ['', [Validators.required, this.noSpacesValidator()]],
      Password: ['', Validators.required],
      FirstName: ['', Validators.required],
      LastName: ['', Validators.required],
      Gender: [null, Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      PhoneNumber: ['', Validators.required],
      Roles: [null, Validators.required],
      CompanyId: [null]
    });
  }

  gettingAllRoles() {
    this.roleService.getAllRoles().subscribe({
      next: (res) => {
        debugger;
        this.roles = res.data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  onVendorSearch(event: { originalEvent: Event; filter: string }) {
    this.vendorPage = 0;
    const searchTerm = event.filter;

    this.gettingAllVendors(searchTerm);
  }

  gettingAllVendors(searchTerm: string = '') {
    const filterMap: FilterMap = {
      pageIndex: this.vendorPage,
      pageSize: this.vendorSize,
      search: searchTerm
    };

    this.loadingVendors = true;

    this.vendorService.getAllVendors(filterMap).subscribe({
      next: (res) => {
        this.vendors = res.data.data || res.data;
        this.loadingVendors = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingVendors = false;
      }
    });
  }
  selectedRole: any = null;

  onRoleChange(role: any) {
    console.log('Selected Role :', role);
    this.selectedRole = role;
    this.form.get('Roles')?.setValue(role);
    if (role.roleType === 2) {
      this.gettingAllVendors();
    } else {
      this.form.get('CompanyId')?.reset();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.ToastrService.error('Error', 'Please fill all required fields correctly.');
      return;
    }
    if (!this.isEditMode && !this.userFile) {
      this.showUserImgMessage = true;
      return;
    }

    const formData = new FormData();
    const formValue = this.form.value;

    for (const key in formValue) {
      if (formValue[key] !== null && formValue[key] !== undefined) {
        if (key === 'Password' && this.isEditMode) {
          continue; // ❌ لا تبعت الباسوورد لو تعديل
        }

        if (key === 'Roles') {
          formData.append('Roles', formValue.Roles.name);
        } else {
          formData.append(key, String(formValue[key]));
        }
      }
    }

    if (this.userFile) {
      formData.append('Image', this.userFile);
    }

    if (this.isEditMode) {
      // ✏️ call update API
      this.UseriesService.updateUser(formData).subscribe({
        next: (res) => {
          this.ToastrService.success('success', 'User updated successfully');
          this.Router.navigate(['/users']);
        },
        error: (err) => {
          this.ToastrService.error(err.error.message || 'Error', 'Failed to update user');
          console.error('Error updating user:', err);
        }
      });
    } else {
      // ➕ call create API
      this.UseriesService.createUser(formData).subscribe({
        next: (res) => {
          this.form.reset();
          this.userFile = null;
          this.Router.navigate(['/users']);
          this.ToastrService.success('success', 'User created successfully');
        },
        error: (err) => {
          this.ToastrService.error(err.error.message || 'Error', 'Failed to create user');
          console.error('Error creating user:', err);
        }
      });
    }
  }

  onUserFileSelect(event: File[]): void {
    this.userFile = event[0] ?? null;
    this.showUserImgMessage = false;
  }
  onCansel(): void {
    this.Router.navigate(['/users']);
  }
}

```

---

## `src/app/demo/pages/settings/users/users-list/users-list.component.html`

```html
<div class="card">
  <p-toolbar>
    <ng-template pTemplate="left">
      <div class="flex flex-wrap gap-2 align-items-center">
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <input pInputText type="text" [(ngModel)]="searchTerm" (input)="search()" [placeholder]="'search' | translate" />
        </span>

        <p-dropdown
          [options]="roles"
          [(ngModel)]="selectedRole"
          optionLabel="name"
          [placeholder]="'Select Role' | translate"
          [showClear]="true"
          (onChange)="onFilterChange()"
          class="w-12rem"
        ></p-dropdown>

        <p-dropdown
          [options]="vendors"
          [(ngModel)]="selectedVendor"
          optionLabel="name"
          [placeholder]="'Select Vendor' | translate"
          [showClear]="true"
          [filter]="true"
          filterBy="name"
          (onChange)="onFilterChange()"
          class="w-12rem"
        ></p-dropdown>

        <p-button
          *ngIf="selectedRole || selectedVendor || searchTerm"
          icon="pi pi-filter-slash"
          severity="secondary"
          [text]="true"
          (onClick)="clearFilters()"
          pTooltip="Clear Filters"
        ></p-button>
      </div>
    </ng-template>
  </p-toolbar>
  <p-table
    #dt
    [value]="users"
    [paginator]="true"
    [rows]="10"
    [totalRecords]="totalRecords"
    [lazy]="true"
    [loading]="loading"
    [showCurrentPageReport]="true"
    [tableStyle]="{ 'min-width': '50rem' }"
    [currentPageReportTemplate]="'showingEntries' | translate"
    (onLazyLoad)="loadUsers($event)"
    [rowsPerPageOptions]="[10, 25, 50]"
  >
    <ng-template pTemplate="header">
      <tr>
        <th>{{ 'name' | translate }}</th>
        <th>{{ 'email' | translate }}</th>
        <th>{{ 'phone' | translate }}</th>
        <th>{{ 'Role' | translate }}</th>
        <th>{{ 'Vendor' | translate }}</th>
        <th style="width: 15%">{{ 'action' | translate }}</th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-user>
      <tr>
        <td>{{ user.username }}</td>
        <td>{{ user.email }}</td>
        <td>{{ user.phoneNumber }}</td>
        <td>
          <span *ngFor="let role of user.roles; let last = last">{{ role.name }}{{ !last ? ', ' : '' }}</span>
        </td>
        <td>{{ user.companyName || '--' }}</td>
        <td class="flex justify-content-center">
          <div class="flex gap-1">
            <p-button (onClick)="showDialog(user)" icon="pi pi-key" severity="warning" [rounded]="true" />
            <p-button icon="pi pi-eye" severity="info" [rounded]="true" [routerLink]="['/user-details', user.id]"></p-button>
            <p-button
              icon="pi pi-pencil"
              severity="success"
              [rounded]="true"
              [routerLink]="['/user-form']"
              [queryParams]="{ id: user.id }"
            ></p-button>
          </div>
        </td>
      </tr>
    </ng-template>
    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="6">
          <div class="flex flex-column justify-content-center align-items-center py-5 w-full">
            <i class="pi pi-inbox" style="font-size: 3rem; color: var(--gray-400)"></i>
            <span class="mt-2 text-gray-500 font-medium">{{ 'No Data found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>
<p-dialog header="Change Password" [modal]="true" [(visible)]="displayDialog" [style]="{ width: '30rem' }">
  <span class="p-text-secondary block mb-5">Enter new password for {{ selectedUser?.username }}.</span>
  <div class="flex justify-content-center mt-5 mb-5">
    <span class="p-float-label w-full">
      <p-password
        id="password"
        [(ngModel)]="password"
        styleClass="w-full"
        [style]="{ width: '100%' }"
        promptLabel="Choose a password"
        weakLabel="Too simple"
        mediumLabel="Average complexity"
        strongLabel="Complex password"
        [toggleMask]="true"
      ></p-password>
      <label for="password">New Password</label>
    </span>
  </div>
  <div class="flex justify-content-end gap-2 mb-3">
    <p-button label="Cancel" severity="secondary" (onClick)="displayDialog = false" />
    <p-button label="Save" (onClick)="changePassword()" />
  </div>
</p-dialog>

<p-dialog header="Password Changed" [modal]="true" [(visible)]="displaySuccessDialog" [style]="{ width: '25rem' }">
  <div class="flex flex-column align-items-center justify-content-center gap-3 mb-3">
    <i class="pi pi-check-circle text-5xl text-green-500"></i>
    <span class="font-bold text-lg">Success!</span>
    <p class="text-center m-0 text-color-secondary">
      The password has been updated successfully.
      <br />
      <span class="font-bold">please check your email for the new password</span>
    </p>

    <div class="surface-100 p-3 border-round w-full flex align-items-center justify-content-between mt-2">
      <span class="font-mono text-xl">{{ newPasswordDisplay }}</span>
      <p-button
        icon="pi pi-copy"
        [text]="true"
        [rounded]="true"
        severity="secondary"
        (onClick)="copyToClipboard()"
        pTooltip="Copy to clipboard"
        tooltipPosition="left"
      ></p-button>
    </div>
  </div>
  <div class="flex justify-content-end mb-3">
    <p-button label="Close" (onClick)="displaySuccessDialog = false" />
  </div>
</p-dialog>

```

---

## `src/app/demo/pages/settings/users/users-list/users-list.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/users/users-list/users-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersListComponent } from './users-list.component';

describe('UsersListComponent', () => {
  let component: UsersListComponent;
  let fixture: ComponentFixture<UsersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/users/users-list/users-list.component.ts`

```ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { BaseSearchCriteria, FilterItem } from 'src/app/shared/mapping/filterMap';
import { RoleService } from 'src/app/shared/services/role.service';
import { UseriesService } from 'src/app/shared/services/useries.service';
import { VendorService } from 'src/app/shared/services/vendor.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  constructor(
    private UseriesService: UseriesService,
    private ToastService: ToastrService,
    private RoleService: RoleService,
    private VendorService: VendorService
  ) {}

  users: any[] = [];
  totalRecords = 0;
  loading: boolean = false;
  searchTerm: string = '';

  // Filter options
  roles: any[] = [];
  vendors: any[] = [];
  selectedRole: any = null;
  selectedVendor: any = null;

  displayDialog: boolean = false;
  selectedUser: any = null;
  password: string = '';
  newPasswordDisplay: string = '';
  displaySuccessDialog: boolean = false;

  ngOnInit(): void {
    this.loadRoles();
    this.loadVendors();
  }

  loadRoles() {
    this.RoleService.getAllRoles().subscribe({
      next: (res) => {
        this.roles = res.data;
      },
      error: (err) => {
        console.error('Error fetching roles:', err);
      }
    });
  }

  loadVendors() {
    const criteria = { isPagingEnabled: false, pageIndex: 1, pageSize: 100 };
    this.VendorService.getAllVendors(criteria).subscribe({
      next: (res) => {
        this.vendors = res.data.data || res.data;
      },
      error: (err) => {
        console.error('Error fetching vendors:', err);
      }
    });
  }

  loadUsers(event: TableLazyLoadEvent) {
    this.loading = true;
    const payload = TableRequestBuilder.build(event, this.searchTerm);

    // Add custom filters for role and vendor
    if (this.selectedRole) {
      payload.filters = payload.filters || [];
      payload.filters.push({ column: 'roles.name', value: this.selectedRole.name });
    }
    if (this.selectedVendor) {
      payload.companyId = this.selectedVendor.id;
    }

    this.UseriesService.getAllUsers(payload).subscribe({
      next: (res) => {
        this.users = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.loading = false;
      }
    });
  }

  search() {
    this.dt.reset();
  }

  onFilterChange() {
    this.dt.reset();
  }

  clearFilters() {
    this.selectedRole = null;
    this.selectedVendor = null;
    this.searchTerm = '';
    this.dt.reset();
  }

  showDialog(user: any) {
    this.selectedUser = user;
    this.password = '';
    this.displayDialog = true;
  }

  changePassword() {
    if (!this.selectedUser || !this.password) return;

    const payload = {
      id: this.selectedUser.id,
      newPassword: this.password
    };

    const tempPassword = this.password;

    this.UseriesService.resetPassword(payload).subscribe({
      next: (res) => {
        console.log('Password changed successfully');
        this.displayDialog = false;
        this.ToastService.success('Password changed successfully');
        this.newPasswordDisplay = tempPassword;
        this.displaySuccessDialog = true;
        this.password = '';
      },
      error: (err) => {
        console.error('Error changing password:', err);
        this.ToastService.error('Failed to change password');
      }
    });
  }

  copyToClipboard() {
    if (this.newPasswordDisplay) {
      navigator.clipboard.writeText(this.newPasswordDisplay).then(() => {
        this.ToastService.info('Password copied to clipboard');
      });
    }
  }
}

```

---

## `src/app/demo/pages/settings/users/users.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'users'"
    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  ></sub-header>
  <app-users-list></app-users-list>


</div>

```

---

## `src/app/demo/pages/settings/users/users.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/users/users.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersComponent } from './users.component';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/users/users.component.ts`

```ts
import { Component } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from '../../../../shared/components/sub-header/sub-header.component';
import { UsersListComponent } from './users-list/users-list.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, UsersListComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  constructor(private router: Router) {}

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToVendorForm();
        break;
    }
  }

  goToVendorForm() {
    console.log('goToVendorForm');
    this.router.navigate(['/user-form']);
  }
}

```

---

## `src/app/demo/pages/settings/vendors/vendor-add-edit/vendor-add-edit.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="vendorId ? ('Edit Vendor' | translate) : ('Add Vendor' | translate)"
    [mainSection]="'Vendors' | translate"
    [subSection]="vendorId ? ('Edit' | translate) : ('Add' | translate)"
  ></sub-header>

  <div class="product-form shadow-3 p-4">
    <form class="form-field" [formGroup]="form">
      <h3 class="flex justify-content-between mb-3">
        {{ 'vendor Info' | translate }}
      </h3>

      <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round mb-4">
        <div class="field col-12 col-md-6">
          <label for="vendorName">
            {{ 'Vendor Name' | translate }}
          </label>
          <input pInputText type="text" class="w-full" id="vendorName" formControlName="Name" required />
          <div class="text-danger" *ngIf="form.get('Name')?.touched && form.get('Name')?.invalid">
            {{ 'Vendor name is required' | translate }}
          </div>
        </div>

        <div class="field col-12 col-md-6">
          <label for="vendorMail">
            {{ 'Email Address' | translate }}
          </label>
          <input pInputText type="email" class="w-full" id="vendorMail" formControlName="Email" placeholder="example@outlook.com" />
          <div class="text-danger" *ngIf="form.get('Email')?.touched && form.get('Email')?.errors">
            <span *ngIf="form.get('Email')?.errors['required']">{{ 'Email is required' | translate }}</span>
            <span *ngIf="form.get('Email')?.errors['email']">{{ 'Invalid email format' | translate }}</span>
          </div>
        </div>

        <div class="field col-12 col-md-4">
          <label for="Phone">
            {{ 'Phone' | translate }}
          </label>
          <input pInputText type="text" class="w-full" id="Phone" formControlName="Phone" placeholder="Phone number" />
          <div class="text-danger" *ngIf="form.get('Phone')?.touched && form.get('Phone')?.invalid">
            {{ 'Phone number is required' | translate }}
          </div>
        </div>

        <div class="field col-12 col-md-4">
          <label for="Address">
            {{ 'Vendor Address' | translate }}
          </label>
          <input pInputText type="text" class="w-full" id="Address" formControlName="Address" />
          <div class="text-danger" *ngIf="form.get('Address')?.touched && form.get('Address')?.invalid">
            {{ 'Address is required' | translate }}
          </div>
        </div>
        <div class="field col-12 col-md-4">
          <label for="salesAgent">
            {{ 'sales agent' | translate }}
          </label>
          <p-dropdown
            id="salesAgent"
            [options]="salesAgencies"
            formControlName="SalesId"
            optionLabel="name"
            optionValue="id"
            (onFilter)="onsalesAgentsFilter($event)"
            [filter]="true"
            placeholder="{{ '-- Select --' | translate }}"
            [showClear]="true"
            class="w-full"
            appendTo="body"
          ></p-dropdown>
          <!-- <div class="text-danger" *ngIf="form.get('SalesId')?.touched && form.get('SalesId')?.invalid">
            {{ 'Sales Agent is required' | translate }}
          </div> -->
        </div>

        <div class="field col-12 col-md-12">
          <label>{{ 'Description' | translate }}</label>
          <textarea rows="3" class="w-full" pInputTextarea formControlName="Description"></textarea>
          <div class="text-danger" *ngIf="form.get('Description')?.touched && form.get('Description')?.invalid">
            {{ 'descreption is required' | translate }}
          </div>
        </div>
      </div>

<h3 class="mt-5 mb-3">{{ 'Vendor Business Activity' | translate }}</h3>

<div class="formgrid grid px-3 py-2 border-1 border-dashed surface-border border-round mb-4">
  <!-- Row 1: Hotel + Travel -->
  <div class="field col-12 col-md-6 flex align-items-center justify-content-between mt-3 mb-3">
    <div class="flex align-items-center">
      <p-checkbox
        formControlName="IsHotelCommission"
        [(ngModel)]="isHotel"
        [binary]="true"
        inputId="hotel"
        class="mr-2"
      ></p-checkbox>
      <label for="hotel" class="font-medium mb-0">{{ 'Hotel' | translate }}</label>
    </div>

    <p-inputNumber
      *ngIf="isHotel"
      prefix="%"
      class="w-6rem"
      mode="decimal"
      [step]="0.25"
      formControlName="HotelCommissionRate"
      [required]="isHotel"
    ></p-inputNumber>
  </div>

  <div class="field col-12 col-md-6 flex align-items-center justify-content-between mb-3">
    <div class="flex align-items-center">
      <p-checkbox
        formControlName="IsTravelCommission"
        [(ngModel)]="isTravel"
        [binary]="true"
        inputId="travel"
        class="mr-2"
      ></p-checkbox>
      <label for="travel" class="font-medium mb-0">{{ 'Travel' | translate }}</label>
    </div>

    <p-inputNumber
      *ngIf="isTravel"
      prefix="%"
      class="w-6rem"
      mode="decimal"
      [step]="0.25"
      formControlName="TravelCommissionRate"
      [required]="isTravel"
    ></p-inputNumber>
  </div>

  <!-- Row 2: Hajj + Out -->
  <div class="field col-12 col-md-6 flex align-items-center justify-content-between mb-3">
    <div class="flex align-items-center">
      <p-checkbox
        formControlName="IsHajjCommission"
        [(ngModel)]="isHajj"
        [binary]="true"
        inputId="hajj"
        class="mr-2"
      ></p-checkbox>
      <label for="hajj" class="font-medium mb-0">{{ 'Hajj' | translate }}</label>
    </div>

    <p-inputNumber
      *ngIf="isHajj"
      class="w-6rem"
      mode="decimal"
      [step]="0.25"
      formControlName="HajjCommissionRate"
      [required]="isHajj"
    ></p-inputNumber>
  </div>

  <div class="field col-12 col-md-6 flex align-items-center justify-content-between mb-3">
    <div class="flex align-items-center">
      <p-checkbox
        formControlName="IsOutCommission"
        [(ngModel)]="isOut"
        [binary]="true"
        inputId="out"
        class="mr-2"
      ></p-checkbox>
      <label for="out" class="font-medium mb-0">{{ 'Out' | translate }}</label>
    </div>

    <p-inputNumber
      *ngIf="isOut"
      prefix="%"
      class="w-6rem"
      mode="decimal"
      [step]="0.25"
      formControlName="OutCommissionRate"
      [required]="isOut"
    ></p-inputNumber>
  </div>
</div>


      <h3 class="mt-5 mb-3">
        {{ 'Vendor logo' | translate }}
      </h3>

      <app-img-uploader
        [multiple]="false"
        [displayFile]="oldImage ? oldImage : null"
        (filesChanged)="onLogoFileSelect($event)"
      ></app-img-uploader>
      <p class="text-danger" *ngIf="showLogoMessage && submitted">{{ 'Vendor logo is required' | translate }}</p>

      <h3 class="mt-5 mb-3">{{ 'Licence Documents' | translate }}</h3>
      <app-img-uploader
        [displayFile]="oldlicenceFiles"
        [multiple]="true"
        (filesChanged)="onLicenceFilesSelect($event)"
        (removeImgFromDBWithId)="removeCommercialImageFromDB($event)"
      ></app-img-uploader>
      <div *ngIf="showLicenceMessage" class="text-red-500 text-sm">
        {{ 'Licence Documents is required' | translate }}
      </div>

      <h3 class="mt-5 mb-3">{{ 'Commercial Documents' | translate }}</h3>
      <app-img-uploader
        [displayFile]="oldcommercialFiles"
        [multiple]="true"
        (filesChanged)="onCommercialFilesSelect($event)"
        (removeImgFromDBWithId)="removeCommercialImageFromDB($event)"
      ></app-img-uploader>
      <div *ngIf="showCommercialMessage" class="text-red-500 text-sm">
        {{ 'Commercial Documents is required' | translate }}
      </div>
      <div class="buttons mt-3 text-end">
        <p-button
          label="{{ 'Cancel' | translate }}"
          type="button"
          class="mx-1 shadow"
          severity="secondary"
          (onClick)="onCancel()"
        ></p-button>
        <p-button
          type="submit"
          label="{{ 'save' | translate }}"
          severity="success"
          class="shadow"
          icon="pi pi-save"
          *ngIf="!vendorId"
          (onClick)="addVendor()"
        ></p-button>
        <p-button
          type="submit"
          label="{{ 'save' | translate }}"
          severity="success"
          class="shadow"
          icon="pi pi-save"
          *ngIf="vendorId"
          (onClick)="updateVendor()"
        ></p-button>
      </div>
    </form>
  </div>
</div>
<p-toast></p-toast>

```

---

## `src/app/demo/pages/settings/vendors/vendor-add-edit/vendor-add-edit.component.scss`

```scss
// .card{
//   margin:0 10px;
// }
// .form-group{
//   margin-bottom: 10px;
// }
// .form-group{
//   display: flex;
//   flex-direction: column;
//   gap: 5px;
//   margin-bottom: 20px;
// }


```

---

## `src/app/demo/pages/settings/vendors/vendor-add-edit/vendor-add-edit.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorAddEditComponent } from './vendor-add-edit.component';

describe('VendorAddEditComponent', () => {
  let component: VendorAddEditComponent;
  let fixture: ComponentFixture<VendorAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/vendors/vendor-add-edit/vendor-add-edit.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VendorService } from 'src/app/shared/services/vendor.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { Vendor } from 'src/app/shared/model/vendoreDto';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';
import { MessageService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { SalesAganciesService } from 'src/app/shared/services/sales-agancies.service';

@Component({
  selector: 'app-vendor-add-edit',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent, ImgUploaderComponent],
  templateUrl: './vendor-add-edit.component.html',
  styleUrls: ['./vendor-add-edit.component.scss'],
  providers: [MessageService]
})
export class VendorAddEditComponent implements OnInit {
  vendorId: string | null = null;
  form: FormGroup;
  submitted = false;
  logoFile: File | null = null;
  oldImage = '';
  licenceFiles: File[] = [];
  commercialFiles: File[] = [];
  oldlicenceFiles: File[] = [];
  oldcommercialFiles: File[] = [];
  showLicenceMessage = false;
  showCommercialMessage = false;

  isHotel = false;
  isTravel = false;
   isHajj = false;
  isOut = false;
  showLogoMessage = false;
  salesAgencies: any[] = [];
  filterMap: FilterMap = {
    pageIndex: 1,
    pageSize: 10,
    sort: '',
    Search: ''
  };
  constructor(
    private salesAganciesService: SalesAganciesService,
    private readonly formBuilder: FormBuilder,
    private vendorService: VendorService,
    private route: ActivatedRoute,
    private location: Location,
    private messageService: MessageService,
    private ToastrService: ToastrService
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params['id']) this.vendorId = params['id'];
      this.getVendorById(this.vendorId);
    });
  }
  loadSalesAgancies(): void {
    this.salesAganciesService.getSalesAgancies(this.filterMap).subscribe({
      next: (res: any) => {
        this.salesAgencies = res.data.data || [];
      }
    });
  }
  onsalesAgentsFilter(event: any): void {
    this.filterMap.Search = event.filter; // الكلمة اللي المستخدم كتبها
    this.filterMap.pageIndex = 1; // نرجع لأول صفحة
    this.loadSalesAgancies();
  }
  ngOnInit(): void {
    this.initializeForm();
    this.loadSalesAgancies();
  }

  private initializeForm(): void {
    this.form = this.formBuilder.group({
      Id: [0], // integer
      Name: ['', Validators.required], // string
      Description: ['', Validators.required], // string
      Email: ['', [Validators.required, Validators.email]], // email
      Address: ['', Validators.required], // string
      Phone: ['', [Validators.required]], // phone
      SalesId: [null],
      IsHotelCommission: [false], // boolean
      HotelCommissionRate: [0], // number
      IsTravelCommission: [false], // boolean
      TravelCommissionRate: [0] , // number
       

      // ✅ New commissions
      IsHajjCommission: [false],
      HajjCommissionRate: [0],
      IsOutCommission: [false],
      OutCommissionRate: [0]
    });
  }

  getVendorById(vendorId) {
    this.vendorService.getVendorById(vendorId).subscribe(
      (response) => {
        if (response.success) {
          debugger;
          let vendor = response.data;

          // Bind travel data to travelForm
          this.bindFormDate(vendor);
          if (vendor?.logoUrl) {
            this.oldImage = vendor.logoUrl;
          }
          if (vendor?.licenceDocuments) {
            this.oldlicenceFiles = vendor.licenceDocuments;
          }

          if (vendor?.commercialDocuments) {
            this.oldcommercialFiles = vendor.commercialDocuments; // روابط أو أسماء من الباك
          }

          this.isHotel = this.form.get('IsHotelCommission').value;
          this.isTravel = this.form.get('IsTravelCommission').value;
           this.isHajj = this.form.get('IsHajjCommission').value;
          this.isOut = this.form.get('IsOutCommission').value;
        }
      },
      (error) => {}
    );
  }
  addVendor(): void {
    this.submitted = true;
    this.form.get('IsHotelCommission').setValue(this.isHotel);
    this.form.get('IsTravelCommission').setValue(this.isTravel);

    if (!this.isHotel) this.form.get('HotelCommissionRate').setValue(0);
    if (!this.isTravel) this.form.get('TravelCommissionRate').setValue(0);

    const isFormInvalid = this.form.invalid;
    const isLogoMissing = !this.logoFile;
    const isLicenceMissing = this.licenceFiles.length === 0;
    const isCommercialMissing = this.commercialFiles.length === 0;

    this.showLogoMessage = isLogoMissing;
    this.showLicenceMessage = isLicenceMissing;
    this.showCommercialMessage = isCommercialMissing;

    if (isFormInvalid || isLogoMissing || isLicenceMissing || isCommercialMissing) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitFormData();
  }

  updateVendor(): void {
    this.submitted = true;
    this.form.get('IsHotelCommission').setValue(this.isHotel);
    this.form.get('IsTravelCommission').setValue(this.isTravel);

    if (!this.isHotel) this.form.get('HotelCommissionRate').setValue(0);
    if (!this.isTravel) this.form.get('TravelCommissionRate').setValue(0);
    if (!this.isHajj) this.form.get('HajjCommissionRate').setValue(0);
    if (!this.isOut) this.form.get('OutCommissionRate').setValue(0);

    const isFormInvalid = this.form.invalid;
    const isLogoMissing = !this.logoFile && !this.oldImage;
    const isLicenceMissing = this.licenceFiles.length === 0 && this.oldlicenceFiles.length === 0;
    const isCommercialMissing = this.commercialFiles.length === 0 && this.oldcommercialFiles.length === 0;

    this.showLogoMessage = isLogoMissing;
    this.showLicenceMessage = isLicenceMissing;
    this.showCommercialMessage = isCommercialMissing;

    if (isFormInvalid || isLogoMissing || isLicenceMissing || isCommercialMissing) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitFormUpdatedData();
  }

  removeCommercialImageFromDB(id) {
    this.vendorService.deleteLisenceDocument(id).subscribe({
      next: (res) => {
        this.ToastrService.success('Successfully Deleted');
      },
      error: (err) => {}
    });
  }

  private submitFormData(): void {
    const formData = new FormData();
    // Append each form field to the FormData object
    Object.keys(this.form.controls).forEach((key) => {
      const value = this.form.get(key)?.value;
      formData.append(key, value !== null ? value.toString() : '');
    });

    if (this.logoFile) {
      formData.append('ImageLogo', this.logoFile, this.logoFile.name);
    }
    // append LicenceDocuments
    this.licenceFiles.forEach((file, index) => {
      formData.append('LicenceDocuments', file, file.name);
    });

    // append CommercialDocuments
    this.commercialFiles.forEach((file, index) => {
      formData.append('CommercialDocuments', file, file.name);
    });

    this.vendorService.addVendor(formData).subscribe(
      (response) => {
        if (response.success) {
          this.ToastrService.success('Vendor added successfully');

          this.onCancel();
        }
      },
      (error) => {
        this.ToastrService.error(`Error: ${error.error.message}`);
      }
    );
  }
  private submitFormUpdatedData(): void {
    const formData = new FormData();

    // Append each form field
    Object.keys(this.form.controls).forEach((key) => {
      const value = this.form.get(key)?.value;
      formData.append(key, value !== null ? value.toString() : '');
    });

    // --- Logo ---
    if (this.logoFile) {
      formData.append('ImageLogo', this.logoFile, this.logoFile.name);
    } else if (this.oldImage) {
      formData.append('ImageLogo', this.oldImage);
    }

    // --- LicenceDocuments ---
    this.oldlicenceFiles.forEach((file) => {
      formData.append('OldLicenceDocuments', file); // أو append as string حسب الباك
    });
    this.licenceFiles.forEach((file) => {
      formData.append('LicenceDocuments', file, file.name);
    });

    // --- CommercialDocuments ---
    this.oldcommercialFiles.forEach((file) => {
      formData.append('OldCommercialDocuments', file);
    });
    this.commercialFiles.forEach((file) => {
      formData.append('CommercialDocuments', file, file.name);
    });

    this.vendorService.updateVendor(formData).subscribe(
      (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Update',
            detail: 'Successfully Updated'
          });
          this.onCancel();
        }
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `${error.error.message}`
        });
      }
    );
  }

  onLogoFileSelect(event: any): void {
    this.logoFile = event[0];
    this.showLogoMessage = false;
  }

  bindFormDate(vendorData): void {
    this.form.patchValue({
      Id: vendorData?.id,
      Name: vendorData?.name,
      Description: vendorData?.description,
      Email: vendorData?.email,
      Address: vendorData?.address,
      Phone: vendorData?.phone,
      IsHotelCommission: vendorData?.isHotelCommission,
      HotelCommissionRate: vendorData?.hotelCommissionRate,
      IsTravelCommission: vendorData?.isTravelCommission,
      TravelCommissionRate: vendorData?.travelCommissionRate ,
      SalesId: vendorData?.salesId ,
      // ✅ New commissions
      IsHajjCommission: vendorData?.isHajjCommission,
      HajjCommissionRate: vendorData?.hajjCommissionRate,
      IsOutCommission: vendorData?.isOutCommission,
      OutCommissionRate: vendorData?.outCommissionRate
    });
  }
  onCancel() {
    this.form.reset();
    this.location.back();
  }

  onLicenceFilesSelect(files: File[]): void {
    this.licenceFiles = files;
  }

  onCommercialFilesSelect(files: File[]): void {
    this.commercialFiles = files;
  }
}

```

---

## `src/app/demo/pages/settings/vendors/vendor-detail/payments-for-vendor-form/payments-for-vendor-form.component.html`

```html
<div class="container mt-4">
  <form [formGroup]="bankAccountForm" (ngSubmit)="onSubmit()" class="row g-3">
    <div *ngIf="alertMessage" class="alert alert-warning">
      {{ alertMessage }}
    </div>
    <!-- Account Number -->
    <div class="col-md-4">
      <label class="form-label">{{ 'Account Number' | translate }}</label>
      <input pInputText formControlName="accountNumber" />
      <div
        class="text-danger small"
        *ngIf="
          bankAccountForm.get('accountNumber')?.invalid &&
          (bankAccountForm.get('accountNumber')?.touched || bankAccountForm.get('accountNumber')?.dirty)
        "
      >
        {{ 'Account Number is required' | translate }}
      </div>
    </div>

    <!-- Account Name -->
    <div class="col-md-4">
      <label class="form-label">{{ 'Account Name' | translate }}</label>
      <input pInputText formControlName="accountName" />
      <div
        class="text-danger small"
        *ngIf="
          bankAccountForm.get('accountName')?.invalid &&
          (bankAccountForm.get('accountName')?.touched || bankAccountForm.get('accountName')?.dirty)
        "
      >
        {{ 'Account Name is required' | translate }}
      </div>
    </div>

    <!-- Bank Name -->
    <div class="col-md-4">
      <label class="form-label">{{ 'Bank Name' | translate }}</label>
      <input pInputText formControlName="bankName" />
      <div
        class="text-danger small"
        *ngIf="
          bankAccountForm.get('bankName')?.invalid && (bankAccountForm.get('bankName')?.touched || bankAccountForm.get('bankName')?.dirty)
        "
      >
        {{ 'Bank Name is required' | translate }}
      </div>
    </div>

    <!-- Amount In -->
    <div class="col-md-6">
      <label class="form-label">{{ 'Amount In' | translate }}</label>
      <input type="number" pInputText formControlName="amountIn" />
      <div
        class="text-danger small"
        *ngIf="
          bankAccountForm.get('amountIn')?.invalid && (bankAccountForm.get('amountIn')?.touched || bankAccountForm.get('amountIn')?.dirty)
        "
      >
        {{ 'Amount In is required' | translate }}
      </div>
    </div>

    <!-- Amount Out -->
    <div class="col-md-6">
      <label class="form-label">{{ 'Amount Out' | translate }}</label>
      <input type="number" pInputText formControlName="amountOut" />
      <div class="text-danger small" *ngIf="bankAccountForm.get('amountOut')?.errors?.['required']">
        {{ 'Amount Out is required' | translate }}
      </div>
      <div class="text-danger small" *ngIf="bankAccountForm.get('amountOut')?.errors?.['min']">
        {{ 'Amount cannot be negative' | translate }}
      </div>
      <div class="text-danger small" *ngIf="bankAccountForm.get('amountOut')?.errors?.['max']">
        {{ 'Amount cannot exceed' | translate }} {{ bankAccountForm.get('amountIn')?.value }}
      </div>
    </div>

    <!-- Created Date -->
    <div class="col-md-4">
      <label class="form-label">{{ 'Created Date' | translate }}</label>
      <p-calendar formControlName="createdDate" dateFormat="yy-mm-dd" class="w-100"></p-calendar>
      <div
        class="text-danger small"
        *ngIf="
          bankAccountForm.get('createdDate')?.invalid &&
          (bankAccountForm.get('createdDate')?.touched || bankAccountForm.get('createdDate')?.dirty)
        "
      >
        {{ 'Created Date is required' | translate }}
      </div>
    </div>

    <!-- From -->
    <div class="col-md-4">
      <label class="form-label">{{ 'From' | translate }}</label>
      <p-calendar formControlName="from" dateFormat="yy-mm-dd" class="w-100"></p-calendar>
    </div>

    <!-- To -->
    <div class="col-md-4">
      <label class="form-label">{{ 'To' | translate }}</label>
      <p-calendar formControlName="to" dateFormat="yy-mm-dd" class="w-100"></p-calendar>
    </div>

    <!-- Image -->
    <div class="col-md-12">
      <label class="form-label">{{ 'Image' | translate }}</label>
      <app-img-uploader
        [multiple]="false"
        [displayFile]="oldImage ? oldImage : null"
        (filesChanged)="onLogoFileSelect($event)"
      ></app-img-uploader>
    </div>

    <!-- Submit -->
    <div class="col-12 text-end">
      <button pButton type="submit" [label]="'Save' | translate" [disabled]="bankAccountForm.invalid"></button>
    </div>
  </form>
</div>

```

---

## `src/app/demo/pages/settings/vendors/vendor-detail/payments-for-vendor-form/payments-for-vendor-form.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/vendors/vendor-detail/payments-for-vendor-form/payments-for-vendor-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsForVendorFormComponent } from './payments-for-vendor-form.component';

describe('PaymentsForVendorFormComponent', () => {
  let component: PaymentsForVendorFormComponent;
  let fixture: ComponentFixture<PaymentsForVendorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsForVendorFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentsForVendorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/vendors/vendor-detail/payments-for-vendor-form/payments-for-vendor-form.component.ts`

```ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';
import { CompaniesWalletService } from 'src/app/shared/services/companies-wallet.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-payments-for-vendor-form',
  standalone: true,
  imports: [ImgUploaderComponent, SharedModule],
  templateUrl: './payments-for-vendor-form.component.html',
  styleUrl: './payments-for-vendor-form.component.scss'
})
export class PaymentsForVendorFormComponent {
  bankAccountForm!: FormGroup;
  oldImage: string | null = null;
  selectedFile: File | null = null;
  alertMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private CompaniesWalletService: CompaniesWalletService, // ✨ Inject service
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private ToastrService: ToastrService
  ) {}

  ngOnInit(): void {
    const vendorId = this.config.data.vendorId;
    const payMentData = this.config.data.calcData;
    if (payMentData.amountPaidBefore && payMentData.amountPaidBefore > 0) {
      this.alertMessage = `The selected items have already been paid: ${payMentData.amountPaidBefore} ; you should pay ${payMentData.totalAmount}`;
    }
    this.bankAccountForm = this.fb.group({
      companyId: [vendorId, Validators.required],
      userId: [null],
      accountNumber: ['', Validators.required],
      accountName: ['', Validators.required],
      bankName: ['', Validators.required],
      amountIn: [payMentData.totalAmount, [Validators.required]],
      amountOut: [0, [Validators.required, Validators.max(payMentData.totalAmount)]],
      totalAmount: [0],
      createdDate: ['', Validators.required],
      from: [payMentData.dateFrom ?new Date(payMentData.dateFrom) : null],
      to: [payMentData.dateTo ?new Date(payMentData.dateTo) : null ],
      image: [null],
      SattlementToPays: [payMentData.sattlements]
    });
    this.bankAccountForm.get('amountIn')?.disable();

    if ((payMentData.sattlements?.length ?? 0) > 1) {
      this.bankAccountForm.patchValue({
        amountOut: payMentData.totalAmount
      });
      this.bankAccountForm.get('amountOut')?.disable();
      this.bankAccountForm.get('amountIn')?.disable();
    }
  }

  onLogoFileSelect(files: File[]) {
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      this.bankAccountForm.patchValue({ image: this.selectedFile });
    }
  }

  onSubmit() {
    if (this.bankAccountForm.valid) {
      const formData = new FormData();

      Object.keys(this.bankAccountForm.controls).forEach((key) => {
        let value = this.bankAccountForm.get(key)?.value;

        if (value !== null && value !== undefined && key !== 'image') {
          // تحويل التواريخ
          if ((key === 'createdDate' || key === 'from' || key === 'to') && value instanceof Date) {
            value = value.toISOString();
          }

          // ✨ Handle SattlementToPays
          if (key === 'SattlementToPays' && Array.isArray(value)) {
            value.forEach((item: any) => {
              formData.append('SattlementToPays', JSON.stringify(item));
            });
            return; // نخلي الـ loop تعدي للـ key التالي بدون append للقيمة الأصلية
          }

          formData.append(key, value);
        }
      });

      // إضافة الصورة لو موجودة
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      // إرسال الفورم
      this.CompaniesWalletService.setPayMentToVendor(formData).subscribe({
        next: (res) => {
          this.ref.close(res);
          this.ToastrService.success('data saved', 'success');
        },
        error: (err) => this.ToastrService.error('error in saving data', 'error')
      });
    }
  }
}

```

---

## `src/app/demo/pages/settings/vendors/vendor-detail/payments-for-vendor-list/payments-for-vendor-list.component.html`

```html
<p-table
  [value]="archivedPayment"
  [lazy]="true"
  [first]="first"
  [paginator]="true"
  [rows]="rows"
  [totalRecords]="totalRecords"
  (onPage)="onPageChange($event)"
  [showCurrentPageReport]="true"
  [currentPageReportTemplate]="'showingEntries' | translate"
  [rowsPerPageOptions]="[5, 10, 25, 50]"
>
  <ng-template pTemplate="header">
    <tr>
      <th>{{ 'account Name' | translate }}</th>
      <th>{{ 'bank Name' | translate }}</th>
      <th>{{ 'amount In' | translate }}</th>
      <th>{{ 'amount Out' | translate }}</th>
      <th>{{ 'total Amount' | translate }}</th>
    </tr>
  </ng-template>
  <ng-template pTemplate="body" let-payment>
    <tr>
      <td>{{ payment.accountName }}</td>
      <td>{{ payment.bankName }}</td>
      <td>{{ payment.amountIn }}</td>
      <td>{{ payment.amountOut }}</td>
      <td>{{ payment.totalAmount }}</td>
    </tr>
  </ng-template>
</p-table>

```

---

## `src/app/demo/pages/settings/vendors/vendor-detail/payments-for-vendor-list/payments-for-vendor-list.component.scss`

```scss

```

---

## `src/app/demo/pages/settings/vendors/vendor-detail/payments-for-vendor-list/payments-for-vendor-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsForVendorListComponent } from './payments-for-vendor-list.component';

describe('PaymentsForVendorListComponent', () => {
  let component: PaymentsForVendorListComponent;
  let fixture: ComponentFixture<PaymentsForVendorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsForVendorListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentsForVendorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/vendors/vendor-detail/payments-for-vendor-list/payments-for-vendor-list.component.ts`

```ts
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CompaniesWalletService } from 'src/app/shared/services/companies-wallet.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-payments-for-vendor-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './payments-for-vendor-list.component.html',
  styleUrl: './payments-for-vendor-list.component.scss'
})
export class PaymentsForVendorListComponent implements OnInit, OnChanges {
  @Input() vendorId!: number;   // خليها number علشان تبقى واضحة
  archivedPayment: any[] = [];
  totalRecords: number = 0;     // مهم للـ p-table
  first: number = 0;
  rows: number = 10;
  search: string = '';

  constructor(private companiesWalletService: CompaniesWalletService) {}

  ngOnInit(): void {
    // مش هننده هنا غير لما vendorId يوصل
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vendorId'] && this.vendorId) {
      this.first = 0; // reset paging لما vendor يتغير
      this.getPaymentsForVendor();
    }
  }

  onPageChange(event: any) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? this.rows;
    this.getPaymentsForVendor();
  }

  getPaymentsForVendor() {
    if (!this.vendorId) return;

    const filter = {
      pageIndex: Math.floor(this.first / this.rows) + 1, // 1-based
      pageSize: this.rows,
      search: this.search,
      CompanyId: this.vendorId
    };

    this.companiesWalletService.getCompanyWallet(filter).subscribe({
      next: (res) => {
        console.log('Payments:', res.data);
        this.archivedPayment = res.data.data || res.data; // حسب الريسبونس
        this.totalRecords = res.data.itemsCount || 0;      // علشان الباجيناشن
      },
      error: (err) => {
        console.error('Error loading payments:', err);
      }
    });
  }
}

```

---

