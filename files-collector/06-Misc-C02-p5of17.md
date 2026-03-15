# 06 – Misc (Part 5/17 of Misc)

> **Description:** Everything else that didn't fit the categories above. [Category: C02]
> **Generated:** 2026-03-02 20:16:48

---

## `src/app/demo/pages/outing/outing-form/outing-form.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="isEditMode ? ('Edit Outing' | translate) : ('Add Outing' | translate)"
    [mainSection]="'Outing' | translate"
    [subSection]="isEditMode ? ('Edit' | translate) : ('Add' | translate)"
  ></sub-header>
  <div class="product-form shadow-3 p-4">
    <p-stepper [(activeStep)]="activeStep" *ngIf="reloadStepper">
      <!-- Step 1: Outing Information -->
      <p-stepperPanel [header]="'Outing Information' | translate">
        <ng-template pTemplate="content" let-nextCallback="nextCallback">
          <form class="form-field" [formGroup]="outingForm">
            <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
              <div class="field col-12 col-md-6">
                <label>{{ 'Outing Type' | translate }}</label>
                <p-dropdown
                  formControlName="OutingType"
                  [options]="outingTypeOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="{{ '-- Select Outing Type --' | translate }}"
                  styleClass="w-full"
                ></p-dropdown>
                <small
                  class="p-error"
                  *ngIf="
                    outingForm.get('OutingType')?.invalid && (outingForm.get('OutingType')?.touched || outingForm.get('OutingType')?.dirty)
                  "
                >
                  {{ 'Please select outing type' | translate }}
                </small>
              </div>

              <div class="field col-12 col-md-6">
                <label>{{ 'Name' | translate }}</label>
                <input pInputText formControlName="Name" />
                <small class="p-error" *ngIf="nameCtrl?.invalid && (nameCtrl?.touched || nameCtrl?.dirty)">
                  {{ 'This field is required' | translate }}
                </small>
              </div>

              <div class="field col-12 col-md-6">
                <label>{{ 'Target Audience' | translate }}</label>
                <input pInputText formControlName="TargetAudience" />
              </div>

              <div class="field col-12">
                <label>{{ 'Description' | translate }}</label>
                <textarea pInputTextarea rows="4" formControlName="Description" class="w-full"></textarea>
                <small class="p-error" *ngIf="descCtrl?.invalid && (descCtrl?.touched || descCtrl?.dirty)">
                  {{ 'This field is required' | translate }}
                </small>
              </div>

              <div class="field col-12 col-md-3">
                <label>{{ 'Location' | translate }}</label>
                <input pInputText formControlName="Location" />
              </div>

              <div class="field col-12 col-md-3">
                <label>{{ 'External Link' | translate }}</label>
                <input pInputText formControlName="ExternalLink" type="url" placeholder="https://..." />
              </div>

              <div class="field col-12 col-md-3">
                <label>{{ 'Category' | translate }}</label>
                <p-dropdown
                  formControlName="OutingCategoryId"
                  [options]="categories"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="{{ '-- Select --' | translate }}"
                  styleClass="w-full"
                ></p-dropdown>
                <small class="p-error" *ngIf="categoryCtrl?.invalid && (categoryCtrl?.touched || categoryCtrl?.dirty)">
                  {{ 'Please select Outing Category' | translate }}
                </small>
              </div>

              <div class="field col-12 col-md-3">
                <label class="block mb-2">{{ 'Features' | translate }}</label>
                <p-multiSelect
                  formControlName="FeatureIds"
                  [options]="features"
                  optionLabel="name"
                  optionValue="id"
                  [filter]="true"
                  (onFilter)="onFeaturesFilter($event)"
                  placeholder="{{ 'Select Features' | translate }}"
                  styleClass="w-full"
                  display="chip"
                ></p-multiSelect>
                <small class="p-error" *ngIf="featuresCtrl?.invalid && (featuresCtrl?.touched || featuresCtrl?.dirty)">
                  {{ 'Please select at least one feature' | translate }}
                </small>
              </div>

              <div class="field col-12 col-md-3">
                <label>{{ 'Rating' | translate }}</label>
                <p-dropdown
                  formControlName="Rating"
                  [options]="starRatings"
                  placeholder="{{ '-- Select rating --' | translate }}"
                  styleClass="w-full"
                ></p-dropdown>
                <small class="p-error" *ngIf="ratingCtrl?.invalid && (ratingCtrl?.touched || ratingCtrl?.dirty)">
                  {{ 'Please select at least one feature' | translate }}
                </small>
              </div>

              <!-- Added Branches Field -->
              <div class="field col-12 col-md-4">
                <label class="block mb-2">{{ 'Branches' | translate }}</label>
                <p-multiSelect
                  formControlName="BranchIds"
                  [options]="branches"
                  optionLabel="name"
                  optionValue="id"
                  [filter]="true"
                  placeholder="{{ 'Select Branches' | translate }}"
                  styleClass="w-full"
                  display="chip"
                >
                  <ng-template pTemplate="footer">
                    <div class="p-2 flex gap-2 align-items-center">
                      <input
                        pInputText
                        type="text"
                        [(ngModel)]="newBranchName"
                        [ngModelOptions]="{ standalone: true }"
                        placeholder="{{ 'New Branch Name' | translate }}"
                        class="flex-1 p-inputtext-sm"
                      />
                      <input
                        pInputText
                        type="text"
                        [(ngModel)]="newBranchLocation"
                        [ngModelOptions]="{ standalone: true }"
                        placeholder="{{ 'Location' | translate }}"
                        class="flex-1 p-inputtext-sm"
                      />

                      <p-button icon="pi pi-plus" styleClass="p-button-sm" (onClick)="addNewBranch()"></p-button>
                    </div>
                  </ng-template>
                </p-multiSelect>
                <small
                  class="p-error"
                  *ngIf="
                    outingForm.get('BranchIds')?.invalid && (outingForm.get('BranchIds')?.touched || outingForm.get('BranchIds')?.dirty)
                  "
                >
                  {{ 'Please select at least one branch' | translate }}
                </small>
              </div>

              <!-- Start Date - Only shown for Normal type -->
              <div class="field col-12 col-md-4" *ngIf="outingForm.get('OutingType')?.value === OutingType.Normal">
                <label>{{ 'Start Date' | translate }}</label>
                <p-calendar
                  formControlName="StartDate"
                  [showIcon]="true"
                  [showTime]="true"
                  dateFormat="dd-mm-yy"
                  styleClass="w-full"
                  [iconDisplay]="'input'"
                ></p-calendar>
                <small class="p-error" *ngIf="startDateCtrl?.invalid && (startDateCtrl?.touched || startDateCtrl?.dirty)">
                  {{ 'Please select start date' | translate }}
                </small>
              </div>

              <!-- End Date - Only shown for Normal type -->
              <div class="field col-12 col-md-4" *ngIf="outingForm.get('OutingType')?.value === OutingType.Normal">
                <label>{{ 'End Date' | translate }}</label>
                <p-calendar
                  [iconDisplay]="'input'"
                  formControlName="EndDate"
                  [showIcon]="true"
                  [showTime]="true"
                  dateFormat="dd-mm-yy"
                  styleClass="w-full"
                ></p-calendar>
                <small class="p-error" *ngIf="endDateCtrl?.invalid && (endDateCtrl?.touched || endDateCtrl?.dirty)">
                  {{ 'Please select end date' | translate }}
                </small>
              </div>

              <div class="field col-12 col-md-4">
                <label>{{ 'Savings Ratio' | translate }}</label>
                <p-inputNumber
                  formControlName="SavingsRatio"
                  mode="decimal"
                  [min]="0"
                  [max]="100"
                  suffix="%"
                  styleClass="w-full"
                ></p-inputNumber>
              </div>

              <div class="field col-12 col-md-4">
                <label>{{ 'Price Before' | translate }}</label>
                <p-inputNumber formControlName="PriceBefore" mode="decimal" [min]="0" styleClass="w-full"></p-inputNumber>
              </div>

              <div class="field col-12 col-md-6">
                <label>{{ 'Is Active' | translate }}</label>
                <div><p-inputSwitch formControlName="IsActive"></p-inputSwitch></div>
              </div>

              <div class="field col-12 col-md-6">
                <label>{{ 'Is Blocked' | translate }}</label>
                <div><p-inputSwitch formControlName="IsBlocked"></p-inputSwitch></div>
              </div>
              <!-- Add this section after the Images field and before the buttons in Step 1 -->

              <!-- Policies Panel -->
              <div class="field col-12 mt-3">
                <p-panel header="{{ 'policies' | translate }}" [toggleable]="true" styleClass="custom-panel">
                  <!-- Refund Policy -->
                  <h3 class="flex justify-content-between align-items-center">
                    <span>{{ 'is refund enabled' | translate }}</span>
                    <span><p-inputSwitch formControlName="IsRefundable" /></span>
                  </h3>

                  <div
                    class="formgrid grid p-3 border-1 border-dashed surface-border border-round"
                    *ngIf="outingForm.get('IsRefundable')?.value"
                  >
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

                  <!-- Deposit Rate (always visible after price section) -->
                  <h3 class="mt-4">
                    {{ 'Deposit Rate' | translate }}
                  </h3>
                  <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
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
                      <small class="text-muted d-block mt-1">{{ 'Optional: Set deposit percentage (0-100%)' | translate }}</small>
                    </div>
                  </div>

                  <!-- Cancellation Policy -->
                  <h3 class="mt-4">
                    {{ 'Cancellation policies' | translate }}
                  </h3>
                  <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
                    <div class="field col-12">
                      <label for="cancellationPolicy">
                        {{ 'Cancellation Policy' | translate }}
                      </label>
                      <p-editor id="cancellationPolicy" formControlName="CancellationPolicy" [style]="{ height: '150px' }"></p-editor>
                      <small class="text-muted d-block mt-1">
                        {{ 'Optional: Describe the cancellation policy for customers' | translate }}
                      </small>
                      <div class="text-danger" *ngIf="shouldShowError('CancellationPolicy')">
                        {{ 'Please enter minimum days to refund' | translate }}
                      </div>
                    </div>
                  </div>
                </p-panel>
              </div>

              <div class="field col-12">
                <label>{{ 'Images' | translate }}</label>
                <app-img-uploader
                  [multiple]="true"
                  [displayFiles]="existingImages"
                  (filesChanged)="onImagesUpload($event)"
                  (removeImgFromDBWithId)="onImageDeleted($event)"
                ></app-img-uploader>
                <small class="p-error" *ngIf="showImageError">{{ 'At least one image is required' | translate }}</small>
              </div>
            </div>

            <div class="buttons mt-3 text-end">
              <p-button label="{{ 'Back' | translate }}" class="mx-1" severity="secondary" (onClick)="onBack()"></p-button>
              <p-button label="{{ 'Next' | translate }}" class="mx-1" severity="primary" (onClick)="onNext(nextCallback)"></p-button>
            </div>
          </form>
        </ng-template>
      </p-stepperPanel>

      <!-- Step 2: Add-Ons -->
      <p-stepperPanel [header]="'Add-Ons' | translate">
        <ng-template pTemplate="content" let-prevCallback="prevCallback" let-nextCallback="nextCallback">
          <form class="form-field" [formGroup]="addOnsForm">
            <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
              <div class="col-12 mb-3">
                <h5>{{ 'Manage Outing Add-Ons' | translate }}</h5>
              </div>

              <div class="field col-12 col-md-4">
                <label>{{ 'Add-On Name' | translate }}</label>
                <input pInputText formControlName="name" />
              </div>

              <div class="field col-12 col-md-4">
                <label>{{ 'Price' | translate }}</label>
                <p-inputNumber formControlName="price"></p-inputNumber>
              </div>

              <div class="field col-12 col-md-4">
                <label>{{ 'Description' | translate }}</label>
                <input pInputText formControlName="description" />
              </div>

              <div class="col-12">
                <p-button
                  label="{{ 'Add to List' | translate }}"
                  icon="pi pi-plus"
                  (onClick)="addAddOn()"
                  [disabled]="addOnsForm.invalid"
                ></p-button>
              </div>

              <!-- Add-Ons List -->
              <div class="col-12 mt-3" *ngIf="addOnsList.length > 0">
                <p-table [value]="addOnsList" styleClass="p-datatable-sm">
                  <ng-template pTemplate="header">
                    <tr>
                      <th>{{ 'Name' | translate }}</th>
                      <th>{{ 'Price' | translate }}</th>
                      <th>{{ 'Description' | translate }}</th>
                      <th>{{ 'Actions' | translate }}</th>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="body" let-addon let-i="rowIndex">
                    <tr>
                      <td>{{ addon.name }}</td>
                      <td>{{ addon.price }}</td>
                      <td>{{ addon.description }}</td>
                      <td>
                        <p-button icon="pi pi-trash" severity="danger" [text]="true" (onClick)="removeAddOn(i)"></p-button>
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              </div>
            </div>

            <div class="buttons mt-3 text-end">
              <p-button label="{{ 'Previous' | translate }}" class="mx-1" severity="secondary" (onClick)="prevCallback.emit()"></p-button>
              <p-button
                label="{{ 'Next' | translate }}"
                class="mx-1"
                severity="primary"
                [loading]="isLoading"
                [disabled]="isLoading"
                (onClick)="onNextAddOns(nextCallback)"
              ></p-button>
            </div>
          </form>
        </ng-template>
      </p-stepperPanel>

      <!-- Step 3: Offers -->
      <p-stepperPanel [header]="'Offers' | translate">
        <ng-template pTemplate="content" let-prevCallback="prevCallback" let-nextCallback="nextCallback">
          <form class="form-field" [formGroup]="offersForm">
            <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
              <div class="col-12 mb-3">
                <h5>{{ 'Manage Outing Offers' | translate }}</h5>
              </div>

              <div class="field col-12 col-md-12">
                <label>{{ 'Offer Title' | translate }}</label>
                <input pInputText formControlName="title" placeholder="{{ 'Enter title' | translate }}" />
              </div>

              <div class="field col-12 col-md-12">
                <label>{{ 'Description' | translate }}</label>
                <textarea pInputTextarea rows="4" formControlName="description" class="w-full"></textarea>
              </div>

              <div class="col-12">
                <p-button
                  label="{{ 'Add to List' | translate }}"
                  icon="pi pi-plus"
                  (onClick)="addOffer()"
                  [disabled]="offersForm.invalid"
                ></p-button>
              </div>

              <!-- Single Offer Preview -->
              <div class="col-12 mt-3" *ngIf="offer">
                <div class="card p-3">
                  <div class="flex align-items-center justify-content-between gap-3">
                    <div class="flex-1">
                      <h6 class="m-0">{{ offer.title }}</h6>
                      <p class="m-0 text-500">{{ offer.description }}</p>
                    </div>
                    <div>
                      <p-button icon="pi pi-trash" severity="danger" [text]="true" (onClick)="removeOffer()"></p-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="buttons mt-3 text-end">
              <p-button label="{{ 'Previous' | translate }}" class="mx-1" severity="secondary" (onClick)="prevCallback.emit()"></p-button>
              <p-button
                label="{{ 'Next' | translate }}"
                class="mx-1"
                severity="primary"
                [loading]="isLoading"
                [disabled]="isLoading"
                (onClick)="onNextOffers(nextCallback)"
              ></p-button>
            </div>
          </form>
        </ng-template>
      </p-stepperPanel>

      <!-- <p-stepperPanel [header]="'Offers' | translate">
        <ng-template pTemplate="content" let-prevCallback="prevCallback" let-nextCallback="nextCallback">
          <form class="form-field" [formGroup]="offersForm">
            <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
              <div class="col-12 mb-3">
                <h5>{{ 'Manage Outing Offers' | translate }}</h5>
              </div>

              <div class="field col-12 col-md-4">
                <label>{{ 'Offer Name' | translate }}</label>
                <input pInputText formControlName="name" />
              </div>

              <div class="field col-12 col-md-4">
                <label>{{ 'Discount (%)' | translate }}</label>
                <p-inputNumber formControlName="discount" [min]="0" [max]="100"></p-inputNumber>
              </div>

              <div class="field col-12 col-md-2">
                <label>{{ 'Start Date' | translate }}</label>
                <p-calendar
                  formControlName="startDate"
                  [showIcon]="true"
                  dateFormat="dd-mm-yy"
                  styleClass="w-full"
                ></p-calendar>
              </div>

              <div class="field col-12 col-md-2">
                <label>{{ 'End Date' | translate }}</label>
                <p-calendar
                  formControlName="endDate"
                  [showIcon]="true"
                  dateFormat="dd-mm-yy"
                  styleClass="w-full"
                ></p-calendar>
              </div>

              <div class="col-12">
                <p-button
                  label="{{ 'Add to List' | translate }}"
                  icon="pi pi-plus"
                  (onClick)="addOffer()"
                  [disabled]="offersForm.invalid"
                ></p-button>
              </div>

            
              <div class="col-12 mt-3" *ngIf="offersList.length > 0">
                <p-table [value]="offersList" styleClass="p-datatable-sm">
                  <ng-template pTemplate="header">
                    <tr>
                      <th>{{ 'Name' | translate }}</th>
                      <th>{{ 'Discount' | translate }}</th>
                      <th>{{ 'Start Date' | translate }}</th>
                      <th>{{ 'End Date' | translate }}</th>
                      <th>{{ 'Actions' | translate }}</th>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="body" let-offer let-i="rowIndex">
                    <tr>
                      <td>{{ offer.name }}</td>
                      <td>{{ offer.discount }}%</td>
                      <td>{{ offer.startDate | date: 'dd-MM-yyyy' }}</td>
                      <td>{{ offer.endDate | date: 'dd-MM-yyyy' }}</td>
                      <td>
                        <p-button
                          icon="pi pi-trash"
                          severity="danger"
                          [text]="true"
                          (onClick)="removeOffer(i)"
                        ></p-button>
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              </div>
            </div>

            <div class="buttons mt-3 text-end">
              <p-button
                label="{{ 'Previous' | translate }}"
                class="mx-1"
                severity="secondary"
                (onClick)="prevCallback.emit()"
              ></p-button>
              <p-button
                label="{{ 'Next' | translate }}"
                class="mx-1"
                severity="primary"
                [loading]="isLoading"
                [disabled]="isLoading"
                (onClick)="onNextOffers(nextCallback)"
              ></p-button>
            </div>
          </form>
        </ng-template>
      </p-stepperPanel> -->

      <!-- Step 4: Tickets -->
      <p-stepperPanel [header]="'Tickets' | translate">
        <ng-template pTemplate="content" let-prevCallback="prevCallback" let-nextCallback="nextCallback">
          <form class="form-field" [formGroup]="ticketsForm">
            <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
              <div class="col-12 mb-3 flex justify-content-between align-items-center">
                <h5 class="m-0">{{ 'Manage Outing Tickets' | translate }}</h5>
                <div class="flex gap-3">
                  <p-inputSwitch
                    formControlName="hasSerialNumber"
                    pTooltip="{{ 'Has Serial Number' | translate }}"
                    tooltipPosition="top"
                  ></p-inputSwitch>
                  <p-inputSwitch formControlName="isActive" pTooltip="{{ 'Is Active' | translate }}" tooltipPosition="top"></p-inputSwitch>
                </div>
              </div>

              <div class="field col-12 col-md-6">
                <label>{{ 'Ticket Type' | translate }}</label>
                <input pInputText formControlName="ticketType" />
              </div>

              <div class="field col-12 col-md-6">
                <label>{{ 'Description' | translate }}</label>
                <input pInputText formControlName="description" />
              </div>

              <div class="field col-12 col-md-4">
                <label>{{ 'Price' | translate }}</label>
                <p-inputNumber formControlName="price"></p-inputNumber>
              </div>

              <div class="field col-12 col-md-4">
                <label>{{ 'Available Quantity' | translate }}</label>
                <p-inputNumber formControlName="availableQuantity" [min]="1"></p-inputNumber>
                <small class="text-info" *ngIf="isAvailableQuantityDisabled">
                  {{ 'Auto-calculated from uploaded Excel file' | translate }}
                </small>
              </div>

              <!-- Excel Uploader (conditional) -->
              <div class="field col-12 col-md-4" *ngIf="ticketsForm.get('hasSerialNumber')?.value">
                <label class="block mb-2">{{ 'Upload Serial Numbers' | translate }}</label>
                <p-fileUpload
                  #excelUploader
                  mode="basic"
                  accept=".xlsx,.xls"
                  [maxFileSize]="5000000"
                  [auto]="true"
                  chooseLabel="{{ 'Choose Excel File' | translate }}"
                  (onSelect)="onExcelFileSelect($event)"
                  [disabled]="isUploadingExcel"
                ></p-fileUpload>
              </div>

              <!-- Serial Numbers Preview -->
              <div class="col-12 mt-2 mb-3" *ngIf="excelSerialNumbers.length > 0">
                <p-panel header="{{ 'Serial Numbers Preview' | translate }}" [toggleable]="true">
                  <p-table [value]="excelSerialNumbers" [rows]="15" [paginator]="true" styleClass="p-datatable-sm">
                    <ng-template pTemplate="header">
                      <tr>
                        <th>#</th>
                        <th>{{ 'Ticket Code' | translate }}</th>
                      </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-serial let-i="rowIndex">
                      <tr>
                        <td>{{ i + 1 }}</td>
                        <td>{{ serial.ticketCode }}</td>
                      </tr>
                    </ng-template>
                  </p-table>
                  <div class="mt-2">
                    <p-button
                      label="{{ 'Clear' | translate }}"
                      icon="pi pi-times"
                      severity="secondary"
                      [text]="true"
                      (onClick)="clearExcelUpload()"
                    ></p-button>
                  </div>
                </p-panel>
              </div>

              <div class="col-12 flex gap-2">
                <p-button
                  [label]="editingTicketIndex >= 0 ? ('Update Ticket' | translate) : ('Add to List' | translate)"
                  [icon]="editingTicketIndex >= 0 ? 'pi pi-check' : 'pi pi-plus'"
                  (onClick)="addTicket()"
                  [disabled]="ticketsForm.invalid"
                ></p-button>
                <p-button
                  *ngIf="editingTicketIndex >= 0"
                  label="{{ 'Cancel' | translate }}"
                  icon="pi pi-times"
                  severity="secondary"
                  (onClick)="cancelTicketEdit()"
                ></p-button>
              </div>

              <!-- Tickets List with Row Expansion -->
              <div class="col-12 mt-3" *ngIf="ticketsList.length > 0">
                <p-table [value]="ticketsList" dataKey="ticketType" styleClass="p-datatable-sm">
                  <ng-template pTemplate="header">
                    <tr>
                      <th style="width: 3rem"></th>
                      <th>{{ 'Ticket Type' | translate }}</th>
                      <th>{{ 'Description' | translate }}</th>
                      <th>{{ 'Price' | translate }}</th>
                      <th>{{ 'Quantity' | translate }}</th>
                      <th>{{ 'Has Serial' | translate }}</th>
                      <th>{{ 'Active' | translate }}</th>
                      <th>{{ 'Actions' | translate }}</th>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="body" let-ticket let-i="rowIndex" let-expanded="expanded">
                    <tr>
                      <td>
                        <p-button
                          *ngIf="ticket.hasSerialNumber && ticket.excelData?.length > 0"
                          type="button"
                          pRipple
                          [pRowToggler]="ticket"
                          [text]="true"
                          [rounded]="true"
                          [plain]="true"
                          [icon]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
                        ></p-button>
                      </td>
                      <td>{{ ticket.ticketType }}</td>
                      <td>{{ ticket.description }}</td>
                      <td>{{ ticket.price }}</td>
                      <td>{{ ticket.availableQuantity }}</td>
                      <td>
                        <i class="pi" [ngClass]="ticket.hasSerialNumber ? 'pi-check text-green-500' : 'pi-times text-gray-400'"></i>
                      </td>
                      <td>
                        <i class="pi" [ngClass]="ticket.isActive ? 'pi-check text-green-500' : 'pi-times text-red-500'"></i>
                      </td>
                      <td>
                        <p-button
                          icon="pi pi-pencil"
                          severity="info"
                          [text]="true"
                          (onClick)="editTicket(i)"
                          pTooltip="{{ 'Edit' | translate }}"
                          tooltipPosition="top"
                        ></p-button>
                        <p-button
                          *ngIf="ticket.id"
                          icon="pi pi-save"
                          severity="success"
                          [text]="true"
                          (onClick)="saveIndividualTicket(i)"
                          pTooltip="{{ 'Save to Server' | translate }}"
                          tooltipPosition="top"
                          [loading]="isLoading"
                        ></p-button>
                        <p-button
                          icon="pi pi-trash"
                          severity="danger"
                          [text]="true"
                          (onClick)="removeTicket(i)"
                          pTooltip="{{ 'Delete' | translate }}"
                          tooltipPosition="top"
                        ></p-button>
                      </td>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="rowexpansion" let-ticket>
                    <tr>
                      <td colspan="8">
                        <div class="p-3">
                          <h5>{{ 'Serial Numbers' | translate }} ({{ ticket.excelData?.length || 0 }})</h5>
                          <p-table [value]="ticket.excelData" [rows]="10" [paginator]="true" styleClass="p-datatable-sm">
                            <ng-template pTemplate="header">
                              <tr>
                                <th>#</th>
                                <th>{{ 'Ticket Code' | translate }}</th>
                              </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-serial let-idx="rowIndex">
                              <tr>
                                <td>{{ idx + 1 }}</td>
                                <td>{{ serial.ticketCode || serial.serialNumber }}</td>
                              </tr>
                            </ng-template>
                          </p-table>
                        </div>
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              </div>
            </div>

            <div class="buttons mt-3 text-end">
              <p-button label="{{ 'Previous' | translate }}" class="mx-1" severity="secondary" (onClick)="prevCallback.emit()"></p-button>

              <!-- Next button for Scheduled type -->
              <p-button
                *ngIf="isScheduledOuting"
                label="{{ 'Next' | translate }}"
                class="mx-1"
                severity="primary"
                [loading]="isLoading"
                [disabled]="isLoading"
                (onClick)="onNextTickets(nextCallback)"
              ></p-button>

              <!-- Finish button for Normal type -->
              <p-button
                *ngIf="!isScheduledOuting"
                label="{{ 'Finish' | translate }}"
                class="mx-1"
                severity="success"
                [loading]="isLoading"
                [disabled]="isLoading"
                (onClick)="onFinishNormal()"
              ></p-button>
            </div>
          </form>

          <p-toast></p-toast>
        </ng-template>
      </p-stepperPanel>

      <!-- Step 5: Schedules - Only shown for Scheduled type -->
      <p-stepperPanel [header]="'Schedules' | translate" *ngIf="isScheduledOuting">
        <ng-template pTemplate="content" let-prevCallback="prevCallback">
          <form class="form-field" [formGroup]="schedulesForm">
            <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
              <div class="col-12 mb-3">
                <h5>{{ 'Manage Outing Schedules' | translate }}</h5>
              </div>

              <div class="field col-12 col-md-4">
                <label>{{ 'Day of Week' | translate }}</label>
                <p-multiSelect
                  formControlName="dayOfWeek"
                  [options]="availableDays"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="{{ 'Select Days' | translate }}"
                  styleClass="w-full"
                  emptyMessage="{{ 'No days available' | translate }}"
                  display="chip"
                ></p-multiSelect>
              </div>

              <div class="field col-12 col-md-4">
                <label>{{ 'Schedule Type' | translate }}</label>
                <p-dropdown
                  formControlName="schedualType"
                  [options]="[
                    { label: 'Specific', value: SchedualType.Spacific },
                    { label: 'Interval', value: SchedualType.Interval }
                  ]"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="{{ 'Select Type' | translate }}"
                  styleClass="w-full"
                ></p-dropdown>
              </div>

              <div class="field col-12 col-md-4"></div>

              <div class="field col-12 col-md-6">
                <label>{{ 'Valid From' | translate }}</label>
                <p-calendar formControlName="validFrom" dateFormat="yy-mm-dd"></p-calendar>
              </div>

              <div class="field col-12 col-md-6">
                <label>{{ 'Valid To' | translate }}</label>
                <p-calendar formControlName="validTo" dateFormat="yy-mm-dd"></p-calendar>
              </div>

              <!-- Time Slots Management -->
              <div class="col-12">
                <p class="font-bold mb-2">{{ 'Time Slots' | translate }}</p>
                <div class="formgrid grid p-2 surface-50 border-round">
                  <div class="field col-12 col-md-5">
                    <label>{{ 'Start Time' | translate }}</label>
                    <p-calendar
                      formControlName="startTime"
                      [timeOnly]="true"
                      [hourFormat]="'12'"
                      dataType="string"
                      inputId="starttime"
                    ></p-calendar>
                  </div>

                  <div class="field col-12 col-md-5">
                    <label>{{ 'End Time' | translate }}</label>
                    <p-calendar
                      formControlName="endTime"
                      [timeOnly]="true"
                      [hourFormat]="'12'"
                      dataType="string"
                      inputId="endtime"
                    ></p-calendar>
                  </div>

                  <div class="field col-12 col-md-2 flex align-items-end">
                    <p-button
                      icon="pi pi-plus"
                      label="{{ 'Add Time Slot' | translate }}"
                      (onClick)="addTimeSlot()"
                      styleClass="p-button-outlined"
                      [disabled]="!schedulesForm.get('startTime')?.value || !schedulesForm.get('endTime')?.value"
                    ></p-button>
                  </div>

                  <!-- Temp Times Display -->
                  <div class="col-12" *ngIf="tempTimeSlots.length > 0">
                    <div class="flex flex-wrap gap-2">
                      <span *ngFor="let time of tempTimeSlots; let i = index" class="p-tag p-tag-info text-base px-3 py-1">
                        {{ time.startTime }} - {{ time.endTime }}
                        <i class="pi pi-times ml-2 cursor-pointer" (click)="removeTimeSlot(i)"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-12 mt-3">
                <p-button
                  label="{{ 'Add Schedule' | translate }}"
                  icon="pi pi-plus"
                  (onClick)="addSchedule()"
                  [disabled]="schedulesForm.invalid"
                ></p-button>
              </div>

              <div class="col-12 mt-3" *ngIf="schedulesList.length > 0">
                <p-table [value]="schedulesList" styleClass="p-datatable-sm" [rowTrackBy]="trackByFn">
                  <ng-template pTemplate="header">
                    <tr>
                      <th>{{ 'Day' | translate }}</th>
                      <th>{{ 'Type' | translate }}</th>
                      <th>{{ 'Times' | translate }}</th>
                      <th>{{ 'Validity' | translate }}</th>
                      <th>{{ 'Actions' | translate }}</th>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="body" let-schedule let-i="rowIndex">
                    <tr>
                      <td>
                        <div class="flex flex-wrap gap-1">
                          <span *ngFor="let day of schedule.dayOfWeek" class="p-tag p-tag-secondary">
                            <ng-container [ngSwitch]="day">
                              <span *ngSwitchCase="0">{{ 'Sun' | translate }}</span>
                              <span *ngSwitchCase="1">{{ 'Mon' | translate }}</span>
                              <span *ngSwitchCase="2">{{ 'Tue' | translate }}</span>
                              <span *ngSwitchCase="3">{{ 'Wed' | translate }}</span>
                              <span *ngSwitchCase="4">{{ 'Thu' | translate }}</span>
                              <span *ngSwitchCase="5">{{ 'Fri' | translate }}</span>
                              <span *ngSwitchCase="6">{{ 'Sat' | translate }}</span>
                            </ng-container>
                          </span>
                        </div>
                      </td>
                      <td>{{ schedule.schedualType === SchedualType.Spacific ? 'Specific' : 'Interval' }}</td>
                      <td>
                        <div *ngFor="let time of schedule.times">
                          <span class="p-tag p-tag-info mr-1 mb-1">{{ time.startTime }} - {{ time.endTime }}</span>
                        </div>
                      </td>
                      <td>
                        {{ schedule.validFrom | date: 'yyyy-MM-dd' }} {{ 'to' | translate }} {{ schedule.validTo | date: 'yyyy-MM-dd' }}
                      </td>
                      <td>
                        <p-button icon="pi pi-trash" severity="danger" [text]="true" (onClick)="removeSchedule(i)"></p-button>
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              </div>
            </div>

            <div class="buttons mt-3 text-end">
              <p-button label="{{ 'Previous' | translate }}" class="mx-1" severity="secondary" (onClick)="prevCallback.emit()"></p-button>
              <p-button
                label="{{ 'Finish' | translate }}"
                class="mx-1"
                severity="success"
                [loading]="isLoading"
                [disabled]="isLoading"
                (onClick)="onNextSchedules()"
              ></p-button>
            </div>
          </form>
          <p-toast></p-toast>
        </ng-template>
      </p-stepperPanel>
    </p-stepper>
  </div>
