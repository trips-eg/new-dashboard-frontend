import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ReservationsService } from '../../services/reservations.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { EnumsService } from '../../services/enums.service';
import { Router } from '@angular/router';
import { ConfigureService } from 'src/app/theme/shared/services/configure.service';
import { DialogService } from 'primeng/dynamicdialog';
import { CustomerDialogComponent } from 'src/app/demo/pages/customers/customer-dialog/customer-dialog.component';
import { MarkVendorSettledDialogComponent } from '../../components/mark-vendor-settled-dialog/mark-vendor-settled-dialog.component';

@Component({
  selector: 'app-manasik-booking-info',
  standalone: true,
  imports: [SharedModule],
  providers: [ConfirmationService, DialogService],
  templateUrl: './manasik-booking-info.component.html',
  styleUrl: './manasik-booking-info.component.scss'
})
export class ManasikBookingInfoComponent implements OnInit {
  selectedItemsId: any;
  paymentId: any;
  BookingId: number = null;
  items!: MenuItem[];

  @Input() consumerHajjDetailReserved: any[] = [];
  @Input() reservationUser: any = {};
  @Output() refundedSuccess = new EventEmitter();
  isRfunded: boolean = false;
  paymentStatus: any[] = [];
  @Input() totalRecords: number;
  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number; search?: string }>();

  @Output() selectionChange = new EventEmitter<{ moduleType: number; id: number; removed?: boolean }>();
  
  get showVendorColumn(): boolean {
    return this.consumerHajjDetailReserved?.some((t) => !!t.companyDto && !!t.companyDto.name) ?? false;
  }
  
  restSelected() {
    this.selectedItemsId = null;
  }
  
  goToCompany(companyId: number) {
    if (companyId > 0) {
      this.Router.navigate(['/vendor-details', companyId]);
    }
  }
  
  onSelectionChange(event: any, isSelect: boolean) {
    if (isSelect) {
      // moduleType: 4 for Hajj bookings (assuming 3 was for outings)
      this.selectionChange.emit({ moduleType: 4, id: event.data.id });
    } else {
      this.selectionChange.emit({ moduleType: 4, id: event.data.id, removed: true });
    }
  }

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
  
  constructor(
    private ReservationsService: ReservationsService,
    private confirmationService: ConfirmationService,
    private ToastrService: ToastrService,
    private translate: TranslateService,
    private EnumsService: EnumsService,
    private ConfigureService: ConfigureService,
    private Router: Router ,
    private DialogService: DialogService
  ) {}
  
  onContextMenu(hajj: any) {
    let menuItems: MenuItem[] = [
      {
        label: 'reservation details',
        icon: 'pi pi-fw pi-eye',
        command: () => this.Router.navigate(['/payment-info-ref', hajj.bookingRefernce])
      },
      {
        label: 'hajj details',
        icon: 'pi pi-fw pi-eye',
        command: () => {
          this.Router.navigate(['/hajj-details', hajj.hajj?.id]);
        }
      }
    ];
    
    if (this.isVendor()) {
      this.items = menuItems.filter((item) => item.label !== 'reservation details')
    } else {
      this.items = menuItems
    }
  }

  ngOnInit(): void {
    this.getStatus();
  }
  
  refund(hajjBookingId: number) {
    this.ReservationsService.RefundManasikBookingById(hajjBookingId).subscribe({
      next: (res) => {
        console.log(res);
        this.isRfunded = true;
        this.ToastrService.success(
          `${res.data.price} refunded to ${this.reservationUser.userName} successfully.`, 
          'success'
        );
        this.refundedSuccess.emit();
      },
      error: (err) => {
        console.error('Refund error:', err);
        this.ToastrService.error('Failed to process refund', 'Error');
      }
    });
  }

  confirm(hajj: any) {
    console.log(hajj);
    this.confirmationService.confirm({
      header: this.translate.instant('CONFIRM.REFUND_TITLE', { 
        price: hajj.clientPaid, 
        user: hajj.user?.name || this.reservationUser.userName 
      }),
      message: this.translate.instant('CONFIRM.REFUND_MESSAGE'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.refund(hajj.id);
      },
      reject: () => {}
    });
  }
  
  getStatus() {
    this.EnumsService.getPaymentStatus().subscribe({
      next: (res) => {
        this.paymentStatus = res;
      },
      error: (err) => {
        console.error('Failed to get payment status:', err);
      }
    });
  }
  
  getStatusLabel(value: number): string {
    const status = this.paymentStatus?.find((s) => s.value === value);
    const lang = this.translate.currentLang;
    if (status) {
      return lang === 'ar' ? status.nameAr : status.nameEn;
    }
    switch (value) {
      case 1:
        return lang === 'ar' ? 'قيد الانتظار' : 'Pending';
      case 2:
        return lang === 'ar' ? 'مؤكد' : 'Confirmed';
      case 3:
        return lang === 'ar' ? 'ملغي' : 'Cancelled';
      case 4:
        return lang === 'ar' ? 'مكتمل' : 'Completed';
      case 5:
        return lang === 'ar' ? 'مسترجع' : 'Refunded';
      default:
        return lang === 'ar' ? 'غير معروف' : 'Unknown';
    }
  }

  getBookingStatusSeverity(status: number): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    switch (status) {
      case 2:
      case 4:
        return 'success';
      case 1:
        return 'warning';
      case 3:
        return 'danger';
      case 5:
        return 'info';
      default:
        return 'secondary';
    }
  }


openUserDetails(user: any) {
  if (!user) return; // 1) حماية لو مفيش يوزر

  this.DialogService.open(CustomerDialogComponent, {
    header: `${user.name}`, // 2) عنوان الديالوج
    width: '50%',               // 3) عرض الديالوج
    data: user,                   // 4) البيانات اللي هتتبعت للكومبوننت
    closable: true,               // 5) زرار الإغلاق ×
    dismissableMask: true         // 6) يقفل لو ضغط بره الديالوج
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

  cancelReservation(hajj: any): void {
    const customerName = hajj.user?.name || 'Customer';
    this.confirmationService.confirm({
      header: `Are you sure, you want to cancel the trip of "${customerName}"?`,
      message: 'This action cannot be undone.',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.ReservationsService.cancelBooking(hajj.bookingId || hajj.id).subscribe({
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
      reject: () => {}
    });
  }

  openMarkVendorSettled(hajj: any): void {
    const ref = this.DialogService.open(MarkVendorSettledDialogComponent, {
      header: this.translate.instant('settlementDialogHeader') || 'Vendor Reservation Settlement',
      width: '480px',
      data: {
        reservation: hajj,
        moduleType: 4,
        moduleName: 'Manasik / Hajj',
        vendorName: hajj.companyDto?.name
      },
      closable: true,
      dismissableMask: true
    });

    ref.onClose.subscribe((result) => {
      if (result?.success) {
        this.refundedSuccess.emit();
      }
    });
  }

  getVendorSettlementStatusLabel(status: number): string {
    switch (status) {
      case 1:
        return this.translate.instant('partiallySettled') || 'Partially Settled';
      case 2:
        return this.translate.instant('fullySettled') || 'Fully Settled';
      default:
        return this.translate.instant('notSettled') || 'Not Settled';
    }
  }

  getVendorSettlementStatusSeverity(status: number): 'success' | 'warning' | 'danger' {
    switch (status) {
      case 2:
        return 'success';
      case 1:
        return 'warning';
      default:
        return 'danger';
    }
  }
}
