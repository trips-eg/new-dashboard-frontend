# 10 – Misc (Part 9/17 of Misc)

> **Description:** Everything else that didn't fit the categories above. [Category: C02]
> **Generated:** 2026-03-02 20:16:48

---

## `src/app/demo/pages/settings/vendors/vendor-detail/vendor-detail.component.html`

```html
<div class="store-overview p-4">
  <!-- Store Header -->
  <div class="p-card store-banner p-5 mb-4" *ngIf="CompanyId || vendorId">
    <div class="grid align-items-center">
      <div class="col-8" style="z-index: 3">
        <div class="flex align-items-center">
          <img [src]="imgUrl ?? 'https://placehold.co/600x400?text=No+Image'" alt="Store Banner" class="store-logo border-round mr-3" />
          <div>
            <h2 class="mb-1 text-white">{{ VendorData.name }}</h2>
            <p class="mb-2 text-white">
              {{ VendorData.description }}
            </p>
            <div class="flex align-items-center text-white">
              <i class="pi pi-envelope mr-2 info"></i>
              {{ VendorData.email }}
              <i class="pi pi-phone ml-4 mr-2 info"></i>
              {{ VendorData.phone }}
            </div>
          </div>
        </div>
      </div>
      <!-- <div class="col-4 text-right" style="height: 165px" *ngIf="!isVendor()">
        <p-button
          [label]="'payments' | translate"
          pTooltip="archive payments"
          tooltipPosition="bottom"
          icon="pi pi-pen-to-square"
          class="p-main"
          (onClick)="openPaymentsForm()"
        ></p-button>
      </div> -->
    </div>
  </div>

  <!-- vendor Statistics -->
  <div class="grid mb-4">
    <div class="col-12 col-md-4">
      <p-card class="stat">
        <div class="flex align-items-center justify-content-between">
          <div>
            <h4>{{ 'Total Trip Reservation' | translate }}</h4>

            <h4 class="text-success">
              {{ VendorStatistics?.totalTripReservation }}
            </h4>
          </div>
          <i class="pi pi-wallet text-orange-500 text-4xl"></i>
        </div>
      </p-card>
    </div>
    <div class="col-12 col-md-4">
      <p-card class="stat">
        <div class="flex align-items-center justify-content-between">
          <div>
            <h4>{{ 'Total Room Reservation' | translate }}</h4>

            <h4 class="text-success">
              {{ VendorStatistics?.totalRoomReservation }}
            </h4>
          </div>
          <i class="pi pi-dollar text-green-500 text-4xl"></i>
        </div>
      </p-card>
    </div>
    <div class="col-12 col-md-4">
      <p-card class="stat">
        <div class="flex align-items-center justify-content-between">
          <div>
            <h4>{{ 'Total Vendor Income' | translate }}</h4>

            <h4 class="text-success">
              {{ VendorStatistics?.totalVendorIncome }}
            </h4>
          </div>
          <i class="pi pi-users text-purple-500 text-4xl"></i>
        </div>
      </p-card>
    </div>
    <!-- Outing Reservation (TODO: backend) -->
    <div class="col-12 col-md-4" *ngIf="isOutingVendor">
      <p-card class="stat">
        <div class="flex align-items-center justify-content-between">
          <div>
            <h4>
              {{ 'Total Outing Reservation' | translate }}
              <i
                class="pi pi-exclamation-triangle text-orange-500 text-sm ml-1"
                pTooltip="Backend needs to return this value in GetDashboardInfo"
                tooltipPosition="top"
              ></i>
            </h4>

            <h4 class="text-success">
              {{ VendorStatistics?.totalOutingReservation ?? '—' }}
            </h4>
          </div>
          <i class="pi pi-compass text-cyan-500 text-4xl"></i>
        </div>
      </p-card>
    </div>
    <!-- Hajj Reservation (TODO: backend) -->
    <div class="col-12 col-md-4" *ngIf="isManasikVendor">
      <p-card class="stat">
        <div class="flex align-items-center justify-content-between">
          <div>
            <h4>
              {{ 'Total Hajj Reservation' | translate }}
              <i
                class="pi pi-exclamation-triangle text-orange-500 text-sm ml-1"
                pTooltip="Backend needs to return this value in GetDashboardInfo"
                tooltipPosition="top"
              ></i>
            </h4>

            <h4 class="text-success">
              {{ VendorStatistics?.totalHajjReservation ?? '—' }}
            </h4>
          </div>
          <i class="pi pi-moon text-indigo-500 text-4xl"></i>
        </div>
      </p-card>
    </div>
    <div class="col-12 col-md-4" *ngIf="VendorData.id">
      <p-card class="stat">
        <div class="flex align-items-center justify-content-between">
          <div>
            <h4>{{ 'Commission' | translate }}</h4>
            <h4>
              <small class="text-success text-sm">{{ 'Hotel' | translate }} :</small>
              {{ VendorData?.hotelCommissionRate }} %
            </h4>
            <h4>
              <small class="text-warning text-sm">{{ 'Trip' | translate }} :</small>
              {{ VendorData?.travelCommissionRate }} %
            </h4>
            <h4 *ngIf="isOutingVendor">
              <small class="text-cyan-500 text-sm">{{ 'Outing' | translate }} :</small>
              {{ VendorData?.outingCommissionRate ?? '—' }} %
              <i
                *ngIf="!VendorData?.outingCommissionRate"
                class="pi pi-exclamation-triangle text-orange-500 text-xs ml-1"
                pTooltip="Backend needs to return this field"
                tooltipPosition="top"
              ></i>
            </h4>
            <h4 *ngIf="isManasikVendor">
              <small class="text-indigo-500 text-sm">{{ 'Hajj' | translate }} :</small>
              {{ VendorData?.hajjCommissionRate ?? '—' }} %
              <i
                *ngIf="!VendorData?.hajjCommissionRate"
                class="pi pi-exclamation-triangle text-orange-500 text-xs ml-1"
                pTooltip="Backend needs to return this field"
                tooltipPosition="top"
              ></i>
            </h4>
          </div>
          <i class="pi pi-chart-line text-blue-500 text-4xl"></i>
        </div>
      </p-card>
    </div>

    <!-- <div class="col-12 col-md-4">
      <p-card class="stat">
        <div class="flex align-items-center justify-content-between">
          <div>
            <h4>{{ 'Total payed' | translate }}</h4>

            <p class="text-success">
              {{ VendorStatistics?.totalPayed }}
            </p>
          </div>
          <i class="pi pi-users text-purple-500 text-4xl"></i>
        </div>
      </p-card>
    </div> -->
    <div class="col-12 col-md-4" *ngIf="!isVendor()">
      <p-card class="stat">
        <div class="flex align-items-center justify-content-between">
          <div>
            <h4>{{ 'Total Customers' | translate }}</h4>

            <p class="text-success">
              {{ VendorStatistics?.customerCount }}
            </p>
          </div>
          <i class="pi pi-users text-purple-500 text-4xl"></i>
        </div>
      </p-card>
    </div>
  </div>

  <!-- store Order status Section -->
  <!--
  <div class="card p-3">
    <div class="card-header flex align-items-center justify-content-between py-3 mb-4">
      <h2>{{ 'Orders' | translate }}</h2>
      <div class="flex align-items-center justify-content-between">
        <h3 class="mx-3 text-blue-600 d-inline-block">
          {{ 'total orders' | translate }} :
          <strong class="text-gray-500">{{ 122 }}</strong>
        </h3>
        <h3 class="text-green-600 d-inline-block">
          {{ 'Sales' | translate }}:
          <strong class="text-gray-500">{{ 333 | number: '1.2-2' }}</strong>
          $
        </h3>
      </div>
    </div>

    <div class="grid mb-4 order-state">


      <div class="col-12 col-md-3">
        <p-card class="order-status-card">
          <div class="flex align-items-center gap-2 mb-2">
            <i class="pi pi-truck text-main text-2xl"></i>
            <span class="fw-bold text-gray-400">{{ 'Transferred' | translate }}</span>
          </div>
          <div class="flex align-items-center justify-content-between">
            <span class="font-bold text-2xl">{{ 888 }}</span>
            <span class="text-success font-medium">
              {{ 'sales' | translate }} : {{ 888 | number: '1.2-2' }}
              $
            </span>
          </div>
        </p-card>
      </div>

      <div class="col-12 col-md-3">
        <p-card class="order-status-card">
          <div class="flex align-items-center gap-2 mb-2">
            <i class="pi pi-money-bill text-main text-2xl"></i>
            <span class="fw-bold text-gray-400">{{ 'Due' | translate }}</span>
          </div>
          <div class="flex align-items-center justify-content-between">
            <span class="font-bold text-2xl">{{ 80 }}</span>
            <span class="text-success font-medium">
              {{ 'sales' | translate }} : {{ 888 | number: '1.2-2' }}
              $
            </span>
          </div>
        </p-card>
      </div>

      <div class="col-12 col-md-3">
        <p-card class="order-status-card">
          <div class="flex align-items-center gap-2 mb-2">
            <i class="pi pi-shopping-cart text-main text-2xl"></i>
            <span class="fw-bold text-gray-400">{{ 'Pending' | translate }}</span>
          </div>
          <div class="flex align-items-center justify-content-between">
            <span class="font-bold text-2xl">{{ 666 }}</span>
            <span class="text-danger font-medium">
              {{ 'sales' | translate }} : {{ 666 | number: '1.2-2' }}
              $
            </span>
          </div>
        </p-card>
      </div>

      <div class="col-12 col-md-3">
        <p-card class="order-status-card">
          <div class="flex align-items-center gap-2 mb-2">
            <i class="pi pi-shopping-bag text-main text-2xl"></i>
            <span class="fw-bold text-gray-400">{{ 'Not Completed' | translate }}</span>
          </div>
          <div class="flex align-items-center justify-content-between">
            <span class="font-bold text-2xl">{{ 4444 }}</span>
            <span class="text-danger font-medium">
              {{ 'sales' | translate }} : {{ 222 | number: '1.2-2' }}
              $
            </span>
          </div>
        </p-card>
      </div>
    </div>
  </div> -->
  <div class="mb-4">
    <p-panel header="{{ 'Statistics details' | translate }}" [toggleable]="true" class="mt-4">
      <div class="col-md-12">
        <p-toolbar styleClass="mb-4 gap-2">
          <ng-template pTemplate="left">
            <form [formGroup]="vendorSectorStatisticsForm" (ngSubmit)="onSubmitvendorSectorStatisticsForm()" class="w-full">
              <div class="grid align-items-end">
                <!-- From Date -->
                <div class="field col-12 col-md-4 mb-0">
                  <label for="from">{{ 'search from' | translate }}</label>
                  <p-calendar
                    id="from"
                    formControlName="from"
                    showIcon="true"
                    dateFormat="dd-mm-yy"
                    [iconDisplay]="'input'"
                    class="w-full"
                  />
                  <small
                    class="text-danger d-block"
                    style="min-height: 1.25rem"
                    *ngIf="
                      vendorSectorStatisticsForm.controls['from'].invalid &&
                      (vendorSectorStatisticsForm.controls['from'].dirty || vendorSectorStatisticsForm.controls['from'].touched)
                    "
                  >
                    {{ 'Please select date' | translate }}
                  </small>
                  <!-- حتى لو الرسالة مش ظاهرة، min-height يضمن مساحة ثابتة -->
                  <small
                    *ngIf="
                      !(
                        vendorSectorStatisticsForm.controls['from'].invalid &&
                        (vendorSectorStatisticsForm.controls['from'].dirty || vendorSectorStatisticsForm.controls['from'].touched)
                      )
                    "
                    style="display: block; min-height: 1.25rem"
                  ></small>
                </div>

                <!-- To Date -->
                <div class="field col-12 col-md-4 mb-0">
                  <label for="to">{{ 'search To' | translate }}</label>
                  <p-calendar id="to" formControlName="to" showIcon="true" dateFormat="dd-mm-yy" [iconDisplay]="'input'" class="w-full" />
                  <small
                    class="text-danger d-block"
                    style="min-height: 1.25rem"
                    *ngIf="
                      vendorSectorStatisticsForm.controls['to'].invalid &&
                      (vendorSectorStatisticsForm.controls['to'].dirty || vendorSectorStatisticsForm.controls['to'].touched)
                    "
                  >
                    {{ 'Please select date' | translate }}
                  </small>
                  <small
                    *ngIf="
                      !(
                        vendorSectorStatisticsForm.controls['to'].invalid &&
                        (vendorSectorStatisticsForm.controls['to'].dirty || vendorSectorStatisticsForm.controls['to'].touched)
                      )
                    "
                    style="display: block; min-height: 1.25rem"
                  ></small>
                </div>

                <!-- Submit Button -->
                <div class="field col-12 col-md-4 mb-4">
                  <p-button label="{{ 'search' | translate }}" icon="pi pi-search" type="submit" class="w-full" />
                </div>
              </div>
            </form>
          </ng-template>
        </p-toolbar>
      </div>
      <p-tabView>
        <!--  Travel -->
        <p-tabPanel [header]="'Travel' | translate" *ngIf="isTravelVendor">
          <ng-template pTemplate="content">
            <div class="grid mb-4" *ngIf="!showNoDataMessage && VendorTravelStatistics; else noData">
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Reservations' | translate }}</h4>

                      <h4 class="text-success">
                        {{ VendorTravelStatistics?.totalReservations }}
                      </h4>
                    </div>
                    <i class="pi pi-wallet text-orange-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'totalRevenue' | translate }}</h4>

                      <h4 class="text-success">
                        {{ VendorTravelStatistics?.totalRevenue }}
                      </h4>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Vendor Profit' | translate }}</h4>

                      <h4 class="text-success">
                        {{ VendorTravelStatistics?.totalVendorProfit }}
                      </h4>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>

              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Profit' | translate }}</h4>

                      <p class="text-success">
                        {{ VendorTravelStatistics?.totalProfit }}
                      </p>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Sales Tax' | translate }}</h4>

                      <p class="text-success">
                        {{ VendorTravelStatistics?.totalSalesTax }}
                      </p>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Coupons Value' | translate }}</h4>

                      <p class="text-success">
                        {{ VendorTravelStatistics?.totalCouponsValue }}
                      </p>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total CommissionVat' | translate }}</h4>

                      <p class="text-success">
                        {{ VendorTravelStatistics?.totalCommissionVat }}
                      </p>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
            </div>
          </ng-template>
          <ng-template #noData>
            <div class="text-center py-5 text-600">
              <i class="pi pi-info-circle text-orange-500 text-2xl mb-2"></i>
              <p>{{ 'Please enter a date range to search' | translate }}</p>
            </div>
          </ng-template>
        </p-tabPanel>

        <!--  Room -->
        <p-tabPanel [header]="'Room' | translate" *ngIf="isRoomlVendor">
          <ng-template pTemplate="content">
            <div class="grid mb-4" *ngIf="!showNoDataMessage && VendorTravelStatistics; else noData">
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Reservations' | translate }}</h4>

                      <h4 class="text-success">
                        {{ VendorRoomStatistics?.totalReservations }}
                      </h4>
                    </div>
                    <i class="pi pi-wallet text-orange-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'totalRevenue' | translate }}</h4>

                      <h4 class="text-success">
                        {{ VendorRoomStatistics?.totalRevenue }}
                      </h4>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Vendor Profit' | translate }}</h4>

                      <h4 class="text-success">
                        {{ VendorRoomStatistics?.totalVendorProfit }}
                      </h4>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>

              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Profit' | translate }}</h4>

                      <p class="text-success">
                        {{ VendorRoomStatistics?.totalProfit }}
                      </p>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Sales Tax' | translate }}</h4>

                      <p class="text-success">
                        {{ VendorRoomStatistics?.totalSalesTax }}
                      </p>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Coupons Value' | translate }}</h4>

                      <p class="text-success">
                        {{ VendorRoomStatistics?.totalCouponsValue }}
                      </p>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total CommissionVat' | translate }}</h4>

                      <p class="text-success">
                        {{ VendorRoomStatistics?.totalCommissionVat }}
                      </p>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
            </div>
          </ng-template>
          <ng-template #noData>
            <div class="text-center py-5 text-600">
              <i class="pi pi-info-circle text-orange-500 text-2xl mb-2"></i>
              <p>{{ 'Please enter a date range to search' | translate }}</p>
            </div>
          </ng-template>
        </p-tabPanel>

        <!--  Outing -->
        <p-tabPanel [header]="'outing' | translate" *ngIf="isOutingVendor">
          <ng-template pTemplate="content">
            <div class="grid mb-4" *ngIf="!showNoDataMessage && VendorOutingStatistics; else noDataOuting">
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Reservations' | translate }}</h4>

                      <h4 class="text-success">
                        {{ VendorOutingStatistics?.totalReservations }}
                      </h4>
                    </div>
                    <i class="pi pi-wallet text-orange-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'totalRevenue' | translate }}</h4>

                      <h4 class="text-success">
                        {{ VendorOutingStatistics?.totalRevenue }}
                      </h4>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Vendor Profit' | translate }}</h4>

                      <h4 class="text-success">
                        {{ VendorOutingStatistics?.totalVendorProfit }}
                      </h4>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>

              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Profit' | translate }}</h4>

                      <p class="text-success">
                        {{ VendorOutingStatistics?.totalProfit }}
                      </p>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Sales Tax' | translate }}</h4>

                      <p class="text-success">
                        {{ VendorOutingStatistics?.totalSalesTax }}
                      </p>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Coupons Value' | translate }}</h4>

                      <p class="text-success">
                        {{ VendorOutingStatistics?.totalCouponsValue }}
                      </p>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total CommissionVat' | translate }}</h4>

                      <p class="text-success">
                        {{ VendorOutingStatistics?.totalCommissionVat }}
                      </p>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
            </div>
          </ng-template>
          <ng-template #noDataOuting>
            <div class="text-center py-5 text-600">
              <i class="pi pi-info-circle text-orange-500 text-2xl mb-2"></i>
              <p>{{ 'Please enter a date range to search' | translate }}</p>
            </div>
          </ng-template>
        </p-tabPanel>

        <!--  Hajj / Manasik -->
        <p-tabPanel [header]="'manasik' | translate" *ngIf="isManasikVendor">
          <ng-template pTemplate="content">
            <div class="grid mb-4" *ngIf="!showNoDataMessage && VendorHajjStatistics; else noDataHajj">
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Reservations' | translate }}</h4>

                      <h4 class="text-success">
                        {{ VendorHajjStatistics?.totalReservations }}
                      </h4>
                    </div>
                    <i class="pi pi-wallet text-orange-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'totalRevenue' | translate }}</h4>

                      <h4 class="text-success">
                        {{ VendorHajjStatistics?.totalRevenue }}
                      </h4>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Vendor Profit' | translate }}</h4>

                      <h4 class="text-success">
                        {{ VendorHajjStatistics?.totalVendorProfit }}
                      </h4>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>

              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Profit' | translate }}</h4>

                      <p class="text-success">
                        {{ VendorHajjStatistics?.totalProfit }}
                      </p>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Sales Tax' | translate }}</h4>

                      <p class="text-success">
                        {{ VendorHajjStatistics?.totalSalesTax }}
                      </p>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total Coupons Value' | translate }}</h4>

                      <p class="text-success">
                        {{ VendorHajjStatistics?.totalCouponsValue }}
                      </p>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
              <div class="col-12 col-md-4">
                <p-card class="stat">
                  <div class="flex align-items-center justify-content-between">
                    <div>
                      <h4>{{ 'total CommissionVat' | translate }}</h4>

                      <p class="text-success">
                        {{ VendorHajjStatistics?.totalCommissionVat }}
                      </p>
                    </div>
                    <i class="pi pi-dollar text-green-500 text-4xl"></i>
                  </div>
                </p-card>
              </div>
            </div>
          </ng-template>
          <ng-template #noDataHajj>
            <div class="text-center py-5 text-600">
              <i class="pi pi-info-circle text-orange-500 text-2xl mb-2"></i>
              <p>{{ 'Please enter a date range to search' | translate }}</p>
            </div>
          </ng-template>
        </p-tabPanel>
      </p-tabView>
    </p-panel>
  </div>
  <div class="mb-4" *ngIf="CompanyId || vendorId">
    <p-panel header="{{ 'Reservation History' | translate }}" [toggleable]="true" class="mt-4">
      <div class="flex justify-end mb-3" *ngIf="!isVendor()">
        <p-button
          [label]="'payments' | translate"
          pTooltip="archive payments"
          tooltipPosition="bottom"
          icon="pi pi-pen-to-square"
          class="p-button-primary"
          (onClick)="openPaymentsForm()"
          [disabled]="!selectedItems || selectedItems.length === 0"
        ></p-button>
      </div>
      <p-tabView>
        <!--  Travel -->
        <p-tabPanel [header]="'Travel' | translate" *ngIf="isTravelVendor">
          <ng-template pTemplate="content">
            <app-travel-booking-info
              #travelsBookingsInfo
              [totalRecords]="totalRecorsOfTravel"
              [consumerTravelDetailReserved]="travelList"
              (pageChange)="getVendorReservationsData($event, 'travel')"
              (refundedSuccess)="getTravelReservationForVendor()"
              (selectionChange)="onChildSelectionChange($event)"
            />
          </ng-template>
        </p-tabPanel>

        <!--  Room -->
        <p-tabPanel [header]="'Room' | translate" *ngIf="isRoomlVendor">
          <ng-template pTemplate="content">
            <app-room-booking-info
              #roomsBookingsInfo
              [consumerRoomDetailReserved]="roomsList"
              [totalRecords]="totalRecorsOfRooms"
              (pageChange)="getVendorReservationsData($event, 'room')"
              (refundedSuccess)="getRoomReservationForVendor()"
              (selectionChange)="onChildSelectionChange($event)"
            />
          </ng-template>
        </p-tabPanel>
        <!--  outing -->
        <p-tabPanel [header]="'outing' | translate" *ngIf="isOutingVendor">
          <ng-template pTemplate="content">
            <app-outing-booking-info
              [consumerOutingDetailReserved]="outingsList"
              [totalRecords]="totalRecorsOfOutings"
              [reservationUser]="VendorData"
              (pageChange)="getVendorReservationsData($event, 'outing')"
              (refundedSuccess)="getOutingReservationForVendor()"
              (selectionChange)="onChildSelectionChange($event)"
            ></app-outing-booking-info>
          </ng-template>
        </p-tabPanel>
        <!--  manasik -->
        <p-tabPanel [header]="'manasik' | translate" *ngIf="isManasikVendor">
          <ng-template pTemplate="content">
            <app-manasik-booking-info
              [consumerHajjDetailReserved]="manasikList"
              [totalRecords]="totalRecorsOfManasik"
              [reservationUser]="VendorData"
              (pageChange)="getVendorReservationsData($event, 'manasik')"
              (refundedSuccess)="getManasikReservationForVendor()"
              (selectionChange)="onChildSelectionChange($event)"
            ></app-manasik-booking-info>
          </ng-template>
        </p-tabPanel>

        <!-- no data-->
        <!-- <p-tabPanel  header="{{ 'Info' | translate }}">
          <ng-template pTemplate="content">
            <div class="text-center text-gray-500 p-4">
              {{ 'No reservation data found' | translate }}
            </div>
          </ng-template>
        </p-tabPanel> -->
      </p-tabView>
    </p-panel>
  </div>

  <p-panel header="{{ 'payments History' | translate }}" [toggleable]="true" *ngIf="CompanyId || vendorId">
    <app-payments-for-vendor-list [vendorId]="VendorData.id"></app-payments-for-vendor-list>
  </p-panel>
  <div class="mt-4" *ngIf="CompanyId || vendorId">
    <p-panel header="{{ 'vendor fields' | translate }}" [toggleable]="true" *ngIf="CompanyId || vendorId">
      <p-tabView>
        <!--  Travel -->
        <p-tabPanel [header]="'Travel' | translate" *ngIf="isTravelVendor">
          <ng-template pTemplate="content">
            <app-travels-list *ngIf="VendorData?.id" [CompanyId]="VendorData.id" />
          </ng-template>
        </p-tabPanel>

        <!--  Room -->
        <p-tabPanel [header]="'Room' | translate" *ngIf="isRoomlVendor">
          <ng-template pTemplate="content">
            <app-room-list [CompanyId]="VendorData.id" />
          </ng-template>
        </p-tabPanel>
        <!--  Outing -->
        <p-tabPanel [header]="'Outing' | translate" *ngIf="isOutingVendor">
          <ng-template pTemplate="content">
            <app-outing-list [CompanyId]="VendorData.id" />
          </ng-template>
        </p-tabPanel>
        <!-- manasik -->
        <!-- hajj -->
        <p-tabPanel [header]="'hajj' | translate" *ngIf="isManasikVendor">
          <ng-template pTemplate="content">
            <app-manasik-list [CompanyId]="VendorData.id" [type]="ManasikType.Hajj" />
          </ng-template>
        </p-tabPanel>

        <!-- umrah -->
        <p-tabPanel [header]="'umrah' | translate" *ngIf="isManasikVendor">
          <ng-template pTemplate="content">
            <app-manasik-list [CompanyId]="VendorData.id" [type]="ManasikType.Umrah" />
          </ng-template>
        </p-tabPanel>

        <!-- no data-->
        <!-- <p-tabPanel  header="{{ 'Info' | translate }}">
          <ng-template pTemplate="content">
            <div class="text-center text-gray-500 p-4">
              {{ 'No reservation data found' | translate }}
            </div>
          </ng-template>
        </p-tabPanel> -->
      </p-tabView>
    </p-panel>
  </div>
</div>

```