</div>

<p-toast />

```

---

## `src/app/demo/pages/outing/outing-form/outing-form.component.scss`

```scss

```

---

## `src/app/demo/pages/outing/outing-form/outing-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingFormComponent } from './outing-form.component';

describe('OutingFormComponent', () => {
  let component: OutingFormComponent;
  let fixture: ComponentFixture<OutingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(OutingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set availableQuantity and disable the control when excel serials are applied', () => {
    // Arrange: make sure hasSerialNumber is true
    component.ticketsForm.get('hasSerialNumber')?.setValue(true);
    // Example excel data with 5 serial numbers
    component.excelSerialNumbers = Array.from({ length: 5 }, (_, i) => ({ ticketCode: `S${i + 1}` }));

    // Act
    component.applyExcelSerialsToForm();

    // Assert
    const ctrl = component.ticketsForm.get('availableQuantity');
    expect(ctrl?.value).toBe(5);
    expect(ctrl?.disabled).toBeTrue();
  });

  it('should clear excel upload and re-enable available quantity', () => {
    // Arrange: set an uploaded state then clear
    component.excelSerialNumbers = Array.from({ length: 3 }, (_, i) => ({ ticketCode: `S${i + 1}` }));
    component.applyExcelSerialsToForm();

    // Act
    component.clearExcelUpload();

    // Assert
    const ctrl = component.ticketsForm.get('availableQuantity');
    expect(component.excelSerialNumbers.length).toBe(0);
    expect(ctrl?.enabled).toBeTrue();
    expect(ctrl?.value).toBe(1);
  });

  it('should correctly map availableQuantity from backend tickets with serials', () => {
    // Arrange: Prepare a response-like object
    const sample = {
      id: 99,
      name: 'Test Outing',
      tickets: [
        {
          id: 101,
          ticketType: 'serials..',
          description: 'serials..',
          price: 500,
          childPrice: null,
          availableQuantity: 11,
          isActive: true,
          outingId: 97,
          hasSerialNumber: true,
          outingTicketSerialNumbers: [{ ticketCode: 'A1' }, { ticketCode: 'A2' }, { ticketCode: 'A3' }]
        }
      ]
    };

    // Act
    component.populateFormsWithData(sample);

    // Assert: ticketsList should be mapped and availableQuantity set to 3 (from serials array length)
    expect(component.ticketsList.length).toBe(1);
    expect(component.ticketsList[0].availableQuantity).toBe(3);
    expect(component.ticketsList[0].excelData.length).toBe(3);
  });

  it('should set availableQuantity and excelData when adding a ticket with serials', () => {
    // Arrange
    component.ticketsForm.get('hasSerialNumber')?.setValue(true);
    component.excelSerialNumbers = [{ ticketCode: 'S1' }, { ticketCode: 'S2' }, { ticketCode: 'S3' }];
    component.ticketsForm.get('ticketType')?.setValue('serials..');
    component.ticketsForm.get('description')?.setValue('desc');
    component.ticketsForm.get('price')?.setValue(100);

    // Act
    component.addTicket();

    // Assert
    expect(component.ticketsList.length).toBeGreaterThan(0);
    const last = component.ticketsList[component.ticketsList.length - 1];
    expect(last.excelData?.length).toBe(3);
    expect(last.availableQuantity).toBe(3);
  });
});

