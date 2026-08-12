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
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    if (this.vendorId) {
      return (this.vendorSectorStatisticsForm = this.fb.group({
        companyId: [this.vendorId, Validators.required],
        from: [startOfYear, Validators.required],
        to: [today, Validators.required]
      }));
    } else {
      return (this.vendorSectorStatisticsForm = this.fb.group({
        from: [startOfYear, Validators.required],
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