---

## `src/app/demo/pages/settings/vendors/vendor-detail/vendor-detail.component.scss`

```scss
.store-logo {
  width: 150px; /* Set a static width */
  height: 110px; /* Set a static height */
  object-fit: cover; /* Ensures the image scales and crops properly */
  border-radius: 10px; /* Optional: Adjust the border radius */
}
.store-banner{
background: url('/assets/images/bg-login.jpg') no-repeat center center;
background-size: cover;
position: relative;
z-index: 2;
border-radius: 9px;
}
.store-banner::before{
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 9px;
  background-color: #0b3c58db; /* Adjust the opacity as needed */
}
.info{
  background:#fff;
  padding: 4px;
  border-radius: 3px;
  color: var(--thm-blue);
}
.pi-link:hover{
  cursor: pointer;


}
h4{font-weight: 700;}

```

---

## `src/app/demo/pages/settings/vendors/vendor-detail/vendor-detail.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorDetailComponent } from './vendor-detail.component';

describe('VendorDetailComponent', () => {
  let component: VendorDetailComponent;
  let fixture: ComponentFixture<VendorDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/vendors/vendor-detail/vendor-detail.component.ts`

```ts
import { ChangeDetectorRef, Component, Input, ViewChild, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { Vendor } from 'src/app/shared/model/vendoreDto';
import { VendorService } from 'src/app/shared/services/vendor.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { environment } from 'src/environments/environment';
import { RoomBookingInfoComponent } from 'src/app/shared/tables-booking-info/room-booking-info/room-booking-info.component';
import { TravelBookingInfoComponent } from 'src/app/shared/tables-booking-info/travel-booking-info/travel-booking-info.component';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { ReservationsService } from 'src/app/shared/services/reservations.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PaymentsForVendorFormComponent } from './payments-for-vendor-form/payments-for-vendor-form.component';
import { PaymentsForVendorListComponent } from './payments-for-vendor-list/payments-for-vendor-list.component';
import { TravelsListComponent } from '../../../travels/travels-list/travels-list.component';
import { RoomListComponent } from '../../../hotels/rooms/room-list/room-list.component';
import { CompaniesWalletService } from 'src/app/shared/services/companies-wallet.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OutingBookingInfoComponent } from 'src/app/shared/tables-booking-info/outing-booking-info/outing-booking-info.component';
import { OutingListComponent } from '../../../outing/outing-list/outing-list.component';
import { ManasikListComponent } from 'src/app/shared/manasik/manasik-list/manasik-list.component';
import { ManasikType } from 'src/app/shared/Enums/manasikType';
import { ManasikBookingInfoComponent } from 'src/app/shared/tables-booking-info/manasik-booking-info/manasik-booking-info.component';
import { ScannerPageComponent } from '../../../scanner-page/scanner-page.component';

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [
    SharedModule,
    RoomBookingInfoComponent,
    TravelBookingInfoComponent,
    PaymentsForVendorListComponent,
    TravelsListComponent,
    RoomListComponent,
    OutingBookingInfoComponent,
    OutingListComponent,
    ManasikListComponent,
    ManasikBookingInfoComponent,
    ScannerPageComponent
  ],
  providers: [DialogService],
  templateUrl: './vendor-detail.component.html',
  styleUrl: './vendor-detail.component.scss'
})
export class VendorDetailComponent {
  @Input() CompanyId: any;
  @ViewChild(PaymentsForVendorListComponent) PaymentsForVendorListComponent;
  @ViewChild('travelsBookingsInfo') travelsBookingsInfo: TravelBookingInfoComponent;
  @ViewChild('roomsBookingsInfo') roomsBookingsInfo: RoomBookingInfoComponent;
  paymentsListComp!: PaymentsForVendorListComponent;
  ref: DynamicDialogRef | undefined;
  isTravelVendor = false;

  isRoomlVendor = false;
  isOutingVendor = false;
  isManasikVendor = false;
  VendorData: any = {};
  VendorStatistics: any = {};
  VendorTravelStatistics: any = {};
  VendorRoomStatistics: any = {};
  VendorOutingStatistics: any = {};
  VendorHajjStatistics: any = {};
  showNoDataMessage: boolean = true;
  vendorSectorStatisticsForm: FormGroup;
  baseUrl = environment.imgUrl;
  imgUrl = null;
  vendorId: any;
  first: number = 0; // بداية الصف
  rows: number = 10; // عدد الصفوف في الصفحة
  search: string = ''; // لو عندك بحث
  travelList = [];
  roomsList = [];
  totalRecorsOfTravel = 0;
  totalRecorsOfRooms = 0;
  outingsList: any[] = [];
  totalRecorsOfOutings = 0;
  manasikList: any[] = [];
  totalRecorsOfManasik = 0;
  ManasikType = ManasikType;
  filter = {
    pageIndex: Math.floor(this.first / this.rows) + 1, // 1-based
    pageSize: this.rows,
    search: this.search,
    CompanyId: this.VendorData.id
  };

  selectedItems: { moduleType: number; id: number }[] = [];

  onChildSelectionChange(event: { moduleType: number; id: number; removed?: boolean }) {
    if (event.removed) {
      this.selectedItems = this.selectedItems.filter((i) => !(i.moduleType === event.moduleType && i.id === event.id));
    } else {
      this.selectedItems.push({ moduleType: event.moduleType, id: event.id });
    }

    console.log('All selected items:', this.selectedItems);
  }

  isVendor(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }
  // isScanner(): boolean {
  //   const Permissions = this.ConfigureService.userPermissions();
  //   return Permissions.some((Permission) => Permission.startsWith('Permissions.Scanner'));
  // }
  constructor(
    private vendorService: VendorService,
    private route: ActivatedRoute,
    private ConfigureService: ConfigureService,
    private cdr: ChangeDetectorRef,
    private ReservationsService: ReservationsService,
    private CompaniesWalletService: CompaniesWalletService,
    public dialogService: DialogService,
    private ToastrService: ToastrService,
    private fb: FormBuilder
  ) {
    debugger;
    // let vendorId = this.route.snapshot.paramMap.get('id');
    // if (vendorId) this.getVendorById(vendorId);
  }

  checkInVendorSector() {
    if (!this.isVendor()) {
      // Admin: show all sector tabs
      this.isTravelVendor = true;
      this.isRoomlVendor = true;
      this.isOutingVendor = true;
      this.isManasikVendor = true;
    } else {
      // Vendor: read from token
      this.isTravelVendor = this.ConfigureService.parsedUser.isTravelCommission;
      this.isRoomlVendor = this.ConfigureService.parsedUser.isHotelCommission;
      this.isOutingVendor = this.ConfigureService.parsedUser.isOutingCommission;
      this.isManasikVendor = this.ConfigureService.parsedUser.isManasikCommission;
    }
    this.cdr.detectChanges();
  }

  ngOnInit() {
    debugger;
    let vendorId = this.route.snapshot.paramMap.get('id');
    this.vendorId = this.route.snapshot.paramMap.get('id');
    this.createvendorSectorStatisticsForm();
    if (vendorId) this.getVendorById(vendorId);
    if (this.CompanyId) {
      this.getVendorById(this.CompanyId);
      this.getVendorStatistics(this.CompanyId);
    } else if (this.CompanyId == null) {
      this.getVendorStatistics(this.CompanyId);
    }
    this.checkInVendorSector();
    // this.getVendorReservationsData(this.filter);
    this.onSubmitvendorSectorStatisticsForm();
  }

  getVendorById(vendorId) {
    this.vendorService.getVendorById(vendorId).subscribe(
      (response) => {
        if (response.success) {
          this.VendorData = response.data;
          if (response.data.logoUrl) {
            this.imgUrl = this.baseUrl + response.data.logoUrl;
          }
          //عشان أعدل على القيم دى فى حالة الفيندور ديتال وأنا أدمن مجبهاش من اللوكال زى ما بتيجى
          this.isRoomlVendor = this.VendorData.isHotelCommission;
          this.isTravelVendor = this.VendorData.isTravelCommission;
          this.isOutingVendor = this.VendorData.isOutCommission;
          this.isManasikVendor = this.VendorData.isHajjCommission;
          // inject companyId in filters
          this.roomFilter = { ...this.roomFilter, CompanyId: this.VendorData.id };
          this.travelFilter = { ...this.travelFilter, CompanyId: this.VendorData.id };
          this.outingFilter = { ...this.outingFilter, CompanyId: this.VendorData.id };

          // fetch lists (if flags are true for travel/room). Outings are vendor-related so fetch as well.
          if (this.isRoomlVendor) this.getRoomReservationForVendor();
          if (this.isTravelVendor) this.getTravelReservationForVendor();
          if (this.isOutingVendor) this.getOutingReservationForVendor();
          if (this.isManasikVendor) this.getManasikReservationForVendor();
          // always attempt fetching outings for the vendor (server will return empty if none)
          this.getOutingReservationForVendor();

          console.log('VendorId:', this.VendorData.id);
        }
      },
      (error) => {}
    );
  }

  getVendorStatistics(companyId) {
    this.vendorService.getVendorStatistics(companyId).subscribe(
      (response) => {
        if (response.success) {
          this.VendorStatistics = response.data;
        }
      },
      (error) => {}
    );
  }
  createvendorSectorStatisticsForm() {
    const today = new Date();
    if (this.vendorId) {
      return (this.vendorSectorStatisticsForm = this.fb.group({
        companyId: [this.vendorId, Validators.required],
        from: [today, Validators.required],
        to: [today, Validators.required]
      }));
    } else {
      return (this.vendorSectorStatisticsForm = this.fb.group({
        from: [today, Validators.required],
        to: [today, Validators.required]
      }));
    }
  }
  getVendorTravelStatistics(data) {
    this.vendorService.getVendorTravelStatistics(data).subscribe(
      (response) => {
        if (response.success) {
          this.VendorTravelStatistics = response.data;
        }
      },
      (error) => {}
    );
  }
  getVendorRoomStatistics(data) {
    this.vendorService.getVendorRoomStatistics(data).subscribe(
      (response) => {
        if (response.success) {
          this.VendorRoomStatistics = response.data;
        }
      },
      (error) => {}
    );
  }
  getVendorOutingStatistics(data) {
    this.vendorService.getVendorOutingStatistics(data).subscribe(
      (response) => {
        if (response.success) {
          this.VendorOutingStatistics = response.data;
        }
      },
      (error) => {}
    );
  }
  getVendorHajjStatistics(data) {
    this.vendorService.getVendorHajjStatistics(data).subscribe(
      (response) => {
        if (response.success) {
          this.VendorHajjStatistics = response.data;
        }
      },
      (error) => {}
    );
  }
  onSubmitvendorSectorStatisticsForm() {
    if (this.vendorSectorStatisticsForm.invalid) {
      debugger;
      this.vendorSectorStatisticsForm.markAllAsTouched();
      this.showNoDataMessage = true; // نفعّل الرسالة
      return;
    }

    this.showNoDataMessage = false; // نخفي الرسالة لو الفورم صالح

    const formData = this.vendorSectorStatisticsForm.value;
    this.getVendorTravelStatistics(formData);
    this.getVendorRoomStatistics(formData);
    this.getVendorOutingStatistics(formData);
    this.getVendorHajjStatistics(formData);
  }

  travelFilter = {
    pageIndex: 1,
    pageSize: this.rows,
    search: '',
    CompanyId: null
  };

  roomFilter = {
    pageIndex: 1,
    pageSize: this.rows,
    search: '',
    CompanyId: null
  };

  outingFilter = {
    pageIndex: 1,
    pageSize: this.rows,
    search: '',
    CompanyId: null
  };

  manasikFilter = {
    pageIndex: 1,
    pageSize: this.rows,
    search: '',
    CompanyId: null
  };

  getVendorReservationsData(filter: any, type: 'room' | 'travel' | 'outing' | 'manasik') {
    if (type === 'room') {
      this.roomFilter = { ...this.roomFilter, ...filter };
      this.getRoomReservationForVendor();
      return;
    }

    if (type === 'travel') {
      this.travelFilter = { ...this.travelFilter, ...filter };
      this.getTravelReservationForVendor();
      return;
    }

    if (type === 'outing') {
      this.outingFilter = { ...this.outingFilter, ...filter };
      this.getOutingReservationForVendor();
      return;
    }
    if (type === 'manasik') {
      this.manasikFilter = { ...this.manasikFilter, ...filter };
      this.getManasikReservationForVendor();
      return;
    }
  }

  getRoomReservationForVendor() {
    this.ReservationsService.getRoomReservationForVendor(this.roomFilter).subscribe({
      next: (res) => {
        this.roomsList = res.data.data;
        this.totalRecorsOfRooms = res.data.itemsCount;
      }
    });
  }
  getTravelReservationForVendor() {
    this.ReservationsService.getTravelReservationForVendor(this.travelFilter).subscribe({
      next: (res) => {
        this.travelList = res.data.data;
        this.totalRecorsOfTravel = res.data.itemsCount;

        console.log('............................2', res);
      }
    });
  }

  getOutingReservationForVendor() {
    this.ReservationsService.getOutingReservationForVendor(this.outingFilter).subscribe({
      next: (res) => {
        // API returns paging wrapper similar to other reservation endpoints
        // assign results to outingsList and totalRecorsOfOutings
        this.outingsList = res.data.data ?? res.data ?? [];
        this.totalRecorsOfOutings = res.data?.itemsCount ?? (Array.isArray(res.data) ? res.data.length : 0);
      },
      error: (err) => {
        console.error('Error fetching outing reservations for vendor:', err);
        this.outingsList = [];
        this.totalRecorsOfOutings = 0;
      }
    });
  }
  getManasikReservationForVendor() {
    this.ReservationsService.getManasikReservationForVendor(this.manasikFilter).subscribe({
      next: (res) => {
        this.manasikList = res.data.data;
        this.totalRecorsOfManasik = res.data.itemsCount;
      }
    });
  }

  openPaymentsForm() {
    this.CompaniesWalletService.CallculateSattlements(this.selectedItems).subscribe({
      next: (res) => {
        const paymentsCalc = res.data;
        console.log('pays...................', paymentsCalc);

        this.ref = this.dialogService.open(PaymentsForVendorFormComponent, {
          header: 'Payments for Vendor',
          data: {
            vendorId: this.VendorData.id,
            calcData: paymentsCalc
          }
        });

        this.ref.onClose.subscribe({
          next: (res) => {
            this.travelsBookingsInfo.restSelected();
            this.roomsBookingsInfo.restSelected();
            this.selectedItems = [];
            this.paymentsListComp.getPaymentsForVendor();
            this.getRoomReservationForVendor();
            this.getTravelReservationForVendor();
            this.getOutingReservationForVendor();
          }
        });
      },
      error: (err) => {
        console.error('Error calculating settlements:', err);
      }
    });
  }
}

```

---

## `src/app/demo/pages/settings/vendors/vendors-list/product.service.ts`

```ts
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
    getProductsData() {
        return [
            {
                id: '1000',
                code: 'f230fh0g3',
                name: 'Bamboo Watch',
                description: 'Product Description',
                image: 'bamboo-watch.jpg',
                price: 65,
                category: 'Accessories',
                quantity: 24,
                inventoryStatus: 'INSTOCK',
                rating: 5
            },
            {
                id: '1001',
                code: 'nvklal433',
                name: 'Black Watch',
                description: 'Product Description',
                image: 'black-watch.jpg',
                price: 72,
                category: 'Accessories',
                quantity: 61,
                inventoryStatus: 'OUTOFSTOCK',
                rating: 4
            },
            {
                id: '1002',
                code: 'zz21cz3c1',
                name: 'Blue Band',
                description: 'Product Description',
                image: 'blue-band.jpg',
                price: 79,
                category: 'Fitness',
                quantity: 2,
                inventoryStatus: 'LOWSTOCK',
                rating: 3
            },
            {
                id: '1003',
                code: '244wgerg2',
                name: 'Blue T-Shirt',
                description: 'Product Description',
                image: 'blue-t-shirt.jpg',
                price: 29,
                category: 'Clothing',
                quantity: 25,
                inventoryStatus: 'INSTOCK',
                rating: 5
            },
            {
                id: '1004',
                code: 'h456wer53',
                name: 'Bracelet',
                description: 'Product Description',
                image: 'bracelet.jpg',
                price: 15,
                category: 'Accessories',
                quantity: 73,
                inventoryStatus: 'INSTOCK',
                rating: 4
            },
            {
                id: '1005',
                code: 'av2231fwg',
                name: 'Brown Purse',
                description: 'Product Description',
                image: 'brown-purse.jpg',
                price: 120,
                category: 'Accessories',
                quantity: 0,
                inventoryStatus: 'OUTOFSTOCK',
                rating: 4
            },
            {
                id: '1006',
                code: 'bib36pfvm',
                name: 'Chakra Bracelet',
                description: 'Product Description',
                image: 'chakra-bracelet.jpg',
                price: 32,
                category: 'Accessories',
                quantity: 5,
                inventoryStatus: 'LOWSTOCK',
                rating: 3
            },
            {
                id: '1007',
                code: 'mbvjkgip5',
                name: 'Galaxy Earrings',
                description: 'Product Description',
                image: 'galaxy-earrings.jpg',
                price: 34,
                category: 'Accessories',
                quantity: 23,
                inventoryStatus: 'INSTOCK',
                rating: 5
            },
            {
                id: '1008',
                code: 'vbb124btr',
                name: 'Game Controller',
                description: 'Product Description',
                image: 'game-controller.jpg',
                price: 99,
                category: 'Electronics',
                quantity: 2,
                inventoryStatus: 'LOWSTOCK',
                rating: 4
            },
            {
                id: '1009',
                code: 'cm230f032',
                name: 'Gaming Set',
                description: 'Product Description',
                image: 'gaming-set.jpg',
                price: 299,
                category: 'Electronics',
                quantity: 63,
                inventoryStatus: 'INSTOCK',
                rating: 3
            },
            {
                id: '1010',
                code: 'plb34234v',
                name: 'Gold Phone Case',
                description: 'Product Description',
                image: 'gold-phone-case.jpg',
                price: 24,
                category: 'Accessories',
                quantity: 0,
                inventoryStatus: 'OUTOFSTOCK',
                rating: 4
            },
            {
                id: '1011',
                code: '4920nnc2d',
                name: 'Green Earbuds',
                description: 'Product Description',
                image: 'green-earbuds.jpg',
                price: 89,
                category: 'Electronics',
                quantity: 23,
                inventoryStatus: 'INSTOCK',
                rating: 4
            },
            {
                id: '1012',
                code: '250vm23cc',
                name: 'Green T-Shirt',
                description: 'Product Description',
                image: 'green-t-shirt.jpg',
                price: 49,
                category: 'Clothing',
                quantity: 74,
                inventoryStatus: 'INSTOCK',
                rating: 5
            },
            {
                id: '1013',
                code: 'fldsmn31b',
                name: 'Grey T-Shirt',
                description: 'Product Description',
                image: 'grey-t-shirt.jpg',
                price: 48,
                category: 'Clothing',
                quantity: 0,
                inventoryStatus: 'OUTOFSTOCK',
                rating: 3
            },
            {
                id: '1014',
                code: 'waas1x2as',
                name: 'Headphones',
                description: 'Product Description',
                image: 'headphones.jpg',
                price: 175,
                category: 'Electronics',
                quantity: 8,
                inventoryStatus: 'LOWSTOCK',
                rating: 5
            },
            {
                id: '1015',
                code: 'vb34btbg5',
                name: 'Light Green T-Shirt',
                description: 'Product Description',
                image: 'light-green-t-shirt.jpg',
                price: 49,
                category: 'Clothing',
                quantity: 34,
                inventoryStatus: 'INSTOCK',
                rating: 4
            },
            {
                id: '1016',
                code: 'k8l6j58jl',
                name: 'Lime Band',
                description: 'Product Description',
                image: 'lime-band.jpg',
                price: 79,
                category: 'Fitness',
                quantity: 12,
                inventoryStatus: 'INSTOCK',
                rating: 3
            },
            {
                id: '1017',
                code: 'v435nn85n',
                name: 'Mini Speakers',
                description: 'Product Description',
                image: 'mini-speakers.jpg',
                price: 85,
                category: 'Clothing',
                quantity: 42,
                inventoryStatus: 'INSTOCK',
                rating: 4
            },
            {
                id: '1018',
                code: '09zx9c0zc',
                name: 'Painted Phone Case',
                description: 'Product Description',
                image: 'painted-phone-case.jpg',
                price: 56,
                category: 'Accessories',
                quantity: 41,
                inventoryStatus: 'INSTOCK',
                rating: 5
            },
            {
                id: '1019',
                code: 'mnb5mb2m5',
                name: 'Pink Band',
                description: 'Product Description',
                image: 'pink-band.jpg',
                price: 79,
                category: 'Fitness',
                quantity: 63,
                inventoryStatus: 'INSTOCK',
                rating: 4
            },
            {
                id: '1020',
                code: 'r23fwf2w3',
                name: 'Pink Purse',
                description: 'Product Description',
                image: 'pink-purse.jpg',
                price: 110,
                category: 'Accessories',
                quantity: 0,
                inventoryStatus: 'OUTOFSTOCK',
                rating: 4
            },
            {
                id: '1021',
                code: 'pxpzczo23',
                name: 'Purple Band',
                description: 'Product Description',
                image: 'purple-band.jpg',
                price: 79,
                category: 'Fitness',
                quantity: 6,
                inventoryStatus: 'LOWSTOCK',
                rating: 3
            },
            {
                id: '1022',
                code: '2c42cb5cb',
                name: 'Purple Gemstone Necklace',
                description: 'Product Description',
                image: 'purple-gemstone-necklace.jpg',
                price: 45,
                category: 'Accessories',
                quantity: 62,
                inventoryStatus: 'INSTOCK',
                rating: 4
            },
            {
                id: '1023',
                code: '5k43kkk23',
                name: 'Purple T-Shirt',
                description: 'Product Description',
                image: 'purple-t-shirt.jpg',
                price: 49,
                category: 'Clothing',
                quantity: 2,
                inventoryStatus: 'LOWSTOCK',
                rating: 5
            },
            {
                id: '1024',
                code: 'lm2tny2k4',
                name: 'Shoes',
                description: 'Product Description',
                image: 'shoes.jpg',
                price: 64,
                category: 'Clothing',
                quantity: 0,
                inventoryStatus: 'INSTOCK',
                rating: 4
            },
            {
                id: '1025',
                code: 'nbm5mv45n',
                name: 'Sneakers',
                description: 'Product Description',
                image: 'sneakers.jpg',
                price: 78,
                category: 'Clothing',
                quantity: 52,
                inventoryStatus: 'INSTOCK',
                rating: 4
            },
            {
                id: '1026',
                code: 'zx23zc42c',
                name: 'Teal T-Shirt',
                description: 'Product Description',
                image: 'teal-t-shirt.jpg',
                price: 49,
                category: 'Clothing',
                quantity: 3,
                inventoryStatus: 'LOWSTOCK',
                rating: 3
            },
            {
                id: '1027',
                code: 'acvx872gc',
                name: 'Yellow Earbuds',
                description: 'Product Description',
                image: 'yellow-earbuds.jpg',
                price: 89,
                category: 'Electronics',
                quantity: 35,
                inventoryStatus: 'INSTOCK',
                rating: 3
            },
            {
                id: '1028',
                code: 'tx125ck42',
                name: 'Yoga Mat',
                description: 'Product Description',
                image: 'yoga-mat.jpg',
                price: 20,
                category: 'Fitness',
                quantity: 15,
                inventoryStatus: 'INSTOCK',
                rating: 5
            },
            {
                id: '1029',
                code: 'gwuby345v',
                name: 'Yoga Set',
                description: 'Product Description',
                image: 'yoga-set.jpg',
                price: 20,
                category: 'Fitness',
                quantity: 25,
                inventoryStatus: 'INSTOCK',
                rating: 8
            }
        ];
    }

    getProductsWithOrdersData() {
        return [
            {
                id: '1000',
                code: 'f230fh0g3',
                name: 'Bamboo Watch',
                description: 'Product Description',
                image: 'bamboo-watch.jpg',
                price: 65,
                category: 'Accessories',
                quantity: 24,
                inventoryStatus: 'INSTOCK',
                rating: 5,
                orders: [
                    {
                        id: '1000-0',
                        productCode: 'f230fh0g3',
                        date: '2020-09-13',
                        amount: 65,
                        quantity: 1,
                        customer: 'David James',
                        status: 'PENDING'
                    },
                    {
                        id: '1000-1',
                        productCode: 'f230fh0g3',
                        date: '2020-05-14',
                        amount: 130,
                        quantity: 2,
                        customer: 'Leon Rodrigues',
                        status: 'DELIVERED'
                    },
                    {
                        id: '1000-2',
                        productCode: 'f230fh0g3',
                        date: '2019-01-04',
                        amount: 65,
                        quantity: 1,
                        customer: 'Juan Alejandro',
                        status: 'RETURNED'
                    },
                    {
                        id: '1000-3',
                        productCode: 'f230fh0g3',
                        date: '2020-09-13',
                        amount: 195,
                        quantity: 3,
                        customer: 'Claire Morrow',
                        status: 'CANCELLED'
                    }
                ]
            },
            {
                id: '1001',
                code: 'nvklal433',
                name: 'Black Watch',
                description: 'Product Description',
                image: 'black-watch.jpg',
                price: 72,
                category: 'Accessories',
                quantity: 61,
                inventoryStatus: 'INSTOCK',
                rating: 4,
                orders: [
                    {
                        id: '1001-0',
                        productCode: 'nvklal433',
                        date: '2020-05-14',
                        amount: 72,
                        quantity: 1,
                        customer: 'Maisha Jefferson',
                        status: 'DELIVERED'
                    },
                    {
                        id: '1001-1',
                        productCode: 'nvklal433',
                        date: '2020-02-28',
                        amount: 144,
                        quantity: 2,
                        customer: 'Octavia Murillo',
                        status: 'PENDING'
                    }
                ]
            },
            {
                id: '1002',
                code: 'zz21cz3c1',
                name: 'Blue Band',
                description: 'Product Description',
                image: 'blue-band.jpg',
                price: 79,
                category: 'Fitness',
                quantity: 2,
                inventoryStatus: 'LOWSTOCK',
                rating: 3,
                orders: [
                    {
                        id: '1002-0',
                        productCode: 'zz21cz3c1',
                        date: '2020-07-05',
                        amount: 79,
                        quantity: 1,
                        customer: 'Stacey Leja',
                        status: 'DELIVERED'
                    },
                    {
                        id: '1002-1',
                        productCode: 'zz21cz3c1',
                        date: '2020-02-06',
                        amount: 79,
                        quantity: 1,
                        customer: 'Ashley Wickens',
                        status: 'DELIVERED'
                    }
                ]
            },
            {
                id: '1003',
                code: '244wgerg2',
                name: 'Blue T-Shirt',
                description: 'Product Description',
                image: 'blue-t-shirt.jpg',
                price: 29,
                category: 'Clothing',
                quantity: 25,
                inventoryStatus: 'INSTOCK',
                rating: 5,
                orders: []
            },
            {
                id: '1004',
                code: 'h456wer53',
                name: 'Bracelet',
                description: 'Product Description',
                image: 'bracelet.jpg',
                price: 15,
                category: 'Accessories',
                quantity: 73,
                inventoryStatus: 'INSTOCK',
                rating: 4,
                orders: [
                    {
                        id: '1004-0',
                        productCode: 'h456wer53',
                        date: '2020-09-05',
                        amount: 60,
                        quantity: 4,
                        customer: 'Mayumi Misaki',
                        status: 'PENDING'
                    },
                    {
                        id: '1004-1',
                        productCode: 'h456wer53',
                        date: '2019-04-16',
                        amount: 2,
                        quantity: 30,
                        customer: 'Francesco Salvatore',
                        status: 'DELIVERED'
                    }
                ]
            },
            {
                id: '1005',
                code: 'av2231fwg',
                name: 'Brown Purse',
                description: 'Product Description',
                image: 'brown-purse.jpg',
                price: 120,
                category: 'Accessories',
                quantity: 0,
                inventoryStatus: 'OUTOFSTOCK',
                rating: 4,
                orders: [
                    {
                        id: '1005-0',
                        productCode: 'av2231fwg',
                        date: '2020-01-25',
                        amount: 120,
                        quantity: 1,
                        customer: 'Isabel Sinclair',
                        status: 'RETURNED'
                    },
                    {
                        id: '1005-1',
                        productCode: 'av2231fwg',
                        date: '2019-03-12',
                        amount: 240,
                        quantity: 2,
                        customer: 'Lionel Clifford',
                        status: 'DELIVERED'
                    },
                    {
                        id: '1005-2',
                        productCode: 'av2231fwg',
                        date: '2019-05-05',
                        amount: 120,
                        quantity: 1,
                        customer: 'Cody Chavez',
                        status: 'DELIVERED'
                    }
                ]
            },
            {
                id: '1006',
                code: 'bib36pfvm',
                name: 'Chakra Bracelet',
                description: 'Product Description',
                image: 'chakra-bracelet.jpg',
                price: 32,
                category: 'Accessories',
                quantity: 5,
                inventoryStatus: 'LOWSTOCK',
                rating: 3,
                orders: [
                    {
                        id: '1006-0',
                        productCode: 'bib36pfvm',
                        date: '2020-02-24',
                        amount: 32,
                        quantity: 1,
                        customer: 'Arvin Darci',
                        status: 'DELIVERED'
                    },
                    {
                        id: '1006-1',
                        productCode: 'bib36pfvm',
                        date: '2020-01-14',
                        amount: 64,
                        quantity: 2,
                        customer: 'Izzy Jones',
                        status: 'PENDING'
                    }
                ]
            },
            {
                id: '1007',
                code: 'mbvjkgip5',
                name: 'Galaxy Earrings',
                description: 'Product Description',
                image: 'galaxy-earrings.jpg',
                price: 34,
                category: 'Accessories',
                quantity: 23,
                inventoryStatus: 'INSTOCK',
                rating: 5,
                orders: [
                    {
                        id: '1007-0',
                        productCode: 'mbvjkgip5',
                        date: '2020-06-19',
                        amount: 34,
                        quantity: 1,
                        customer: 'Jennifer Smith',
                        status: 'DELIVERED'
                    }
                ]
            },
            {
                id: '1008',
                code: 'vbb124btr',
                name: 'Game Controller',
                description: 'Product Description',
                image: 'game-controller.jpg',
                price: 99,
                category: 'Electronics',
                quantity: 2,
                inventoryStatus: 'LOWSTOCK',
                rating: 4,
                orders: [
                    {
                        id: '1008-0',
                        productCode: 'vbb124btr',
                        date: '2020-01-05',
                        amount: 99,
                        quantity: 1,
                        customer: 'Jeanfrancois David',
                        status: 'DELIVERED'
                    },
                    {
                        id: '1008-1',
                        productCode: 'vbb124btr',
                        date: '2020-01-19',
                        amount: 198,
                        quantity: 2,
                        customer: 'Ivar Greenwood',
                        status: 'RETURNED'
                    }
                ]
            },
            {
                id: '1009',
                code: 'cm230f032',
                name: 'Gaming Set',
                description: 'Product Description',
                image: 'gaming-set.jpg',
                price: 299,
                category: 'Electronics',
                quantity: 63,
                inventoryStatus: 'INSTOCK',
                rating: 3,
                orders: [
                    {
                        id: '1009-0',
                        productCode: 'cm230f032',
                        date: '2020-06-24',
                        amount: 299,
                        quantity: 1,
                        customer: 'Kadeem Mujtaba',
                        status: 'PENDING'
                    },
                    {
                        id: '1009-1',
                        productCode: 'cm230f032',
                        date: '2020-05-11',
                        amount: 299,
                        quantity: 1,
                        customer: 'Ashley Wickens',
                        status: 'DELIVERED'
                    },
                    {
                        id: '1009-2',
                        productCode: 'cm230f032',
                        date: '2019-02-07',
                        amount: 299,
                        quantity: 1,
                        customer: 'Julie Johnson',
                        status: 'DELIVERED'
                    },
                    {
                        id: '1009-3',
                        productCode: 'cm230f032',
                        date: '2020-04-26',
                        amount: 299,
                        quantity: 1,
                        customer: 'Tony Costa',
                        status: 'CANCELLED'
                    }
                ]
            },
            {
                id: '1010',
                code: 'plb34234v',
                name: 'Gold Phone Case',
                description: 'Product Description',
                image: 'gold-phone-case.jpg',
                price: 24,
                category: 'Accessories',
                quantity: 0,
                inventoryStatus: 'OUTOFSTOCK',
                rating: 4,
                orders: [
                    {
                        id: '1010-0',
                        productCode: 'plb34234v',
                        date: '2020-02-04',
                        amount: 24,
                        quantity: 1,
                        customer: 'James Butt',
                        status: 'DELIVERED'
                    },
                    {
                        id: '1010-1',
                        productCode: 'plb34234v',
                        date: '2020-05-05',
                        amount: 48,
                        quantity: 2,
                        customer: 'Josephine Darakjy',
                        status: 'DELIVERED'
                    }
                ]
            },
            {
                id: '1011',
                code: '4920nnc2d',
                name: 'Green Earbuds',
                description: 'Product Description',
                image: 'green-earbuds.jpg',
                price: 89,
                category: 'Electronics',
                quantity: 23,
                inventoryStatus: 'INSTOCK',
                rating: 4,
                orders: [
                    {
                        id: '1011-0',
                        productCode: '4920nnc2d',
                        date: '2020-06-01',
                        amount: 89,
                        quantity: 1,
                        customer: 'Art Venere',
                        status: 'DELIVERED'
                    }
                ]
            },
            {
                id: '1012',
                code: '250vm23cc',
                name: 'Green T-Shirt',
                description: 'Product Description',
                image: 'green-t-shirt.jpg',
                price: 49,
                category: 'Clothing',
                quantity: 74,
                inventoryStatus: 'INSTOCK',
                rating: 5,
                orders: [
                    {
                        id: '1012-0',
                        productCode: '250vm23cc',
                        date: '2020-02-05',
                        amount: 49,
                        quantity: 1,
                        customer: 'Lenna Paprocki',
                        status: 'DELIVERED'
                    },
                    {
                        id: '1012-1',
                        productCode: '250vm23cc',
                        date: '2020-02-15',
                        amount: 49,
                        quantity: 1,
                        customer: 'Donette Foller',
                        status: 'PENDING'
                    }
                ]
            },
            {
                id: '1013',
                code: 'fldsmn31b',
                name: 'Grey T-Shirt',
                description: 'Product Description',
                image: 'grey-t-shirt.jpg',
                price: 48,
                category: 'Clothing',
                quantity: 0,
                inventoryStatus: 'OUTOFSTOCK',
                rating: 3,
                orders: [
                    {
                        id: '1013-0',
                        productCode: 'fldsmn31b',
                        date: '2020-04-01',
                        amount: 48,
                        quantity: 1,
                        customer: 'Simona Morasca',
                        status: 'DELIVERED'
                    }
                ]
            },
            {
                id: '1014',
                code: 'waas1x2as',
                name: 'Headphones',
                description: 'Product Description',
                image: 'headphones.jpg',
                price: 175,
                category: 'Electronics',
                quantity: 8,
                inventoryStatus: 'LOWSTOCK',
                rating: 5,
                orders: [
                    {
                        id: '1014-0',
                        productCode: 'waas1x2as',
                        date: '2020-05-15',
                        amount: 175,
                        quantity: 1,
                        customer: 'Lenna Paprocki',
                        status: 'DELIVERED'
                    },
                    {
                        id: '1014-1',
                        productCode: 'waas1x2as',
                        date: '2020-01-02',
                        amount: 175,
                        quantity: 1,
                        customer: 'Donette Foller',
                        status: 'CANCELLED'
                    }
                ]
            },
            {
                id: '1015',
                code: 'vb34btbg5',
                name: 'Light Green T-Shirt',
                description: 'Product Description',
                image: 'light-green-t-shirt.jpg',
                price: 49,
                category: 'Clothing',
                quantity: 34,
                inventoryStatus: 'INSTOCK',
                rating: 4,
                orders: [
                    {
                        id: '1015-0',
                        productCode: 'vb34btbg5',
                        date: '2020-07-02',
                        amount: 98,
                        quantity: 2,
                        customer: 'Mitsue Tollner',
                        status: 'DELIVERED'
                    }
                ]
            },
            {
                id: '1016',
                code: 'k8l6j58jl',
                name: 'Lime Band',
                description: 'Product Description',
                image: 'lime-band.jpg',
                price: 79,
                category: 'Fitness',
                quantity: 12,
                inventoryStatus: 'INSTOCK',
                rating: 3,
                orders: []
            },
            {
                id: '1017',
                code: 'v435nn85n',
                name: 'Mini Speakers',
                description: 'Product Description',
                image: 'mini-speakers.jpg',
                price: 85,
                category: 'Clothing',
                quantity: 42,
                inventoryStatus: 'INSTOCK',
                rating: 4,
                orders: [
                    {
                        id: '1017-0',
                        productCode: 'v435nn85n',
                        date: '2020-07-12',
                        amount: 85,
                        quantity: 1,
                        customer: 'Minna Amigon',
                        status: 'DELIVERED'
                    }
                ]
            },
            {
                id: '1018',
                code: '09zx9c0zc',
                name: 'Painted Phone Case',
                description: 'Product Description',
                image: 'painted-phone-case.jpg',
                price: 56,
                category: 'Accessories',
                quantity: 41,
                inventoryStatus: 'INSTOCK',
                rating: 5,
                orders: [
                    {
                        id: '1018-0',
                        productCode: '09zx9c0zc',
                        date: '2020-07-01',
                        amount: 56,
                        quantity: 1,
                        customer: 'Abel Maclead',
                        status: 'DELIVERED'
                    },
                    {
                        id: '1018-1',
                        productCode: '09zx9c0zc',
                        date: '2020-05-02',
                        amount: 56,
                        quantity: 1,
                        customer: 'Minna Amigon',
                        status: 'RETURNED'
                    }
                ]
            },
            {
                id: '1019',
                code: 'mnb5mb2m5',
                name: 'Pink Band',
                description: 'Product Description',
                image: 'pink-band.jpg',
                price: 79,
                category: 'Fitness',
                quantity: 63,
                inventoryStatus: 'INSTOCK',
                rating: 4,
                orders: []
            },
            {
                id: '1020',
                code: 'r23fwf2w3',
                name: 'Pink Purse',
                description: 'Product Description',
                image: 'pink-purse.jpg',
                price: 110,
                category: 'Accessories',
                quantity: 0,
                inventoryStatus: 'OUTOFSTOCK',
                rating: 4,
                orders: [
                    {
                        id: '1020-0',
                        productCode: 'r23fwf2w3',
                        date: '2020-05-29',
                        amount: 110,
                        quantity: 1,
                        customer: 'Kiley Caldarera',
                        status: 'DELIVERED'
                    },
                    {
                        id: '1020-1',
                        productCode: 'r23fwf2w3',
                        date: '2020-02-11',
                        amount: 220,
                        quantity: 2,
                        customer: 'Graciela Ruta',
                        status: 'DELIVERED'
                    }
                ]
            },
            {
                id: '1021',
                code: 'pxpzczo23',
                name: 'Purple Band',
                description: 'Product Description',
                image: 'purple-band.jpg',
                price: 79,
                category: 'Fitness',
                quantity: 6,
                inventoryStatus: 'LOWSTOCK',
                rating: 3,
                orders: [
                    {
                        id: '1021-0',
                        productCode: 'pxpzczo23',
                        date: '2020-02-02',
                        amount: 79,
                        quantity: 1,
                        customer: 'Cammy Albares',
                        status: 'DELIVERED'
                    }
                ]
            },
            {
                id: '1022',
                code: '2c42cb5cb',
                name: 'Purple Gemstone Necklace',
                description: 'Product Description',
                image: 'purple-gemstone-necklace.jpg',
                price: 45,
                category: 'Accessories',
                quantity: 62,
                inventoryStatus: 'INSTOCK',
                rating: 4,
                orders: [
                    {
                        id: '1022-0',
                        productCode: '2c42cb5cb',
                        date: '2020-06-29',
                        amount: 45,
                        quantity: 1,
                        customer: 'Mattie Poquette',
                        status: 'DELIVERED'
                    },
                    {
                        id: '1022-1',
                        productCode: '2c42cb5cb',
                        date: '2020-02-11',
                        amount: 135,
                        quantity: 3,
                        customer: 'Meaghan Garufi',
                        status: 'DELIVERED'
                    }
                ]
            },
            {
                id: '1023',
                code: '5k43kkk23',
                name: 'Purple T-Shirt',
                description: 'Product Description',
                image: 'purple-t-shirt.jpg',
                price: 49,
                category: 'Clothing',
                quantity: 2,
                inventoryStatus: 'LOWSTOCK',
                rating: 5,
                orders: [
                    {
                        id: '1023-0',
                        productCode: '5k43kkk23',
                        date: '2020-04-15',
                        amount: 49,
                        quantity: 1,
                        customer: 'Gladys Rim',
                        status: 'RETURNED'
                    }
                ]
            },
            {
                id: '1024',
                code: 'lm2tny2k4',
                name: 'Shoes',
                description: 'Product Description',
                image: 'shoes.jpg',
                price: 64,
                category: 'Clothing',
                quantity: 0,
                inventoryStatus: 'INSTOCK',
                rating: 4,
                orders: []
            },
            {
                id: '1025',
                code: 'nbm5mv45n',
                name: 'Sneakers',
                description: 'Product Description',
                image: 'sneakers.jpg',
                price: 78,
                category: 'Clothing',
                quantity: 52,
                inventoryStatus: 'INSTOCK',
                rating: 4,
                orders: [
                    {
                        id: '1025-0',
                        productCode: 'nbm5mv45n',
                        date: '2020-02-19',
                        amount: 78,
                        quantity: 1,
                        customer: 'Yuki Whobrey',
                        status: 'DELIVERED'
                    },
                    {
                        id: '1025-1',
                        productCode: 'nbm5mv45n',
                        date: '2020-05-21',
                        amount: 78,
                        quantity: 1,
                        customer: 'Fletcher Flosi',
                        status: 'PENDING'
                    }
                ]
            },
            {
                id: '1026',
                code: 'zx23zc42c',
                name: 'Teal T-Shirt',
                description: 'Product Description',
                image: 'teal-t-shirt.jpg',
                price: 49,
                category: 'Clothing',
                quantity: 3,
                inventoryStatus: 'LOWSTOCK',
                rating: 3,
                orders: [
                    {
                        id: '1026-0',
                        productCode: 'zx23zc42c',
                        date: '2020-04-24',
                        amount: 98,
                        quantity: 2,
                        customer: 'Bette Nicka',
                        status: 'DELIVERED'
                    }
                ]
            },
            {
                id: '1027',
                code: 'acvx872gc',
                name: 'Yellow Earbuds',
                description: 'Product Description',
                image: 'yellow-earbuds.jpg',
                price: 89,
                category: 'Electronics',
                quantity: 35,
                inventoryStatus: 'INSTOCK',
                rating: 3,
                orders: [
                    {
                        id: '1027-0',
                        productCode: 'acvx872gc',
                        date: '2020-01-29',
                        amount: 89,
                        quantity: 1,
                        customer: 'Veronika Inouye',
                        status: 'DELIVERED'
                    },
                    {
                        id: '1027-1',
                        productCode: 'acvx872gc',
                        date: '2020-06-11',
                        amount: 89,
                        quantity: 1,
                        customer: 'Willard Kolmetz',
                        status: 'DELIVERED'
                    }
                ]
            },
            {
                id: '1028',
                code: 'tx125ck42',
                name: 'Yoga Mat',
                description: 'Product Description',
                image: 'yoga-mat.jpg',
                price: 20,
                category: 'Fitness',
                quantity: 15,
                inventoryStatus: 'INSTOCK',
                rating: 5,
                orders: []
            },
            {
                id: '1029',
                code: 'gwuby345v',
                name: 'Yoga Set',
                description: 'Product Description',
                image: 'yoga-set.jpg',
                price: 20,
                category: 'Fitness',
                quantity: 25,
                inventoryStatus: 'INSTOCK',
                rating: 8,
                orders: [
                    {
                        id: '1029-0',
                        productCode: 'gwuby345v',
                        date: '2020-02-14',
                        amount: 4,
                        quantity: 80,
                        customer: 'Maryann Royster',
                        status: 'DELIVERED'
                    }
                ]
            }
        ];
    }

    getProductsMini() {
        return Promise.resolve(this.getProductsData().slice(0, 5));
    }

    getProductsSmall() {
        return Promise.resolve(this.getProductsData().slice(0, 10));
    }

    getProducts() {
        return Promise.resolve(this.getProductsData());
    }

    getProductsWithOrdersSmall() {
        return Promise.resolve(this.getProductsWithOrdersData().slice(0, 10));
    }

    getProductsWithOrders() {
        return Promise.resolve(this.getProductsWithOrdersData());
    }
};