```

---

## `src/app/demo/pages/outing/outing-form/outing-form.component.ts`

```ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { ImgUploaderComponent } from 'src/app/shared/img-uploader/img-uploader.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { environment } from 'src/environments/environment';
import { OutingCategoryServiseService } from 'src/app/shared/services/outing-category-servise.service';
import { OutingFeaturesService } from 'src/app/shared/services/outing-features.service';
import { IOutingFeature } from 'src/app/shared/model/iouting-feature';
import { OutingService } from 'src/app/shared/services/outing.service';
import { OutingBranshesService } from 'src/app/shared/services/outing-branshes.service';
import { OutingSchedule } from 'src/app/shared/model/outing-schedule';
import { MessageService } from 'primeng/api';
import { catchError, finalize } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { FileUpload } from 'primeng/fileupload';

@Component({
  selector: 'app-outing-form',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule, ImgUploaderComponent, ToastModule],
  providers: [MessageService],
  templateUrl: './outing-form.component.html',
  styleUrl: './outing-form.component.scss'
})
export class OutingFormComponent implements OnInit {
  outingForm: FormGroup;
  addOnsForm: FormGroup;
  offersForm: FormGroup;
  ticketsForm: FormGroup;
  schedulesForm: FormGroup;
  @ViewChild('excelUploader') excelUploader: FileUpload | undefined;

  activeStep = 0;
  outingId: number | null = null;
  isEditMode: boolean = false;
  selectedImages: File[] = [];
  existingImages: { id: number; url: string }[] = [];
  showImageError = false;
  imgPaseUrl = environment.imgUrl;
  isLoading = false;
  isLoadingData = false;

  originalFeatureIds: number[] = [];
  originalImageIds: number[] = [];
  deletedImageIds: number[] = [];
  deletedFeatureIds: number[] = [];

  // Lists for steps 2, 3, 4
  addOnsList: any[] = [];
  offer: any = null;
  ticketsList: any[] = [];
  schedulesList: OutingSchedule[] = [];

  get availableDays() {
    // Filter used days. Ensure type safety by converting to number for comparison or using loose check.
    const usedDays = this.schedulesList.reduce((acc: number[], s) => acc.concat(s.dayOfWeek || []), []).map(Number);
    return this.daysOfWeek.filter((day) => !usedDays.includes(Number(day.value)));
  }

