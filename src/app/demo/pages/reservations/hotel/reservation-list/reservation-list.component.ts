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

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.scss'
})
export class ReservationListComponent implements OnInit {
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
    private reservationsService: ReservationsService
  ) {
    this.translate.onLangChange.subscribe((event) => {
      this.lang = event.lang;
    });
    this.lang = this.translate.currentLang;
  }

  ngOnInit(): void {
    // Initial load is handled by the table's lazy load event trigger
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
      '5': 'status-refunded'
    };

    return classes[value.toString()] || 'status-unknown';
  }

  // ✅ Label for status
  getStatusLabel(value: number | string): string {
    const status = this.paymentStatus.find((s) => s.value == value);
    const lang = this.translate.currentLang;
    return status ? (lang === 'ar' ? status.nameAr : status.nameEn) : lang === 'ar' ? 'غير معروف' : 'Unknown';
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
  }
  