```

---

## `src/app/demo/pages/settings/vendors/vendors-list/vendors-list.component.html`

```html
<div class="card">
  <p-toolbar styleClass="mb-4">
    <ng-template pTemplate="left">
      <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <input pInputText type="text" [(ngModel)]="searchedWord" (input)="onSearch()" [placeholder]="'search' | translate" />
      </span>
    </ng-template>
  </p-toolbar>

  <p-table
    #dt
    [value]="vendors"
    [rows]="10"
    [paginator]="true"
    [rowsPerPageOptions]="[10, 25, 50]"
    [loading]="isLoading"
    [lazy]="true"
    [totalRecords]="totalRecords"
    (onLazyLoad)="loadVendors($event)"
    dataKey="id"
    [showCurrentPageReport]="true"
    [currentPageReportTemplate]="'showingEntries' | translate"
    responsiveLayout="scroll"
  >
    <ng-template pTemplate="header">
      <tr>
        <th pSortableColumn="Name">
          {{ 'vendorName' | translate }}
          <p-sortIcon field="Name"></p-sortIcon>
        </th>
        <th pSortableColumn="Email">
          {{ 'email' | translate }}
          <p-sortIcon field="Email"></p-sortIcon>
        </th>
        <th pSortableColumn="Phone">
          {{ 'phone' | translate }}
          <p-sortIcon field="Phone"></p-sortIcon>
        </th>
        <th pSortableColumn="IsBlocked">
          {{ 'status' | translate }}
          <p-sortIcon field="IsBlocked"></p-sortIcon>
        </th>
        <th>{{ 'action' | translate }}</th>
      </tr>
      <tr>
        <th>
          <p-columnFilter
            type="text"
            field="Name"
            display="row"
            [showMenu]="false"
            [placeholder]="'Search by Name' | translate"
          ></p-columnFilter>
        </th>
        <th>
          <p-columnFilter
            type="text"
            field="Email"
            display="row"
            [showMenu]="false"
            [placeholder]="'Search by Email' | translate"
          ></p-columnFilter>
        </th>
        <th>
          <p-columnFilter
            type="text"
            field="Phone"
            display="row"
            [showMenu]="false"
            [placeholder]="'Search by Phone' | translate"
          ></p-columnFilter>
        </th>
        <th></th>
        <th></th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-vendor>
      <tr>
        <td>{{ vendor.name }}</td>
        <td>{{ vendor.email }}</td>
        <td>{{ vendor.phone }}</td>
        <td>
          <p-inputSwitch [(ngModel)]="vendor.isBlocked" (onChange)="toggleVendorStatus(vendor.id)"></p-inputSwitch>
        </td>
        <td>
          <div class="flex gap-2">
            <button
              pButton
              icon="pi pi-eye"
              class="p-button-rounded p-button-info p-button-text"
              (click)="view(vendor.id)"
              [pTooltip]="'viewDetails' | translate"
              tooltipPosition="top"
            ></button>
            <button
              pButton
              icon="pi pi-pencil"
              class="p-button-rounded p-button-success p-button-text"
              (click)="update(vendor.id)"
              [pTooltip]="'update' | translate"
              tooltipPosition="top"
            ></button>
            <button
              pButton
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger p-button-text"
              (click)="delete(vendor.id)"
              [pTooltip]="'delete' | translate"
              tooltipPosition="top"
            ></button>
          </div>
        </td>
      </tr>
    </ng-template>

    <ng-template pTemplate="emptymessage">
      <tr>
        <td colspan="5">
          <div class="flex flex-column align-items-center justify-content-center py-5">
            <i class="pi pi-inbox text-500 text-5xl mb-3"></i>
            <span class="text-700 font-medium text-lg">{{ 'No vendors found' | translate }}</span>
          </div>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>