  daysOfWeek = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 }
  ];

  SchedualType = {
    Spacific: 1,
    Interval: 2
  };
  OutingType = {
    Normal: 1,
    Scheduled: 2
  };

  outingTypeOptions = [
    { label: 'Normal', value: 1 },
    { label: 'Scheduled', value: 2 }
  ];

  // Excel upload for tickets
  uploadedExcelFile: File | null = null;
  excelSerialNumbers: any[] = [];
  isUploadingExcel = false;
  // Track if availableQuantity is disabled due to excel upload
  isAvailableQuantityDisabled = false;
  expandedRows: any = {};
  reloadStepper = true;

  // Track which ticket is being edited (-1 means not editing, adding new)
  editingTicketIndex: number = -1;

  // Temporary storage for time slots while building a schedule
  tempTimeSlots: { id?: number; startTime: string; endTime: string }[] = [];

  // Dropdown data
  categories: any[] = [];
  features: IOutingFeature[] = [];
  branches: any[] = []; // List of branches
  newBranchName: string = ''; // For adding new branch
  newBranchLocation: string = ''; // For adding new branch location
  starRatings = [1, 2, 3, 4, 5];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private outingCategoryService: OutingCategoryServiseService,
    private outingFeaturesService: OutingFeaturesService,
    private outingService: OutingService,
    private outingBranshesService: OutingBranshesService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadCategories();
    this.loadFeatures();
    this.loadBranches(); // Load branches on init

    // Check if editing existing outing
    this.route.queryParams.subscribe((params) => {
      if (params['id']) {
        this.outingId = +params['id'];
        this.isEditMode = true;
        this.loadOutingData(this.outingId);
      }
    });
  }

  // In your component
  // This method handles deleted images
  onImageDeleted(imageId: number): void {
    console.log('Image deleted with ID:', imageId);

    if (imageId && !this.deletedImageIds.includes(imageId)) {
      this.deletedImageIds.push(imageId);
    }

    // Remove from existing images display
    this.existingImages = this.existingImages.filter((img) => img.id !== imageId);

    // Update validation
    this.showImageError = this.selectedImages.length === 0 && this.existingImages.length === 0;
  }
  /**
   * Setup conditional validators for policy fields
   */
  setupPolicyValidators() {
    // Watch IsRefundable changes
    this.outingForm.get('IsRefundable')?.valueChanges.subscribe((isRefundable) => {
      const minimumDaysControl = this.outingForm.get('MinimumDaysToRefund');

      if (isRefundable) {
        minimumDaysControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        minimumDaysControl?.clearValidators();
        minimumDaysControl?.setValue(null);
      }
      minimumDaysControl?.updateValueAndValidity();
    });
  }

  /**
   * Setup conditional validators for StartDate and EndDate based on OutingType
   * Type 1 (Normal): StartDate and EndDate are required
   * Type 2 (Scheduled): StartDate and EndDate are not required
   */
  setupOutingTypeValidators() {
    this.outingForm.get('OutingType')?.valueChanges.subscribe((outingType) => {
      const startDateControl = this.outingForm.get('StartDate');
      const endDateControl = this.outingForm.get('EndDate');

      if (outingType === this.OutingType.Normal) {
        // Type 1: Normal - dates are required
        startDateControl?.setValidators([Validators.required]);
        endDateControl?.setValidators([Validators.required]);
      } else {
        // Type 2: Scheduled - dates are not required
        startDateControl?.clearValidators();
        endDateControl?.clearValidators();
        startDateControl?.setValue(null);
        endDateControl?.setValue(null);
      }
      startDateControl?.updateValueAndValidity();
      endDateControl?.updateValueAndValidity();

      // Force stepper reload to update step visibility
      this.reloadStepper = false;
      setTimeout(() => {
        this.reloadStepper = true;
      }, 0);
    });
  }

  initializeForms() {
    // Step 1: Main outing form
    this.outingForm = this.fb.group({
      OutingType: [1, Validators.required], // Default to Normal (1)
      Name: ['', [Validators.required, Validators.minLength(3)]],
      Description: ['', [Validators.required, Validators.minLength(5)]],
      Location: ['', [Validators.required]],
      ExternalLink: [''], // Added ExternalLink field
      StartDate: [null, Validators.required], // Required by default for Normal type
      EndDate: [null, Validators.required], // Required by default for Normal type
      TargetAudience: [''],
      IsActive: [true, Validators.required],
      IsBlocked: [false, Validators.required],
      OutingCategoryId: [null, Validators.required],
      FeatureIds: [[], [Validators.required, Validators.minLength(1)]],
      BranchIds: [[]], // Added BranchIds control
      Rating: [1, [Validators.required, Validators.min(0), Validators.max(5)]],
      PriceBefore: [null], // Added PriceBefore field
      // Policy fields
      IsRefundable: [false],
      MinimumDaysToRefund: [1],
      depositRate: [null],
      CancellationPolicy: ['', Validators.required],
      SavingsRatio: [null, [Validators.min(0), Validators.max(100)]]
    });

    // Add conditional validators for policy fields
    this.setupPolicyValidators();

    // Setup OutingType validators
    this.setupOutingTypeValidators();

    // Step 2: Add-ons form
    this.addOnsForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['']
    });

    // Step 3: Offers form
    this.offersForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });

    // Step 4: Tickets form
    this.ticketsForm = this.fb.group({
      ticketType: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      availableQuantity: [1, [Validators.required, Validators.min(1)]],
      isActive: [true, Validators.required],
      hasSerialNumber: [false, Validators.required]
    });

    // Step 5: Schedules form
    this.schedulesForm = this.fb.group({
      dayOfWeek: [[], Validators.required],
      schedualType: [this.SchedualType.Interval, Validators.required],
      // startTime and endTime are now managed via tempTimeSlots
      startTime: [null],
      endTime: [null],
      validFrom: [null, Validators.required],
      validTo: [null, Validators.required]
    });

    // When hasSerialNumber toggles, enable/disable availableQuantity accordingly
    this.ticketsForm.get('hasSerialNumber')?.valueChanges.subscribe((hasSerial) => {
      const availableCtrl = this.ticketsForm.get('availableQuantity');
      if (!hasSerial) {
        // If user disables serial numbers, clear any excel data and enable quantity input
        this.clearExcelUpload();
        availableCtrl?.enable({ emitEvent: false });
        this.isAvailableQuantityDisabled = false;
      } else {
        // If they enable serial numbers and there are excel serials, apply them
        if (this.excelSerialNumbers && this.excelSerialNumbers.length > 0) {
          this.applyExcelSerialsToForm();
        }
      }
    });
  }

  /**
   * Load existing outing data for edit mode
   */
  loadOutingData(id: number) {
    this.isLoadingData = true;

    forkJoin({
      outing: this.outingService.getOutingById(id).pipe(
        catchError((error) => {
          console.error('Error loading outing data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load outing data'
          });
          return of(null);
        })
      ),
      schedules: this.outingService.getOutingSchedulesByOutingId(id).pipe(
        catchError((error) => {
          console.error('Error loading schedules:', error);
          return of(null);
        })
      )
    })
      .pipe(
        finalize(() => {
          this.isLoadingData = false;
        })
      )
      .subscribe((results: any) => {
        if (results.outing?.success && results.outing?.data) {
          this.populateFormsWithData(results.outing.data);
        }

        if (results.schedules?.success && results.schedules?.data) {
          const schedulesData = results.schedules.data.data || [];
          if (schedulesData.length > 0) {
            this.schedulesList = schedulesData.map((schedule: any) => ({
              id: schedule.id,
              dayOfWeek: Array.isArray(schedule.dayOfWeek) ? schedule.dayOfWeek : [schedule.dayOfWeek],
              schedualType: schedule.schedualType,
              times: (schedule.timeSlots || []).map((t: any) => ({
                id: t.id,
                startTime: t.startTime,
                endTime: t.endTime
              })),
              validFrom: schedule.validFrom,
              validTo: schedule.validTo,
              outingId: schedule.outingId
            }));
          }
        }
      });
  }

  /**
   * Populate all forms with existing data
   */
  populateFormsWithData(data: any) {
    // Determine OutingType based on data - if data has outingType use it, otherwise default to Normal (1)
    const outingType = data.outingType || this.OutingType.Normal;

    // Step 1: Main outing information
    this.outingForm.patchValue({
      OutingType: outingType,
      Name: data.name,
      Description: data.description,
      Location: data.location,
      ExternalLink: data.externalLink || '', // Added ExternalLink field
      StartDate: data.startDate ? new Date(data.startDate) : null,
      EndDate: data.endDate ? new Date(data.endDate) : null,
      TargetAudience: data.targetAudience || '',
      IsActive: data.isActive,
      IsBlocked: data.isBlocked,
      OutingCategoryId: data.outingCategoryId,
      FeatureIds: data.features?.map((f: any) => f.id) || [],
      Rating: data.rating || 1,
      PriceBefore: data.priceBefore || null, // Added PriceBefore field
      // Policy fields
      IsRefundable: data.isRefundable || false,
      MinimumDaysToRefund: data.minimumDaysToRefund || null,
      depositRate: data.depositRate || null,
      CancellationPolicy: data.cancellationPolicy || '',
      SavingsRatio: data.savingsRatio || null,
      BranchIds: (data.branshes || data.branches || []).map((b: any) => b.id) // Populate existing branches
    });

    // Store original feature IDs for comparison
    this.originalFeatureIds = data.features?.map((f: any) => f.id) || [];

    // Populate existing images and store original IDs
    if (data.images && data.images.length > 0) {
      this.existingImages = data.images.map((img: any) => ({
        id: img.id,
        url: img.url
      }));
      this.originalImageIds = data.images.map((img: any) => img.id);
    }

    // Step 2: Add-ons
    if (data.addOns && data.addOns.length > 0) {
      this.addOnsList = data.addOns.map((addon: any) => ({
        id: addon.id, // Store ID for update
        name: addon.name,
        price: addon.price,
        description: addon.description || ''
      }));
    }

    // Step 3: Offers (single offer)
    if (data.offers && data.offers.length > 0) {
      const firstOffer = data.offers[0];
      this.offer = {
        id: firstOffer.id, // Store ID for update
        title: firstOffer.title,
        description: firstOffer.description
      };
    }

    // Step 4: Tickets
    if (data.tickets && data.tickets.length > 0) {
      this.ticketsList = data.tickets.map((ticket: any) => ({
        id: ticket.id, // Store ID for update
        ticketType: ticket.ticketType,
        description: ticket.description,
        price: ticket.price,
        // If the ticket has serial numbers, calculate availableQuantity from the serial array length
        availableQuantity:
          ticket.hasSerialNumber && ticket.outingTicketSerialNumbers && ticket.outingTicketSerialNumbers.length > 0
            ? ticket.outingTicketSerialNumbers.length
            : ticket.availableQuantity,
        isActive: ticket.isActive,
        hasSerialNumber: ticket.hasSerialNumber,
        excelData: ticket.outingTicketSerialNumbers || []
      }));
    }

    // Step 5: Schedules
    if (data.schedules && data.schedules.length > 0) {
      this.schedulesList = data.schedules.map((schedule: any) => ({
        id: schedule.id,
        dayOfWeek: schedule.dayOfWeek,
        schedualType: schedule.schedualType,
        validFrom: schedule.validFrom,
        validTo: schedule.validTo,
        times: (schedule.times || []).map((t: any) => ({
          id: t.id,
          startTime: t.startTime,
          endTime: t.endTime
        }))
      }));
    }
  }

  loadCategories(pageIndex: number = 1, pageSize: number = 100, search: string = '') {
    this.outingCategoryService.getAlloutingCategoty({ pageIndex, pageSize, search }).subscribe({
      next: (res: any) => {
        const items = res?.data?.data || [];
        this.categories = items.map((c: any) => ({
          label: c.name || c.Name || c.Title || c.title,
          value: c.id || c.Id
        }));
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadFeatures() {
    this.outingFeaturesService.getAllOutingFeatures({ pageIndex: 1, pageSize: 1000, Search: '' }).subscribe({
      next: (res: any) => {
        const items = res?.data?.data || [];
        this.features = items;
      },
      error: (err) => {
        console.error('Error loading features:', err);
      }
    });
  }

  onFeaturesFilter(event: any) {
    this.loadFeatures();
  }

  /**
   * Load available branches from service
   */
  loadBranches() {
    this.outingBranshesService.getAllOutingBranches({ pageIndex: 1, pageSize: 1000 }).subscribe({
      next: (res: any) => {
        if (res?.success) {
          // Handle both direct array and paginated response (data.data)
          if (Array.isArray(res.data)) {
            this.branches = res.data;
          } else if (res.data?.data && Array.isArray(res.data.data)) {
            this.branches = res.data.data;
          } else {
            this.branches = [];
            console.warn('Branches response format unexpected:', res);
          }
        }
      },
      error: (err) => {
        console.error('Error loading branches:', err);
      }
    });
  }

  /**
   * Add a new branch dynamically
   */
  addNewBranch() {
    if (!this.newBranchName || this.newBranchName.trim() === '') {
      return;
    }

    const payload = {
      name: this.newBranchName,
      description: '-', // Optional or default if required
      location: this.newBranchLocation
    };

    this.outingBranshesService.addOutingBranches(payload).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Branch added successfully'
          });

          // 1. Get the new branch ID from response
          let newBranchId = res.data;
          // If response data is an object with ID, extract it
          if (typeof res.data === 'object' && res.data?.id) {
            newBranchId = res.data.id;
          }

          // Re-load branches to get the full object properly or push safely
          this.outingBranshesService.getAllOutingBranches({ pageIndex: 1, pageSize: 1000 }).subscribe((branchesRes: any) => {
            if (branchesRes?.success) {
              let loadedBranches: any[] = [];
              if (Array.isArray(branchesRes.data)) {
                loadedBranches = branchesRes.data;
              } else if (branchesRes.data?.data && Array.isArray(branchesRes.data.data)) {
                loadedBranches = branchesRes.data.data;
              }

              this.branches = loadedBranches;

              // 2. Select the new branch in the form
              if (newBranchId) {
                const currentBranches = this.outingForm.get('BranchIds')?.value || [];
                this.outingForm.patchValue({
                  BranchIds: [...currentBranches, newBranchId]
                });
              }
            }
          });

          this.newBranchName = ''; // Reset input
          this.newBranchLocation = ''; // Reset location input
        }
      },
      error: (err) => {
        console.error('Error adding branch:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add branch'
        });
      }
    });
  }

  // ============= STEP 1: Outing Information =============
  onNext(nextCallback?: any) {
    this.outingForm.markAllAsTouched();

    // In edit mode, images are optional if there are existing images
    if (this.isEditMode) {
      this.showImageError = this.selectedImages.length === 0 && this.existingImages.length === 0;
    } else {
      this.showImageError = this.selectedImages.length === 0;
    }

    if (this.outingForm.invalid || this.showImageError) {
      return;
    }

    if (this.isLoading) return;

    // In edit mode, call update endpoint
    if (this.isEditMode && this.outingId) {
      this.updateOutingInfo(nextCallback);
    } else {
      this.createOutingInfo(nextCallback);
    }
  }

  createOutingInfo(nextCallback?: any) {
    this.isLoading = true;

    const formData = new FormData();
    const formValue = this.outingForm.value;

    formData.append('OutingType', formValue.OutingType?.toString() || '1');
    formData.append('Name', formValue.Name);
    formData.append('Description', formValue.Description);
    formData.append('Location', formValue.Location);
    if (formValue.ExternalLink) {
      formData.append('ExternalLink', formValue.ExternalLink);
    }
    formData.append('StartDate', formValue.StartDate?.toISOString() || '');
    formData.append('EndDate', formValue.EndDate?.toISOString() || '');
    formData.append('OutingCategoryId', formValue.OutingCategoryId?.toString() || '');
    formData.append('TargetAudience', formValue.TargetAudience || '');
    formData.append('Rating', formValue.Rating?.toString() || '1');
    formData.append('IsActive', formValue.IsActive?.toString() || 'true');
    formData.append('IsBlocked', formValue.IsBlocked?.toString() || 'false');
    formData.append('VendorId', '0');

    // PriceBefore field
    if (formValue.PriceBefore !== null && formValue.PriceBefore !== undefined) {
      formData.append('PriceBefore', formValue.PriceBefore.toString());
    }

    // Policy fields
    formData.append('IsRefundable', formValue.IsRefundable?.toString() || 'false');
    if (formValue.MinimumDaysToRefund) {
      formData.append('MinimumDaysToRefund', formValue.MinimumDaysToRefund.toString());
    }
    if (formValue.depositRate) {
      formData.append('depositRate', formValue.depositRate.toString());
    }
    if (formValue.CancellationPolicy) {
      formData.append('CancellationPolicy', formValue.CancellationPolicy);
    }
    if (formValue.SavingsRatio !== null && formValue.SavingsRatio !== undefined) {
      formData.append('SavingsRatio', formValue.SavingsRatio.toString());
    }

    // Only send features if selected
    if (formValue.FeatureIds && formValue.FeatureIds.length > 0) {
      formValue.FeatureIds.forEach((id: number) => {
        formData.append('features', id.toString());
      });
    }

    // Append BranchIds
    if (formValue.BranchIds && formValue.BranchIds.length > 0) {
      formValue.BranchIds.forEach((id: number) => {
        formData.append('Branshes', id.toString());
      });
    }

    if (this.selectedImages && this.selectedImages.length > 0) {
      this.selectedImages.forEach((file: File) => {
        formData.append('UploadedImages', file, file.name);
      });
    }

    this.outingService
      .addOutingOnly(formData)
      .pipe(
        catchError((error) => {
          console.error('Error creating outing:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to create outing'
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        if (response?.success || response?.id) {
          this.outingId = response.data;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Outing created successfully!'
          });

          if (nextCallback) {
            setTimeout(() => nextCallback.emit(), 500);
          }
        }
      });
  }

  updateOutingInfo(nextCallback?: any) {
    this.isLoading = true;

    const formData = new FormData();
    const formValue = this.outingForm.value;

    // Add the outing ID for update
    formData.append('Id', this.outingId!.toString());
    formData.append('OutingType', formValue.OutingType?.toString() || '1');
    formData.append('Name', formValue.Name);
    formData.append('Description', formValue.Description);
    formData.append('Location', formValue.Location);
    if (formValue.ExternalLink) {
      formData.append('ExternalLink', formValue.ExternalLink);
    }
    formData.append('StartDate', formValue.StartDate?.toISOString() || '');
    formData.append('EndDate', formValue.EndDate?.toISOString() || '');
    formData.append('OutingCategoryId', formValue.OutingCategoryId?.toString() || '');
    formData.append('TargetAudience', formValue.TargetAudience || '');
    formData.append('Rating', formValue.Rating?.toString() || '1');
    formData.append('IsActive', formValue.IsActive?.toString() || 'true');
    formData.append('IsBlocked', formValue.IsBlocked?.toString() || 'false');

    // PriceBefore field
    if (formValue.PriceBefore !== null && formValue.PriceBefore !== undefined) {
      formData.append('PriceBefore', formValue.PriceBefore.toString());
    }

    // Policy fields
    formData.append('IsRefundable', formValue.IsRefundable?.toString() || 'false');
    if (formValue.MinimumDaysToRefund) {
      formData.append('MinimumDaysToRefund', formValue.MinimumDaysToRefund.toString());
    }
    if (formValue.depositRate) {
      formData.append('depositRate', formValue.depositRate.toString());
    }
    if (formValue.CancellationPolicy) {
      formData.append('CancellationPolicy', formValue.CancellationPolicy);
    }

    if (formValue.SavingsRatio !== null && formValue.SavingsRatio !== undefined) {
      formData.append('SavingsRatio', formValue.SavingsRatio.toString());
    }

    // Calculate deleted feature IDs
    // Ensure unique IDs to prevent duplication
    const rawFeatureIds = formValue.FeatureIds || [];
    const currentFeatureIds = [...new Set(rawFeatureIds)] as number[];

    this.deletedFeatureIds = this.originalFeatureIds.filter((id) => !currentFeatureIds.includes(id));

    // ✅ Append current feature IDs as separate entries (Features) - only if selected
    if (currentFeatureIds.length > 0) {
      currentFeatureIds.forEach((id: number) => {
        formData.append('Features', id.toString());
      });
    }

    // Append BranchIds for update
    const currentBranchIds = formValue.BranchIds || [];
    if (currentBranchIds.length > 0) {
      currentBranchIds.forEach((id: number) => {
        formData.append('Branshes', id.toString()); // Using 'branches' as per consistency
      });
    }

    // ✅ Append deleted feature IDs as separate entries (DeletedFeatureIds)
    if (this.deletedFeatureIds.length > 0) {
      this.deletedFeatureIds.forEach((id: number) => {
        formData.append('DeletedFeatureIds', id.toString());
      });
    }

    // ✅ Append deleted image IDs as separate entries (DeletedImageIds)
    if (this.deletedImageIds.length > 0) {
      this.deletedImageIds.forEach((id: number) => {
        formData.append('DeletedImageIds', id.toString());
      });
    }

    // Only append new images if any were selected
    if (this.selectedImages && this.selectedImages.length > 0) {
      this.selectedImages.forEach((file: File) => {
        formData.append('UploadedImages', file, file.name);
      });
    }

    // Debug: Log FormData contents
    console.log('=== FormData Contents ===');
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    // Call update endpoint
    this.outingService
      .updateOutingOnly(formData)
      .pipe(
        catchError((error) => {
          console.error('Error updating outing:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to update outing'
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        if (response?.success || response !== null) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Outing updated successfully!'
          });

          // Reset deleted arrays after successful update
          this.deletedImageIds = [];
          this.deletedFeatureIds = [];

          // Update original values for next comparison
          this.originalFeatureIds = formValue.FeatureIds || [];
          this.originalImageIds = this.existingImages.map((img) => img.id);

          if (nextCallback) {
            setTimeout(() => nextCallback.emit(), 500);
          }
        }
      });
  }

  // ============= STEP 2: Add-Ons Management =============
  addAddOn() {
    if (this.addOnsForm.invalid) return;
    this.addOnsList.push({ ...this.addOnsForm.value });
    this.addOnsForm.reset({ name: '', price: 0, description: '' });
  }

  removeAddOn(index: number) {
    if (this.addOnsList[index].id) {
      // If the add-on has an ID, delete from backend
      this.outingService.deleteOutingAddOns(this.addOnsList[index].id).subscribe({
        next: (res: any) => {
          if (res?.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Add-on deleted successfully!'
            });
          }
        },
        error: (err) => {
          console.error('Error deleting add-on:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Failed to delete add-on'
          });
        }
      });
    }

    this.addOnsList.splice(index, 1);
  }

  onNextAddOns(nextCallback?: any) {
    if (!this.outingId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Outing ID is missing'
      });
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const addOnsPayload = {
      outingId: this.outingId,
      addOns: this.addOnsList.map((addon) => ({
        id: addon.id, // Include ID when updating
        name: addon.name,
        description: addon.description || '',
        price: addon.price
      }))
    };

    // Use update endpoint in edit mode, otherwise add
    const apiCall = this.isEditMode
      ? this.outingService.updateOutingAddOns(addOnsPayload)
      : this.outingService.addOutingAddOns(addOnsPayload);

    apiCall
      .pipe(
        catchError((error) => {
          console.error('Error with add-ons:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.message || 'Failed to save add-ons'
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        if (response?.success || response !== null) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.isEditMode ? 'Add-ons updated successfully!' : 'Add-ons saved successfully!'
          });

          if (nextCallback) {
            setTimeout(() => nextCallback.emit(), 500);
          }
        }
      });
  }

  // ============= STEP 3: Offers Management =============
  addOffer() {
    if (this.offersForm.invalid) return;

    if (this.offer && this.offer.id) {
      // Update existing offer
      this.offer = {
        id: this.offer.id, // Preserve the ID
        title: this.offersForm.value.title,
        description: this.offersForm.value.description
      };
    } else {
      // Create new offer
      this.offer = { ...this.offersForm.value };
    }
  }

  removeOffer() {
    // clear the single offer
    this.outingService.deleteOutingOffers(this.offer.id).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Offer deleted successfully!'
          });
          this.offer = null;
        }
      },
      error: (err) => {
        console.error('Error deleting offer:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to delete offer'
        });
      }
    });
  }

  onNextOffers(nextCallback?: any) {
    if (!this.outingId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Outing ID is missing'
      });
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    if (!this.offer) {
      this.isLoading = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Skipped offers step.'
      });
      if (nextCallback) {
        setTimeout(() => nextCallback.emit(), 200);
      }
      return;
    }

    // Build payload based on mode (add vs update)
    const offerPayload: any = {
      title: this.offer.title,
      description: this.offer.description,
      outingId: this.outingId
    };
    // Include offer ID when updating
    if (this.isEditMode) {
      offerPayload.id = this.offer.id;
    }

    // Use update endpoint in edit mode, otherwise add
    const apiCall = this.isEditMode
      ? this.outingService.updateOutingOffers(offerPayload)
      : this.outingService.addOutingOffers(offerPayload);

    apiCall
      .pipe(
        catchError((error) => {
          console.error('Error with offer:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.message || 'Failed to save offer'
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        if (response?.success || response !== null) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.isEditMode ? 'Offer updated successfully!' : 'Offer saved successfully!'
          });
          if (nextCallback) {
            setTimeout(() => nextCallback.emit(), 300);
          }
        }
      });
  }

  // ============= STEP 4: Tickets Management =============
  addTicket() {
    if (this.ticketsForm.invalid) return;

    const ticketData: any = { ...this.ticketsForm.value };

    // If hasSerialNumber is true, include the excelData
    if (ticketData.hasSerialNumber) {
      if (this.excelSerialNumbers.length === 0 && this.editingTicketIndex === -1) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please upload an Excel file with serial numbers first'
        });
        return;
      }
      if (this.excelSerialNumbers.length > 0) {
        ticketData.excelData = [...this.excelSerialNumbers];
        ticketData.availableQuantity = ticketData.excelData.length;
      } else if (this.editingTicketIndex >= 0) {
        // Keep existing excelData when editing without uploading new file
        ticketData.excelData = this.ticketsList[this.editingTicketIndex].excelData || [];
      }
    }

    // If we are editing an existing ticket, update it in the list
    if (this.editingTicketIndex >= 0) {
      // Preserve the id if editing an existing ticket
      ticketData.id = this.ticketsList[this.editingTicketIndex].id;
      this.ticketsList[this.editingTicketIndex] = ticketData;
      this.editingTicketIndex = -1;
    } else {
      // Adding new ticket
      this.ticketsList.push(ticketData);
    }

    // Ensure the available quantity is enabled before resetting the form so reset works correctly
    this.ticketsForm.get('availableQuantity')?.enable({ emitEvent: false });
    this.ticketsForm.reset({ ticketType: '', description: '', price: 0, availableQuantity: 1, isActive: true, hasSerialNumber: false });
    this.isAvailableQuantityDisabled = false;

    // Reset Excel data
    this.uploadedExcelFile = null;
    this.excelSerialNumbers = [];
  }

  /**
   * Edit an existing ticket - load its data into the form
   */
  editTicket(index: number) {
    const ticket = this.ticketsList[index];
    this.editingTicketIndex = index;

    // Populate the form with ticket data
    this.ticketsForm.patchValue({
      ticketType: ticket.ticketType,
      description: ticket.description,
      price: ticket.price,
      availableQuantity: ticket.availableQuantity,
      isActive: ticket.isActive,
      hasSerialNumber: ticket.hasSerialNumber
    });

    // If ticket has serial numbers, load them for preview
    if (ticket.hasSerialNumber && ticket.excelData?.length > 0) {
      this.excelSerialNumbers = ticket.excelData.map((item: any) => ({
        ticketCode: item.ticketCode || item.serialNumber
      }));
      this.ticketsForm.get('availableQuantity')?.disable({ emitEvent: false });
      this.isAvailableQuantityDisabled = true;
    }
  }

  /**
   * Cancel editing and reset the form
   */
  cancelTicketEdit() {
    this.editingTicketIndex = -1;
    this.ticketsForm.get('availableQuantity')?.enable({ emitEvent: false });
    this.ticketsForm.reset({ ticketType: '', description: '', price: 0, availableQuantity: 1, isActive: true, hasSerialNumber: false });
    this.isAvailableQuantityDisabled = false;
    this.uploadedExcelFile = null;
    this.excelSerialNumbers = [];
  }

  /**
   * Save individual ticket update via API
   */
  saveIndividualTicket(index: number) {
    const ticket = this.ticketsList[index];

    if (!ticket.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Ticket has not been saved to the server yet. Please use the Next/Finish button to save all tickets.'
      });
      return;
    }

    this.isLoading = true;

    const ticketPayload = {
      id: ticket.id,
      ticketType: ticket.ticketType,
      description: ticket.description,
      price: ticket.price,
      availableQuantity: ticket.availableQuantity,
      isActive: ticket.isActive,
      hasSerialNumber: ticket.hasSerialNumber || false,
      excelData: (ticket.excelData || []).map((item: any) => ({
        ticketCode: item.ticketCode || item.serialNumber
      }))
    };

    this.outingService
      .updateOutingTicket(ticketPayload)
      .pipe(
        catchError((error) => {
          console.error('Error updating ticket:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.message || 'Failed to update ticket'
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        if (response?.success || response !== null) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Ticket updated successfully!'
          });
        }
      });
  }

  removeTicket(index: number) {
    // Cancel edit if deleting the ticket being edited
    if (this.editingTicketIndex === index) {
      this.cancelTicketEdit();
    } else if (this.editingTicketIndex > index) {
      // Adjust editing index if a ticket before it is deleted
      this.editingTicketIndex--;
    }

    if (this.ticketsList[index].id) {
      this.outingService.deleteOutingTicket(this.ticketsList[index].id).subscribe({
        next: (res: any) => {
          if (res?.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Ticket deleted successfully!'
            });
          }
        },
        error: (err) => {
          console.error('Error deleting ticket:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Failed to delete ticket'
          });
        }
      });
    }
    this.ticketsList.splice(index, 1);
  }

  // ============= STEP 5: Schedules Management =============
  // ============= STEP 5: Schedules Management =============

  // Helper to add a time slot to the temp list
  addTimeSlot() {
    const formValue = this.schedulesForm.value;
    const startTime = formValue.startTime instanceof Date ? formValue.startTime.toISOString() : formValue.startTime;
    const endTime = formValue.endTime instanceof Date ? formValue.endTime.toISOString() : formValue.endTime;

    if (!startTime || !endTime) return;

    this.tempTimeSlots.push({ startTime, endTime });

    // Reset time inputs but keep other fields
    this.schedulesForm.patchValue({
      startTime: null,
      endTime: null
    });
  }

  removeTimeSlot(index: number) {
    this.tempTimeSlots.splice(index, 1);
  }

  addSchedule() {
    const formValue = this.schedulesForm.value;

    // Check for duplicate day
    const selectedDays: number[] = Array.isArray(formValue.dayOfWeek) ? formValue.dayOfWeek : [formValue.dayOfWeek];
    const usedDays = this.schedulesList.reduce((acc: number[], s) => acc.concat(s.dayOfWeek || []), []).map(Number);

    if (selectedDays.some((day) => usedDays.includes(Number(day)))) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'One or more selected days are already scheduled. Please delete existing schedule to modify.'
      });
      return;
    }

    // Check if form is valid (excluding start/end time if we have slots)
    // We strictly require day, validity, type, AND at least one time slot
    if (this.schedulesForm.invalid || this.tempTimeSlots.length === 0) {
      if (this.tempTimeSlots.length === 0) {
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please add at least one time slot' });
      }
      return;
    }

    // const formValue = this.schedulesForm.value; // Already declared above
    const schedule: OutingSchedule = {
      dayOfWeek: formValue.dayOfWeek,
      schedualType: formValue.schedualType,
      validFrom: formValue.validFrom instanceof Date ? formValue.validFrom.toISOString() : formValue.validFrom,
      validTo: formValue.validTo instanceof Date ? formValue.validTo.toISOString() : formValue.validTo,
      times: [...this.tempTimeSlots]
    };

    this.schedulesList = [...this.schedulesList, schedule];

    // Reset form and temp slots
    this.schedulesForm.reset({
      schedualType: this.SchedualType.Interval // Keep default type
    });
    this.tempTimeSlots = [];
  }

  removeSchedule(index: number) {
    if (this.schedulesList[index].id) {
      this.outingService.deleteOutingSchedules(this.schedulesList[index].id).subscribe({
        next: (res: any) => {
          if (res?.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Schedule deleted successfully!'
            });
          }
        },
        error: (err) => {
          console.error('Error deleting schedule:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Failed to delete schedule'
          });
        }
      });
    }
    this.schedulesList = this.schedulesList.filter((_, i) => i !== index);
  }

  onNextSchedules(nextCallback?: any) {
    if (!this.outingId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Outing ID is missing'
      });
      return;
    }

    // If no schedules are added, proceed
    if (this.schedulesList.length === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Info',
        detail: 'No schedules to save.'
      });
      setTimeout(() => {
        this.router.navigate(['/outing']);
      }, 1000);
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const schedulesPayload = {
      outingId: this.outingId,
      schedules: this.schedulesList.map((s) => ({
        id: s.id, // for updates check if API supports bulk update with ID
        dayOfWeek: s.dayOfWeek,
        schedualType: s.schedualType,
        validFrom: s.validFrom,
        validTo: s.validTo,
        times: s.times.map((t) => ({
          id: t.id,
          startTime: t.startTime,
          endTime: t.endTime
        }))
      }))
    };

    // Determine whether to add or update
    const apiCall = this.isEditMode
      ? this.outingService.updateOutingSchedules(schedulesPayload)
      : this.outingService.addOutingSchedules(schedulesPayload);

    apiCall
      .pipe(
        catchError((error) => {
          console.error('Error saving schedules:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.message || 'Failed to save schedules'
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        if (response?.success || response !== null) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Schedules saved successfully!'
          });
          // Final step: Navigate to list
          setTimeout(() => {
            this.router.navigate(['/outing']);
          }, 1500);
        }
      });
  }

  onNextTickets(nextCallback?: any) {
    if (!this.outingId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Outing ID is missing'
      });
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const ticketsPayload = {
      outingId: this.outingId,
      tickets: this.ticketsList.map((ticket) => ({
        id: ticket.id, // Include ID when updating
        ticketType: ticket.ticketType,
        description: ticket.description,
        price: ticket.price,
        availableQuantity: ticket.availableQuantity,
        isActive: ticket.isActive,
        hasSerialNumber: ticket.hasSerialNumber || false,
        excelData: ticket.excelData || []
      }))
    };

    // Use update endpoint in edit mode, otherwise add
    const apiCall = this.isEditMode
      ? this.outingService.updateOutingTickets(ticketsPayload)
      : this.outingService.addOutingTickets(ticketsPayload);

    apiCall
      .pipe(
        catchError((error) => {
          console.error('Error with tickets:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.message || 'Failed to save tickets'
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        if (response?.success || response !== null) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.isEditMode ? 'Tickets updated successfully!' : 'Tickets saved successfully!'
          });

          if (nextCallback) {
            setTimeout(() => nextCallback.emit(), 500);
          }
        }
      });
  }

  /**
   * Finish the form for Normal type outings (without schedules step)
   * Saves tickets and navigates to the outing list
   */
  onFinishNormal() {
    if (!this.outingId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Outing ID is missing'
      });
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const ticketsPayload = {
      outingId: this.outingId,
      tickets: this.ticketsList.map((ticket) => ({
        id: ticket.id,
        ticketType: ticket.ticketType,
        description: ticket.description,
        price: ticket.price,
        availableQuantity: ticket.availableQuantity,
        isActive: ticket.isActive,
        hasSerialNumber: ticket.hasSerialNumber || false,
        excelData: ticket.excelData || []
      }))
    };

    const apiCall = this.isEditMode
      ? this.outingService.updateOutingTickets(ticketsPayload)
      : this.outingService.addOutingTickets(ticketsPayload);

    apiCall
      .pipe(
        catchError((error) => {
          console.error('Error with tickets:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.message || 'Failed to save tickets'
          });
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        if (response?.success || response !== null) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.isEditMode ? 'Outing updated successfully!' : 'Outing created successfully!'
          });
          // Navigate to outing list after finishing
          setTimeout(() => {
            this.router.navigate(['/outing']);
          }, 1500);
        }
      });
  }

  // ============= Helper Methods =============
  onImagesUpload(files: File[] | null): void {
    this.selectedImages = files || [];
    this.showImageError = false;
  }

  // ============= Excel Upload Methods =============
  onExcelFileSelect(event: any) {
    const file = event.files[0];
    if (!file) return;

    // Clear the uploader immediately to allow re-selecting the same file if needed
    if (this.excelUploader) {
      this.excelUploader.clear();
    }

    this.uploadedExcelFile = file;
    this.uploadExcelFile(file);
  }

  uploadExcelFile(file: File) {
    this.isUploadingExcel = true;
    const formData = new FormData();
    formData.append('excelFile', file);

    this.outingService
      .addTicketExel(formData)
      .pipe(
        catchError((error) => {
          this.isUploadingExcel = false;

          console.error('Error uploading Excel:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.error?.message || 'Failed to upload Excel file'
          });
          return of(null);
        }),
        finalize(() => {
          this.isUploadingExcel = false;
        })
      )
      .subscribe((response: any) => {
        if (response?.success) {
          this.excelSerialNumbers = response.data;
          // Apply excel serial numbers automatically to available quantity
          this.applyExcelSerialsToForm();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Excel file uploaded successfully! ${this.excelSerialNumbers.length} serial numbers found.`
          });
        }
      });
  }

  clearExcelUpload() {
    this.uploadedExcelFile = null;
    this.excelSerialNumbers = [];
    // Re-enable available quantity after clearing excel
    this.ticketsForm.get('availableQuantity')?.enable({ emitEvent: false });
    this.ticketsForm.get('availableQuantity')?.setValue(1);
    this.isAvailableQuantityDisabled = false;
  }

  /**
   * When an excel file is uploaded, set the availableQuantity to the number of serial numbers
   * and disable the control to prevent user edits.
   */
  applyExcelSerialsToForm() {
    const count = this.excelSerialNumbers?.length || 0;
    const availableCtrl = this.ticketsForm.get('availableQuantity');
    if (count > 0) {
      availableCtrl?.setValue(count);
      availableCtrl?.disable({ emitEvent: false });
      this.isAvailableQuantityDisabled = true;
    } else {
      availableCtrl?.enable({ emitEvent: false });
      this.isAvailableQuantityDisabled = false;
    }
  }

  onBack(prevCallback?: any) {
    if (prevCallback) {
      prevCallback.emit();
    } else {
      this.router.navigate(['/outing']);
    }
  }

  // ============= Form Control Getters =============
  get nameCtrl() {
    return this.outingForm.get('Name');
  }
  get descCtrl() {
    return this.outingForm.get('Description');
  }
  get locationCtrl() {
    return this.outingForm.get('Location');
  }
  get startDateCtrl() {
    return this.outingForm.get('StartDate');
  }
  get endDateCtrl() {
    return this.outingForm.get('EndDate');
  }
  get categoryCtrl() {
    return this.outingForm.get('OutingCategoryId');
  }

  get featuresCtrl() {
    return this.outingForm.get('FeatureIds');
  }
  get ratingCtrl() {
    return this.outingForm.get('Rating');
  }
  get targetAudienceCtrl() {
    return this.outingForm.get('TargetAudience');
  }
  get isActiveCtrl() {
    return this.outingForm.get('IsActive');
  }
  get isBlockedCtrl() {
    return this.outingForm.get('IsBlocked');
  }

  get isScheduledOuting(): boolean {
    return this.outingForm.get('OutingType')?.value === this.OutingType.Scheduled;
  }

  // Helper method for error display
  shouldShowError(controlName: string): boolean {
    const control = this.outingForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  trackByFn(index: number, item: any) {
    return index;
  }
}

```

---

## `src/app/demo/pages/outing/outing-list/outing-list.component.html`

```html
<p-toast></p-toast>
<p-confirmDialog></p-confirmDialog>

<div class="card">
  <p-toolbar styleClass="mb-4">
    <ng-template pTemplate="left">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText type="text" (input)="searchByName()" [(ngModel)]="searchedWord" [placeholder]="'search' | translate" />
      </span>
    </ng-template>
  </p-toolbar>

  <p-table
    #dt
    [value]="outings"
    [lazy]="true"
    (onLazyLoad)="loadOutings($event)"
    [paginator]="true"
    [rows]="50"
    [totalRecords]="totalRecords"
    [loading]="loading"
    [rowsPerPageOptions]="[10, 25, 50]"
    [showCurrentPageReport]="true"
    [scrollable]="true"
    scrollHeight="1000px"
    [currentPageReportTemplate]="'showingEntries' | translate"
    [globalFilterFields]="['id', 'name', 'outingType', 'outingCategoryName', 'vendorName', 'miniPrice', 'startDate', 'rating']"
  >
    <ng-template pTemplate="header">
      <tr>
        <th pFrozenColumn style="width: 90px; min-width: 90px" pSortableColumn="id">
          {{ '#ID' | translate }}
          <p-sortIcon field="id"></p-sortIcon>
        </th>
        <th pFrozenColumn style="width: 200px; min-width: 200px" pSortableColumn="name">
          {{ 'Name' | translate }}
          <p-sortIcon field="name"></p-sortIcon>
        </th>
        <th style="width: 150px; min-width: 150px" pSortableColumn="outingType">
          {{ 'Type' | translate }}
          <p-sortIcon field="outingType"></p-sortIcon>
        </th>
        <th style="width: 190px; min-width: 190px" pSortableColumn="outingCategoryName">
          {{ 'Category' | translate }}
          <p-sortIcon field="outingCategoryName"></p-sortIcon>
        </th>
        <th *ngIf="!isVendor()" style="width: 150px; min-width: 150px" pSortableColumn="vendorName">
          {{ 'Vendor' | translate }}
          <p-sortIcon field="vendorName"></p-sortIcon>
        </th>
        <th style="width: 150px; min-width: 150px" pSortableColumn="maxPrice">
          {{ 'Price' | translate }}
          <p-sortIcon field="maxPrice"></p-sortIcon>
        </th>
        <th style="width: 150px; min-width: 150px" pSortableColumn="startDate">
          {{ 'Dates' | translate }}
          <p-sortIcon field="startDate"></p-sortIcon>
        </th>
        <th style="width: 150px; min-width: 150px" pSortableColumn="rating">
          {{ 'Rating' | translate }}
          <p-sortIcon field="rating"></p-sortIcon>
        </th>
        <th style="width: 110px; min-width: 110px" pSortableColumn="isActive">
          {{ 'status' | translate }}
          <p-sortIcon field="isActive"></p-sortIcon>
        </th>
        <th style="width: 130px; min-width: 130px" pSortableColumn="isBlocked">
          {{ 'is block' | translate }}
          <p-sortIcon field="isBlocked"></p-sortIcon>
        </th>
        <th style="width: 120px; min-width: 120px">{{ 'action' | translate }}</th>
      </tr>
      <tr>
        <th pFrozenColumn>
          <p-columnFilter type="numeric" field="id" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th pFrozenColumn>
          <p-columnFilter type="text" field="name" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="numeric" field="outingType" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="text" field="outingCategoryName" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th *ngIf="!isVendor()">
          <p-columnFilter type="text" field="vendorName" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="numeric" field="miniPrice" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="date" field="startDate" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="numeric" field="rating" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="boolean" field="isActive" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th>
          <p-columnFilter type="boolean" field="isBlocked" display="row" [showMenu]="false"></p-columnFilter>
        </th>
        <th></th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-outing>
      <tr>
        <td pFrozenColumn>{{ outing.id }}</td>
        <td pFrozenColumn>{{ outing.name }}</td>
        <td>
          <span [class.text-green-500]="outing.outingType === 1" [class.text-blue-500]="outing.outingType === 2">
            {{ OutingType[outing.outingType] || '-' }}
          </span>
        </td>
        <td>{{ outing.outingCategoryName || outing.outingCategory?.name || '-' }}</td>
        <td *ngIf="!isVendor()">
          <span class="cursor-pointer text-primary" (click)="goToCompany(outing.vendor.id)">
            {{ outing.vendor.name }}
          </span>
        </td>
        <td>{{ outing.miniPrice || 0 }} - {{ outing.maxPrice || 0 }}</td>
        <td>{{ outing.startDate | date: 'mediumDate' }} - {{ outing.endDate | date: 'mediumDate' }}</td>
        <td>{{ outing.rating ?? '-' }}</td>

        <td>
          <p-inputSwitch [(ngModel)]="outing.isActive" (onChange)="toggleOutingStatus(outing.id)" [disabled]="!isVendor()"></p-inputSwitch>
        </td>
        <td>
          <p-inputSwitch [(ngModel)]="outing.isBlocked" (onChange)="toggleBlockStatus(outing.id)" [disabled]="isVendor()"></p-inputSwitch>
        </td>

        <td>
          <div class="flex gap-1">
            <p-button
              icon="pi pi-eye"
              severity="info"
              [rounded]="true"
              [text]="true"
              (onClick)="view(outing.id)"
              pTooltip="{{ 'view' | translate }}"
              tooltipPosition="top"
            ></p-button>
            <p-button
              *ngIf="isVendor()"
              icon="pi pi-pencil"
              severity="success"
              [rounded]="true"
              [text]="true"
              (onClick)="update(outing.id)"
              pTooltip="{{ 'edit' | translate }}"
              tooltipPosition="top"
            ></p-button>
            <p-button
              icon="pi pi-trash"
              severity="danger"
              [rounded]="true"
              [text]="true"
              (click)="delete(outing.id)"
              pTooltip="{{ 'delete' | translate }}"
              tooltipPosition="top"
            ></p-button>
          </div>
        </td>
      </tr>
    </ng-template>

    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="11">
          <div class="flex flex-column justify-content-center align-items-center py-5 w-full">
            <i class="pi pi-inbox" style="font-size: 3rem; color: var(--gray-400)"></i>
            <span class="mt-2 text-gray-500 font-medium">{{ 'No Data found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

```

---

## `src/app/demo/pages/outing/outing-list/outing-list.component.scss`

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

// Hide increase/decrease spinner buttons on numeric filters
:host ::ng-deep .p-datatable .p-inputnumber-button-group {
  display: none !important;
}

:host ::ng-deep .p-datatable .p-inputnumber-buttons-stacked .p-inputnumber-input {
  border-radius: 6px !important;
}

```

---

## `src/app/demo/pages/outing/outing-list/outing-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingListComponent } from './outing-list.component';

describe('OutingListComponent', () => {
  let component: OutingListComponent;
  let fixture: ComponentFixture<OutingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/outing/outing-list/outing-list.component.ts`

```ts
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { OutingService } from 'src/app/shared/services/outing.service';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder'; // استدعاء المحرك
import { Table, TableLazyLoadEvent } from 'primeng/table'; // استيراد أنواع الجدول

@Component({
  selector: 'app-outing-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './outing-list.component.html',
  styleUrl: './outing-list.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class OutingListComponent implements OnInit {
  // 1. الوصول للجدول عشان نعمل Reset
  @ViewChild('dt') dt!: Table;

  @Input() CompanyId: any;
  @Input() vendorId: any;

  // متغيرات العرض فقط
  outings: any[] = [];
  totalRecords: number = 0;
  loading: boolean = false; // مهم جداً للـ UX
  searchedWord: string = '';

  OutingType = {
    1: 'Normal',
    2: 'Scheduled'
  };

  constructor(
    private router: Router,
    private translate: TranslateService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private ConfigureService: ConfigureService, // يفضل تسميته camelCase: configureService
    private outingService: OutingService
  ) {}

  ngOnInit() {
    // لم نعد بحاجة لاستدعاء getAllOutings هنا
    // الجدول سيقوم بذلك تلقائياً عند التحميل (LazyLoad Trigger)
  }

  // ----------------------------------------------------------------
  // الدالة المركزية الجديدة (The Core Function)
  // ----------------------------------------------------------------
  loadOutings(event: TableLazyLoadEvent) {
    this.loading = true;

    // 1. استخدام المحرك لبناء الـ Payload الأساسي
    const payload: any = TableRequestBuilder.build(event, this.searchedWord);

    // 2. إضافة الفلاتر الإجبارية الخاصة بهذه الصفحة (زي VendorId)
    if (this.CompanyId || this.vendorId) {
      payload.vendorId = this.vendorId || this.CompanyId;
    }

    // 3. استدعاء السيرفيس
    this.outingService.getAllOutings(payload).subscribe({
      next: (response: any) => {
        if (response?.success) {
          this.outings = response.data.data;
          this.totalRecords = response.data.itemsCount;
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching outings', err);
        this.loading = false;
      }
    });
  }

  // ----------------------------------------------------------------
  // دوال البحث والاكشنز
  // ----------------------------------------------------------------

  searchByName() {
    // عند البحث، فقط نعيد الجدول للصفحة الأولى
    // هذا سيقوم أوتوماتيكياً بتفعيل loadOutings
    this.dt.reset();
  }

  // ... باقي دوال الـ Actions (Delete, View, Toggle) كما هي بدون تغيير ...

  isVendor(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }

  toggleOutingStatus(id: number) {
    this.outingService.updateOutingStatus(id).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Update', detail: 'Outing status changed' });
      },
      error: (err: any) => {
        this.dt.reset();
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error toggling outing status' });
        console.error('Error toggling outing status', err);
      }
    });
  }
  toggleBlockStatus(id: number) {
    this.outingService.toggleBlock(id).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Update', detail: 'Block status changed' });
      },
      error: (err: any) => {
        this.dt.reset();
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error toggling block status' });
        console.error('Error toggling block status', err);
      }
    });
  }
  view(id: any) {
    this.router.navigate(['/outing-details', id]);
  }
  update(id: any) {
    this.router.navigate(['/outing-form'], { queryParams: { id: id, mode: 'edit' } });
  }

  delete(id: any) {
    this.confirmationService.confirm({
      // ... نفس الكود القديم ...
      accept: () => {
        this.outingService.deleteOuting(id).subscribe((res: any) => {
          if (res?.success) {
            this.messageService.add({ severity: 'success', summary: 'Deleted' });
            // تحديث الجدول بذكاء (بدون إعادة تحميل الصفحة)
            // نستخدم loadLazyEvent القديم أو نعيد الـ reset
            this.dt.reset();
          }
        });
      }
    });
  }

  goToCompany(companyId: number) {
    this.router.navigate(['/vendor-details', companyId]);
  }
}

