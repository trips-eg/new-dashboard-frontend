import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ReservationsService } from '../../services/reservations.service';
import { ItravelbookingInfo } from '../../model/itravelbooking-info';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { EnumsService } from '../../services/enums.service';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { FilterMap } from '../../mapping/filterMap';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { CustomerDialogComponent } from 'src/app/demo/pages/customers/customer-dialog/customer-dialog.component';
import { environment } from 'src/environments/environment';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-travel-booking-info',
  standalone: true,
  imports: [SharedModule, ImageModule],
  providers: [ConfirmationService],
  templateUrl: './travel-booking-info.component.html',
  styleUrl: './travel-booking-info.component.scss'
})
export class TravelBookingInfoComponent implements OnInit {
  selectedProducts;
  items!: MenuItem[];
  baseUrl = environment.imgUrl;

  @Input() consumerTravelDetailReserved: any[] = [];
  @Input() totalRecords;
  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number; search?: string }>();
  @Output() refundedSuccess = new EventEmitter();
  get showVendorColumn(): boolean {
    return this.consumerTravelDetailReserved?.some((t) => !!t.companyDto) ?? false;
  }
  get showDocumentsColumn(): boolean {
    return this.consumerTravelDetailReserved?.some((t) => t.bookDocuments && t.bookDocuments.length > 0) ?? false;
  }
  restSelected() {
    this.selectedProducts = {};
  }
  @Output() selectionChange = new EventEmitter<{ moduleType: number; id: number; removed?: boolean }>();
  goToCompany(companyId: number) {
    this.Router.navigate(['/vendor-details', companyId]);
  }
  onContextMenu(travel: any) {
    let menuItems: MenuItem[] = [
      {
        label: 'reservation details',
        icon: 'pi pi-fw pi-eye',
        command: () => this.Router.navigate(['/payment-info-ref', travel.bookingRefernce])
      },
      {
        label: 'travel details',
        icon: 'pi pi-fw pi-eye',
        command: () => this.Router.navigate(['/travel-details', travel.trip.id])
      }
    ];

    if (this.isVendor()) {
      this.items = menuItems.filter((item) => item.label !== 'reservation details');
    } else {
      this.items = menuItems;
    }
  }

  onSelectionChange(event: any, isSelect: boolean) {
    if (isSelect) {
      this.selectionChange.emit({ moduleType: 1, id: event.data.id });
    } else {
      this.selectionChange.emit({ moduleType: 1, id: event.data.id, removed: true });
    }
  }

  isRfunded: boolean = false;
  paymentStatus: any[] = [];
  first: number = 0;
  rows: number = 10;
  search: string = '';

  onPageChange(event: any) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? this.rows;

    const filterMap = {
      pageIndex: Math.floor(this.first / this.rows) + 1, // 1-based
      pageSize: this.rows,
      search: this.search
    };

    this.pageChange.emit(filterMap);
  }

  isVendor(): boolean {
    const roles = this.ConfigureService.userRoles();
    return roles.some((role) => role.startsWith('Vendor.'));
  }
  ngOnInit(): void {
    this.getStatus();
  }
  constructor(
    private ReservationsService: ReservationsService,
    private confirmationService: ConfirmationService,
    private ToastrService: ToastrService,
    private translate: TranslateService,
    private EnumsService: EnumsService,
    private ConfigureService: ConfigureService,
    private Router: Router,
    private DialogService: DialogService
  ) {}
  refund(tripId) {
    debugger;
    this.ReservationsService.RefundTravelBookingById(tripId).subscribe({
      next: (res) => {
        console.log(res);
        this.isRfunded = true;
        this.ToastrService.success('Refunded successfully', 'success');
        this.refundedSuccess.emit();
      }
    });
  }
  confirm(trip) {
    console.log(trip);
    this.confirmationService.confirm({
      header: `are you sure you want to refund ${trip.clientPaid} to ${trip.user.name}`,
      message: 'Please confirm to proceed.',
      accept: () => {
        this.refund(trip.id);
      },
      reject: () => {}
    });
  }
  getStatus() {
    this.EnumsService.getPaymentStatus().subscribe({
      next: (res) => {
        console.log('from refund room', res);
        this.paymentStatus = res;
      }
    });
  }
  getStatusLabel(value: number): string {
    const status = this.paymentStatus.find((s) => s.value === value);
    const lang = this.translate.currentLang;
    if (!status) return lang === 'ar' ? 'غير معروف' : 'Unknown';
    return lang === 'ar' ? status.nameAr : status.nameEn;
  }

  openUserDetails(user: any) {
    if (!user) return; // 1) حماية لو مفيش يوزر

    this.DialogService.open(CustomerDialogComponent, {
      header: `${user.name}`, // 2) عنوان الديالوج
      width: '50%', // 3) عرض الديالوج
      data: user, // 4) البيانات اللي هتتبعت للكومبوننت
      closable: true, // 5) زرار الإغلاق ×
      dismissableMask: true // 6) يقفل لو ضغط بره الديالوج
    });
  }

  getStatusClass(value: number): string {
    switch (value) {
      case 1:
        return 'status-pending';
      case 2:
        return 'status-confirmed';
      case 3:
        return 'status-cancelled';
      case 4:
        return 'status-completed';
      case 5:
        return 'status-refunded';
      default:
        return 'status-unknown';
    }
  }

  cancelReservation(travel: any): void {
    const customerName = travel.user?.name || 'Customer';
    this.confirmationService.confirm({
      header: `Are you sure, you want to cancel the trip of "${customerName}"?`,
      message: 'This action cannot be undone.',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.ReservationsService.cancelBooking(travel.bookingId || travel.id).subscribe({
          next: () => {
            this.ToastrService.success('Booking cancelled successfully', 'Success');
            this.refundedSuccess.emit();
          },
          error: (err) => {
            console.error('Cancel error:', err);
            this.ToastrService.error('Failed to cancel booking', 'Error');
          }
        });
      },
      reject: () => { }
    });
  }
}