<p-confirmDialog></p-confirmDialog>
<p-toast></p-toast>

```

---

## `src/app/demo/pages/settings/vendors/vendors-list/vendors-list.component.scss`

```scss
// :host ::ng-deep {
//   .custom-toggle {
//       .p-inputswitch-slider {
//           background: #e0e0e0;
//           transition: all 0.3s ease;

//           &::before {
//               background: #ffffff;
//               box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//           }
//       }

//       &.p-inputswitch-checked .p-inputswitch-slider {
//           background: #4CAF50;
//       }

//       .slider-icon {
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           height: 100%;

//           i {
//               color: white;
//               font-size: 0.75rem;
//               margin-left: 0.5rem;
//               margin-right: 0.5rem;
//           }
//       }
//   }

//   .status-label {
//       font-weight: 500;
//       color: #4a4a4a;
//       min-width: 80px;
//   }
// }

// :host ::ng-deep .p-dialog .product-image {
//   width: 150px;
//   margin: 0 auto 2rem auto;
//   display: block;}
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

## `src/app/demo/pages/settings/vendors/vendors-list/vendors-list.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorsListComponent } from './vendors-list.component';

describe('VendorsListComponent', () => {
  let component: VendorsListComponent;
  let fixture: ComponentFixture<VendorsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/vendors/vendors-list/vendors-list.component.ts`

```ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { Vendor } from 'src/app/shared/model/vendoreDto';
import { VendorService } from 'src/app/shared/services/vendor.service';
import { TranslateService } from '@ngx-translate/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ToastrService } from 'ngx-toastr';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';

@Component({
  selector: 'app-vendors-list',
  standalone: true,
  imports: [SharedModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './vendors-list.component.html',
  styleUrl: './vendors-list.component.scss'
})
export class VendorsListComponent {
  @ViewChild('dt') dt!: Table;
  vendors: Vendor[] = [];
  searchedWord: string = '';
  totalRecords: number = 0;
  isLoading: boolean = false;
  lang: string = 'en';

  constructor(
    private vendorService: VendorService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private translate: TranslateService,
    private ToastrService: ToastrService
  ) {
    this.translate.onLangChange.subscribe((event) => {
      this.lang = event.lang;
    });
  }

  loadVendors(event: TableLazyLoadEvent): void {
    this.isLoading = true;
    const payload = TableRequestBuilder.build(event, this.searchedWord);

    this.vendorService.getAllVendors(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.vendors = res.data.data;
          this.totalRecords = res.data.itemsCount;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching vendors:', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.dt.reset();
  }

  view(selectedId: string) {
    this.router.navigate(['/vendor-details', selectedId]);
  }

  update(selectedId: string) {
    this.router.navigate(['/vendors-add-edit'], {
      queryParams: { id: selectedId, mode: 'edit' }
    });
  }

  delete(selectedId: string) {
    this.confirmationService.confirm({
      message: this.translate.instant('deleteVendorConfirmation'),
      header: this.translate.instant('confirmation'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.deleteVendor(selectedId);
      },
      reject: () => {}
    });
  }

  deleteVendor(vendorId: any) {
    this.vendorService.deleteVendor(vendorId).subscribe(
      (res) => {
        this.ToastrService.success(this.translate.instant('vendor Deleted Successfully'));
        this.dt.reset();
      },
      (error) => {
        console.error('Error deleting vendor:', error);
        this.ToastrService.error(this.translate.instant('Failed to Delete vendor'));
      }
    );
  }

  toggleVendorStatus(vendorId: number) {
    this.vendorService.toggleVendorStatus(vendorId).subscribe({
      next: (res) => {
        this.ToastrService.success(this.translate.instant('Vendor status updated successfully'));
      },
      error: (err) => {
        console.error('Error toggling vendor status:', err);
        this.ToastrService.error(this.translate.instant('Failed to update vendor status'));
        this.dt.reset();
      }
    });
  }
}

```

---

## `src/app/demo/pages/settings/vendors/vendors.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'vendors' | translate"
    [actionButtons]="[{ label: 'Add', action: 'add', icon: 'pi pi-plus', class: 'btn-primary' }]"
    (actionClicked)="handleAction($event)"
  ></sub-header>

  <app-vendors-list></app-vendors-list>
</div>

```

---

## `src/app/demo/pages/settings/vendors/vendors.component.scss`

```scss


```

---

## `src/app/demo/pages/settings/vendors/vendors.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorsComponent } from './vendors.component';

describe('VendorsComponent', () => {
  let component: VendorsComponent;
  let fixture: ComponentFixture<VendorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/settings/vendors/vendors.component.ts`

```ts
import { Component, EventEmitter, inject } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { Router } from '@angular/router';
import { VendorsListComponent } from './vendors-list/vendors-list.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [SubHeaderComponent, VendorsListComponent, SharedModule],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.scss'
})
export class VendorsComponent {
  router = inject(Router);

  handleAction(event: { action: string }) {
    switch (event.action) {
      case 'add':
        this.goToVendorForm();
        break;
    }
  }

  goToVendorForm() {
    console.log('goToVendorForm');
    this.router.navigate(['vendors-add-edit']);
  }
}

```

---

## `src/app/demo/pages/transactions/charge-transactions/charge-transactions.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'Charge Transactions' | translate"
    [mainSection]="'Transactions' | translate"
    [subSection]="'Charge Transactions' | translate"
  ></sub-header>

  <div class="card">
    <p-toolbar styleClass="">
      <ng-template pTemplate="left">
        <span class="p-input-icon-left">
          <input
            pInputText
            type="text"
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
            [placeholder]="'search' | translate"
          />
        </span>
      </ng-template>
    </p-toolbar>

    <p-table
      #dt
      [value]="transactions"
      [paginator]="true"
      [rows]="rows"
      [first]="first"
      [lazy]="true"
      [loading]="isLoading"
      [totalRecords]="totalRecords"
      [showCurrentPageReport]="true"
      [tableStyle]="{ 'min-width': '50rem' }"
      (onPage)="onPageChange($event)"
      [currentPageReportTemplate]="'showingEntries' | translate"
      [rowsPerPageOptions]="[10, 25, 50]"
    >
      <ng-template pTemplate="header">
        <tr>
          <th>{{ 'ID' | translate }}</th>
          <th>{{ 'User ID' | translate }}</th>
          <th>{{ 'Reference' | translate }}</th>
          <th>{{ 'Status' | translate }}</th>
          <th>{{ 'Amount to Pay' | translate }}</th>
          <th>{{ 'Client Payed' | translate }}</th>
          <th>{{ 'Total Tax' | translate }}</th>
          <th>{{ 'Opay Value' | translate }}</th>
          <th>{{ 'Opay Rate' | translate }}</th>
          <th>{{ 'Trips Operation Expense' | translate }}</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-transaction>
        <tr>
          <td>{{ transaction.id }}</td>
          <td>
            <span 
              class="text-primary fw-bold cursor-pointer text-decoration-underline"
              (click)="navigateToCustomer(transaction.userId)"
              role="button"
              [title]="'View customer details' | translate">
              {{ transaction.userId }}
            </span>
          </td>
          <td>
            <span class="font-monospace">{{ transaction.reference }}</span>
          </td>
          <td>
            <span class="badge" [ngClass]="getStatusBadgeClass(transaction.sataus)">
              {{ getStatusText(transaction.sataus) | translate }}
            </span>
          </td>
          <td>
            <span class="fw-bold text-primary">
              {{ transaction.amountToPay | currency: 'EGP' }}
            </span>
          </td>
          <td>
            <span class="fw-bold" [ngClass]="{
              'text-success': transaction.clientPayed >= transaction.amountToPay,
              'text-warning': transaction.clientPayed < transaction.amountToPay && transaction.clientPayed > 0,
              'text-danger': transaction.clientPayed === 0
            }">
              {{ transaction.clientPayed | currency: 'EGP' }}
            </span>
          </td>
          <td>{{ transaction.totalTax | currency: 'EGP' }}</td>
          <td>{{ transaction.opayValue | currency: 'EGP' }}</td>
          <td>
            <span class="text-muted">
              {{ transaction.opayRate }}% 
              <small>({{ transaction.opayRateAmount | currency: 'EGP' }})</small>
            </span>
          </td>
          <td>
            <span class="text-muted">
              {{ transaction.tripsOperationExpenseRate }}% 
              <small>({{ transaction.tripsOperationExpenseRateAmount | currency: 'EGP' }})</small>
            </span>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="9" class="text-center">{{ 'No charge transactions found' | translate }}</td>
        </tr>
      </ng-template>
    </p-table>
  </div>
</div>

```

---

## `src/app/demo/pages/transactions/charge-transactions/charge-transactions.component.scss`

```scss

```

---

## `src/app/demo/pages/transactions/charge-transactions/charge-transactions.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeTransactionsComponent } from './charge-transactions.component';

describe('ChargeTransactionsComponent', () => {
  let component: ChargeTransactionsComponent;
  let fixture: ComponentFixture<ChargeTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargeTransactionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChargeTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/transactions/charge-transactions/charge-transactions.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SubHeaderComponent } from "src/app/shared/components/sub-header/sub-header.component";
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TransactionsService } from 'src/app/shared/services/transactions.service';
import { ChargeTransaction, ChargeTransactionResponse } from 'src/app/shared/model/icharge-transaction';
import { FilterMap } from 'src/app/shared/mapping/filterMap';

@Component({
  selector: 'app-charge-transactions',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule],
  templateUrl: './charge-transactions.component.html',
  styleUrl: './charge-transactions.component.scss'
})
export class ChargeTransactionsComponent implements OnInit {
  transactions: ChargeTransaction[] = [];
  first = 0;
  rows = 25;
  totalRecords = 0;
  searchTerm: string = '';
  isLoading = false;