```

---

## `src/app/demo/pages/outing/outing.component.html`

```html
<p-confirmDialog />
<p-toast></p-toast>
<div class="main">
  <sub-header
    [mainHeader]="'outing mangement'"
    [actionButtons]="isVendor()?[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]:[]"
    (actionClicked)="handleAction($event)"
  ></sub-header>
  <app-outing-list></app-outing-list>
</div>

```

---

## `src/app/demo/pages/outing/outing.component.scss`

```scss

```

---

## `src/app/demo/pages/outing/outing.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutingComponent } from './outing.component';

describe('OutingComponent', () => {
  let component: OutingComponent;
  let fixture: ComponentFixture<OutingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/outing/outing.component.ts`

```ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { SubHeaderComponent } from "src/app/shared/components/sub-header/sub-header.component";
import { OutingListComponent } from "./outing-list/outing-list.component";
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-outing',
  standalone: true,
  imports: [SubHeaderComponent, OutingListComponent , SharedModule],
  providers: [ConfirmationService],
  templateUrl: './outing.component.html',
  styleUrl: './outing.component.scss'
})
export class OutingComponent {
  constructor(
    private router: Router,
    private ConfigureService: ConfigureService
  ) {}

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToTravelForm();
        break;
    }
  }
  isVendor(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }
  goToTravelForm() {
    console.log('work form ....');
    this.router.navigate(['/outing-form']);
  }
}

