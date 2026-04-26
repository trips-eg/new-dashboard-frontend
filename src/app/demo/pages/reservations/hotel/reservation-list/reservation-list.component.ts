import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Ibookings } from 'src/app/shared/model/ibookings';
import { BookingService } from 'src/app/shared/services/booking.service';
import { ReservationsService } from 'src/app/shared/services/reservations.service';
import { EnumsService } from 'src/app/shared/services/enums.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { TableRequestBuilder } from 'src/app/shared/utils/table-request-builder';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';


// ── BookingStatus Enum (matches backend) ──
enum BookingStatus {
  Pending        = 1,
  Confirmed      = 2,
  Cancelled      = 3,
  Completed      = 4,
  Refunded       = 5,
  InstaPending   = 6,
  InstaCompleted = 7,
  InstaCancelled = 8
}

// ── PayMethod Enum (matches backend) ──
enum PayMethod {
  BankCard        = 1,
  ReferenceCode   = 2,
  Shahry          = 3,
  VALU            = 4,
  MWALLET         = 5,
  BankInstallment = 6,
  VodafoneCash    = 7,
  InstaPay        = 8
}

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.scss'
})
export class ReservationListComponent implements OnInit {
	imgUrl = environment.imgUrl;
  @ViewChild('dt') dt!: Table;

  // ✅ Pagination & Filters
  totalRecords = 0;
  isLoading = false;

  // Search global
  searchedWord: string = '';

  // ✅ Data
  bookings: Ibookings[] = [];
  paymentStatus: any[] = [];
  lang: string = 'en';

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private enumsService: EnumsService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private reservationsService: ReservationsService,
    private toastrService: ToastrService
  ) {
    this.translate.onLangChange.subscribe((event) => {
      this.lang = event.lang;
    });
    this.lang = this.translate.currentLang;
  }

  ngOnInit(): void {
    this.loadPaymentStatus();
  }

  // ✅ Load bookings using Builder
  loadBookings(event: TableLazyLoadEvent): void {
    this.isLoading = true;
    const payload = TableRequestBuilder.build(event, this.searchedWord);

    this.bookingService.getAllBooking(payload).subscribe({
      next: (res) => {
        this.bookings = res?.data?.data || [];
        this.totalRecords = res?.data?.itemsCount || 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        this.isLoading = false;
      }
    });
  }

  // ✅ Search action (Global)
  onSearch(): void {
    this.dt.reset();
  }

  // ✅ Navigate to details
  goToInfo(id: number): void {
    this.router.navigate(['/payment-info', id]);
  }

  // ✅ Load payment statuses
  private loadPaymentStatus(): void {
    this.enumsService.getPaymentStatus().subscribe({
      next: (res) => {
        this.paymentStatus = res.map((s: any) => ({
          ...s,
          value: s.value.toString()
        }));
      }
    });
  }

  // ✅ CSS Class for status
  getStatusClass(value: number | string): string {
    const classes: any = {
      '1': 'status-pending',
      '2': 'status-confirmed',
      '3': 'status-cancelled',
      '4': 'status-completed',
      '5': 'status-refunded',
      '6': 'status-pending',   // InstaPending → same yellow as Pending
      '7': 'status-confirmed', // InstaCompleted → same green as Confirmed
      '8': 'status-cancelled'  // InstaCancelled → same red as Cancelled
    };
    return classes[value.toString()] || 'status-unknown';
  }

  // ✅ Label for status
  getStatusLabel(value: number | string): string {
    const status = this.paymentStatus.find((s) => s.value == value);
    if (status) {
      return this.lang === 'ar' ? status.nameAr : status.nameEn;
    }
    // Fallback for InstaPay statuses not in enum API
    const fallback: Record<string, string> = {
      '6': 'Insta Pending',
      '7': 'Insta Completed',
      '8': 'Insta Cancelled'
    };
    return fallback[value.toString()] ?? (this.lang === 'ar' ? 'غير معروف' : 'Unknown');
  }

  // ✅ Check if booking has reservations
  hasReservations(booking: Ibookings): boolean {
    return (
      (booking.tripReservations && booking.tripReservations.length > 0) ||
      (booking.outingReservations && booking.outingReservations.length > 0) ||
      (booking.roomBookings && booking.roomBookings.length > 0) ||
      (booking.hajjReservations && booking.hajjReservations.length > 0)
    );
  }

  // ✅ Cancel booking (manual)
  cancelReservation(booking: any): void {
    const customerName = booking.user?.name || 'Customer';
    const confirmed = confirm(
      `Are you sure, you want to cancel the trip of "${customerName}"?`
    );
    if (confirmed) {
      this.reservationsService.cancelBooking(booking.id).subscribe({
        next: () => {
          this.dt.reset();
        },
        error: (err) => {
          console.error('Error cancelling booking', err);
        }
      });
    }
  }

  // ── NEW: PayMethod helpers ──
  getPayMethodLabel(method: number): string {
    const map: Record<number, string> = {
      1: 'Bank Card',
      2: 'Reference Code',
      3: 'Shahry',
      4: 'Valu',
      5: 'Mobile Wallet',
      6: 'Bank Installment',
      7: 'Vodafone Cash',
      8: 'InstaPay'
    };
    return map[method] ?? '-';
  }

  isInstaPay(method: number): boolean {
    return method === PayMethod.InstaPay;
  }

  // ── NEW: InstaPending check ──
  isInstaPending(status: number | string): boolean {
    return Number(status) === BookingStatus.InstaPending;
  }

  // ── NEW: Confirm InstaPay ──
  confirmInstaPayBooking(booking: any): void {
    this.reservationsService.confirmInstaPayBooking(booking.id).subscribe({
      next: () => {
        this.toastrService.success('InstaPay booking confirmed successfully', 'Success');
        booking.sataus = BookingStatus.InstaCompleted;
        booking.bookingStatus = BookingStatus.InstaCompleted;
      },
      error: () => {
        this.toastrService.error('Failed to confirm InstaPay booking', 'Error');
      }
    });
  }

  // ── NEW: Cancel InstaPay ──
  cancelInstaPayBooking(booking: any): void {
    this.reservationsService.cancelInstaPayBooking(booking.id).subscribe({
      next: () => {
        this.toastrService.success('InstaPay booking cancelled successfully', 'Success');
        booking.sataus = BookingStatus.InstaCancelled;
        booking.bookingStatus = BookingStatus.InstaCancelled;
      },
      error: () => {
        this.toastrService.error('Failed to cancel InstaPay booking', 'Error');
      }
    });
  }
}