  constructor(
    private transactionsService: TransactionsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getChargeTransactions();
  }

  getChargeTransactions() {
    this.isLoading = true;
    const filterMap: FilterMap = {
      pageIndex: this.first / this.rows + 1,
      pageSize: this.rows,
      search: this.searchTerm
    };

    this.transactionsService.getWalletChargeTransaction(filterMap).subscribe({
      next: (res: ChargeTransactionResponse) => {
        this.transactions = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching charge transactions:', err);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.getChargeTransactions();
  }

  onSearch() {
    this.first = 0;
    this.getChargeTransactions();
  }

  navigateToCustomer(id: number) {
    if (id) {
      this.router.navigate(['/customer-details', id]);
    }
  }

  getStatusBadgeClass(status: number): string {
    switch(status) {
      case 1: return 'bg-danger';      // Cancelled
      case 2: return 'bg-warning';     // Pending
      case 3: return 'bg-success';     // Success
      default: return 'bg-secondary';
    }
  }

  getStatusText(status: number): string {
    switch(status) {
      case 1: return 'Cancelled';
      case 2: return 'Pending';
      case 3: return 'Success';
      default: return 'Unknown';
    }
  }
}

```

---

## `src/app/demo/pages/transactions/transactions.component.html`

```html
<p>transactions works!</p>

```

---

## `src/app/demo/pages/transactions/transactions.component.scss`

```scss

```

---

## `src/app/demo/pages/transactions/transactions.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsComponent } from './transactions.component';

describe('TransactionsComponent', () => {
  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/transactions/transactions.component.ts`

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent {

}

```

---

## `src/app/demo/pages/transactions/wallet-transactions/wallet-transactions.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'Wallet Transactions' | translate"
    [mainSection]="'Transactions' | translate"
    [subSection]="'Wallet Transactions' | translate"
  ></sub-header>

  <div class="card">
    <p-toolbar styleClass="">
      <ng-template pTemplate="left">
        <span class="p-input-icon-left">
          <input
            pInputText
            type="text"
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
            [placeholder]="'search' | translate"
          />
        </span>
      </ng-template>
    </p-toolbar>

    <p-table
      #dt
      [value]="transactions"
      [paginator]="true"
      [rows]="rows"
      [first]="first"
      [lazy]="true"
      [loading]="isLoading"
      [totalRecords]="totalRecords"
      [showCurrentPageReport]="true"
      [tableStyle]="{ 'min-width': '50rem' }"
      (onPage)="onPageChange($event)"
      [currentPageReportTemplate]="'showingEntries' | translate"
      [rowsPerPageOptions]="[10, 25, 50]"
    >
      <ng-template pTemplate="header">
        <tr>
          <th>{{ 'ID' | translate }}</th>
          <th>{{ 'Transaction Type' | translate }}</th>
          <th>{{ 'Amount In' | translate }}</th>
          <th>{{ 'Amount Out' | translate }}</th>
          <th>{{ 'Balance After' | translate }}</th>
          <th>{{ 'Transaction Date' | translate }}</th>
          <th>{{ 'Booking Reference' | translate }}</th>
          <th>{{ 'Charge Reference' | translate }}</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-transaction>
        <tr>
          <td>{{ transaction.id }}</td>
          <td>
            <span class="badge" [ngClass]="{
              'bg-success': transaction.amountIn > 0,
              'bg-danger': transaction.amountOut > 0
            }">
              {{ transaction.transactionTypeName }}
            </span>
          </td>
          <td>
            <span *ngIf="transaction.amountIn > 0" class="text-success fw-bold">
              +{{ transaction.amountIn | currency: 'EGP' }}
            </span>
            <span *ngIf="transaction.amountIn === 0">-</span>
          </td>
          <td>
            <span *ngIf="transaction.amountOut > 0" class="text-danger fw-bold">
              -{{ transaction.amountOut | currency: 'EGP' }}
            </span>
            <span *ngIf="transaction.amountOut === 0">-</span>
          </td>
          <td>
            <span class="fw-bold">
              {{ transaction.balanceAfterTransaction | currency: 'EGP' }}
            </span>
          </td>
          <td>{{ transaction.transactionDate | date: 'short' }}</td>
          <td>
            <span 
              *ngIf="transaction.bookingRefernce; else noBookingRef" 
              class="text-primary fw-bold cursor-pointer text-decoration-underline"
              (click)="navigateToPaymentInfo(transaction.bookingRefernce)"
              role="button"
              [title]="'View payment details' | translate">
              {{ transaction.bookingRefernce }}
            </span>
            <ng-template #noBookingRef>-</ng-template>
          </td>
          <td>{{ transaction.chargeRefernce || '-' }}</td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="8" class="text-center">{{ 'No transactions found' | translate }}</td>
        </tr>
      </ng-template>
    </p-table>
  </div>
</div>
```

---

## `src/app/demo/pages/transactions/wallet-transactions/wallet-transactions.component.scss`

```scss
.cursor-pointer {
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
}

```

---

## `src/app/demo/pages/transactions/wallet-transactions/wallet-transactions.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletTransactionsComponent } from './wallet-transactions.component';

describe('WalletTransactionsComponent', () => {
  let component: WalletTransactionsComponent;
  let fixture: ComponentFixture<WalletTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalletTransactionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WalletTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/transactions/wallet-transactions/wallet-transactions.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { SubHeaderComponent } from "src/app/shared/components/sub-header/sub-header.component";
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TransactionsService } from 'src/app/shared/services/transactions.service';
import { Transaction, TransactionResponse } from 'src/app/shared/model/itransaction';
import { FilterMap } from 'src/app/shared/mapping/filterMap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wallet-transactions',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule],
  templateUrl: './wallet-transactions.component.html',
  styleUrl: './wallet-transactions.component.scss'
})
export class WalletTransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  first = 0;
  rows = 25;
  totalRecords = 0;
  searchTerm: string = '';
  isLoading = false;

  constructor(
    private transactionsService: TransactionsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getTransactions();
  }

  getTransactions() {
    this.isLoading = true;
    const filterMap: FilterMap = {
      pageIndex: this.first / this.rows + 1,
      pageSize: this.rows,
      search: this.searchTerm
    };

    this.transactionsService.getTransactions(filterMap).subscribe({
      next: (res: TransactionResponse) => {
        this.transactions = res.data.data;
        this.totalRecords = res.data.itemsCount;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching transactions:', err);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.getTransactions();
  }

  onSearch() {
    this.first = 0;
    this.getTransactions();
  }

  navigateToPaymentInfo(bookingReference: string | undefined) {
    if (bookingReference) {
      this.router.navigate(['/payment-info-ref', bookingReference]);
    }
  }
}


```

---

## `src/app/demo/pages/travels/travel-details/travel-details.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="'travel Details' | translate"
    [mainSection]="'travel Management' | translate"
    [subSection]="'Details' | translate"
  ></sub-header>
  <div class="border-1 border-solid surface-border border-round mb-4 p-4 shadow-3">
    <div class="grid">
      <div class="col-12 col-md-6">
        <p-galleria
          [value]="imgs"
          [autoPlay]="true"
          [circular]="true"
          [showItemNavigators]="true"
          [thumbnailsPosition]="'bottom'"
          [responsiveOptions]="responsiveOptions"
          [containerStyle]="{ 'max-width': '100%' }"
          [numVisible]="4"
        >
          <ng-template pTemplate="item" let-item>
            <img [src]="item" class="w-full h-20rem border-round" style="object-fit: cover; margin-bottom: 10px" />
          </ng-template>
          <ng-template pTemplate="thumbnail" let-item>
            <div class="grid grid-nogutter justify-content-center">
              <img [src]="item" class="w-7rem h-5rem border-round" style="object-fit: cover" />
            </div>
          </ng-template>
        </p-galleria>
      </div>

      <div class="col-12 col-md-6 pl-4">
        <h2 class="text-3xl mb-2">{{ data.name }}</h2>
        <div class="medium text-body-secondary mb-1">
          <i class="fas fa-map-marker-alt me-1"></i>
          {{ data.city?.name }}, {{ data.country?.name || 'N/A' }}
        </div>
        <div class="flex align-items-center gap-3 mb-4">
          <p-rating [(ngModel)]="data.rating" [readonly]="true" [cancel]="false"></p-rating>
          <span class="text-muted text-lg">({{ data.rating }} / 5)</span>
        </div>

        <!-- <div class="text-muted mb-3 line-height-3">
          <div *ngFor="let desc of data.descriptions">
            {{ desc.description }}
          </div>
        </div> -->

        <p class="text-muted mb-2">
          <i class="fa-solid fa-map-location-dot mr-2"></i>
          {{ 'Address' | translate }}: {{ data.address }}
        </p>

        <p class="text-muted mb-2">
          <i class="fas fa-calendar-alt mr-2"></i>
          {{ 'Trip Duration' | translate }}: {{ data.numberOfDays }} days
        </p>

        <p class="text-muted mb-2">
          <i class="fas fa-calendar-day mr-2"></i>
          {{ 'Start Date' | translate }}: {{ data.startDate | date }}
        </p>

        <p class="text-muted mb-2">
          <i class="fas fa-calendar-day mr-2"></i>
          {{ 'End Date' | translate }}: {{ data.endDate | date }}
        </p>

        <p class="text-muted mb-2">
          <i class="fas fa-users mr-2"></i>
          {{ 'Capacity' | translate }}: {{ data.capacity }} ({{ data.remainingSeats }} remaining)
        </p>

        <p class="text-muted mb-2">
          <i class="fas fa-location-arrow mr-2"></i>
          {{ 'From' | translate }}: {{ data.fromLocation }}
        </p>

        <p class="text-muted mb-2">
          <i class="fas fa-map-pin mr-2"></i>
          {{ 'To' | translate }}: {{ data.toLocation }}
        </p>

        <p class="text-muted mb-2">
          <i class="fas fa-tag mr-2"></i>
          {{ 'Price' | translate }}: {{ data.price }}
        </p>
      </div>
    </div>
  </div>
  <div class="shadow-3 bg-light p-3 border-round mt-4">
    <h3 class="text-xl mb-3">{{ 'programs' | translate }}</h3>
    <p-timeline [value]="programs" layout="vertical" align="right" class="customized-timeline">
      <ng-template pTemplate="content" let-program>
        <div [attr.dir]="currentLang === 'ar' ? 'rtl' : 'ltr'" class="p-3 border-1 surface-border surface-card border-round shadow-1">
          <h4 class="text-primary mb-1">{{ program.typeObj.nameEn }} ({{ program.typeObj.nameAr }})</h4>
          <p class="mb-1">
            <strong>{{ 'Title' | translate }}:</strong>
            {{ program.title }}
          </p>
          <p class="mb-1">
            <strong>{{ 'Details' | translate }}:</strong>
            {{ program.details }}
          </p>
          <!-- <p class="mb-1">
            <i class="fas fa-location-arrow mr-1"></i>
            {{ 'From' | translate }}: {{ program.fromLocation }}
          </p>
          <p class="mb-1">
            <i class="fas fa-map-pin mr-1"></i>
            {{ 'To' | translate }}: {{ program.toLocation }}
          </p>
          <p class="mb-1">
            <i class="fas fa-calendar-alt mr-1"></i>
            {{ 'Start Date' | translate }}: {{ program.fromTime | date: 'short' }}
          </p>
          <p class="mb-1">
            <i class="fas fa-calendar-check mr-1"></i>
            {{ 'End Date' | translate }}: {{ program.toTime | date: 'short' }}
          </p> -->
          <p class="mb-1">
            <i class="fas fa-calendar-alt mr-1"></i>
            {{ 'time' | translate }}: {{ program.time | date: 'short' }}
          </p>
          <div *ngIf="program.stepDescriptions?.length">
            <strong class="block mb-1">{{ 'Steps' | translate }}:</strong>
            <ul class="ml-3">
              <li *ngFor="let step of program.stepDescriptions">
                {{ step.description }}
              </li>
            </ul>
          </div>
        </div>
      </ng-template>

      <ng-template pTemplate="opposite" let-program>
        <small class="text-muted">
          {{ program.time | date: 'mediumDate' }}
        </small>
      </ng-template>
    </p-timeline>
  </div>
</div>

```

---

## `src/app/demo/pages/travels/travel-details/travel-details.component.scss`

```scss
::ng-deep .customized-timeline .p-timeline-event-content {
  padding: 1rem 0.5rem;
}

```

---

## `src/app/demo/pages/travels/travel-details/travel-details.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelDetailsComponent } from './travel-details.component';

describe('TravelDetailsComponent', () => {
  let component: TravelDetailsComponent;
  let fixture: ComponentFixture<TravelDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

## `src/app/demo/pages/travels/travel-details/travel-details.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { SubHeaderComponent } from '../../../../shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TravelTripsService } from 'src/app/shared/services/travel-trips.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-travel-details',
  standalone: true,
  imports: [SubHeaderComponent, SharedModule],
  templateUrl: './travel-details.component.html',
  styleUrl: './travel-details.component.scss'
})
export class TravelDetailsComponent implements OnInit {
  data: any;
  programs: any;
  travelId: number = null;
  currentLang = this.translateService.currentLang;
  paseurl = environment.imgUrl;

  imgs = [];

  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];
  constructor(
    private TravelTripsService: TravelTripsService,
    private ActivatedRoute: ActivatedRoute,
    private translateService: TranslateService
  ) {}
  ngOnInit(): void {
    this.ActivatedRoute.params.subscribe((params) => {
      this.travelId = params['id'];
      this.getTravelDetails();
      this.getPrograms();
    });
  }
  getTravelDetails() {
    this.TravelTripsService.getTravelById(this.travelId).subscribe((res: any) => {
      this.data = res.data;
      this.imgs = res.data.images.map((img) => this.paseurl + img.imageUrl);
      console.log('.............--------------------.............----....--..-.-.-.-', this.imgs);
    });
  }
  getPrograms() {
    this.TravelTripsService.getProgramStepsByTripId(this.travelId).subscribe((res: any) => {
      this.programs = res.data;
      console.log(this.programs);
    });
  }
}