```

---

## `src/app/demo/pages/reports/hajj-reports/hajj-reports.component.html`

```html
<div class="reports-container">
  <sub-header [mainHeader]="'Hajj/Ummrah Reports'"></sub-header>

  <!-- Filter Card -->
  <div class="filter-card card mb-4">
    <div class="card-body">
      <div class="filter-header mb-3">
        <h5 class="m-0">
          <i class="fas fa-filter me-2 text-primary"></i>
          {{ 'Filter Options' | translate }}
        </h5>
      </div>

      <form [formGroup]="filterForm" class="filter-form">
        <div class="grid">
          <div class="col-12 col-md-6 col-lg-3">
            <div class="field">
              <label for="fromDate" class="font-medium">
                {{ 'From Date' | translate }}
                <span class="text-danger">*</span>
              </label>
              <p-calendar
                id="fromDate"
                formControlName="fromDate"
                [showIcon]="true"
                [showButtonBar]="true"
                dateFormat="dd/mm/yy"
                [style]="{ width: '100%' }"
                [inputStyle]="{ width: '100%' }"
              ></p-calendar>
            </div>
          </div>

          <div class="col-12 col-md-6 col-lg-3">
            <div class="field">
              <label for="toDate" class="font-medium">{{ 'To Date' | translate }}</label>
              <p-calendar
                id="toDate"
                formControlName="toDate"
                [showIcon]="true"
                [showButtonBar]="true"
                dateFormat="dd/mm/yy"
                [style]="{ width: '100%' }"
                [inputStyle]="{ width: '100%' }"
              ></p-calendar>
            </div>
          </div>

          <div class="col-12 col-md-6 col-lg-3" *ngIf="!isVendor">
            <div class="field">
              <label for="companyId" class="font-medium">{{ 'Vendor' | translate }}</label>
              <p-dropdown
                id="companyId"
                formControlName="companyId"
                [options]="vendors"
                optionLabel="name"
                optionValue="id"
                [showClear]="true"
                [filter]="true"
                filterBy="name"
                [style]="{ width: '100%' }"
                placeholder="{{ 'Select Vendor' | translate }}"
              ></p-dropdown>
            </div>
          </div>

          <div class="col-12 col-md-6 col-lg-3">
            <div class="field">
              <label for="status" class="font-medium">{{ 'Status' | translate }}</label>
              <p-dropdown
                id="status"
                formControlName="status"
                [options]="statusOptions"
                optionLabel="label"
                optionValue="value"
                [showClear]="true"
                [style]="{ width: '100%' }"
                placeholder="{{ 'All Statuses' | translate }}"
              ></p-dropdown>
            </div>
          </div>
        </div>

        <div class="flex justify-content-end gap-2 mt-3">
          <button type="button" pButton class="p-button-outlined p-button-secondary" (click)="onReset()">
            <i class="fas fa-redo me-2"></i>
            {{ 'Reset' | translate }}
          </button>
          <button type="button" pButton class="p-button-primary" [loading]="isLoading" (click)="onSearch()">
            <i class="fas fa-search me-2"></i>
            {{ 'Search' | translate }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Summary Cards -->
  <div class="summary-cards grid mb-4" *ngIf="reportData.length > 0">
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card booking-card">
        <div class="card-content">
          <div class="icon-wrapper bg-primary-light">
            <i class="fas fa-ticket-alt text-primary"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Total Bookings' | translate }}</span>
            <span class="value">{{ summaryCards.totalBookings | number }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card revenue-card">
        <div class="card-content">
          <div class="icon-wrapper bg-success-light">
            <i class="fas fa-dollar-sign text-success"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Total Revenue' | translate }}</span>
            <span class="value">{{ summaryCards.totalRevenue | number: '1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card vendor-card">
        <div class="card-content">
          <div class="icon-wrapper bg-warning-light">
            <i class="fas fa-store text-warning"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Vendor Total' | translate }}</span>
            <span class="value">{{ summaryCards.vendorTotal | number: '1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card trips-card">
        <div class="card-content">
          <div class="icon-wrapper bg-info-light">
            <i class="fas fa-kaaba text-info"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Pilgrims Total' | translate }}</span>
            <span class="value">{{ summaryCards.tripsTotal | number: '1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Data Table -->
  <div class="data-table-card card">
    <div class="card-header flex justify-content-between align-items-center">
      <h5 class="m-0">
        <i class="fas fa-table me-2 text-primary"></i>
        {{ 'Hajj/Ummrah Summary' | translate }}
      </h5>
      <button
        type="button"
        pButton
        class="p-button-success p-button-sm"
        [loading]="isExporting"
        (click)="exportToExcel()"
        *ngIf="reportData.length > 0"
      >
        <i class="fas fa-file-excel me-2"></i>
        {{ 'Export' | translate }}
      </button>
    </div>

    <div class="card-body p-0">
      <div class="loading-overlay" *ngIf="isLoading">
        <p-progressSpinner strokeWidth="4"></p-progressSpinner>
      </div>

      <div class="empty-state" *ngIf="!isLoading && reportData.length === 0">
        <div class="empty-content">
          <i class="fas fa-kaaba fa-4x text-muted mb-3"></i>
          <h5>{{ 'No Data Found' | translate }}</h5>
          <p class="text-muted">{{ 'Use the filters above to search for Hajj/Ummrah reports' | translate }}</p>
        </div>
      </div>

      <p-table
        [value]="reportData"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[10, 25, 50]"
        [showCurrentPageReport]="true"
        styleClass="p-datatable-striped p-datatable-gridlines"
        *ngIf="!isLoading && reportData.length > 0"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="hajjName">
              {{ 'Package Name' | translate }}
              <p-sortIcon field="hajjName"></p-sortIcon>
            </th>
            <th pSortableColumn="vendorName">
              {{ 'Vendor' | translate }}
              <p-sortIcon field="vendorName"></p-sortIcon>
            </th>
            <th class="text-center">{{ 'Total Bookings' | translate }}</th>
            <th class="text-center">{{ 'Booking Status' | translate }}</th>
            <th class="text-end">{{ 'Revenue' | translate }}</th>
            <th class="text-end">{{ 'Vendor Total' | translate }}</th>
            <th class="text-end">{{ 'Pilgrims Total' | translate }}</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-item>
          <tr>
            <td>
              <div class="hajj-info">
                <span class="hajj-name font-semibold">{{ item.hajjName }}</span>
                <small class="text-muted">#{{ item.hajjId }}</small>
              </div>
            </td>
            <td>{{ item.vendorName }}</td>
            <td class="text-center">
              <span class="badge badge-primary">{{ item.totalBookings }}</span>
            </td>
            <td>
              <div class="status-badges">
                <p-tag
                  *ngIf="item.pendingCount > 0"
                  severity="warning"
                  [value]="'Pending: ' + item.pendingCount"
                  [rounded]="true"
                  class="me-1 mb-1"
                ></p-tag>
                <p-tag
                  *ngIf="item.confirmedCount > 0"
                  severity="info"
                  [value]="'Confirmed: ' + item.confirmedCount"
                  [rounded]="true"
                  class="me-1 mb-1"
                ></p-tag>
                <p-tag
                  *ngIf="item.completedCount > 0"
                  severity="success"
                  [value]="'Completed: ' + item.completedCount"
                  [rounded]="true"
                  class="me-1 mb-1"
                ></p-tag>
                <p-tag
                  *ngIf="item.cancelledCount > 0"
                  severity="danger"
                  [value]="'Cancelled: ' + item.cancelledCount"
                  [rounded]="true"
                  class="me-1 mb-1"
                ></p-tag>
                <p-tag
                  *ngIf="item.refundedCount > 0"
                  severity="secondary"
                  [value]="'Refunded: ' + item.refundedCount"
                  [rounded]="true"
                  class="mb-1"
                ></p-tag>
              </div>
            </td>
            <td class="text-end font-semibold text-success">{{ item.pricePayedTotal | number: '1.2-2' }}</td>
            <td class="text-end">{{ item.vendorTotal | number: '1.2-2' }}</td>
            <td class="text-end">{{ item.tripsTotal | number: '1.2-2' }}</td>
          </tr>
        </ng-template>

        <ng-template pTemplate="footer">
          <tr class="summary-row">
            <td colspan="2" class="font-bold text-end">{{ 'Totals:' | translate }}</td>
            <td class="text-center font-bold">{{ summaryCards.totalBookings | number }}</td>
            <td></td>
            <td class="text-end font-bold text-success">{{ summaryCards.totalRevenue | number: '1.2-2' }}</td>
            <td class="text-end font-bold">{{ summaryCards.vendorTotal | number: '1.2-2' }}</td>
            <td class="text-end font-bold">{{ summaryCards.tripsTotal | number: '1.2-2' }}</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  </div>
</div>

```

---

## `src/app/demo/pages/reports/hajj-reports/hajj-reports.component.scss`

```scss
@import '../outing-reports/outing-reports.component.scss';

```

---

## `src/app/demo/pages/reports/hajj-reports/hajj-reports.component.ts`

```ts
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { ReportsService } from 'src/app/shared/services/reports.service';
import { HajjSummaryItem, HajjSummaryRequest } from 'src/app/shared/model/reports.model';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { VendorService } from 'src/app/shared/services/vendor.service';

@Component({
  selector: 'app-hajj-reports',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './hajj-reports.component.html',
  styleUrls: ['./hajj-reports.component.scss']
})
export class HajjReportsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reportsService = inject(ReportsService);
  private configureService = inject(ConfigureService);
  private vendorService = inject(VendorService);

  filterForm!: FormGroup;
  reportData: HajjSummaryItem[] = [];
  isLoading = false;
  isExporting = false;
  vendors: any[] = [];

  statusOptions = [
    { label: 'All', value: null },
    { label: 'Pending', value: 0 },
    { label: 'Confirmed', value: 1 },
    { label: 'Completed', value: 2 },
    { label: 'Cancelled', value: 3 },
    { label: 'Refunded', value: 4 }
  ];

  summaryCards = {
    totalBookings: 0,
    totalRevenue: 0,
    vendorTotal: 0,
    tripsTotal: 0
  };

  isVendor = false;

  ngOnInit(): void {
    this.initForm();
    this.checkUserRole();
    this.loadVendors();
  }

  private initForm(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.filterForm = this.fb.group({
      fromDate: [firstDayOfMonth, Validators.required],
      toDate: [today],
      companyId: [null],
      hajjId: [null],
      status: [null]
    });
  }

  private checkUserRole(): void {
    const roles = this.configureService.userRoles();
    this.isVendor = roles.some((role: string) => role.startsWith('Vendor.'));

    if (this.isVendor) {
      const user = this.configureService.parsedUser;
      if (user?.companyId) {
        this.filterForm.patchValue({ companyId: user.companyId });
      }
    }
  }

  private loadVendors(): void {
    if (!this.isVendor) {
      this.vendorService.getAllVendors({ isPagingEnabled: false }).subscribe({
        next: (response: any) => {
          this.vendors = response?.data?.data || response?.data || [];
        },
        error: (err) => console.error('Error loading vendors:', err)
      });
    }
  }

  onSearch(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.filterForm.value;

    const criteria: HajjSummaryRequest = {
      fromDate: this.formatDate(formValue.fromDate),
      toDate: formValue.toDate ? this.formatDate(formValue.toDate) : undefined,
      companyId: formValue.companyId || undefined,
      hajjId: formValue.hajjId || undefined,
      status: formValue.status !== null ? formValue.status : undefined
    };

    this.reportsService.getHajjSummary(criteria).subscribe({
      next: (response: any) => {
        this.reportData = response?.data || [];
        this.calculateSummary();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching report:', err);
        this.reportData = [];
        this.isLoading = false;
      }
    });
  }

  onReset(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.filterForm.reset({
      fromDate: firstDayOfMonth,
      toDate: today,
      companyId: null,
      hajjId: null,
      status: null
    });

    this.reportData = [];
    this.resetSummary();
  }

  private calculateSummary(): void {
    this.summaryCards = this.reportData.reduce(
      (acc, item) => ({
        totalBookings: acc.totalBookings + item.totalBookings,
        totalRevenue: acc.totalRevenue + item.pricePayedTotal,
        vendorTotal: acc.vendorTotal + item.vendorTotal,
        tripsTotal: acc.tripsTotal + item.tripsTotal
      }),
      { totalBookings: 0, totalRevenue: 0, vendorTotal: 0, tripsTotal: 0 }
    );
  }

  private resetSummary(): void {
    this.summaryCards = {
      totalBookings: 0,
      totalRevenue: 0,
      vendorTotal: 0,
      tripsTotal: 0
    };
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString();
  }

  exportToExcel(): void {
    this.isExporting = true;
    setTimeout(() => {
      this.isExporting = false;
    }, 1000);
  }
}

```

---

## `src/app/demo/pages/reports/hotel-reports/hotel-reports.component.html`

```html
<div class="reports-container">
  <sub-header [mainHeader]="'Hotel Reports'"></sub-header>

  <!-- Filter Card -->
  <div class="filter-card card mb-4">
    <div class="card-body">
      <div class="filter-header mb-3">
        <h5 class="m-0">
          <i class="fas fa-filter me-2 text-primary"></i>
          {{ 'Filter Options' | translate }}
        </h5>
      </div>

      <form [formGroup]="filterForm" class="filter-form">
        <div class="grid">
          <div class="col-12 col-md-6 col-lg-3">
            <div class="field">
              <label for="fromDate" class="font-medium">
                {{ 'From Date' | translate }}
                <span class="text-danger">*</span>
              </label>
              <p-calendar
                id="fromDate"
                formControlName="fromDate"
                [showIcon]="true"
                [showButtonBar]="true"
                dateFormat="dd/mm/yy"
                [style]="{ width: '100%' }"
                [inputStyle]="{ width: '100%' }"
              ></p-calendar>
            </div>
          </div>

          <div class="col-12 col-md-6 col-lg-3">
            <div class="field">
              <label for="toDate" class="font-medium">{{ 'To Date' | translate }}</label>
              <p-calendar
                id="toDate"
                formControlName="toDate"
                [showIcon]="true"
                [showButtonBar]="true"
                dateFormat="dd/mm/yy"
                [style]="{ width: '100%' }"
                [inputStyle]="{ width: '100%' }"
              ></p-calendar>
            </div>
          </div>

          <div class="col-12 col-md-6 col-lg-3" *ngIf="!isVendor">
            <div class="field">
              <label for="companyId" class="font-medium">{{ 'Vendor' | translate }}</label>
              <p-dropdown
                id="companyId"
                formControlName="companyId"
                [options]="vendors"
                optionLabel="name"
                optionValue="id"
                [showClear]="true"
                [filter]="true"
                filterBy="name"
                [style]="{ width: '100%' }"
                placeholder="{{ 'Select Vendor' | translate }}"
              ></p-dropdown>
            </div>
          </div>

          <div class="col-12 col-md-6 col-lg-3">
            <div class="field">
              <label for="status" class="font-medium">{{ 'Status' | translate }}</label>
              <p-dropdown
                id="status"
                formControlName="status"
                [options]="statusOptions"
                optionLabel="label"
                optionValue="value"
                [showClear]="true"
                [style]="{ width: '100%' }"
                placeholder="{{ 'All Statuses' | translate }}"
              ></p-dropdown>
            </div>
          </div>
        </div>

        <div class="flex justify-content-end gap-2 mt-3">
          <button type="button" pButton class="p-button-outlined p-button-secondary" (click)="onReset()">
            <i class="fas fa-redo me-2"></i>
            {{ 'Reset' | translate }}
          </button>
          <button type="button" pButton class="p-button-primary" [loading]="isLoading" (click)="onSearch()">
            <i class="fas fa-search me-2"></i>
            {{ 'Search' | translate }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Summary Cards -->
  <div class="summary-cards grid mb-4" *ngIf="reportData.length > 0">
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card booking-card">
        <div class="card-content">
          <div class="icon-wrapper bg-primary-light">
            <i class="fas fa-ticket-alt text-primary"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Total Bookings' | translate }}</span>
            <span class="value">{{ summaryCards.totalBookings | number }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card revenue-card">
        <div class="card-content">
          <div class="icon-wrapper bg-success-light">
            <i class="fas fa-dollar-sign text-success"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Total Revenue' | translate }}</span>
            <span class="value">{{ summaryCards.totalRevenue | number: '1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card vendor-card">
        <div class="card-content">
          <div class="icon-wrapper bg-warning-light">
            <i class="fas fa-store text-warning"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Vendor Total' | translate }}</span>
            <span class="value">{{ summaryCards.vendorTotal | number: '1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card trips-card">
        <div class="card-content">
          <div class="icon-wrapper bg-info-light">
            <i class="fas fa-bed text-info"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Nights Total' | translate }}</span>
            <span class="value">{{ summaryCards.tripsTotal | number: '1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Data Table -->
  <div class="data-table-card card">
    <div class="card-header flex justify-content-between align-items-center">
      <h5 class="m-0">
        <i class="fas fa-table me-2 text-primary"></i>
        {{ 'Hotel Summary' | translate }}
      </h5>
      <button
        type="button"
        pButton
        class="p-button-success p-button-sm"
        [loading]="isExporting"
        (click)="exportToExcel()"
        *ngIf="reportData.length > 0"
      >
        <i class="fas fa-file-excel me-2"></i>
        {{ 'Export' | translate }}
      </button>
    </div>

    <div class="card-body p-0">
      <div class="loading-overlay" *ngIf="isLoading">
        <p-progressSpinner strokeWidth="4"></p-progressSpinner>
      </div>

      <div class="empty-state" *ngIf="!isLoading && reportData.length === 0">
        <div class="empty-content">
          <i class="fas fa-hotel fa-4x text-muted mb-3"></i>
          <h5>{{ 'No Data Found' | translate }}</h5>
          <p class="text-muted">{{ 'Use the filters above to search for hotel reports' | translate }}</p>
        </div>
      </div>

      <p-table
        [value]="reportData"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[10, 25, 50]"
        [showCurrentPageReport]="true"
        styleClass="p-datatable-striped p-datatable-gridlines"
        *ngIf="!isLoading && reportData.length > 0"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="roomName">
              {{ 'Room Name' | translate }}
              <p-sortIcon field="roomName"></p-sortIcon>
            </th>
            <th pSortableColumn="hotelName">
              {{ 'Hotel Name' | translate }}
              <p-sortIcon field="hotelName"></p-sortIcon>
            </th>
            <th pSortableColumn="vendorName">
              {{ 'Vendor' | translate }}
              <p-sortIcon field="vendorName"></p-sortIcon>
            </th>
            <th class="text-center">{{ 'Total Bookings' | translate }}</th>
            <th class="text-center">{{ 'Booking Status' | translate }}</th>
            <th class="text-end">{{ 'Revenue' | translate }}</th>
            <th class="text-end">{{ 'Vendor Total' | translate }}</th>
            <th class="text-end">{{ 'Trips Total' | translate }}</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-item>
          <tr>
            <td>
              <div class="room-info">
                <span class="room-name font-semibold">{{ item.roomName }}</span>
                <small class="text-muted">#{{ item.roomId }}</small>
              </div>
            </td>
            <td>{{ item.hotelName }}</td>
            <td>{{ item.vendorName }}</td>
            <td class="text-center">
              <span class="badge badge-primary">{{ item.totalBookings }}</span>
            </td>
            <td>
              <div class="status-badges">
                <p-tag
                  *ngIf="item.pendingCount > 0"
                  severity="warning"
                  [value]="'Pending: ' + item.pendingCount"
                  [rounded]="true"
                  class="me-1 mb-1"
                ></p-tag>
                <p-tag
                  *ngIf="item.confirmedCount > 0"
                  severity="info"
                  [value]="'Confirmed: ' + item.confirmedCount"
                  [rounded]="true"
                  class="me-1 mb-1"
                ></p-tag>
                <p-tag
                  *ngIf="item.completedCount > 0"
                  severity="success"
                  [value]="'Completed: ' + item.completedCount"
                  [rounded]="true"
                  class="me-1 mb-1"
                ></p-tag>
                <p-tag
                  *ngIf="item.cancelledCount > 0"
                  severity="danger"
                  [value]="'Cancelled: ' + item.cancelledCount"
                  [rounded]="true"
                  class="me-1 mb-1"
                ></p-tag>
                <p-tag
                  *ngIf="item.refundedCount > 0"
                  severity="secondary"
                  [value]="'Refunded: ' + item.refundedCount"
                  [rounded]="true"
                  class="mb-1"
                ></p-tag>
              </div>
            </td>
            <td class="text-end font-semibold text-success">{{ item.clientPaid_Completed | number: '1.2-2' }}</td>
            <td class="text-end">{{ item.vendorProfit_Completed | number: '1.2-2' }}</td>
            <td class="text-end">{{ item.tripsProfit_Completed | number: '1.2-2' }}</td>
          </tr>
        </ng-template>

        <ng-template pTemplate="footer">
          <tr class="summary-row">
            <td colspan="3" class="font-bold text-end">{{ 'Totals:' | translate }}</td>
            <td class="text-center font-bold">{{ summaryCards.totalBookings | number }}</td>
            <td></td>
            <td class="text-end font-bold text-success">{{ summaryCards.totalRevenue | number: '1.2-2' }}</td>
            <td class="text-end font-bold">{{ summaryCards.vendorTotal | number: '1.2-2' }}</td>
            <td class="text-end font-bold">{{ summaryCards.tripsTotal | number: '1.2-2' }}</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  </div>
</div>

```

---

## `src/app/demo/pages/reports/hotel-reports/hotel-reports.component.scss`

```scss
@import '../outing-reports/outing-reports.component.scss';

```

---

## `src/app/demo/pages/reports/hotel-reports/hotel-reports.component.ts`

```ts
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { ReportsService } from 'src/app/shared/services/reports.service';
import { HotelSummaryItem, HotelSummaryRequest } from 'src/app/shared/model/reports.model';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { VendorService } from 'src/app/shared/services/vendor.service';

@Component({
  selector: 'app-hotel-reports',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './hotel-reports.component.html',
  styleUrls: ['./hotel-reports.component.scss']
})
export class HotelReportsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reportsService = inject(ReportsService);
  private configureService = inject(ConfigureService);
  private vendorService = inject(VendorService);

  filterForm!: FormGroup;
  reportData: HotelSummaryItem[] = [];
  isLoading = false;
  isExporting = false;
  vendors: any[] = [];

  statusOptions = [
    { label: 'All', value: null },
    { label: 'Pending', value: 0 },
    { label: 'Confirmed', value: 1 },
    { label: 'Completed', value: 2 },
    { label: 'Cancelled', value: 3 },
    { label: 'Refunded', value: 4 }
  ];

  summaryCards = {
    totalBookings: 0,
    totalRevenue: 0,
    vendorTotal: 0,
    tripsTotal: 0
  };

  isVendor = false;

  ngOnInit(): void {
    this.initForm();
    this.checkUserRole();
    this.loadVendors();
  }

  private initForm(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.filterForm = this.fb.group({
      fromDate: [firstDayOfMonth, Validators.required],
      toDate: [today],
      companyId: [null],
      hotelId: [null],
      status: [null]
    });
  }

  private checkUserRole(): void {
    const roles = this.configureService.userRoles();
    this.isVendor = roles.some((role: string) => role.startsWith('Vendor.'));

    if (this.isVendor) {
      const user = this.configureService.parsedUser;
      if (user?.companyId) {
        this.filterForm.patchValue({ companyId: user.companyId });
      }
    }
  }

  private loadVendors(): void {
    if (!this.isVendor) {
      this.vendorService.getAllVendors({ isPagingEnabled: false }).subscribe({
        next: (response: any) => {
          this.vendors = response?.data?.data || response?.data || [];
        },
        error: (err) => console.error('Error loading vendors:', err)
      });
    }
  }

  onSearch(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.filterForm.value;

    const criteria: HotelSummaryRequest = {
      fromDate: this.formatDate(formValue.fromDate),
      toDate: formValue.toDate ? this.formatDate(formValue.toDate) : undefined,
      companyId: formValue.companyId || undefined,
      hotelId: formValue.hotelId || undefined,
      status: formValue.status !== null ? formValue.status : undefined
    };

    this.reportsService.getHotelSummary(criteria).subscribe({
      next: (response: any) => {
        this.reportData = response?.data || [];
        this.calculateSummary();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching report:', err);
        this.reportData = [];
        this.isLoading = false;
      }
    });
  }

  onReset(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.filterForm.reset({
      fromDate: firstDayOfMonth,
      toDate: today,
      companyId: null,
      hotelId: null,
      status: null
    });

    this.reportData = [];
    this.resetSummary();
  }

  private calculateSummary(): void {
    this.summaryCards = this.reportData.reduce(
      (acc, item) => ({
        totalBookings: acc.totalBookings + item.totalBookings,
        totalRevenue: acc.totalRevenue + item.clientPaid_Completed,
        vendorTotal: acc.vendorTotal + item.vendorProfit_Completed,
        tripsTotal: acc.tripsTotal + item.tripsProfit_Completed
      }),
      { totalBookings: 0, totalRevenue: 0, vendorTotal: 0, tripsTotal: 0 }
    );
  }

  private resetSummary(): void {
    this.summaryCards = {
      totalBookings: 0,
      totalRevenue: 0,
      vendorTotal: 0,
      tripsTotal: 0
    };
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString();
  }

  exportToExcel(): void {
    this.isExporting = true;
    setTimeout(() => {
      this.isExporting = false;
    }, 1000);
  }
}

```

---

## `src/app/demo/pages/reports/outing-reports/outing-reports.component.html`

```html
<div class="reports-container">
  <!-- Header -->
  <sub-header [mainHeader]="'Outing Reports'"></sub-header>

  <!-- Filter Card -->
  <div class="filter-card card mb-4">
    <div class="card-body">
      <div class="filter-header mb-3">
        <h5 class="m-0">
          <i class="fas fa-filter me-2 text-primary"></i>
          {{ 'Filter Options' | translate }}
        </h5>
      </div>

      <form [formGroup]="filterForm" class="filter-form">
        <div class="grid">
          <!-- From Date -->
          <div class="col-12 col-md-6 col-lg-3">
            <div class="field">
              <label for="fromDate" class="font-medium">
                {{ 'From Date' | translate }}
                <span class="text-danger">*</span>
              </label>
              <p-calendar
                id="fromDate"
                formControlName="fromDate"
                [showIcon]="true"
                [showButtonBar]="true"
                dateFormat="dd/mm/yy"
                [style]="{ width: '100%' }"
                [inputStyle]="{ width: '100%' }"
                placeholder="{{ 'Select date' | translate }}"
              ></p-calendar>
              <small class="text-danger" *ngIf="filterForm.get('fromDate')?.touched && filterForm.get('fromDate')?.invalid">
                {{ 'From Date is required' | translate }}
              </small>
            </div>
          </div>

          <!-- To Date -->
          <div class="col-12 col-md-6 col-lg-3">
            <div class="field">
              <label for="toDate" class="font-medium">{{ 'To Date' | translate }}</label>
              <p-calendar
                id="toDate"
                formControlName="toDate"
                [showIcon]="true"
                [showButtonBar]="true"
                dateFormat="dd/mm/yy"
                [style]="{ width: '100%' }"
                [inputStyle]="{ width: '100%' }"
                placeholder="{{ 'Select date' | translate }}"
              ></p-calendar>
            </div>
          </div>

          <!-- Vendor Dropdown (Admin only) -->
          <div class="col-12 col-md-6 col-lg-3" *ngIf="!isVendor">
            <div class="field">
              <label for="companyId" class="font-medium">{{ 'Vendor' | translate }}</label>
              <p-dropdown
                id="companyId"
                formControlName="companyId"
                [options]="vendors"
                optionLabel="name"
                optionValue="id"
                [showClear]="true"
                [filter]="true"
                filterBy="name"
                [style]="{ width: '100%' }"
                placeholder="{{ 'Select Vendor' | translate }}"
              ></p-dropdown>
            </div>
          </div>

          <!-- Status Dropdown -->
          <div class="col-12 col-md-6 col-lg-3">
            <div class="field">
              <label for="status" class="font-medium">{{ 'Status' | translate }}</label>
              <p-dropdown
                id="status"
                formControlName="status"
                [options]="statusOptions"
                optionLabel="label"
                optionValue="value"
                [showClear]="true"
                [style]="{ width: '100%' }"
                placeholder="{{ 'All Statuses' | translate }}"
              ></p-dropdown>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-content-end gap-2 mt-3">
          <button type="button" pButton class="p-button-outlined p-button-secondary" (click)="onReset()">
            <i class="fas fa-redo me-2"></i>
            {{ 'Reset' | translate }}
          </button>
          <button type="button" pButton class="p-button-primary" [loading]="isLoading" (click)="onSearch()">
            <i class="fas fa-search me-2"></i>
            {{ 'Search' | translate }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Summary Cards -->
  <div class="summary-cards grid mb-4" *ngIf="reportData.length > 0">
    <!-- Total Bookings -->
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card booking-card">
        <div class="card-content">
          <div class="icon-wrapper bg-primary-light">
            <i class="fas fa-ticket-alt text-primary"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Total Bookings' | translate }}</span>
            <span class="value">{{ summaryCards.totalBookings | number }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Total Revenue -->
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card revenue-card">
        <div class="card-content">
          <div class="icon-wrapper bg-success-light">
            <i class="fas fa-dollar-sign text-success"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Total Revenue' | translate }}</span>
            <span class="value">{{ summaryCards.totalRevenue | number: '1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Used Tickets -->
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card vendor-card">
        <div class="card-content">
          <div class="icon-wrapper bg-success-light">
            <i class="fas fa-check-circle text-success"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Used Tickets' | translate }}</span>
            <span class="value">{{ summaryCards.usedTicketsCount | number }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Unused Tickets -->
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card trips-card">
        <div class="card-content">
          <div class="icon-wrapper bg-warning-light">
            <i class="fas fa-times-circle text-warning"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Unused Tickets' | translate }}</span>
            <span class="value">{{ summaryCards.unUsedTicketsCount | number }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Client Paid (Completed) -->
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card revenue-card">
        <div class="card-content">
          <div class="icon-wrapper bg-info-light">
            <i class="fas fa-hand-holding-usd text-info"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Client Paid (Completed)' | translate }}</span>
            <span class="value">{{ summaryCards.clientPaidTotal_Completed | number: '1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Trips Total (Completed) -->
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card trips-card">
        <div class="card-content">
          <div class="icon-wrapper bg-primary-light">
            <i class="fas fa-route text-primary"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Trips Total (Completed)' | translate }}</span>
            <span class="value">{{ summaryCards.tripsTotal_Completed | number: '1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Vendor Total (Completed) -->
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card vendor-card">
        <div class="card-content">
          <div class="icon-wrapper bg-warning-light">
            <i class="fas fa-store text-warning"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Vendor Total (Completed)' | translate }}</span>
            <span class="value">{{ summaryCards.vendorTotal_Completed | number: '1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Trips Total (All) -->
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card trips-card">
        <div class="card-content">
          <div class="icon-wrapper bg-secondary-light">
            <i class="fas fa-route text-secondary"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Trips Total (All)' | translate }}</span>
            <span class="value">{{ summaryCards.tripsTotal_All | number: '1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Vendor Total (All) -->
    <div class="col-12 col-md-6 col-lg-3">
      <div class="summary-card vendor-card">
        <div class="card-content">
          <div class="icon-wrapper bg-secondary-light">
            <i class="fas fa-store text-secondary"></i>
          </div>
          <div class="info">
            <span class="label">{{ 'Vendor Total (All)' | translate }}</span>
            <span class="value">{{ summaryCards.vendorTotal_All | number: '1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Data Table -->
  <div class="data-table-card card">
    <div class="card-header flex justify-content-between align-items-center">
      <h5 class="m-0">
        <i class="fas fa-table me-2 text-primary"></i>
        {{ 'Outing Summary' | translate }}
      </h5>
      <button
        type="button"
        pButton
        class="p-button-success p-button-sm"
        [loading]="isExporting"
        (click)="exportToExcel()"
        *ngIf="reportData.length > 0"
      >
        <i class="fas fa-file-excel me-2"></i>
        {{ 'Export' | translate }}
      </button>
    </div>

    <div class="card-body p-0">
      <!-- Loading State -->
      <div class="loading-overlay" *ngIf="isLoading">
        <p-progressSpinner strokeWidth="4"></p-progressSpinner>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading && reportData.length === 0">
        <div class="empty-content">
          <i class="fas fa-search fa-4x text-muted mb-3"></i>
          <h5>{{ 'No Data Found' | translate }}</h5>
          <p class="text-muted">{{ 'Use the filters above to search for outing reports' | translate }}</p>
        </div>
      </div>

      <!-- Data Table -->
      <p-table
        [value]="reportData"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[10, 25, 50]"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="{{ 'Showing {first} to {last} of {totalRecords} entries' | translate }}"
        [tableStyle]="{ 'min-width': '100%' }"
        styleClass="p-datatable-striped p-datatable-gridlines"
        *ngIf="!isLoading && reportData.length > 0"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="outingName">
              {{ 'Outing Name' | translate }}
              <p-sortIcon field="outingName"></p-sortIcon>
            </th>
            <th pSortableColumn="vendorName">
              {{ 'Vendor' | translate }}
              <p-sortIcon field="vendorName"></p-sortIcon>
            </th>
            <th pSortableColumn="totalBookings" class="text-center">
              {{ 'Total Bookings' | translate }}
              <p-sortIcon field="totalBookings"></p-sortIcon>
            </th>
            <th class="text-center">{{ 'Booking Status' | translate }}</th>
            <th class="text-center">{{ 'Tickets' | translate }}</th>
            <th pSortableColumn="pricePayedTotal" class="text-end">
              {{ 'Revenue' | translate }}
              <p-sortIcon field="pricePayedTotal"></p-sortIcon>
            </th>
            <th pSortableColumn="clientPaidTotal_Completed" class="text-end">
              {{ 'Client Paid (Completed)' | translate }}
              <p-sortIcon field="clientPaidTotal_Completed"></p-sortIcon>
            </th>
            <th pSortableColumn="tripsTotal_Completed" class="text-end">
              {{ 'Trips (Completed)' | translate }}
              <p-sortIcon field="tripsTotal_Completed"></p-sortIcon>
            </th>
            <th pSortableColumn="vendorTotal_Completed" class="text-end">
              {{ 'Vendor (Completed)' | translate }}
              <p-sortIcon field="vendorTotal_Completed"></p-sortIcon>
            </th>
            <th pSortableColumn="tripsTotal_All" class="text-end">
              {{ 'Trips (All)' | translate }}
              <p-sortIcon field="tripsTotal_All"></p-sortIcon>
            </th>
            <th pSortableColumn="vendorTotal_All" class="text-end">
              {{ 'Vendor (All)' | translate }}
              <p-sortIcon field="vendorTotal_All"></p-sortIcon>
            </th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-item>
          <tr>
            <td>
              <div class="outing-info">
                <span class="outing-name">{{ item.outingName }}</span>
                <small class="outing-id text-muted">#{{ item.outingId }}</small>
              </div>
            </td>
            <td>{{ item.vendorName }}</td>
            <td class="text-center">
              <span class="badge badge-primary">{{ item.totalBookings }}</span>
            </td>
            <td>
              <div class="status-badges">
                <p-tag
                  *ngIf="item.pendingCount > 0"
                  severity="warning"
                  [value]="'Pending: ' + item.pendingCount"
                  [rounded]="true"
                  class="me-1 mb-1"
                ></p-tag>
                <p-tag
                  *ngIf="item.confirmedCount > 0"
                  severity="info"
                  [value]="'Confirmed: ' + item.confirmedCount"
                  [rounded]="true"
                  class="me-1 mb-1"
                ></p-tag>
                <p-tag
                  *ngIf="item.completedCount > 0"
                  severity="success"
                  [value]="'Completed: ' + item.completedCount"
                  [rounded]="true"
                  class="me-1 mb-1"
                ></p-tag>
                <p-tag
                  *ngIf="item.cancelledCount > 0"
                  severity="danger"
                  [value]="'Cancelled: ' + item.cancelledCount"
                  [rounded]="true"
                  class="me-1 mb-1"
                ></p-tag>
                <p-tag
                  *ngIf="item.refundedCount > 0"
                  severity="secondary"
                  [value]="'Refunded: ' + item.refundedCount"
                  [rounded]="true"
                  class="mb-1"
                ></p-tag>
              </div>
            </td>
            <td>
              <div class="ticket-badges">
                <p-tag severity="success" [value]="'Used: ' + item.usedTicketsCount" [rounded]="true" class="me-1 mb-1"></p-tag>
                <p-tag severity="warning" [value]="'Unused: ' + item.unUsedTicketsCount" [rounded]="true" class="mb-1"></p-tag>
              </div>
            </td>
            <td class="text-end font-semibold text-success">
              {{ item.pricePayedTotal | number: '1.2-2' }}
            </td>
            <td class="text-end">
              {{ item.clientPaidTotal_Completed | number: '1.2-2' }}
            </td>
            <td class="text-end">
              {{ item.tripsTotal_Completed | number: '1.2-2' }}
            </td>
            <td class="text-end">
              {{ item.vendorTotal_Completed | number: '1.2-2' }}
            </td>
            <td class="text-end">
              {{ item.tripsTotal_All | number: '1.2-2' }}
            </td>
            <td class="text-end">
              {{ item.vendorTotal_All | number: '1.2-2' }}
            </td>
          </tr>
        </ng-template>

        <!-- Summary Footer -->
        <ng-template pTemplate="footer">
          <tr class="summary-row">
            <td colspan="2" class="font-bold text-end">{{ 'Totals:' | translate }}</td>
            <td class="text-center font-bold">{{ summaryCards.totalBookings | number }}</td>
            <td></td>
            <td class="text-center font-bold">
              <span class="text-success">{{ summaryCards.usedTicketsCount | number }}</span>
              /
              <span class="text-warning">{{ summaryCards.unUsedTicketsCount | number }}</span>
            </td>
            <td class="text-end font-bold text-success">{{ summaryCards.totalRevenue | number: '1.2-2' }}</td>
            <td class="text-end font-bold">{{ summaryCards.clientPaidTotal_Completed | number: '1.2-2' }}</td>
            <td class="text-end font-bold">{{ summaryCards.tripsTotal_Completed | number: '1.2-2' }}</td>
            <td class="text-end font-bold">{{ summaryCards.vendorTotal_Completed | number: '1.2-2' }}</td>
            <td class="text-end font-bold">{{ summaryCards.tripsTotal_All | number: '1.2-2' }}</td>
            <td class="text-end font-bold">{{ summaryCards.vendorTotal_All | number: '1.2-2' }}</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  </div>
</div>

```

---

## `src/app/demo/pages/reports/outing-reports/outing-reports.component.scss`

```scss
.reports-container {
  padding: 17px 25px;

  // Filter Card Styling
  .filter-card {
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);

    .card-body {
      padding: 1.5rem;
    }

    .filter-header {
      h5 {
        color: #2c3e50;
        font-weight: 600;
        display: flex;
        align-items: center;

        i {
          font-size: 1rem;
        }
      }
    }

    .field {
      margin-bottom: 0.5rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #495057;
        font-size: 0.875rem;
      }
    }
  }

  // Summary Cards
  .summary-cards {
    .summary-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
      border-left: 4px solid transparent;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      .card-content {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .icon-wrapper {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        i {
          font-size: 1.5rem;
        }
      }

      .info {
        display: flex;
        flex-direction: column;

        .label {
          color: #6c757d;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .value {
          color: #2c3e50;
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.2;
        }
      }

      // Card Variants
      &.booking-card {
        border-left-color: var(--primary-color, #3b82f6);
      }

      &.revenue-card {
        border-left-color: #22c55e;
      }

      &.vendor-card {
        border-left-color: #f59e0b;
      }

      &.trips-card {
        border-left-color: #06b6d4;
      }
    }
  }

  // Icon backgrounds
  .bg-primary-light {
    background: rgba(59, 130, 246, 0.1);
  }

  .bg-success-light {
    background: rgba(34, 197, 94, 0.1);
  }

  .bg-warning-light {
    background: rgba(245, 158, 11, 0.1);
  }

  .bg-info-light {
    background: rgba(6, 182, 212, 0.1);
  }

  .text-primary {
    color: var(--primary-color, #3b82f6) !important;
  }

  .text-success {
    color: #22c55e !important;
  }

  .text-warning {
    color: #f59e0b !important;
  }

  .text-info {
    color: #06b6d4 !important;
  }

  // Data Table Card
  .data-table-card {
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    .card-header {
      background: linear-gradient(145deg, #f8f9fa 0%, #fff 100%);
      border-bottom: 1px solid #e9ecef;
      padding: 1rem 1.5rem;

      h5 {
        color: #2c3e50;
        font-weight: 600;
        display: flex;
        align-items: center;

        i {
          font-size: 1rem;
        }
      }
    }

    .card-body {
      position: relative;
      min-height: 300px;
    }
  }

  // Loading Overlay
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  // Empty State
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    padding: 3rem;

    .empty-content {
      text-align: center;

      i {
        opacity: 0.3;
      }

      h5 {
        color: #495057;
        margin-bottom: 0.5rem;
      }

      p {
        color: #6c757d;
        max-width: 300px;
        margin: 0 auto;
      }
    }
  }

  // Table Customization
  ::ng-deep {
    .p-datatable {
      // Enable horizontal scroll for wide tables
      .p-datatable-wrapper {
        overflow-x: auto;
      }

      .p-datatable-table {
        min-width: 1400px; // Ensure table has minimum width for all columns
      }

      .p-datatable-thead > tr > th {
        background: #f8f9fa;
        color: #495057;
        font-weight: 600;
        font-size: 0.75rem; // Smaller header font
        padding: 0.5rem 0.5rem; // Reduced padding
        border-color: #e9ecef;
        white-space: nowrap; // Prevent text wrapping
      }

      .p-datatable-tbody > tr > td {
        padding: 0.5rem 0.5rem; // Reduced padding
        vertical-align: middle;
        font-size: 0.8rem; // Smaller body font
        white-space: nowrap; // Prevent text wrapping
      }

      .p-datatable-tbody > tr:hover {
        background: #f3f4f6 !important;
      }

      .summary-row {
        background: linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%) !important;

        td {
          border-top: 2px solid #cbd5e1;
          font-size: 0.8rem;
        }
      }

      // Sortable column icons - smaller
      .p-sortable-column-icon {
        font-size: 0.65rem;
        margin-left: 0.25rem;
      }
    }

    .p-paginator {
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
      padding: 0.5rem 0.75rem;
      font-size: 0.8rem;
    }
  }

  // Outing Info Cell
  .outing-info {
    display: flex;
    flex-direction: column;

    .outing-name {
      font-weight: 600;
      color: #2c3e50;
    }

    .outing-id {
      font-size: 0.75rem;
    }
  }

  // Status Badges
  .status-badges,
  .ticket-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.15rem;

    ::ng-deep .p-tag {
      font-size: 0.65rem;
      padding: 0.15rem 0.35rem;
    }
  }

  // Badge Styling
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 20px;

    &.badge-primary {
      background: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
    }
  }

  // Button Customization
  ::ng-deep {
    .p-button {
      border-radius: 8px;
      font-weight: 500;

      &.p-button-primary {
        background: linear-gradient(135deg, var(--primary-color, #3b82f6) 0%, #2563eb 100%);
        border: none;

        &:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        }
      }

      &.p-button-success {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        border: none;
      }
    }
  }

  // Calendar Customization
  ::ng-deep {
    .p-calendar {
      width: 100%;

      .p-inputtext {
        border-radius: 8px;
        border-color: #e2e8f0;

        &:focus {
          border-color: var(--primary-color, #3b82f6);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
      }
    }

    .p-dropdown {
      border-radius: 8px;
      border-color: #e2e8f0;

      &:hover {
        border-color: #cbd5e1;
      }

      &.p-focus {
        border-color: var(--primary-color, #3b82f6);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      }
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .reports-container {
    .summary-card {
      .card-content {
        .icon-wrapper {
          width: 48px;
          height: 48px;

          i {
            font-size: 1.25rem;
          }
        }

        .info .value {
          font-size: 1.25rem;
        }
      }
    }

    .status-badges {
      flex-direction: column;
      align-items: flex-start;
    }
  }
}

```

---

## `src/app/demo/pages/reports/outing-reports/outing-reports.component.ts`

```ts
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { ReportsService } from 'src/app/shared/services/reports.service';
import { OutingSummaryItem, OutingSummaryRequest } from 'src/app/shared/model/reports.model';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { VendorService } from 'src/app/shared/services/vendor.service';

@Component({
  selector: 'app-outing-reports',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './outing-reports.component.html',
  styleUrls: ['./outing-reports.component.scss']
})
export class OutingReportsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reportsService = inject(ReportsService);
  private configureService = inject(ConfigureService);
  private vendorService = inject(VendorService);

  filterForm!: FormGroup;
  reportData: OutingSummaryItem[] = [];
  isLoading = false;
  isExporting = false;
  vendors: any[] = [];
  outings: any[] = [];

  // Status options
  statusOptions = [
    { label: 'All', value: null },
    { label: 'Pending', value: 1 },
    { label: 'Confirmed', value: 2 },
    { label: 'Cancelled', value: 3 },
    { label: 'Completed', value: 4 },
    { label: 'Refunded', value: 5 }
  ];

  // Summary cards data
  summaryCards = {
    totalBookings: 0,
    totalRevenue: 0,
    usedTicketsCount: 0,
    unUsedTicketsCount: 0,
    tripsTotal_Completed: 0,
    vendorTotal_Completed: 0,
    clientPaidTotal_Completed: 0,
    tripsTotal_All: 0,
    vendorTotal_All: 0
  };

  // Check if user is vendor
  isVendor = false;

  ngOnInit(): void {
    this.initForm();
    this.checkUserRole();
    this.loadVendors();
  }

  private initForm(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.filterForm = this.fb.group({
      fromDate: [firstDayOfMonth, Validators.required],
      toDate: [today],
      companyId: [null],
      outingId: [null],
      status: [null]
    });
  }

  private checkUserRole(): void {
    const roles = this.configureService.userRoles();
    this.isVendor = roles.some((role: string) => role.startsWith('Vendor.'));

    if (this.isVendor) {
      // Auto-set vendor's company ID
      const user = this.configureService.parsedUser;
      if (user?.companyId) {
        this.filterForm.patchValue({ companyId: user.companyId });
      }
    }
  }

  private loadVendors(): void {
    if (!this.isVendor) {
      this.vendorService.getAllVendors({ isPagingEnabled: false }).subscribe({
        next: (response: any) => {
          this.vendors = response?.data?.data || response?.data || [];
        },
        error: (err) => console.error('Error loading vendors:', err)
      });
    }
  }

  loadOutings(vendorId: number): void {
    // Load outings when vendor is selected (optional)
  }

  onSearch(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.filterForm.value;

    const criteria: OutingSummaryRequest = {
      fromDate: this.formatDate(formValue.fromDate),
      toDate: formValue.toDate ? this.formatDate(formValue.toDate) : undefined,
      companyId: formValue.companyId || undefined,
      outingId: formValue.outingId || undefined,
      status: formValue.status !== null ? formValue.status : undefined
    };

    this.reportsService.getOutingSummary(criteria).subscribe({
      next: (response: any) => {
        this.reportData = response?.data || [];
        this.calculateSummary();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching report:', err);
        this.reportData = [];
        this.isLoading = false;
      }
    });
  }

  onReset(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.filterForm.reset({
      fromDate: firstDayOfMonth,
      toDate: today,
      companyId: null,
      outingId: null,
      status: null
    });

    this.reportData = [];
    this.resetSummary();
  }

  private calculateSummary(): void {
    this.summaryCards = this.reportData.reduce(
      (acc, item) => ({
        totalBookings: acc.totalBookings + item.totalBookings,
        totalRevenue: acc.totalRevenue + item.clientPaidTotal_Completed,
        usedTicketsCount: acc.usedTicketsCount + item.usedTicketsCount,
        unUsedTicketsCount: acc.unUsedTicketsCount + item.unUsedTicketsCount,
        tripsTotal_Completed: acc.tripsTotal_Completed + item.tripsTotal_Completed,
        vendorTotal_Completed: acc.vendorTotal_Completed + item.vendorTotal_Completed,
        clientPaidTotal_Completed: acc.clientPaidTotal_Completed + item.clientPaidTotal_Completed,
        tripsTotal_All: acc.tripsTotal_All + item.tripsTotal_All,
        vendorTotal_All: acc.vendorTotal_All + item.vendorTotal_All
      }),
      {
        totalBookings: 0,
        totalRevenue: 0,
        usedTicketsCount: 0,
        unUsedTicketsCount: 0,
        tripsTotal_Completed: 0,
        vendorTotal_Completed: 0,
        clientPaidTotal_Completed: 0,
        tripsTotal_All: 0,
        vendorTotal_All: 0
      }
    );
  }

  private resetSummary(): void {
    this.summaryCards = {
      totalBookings: 0,
      totalRevenue: 0,
      usedTicketsCount: 0,
      unUsedTicketsCount: 0,
      tripsTotal_Completed: 0,
      vendorTotal_Completed: 0,
      clientPaidTotal_Completed: 0,
      tripsTotal_All: 0,
      vendorTotal_All: 0
    };
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString();
  }

  exportToExcel(): void {
    this.isExporting = true;
    // Export logic can be added here
    setTimeout(() => {
      this.isExporting = false;
    }, 1000);
  }

  // Get severity for status tag
  getStatusSeverity(status: number): string {
    switch (status) {
      case 0:
        return 'warning'; // Pending
      case 1:
        return 'info'; // Confirmed
      case 2:
        return 'success'; // Completed
      case 3:
        return 'danger'; // Cancelled
      case 4:
        return 'secondary'; // Refunded
      default:
        return 'info';
    }
  }
}

```

---

