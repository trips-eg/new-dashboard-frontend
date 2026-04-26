import { Component, OnInit } from '@angular/core';
import { SubHeaderComponent } from 'src/app/shared/components/sub-header/sub-header.component';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ReservationsService } from 'src/app/shared/services/reservations.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

// ── Booking Status Enum (matches backend) ──
export enum BookingStatus {
  Pending       = 1,
  Confirmed     = 2,
  Cancelled     = 3,
  Completed     = 4,
  Refunded      = 5,
  InstaPending  = 6,
  InstaCompleted = 7,
  InstaCancelled = 8
}

// ── PayMethod Enum (matches backend) ──
export enum PayMethod {
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
  selector: 'app-overall-reservations',
  standalone: true,
  imports: [SharedModule, SubHeaderComponent],
  templateUrl: './overall-reservations.component.html',
  styleUrl: './overall-reservations.component.scss'
})
export class OverallReservationsComponent implements OnInit {
  bookings: any[] = [];
  totalRecords = 0;
  first = 0;
  rows = 25;
  isLoading = false;
  searchedWord = '';
  lang = localStorage.getItem('i18nextLng') || 'ar';

  // expose enums to template
  BookingStatus = BookingStatus;
  PayMethod = PayMethod;

  constructor(
    private reservationsService: ReservationsService,
    private toastrService: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    const filter = {
      pageIndex: this.first / this.rows + 1,
      pageSize: this.rows,
      search: this.searchedWord || null
    };

    this.reservationsService.getAllCustomerBookings(filter).subscribe({
      next: (res) => {
        this.bookings = res.data?.data ?? [];
        this.totalRecords = res.data?.itemsCount ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.toastrService.error('Failed to load bookings', 'Error');
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.loadBookings();
  }

  searchByName(key: string): void {
    this.first = 0;
    this.loadBookings();
  }

  viewBookingDetails(id: number): void {
    this.router.navigate(['/reservations/reservation-details', id]);
  }

  // ── Status helpers ──
  getStatusLabel(status: number): string {
    const map: Record<number, string> = {
      1: 'Pending',
      2: 'Confirmed',
      3: 'Cancelled',
      4: 'Completed',
      5: 'Refunded',
      6: 'Insta Pending',
      7: 'Insta Completed',
      8: 'Insta Cancelled'
    };
    return map[status] ?? 'Unknown';
  }

  getStatusClass(status: number): string {
    switch (status) {
      case BookingStatus.Confirmed:
      case BookingStatus.InstaCompleted:
        return 'bg-success';
      case BookingStatus.Cancelled:
      case BookingStatus.InstaCancelled:
        return 'bg-danger';
      case BookingStatus.Pending:
      case BookingStatus.InstaPending:
        return 'bg-warning text-dark';
      case BookingStatus.Completed:
        return 'bg-primary';
      case BookingStatus.Refunded:
        return 'bg-secondary';
      default:
        return 'bg-light text-dark';
    }
  }

  isInstaPending(status: number): boolean {
    return status === BookingStatus.InstaPending;
  }

  // ── PayMethod helper ──
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

  // ── InstaPay Actions ──
  confirmInstaPayBooking(booking: any): void {
    this.reservationsService.confirmInstaPayBooking(booking.id).subscribe({
      next: () => {
        this.toastrService.success('InstaPay booking confirmed', 'Success');
        booking.sataus = BookingStatus.InstaCompleted;
      },
      error: () => {
        this.toastrService.error('Failed to confirm booking', 'Error');
      }
    });
  }

  cancelInstaPayBooking(booking: any): void {
    this.reservationsService.cancelInstaPayBooking(booking.id).subscribe({
      next: () => {
        this.toastrService.success('InstaPay booking cancelled', 'Success');
        booking.sataus = BookingStatus.InstaCancelled;
      },
      error: () => {
        this.toastrService.error('Failed to cancel booking', 'Error');
      }
    });
  }
}