```

---

## `src/app/demo/pages/travels/travels-form/travels-form.component.html`

```html
<div class="main">
  <sub-header
    [mainHeader]="travelId ? ('Edit travel' | translate) : ('Add travel' | translate)"
    [mainSection]="'travels' | translate"
    [subSection]="travelId ? ('Edit' | translate) : ('Add' | translate)"
  ></sub-header>
  <div class="product-form shadow-3 p-4">
    <p-stepper [linear]="travelId ? false : true">
      <p-stepperPanel [header]="'Travel Information' | translate">
        <ng-template pTemplate="content" let-nextCallback="nextCallback" let-index="index">
          <form class="form-field" [formGroup]="travelForm">
            <div class="formgrid grid">
              <div class="field col-12 col-md-12">
                <label>{{ 'Travel Type' | translate }}</label>

                <div class="formgrid flex flex-wrap gap-3 p-3 border-1 border-solid surface-border border-round">
                  <p-radioButton
                    [value]="false"
                    inputId="internal"
                    formControlName="IsExternallTrip"
                    (onChange)="onTravelTypeChange(false)"
                  ></p-radioButton>

                  <label for="internal" class="mx-2">{{ 'Internal' | translate }}</label>
                  <p-radioButton
                    [value]="true"
                    inputId="external"
                    formControlName="IsExternallTrip"
                    (onChange)="onTravelTypeChange(true)"
                  ></p-radioButton>
                  <label for="external" class="mx-2">{{ 'External' | translate }}</label>
                </div>
              </div>
              <div class="field col-12 col-md-4" *ngIf="travelForm.get('IsExternallTrip').value">
                <label for="type">
                  {{ 'Country' | translate }}
                </label>
                <p-dropdown
                  id="type"
                  [options]="countryList"
                  formControlName="CountryId"
                  (onFilter)="filterCountry($event)"
                  (onChange)="getCitiesByCountryId($event.value)"
                  filter="true"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="{{ '-- Select --' | translate }}"
                  [showClear]="true"
                  class="w-full"
                ></p-dropdown>
              </div>
              <div class="field col-12 col-md-4">
                <label for="type">
                  {{ 'City' | translate }}
                </label>
                <p-dropdown
                  id="type"
                  [options]="cityList"
                  filter="true"
                  formControlName="CityId"
                  placeholder="{{ '-- Select --' | translate }}"
                  [showClear]="true"
                  class="w-full"
                ></p-dropdown>
                <small class="p-error" *ngIf="shouldShowError('CityId')">
                  {{ 'This field is required' | translate }}
                </small>
              </div>

              <div class="field col-12 col-md-4">
                <label for="type">
                  {{ 'Location From' | translate }}
                </label>
                <input type="text" pInputText formControlName="FromLocation" [placeholder]="'From' | translate" />
                <small class="p-error" *ngIf="shouldShowError('FromLocation')">
                  {{ 'This field is required' | translate }}
                </small>
              </div>
              <div class="field col-12 col-md-4">
                <label for="type">
                  {{ 'Location To' | translate }}
                </label>
                <input type="text" pInputText formControlName="ToLocation" [placeholder]="'To' | translate" />
                <small class="p-error" *ngIf="shouldShowError('ToLocation')">
                  {{ 'This field is required' | translate }}
                </small>
              </div>
              <div class="field col-4">
                <label for="type">
                  {{ 'Gathering Point Address' | translate }}
                </label>
                <input type="text" pInputText formControlName="Address" />
                <small class="p-error" *ngIf="shouldShowError('Address')">
                  {{ 'This field is required' | translate }}
                </small>
              </div>
              <div class="field col-4">
                <label for="type">
                  {{ 'External Link' | translate }}
                </label>
                <input type="text" pInputText formControlName="ExternalLink" />
                <small class="p-error" *ngIf="shouldShowError('Address')">
                  {{ 'This field is required' | translate }}
                </small>
              </div>

              <!-- Travel Section -->
              <div class="form-field mt-5">
                <div class="formgrid col-md-12 mb-3 flex flex-wrap gap-3 p-3 border-1 border-solid surface-border border-round">
                  <div class="flex align-items-center gap-2">
                    <p-inputSwitch formControlName="IsRecommended" />
                  </div>
                  <label for="internal" class="mx-2">{{ 'is recomended' | translate }}</label>
                  <div class="flex align-items-center gap-2">
                    <p-inputSwitch formControlName="IsFake" />
                  </div>
                  <label for="internal" class="mx-2">{{ 'Is Fake' | translate }}</label>
                  <!-- <div class="flex align-items-center gap-2">
                    <p-inputSwitch formControlName="IsBlocked" />
                  </div>
                  <label for="internal" class="mx-2">{{ 'Is Blocked' | translate }}</label> -->
                  <div class="flex align-items-center gap-2">
                    <p-inputSwitch formControlName="IsIncludeVat" />
                  </div>
                  <label for="internal" class="mx-2">{{ 'Is included vat' | translate }}</label>
                </div>
                <h3 class="flex justify-content-between align-items-center">
                  {{ 'Travel Information' | translate }}

                  <!-- <div class="flex align-items-center gap-2">
                    <label class="font-normal text-sm m-0">
                      {{ 'is recomended' | translate }}
                    </label>
                    <p-inputSwitch formControlName="IsRecommended" />
                  </div> -->
                </h3>

                <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round">
                  <div class="field col-12 col-md-4">
                    <label for="type">
                      {{ 'Travel Name' | translate }}
                    </label>
                    <input type="text" pInputText formControlName="Name" />
                    <small class="p-error" *ngIf="shouldShowError('Name')">
                      {{ 'This field is required' | translate }}
                    </small>
                  </div>
                  <div class="field col-12 col-md-4">
                    <label for="hotelName">
                      {{ 'Days No.' | translate }}
                    </label>

                    <input
                      type="number"
                      pInputText
                      mode="decimal"
                      inputId="minmax-buttons"
                      id="hotelName"
                      formControlName="NumberOfDays"
                      [min]="1"
                    />
                    <small class="p-error" *ngIf="shouldShowError('NumberOfDays')">
                      {{ 'This field is required' | translate }}
                    </small>
                  </div>
                  <div class="field col-12 col-md-4">
                    <label for="hotelStars">{{ 'Star Rating' | translate }}</label>
                    <p-dropdown
                      id="hotelStars"
                      formControlName="Rating"
                      [options]="starRatings"
                      placeholder="{{ 'Select rating' | translate }}"
                      class="w-full"
                    ></p-dropdown>
                    <small class="p-error" *ngIf="shouldShowError('Rating')">
                      {{ 'This field is required' | translate }}
                    </small>
                  </div>
                  <div class="field col-12 col-md-3">
                    <label for="hotelName">
                      {{ 'Seats' | translate }}
                    </label>
                    <input type="number" pInputText mode="decimal" id="hotelName" formControlName="Capacity" [min]="1" />
                    <small class="p-error" *ngIf="shouldShowError('Capacity')">
                      {{ 'This field is required' | translate }}
                    </small>
                  </div>
                  <div class="field col-12 col-md-3">
                    <label for="hotelStars">
                      {{ 'price' | translate }}
                    </label>
                    <input
                      type="number"
                      pInputText
                      formControlName="Price"
                      buttonLayout="horizontal"
                      inputId="horizontal"
                      spinnerMode="horizontal"
                      decrementButtonClass="p-button-danger"
                      incrementButtonClass="p-button-success"
                      [min]="1"
                      locale="en-US"
                    />
                    <small class="p-error" *ngIf="shouldShowError('Price')">
                      {{ 'This field is required' | translate }}
                    </small>
                  </div>
                  <div class="field col-12 col-md-3">
                    <label for="hotelStars">
                      {{ 'child price' | translate }}
                    </label>
                    <input type="number" pInputText formControlName="ChildPrice" [min]="1" locale="en-US" />
                    <small class="p-error" *ngIf="shouldShowError('ChildPrice')">
                      {{ 'This field is required' | translate }}
                    </small>
                  </div>
                  <div class="field col-12 col-md-3">
                    <label for="price before">
                      {{ 'Price Before' | translate }}
                    </label>
                    <p-inputNumber type="number" formControlName="PriceBefore" [min]="0" locale="en-US" />
                  </div>
                  <!-- <div class="field col-12 col-md-2">
                    <label>{{ 'including vat' | translate }}</label>
                    <div>
                      <p-inputSwitch formControlName="IsIncludeVate"></p-inputSwitch>
                    </div>
                  </div> -->
                  <!-- Travel Type -->
                  <!-- Travel Type -->
                  <div class="field col-md-4" [ngClass]="{ 'col-6': mode === 'edit' }">
                    <label>{{ 'Travel Type' | translate }}</label>
                    <p-dropdown
                      formControlName="TripType"
                      [options]="tripTybe"
                      optionLabel="nameEn"
                      optionValue="value"
                      placeholder="{{ 'Select type' | translate }}"
                      class="w-full"
                      appendTo="body"
                    >
                      <ng-template let-option pTemplate="item">
                        <div
                          pTooltip="{{ getTooltipOfTripType(option.value) }}"
                          tooltipPosition="top"
                          appendTo="body"
                          tooltipZIndex="9999"
                          class="w-auto"
                          tooltipStyleClass="trip-tooltip"
                        >
                          {{ option.nameEn }}
                        </div>
                      </ng-template>
                    </p-dropdown>

                    <small class="p-error" *ngIf="shouldShowError('TripType')">
                      {{ 'This field is required' | translate }}
                    </small>
                  </div>

                  <!-- Add Date Button -->
                  <div
                    class="field col-12 col-md-4 flex align-items-end gap-2"
                    *ngIf="travelForm.get('TripType')?.value && mode !== 'edit'"
                  >
                    <button type="button" pButton icon="pi pi-plus" label="Add Date" (click)="addTripDate()" style="padding: 10px"></button>

                    <!-- Hint Text -->
                    <small class="form-text text-info mb-2" *ngIf="tripDatesArray.length === 0">
                      {{ 'You must add at least one period' | translate }}
                    </small>
                  </div>

                  <!-- Date Range Section -->
                  <div class="field col-12" *ngIf="travelForm.get('TripType')?.value">
                    <div formArrayName="TripDates" class="row g-3">
                      <ng-container *ngFor="let group of tripDatesArray.controls; let i = index">
                        <div [formGroupName]="i" class="col-12 col-md-4">
                          <!-- غلاف عمودي عشان الرسالة تبقى تحت الحقل -->
                          <div class="d-flex flex-column gap-2">
                            <div class="d-flex align-items-start gap-2">
                              <!-- Start Date -->
                              <div class="flex-grow-1">
                                <p-calendar
                                  formControlName="startDate"
                                  placeholder="{{ 'Start Date' | translate }}"
                                  [showIcon]="true"
                                  dateFormat="dd-mm-yy"
                                  [showTime]="false"
                                  [minDate]="today"
                                  [iconDisplay]="'input'"
                                  class="w-100"
                                  (onSelect)="onStartDateChange(group)"
                                ></p-calendar>
                                <small
                                  class="p-error d-block mt-1"
                                  *ngIf="group.get('startDate')?.invalid && group.get('startDate')?.touched"
                                >
                                  {{ 'This field is required' | translate }}
                                </small>
                              </div>

                              <!-- End Date -->
                              <div
                                class="flex-grow-1"
                                *ngIf="travelForm.get('TripType')?.value === 1 || travelForm.get('TripType')?.value === 2"
                              >
                                <p-calendar
                                  formControlName="endDate"
                                  placeholder="{{ 'End Date' | translate }}"
                                  [showIcon]="true"
                                  [hourFormat]="'24'"
                                  [iconDisplay]="'input'"
                                  dateFormat="dd-mm-yy"
                                  class="w-100"
                                  [minDate]="group.get('minEndDate')?.value || today"
                                  [maxDate]="group.get('maxEndDate')?.value"
                                ></p-calendar>
                                <small class="p-error d-block mt-1" *ngIf="group.get('endDate')?.invalid && group.get('endDate')?.touched">
                                  {{ 'This field is required' | translate }}
                                </small>
                              </div>

                              <!-- Delete -->
                              <button
                                *ngIf="mode !== 'edit'"
                                type="button"
                                pButton
                                icon="pi pi-trash"
                                [text]="true"
                                (click)="removeTripDate(i)"
                                class="p-button-danger"
                              ></button>
                            </div>
                          </div>
                        </div>
                      </ng-container>
                    </div>
                  </div>

                  <div class="field col-12">
                    <label for="hotelDescription">
                      {{ 'Instructions' | translate }}
                    </label>
                    <div formArrayName="Descriptions">
                      <div
                        class="mb-3 flex align-items-center gap-2"
                        *ngFor="let description of descriptions.controls; let i = index"
                        [formGroupName]="i"
                      >
                        <textarea formControlName="description" rows="2" style="width: 95%"></textarea>
                        <button
                          type="button"
                          pButton
                          type="button"
                          icon="pi pi-trash"
                          class="p-button-danger"
                          [text]="true"
                          (click)="removeDescription(i)"
                        ></button>
                      </div>
                      <p-button type="button" label="{{ 'Add ' | translate }}" icon="pi pi-plus" (onClick)="addDescription()"></p-button>
                    </div>
                    <small class="p-error" *ngIf="shouldShowError('Descriptions')">
                      {{ 'This field is required' | translate }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <!-- Policies Section -->
            <p-panel header="{{ 'policies' | translate }}" toggleable styleClass="custom-panel mt-3 col-12 w-full ">
              <!-- Refund Policy -->
              <h3 class="flex justify-content-between align-items-center">
                <span>{{ 'is refund enabled' | translate }}</span>
                <span><p-inputSwitch formControlName="IsRefundable" /></span>
              </h3>

              <div
                class="formgrid grid p-3 border-1 border-dashed surface-border border-round"
                *ngIf="travelForm.get('IsRefundable')?.value"
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

              <!-- Payment Policy -->
              <h3 class="flex justify-content-between align-items-center mt-4">
                <span>{{ 'Deposit Rate' | translate }}</span>
                <span><p-inputSwitch formControlName="IsAllowPaymentUponArrival" /></span>
              </h3>

              <div
                class="formgrid grid p-3 border-1 border-dashed surface-border border-round"
                *ngIf="travelForm.get('IsAllowPaymentUponArrival')?.value"
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
            <div class="form-field mt-5">
              <!-- Travel Gallery Section -->
              <h3 class="flex justify-content-between">
                {{ 'Travel Gallery' | translate }}
              </h3>

              <div class="formgrid grid p-3 border-1 border-dashed surface-border border-round mb-4">
                <div class="col-md-12 mb-3">
                  <app-img-uploader
                    [multiple]="true"
                    (filesChanged)="onLogoFileSelect($event)"
                    [displayFiles]="oldImages"
                    (removeImgFromDBWithId)="removeImageFromDB($event)"
                  ></app-img-uploader>
                  <!-- <div class="text-danger" *ngIf="showLogoMessage && submitted">{{'Room image is required.' | translate}}</div> -->
                </div>
                <div class="buttonsm col-md-12 mt-3 text-end">
                  <p-button
                    label="{{ 'Cancel' | translate }}"
                    class="mx-1"
                    severity="secondary"
                    type="button"
                    (click)="onCancel()"
                  ></p-button>

                  <p-button
                    label="{{ 'Next' | translate }}"
                    *ngIf="!travelId"
                    severity="success"
                    class="shadow"
                    type="button"
                    (click)="addTravel(nextCallback)"
                  ></p-button>
                  <p-button
                    label="{{ 'Update' | translate }}"
                    *ngIf="travelId"
                    severity="success"
                    class="shadow"
                    type="button"
                    (click)="updateTravel(nextCallback)"
                  ></p-button>
                  <p-button
                    label="{{ 'Next' | translate }}"
                    *ngIf="travelId"
                    severity="info"
                    class="shadow mx-1"
                    type="button"
                    (onClick)="nextCallback.emit()"
                  ></p-button>
                </div>
              </div>
            </div>
          </form>
        </ng-template>
      </p-stepperPanel>

      <p-stepperPanel [header]="'Programs' | translate">
        <ng-template pTemplate="content" let-nextCallback="nextCallback" let-prevCallback="prevCallback">
          <form [formGroup]="tripForm">
            <p-accordion [multiple]="true" formArrayName="steps">
              <p-accordionTab *ngFor="let step of steps.controls; let i = index" [formGroupName]="i">
                <ng-template pTemplate="header">
                  <div class="flex justify-content-between align-items-center w-full">
                    <span>{{ 'day' | translate }} {{ i + 1 }}</span>

                    <button
                      *ngIf="!step.get('id').value"
                      pButton
                      type="button"
                      icon="pi pi-trash"
                      class="p-button-rounded p-button-text p-button-danger"
                      (click)="removeStep(i, $event)"
                    ></button>
                    <button
                      *ngIf="step.get('id').value"
                      pButton
                      type="button"
                      icon="pi pi-trash"
                      class="p-button-rounded p-button-text p-button-danger"
                      (click)="removeStepDB(i, step.get('id').value, $event)"
                    ></button>
                  </div>
                </ng-template>

                <div class="formgrid grid">
                  <div class="field col-12 col-md-4">
                    <label>
                      {{ 'Type' | translate }}
                    </label>
                    <p-dropdown
                      id="type"
                      [options]="programTypeList"
                      formControlName="type"
                      placeholder="{{ '-- Select --' | translate }}"
                      [showClear]="true"
                      class="w-full"
                    ></p-dropdown>
                    <small class="p-error" *ngIf="isInvalid('type', i)">
                      {{ 'This field is required' | translate }}
                    </small>
                  </div>

                  <div class="field col-12 col-md-4">
                    <label>
                      {{ 'Title' | translate }}
                    </label>
                    <input pInputText formControlName="title" class="w-full" />
                    <small class="p-error" *ngIf="isInvalid('title', i)">
                      {{ 'This field is required' | translate }}
                    </small>
                  </div>
                  <div class="field col-12 col-md-4">
                    <label>
                      {{ 'Date' | translate }}
                    </label>
                    <p-calendar
                      [iconDisplay]="'input'"
                      formControlName="time"
                      [minDate]="today"
                      placeholder="Select a date"
                      [showIcon]="true"
                      class="w-full"
                    ></p-calendar>
                    <!-- <small class="p-error" *ngIf="isInvalid('time', i)">
                      {{ 'This field is required' | translate }}
                    </small> -->
                  </div>

                  <!-- <div class="field col-12 col-md-12">
                    <label>
                      {{ 'Details' | translate }}
                    </label>
                    <textarea pInputTextarea formControlName="details" rows="3" class="w-full"></textarea>
                    <small class="p-error" *ngIf="isInvalid('details', i)">
                      {{ 'This field is required' | translate }}
                    </small>
                  </div> -->

                  <!-- <div class="field col-12 col-md-6">
                    <label>
                      {{ 'Location From' | translate }}
                      
                    </label>
                    <input pInputText formControlName="fromLocation" class="w-full" />
                  </div>

                  <div class="field col-12 col-md-6">
                    <label>
                      {{ 'Location To' | translate }}
                      
                    </label>
                    <input pInputText formControlName="toLocation" class="w-full" />
                  </div>

                  <div class="field col-12 col-md-6">
                    <label>{{ 'Latitude' | translate }}</label>
                    <input pInputText formControlName="latitude" class="w-full" />
                  </div>

                  <div class="field col-12 col-md-6">
                    <label>{{ 'Longitude' | translate }}</label>
                    <input pInputText formControlName="longitude" class="w-full" />
                  </div> -->

                  <!-- <div class="field col-12 col-md-4">
                    <label>
                      {{ 'From' | translate }}
                    </label>
                    <p-calendar
                      formControlName="fromTime"
                      [showIcon]="true"
                      hourFormat="12"
                      [timeOnly]="true"
                      [iconDisplay]="'input'"
                      class="w-full"
                    >
                      <ng-template pTemplate="inputicon" let-clickCallBack="clickCallBack">
                        <i class="pi pi-clock pointer-events-none" (click)="clickCallBack($event)"></i>
                      </ng-template>
                    </p-calendar>
                  </div>

                  <div class="field col-12 col-md-4">
                    <label>
                      {{ 'To' | translate }}
                    </label>
                    <p-calendar
                      formControlName="toTime"
                      [showIcon]="true"
                      hourFormat="12"
                      [minDate]="tripForm.get('fromTime')?.value"
                      [timeOnly]="true"
                      [iconDisplay]="'input'"
                      class="w-full"
                    >
                      <ng-template pTemplate="inputicon" let-clickCallBack="clickCallBack">
                        <i class="pi pi-clock pointer-events-none" (click)="clickCallBack($event)"></i>
                      </ng-template>
                    </p-calendar>
                  </div> -->

                  <div class="field col-12">
                    <h3>{{ 'Program Instructions' | translate }}</h3>
                    <div formArrayName="stepDescriptions" class="p-3 border-1 border-dashed surface-border border-round mb-4">
                      <div *ngFor="let desc of getStepDescriptions(i).controls; let j = index" [formGroupName]="j" class="mb-3">
                        <div class="flex align-items-center">
                          <input pInputText formControlName="description" class="w-full" />
                          <button
                            type="button"
                            pButton
                            icon="pi pi-trash"
                            class="p-button-rounded p-button-danger p-button-text ml-2"
                            (click)="removeDescriptionStep(i, j)"
                          ></button>
                        </div>
                      </div>
                      <button
                        type="button"
                        pButton
                        label="{{ 'Add Description' | translate }}"
                        icon="pi pi-plus"
                        class="p-button-text mt-2"
                        (click)="addDescriptionStep(i)"
                      ></button>
                    </div>
                  </div>
                </div>
              </p-accordionTab>
            </p-accordion>

            <div class="mt-3">
              <button type="button" pButton label="Add Step" icon="pi pi-plus" (click)="addStep()"></button>
            </div>

            <div class="buttonsm col-md-12 mt-3 text-end">
              <p-button
                label="{{ 'Back' | translate }}"
                class="mx-1"
                severity="secondary"
                type="button"
                (onClick)="prevCallback.emit()"
              ></p-button>
              <p-button
                label="{{ 'Next' | translate }}"
                *ngIf="!travelId"
                severity="success"
                class="shadow"
                type="button"
                (click)="addProgramToTravel(nextCallback)"
              ></p-button>

              <p-button
                label="{{ 'Cancel' | translate }}"
                *ngIf="travelId"
                class="mx-1"
                severity="secondary"
                type="button"
                (click)="onCancel()"
              ></p-button>

              <p-button
                label="{{ 'Update' | translate }}"
                *ngIf="travelId"
                severity="success"
                class="shadow"
                type="button"
                (click)="updateProgramToTravel(nextCallback)"
              ></p-button>
            </div>
          </form>
        </ng-template>
      </p-stepperPanel>

      <!-- Step 3: Confirmation -->
      <p-stepperPanel [header]="'Finish' | translate">
        <ng-template pTemplate="content" let-prevCallback="prevCallback">
          <h3 class="my-5 text-center text-success" *ngIf="!travelId">
            <i class="pi pi-check-circle mx-2"></i>
            {{ 'Congratulation Your Travel Trip Created Successfully' | translate }}
          </h3>
          <h3 class="my-5 text-center text-success" *ngIf="travelId">
            <i class="pi pi-check-circle mx-2"></i>
            {{ 'Congratulation Your Travel Trip Updated Successfully' | translate }}
          </h3>

          <div class="buttonsm col-md-12 mt-3 text-end">
            <p-button
              label="{{ 'Finish' | translate }}"
              icon="pi pi-check"
              severity="success"
              class="shadow"
              type="button"
              (click)="onCancel()"
            ></p-button>
          </div>
        </ng-template>
      </p-stepperPanel>
    </p-stepper>
  </div>
</div>

```

---

## `src/app/demo/pages/travels/travels-form/travels-form.component.scss`

```scss
// .card {
//   max-width: 800px;
//   margin: 2rem auto;
//   padding: 2rem;
//   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
// }

h2 {
  margin-bottom: 2rem;
  color: var(--primary-color);
}

.field {
  margin-bottom: 1.5rem;
}

.p-calendar {
  width: 100%;
}

.p-error {
  color: #f44336;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.ng-invalid.ng-dirty {
  border-color: #f44336 !important;
}
.disabled-panel {
  pointer-events: none; /* Disable all interactions */
  opacity: 0.6; /* Make it look visually disabled */
  background-color: #f5f5f5; /* Optional: Add a light background color */
  border: 1px solid #ddd; /* Optional: Add a border to indicate it's disabled */
}

.rm-btn{position: absolute;
  right: -11px;
  top: 2px;
  font-weight: bold;}



  .trip-dates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); // متجاوب
  gap: 1rem;
}

.trip-date-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-btn {
  flex-shrink: 0;
  height: 42px;
}




```

---

## `src/app/demo/pages/travels/travels-form/travels-form.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelsFormComponent } from './travels-form.component';

describe('TravelsFormComponent', () => {
  let component: TravelsFormComponent;
  let fixture: ComponentFixture<TravelsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```

---

